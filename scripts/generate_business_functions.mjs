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
if (entries.length !== 31) {
  console.error(`[generate] FAIL: Expected exactly 31 business functions, found ${entries.length}`);
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

console.log(`[generate] Validated 31 canonical business functions successfully.`);

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
