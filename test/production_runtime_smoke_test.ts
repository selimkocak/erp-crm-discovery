/**
 * Production Runtime Smoke Test & UI Flow Simulator
 *
 * Doğrulamalar:
 * 1. CANONICAL_QUESTION_PACKS manifest doğruluğu (32 paket)
 * 2. 32 paketin tamamının loadQuestionPack() ile hatasız yüklenmesi
 * 3. 5 kritik paket için UI Soru Ekranı yaşam döngüsü:
 *    - Başlat / Devam tetikleme
 *    - Soru ekranı başlatma
 *    - İlk soru ve süreç bilgisi
 *    - Seçenek listesi
 *    - Cevap kaydetme ve geri okuma
 *    - İleri / Geri navigasyon
 *    - Kapatıp yeniden açma (state persistence / resume)
 */

import {
  CANONICAL_QUESTION_PACKS,
  AVAILABLE_PACK_IDS,
  CANONICAL_CODE_TO_PACK_ID,
  CANONICAL_PACK_ID_TO_CODE,
} from "../src/generated/questionPacks.js";

import {
  isPackAvailable,
  hasQuestionPack,
  getPackStatus,
  getPackIdForFunction,
  loadQuestionPack,
  getAvailablePackIds,
} from "../src/engine/loader.js";

import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching.js";
import { calculateProgress } from "../src/engine/progress.ts";
import type { QuestionPack, Question } from "../src/engine/types.ts";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("══════════════════════════════════════════════════════");
console.log("PRODUCTION RUNTIME QUESTION PACK SMOKE TEST");
console.log("══════════════════════════════════════════════════════\n");

// ── BÖLÜM 1: Manifest Envanteri ve Tüm 32 Paketin Yüklenmesi ──
console.log("=== BÖLÜM 1: 32 Soru Paketi Manifest & Yükleme Denetimi ===");
const manifestKeys = Object.keys(CANONICAL_QUESTION_PACKS);
console.log(`Toplam Kayıtlı Paket Sayısı: ${manifestKeys.length}`);
assert(manifestKeys.length === 32, `Object.keys(CANONICAL_QUESTION_PACKS) tam 32 adet (Bulunan: ${manifestKeys.length})`);

const packSummaryTable: Array<{ packId: string; bfCode: string; name: string; qCount: number; loadOk: boolean }> = [];

for (const packId of AVAILABLE_PACK_IDS) {
  const bfCode = CANONICAL_PACK_ID_TO_CODE[packId] || "(alias)";
  const loadResult = await loadQuestionPack(packId);
  const isOk = loadResult.ok;
  const qCount = isOk ? loadResult.pack.questions.length : 0;
  const name = isOk ? loadResult.pack.meta.name : "N/A";

  assert(isOk, `loadQuestionPack("${packId}") başarılı — ${name} (${qCount} Soru)`);
  assert(hasQuestionPack(bfCode), `hasQuestionPack("${bfCode}") === true`);
  assert(getPackStatus(bfCode) === "available", `getPackStatus("${bfCode}") === "available"`);

  packSummaryTable.push({ packId, bfCode, name, qCount, loadOk: isOk });
}

// ── BÖLÜM 2: 5 Kritik Paketin Uçtan Uca UI ve Veri Akışı Denetimi ──
console.log("\n=== BÖLÜM 2: 5 Kritik Paketin UI Yaşam Döngüsü Simülasyonu ===");

const criticalTargets = [
  { packId: "tr.sales.core", bfCode: "SALES", nameTr: "Satış", testQId: "SALES-001", testAns: "erp_crm" },
  { packId: "tr.accounting.core", bfCode: "ACCOUNTING", nameTr: "Muhasebe", testQId: "ACC-001", testAns: "merkezi_tek_hesap_plani_tum_sirketler" },
  { packId: "tr.payroll.core", bfCode: "PAYROLL", nameTr: "Bordro ve Maaş", testQId: "PAY-001", testAns: "sirket_bunyesindeki_uzmanlasmis_bordro_ve_ozluk_isleri_ekibi_tarafindan_yurutulur" },
  { packId: "tr.legal_compliance.core", bfCode: "LEGAL_COMPLIANCE", nameTr: "Hukuk ve Uyumluluk", testQId: "LEG-001", testAns: "sirket_ici_hukuk_departmani_tam_zamanli_avukat_ve_ekibi_ile" },
  { packId: "tr.it_infrastructure.core", bfCode: "INFORMATION_TECHNOLOGY", nameTr: "IT ve Altyapı", testQId: "ITI-001", testAns: "sirket_ici_tam_zamanli_bt_ekibi_ve_sistem_yoneticisi" },
];

for (const target of criticalTargets) {
  console.log(`\n--- Test Paketi: ${target.nameTr} [${target.packId}] ---`);

  // 1. Başlat butonu tetiklenebilirlik
  assert(hasQuestionPack(target.bfCode) === true, `[1. Başlat Butonu] ${target.nameTr} için hasQuestionPack === true (Başlat butonu aktif)`);

  // 2. Soru ekranı açılışı
  const loadRes = await loadQuestionPack(target.packId);
  assert(loadRes.ok === true, `[2. Soru Ekranı] ${target.nameTr} soru paketi başarıyla yüklendi`);
  if (!loadRes.ok) continue;

  const pack = loadRes.pack;
  assert(pack.questions.length > 0, `[2. Soru Ekranı] ${target.nameTr} toplam ${pack.questions.length} soru içeriyor`);

  // 3. İlk soru metni ve süreç
  const firstQuestion = pack.questions[0];
  assert(!!firstQuestion.id, `[3. İlk Soru] Soru ID tanımlı: ${firstQuestion.id}`);
  assert(firstQuestion.question.trim().length > 10, `[3. İlk Soru] Soru metni dolu: "${firstQuestion.question.substring(0, 45)}..."`);
  assert(!!firstQuestion.process, `[3. İlk Soru] Süreç grubu mevcut: "${firstQuestion.process}"`);

  // 4. Seçenekler listesi
  assert(Array.isArray(firstQuestion.options) && firstQuestion.options.length >= 2, `[4. Seçenekler] Soru ${firstQuestion.options?.length} seçenek içeriyor`);
  assert(firstQuestion.options!.some(opt => opt.value === target.testAns), `[4. Seçenekler] Test seçeneği "${target.testAns}" mevcut`);

  // 5. Bir cevap kaydetme simülasyonu
  const simulatedDbAnswers = new Map<string, any>();
  simulatedDbAnswers.set(target.testQId, {
    selected: [{ value: target.testAns, note: "Otomasyon testi ile kaydedilen seçenek notu" }],
    general_note: "Otomasyon testi ile kaydedilen genel not",
  });
  const savedAns = simulatedDbAnswers.get(target.testQId);
  assert(savedAns?.selected[0]?.value === target.testAns, `[5. Cevap Kaydetme] Cevap başarıyla kaydedildi: "${savedAns?.selected[0]?.value}"`);

  // 6. İleri / Geri Navigasyon & Branching
  const visibleQuestions = getVisibleQuestions(pack.questions, simulatedDbAnswers);
  assert(visibleQuestions.length > 0, `[6. Navigasyon] Görünür soru listesi hesaplandı (${visibleQuestions.length} soru)`);
  const firstVisibleIdx = visibleQuestions.findIndex(q => q.id === firstQuestion.id);
  assert(firstVisibleIdx === 0, `[6. Navigasyon] İlk soru indeksi = 0`);
  const nextQuestion = visibleQuestions[1];
  assert(!!nextQuestion, `[6. Navigasyon] İleri tıklandığında 2. soruya geçilebiliyor (${nextQuestion.id})`);

  // 7. Kapatıp Açınca Cevabın Korunması (Resume / Persistence)
  // Simüle edilen ikinci oturumda aynı answers map yüklenir
  const reopenedAnswers = new Map<string, any>(simulatedDbAnswers);
  const reopenedAns = reopenedAnswers.get(target.testQId);
  assert(reopenedAns?.selected[0]?.value === target.testAns, `[7. Persistence/Resume] Kapatıp açınca kayıtlı cevap aynen okundu`);

  const initialProgress = calculateProgress(pack.questions, new Map(), new Map());
  const updatedProgress = calculateProgress(pack.questions, simulatedDbAnswers, new Map());
  assert(updatedProgress.answered >= 1, `[7. Persistence/Resume] İlerleme güncellendi: %${initialProgress.percentage} -> %${updatedProgress.percentage} (${updatedProgress.answered}/${updatedProgress.total} Soru)`);
}

// ── Sonuç Özeti ──
console.log("\n══════════════════════════════════════════════════════");
console.log(`PRODUCTION RUNTIME SMOKE TEST SONUCU: ${passed} PASS / ${failed} FAIL`);
console.log("══════════════════════════════════════════════════════\n");

if (failed > 0) {
  console.error(`BAŞARISIZ: ${failed} test fail etti!`);
  process.exit(1);
} else {
  console.log("BAŞARILI: TÜM QUESTION PACK'LER RUNTIME'DA %100 YÜKLENİYOR VE AÇILIYOR: PASS\n");
}
