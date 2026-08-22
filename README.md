# ERP CRM Discovery

> **"ERP projesi yazılımla değil, doğru soruyla başlar."**  
> *(An ERP project starts with the right questions, not the software.)*

**ERP CRM Discovery**; ERP ve CRM dönüşüm projeleri öncesinde şirketlerin saha gerçeklerini, iş süreçlerini, ana verilerini, sorumluluklarını, risklerini, karar bekleyen konularını ve kanıt dokümanlarını sistematik biçimde toplamak için geliştirilmiş **açık kaynaklı (MIT lisanslı) ve offline-first** bir masaüstü keşif ve veri analiz aracıdır.

Bu ürün bir ERP/CRM işlemsel (transactional) operasyon yazılımı **değildir**; kurumsal dönüşümün başlangıcındaki keşif (discovery), olgunluk değerlendirmesi, kapsam belirleme, darboğaz/risk tespiti ve şartname hazırlık aşamalarını yapılandıran tarafsız (vendor-neutral) bir süreç analiz aracıdır.

---

## Temel İlkeler (Core Principles)

- **Field-first:** Önce sahadaki gerçek durumu ve fiili işleyişi keşfeder.
- **Data-first:** Cevapları yapılandırılmış, standart ve izlenebilir veri olarak saklar.
- **Analysis-first:** Cevaplardan rapor, bulgu, gereksinim, risk ve proje notu üretir.
- **Offline-first:** Offline-first çalışır; çekirdek uygulamanın bulut bağımlılığı yoktur.
- **Evidence-first:** Soru bazlı dosya ekleri, kanıt belgeleri ve yerel dosya kasasını (Attachment Vault) korur.
- **Human-led:** Nihai yorum, analiz sentezi, karar ve proje liderliği insandadır.
- **Open-source:** Kullanıcılar sistemi özgürce inceleyebilir, değiştirebilir ve kendi soru paketlerini geliştirebilir.

---

## Kapsam Dışı (Out of Scope)

ERP CRM Discovery'nin sınırları bilinçli ve net biçimde çizilmiştir:

- 🚫 **Yapay zekâ (AI) modeli içermez.**
- 🚫 **Otomatik yapay zekâ analizi yapmaz.**
- 🚫 **Kendiliğinden karar, tahmin veya yapay zekâ önerisi üretmez.**
- 🚫 **ERP/CRM operasyonel işlemlerini (sipariş girme, fatura kesme, stok hareketi vb.) çalıştırmaz.**
- 🚫 **Mali müşavirlik, vergi veya hukuk danışmanlığı vermez.**
- 🚫 **Şirket verilerini buluta veya harici sunuculara göndermez.**
- 🚫 **Kullanıcının yerine proje yöneticiliği yapmaz.**
- 🚫 **Saha görüşmesinin, yüz yüze mülakatın ve insan kararının yerini almaz.**

> **Mimari Konumlandırma Notu:**
> Bu proje özellikle ve bilinçli olarak AI-first tasarlanmamıştır. Güvenilir saha verisi, kanıt dokümanı ve insan tarafından doğrulanmış analiz oluşmadan yapay zekâ çıktısı üretmek projenin hedefi değildir. Kullanıcılar isterlerse dışarıda kendi AI, BI, raporlama veya entegrasyon katmanlarını geliştirebilir. ERP CRM Discovery’nin çekirdek sorumluluğu güvenilir keşif verisini üretmek ve taşınabilir biçimde sunmaktır.

---

## Temel Özellikler (Features)

- **33 Kanonik İş Fonksiyonu & 32 Soru Paketi (1.398 Soru):** Satış, Satın Alma, Üretim, Depo, Kalite, Muhasebe, Finans, İK, Hukuk & Uyum, BT, Proje Yönetimi, E-Dönüşüm, Faturalama & Gider, Doküman Yönetimi, İthalat & Gümrük, İhracat & Gümrük, E-Ticaret, Genel Yönetim & Kurumsal Yönetişim ve yatay Ana Veri Yönetimi dahil 32 hazır soru paketi.
- **Deklaratif Soru Motoru (Question Engine):** Kod yazmadan, tamamen açık JSON şeması ile genişletilebilir soru paketleri. Tekli seçim, çoklu seçim, açık uçlu metin, seçenek bazlı özel notlar ve genel görüşme notları.
- **Tek Seçimli Cevabı Kaldırma (Clear Selection):** Yanlışlıkla yapılan seçimleri kolayca geri alma ve klavyeden `Escape` ile temizleme desteği.
- **Dinamik Koşullu Dallanma (197 Branching Noktası):** Şirketin yapısına göre ilgili olmayan soruları dinamik olarak gizleyen deterministik soru akışı.
- **Semantik Analiz Katmanı:** Ham soru-cevapların ötesinde yapılandırılmış **Bulgu (Finding)**, **Gereksinim (Requirement)**, **Risk** ve **Proje Notu** yönetimi.
- **Soru Takip Bayrakları:** 🟡 *Sonra Dön* ve 🔴 *Kritik Takip* bayrakları — saha görüşmesinde belirsizleri işaretleyip Bölüm 5 Açık Konular tablosuna otomatik taşıma.
- **Yönetilen Kanıt Kasası (Managed Attachment Vault):** Soru bazlı eklenen dosyaları (PDF, Excel, resim vb.) proje dizininde izole kopyalayarak koruma ve belgelere `file:///` köprüsüyle doğrudan erişim.
- **Proje Özel Soruları:** Kanonik paketi bozmadan SQLite izolasyonunda müşteriye özel ek sorular tanımlama.
- **Resumable Analiz & Autosave:** Kapatıp açınca kalınan sorudan devam etme; debounced otomatik kayıt.
- **Soru Navigatörü:** Modüller ve süreç grupları arasında hızlı atlama, tamamlanma durumu göstergesi.
- **Kesintisiz Çalışma (Offline Persistence):** Gömülü yerel SQLite veritabanı (16 tablo, 8 migrasyon) — sıfır ağ bağımlılığı.
- **Profesyonel Dışa Aktarım (DOCX & PDF):**
  - **Microsoft Word (.docx):** Tamamen düzenlenebilir kurumsal başlık hiyerarşisi, renkli tablolar, risk kartları ve kanıt ekleri tablosu.
  - **PDF (.pdf):** Yerel gömülü Liberation Sans TrueType fontu ile %100 kayıpsız Türkçe Unicode desteği; seçilebilir ve aranabilir vektörel metin.
- **Yerel İşletim Sistemi Entegrasyonu:** Web indirme hack'leri yerine Tauri 2 Native Save Dialog ve doğrudan diske ikili yazma.

---

## Gizlilik ve Güvenlik İlkeleri (Privacy by Design)

- 🔒 **Sıfır Bulut Bağımlılığı (Zero Cloud / Offline-First):** Şirket ticari sırları, süreç zayıflıkları ve analiz verileri **yalnızca** kullanıcının kendi bilgisayarındaki yerel SQLite veritabanında saklanır. Hiçbir veri buluta gitmez.
- 🚫 **Telemetri ve Analitik Yok:** Uygulama hiçbir harici sunucuya kullanım istatistiği, analitik veya telemetri verisi göndermez.
- 🚫 **Kullanıcı Hesabı / Kayıt Zorunluluğu Yok:** Doğrudan indir, kur ve çevrimdışı çalış.
- 🛡️ **En Az Ayrıcalık (Least Privilege):** Tauri güvenlik modelinde harici ağ erişimi (`http`/`fetch`) tamamen kapatılmıştır.

---

## Teknoloji Altyapısı (Technology Stack)

```text
Frontend:         React 18 / TypeScript 5.x / Vite 6.x / Vanilla CSS (Design Tokens)
Desktop Engine:   Tauri 2 (Rust)
Database:         Lokal SQLite (@tauri-apps/plugin-sql / sqlx) — 16 tablo, 8 migrasyon
Native I/O:       @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs
Reporting:        docx (npm), jsPDF + jsPDF-AutoTable (Embedded Liberation Sans TrueType)
Icons:            Lucide React
Test Runner:      tsx (TypeScript execute) — 52 test suite (1.670+ test)
```

---

## Geliştirici Kurulumu (Development Setup)

Projeyi yerel Linux veya Windows makinenizde geliştirmek için:

### Önkoşullar

| Araç | Sürüm |
|---|---|
| Node.js | `v20.x LTS` |
| Rust Toolchain | `1.80+` |
| Platform derleme araçları (Linux) | `build-essential`, `libwebkit2gtk-4.1-dev`, `libssl-dev` |
| Platform derleme araçları (Windows) | Visual Studio Build Tools 2022, WebView2 |

### Komutlar

```bash
# 1. Depoyu klonlayın ve bağımlılıkları yükleyin
npm ci

# 2. Kanonik iş fonksiyonlarını (33 BF) ve 32 soru paketini TypeScript'e derleyin
npm run generate

# 3. Tam test suitini çalıştırın (52 test suite, 1.670+ test)
npm test

# 4. Windows test paritesini doğrulayın
npm run test:windows

# 5. Web frontend'ini üretim için derleyin
npm run build

# 6. Rust backend denetimini yapın
cargo check --manifest-path src-tauri/Cargo.toml

# 7. Geliştirme sunucusunu başlatın (hot-reload)
npm run tauri dev
```

---

## Kanonik Soru Paketi Kataloğu (Question Pack Catalog)

`v0.1.0` itibarıyla **33 kanonik iş fonksiyonu** tescil edilmiş, **32 soru paketi** mühürlenmiştir.
Toplam: **1.398 soru**, **742 zorunlu soru**, **656 opsiyonel soru**, **197 koşullu dallanma (branching) noktası**.

### Dikey Kanonik Modüller (31 Paket) ve Yatay Yönetişim (1 Paket)

| # | Modül | İş Fonksiyonu Kodu | Soru | Zorunlu | Branching | Durum |
|---|---|---|:---:|:---:|:---:|:---:|
| 01 | Satış | `SALES` | 38 | 21 | 4 | ✅ Mühürlü |
| 02 | Satın Alma | `PROCUREMENT` | 40 | 20 | 9 | ✅ Mühürlü |
| 03 | Depo Yönetimi | `WAREHOUSE` | 38 | 19 | 8 | ✅ Mühürlü |
| 04 | Stok Yönetimi | `INVENTORY` | 37 | 19 | 2 | ✅ Mühürlü |
| 05 | Sevkiyat & Lojistik | `LOGISTICS` | 37 | 19 | 5 | ✅ Mühürlü |
| 06 | Muhasebe (Genel) | `ACCOUNTING` | 42 | 22 | 4 | ✅ Mühürlü |
| 07 | Hazine & Nakit | `TREASURY` | 42 | 22 | 9 | ✅ Mühürlü |
| 08 | Bütçe & Raporlama | `BUDGET_REPORTING` | 42 | 22 | 6 | ✅ Mühürlü |
| 09 | Raporlama & Analitik | `REPORTING_ANALYTICS` | 42 | 22 | 5 | ✅ Mühürlü |
| 10 | CRM | `CRM` | 42 | 22 | 5 | ✅ Mühürlü |
| 11 | Teklif & Fiyatlama | `PROPOSALS` | 42 | 22 | 5 | ✅ Mühürlü |
| 12 | Pazarlama | `MARKETING` | 42 | 22 | 6 | ✅ Mühürlü |
| 13 | Tedarikçi Yönetimi | `SUPPLIER_MANAGEMENT` | 42 | 22 | 6 | ✅ Mühürlü |
| 14 | Kalite Yönetimi | `QUALITY` | 42 | 22 | 6 | ✅ Mühürlü |
| 15 | Bakım & Arıza | `MAINTENANCE` | 42 | 22 | 6 | ✅ Mühürlü |
| 16 | Üretim Planlama | `PRODUCTION_PLANNING` | 44 | 24 | 5 | ✅ Mühürlü |
| 17 | İş Emirleri | `WORK_ORDERS` | 45 | 24 | 5 | ✅ Mühürlü |
| 18 | Maliyetlendirme | `COSTING` | 45 | 24 | 5 | ✅ Mühürlü |
| 19 | Sabit Kıymet | `ASSET_MANAGEMENT` | 45 | 24 | 5 | ✅ Mühürlü |
| 20 | İnsan Kaynakları | `HUMAN_RESOURCES` | 46 | 25 | 5 | ✅ Mühürlü |
| 21 | Bordro & Maaş | `PAYROLL` | 47 | 26 | 5 | ✅ Mühürlü |
| 22 | Hukuk & Uyum | `LEGAL_COMPLIANCE` | 46 | 25 | 6 | ✅ Mühürlü |
| 23 | BT ve Altyapı | `INFORMATION_TECHNOLOGY` | 47 | 25 | 6 | ✅ Mühürlü |
| 24 | Ana Veri ve Veri Kalitesi | `MASTER_DATA_MANAGEMENT` *(Yatay)* | 47 | 25 | 7 | ✅ Mühürlü |
| 25 | Proje Yönetimi | `PROJECT_MANAGEMENT` | 47 | 25 | 7 | ✅ Mühürlü |
| 26 | E-Dönüşüm Yönetimi | `E_TRANSFORMATION` | 47 | 25 | 8 | ✅ Mühürlü |
| 27 | Faturalama ve Gider | `INVOICING` | 47 | 25 | 8 | ✅ Mühürlü |
| 28 | Doküman Yönetimi | `DOCUMENT_MANAGEMENT` | 47 | 27 | 8 | ✅ Mühürlü |
| 29 | İthalat ve Gümrük | `IMPORT` | 47 | 25 | 8 | ✅ Mühürlü |
| 30 | İhracat ve Gümrük | `EXPORT` | 47 | 25 | 8 | ✅ Mühürlü |
| 31 | E-Ticaret | `ECOMMERCE` | 47 | 25 | 8 | ✅ Mühürlü |
| 32 | Genel Yönetim & Kurumsal Yönetişim | `MANAGEMENT` | 47 | 25 | 7 | ✅ Mühürlü |
| | **TOPLAM (32 Paket)** | | **1.398** | **742** | **197** | |

> **Hazırlanıyor / Yol Haritası (2 Modül):**
> 1. Stratejik Planlama (`STRATEGY`)
> 2. Eğitim ve Gelişim (`TRAINING`)

---

## Soru Paketleri ve Açık Kaynak Katkı Modeli (Question Packs)

Bu projenin temel felsefesi:
> **"Bir ERP danışmanının soru paketi geliştirmek için Rust veya React bilmesi gerekmez."**

Süreç uzmanları yalnızca [`question-packs/`](question-packs/) dizini altındaki standart JSON şemasına uygun dosyaları düzenleyerek veya yeni sektörel paketler (örn: Otomotiv, Tekstil, Perakende, Sağlık) ekleyerek projeye katkı sağlayabilir.

### Soru Paketi JSON Şeması (Özet)

```jsonc
{
  "meta": {
    "pack_id": "tr.sales.core",
    "version": "0.1.0",
    "schema_version": "1",
    "language": "tr",
    "business_function_code": "SALES",
    "name": "Satış Süreci Ön Analizi"
  },
  "questions": [
    {
      "id": "SAL-001",
      "process": "Satış Organizasyonu",
      "question": "Satış süreciniz nasıl organize edilmiştir?",
      "answer_type": "single_choice",
      "required": true,
      "criticality": "high",
      "options": [
        { "value": "merkezi_satis_ekibi", "label": "Merkezi satış ekibi", "is_other": false }
      ]
    }
  ]
}
```

Detaylı şema kılavuzu: [`docs/QUESTION_PACK_SCHEMA_V1.md`](docs/QUESTION_PACK_SCHEMA_V1.md)  
Katkı kuralları: [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## Mimari Genel Bakış (Architecture)

```
erp-crm-discovery/
├── src/                         # React/TypeScript frontend
│   ├── components/              # UI bileşenleri (QuestionCard, ChoiceOption, Vault vb.)
│   ├── engine/                  # Soru motoru (validator, branching, progress, loader)
│   ├── export/                  # DOCX & PDF dışa aktarım motoru
│   ├── generated/               # npm run generate çıktısı (businessFunctions.ts, questionPacks.ts)
│   ├── report/                  # ReportModel ve formatter katmanı
│   ├── storage/                 # AttachmentManager ve Managed Attachment Vault
│   └── views/                   # Ekranlar (QuestionScreen, ReportPreviewView vb.)
├── src-tauri/                   # Tauri 2 Rust backend
│   └── src/                     # Native dialog, FS komutları
├── question-packs/tr/           # 32 kanonik JSON soru paketi
│   ├── sales/core.json
│   ├── invoicing/core.json
│   ├── document_management/core.json
│   ├── import/core.json
│   ├── export/core.json
│   ├── ecommerce/core.json
│   ├── management/core.json
│   └── ... (32 paket)
├── data/
│   └── business-functions.json  # 33 BF kanonik registry (tek doğruluk kaynağı)
├── scripts/
│   └── generate_business_functions.mjs  # Kod üretici
├── test/                        # 52 TypeScript kabul testi (1.670+ test)
│   ├── vertical_slice_test.ts
│   ├── faz2_tests.ts
│   ├── faz41_ecommerce_question_pack_test.ts
│   ├── faz42_management_question_pack_test.ts
│   ├── cross_pack_question_identity_test.ts
│   └── ... (52 dosya)
└── docs/                        # Faz kapanış raporları & şema kılavuzları
```

### Veri Akışı

```
JSON Soru Paketi
      ↓
  Question Engine (validator · branching · progress)
      ↓
  SQLite Persistence & Semantic Layer (finding / req / risk / followup)
      ↓
  ReportModel (formatters & stats)
      ↓
  Native Multi-format Export (DOCX · Liberation Sans UTF-8 PDF)
```

---

## Test Mimarisi (Test Suite)

Proje **"Tek Modül = Tek Faz = Tek Kabul"** disipliniyle geliştirilmiştir. Her kanonik modülün tam kabul testi mevcuttur.

```bash
npm test   # 52 test suite (1.670+ test) — tüm FAZ'lar
```

Her modül testi şu 15 alanı doğrular:

| # | Test Alanı |
|---|---|
| T01 | Pack Loading & Metadata Integrity |
| T02 | Validator Engine (0 schema hatası) |
| T03 | Question Quantity & Sequential IDs |
| T04 | Required / Optional Question Count |
| T05 | Choice Options & `is_other` Validation |
| T06 | Canonical Process Coverage |
| T07 | Branching Engine Resolution (tüm senaryolar) |
| T08 | Progress Calculation & `QuestionFollowup` Deduction |
| T09 | Cross-Pack Duplication Audit (0 mükerrer) |
| T10 | Custom Questions Adapter Compatibility |
| T11 | ReportModel & Formatting Truth (enum sızıntısı yok) |
| T12 | DOCX Generation & Integrity |
| T13 | PDF Generation & TrueType Unicode Extraction |
| T14 | Loader Registry Parity |
| T15 | Sınır Ayrımı (Cross-Pack Isolation Tests) |

---

## Dağıtım ve Windows Durumu (Windows Distribution)

- **Birincil Hedef:** Windows 11 x64 / Windows 10 x64.
- **Paketleme Formatı:** NSIS Setup Executable (`ERP-CRM-Discovery_0.1.0_x64-setup.exe`).
- **Mevcut Durum:** `v0.1.0 Release Candidate 1` — soru paketi külliyatı tamamlandı, Windows native acceptance aşamasında.
- **Kurulum Rehberi:** [`docs/WINDOWS_BUILD_RELEASE.md`](docs/WINDOWS_BUILD_RELEASE.md)
- **Kabul Kontrol Listesi:** [`docs/WINDOWS_RC_ACCEPTANCE_CHECKLIST.md`](docs/WINDOWS_RC_ACCEPTANCE_CHECKLIST.md)

---

## Faz Kapanış Belgeleri (Phase Documentation)

Her geliştirme fazının kabul raporu [`docs/`](docs/) dizininde saklanmaktadır:

| Belge | Kapsam |
|---|---|
| [`FAZ_0_ARCHITECTURE_BLUEPRINT.md`](docs/FAZ_0_ARCHITECTURE_BLUEPRINT.md) | Temel mimari kararlar |
| [`FAZ_1_IMPLEMENTATION_REPORT.md`](docs/FAZ_1_IMPLEMENTATION_REPORT.md) | Core engine & SQLite |
| [`FAZ_11..FAZ_42_*_QUESTION_PACK.md`](docs/) | Her modülün saha kılavuzu |

---

## Lisans (License)

- **Uygulama Kaynak Kodu:** [MIT License](LICENSE) — Copyright (c) 2026 ERP CRM Discovery Contributors.
- **Gömülü Liberation Sans Fontu:** GNU GPL v2 + Font Exception ([`licenses/FONT_LICENSE.txt`](licenses/FONT_LICENSE.txt)).
- **Üçüncü Taraf Bildirimleri:** [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
