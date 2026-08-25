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

- **34 Kanonik İş Fonksiyonu & 35 Soru Paketi (1.550 Soru):** Satış, Satın Alma, Üretim, Depo, Kalite, Muhasebe, Finans, İK, Hukuk & Uyum, BT, Proje Yönetimi, E-Dönüşüm, Faturalama & Gider, Doküman Yönetimi, İthalat & Gümrük, İhracat & Gümrük, E-Ticaret, Genel Yönetim & Kurumsal Yönetişim, Stratejik Planlama, Ana Veri Yönetimi ve Endüstriyel OT Veri Keşfi dahil 35 hazır soru paketi (831 zorunlu, 719 opsiyonel, 222 koşullu).
- **Deklaratif Soru Motoru (Question Engine):** Kod yazmadan, tamamen açık JSON şeması ile genişletilebilir soru paketleri. Tekli seçim, çoklu seçim, açık uçlu metin, seçenek bazlı özel notlar ve genel görüşme notları.
- **Tek Seçimli Cevabı Kaldırma (Clear Selection):** Yanlışlıkla yapılan seçimleri kolayca geri alma ve klavyeden `Escape` ile temizleme desteği.
- **Dinamik Koşullu Dallanma (222 Branching Noktası):** Şirketin yapısına göre ilgili olmayan soruları dinamik olarak gizleyen deterministik soru akışı.
- **Endüstriyel OT ve İstasyon Keşif Katmanı:** `Fabrika -> Alan -> Hat -> İstasyon -> Makine` hiyerarşisi, PLC/SCADA protokolleri, Dark Data, kestirimci bakım, OEE ve enerji analizörü veri gereksinimleri.
- **BPMN Süreç Haritaları & Benimseme Riski (Adoption Risk):** Onay döngüleri, karar düğümleri ve aktör çeşitliliğine göre otomatik süreç karmaşıklığı ve kullanıcı benimseme riski analizi.
- **Veri Sahipliği, Yetki ve SoD Yönetişim Katmanı:** 23 kanonik yönetişim nesnesi, As-Is/To-Be RACI sorumluluk matrisleri, efektif yetki sapması (discrepancy) analizi, parasal onay limitleri ve Görevler Ayrılığı (SoD) risk matrisi.
- **Saha Kanıtları ve Doğrulama Kayıt Defteri:** Soru bazlı eklenen dosyaları (PDF, Excel, resim vb.) Yönetilen Kanıt Kasası'nda (Managed Attachment Vault) SHA-256 bütünlüğüyle koruma ve kanıtsız kritik konuları tespit etme.
- **Pilot Saha Kabulü ve Go-Live Hazırlığı (Bölüm 7):** 8 alanda 24 kontrol maddesiyle keşif hazırlık skoru ve sorumlu rollerle öncelikli aksiyon planı.
- **Sentetik İmalat Saha Pilotu:** `Marmara Endüstriyel Sistemler A.Ş.` üzerinde 19 iş fonksiyonu, 94 soru cevabı, 11 OT istasyonu, 4 süreç haritası ve SoD çakışmalarıyla uçtan uca doğrulanmış referans saha senaryosu.
- **Külliyat Denetim Motoru (`npm run audit:corpus`):** 35 pakette 0 mükerrer ID, 0 bileşik anahtar çakışması ve 0 bozuk branching kuralı garantisi.
- **Kesintisiz Çalışma (Offline Persistence):** Gömülü yerel SQLite veritabanı (39 tablo, 19 migrasyon — Transaction & Rollback Korumalı) — sıfır ağ bağımlılığı.
- **Profesyonel Dışa Aktarım (DOCX & PDF):**
  - **Microsoft Word (.docx):** Tamamen düzenlenebilir kurumsal başlık hiyerarşisi, renkli tablolar, risk kartları ve kanıt ekleri tablosu.
  - **PDF (.pdf):** Yerel gömülü Liberation Sans TrueType fontu ile %100 kayıpsız Türkçe Unicode desteği; seçilebilir ve aranabilir vektörel metin.
- **Taşınabilir Proje Arşivi (.erpcrm Schema 19):** Sıfır bağımlılıklı saf POSIX USTAR + GZIP arşivleme ile tek tıkla tam yedekleme, geri yükleme ve şablon olarak çoğaltma.

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
Database:         Lokal SQLite (@tauri-apps/plugin-sql / sqlx) — 39 tablo, 19 migrasyon
Native I/O:       @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs, @tauri-apps/plugin-opener
Reporting:        docx (npm), jsPDF + jsPDF-AutoTable (Embedded Liberation Sans TrueType)
Icons:            Lucide React
Audit Engine:     scripts/audit_question_corpus.mjs
Test Runner:      tsx (TypeScript execute)
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

# 2. Kanonik iş fonksiyonlarını (33 BF) ve 34 soru paketini TypeScript'e derleyin
npm run generate

# 3. Soru külliyatı bütünlük denetimini çalıştırın
npm run audit:corpus

# 4. Tam test suitini çalıştırın (71 test suite, 2.120+ test)
npm test

# 5. Windows test paritesini doğrulayın
npm run test:windows

# 6. Web frontend'ini üretim için derleyin
npm run build

# 7. Rust backend denetimini yapın
cargo check --manifest-path src-tauri/Cargo.toml

# 8. Geliştirme sunucusunu başlatın (hot-reload)
npm run tauri dev
```


---

## Kanonik Soru Paketi Kataloğu (Question Pack Catalog)

`v0.1.4` itibarıyla **35 soru paketi** (34 kanonik iş fonksiyonu + 1 temel eğitim paketi) ile **34 kanonik iş fonksiyonunun tamamı (%100)** mühürlenmiştir. Sistemde eksik kanonik modül bulunmamaktadır.
Toplam: **1.550 soru**, **831 zorunlu soru** (%53.6), **719 opsiyonel soru** (%46.4), **222 koşullu dallanma (branching) noktası**.

### Kanonik İş Fonksiyonları (34 Modül) ve Temel Eğitim Paketi (1 Paket)

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
| 33 | Stratejik Planlama & Performans | `STRATEGY` | 47 | 25 | 8 | ✅ Mühürlü |
| 34 | Eğitim ve Gelişim Yönetimi | `TRAINING` | 47 | 25 | 8 | ✅ Mühürlü |
| 35 | Saha Veri Toplama & OT Keşfi | `OT_INDUSTRIAL_DATA` | 58 | 39 | 9 | ✅ Mühürlü |
| | **TOPLAM (35 Paket)** | | **1.550** | **831** | **222** | **%100 Kapsama** |

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
├── question-packs/tr/           # 33 kanonik JSON soru paketi
│   ├── sales/core.json
│   ├── invoicing/core.json
│   ├── document_management/core.json
│   ├── import/core.json
│   ├── export/core.json
│   ├── ecommerce/core.json
│   ├── management/core.json
│   ├── strategy/core.json
│   └── ... (33 paket)
├── data/
│   └── business-functions.json  # 33 BF kanonik registry (tek doğruluk kaynağı)
├── scripts/
│   └── generate_business_functions.mjs  # Kod üretici
├── test/                        # 59 TypeScript kabul testi (1.800+ test)
│   ├── vertical_slice_test.ts
│   ├── faz2_tests.ts
│   ├── faz41_ecommerce_question_pack_test.ts
│   ├── faz42_management_question_pack_test.ts
│   ├── faz43_strategy_question_pack_test.ts
│   ├── cross_pack_question_identity_test.ts
│   └── ... (59 dosya)
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
npm test   # 72 test suite (2.140+ test) — %100 PASS
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

## Dağıtım ve Dokümantasyon Belgeleri (Distribution & Documentation)

- **Türkçe Kullanıcı Kılavuzu:** [`docs/USER_GUIDE_TR.md`](docs/USER_GUIDE_TR.md)
- **Uzman Saha İnceleme Rehberi:** [`docs/review/FAZ67_EXPERT_FIELD_REVIEW_GUIDE.md`](docs/review/FAZ67_EXPERT_FIELD_REVIEW_GUIDE.md)
- **Soru Paketi İnceleme Matrisi:** [`docs/review/FAZ67_QUESTION_PACK_REVIEW_MATRIX.md`](docs/review/FAZ67_QUESTION_PACK_REVIEW_MATRIX.md)
- **Marmara Sentetik Pilot Kabul Rehberi:** [`docs/review/FAZ67_MARMARA_PILOT_ACCEPTANCE_GUIDE.md`](docs/review/FAZ67_MARMARA_PILOT_ACCEPTANCE_GUIDE.md)
- **Yayın Hazırlık Raporu (Release Readiness):** [`docs/release/FAZ67_RELEASE_READINESS_REPORT.md`](docs/release/FAZ67_RELEASE_READINESS_REPORT.md)
- **Windows Derleme & Dağıtım:** [`docs/WINDOWS_BUILD_RELEASE.md`](docs/WINDOWS_BUILD_RELEASE.md)
- **Windows Son Kullanıcı Kurulum Yardımı:** [`docs/guides/installation/WINDOWS_KURULUM_YARDIMI.txt`](docs/guides/installation/WINDOWS_KURULUM_YARDIMI.txt)
- **macOS Son Kullanıcı Kurulum Yardımı:** [`docs/guides/installation/MACOS_KURULUM_YARDIMI.txt`](docs/guides/installation/MACOS_KURULUM_YARDIMI.txt)



### Windows Managed Attachment Vault Manuel Doğrulama Listesi
Windows'ta installer ile kurulum yapıldıktan sonra `%LOCALAPPDATA%\ERP CRM Discovery\attachment` kökünde şu 5 adım doğrulanmalıdır:
1. **Otomatik Kök Oluşumu:** Uygulama açıldığında `%LOCALAPPDATA%\ERP CRM Discovery\attachment` klasörü otomatik olarak oluşuyor mu?
2. **Fiziksel Dijital İkiz:** Soru ekranında veya raporda dosya eklendiğinde dosyanın fiziksel ikizi `attachment/{projectId}/{bfCode}/{questionId}/{storedName}` altına kopyalanıyor mu?
3. **Kaynak Silinme Dayanıklılığı:** Kullanıcının orijinal kaynak dosyası silinse dahi rapordan veya soru ekranından managed kopya açılabiliyor mu?
4. **Klasörde Göster Entegrasyonu:** "Klasörde Göster" tıklandığında Windows Explorer doğrudan ilgili dosyayı seçili olarak açıyor mu?
5. **Dışa Aktarım Eşliği:** DOCX ve PDF raporlarındaki hyperlink'ler doğrudan managed kopyayı açıyor mu?

---

## Faz Kapanış Belgeleri (Phase Documentation)

Her geliştirme fazının kabul raporu [`docs/`](docs/) dizininde saklanmaktadır:

| Belge | Kapsam |
|---|---|
| [`FAZ_0_ARCHITECTURE_BLUEPRINT.md`](docs/FAZ_0_ARCHITECTURE_BLUEPRINT.md) | Temel mimari kararlar |
| [`FAZ_1_IMPLEMENTATION_REPORT.md`](docs/FAZ_1_IMPLEMENTATION_REPORT.md) | Core engine & SQLite |
| [`FAZ_11..FAZ_42_*_QUESTION_PACK.md`](docs/) | Her modülün saha kılavuzu |

---

## Proje ve İletişim (Project & Contact)

- **Proje:** ERP CRM Discovery
- **Açıklama:** Açık kaynaklı, %100 çevrimdışı ve yapay zekâ içermeyen ERP / CRM ön analiz ve saha keşif aracı.
- **Geliştirici ve Bakımcı:** Selim Koçak
- **E-posta:** `selimkocak@gmail.com`
- **Kaynak Kod Deposu:** [GitHub Repository](https://github.com/selimkocak/erp-crm-discovery)
- **Lisans:** [MIT License](LICENSE)
- **Katkı ve Hata Bildirimi:** Hata bildirimleri, öneriler ve yeni soru paketi katkıları için GitHub Issues ve Pull Request kanallarını kullanabilirsiniz ([`CONTRIBUTING.md`](CONTRIBUTING.md)).

---

## Lisans (License)

- **Uygulama Kaynak Kodu:** [MIT License](LICENSE) — Copyright (c) 2026 Selim Koçak (ERP CRM Discovery Contributors).
- **Gömülü Liberation Sans Fontu:** GNU GPL v2 + Font Exception ([`licenses/FONT_LICENSE.txt`](licenses/FONT_LICENSE.txt)).
- **Üçüncü Taraf Bildirimleri:** [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
