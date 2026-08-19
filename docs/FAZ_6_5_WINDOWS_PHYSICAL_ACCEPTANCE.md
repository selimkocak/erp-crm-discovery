# FAZ-6.5 — Windows Physical Native Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.5 — Windows Physical Acceptance (Fiziksel Windows 10/11 Kabul Testi)  
**Versiyon:** `0.1.0 RC1`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**Dağıtım Paketi:** `ERP-CRM-Discovery-Windows-Setup` (NSIS Installer `.exe`)  
**GitHub Actions Run:** [https://github.com/selimkocak/erp-crm-discovery/actions](https://github.com/selimkocak/erp-crm-discovery/actions)  

---

## 1. Fiziksel Test Gözlemleri ve Olay Günlüğü

### İlk Fiziksel Doğrulama (Build #7):
- **PASS:** NSIS installer (`.exe`) başarıyla açıldı.
- **PASS:** Windows SmartScreen imzasız RC uyarısı (`Ek Bilgi` → `Yine de Çalıştır`) beklendiği gibi oluştu ve geçildi (`EXPECTED WARNING`).
- **PASS:** Kurulum `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` konumuna tamamlandı.
- **PASS:** Native Tauri 2 masaüstü penceresi beyaz ekran (blank screen) olmadan başarıyla açıldı.
- **FAIL (Kök Neden & Çözüm):** 
  - *Hata:* `[ERP Discovery] Tauri SQL plugin başlatılamadı. Hata: Command plugin:sql|execute not allowed by ACL`
  - *Kök Neden:* Tauri 2 SQL plugin yetki modelinde `sql:default` yalnız load/select/close izinlerini vermektedir; migration ve INSERT/UPDATE/DELETE işlemleri için `sql:allow-execute` yetkisi zorunludur.
  - *Düzeltme:* `src-tauri/capabilities/default.json` dosyasına `"sql:allow-execute"` capability izni eklendi.
  - *Durum:* **RETEST REQUIRED (Yeni Windows derlemesi ile)**

---

## 2. Standart Kabul Test Veri Seti (Acceptance Dataset)

- **Firma Künyesi:** `FAZ-6 Test A.Ş.` (İstanbul / Türkiye / 250 Çalışan)
- **Proje:** `Windows Native Acceptance` (Hedef: `ERP_AND_CRM`)
- **İş Fonksiyonu Kapsamı:** `Sales` (Satış Yönetimi)
- **Rapor Profili:**
  - *Yönetici Özeti:* `Windows native kabul testi yönetici özeti.`
  - *Değerlendirme:* `Temel süreçler test amacıyla doğrulanmaktadır.`
  - *Açık Konular:* `- Windows PDF görsel kontrolü`, `- DOCX düzenlenebilirlik kontrolü`

---

## 3. 36 Maddelik Fiziksel Kabul Test Matrisi

| # | Test Maddesi | Hedef / Beklenen Davranış | Durum | Gözlem / Kanıt |
|---|---|---|---|---|
| **1** | Installer Çalışması | `.exe` çift tıklandığında kurulum sihirbazının açılması | ✓ **PASS** | Kurulum sihirbazı sorunsuz açıldı |
| **2** | SmartScreen Davranışı | İmzasız açık kaynak RC uyarısı (`Ek Bilgi` → `Yine de Çalıştır`) | ✓ **EXPECTED WARNING** | Beklenen SmartScreen uyarısı çıktı ve geçildi |
| **3** | Kurulum Tamamlanması | UAC istemeden `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` kurulumu | ✓ **PASS** | Kurulum başarıyla tamamlandı |
| **4** | Uygulama Açılışı | Masaüstü/Başlat kısayolu ile açılış | ✓ **PASS** | Masaüstü kısayolundan açıldı |
| **5** | Crash / White Screen Kontrolü | WebView2 render hatası veya beyaz ekran olmaması | ✓ **PASS** | Beyaz ekran yok, UI render oldu |
| **6** | SQLite Otomatik Oluşumu | `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` (11 tablo + 31 fonksiyon) | 🟡 **RETEST REQUIRED** | `sql:allow-execute` eklendi; yeni artifact ile doğrulanacak |
| **7** | Firma Oluşturma | `FAZ-6 Test A.Ş.` oluşturulması ve listelenmesi | `NOT TESTED` | DB ACL düzeltmesi sonrası test edilecek |
| **8** | İş Fonksiyonu Seçimi | `Sales` (Satış Yönetimi) fonksiyonunun seçilmesi | `NOT TESTED` | DB ACL düzeltmesi sonrası test edilecek |
| **9** | Proje Kalıcılığı (Restart) | Uygulamayı kapatıp açınca projenin korunması | `NOT TESTED` | Bekleniyor |
| **10** | Sales Question Engine | Soru ekranının açılması (`SALES-001`) | `NOT TESTED` | Bekleniyor |
| **11** | Single Choice | Tekli seçim şıkkının işaretlenmesi ve kaydedilmesi | `NOT TESTED` | Bekleniyor |
| **12** | Multiple Choice | Çoklu seçim şıklarının işaretlenmesi | `NOT TESTED` | Bekleniyor |
| **13** | Seçenek Özel Notları | 2 farklı seçenek için girilen özel notların saklanması | `NOT TESTED` | Bekleniyor |
| **14** | Genel Görüşme Notu | Soru kartındaki genel notun saklanması | `NOT TESTED` | Bekleniyor |
| **15** | "Diğer" + Zorunlu Açıklama | Diğer seçildiğinde açıklama alanının zorunlu olması ve kaydedilmesi | `NOT TESTED` | Bekleniyor |
| **16** | Koşullu Dallanma (Branching) | İlgisiz soruların kurala göre gizlenmesi | `NOT TESTED` | Bekleniyor |
| **17** | Progress & Last Question Restart | Kapatıp açınca son kalınan soru ve ilerleme yüzdesinin korunması | `NOT TESTED` | Bekleniyor |
| **18** | Bulgu (Finding) Oluşturma | 1 adet süreç bulgusu eklenmesi | `NOT TESTED` | Bekleniyor |
| **19** | Gereksinim (Requirement) Ekleme | 1 adet fonksiyonel gereksinim eklenmesi | `NOT TESTED` | Bekleniyor |
| **20** | Risk Oluşturma | 1 adet proje riski (Olasılık/Etki) eklenmesi | `NOT TESTED` | Bekleniyor |
| **21** | Proje Notu Ekleme | 1 adet serbest proje notu eklenmesi | `NOT TESTED` | Bekleniyor |
| **22** | Semantik Kayıtlar Restart | Kapatıp açınca 4 semantik kaydın eksiksiz listelenmesi | `NOT TESTED` | Bekleniyor |
| **23** | Report Preview | Yönetici özeti, kapsam, bulgular ve risklerin önizlenmesi | `NOT TESTED` | Bekleniyor |
| **24** | DOCX Native Save Dialog | "Word (.docx)" butonuna basınca Windows dosya kaydetme penceresi açılması | `NOT TESTED` | Bekleniyor |
| **25** | DOCX Kayıt & Word Uyumluluğu | Masaüstüne kaydedilen `.docx` dosyasının MS Word ile açılıp düzenlenebilmesi | `NOT TESTED` | Bekleniyor |
| **26** | PDF Native Save Dialog | "PDF (.pdf)" butonuna basınca Windows dosya kaydetme penceresi açılması | `NOT TESTED` | Bekleniyor |
| **27** | PDF Kayıt | `.pdf` dosyasının Masaüstüne başarıyla yazılması | `NOT TESTED` | Bekleniyor |
| **28** | PDF Türkçe Karakterler | Gömülü font ile `Ç, ğ, ı, Ş, Ü, Ö, İ` karakterlerinin kusursuz render edilmesi | `NOT TESTED` | Bekleniyor |
| **29** | PDF Metin Seçilebilirliği | PDF içerisindeki metinlerin kopyalanabilir ve aranabilir olması | `NOT TESTED` | Bekleniyor |
| **30** | Save Dialog İptal (Cancel) | Kaydet penceresinde 'İptal' basıldığında uygulamanın çökmemesi | `NOT TESTED` | Bekleniyor |
| **31** | Offline Çalışma | Wi-Fi / Ethernet kapalıyken uygulamanın açılması ve veri girişi | `NOT TESTED` | Bekleniyor |
| **32** | Offline DOCX/PDF Üretimi | İnternetsiz ortamda DOCX ve PDF üretilebilmesi | `NOT TESTED` | Bekleniyor |
| **33** | Windows Defender Davranışı | Gerçek zamanlı korumanın engelleme yapmaması | `NOT TESTED` | Bekleniyor |
| **34** | Standart Kullanıcı Yetkisi | Admin / Administrator yetkisi olmadan çalışma | `NOT TESTED` | Bekleniyor |
| **35** | Kaldırma (Uninstall) | Program Ekle/Kaldır ile silinmesi | `NOT TESTED` | Bekleniyor |
| **36** | Kaldırma Sonrası DB Korunumu | `%APPDATA%\com.erpcrm.discovery\` SQLite DB'nin silinmediğinin teyidi | `NOT TESTED` | Bekleniyor |

---

## 4. Sonuç ve Durum

- **Windows Build:** `PASS`
- **Windows Physical Acceptance:** `RETEST REQUIRED (SQL ACL Fix Applied)`
- **Sıradaki İşlem:** Yeni üretilen Windows NSIS Installer `.exe` artifact'inin indirilip kurulması ve DB başlatma testinin doğrulanması.
