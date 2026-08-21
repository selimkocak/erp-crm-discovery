#!/usr/bin/env node
/**
 * ERP CRM Discovery — Business Function Code Generator
 *
 * Single Source of Truth: data/business-functions.json
 * Generates: src/generated/businessFunctions.ts
 *
 * Validates the canonical JSON registry and deterministically generates TypeScript definitions.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, "..");
const JSON_PATH = resolve(ROOT_DIR, "data/business-functions.json");
const TS_PATH = resolve(ROOT_DIR, "src/generated/businessFunctions.ts");

console.log("[generate] Validating data/business-functions.json...");

const raw = readFileSync(JSON_PATH, "utf-8");
let entries;
try {
  entries = JSON.parse(raw);
} catch (err) {
  console.error("[generate] FAIL: Invalid JSON in data/business-functions.json", err);
  process.exit(1);
}

if (!Array.isArray(entries)) {
  console.error("[generate] FAIL: Registry root must be an array");
  process.exit(1);
}

// ── Validations ──
if (entries.length !== 33) {
  console.error(`[generate] FAIL: Expected exactly 33 business functions, found ${entries.length}`);
  process.exit(1);
}

const seenCodes = new Set();
const seenSortOrders = new Set();
const seenLegacyCodes = new Set();
const CODE_REGEX = /^[A-Z0-9_]+$/;

for (let i = 0; i < entries.length; i++) {
  const item = entries[i];
  const idx = i + 1;

  if (!item.code || typeof item.code !== "string") {
    console.error(`[generate] FAIL: Item #${idx} missing string 'code'`);
    process.exit(1);
  }

  if (!CODE_REGEX.test(item.code)) {
    console.error(`[generate] FAIL: Item #${idx} code "${item.code}" must be uppercase ASCII with underscores`);
    process.exit(1);
  }

  if (seenCodes.has(item.code)) {
    console.error(`[generate] FAIL: Duplicate code "${item.code}" found`);
    process.exit(1);
  }
  seenCodes.add(item.code);

  if (typeof item.sort_order !== "number" || item.sort_order <= 0) {
    console.error(`[generate] FAIL: Item "${item.code}" invalid sort_order: ${item.sort_order}`);
    process.exit(1);
  }

  if (seenSortOrders.has(item.sort_order)) {
    console.error(`[generate] FAIL: Duplicate sort_order ${item.sort_order} found on "${item.code}"`);
    process.exit(1);
  }
  seenSortOrders.add(item.sort_order);

  if (!item.name_tr || typeof item.name_tr !== "string" || item.name_tr.trim().length === 0) {
    console.error(`[generate] FAIL: Item "${item.code}" missing or empty 'name_tr'`);
    process.exit(1);
  }

  if (!item.name_en || typeof item.name_en !== "string" || item.name_en.trim().length === 0) {
    console.error(`[generate] FAIL: Item "${item.code}" missing or empty 'name_en'`);
    process.exit(1);
  }

  if (item.legacy_code) {
    if (seenLegacyCodes.has(item.legacy_code)) {
      console.error(`[generate] FAIL: Duplicate legacy_code "${item.legacy_code}" found`);
      process.exit(1);
    }
    seenLegacyCodes.add(item.legacy_code);
  }
}

if (!seenCodes.has("SALES")) {
  console.error('[generate] FAIL: "SALES" canonical code must be present in registry');
  process.exit(1);
}

console.log(`[generate] Validated ${entries.length} canonical business functions successfully.`);

// ── Deterministic Code Generation ──
mkdirSync(dirname(TS_PATH), { recursive: true });

const sortedEntries = [...entries].sort((a, b) => a.sort_order - b.sort_order);

const tsContent = `/**
 * AUTO-GENERATED.
 * DO NOT EDIT MANUALLY.
 * Source: data/business-functions.json
 *
 * Generated at: ${new Date().toISOString()}
 */

export interface BusinessFunctionEntry {
  code: string;
  legacy_code?: string;
  name_tr: string;
  name_en: string;
  category_tr: string;
  category_en: string;
  sort_order: number;
  is_active: boolean;
}

export const BUSINESS_FUNCTION_REGISTRY: readonly BusinessFunctionEntry[] = [
${sortedEntries
  .map(
    (e) =>
      `  {\n` +
      `    code: ${JSON.stringify(e.code)},\n` +
      `    legacy_code: ${JSON.stringify(e.legacy_code ?? "")},\n` +
      `    name_tr: ${JSON.stringify(e.name_tr)},\n` +
      `    name_en: ${JSON.stringify(e.name_en)},\n` +
      `    category_tr: ${JSON.stringify(e.category_tr)},\n` +
      `    category_en: ${JSON.stringify(e.category_en)},\n` +
      `    sort_order: ${e.sort_order},\n` +
      `    is_active: ${e.is_active ? "true" : "false"},\n` +
      `  }`
  )
  .join(",\n")}
] as const;

export const CANONICAL_BUSINESS_FUNCTION_CODES: readonly string[] = [
${sortedEntries.map((e) => `  ${JSON.stringify(e.code)},`).join("\n")}
] as const;

export const CANONICAL_BUSINESS_FUNCTION_CODE_SET = new Set<string>(
  CANONICAL_BUSINESS_FUNCTION_CODES
);
`;

writeFileSync(TS_PATH, tsContent, "utf-8");
console.log(`[generate] Wrote generated TypeScript to src/generated/businessFunctions.ts`);

// ── Question Packs Manifest Generator ──
import { readdirSync } from "node:fs";
import { relative } from "node:path";

const PACKS_DIR = resolve(ROOT_DIR, "question-packs");
const PACKS_TS_PATH = resolve(ROOT_DIR, "src/generated/questionPacks.ts");

function findPacks(dir) {
  const results = [];
  const dirEntries = readdirSync(dir, { withFileTypes: true });
  for (const entry of dirEntries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPacks(fullPath));
    } else if (entry.isFile() && entry.name === "core.json") {
      results.push(fullPath);
    }
  }
  return results;
}

const packFiles = findPacks(PACKS_DIR).sort();
console.log(`[generate] Discovered ${packFiles.length} canonical question pack(s)...`);

const packDefinitions = [];
for (const file of packFiles) {
  const content = JSON.parse(readFileSync(file, "utf-8"));
  if (!content.meta || !content.meta.pack_id || !content.meta.business_function_code) {
    console.error(`[generate] FAIL: Pack at ${file} is missing meta.pack_id or meta.business_function_code`);
    process.exit(1);
  }
  const relImportPath = "../../" + relative(ROOT_DIR, file).replace(/\\/g, "/");
  const varName = content.meta.pack_id.replace(/[^a-zA-Z0-9]/g, "_") + "Pack";
  packDefinitions.push({
    file,
    relImportPath,
    varName,
    packId: content.meta.pack_id,
    businessFunctionCode: content.meta.business_function_code,
    version: content.meta.version,
    name: content.meta.name,
    questionCount: Array.isArray(content.questions) ? content.questions.length : 0,
  });
}

const packsTsContent = `/**
 * AUTO-GENERATED - DO NOT EDIT MANUALLY.
 * Generated by scripts/generate_business_functions.mjs
 *
 * Generated at: ${new Date().toISOString()}
 */

import type { QuestionPack } from "../engine/types";

${packDefinitions.map((p) => `import ${p.varName} from ${JSON.stringify(p.relImportPath)};`).join("\n")}

/**
 * Derleme zamanında bundle'a gömülen tüm kanonik soru paketleri haritası.
 */
export const CANONICAL_QUESTION_PACKS: Readonly<Record<string, QuestionPack>> = {
${packDefinitions.map((p) => `  ${JSON.stringify(p.packId)}: ${p.varName} as unknown as QuestionPack,`).join("\n")}
} as const;

/**
 * Kanonik iş fonksiyonu kodu → Soru paketi kimliği eşleştirmesi.
 */
export const CANONICAL_CODE_TO_PACK_ID: Readonly<Record<string, string>> = {
${packDefinitions.map((p) => `  ${JSON.stringify(p.businessFunctionCode)}: ${JSON.stringify(p.packId)},`).join("\n")}
  "IT_INFRASTRUCTURE": "tr.it_infrastructure.core", // INFORMATION_TECHNOLOGY için kanonik alias
  "MASTER_DATA": "tr.master_data_management.core", // MASTER_DATA_MANAGEMENT için kanonik alias
  "ANA_VERI": "tr.master_data_management.core", // Türkçe alias
  "PROJECTS": "tr.project_management.core", // PROJECT_MANAGEMENT için alias
  "PROJE_YONETIMI": "tr.project_management.core", // Türkçe alias
  "E_DONUSUM": "tr.e_transformation.core", // E_TRANSFORMATION için Türkçe alias
  "EDONUSUM": "tr.e_transformation.core", // Alias
  "FATURALAMA": "tr.invoicing.core", // INVOICING için Türkçe alias
  "FATURA_GDR": "tr.invoicing.core", // Legacy alias
  "INVOICE": "tr.invoicing.core", // Alias
  "BELGE_YNT": "tr.document_management.core", // DOCUMENT_MANAGEMENT için legacy alias
  "DOKUMAN_YONETIMI": "tr.document_management.core", // Türkçe alias
  "DOCS": "tr.document_management.core", // Alias
  "DOCUMENT": "tr.document_management.core", // Alias
  "ITHALAT": "tr.import.core", // IMPORT için legacy ve Türkçe alias
  "ITHALAT_GUMRUK": "tr.import.core", // Alias
  "DIS_TICARET_IMPORT": "tr.import.core", // Alias
  "IMPORT_CUSTOMS": "tr.import.core", // Alias
  "IHRACAT": "tr.export.core", // EXPORT için legacy ve Türkçe alias
  "IHRACAT_GUMRUK": "tr.export.core", // Alias
  "DIS_TICARET_EXPORT": "tr.export.core", // Alias
  "EXPORT_CUSTOMS": "tr.export.core", // Alias
  "E_TICARET": "tr.ecommerce.core", // ECOMMERCE için legacy ve Türkçe alias
  "ETICARET": "tr.ecommerce.core", // Alias
  "ONLINE_SATIS": "tr.ecommerce.core", // Alias
  "DIGITAL_COMMERCE": "tr.ecommerce.core", // Alias
} as const;

/**
 * Soru paketi kimliği → Kanonik iş fonksiyonu kodu eşleştirmesi.
 */
export const CANONICAL_PACK_ID_TO_CODE: Readonly<Record<string, string>> = {
${packDefinitions.map((p) => `  ${JSON.stringify(p.packId)}: ${JSON.stringify(p.businessFunctionCode)},`).join("\n")}
} as const;

/**
 * Kullanılabilir soru paketi kimlikleri listesi.
 */
export const AVAILABLE_PACK_IDS: readonly string[] = [
${packDefinitions.map((p) => `  ${JSON.stringify(p.packId)},`).join("\n")}
] as const;

/**
 * Soru paketi hazır olan kanonik iş fonksiyonları listesi.
 */
export const AVAILABLE_BUSINESS_FUNCTION_CODES: readonly string[] = [
${packDefinitions.map((p) => `  ${JSON.stringify(p.businessFunctionCode)},`).join("\n")}
] as const;
`;

writeFileSync(PACKS_TS_PATH, packsTsContent, "utf-8");
console.log(`[generate] Wrote generated TypeScript to src/generated/questionPacks.ts (${packDefinitions.length} packs)`);

