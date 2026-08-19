# FAZ-6.5 — Windows Physical Native Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.5 — Windows Physical Acceptance (Fiziksel Windows 10/11 Kabul Testi)  
**Versiyon:** `0.1.0 RC1`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**Dağıtım Paketi:** `ERP-CRM-Discovery-Windows-Setup` (NSIS Installer `.exe`)  
**GitHub Actions Run:** [https://github.com/selimkocak/erp-crm-discovery/actions](https://github.com/selimkocak/erp-crm-discovery/actions)  

---

## 1. Standart Kabul Test Veri Seti (Acceptance Dataset)

- **Firma Künyesi:** `FAZ-6 Test A.Ş.` (İstanbul / Türkiye / 250 Çalışan)
- **Proje:** `Windows Native Acceptance` (Hedef: `ERP_AND_CRM`)
- **İş Fonksiyonu Kapsamı:** `Sales` (Satış Yönetimi)
- **Rapor Profili:**
  - *Yönetici Özeti:* `Windows native kabul testi yönetici özeti.`
  - *Değerlendirme:* `Temel süreçler test amacıyla doğrulanmaktadır.`
  - *Açık Konular:* `- Windows PDF görsel kontrolü`, `- DOCX düzenlenebilirlik kontrolü`

---

## 2. 36 Maddelik Fiziksel Kabul Test Matrisi

| # | Test Maddesi | Hedef / Beklenen Davranış | Durum | Gözlem / Kanıt |
|---|---|---|---|---|
| **1** | Installer Çalışması | `.exe` çift tıklandığında kurulum sihirbazının açılması | `NOT TESTED` | Bekleniyor |
| **2** | SmartScreen Davranışı | İmzasız açık kaynak RC uyarısı (`Ek Bilgi` → `Yine de Çalıştır`) | `EXPECTED WARNING` | Bekleniyor |
| **3** | Kurulum Tamamlanması | UAC istemeden `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` kurulumu | `NOT TESTED` | Bekleniyor |
| **4** | Uygulama Açılışı | Masaüstü/Başlat kısayolu ile açılış | `NOT TESTED` | Bekleniyor |
| **5** | Crash / White Screen Kontrolü | WebView2 render hatası veya beyaz ekran olmaması | `NOT TESTED` | Bekleniyor |
| **6** | SQLite Otomatik Oluşumu | `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` (11 tablo + 31 fonksiyon) | `NOT TESTED` | Bekleniyor |
| **7** | Firma Oluşturma | `FAZ-6 Test A.Ş.` oluşturulması ve listelenmesi | `NOT TESTED` | Bekleniyor |
| **8** | İş Fonksiyonu Seçimi | `Sales` (Satış Yönetimi) fonksiyonunun seçilmesi | `NOT TESTED` | Bekleniyor |
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
| **34** | Uninstall | Windows Ayarlar / Denetim Masası üzerinden kaldırma | `NOT TESTED` | Bekleniyor |
| **35** | Veritabanı Korunumu | Uninstall sonrası `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` silinmemesi | `NOT TESTED` | Bekleniyor |
| **36** | Reinstall & Veri Geri Gelmesi | Tekrar kurulduğunda önceki `FAZ-6 Test A.Ş.` verilerinin geri gelmesi | `NOT TESTED` | Bekleniyor |

---

## 3. Faz Kabul Durumu

```text
WINDOWS BUILD: PASS
WINDOWS NATIVE ACCEPTANCE: PENDING (Physical Test in Progress)
ERP CRM Discovery v0.1.0 RC1: PENDING ACCEPTANCE
```
