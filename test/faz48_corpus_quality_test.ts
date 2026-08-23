// path: /home/selim/projects/erp-crm-discovery/test/faz48_corpus_quality_test.ts
/**
 * ERP CRM Discovery — FAZ-48 Soru Külliyatı Kalite ve Bütünlük Testi
 *
 * Doğrulamalar:
 * 1. 34 Soru Paketinin tamamı (1.492 soru) başarıyla taranır.
 * 2. 0 paket içi ID mükerrerliği, 0 bileşik anahtar çakışması.
 * 3. 0 branching / parent-child koşul hatası.
 * 4. 0 boş seçenek veya mükerrer seçenek değeri.
 * 5. 0 biçim / whitespace hatası.
 * 6. Zorunlu / opsiyonel / branching oranları tutarlıdır.
 */

import { runCorpusAudit } from "../scripts/audit_question_corpus.mjs";

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

async function runCorpusQualityTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-48: Soru Külliyatı Kalite ve Bütünlük Testi");
  console.log("=======================================================\n");

  const audit = runCorpusAudit();

  // 1. Kapsam ve Sayı Doğrulaması
  console.log("--- 1. Külliyat Hacmi ve Kapsam ---");
  assert(audit.totalPacks === 34, `34 kanonik soru paketi taranıyor (Mevcut: ${audit.totalPacks})`);
  assert(audit.totalQuestions === 1492, `1.492 kanonik soru taranıyor (Mevcut: ${audit.totalQuestions})`);
  assert(audit.requiredQuestions === 792, `792 zorunlu soru mevcut (Mevcut: ${audit.requiredQuestions})`);
  assert(audit.optionalQuestions === 700, `700 opsiyonel soru mevcut (Mevcut: ${audit.optionalQuestions})`);
  assert(audit.branchingQuestions === 213, `213 koşullu soru mevcut (Mevcut: ${audit.branchingQuestions})`);

  // 2. Kimlik ve Bileşik Anahtar Bütünlüğü
  console.log("\n--- 2. Kimlik ve Anahtar Bütünlüğü ---");
  assert(audit.inPackIdDuplicates.length === 0, `0 paket içi ID mükerrerliği (Mevcut: ${audit.inPackIdDuplicates.length})`);
  assert(audit.compositeKeyDuplicates.length === 0, `0 bileşik anahtar çakışması (Mevcut: ${audit.compositeKeyDuplicates.length})`);

  // 3. Branching / Koşul Bütünlüğü
  console.log("\n--- 3. Koşul ve Branching Bütünlüğü ---");
  assert(audit.branchingErrors.length === 0, `0 branching / parent-child hatası (Mevcut: ${audit.branchingErrors.length})`);

  // 4. Seçenek ve Metin Kalitesi
  console.log("\n--- 4. Seçenek ve Metin Biçim Kalitesi ---");
  assert(audit.duplicateOptions.length === 0, `0 mükerrer seçenek değeri (Mevcut: ${audit.duplicateOptions.length})`);
  assert(audit.emptyOptions.length === 0, `0 boş seçenek (Mevcut: ${audit.emptyOptions.length})`);
  assert(audit.formattingIssues.length === 0, `0 biçim / whitespace hatası (Mevcut: ${audit.formattingIssues.length})`);
  assert(audit.exactDuplicates.length === 0, `0 paket içi metin kopyası (Mevcut: ${audit.exactDuplicates.length})`);

  console.log(`\nFAZ-48 Corpus Quality Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runCorpusQualityTests().catch((err) => {
  console.error("Corpus Quality Test Error:", err);
  process.exit(1);
});
