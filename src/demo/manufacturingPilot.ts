/**
 * ERP CRM Discovery — Synthetic Discrete Manufacturing Pilot Dataset
 * FAZ-57: Marmara Endüstriyel Sistemler A.Ş. Kesikli Üretim Pilot Projesi
 *
 * %100 Etik, Sentetik ve Kurgusal Veri Seti.
 * Gerçek şirket, şahıs, vergi no, telefon, e-posta veya Tuna Ofis verisi İÇERMEZ.
 */

import { getDb, generateId, deleteProject, assignBusinessFunctionsToProject } from "../db/client";
import {
  seedDefaultGovernanceObjects,
  getGovernanceObjects,
  createGovernanceSubject,
  createGovernanceScope,
  createGovernanceResponsibility,
  createGovernanceAuthorization,
  createGovernanceLimit,
  createGovernanceSodRisk,
} from "../db/governanceClient";

export interface CreateManufacturingDemoResult {
  projectId: string;
  projectName: string;
  functionCount: number;
  answerCount: number;
}

/**
 * Mevcut projeler arasında isim çakışmasını önleyerek benzersiz bir demo proje adı belirler.
 * Örn:
 * 1. Oluşturma: "ERP/CRM Dönüşüm Ön Analiz Pilotu"
 * 2. Oluşturma: "ERP/CRM Dönüşüm Ön Analiz Pilotu (2)"
 * 3. Oluşturma: "ERP/CRM Dönüşüm Ön Analiz Pilotu (3)"
 */
export async function getUniqueDemoProjectName(): Promise<string> {
  const db = await getDb();
  const baseName = "ERP/CRM Dönüşüm Ön Analiz Pilotu";
  const existing = await db.select<{ name: string }[]>(
    `SELECT name FROM analysis_projects WHERE name LIKE $1`,
    [`${baseName}%`]
  );

  const existingNames = new Set(existing.map((e) => e.name));
  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.has(`${baseName} (${counter})`)) {
    counter++;
  }
  return `${baseName} (${counter})`;
}

/**
 * Marmara Endüstriyel Sistemler A.Ş. için eksiksiz kurgusal kesikli üretim demo projesini oluşturur.
 *
 * Veri Grupları ve Aşamalar:
 * 1. project
 * 2. company_profile
 * 3. project_business_functions
 * 4. answers
 * 5. flags
 * 6. semantic_records (findings, requirements, risks, notes)
 * 7. governance_objects
 * 8. governance_subjects
 * 9. governance_scopes
 * 10. responsibilities
 * 11. permission_matrix
 * 12. approval_limits
 * 13. sod_risks
 */
export async function createManufacturingDemoProject(): Promise<CreateManufacturingDemoResult> {
  const db = await getDb();
  let currentStage = "initialization";
  let currentKey = "";
  let createdProjectId: string | null = null;

  try {
    // 1. STAGE: project
    currentStage = "project";
    const projectId = generateId("proj_demo");
    createdProjectId = projectId;
    const now = new Date().toISOString();
    const projectName = await getUniqueDemoProjectName();
    currentKey = `project_id=${projectId}, name=${projectName}`;

    await db.execute(
      `INSERT INTO analysis_projects (id, name, status, created_at, updated_at)
       VALUES ($1, $2, 'active', $3, $3)`,
      [projectId, projectName, now]
    );

    // Ebeveyn proje kaydının oluşturulduğunu anında doğrula
    const parentProjCheck = await db.select<{ id: string }[]>(
      "SELECT id FROM analysis_projects WHERE id = $1",
      [projectId]
    );
    if (parentProjCheck.length === 0) {
      throw new Error(`Demo Proje Ebeveyn Hatası: '${projectId}' kaydı oluşturulamadı.`);
    }

    // 2. STAGE: company_profile
    currentStage = "company_profile";
    const companyProfileId = generateId("comp_demo");
    currentKey = `company_id=${companyProfileId}`;

    await db.execute(
      `INSERT INTO company_profiles
       (id, analysis_project_id, company_name, trade_name, tax_number, city, country, employee_count, business_sector, has_branches, branch_count, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
      [
        companyProfileId,
        projectId,
        "Marmara Endüstriyel Sistemler A.Ş.",
        "Marmara Endüstriyel",
        "0000000000",
        "Bursa",
        "Türkiye",
        "251_500",
        "Endüstriyel Makine ve Ekipman Üretimi",
        "yes",
        3,
        "Nilüfer Organize Sanayi Bölgesi, Makine İhtisas Alanı, Bursa (Bursa Nilüfer V.D.). Siparişe göre ve stok için kesikli üretim (discrete manufacturing) modeli uygulayan kurgusal tanıtım ve eğitim şirketi.",
        now,
      ]
    );

    // 3. STAGE: project_business_functions (19 Aktif Fonksiyon — Kanonik Servis)
    currentStage = "project_business_functions";
    const businessFunctions = [
      { code: "SALES", status: "completed", dept: "Satış ve Pazarlama", resp: "Satış Müdürü" },
      { code: "CRM", status: "in_progress", dept: "Müşteri Hizmetleri", resp: "Satış Müdürü" },
      { code: "PROPOSALS", status: "in_progress", dept: "Proje Mühendisliği", resp: "Satış Müdürü" },
      { code: "PROCUREMENT", status: "completed", dept: "Satınalma", resp: "Satınalma Müdürü" },
      { code: "SUPPLIER_MANAGEMENT", status: "in_progress", dept: "Satınalma", resp: "Satınalma Müdürü" },
      { code: "WAREHOUSE", status: "completed", dept: "Hammadde Deposu", resp: "Depo Sorumlusu" },
      { code: "INVENTORY", status: "completed", dept: "Hammadde Deposu", resp: "Depo Sorumlusu" },
      { code: "PRODUCTION_PLANNING", status: "in_progress", dept: "Üretim Planlama", resp: "Planlama Sorumlusu" },
      { code: "WORK_ORDERS", status: "in_progress", dept: "Üretim", resp: "Üretim Müdürü" },
      { code: "QUALITY", status: "in_progress", dept: "Kalite Güvence", resp: "Kalite Müdürü" },
      { code: "MAINTENANCE", status: "in_progress", dept: "Bakım", resp: "Bakım Şefi" },
      { code: "ACCOUNTING", status: "completed", dept: "Muhasebe ve Finans", resp: "Mali İşler Müdürü" },
      { code: "TREASURY", status: "in_progress", dept: "Muhasebe ve Finans", resp: "Mali İşler Müdürü" },
      { code: "HUMAN_RESOURCES", status: "in_progress", dept: "İnsan Kaynakları", resp: "İnsan Kaynakları Müdürü" },
      { code: "INFORMATION_TECHNOLOGY", status: "completed", dept: "Bilgi Teknolojileri", resp: "BT Yöneticisi" },
      { code: "LOGISTICS", status: "completed", dept: "Lojistik ve Sevkiyat", resp: "Lojistik Müdürü" },
      { code: "INVOICING", status: "completed", dept: "Muhasebe ve Finans", resp: "Mali İşler Müdürü" },
      { code: "DOCUMENT_MANAGEMENT", status: "in_progress", dept: "Genel Müdürlük", resp: "BT Yöneticisi" },
      { code: "E_TRANSFORMATION", status: "completed", dept: "Muhasebe ve Finans", resp: "Mali İşler Müdürü" },
    ];

    currentKey = `functions=${businessFunctions.map((bf) => bf.code).join(",")}`;
    await assignBusinessFunctionsToProject(projectId, businessFunctions);

    const activeFunctionCodes = new Set(businessFunctions.map((b) => b.code));

  // 4. Saha Soru Cevapları (92 Gerçekçi Cevap)
  const answersData: {
    bfCode: string;
    packId: string;
    packVersion: string;
    qId: string;
    answerJson: any;
    choiceNotesJson?: any;
    meetingNote?: string;
  }[] = [
    // SALES (10)
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-001",
      answerJson: { selected: ["b2b_ve_b2c"] },
      meetingNote: "Satışların %85'i endüstriyel makine üreticilerine B2B, %15'i bayi ağı üzerinden yapılmaktadır."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-002",
      answerJson: { selected: ["merkezi_satis_yonetimi"] },
      meetingNote: "İstanbul satış ofisi ve Bursa merkez fabrika ortak fiyat listesi kullanmaktadır."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-003",
      answerJson: { selected: ["teklifli_satis_agirlikli"] },
      choiceNotesJson: { teklifli_satis_agirlikli: "Özel mühendislik makinelerinde teklif onayı 3 kademelidir." },
      meetingNote: "Standart makinelerde liste fiyatı, özel projelerde konfigüratör teklifi esastır."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-004",
      answerJson: { selected: ["dovizli_ve_tl_karisik"] },
      meetingNote: "İhracat teklifleri EUR/USD, yurt içi sözleşmeler TCMB döviz endeksli TL olarak hazırlanır."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-005",
      answerJson: { selected: ["sozlesme_ve_siparis_birlikte"] },
      meetingNote: "Büyük montaj hatlarında sözleşme şartnamesi sipariş belgesine bağlanır."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-006",
      answerJson: { selected: ["avansli_ve_vade_farkli"] },
      meetingNote: "%30 siparişte nakit avans, %50 teslimatta, %20 devreye alma kabulünde tahsil edilir."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-007",
      answerJson: { selected: ["satis_temsilcisi_prim_sistemi_var"] },
      meetingNote: "Bölge satış kotalarına göre çeyreklik prim hakedişi hesaplanır."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-008",
      answerJson: { selected: ["teslimat_adresi_ve_fatura_adresi_farkli"] },
      meetingNote: "Müşterinin şantiye ve fabrika lokasyonlarına doğrudan sevkiyat yapılabilmelidir."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-009",
      answerJson: { selected: ["iskonto_onay_matrisi_var"] },
      choiceNotesJson: { iskonto_onay_matrisi_var: "%10 üzeri Satış Müdürü, %15 üzeri Genel Müdür onayı gerektirir." },
      meetingNote: "İskonto sapmaları mevcut sistemde e-posta ile yönetilmektedir."
    },
    {
      bfCode: "SALES", packId: "tr.sales.core", packVersion: "0.1.0", qId: "SALES-010",
      answerJson: { selected: ["kredi_limiti_ve_risk_kontrolu_zorunlu"] },
      meetingNote: "Açık hesap çalışan müşterilerde DBS ve teminat mektubu kontrolü aranır."
    },

    // PROCUREMENT (10)
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-001",
      answerJson: { selected: ["merkezi_satinalma_departmani"] },
      meetingNote: "Tüm hammadde, motor, redüktör ve elektronik komponent alımları Bursa merkezden yönetilir."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-002",
      answerJson: { selected: ["mrp_ve_talep_birlikte"] },
      choiceNotesJson: { mrp_ve_talep_birlikte: "Standart parçalar MRP ile, özel imalat parçalar proje talebiyle açılır." }
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-003",
      answerJson: { selected: ["en_az_uc_teklif_kurali"] },
      meetingNote: "50.000 TL üzeri alımlarda 3 teklif karşılaştırma tablosu zorunludur."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-004",
      answerJson: { selected: ["tedarikci_sozlesmesi_ve_cerceve_anlasma"] },
      meetingNote: "Çelik sac ve profil alımlarında yıllık tonaj taahhütlü çerçeve sözleşme uygulanır."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-005",
      answerJson: { selected: ["ithalat_ve_yurtici_karma"] },
      meetingNote: "Özel CNC sürücüler ve hidrolik valfler Almanya ve İtalya'dan ithal edilmektedir."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-006",
      answerJson: { selected: ["siparis_onay_hiyerarsisi_var"] },
      choiceNotesJson: { siparis_onay_hiyerarsisi_var: "Bölüm Müdürü -> Satınalma Müdürü -> Mali İşler onaylar." }
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-007",
      answerJson: { selected: ["termin_takibi_ve_gecikme_cezasi_var"] },
      meetingNote: "Kritik termin gecikmelerinde haftalık %1 ceza maddesi sözleşmelerde yer alır."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-008",
      answerJson: { selected: ["kalite_onayli_tedarikci_listesi_zorunlu"] },
      meetingNote: "Kalite Güvence onayı olmayan tedarikçilerden sipariş açılamaz."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-009",
      answerJson: { selected: ["irsaliye_fatura_siparis_3lu_esleme"] },
      meetingNote: "Mali işler fatura girişinde irsaliye ve sipariş miktar/fiyat toleransını doğrular."
    },
    {
      bfCode: "PROCUREMENT", packId: "tr.procurement.core", packVersion: "0.1.0", qId: "PRC-010",
      answerJson: { selected: ["tedarikci_degerlendirme_sistemi_var"] },
      meetingNote: "6 aylık periyotlarla kalite, termin ve fiyat performans puanı hesaplanır."
    },

    // WAREHOUSE & INVENTORY (16)
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-001",
      answerJson: { selected: ["cok_lokasyonlu_ve_cok_bolumlu_depo"] },
      meetingNote: "Hammadde, Yarı Mamul, Mamul, Yedek Parça ve Karantina depoları fiziksel olarak ayrıdır."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-002",
      answerJson: { selected: ["adresli_raf_ve_koridor_yonetimi_var"] },
      meetingNote: "A-Z koridor, 1-10 raf, 1-4 kat formatında adresleme kullanılmaktadır."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-003",
      answerJson: { selected: ["barkodlu_el_terminali_kullaniliyor"] },
      meetingNote: "Mal kabul ve sevkiyat işlemlerinde 2D karekodlu etiketler taranmaktadır."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-004",
      answerJson: { selected: ["karantina_alani_ve_giris_kalite_kontrol_var"] },
      meetingNote: "Kalite onayı almayan malzemeler kırmızı etiketle karantina rafına alınır."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-005",
      answerJson: { selected: ["fifo_ve_parti_lot_takibi"] },
      meetingNote: "Isıl işlem görmüş çelik miller lot numarası ile takip edilir."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-006",
      answerJson: { selected: ["sayim_yonetimi_periyodik_ve_dongusel"] },
      meetingNote: "Yılda bir genel sayım, her ay ABC sınıfı A grubu malzemelerde döngüsel sayım yapılır."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-007",
      answerJson: { selected: ["uretime_cikis_rezervasyon_ve_is_emriyle"] },
      meetingNote: "Hammadde çıkışları doğrudan iş emri numarasına rezervasyonlu olarak verilir."
    },
    {
      bfCode: "WAREHOUSE", packId: "tr.warehouse.core", packVersion: "0.1.0", qId: "WAR-008",
      answerJson: { selected: ["hurda_ve_atık_alani_ayri"] },
      meetingNote: "İşleme talaşları ve sac hurdaları lisanslı geri dönüşüm alanında toplanır."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-001",
      answerJson: { selected: ["agirlikli_ortalama_ve_lot_maliyeti"] },
      meetingNote: "Envanter değerlemesinde dönemsel ağırlıklı ortalama maliyet yöntemi esastır."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-002",
      answerJson: { selected: ["emniyet_stogu_ve_yeniden_siparis_noktasi_var"] },
      meetingNote: "Rulman, civata ve conta gibi C grubu sarf malzemelerde min-max seviyesi izlenir."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-003",
      answerJson: { selected: ["fason_stok_takibi_var"] },
      choiceNotesJson: { fason_stok_takibi_var: "Boya ve kaplama işlemleri dış fasoncularda takip edilir." }
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-004",
      answerJson: { selected: ["seri_numarasi_takibi_mamul_ve_kritik_parca"] },
      meetingNote: "Üretilen her endüstriyel makineye şasi ve plaka seri numarası basılır."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-005",
      answerJson: { selected: ["konsinye_stok_uygulamasi_var"] },
      meetingNote: "Kesici takım tedarikçisi fabrika içinde konsinye otomat dolabı işletmektedir."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-006",
      answerJson: { selected: ["stok_yaslandirma_ve_hareketsiz_stok_raporu_var"] },
      meetingNote: "180 günden uzun süre hareket görmeyen malzemeler her ay komisyonca incelenir."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-007",
      answerJson: { selected: ["cift_birim_takibi_kg_ve_adet"] },
      meetingNote: "Sac malzemeler plaka adet ve kg cinsinden çift birimli izlenir."
    },
    {
      bfCode: "INVENTORY", packId: "tr.inventory.core", packVersion: "0.1.0", qId: "INV-008",
      answerJson: { selected: ["stok_transfer_onay_mekanizmasi_var"] },
      meetingNote: "Bursa fabrika ve Ankara servis deposu arası transferler sevk irsaliyesi ile yürütülür."
    },

    // PRODUCTION PLANNING & WORK ORDERS (18)
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-001",
      answerJson: { selected: ["siparis_uzerine_ve_stoga_karma_uretim"] },
      meetingNote: "Standart hidrolik presler stoka, özel otomasyon hatları siparişe göre üretilir."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-002",
      answerJson: { selected: ["cok_seviyeli_urun_agaci_bom_var"] },
      choiceNotesJson: { cok_seviyeli_urun_agaci_bom_var: "Makinelerde 4-6 seviyeli derin ürün ağacı yapısı bulunmaktadır." }
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-003",
      answerJson: { selected: ["mühendislik_degisiklik_yonetimi_ecn_var"] },
      meetingNote: "Ürün ağacı revizyonları şu anda Excel tablolarında takip edilmektedir (Kritik Risk)."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-004",
      answerJson: { selected: ["mrp_hesaplama_motoru_haftalik"] },
      meetingNote: "Pazartesi sabahları haftalık net ihtiyaç planlama (MRP) çalıştırılır."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-005",
      answerJson: { selected: ["kapasite_ihtiyac_planlamasi_crp_kismi"] },
      meetingNote: "CNC işleme merkezleri ve kaynak istasyonlarında darboğaz analizi yapılır."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-006",
      answerJson: { selected: ["rota_ve_operasyon_adimlari_tanimli"] },
      meetingNote: "Kesim -> Büküm -> Kaynak -> Talaşlı İmalat -> Boya -> Montaj -> Test sıralı rotadır."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-007",
      answerJson: { selected: ["standart_ve_gerceklesen_hazirlik_setup_suresi_var"] },
      meetingNote: "Kalıp bağlama ve CNC program yükleme süreleri operasyon kartına işlenir."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-008",
      answerJson: { selected: ["fason_operasyon_entegrasyonu_var"] },
      meetingNote: "Galvaniz kaplama ve elektrostatik toz boya fason rotaya dahildir."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-009",
      answerJson: { selected: ["alternatif_rota_ve_makine_tanimi_var"] },
      meetingNote: "5 eksen CNC arızalandığında 3 eksen CNC + üniversal freze alternatif rotadır."
    },
    {
      bfCode: "PRODUCTION_PLANNING", packId: "tr.production_planning.core", packVersion: "0.1.0", qId: "PRP-010",
      answerJson: { selected: ["uretim_cizelgeleme_gantt_semasi_var"] },
      meetingNote: "Gantt şeması mevcut yazılımda statik olup dinamik yeniden çizelgeleme gerekmektedir."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-001",
      answerJson: { selected: ["barkodlu_is_emri_refakat_karti"] },
      meetingNote: "Üretim sahasında her parça sepetine lamine iş emri refakat kartı iliştirilir."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-002",
      answerJson: { selected: ["operasyon_bazinda_baslat_durdur_bildirimi"] },
      meetingNote: "Operatörler iş başlangıç ve bitişini dokunmatik ekran terminalinden okutur."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-003",
      answerJson: { selected: ["gerceklesen_iscilik_ve_makine_zaman_kaydi"] },
      meetingNote: "Fiili süreler ile standart süreler karşılaştırılarak operasyon verimliliği ölçülür."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-004",
      answerJson: { selected: ["fire_hurda_ve_yeniden_isleme_kaydi_var"] },
      meetingNote: "Fire neden kodları (malzeme hatası, operatör hatası, ayar bozukluğu) girilir."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-005",
      answerJson: { selected: ["otomatik_stok_dusumu_backflush_yari_otomatik"] },
      meetingNote: "Bağlantı elemanları backflush ile, ana gövde sacları parti numarasıyla düşülür."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-006",
      answerJson: { selected: ["ara_stok_ve_wip_takibi_var"] },
      meetingNote: "Montaj hattı öncesi tampon yarı mamul alanında stok miktarı izlenir."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-007",
      answerJson: { selected: ["kismen_tamamlanmis_is_emri_kapatma"] },
      meetingNote: "Müşteri acil kısmi sevkiyat istediğinde iş emrinden kısmi mamul çıkışı yapılır."
    },
    {
      bfCode: "WORK_ORDERS", packId: "tr.work_orders.core", packVersion: "0.1.0", qId: "WKO-008",
      answerJson: { selected: ["durus_nedenleri_kaydi_var"] },
      meetingNote: "Arıza, ayar, hammadde bekleme, elektrik kesintisi ve yemek molası kaydedilir."
    },

    // QUALITY & MAINTENANCE (16)
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-001",
      answerJson: { selected: ["giris_proses_ve_son_kontrol_uc_asamali"] },
      meetingNote: "Tüm hammadde girişlerinde, talaşlı imalatta ve son montaj testinde kontrol uygulanır."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-002",
      answerJson: { selected: ["ornekleme_ve_aql_standartlari"] },
      meetingNote: "ISO 2859-1 Tablo 1 Normal Seviye II genel muayene standardı uygulanmaktadır."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-003",
      answerJson: { selected: ["olcum_cihazi_ve_kalibrasyon_takibi_var"] },
      meetingNote: "Kumpas, mikrometre ve tork anahtarları yıllık akredite laboratuvara gönderilir."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-004",
      answerJson: { selected: ["uygunsuzluk_yonetimi_ve_dof_acma_var"] },
      meetingNote: "Düzeltici Önleyici Faaliyetler (DÖF) 8D metodolojisiyle kapatılır."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-005",
      answerJson: { selected: ["tedarikci_hata_bildirimi_ve_iade_raporu"] },
      meetingNote: "Hatalı partilerde tedarikçiye resmi 8D hata raporu ve navlun dekontu iletilir."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-006",
      answerJson: { selected: ["test_sertifikasi_ve_raporu_uretimi_var"] },
      meetingNote: "Her makineyle birlikte EN 10204 3.1 malzeme ve fabrika kabul test sertifikası verilir."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-007",
      answerJson: { selected: ["spc_istatistiksel_proses_kontrol_kismi"] },
      meetingNote: "Kritik mil taşlama çaplarında X-bar R kontrol kartları tutulur."
    },
    {
      bfCode: "QUALITY", packId: "tr.quality.core", packVersion: "0.1.0", qId: "QLT-008",
      answerJson: { selected: ["musteri_sikayetleri_ve_iade_kalite_analizi"] },
      meetingNote: "Garanti içi saha arızaları kök neden analizine alınarak mühendisliğe aktarılır."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-001",
      answerJson: { selected: ["periyodik_ariza_ve_kestirimci_bakim_karma"] },
      meetingNote: "Ağır preslerde hidrolik yağ analizi ve titreşim ölçümüyle kestirimci bakım yapılır."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-002",
      answerJson: { selected: ["makine_sicil_karti_ve_bakim_tarihcesi_var"] },
      meetingNote: "Tüm tezgahların motor gücü, yağ tipi, yedek parça listesi ve arıza geçmişi kayıtlıdır."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-003",
      answerJson: { selected: ["ariza_bildirimi_ve_bakim_is_emri_akisi"] },
      meetingNote: "Operatör arıza bildiriminde duruş saati otomatik başlar ve müdahalede durdurulur."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-004",
      answerJson: { selected: ["bakim_yedek_parca_stok_entegrasyonu"] },
      meetingNote: "Kritik rulman, kayış ve hidrolik filtreler bakım deposunda minimum stoklu tutulur."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-005",
      answerJson: { selected: ["mtbf_ve_mttr_performans_kpi_takibi"] },
      meetingNote: "Arızalar arası ortalama süre (MTBF) ve ortalama onarım süresi (MTTR) hesaplanır."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-006",
      answerJson: { selected: ["dis_kaynak_yetkili_servis_sozlesmeleri"] },
      meetingNote: "CNC lazer ve punch tezgahları üretici yetkili servisi ile yıllık bakım anlaşmalıdır."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-007",
      answerJson: { selected: ["otonom_bakim_gunluk_operator_kontrol_listesi"] },
      meetingNote: "Vardiya başında yağ seviyesi, hava basıncı ve temizlik kontrolü operatörce yapılır."
    },
    {
      bfCode: "MAINTENANCE", packId: "tr.maintenance.core", packVersion: "0.1.0", qId: "MNT-008",
      answerJson: { selected: ["enerji_tuketimi_ve_verimlilik_izleme"] },
      meetingNote: "Kompresör dairesi ve ana dağıtım panolarında reaktif ceza ve güç tüketimi izlenir."
    },

    // LOGISTICS & IT INFRASTRUCTURE (16)
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-001",
      answerJson: { selected: ["otomatik_teslimat_emri"] },
      meetingNote: "Onaylanan satış siparişinden sistem otomatik olarak Teslimat / Sevk Emri oluşturur."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-002",
      answerJson: { selected: ["sistem_otomatik_bloke_koyar"] },
      meetingNote: "Müşterinin kredi limiti aşılmışsa veya vadesi geçmiş borcu varsa sistem sevk irsaliyesi kesilmesini otomatik engeller."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-003",
      answerJson: { selected: ["rota_ve_arac_kapasite_planlama"] },
      meetingNote: "Kamyon ve tır bazında hacim, ağırlık ve teslim rotası optimizasyonu yapılır."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-004",
      answerJson: { selected: ["e_irsaliye_gib_entegre_anlik"] },
      meetingNote: "Araç çıkış kapısında karekodlu e-İrsaliye çıktısı alınarak sevkiyat başlatılır."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-005",
      answerJson: { selected: ["anlasmali_kargo_ve_ambar_entegrasyonu"] },
      meetingNote: "Parsiyel gönderiler ambar ve kargo takip numarasıyla sistem üzerinden izlenir."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-006",
      answerJson: { selected: ["dijital_teslim_kaniti_pod_takibi"] },
      meetingNote: "Müşteri teslim tesellüm fişleri taranarak sisteme teslim kanıtı (POD) olarak yüklenir."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-007",
      answerJson: { selected: ["navlun_maliyet_analizi_ve_fatura_esleme"] },
      meetingNote: "Nakliye faturaları sevk irsaliyeleriyle eşleştirilerek navlun maliyeti kontrol edilir."
    },
    {
      bfCode: "LOGISTICS", packId: "tr.logistics.core", packVersion: "0.1.0", qId: "LOG-008",
      answerJson: { selected: ["otif_zamaninda_ve_eksiksiz_teslimat_kpi"] },
      meetingNote: "Aylık OTIF zamanında ve eksiksiz teslimat KPI raporu yönetime sunulmaktadır."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-001",
      answerJson: { selected: ["yerel_sunucu_ve_kvkk_uyumlu_altyapi"] },
      meetingNote: "Sistem odasında cluster çalışan VMware ESXi sanallaştırma altyapısı mevcuttur."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-002",
      answerJson: { selected: ["otomatik_gunluk_yedekleme_ve_3_2_1_kurali"] },
      meetingNote: "Günlük yerel NAS yedeği ve haftalık kilitli harici medya çevrimdışı kasaya alınır."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-003",
      answerJson: { selected: ["active_directory_ve_rol_tabanli_yetkilendirme"] },
      meetingNote: "Kullanıcı hesapları merkezi Windows Domain Controller üzerinden yönetilir."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-004",
      answerJson: { selected: ["guvenlik_duvari_firewall_ve_vpn_erisim"] },
      meetingNote: "İstanbul ve Ankara şubeleri IPsec VPN tüneli üzerinden merkeze bağlanır."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-005",
      answerJson: { selected: ["kesintisiz_guc_kaynagi_ups_ve_jenerator"] },
      meetingNote: "Fabrika 400 kVA otomatik jeneratör ve sistem odası 40 kVA online UPS ile korunur."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-006",
      answerJson: { selected: ["antivirus_ve_edr_uclara_yuklu"] },
      meetingNote: "Tüm istemci ve saha terminallerinde merkezi yönetimli EDR yazılımı aktiftir."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-007",
      answerJson: { selected: ["felaket_kurtarma_senaryosu_diger_lokasyonda"] },
      meetingNote: "İstanbul ofisinde soğuk yedek sunucu felaket kurtarma senaryosu için ayrılmıştır."
    },
    {
      bfCode: "INFORMATION_TECHNOLOGY", packId: "tr.it_infrastructure.core", packVersion: "0.1.0", qId: "IT-008",
      answerJson: { selected: ["bt_hizmet_yonetimi_ve_talep_takip_yazilimi"] },
      meetingNote: "Kullanıcı donanım ve yazılım arıza talepleri yardım masası sistemiyle izlenir."
    },

    // ACCOUNTING (8)
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-001",
      answerJson: { selected: ["tek_duzen_hesap_plani_ve_masraf_merkezi"] },
      meetingNote: "Maliye Bakanlığı TDHP standardı ve 7/A seçeneği masraf yerleri kullanılmaktadır."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-002",
      answerJson: { selected: ["otomatik_muhasebelestirme_entegrasyonu"] },
      meetingNote: "Fatura, irsaliye, çek/senet ve banka hareketleri otomatik muhasebe fişi üretir."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-003",
      answerJson: { selected: ["e_defter_ve_gib_uyumlu_berat_gonderimi"] },
      meetingNote: "Yevmiye ve Kebir beratları aylık periyotlarla GİB sistemine yüklenmektedir."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-004",
      answerJson: { selected: ["kdv_tevkifat_ve_stopaj_otomasyonu"] },
      meetingNote: "Fason talaşlı imalat ve tevkifatlı hurda satışları doğru hesap kodlarına ayrıştırılır."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-005",
      answerJson: { selected: ["dovizli_muhasebe_ve_otomatik_kur_farki"] },
      meetingNote: "Ay sonu dövizli cari ve banka hesaplarında değerleme fişleri otomatik üretilir."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-006",
      answerJson: { selected: ["sabit_kiymet_ve_amortisman_modulu_var"] },
      meetingNote: "Üretim makineleri ve taşıtlar VUK faydalı ömür listesine göre amortismana tabi tutulur."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-007",
      answerJson: { selected: ["cari_hesap_mutabakati_ve_ba_bs_formlari"] },
      meetingNote: "Aylık e-Mutabakat sistemi üzerinden müşteri ve satıcı bakiyeleri doğrulanır."
    },
    {
      bfCode: "ACCOUNTING", packId: "tr.accounting.core", packVersion: "0.1.0", qId: "ACC-008",
      answerJson: { selected: ["donem_sonu_kapanis_ve_mizan_kontrolu"] },
      meetingNote: "Geçici vergi ve yıl sonu mali kapanış kontrol listesi uygulanır."
    },
  ];

    // 4. STAGE: answers
    currentStage = "answers";
    for (let i = 0; i < answersData.length; i++) {
      const a = answersData[i];
      currentKey = `bf=${a.bfCode}, qId=${a.qId}`;
      if (!activeFunctionCodes.has(a.bfCode)) {
        throw new Error(`Cevap için aktif iş fonksiyonu bulunamadı: ${a.bfCode}`);
      }
      const answerDataObj = {
        selected: a.answerJson.selected || [],
        choiceNotes: a.choiceNotesJson || {},
        meetingNote: a.meetingNote || "",
      };
      await db.execute(
        `INSERT INTO question_answers
         (id, analysis_project_id, business_function_code, question_pack_id, question_pack_version, question_id, answer_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
        [
          generateId("ans"),
          projectId,
          a.bfCode,
          a.packId,
          a.packVersion,
          a.qId,
          JSON.stringify(answerDataObj),
          now,
        ]
      );
    }

    // 5. STAGE: flags
    currentStage = "flags";
    const followupsData = [
      {
        bfCode: "PRODUCTION_PLANNING", qId: "PRP-003", flagType: "critical",
        note: "Ürün ağacı revizyonlarının Excel'de tutulması imalat hattında eski parça üretilmesine yol açıyor. ECN onay mekanizması kurulmalı."
      },
      {
        bfCode: "PROCUREMENT", qId: "PRC-007", flagType: "critical",
        note: "Yurt dışı motor tedarikçilerinde 4 haftayı bulan termin sapması yaşanıyor. Güvenlik stoku ve yerli alternatif tedarikçi belirlenmeli."
      },
      {
        bfCode: "SALES", qId: "SALES-009", flagType: "revisit",
        note: "İskonto onay yetki matrisinin yeni ERP yetkilendirme modülüyle entegrasyonu tekrar görüşülecek."
      },
      {
        bfCode: "MAINTENANCE", qId: "MNT-001", flagType: "revisit",
        note: "Hidrolik pres yağ analiz sensörlerinin yeni ERP IoT katmanına bağlanması için protokol incelenecek."
      },
    ];

    for (let i = 0; i < followupsData.length; i++) {
      const f = followupsData[i];
      currentKey = `bf=${f.bfCode}, qId=${f.qId}, flag=${f.flagType}`;
      if (!activeFunctionCodes.has(f.bfCode)) {
        throw new Error(`Takip bayrağı için aktif iş fonksiyonu bulunamadı: ${f.bfCode}`);
      }
      await db.execute(
        `INSERT INTO question_followups
         (id, analysis_project_id, business_function_code, question_id, flag_type, note, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $7)`,
        [generateId("flw"), projectId, f.bfCode, f.qId, f.flagType, f.note, now]
      );
    }

    // 6. STAGE: semantic_records (findings, requirements, risks, notes)
    currentStage = "semantic_records";
    const findingsData = [
      {
        bfCode: "INVENTORY",
        title: "Stok Kartlarında Mükerrer Malzeme Kodları ve Varyant Kirliliği",
        description: "Aynı teknik özelliklere sahip sac ve civata malzemelerinin farklı birimler tarafından mükerrer kodlarla açıldığı tespit edildi.",
        priority: "critical", status: "open"
      },
      {
        bfCode: "PRODUCTION_PLANNING",
        title: "Ürün Ağacı (BOM) Revizyonlarının Excel Dosyaları ile Takip Edilmesi",
        description: "Tasarım mühendisliğinde yapılan revizyonlar üretim sahasına e-posta/Excel ile iletildiğinden montajda eski revizyon kullanılma riski mevcuttur.",
        priority: "critical", status: "open"
      },
      {
        bfCode: "PROCUREMENT",
        title: "Satınalma Termin Tarihlerinde Tedarikçi Doğrulama Eksikliği",
        description: "Sipariş teyidindeki termin tarihleri sisteme girilmemekte; gecikmeler ancak montaj hattında malzeme eksildiğinde fark edilmektedir.",
        priority: "high", status: "open"
      },
      {
        bfCode: "WORK_ORDERS",
        title: "Üretim Sahasında Gerçekleşen Fire ve Hurda Bildirimlerinin Gecikmesi",
        description: "Lazer kesim ve talaşlı imalatta oluşan hurda miktarları vardiya sonunda toplu girildiğinden anlık stok doğruluk oranı %88 seviyesinde kalmaktadır.",
        priority: "high", status: "confirmed"
      },
      {
        bfCode: "QUALITY",
        title: "Kalite Giriş Kontrol Retlerinin Tedarikçi Değerlendirme Puanına Yansımaması",
        description: "Giriş kalite ret raporları bağımsız Excel'de tutulduğundan satınalma birimi sipariş açarken ret oranlarını görememektedir.",
        priority: "high", status: "open"
      },
      {
        bfCode: "SALES",
        title: "Satış Tahminleri ile Üretim Ana Çizelgeleme Arasında Senkronizasyon Kopukluğu",
        description: "Satış ekibinin çeyreklik satış tahminleri ERP sistemine girilmediği için hammadde tedarik süresi uzun parçalarda darboğaz yaşanmaktadır.",
        priority: "medium", status: "confirmed"
      },
      {
        bfCode: "MAINTENANCE",
        title: "Bakım ve Arıza Faaliyetlerinin Planlı Bakım Takvimine Bağlanamaması",
        description: "Makine duruşlarının %65'i plansız arızalardan kaynaklanmakta, periyodik bakım takvimi kağıt formlarla yönetilmektedir.",
        priority: "medium", status: "open"
      },
    ];

    for (let i = 0; i < findingsData.length; i++) {
      const f = findingsData[i];
      currentKey = `finding title=${f.title}`;
      if (!activeFunctionCodes.has(f.bfCode)) {
        throw new Error(`Bulgu için aktif iş fonksiyonu bulunamadı: ${f.bfCode}`);
      }
      await db.execute(
        `INSERT INTO analysis_findings
         (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, null, $4, $5, $6, $7, $8, $8)`,
        [generateId("fnd"), projectId, f.bfCode, f.title, f.description, f.priority, f.status, now]
      );
    }

    const requirementsData = [
      {
        bfCode: "INVENTORY",
        title: "Merkezi ve Kodlama Şablonlu Ana Veri Yönetim (MDM) Modülü Kurulumu",
        description: "Tüm stok ve cari kartlarının tek onay makamı (Ana Veri Sorumlusu) üzerinden ve parametrik şablonlarla açılması zorunlu kılınmalıdır.",
        priority: "critical", status: "draft"
      },
      {
        bfCode: "PRODUCTION_PLANNING",
        title: "Mühendislik Değişiklik Yönetimi (ECN) Entegre Ürün Ağacı ve Rota Sistemi",
        description: "CAD sistemiyle çift yönlü entegre çalışan, revizyon tarihçesi tutan ve iş emrine anında yansıyan BOM yapısı kurulmalıdır.",
        priority: "critical", status: "confirmed"
      },
      {
        bfCode: "PROCUREMENT",
        title: "Satınalma Siparişi ve İrsaliye Bazında Otomatik Tedarikçi SLA ve Termin Takibi",
        description: "Sipariş onayından teslimata kadar olan süreçte tedarikçi gecikmelerini otomatik alarm üreterek raporlayan yapı kurulmalıdır.",
        priority: "high", status: "draft"
      },
      {
        bfCode: "WORK_ORDERS",
        title: "Üretim Sahası Dokunmatik Terminal ve Barkodlu Operasyon Bildirim Arayüzü",
        description: "Operatörlerin parça refakat kartını okutarak anlık başlama, bitiş, fire ve duruş nedeni girebileceği saha ekranı sağlanmalıdır.",
        priority: "critical", status: "draft"
      },
      {
        bfCode: "QUALITY",
        title: "Kalite Kontrol Sonuçlarına Göre Otomatik Karantina ve Satıcı İade Akışı",
        description: "Giriş kaliteden onay almayan partilerin otomatik karantina deposuna çekilmesi ve satınalma iade faturası sürecini tetiklemesi gereklidir.",
        priority: "high", status: "draft"
      },
      {
        bfCode: "PRODUCTION_PLANNING",
        title: "MRP II ve Kapasite İhtiyaç Planlaması (CRP) Tabanlı Çizelgeleme Motoru",
        description: "Kritik tezgah iş yüklerini ve malzeme ihtiyaçlarını sonlu kapasite mantığıyla dinamik çizelgeleyen motor devreye alınmalıdır.",
        priority: "critical", status: "confirmed"
      },
      {
        bfCode: "MAINTENANCE",
        title: "Kestirimci ve Periyodik Makine Bakım Yönetimi ile Yedek Parça Entegrasyonu",
        description: "Çalışma saati ve sensör verilerine dayalı bakım iş emirleri otomatik açılmalı ve parça rezervasyonu depoya iletilmelidir.",
        priority: "medium", status: "draft"
      },
    ];

    for (let i = 0; i < requirementsData.length; i++) {
      const r = requirementsData[i];
      currentKey = `requirement title=${r.title}`;
      if (!activeFunctionCodes.has(r.bfCode)) {
        throw new Error(`Gereksinim için aktif iş fonksiyonu bulunamadı: ${r.bfCode}`);
      }
      await db.execute(
        `INSERT INTO analysis_requirements
         (id, analysis_project_id, business_function_code, question_id, title, description, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, null, $4, $5, $6, $7, $8, $8)`,
        [generateId("req"), projectId, r.bfCode, r.title, r.description, r.priority, r.status, now]
      );
    }

    const risksData = [
      {
        bfCode: "PRODUCTION_PLANNING",
        title: "Üretim devam ederken eski revizyonlu ürün ağacının kullanılması nedeniyle hatalı montaj riski",
        description: "Mühendislik değişikliklerinin sahaya manuel iletilmesi hurda maliyetlerine ve müşteri iadelerine neden olabilir.",
        impact: "critical", probability: "high", status: "open",
        mitigation_note: "ERP içinde ECN zorunlu onay akışı ve iş emri revizyon kilitleme kuralı devreye alınacak."
      },
      {
        bfCode: "PROCUREMENT",
        title: "Tedarikçi termin gecikmelerinin erken tespit edilememesi sonucu montaj hattının durma riski",
        description: "Özel ithal komponentlerdeki gecikmeler ana montaj hattında darboğaz yaratarak teslimat cezalarına yol açabilir.",
        impact: "high", probability: "high", status: "mitigated",
        mitigation_note: "Tedarikçi sipariş onayında zorunlu termin teyidi ve 7 gün önceden gecikme uyarı mekanizması kurulacak."
      },
      {
        bfCode: "QUALITY",
        title: "Giriş kalite retlerinin faturası kesildikten sonra fark edilmesi sebebiyle oluşan finansal mutabakat riski",
        description: "İrsaliye ile fatura eşleşmesinde kalite onay şartı aranmadığında hatalı ödemeler gerçekleşebilir.",
        impact: "high", probability: "medium", status: "open",
        mitigation_note: "3'lü eşleme motorunda 'Kalite Kabul Onayı' zorunlu kontrol kriteri olarak mühürlenecek."
      },
      {
        bfCode: "INFORMATION_TECHNOLOGY",
        title: "Yetkilerin çalışan bazında kontrolsüz dağıtılması sonucu Görevler Ayrılığı (SoD) ihlalleri riski",
        description: "Aynı kullanıcının hem satınalma siparişi açıp hem satıcı faturasını onaylayabilmesi iç denetim riski doğurur.",
        impact: "critical", probability: "medium", status: "mitigated",
        mitigation_note: "Yönetişim yetki matrisi uygulanarak çelişen yetkiler ayrıştırılacak ve onay limiti tanımlanacak."
      },
      {
        bfCode: "MAINTENANCE",
        title: "Plansız duruşların kritik yedek parça stoksuzluğu nedeniyle uzama riski",
        description: "CNC işleme merkezlerinde kritik rulman ve spindle parçalarının bulunmaması hat duruşlarını uzatabilir.",
        impact: "high", probability: "medium", status: "open",
        mitigation_note: "Bakım kritik yedek parça listesi çıkarılarak min-max emniyet stok seviyesi tanımlanacak."
      },
    ];

    for (let i = 0; i < risksData.length; i++) {
      const r = risksData[i];
      currentKey = `risk title=${r.title}`;
      if (!activeFunctionCodes.has(r.bfCode)) {
        throw new Error(`Risk için aktif iş fonksiyonu bulunamadı: ${r.bfCode}`);
      }
      await db.execute(
        `INSERT INTO analysis_risks
         (id, analysis_project_id, business_function_code, question_id, title, description, impact, probability, mitigation_note, status, created_at, updated_at)
         VALUES ($1, $2, $3, null, $4, $5, $6, $7, $8, $9, $10, $10)`,
        [generateId("rsk"), projectId, r.bfCode, r.title, r.description, r.impact, r.probability, r.mitigation_note, r.status, now]
      );
    }

    const notesData = [
      {
        bfCode: "PRODUCTION_PLANNING",
        note: "Bursa merkez fabrikasında haftalık üretim planlama toplantılarında Excel konsolidasyonu yaklaşık 4 saat sürmektedir. Dinamik MRP II çıktısı talep ediliyor."
      },
      {
        bfCode: "SALES",
        note: "İstanbul satış ofisi özel tasarım siparişlerde teknik onay sürecini e-posta üzerinden yürütmektedir. Proje teklif konfigüratörü hedefleniyor."
      },
      {
        bfCode: "PROCUREMENT",
        note: "Satınalma birimi paslanmaz çelik sac alımlarında son 6 ayda %12 termin sapması bildirdi. Tedarikçi çerçeve sözleşmeleri yenileniyor."
      },
      {
        bfCode: "WAREHOUSE",
        note: "Ankara servis birimi garanti kapsamındaki yedek parça taleplerini merkez depoya manuel iletiyor. Şube transfer modülü aktifleştirilmeli."
      },
      {
        bfCode: "SALES",
        note: "Fiyat listeleri için genel müdürlük iskonto onay mekanizması yazılı bir kurala bağlanmamış. Yetki matrisi tasarımı onaylandı."
      },
      {
        bfCode: "MAINTENANCE",
        note: "Kalıp ve pres makinelerinde kestirimci bakım titreşim sensörleri bulunmakta ancak mevcut yazılıma bağlı değildir. API entegrasyonu planlanıyor."
      },
    ];

    for (let i = 0; i < notesData.length; i++) {
      const n = notesData[i];
      currentKey = `note bf=${n.bfCode}`;
      if (!activeFunctionCodes.has(n.bfCode)) {
        throw new Error(`Proje notu için aktif iş fonksiyonu bulunamadı: ${n.bfCode}`);
      }
      await db.execute(
        `INSERT INTO project_notes
         (id, analysis_project_id, business_function_code, question_id, note, created_at, updated_at)
         VALUES ($1, $2, $3, null, $4, $5, $5)`,
        [generateId("not"), projectId, n.bfCode, n.note, now]
      );
    }

    // 7. STAGE: governance_objects
    currentStage = "governance_objects";
    currentKey = `project_id=${projectId}`;
    await seedDefaultGovernanceObjects(projectId);
    const existingObjects = await getGovernanceObjects(projectId);
    const objectIdMap: Record<string, string> = {};
    for (const obj of existingObjects) {
      objectIdMap[obj.code] = obj.id;
    }

    // 8. STAGE: governance_subjects
    currentStage = "governance_subjects";
    const govSubjects = [
      { type: "role" as const, name: "Genel Müdür", dept: "Genel Müdürlük" },
      { type: "role" as const, name: "Mali İşler Müdürü", dept: "Muhasebe ve Finans" },
      { type: "role" as const, name: "Satış Müdürü", dept: "Satış ve Pazarlama" },
      { type: "role" as const, name: "Satınalma Müdürü", dept: "Satınalma" },
      { type: "role" as const, name: "Üretim Müdürü", dept: "Üretim" },
      { type: "role" as const, name: "Planlama Sorumlusu", dept: "Üretim Planlama" },
      { type: "role" as const, name: "Kalite Müdürü", dept: "Kalite Güvence" },
      { type: "role" as const, name: "Depo Sorumlusu", dept: "Hammadde Deposu" },
      { type: "role" as const, name: "Bakım Şefi", dept: "Bakım" },
      { type: "role" as const, name: "BT Yöneticisi", dept: "Bilgi Teknolojileri" },
      { type: "role" as const, name: "Ana Veri Sorumlusu", dept: "Genel Müdürlük" },
    ];

    const subjectIdMap: Record<string, string> = {};
    for (const sub of govSubjects) {
      currentKey = `subject_name=${sub.name}`;
      const created = await createGovernanceSubject({
        analysis_project_id: projectId,
        subject_type: sub.type,
        name: sub.name,
        department_name: sub.dept,
      });
      subjectIdMap[sub.name] = created.id;
    }

    // 9. STAGE: governance_scopes
    currentStage = "governance_scopes";
    const govScopes = [
      { type: "company" as const, name: "Bursa Merkez ve Üretim Tesisi" },
      { type: "branch" as const, name: "İstanbul Satış Ofisi" },
      { type: "branch" as const, name: "Ankara Teknik Servis" },
    ];

    const scopeIdMap: Record<string, string> = {};
    for (const sc of govScopes) {
      currentKey = `scope_name=${sc.name}`;
      const created = await createGovernanceScope({
        analysis_project_id: projectId,
        scope_type: sc.type,
        name: sc.name,
      });
      scopeIdMap[sc.name] = created.id;
    }

    // 10. STAGE: responsibilities
    currentStage = "responsibilities";
    const responsibilities = [
      { objCode: "GO_ITEM_MASTER", subName: "Ana Veri Sorumlusu", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_ITEM_MASTER", subName: "Planlama Sorumlusu", type: "data_steward" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_ITEM_MASTER", subName: "BT Yöneticisi", type: "technical_custodian" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_BOM", subName: "Üretim Müdürü", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_BOM", subName: "Planlama Sorumlusu", type: "data_steward" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_VENDOR_MASTER", subName: "Satınalma Müdürü", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_PURCHASE_ORDER", subName: "Satınalma Müdürü", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_PRICE_LIST", subName: "Satış Müdürü", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_CUSTOMER_MASTER", subName: "Satış Müdürü", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
      { objCode: "GO_GL_JOURNAL", subName: "Mali İşler Müdürü", type: "data_owner" as const, scope: "Bursa Merkez ve Üretim Tesisi" },
    ];

    for (const r of responsibilities) {
      currentKey = `obj=${r.objCode}, sub=${r.subName}, type=${r.type}`;
      const objId = objectIdMap[r.objCode];
      const subId = subjectIdMap[r.subName];
      const scId = r.scope ? scopeIdMap[r.scope] : null;

      if (!objId) throw new Error(`Governance object bulunamadı: ${r.objCode}`);
      if (!subId) throw new Error(`Governance subject bulunamadı: ${r.subName}`);

      await createGovernanceResponsibility({
        analysis_project_id: projectId,
        governance_object_id: objId,
        subject_id: subId,
        scope_id: scId || null,
        responsibility_type: r.type,
        state_type: "as_is",
      });
    }

    // 11. STAGE: permission_matrix
    currentStage = "permission_matrix";
    const authorizations = [
      {
        objCode: "GO_PURCHASE_ORDER", subName: "Satınalma Müdürü", declared: "full" as const, effective: "full" as const,
        isDisc: 0, notes: "Satınalma Müdürü tam işlem yetkisine sahiptir."
      },
      {
        objCode: "GO_VENDOR_MASTER", subName: "Depo Sorumlusu", declared: "read_only" as const, effective: "full" as const,
        isDisc: 1, notes: "Depo Sorumlusunun satıcı ana verisini değiştirme yetkisi bulunmamalıdır (Sapma)."
      },
      {
        objCode: "GO_PRICE_LIST", subName: "Satış Müdürü", declared: "full" as const, effective: "full" as const,
        isDisc: 0, notes: "Satış Müdürü fiyat listesi güncelleme yetkisine sahiptir."
      },
      {
        objCode: "GO_BOM", subName: "Depo Sorumlusu", declared: "read_only" as const, effective: "read_only" as const,
        isDisc: 0, notes: "Depo personeli ürün ağacını yalnızca sorgulayabilir."
      },
      {
        objCode: "GO_PRICE_LIST", subName: "Satınalma Müdürü", declared: "read_only" as const, effective: "full" as const,
        isDisc: 1, notes: "Satınalma Müdürü satış fiyat listesini değiştirebilmektedir (Sapma)."
      },
    ];

    for (const a of authorizations) {
      currentKey = `obj=${a.objCode}, sub=${a.subName}`;
      const objId = objectIdMap[a.objCode];
      const subId = subjectIdMap[a.subName];
      if (!objId) throw new Error(`Governance object bulunamadı: ${a.objCode}`);
      if (!subId) throw new Error(`Governance subject bulunamadı: ${a.subName}`);

      await createGovernanceAuthorization({
        analysis_project_id: projectId,
        governance_object_id: objId,
        subject_id: subId,
        permission_level: a.declared,
        effective_level: a.effective,
        has_discrepancy: a.isDisc,
        can_view: 1,
        can_create: a.effective === "full" ? 1 : 0,
        can_edit: a.effective === "full" ? 1 : 0,
        can_delete: a.effective === "full" ? 1 : 0,
        can_approve: a.effective === "full" ? 1 : 0,
        state_type: "as_is",
        notes: a.notes,
      });
    }

    // 12. STAGE: approval_limits
    currentStage = "approval_limits";
    const limits = [
      {
        objCode: "GO_PURCHASE_ORDER", subName: "Satınalma Müdürü", type: "amount_single",
        amount: 50000, curr: "TRY", notes: "Satınalma Müdürü 50.000 TL'ye kadar tek imza ile onaylayabilir."
      },
      {
        objCode: "GO_PURCHASE_ORDER", subName: "Genel Müdür", type: "amount_single",
        amount: 250000, curr: "TRY", notes: "50.000 TL - 250.000 TL arası Genel Müdür onayı zorunludur."
      },
      {
        objCode: "GO_PRICE_LIST", subName: "Satış Müdürü", type: "percentage",
        amount: 15, curr: "PCT", notes: "Satış Müdürü maksimum %15 iskonto toleransı uygulayabilir."
      },
    ];

    for (const l of limits) {
      currentKey = `obj=${l.objCode}, sub=${l.subName}, type=${l.type}`;
      const objId = objectIdMap[l.objCode];
      const subId = subjectIdMap[l.subName];
      if (!objId) throw new Error(`Governance object bulunamadı: ${l.objCode}`);
      if (!subId) throw new Error(`Governance subject bulunamadı: ${l.subName}`);

      await createGovernanceLimit({
        analysis_project_id: projectId,
        governance_object_id: objId,
        subject_id: subjectIdMap[l.subName],
        limit_type: l.type,
        currency_or_unit: l.curr,
        min_value: 0,
        max_value: l.amount,
        state_type: "as_is",
        notes: l.notes,
      });
    }

    // 13. STAGE: sod_risks
    currentStage = "sod_risks";
    const sodRisks = [
      {
        title: "Satınalma Siparişi Oluşturma ve Satıcı Faturası Onaylama Yetki Çakışması",
        dutyA: "Satınalma Siparişi Girişi (PO Creation)",
        dutyB: "Satıcı Faturası Onaylama (Invoice Approval)",
        sev: "critical" as const, status: "open" as const,
        mitigation: "Satınalma siparişini oluşturan personel ile faturayı muhasebeleştiren personel rolleri kesin olarak ayrıştırılmalıdır."
      },
      {
        title: "Stok Sayım Girişi ve Envanter Düzeltme Fişi Onaylama Çakışması",
        dutyA: "Fiili Depo Sayım Girişi (Physical Count Entry)",
        dutyB: "Stok Değerleme ve Düzeltme Onayı (Inventory Adjustment Approval)",
        sev: "high" as const, status: "open" as const,
        mitigation: "Sayım mutabakat fişleri Depo Sorumlusu tarafından değil, Mali İşler ve İç Denetim ortak onayıyla sisteme işlenmelidir."
      },
    ];

    for (const s of sodRisks) {
      currentKey = `sod_title=${s.title}`;
      await createGovernanceSodRisk({
        analysis_project_id: projectId,
        risk_title: s.title,
        conflicting_duty_a: s.dutyA,
        conflicting_duty_b: s.dutyB,
        risk_severity: s.sev,
        status: s.status,
        mitigation_action: s.mitigation,
        state_type: "as_is",
      });
    }

    // 14. FOREIGN KEY Bütünlük Denetimi (PRAGMA foreign_key_check)
    try {
      const fkCheck = await db.select<any[]>("PRAGMA foreign_key_check;");
      if (fkCheck && fkCheck.length > 0) {
        throw new Error(
          `FOREIGN KEY denetimi başarısız (${fkCheck.length} ihlal): ${JSON.stringify(fkCheck)}`
        );
      }
    } catch (fkErr: any) {
      if (fkErr?.message?.includes("FOREIGN KEY denetimi başarısız")) {
        throw fkErr;
      }
      // PRAGMA query'yi desteklemeyen ortamlarda yok say
    }

    return {
      projectId,
      projectName,
      functionCount: businessFunctions.length,
      answerCount: answersData.length,
    };
  } catch (err: any) {
    console.error(
      `[manufacturingPilot] HATA — Aşama: '${currentStage}', Kayıt: '${currentKey}':`,
      err?.message || err
    );

    // Hata anında yarım projeyi ve bağlı tüm kayıtları temizle
    if (createdProjectId) {
      try {
        await deleteProject(createdProjectId);
        console.warn(`[manufacturingPilot] Hata sonrası yarım demo projesi (${createdProjectId}) temizlendi.`);
      } catch (cleanupErr) {
        console.error("[manufacturingPilot] Proje temizleme hatası:", cleanupErr);
      }
    }

    throw new Error(
      `Demo proje oluşturulamadı (Aşama: ${currentStage}). Lütfen tekrar deneyin.`
    );
  }
}
