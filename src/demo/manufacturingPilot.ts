/**
 * ERP CRM Discovery — Synthetic Discrete Manufacturing Pilot Dataset
 * FAZ-57: Marmara Endüstriyel Sistemler A.Ş. Kesikli Üretim Pilot Projesi
 *
 * %100 Etik, Sentetik ve Kurgusal Veri Seti.
 * Gerçek şirket, şahıs, vergi no, telefon, e-posta veya Tuna Ofis verisi İÇERMEZ.
 */

import { getDb, generateId, deleteProject, assignBusinessFunctionsToProject } from "../db/client";
import { CANONICAL_QUESTION_PACKS, CANONICAL_CODE_TO_PACK_ID } from "../generated/questionPacks";
import type { AnswerData } from "../engine/types";
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
 * 19 aktif iş fonksiyonu için kanonik soru külliyatına %100 uyumlu 94 geçerli sentetik cevap üretir.
 */
export function buildManufacturingPilotAnswers(): Array<{
  bfCode: string;
  packId: string;
  packVersion: string;
  qId: string;
  answerData: AnswerData;
}> {
  const targetFunctions: Array<{ code: string; count: number }> = [
    { code: "SALES", count: 5 },
    { code: "CRM", count: 5 },
    { code: "PROPOSALS", count: 5 },
    { code: "PROCUREMENT", count: 5 },
    { code: "SUPPLIER_MANAGEMENT", count: 5 },
    { code: "WAREHOUSE", count: 5 },
    { code: "INVENTORY", count: 5 },
    { code: "PRODUCTION_PLANNING", count: 5 },
    { code: "WORK_ORDERS", count: 5 },
    { code: "QUALITY", count: 5 },
    { code: "MAINTENANCE", count: 5 },
    { code: "ACCOUNTING", count: 5 },
    { code: "TREASURY", count: 5 },
    { code: "HUMAN_RESOURCES", count: 5 },
    { code: "INFORMATION_TECHNOLOGY", count: 5 },
    { code: "LOGISTICS", count: 5 },
    { code: "INVOICING", count: 5 },
    { code: "DOCUMENT_MANAGEMENT", count: 5 },
    { code: "E_TRANSFORMATION", count: 4 }, // 18*5 + 4 = 94
  ];

  const result: Array<{
    bfCode: string;
    packId: string;
    packVersion: string;
    qId: string;
    answerData: AnswerData;
  }> = [];

  for (const tf of targetFunctions) {
    const packId = CANONICAL_CODE_TO_PACK_ID[tf.code];
    if (!packId) {
      throw new Error(`Kanonik paket eşleşmesi bulunamadı: ${tf.code}`);
    }
    const pack = CANONICAL_QUESTION_PACKS[packId];
    if (!pack) {
      throw new Error(`Kanonik soru paketi yüklenemedi: ${packId}`);
    }

    const questions = pack.questions.slice(0, tf.count);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      let answerData: AnswerData = {};

      if (q.answer_type === "single_choice" || q.answer_type === "yes_no") {
        const opt = q.options && q.options.length > 0 ? q.options[0] : { value: "yes", label: "Evet", allow_note: false, is_other: false };
        answerData = {
          selected: [
            {
              value: opt.value,
              note: opt.allow_note ? "Marmara Endüstriyel kurumsal prosedürüne göre uygulanmaktadır." : undefined,
            }
          ],
          general_note: "Birim yöneticisi ile yapılan saha mülakatında teyit edildi.",
        };
      } else if (q.answer_type === "multiple_choice") {
        const opts = q.options && q.options.length >= 2 ? q.options.slice(0, 2) : (q.options || []);
        answerData = {
          selected: opts.map((opt, idx) => ({
            value: opt.value,
            note: idx === 0 ? "Birincil ve ana operasyonel yöntem." : undefined,
          })),
          general_note: "Süreç adımları fabrika genelinde aktiftir.",
        };
      } else if (q.answer_type === "number") {
        answerData = {
          text: "15",
          general_note: "Güncel fabrika operasyon verisidir.",
        };
      } else {
        answerData = {
          text: "Marmara Endüstriyel bünyesinde kesikli üretim ve montaj modeline uygun olarak yürütülmektedir.",
          general_note: "Saha keşif mülakatı notu.",
        };
      }

      result.push({
        bfCode: tf.code,
        packId: pack.meta.pack_id,
        packVersion: pack.meta.version,
        qId: q.id,
        answerData,
      });
    }
  }

  return result;
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

    // 4. STAGE: answers
    currentStage = "answers";
    const answersData = buildManufacturingPilotAnswers();
    for (let i = 0; i < answersData.length; i++) {
      const a = answersData[i];
      currentKey = `bf=${a.bfCode}, qId=${a.qId}`;
      if (!activeFunctionCodes.has(a.bfCode)) {
        throw new Error(`Cevap için aktif iş fonksiyonu bulunamadı: ${a.bfCode}`);
      }
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
          JSON.stringify(a.answerData),
          now,
        ]
      );
    }

    // 5. STAGE: flags
    currentStage = "flags";
    const followupsData = [
      {
        bfCode: "PRODUCTION_PLANNING", qId: "PRD-003", flagType: "critical",
        note: "Ürün ağacı revizyonlarının Excel'de tutulması imalat hattında eski parça üretilmesine yol açıyor. ECN onay mekanizması kurulmalı."
      },
      {
        bfCode: "PROCUREMENT", qId: "PRC-003", flagType: "critical",
        note: "Yurt dışı motor tedarikçilerinde 4 haftayı bulan termin sapması yaşanıyor. Güvenlik stoku ve yerli alternatif tedarikçi belirlenmeli."
      },
      {
        bfCode: "SALES", qId: "SALES-003", flagType: "revisit",
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
