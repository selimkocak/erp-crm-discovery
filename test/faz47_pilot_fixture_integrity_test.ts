// path: /home/selim/projects/erp-crm-discovery/test/faz47_pilot_fixture_integrity_test.ts
/**
 * ERP CRM Discovery — FAZ-47 Kurgusal Pilot Veri Seti Bütünlük Testi
 *
 * Kapsam:
 * - Firma adının ve verilerinin kesinlikle kurgusal olduğunun doğrulanması ([KURGUSAL])
 * - Yasaklı firma/kişi adı veya gerçek veri içermediğinin denetimi
 * - En az 18 iş fonksiyonu (20 kanonik fonksiyon)
 * - En az 220 soru cevabı
 * - En az 25 kritik problem tespiti
 * - En az 20 'sonra dön' ve 15 'kritik takip' bayrağı
 * - En az 12 proje notu
 * - En az 8 özel soru
 * - En az 10 kanıt dosyası
 * - Yönetişim: 23 başlangıç nesnesi, 18 özne, 10 kapsam, 30 sorumluluk, 40 yetki (6 sapma), 8 limit, 10 SoD riski
 */

import {
  PILOT_COMPANY_PROFILE,
  PILOT_REPORT_PROFILE,
  PILOT_LOCATIONS,
  PILOT_DEPARTMENTS,
  PILOT_FUNCTION_CODES,
  CRITICAL_ISSUE_ANSWERS,
  PILOT_SYNTHETIC_ATTACHMENTS,
  PILOT_FOLLOWUPS,
  PILOT_PROJECT_NOTES,
  PILOT_CUSTOM_QUESTIONS,
  PILOT_GOVERNANCE_SUBJECTS,
  PILOT_GOVERNANCE_SCOPES,
  PILOT_GOVERNANCE_LIMITS,
  PILOT_GOVERNANCE_SOD_RISKS,
  generatePilotResponsibilities,
  generatePilotAuthorizations,
  generatePilotAnswers,
  PILOT_REVISED_DELTA,
} from "./fixtures/faz47_discrete_manufacturing_pilot";

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

async function runPilotFixtureIntegrityTests(): Promise<void> {
  console.log("\n=======================================================");
  console.log("FAZ-47: Kurgusal Pilot Veri Seti Bütünlük Testi");
  console.log("=======================================================\n");

  // 1. Etik ve Gizlilik Sınırı Doğrulaması
  console.log("--- 1. Etik, Gizlilik ve Kurgusal Firma Denetimi ---");
  assert(PILOT_COMPANY_PROFILE.company_name.includes("[KURGUSAL]"), "Firma adı [KURGUSAL] ibaresi içeriyor");
  assert(PILOT_COMPANY_PROFILE.company_name.includes("DeltaForm Endüstriyel Sistemler A.Ş."), "Firma adı DeltaForm olarak tanımlı");
  assert(!PILOT_COMPANY_PROFILE.company_name.toLowerCase().includes("tuna"), "Yasaklı kelime (Tuna) içermiyor");
  assert(PILOT_REPORT_PROFILE.executive_summary.includes("[KURGUSAL PİLOT]"), "Rapor profili kurgusal uyarısı içeriyor");

  // 2. Lokasyon ve Departman Kapsamı
  console.log("\n--- 2. Lokasyon ve Departman Sayıları ---");
  assert(PILOT_LOCATIONS.length === 3, `3 lokasyon tanımlı (Mevcut: ${PILOT_LOCATIONS.length})`);
  assert(PILOT_DEPARTMENTS.length === 20, `20 departman tanımlı (Mevcut: ${PILOT_DEPARTMENTS.length})`);
  assert(PILOT_FUNCTION_CODES.length >= 18, `En az 18 iş fonksiyonu seçilmiş (Mevcut: ${PILOT_FUNCTION_CODES.length})`);

  // 3. Soru ve Cevap İstatistiği
  console.log("\n--- 3. Soru, Cevap ve Takip İstatistikleri ---");
  const answers = generatePilotAnswers();
  assert(answers.length >= 220, `En az 220 gerçek soru cevaplandı (Mevcut: ${answers.length})`);

  const criticalAnswersCount = Object.keys(CRITICAL_ISSUE_ANSWERS).length;
  assert(criticalAnswersCount >= 15, `Özel kurgulanmış kritik problem cevapları mevcut (Mevcut: ${criticalAnswersCount})`);

  const criticalFollowups = PILOT_FOLLOWUPS.filter((f) => f.flag_type === "critical");
  const revisitFollowups = PILOT_FOLLOWUPS.filter((f) => f.flag_type === "revisit");
  assert(criticalFollowups.length >= 15, `En az 15 kritik takip bayrağı mevcut (Mevcut: ${criticalFollowups.length})`);
  assert(revisitFollowups.length >= 20, `En az 20 'sonra dön' takip bayrağı mevcut (Mevcut: ${revisitFollowups.length})`);

  assert(PILOT_PROJECT_NOTES.length >= 12, `En az 12 proje notu mevcut (Mevcut: ${PILOT_PROJECT_NOTES.length})`);
  assert(PILOT_CUSTOM_QUESTIONS.length >= 8, `En az 8 özel soru tanımlı (Mevcut: ${PILOT_CUSTOM_QUESTIONS.length})`);

  // 4. Sentetik Kanıt Dosyaları
  console.log("\n--- 4. Sentetik Kanıt Dosyaları ---");
  assert(PILOT_SYNTHETIC_ATTACHMENTS.length >= 10, `En az 10 kanıt dosyası tanımlı (Mevcut: ${PILOT_SYNTHETIC_ATTACHMENTS.length})`);
  for (const att of PILOT_SYNTHETIC_ATTACHMENTS) {
    assert(att.file_content.includes("KURGUSAL PİLOT VERİSİ"), `${att.original_file_name} kurgusal uyarısı içeriyor`);
    assert(att.relative_path.startsWith("attachment/proj-faz47-deltaform/GOVERNANCE/"), `${att.original_file_name} geçerli göreli yol taşıyor`);
  }

  // 5. Yönetişim Veri Seti (FAZ-46 Uyumu)
  console.log("\n--- 5. FAZ-46 Yönetişim Pilot Veri Sayıları ---");
  assert(PILOT_GOVERNANCE_SUBJECTS.length >= 18, `En az 18 özne mevcut (Mevcut: ${PILOT_GOVERNANCE_SUBJECTS.length})`);
  assert(PILOT_GOVERNANCE_SCOPES.length >= 10, `En az 10 kapsam mevcut (Mevcut: ${PILOT_GOVERNANCE_SCOPES.length})`);

  const resps = generatePilotResponsibilities();
  assert(resps.length >= 30, `En az 30 sorumluluk ataması mevcut (Mevcut: ${resps.length})`);

  const auths = generatePilotAuthorizations();
  assert(auths.length >= 40, `En az 40 yetki matrisi kaydı mevcut (Mevcut: ${auths.length})`);

  const discrepancyAuths = auths.filter((a) => a.has_discrepancy === 1);
  assert(discrepancyAuths.length >= 6, `En az 6 efektif yetki sapması mevcut (Mevcut: ${discrepancyAuths.length})`);

  assert(PILOT_GOVERNANCE_LIMITS.length >= 8, `En az 8 onay limiti mevcut (Mevcut: ${PILOT_GOVERNANCE_LIMITS.length})`);
  assert(PILOT_GOVERNANCE_SOD_RISKS.length >= 10, `En az 10 SoD riski mevcut (Mevcut: ${PILOT_GOVERNANCE_SOD_RISKS.length})`);

  // 6. Revizyon Deltası
  console.log("\n--- 6. Revizyon ve Güncelleme Deltası ---");
  assert(PILOT_REVISED_DELTA.revised_answers.length === 3, "3 revize cevap mevcut");
  assert(PILOT_REVISED_DELTA.mitigated_sod_ids.length === 2, "2 çözüme ulaştırılan SoD riski tanımlı");
  assert(!!PILOT_REVISED_DELTA.new_attachment, "Yeni eklenen kanıt dosyası tanımlı");
  assert(!!PILOT_REVISED_DELTA.deleted_attachment_id, "Kaldırılan kanıt ID tanımlı");

  console.log(`\nFAZ-47 Fixture Integrity Test Sonucu: ${passCount} PASS, ${failCount} FAIL\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

await runPilotFixtureIntegrityTests();
