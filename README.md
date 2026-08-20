# ERP CRM Discovery

> **"ERP projesi yazılımla değil, doğru soruyla başlar."**  
> *(An ERP project starts with the right questions, not the software.)*

**ERP CRM Discovery**, kurumsal dönüşüm ve yazılım geçiş süreçleri öncesinde; süreç danışmanları, proje yöneticileri ve analistlerin saha ihtiyaçlarını sistematik, yapılandırılmış ve tekrar kullanılabilir biçimde toplamalarını sağlayan **ücretsiz, açık kaynaklı ve %100 çevrimdışı (offline-first)** masaüstü ön analiz uygulamasıdır.

Bu ürün bir ERP/CRM transactional operasyon yazılımı **değildir**; kurumsal dönüşümün başlangıcındaki keşif (discovery), olgunluk değerlendirmesi, kapsam belirleme, darboğaz/risk tespiti ve şartname hazırlık aşamalarını dijitalleştiren tarafsız (vendor-neutral) bir süreç analiz aracıdır.

---

## Temel Özellikler (Features)

- **22 Kanonik Soru Paketi / 928 Toplam Soru:** Satış, Satın Alma, Üretim, Depo, Kalite, Muhasebe, Finans, İK, Hukuk & Uyum ve daha fazlası — 22 standart kurumsal süreç alanını kapsayan, saha testlerinden geçmiş soru kütüphanesi.
- **Deklaratif Soru Paketi Motoru (Question Engine):** Kod yazmadan, tamamen açık JSON şeması ile genişletilebilir soru paketleri. Tekli seçim, çoklu seçim, açık uçlu metin, seçenek bazlı özel notlar ve genel görüşme notları.
- **Dinamik Koşullu Dallanma (Branching):** Şirketin yapısına göre ilgili olmayan soruları dinamik olarak gizleyen akıllı soru akışı.
- **Analiz Semantik Katmanı:** Ham soru-cevapların ötesinde yapılandırılmış **Bulgu (Finding)**, **Gereksinim (Requirement)**, **Risk** ve **Proje Notu** yönetimi.
- **Soru Takip Bayrakları:** 🟡 *Sonra Dön* ve 🔴 *Kritik Takip* bayrakları — saha görüşmesinde belirsizleri işaretleyip Bölüm 5 Açık Konular tablosuna otomatik taşıma.
- **Proje Özel Soruları:** Kanonik paketi bozmadan SQLite izolasyonunda müşteriye özel ek sorular.
- **Resumable Analiz & Autosave:** Kapatıp açınca kaldığı yerden devam etme; debounced otomatik kayıt.
- **Soru Navigatörü:** Modüller ve süreç grupları arasında hızlı atlama, tamamlanma durumu göstergesi.
- **Kesintisiz Çalışma (Offline Persistence):** Gömülü yerel SQLite veritabanı — ağ bağlantısı gerektirmez.
- **Profesyonel Dışa Aktarım (DOCX & PDF):**
  - **Microsoft Word (.docx):** Tamamen düzenlenebilir kurumsal başlık hiyerarşisi, renkli tablolar ve risk kartları.
  - **PDF (.pdf):** Yerel gömülü Liberation Sans TrueType fontu ile %100 kayıpsız Türkçe Unicode desteği; seçilebilir ve aranabilir vektörel metin — sıfır ağ bağımlılığı.
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
Database:         Lokal SQLite (@tauri-apps/plugin-sql / sqlx) — 15 tablo
Native I/O:       @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs
Reporting:        docx (npm), jsPDF + jsPDF-AutoTable (Embedded Liberation Sans TrueType)
Icons:            Lucide React
Test Runner:      tsx (TypeScript execute) — 31 test dosyası
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

# 2. Kanonik iş fonksiyonlarını (32 BF) TypeScript'e derleyin
npm run generate

# 3. Tam test suitini çalıştırın (31 dosya, 900+ assertion)
npm test

# 4. Web frontend'ini üretim için derleyin
npm run build

# 5. Rust backend denetimini yapın
cargo check --manifest-path src-tauri/Cargo.toml

# 6. Geliştirme sunucusunu başlatın (hot-reload)
npm run tauri dev
```

---

## Kanonik Soru Paketi Kataloğu (Question Pack Catalog)

`v0.1.0` itibarıyla **22 kanonik iş fonksiyonu** soru paketi ile mühürlenmiştir.  
Toplam: **928 soru**, **~462 zorunlu soru**, **116 koşullu dallanma (branching) noktası**.

| # | Modül | İş Fonksiyonu Kodu | Soru | Zorunlu | Branching |
|---|---|---|:---:|:---:|:---:|
| 01 | Satış | `SALES` | 38 | 21 | 4 |
| 02 | Satın Alma | `PROCUREMENT` | 40 | 20 | 9 |
| 03 | Depo Yönetimi | `WAREHOUSE` | 38 | 19 | 8 |
| 04 | Stok Yönetimi | `INVENTORY` | 37 | 19 | 2 |
| 05 | Sevkiyat & Lojistik | `LOGISTICS` | 37 | 19 | 5 |
| 06 | Muhasebe (Genel) | `ACCOUNTING` | 42 | 22 | 4 |
| 07 | Hazine & Nakit | `TREASURY` | 42 | 22 | 9 |
| 08 | Bütçe & Raporlama | `BUDGET_REPORTING` | 42 | 22 | 6 |
| 09 | Raporlama & Analitik | `REPORTING_ANALYTICS` | 42 | 22 | 5 |
| 10 | CRM | `CRM` | 42 | 22 | 5 |
| 11 | Teklif & Fiyatlama | `PROPOSALS` | 42 | 22 | 5 |
| 12 | Pazarlama | `MARKETING` | 42 | 22 | 6 |
| 13 | Tedarikçi Yönetimi | `SUPPLIER_MANAGEMENT` | 42 | 22 | 6 |
| 14 | Kalite Yönetimi | `QUALITY` | 42 | 22 | 6 |
| 15 | Bakım & Arıza | `MAINTENANCE` | 42 | 22 | 6 |
| 16 | Üretim Planlama | `PRODUCTION_PLANNING` | 44 | 24 | 5 |
| 17 | İş Emirleri | `WORK_ORDERS` | 45 | 24 | 5 |
| 18 | Maliyetlendirme | `COSTING` | 45 | 24 | 5 |
| 19 | Sabit Kıymet | `ASSET_MANAGEMENT` | 45 | 24 | 5 |
| 20 | İnsan Kaynakları | `HUMAN_RESOURCES` | 46 | 25 | 5 |
| 21 | Bordro & Maaş | `PAYROLL` | 47 | 26 | 5 |
| 22 | Hukuk & Uyum | `LEGAL_COMPLIANCE` | 46 | 25 | 6 |
| | **TOPLAM** | | **928** | **~462** | **116** |

> **Yol Haritası:** `v0.2.0` hedefinde ek 10 kanonik modül (BT Altyapısı, Proje Yönetimi, Ar-Ge, Sonrası Satış Servis, Müşteri Hizmetleri, Sektörel Paketler…) planlanmaktadır.

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
│   ├── engine/                  # Soru motoru (validator, branching, progress)
│   ├── export/                  # DOCX & PDF dışa aktarım motoru
│   ├── generated/               # npm run generate çıktısı (businessFunctions.ts)
│   └── report/                  # ReportModel ve formatter katmanı
├── src-tauri/                   # Tauri 2 Rust backend
│   └── src/                     # Native dialog, FS komutları
├── question-packs/tr/           # 22 kanonik JSON soru paketi
│   ├── sales/core.json
│   ├── legal_compliance/core.json
│   └── ... (22 modül)
├── data/
│   └── business-functions.json  # 32 BF kanonik registry (tek doğruluk kaynağı)
├── scripts/
│   └── generate_business_functions.mjs  # Kod üretici
├── test/                        # 31 TypeScript kabul testi
│   ├── faz2_tests.ts
│   ├── faz31_legal_compliance_question_pack_test.ts
│   └── ... (31 dosya)
└── docs/                        # Faz kapanış raporları & şema kılavuzları
```

### Veri Akışı

```
JSON Soru Paketi
      ↓
  Question Engine (validator · branching · progress)
      ↓
  React UI (soru navigatörü · cevap kayıt · takip bayrakları)
      ↓
  SQLite (autosave · resumable · proje özel sorular)
      ↓
  ReportModel (formatAnswer · ReportSummaryStats)
      ↓
  DOCX Exporter ──→ .docx (Word, düzenlenebilir)
  PDF Exporter  ──→ .pdf  (Liberation Sans · Türkçe UTF-8)
```

---

## Test Mimarisi (Test Suite)

Proje **"Tek Modül = Tek Faz = Tek Kabul"** disipliniyle geliştirilmiştir. Her kanonik modülün tam kabul testi mevcuttur.

```bash
npm test   # 31 test dosyası — tüm FAZ'lar
```

Her modül testi şu 14 alanı doğrular:

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
| `FAZ_11..FAZ_31_*_QUESTION_PACK.md` | Her modülün saha kılavuzu |

---

## Lisans (License)

- **Uygulama Kaynak Kodu:** [MIT License](LICENSE) — Copyright (c) 2026 ERP CRM Discovery Contributors.
- **Gömülü Liberation Sans Fontu:** GNU GPL v2 + Font Exception ([`licenses/FONT_LICENSE.txt`](licenses/FONT_LICENSE.txt)).
- **Üçüncü Taraf Bildirimleri:** [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
