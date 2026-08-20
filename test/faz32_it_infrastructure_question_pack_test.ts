/**
 * ERP CRM Discovery — FAZ-32: BT ALTYAPISI VE BİLGİ TEKNOLOJİLERİ / IT_INFRASTRUCTURE Acceptance Tests
 *
 * 14 Test Alanı:
 * 1. Pack Loading & Metadata Integrity (INFORMATION_TECHNOLOGY canonical code, pack_id: tr.it_infrastructure.core, v0.1.0)
 * 2. Validator Engine Check (0 schema errors)
 * 3. Question Quantity & IDs (47 questions, ITI-001..ITI-047 deterministic)
 * 4. Required Question Count (25 required, 22 optional)
 * 5. Choice Options & is_other Validation
 * 6. 25 Canonical Process Coverage (A'dan Y'ye 25 süreç)
 * 7. Branching Engine Resolution (6 Koşullu Dallanma Noktası)
 * 8. Progress Calculation & Follow-up Deduction (25 required, QuestionFollowup bayrak etkisi)
 * 9. Cross-Pack Duplication Audit (Tüm 22 modülle 0 mükerrerlik)
 * 10. Custom Questions Adapter Compatibility
 * 11. ReportModel & Formatting Truth
 * 12 & 13. DOCX & PDF Generation & Integrity
 * 14. Loader Registry Parity
 */

import { readFileSync } from "fs";
import path from "path";
import { validateQuestionPack } from "../src/engine/validator";
import { getVisibleQuestions } from "../src/engine/branching";
import { calculateProgress } from "../src/engine/progress";
import { adaptCustomQuestionToQuestion } from "../src/engine/customQuestionAdapter";
import { formatAnswer } from "../src/report/formatters";
import { getPackIdForFunction } from "../src/engine/loader";
import { buildDocxBuffer } from "../src/export/docxExporter";
import { buildPdfBuffer } from "../src/export/pdfExporter";
import { PDFParse } from "pdf-parse";
import type { QuestionPack, AnswerData } from "../src/engine/types";
import type { ReportModel } from "../src/report/types";
import type { QuestionFollowup } from "../src/types";

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

console.log("\n══════════════════════════════════════════════════════");
console.log("FAZ-32: BT ALTYAPISI VE BİLGİ TEKNOLOJİLERİ / IT_INFRASTRUCTURE TEST");
console.log("══════════════════════════════════════════════════════\n");

// ─── TEST 1: Pack Loading & Metadata Integrity ───────────────────────────────
console.log("=== T01: Pack Loading & Metadata Integrity ===");
const packPath = path.resolve("question-packs/tr/it_infrastructure/core.json");
const raw = readFileSync(packPath, "utf-8");
const pack = JSON.parse(raw) as QuestionPack;

assert(!!pack, "IT_INFRASTRUCTURE pack JSON başarıyla okundu");
assert(pack.meta?.pack_id === "tr.it_infrastructure.core", "pack_id = tr.it_infrastructure.core");
assert(pack.meta?.version === "0.1.0", "version = 0.1.0");
assert(pack.meta?.schema_version === "1", "schema_version = 1");
assert(pack.meta?.language === "tr", "language = tr");
assert(pack.meta?.business_function_code === "INFORMATION_TECHNOLOGY", "business_function_code = INFORMATION_TECHNOLOGY (Kanonik Kod)");
assert(pack.meta?.name === "BT Altyapısı ve Bilgi Teknolojileri Ön Analizi", `name = ${pack.meta?.name}`);
assert((pack.meta?.description?.length ?? 0) > 50, "description tanımlı ve yeterli uzunlukta");

// ─── TEST 2: Validator Engine Check ──────────────────────────────────────────
console.log("\n=== T02: Validator Engine Check ===");
const validation = validateQuestionPack(pack);
if (!validation.valid) {
  console.error("Doğrulama hataları:", (validation as any).errors);
}
assert(validation.valid, "validateQuestionPack(itInfrastructurePack) 0 hata ile geçerli döndü");

// ─── TEST 3: Question Quantity & IDs ─────────────────────────────────────────
console.log("\n=== T03: Question Quantity & IDs ===");
assert(pack.questions.length === 47, `Toplam soru sayısı tam 47 adet (${pack.questions.length})`);

const ids = pack.questions.map((q) => q.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === 47, "Tüm 47 soru ID'si benzersizdir");

let sequential = true;
for (let i = 1; i <= 47; i++) {
  const expectedId = `ITI-${String(i).padStart(3, "0")}`;
  if (ids[i - 1] !== expectedId) { sequential = false; break; }
}
assert(sequential, "Tüm sorular ITI-001'den ITI-047'ye sıralı ve deterministiktir");

// ─── TEST 4: Required Question Count ─────────────────────────────────────────
console.log("\n=== T04: Required Question Count ===");
const requiredQuestions = pack.questions.filter((q) => q.required);
const optionalQuestions = pack.questions.filter((q) => !q.required);
assert(requiredQuestions.length === 25, `Zorunlu soru sayısı tam 25 adettir (${requiredQuestions.length})`);
assert(optionalQuestions.length === 22, `Opsiyonel soru sayısı tam 22 adettir (${optionalQuestions.length})`);

// ─── TEST 5: Choice Options & is_other Validation ────────────────────────────
console.log("\n=== T05: Choice Options & is_other Validation ===");
let allOptionsValid = true;
let otherRuleValid = true;
for (const q of pack.questions) {
  if (q.options) {
    const optValues = q.options.map((o) => o.value);
    const uniqueValues = new Set(optValues);
    if (optValues.length !== uniqueValues.size) allOptionsValid = false;
    const otherOpts = q.options.filter((o) => o.is_other);
    if (otherOpts.length > 1) otherRuleValid = false;
    for (const otherOpt of otherOpts) { if (!otherOpt.allow_note) otherRuleValid = false; }
  }
}
assert(allOptionsValid, "Tüm seçenek değerleri benzersiz ve en fazla 1 'Diğer' seçeneği içeriyor");
assert(otherRuleValid, "Tüm is_other=true seçeneklerinde allow_note=true kuralı sağlanıyor");

// ─── TEST 6: 25 Canonical Process Coverage ───────────────────────────────────
console.log("\n=== T06: 25 Canonical Process Coverage ===");
const processes = new Set(pack.questions.map((q) => q.process));
assert(processes.size === 25, `Tam 25 farklı süreç grubu tanımlı (${processes.size})`);
const expectedProcesses = [
  "BT Organizasyonu ve Sorumluluklar",
  "Kullanıcı ve Cihaz Envanteri",
  "Sunucu Altyapısı",
  "İstemci Bilgisayar Altyapısı",
  "Sanallaştırma ve Konteyner Kullanımı",
  "İşletim Sistemi ve Platformlar",
  "Veritabanı Altyapısı",
  "Ağ Topolojisi ve Segmentasyon",
  "İnternet, WAN ve Şube Bağlantıları",
  "VPN ve Uzak Erişim",
  "Firewall ve Ağ Güvenliği",
  "Kablosuz Ağ ve Mobil Erişim",
  "Kimlik, Kullanıcı ve Yetki Yönetimi",
  "Active Directory / LDAP / SSO",
  "Yedekleme Yönetimi",
  "Felaket Kurtarma ve İş Sürekliliği",
  "İzleme, Alarm ve Log Yönetimi",
  "Siber Güvenlik ve Zararlı Yazılım Koruması",
  "Fiziksel Veri Merkezi ve Enerji",
  "Lisans, Bakım ve Tedarikçi Yönetimi",
  "ERP/CRM Teknik Ortam Hazırlığı",
  "Entegrasyon ve API Altyapısı",
  "E-posta, Dosya ve Ortak Çalışma Servisleri",
  "BT Destek, Olay ve Değişiklik Yönetimi",
  "BT Riskleri, Teknik Borç ve Yol Haritası",
];
for (const proc of expectedProcesses) {
  assert(processes.has(proc), `Süreç mevcut: "${proc}"`);
}

// ─── TEST 7: Branching Engine Resolution ─────────────────────────────────────
console.log("\n=== T07: Branching Engine Resolution ===");
const conditionalQuestions = pack.questions.filter((q) => q.condition);
assert(conditionalQuestions.length === 6, `Tam 6 adet koşullu soru tanımlı (${conditionalQuestions.length})`);
for (const cq of conditionalQuestions) {
  assert(ids.includes(cq.condition!.question_id), `Condition referansı geçerli: ${cq.id} -> ${cq.condition!.question_id}`);
}

// Senaryo 1: Kendi sunucu altyapısı yoksa (tamamen bulut SaaS) ITI-007 gizlenmeli
const s1 = new Map<string, AnswerData>();
s1.set("ITI-005", { selected: [{ value: "kendi_fiziksel_veya_sanal_sunucu_altyapisi_yoktur_tamamen_bulut_saas" }] });
const vs1 = getVisibleQuestions(pack.questions, s1);
assert(!vs1.some((q) => q.id === "ITI-007"), "ITI-005=kendi_fiziksel_veya_sanal_sunucu_altyapisi_yoktur_tamamen_bulut_saas iken ITI-007 gizlendi");
s1.set("ITI-005", { selected: [{ value: "tamamen_onpremise_sirket_ici_sistem_odasi_sunuculari" }] });
const vs1b = getVisibleQuestions(pack.questions, s1);
assert(vs1b.some((q) => q.id === "ITI-007"), "ITI-005=on-premise sunucu var iken ITI-007 görünür");

// Senaryo 2: Harici şube veya uzak lokasyon yoksa ITI-017 gizlenmeli
const s2 = new Map<string, AnswerData>();
s2.set("ITI-016", { selected: [{ value: "tek_merkez_ofis_harici_sube_fabrika_veya_uzak_lokasyon_yoktur" }] });
assert(!getVisibleQuestions(pack.questions, s2).some((q) => q.id === "ITI-017"), "ITI-016=tek_merkez_ofis_harici_sube_fabrika_veya_uzak_lokasyon_yoktur iken ITI-017 gizlendi");
s2.set("ITI-016", { selected: [{ value: "evet_birden_fazla_sube_fabrika_veya_uzak_depo_magaza_lokasyonumuz_vardir" }] });
assert(getVisibleQuestions(pack.questions, s2).some((q) => q.id === "ITI-017"), "ITI-016=şube lokasyon var iken ITI-017 görünür");

// Senaryo 3: Active Directory / LDAP kullanılmıyorsa ITI-026 gizlenmeli
const s3 = new Map<string, AnswerData>();
s3.set("ITI-024", { selected: [{ value: "merkezi_dizin_ad_ldap_kullanilmamaktadir_yerel_kullanicilar" }] });
assert(!getVisibleQuestions(pack.questions, s3).some((q) => q.id === "ITI-026"), "ITI-024=merkezi_dizin_ad_ldap_kullanilmamaktadir_yerel_kullanicilar iken ITI-026 gizlendi");
s3.set("ITI-024", { selected: [{ value: "microsoft_active_directory_domain_services_onpremise_kullanilmaktadir" }] });
assert(getVisibleQuestions(pack.questions, s3).some((q) => q.id === "ITI-026"), "ITI-024=AD devrede iken ITI-026 görünür");

// Senaryo 4: Düzenli yedekleme yapılmıyorsa ITI-029 gizlenmeli
const s4 = new Map<string, AnswerData>();
s4.set("ITI-027", { selected: [{ value: "duzenli_otomatik_yedekleme_yapilmamaktadir" }] });
assert(!getVisibleQuestions(pack.questions, s4).some((q) => q.id === "ITI-029"), "ITI-027=duzenli_otomatik_yedekleme_yapilmamaktadir iken ITI-029 gizlendi");
s4.set("ITI-027", { selected: [{ value: "merkezi_otomatik_yedekleme_yazilimi_veeam_commvault_acronis_vb_ile_gunluk" }] });
assert(getVisibleQuestions(pack.questions, s4).some((q) => q.id === "ITI-029"), "ITI-027=otomatik yedekleme aktif iken ITI-029 görünür");

// Senaryo 5: Felaket kurtarma planı yoksa ITI-031 gizlenmeli
const s5 = new Map<string, AnswerData>();
s5.set("ITI-030", { selected: [{ value: "felaket_kurtarma_plani_ve_fkm_bulunmamaktadir" }] });
assert(!getVisibleQuestions(pack.questions, s5).some((q) => q.id === "ITI-031"), "ITI-030=felaket_kurtarma_plani_ve_fkm_bulunmamaktadir iken ITI-031 gizlendi");
s5.set("ITI-030", { selected: [{ value: "yazili_felaket_kurtarma_plani_mevcuttur_hedef_kurtarma_sureleri_rto_rpo_tanimlidir" }] });
assert(getVisibleQuestions(pack.questions, s5).some((q) => q.id === "ITI-031"), "ITI-030=DRP planı var iken ITI-031 görünür");

// Senaryo 6: Dış sistem entegrasyonu yoksa ITI-040 gizlenmeli
const s6 = new Map<string, AnswerData>();
s6.set("ITI-039", { selected: [{ value: "herhangi_bir_dis_sistem_veya_servis_entegrasyonu_bulunmamaktadir" }] });
assert(!getVisibleQuestions(pack.questions, s6).some((q) => q.id === "ITI-040"), "ITI-039=herhangi_bir_dis_sistem_veya_servis_entegrasyonu_bulunmamaktadir iken ITI-040 gizlendi");
s6.set("ITI-039", { selected: [{ value: "e_fatura_e_irsaliye_e_defter_ozel_entegrator_gib_servisleri" }] });
assert(getVisibleQuestions(pack.questions, s6).some((q) => q.id === "ITI-040"), "ITI-039=e-fatura entegrasyonu var iken ITI-040 görünür");

// Senaryo 7: Tüm branching açıkken 47 soru
const sAll = new Map<string, AnswerData>();
sAll.set("ITI-005", { selected: [{ value: "tamamen_onpremise_sirket_ici_sistem_odasi_sunuculari" }] });
sAll.set("ITI-016", { selected: [{ value: "evet_birden_fazla_sube_fabrika_veya_uzak_depo_magaza_lokasyonumuz_vardir" }] });
sAll.set("ITI-024", { selected: [{ value: "microsoft_active_directory_domain_services_onpremise_kullanilmaktadir" }] });
sAll.set("ITI-027", { selected: [{ value: "merkezi_otomatik_yedekleme_yazilimi_veeam_commvault_acronis_vb_ile_gunluk" }] });
sAll.set("ITI-030", { selected: [{ value: "yazili_felaket_kurtarma_plani_mevcuttur_hedef_kurtarma_sureleri_rto_rpo_tanimlidir" }] });
sAll.set("ITI-039", { selected: [{ value: "e_fatura_e_irsaliye_e_defter_ozel_entegrator_gib_servisleri" }] });
const vsAll = getVisibleQuestions(pack.questions, sAll);
assert(vsAll.length === 47, `Tüm branching açıkken 47 soru görünür (${vsAll.length})`);

// Senaryo 8: Tüm branching kapalıyken 41 soru
const sClosed = new Map<string, AnswerData>();
sClosed.set("ITI-005", { selected: [{ value: "kendi_fiziksel_veya_sanal_sunucu_altyapisi_yoktur_tamamen_bulut_saas" }] });
sClosed.set("ITI-016", { selected: [{ value: "tek_merkez_ofis_harici_sube_fabrika_veya_uzak_lokasyon_yoktur" }] });
sClosed.set("ITI-024", { selected: [{ value: "merkezi_dizin_ad_ldap_kullanilmamaktadir_yerel_kullanicilar" }] });
sClosed.set("ITI-027", { selected: [{ value: "duzenli_otomatik_yedekleme_yapilmamaktadir" }] });
sClosed.set("ITI-030", { selected: [{ value: "felaket_kurtarma_plani_ve_fkm_bulunmamaktadir" }] });
sClosed.set("ITI-039", { selected: [{ value: "herhangi_bir_dis_sistem_veya_servis_entegrasyonu_bulunmamaktadir" }] });
const vsClosed = getVisibleQuestions(pack.questions, sClosed);
assert(vsClosed.length === 41, `Tüm branching kapalıyken 41 soru görünür (${vsClosed.length})`);

// ─── TEST 8: Progress Calculation & Follow-up Deduction ──────────────────────
console.log("\n=== T08: Progress Calculation & Follow-up Deduction ===");
const answersAllReq = new Map<string, AnswerData>();
for (const q of requiredQuestions) {
  answersAllReq.set(q.id, { selected: [{ value: q.options![0].value }] });
}
const progressFull = calculateProgress(pack.questions, answersAllReq);
assert(progressFull.percentage === 100, `25 zorunlu soru cevaplanınca ilerleme %100 (${progressFull.answered}/${progressFull.total})`);

const mockFollowups = new Map<string, QuestionFollowup>();
mockFollowups.set("ITI-005", {
  id: "qf_iti_05", analysis_project_id: "p1", business_function_code: "INFORMATION_TECHNOLOGY",
  question_id: "ITI-005", flag_type: "critical",
  note: "Sunucu barındırma modeli yönetim kuruluyla netleştirilecek (Cloud SaaS vs On-Prem).",
  status: "open", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), resolved_at: null,
});
mockFollowups.set("ITI-028", {
  id: "qf_iti_28", analysis_project_id: "p1", business_function_code: "INFORMATION_TECHNOLOGY",
  question_id: "ITI-028", flag_type: "revisit",
  note: "Immutable yedekleme altyapısı için storage üreticisiyle görüşülecek.",
  status: "open", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), resolved_at: null,
});

const progressWithFollowups = calculateProgress(pack.questions, answersAllReq, mockFollowups);
assert(progressWithFollowups.answered === 23, `Bayraklı sorular tamamlanmamış sayıldı (23/25)`);
assert(progressWithFollowups.percentage === Math.round((23 / 25) * 100), `İlerleme dürüstçe %${progressWithFollowups.percentage} hesaplandı`);

// ─── TEST 9: Cross-Pack Duplication Audit ────────────────────────────────────
console.log("\n=== T09: Cross-Pack Duplication Audit ===");
const otherPackPaths = [
  "question-packs/tr/sales/core.json",
  "question-packs/tr/crm/core.json",
  "question-packs/tr/proposals/core.json",
  "question-packs/tr/marketing/core.json",
  "question-packs/tr/quality/core.json",
  "question-packs/tr/production_planning/core.json",
  "question-packs/tr/work_orders/core.json",
  "question-packs/tr/procurement/core.json",
  "question-packs/tr/supplier_management/core.json",
  "question-packs/tr/warehouse/core.json",
  "question-packs/tr/inventory/core.json",
  "question-packs/tr/logistics/core.json",
  "question-packs/tr/accounting/core.json",
  "question-packs/tr/treasury/core.json",
  "question-packs/tr/budget_reporting/core.json",
  "question-packs/tr/reporting_analytics/core.json",
  "question-packs/tr/costing/core.json",
  "question-packs/tr/asset_management/core.json",
  "question-packs/tr/human_resources/core.json",
  "question-packs/tr/payroll/core.json",
  "question-packs/tr/legal_compliance/core.json",
];
const itTexts = pack.questions.map((q) => q.question.toLowerCase().trim());
let crossPackDuplicateCount = 0;
for (const pp of otherPackPaths) {
  try {
    const otherPack = JSON.parse(readFileSync(path.resolve(pp), "utf-8")) as QuestionPack;
    const otherTexts = otherPack.questions.map((q) => q.question.toLowerCase().trim());
    for (const it of itTexts) {
      if (otherTexts.includes(it)) {
        crossPackDuplicateCount++;
        console.error(`  DUPLICATE [${pp}]: "${it}"`);
      }
    }
  } catch { /* dosya yoksa atla */ }
}
assert(crossPackDuplicateCount === 0, `22 diğer modülle çapraz karşılaştırmada 0 tam mükerrer soru (${crossPackDuplicateCount} bulundu)`);

// ─── TEST 10: Custom Questions Adapter Compatibility ──────────────────────────
console.log("\n=== T10: Custom Questions Adapter Compatibility ===");
const mockCustomQ = {
  id: "cq_iti_001", analysis_project_id: "p1", business_function_code: "INFORMATION_TECHNOLOGY",
  process_name: "Firewall ve Ağ Güvenliği",
  question_text: "Şirket merkezinde internet çıkışında yedekli (HA Cluster) firewall donanımı devrede midir?",
  description: "Yüksek erişilebilirlik (HA) modunda çift firewall çalışması.",
  question_type: "single_choice" as const,
  options: [
    { id: "opt_1", custom_question_id: "cq_iti_001", value: "evet_active_passive_ha", label: "Evet, Active-Passive HA Cluster aktiftir", sort_order: 1, is_other: 0, created_at: "" },
    { id: "opt_2", custom_question_id: "cq_iti_001", value: "hayir_tek_firewall", label: "Hayır, tek bir firewall cihazı kullanılmaktadır", sort_order: 2, is_other: 0, created_at: "" },
    { id: "opt_3", custom_question_id: "cq_iti_001", value: "other", label: "Diğer", sort_order: 3, is_other: 1, created_at: "" },
  ],
  is_required: 1, sort_order: 101, is_active: 1,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};
const adaptedQuestion = adaptCustomQuestionToQuestion(mockCustomQ, 48);
assert(adaptedQuestion.id === "cq_iti_001", "Custom question ID eşleşti");
assert(adaptedQuestion.is_custom === true, "is_custom = true");
assert(adaptedQuestion.process === "Firewall ve Ağ Güvenliği", "Process eşleşti");
assert(adaptedQuestion.options?.length === 3, "Seçenekler doğru aktarıldı");

// ─── TEST 11: ReportModel & Formatting Truth ──────────────────────────────────
console.log("\n=== T11: ReportModel & Formatting Truth ===");
const q1 = pack.questions.find((q) => q.id === "ITI-001")!;
const formattedQ1 = formatAnswer(q1, {
  selected: [{ value: "sirket_ici_tam_zamanli_bt_ekibi_ve_sistem_yoneticisi", note: "Şirket bünyesinde 3 sistem ve ağ uzmanı tam zamanlı çalışmaktadır." }],
  general_note: "Yeni ERP projesinde sistem yöneticisi şirket tarafındaki teknik lider olarak görev alacaktır.",
});
assert(
  formattedQ1.summaryText.includes("Şirket içi tam zamanlı BT ekibi ve sistem/ağ yöneticisi mevcuttur"),
  `Kullanıcı dostu label formatlandı (sirket_ici_tam_zamanli... enum'u sızmadı) — ${formattedQ1.summaryText}`
);
assert(formattedQ1.summaryText.includes("Şirket bünyesinde 3 sistem ve ağ uzmanı"), "Seçenek notu formatlandı");
assert(formattedQ1.summaryText.includes("Yeni ERP projesinde sistem yöneticisi"), "Genel not formatlandı");

// ─── TEST 12 & 13: DOCX & PDF Export Compatibility ───────────────────────────
console.log("\n=== T12 & T13: DOCX & PDF Export with IT_INFRASTRUCTURE Data ===");
const mockItReportModel: ReportModel = {
  metadata: {
    title: "ERP / BT Altyapısı ve Bilgi Teknolojileri Keşif Raporu",
    projectName: "Sunucu, Ağ, Güvenlik, Kimlik, Yedekleme ve Teknik Hazırlık Keşfi",
    companyName: "Anadolu Teknoloji ve Üretim A.Ş.",
    generatedAt: "20.08.2026",
    projectStatus: "completed",
    packVersions: { INFORMATION_TECHNOLOGY: "tr.it_infrastructure.core v0.1.0" },
    isComplete: true, progressPercent: 100, requiredAnswered: 25, requiredTotal: 25,
    reportType: "final", draftLabel: "TAM RAPOR — %100",
    projectProgressPercent: 100, completedFunctionCount: 1, selectedFunctionCount: 1, isProjectComplete: true,
  },
  company: {
    companyName: "Anadolu Teknoloji ve Üretim A.Ş.", tradeName: "Anadolu Teknoloji",
    taxNumber: "9876543210", city: "Kocaeli", country: "Türkiye", employeeCount: "450",
    notes: "Şirketin sunucu altyapısı, VMware sanallaştırması, NGFW güvenliği ve yedekleme süreçleri incelendi.",
  },
  profile: {
    analysis_project_id: "p_faz32",
    executive_summary: "VMware vSphere sanallaştırma ortamı ve Microsoft SQL Server veritabanı aktif; yeni ERP için ek RAM ve NVMe disk yatırımı önerilmektedir.",
    overall_assessment: "Active Directory ve SSO entegrasyonu hazır; felaket kurtarma için bulut DR hedeflenmeli.",
    open_topics: "İnternet yedek hattı aboneliği ve depo alanı Wi-Fi roaming optimizasyonu.",
  },
  scope: [{
    code: "INFORMATION_TECHNOLOGY", nameTr: "IT ve Altyapı", nameEn: "IT & Infrastructure",
    category: "Yönetim", departmentName: "Bilgi Teknolojileri Direktörlüğü", responsiblePerson: "Barış Özkan",
    status: "completed", hasPack: true, progressPercentage: 100, answeredCount: 25, totalQuestionCount: 25,
  }],
  businessFunctions: [{
    code: "INFORMATION_TECHNOLOGY", nameTr: "IT ve Altyapı", nameEn: "IT & Infrastructure",
    category: "Yönetim", sortOrder: 29, departmentName: "Bilgi Teknolojileri Direktörlüğü",
    responsiblePerson: "Barış Özkan", status: "completed",
    packId: "tr.it_infrastructure.core", packVersion: "0.1.0",
    progressPercentage: 100, answeredCount: 25, totalQuestionCount: 25,
    processes: [{
      name: "Sunucu Altyapısı", order: 3,
      questions: [{
        id: "ITI-005", order: 5, process: "Sunucu Altyapısı",
        questionText: pack.questions.find((q) => q.id === "ITI-005")!.question,
        answerType: "single_choice", criticality: "critical",
        formattedAnswer: formattedQ1,
        findings: [], requirements: [], risks: [], notes: [],
      }],
    }],
    findings: [], requirements: [], risks: [], notes: [],
  }],
  followups: [], globalFindings: [], globalRequirements: [], globalRisks: [], projectNotes: [],
  summaryStats: {
    totalFunctions: 1, completedFunctions: 1, inProgressFunctions: 0, notStartedFunctions: 0,
    totalFindings: 0, totalRequirements: 0, openRisks: 0, totalRisks: 0, totalNotes: 0,
    answeredQuestions: 25, totalQuestions: 25, openFollowupCount: 0, revisitCount: 0, criticalFollowupCount: 0,
  },
};

// DOCX Testi
const docxBuf = await buildDocxBuffer(mockItReportModel);
assert(docxBuf.length > 5000, `DOCX üretimi başarılı (${docxBuf.length} byte)`);

// PDF Testi
const pdfBuf = await buildPdfBuffer(mockItReportModel);
assert(pdfBuf.length > 10000, `TrueType Unicode PDF üretimi başarılı (${pdfBuf.length} byte)`);

const parser = new PDFParse({ data: pdfBuf });
const parsedData = await parser.getText();
const pdfText = parsedData.text;

assert(pdfText.includes("Altyapı") || pdfText.includes("IT") || pdfText.includes("INFORMATION"), "PDF çıktısında 'Altyapı' veya 'IT' başlığı mevcut");
assert(pdfText.includes("Anadolu Teknoloji"), "PDF çıktısında firma adı mevcut (Türkçe UTF-8 doğru)");

// ─── TEST 14: Loader Registry Parity ─────────────────────────────────────────
console.log("\n=== T14: Loader Registry Parity ===");
const loaderPackId = getPackIdForFunction("INFORMATION_TECHNOLOGY");
assert(loaderPackId === "tr.it_infrastructure.core", `getPackIdForFunction("INFORMATION_TECHNOLOGY") = tr.it_infrastructure.core (${loaderPackId})`);
const legalPackId = getPackIdForFunction("LEGAL_COMPLIANCE");
assert(legalPackId === "tr.legal_compliance.core", `getPackIdForFunction("LEGAL_COMPLIANCE") = tr.legal_compliance.core (önceki kayıt korunuyor)`);
const payrollPackId = getPackIdForFunction("PAYROLL");
assert(payrollPackId === "tr.payroll.core", `getPackIdForFunction("PAYROLL") = tr.payroll.core (önceki kayıt korunuyor)`);
const salesPackId = getPackIdForFunction("SALES");
assert(salesPackId === "tr.sales.core", `getPackIdForFunction("SALES") = tr.sales.core (önceki kayıt korunuyor)`);
const unknownPackId = getPackIdForFunction("UNKNOWN_FUNCTION");
assert(unknownPackId === null, `getPackIdForFunction("UNKNOWN_FUNCTION") = null (bilinmeyen kod null döndürüyor)`);

// ─── SONUÇ ────────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
const total = passCount + failCount;
console.log(`FAZ-32 IT_INFRASTRUCTURE SONUÇ: ${passCount}/${total} PASS`);
if (failCount === 0) {
  console.log("✅ FAZ-32 KABUL: Tüm testler geçti — IT_INFRASTRUCTURE Question Pack mühürlendi.");
} else {
  console.error(`❌ ${failCount} test başarısız — kabul edilemez.`);
}
console.log("══════════════════════════════════════════════════════\n");
if (failCount > 0) { process.exit(1); }
