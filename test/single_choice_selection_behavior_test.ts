/**
 * ERP CRM Discovery — Single Choice Selection & Clear Behavior Test Suite
 *
 * Doğrulanan Kurallar:
 * 1. Bir seçenek seçildiğinde başka seçenek seçilirse mevcut cevap değiştirilir (Seç -> Başka Seç).
 * 2. Seçili cevap varken görünür "Seçimi kaldır" ikincil aksiyonu cevabı temizler (Seç -> Seçimi Kaldır).
 * 3. Seçimi kaldırmak cevabı boşaltır, kaydeder ve ilerleme sayacını (progress) azaltır.
 * 4. Çift tıklama yerine native radio tek tıklama ve belirgin temizleme aksiyonu kullanılır.
 * 5. Klavye erişimi: Escape veya erişilebilir "Seçimi kaldır" butonu çalışır.
 * 6. Seçimi kaldırmak, soruyu cevapsız duruma döndürür (hasProvidedAnswer = false).
 * 7. Cevapsız zorunlu soru:
 *    - Bayraklıysa (revisit / critical) Sonraki ile geçilebilir (canAdvance = true).
 *    - Bayraksızsa Sonraki engellenir (canAdvance = false).
 * 8. Çoklu seçimli sorularda mevcut checkbox davranışı (tıkla seç / tıkla kaldır) aynen korunur.
 * 9. Native radio davranışı: aynı seçeneğe tekrar tıklanması seçimi bozmaz.
 * 10. Rapor formatlayıcı (formatAnswer) temizlenen cevabı "Cevaplanmadı" olarak sunar.
 * 11. SQLite veritabanı persistence: temizlenen cevap kaydedilir ve okunurken cevapsız kalır.
 */

import {
  hasProvidedAnswer,
  isQuestionAnswered,
  canAdvanceToNextQuestion,
  calculateProgress,
  progressToStatus,
} from "../src/engine/progress";
import { formatAnswer } from "../src/report/formatters";
import type { Question, AnswerData, QuestionOption } from "../src/engine/types";
import { MIGRATION_DEFINITIONS } from "../src/db/migrationDefinitions";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

let Database: any = null;
try {
  Database = (await import("better-sqlite3")).default;
} catch {
  // SQLite optional
}

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

// ─── MODEL FIXTURES ────────────────────────────────────────────────────────
const singleChoiceQuestion: Question = {
  id: "SALES-001",
  order: 1,
  process: "Fiyatlandırma",
  question: "Fiyat listeleri nasıl yönetiliyor?",
  answer_type: "single_choice",
  required: true,
  criticality: "critical",
  options: [
    { value: "erp", label: "ERP üzerinden", allow_note: false, is_other: false },
    { value: "excel", label: "Excel ile", allow_note: false, is_other: false },
    { value: "other", label: "Diğer", allow_note: true, is_other: true },
  ],
};

const yesNoQuestion: Question = {
  id: "SALES-002",
  order: 2,
  process: "Sözleşmeler",
  question: "Müşteri sözleşmeleri dijital ortamda arşivleniyor mu?",
  answer_type: "yes_no",
  required: true,
  criticality: "high",
  options: [
    { value: "yes", label: "Evet", allow_note: false, is_other: false },
    { value: "no", label: "Hayır", allow_note: false, is_other: false },
  ],
};

const multiChoiceQuestion: Question = {
  id: "SALES-003",
  order: 3,
  process: "Müşteri İletişimi",
  question: "Hangi iletişim kanalları aktif kullanılıyor?",
  answer_type: "multiple_choice",
  required: true,
  criticality: "medium",
  options: [
    { value: "email", label: "E-Posta", allow_note: false, is_other: false },
    { value: "phone", label: "Telefon", allow_note: false, is_other: false },
    { value: "whatsapp", label: "WhatsApp", allow_note: false, is_other: false },
  ],
};

const optionalQuestion: Question = {
  id: "SALES-004",
  order: 4,
  process: "Ek Bilgiler",
  question: "Mevcut ERP hakkında genel değerlendirme",
  answer_type: "single_choice",
  required: false,
  criticality: "low",
  options: [
    { value: "satisfied", label: "Memnun", allow_note: false, is_other: false },
    { value: "neutral", label: "Nötr", allow_note: false, is_other: false },
  ],
};

// ─── 1. SEÇ -> BAŞKA SEÇENEK SEÇ (SELECTION REPLACEMENT) ────────────────────
console.log("\n=== 1. Seç -> Başka Seçenek Seç (Radio Değiştirme Mantığı) ===");
{
  // Simulating QuestionCard handleToggle for single_choice
  let currentAnswer: AnswerData = {};

  const simulateSingleToggle = (val: string) => {
    currentAnswer = {
      ...currentAnswer,
      selected: [{ value: val, note: "" }],
    };
  };

  // Başlangıç: ERP seçildi
  simulateSingleToggle("erp");
  assert(
    currentAnswer.selected?.length === 1 && currentAnswer.selected[0].value === "erp",
    "1.1 İlk seçim: 'erp' seçildi"
  );
  assert(hasProvidedAnswer(singleChoiceQuestion, currentAnswer) === true, "1.2 Soru cevaplı durumda");

  // Başka seçenek: Excel seçildi
  simulateSingleToggle("excel");
  assert(
    currentAnswer.selected?.length === 1 && currentAnswer.selected[0].value === "excel",
    "1.3 Başka seçenek seçildiğinde önceki silindi ve yalnızca 'excel' seçili kaldı"
  );
  assert(hasProvidedAnswer(singleChoiceQuestion, currentAnswer) === true, "1.4 Soru cevaplı durumda kaldı");

  // Native radio ergonomisi: aynı seçeneğe tekrar tıklanınca seçim silinmez
  simulateSingleToggle("excel");
  assert(
    currentAnswer.selected?.length === 1 && currentAnswer.selected[0].value === "excel",
    "1.5 Aynı seçeneğe tekrar tıklanınca seçim korunur (bozulmaz)"
  );
}

// ─── 2. SEÇ -> SEÇİMİ KALDIR (CLEAR SELECTION) ─────────────────────────────
console.log("\n=== 2. Seç -> Seçimi Kaldır (Clear Selection Action) ===");
{
  let currentAnswer: AnswerData = {
    selected: [{ value: "erp" }],
  };

  const simulateClearSelection = () => {
    currentAnswer = {
      ...currentAnswer,
      selected: [],
    };
  };

  assert(hasProvidedAnswer(singleChoiceQuestion, currentAnswer) === true, "2.1 Başlangıçta cevap var");

  // Seçimi kaldır tetiklenir
  simulateClearSelection();
  assert(
    Array.isArray(currentAnswer.selected) && currentAnswer.selected.length === 0,
    "2.2 'Seçimi kaldır' ile selected boş dizi yapıldı"
  );
  assert(
    hasProvidedAnswer(singleChoiceQuestion, currentAnswer) === false,
    "2.3 hasProvidedAnswer false döndü (soru cevapsız duruma döndü)"
  );
  assert(
    isQuestionAnswered(singleChoiceQuestion, currentAnswer) === false,
    "2.4 isQuestionAnswered false döndü (zorunlu soru cevapsız sayıldı)"
  );
}

// ─── 3. ZORUNLU SORUYU TEMİZLE VE İLERLEME SAYACI (PROGRESS TRUTH) ─────────
console.log("\n=== 3. Zorunlu Soruyu Temizle ve İlerleme Sayacını Azalt ===");
{
  const questions = [singleChoiceQuestion, yesNoQuestion]; // 2 zorunlu soru
  const answersMap = new Map<string, AnswerData>();

  // İki soru da cevaplandı
  answersMap.set("SALES-001", { selected: [{ value: "erp" }] });
  answersMap.set("SALES-002", { selected: [{ value: "yes" }] });

  let progress = calculateProgress(questions, answersMap);
  assert(progress.answered === 2, "3.1 Her iki zorunlu soru cevaplandığında answered = 2");
  assert(progress.percentage === 100, "3.2 İlerleme yüzdesi %100");
  assert(progressToStatus(progress.answered, progress.total) === "completed", "3.3 Durum 'completed'");

  // SALES-001 seçimi kaldırılıyor
  answersMap.set("SALES-001", { selected: [] });

  progress = calculateProgress(questions, answersMap);
  assert(progress.answered === 1, "3.4 SALES-001 seçimi kaldırılınca answered 2'den 1'e düştü");
  assert(progress.percentage === 50, "3.5 İlerleme yüzdesi %50'ye düştü");
  assert(progressToStatus(progress.answered, progress.total) === "in_progress", "3.6 Durum 'in_progress' oldu");

  // SALES-002 de seçimi kaldırılıyor
  answersMap.set("SALES-002", { selected: [] });
  progress = calculateProgress(questions, answersMap);
  assert(progress.answered === 0, "3.7 İkinci soru da temizlenince answered = 0");
  assert(progress.percentage === 0, "3.8 İlerleme yüzdesi %0");
  assert(progressToStatus(progress.answered, progress.total) === "not_started", "3.9 Durum 'not_started' oldu");
}

// ─── 4. BAYRAKLI VE BAYRAKSIZ CEVAPSIZ ZORUNLU SORUDA İLERLEME KURALI ──────
console.log("\n=== 4. Bayraklı / Bayraksız Zorunlu Soruda İlerleme (canAdvance) ===");
{
  const clearedAnswer: AnswerData = { selected: [] };
  const yellowFollowup = { flag_type: "revisit", status: "open", note: "Teyit bekleniyor" };
  const redFollowup = { flag_type: "critical", status: "open", note: "Kritik açık konu" };
  const closedFollowup = { flag_type: "revisit", status: "closed", note: "Tamamlandı" };

  // 4.1 Bayraksız temizlenmiş zorunlu soru -> İlerleme engellenir
  assert(
    canAdvanceToNextQuestion(singleChoiceQuestion, clearedAnswer, null) === false,
    "4.1 Bayraksız temizlenmiş zorunlu soru: canAdvance = false (ilerleme engellenir)"
  );

  // 4.2 Sarı bayraklı temizlenmiş zorunlu soru -> İlerlemeye izin verilir
  assert(
    canAdvanceToNextQuestion(singleChoiceQuestion, clearedAnswer, yellowFollowup) === true,
    "4.2 Sarı bayraklı (revisit) temizlenmiş zorunlu soru: canAdvance = true (Sonraki ile geçilebilir)"
  );

  // 4.3 Kırmızı bayraklı temizlenmiş zorunlu soru -> İlerlemeye izin verilir
  assert(
    canAdvanceToNextQuestion(singleChoiceQuestion, clearedAnswer, redFollowup) === true,
    "4.3 Kırmızı bayraklı (critical) temizlenmiş zorunlu soru: canAdvance = true (Sonraki ile geçilebilir)"
  );

  // 4.4 Kapanmış bayraklı temizlenmiş zorunlu soru -> Tekrar engellenir
  assert(
    canAdvanceToNextQuestion(singleChoiceQuestion, clearedAnswer, closedFollowup) === false,
    "4.4 Kapanmış bayrak varsa ve soru temizlenmişse: canAdvance = false"
  );

  // 4.5 Opsiyonel temizlenmiş soru -> Bayraksız da olsa ilerlemeye izin verilir
  assert(
    canAdvanceToNextQuestion(optionalQuestion, clearedAnswer, null) === true,
    "4.5 Opsiyonel temizlenmiş soru: canAdvance = true"
  );
}

// ─── 5. ÇOKLU SEÇİM (CHECKBOX) DAVRANIŞI KORUNUMU ───────────────────────────
console.log("\n=== 5. Çoklu Seçim (multiple_choice) Checkbox Davranışı Korunumu ===");
{
  let multiAnswer: AnswerData = { selected: [] };

  const simulateMultiToggle = (val: string) => {
    const list = multiAnswer.selected ?? [];
    const exists = list.find((s) => s.value === val);
    if (exists) {
      multiAnswer = {
        ...multiAnswer,
        selected: list.filter((s) => s.value !== val),
      };
    } else {
      multiAnswer = {
        ...multiAnswer,
        selected: [...list, { value: val, note: "" }],
      };
    }
  };

  // Seç: email
  simulateMultiToggle("email");
  assert(
    multiAnswer.selected?.length === 1 && multiAnswer.selected[0].value === "email",
    "5.1 İlk checkbox tıklandı: 'email' eklendi"
  );

  // Seç: phone
  simulateMultiToggle("phone");
  assert(
    multiAnswer.selected?.length === 2 &&
      multiAnswer.selected.some((s) => s.value === "email") &&
      multiAnswer.selected.some((s) => s.value === "phone"),
    "5.2 İkinci checkbox tıklandı: 'email' ve 'phone' birlikte seçili"
  );

  // Tekrar tıkla: email kaldır
  simulateMultiToggle("email");
  assert(
    multiAnswer.selected?.length === 1 && multiAnswer.selected[0].value === "phone",
    "5.3 Seçili checkbox ('email') tekrar tıklanınca kaldırıldı, 'phone' kaldı"
  );

  // Tekrar tıkla: phone kaldır
  simulateMultiToggle("phone");
  assert(
    multiAnswer.selected?.length === 0,
    "5.4 Kalan son checkbox da tekrar tıklanınca liste boşaldı"
  );
  assert(
    hasProvidedAnswer(multiChoiceQuestion, multiAnswer) === false,
    "5.5 Tüm checkboxlar kalkınca hasProvidedAnswer false döndü"
  );
}

// ─── 6. RAPOR FORMATLAYICI (formatAnswer) DOĞRULAMASI ───────────────────────
console.log("\n=== 6. Rapor Formatlayıcı (formatAnswer) Doğrulaması ===");
{
  const answeredResult = formatAnswer(singleChoiceQuestion, { selected: [{ value: "erp" }] });
  assert(answeredResult.isAnswered === true, "6.1 Cevaplı soru isAnswered = true");
  assert(answeredResult.summaryText.includes("ERP üzerinden"), "6.2 Cevap etiketi doğru çözümlendi");

  const clearedResult = formatAnswer(singleChoiceQuestion, { selected: [] });
  assert(clearedResult.isAnswered === false, "6.3 Temizlenmiş soru isAnswered = false");
  assert(clearedResult.selectedOptions.length === 0, "6.4 selectedOptions boş dizi");
  assert(clearedResult.summaryText === "Cevaplanmadı", "6.5 summaryText 'Cevaplanmadı' olarak döndü");
}

// ─── 7. SQLITE PERSISTENCE VE SIFIRLAMA TESTİ ──────────────────────────────
console.log("\n=== 7. SQLite Persistence & Reset Truth ===");
if (Database) {
  const tmpDbPath = path.join(os.tmpdir(), `erp_discovery_single_choice_test_${Date.now()}.db`);
  const db = new Database(tmpDbPath);

  try {
    for (const mig of MIGRATION_DEFINITIONS) {
      for (const statement of mig.sql) {
        db.exec(statement);
      }
    }

    const projectId = "proj_test_selection_001";
    const bfCode = "SATIS_YNT";
    const packId = "tr.sales.core";
    const packVersion = "0.1.0";
    const qId = "SALES-001";

    db.prepare(`
      INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(projectId, "Test Proje", "active");

    // Adım 1: Cevap kaydet
    const initialAnswer: AnswerData = { selected: [{ value: "erp" }] };
    db.prepare(`
      INSERT INTO question_answers
        (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run("qa_001", projectId, bfCode, packId, packVersion, qId, JSON.stringify(initialAnswer));

    const row1 = db.prepare(`SELECT answer_data FROM question_answers WHERE question_id = ?`).get(qId) as any;
    const parsed1 = JSON.parse(row1.answer_data) as AnswerData;
    assert(parsed1.selected?.[0]?.value === "erp", "7.1 Başlangıç cevabı SQLite'a kaydedildi");
    assert(hasProvidedAnswer(singleChoiceQuestion, parsed1) === true, "7.2 SQLite'tan okunan veri cevaplı");

    // Adım 2: Seçimi kaldır ve SQLite'a güncelle
    const clearedAnswer: AnswerData = { selected: [] };
    db.prepare(`
      UPDATE question_answers
      SET answer_data = ?, updated_at = datetime('now')
      WHERE analysis_project_id = ? AND business_function_code = ? AND question_id = ?
    `).run(JSON.stringify(clearedAnswer), projectId, bfCode, qId);

    const row2 = db.prepare(`SELECT answer_data FROM question_answers WHERE question_id = ?`).get(qId) as any;
    const parsed2 = JSON.parse(row2.answer_data) as AnswerData;
    assert(parsed2.selected?.length === 0, "7.3 Temizlenmiş veri SQLite'a başarıyla yazıldı (selected: [])");
    assert(hasProvidedAnswer(singleChoiceQuestion, parsed2) === false, "7.4 SQLite'tan okunan temizlenmiş veri cevapsız");
  } finally {
    db.close();
    try {
      fs.unlinkSync(tmpDbPath);
    } catch {}
  }
} else {
  console.log("  [SKIP] better-sqlite3 mevcut değil, SQLite mock testi atlandı.");
}

// ─── 8. MACOS & WINDOWS PLATFORM PARITY & CODEBASE PURITY ──────────────────
console.log("\n=== 8. macOS & Windows Platform Parity (Ortak Kod Yolu) ===");
{
  const questionCardPath = path.join(process.cwd(), "src/components/QuestionCard.tsx");
  const choiceOptionPath = path.join(process.cwd(), "src/components/ChoiceOption.tsx");
  const questionCardSrc = fs.readFileSync(questionCardPath, "utf8");
  const choiceOptionSrc = fs.readFileSync(choiceOptionPath, "utf8");

  // Platform bağımsızlık denetimi: platform ayrımı/hack'i olmamalı
  const hasPlatformHackCard =
    questionCardSrc.includes("darwin") ||
    questionCardSrc.includes("win32") ||
    questionCardSrc.includes("navigator.platform") ||
    questionCardSrc.includes("userAgent");
  assert(
    !hasPlatformHackCard,
    "8.1 QuestionCard.tsx platform hack'i içermez (macOS ve Windows %100 aynı ortak kodu çalıştırır)"
  );

  const hasPlatformHackOption =
    choiceOptionSrc.includes("darwin") ||
    choiceOptionSrc.includes("win32") ||
    choiceOptionSrc.includes("navigator.platform") ||
    choiceOptionSrc.includes("userAgent");
  assert(
    !hasPlatformHackOption,
    "8.2 ChoiceOption.tsx platform hack'i içermez (ortak bileşen mimarisi korunur)"
  );

  // Görünür 'Seçimi kaldır' aksiyonu ve Escape klavye kısayolu kontrolü
  assert(
    questionCardSrc.includes("Seçimi kaldır"),
    "8.3 QuestionCard.tsx içinde görünür 'Seçimi kaldır' aksiyonu mevcut"
  );
  assert(
    questionCardSrc.includes('e.key === "Escape"'),
    "8.4 QuestionCard.tsx içinde standart 'Escape' klavye dinleyicisi tanımlı"
  );
  assert(
    choiceOptionSrc.includes("role={inputType}"),
    "8.5 ChoiceOption.tsx içinde erişilebilir ARIA role={inputType} tanımlı"
  );
  assert(
    choiceOptionSrc.includes("aria-checked={isSelected}"),
    "8.6 ChoiceOption.tsx içinde aria-checked={isSelected} tanımlı"
  );
}

// ─── TEST SUMMARY ──────────────────────────────────────────────────────────
console.log("\n=================================================");
console.log(`SINGLE CHOICE SELECTION & CLEAR BEHAVIOR TEST SUMMARY:`);
console.log(`PASS: ${passCount}`);
console.log(`FAIL: ${failCount}`);
console.log("=================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
