# FAZ-3 — Analiz Semantik Katmanı (Findings / Requirements / Risks / Project Notes)

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-3 — Analiz Semantik Katmanı

---

## 1. Amaç

Bu fazın amacı, sahadan toplanan ham soru-cevap verisinin ötesine geçerek, ERP/CRM proje yöneticisinin sahadaki mevcut durum tespitlerini (**Finding / Bulgu**), hedef sistem gereksinimlerini (**Requirement / Gereksinim**), operasyonel/proje risklerini (**Risk**) ve serbest analiz notlarını (**Project Note**) yapılandırılmış biçimde yönetmesini sağlamaktır.

Bu katmanda **AI veya otomatik çıkarım kullanılmaz**. Tüm semantik kayıtlar proje yöneticisi tarafından manuel girilir, doğrulanır ve yönetilir.

---

## 2. Semantic Domain Model

Sistem 4 temel semantik varlıktan oluşur:

```text
[ Ham Soru-Cevap Katmanı ]
Question (tr.sales.core) ──► Answer (question_answers)
                                    │
                                    │ (Analist İncelemesi - Manuel)
                                    ▼
[ Semantik Analiz Katmanı ]
├── Finding (analysis_findings)
├── Requirement (analysis_requirements)
├── Risk (analysis_risks)
└── Project Note (project_notes)
```

**Temel Prensip:** Ham veri (`question_answers`) ile analist yorumu (`analysis_*`, `project_notes`) kesin olarak ayrı tablolarda izole tutulur. Semantik kayıtlar düzenlense veya silinse bile sahadan alınan ham cevap hiçbir zaman değişmez.

---

## 3. Finding (Bulgu)

Mevcut iş süreçlerinde tespit edilen fiili durum veya problem tanımıdır (yorum değil, tespit).

- **Alanlar:** `id`, `analysis_project_id`, `business_function_code`, `question_id` (nullable), `title`, `description`, `priority`, `status`, `created_at`, `updated_at`
- **Öncelik Seviyeleri:** `low`, `medium`, `high`, `critical`
- **Durum Değerleri:** `open` (Açık), `confirmed` (Teyit Edildi), `resolved` (Çözüldü / Kapatıldı)

---

## 4. Requirement (Gereksinim)

Yeni kurulacak ERP/CRM çözümünde karşılanması gereken iş ihtiyacı veya fonksiyonel kapsam maddesidir.

- **Alanlar:** `id`, `analysis_project_id`, `business_function_code`, `question_id` (nullable), `title`, `description`, `priority`, `status`, `created_at`, `updated_at`
- **Öncelik Seviyeleri:** `low` (Nice to have), `medium` (Should have), `high` (Must have), `critical` (Deal breaker)
- **Durum Değerleri:** `draft` (Taslak), `confirmed` (Kapsamda), `out_of_scope` (Kapsam Dışı), `implemented` (Karşılandı)

---

## 5. Risk

Projeyi, geçiş sürecini, operasyonel sürekliliği veya veri kalitesini olumsuz etkileyebilecek potansiyel tehlikedir.

- **Alanlar:** `id`, `analysis_project_id`, `business_function_code`, `question_id` (nullable), `title`, `description`, `impact`, `probability`, `mitigation_note` (nullable), `status`, `created_at`, `updated_at`
- **Etki (Impact):** `low`, `medium`, `high`, `critical`
- **Olasılık (Probability):** `low`, `medium`, `high`
- **Önlem Notu (Mitigation Note):** Riski azaltmak veya bertaraf etmek için önerilen eylem planı.
- **Durum Değerleri:** `open` (Açık Risk), `mitigated` (Önlem Alındı), `accepted` (Kabul Edildi), `closed` (Kapatıldı)

---

## 6. Project Note (Proje Notu)

Proje yöneticisinin görüşme veya analiz sırasında serbestçe aldığı, belirli bir yapıya zorlanmayan serbest notlardır.

- **Alanlar:** `id`, `analysis_project_id`, `business_function_code` (nullable), `question_id` (nullable), `note`, `created_at`, `updated_at`
- Hem soru seviyesinde hem de proje geneli seviyesinde (`business_function_code = null`, `question_id = null`) oluşturulabilir.

---

## 7. Source Traceability (Kaynak Soru İzlenebilirliği)

Semantik kayıtlar bir soru ekranından oluşturulduğunda `question_id` (örn: `SALES-001`) ve `business_function_code` (örn: `SALES`) otomatik atanır.

İleride oluşturulacak analiz raporlarında şu izlenebilirlik zinciri doğrudan kurulabilir:

```text
Kaynak Soru:   SALES-001 (Müşteri ve potansiyel müşteri verileri nerede tutuluyor?)
Verilen Cevap: Excel / Kağıt / Bireysel Rehberler
Bulgu:         Merkezi müşteri veri tabanı bulunmuyor, veriler dağınık dosyalarda.
Gereksinim:    Merkezi CRM müşteri ana veri yönetimi ve tekil kayıt (deduplication) kuralı.
Risk:          Geçiş sırasında mükerrer ve kirli verilerin yeni sisteme aktarılması riski.
```

---

## 8. Database Schema (Migration 3)

`src/db/migrationDefinitions.ts` içine eklenen Migration 3:

```sql
CREATE TABLE IF NOT EXISTS analysis_findings (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT NOT NULL,
  question_id            TEXT,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL DEFAULT '',
  priority               TEXT NOT NULL DEFAULT 'medium',
  status                 TEXT NOT NULL DEFAULT 'open',
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_requirements (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT NOT NULL,
  question_id            TEXT,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL DEFAULT '',
  priority               TEXT NOT NULL DEFAULT 'medium',
  status                 TEXT NOT NULL DEFAULT 'draft',
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_risks (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT NOT NULL,
  question_id            TEXT,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL DEFAULT '',
  impact                 TEXT NOT NULL DEFAULT 'medium',
  probability            TEXT NOT NULL DEFAULT 'medium',
  mitigation_note        TEXT,
  status                 TEXT NOT NULL DEFAULT 'open',
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_notes (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT,
  question_id            TEXT,
  note                   TEXT NOT NULL,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_findings_project ON analysis_findings(analysis_project_id, business_function_code);
CREATE INDEX IF NOT EXISTS idx_requirements_project ON analysis_requirements(analysis_project_id, business_function_code);
CREATE INDEX IF NOT EXISTS idx_risks_project ON analysis_risks(analysis_project_id, business_function_code);
CREATE INDEX IF NOT EXISTS idx_notes_project ON project_notes(analysis_project_id);
```

---

## 9. CRUD Operasyonları

`src/db/client.ts` içinde tüm semantik nesneler için eksiksiz CRUD fonksiyonları geliştirilmiştir:

- **Findings:** `createFinding`, `updateFinding`, `deleteFinding`, `getFindings(projectId, bfCode?, questionId?)`
- **Requirements:** `createRequirement`, `updateRequirement`, `deleteRequirement`, `getRequirements(...)`
- **Risks:** `createRisk`, `updateRisk`, `deleteRisk`, `getRisks(...)`
- **Notes:** `createProjectNote`, `updateProjectNote`, `deleteProjectNote`, `getProjectNotes(...)`
- **Özet Sayıları:** `getSemanticSummaryCounts(projectId)`

---

## 10. Question Screen Entegrasyonu

`src/views/QuestionScreen.tsx` üzerinde her sorunun altında kompakt bir **Semantic Toolbar** yerleştirilmiştir:

- Butonlar: `+ Bulgu`, `+ Gereksinim`, `+ Risk`, `+ Not`
- Soruya ait mevcut kayıt rozetleri (tür ikonları ve başlıklarıyla).
- Modal açıldığında soru ID'si (`currentQuestion.id`) ve departman kodu (`bfCode`) form alanlarına otomatik doldurulur.

---

## 11. Project Analysis Summary (Proje Detay Ekranı)

`src/views/ProjectDetailView.tsx` altında `SemanticSummarySection` bileşeni yer alır:

- **KPI Kartları:**
  - 🔍 **Bulgular:** Toplam bulgu sayısı
  - 📋 **Gereksinimler:** Toplam gereksinim sayısı
  - ⚠️ **Açık Riskler:** Açık risk sayısı / Toplam risk sayısı
  - 📝 **Proje Notları:** Toplam not sayısı
- **Filtreler:**
  - Tür filtreleme sekmeleri (`Tümü`, `Bulgular`, `Gereksinimler`, `Riskler`, `Notlar`)
  - İş fonksiyonu seçici (`Tüm Fonksiyonlar`, `Satış Yönetimi`, vb.)
- **Kayıt Kartları:**
  - Tür rozeti, iş fonksiyonu rozeti, kaynak soru etiketi (`Kaynak: SALES-001`), öncelik rozetleri, durum rozetleri, düzenleme ve silme (onay pencereli) aksiyonları.
  - Proje seviyesinde serbest kayıt ekleme butonu (`+ Kayıt Ekle`).

---

## 12. Persistence (Kalıcılık)

Tüm semantik veriler SQLite veritabanında diskte kalıcı olarak saklanır. Uygulama kapatılıp yeniden açıldığında tüm bulgular, gereksinimler, riskler ve notlar eksiksiz geri yüklenir.

Proje silindiğinde veritabanındaki `ON DELETE CASCADE` kuralı sayesinde bağlı tüm bulgular, gereksinimler, riskler ve notlar yetim kayıt bırakmadan temizlenir.

---

## 13. Test Sonuçları

```bash
npm test
# [generate] Validated 31 canonical business functions successfully.
# [generate] Wrote generated TypeScript to src/generated/businessFunctions.ts
# FAZ-2 Test Sonucu: 144 PASS / 0 FAIL
# FAZ-3 Semantic Layer Test Sonucu: 52 PASS / 0 FAIL
# Clean Install Test Sonucu: 27 PASS / 0 FAIL
# TOPLAM: 223 PASS / 0 FAIL

npm run build
# ✓ 1613 modules transformed.
# ✓ built in 1.74s

cargo check --manifest-path src-tauri/Cargo.toml
# Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.24s
```

---

## 14. Bilinen Kısıtlar (Known Limitations)

- **Ubuntu Headless Ortamı:** Ubuntu Linux geliştirme ortamında GTK display sunucusu olmaması nedeniyle Tauri pencere açılışı ve WebKit WebView IPC akışı headless terminal ortamında doğrudan çalıştırılamamaktadır. Veritabanı motoru (`libsqlite3`) ve migration akışı Node.js `better-sqlite3` harness'ı üzerinden otomatik olarak %100 doğrulanmıştır.
- **Grafiksel İlişkilendirme:** FAZ-3 V1 sürümünde Finding ile Requirement veya Risk arasında doğrudan birebir/çoka-çok ilişkiler (graph model) tutulmamaktadır; tüm semantik kayıtlar iş fonksiyonu ve opsiyonel kaynak soru (`question_id`) üzerinden ilişkilendirilir. Bu, mimariyi sade tutmak ve erken karmaşıklıktan (YAGNI) kaçınmak için tercih edilmiştir.

---

## 15. FAZ-4 Önerisi

FAZ-3 ile birlikte soru-cevap verisi ve analist semantik modeli tamamlanmıştır. Sıradaki faz (FAZ-4) için önerilen kapsam:

- **Raporlama ve Çıktı Motoru:** Proje özet raporu, departman bazlı bulgu/gereksinim matrisi ve risk kaydının Markdown / HTML / PDF / Excel formatlarında dışa aktarımı.
- **Diğer Pilot Soru Paketleri:** Satın Alma (`PROCUREMENT`), Üretim (`PRODUCTION`) ve Muhasebe (`ACCOUNTING`) soru paketlerinin eklenmesi.

---

## 16. Acceptance Sonucu

| Kriter | Durum |
|--------|-------|
| Finding CRUD | ✓ PASS |
| Requirement CRUD | ✓ PASS |
| Risk CRUD | ✓ PASS |
| Project Note CRUD | ✓ PASS |
| Kaynak Soru İzlenebilirliği (`question_id`) | ✓ PASS |
| Kanonik İş Fonksiyonu Entegrasyonu (`SALES`) | ✓ PASS |
| Proje Özet Sayıları (KPI) | ✓ PASS |
| Bağlantı Kapat / Aç Kalıcılığı (Persistence) | ✓ PASS |
| Proje Silme Cascade Koruması | ✓ PASS |
| Clean Install Migration (10 Tablo) | ✓ PASS |
| İkinci Başlatma (Idempotency) | ✓ PASS |
| `npm test` (223 test) | ✓ **PASS** |
| `npm run build` | ✓ **PASS (1.74s, 0 hata)** |
| `cargo check` | ✓ **PASS (0.24s, 0 hata)** |

---

**FAZ-3 ACCEPTANCE: PASS**

**FAZ-3 tamamlandı. FAZ-4'e başlamıyorum; mimari inceleme bekleniyor.**
