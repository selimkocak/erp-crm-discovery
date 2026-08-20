/**
 * ERP CRM Discovery — Question Pack Loader
 *
 * Soru paketlerini statik ve deterministik olarak src/generated/questionPacks üzerinden yükler.
 * %100 Offline-first, sıfır ağ bağımlılığı, Vite ve Tauri (macOS/Windows) tam uyumlu.
 *
 * Tek Doğruluk Kaynağı: data/business-functions.json & question-packs/
 * Derleme zamanı kod üretici: scripts/generate_business_functions.mjs
 */

import type { QuestionPack, PackLoadResult } from "./types";
import { validateQuestionPack } from "./validator";
import {
  CANONICAL_QUESTION_PACKS,
  CANONICAL_CODE_TO_PACK_ID,
  AVAILABLE_PACK_IDS,
} from "../generated/questionPacks";

/**
 * Belirli bir pack_id'nin derleme zamanında mevcut olup olmadığını denetler.
 */
export function isPackAvailable(packId: string): boolean {
  return Boolean(CANONICAL_QUESTION_PACKS[packId]);
}

/**
 * Verilen pack_id'ye göre soru paketini senkron veya asenkron olarak yükler ve doğrular.
 */
export async function loadQuestionPack(packId: string): Promise<PackLoadResult> {
  const pack = CANONICAL_QUESTION_PACKS[packId];

  if (!pack) {
    return {
      ok: false,
      packId,
      error: `"${packId}" soru paketi henüz geliştirme aşamasındadır veya bu sürüme dahil edilmemiştir.`,
    };
  }

  // Şema doğrulama
  const validation = validateQuestionPack(pack);
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

  return { ok: true, pack: pack as QuestionPack };
}

/**
 * Bir business_function_code için uygun pack_id döndürür.
 *
 * KANONİK KOD KAYNAĞI: data/business-functions.json & src/generated/questionPacks.ts
 */
export function getPackIdForFunction(bfCode: string): string | null {
  return CANONICAL_CODE_TO_PACK_ID[bfCode] ?? null;
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

/**
 * Sistemde yüklü tüm kullanılabilir pack_id listesini döndürür.
 */
export function getAvailablePackIds(): readonly string[] {
  return AVAILABLE_PACK_IDS;
}
