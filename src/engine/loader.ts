/**
 * ERP CRM Discovery — Question Pack Loader
 *
 * Soru paketlerini Vite'ın import.meta.glob mekanizmasıyla yükler.
 * JSON dosyaları derleme zamanında JS bundle'ına dahil edilir;
 * sunucu çağrısı, public/ kopyası veya fetch() gerekmez.
 *
 * Tek source-of-truth: question-packs/tr/sales/core.json
 * Runtime kopya: YOK (offline-first, Tauri bundle'da)
 *
 * Hata durumunda sessiz başarısızlık yoktur — açık hata nesnesi döner.
 */

import type { QuestionPack, PackLoadResult } from "./types";
import { validateQuestionPack } from "./validator";

// ── Glob import — Vite build-time tarafından çözülür ──────────────────────
// Tüm question pack JSON'larını proje kökünden import et.
// Kural: question-packs/<language>/<domain>/core.json
const PACK_MODULES: Record<string, () => Promise<unknown>> =
  typeof (import.meta as any).glob === "function"
    ? import.meta.glob(
        "/question-packs/**/*.json",
        { eager: false, import: "default" }
      )
    : {};

/** pack_id → dosya yolu tablosu */
const PACK_ID_TO_PATH: Record<string, string> = {
  "tr.sales.core": "/question-packs/tr/sales/core.json",
  "tr.procurement.core": "/question-packs/tr/procurement/core.json",
  "tr.warehouse.core": "/question-packs/tr/warehouse/core.json",
  "tr.inventory.core": "/question-packs/tr/inventory/core.json",
  "tr.logistics.core": "/question-packs/tr/logistics/core.json",
  "tr.accounting.core": "/question-packs/tr/accounting/core.json",
  "tr.treasury.core": "/question-packs/tr/treasury/core.json",
  "tr.budget_reporting.core": "/question-packs/tr/budget_reporting/core.json",
  "tr.reporting_analytics.core": "/question-packs/tr/reporting_analytics/core.json",
  "tr.crm.core": "/question-packs/tr/crm/core.json",
  "tr.proposals.core": "/question-packs/tr/proposals/core.json",
  "tr.marketing.core": "/question-packs/tr/marketing/core.json",
  "tr.supplier_management.core": "/question-packs/tr/supplier_management/core.json",
  "tr.quality.core": "/question-packs/tr/quality/core.json",
  "tr.maintenance.core": "/question-packs/tr/maintenance/core.json",
  "tr.production_planning.core": "/question-packs/tr/production_planning/core.json",
  "tr.work_orders.core": "/question-packs/tr/work_orders/core.json",
  "tr.costing.core": "/question-packs/tr/costing/core.json",
  "tr.asset_management.core": "/question-packs/tr/asset_management/core.json",
  "tr.human_resources.core": "/question-packs/tr/human_resources/core.json",
  "tr.payroll.core": "/question-packs/tr/payroll/core.json",
  "tr.legal_compliance.core": "/question-packs/tr/legal_compliance/core.json",
  "tr.it_infrastructure.core": "/question-packs/tr/it_infrastructure/core.json",
};

/**
 * Belirli bir pack_id'nin çalışma zamanında kullanılabilir olup olmadığını denetler.
 */
export function isPackAvailable(packId: string): boolean {
  const filePath = PACK_ID_TO_PATH[packId];
  if (!filePath) return false;
  // Vite ortamında glob listesi doluysa içindeki mevcudiyeti kontrol et
  if (Object.keys(PACK_MODULES).length > 0) {
    return typeof PACK_MODULES[filePath] === "function";
  }
  // Node.js test ortamında kayıt mevcudiyeti yeterlidir
  return true;
}

/**
 * Verilen pack_id'ye göre soru paketini yükler ve doğrular.
 */
export async function loadQuestionPack(packId: string): Promise<PackLoadResult> {
  const filePath = PACK_ID_TO_PATH[packId];

  if (!filePath) {
    return {
      ok: false,
      packId,
      error: `"${packId}" için kayıtlı soru paketi yolu tanımlı değil.`,
    };
  }

  const loader = PACK_MODULES[filePath];

  if (!loader) {
    // Vite bundle içinde dosya yoksa veya henüz eklenmemişse
    return {
      ok: false,
      packId,
      error: `"${packId}" soru paketi henüz bu sürüme dahil edilmemiştir veya hazırlanmaktadır.`,
    };
  }

  let rawData: unknown;

  try {
    rawData = await loader();
  } catch (err) {
    return {
      ok: false,
      packId,
      error: `Soru paketi yüklenemedi: ${String(err)}\nDosya: ${filePath}`,
    };
  }

  // Şema doğrulama
  const validation = validateQuestionPack(rawData);
  if (!validation.valid) {
    const errorSummary = validation.errors
      .slice(0, 5)
      .map((e) => `${e.code}: ${e.message}${e.questionId ? ` [${e.questionId}]` : ""}`)
      .join("\n");
    return {
      ok: false,
      packId,
      error: `Soru paketi doğrulama hatası:\nPaket: ${packId}\n\n${errorSummary}`,
    };
  }

  return { ok: true, pack: rawData as QuestionPack };
}

/**
 * Bir business_function_code için uygun pack_id döndürür.
 *
 * KANONİK KOD KAYNAĞI: data/business-functions.json
 * Tüm kodlar English/ASCII formatında, dil bağımsız.
 *
 * Yeni pack eklendiğinde bu tabloya bir satır eklenir.
 * Registry kodu her zaman canonical code'tur — display label değil.
 */
export function getPackIdForFunction(bfCode: string): string | null {
  const mapping: Record<string, string> = {
    "SALES": "tr.sales.core",         // data/business-functions.json → code: "SALES"
    "PROCUREMENT": "tr.procurement.core", // data/business-functions.json → code: "PROCUREMENT"
    "WAREHOUSE": "tr.warehouse.core",     // data/business-functions.json → code: "WAREHOUSE"
    "INVENTORY": "tr.inventory.core",     // data/business-functions.json → code: "INVENTORY"
    "LOGISTICS": "tr.logistics.core",     // data/business-functions.json → code: "LOGISTICS"
    "ACCOUNTING": "tr.accounting.core",   // data/business-functions.json → code: "ACCOUNTING"
    "TREASURY": "tr.treasury.core",       // data/business-functions.json → code: "TREASURY"
    "BUDGET_REPORTING": "tr.budget_reporting.core", // data/business-functions.json → code: "BUDGET_REPORTING"
    "REPORTING_ANALYTICS": "tr.reporting_analytics.core", // data/business-functions.json → code: "REPORTING_ANALYTICS"
    "CRM": "tr.crm.core",                 // data/business-functions.json → code: "CRM"
    "PROPOSALS": "tr.proposals.core",     // data/business-functions.json → code: "PROPOSALS"
    "MARKETING": "tr.marketing.core",     // data/business-functions.json → code: "MARKETING"
    "SUPPLIER_MANAGEMENT": "tr.supplier_management.core", // data/business-functions.json → code: "SUPPLIER_MANAGEMENT"
    "QUALITY": "tr.quality.core",         // data/business-functions.json → code: "QUALITY"
    "MAINTENANCE": "tr.maintenance.core", // data/business-functions.json → code: "MAINTENANCE"
    "PRODUCTION_PLANNING": "tr.production_planning.core", // data/business-functions.json → code: "PRODUCTION_PLANNING"
    "WORK_ORDERS": "tr.work_orders.core", // data/business-functions.json → code: "WORK_ORDERS"
    "COSTING": "tr.costing.core",         // data/business-functions.json → code: "COSTING"
    "ASSET_MANAGEMENT": "tr.asset_management.core", // data/business-functions.json → code: "ASSET_MANAGEMENT"
    "HUMAN_RESOURCES": "tr.human_resources.core",   // data/business-functions.json → code: "HUMAN_RESOURCES"
    "PAYROLL": "tr.payroll.core",                   // data/business-functions.json → code: "PAYROLL"
    "LEGAL_COMPLIANCE": "tr.legal_compliance.core",  // data/business-functions.json → code: "LEGAL_COMPLIANCE"
    "INFORMATION_TECHNOLOGY": "tr.it_infrastructure.core", // data/business-functions.json → code: "INFORMATION_TECHNOLOGY"
    "IT_INFRASTRUCTURE": "tr.it_infrastructure.core", // Alias
  };
  return mapping[bfCode] ?? null;
}

/**
 * İş fonksiyonunun soru paketinin mevcut ve kullanıma hazır olup olmadığını kontrol eder.
 */
export function hasQuestionPack(bfCode: string): boolean {
  const packId = getPackIdForFunction(bfCode);
  if (!packId) return false;
  return isPackAvailable(packId);
}

/**
 * İş fonksiyonunun soru paketi durumunu döner.
 */
export function getPackStatus(bfCode: string): "available" | "in_development" | "unmapped" {
  const packId = getPackIdForFunction(bfCode);
  if (!packId) return "in_development";
  return isPackAvailable(packId) ? "available" : "in_development";
}
