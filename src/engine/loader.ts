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
const PACK_MODULES = import.meta.glob(
  "/question-packs/**/*.json",
  { eager: false, import: "default" }
);

/** pack_id → dosya yolu tablosu */
const PACK_ID_TO_PATH: Record<string, string> = {
  "tr.sales.core": "/question-packs/tr/sales/core.json",
};

/**
 * Verilen pack_id'ye göre soru paketini yükler ve doğrular.
 */
export async function loadQuestionPack(packId: string): Promise<PackLoadResult> {
  const filePath = PACK_ID_TO_PATH[packId];

  if (!filePath) {
    return {
      ok: false,
      packId,
      error: `"${packId}" için kayıtlı dosya yolu bulunamadı.`,
    };
  }

  const loader = PACK_MODULES[filePath];

  if (!loader) {
    return {
      ok: false,
      packId,
      error: `Soru paketi glob'da bulunamadı: ${filePath}\n` +
             `Dosya question-packs/ dizininde mevcut mu?`,
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
    "SALES": "tr.sales.core",   // data/business-functions.json → code: "SALES"
  };
  return mapping[bfCode] ?? null;
}
