// path: /home/selim/projects/erp-crm-discovery/test/fixtures/faz47_discrete_manufacturing_pilot.ts
/**
 * ERP CRM Discovery — FAZ-47 Kurgusal Kesikli Üretim Saha Pilotu Fixture
 *
 * [KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VEYA ŞAHIS BİLGİSİ İÇERMEZ]
 * Pilot Şirket: [KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş.
 * Sektör: Endüstriyel ve Ofis Mobilyası Üretimi (Kesikli Üretim / Discrete Manufacturing)
 */

import { DEFAULT_STARTER_GOVERNANCE_OBJECTS } from "../../src/db/governanceClient";

export const PILOT_PROJECT_ID = "proj-faz47-deltaform";

export const PILOT_COMPANY_PROFILE = {
  id: "comp-deltaform-01",
  analysis_project_id: PILOT_PROJECT_ID,
  company_name: "[KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş.",
  trade_name: "DeltaForm Endüstriyel Mobilya San. ve Tic. A.Ş.",
  tax_number: "9999999999",
  city: "Kocaeli",
  country: "Türkiye",
  employee_count: 285,
  business_sector: "Endüstriyel ve Ofis Mobilyası Üretimi (Kesikli Üretim)",
  has_branches: "Evet",
  branch_count: 3,
  notes: "Kocaeli Dilovası Fabrika (Üretim & Merkez Depo), İstanbul Maltepe Satış & Yönetim Ofisi, Bursa Nilüfer Bölge Deposu. Toplam 20 departman.",
};

export const PILOT_REPORT_PROFILE = {
  executive_summary: "[KURGUSAL PİLOT] DeltaForm Endüstriyel Sistemler A.Ş. kesikli üretim ERP/CRM keşif analizi tamamlanmıştır. 20 iş fonksiyonu, 3 lokasyon ve 20 departman taranmıştır. Üretim planlama, ürün ağacı revizyon kontrolü, ana veri yönetimi ve SoD yetki ayrışımı kritik öncelikli alanlar olarak belirlenmiştir.",
  overall_assessment: "Şirketin Make-to-Order (Siparişe Özel) ve Make-to-Stock (Seri Standart) karma üretim modeli mevcuttur. Excel bağımlılığı ve yetki sapmaları operasyonel risk oluşturmaktadır. Canlıya geçiş öncesi veri sahipliği ve SoD risklerinin kapatılması şartıyla sistem CONDITIONAL (Koşullu Onay) statüsündedir.",

  open_topics: "1. 18.500 stok kartındaki mükerrer kayıtların temizlenmesi ve tekil kod standardı\n2. Ürün ağaçlarının (BOM) Ar-Ge ve Kalite ortak onayı olmadan üretime açılmasının engellenmesi\n3. Banka ödeme talimatı ve tedarikçi kartı açma yetkilerinin (SoD) ayrıştırılması\n4. Fabrika ile merkez depo arası fason boya operasyonu izlenebilirliği",
};

export const PILOT_LOCATIONS = [
  { id: "loc-01", name: "Kocaeli Dilovası Fabrika", type: "Fabrika & Merkez Depo", employee_count: 210 },
  { id: "loc-02", name: "İstanbul Maltepe Ofisi", type: "Genel Müdürlük & Satış", employee_count: 55 },
  { id: "loc-03", name: "Bursa Nilüfer Depo", type: "Bölge Dağıtım Deposu", employee_count: 20 },
];

export const PILOT_DEPARTMENTS = [
  "Yönetim Kurulu & Genel Müdürlük",
  "Ar-Ge ve Ürün Geliştirme",
  "Üretim Planlama ve Kontrol (ÜPK)",
  "Metal İşleme ve Kaynak Hattı",
  "Ahşap İşleme ve Ebatlama Hattı",
  "Toz Boya ve Yüzey İşlem (Fason Takip)",
  "Döşeme ve Süngerhane",
  "Son Montaj ve Paketleme",
  "Kalite Güvence ve Giriş/Proses Kontrol",
  "Tedarik Zinciri ve Satın Alma",
  "Hammadde ve Yarı Mamul Depo",
  "Mamul ve Sevkiyat Depo (Kocaeli)",
  "Bursa Bölge Depo ve Aktarma",
  "Yurt İçi Satış ve Proje Satış",
  "İhracat ve Dış Ticaret",
  "Müşteri İlişkileri ve Satış Sonrası Servis",
  "Finans ve Genel Muhasebe",
  "Maliyet Muhasebesi ve Bütçe Kontrol",
  "İnsan Kaynakları ve İdari İşler",
  "Bilgi Teknolojileri ve Dijital Dönüşüm",
];

// 20 Selected Business Function Codes
export const PILOT_FUNCTION_CODES = [
  "STRATEGY",
  "MANAGEMENT",
  "PRODUCTION_PLANNING",
  "WORK_ORDERS",
  "QUALITY",
  "MAINTENANCE",
  "INVENTORY",
  "WAREHOUSE",
  "LOGISTICS",
  "PROCUREMENT",
  "SUPPLIER_MANAGEMENT",
  "SALES",
  "PROPOSALS",
  "CRM",
  "ACCOUNTING",
  "COSTING",
  "TREASURY",
  "HUMAN_RESOURCES",
  "PAYROLL",
  "IT_INFRASTRUCTURE",
];

// ── Deterministic Answers for 20 Functions (15 Hand-Crafted Critical Problems + Procedural Realistic Answers) ──

export const PILOT_CRITICAL_PROBLEM_ANSWERS: Record<string, {
  selected: Array<{ value: string; note?: string }>;
  general_note?: string;
  is_critical: boolean;
}> = {

  // Production Planning: Excel dependence
  "PRP-001": {
    selected: [{ value: "excel_tablolariyla_manuel", note: "Kapasite planlaması ve iş yükü dağıtımı 3 farklı Excel dosyasında elle yürütülüyor. Formül hataları teslimat sarkmalarına yol açıyor." }],
    general_note: "Acilen ERP MRP ve Kapasite Planlama modülüne geçiş gereklidir.",
    is_critical: true,
  },
  // Work Orders: Email BOM revisions
  "WKO-001": {
    selected: [{ value: "e_posta_ve_sozlu_talimat", note: "Reçete ve rota revizyonları Ar-Ge tarafından ustalara WhatsApp/e-posta ile bildiriliyor; eski teknik çizimle üretim riski yaşanıyor." }],
    general_note: "ERP Mühendislik Değişiklik Yönetimi (ECN) iş akışı kurulmalıdır.",
    is_critical: true,
  },
  // Inventory: Duplicate items and lack of standard code
  "INV-001": {
    selected: [{ value: "serbest_metin_mukerrer_kartlar", note: "18.500 aktif stok kartında standart kodlama kuralı eksik; aynı sac levha ve profil farklı adlarla 4 kez açılmış." }],
    general_note: "Canlıya geçiş öncesi ana veri temizliği (Deduplication) şarttır.",
    is_critical: true,
  },
  // Quality: No scrap/rework root cause catalog
  "QLT-001": {
    selected: [{ value: "kagit_formlar_ve_arsiv", note: "Kalite red ve tamir formları atölye panosuna asılıyor; arıza kök neden Pareto analizi yapılamıyor." }],
    general_note: "Kalite kontrol red kodları ERP'de zorunlu alana dönüştürülmelidir.",
    is_critical: true,
  },
  // Maintenance: Reactive breakdown maintenance
  "MNT-001": {
    selected: [{ value: "ariza_olustukca_mudahale", note: "CNC lazer ve abkant tezgahlarda koruyucu bakım takvimi yok; arıza duruşları haftalık 14 saati buluyor." }],
    general_note: "Planlı periyodik bakım modülü canlıya alınmalıdır.",
    is_critical: true,
  },
  // Sales: Unverified delivery promises
  "SAL-001": {
    selected: [{ value: "temsilci_tahmini_termin", note: "Satış temsilcileri üretim planlamaya sormadan müşteriye teslim tarihi veriyor; termin gecikmesi %28 seviyesinde." }],
    general_note: "ERP ATP (Available-to-Promise) ve CTP (Capable-to-Promise) kontrolleri zorunlu kılınmalı.",
    is_critical: true,
  },
  // Proposals: Uncontrolled discount authority
  "PRP-002": {
    selected: [{ value: "manuel_yetkisiz_iskonto", note: "Tekliflerde %25'e varan iskonto tanımları tekil onay mekanizması olmadan temsilci tarafından verilebiliyor." }],
    general_note: "Matrisel iskonto yetki limitleri ERP onay motoruna bağlanmalıdır.",
    is_critical: true,
  },
  // Warehouse: Bursa buffer depot blindspot
  "WRH-001": {
    selected: [{ value: "gun_sonu_toplu_transfer", note: "Bursa bölge deposundaki stok hareketleri gün sonu Excel'den işleniyor; anlık stok görünürlüğü bulunmuyor." }],
    general_note: "El terminali (WMS) online barkod okutma zorunlu hale getirilmeli.",
    is_critical: true,
  },
  // Logistics: Freight cost not allocated to product
  "LOG-001": {
    selected: [{ value: "genel_gider_havuzunda", note: "Proje bazlı şehirlerarası nakliye ve vinç maliyetleri siparişe değil, genel pazarlama giderine yazılıyor." }],
    general_note: "Sipariş karlılık analizi nakliye gideri dağıtılmadığı için yanıltıcı çıkmaktadır.",
    is_critical: true,
  },
  // Procurement: Same person requests and approves
  "PRC-001": {
    selected: [{ value: "tekil_kullanici_tam_yetki", note: "Satın alma uzmanı 50.000 TL'ye kadar hem talebi oluşturup hem siparişi onaylayabiliyor (SoD riski)." }],
    general_note: "Talep ve sipariş onay mercileri kesin olarak ayrılmalıdır.",
    is_critical: true,
  },
  // Supplier: No supplier scorecard
  "SUP-001": {
    selected: [{ value: "subjektif_degerlendirme", note: "Tedarikçi termin ve kalite performans puanlaması yapılmıyor; gecikmeli tedarikçiye sipariş verilmeye devam ediliyor." }],
    general_note: "Tedarikçi puan kartı (Vendor Evaluation) devreye alınmalıdır.",
    is_critical: true,
  },
  // Costing: Estimated standard cost divergence
  "CST-001": {
    selected: [{ value: "tahmini_standart_maliyet", note: "Fiili maliyet ay sonu çıkarılamıyor; yıl sonu genel gider dağıtımıyla tek seferde düzeltiliyor." }],
    general_note: "İş emri bazlı fiili hammadde, işçilik ve genel üretim gideri (GÜG) dağıtımı yapılmalıdır.",
    is_critical: true,
  },
  // IT: Untested restore exercises
  "ITI-001": {
    selected: [{ value: "otomatik_yedek_test_edilmedi", note: "Veritabanı günlük yedekleniyor ancak son 12 aydır geri yükleme (restore) tatbikatı yapılmamış." }],
    general_note: "Felaket kurtarma (DRP) ve RTO/RPO doğrulaması için acil test protokolü oluşturulmalı.",
    is_critical: true,
  },
  // HR/Payroll: PDKS manual transfer
  "PAY-001": {
    selected: [{ value: "excel_uzerinden_aktarim", note: "Turnike PDKS verileri Excel'e alınıp formülle puantaja dönüştürülüyor; fazla mesai hesaplama hataları oluşuyor." }],
    general_note: "PDKS cihazı ile bordro modülü arasında doğrudan entegrasyon sağlanmalıdır.",
    is_critical: true,
  },
  // Treasury: Supervisor password sharing
  "TRS-001": {
    selected: [{ value: "ortak_kullanici_ve_sifre", note: "Banka talimat hazırlama ekranı tek bir süpervizör şifresiyle 3 personel tarafından kullanılıyor." }],
    general_note: "İşlem bazlı kimlik doğrulama ve denetim izi (audit log) bulunmuyor.",
    is_critical: true,
  },
};

export const CRITICAL_ISSUE_ANSWERS = PILOT_CRITICAL_PROBLEM_ANSWERS;

// ── Synthetic Managed Attachments ──

export const PILOT_SYNTHETIC_ATTACHMENTS = [
  {
    id: "att-p01",
    entity_type: "object" as const,
    entity_id: "obj-go_item_master",
    original_file_name: "deltaform_malzeme_kodlama_standardi_taslak.pdf",
    stored_file_name: "deltaform_malzeme_kodlama_standardi_taslak.pdf",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/object/obj-go_item_master/deltaform_malzeme_kodlama_standardi_taslak.pdf",
    mime_type: "application/pdf",
    file_size: 142800,
    file_content: "%PDF-1.4\n1 0 obj\n<< /Title (DeltaForm Malzeme Kodlama Standardı Taslak) >>\nendobj\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\n%%EOF",
    description: "Malzeme kartı açma hiyerarşisi ve teknik çizim eşleştirme taslağı",
  },
  {
    id: "att-p02",
    entity_type: "object" as const,
    entity_id: "obj-go_bom",
    original_file_name: "deltaform_urun_agaci_revizyon_proseduru.pdf",
    stored_file_name: "deltaform_urun_agaci_revizyon_proseduru.pdf",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/object/obj-go_bom/deltaform_urun_agaci_revizyon_proseduru.pdf",
    mime_type: "application/pdf",
    file_size: 98400,
    file_content: "%PDF-1.4\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\nÜrün Ağacı ve Rota Revizyon Kontrol Prosedürü v0.2",
    description: "Ar-Ge, Üretim Planlama ve Kalite ortak revizyon onay akışı",
  },
  {
    id: "att-p03",
    entity_type: "sod_risk" as const,
    entity_id: "sod-p01",
    original_file_name: "deltaform_sod_tedarikci_ve_odeme_analizi.txt",
    stored_file_name: "deltaform_sod_tedarikci_ve_odeme_analizi.txt",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/sod_risk/sod-p01/deltaform_sod_tedarikci_ve_odeme_analizi.txt",
    mime_type: "text/plain",
    file_size: 4250,
    file_content: "[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\nDeltaForm SoD Analiz Notu:\nTedarikçi açma ve ödeme talimatı yetkilerinin ayrıştırılması zorunludur.\nTespit: Muhasebe Müdürü her iki işlemi tek başına yapabilmektedir.",
    description: "Tedarikçi açma ve ödeme hazırlama yetki çatışması denetim notu",
  },
  {
    id: "att-p04",
    entity_type: "limit" as const,
    entity_id: "lim-p01",
    original_file_name: "deltaform_imza_sirkuleri_ve_yetki_limitleri.pdf",
    stored_file_name: "deltaform_imza_sirkuleri_ve_yetki_limitleri.pdf",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/limit/lim-p01/deltaform_imza_sirkuleri_ve_yetki_limitleri.pdf",
    mime_type: "application/pdf",
    file_size: 215000,
    file_content: "%PDF-1.4\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\nDeltaForm 2026 Yönetim Kurulu İmza Sirküleri ve Harcama Limitleri Kararı",
    description: "Yönetim Kurulu onaylı parasal yetki ve harcama limitleri tablosu",
  },
  {
    id: "att-p05",
    entity_type: "object" as const,
    entity_id: "obj-go_quality_record",
    original_file_name: "deltaform_kalite_hata_katalogu.csv",
    stored_file_name: "deltaform_kalite_hata_katalogu.csv",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/object/obj-go_quality_record/deltaform_kalite_hata_katalogu.csv",
    mime_type: "text/csv",
    file_size: 8900,
    file_content: "HataKodu,Kategori,Aciklama,KokNeden\nHK-01,Metal,Capak ve Olcu Sapmasi,Lazer Kesim Ayari\nHK-02,Ahsap,Laminat Kalkmasi,Pres Sicaklik Dusuklugu\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]",
    description: "Kesikli üretim standart kalite red ve yeniden işleme kod listesi",
  },
  {
    id: "att-p06",
    entity_type: "object" as const,
    entity_id: "obj-go_user_auth_admin",
    original_file_name: "deltaform_yedekleme_ve_felaket_kurtarma_plani.json",
    stored_file_name: "deltaform_yedekleme_ve_felaket_kurtarma_plani.json",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/object/obj-go_user_auth_admin/deltaform_yedekleme_ve_felaket_kurtarma_plani.json",
    mime_type: "application/json",
    file_size: 3400,
    file_content: JSON.stringify({
      disclaimer: "[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]",
      backup_frequency: "Daily Full (02:00) + Hourly Log",
      target_rto_hours: 4,
      target_rpo_hours: 1,
      last_restore_test_date: "2025-06-15",
      status: "action_required",
    }, null, 2),
    description: "BT Altyapı yedekleme politikası ve RTO/RPO hedefleri",
  },
  {
    id: "att-p07",
    entity_type: "object" as const,
    entity_id: "obj-go_project_record",
    original_file_name: "deltaform_kesikli_uretim_akis_semasi.pdf",
    stored_file_name: "deltaform_kesikli_uretim_akis_semasi.pdf",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/object/obj-go_project_record/deltaform_kesikli_uretim_akis_semasi.pdf",
    mime_type: "application/pdf",
    file_size: 175000,
    file_content: "%PDF-1.4\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\nMetal → Ahşap → Boya → Döşeme → Final Montaj Akış Şeması",
    description: "Fabrika hat bazlı kesikli üretim ve fason boya iş akışı",
  },
  {
    id: "att-p08",
    entity_type: "responsibility" as const,
    entity_id: "resp-p01",
    original_file_name: "deltaform_ana_veri_yonetim_gorev_tanimi.pdf",
    stored_file_name: "deltaform_ana_veri_yonetim_gorev_tanimi.pdf",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/responsibility/resp-p01/deltaform_ana_veri_yonetim_gorev_tanimi.pdf",
    mime_type: "application/pdf",
    file_size: 82000,
    file_content: "%PDF-1.4\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\nData Owner ve Data Steward Görev & Sorumluluk Çerçevesi",
    description: "Veri Sahipliği ve Veri Sorumlusu rol tanımları dokümanı",
  },
  {
    id: "att-p09",
    entity_type: "authorization" as const,
    entity_id: "auth-p01",
    original_file_name: "deltaform_mevcut_erp_yetki_raporu.csv",
    stored_file_name: "deltaform_mevcut_erp_yetki_raporu.csv",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/authorization/auth-p01/deltaform_mevcut_erp_yetki_raporu.csv",
    mime_type: "text/csv",
    file_size: 15400,
    file_content: "Kullanici,Grup,Nesne,Yetki,Sapma\nahmet.y,SatisGrup,GO_ITEM_MASTER,Full,1\nmehmet.k,MuhasebeGrup,GO_PAYMENT,Full,1\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]",
    description: "Eski sistemden çekilen fiili yetki ve süpervizör kullanım dökümü",
  },
  {
    id: "att-p10",
    entity_type: "sod_risk" as const,
    entity_id: "sod-p02",
    original_file_name: "deltaform_fiyat_ve_iskonto_onay_risk_raporu.pdf",
    stored_file_name: "deltaform_fiyat_ve_iskonto_onay_risk_raporu.pdf",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/sod_risk/sod-p02/deltaform_fiyat_ve_iskonto_onay_risk_raporu.pdf",
    mime_type: "application/pdf",
    file_size: 110000,
    file_content: "%PDF-1.4\n[KURGUSAL PİLOT VERİSİ — GERÇEK KURUM VERİSİ DEĞİLDİR]\nFiyat Değiştirme ve Satış Siparişi Onayı Çatışma Analizi",
    description: "Satış temsilcisinin kendi girdiği siparişe özel fiyat verme riski",
  },
];

// ── Followup Flags (Sonra Dön & Kritik Takip) ──
export const PILOT_FOLLOWUPS = [
  { bf_code: "PRODUCTION_PLANNING", question_id: "PRP-001", flag_type: "critical", note: "Excel kapasite planlaması acilen ERP MRP modülüne aktarılmalı." },
  { bf_code: "WORK_ORDERS", question_id: "WKO-001", flag_type: "critical", note: "E-posta ile ürün ağacı revizyonu yasaklanmalı, ERP ECN/ECO iş akışı kurulmalı." },
  { bf_code: "INVENTORY", question_id: "INV-001", flag_type: "critical", note: "18.500 stok kartı taranıp mükerrer kodlar birleştirilecek." },
  { bf_code: "PROCUREMENT", question_id: "PRC-001", flag_type: "critical", note: "Talep açan ile sipariş onaylayan ayrılmalı (SoD kuralı)." },
  { bf_code: "TREASURY", question_id: "TRS-001", flag_type: "critical", note: "Banka talimatlarında ortak şifre kullanımı iptal edilmeli, bireysel yetki atanmalı." },
  { bf_code: "INFORMATION_TECHNOLOGY", question_id: "ITI-001", flag_type: "critical", note: "Restore tatbikatı yapılmamış; RTO testi için acil tatbikat planı hazırlandı." },
  { bf_code: "COSTING", question_id: "CST-001", flag_type: "critical", note: "Fiili maliyet dağıtım anahtarları muhasebe ile netleştirilecek." },
  { bf_code: "QUALITY", question_id: "QLT-001", flag_type: "critical", note: "Kalite red kod listesi ERP'ye zorunlu alan olarak tanımlanmalı." },
  { bf_code: "MAINTENANCE", question_id: "MNT-001", flag_type: "critical", note: "CNC makineleri için koruyucu bakım takvimi oluşturulacak." },
  { bf_code: "SALES", question_id: "SAL-001", flag_type: "critical", note: "Sipariş teslim taahhüdü verilmeden önce üretim kapasite onayı zorunlu olmalı." },
  { bf_code: "PROPOSALS", question_id: "PRP-002", flag_type: "critical", note: "İskonto yetki baremleri ERP onay akışına bağlanacak." },
  { bf_code: "WAREHOUSE", question_id: "WRH-001", flag_type: "critical", note: "Periyodik çevrimsel (cycle count) sayım sistemine geçilecek." },
  { bf_code: "SUPPLIER_MANAGEMENT", question_id: "SUP-001", flag_type: "critical", note: "Tedarikçi termin ve kalite performans puanlama kartı devreye alınacak." },
  { bf_code: "DOCUMENT_MANAGEMENT", question_id: "DOC-001", flag_type: "critical", note: "Tasarım çizimleri merkezi versiyon kontrollü kasaya alınacak." },
  { bf_code: "PAYROLL", question_id: "PAY-001", flag_type: "critical", note: "PDKS cihazı ile bordro yazılımı arasında doğrudan API entegrasyonu sağlanmalı." },
  // Revisit Flags (Sonra Dön)
  { bf_code: "MANAGEMENT", question_id: "MGT-001", flag_type: "revisit", note: "Yönetim kurulu stratejik hedefleri 2026 Q3 toplantısında teyit edilecek." },
  { bf_code: "STRATEGY", question_id: "STR-001", flag_type: "revisit", note: "İhracat büyüme hedefi için pazar analizi eklenecek." },
  { bf_code: "CRM", question_id: "CRM-001", flag_type: "revisit", note: "Mobil CRM saha uygulaması demosu incelenecek." },
  { bf_code: "LOGISTICS", question_id: "LOG-001", flag_type: "revisit", note: "Bursa deposu için nakliye firması SLA sözleşmesi incelenecek." },
  { bf_code: "ACCOUNTING", question_id: "ACC-001", flag_type: "revisit", note: "E-Defter saklama hizmet sağlayıcısı lisansı gözden geçirilecek." },
  { bf_code: "HUMAN_RESOURCES", question_id: "HR-001", flag_type: "revisit", note: "Beyaz yaka yetkinlik matrisi güncellenecek." },
  { bf_code: "INVENTORY", question_id: "INV-002", flag_type: "revisit", note: "Kritik hammadde emniyet stoku seviyeleri revize edilecek." },
  { bf_code: "WAREHOUSE", question_id: "WRH-002", flag_type: "revisit", note: "Barkodlu raf adresleme donanım maliyeti araştırılacak." },
  { bf_code: "QUALITY", question_id: "QLT-002", flag_type: "revisit", note: "Giriş kalite kontrol laboratuvar test cihazları kalibrasyonu kontrol edilecek." },
  { bf_code: "PRODUCTION_PLANNING", question_id: "PRP-003", flag_type: "revisit", note: "Fason elektrostatik boya kapasite anlaşması incelenecek." },
  { bf_code: "WORK_ORDERS", question_id: "WKO-002", flag_type: "revisit", note: "Döşeme hattı parça başı standart süreleri kronometrajla ölçülecek." },
  { bf_code: "PROCUREMENT", question_id: "PRC-002", flag_type: "revisit", note: "Sac ve profil alımlarında vadeli ödeme opsiyonları karşılaştırılacak." },
  { bf_code: "TREASURY", question_id: "TRS-002", flag_type: "revisit", note: "Dövizli işlemler için kur riski hedge politikası oluşturulacak." },
  { bf_code: "INFORMATION_TECHNOLOGY", question_id: "ITI-002", flag_type: "revisit", note: "Fabrika içi kablosuz ağ (Wi-Fi 6) kapsaması test edilecek." },
  { bf_code: "COSTING", question_id: "CST-002", flag_type: "revisit", note: "Makina amortisman süreleri muhasebe ile teyit edilecek." },
  { bf_code: "PROPOSALS", question_id: "PRP-004", flag_type: "revisit", note: "Özel proje tekliflerinde montaj işçilik payı formülü netleştirilecek." },
  { bf_code: "SALES", question_id: "SAL-002", flag_type: "revisit", note: "Yurt dışı bayi iskonto sözleşmeleri incelenecek." },
  { bf_code: "CRM", question_id: "CRM-002", flag_type: "revisit", note: "Müşteri memnuniyet anketi şablonu hazırlanacak." },
  { bf_code: "SUPPLIER_MANAGEMENT", question_id: "SUP-002", flag_type: "revisit", note: "Sünger ve kumaş tedarikçileri kalite denetim raporları istenecek." },
  { bf_code: "MAINTENANCE", question_id: "MNT-002", flag_type: "revisit", note: "Kritik yedek parça minimum stok listesi fabrika müdürüyle görüşülecek." },
];

// ── Project Notes (12 Items) ──
export const PILOT_PROJECT_NOTES = [
  { business_function_code: "PRODUCTION_PLANNING", note: "Metal bölümünde 3 adet fiber lazer kesim, 4 adet abkant pres bulunuyor. Darboğaz abkant büküm hattında." },
  { business_function_code: "WORK_ORDERS", note: "Ahşap işleme hattında 2 adet CNC ebatlama ve 1 adet otomatik kenar bantlama makinesi mevcut." },
  { business_function_code: "QUALITY", note: "Giriş kontrolde sünger yoğunluk ve kumaş sürtünme testleri harici akredite laboratuvarda yaptırılıyor." },
  { business_function_code: "PROCUREMENT", note: "Ana hammadde (DKP sac ve sunta/MDF) yıllık toplu sözleşmelerle tedarik ediliyor." },
  { business_function_code: "INVENTORY", note: "Aksesuar (kulp, menteşe, ray, vida) kalemlerinde barkodsuz elle sayım yapılmaktadır." },
  { business_function_code: "WAREHOUSE", note: "Bursa deposu Marmara ve Ege sevkiyatları için tampon depo olarak kullanılmaktadır." },
  { business_function_code: "COSTING", note: "Boya operasyonları fason yapıldığı için m2 başına birim fason maliyeti doğrudan iş emrine yansıtılmalı." },
  { business_function_code: "IT_INFRASTRUCTURE", note: "Fabrika ile İstanbul merkez arasında 100 Mbps MPLS VPN hattı aktif çalışmaktadır." },
  { business_function_code: "SALES", note: "Ofis projelerinde ortalama teklif teslim süresi 4 iş günü, üretim teslim süresi 4 haftadır." },
  { business_function_code: "TREASURY", note: "Müşteri tahsilatlarında ortalama vade 90 gün, tedarikçi ödemelerinde 60 gündür." },
  { business_function_code: "HR", note: "Fabrikada 220 mavi yaka, 65 beyaz yaka personel istihdam edilmektedir." },
  { business_function_code: undefined, note: "[GENEL PROJE NOTU] ERP dönüşüm projesi Yönetim Kurulu Başkanı ve Genel Müdür tarafından doğrudan desteklenmektedir." },
];

// ── Custom Questions (8 Items) ──
export const PILOT_CUSTOM_QUESTIONS = [
  {
    id: "cq-delta-01",
    business_function_code: "PRODUCTION_PLANNING",
    process_name: "Fason İşlemler",
    question_text: "Fason elektrostatik toz boya operasyonlarında parça kaybı ve gecikmeler nasıl izlenmektedir?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq01-1", label: "İrsaliye ve Excel üzerinden manuel", sort_order: 1 },
      { id: "opt-cq01-2", label: "ERP fason iş emri ve barkodla", sort_order: 2 },
      { id: "opt-cq01-3", label: "Takip yapılmıyor", sort_order: 3 },
    ],
    selected_option_id: "opt-cq01-1",
    general_note: "Günde 2 kamyon fasona parça gidip gelmektedir.",
  },
  {
    id: "cq-delta-02",
    business_function_code: "INVENTORY",
    process_name: "Hurda ve Fire Yönetimi",
    question_text: "Sac kesim fireleri ve talaş hurdaları sistemde nasıl muhasebeleştirilmektedir?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq02-1", label: "Fire oranı standart reçeteye dahil ediliyor", sort_order: 1 },
      { id: "opt-cq02-2", label: "Fiili hurda tartılarak hurda deposuna aktarılıyor", sort_order: 2 },
      { id: "opt-cq02-3", label: "Kayıt tutulmuyor", sort_order: 3 },
    ],
    selected_option_id: "opt-cq02-2",
    general_note: "Aylık 12 ton sac hurdası lisanslı geri dönüşüm firmasına satılmaktadır.",
  },
  {
    id: "cq-delta-03",
    business_function_code: "QUALITY",
    process_name: "Müşteri Şikayeti ve DÖFİ",
    question_text: "Montaj sonrası müşteri şikayetleri ve düzeltici önleyici faaliyetler (DÖFİ) nasıl yönetiliyor?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq03-1", label: "Kalite yazılımı üzerinde DÖFİ formu açılarak", sort_order: 1 },
      { id: "opt-cq03-2", label: "E-posta ve servis formu ile", sort_order: 2 },
    ],
    selected_option_id: "opt-cq03-2",
    general_note: "Servis ekibi arıza fotoğraflarını WhatsApp grubunda paylaşmaktadır.",
  },
  {
    id: "cq-delta-04",
    business_function_code: "WORK_ORDERS",
    process_name: "CNC Tezgah Entegrasyonu",
    question_text: "CNC tezgahlarından otomatik parça sayımı ve operasyon tamamlama sinyali alınıyor mu?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq04-1", label: "Evet, IoT / PLC entegrasyonu mevcut", sort_order: 1 },
      { id: "opt-cq04-2", label: "Hayır, operatör vardiya sonunda form dolduruyor", sort_order: 2 },
    ],
    selected_option_id: "opt-cq04-2",
    general_note: "Yeni ERP'de tezgahlara dokunmatik panel konulması hedefleniyor.",
  },
  {
    id: "cq-delta-05",
    business_function_code: "PROCUREMENT",
    process_name: "İthal Hammadde Takibi",
    question_text: "İthal edilen mekanizma ve süspansiyon parçalarının akreditif ve navlun maliyetleri maliyete nasıl dağıtılıyor?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq05-1", label: "İthalat dosyası kapatılarak oransal dağıtım yapılıyor", sort_order: 1 },
      { id: "opt-cq05-2", label: "Genel gider olarak kaydediliyor", sort_order: 2 },
    ],
    selected_option_id: "opt-cq05-1",
    general_note: "İthalat harcamaları fatura bazında ayrıştırılabilmektedir.",
  },
  {
    id: "cq-delta-06",
    business_function_code: "SALES",
    process_name: "Özel Proje Çizim Onayı",
    question_text: "Mimar onaylı özel ölçülü ürünlerde çizim onay süreci siparişe nasıl bağlanıyor?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq06-1", label: "Islak imzalı teknik çizim sipariş ekine taranıyor", sort_order: 1 },
      { id: "opt-cq06-2", label: "Sözlü teyit ile üretime alınıyor", sort_order: 2 },
    ],
    selected_option_id: "opt-cq06-1",
    general_note: "Tasarım onaylanmadan üretime başlanması yasaklanmıştır.",
  },
  {
    id: "cq-delta-07",
    business_function_code: "MAINTENANCE",
    process_name: "Kritik Kalıp Yönetimi",
    question_text: "Sac kesme/bükme kalıplarının vuruş sayısı ve bakım ömrü nasıl izleniyor?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq07-1", label: "ERP kalıp kartı ve sayaç ile", sort_order: 1 },
      { id: "opt-cq07-2", label: "Kalıphane ustasının defterinde manuel", sort_order: 2 },
    ],
    selected_option_id: "opt-cq07-2",
    general_note: "Kalıp arızalandığında üretim 2 güne kadar durabilmektedir.",
  },
  {
    id: "cq-delta-08",
    business_function_code: "IT_INFRASTRUCTURE",
    process_name: "Son Kullanıcı Güvenliği",
    question_text: "Şirket bilgisayarlarında USB bellek ve harici disk kullanımı sınırlandırılmış mıdır?",
    question_type: "single_choice",
    options: [
      { id: "opt-cq08-1", label: "Evet, Active Directory / DLP politikası ile kısıtlı", sort_order: 1 },
      { id: "opt-cq08-2", label: "Hayır, tüm USB portları açık", sort_order: 2 },
    ],
    selected_option_id: "opt-cq08-2",
    general_note: "Tasarım dosyalarının dışarı sızma riski mevcuttur.",
  },
];

// ── FAZ-46 Governance Dataset (18 Subjects, 10 Scopes, 30 Resps, 40 Auths, 8 Limits, 10 SoD) ──

export const PILOT_GOVERNANCE_SUBJECTS = [
  // 8 Roles
  { id: "subj-r01", name: "Genel Müdür", subject_type: "role" as const, department_name: "Yönetim", description: "En üst düzey operasyonel yönetici" },
  { id: "subj-r02", name: "Fabrika Müdürü", subject_type: "role" as const, department_name: "Üretim", description: "Üretim ve tesis operasyonları lideri" },
  { id: "subj-r03", name: "Mali İşler Direktörü (CFO)", subject_type: "role" as const, department_name: "Finans & Muhasebe", description: "Finansal yönetim ve raporlama lideri" },
  { id: "subj-r04", name: "Satın Alma Müdürü", subject_type: "role" as const, department_name: "Satın Alma", description: "Tedarik zinciri ve satın alma lideri" },
  { id: "subj-r05", name: "Satış Direktörü", subject_type: "role" as const, department_name: "Satış", description: "Yurt içi ve ihracat satış lideri" },
  { id: "subj-r06", name: "Lojistik ve Depo Müdürü", subject_type: "role" as const, department_name: "Lojistik", description: "Depolama ve sevkiyat lideri" },
  { id: "subj-r07", name: "Kalite Güvence Müdürü", subject_type: "role" as const, department_name: "Kalite", description: "Giriş, proses ve son kontrol lideri" },
  { id: "subj-r08", name: "BT ve Sistem Yöneticisi", subject_type: "role" as const, department_name: "Bilgi Teknolojileri", description: "ERP ve altyapı sistem yöneticisi" },
  // 4 Groups
  { id: "subj-g01", name: "Satış ve Proje Ekibi", subject_type: "group" as const, department_name: "Satış", description: "Tüm satış temsilcileri ve teklif uzmanları" },
  { id: "subj-g02", name: "Muhasebe Uzmanları", subject_type: "group" as const, department_name: "Muhasebe", description: "Genel muhasebe ve faturalama personeli" },
  { id: "subj-g03", name: "Satın Alma Uzmanları", subject_type: "group" as const, department_name: "Satın Alma", description: "Operasyonel satın almacılar" },
  { id: "subj-g04", name: "Depo Sorumluları", subject_type: "group" as const, department_name: "Depo", description: "Mal kabul ve sevkiyat depo personeli" },
  // 6 Synthetic Users (Explicitly Fictional)
  { id: "subj-u01", name: "[Kurgusal] Can Demir", subject_type: "user" as const, department_name: "Satın Alma", description: "Kıdemli Satın Alma Uzmanı" },
  { id: "subj-u02", name: "[Kurgusal] Elif Kaya", subject_type: "user" as const, department_name: "Muhasebe", description: "Muhasebe Şefi" },
  { id: "subj-u03", name: "[Kurgusal] Murat Çelik", subject_type: "user" as const, department_name: "Üretim Planlama", description: "Üretim Planlama Mühendisi" },
  { id: "subj-u04", name: "[Kurgusal] Ayşe Yıldız", subject_type: "user" as const, department_name: "Satış", description: "Kurumsal Satış Temsilcisi" },
  { id: "subj-u05", name: "[Kurgusal] Burak Arslan", subject_type: "user" as const, department_name: "Depo", description: "Kocaeli Depo Şefi" },
  { id: "subj-u06", name: "[Kurgusal] Selin Öztürk", subject_type: "user" as const, department_name: "Kalite", description: "Giriş Kalite Kontrol Teknikeri" },
];

export const PILOT_GOVERNANCE_SCOPES = [
  { id: "scp-01", name: "Tüm DeltaForm Organizasyonu", scope_type: "organization_wide" as const, description: "Şirket geneli tüm birimler" },
  { id: "scp-02", name: "Kocaeli Fabrika Yerleşkesi", scope_type: "branch" as const, parent_scope_id: "scp-01", description: "Ana üretim tesisi" },
  { id: "scp-03", name: "İstanbul Merkez Ofis", scope_type: "branch" as const, parent_scope_id: "scp-01", description: "Yönetim ve satış ofisi" },
  { id: "scp-04", name: "Bursa Bölge Deposu", scope_type: "branch" as const, parent_scope_id: "scp-01", description: "Lojistik aktarma merkezi" },
  { id: "scp-05", name: "Metal Üretim Bölümü", scope_type: "department" as const, parent_scope_id: "scp-02", description: "Lazer, abkant, kaynak ve pres hattı" },
  { id: "scp-06", name: "Ahşap Üretim Bölümü", scope_type: "department" as const, parent_scope_id: "scp-02", description: "Ebatlama, bantlama, CNC freze hattı" },
  { id: "scp-07", name: "Döşeme ve Montaj Bölümü", scope_type: "department" as const, parent_scope_id: "scp-02", description: "Koltuk döşeme ve son montaj" },
  { id: "scp-08", name: "Tedarik Zinciri ve Satın Alma", scope_type: "department" as const, parent_scope_id: "scp-01", description: "Hammadde ve fason tedarik" },
  { id: "scp-09", name: "Finans ve Muhasebe Departmanı", scope_type: "department" as const, parent_scope_id: "scp-01", description: "Mali işler" },
  { id: "scp-10", name: "Özel Proje Satış Ekibi", scope_type: "team" as const, parent_scope_id: "scp-03", description: "Anahtar teslim ofis projeleri" },
];

export const PILOT_GOVERNANCE_LIMITS = [
  { id: "lim-01", object_code: "GO_PURCHASE_ORDER", subject_id: "subj-r04", limit_type: "Satın Alma Sipariş Onayı (Müdür)", currency_or_unit: "TRY", min_value: 0, max_value: 250000, approval_tier: "1. Kademe", approver_subject_id: "subj-r01", state_type: "as_is" as const, notes: "250.000 TL üzeri Genel Müdür onayına gider" },
  { id: "lim-02", object_code: "GO_PURCHASE_ORDER", subject_id: "subj-u01", limit_type: "Satın Alma Sipariş Onayı (Uzman)", currency_or_unit: "TRY", min_value: 0, max_value: 50000, approval_tier: "Operasyonel", approver_subject_id: "subj-r04", state_type: "as_is" as const, notes: "50.000 TL üzeri Satın Alma Müdürü onayına gider" },
  { id: "lim-03", object_code: "GO_SALES_ORDER", subject_id: "subj-r05", limit_type: "Satış İskonto Yetkisi (Direktör)", currency_or_unit: "%", min_value: 0, max_value: 20, approval_tier: "1. Kademe", approver_subject_id: "subj-r01", state_type: "as_is" as const, notes: "%20 üzeri Genel Müdür onayı gerektirir" },
  { id: "lim-04", object_code: "GO_SALES_ORDER", subject_id: "subj-u04", limit_type: "Satış İskonto Yetkisi (Temsilci)", currency_or_unit: "%", min_value: 0, max_value: 8, approval_tier: "Operasyonel", approver_subject_id: "subj-r05", state_type: "as_is" as const, notes: "%8 üzeri Satış Direktörü onayına gider" },
  { id: "lim-05", object_code: "GO_PAYMENT", subject_id: "subj-r03", limit_type: "Banka Ödeme Emri Limiti (CFO)", currency_or_unit: "TRY", min_value: 0, max_value: 1000000, approval_tier: "1. Kademe", approver_subject_id: "subj-r01", state_type: "as_is" as const, notes: "1 Milyon TL üzeri Genel Müdür çift imza gerektirir" },
  { id: "lim-06", object_code: "GO_ITEM_MASTER", subject_id: "subj-r06", limit_type: "Stok Sayım Farkı Düzeltme Limiti", currency_or_unit: "TRY", min_value: 0, max_value: 25000, approval_tier: "1. Kademe", approver_subject_id: "subj-r03", state_type: "as_is" as const, notes: "25.000 TL üzeri farklar CFO onayına gider" },
  { id: "lim-07", object_code: "GO_CUSTOMER_MASTER", subject_id: "subj-r03", limit_type: "Müşteri Açık Hesap Kredi Limiti", currency_or_unit: "TRY", min_value: 0, max_value: 500000, approval_tier: "1. Kademe", approver_subject_id: "subj-r01", state_type: "as_is" as const, notes: "500.000 TL üzeri kredi limiti Yönetim Kurulu onayı gerektirir" },
  { id: "lim-08", object_code: "GO_PRICE_LIST", subject_id: "subj-r05", limit_type: "Fiyat Listesi Güncelleme Yetkisi", currency_or_unit: "TRY", min_value: 0, max_value: 100000, approval_tier: "1. Kademe", approver_subject_id: "subj-r01", state_type: "as_is" as const, notes: "Fiyat listesi Genel Müdür onayı olmadan yayınlanamaz" },
];

export const PILOT_GOVERNANCE_SOD_RISKS = [
  {
    id: "sod-p01",
    object_code: "GO_VENDOR_MASTER",
    subject_id: "subj-u02",
    risk_title: "Tedarikçi Kartı Açma ve Ödeme Emri Hazırlama Çatışması",
    conflicting_duty_a: "Tedarikçi Kartı Tanımlama / Güncelleme",
    conflicting_duty_b: "Banka Ödeme Emri Hazırlama / Onaylama",
    risk_severity: "critical" as const,
    current_control: "Kontrol yok; Muhasebe Şefi her iki işlemi yapabilmektedir.",
    mitigation_action: "ERP'de tedarikçi açma yetkisi Satın Alma/Ana Veri'ye, ödeme hazırlama Finans'a ayrılacaktır.",
    status: "open" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p02",
    object_code: "GO_PURCHASE_ORDER",
    subject_id: "subj-u01",
    risk_title: "Satın Alma Talebi Oluşturma ve Sipariş Onaylama Çatışması",
    conflicting_duty_a: "Satın Alma Talebi Girişi",
    conflicting_duty_b: "Satın Alma Siparişi Onayı",
    risk_severity: "critical" as const,
    current_control: "50.000 TL altına kadar uzman kendi talebini onaylayabilmektedir.",
    mitigation_action: "Talep oluşturan personel kendi siparişini onaylayamaz (4-göz kuralı).",
    status: "open" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p03",
    object_code: "GO_CUSTOMER_MASTER",
    subject_id: "subj-u04",
    risk_title: "Müşteri Kartı Açma ve Kredi Limiti Belirleme Çatışması",
    conflicting_duty_a: "Müşteri Kartı Tanımlama",
    conflicting_duty_b: "Kredi Limiti ve Vade Tanımlama",
    risk_severity: "high" as const,
    current_control: "Satış temsilcisi müşteri açarken vade ve limit girebiliyor.",
    mitigation_action: "Kredi limiti ve açık hesap vadesi yalnız Finans Direktörü tarafından girilebilir.",
    status: "open" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p04",
    object_code: "GO_PRICE_LIST",
    subject_id: "subj-u04",
    risk_title: "Fiyat Değiştirme ve Satış Siparişi Onaylama Çatışması",
    conflicting_duty_a: "Ürün Fiyat Listesi Değiştirme",
    conflicting_duty_b: "Satış Siparişi Oluşturma ve Onaylama",
    risk_severity: "high" as const,
    current_control: "Fiyat listesi Excel'den aktarılırken kontrol edilmiyor.",
    mitigation_action: "Fiyat listesi yönetimi Satış Direktörlüğü ve CFO onayına bağlanacaktır.",
    status: "in_review" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p05",
    object_code: "GO_ITEM_MASTER",
    subject_id: "subj-u05",
    risk_title: "Stok Düzeltme Fişi Girişi ve Sayım Onaylama Çatışması",
    conflicting_duty_a: "Depo Sayım Farkı Fişi Girişi",
    conflicting_duty_b: "Stok Sayım Onayı ve Muhasebe Mahsubu",
    risk_severity: "high" as const,
    current_control: "Depo şefi sayım eksiğini kendi kullanıcısıyla silebilmektedir.",
    mitigation_action: "Sayım fark fişleri Mali İşler ve Fabrika Müdürü onayından geçmelidir.",
    status: "open" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p06",
    object_code: "GO_GL_JOURNAL",
    subject_id: "subj-u02",
    risk_title: "Yevmiye Fişi Girişi ve Kesinleştirme Çatışması",
    conflicting_duty_a: "Muhasebe Yevmiye Fişi Düzenleme",
    conflicting_duty_b: "Yevmiye Fişi Onaylama ve Yevmiye Defterine Basma",
    risk_severity: "medium" as const,
    current_control: "Tek aşamalı onay mevcut.",
    mitigation_action: "Hazırlayan ve onaylayan iki ayrı kullanıcı olacaktır.",
    status: "mitigated" as const,
    state_type: "to_be" as const,
  },
  {
    id: "sod-p07",
    object_code: "GO_USER_AUTH_ADMIN",
    subject_id: "subj-r08",
    risk_title: "Kullanıcı Açma ve Kendi Yetkilerini Yükseltme Çatışması",
    conflicting_duty_a: "ERP Kullanıcı Tanımlama",
    conflicting_duty_b: "Rol ve Yetki Grubu Atama",
    risk_severity: "critical" as const,
    current_control: "BT yöneticisi tek başına yetki tanımlayabiliyor.",
    mitigation_action: "Yetki değişiklikleri İK ve Departman Müdürü yazılı onayı ile loglanarak yapılacaktır.",
    status: "in_review" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p08",
    object_code: "GO_PAYROLL",
    subject_id: "subj-r03",
    risk_title: "Bordro Hesaplama ve Banka Ödeme Onayı Çatışması",
    conflicting_duty_a: "Bordro Tahakkuku ve Kesinti Girişi",
    conflicting_duty_b: "Banka Maaş Dosyası Gönderim Onayı",
    risk_severity: "high" as const,
    current_control: "İK Müdürü ve Mali İşler çift imza uyguluyor.",
    mitigation_action: "Mevcut çift imza kontrolü ERP üzerinde sistem onayına dönüştürülecektir.",
    status: "mitigated" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p09",
    object_code: "GO_SALES_ORDER",
    subject_id: "subj-g01",
    risk_title: "Müşteri İade Girişi ve İade Fatura/Alacak Dekontu Onayı",
    conflicting_duty_a: "İade Kabul Fişi Oluşturma",
    conflicting_duty_b: "İade Faturası / Alacak Dekontu Onaylama",
    risk_severity: "medium" as const,
    current_control: "Depo kabulü olmadan satış iade faturası kesebiliyor.",
    mitigation_action: "Depo fiziki iade kabul fişi olmadan muhasebe iade faturası işleyemez kuralı konulacaktır.",
    status: "open" as const,
    state_type: "as_is" as const,
  },
  {
    id: "sod-p10",
    object_code: "GO_BOM",
    subject_id: "subj-u03",
    risk_title: "Ürün Ağacı Değiştirme ve Revizyon Onayı Çatışması",
    conflicting_duty_a: "Reçete (BOM) Malzeme Ekleme/Çıkarma",
    conflicting_duty_b: "Ürün Ağacı Revizyonunu Üretime Açma Onayı",
    risk_severity: "high" as const,
    current_control: "Planlama mühendisi reçeteyi tek başına değiştirebiliyor.",
    mitigation_action: "Ar-Ge ve Maliyet Muhasebesi ortak onayı olmadan reçete statüsü 'Aktif' yapılamaz.",
    status: "open" as const,
    state_type: "as_is" as const,
  },
];

// ── 30 Responsibility Assignments Generator ──
export function generatePilotResponsibilities(): Array<{
  id: string;
  governance_object_id: string;
  subject_id: string;
  scope_id?: string;
  responsibility_type: "data_owner" | "data_steward" | "technical_custodian" | "approver" | "consumer";
  state_type: "as_is" | "to_be";
  notes?: string;
}> {
  return [
    // As-Is Assignments (15 items)
    { id: "resp-01", governance_object_id: "obj-go_item_master", subject_id: "subj-r06", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "as_is", notes: "Lojistik Müdürü malzeme kodlama kuralından sorumlu" },
    { id: "resp-02", governance_object_id: "obj-go_item_master", subject_id: "subj-u01", scope_id: "scp-02", responsibility_type: "data_steward", state_type: "as_is", notes: "Satın alma uzmanı kartları açıyor" },
    { id: "resp-03", governance_object_id: "obj-go_item_master", subject_id: "subj-r08", scope_id: "scp-01", responsibility_type: "technical_custodian", state_type: "as_is", notes: "BT ERP veritabanı yedeğinden sorumlu" },
    { id: "resp-04", governance_object_id: "obj-go_customer_master", subject_id: "subj-r05", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "as_is", notes: "Satış Direktörü cari kart standardından sorumlu" },
    { id: "resp-05", governance_object_id: "obj-go_customer_master", subject_id: "subj-u04", scope_id: "scp-03", responsibility_type: "data_steward", state_type: "as_is", notes: "Satış temsilcisi müşteri bilgilerini giriyor" },
    { id: "resp-06", governance_object_id: "obj-go_vendor_master", subject_id: "subj-r04", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "as_is", notes: "Satın Alma Müdürü tedarikçi onayından sorumlu" },
    { id: "resp-07", governance_object_id: "obj-go_vendor_master", subject_id: "subj-u01", scope_id: "scp-08", responsibility_type: "data_steward", state_type: "as_is", notes: "Satın alma uzmanı tedarikçi belgelerini topluyor" },
    { id: "resp-08", governance_object_id: "obj-go_bom", subject_id: "subj-r02", scope_id: "scp-02", responsibility_type: "data_owner", state_type: "as_is", notes: "Fabrika Müdürü reçete doğruluğundan sorumlu" },
    { id: "resp-09", governance_object_id: "obj-go_bom", subject_id: "subj-u03", scope_id: "scp-02", responsibility_type: "data_steward", state_type: "as_is", notes: "Planlama mühendisi reçeteleri sisteme giriyor" },
    { id: "resp-10", governance_object_id: "obj-go_sales_order", subject_id: "subj-r05", scope_id: "scp-01", responsibility_type: "approver", state_type: "as_is", notes: "Satış siparişi onay makamı" },
    { id: "resp-11", governance_object_id: "obj-go_purchase_order", subject_id: "subj-r04", scope_id: "scp-01", responsibility_type: "approver", state_type: "as_is", notes: "Satın alma siparişi onay makamı" },
    { id: "resp-12", governance_object_id: "obj-go_quality_record", subject_id: "subj-r07", scope_id: "scp-02", responsibility_type: "data_owner", state_type: "as_is", notes: "Kalite kontrol test kriterleri sahibi" },
    { id: "resp-13", governance_object_id: "obj-go_payment", subject_id: "subj-r03", scope_id: "scp-01", responsibility_type: "approver", state_type: "as_is", notes: "Ödeme talimatları onay makamı" },
    { id: "resp-14", governance_object_id: "obj-go_project_record", subject_id: "subj-r02", scope_id: "scp-02", responsibility_type: "data_owner", state_type: "as_is", notes: "Tezgah operasyon rotaları sahibi" },
    { id: "resp-15", governance_object_id: "obj-go_employee_card", subject_id: "subj-r01", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "as_is", notes: "Personel ana veri sahibi" },

    // To-Be Target Assignments (15 items)
    { id: "resp-16", governance_object_id: "obj-go_item_master", subject_id: "subj-r02", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Hedef: Fabrika Müdürü malzeme sahibi olacak" },
    { id: "resp-17", governance_object_id: "obj-go_item_master", subject_id: "subj-u03", scope_id: "scp-02", responsibility_type: "data_steward", state_type: "to_be", notes: "Hedef: Ana veri uzmanı tek elden açacak" },
    { id: "resp-18", governance_object_id: "obj-go_gl_journal", subject_id: "subj-r03", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Hesap planı tek sahibi CFO olacak" },
    { id: "resp-19", governance_object_id: "obj-go_gl_journal", subject_id: "subj-u02", scope_id: "scp-09", responsibility_type: "data_steward", state_type: "to_be", notes: "Muhasebe şefi alt hesapları açacak" },
    { id: "resp-20", governance_object_id: "obj-go_customer_master", subject_id: "subj-r03", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Kredi limiti tek sahibi Mali İşler" },
    { id: "resp-21", governance_object_id: "obj-go_customer_master", subject_id: "subj-r05", scope_id: "scp-03", responsibility_type: "consumer", state_type: "to_be", notes: "Satış ekibi yalnız limit sorgulayabilecek" },
    { id: "resp-22", governance_object_id: "obj-go_price_list", subject_id: "subj-r05", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Fiyat listesi sahibi Satış Direktörü" },
    { id: "resp-23", governance_object_id: "obj-go_price_list", subject_id: "subj-r01", scope_id: "scp-01", responsibility_type: "approver", state_type: "to_be", notes: "Fiyat listesi Genel Müdür onayıyla yürürlüğe girer" },
    { id: "resp-24", governance_object_id: "obj-go_project_record", subject_id: "subj-r02", scope_id: "scp-02", responsibility_type: "data_owner", state_type: "to_be", notes: "İş emri açma ve kapatma sahibi" },
    { id: "resp-25", governance_object_id: "obj-go_project_record", subject_id: "subj-u03", scope_id: "scp-05", responsibility_type: "data_steward", state_type: "to_be", notes: "Metal hattı rota yöneticisi" },
    { id: "resp-26", governance_object_id: "obj-go_item_master", subject_id: "subj-r03", scope_id: "scp-01", responsibility_type: "approver", state_type: "to_be", notes: "Stok sayım düzeltme onay makamı" },
    { id: "resp-27", governance_object_id: "obj-go_fixed_asset", subject_id: "subj-r03", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Duran varlık ve amortisman sahibi" },
    { id: "resp-28", governance_object_id: "obj-go_contract", subject_id: "subj-r01", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Hukuki sözleşmeler yönetim sahibi" },
    { id: "resp-29", governance_object_id: "obj-go_user_auth_admin", subject_id: "subj-r08", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Sistem ve yetki konfigürasyonu sahibi" },
    { id: "resp-30", governance_object_id: "obj-go_gl_journal", subject_id: "subj-r03", scope_id: "scp-01", responsibility_type: "data_owner", state_type: "to_be", notes: "Yevmiye defteri yasal veri sahibi" },
  ];
}

// ── 40 Authorizations Generator (with 6 Effective Discrepancies) ──
export function generatePilotAuthorizations(): Array<{
  id: string;
  governance_object_id: string;
  subject_id: string;
  scope_id?: string;
  permission_level: "full" | "read_only" | "none" | "partial" | "unspecified";
  permission_source: "role" | "group" | "direct";
  effective_level?: "full" | "read_only" | "none" | "partial" | "unspecified";
  has_discrepancy: number;
  can_view: number;
  can_create: number;
  can_edit: number;
  can_delete: number;
  can_approve: number;
  can_cancel: number;
  can_export: number;
  can_view_cost: number;
  state_type: "as_is" | "to_be";
  notes?: string;
}> {
  const list: any[] = [];
  const starterObjects = DEFAULT_STARTER_GOVERNANCE_OBJECTS;

  // 1..23 Authorizations for Subjects on Starter Objects (Normal matching)
  for (let i = 0; i < starterObjects.length; i++) {
    const objCode = `obj-${starterObjects[i].code.toLowerCase()}`;
    const subjId = i % 2 === 0 ? "subj-r04" : "subj-r05";
    list.push({
      id: `auth-${i + 1}`,
      governance_object_id: objCode,
      subject_id: subjId,
      scope_id: "scp-01",
      permission_level: i % 3 === 0 ? "full" : "read_only",
      permission_source: "role",
      effective_level: i % 3 === 0 ? "full" : "read_only",
      has_discrepancy: 0,
      can_view: 1,
      can_create: i % 3 === 0 ? 1 : 0,
      can_edit: i % 3 === 0 ? 1 : 0,
      can_delete: 0,
      can_approve: i % 4 === 0 ? 1 : 0,
      can_cancel: 0,
      can_export: 1,
      can_view_cost: i % 2 === 0 ? 1 : 0,
      state_type: "as_is",
      notes: "Standart rol bazlı yetkilendirme",
    });
  }

  // 24..29 Six Discrepancy Authorizations (Beyan vs Fiili Efektif Sapma)
  const discrepancyDefs = [
    { id: "auth-24", obj: "obj-go_item_master", sub: "subj-u04", decl: "read_only", eff: "full", note: "Satış temsilcisi gruptan gelen süpervizör yetkisiyle malzeme kartı açıp değiştirebiliyor" },
    { id: "auth-25", obj: "obj-go_payment", sub: "subj-u02", decl: "read_only", eff: "full", note: "Muhasebe şefi ortak şifre ile fiilen banka ödeme emri onaylayabiliyor" },
    { id: "auth-26", obj: "obj-go_purchase_order", sub: "subj-u01", decl: "read_only", eff: "full", note: "Satın alma uzmanı doğrudan sipariş kapatma ve onay yetkisi kullanıyor" },
    { id: "auth-27", obj: "obj-go_item_master", sub: "subj-u05", decl: "read_only", eff: "full", note: "Depo şefi sayım eksiği fişini onaylatmadan doğrudan silebiliyor" },
    { id: "auth-28", obj: "obj-go_bom", sub: "subj-u03", decl: "read_only", eff: "full", note: "Planlama mühendisi Ar-Ge onayı aramadan reçete revizyonu yapabiliyor" },
    { id: "auth-29", obj: "obj-go_price_list", sub: "subj-u04", decl: "read_only", eff: "full", note: "Satış temsilcisi müşteri özel iskonto ve fiyat listesini doğrudan değiştirebiliyor" },
  ];

  for (const d of discrepancyDefs) {
    list.push({
      id: d.id,
      governance_object_id: d.obj,
      subject_id: d.sub,
      scope_id: "scp-01",
      permission_level: d.decl as any,
      permission_source: "group",
      effective_level: d.eff as any,
      has_discrepancy: 1,
      can_view: 1,
      can_create: 1,
      can_edit: 1,
      can_delete: 1,
      can_approve: 1,
      can_cancel: 0,
      can_export: 1,
      can_view_cost: 1,
      state_type: "as_is",
      notes: d.note,
    });
  }

  // 30..40 Eleven Additional Role/Subject Authorizations (To reach 40 items)
  for (let i = 0; i < 11; i++) {
    const objIndex = i % starterObjects.length;
    const objCode = `obj-${starterObjects[objIndex].code.toLowerCase()}`;
    const subjId = `subj-u0${(i % 6) + 1}`;
    list.push({
      id: `auth-${30 + i}`,
      governance_object_id: objCode,
      subject_id: subjId,
      scope_id: `scp-${String((i % 10) + 1).padStart(2, "0")}`,

      permission_level: i % 2 === 0 ? "partial" : "read_only",
      permission_source: "direct",
      effective_level: i % 2 === 0 ? "partial" : "read_only",
      has_discrepancy: 0,
      can_view: 1,
      can_create: 0,
      can_edit: 0,
      can_delete: 0,
      can_approve: 0,
      can_cancel: 0,
      can_export: 0,
      can_view_cost: 0,
      state_type: "to_be",
      notes: "Hedef operasyonel rol yetkisi",
    });
  }

  return list;
}

// ── Realistic Procedural Answers Generator (220+ Answers across 20 Functions) ──

export function generatePilotAnswers(): Array<{
  business_function_code: string;
  question_pack_id: string;
  question_id: string;
  question_type: string;
  answer_json: string;
  is_answered: number;
}> {
  const answers: any[] = [];
  const bfCodes = PILOT_FUNCTION_CODES;

  const prefixMap: Record<string, string> = {
    STRATEGY: "STR",
    MANAGEMENT: "MGT",
    PRODUCTION_PLANNING: "PRP",
    WORK_ORDERS: "WKO",
    QUALITY: "QLT",
    MAINTENANCE: "MNT",
    INVENTORY: "INV",
    WAREHOUSE: "WRH",
    LOGISTICS: "LOG",
    PROCUREMENT: "PRC",
    SUPPLIER_MANAGEMENT: "SUP",
    SALES: "SAL",
    PROPOSALS: "PRP",
    CRM: "CRM",
    ACCOUNTING: "ACC",
    COSTING: "CST",
    TREASURY: "TRS",
    HUMAN_RESOURCES: "HR",
    PAYROLL: "PAY",
    IT_INFRASTRUCTURE: "ITI",
  };

  // Generate ~43 questions per business function (~860 total)
  for (const bf of bfCodes) {
    const packId = `tr.${bf.toLowerCase()}.core`;
    const qPrefix = prefixMap[bf] || bf.substring(0, 3).toUpperCase();

    for (let qIdx = 1; qIdx <= 43; qIdx++) {
      const qNumStr = String(qIdx).padStart(3, "0");
      const questionId = `${qPrefix}-${qNumStr}`;


      // Check if this question is one of the 15 hand-crafted critical problem questions
      if (PILOT_CRITICAL_PROBLEM_ANSWERS[questionId]) {
        const crit = PILOT_CRITICAL_PROBLEM_ANSWERS[questionId];
        answers.push({
          business_function_code: bf,
          question_pack_id: packId,
          question_id: questionId,
          question_type: "single_choice",
          answer_json: JSON.stringify({
            selected: crit.selected,
            general_note: crit.general_note,
          }),
          is_answered: 1,
        });
      } else {
        // Procedural realistic discrete manufacturing response
        const optionValues = [
          "erp_uzerinden_standart_akis",
          "kismi_erp_kismi_excel",
          "departman_ici_prosedur",
          "manuel_evrak_ve_onay",
          "entegrasyon_bekleniyor",
        ];
        const selectedVal = optionValues[(qIdx + bf.length) % optionValues.length];
        const generalNote = qIdx % 5 === 0 ? `DeltaForm ${bf} operasyonel süreç notu (${questionId})` : undefined;

        answers.push({
          business_function_code: bf,
          question_pack_id: packId,
          question_id: questionId,
          question_type: qIdx % 6 === 0 ? "multiple_choice" : "single_choice",
          answer_json: JSON.stringify({
            selected: [
              {
                value: selectedVal,
                note: `[Kurgusal] ${bf} süreç kuralı adım ${qIdx}`,
              },
            ],
            general_note: generalNote,
          }),
          is_answered: 1,
        });
      }
    }
  }

  return answers;
}

// ── Second Cycle Update Delta (For Report Comparison) ──
export const PILOT_REVISED_DELTA = {
  company_notes_updated: "Kocaeli Fabrika, İstanbul Satış, Bursa Depo. 20 Departman. [REVİZE]: 2026 Q3 ERP Canlıya Geçiş Hazırlığı Tamamlandı.",
  revised_answers: [
    {
      question_id: "PRP-001",
      answer_json: JSON.stringify({
        selected: [{ value: "erp_mrp_ve_kapasite_modulu", note: "Excel tabloları kaldırılarak ERP MRP ve Dinamik Kapasite Planlama modülü devreye alındı." }],
        general_note: "Kapasite darboğazları iş emri bazında otomatik dengelenmektedir.",
      }),
    },
    {
      question_id: "WKO-001",
      answer_json: JSON.stringify({
        selected: [{ value: "erp_ecn_onayli_akis", note: "Mühendislik Değişiklik Yönetimi (ECN) modülü devreye alındı; e-posta ile revizyon durduruldu." }],
        general_note: "Ar-Ge ve ÜPK dijital çift imza ile reçeteyi aktifler.",
      }),
    },
    {
      question_id: "INV-001",
      answer_json: JSON.stringify({
        selected: [{ value: "tekil_kodlama_ve_barkod", note: "18.500 kart taranarak mükerrer 2.400 kart pasifize edildi, tekil akıllı kod standardı uygulandı." }],
        general_note: "Ana veri temizliği tamamlandı.",
      }),
    },
  ],
  deleted_attachment_id: "att-p03",
  new_attachment: {
    id: "att-p11",
    entity_type: "object" as const,
    entity_id: "obj-go_item_master",
    original_file_name: "deltaform_temizlenmis_ana_veri_katalogu_v1.xlsx",
    stored_file_name: "deltaform_temizlenmis_ana_veri_katalogu_v1.xlsx",
    relative_path: "attachment/proj-faz47-deltaform/GOVERNANCE/object/obj-go_item_master/deltaform_temizlenmis_ana_veri_katalogu_v1.xlsx",
    mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: 450000,
    description: "Mükerrer kartlardan arındırılmış 16.100 tekil malzeme ana veri listesi",
  },
  mitigated_sod_ids: ["sod-p01", "sod-p02"],
};
