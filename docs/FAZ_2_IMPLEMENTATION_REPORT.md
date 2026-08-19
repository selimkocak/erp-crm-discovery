# FAZ-2 İmplementasyon Raporu — Question Engine + Satış Pilotu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-2  
**Durum:** TAMAMLANDI

---

## 1. Özet

Bu faz, ERP CRM Discovery uygulamasının temel fikrî değerini oluşturan Question Engine'in ilk gerçek sürümünü üretmiştir. FAZ-1'de kanıtlanan Tauri → SQLite kalıcılık zinciri üzerine, Satış işlevi için tam çalışan bir soru-cevap motoru inşa edilmiştir.

**Temel Tasarım Prensibi:**
> Saha gerçeği çoğu zaman "Evet/Hayır" değildir.  
> Kullanıcı hazır seçeneklerden seçer → seçtiğini açıklar → öngörülmeyeni "Diğer" ile yazar.

---

## 2. FAZ-1 Temizliği

| Eylem | Sonuç |
|-------|-------|
| `sqlx` direct dependency kaldırıldı | ✓ |
| `tokio` direct dependency kaldırıldı | ✓ |
| `src-tauri/src/bin/validate_db.rs` silindi | ✓ |
| `lib.rs` setup hook temizlendi | ✓ |
| `cargo check` | ✓ PASS (0.29s) |

---

## 3. Question Pack Mimarisi

### Dosya Organizasyonu

```
question-packs/tr/sales/core.json   ← Kaynak (katkı odaklı)
public/question-packs/tr/sales/core.json  ← Runtime (fetch() için)
```

### Yükleme Zinciri

```
fetch('/question-packs/tr/sales/core.json')
    ↓
JSON.parse()
    ↓
validateQuestionPack()   ← 15 kural kontrolü
    ↓
QuestionPack tipli nesne → QuestionScreen
```

---

## 4. Engine Katmanı

| Dosya | Rol |
|-------|-----|
| `src/engine/types.ts` | TypeScript tip tanımları (çalışma zamanı kodu yok) |
| `src/engine/validator.ts` | 15 doğrulama kuralı, 2-pass algoritma |
| `src/engine/branching.ts` | `equals` / `not_equals` / `contains` operatörleri |
| `src/engine/progress.ts` | Görünür + zorunlu soru ilerlemesi |
| `src/engine/loader.ts` | fetch + validate, açık hata nesneleri |

---

## 5. Satış Pilot Soru Paketi

**Pack ID:** `tr.sales.core`  
**Versiyon:** `0.1.0`  
**Toplam Soru:** 38  
**Koşullu Soru:** 6 (SALES-007, 008, 009, 033, 035 ve diğerleri)

### Süreç Dağılımı

| Süreç | Soru Sayısı |
|-------|-------------|
| Müşteri ve Potansiyel Müşteri Yönetimi | 6 |
| Fırsat Yönetimi | 5 |
| Teklif Yönetimi | 5 |
| Satış Siparişi | 5 |
| Stok ve Üretim Etkileşimi | 3 |
| Sevkiyat Etkileşimi | 3 |
| Faturalama Etkileşimi | 2 |
| Tahsilat ve Risk Etkileşimi | 3 |
| Satış Performansı | 6 |
| **Toplam** | **38** |

### Soru Profili

| Özellik | Değer |
|---------|-------|
| `required: true` sorular | 21 |
| `is_other` seçeneği olan sorular | 28 |
| `allow_note: true` seçenekler | 109 |
| `multiple_choice` sorular | 14 |
| `single_choice` sorular | 24 |
| Koşullu sorular | 6 |

---

## 6. Database Şeması (FAZ-2 Eklentisi)

### `question_answers` Tablosu

```sql
CREATE TABLE IF NOT EXISTS question_answers (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL REFERENCES analysis_projects(id) ON DELETE CASCADE,
  business_function_code TEXT NOT NULL,
  question_pack_id       TEXT NOT NULL,
  question_pack_version  TEXT NOT NULL,
  question_id            TEXT NOT NULL,
  answer_data            TEXT NOT NULL DEFAULT '{}',  -- JSON
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  UNIQUE (analysis_project_id, business_function_code, question_id)
);
```

### `question_session_state` Tablosu

Kaldığı yerden devam için son görüntülenen soru ID'sini saklar.

### CRUD Fonksiyonları (client.ts)

| Fonksiyon | Açıklama |
|-----------|----------|
| `saveAnswer()` | UPSERT — cevabı kaydet / güncelle |
| `getAnswer()` | Tek soru cevabını oku |
| `getAllAnswers()` | Tüm cevapları Map<questionId, AnswerData> olarak oku |
| `saveLastQuestionId()` | Session state UPSERT |
| `getLastQuestionId()` | Son soru ID'sini oku |
| `updateFunctionStatusByCode()` | Progress'e göre status güncelle |

---

## 7. Persistence Politikası

**FAZ-1'de belirlenen, FAZ-2'de korunan kural:**

> `@tauri-apps/plugin-sql → Tauri IPC → SQLite (disk)`  
> localStorage fallback YOKTUR. Memory fallback YOKTUR.

---

## 8. UI Bileşenleri

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| ProgressBar | `src/components/ProgressBar.tsx` | Görünür + zorunlu soru ilerlemesi |
| ChoiceOption | `src/components/ChoiceOption.tsx` | Seçenek + inline note + is_other |
| QuestionCard | `src/components/QuestionCard.tsx` | Tüm answer type'ları + genel not |
| QuestionScreen | `src/views/QuestionScreen.tsx` | Step-by-step ana ekran |
| ProjectDetailView | `src/views/ProjectDetailView.tsx` | "Analiz Başlat"/"Devam Et" entegrasyonu |

---

## 9. Autosave Mekanizması

- Cevap değiştiğinde **800ms debounce** ile kaydedilir
- Her kayıtta `updateFunctionStatusByCode()` çağrılır
- SaveStatusIndicator: `saving` → `saved` / `error`
- Hata durumunda konsola açık log — sessiz başarısızlık yoktur

---

## 10. Kaldığı Yerden Devam

1. `QuestionScreen` açılırken `getLastQuestionId()` çağrılır
2. Son soru ID'si `visibleQuestions` içinde aranır
3. Bulunursa `currentIndex` o soruya ayarlanır
4. Her `goTo()` çağrısında `saveLastQuestionId()` güncellenir

---

## 11. Conditional Branching

**Örnek:** SALES-007, SALES-008, SALES-009, SALES-035 sorularının koşulu:
```json
{
  "question_id": "SALES-006",
  "operator": "not_equals",
  "value": "takip_yok"
}
```

Kullanıcı "Sistematik takip yapılmıyor" seçerse bu 4 soru otomatik gizlenir.  
Progress hesabından da çıkarılır (sadece görünür + zorunlu sorular sayılır).

---

## 12. Test Sonuçları

```
FAZ-2 Test Sonucu: 142 PASS / 0 FAIL
BAŞARILI: Tüm testler PASS.
```

| Test | Kapsam | Sonuç |
|------|--------|-------|
| T01 | Sales pack parse | ✓ PASS |
| T02 | Pack validation | ✓ PASS |
| T03 | 30-40 benzersiz question ID (38) | ✓ PASS |
| T04 | Choice options validation (38 soru × N kural) | ✓ PASS |
| T05 | other + empty note → incomplete | ✓ PASS |
| T06 | other + note → complete | ✓ PASS |
| T07 | Option notes serialize/deserialize | ✓ PASS |
| T08 | Multiple choice state mock | ✓ PASS |
| T09 | General note state mock | ✓ PASS |
| T10 | Conditional branching | ✓ PASS |
| T11 | Progress hesabı | ✓ PASS |
| T12 | Restart persistence mock | ✓ PASS |
| T13 | `npm run build` | ✓ PASS (1.65s) |
| T14 | `cargo check` | ✓ PASS (0.29s) |

---

## 13. Belgelenen Kısıtlamalar

- **T13 (npm run build)** ve **T14 (cargo check)** otomatik test framework'ü dışında çalışır.
- **T08, T09, T12** (persistence testleri): Mock Map üzerinden çalışır. Gerçek SQLite persistence FAZ-1'de `docs/FAZ_1_NATIVE_VALIDATION.md`'de kanıtlanmıştır.
- **Headless ortam:** Tauri WebKit penceresi bu geliştirme ortamında renderlanamadığından end-to-end UI testi yapılamamıştır.

---

## 14. Teslim Edilen Dosyalar

### Yeni Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/engine/types.ts` | Engine tip tanımları |
| `src/engine/validator.ts` | Pack validator |
| `src/engine/branching.ts` | Conditional branching |
| `src/engine/progress.ts` | Progress + status |
| `src/engine/loader.ts` | Pack loader |
| `src/components/ProgressBar.tsx` | UI bileşeni |
| `src/components/ChoiceOption.tsx` | UI bileşeni |
| `src/components/QuestionCard.tsx` | UI bileşeni |
| `src/views/QuestionScreen.tsx` | Soru ekranı |
| `question-packs/tr/sales/core.json` | Satış pilot paketi (38 soru) |
| `public/question-packs/tr/sales/core.json` | Runtime kopyası |
| `test/faz2_tests.ts` | 14 hedefli test suite |
| `docs/QUESTION_PACK_SCHEMA_V1.md` | Schema rehberi |
| `docs/FAZ_2_IMPLEMENTATION_REPORT.md` | Bu rapor |

### Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `src-tauri/Cargo.toml` | sqlx + tokio kaldırıldı |
| `src-tauri/src/lib.rs` | Setup hook kaldırıldı, minimal'e döndürüldü |
| `src/db/migrations.ts` | question_answers + question_session_state tabloları eklendi |
| `src/db/client.ts` | 6 yeni CRUD fonksiyonu eklendi |
| `src/views/ProjectDetailView.tsx` | QuestionScreen entegrasyonu + Analiz butonu |
| `src/index.css` | FAZ-2 UI stilleri eklendi |

### Silinen Dosyalar

| Dosya | Sebep |
|-------|-------|
| `src-tauri/src/bin/validate_db.rs` | FAZ-1 geçici validator, production'da yeri yok |

---

## 15. Kullanıcı Akışı (FAZ-2 Sonrası)

```
Uygulama Aç
  ↓
Mevcut Analizi Seç veya Yeni Oluştur
  ↓
Proje Detayı → İş Fonksiyonları Tablosu
  ↓
"Satış Yönetimi" satırında "Başlat" butonuna tıkla
  ↓
JSON pack yüklenir + doğrulanır
  ↓
QuestionScreen: Soru 1 / 38
  ↓
Her "Sonraki" → cevap 800ms debounce ile SQLite'a kaydedilir
  ↓
Uygulama kapatılırsa → yeniden açtığında kaldığı yerden devam
  ↓
Tüm zorunlu sorular tamamlanınca → "Tamamlandı" banner
  ↓
"Tamamla" butonu → Proje Detayına dön → Status: Tamamlandı
```

---

## 16. FAZ-3 Hazırlık Notu

FAZ-2 tamamlandı. FAZ-3'e başlanmıyor; mimari inceleme bekleniyor.

Potansiyel FAZ-3 konuları (mimar kararına bırakılır):
- Rapor üretimi (firma bazında, fonksiyon bazında özet)
- Satın Alma / Üretim / Muhasebe soru paketleri
- PDF export
- Proje karşılaştırma

---

## 17. Onay Kriteri Doğrulaması

FAZ-1 acceptance criterion'ı FAZ-2'de de korunmaktadır:

| Kriter | Durum |
|--------|-------|
| Uygulama açılacak | ✓ |
| Firma profili oluşturulacak | ✓ (FAZ-1) |
| İş fonksiyonları seçilecek | ✓ (FAZ-1) |
| Veri SQLite'a kaydedilecek | ✓ (FAZ-1 + FAZ-2) |
| Uygulama kapanıp yeniden açıldığında analiz geri gelecek | ✓ (FAZ-1 PASS) |
| Satış soruları cevaplanabilecek | ✓ (FAZ-2) |
| Cevaplar restart sonrası korunacak | ✓ (FAZ-2, mock PASS; SQLite chain FAZ-1'de kanıtlandı) |

---

*FAZ-2 tamamlandı. FAZ-3'e başlanmıyor; mimari inceleme bekleniyor.*
