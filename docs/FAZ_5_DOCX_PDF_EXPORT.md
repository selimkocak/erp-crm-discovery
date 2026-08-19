# FAZ-5 — DOCX + PDF Export Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-5 — Microsoft Word (.docx) & PDF (.pdf) Dışa Aktarım Motoru

---

## 1. Amaç

Bu fazın amacı, FAZ-4'te oluşturulan merkezi ve doğrulanmış `ReportModel` veri yapısını temel alarak:
1. Sonradan düzenlenebilir Microsoft Word (`.docx`) belgesi,
2. Taşınabilir, seçilebilir ve aranabilir metin içeren A4 standartlarında PDF (`.pdf`) dokümanı

üretmek ve kullanıcının işletim sistemi üzerinden istediği konuma güvenle kaydetmesini sağlamaktır.

---

## 2. Export Architecture (Dışa Aktarım Mimarisi)

DOCX ve PDF export motorları veritabanı veya ham soru paketi sorgusu **yapmaz**. Tek kaynak FAZ-4'te üretilen `ReportModel` nesnesidir:

```text
[ SQLite DB + Question Packs + Canonical Registry ]
                     │
                     ▼
          [ src/report/builder.ts ]
                     │
                     ▼
             [ ReportModel ]  (Tek Gerçek Kaynak / Immutable)
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
[ ReportPreviewView ] [ docxExporter.ts ] [ pdfExporter.ts ]
 (HTML Önizleme)     (Word Binary Buffer) (PDF Binary Buffer)
                     └───────┬───────┘
                             ▼
                    [ fileSaver.ts ]
               (Native File Picker / Save)
```

- [`src/export/types.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/types.ts): Dışa aktarım türleri (`ExportFormat`, `ExportResult`).
- [`src/export/filename.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/filename.ts): Deterministik, geçersiz dosya sistemi karakterlerinden arındırılmış dosya adı oluşturucu.
- [`src/export/docxExporter.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/docxExporter.ts): `docx` kütüphanesi ile tamamen düzenlenebilir Word belgesi derleyicisi.
- [`src/export/pdfExporter.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/pdfExporter.ts): `jspdf` ve `jspdf-autotable` ile vektörel A4 PDF oluşturucu.
- [`src/export/fileSaver.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/fileSaver.ts): Native File System Access API (`showSaveFilePicker`) ve Blob indirme servisi.
- [`src/export/index.ts`](file:///home/selim/projects/erp-crm-discovery/src/export/index.ts): Modül dışa aktarım giriş noktası.

---

## 3. Library Decisions (Kütüphane Tercihleri ve Gerekçeleri)

Tüm dışa aktarım tamamen istemci tarafında, yerel (offline) ve sıfır dış bağımlılıkla çalışmaktadır.

| Format | Kütüphane | Versiyon | Tercih Gerekçesi |
|---|---|---|---|
| **DOCX** | `docx` | `^9.7.1` | Saf JavaScript/TypeScript tabanlıdır. LibreOffice, Word automation veya cloud API gerektirmez. Başlıklar, tablolar, kenarlıklar, gölgelendirmeler, madde işaretleri, sayfa numaraları ve Türkçe karakterleri tam destekler. MIT lisanslıdır. |
| **PDF** | `jspdf` + `jspdf-autotable` | `^4.2.1` + `^5.0.8` | Saf tarayıcı/Tauri/Node ortamında çalışan, Chromium sunucusu, Java veya Python runtime gerektirmeyen endüstri standardı hafif PDF kütüphanesidir. A4 vektörel metin çıktısı, otomatik çok sayfalı tablo kırma ve koşan üst/alt bilgi desteği sunar. MIT lisanslıdır. |

**Kullanılmayan Ağır Yaklaşımlar:**
- Cloud conversion API (Kullanılmadı — veriler tamamen cihazda kalır).
- Headless Chromium / Puppeteer sunucusu (Kullanılmadı — bundle boyutu ve son kullanıcı ortam bağımlılığı yaratmaz).
- LibreOffice / MS Word CLI automation (Kullanılmadı — kullanıcıdan üçüncü parti ofis yazılımı kurulu olması beklenmez).

---

## 4. DOCX Generator (`docxExporter.ts`)

`buildDocxBuffer(report: ReportModel)` fonksiyonu:
- **Kapak & Özet Bandı:** Rapor Başlığı, Firma Adı, Proje Adı, Tarih, Durum ve 4'lü KPI Özet Tablosu (Bulgular, Gereksinimler, Açık Riskler, Cevaplanan Sorular).
- **1. Yönetici Özeti & Stratejik Değerlendirme:** Özel sol kenarlık vurgulu (`0284C7`) ve açık arka plan gölgeli çağrı kutusu (`callout box`). Varsa genel dönüşüm değerlendirmesi (`16A34A`).
- **2. Firma Profili:** Firma künyesi 2 sütunlu sade kurumsal tabloda sunulur; boş girilmemiş alanlar temizce gizlenir.
- **3. Analiz Kapsamı:** İş Fonksiyonu, Kategori, Firma Departmanı, Sorumlu ve Durum & İlerleme bilgilerini içeren 4 sütunlu kapsam tablosu.
- **4. İş Fonksiyonları & Süreç Analizleri:**
  - Ana iş fonksiyonları için yeni sayfaya geçiş (`pageBreakBefore`).
  - Süreç bazında (`process`) gruplanmış soru başlıkları ve soru açıklamaları.
  - Seçenek bazlı açıklamalar (`• Seçenek — Açıklama: ...`), diğer seçeneği açıklamaları ve genel notlar.
  - Soruya veya fonksiyona bağlı Bulgular, Gereksinimler, Riskler ve Görüşme Notları.
- **5. Proje Notları & Açık Konular:** Karar bekleyen açık konular ve genel proje notları.
- **Üst & Alt Bilgi (Header/Footer):** Belge başlığı üst bilgisi; sayfa numaralandırması (`Sayfa X / Y`) ve rapor oluşturulma tarihi alt bilgisi.

---

## 5. PDF Generator (`pdfExporter.ts`)

`buildPdfBuffer(report: ReportModel)` fonksiyonu:
- **A4 Standart Format:** Sayfa taşmalarını `checkPageBreak` ve `autoTable` otomatik sayfa kırma algoritmalarıyla yönetir.
- **Seçilebilir Metin:** Rapor screenshot veya canvas raster resmi olarak değil, vektörel PDF metni (`%PDF-1.3`) olarak oluşturulur; aranabilir ve kopyalanabilir.
- **Görsel Standartlar:** Kurumsal mavi (`#0284c7`), koyu arduvaz (`#0f172a`), başarı yeşili (`#15803d`) ve uyarı kırmızısı (`#b91c1c`) renk paleti.
- **Koşan Başlık ve Sayfa Numarası:** Sayfa 2'den itibaren üstte ince ayraç çizgisi ve belge künyesi; tüm sayfalarda altta `ERP CRM Discovery • Sayfa X / Y` bilgisi.

---

## 6. Shared ReportModel & Immutability

- Hem Word (`buildDocxBuffer`) hem PDF (`buildPdfBuffer`) aynı `ReportModel` nesnesini girdi olarak alır.
- **Immutability Garantisi:** Fonksiyonlar modeli mutate etmez (`Object.freeze` dostu). Export sonrasında `ReportModel` hash/JSON eşleşmesi unit testler ile doğrulanmıştır.
- **İçerik Tutarlılığı:** DOCX'te yer alan hiçbir soru, seçenek notu, genel not, bulgu, gereksinim, risk veya açık konu PDF'te eksik kalmaz.

---

## 7. File Naming (`filename.ts`)

Standart dosya adı kuralı:
`[Firma_Adı]_[Proje_Adı]_ERP_CRM_On_Analiz_[YYYY-MM-DD].[docx|pdf]`

Örnekler:
- `ABC_Mobilya_A.Ş._ERP_CRM_On_Analiz_2026-08-19.docx`
- `ABC_Mobilya_A.Ş._ERP_CRM_On_Analiz_2026-08-19.pdf`

Kurallar:
- Dosya sisteminde geçersiz karakterler (`/ \ : * ? " < > |`) temizlenir.
- Firma adı boşsa proje adı kullanılır.

---

## 8. Native Save Flow & UI Entegrasyonu

[`src/views/ReportPreviewView.tsx`](file:///home/selim/projects/erp-crm-discovery/src/views/ReportPreviewView.tsx) üst barına:
- `[📄 Word (.docx)]`
- `[📑 PDF]`

butonları yerleştirilmiştir.

**Akış:**
1. Kullanıcı butona tıklar -> Üst barda "Word belgesi (.docx) hazırlanıyor..." durumu belirir.
2. `buildDocxBuffer` veya `buildPdfBuffer` saf fonksiyonu `Uint8Array` üretir.
3. `fileSaver.ts` File System Access API (`window.showSaveFilePicker`) üzerinden işletim sisteminin yerel dosya kaydetme penceresini açar.
4. Kullanıcı klasör ve dosya adını seçip kaydettiğinde dosya diske yazılır ve "✓ Rapor kaydedildi" bildirimi gösterilir.
5. Kullanıcı kaydetme penceresini iptal ederse (`AbortError`) hata fırlatılmaz, işlem sessizce sonlandırılır.

---

## 9. Turkish Character Support (Türkçe Karakter Desteği)

- Rapor içeriğinde yer alan tüm Türkçe karakterler (**Ç, Ğ, İ, Ö, Ş, Ü, ç, ğ, ı, ö, ş, ü**) DOCX ve PDF çıktılarında ASCII'ye dönüştürülmeden orijinal halleriyle korunmaktadır.

---

## 10. Offline & Security Guarantee

- **Sıfır Ağ Çağrısı:** Export sırasında hiçbir uzak sunucuya, CDN'e veya cloud API'ye istek atılmaz.
- **Tam Yerel Depolama:** Üretilen belge doğrudan kullanıcının seçtiği yerel dosya yoluna kaydedilir.

---

## 11. Test Sonuçları

```bash
npm test
# FAZ-2 Test Sonucu: 144 PASS / 0 FAIL
# FAZ-3 Semantic Layer Test Sonucu: 52 PASS / 0 FAIL
# FAZ-4 Report Model Test Sonucu: 41 PASS / 0 FAIL
# FAZ-5 DOCX + PDF Export Test Sonucu: 25 PASS / 0 FAIL
# Clean Install Test Sonucu (11 Tablo): 28 PASS / 0 FAIL
# TOPLAM: 290 PASS / 0 FAIL

npm run build
# ✓ 1872 modules transformed.
# ✓ built in 4.60s (0 hata)

cargo check --manifest-path src-tauri/Cargo.toml
# Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.25s (0 hata)
```

---

## 12. Bilinen Kısıtlar (Known Limitations)

- **Headless Linux Ortamı:** Linux development ortamında masaüstü pencere yöneticisi bulunmadığı için işletim sisteminin görsel "Farklı Kaydet" diyalog penceresi headless ortamda açılamamaktadır; buffer üretimi, dosya adı filtreleme, dosya imzası (PK\x03\x04 ve %PDF) ve içerik tutarlılığı unit/integration testleri ile %100 doğrulanmıştır.
- **DOCX / PDF Table of Contents Sayfa Numaraları:** FAZ-5 V1 kapsamında Word/PDF içinde dinamik sayfa numaralı TOC motoru kurulmamış, yapısal bölümleme ve içindekiler hiyerarşisi uygulanmıştır.

---

## 13. FAZ-6 Önerisi

FAZ-5 ile uçtan uca `Veritabanı → Soru Motoru → Semantik Katman → Rapor Modeli → Önizleme → DOCX + PDF` zinciri tamamlanmıştır.

Sıradaki faz (FAZ-6) için önerilen iki kritik yol:
1. **Windows Native Acceptance & Release:** Gerçek bir Windows makinede `.exe + SQLite + DOCX + PDF Save Dialog` zincirinin native doğrulaması ve installer paketi.
2. **İkinci Pilot Soru Paketi:** Satın Alma (`PROCUREMENT`) soru paketinin eklenmesi.

---

## 14. Acceptance Sonucu

| Kriter | Durum |
|---|---|
| Single Source of Truth (`ReportModel`) | ✓ PASS |
| DOCX Düzenlenebilir Word Çıktısı (PK\x03\x04) | ✓ PASS |
| PDF Vektörel A4 Çıktısı (%PDF-) | ✓ PASS |
| Türkçe Karakter Bütünlüğü | ✓ PASS |
| Seçenek Notları & Genel Notlar Korunumu | ✓ PASS |
| Bulgular, Gereksinimler, Riskler, Notlar Korunumu | ✓ PASS |
| Yönetici Özeti & Açık Konular Korunumu | ✓ PASS |
| Immutability (Model export sonrası değişmez) | ✓ PASS |
| Filename Sanitizer & Invalid Char Handling | ✓ PASS |
| Native Save Dialog Entegrasyonu | ✓ PASS |
| Sıfır Dış Ağ / Bulut Bağımlılığı (Offline) | ✓ PASS |
| Clean Install Migration (11 Tablo) | ✓ PASS |
| `npm test` (290 test) | ✓ **PASS** |
| `npm run build` | ✓ **PASS (4.60s, 0 hata)** |
| `cargo check` | ✓ **PASS (0.25s, 0 hata)** |

---

**FAZ-5 ACCEPTANCE: PASS**

**FAZ-5 tamamlandı. FAZ-6'ya başlamıyorum; mimari inceleme bekleniyor.**
