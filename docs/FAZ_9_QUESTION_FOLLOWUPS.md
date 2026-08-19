# FAZ-9 — Soru Takip Bayrakları ve Açık Konular (Question Follow-up Flags & Open Topics)

## 1. Amaç ve Kapsam

ERP/CRM ön analiz ve saha keşif görüşmelerinde danışman veya proje yöneticisi her soruyu anında eksiksiz cevaplayamayabilir:
- Müşteri ilgili departmandan veya muhasebeden teyit almak isteyebilir.
- Şirket içi bir yetki kuralı veya yönetim kurulu kararı netleşmemiş olabilir.
- Bilgi eksikliği nedeniyle soruya o an yanıt verilemeyip daha sonra dönülmek istenebilir.

**FAZ-9**, görüşmenin akışını kesintiye uğratmadan ve danışmanı "ya cevap ver ya da boş bırak" ikilemine sokmadan soruları durumlandırmayı sağlar.

---

## 2. Mimari ve Durum Modeli

Her soru için 4 durum mevcuttur:

| Durum | Görsel İkon | Anlamı | Davranış / İlerleme Etkisi |
| :--- | :---: | :--- | :--- |
| 🟢 **Cevaplandı** | Yeşil Tik (`✓`) | Yanıt yeterli ve kaydedildi | Tamamlanan soru sayısına eklenir |
| 🟡 **Sonra Dön** (`revisit`) | Sarı İkon (`🟡`) | Bilgi eksik / teyit gerekli | **Tamamlandı sayılmaz**, açık takip konusu |
| 🔴 **Kritik Takip** (`critical`) | Kırmızı İkon (`🔴`) | Mutlaka açıklığa kavuşturulmalı | **Tamamlandı sayılmaz**, kritik açık konu |
| ⚪ **Cevaplanmadı** | Boş Daire (`○`) | Henüz ele alınmadı | Bekleyen soru |

### Katı İlerleme Dürüstlüğü Kuralı (Progress Truth)

🟡 **Sonra Dön** veya 🔴 **Kritik Takip** bayrağı taşıyan sorular, arkalarında cevap verisi bulunsa dahi **tamamlanmış / cevaplanmış sayılmaz**.
Örnek:
- 21 zorunlu sorudan oluşan bir satış setinde:
  - 17 soru cevaplandı
  - 3 soru `🟡 Sonra Dön`
  - 1 soru `🔴 Kritik Takip`
- **İlerleme Göstergesi:** `17 / 21 — %81 Tamamlandı`
- **Takip Göstergesi:** `🟡 3 Teyit Bekliyor | 🔴 1 Kritik Açık Konu`
- Sistem hiçbir zaman açık takipli sorular varken `%100 Tamamlandı` diyerek kendini kandırmaz.

---

## 3. Veritabanı Şeması (Migration 6)

### `question_followups` Tablosu
```sql
CREATE TABLE IF NOT EXISTS question_followups (
  id                     TEXT PRIMARY KEY,
  analysis_project_id    TEXT NOT NULL,
  business_function_code TEXT NOT NULL,
  question_id            TEXT NOT NULL,
  flag_type              TEXT NOT NULL, -- 'revisit' | 'critical'
  note                   TEXT,          -- Danışman gerekçe / takip notu
  status                 TEXT NOT NULL DEFAULT 'open', -- 'open' | 'resolved'
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL,
  resolved_at            TEXT,
  FOREIGN KEY (analysis_project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE,
  UNIQUE (analysis_project_id, business_function_code, question_id)
);

CREATE INDEX IF NOT EXISTS idx_qf_project_bf ON question_followups(analysis_project_id, business_function_code);
CREATE INDEX IF NOT EXISTS idx_qf_flag ON question_followups(flag_type);
```

---

## 4. Kullanıcı Arayüzü & Bileşenler

1. **QuestionCard:**
   - Soru kartının sağ üst köşesinde `🟡 Sonra Dön` ve `🔴 Kritik Takip` hızlı işlem butonları.
   - Aktif bayrak varsa kart üzerinde sarı/kırmızı takip uyarısı ve gerekçe notu.
2. **FollowupModal:**
   - Bayrak tipi seçimi (`🟡 Sonra Dön` vs `🔴 Kritik Takip`).
   - Takip notu / gerekçe metin kutusu.
   - "Bayrağı Kaldır" ve "Kaydet" aksiyonları.
3. **QuestionNavigator:**
   - Hızlı filtre tabları: `Tümü`, `✓ Cevaplanan`, `🟡 Sonra Dön`, `🔴 Kritik`, `○ Boş`.
   - Liste satırlarında 🟡 ve 🔴 göstergeleri.
   - Alt bilgi çubuğunda canlı sayaçlar (`🟡 X Teyit Bekliyor`, `🔴 Y Kritik Konu`).

---

## 5. Raporlama ve Dışa Aktarım Entegrasyonu

### 1. Report Preview View
- Soru kartı başlığında `[🟡 Sonra Dön]` veya `[🔴 Kritik Takip]` rozetleri.
- **Bölüm 5:** *Açık Sorular & Teyit Bekleyen Saha Başlıkları* tablosu:
  - Öncelik / Durum
  - İş Fonksiyonu & Süreç
  - Soru ID ve Soru Metni
  - Takip Notu / Gerekçe

### 2. Microsoft Word (.docx) Export
- Soru başlıklarında `[🟡 Sonra Dön]` ve `[🔴 Kritik Takip]` renkli etiketleri.
- Bölüm 5 altında tam tablolaştırılmış açık konular listesi.

### 3. PDF (.pdf) Export
- TrueType Unicode `LiberationSans` destekli `autoTable` ile açık konular tablosu.
- Türkçe karakterler ve emoji etiketleri tam kayıpsız.
