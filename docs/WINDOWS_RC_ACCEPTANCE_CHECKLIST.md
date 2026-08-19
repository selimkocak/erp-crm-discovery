# ERP CRM Discovery — Windows Release Candidate Acceptance Checklist

**Hedef Sürüm:** `v0.1.0` (Release Candidate 1)  
**Hedef Platform:** Windows 11 x64 (Birincil), Windows 10 x64 (İkincil)  
**Mimari:** `x86_64`  
**Paketleme Türü:** NSIS Setup Executable  
**Kanonik Artifact Arama Yolu:** `src-tauri/target/**/bundle/nsis/*.exe`  
**Tarih:** 19 Ağustos 2026  

---

## 1. Manuel Kabul Test Veri Seti (Standard Acceptance Dataset)

Windows makinesinde yapılacak manuel testlerde kullanılacak standart veri kümesi:

```text
[ Firma Bilgileri ]
Firma Adı:       FAZ-6 Test A.Ş.
Sektör:          Otomotiv Yan Sanayi
Çalışan Sayısı:  250
Şehir / Ülke:    İstanbul / Türkiye
Mevcut Yazılım:  Excel + Yerel Muhasebe

[ Proje Kapsamı ]
Proje Adı:       Windows Native Acceptance
Hedef Çözüm:     ERP_AND_CRM
Seçili Fonksiyon: Satış Yönetimi (SALES) - "Satış & Pazarlama Departmanı"

[ Soru-Cevap & Notlar ]
Soru:            SALES-001 (Müşteri ve potansiyel müşteri verileri nerede tutuluyor?)
Cevaplar:        "Mevcut ERP / CRM sistemi üzerinde" (erp_crm)
                 "Bölge/bireysel satış ekiplerinin kendi Excel dosyalarında" (excel)
Seçenek Notu 1:  Bölge satış ekipleri verileri haftalık birleştiriyor.
Seçenek Notu 2:  Excel şablonları merkezde konsolide ediliyor.
Genel Not:       Saha ekipleri mobil erişim talep ediyor.

[ Semantik Kayıtlar ]
Bulgu (Finding):       Merkezi müşteri veri tabanı bulunmuyor, veriler dağınık dosyalarda. (Yüksek / Açık)
Gereksinim (Req.):     Merkezi CRM müşteri ana veri yönetimi ve tekil kayıt kuralı. (Yüksek / Kapsamda)
Risk:                  Geçiş sırasında mükerrer ve kirli verilerin aktarılması riski. (Yüksek / Açık)
Proje Notu:            Müşteri tekilleştirme algoritması için veri temizliği toplantısı planlanacak.

[ Rapor Profili (Executive Summary) ]
Executive Summary:     Windows native kabul testi yönetici özeti.
Overall Assessment:    Temel süreçler test amacıyla doğrulanmaktadır.
Open Topics:           - Windows PDF görsel kontrolü
                       - DOCX düzenlenebilirlik kontrolü
```

---

## 2. Durum Değerleri Tanımı

Her test maddesi için yalnızca şu 4 durum kullanılabilir:
- **`PASS`**: Gerçek Windows işletim sistemi üzerinde başarıyla test edildi ve doğrulandı.
- **`FAIL`**: Gerçek Windows ortamında hata veya beklenmeyen davranış oluştu.
- **`NOT TESTED`**: Test henüz gerçek Windows ortamında icra edilmedi (Ubuntu geliştirme ortamında doğrulandı, Windows testi bekleniyor).
- **`EXPECTED WARNING`**: Açık kaynak imzasız sürüm için beklenen işletim sistemi uyarısı (örn: SmartScreen).

---

## 3. Windows Kabul Kontrol Tablosu

| # | Kontrol Maddesi | Beklenen Davranış ve Kabul Kriteri | Durum |
|---|---|---|:---:|
| **01** | **Installer Launch** | `*setup.exe` çift tıklanır. NSIS kurulum penceresi açılır. Türkçe ve İngilizce dil seçeneği sunulur. Yönetici (UAC) şifresi istemeden `currentUser` modunda (`%LOCALAPPDATA%\Programs\ERP CRM Discovery`) kurulur. | `NOT TESTED` |
| **02** | **App Launch** | Masaüstü veya Başlat Menüsü kısayolundan uygulama başlatılır. Beyaz ekran veya Rust panik olmadan ana ekran (HomeView) yüklenir. | `NOT TESTED` |
| **03** | **SQLite Clean-Install** | İlk açılışta `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` dosyası otomatik oluşturulur. Sıfır harici DB veya runtime kurulumu gerektirmez. | `NOT TESTED` |
| **04** | **Schema Tables (11 Tablo)** | 11 tablonun tamamı eksiksiz oluşur: `analysis_projects`, `company_profiles`, `business_functions`, `project_business_functions`, `question_answers`, `question_session_state`, `analysis_findings`, `analysis_requirements`, `analysis_risks`, `project_notes`, `analysis_report_profiles`. | `NOT TESTED` |
| **05** | **Business Functions (31)** | 31 standart kanonik iş fonksiyonu tohumlanır (Satış `SALES` dahil). | `NOT TESTED` |
| **06** | **Firma Oluşturma & Kapsam** | "Yeni Analiz" → `FAZ-6 Test A.Ş.` girilir → Satış (SALES) seçilir → "Analizi Oluştur" basılır. Proje kaydedilir. | `NOT TESTED` |
| **07** | **Company Persistence (Restart)** | Uygulama kapatılır ve tekrar açılır. Oluşturulan firma ve seçilen iş fonksiyonu eksiksiz listelenir. | `NOT TESTED` |
| **08** | **Question Engine** | Satış analizi açılır. Tekli seçim (`single_choice`), çoklu seçim (`multiple_choice`), açık uçlu metin (`text`), "Diğer" seçeneği, 2 seçenek notu ve genel not girilir. | `NOT TESTED` |
| **09** | **Branching (Koşullu Dallanma)** | Koşullu soru mantığı (koşul sağlanmadığında alt soruların dinamik gizlenmesi) UI'da doğrulanır. | `NOT TESTED` |
| **10** | **Restart State & Notes** | Sorular cevaplandıktan sonra uygulama kapatılıp açılır. Seçimler, notlar, `last_question_id` ve % ilerleme aynı kalır. | `NOT TESTED` |
| **11** | **Semantic Layer (4 Varlık)** | 1 Bulgu, 1 Gereksinim, 1 Risk ve 1 Proje Notu oluşturulur. Kapatıp açma sonrasında kayıtlar korunur. | `NOT TESTED` |
| **12** | **Report Profile (Executive Summary)** | Executive summary, overall assessment ve open topics girilir; kaydedilir. Kapatıp açınca korunur. | `NOT TESTED` |
| **13** | **Report Preview** | Rapor Önizleme ekranı açılır. Firma künyesi, kapsam tablosu, Satış cevapları, seçenek notları, genel notlar, bulgular, gereksinimler, riskler, yönetici özeti ve açık konular biçimli gösterilir. Raw JSON veya teknik ID görünmez. | `NOT TESTED` |
| **14** | **DOCX Native Save** | "Word (.docx)" butonuna basılır. Windows yerel "Farklı Kaydet" penceresi açılır. Masaüstü/Belgelerim seçilir ve dosya başarıyla yazılır. | `NOT TESTED` |
| **15** | **DOCX Verification** | Üretilen `.docx` dosyası Microsoft Word / LibreOffice ile açılır. Tablolar, başlıklar, renkli risk kartları, Türkçe karakterler ve notlar düzenlenebilir formatta doğrulanır. | `NOT TESTED` |
| **16** | **PDF Native Save** | "PDF (.pdf)" butonuna basılır. Native Save Dialog açılır. Dosya başarıyla kaydedilir. | `NOT TESTED` |
| **17** | **PDF Turkish Unicode (Visual)** | PDF açılır. Gömülü TrueType (Liberation Sans) sayesinde tüm Türkçe karakterler (**Çağrı, Çalışma, Ğ, İ, ı, Şirket, Üretim, Görüşme, İstanbul, Iğdır, Çeşme, Öğüt, Şüphe, çözüm**) eksiksiz, kutu/bozuk glif olmadan görüntülenir. | `NOT TESTED` |
| **18** | **PDF Selectable Text** | PDF'teki metinler fare ile seçilebilir, kopyalanabilir ve aranabilir vektörel metin formatındadır (Screenshot/Canvas değildir). | `NOT TESTED` |
| **19** | **Native Save Cancel** | DOCX ve PDF save dialogunda "İptal" (Cancel) butonuna basılır. Dosya oluşmaz, hata mesajı veya yanlış başarı uyarısı verilmez. | `NOT TESTED` |
| **20** | **Offline Operation** | Windows cihazında internet bağlantısı kesilir. Uygulama açılır, analiz yapılır, cevaplar girilir, preview açılır, DOCX ve PDF üretilir. %100 çevrimdışı çalışır. | `NOT TESTED` |
| **21** | **Zero Network Egress** | Uygulama çalışma süresince arka planda hiçbir harici HTTP/HTTPS, fetch, telemetri veya analitik çağrısı yapmaz. | `NOT TESTED` |
| **22** | **Installer Uninstall** | Windows Ayarlar / Yüklü Uygulamalar üzerinden kaldırılır. Program binary'leri temizlenir. Kullanıcının analiz veritabanı (`%APPDATA%\com.erpcrm.discovery\erp_discovery.db`) veri kaybını önlemek amacıyla korunur. | `NOT TESTED` |
| **23** | **SmartScreen Behavior** | İmzasız açık kaynak kurulum paketinde Windows SmartScreen "Bilinmeyen Yayıncı" uyarısı verir. "Ek Bilgi" → "Yine de Çalıştır" adımıyla sorunsuz açılır. | `EXPECTED WARNING` |
| **24** | **Windows Defender** | Windows Defender gerçek zamanlı koruma devredeyken false-positive engelleme oluşturmaz. | `NOT TESTED` |
