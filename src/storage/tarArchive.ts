/**
 * ERP CRM Discovery — Zero-Dependency Portable Archive (USTAR + GZIP)
 * FAZ-51: Tek dosyalık .erpcrm arşiv oluşturucu, açıcı ve güvenlik doğrulaması
 */

/**
 * Byte dizisine sabit uzunluklu string yazar.
 */
function writeString(buf: Uint8Array, offset: number, length: number, str: string): void {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  for (let i = 0; i < length; i++) {
    buf[offset + i] = i < bytes.length ? bytes[i] : 0;
  }
}

/**
 * Byte dizisine sekizlik (octal) sayı string'i yazar.
 */
function writeOctal(buf: Uint8Array, offset: number, length: number, num: number): void {
  const str = num.toString(8).padStart(length - 1, "0");
  writeString(buf, offset, length, str);
}

export interface ArchiveFileEntry {
  name: string;
  data: Uint8Array;
  mtime?: number;
}

/**
 * Dosya listesini standart POSIX ustar TAR formatına çevirir ve Web GZIP Stream ile sıkıştırır.
 */
export async function createTarArchive(files: ArchiveFileEntry[]): Promise<Uint8Array> {
  const blocks: Uint8Array[] = [];

  for (const f of files) {
    const cleanName = f.name.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!cleanName || cleanName.includes("..") || cleanName.includes("\0")) {
      throw new Error(`Geçersiz arşiv dosya yolu: "${f.name}"`);
    }

    const header = new Uint8Array(512);
    let name = cleanName;
    let prefix = "";

    if (name.length > 100) {
      const idx = name.lastIndexOf("/", 155);
      if (idx > 0 && name.length - idx - 1 <= 100) {
        prefix = name.substring(0, idx);
        name = name.substring(idx + 1);
      } else {
        throw new Error(`Arşiv dosya yolu uzunluk sınırını (255 karakter) aşıyor: "${cleanName}"`);
      }
    }

    // USTAR Header Fields
    writeString(header, 0, 100, name); // name
    writeString(header, 100, 8, "0000644\0"); // mode
    writeString(header, 108, 8, "0000000\0"); // uid
    writeString(header, 116, 8, "0000000\0"); // gid
    writeOctal(header, 124, 12, f.data.byteLength); // size (11 octal digits + null)
    writeOctal(header, 136, 12, f.mtime || Math.floor(Date.now() / 1000)); // mtime
    // checksum placeholder: 8 spaces
    for (let i = 0; i < 8; i++) header[148 + i] = 32;
    header[156] = 48; // typeflag: "0" (normal file)
    writeString(header, 257, 6, "ustar\0"); // magic
    writeString(header, 263, 2, "00"); // version
    writeString(header, 265, 32, "erpcrm\0"); // uname
    writeString(header, 297, 32, "erpcrm\0"); // gname
    if (prefix) {
      writeString(header, 345, 155, prefix); // prefix
    }

    // Compute checksum (sum of all 512 bytes with chksum field as 8 spaces)
    let chksum = 0;
    for (let i = 0; i < 512; i++) {
      chksum += header[i];
    }
    writeOctal(header, 148, 7, chksum);
    header[155] = 32;

    blocks.push(header);
    blocks.push(f.data);

    // Pad file payload to 512-byte boundary
    const pad = (512 - (f.data.byteLength % 512)) % 512;
    if (pad > 0) {
      blocks.push(new Uint8Array(pad));
    }
  }

  // End of archive marker (two 512-byte zero blocks)
  blocks.push(new Uint8Array(1024));

  // Merge uncompressed tar blocks
  let totalBytes = 0;
  for (const b of blocks) totalBytes += b.byteLength;
  const uncompressedTar = new Uint8Array(totalBytes);
  let offset = 0;
  for (const b of blocks) {
    uncompressedTar.set(b, offset);
    offset += b.byteLength;
  }

  // Compress with native node:zlib if available, otherwise Web Streams
  try {
    const zlib = await import("node:zlib");
    if (zlib && typeof zlib.gzipSync === "function") {
      const compressed = zlib.gzipSync(uncompressedTar);
      return new Uint8Array(compressed);
    }
  } catch {
    // Non-Node / Browser fallback
  }

  const blob = new Blob([uncompressedTar]);
  const cs = new CompressionStream("gzip");
  const compressedStream = blob.stream().pipeThrough(cs);
  const compressedBuffer = await new Response(compressedStream).arrayBuffer();
  return new Uint8Array(compressedBuffer);
}

/**
 * GZIP sıkıştırmalı .erpcrm arşivini açar ve dosyaları ayıklar.
 * Zip-slip ve path traversal saldırılarına karşı her girdiyi denetler.
 */
export async function extractTarArchive(compressedData: Uint8Array): Promise<ArchiveFileEntry[]> {
  let tarBuffer: Uint8Array;

  // Decompress with native node:zlib if available, otherwise Web Streams
  try {
    const zlib = await import("node:zlib");
    if (zlib && typeof zlib.gunzipSync === "function") {
      tarBuffer = new Uint8Array(zlib.gunzipSync(compressedData));
    } else {
      throw new Error("fallback");
    }
  } catch {
    const blob = new Blob([compressedData as any]);
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    tarBuffer = new Uint8Array(await new Response(decompressedStream).arrayBuffer());
  }


  const dec = new TextDecoder();
  const entries: ArchiveFileEntry[] = [];
  let offset = 0;

  while (offset + 512 <= tarBuffer.byteLength) {
    const header = tarBuffer.subarray(offset, offset + 512);

    // Check if end of archive (zero block)
    let isZero = true;
    for (let i = 0; i < 512; i++) {
      if (header[i] !== 0) {
        isZero = false;
        break;
      }
    }
    if (isZero) break;

    // Read name
    const nameEnd = header.indexOf(0);
    const rawName = dec.decode(
      header.subarray(0, nameEnd > 0 && nameEnd < 100 ? nameEnd : 100)
    ).trim();

    // Read prefix if present
    let prefix = "";
    if (header[345] !== 0) {
      const pSlice = header.subarray(345, 500);
      const pEnd = pSlice.indexOf(0);
      prefix = dec.decode(pSlice.subarray(0, pEnd >= 0 ? pEnd : 155)).trim();
    }

    const fullName = prefix ? `${prefix}/${rawName}` : rawName;

    // Security & Path traversal validation (Zip-slip protection)
    const normalizedName = fullName.replace(/\\/g, "/").trim();
    if (
      !normalizedName ||
      normalizedName.startsWith("/") ||
      normalizedName.startsWith("~") ||
      /^[a-zA-Z]:/.test(normalizedName) ||
      normalizedName.includes("..") ||
      normalizedName.includes("\0")
    ) {
      throw new Error(`Güvenlik Uyarısı: Şüpheli arşiv yolu tespit edildi ve reddedildi: "${fullName}"`);
    }

    // Read size
    const sizeStr = dec.decode(header.subarray(124, 136)).trim().replace(/\0/g, "");
    const size = parseInt(sizeStr, 8);
    if (isNaN(size) || size < 0) {
      throw new Error(`Arşivde geçersiz dosya boyutu: "${fullName}"`);
    }

    offset += 512;

    if (offset + size > tarBuffer.byteLength) {
      throw new Error(`Arşiv bozuk veya beklenenden kısa kesilmiş: "${fullName}"`);
    }

    const data = tarBuffer.subarray(offset, offset + size);
    entries.push({
      name: normalizedName,
      data: new Uint8Array(data),
    });

    const pad = (512 - (size % 512)) % 512;
    offset += size + pad;
  }

  return entries;
}

/**
 * Byte dizisinin SHA-256 özetini (hex string) hesaplar.
 */
export async function computeSha256Hex(data: Uint8Array): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function") {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data as any);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node.js fallback
  try {
    const nodeCrypto = await import("node:crypto");
    return nodeCrypto.createHash("sha256").update(data).digest("hex");
  } catch {
    throw new Error("SHA-256 hesaplama motoru bulunamadı.");
  }
}
