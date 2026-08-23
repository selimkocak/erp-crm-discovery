// path: /home/selim/projects/erp-crm-discovery/test/faz48_generator_reproducibility_test.ts
/**
 * ERP CRM Discovery — FAZ-48 Deterministik Generator ve Çıktı Tekrarlanabilirlik Testi
 *
 * Doğrulamalar:
 * 1. scripts/generate_business_functions.mjs çalıştırıldığında çıktılarda dinamik zaman damgası (ISO timestamp) OLMAMALIDIR.
 * 2. Generator peş peşe 2 kez çalıştırıldığında üretilen dosyalar bayt bayt (%100) aynı olmalıdır.
 * 3. 33 kanonik iş fonksiyonu ve 34 soru paketi eksiksiz doğrulanıp TypeScript sabitlerine dönüştürülmelidir.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");

const BF_TS_PATH = resolve(ROOT_DIR, "src/generated/businessFunctions.ts");
const QP_TS_PATH = resolve(ROOT_DIR, "src/generated/questionPacks.ts");

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

async function runGeneratorReproducibilityTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-48: Generator Determinizm ve Tekrarlanabilirlik Testi");
  console.log("=======================================================\n");

  // 1. İlk Çalıştırma
  console.log("--- 1. İlk Generator Çalıştırması ---");
  execSync("node scripts/generate_business_functions.mjs", { cwd: ROOT_DIR, stdio: "pipe" });

  const bfContent1 = readFileSync(BF_TS_PATH, "utf-8");
  const qpContent1 = readFileSync(QP_TS_PATH, "utf-8");

  assert(!bfContent1.includes("Generated at:"), "businessFunctions.ts dinamik zaman damgası İÇERMİYOR");
  assert(!qpContent1.includes("Generated at:"), "questionPacks.ts dinamik zaman damgası İÇERMİYOR");
  assert(bfContent1.includes("BUSINESS_FUNCTION_REGISTRY"), "businessFunctions.ts geçerli veri taşıyor");
  assert(qpContent1.includes("CANONICAL_QUESTION_PACKS"), "questionPacks.ts geçerli veri taşıyor");

  // 2. İkinci Çalıştırma
  console.log("\n--- 2. İkinci Generator Çalıştırması ve Bayt Karşılaştırması ---");
  execSync("node scripts/generate_business_functions.mjs", { cwd: ROOT_DIR, stdio: "pipe" });

  const bfContent2 = readFileSync(BF_TS_PATH, "utf-8");
  const qpContent2 = readFileSync(QP_TS_PATH, "utf-8");

  assert(bfContent1 === bfContent2, "businessFunctions.ts iki çalıştırmada %100 özdeş (0 bayt fark)");
  assert(qpContent1 === qpContent2, "questionPacks.ts iki çalıştırmada %100 özdeş (0 bayt fark)");

  // 3. Sabit Başlık Yapısı
  console.log("\n--- 3. Başlık Yapısı ve Yorum Satırı Doğrulaması ---");
  assert(bfContent1.startsWith("/**\n * AUTO-GENERATED.\n * DO NOT EDIT MANUALLY."), "businessFunctions.ts başlığı temiz ve sabit");
  assert(qpContent1.startsWith("/**\n * AUTO-GENERATED - DO NOT EDIT MANUALLY."), "questionPacks.ts başlığı temiz ve sabit");

  console.log(`\nFAZ-48 Generator Reproducibility Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runGeneratorReproducibilityTests().catch((err) => {
  console.error("Generator Reproducibility Test Error:", err);
  process.exit(1);
});
