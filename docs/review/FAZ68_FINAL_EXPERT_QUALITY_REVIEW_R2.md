# FAZ-68 — Son Uzman Kalite Kontrolü R2 (Adversarial Review)

**Tarih:** 25 Ağustos 2026  
**Denetim Modu:** Salt-Okunur / Adversarial Reviewer  
**Model:** Claude Opus 4.6 (Thinking) — Antigravity IDE  
**Referans Sözleşmeler:** `.agents/agents.md` Bölüm 2.3 (QA), `.agents/policies/testing-policy.md`, `.agents/policies/user-data-policy.md`, `.agents/workflows/verify-release.md`  
**Kapsam:** 35 Soru Paketi (1.550 Soru, 831 Zorunlu, 719 Opsiyonel, 222 Branching, 6.595 Seçenek), Progress Engine, Branching Engine, Managed Attachment Vault (Rust + TS), Rapor Paritesi (HTML/DOCX/PDF), UI/CSS, Offline/Zero-Egress Mimarisi.

> [!IMPORTANT]
> Bu rapor, önceki FAZ-68 R1 raporunun (READY_WITH_MANUAL_ACCEPTANCE) iddialarını bağımsız olarak yeniden denetler. R1'de "0 hata" olarak raporlanan alanlar burada kanıt bazlı doğrulanmış veya çeliştirilmiştir.

---

## GENEL SONUÇ

**`READY_WITH_MANUAL_ACCEPTANCE`** — 0 CRITICAL, 0 HIGH, 3 MEDIUM (UNVERIFIED), 20 LOW / IMPROVEMENT.

Statik kod incelemesi ve algoritmik külliyat taraması sonucunda üretim kodunda, veri modelinde ve branching zincirlerinde engelleyici hata bulunmamıştır. Ancak `.agents/policies/testing-policy.md` Madde 4 gereği, gerçek masaüstünde doğrulanmayan akışlar (Windows attachment, PDF/DOCX görsel mizanpaj, dar pencere modal davranışı) UNVERIFIED olarak sınıflandırılmış ve "PASS" veya "0 hata" olarak raporlanmamıştır.

### R1 Raporu ile Çelişen / Düzeltilen Noktalar

| R1 İddiası | R2 Bulgusu |
|:---|:---|
| "0 yapısal bulgu" | **20 LOW bulgu tespit edildi:** OT_INDUSTRIAL_DATA paketinde 18, SALES paketinde 2 single_choice sorusunda "Diğer" seçeneği eksik. |
| "6 çapraz paket benzer çift" | **7 çapraz paket benzer çift** (Jaccard ≥ %65). R1 raporu %70 eşik kullandığı için CRM:CRM-042 vs SUPPLIER_MANAGEMENT:SUP-042 çiftini (%67) kaçırmıştı. |
| "UI modal standardı %100 hazır" | **UNVERIFIED** — CSS kuralları incelendi ve doğru yapılandırılmış (`width: min(960px, calc(100vw - 32px))`), fakat gerçek ekran görüntüsü veya tarayıcı doğrulaması yok. |
| "Windows attachment doğrulandı" | **UNVERIFIED** — Windows Rust `explorer.exe` + `cmd /C start` kodu mevcut ve makul, fakat gerçek Windows ortamında test kanıtı yok. |
| "PDF/DOCX görsel render doğrulandı" | **UNVERIFIED** — Aynı `ReportModel` veri kaynağı doğrulandı, fakat sayfa kırılımları, tablo hizalamaları ve görsel mizanpaj gerçek çıktı dosyaları üzerinde denetlenmedi. |

---

## 1. SORU KÜLLİYATI

### 1.1 Bağımsız Sayım Doğrulaması

| Metrik | R1 İddiası | R2 Bağımsız Doğrulama | Durum |
|:---|:---|:---|:---:|
| Toplam Paket | 35 | **35** ✓ | VERIFIED |
| Toplam Soru | 1.550 | **1.550** ✓ | VERIFIED |
| Zorunlu | 831 (%53.6) | **831** ✓ (alan: `required`, kanonik şema ile uyumlu) | VERIFIED |
| Opsiyonel | 719 (%46.4) | **719** ✓ | VERIFIED |
| Branching (condition) | 222 | **222** ✓ | VERIFIED |
| Toplam Seçenek | 6.595 | **6.595** ✓ | VERIFIED |

**Kanıt:** Bağımsız Node.js script ile `question-packs/tr/*/core.json` dosyaları doğrudan okunarak sayıldı.  
**Zorunluluk Alanı Doğrulaması:** Kanonik JSON şeması `required: boolean` kullanır (örn. `SALES-001: required: true`). TypeScript tip tanımı [`engine/types.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/types.ts#L66) L66: `required: boolean`. SQLite özel sorularında farklı bir alan adı (`is_required`) kullanılır ve [`customQuestionAdapter.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/customQuestionAdapter.ts#L45) L45'te `required: cq.is_required === 1` ile kanonik formata dönüştürülür. Sayım scripti doğru alanı (`required`) kullanmaktadır.

### 1.2 Paket İçi ID Mükerrerliği

**Durum: VERIFIED — 0 mükerrer ID.**  
**Yöntem:** Her paketin `questions[].id` dizisi üzerinde `Set` uniqueness kontrolü yapıldı.

### 1.3 Paket İçi Birebir Metin Tekrarı

**Durum: VERIFIED — 0 birebir metin tekrarı.**  
**Yöntem:** Soru metinleri normalize edilerek (lowercase, noktalama temizliği) karşılaştırıldı.

### 1.4 Çapraz Paket Anlamsal Benzerlik

**Durum: VERIFIED — 7 çapraz paket benzer çift (Jaccard ≥ %65), tümü bilinçli sınır ayrımı.**

| # | Çift | Benzerlik | Değerlendirme |
|:---:|:---|:---:|:---|
| 1 | `EXPORT:EXP-021` ↔ `IMPORT:IMP-013` | %85 | Bilinçli Ayrım: İhracat gümrük vs İthalat gümrük entegrasyonu |
| 2 | `EXPORT:EXP-047` ↔ `IMPORT:IMP-047` | %85 | Bilinçli Ayrım: İhracat departmanı ERP beklentisi vs İthalat |
| 3 | `EXPORT:EXP-019` ↔ `IMPORT:IMP-010` | %75 | Bilinçli Ayrım: Çıkış lojistik modları vs Giriş lojistik modları |
| 4 | `EXPORT:EXP-015` ↔ `IMPORT:IMP-009` | %74 | Bilinçli Ayrım: Satış Incoterms vs Satın alma Incoterms |
| 5 | `CRM:CRM-042` ↔ `MARKETING:MKT-042` | %71 | Bilinçli Ayrım: CRM vizyonu vs Pazarlama vizyonu |
| 6 | `PROPOSALS:PRP-042` ↔ `QUALITY:QLT-042` | %69 | Bilinçli Ayrım: Teklif vizyonu vs Kalite vizyonu |
| 7 | `CRM:CRM-042` ↔ `SUPPLIER_MANAGEMENT:SUP-042` | %67 | Bilinçli Ayrım: CRM vizyonu vs SRM vizyonu |

**Yöntem:** Jaccard token benzerliği (Türkçe stop-word filtrelemesiyle), %65 eşik.  
**Not:** R1 raporu %70 eşik kullanarak çift #7'yi kaçırmıştı.

### 1.5 Soru Kalitesi

**Durum: VERIFIED (algoritmik ölçütlerle), UNVERIFIED (saha terminolojisi uzman değerlendirmesi).**  
**Açıklama:** Algoritmik olarak her sorunun 10+ karakter metin içerdiği, tek bir `answer_type` belirlediği ve geçerli seçenek setine sahip olduğu doğrulandı. Ancak 1.550 sorunun sektör uzmanı gözüyle tek tek terminoloji, anlaşılabilirlik ve cevaplanabilirlik değerlendirmesi bu statik denetimin kapsamı dışındadır.

---

## 2. CEVAP SEÇENEKLERİ VE BRANCHING

### BULGU-R2-01: OT_INDUSTRIAL_DATA Paketinde "Diğer" Seçeneği Eksikliği (İyileştirme Önerisi)

- **ID:** `BULGU-R2-01`
- **Alan:** Cevap Seçenekleri — İyileştirme (IMPROVEMENT)
- **Dosya / Soru ID:** `question-packs/tr/ot_industrial_data/core.json` — OTD-005, OTD-009, OTD-011, OTD-019, OTD-021, OTD-023, OTD-024, OTD-025, OTD-026, OTD-028, OTD-030, OTD-031, OTD-039, OTD-043, OTD-044, OTD-046, OTD-050, OTD-053
- **Kanıt:** 18 adet `single_choice` sorusunda 4+ seçenek var ancak `is_other: true` veya `value: "other"` seçeneği yok. Örneğin `OTD-005` "kaç ana üretim hattı bulunmaktadır?" sorusunda seçenekler 1–3, 4–10, 11–25, 25+ aralıklarından oluşmaktadır.
- **Etki:** Kullanıcı kendi durumunu seçeneklerden hiçbiriyle eşleştiremezse serbest metin girişi yapamaz. Ancak bu sorular teknik/endüstriyel kapalı aralıklı sorulardır ve seçenekler tam kapsamı çoğunlukla karşılar.
- **Durum:** `VERIFIED`
- **Öncelik:** `LOW / IMPROVEMENT` (yapısal kusur değil, kullanılabilirlik iyileştirme önerisi)
- **Önerilen Düzeltme:** Kullanıcı kolaylığı için bir sonraki minör sürümde seçili sorulara opsiyonel "Diğer" seçeneği eklenebilir.
- **R1 Notu:** R1 raporu bu sorular için "0 yapısal bulgu" raporlamıştı; burada yapısal kusur olarak değil, iyileştirme önerisi olarak sınıflandırılmıştır.

### BULGU-R2-02: SALES Paketinde "Diğer" Seçeneği Eksikliği (İyileştirme Önerisi)

- **ID:** `BULGU-R2-02`
- **Alan:** Cevap Seçenekleri — İyileştirme (IMPROVEMENT)
- **Dosya / Soru ID:** `question-packs/tr/sales/core.json` — SALES-003, SALES-024
- **Kanıt:** 2 adet `single_choice` sorusunda 4 seçenek var, `is_other` yok.
- **Etki:** Düşük — SALES-003 "Müşteriler segmentlere ayrılıyor mu?" sorusunda 4 seçenek kapsamlı ve yetersiz kalan durumlar not alanıyla (`allow_note`) telafi edilebilir.
- **Durum:** `VERIFIED`
- **Öncelik:** `LOW / IMPROVEMENT` (yapısal kusur değil, iyileştirme önerisi)
- **Önerilen Düzeltme:** Not defterine erişim yeterli olabilir; uzman değerlendirmesine bırakılabilir.

### 2.2 Option Value/Label Bütünlüğü

**Durum: VERIFIED — 0 boş value, 0 boş label, 0 mükerrer value.**  
**Yöntem:** 6.595 seçenek üzerinde `Set` uniqueness ve `trim().length > 0` kontrolü yapıldı.

### 2.3 Branching Zinciri Bütünlüğü

**Durum: VERIFIED — 222/222 koşullu soru geçerli.**

**Branching Alan Dağılımı:**

| Alan | Kullanım Sayısı | Açıklama |
|:---|:---:|:---|
| `condition` | **222** | Kanonik branching mekanizması (`question_id` + `operator` + `value`) |
| `depends_on` | **0** | Hiçbir soru paketinde kullanılmamaktadır |
| Her ikisi birden | **0** | Çakışma yok |
| Koşulsuz soru | **1.328** | Koşulsuz, her zaman görünür |

**Yöntem:** Her `condition.question_id` referansının aynı paketin soru listesinde var olduğu ve `condition.value` değerinin parent sorunun `options[].value` listesinde bulunduğu doğrulandı. `depends_on` alanı hiçbir pakette kullanılmadığından ayrı doğrulama gerektirmemiştir.  
**Kanıt:** Bağımsız Node.js script çıktısı: `condition only: 222, depends_on only: 0, both: 0, neither: 1328`.  
**Motor Uyumu:** [`src/engine/branching.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/branching.ts#L14-L47) `isQuestionVisible()` fonksiyonu `question.condition` alanını okur; `depends_on` alanını kullanmaz. Dolayısıyla veri ile motor arasında alan uyuşmazlığı yoktur.

---

## 3. SORU NAVİGASYONU

### 3.1 Visited ≠ Answered Kuralı

- **Durum:** `VERIFIED`
- **Dosya:** [`src/engine/progress.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/progress.ts#L19-L63) — `hasProvidedAnswer()`
- **Kanıt:** Fonksiyon `answerData` yoksa `false` döner. `single_choice`/`multiple_choice` için `selected` dizisinde en az bir geçerli (trim uzunluğu > 0) değer arar. `text`/`number` için `text.trim().length > 0` kontrol eder. Salt görüntüleme ("visited") hiçbir koşulda `true` döndürmez.

### 3.2 Geçerli Cevap Tanımı

- **Durum:** `VERIFIED`
- **Dosya:** [`src/engine/progress.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/progress.ts#L19-L63)
- **Kanıt:** 
  - `single_choice` / `multiple_choice`: `selected[]` dizisinde en az 1 geçerli value
  - `text` / `textarea` / `number`: `text.trim().length > 0`
  - "Diğer" (`is_other`) seçilmişse: `note` alanı boş olamaz
  - Bayrak açık (🟡/🔴) ise: `isQuestionAnswered()` `false` döner (L77-79)

### 3.3 Cevap Silinince Sayaç ve Tik Düşüşü

- **Durum:** `VERIFIED` (kod akışı bazlı)
- **Dosya:** [`src/components/QuestionNavigator.tsx`](file:///home/selim/projects/erp-crm-discovery/src/components/QuestionNavigator.tsx#L86-L92) ve [`src/engine/progress.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/progress.ts#L112-L130)
- **Kanıt:** Navigatör, `isQuestionAnswered(q, answers.get(q.id), fol)` üzerinden reaktif hesaplar. `answers` Map'i React state'i olduğundan, cevap silinince state güncellenir → `isQuestionAnswered` `false` döner → yeşil tik (`CheckCircle2`) yerine gri daire (`Circle`) veya uyarı (`AlertCircle`) render edilir → `totalAnsweredCount` düşer. **Ancak bu akışın canlı UI'da gerçek zamanlı doğrulaması yapılmamıştır.**

### 3.4 Modüle Girişte İlk Cevapsız Soruya Konumlanma (Smart Resume)

- **Durum:** `VERIFIED`
- **Dosya:** [`src/views/QuestionScreen.tsx`](file:///home/selim/projects/erp-crm-discovery/src/views/QuestionScreen.tsx#L199-L209)
- **Kanıt:** L200-201: `allInitial.findIndex((q) => !hasProvidedAnswer(q, mergedAnswers.get(q.id)))` — görünür soru listesinde ilk cevapsız sorunun indeksini bulur ve `setCurrentIndex` ile konumlanır. Tüm sorular cevaplıysa son soruya gider (L208).

### 3.5 Koşullu Görünmeyen Soruların Sayaçtan Çıkarılması

- **Durum:** `VERIFIED`
- **Dosya:** [`src/engine/branching.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/branching.ts#L53-L60) → [`src/engine/progress.ts`](file:///home/selim/projects/erp-crm-discovery/src/engine/progress.ts#L112-L130)
- **Kanıt:** `calculateProgress()` fonksiyonu `visibleQuestions` parametresi alır (L112). Bu parametre `getVisibleQuestions()` tarafından filtrelenir ve koşullu görünmeyen sorular zaten listeden çıkarılmıştır. Sayaç yalnızca `requiredVisible` üzerinden hesaplanır (L117).

### 3.6 UI State ile SQLite Kaydı Arasında Tutarsızlık Riski

- **Durum:** `VERIFIED` (düşük risk)
- **Kanıt:** Cevap yazma işlemi `QuestionScreen.tsx` içinde `saveAnswer` callback'inde gerçekleşir ve hem `answers` React state'ini hem SQLite'ı günceller. Potential race condition: Kullanıcı çok hızlı ard arda cevap değiştirirse asenkron SQLite yazması ile React state arasında geçici tutarsızlık olabilir, ancak her `loadData` çağrısında SQLite'tan taze okuma yapıldığından kalıcı veri kaybı riski düşüktür.

---

## 4. ATTACHMENT / MANAGED VAULT

### 4.1 Dosya Ekleme → Vault Kopyası → SHA-256 → SQLite Zinciri

- **Durum:** `VERIFIED` (kod akışı bazlı)
- **Dosyalar:**
  - [`src/storage/attachmentManager.ts`](file:///home/selim/projects/erp-crm-discovery/src/storage/attachmentManager.ts) — `importFileToManagedVault()`, `saveAttachmentFile()`
  - [`src-tauri/src/lib.rs`](file:///home/selim/projects/erp-crm-discovery/src-tauri/src/lib.rs#L66-L127) — `save_attachment_to_vault()`
- **Kanıt:** Rust tarafında dosya fiziksel olarak yazılır → varlık kontrolü (L99) → sıfır bayt reddi (L107-110) → SHA-256 hesaplanır (L112-117) → `VaultWriteResult` döner. Frontend tarafında SQLite kaydı ancak Rust `VaultWriteResult.success == true` döndükten sonra yazılır.

### 4.2 Platform Bazlı Değerlendirme

| Platform | Kod Varlığı | Runtime Doğrulama | Durum |
|:---|:---:|:---:|:---|
| **macOS** (`/usr/bin/open`, `open -R`) | ✓ | ✓ (Manuel DMG testi tamamlanmış) | **VERIFIED** |
| **Windows** (`explorer.exe`, `cmd /C start`) | ✓ | ✗ (Gerçek paket testi yapılmamış) | **UNVERIFIED** |
| **Linux** (`xdg-open`) | ✓ | ✗ | **UNVERIFIED** |

### 4.3 Kaynak Dosya Taşındığında Davranış

- **Durum:** `DESIGN_VERIFIED` (mimari tasarım gereği doğrulanmış, runtime testi yapılmamış)
- **Kanıt:** Managed Vault mimarisi, kaynak dosyanın fiziksel kopyasını `attachment/{projectId}/{bfCode}/{questionId}/{uuid}_{safeFileName}` altına alır. SQLite yalnızca bu göreli yolu saklar. Kaynak dosya taşınsa veya silinse dahi Vault kopyası etkilenmez.
- **Not:** Kod akışı tasarım gereği kaynak dosyadan bağımsızlık sağlar, ancak bu davranış gerçek masaüstü ortamında (dosya seçimi → silme → tekrar açma döngüsü) runtime test ile doğrulanmamıştır.

### 4.4 Fiziksel Dosya Eksikliğinde Hata Davranışı

- **Durum:** `VERIFIED`
- **Dosya:** [`src-tauri/src/lib.rs`](file:///home/selim/projects/erp-crm-discovery/src-tauri/src/lib.rs#L218-L255) L208-213, [`src/storage/attachmentLinks.ts`](file:///home/selim/projects/erp-crm-discovery/src/storage/attachmentLinks.ts)
- **Kanıt:** Rust `open_attachment_path` ve `show_attachment_in_folder` fonksiyonları dosya varlığını kontrol eder (`p.exists()`) ve yoksa açıklayıcı Türkçe hata döner. Frontend `openAttachment()` fonksiyonunda Rust hatası yakalanır ve kullanıcıya "Kanıt dosyası yerel Attachment Vault içinde bulunamadı" uyarısı gösterilir.

### 4.5 Path Traversal Koruması

- **Durum:** `VERIFIED`
- **Dosya:** [`src-tauri/src/lib.rs`](file:///home/selim/projects/erp-crm-discovery/src-tauri/src/lib.rs#L28-L53) — `resolve_target_vault_path()`
- **Kanıt:** `..` ve `\0` içeren yollar reddedilir (L31). Çözümlenen hedef yolun `vault_root` altında olduğu `starts_with()` ile doğrulanır (L49-51).

---

## 5. RAPOR PARİTESİ

### 5.1 Tek Doğruluk Kaynağı (Single Source of Truth)

- **Durum:** `VERIFIED`
- **Kanıt:**
  - HTML: [`ReportPreviewView.tsx`](file:///home/selim/projects/erp-crm-discovery/src/views/ReportPreviewView.tsx#L128) — `buildReportModel(projectId, ...)`
  - DOCX: [`docxExporter.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/docxExporter.ts#L193) — `buildDocxBuffer(report: ReportModel)`
  - PDF: [`pdfExporter.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/pdfExporter.ts#L17) — `buildPdfBuffer(report: ReportModel)`
  - Export: [`export/index.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/index.ts#L21-L42) — `exportReport()` aynı `report` nesnesini geçirir
  - **Tüm formatlar aynı `ReportModel` tipini tüketir.** Rapor modeli [`builder.ts`](file:///home/selim/projects/erp-crm-discovery/src/report/builder.ts#L108) içinde tek bir `buildReportModel()` fonksiyonuyla üretilir.

### 5.2 Branching Filtresi Raporda Korunuyor mu?

- **Durum:** `VERIFIED`
- **Kanıt:** [`builder.ts`](file:///home/selim/projects/erp-crm-discovery/src/report/builder.ts#L280) L280: `getVisibleQuestions(loadedPack.questions, canonicalAnswersMap)` — rapor modelinde koşullu görünmeyen sorular filtrelenir.

### 5.3 Undefined / Null Sızıntısı Riski

- **Durum:** `VERIFIED` (düşük risk)
- **Kanıt:** DOCX ve PDF exporterlarında `|| ""` guard'ı 35'er kez kullanılmaktadır. `formatStatusLabel` fonksiyonu 4'er kez çağrılmaktadır. `Belirtilmedi` / `N/A` fallback'leri mevcuttur.
- **Not:** %100 garanti yalnızca gerçek rapor çıktısı incelenerek verilebilir.

### 5.4 Görsel Mizanpaj Doğrulaması

- **Durum:** `UNVERIFIED`
- **Açıklama:** Sayfa kırılımları, tablo genişlikleri, Türkçe karakter render'ı ve boş tablo davranışı gerçek dosya üretimi ve görsel inceleme gerektirir. Statik kod analizi ile doğrulanamaz.

---

## 6. UI / CSS

### 6.1 Modal Standardizasyonu

- **Durum:** `VERIFIED` (CSS kuralları bazlı), `UNVERIFIED` (gerçek render)
- **Dosya:** [`src/index.css`](file:///home/selim/projects/erp-crm-discovery/src/index.css#L1834-L1893)
- **Kanıt:** 
  - Temel modal: `width: min(960px, calc(100vw - 32px))`, `max-height: calc(100vh - 48px)`, `overflow: hidden`
  - Form wrapper: `overflow: hidden`, `flex: 1 1 auto`
  - SM/MD/LG/XL varyantları tanımlanmış
  - Overlay: `padding: 1rem`, `position: fixed`, `inset: 0`
- **Sınır:** CSS kuralları doğru yapılandırılmış, ancak tüm 21 modalın gerçek ekran boyutlarındaki davranışı tarayıcı veya masaüstü testi olmadan kesinleştirilemez.

### 6.2 Form Elemanları Taşması

- **Durum:** `UNVERIFIED`
- **Açıklama:** Input/select/textarea elementlerinin modal dışına taşıp taşmadığı gerçek render gerektiren bir denetimdir.

---

## 7. OFFLINE / ZERO-EGRESS

- **Durum:** `VERIFIED`
- **Yöntem:** `src/` ve `src-tauri/src/` altında `fetch(`, `axios`, `XMLHttpRequest`, `sendBeacon`, `analytics`, `telemetry`, `sentry`, `openai`, `anthropic`, `gemini.google` aranmıştır.
- **Sonuç:** **0 harici API çağrısı, 0 telemetri, 0 analytics, 0 AI SDK.**
- **Tek harici URL:** [`AboutModal.tsx`](file:///home/selim/projects/erp-crm-discovery/src/components/AboutModal.tsx#L227) L227 — `https://github.com/selimkocak/erp-crm-discovery` (kullanıcı tıklamasıyla harici tarayıcıda açılır, otomatik veri göndermez).
- **SVG namespace:** `AppLogo.tsx` L16 — `http://www.w3.org/2000/svg` (SVG XML namespace, ağ isteği değil).

---

## 8. BULGU ÖZETİ

| ID | Alan | Dosya / Soru ID | Kanıt | Etki | Durum | Öncelik |
|:---|:---|:---|:---|:---|:---:|:---:|
| R2-01 | Cevap Seçenekleri | OT_INDUSTRIAL_DATA: OTD-005..053 (18 soru) | `single_choice` 4+ opt, `is_other` yok | Kullanıcı serbest metin giremez | VERIFIED | LOW / IMPROVEMENT |
| R2-02 | Cevap Seçenekleri | SALES: SALES-003, SALES-024 | `single_choice` 4 opt, `is_other` yok | Düşük — not alanı mevcut | VERIFIED | LOW / IMPROVEMENT |
| R2-03 | Çapraz Paket | CRM:CRM-042 ↔ SUP:SUP-042 | Jaccard %67 | R1'de kaçırılmış (bilinçli sınır) | VERIFIED | LOW |
| R2-04 | Rapor Paritesi | DOCX/PDF görsel mizanpaj | Gerçek çıktı incelenmedi | Tablo/sayfa kırılım riski | UNVERIFIED | MEDIUM |
| R2-05 | UI/CSS | 21 modal dar pencere davranışı | Gerçek render testi yok | Form taşması riski | UNVERIFIED | MEDIUM |
| R2-06 | Attachment | Windows Managed Vault | Kod doğru, runtime test yok | Dosya açma/gösterme riski | UNVERIFIED | MEDIUM |
| R2-07 | Attachment | Kaynak dosya taşınma izolasyonu | Mimari tasarım doğru, runtime test yok | Düşük | DESIGN_VERIFIED | LOW |

---

## 9. YÖNETİCİ ÖZETİ

### Doğrulanan Güvenceler (11 VERIFIED)

1. ✅ 1.550 soru, 831 zorunlu, 222 branching — sayılar birebir doğrulandı
2. ✅ 0 mükerrer soru ID, 0 birebir metin tekrarı
3. ✅ 222/222 branching koşulu geçerli (parent soru ve value doğrulanmış)
4. ✅ 0 boş option value, 0 boş option label, 0 mükerrer option value
5. ✅ Visited ≠ Answered: `hasProvidedAnswer()` salt görüntülemeyi cevap saymıyor
6. ✅ Smart Resume: Modüle girişte ilk cevapsız soruya konumlanıyor
7. ✅ Koşullu sorular sayaçtan çıkarılıyor (`getVisibleQuestions` + `calculateProgress`)
8. ✅ HTML/DOCX/PDF aynı kanonik `ReportModel` veri modelini tüketiyor
9. ✅ Managed Vault SHA-256 bütünlük zinciri mevcut ve sağlam
10. ✅ %100 Offline / Zero-Egress: 0 harici API, 0 telemetri, 0 AI runtime
11. ✅ Path traversal koruması aktif (Rust + Frontend)

### Doğrulanamayan Alanlar (3 UNVERIFIED)

1. ⚠ Windows ortamında attachment ekleme, açma ve Managed Vault doğrulaması
2. ⚠ PDF/DOCX görsel mizanpaj kalitesi (sayfa kırılımları, tablo hizalamaları)
3. ⚠ 21 modalın dar pencere ve yüksek DPI ekranlardaki görsel durumu

### İyileştirme Önerileri (20 LOW / IMPROVEMENT)

- 18 OT_INDUSTRIAL_DATA + 2 SALES sorusunda kapalı `single_choice` seçenek setinde "Diğer" seçeneği eksik.
- Bu sorular teknik/endüstriyel olup seçenekler genellikle kapalı aralıklar veya enum'lardır; fonksiyonel açıdan engelleyici değildir.
- Yapısal kusur olarak değil, kullanılabilirlik iyileştirme önerisi olarak sınıflandırılmıştır.

---

## 10. SON SINIFLANDIRMA

```
+=========================================================================+
|                   FAZ-68 R2 SON YAYIN KARARI                            |
+=========================================================================+
|  DURUM           : READY_WITH_MANUAL_ACCEPTANCE                         |
|  SÜRÜM           : v0.1.4                                               |
|  KRİTİK / HIGH   : 0 / 0                                                |
|  MEDIUM           : 3 (tümü UNVERIFIED — runtime test gerektirir)        |
|  LOW / IMPROVEMENT : 20 (eksik "Diğer" seçeneği — iyileştirme önerisi)   |
|  GÜVENLİK/GİZLİLİK: %100 Çevrimdışı, Zero-Egress, 0 AI Runtime          |
|  KOŞUL            : Windows paketi, PDF/DOCX görsel, modal dar pencere   |
|                     doğrulamaları tamamlanmalı                            |
+=========================================================================+
```

**Karar:** Kod tabanı ve soru külliyatı yayın öncesi tüm algoritmik ve statik denetimleri sağlam bir şekilde geçmiştir. macOS DMG doğrulaması tamamlanmıştır. `v0.1.4` tag'i ve GitHub Release için Windows paketi, Marmara pilotu ve rapor görsel mizanpajı üzerindeki kısa manuel kabul adımları zorunludur.

---

*Bu raporda hiçbir üretim kodu, soru paketi veya veritabanı şeması değiştirilmemiştir. `.agents/agents.md` Bölüm 2.3 QA rolü sınırlarına uyulmuştur.*
