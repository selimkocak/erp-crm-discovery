# FAZ-4 — Rapor Veri Modeli + Ön Analiz Raporu Önizleme

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-4 — Rapor Veri Modeli + Ön Analiz Raporu Önizleme

---

## 1. Amaç

Bu fazın amacı, sahadan toplanan firma profili, analiz kapsamı, süreç soru-cevapları, bulgular, gereksinimler, riskler, proje notları ve üst seviye yönetici değerlendirmelerini bir araya getirerek, bir ERP/CRM proje yöneticisinin müşterisine ve üst yönetime sunabileceği profesyonel **Ön Analiz Raporu Veri Modelini** (`ReportModel`) ve **Uygulama İçi Önizleme Ekranını** (`ReportPreviewView`) hayata geçirmektir.

Bu fazda DOCX/PDF kütüphanesi eklenmemiş; veri kaynağı, formatlama kuralları ve UI sunumu tek bir kanonik model üzerinde sabitlenmiştir.

---

## 2. Report Architecture (Rapor Mimarisi)

Rapor katmanı doğrudan SQLite veya ham JSON tablolarına bağımlı UI yazılmasını engeller:

```text
[ SQLite Veritabanı ] ──┐
[ Question Packs   ] ──┼──► [ src/report/builder.ts ] ──► [ ReportModel ] ──► [ ReportPreviewView ]
[ Canonical Reg.   ] ──┘    (formatters + branching)                            (HTML Önizleme)
                                                                                       │
                                                                   (Gelecek Faz: DOCX / PDF Çıktısı)
```

- `src/report/types.ts`: Tüm rapor alanlarını tanımlayan TypeScript arayüzleri.
- `src/report/formatters.ts`: Ham `AnswerData` JSON nesnelerini anlaşılır etiketlere ve açıklamalara dönüştüren formatlayıcı.
- `src/report/builder.ts`: Verileri toplayıp deterministik `ReportModel` üreten derleyici.
- `src/report/index.ts`: Modül dışa aktarımları.

---

## 3. ReportModel

`ReportModel` raporu oluşturan merkezi DTO'dur:

```typescript
export interface ReportModel {
  metadata: ReportMetadata;           // Başlık, proje adı, firma, tarih, durum, pack versiyonları
  profile: ReportProfile;             // executive_summary, overall_assessment, open_topics
  company: ReportCompany;             // Firma künyesi (boş alanlar temizce filtrelenir)
  scope: ReportScopeItem[];           // Seçili iş fonksiyonları, departmanlar, sorumlular, ilerleme
  businessFunctions: ReportBusinessFunction[]; // Süreçler, Soru-Cevaplar, Bulgular, Gereksinimler, Riskler, Notlar
  globalFindings: ReportFinding[];
  globalRequirements: ReportRequirement[];
  globalRisks: ReportRisk[];
  projectNotes: ReportProjectNote[];  // Genel ve departman notları
  summaryStats: ReportSummaryStats;   // KPI sayaçları
}
```

---

## 4. Report Builder

`src/report/builder.ts` içindeki `buildReportModel(projectId, options)` fonksiyonu:

1. Proje detayını, firma profilini, iş fonksiyonlarını, cevapları, semantik kayıtları ve rapor profilini paralel çeker.
2. İş fonksiyonlarına ait Question Pack'leri dinamik yükler.
3. Branching motorunu (`getVisibleQuestions`) çalıştırarak koşul dışı kalan soruları eler.
4. `includeUnanswered` opsiyonuna göre (varsayılan: `false`) cevaplanmamış soruları filtreler.
5. Soruları `process` bazında gruplar ve soru sırasına göre sıralar.
6. Fonksiyon ve soru seviyesinde semantik kayıtları (`Finding`, `Requirement`, `Risk`, `ProjectNote`) bağlar.
7. Çıktıyı `sort_order` ve `order` kurallarına göre deterministik sıralar.

---

## 5. Answer Formatting (Cevap Formatlayıcı)

`src/report/formatters.ts` içindeki `formatAnswer(question, rawAnswer)`:

- **Seçenek Kodları → Etiketler:** `erp_crm` gibi teknik kodları `"Mevcut ERP / CRM sistemi üzerinde"` gibi soru paketindeki insan-okunabilir etiketlere dönüştürür.
- **Seçenek Notları:** `• Excel — Açıklama: Bölge ekipleri ayrı dosyalarda tutuyor.` şeklinde formatlar.
- **Diğer (is_other):** Özel belirtilen serbest açıklamayı etikete bağlar.
- **Genel Not:** Varsa cevabın altına `(Genel Not: ...)` olarak ekler.
- **Ham JSON Gösterilmez:** Rapor okuyucusu hiçbir zaman raw JSON veya teknik ID görmez.

---

## 6. Process Grouping (Süreç Gruplama)

Sorular yalnızca ID listesi (`SALES-001`, `SALES-002`) olarak değil, soru paketindeki süreç başlıklarına göre yapısal olarak gruplanır:

```text
4.1 Müşteri ve Potansiyel Müşteri Yönetimi
    ├── SALES-001 (Müşteri verileri nerede tutuluyor?)
    └── SALES-002 (Potansiyel fırsatlar nerede takip ediliyor?)
4.2 Fırsat ve Teklif Yönetimi
    ├── SALES-003 (Teklif onay akışı nasıl işliyor?)
    └── SALES-004 (Teklif revizyonları nasıl takip ediliyor?)
```

---

## 7. Semantic Mapping (Bulgu, Gereksinim, Risk, Not Entegrasyonu)

- Her iş fonksiyonu altında o fonksiyona ait **Bulgular**, **Gereksinimler**, **Riskler** ve **Görüşme Notları** kartlar halinde listelenir.
- Bir soruya bağlı olan semantik kayıtlar, ilgili sorunun hemen altında kaynak rozeti ile gösterilir.
- Proje seviyesindeki genel notlar raporun son bölümünde toplanır.
- **Prensip:** Ham müşteri cevabı ile proje yöneticisinin analist yorumu birbirine karıştırılmaz.

---

## 8. Report Profile (`analysis_report_profiles` - Migration 4)

Proje yöneticisinin rapor seviyesinde girebileceği alanlar için veritabanına `analysis_report_profiles` tablosu eklenmiştir:

```sql
CREATE TABLE IF NOT EXISTS analysis_report_profiles (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL UNIQUE,
  executive_summary      TEXT,
  overall_assessment     TEXT,
  open_topics            TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_report_profiles_project ON analysis_report_profiles(analysis_project_id);
```

---

## 9. Preview UI (`ReportPreviewView.tsx`)

- **Üst Eylem Çubuğu:** `← Analize Dön`, Rapor Başlığı, `Cevaplanmamışları Göster` toggle anahtarı ve `Yönetici Notlarını Düzenle` modal butonu.
- **İçindekiler (TOC Navigasyonu):** 1. Yönetici Özeti, 2. Firma Profili, 3. Analiz Kapsamı, 4. İş Fonksiyonları, 5. Proje Notları & Açık Konular bağlantıları.
- **Rapor Kapağı / Künye:** Firma, Tarih, Durum ve özet KPI bandı.
- **Yönetici Değerlendirmeleri Modalı (`ReportProfileModal.tsx`):** Yönetici özeti, dönüşüm önerisi ve açık konuları anında düzenleme ve kaydetme.

---

## 10. Deterministic Ordering (Deterministik Sıralama)

Aynı veritabanı durumu ve soru paketi ile `buildReportModel` çalıştırıldığında çıktı her zaman aynı sıralamayla üretilir:

1. İş Fonksiyonları: `business_functions.sort_order ASC` (Örn: `PROCUREMENT`=12, `SALES`=14).
2. Süreç Grupları: Süreç içindeki en küçük `question.order ASC`.
3. Sorular: `question.order ASC`.
4. Semantik Kayıtlar: `created_at ASC` / `priority`.

---

## 11. Question Pack Versioning

ReportModel, analizde kullanılan soru paketlerinin ID ve versiyon bilgilerini saklar (Örn: `tr.sales.core v0.1.0`). Bu bilgi rapor kapağında ve fonksiyon başlıklarında izlenebilirlik için sunulur.

---

## 12. Persistence (Kalıcılık)

`analysis_report_profiles` tablosu SQLite'ta kalıcıdır. Proje silindiğinde `ON DELETE CASCADE` sayesinde ilişkili rapor profili de otomatik temizlenir.

---

## 13. Test Sonuçları

```bash
npm test
# FAZ-2 Test Sonucu: 144 PASS / 0 FAIL
# FAZ-3 Semantic Layer Test Sonucu: 52 PASS / 0 FAIL
# FAZ-4 Report Model Test Sonucu: 41 PASS / 0 FAIL
# Clean Install Test Sonucu (11 Tablo): 28 PASS / 0 FAIL
# TOPLAM: 265 PASS / 0 FAIL

npm run build
# ✓ 1617 modules transformed.
# ✓ built in 1.81s (0 hata)

cargo check --manifest-path src-tauri/Cargo.toml
# Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.24s (0 hata)
```

---

## 14. Bilinen Kısıtlar (Known Limitations)

- **Headless Linux Ortamı:** Linux terminalinde GTK pencere sunucusu bulunmadığı için Tauri masaüstü pencere açılışı headless ortamda simüle edilememektedir; veri yolu `better-sqlite3` ve unit/integration testleri ile %100 doğrulanmıştır.
- **DOCX / PDF Export:** FAZ-4 gereksinimi doğrultusunda bu fazda dosya ihracı yapılmamış, yalnız uygulama içi HTML/CSS önizleme ekranı geliştirilmiştir.

---

## 15. FAZ-5 Önerisi

FAZ-4 ile `ReportModel` ve önizleme katmanı tamamlanmıştır. Sıradaki faz (FAZ-5) için önerilen kapsam:

- **DOCX & PDF Dışa Aktarım Motoru:** `ReportModel` üzerinden istemci tarafında profesyonel Word (.docx) ve PDF dokümanlarının üretilmesi.
- **Yeni Pilot Soru Paketleri:** Satın Alma (`PROCUREMENT`), Üretim (`PRODUCTION`) ve Muhasebe (`ACCOUNTING`) paketlerinin Question Engine'e eklenmesi.

---

## 16. Acceptance Sonucu

| Kriter | Durum |
|--------|-------|
| ReportModel UI'dan Bağımsızlık | ✓ PASS |
| Firma Profili Mapping | ✓ PASS |
| Kapsam (Scope) & İlerleme Mapping | ✓ PASS |
| Single Choice / Multi Choice / Notes Formatter | ✓ PASS |
| Option-specific Notes & General Note Preservation | ✓ PASS |
| Branching & Koşullu Gizli Soruların Elenmesi | ✓ PASS |
| Cevaplanmamış Soru Toggle Yönetimi | ✓ PASS |
| Semantik Kayıtların Fonksiyon & Soruya Bağlanması | ✓ PASS |
| Report Profile Persistence (`executive_summary`, `overall_assessment`, `open_topics`) | ✓ PASS |
| Deterministik Çıktı Sıralaması | ✓ PASS |
| ReportPreviewView & TOC Anchor UX | ✓ PASS |
| Clean Install Migration (11 Tablo) | ✓ PASS |
| `npm test` (265 test) | ✓ **PASS** |
| `npm run build` | ✓ **PASS (1.81s, 0 hata)** |
| `cargo check` | ✓ **PASS (0.24s, 0 hata)** |

---

**FAZ-4 ACCEPTANCE: PASS**

**FAZ-4 tamamlandı. FAZ-5'e başlamıyorum; mimari inceleme bekleniyor.**
