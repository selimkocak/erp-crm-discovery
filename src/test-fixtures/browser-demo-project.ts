/**
 * ERP CRM Discovery — Browser Demo Project Fixture
 *
 * Tarayıcı test ortamı için Marmara Endüstriyel A.Ş. deterministik pilot verisi.
 * %100 çevrimdışı, sıfır bulut, sıfır AI gereksinimiyle tüm ekranların test edilmesini sağlar.
 */

import type {
  BusinessFunction,
  CompanyProfile,
  Finding,
  Requirement,
  Risk,
  ProjectNote,
  ProjectCustomQuestion,
  QuestionFollowup,
  QuestionAttachment,
  OtStation,
  OtDataRequirement,
  OtAlarmRequirement,
  OtQualityDevice,
  ProcessMap,
  ProcessNode,
  ProcessEdge,
  DataGovernanceAsset,
  DataGovernanceAccess,
  DataGovernanceApproval,
  EvidenceItem,
  EvidenceLink,
  ReadinessCheckItem,
  ProjectStatus,
  FunctionStatus,
  ProjectScopeChange,
} from "../types";
import type { AnswerData } from "../engine/types";
import { BUSINESS_FUNCTION_REGISTRY } from "../generated/businessFunctions";

export interface BrowserStorageState {
  projects: {
    id: string;
    name: string;
    status: ProjectStatus;
    planned_start_date: string | null;
    planned_end_date: string | null;
    actual_start_date: string | null;
    actual_end_date: string | null;
    created_at: string;
    updated_at: string;
  }[];
  companies: CompanyProfile[];
  projectFunctions: {
    id: string;
    analysis_project_id: string;
    business_function_id: string;
    company_department_name?: string;
    responsible_person?: string;
    status: FunctionStatus;
    is_active?: number;
    removed_at?: string | null;
    removal_reason?: string | null;
    planned_start_date?: string | null;
    planned_end_date?: string | null;
    actual_start_date?: string | null;
    actual_end_date?: string | null;
    created_at: string;
    updated_at: string;
  }[];
  scopeChanges: ProjectScopeChange[];
  answers: {
    id: string;
    analysis_project_id: string;
    business_function_code: string;
    question_pack_id: string;
    question_pack_version: string;
    question_id: string;
    answer_data: AnswerData;
    created_at: string;
    updated_at: string;
  }[];
  lastQuestions?: Record<string, string>;
  findings: Finding[];
  requirements: Requirement[];
  risks: Risk[];
  notes: ProjectNote[];
  reportProfiles?: Record<string, any>;
  customQuestions: ProjectCustomQuestion[];
  customAnswers?: Record<string, AnswerData>;
  followups: QuestionFollowup[];
  attachments: QuestionAttachment[];
  otStations: OtStation[];
  otStationAnswers: {
    id: string;
    project_id: string;
    station_id: string;
    business_function_code: string;
    question_pack_id: string;
    question_pack_version: string;
    question_id: string;
    answer_data: AnswerData;
    created_at: string;
    updated_at: string;
  }[];
  otDataRequirements?: OtDataRequirement[];
  otAlarmRequirements?: OtAlarmRequirement[];
  otQualityDevices?: OtQualityDevice[];
  processMaps: ProcessMap[];
  processNodes: ProcessNode[];
  processEdges: ProcessEdge[];
  dataGovernanceAssets: DataGovernanceAsset[];
  dataGovernanceAccess: DataGovernanceAccess[];
  dataGovernanceApprovals: DataGovernanceApproval[];
  evidenceItems: EvidenceItem[];
  evidenceLinks: EvidenceLink[];
  readinessChecks: ReadinessCheckItem[];
}

export function getMasterFunctionsFixture(): BusinessFunction[] {
  return BUSINESS_FUNCTION_REGISTRY.map((bf) => ({
    id: `bf-${bf.code.toLowerCase()}`,
    code: bf.code,
    name_tr: bf.name_tr,
    name_en: bf.name_en,
    category: bf.category_tr,
    sort_order: bf.sort_order,
    is_active: bf.is_active ? 1 : 0,
    description: `${bf.name_tr} analizi`,
  }));
}

export function createInitialBrowserFixture(): BrowserStorageState {
  const projectId = "proj-marmara-001";
  const now = "2026-08-25T10:00:00.000Z";
  const masterFunctions = getMasterFunctionsFixture();

  const activeCodes = [
    "SALES", "PROCUREMENT", "WAREHOUSE", "INVENTORY", "LOGISTICS",
    "PRODUCTION", "QUALITY", "MAINTENANCE", "ACCOUNTING", "FINANCE",
    "BUDGETING", "COST_ACCOUNTING", "HUMAN_RESOURCES", "PAYROLL",
    "CRM", "AFTER_SALES", "IMPORT", "EXPORT", "OT_INDUSTRIAL_DATA"
  ];

  const projectFunctions = activeCodes.map((code, idx) => {
    const master = masterFunctions.find((m) => m.code === code) || masterFunctions[0];
    return {
      id: `pbf-${code.toLowerCase()}`,
      analysis_project_id: projectId,
      business_function_id: master.id,
      company_department_name: `${master.name_tr} Departmanı`,
      responsible_person: `Yetkili ${idx + 1}`,
      status: (idx < 5 ? "in_progress" : "not_started") as FunctionStatus,
      is_active: 1,
      planned_start_date: "2026-09-01",
      planned_end_date: "2026-11-30",
      actual_start_date: idx < 5 ? "2026-09-01" : null,
      actual_end_date: null,
      created_at: now,
      updated_at: now,
    };
  });

  return {
    projects: [
      {
        id: projectId,
        name: "Marmara Endüstriyel ERP & CRM Dönüşüm Analizi",
        status: "active",
        planned_start_date: "2026-09-01",
        planned_end_date: "2026-12-31",
        actual_start_date: "2026-09-01",
        actual_end_date: null,
        created_at: now,
        updated_at: now,
      },
    ],
    companies: [
      {
        id: "comp-marmara-001",
        analysis_project_id: projectId,
        company_name: "Marmara Endüstriyel Çözümler San. ve Tic. A.Ş.",
        trade_name: "Marmara Endüstriyel",
        tax_number: "6120489123",
        city: "Kocaeli",
        country: "Türkiye",
        employee_count: "250-500",
        business_sector: "Otomotiv ve Endüstriyel Makine İmalatı",
        has_branches: "yes",
        branch_count: 3,
        notes: "Gebze Organize Sanayi Bölgesi tesislerinde disk fren ve aktarma organları üretimi.",
        created_at: now,
        updated_at: now,
      },
    ],
    projectFunctions,
    scopeChanges: [],
    answers: [
      {
        id: "ans-001",
        analysis_project_id: projectId,
        business_function_code: "SALES",
        question_pack_id: "tr.sales.core",
        question_pack_version: "0.1.0",
        question_id: "SAL-001",
        answer_data: {
          selected: [{ value: "SAL-001-A" }],
          general_note: "Doğrudan B2B kurumsal OEM müşterilerine satış yapılmaktadır.",
        },
        created_at: now,
        updated_at: now,
      },
      {
        id: "ans-002",
        analysis_project_id: projectId,
        business_function_code: "PROCUREMENT",
        question_pack_id: "tr.procurement.core",
        question_pack_version: "0.1.0",
        question_id: "PRC-001",
        answer_data: {
          selected: [{ value: "PRC-001-B" }],
          general_note: "Yıllık çerçeve sözleşmelerle hammadde tedarik edilmektedir.",
        },
        created_at: now,
        updated_at: now,
      },
    ],
    findings: [
      {
        id: "fnd-001",
        analysis_project_id: projectId,
        business_function_code: "SALES",
        question_id: "SAL-001",
        title: "Teklif Revizyon Takibi Excel Üzerinde Yapılıyor",
        description: "Müşteri özel teklifleri versiyonlanamadığı için hatalı iskonto riski bulunmaktadır.",
        priority: "high",
        status: "open",
        created_at: now,
        updated_at: now,
      },
      {
        id: "fnd-002",
        analysis_project_id: projectId,
        business_function_code: "WAREHOUSE",
        question_id: "WAR-001",
        title: "Mal Kabulde Barkodlu Doğrulama Eksikliği",
        description: "Giriş irsaliyeleri manuel girilmekte, tedarikçi lot numaraları sisteme otomatik aktarılmamaktadır.",
        priority: "critical",
        status: "open",
        created_at: now,
        updated_at: now,
      },
    ],
    requirements: [
      {
        id: "req-001",
        analysis_project_id: projectId,
        business_function_code: "SALES",
        question_id: "SAL-001",
        title: "Çok Seviyeli Teklif Onay ve Versiyonlama Matrisi",
        description: "Marj %15 altına indiğinde Genel Müdür onayına düşen dinamik teklif onay akışı kurulmalıdır.",
        priority: "high",
        status: "draft",
        created_at: now,
        updated_at: now,
      },
    ],
    risks: [
      {
        id: "rsk-001",
        analysis_project_id: projectId,
        business_function_code: "PROCUREMENT",
        question_id: "PRC-001",
        title: "Tedarikçi Fatura Eşleştirme Gecikmesi",
        description: "İrsaliye-fatura eşleşmesi manuel yapıldığından mükerrer ödeme riski mevcuttur.",
        impact: "high",
        probability: "medium",
        mitigation_note: "ERP üzerinde otomatik 3'lü eşleştirme ve onay kuralı devreye alınmalı.",
        status: "open",
        created_at: now,
        updated_at: now,
      },
    ],
    notes: [
      {
        id: "not-001",
        analysis_project_id: projectId,
        business_function_code: "SALES",
        question_id: "SAL-001",
        note: "Satış direktörü Can Bey ile 15 Eylül'de ek toplantı yapılacak.",
        created_at: now,
        updated_at: now,
      },
    ],
    customQuestions: [],
    followups: [
      {
        id: "qf-001",
        analysis_project_id: projectId,
        business_function_code: "WAREHOUSE",
        question_id: "WAR-001",
        flag_type: "critical",
        note: "El terminali donanım uyumluluğu kontrol edilmeli.",
        status: "open",
        created_at: now,
        updated_at: now,
        resolved_at: null,
      },
    ],
    attachments: [],
    otStations: [
      {
        id: "ots-001",
        project_id: projectId,
        area_name: "Talaşlı İmalat",
        line_name: "Hat 1 - CNC",
        station_code: "ST-101",
        station_name: "İstasyon 101 - Freze",
        sort_order: 1,
        status: "active",
        created_at: now,
        updated_at: now,
      },
      {
        id: "ots-002",
        project_id: projectId,
        area_name: "Montaj",
        line_name: "Hat 2 - Aktarma",
        station_code: "ST-201",
        station_name: "İstasyon 201 - Pres",
        sort_order: 2,
        status: "active",
        created_at: now,
        updated_at: now,
      },
    ],
    otStationAnswers: [],
    processMaps: [
      {
        id: "pmap-001",
        project_id: projectId,
        name: "Siparişten Sevkiyata (O2C) Ana Akış",
        process_area: "Satış & Lojistik",
        owner_role: "Satış Operasyon Müdürü",
        status: "active",
        description: "Müşteri siparişinden faturaya kadar uçtan uca akış.",
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    processNodes: [
      {
        id: "pnode-001",
        process_map_id: "pmap-001",
        node_type: "START",
        name: "Sipariş Alımı",
        description: "Müşteriden EDI/E-posta ile sipariş girişi",
        responsible_department: "Satış",
        responsible_role: "Müşteri Temsilcisi",
        step_order: 1,
        approval_count: 0,
        handoff_count: 0,
        duplicate_data_entry: 0,
        bypass_possible: 0,
        manual_work: 1,
        value_added: 1,
        adoption_risk: "low",
        created_at: now,
        updated_at: now,
      },
      {
        id: "pnode-002",
        process_map_id: "pmap-001",
        node_type: "ACTIVITY",
        name: "Kredi Limiti ve Stok Kontrolü",
        description: "Müşteri risk limiti ve mevcut mamul rezervasyonu",
        responsible_department: "Finans & Depo",
        responsible_role: "Finans Uzmanı",
        step_order: 2,
        approval_count: 1,
        handoff_count: 1,
        duplicate_data_entry: 0,
        bypass_possible: 0,
        manual_work: 0,
        value_added: 1,
        adoption_risk: "medium",
        created_at: now,
        updated_at: now,
      },
    ],
    processEdges: [
      {
        id: "pedge-001",
        process_map_id: "pmap-001",
        source_node_id: "pnode-001",
        target_node_id: "pnode-002",
        label: "Onaylandı",
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    dataGovernanceAssets: [
      {
        id: "gov-001",
        project_id: projectId,
        domain: "Müşteri & Satış",
        asset_name: "Müşteri Ana Verisi (Cari Kartlar)",
        asset_type: "Master Data",
        description: "Tüm B2B müşteri unvan, vergi ve sevkiyat adres kayıtları.",
        system_of_record: "ERP",
        criticality: "CRITICAL",
        master_data: 1,
        process_data: 0,
        personal_data: 1,
        financial_data: 1,
        quality_or_safety_data: 0,
        owner_role: "Satış Direktörü",
        steward_role: "Satış Operasyon Yöneticisi",
        technical_custodian_role: "ERP Veritabanı Yöneticisi",
        status: "active",
        created_at: now,
        updated_at: now,
      },
    ],
    dataGovernanceAccess: [
      {
        id: "gacc-001",
        project_id: projectId,
        asset_id: "gov-001",
        actor_type: "ROLE",
        actor_name: "Müşteri Temsilcisi",
        access_level: "READ_ONLY",
        scope_type: "COMPANY",
        approval_required: 0,
        task_separation_required: 0,
        status: "active",
        created_at: now,
        updated_at: now,
      },
    ],
    dataGovernanceApprovals: [
      {
        id: "gapp-001",
        project_id: projectId,
        asset_id: "gov-001",
        approval_name: "Yeni Cari Açılış Onayı",
        approval_role: "Finans Direktörü",
        threshold_description: "Tüm yeni cari kartlar",
        approval_order: 1,
        mandatory: 1,
        separation_of_duties: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    evidenceItems: [
      {
        id: "evi-001",
        project_id: projectId,
        title: "Mal Kabul Manuel Giriş Formu Örneği",
        evidence_type: "PHOTO",
        file_name: "mal_kabul_formu.jpg",
        source_type: "FIELD_OBSERVATION",
        collected_at: now,
        verification_status: "ACCEPTED",
        credibility_level: "HIGH",
        sensitivity_level: "NORMAL",
        created_at: now,
        updated_at: now,
      },
    ],
    evidenceLinks: [
      {
        id: "evl-001",
        project_id: projectId,
        evidence_id: "evi-001",
        target_type: "QUESTION",
        question_id: "WAR-001",
        business_function_code: "WAREHOUSE",
        created_at: now,
      },
    ],
    readinessChecks: [
      {
        id: "chk-001",
        project_id: projectId,
        category: "DATA",
        check_code: "DAT-01",
        title: "Kritik Soru Paketleri Tamamlanma Oranı",
        description: "Temel iş fonksiyonlarının en az %80 oranında cevaplanmış olması",
        status: "IN_PROGRESS",
        critical: 1,
        owner_role: "Baş Danışman",
        evidence_required: 0,
        action_required: 1,
        action_note: "Üretim ve Kalite soru paketleri tamamlanmalı.",
        due_date: "2026-10-15",
        notes: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "chk-002",
        project_id: projectId,
        category: "PROCESS",
        check_code: "PRC-01",
        title: "Uçtan Uca Süreç Haritaları Onayı",
        description: "O2C ve P2P ana süreç akışlarının onaylanmış olması",
        status: "READY",
        critical: 1,
        owner_role: "Süreç Yöneticisi",
        evidence_required: 1,
        action_required: 0,
        action_note: null,
        due_date: "2026-09-30",
        notes: null,
        created_at: now,
        updated_at: now,
      },
    ],
  };
}
