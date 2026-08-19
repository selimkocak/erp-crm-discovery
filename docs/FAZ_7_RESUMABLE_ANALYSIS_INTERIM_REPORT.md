# FAZ-7 — Resumable Analysis & Interim Reporting Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-7 — Resumable Analysis + Interim Reporting (Kaldığı Yerden Devam Eden Analiz & Ara Raporlama)  
**Versiyon:** `0.1.0 RC1`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**GitHub Depo URL:** [https://github.com/selimkocak/erp-crm-discovery](https://github.com/selimkocak/erp-crm-discovery)  

---

## 1. Saha Problemi & Çözüm Mimarisi

Kurumsal ERP ve CRM saha analizleri doğası gereği tek oturumda tamamlanamaz. Görüşmeler bölünür, toplantılar birden fazla güne yayılır veya departman yetkilileri ile farklı zamanlarda bir araya gelinir.

**FAZ-7 ile sağlanan temel garanti:**
Kullanıcı istediği an uygulamadan ayrılabilir, "Kaydet ve Çık" yapabilir veya mevcut ilerleme ile **Ara Rapor (Interim Report)** alabilir. Tekrar girdiğinde doğrudan en son kaldığı sorudan devam eder.

---

## 2. Mimari Bileşenler ve İlkeler

```text
Soru Cevaplama / Değişim
          ↓ (600ms debounce veya Flush)
      Autosave
          ↓
SQLite: question_answers & question_session_state
          ↓
  Çıkış / Yeniden Açılış (Resume)
          ↓
Doğrudan En Son Kalınan Soru (last_question_id)
          ↓
Tekil ReportModel (isComplete: false / true)
     ├── UI Önizleme (Taslak Rozeti)
     ├── Word DOCX (Ara Rapor Çağrı Kutusu)
     └── PDF (TrueType Unicode + Ara Rapor Başlığı)
```

### A. Autosave Güvencesi & Gerçek Durum Bildirimi
- Seçilen seçenekler, seçenek özel notları, "Diğer" açıklamaları ve genel görüşme notları 600ms debounce ile SQLite veritabanına otomatik olarak yazılır.
- Üst barda yer alan durum rozeti yalnızca DB kayıt işlemi başarıyla tamamlandığında `"Değişiklikler kaydedildi"` durumunu gösterir (asla sahte/optimistic başarı gösterilmez).

### B. Oturum Durumu (Session State) & Devam Etme (Resume)
- `question_session_state` tablosu üzerinde fonksiyon bazında `last_question_id` sürekli güncellenir.
- Proje Detay ekranında başlanmış fonksiyonlar için `"Analize Devam Et"` butonu görünür. Tıklandığında doğrudan son cevaplanan/görüntülenen soru açılır.

### C. İstediğin An Ayrıl & "Kaydet ve Çık"
- Soru ekranının üst çubuğunda ve alt navigasyonunda **"Kaydet ve Çık"** butonu yer alır.
- Navigasyon veya pencere kapanışında bekleyen tüm debounce kayıtları anında diske yazılır (`flushPendingSave`).

### D. Ara Rapor (Interim Report) & Taslak Durumu
- Analiz tamamlanmamış olsa dahi istenen her aşamada **"Ara Rapor"** alınabilir.
- Yeni veya ikinci bir rapor motoru yazılmamıştır; mevcut tekil `ReportModel` mimarisi kullanılmıştır.
- **Rapor Başlık ve Rozeti:**
  - Tamamlanmamış: `ARA RAPOR — Analiz %48 tamamlandı (Taslak)`
  - Tamamlanmış: `ÖN ANALİZ RAPORU (FİNAL)`
- **Dosya Adlandırması (Filename Helper):**
  - Ara Rapor: `ABC_Mobilya_A.Ş._ERP_CRM_Ara_Analiz_48pct_2026-08-19.docx`
  - Final Rapor: `ABC_Mobilya_A.Ş._ERP_CRM_On_Analiz_2026-08-19.docx`
- **Rapor İçeriği:** Yalnızca cevaplanmış sorular, eklenen bulgular, gereksinimler, riskler ve proje notları rapora dahil edilir; cevaplanmamış sorular default olarak rapora basılmaz.

---

## 3. Test ve Doğrulama Sonuçları

`test/faz7_resumable_report_test.ts` test paketi oluşturulmuş ve çalıştırılmıştır:

| Test Senaryosu | Beklenen Davranış | Durum |
|---|---|---|
| **T01: Filename Sanitizer** | Ara rapor için `_Ara_Analiz_48pct_` ve final için `_On_Analiz_` üretimi | ✓ **PASS** |
| **T02: Partial ReportModel** | `isComplete: false`, `progressPercent: 48`, `draftLabel` doğrulaması | ✓ **PASS** |
| **T03: DOCX Interim Banner** | Word belgesinde turuncu taslak ara analiz kutusunun basılması | ✓ **PASS** |
| **T04: PDF Interim Banner & Unicode** | PDF belgesinde gömülü font ile `ARA RAPOR` ve Türkçe gliflerin çıkarılması | ✓ **PASS** |
| **T05: SQLite Session State Resume** | DB kapatılıp açıldığında `SALES-003` sorusunun ve cevap notlarının korunması | ✓ **PASS** |

### Test Özeti
- **`npm test` (Full Suite):** **380 PASS / 0 FAIL** (%100 Başarı)
- **`npm run test:windows`:** **354 PASS / 0 FAIL** (%100 Başarı)
- **`npm run build`:** **✓ built in 4.58s (0 Hata)**
- **`cargo check`:** **Finished dev profile in 0.25s (0 Hata)**

---

## 4. Kabul Durumu

```text
RESUMABLE ANALYSIS: PASS
INTERIM REPORTING: PASS
```

---

FAZ-7 tamamlandı. Yeni soru paketlerine başlamıyorum; saha kullanım akışı mimari inceleme bekliyor.
