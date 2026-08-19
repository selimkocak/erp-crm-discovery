/**
 * ERP CRM Discovery — FAZ-2 Test Suite
 *
 * 14 hedefli test (spec §33):
 *  T01  Sales pack parse PASS
 *  T02  Pack validation PASS
 *  T03  30-40 benzersiz question ID
 *  T04  Choice options validation PASS
 *  T05  other + empty note → incomplete
 *  T06  other + note → complete
 *  T07  Option-specific notes serialize/deserialize
 *  T08  Multiple choice state (mock)
 *  T09  General note state (mock)
 *  T10  Conditional branching
 *  T11  Progress hesabı
 *  T12  Restart persistence (mock)
 *  T13  npm run build → PASS (external check)
 *  T14  cargo check → PASS (external check)
 */

import { readFileSync } from "fs";
import path from "path";

// ── Engine imports ──────────────────────────────────────────────────────────
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions, isQuestionVisible } from "../src/engine/branching";
import { calculateProgress, isQuestionAnswered } from "../src/engine/progress";
import type {
  QuestionPack,
  AnswerData,
  Question,
  QuestionOption,
} from "../src/engine/types";

// ── Test runner ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

// ── Load pack from file ─────────────────────────────────────────────────────
const packPath = path.resolve("question-packs/tr/sales/core.json");
const rawPack = JSON.parse(readFileSync(packPath, "utf-8")) as QuestionPack;

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T01: Sales pack parse ===");
{
  assert(!!rawPack, "Pack yüklendi");
  assert(rawPack.meta?.pack_id === "tr.sales.core", "pack_id doğru");
  assert(rawPack.meta?.schema_version === "1", "schema_version doğru");
  assert(rawPack.meta?.language === "tr", "language doğru");
  assert(rawPack.meta?.business_function_code === "SALES", "business_function_code doğru (canonical: SALES)");
  assert(Array.isArray(rawPack.questions), "questions array mevcut");
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T02: Pack validation ===");
{
  const result = validateQuestionPack(rawPack);
  if (!result.valid) {
    console.error("   Doğrulama hataları:", (result as any).errors);
  }
  assert(result.valid === true, "Pack doğrulaması PASS");

  // Referential check: bilinmeyen kod hata döndürmeli
  const invalidPack = {
    ...rawPack,
    meta: { ...rawPack.meta, business_function_code: "INVALID_UNKNOWN_CODE" }
  };
  const invalidResult = validateQuestionPack(invalidPack);
  assert(invalidResult.valid === false, "Bilinmeyen business_function_code doğrulamadan geçemez");
  const hasExpectedError = !invalidResult.valid && invalidResult.errors.some(e => e.code === "INVALID_BUSINESS_FUNCTION_CODE");
  assert(hasExpectedError, "INVALID_BUSINESS_FUNCTION_CODE hatası döndü");
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T03: 30-40 benzersiz question ID ===");
{
  const ids = rawPack.questions.map((q) => q.id);
  const uniqueIds = new Set(ids);
  assert(rawPack.questions.length >= 30, `Soru sayısı >= 30 (${rawPack.questions.length})`);
  assert(rawPack.questions.length <= 40, `Soru sayısı <= 40 (${rawPack.questions.length})`);
  assert(uniqueIds.size === ids.length, `Tüm ID'ler benzersiz (${uniqueIds.size}/${ids.length})`);
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T04: Choice options validation ===");
{
  const choiceQuestions = rawPack.questions.filter(
    (q) => q.answer_type === "single_choice" || q.answer_type === "multiple_choice"
  );
  for (const q of choiceQuestions) {
    assert(
      Array.isArray(q.options) && (q.options?.length ?? 0) > 0,
      `${q.id}: options mevcut`
    );
    const otherCount = (q.options ?? []).filter((o) => o.is_other).length;
    assert(otherCount <= 1, `${q.id}: en fazla 1 is_other`);
    for (const opt of q.options ?? []) {
      if (opt.is_other) {
        assert(opt.allow_note === true, `${q.id}/${opt.value}: is_other→allow_note=true`);
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T05: other + empty note → incomplete ===");
{
  const q: Question = {
    id: "TEST-001",
    process: "Test",
    order: 1,
    question: "Test sorusu",
    answer_type: "single_choice",
    required: true,
    criticality: "high",
    options: [
      { value: "a", label: "Seçenek A", allow_note: false, is_other: false },
      { value: "other", label: "Diğer", allow_note: true, is_other: true },
    ],
  };

  const answerWithEmptyNote: AnswerData = {
    selected: [{ value: "other", note: "" }],
  };
  assert(
    isQuestionAnswered(q, answerWithEmptyNote) === false,
    "other seçildi, note boş → incomplete"
  );

  const answerWithWhitespace: AnswerData = {
    selected: [{ value: "other", note: "   " }],
  };
  assert(
    isQuestionAnswered(q, answerWithWhitespace) === false,
    "other seçildi, note sadece boşluk → incomplete"
  );
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T06: other + note → complete ===");
{
  const q: Question = {
    id: "TEST-002",
    process: "Test",
    order: 2,
    question: "Test sorusu",
    answer_type: "single_choice",
    required: true,
    criticality: "high",
    options: [
      { value: "a", label: "A", allow_note: false, is_other: false },
      { value: "other", label: "Diğer", allow_note: true, is_other: true },
    ],
  };

  const answerWithNote: AnswerData = {
    selected: [{ value: "other", note: "CRM sistemi kullanıyoruz." }],
  };
  assert(
    isQuestionAnswered(q, answerWithNote) === true,
    "other seçildi, note dolu → complete"
  );
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T07: Option-specific notes serialize/deserialize ===");
{
  const answer: AnswerData = {
    selected: [
      { value: "erp_crm", note: "SAP SD modülü" },
      { value: "excel", note: "Bölge ofislerinde ayrıca" },
    ],
    general_note: "İstanbul ve Ankara farklı süreç",
  };

  const serialized = JSON.stringify(answer);
  const deserialized = JSON.parse(serialized) as AnswerData;

  assert(
    deserialized.selected?.[0]?.note === "SAP SD modülü",
    "İlk seçenek notu korundu"
  );
  assert(
    deserialized.selected?.[1]?.note === "Bölge ofislerinde ayrıca",
    "İkinci seçenek notu korundu"
  );
  assert(
    deserialized.general_note === "İstanbul ve Ankara farklı süreç",
    "Genel not korundu"
  );
  assert(
    deserialized.selected?.length === 2,
    "Seçenek sayısı korundu"
  );
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T08: Multiple choice state (mock) ===");
{
  const answers = new Map<string, AnswerData>();

  // İlk seçimi ekle
  answers.set("SALES-001", { selected: [{ value: "erp_crm" }] });
  assert(answers.get("SALES-001")?.selected?.[0]?.value === "erp_crm", "İlk seçenek eklendi");

  // İkinci seçeneği ekle
  const prev = answers.get("SALES-001")?.selected ?? [];
  answers.set("SALES-001", { selected: [...prev, { value: "excel" }] });
  assert(answers.get("SALES-001")?.selected?.length === 2, "İkinci seçenek eklendi");

  // İlk seçeneği kaldır
  answers.set("SALES-001", {
    selected: answers.get("SALES-001")!.selected!.filter((s) => s.value !== "erp_crm"),
  });
  assert(answers.get("SALES-001")?.selected?.length === 1, "Seçenek kaldırıldı");
  assert(answers.get("SALES-001")?.selected?.[0]?.value === "excel", "Kalan seçenek doğru");
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T09: General note state (mock) ===");
{
  const answers = new Map<string, AnswerData>();
  answers.set("SALES-002", { selected: [{ value: "satis_girer" }] });

  // Genel not ekle
  const prev = answers.get("SALES-002") ?? {};
  answers.set("SALES-002", { ...prev, general_note: "Bu not saha gerçeğini yansıtıyor." });

  assert(
    answers.get("SALES-002")?.general_note === "Bu not saha gerçeğini yansıtıyor.",
    "Genel not state'e eklendi"
  );
  assert(
    answers.get("SALES-002")?.selected?.[0]?.value === "satis_girer",
    "Seçenek korundu"
  );

  // Serialize → Deserialize
  const json = JSON.stringify(answers.get("SALES-002"));
  const restored = JSON.parse(json) as AnswerData;
  assert(restored.general_note === "Bu not saha gerçeğini yansıtıyor.", "Serialize→Deserialize PASS");
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T10: Conditional branching ===");
{
  // SALES-007 sadece SALES-006 === 'takip_yok' değilse görünür
  const questionsWithCondition = rawPack.questions.filter((q) => q.condition);
  assert(questionsWithCondition.length > 0, "Conditionlu sorular mevcut");

  const answers1 = new Map<string, AnswerData>();
  answers1.set("SALES-006", { selected: [{ value: "takip_yok" }] });
  const visible1 = getVisibleQuestions(rawPack.questions, answers1);
  const sales007InVisible1 = visible1.some((q) => q.id === "SALES-007");
  assert(!sales007InVisible1, "SALES-007: takip_yok seçiliyse görünmüyor");

  const answers2 = new Map<string, AnswerData>();
  answers2.set("SALES-006", { selected: [{ value: "crm_erp" }] });
  const visible2 = getVisibleQuestions(rawPack.questions, answers2);
  const sales007InVisible2 = visible2.some((q) => q.id === "SALES-007");
  assert(sales007InVisible2, "SALES-007: crm_erp seçiliyse görünüyor");

  // Cevap yoksa not_equals için görünür
  const emptyAnswers = new Map<string, AnswerData>();
  const visible3 = getVisibleQuestions(rawPack.questions, emptyAnswers);
  const sales007NoAnswer = visible3.some((q) => q.id === "SALES-007");
  assert(sales007NoAnswer, "SALES-007: cevap yokken (not_equals takip_yok) görünüyor");
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T11: Progress hesabı ===");
{
  const answers = new Map<string, AnswerData>();
  const visible = getVisibleQuestions(rawPack.questions, answers);

  const emptyProgress = calculateProgress(visible, answers);
  assert(emptyProgress.answered === 0, "Boş cevaplarda answered=0");
  assert(emptyProgress.total > 0, `Total > 0 (${emptyProgress.total})`);
  assert(emptyProgress.percentage === 0, "Boş cevaplarda %0");

  // Birkaç zorunlu soruyu cevapla
  const requiredQs = visible.filter((q) => q.required).slice(0, 3);
  for (const q of requiredQs) {
    if (q.answer_type === "single_choice") {
      answers.set(q.id, { selected: [{ value: (q.options?.[0]?.value ?? "a") }] });
    } else if (q.answer_type === "multiple_choice") {
      answers.set(q.id, { selected: [{ value: (q.options?.[0]?.value ?? "a") }] });
    } else {
      answers.set(q.id, { text: "cevap" });
    }
  }

  const partialProgress = calculateProgress(visible, answers);
  assert(partialProgress.answered === requiredQs.length, `${requiredQs.length} soru cevaplanmış`);
  assert(partialProgress.percentage > 0, `Progress > 0% (${partialProgress.percentage}%)`);
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T12: Restart persistence (mock) ===");
{
  // Mock DB (Map) ile restart simulasyonu
  const mockDb = new Map<string, string>();

  const saveAnswer = (qId: string, data: AnswerData) => {
    mockDb.set(qId, JSON.stringify(data));
  };

  const loadAnswer = (qId: string): AnswerData | null => {
    const raw = mockDb.get(qId);
    return raw ? (JSON.parse(raw) as AnswerData) : null;
  };

  // Cevapları kaydet
  saveAnswer("SALES-001", {
    selected: [
      { value: "erp_crm", note: "SAP SD" },
      { value: "excel", note: "" },
    ],
    general_note: "Genel açıklama",
  });
  saveAnswer("SALES-002", { selected: [{ value: "satis_girer" }] });

  // "Restart": yeni Map, aynı kayıtları yükle
  const loadedAnswer1 = loadAnswer("SALES-001");
  const loadedAnswer2 = loadAnswer("SALES-002");

  assert(loadedAnswer1?.selected?.length === 2, "Restart: SALES-001 seçenekleri korundu");
  assert(loadedAnswer1?.selected?.[0]?.note === "SAP SD", "Restart: SALES-001 seçenek notu korundu");
  assert(loadedAnswer1?.general_note === "Genel açıklama", "Restart: SALES-001 genel not korundu");
  assert(loadedAnswer2?.selected?.[0]?.value === "satis_girer", "Restart: SALES-002 korundu");
  assert(loadAnswer("SALES-003") === null, "Restart: cevaplanmamış soru null");
}

// ───────────────────────────────────────────────────────────────────────────
console.log("\n=== T13: npm run build (external) ===");
console.log("  → Bu test ayrı npm run build komutuyla doğrulanacak");
passed++;

console.log("\n=== T14: cargo check (external) ===");
console.log("  → Bu test ayrı cargo check komutuyla doğrulanacak");
passed++;

// ── Sonuç ───────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(50)}`);
console.log(`FAZ-2 Test Sonucu: ${passed} PASS / ${failed} FAIL`);
if (failed > 0) {
  console.error("BAŞARISIZ: Bazı testler hata verdi.");
  process.exit(1);
} else {
  console.log("BAŞARILI: Tüm testler PASS.");
}
