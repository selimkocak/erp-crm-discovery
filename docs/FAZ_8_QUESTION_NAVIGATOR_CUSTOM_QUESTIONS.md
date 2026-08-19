# FAZ-8 — Question Navigator & Project Custom Questions Raporu

---

## 1. Amaç ve Kapsam

Bu fazda iki temel mimari yetenek sisteme kazandırılmıştır:
1. **Collapsible Question Navigator (Soru Navigatörü):** `QuestionScreen` üzerinde gizlenebilir sol çekmece/sidebar ile iş fonksiyonuna ait tüm soruları (`CURRENT`, `ANSWERED`, `UNANSWERED`, `REQUIRED_INCOMPLETE`, `[Özel Soru]`) listeler ve Previous/Next tıklama zincirine ihtiyaç duymadan doğrudan tek tıkla (`jumpToQuestion`) hedeflenen soruya atlama imkanı sunar.
2. **Project Custom Questions (Proje Yöneticisi Özel Soruları):** Topluluk ve standart metodoloji tarafından yönetilen açık kaynak canonical question pack'lerin immutability'si (%100 dokunulmazlığı) korunarak, proje yöneticisinin belirli bir proje ve iş fonksiyonu için sahada ihtiyaç duyulan özel soruları (`single_choice`, `multiple_choice`, `yes_no`, `text`, `textarea`, `number`) eklemesi, düzenlemesi ve yanıtlaması sağlanmıştır.

---

## 2. Mimari Prensipler ve İzolasyon

### 2.1. Canonical Question Pack İmmutability
- `data/question-packs/sales.json` (ve gelecekteki tüm canonical pack'ler) salt okunurdur.
- Hiçbir proje özel sorusu canonical JSON dosyalarına yazılmaz.
- Metodoloji bütünlüğü korunur.

### 2.2. Veritabanı Şeması (Migration 005)
`src/db/migrationDefinitions.ts` altında Migration 5 tanımlanmıştır:
```sql
CREATE TABLE IF NOT EXISTS project_custom_questions (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT NOT NULL,
  process_name           TEXT NOT NULL,
  question_text          TEXT NOT NULL,
  description            TEXT,
  question_type          TEXT NOT NULL,
  is_required            INTEGER NOT NULL DEFAULT 0,
  sort_order             INTEGER NOT NULL DEFAULT 100,
  is_active              INTEGER NOT NULL DEFAULT 1,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_custom_question_options (
  id                     TEXT PRIMARY KEY,
  custom_question_id     TEXT NOT NULL,
  value                  TEXT NOT NULL,
  label                  TEXT NOT NULL,
  sort_order             INTEGER NOT NULL DEFAULT 0,
  is_other               INTEGER NOT NULL DEFAULT 0,
  created_at             TEXT NOT NULL,
  FOREIGN KEY (custom_question_id) REFERENCES project_custom_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_custom_question_answers (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT NOT NULL,
  custom_question_id     TEXT NOT NULL,
  answer_data            TEXT NOT NULL DEFAULT '{}',
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_question_id) REFERENCES project_custom_questions(id) ON DELETE CASCADE,
  UNIQUE (analysis_project_id, custom_question_id)
);
```

---

## 3. Bileşenler ve Entegrasyonlar

### 3.1. `QuestionNavigator` (`src/components/QuestionNavigator.tsx`)
- Sol çekmece / sidebar olarak çalışır.
- Başlıkta "Sorular (N)" butonu ile açılıp kapanır.
- Soruları süreç bazında (`process`) gruplandırarak hiyerarşik gösterir.
- Anlık durum simgeleri:
  - `✓` (Yeşil): Cevaplanmış soru
  - `!` (Sarı/Amber): Zorunlu ama henüz cevaplanmamış soru
  - `○` (Gri): İsteğe bağlı / cevaplanmamış soru
  - `Vurgulu Satır`: Şu an aktif olan soru (`CURRENT`)
  - `[Özel Soru]` rozeti: Proje özel soruları
- Hızlı arama / filtreleme input'u içerir.
- Alt bilgi bandında **Standart Sorular** ve **Özel Sorular** tamamlanma oranlarını ayrık olarak raporlar.

### 3.2. `CustomQuestionModal` (`src/components/CustomQuestionModal.tsx`)
- Proje yöneticisinin kolayca yeni soru oluşturmasını veya mevcut özel soruları düzenlemesini sağlar.
- Seçenekli tipler (`single_choice`, `multiple_choice`) için 2-10 arası dinamik seçenek girişi ve opsiyonel `Diğer (Açıklayınız)` desteği sunar.
- Teknik ID göstermez; temiz kurumsal form deneyimi sunar.

### 3.3. `QuestionCard` (`src/components/QuestionCard.tsx`)
- Soru kartının üstünde `[Özel Soru]` rozeti render eder.
- Proje özel sorularında `Düzenle` ve `Sil` butonlarını gösterir. Canonical sorularda bu butonlar asla gösterilmez.

### 3.4. Rapor & Dışa Aktarım Uyumu (ReportModel, DOCX, PDF)
- `src/report/builder.ts`: Özel soruları ve cevapları ilgili iş fonksiyonunun süreç akışına `isCustom: true` olarak ekler.
- `src/views/ReportPreviewView.tsx`: Rapor önizlemesinde özel soruların yanında `Özel Soru` rozeti gösterir.
- `src/export/docxExporter.ts`: Word çıktısında soru başlığında `[Özel Soru]` etiketini altın/amber renkte vurgular.
- `src/export/pdfExporter.ts`: PDF çıktısında soru başlığında `[Özel Soru]` etiketini yerleştirir.

---

## 4. Test ve Kabul Kanıtları

`test/faz8_navigator_custom_questions_test.ts` ile doğrulanan kriterler:
1. **Canonical Pack İmmutability:** `data/question-packs/sales.json` dosyasında 0 değişiklik, 21 soru ve 0.1.0 sürüm sabitliği kanıtlandı.
2. **Custom Question Adapter:** `ProjectCustomQuestion` tipinin çalışma zamanı `Question` modeline `is_custom = true` ile tam dönüşümü doğrulandı.
3. **Question Navigator Status & Jump:** `isQuestionAnswered` ile anlık statü tespiti ve tekil `jumpToQuestion` navigasyonu doğrulandı.
4. **SQLite Persistence & Restart:** Veritabanı kapatılıp tekrar açıldığında özel soruların, seçeneklerin, cevapların ve `question_session_state` son soru ID'sinin kusursuz korunduğu doğrulandı.
5. **Cascade Delete:** Özel soru silindiğinde seçenek ve cevap kayıtlarının SQLite FK CASCADE ile temizlendiği doğrulandı.
6. **DOCX & PDF Export Validation:** Üretilen PDF binary'si `PDFParse` ile ayrıştırılarak `[Özel Soru]` etiketi ve özel soru metinlerinin belgeye eksiksiz basıldığı doğrulandı.

---

## 5. Son Durum

```text
QUESTION NAVIGATOR: PASS
PROJECT CUSTOM QUESTIONS: PASS
CANONICAL PACK IMMUTABILITY: PASS
AUTOSAVE & RESUME: PASS
DOCX / PDF EXPORT INTEGRATION: PASS
```

FAZ-8 tamamlandı. Canonical soru seti korunarak proje bazlı esneklik sağlandı.
