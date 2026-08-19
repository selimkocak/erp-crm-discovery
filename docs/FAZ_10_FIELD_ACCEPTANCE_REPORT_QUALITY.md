# FAZ-10 — Saha Kabulü ve Rapor Kalite Sertleştirme Kılavuzu

**Tarih:** 19 Ağustos 2026  
**Sürüm:** `v0.1.0 (RC1)`  
**Platformlar:** Windows 10/11 x64 & macOS Apple Silicon (aarch64)  
**Durum:**
- `FIELD ACCEPTANCE: READY` (Fiziksel saha doğrulama testine hazır)
- `REPORT QUALITY HARDENING: PASS` (Otomatik kalite ve dürüstlük testleri mühürlendi)

---

## 1. Kapsam ve Amaç

FAZ-10, ERP CRM Discovery masaüstü uygulamasını yeni özellikler eklemek yerine; **saha danışmanlarının ve proje yöneticilerinin gerçek kullanım koşullarında** karşılaşacağı senaryoları simüle etmek, rapor şişkinliğini gidermek, proje tamamlanma oranını dürüstleştirmek ve platformlar arası pariteyi garantilemek amacıyla tasarlanmıştır.

---

## 2. Gerçek Saha Test Senaryosu (Adım Adım Kabul Akışı)

| Adım | İşlem | Beklenen Davranış | Doğrulama |
|---|---|---|---|
| **1** | Yeni Proje Başlat | Firma: "Test Mobilya A.Ş.", 31 İş Fonksiyonu seçili olarak proje oluşturulur. | Proje SQLite'a yazılır, fonksiyon listesi yüklenir. |
| **2** | Satış Analizine Gir | "Satış Yönetimi (SALES)" kartına tıklanarak soru ekranı açılır. | İlk soru (`SALES-001`) yüklenir. |
| **3** | Soruları Cevapla | `SALES-001`, `SALES-002`, `SALES-003` cevaplanır, seçenek notları girilir. | Autosave tetiklenir, yeşil "Değişiklikler kaydedildi" rozeti yanar. |
| **4** | 🟡 Sonra Dön Bayrağı Ekle | `SALES-004` için `🟡 Sonra Dön` seçilir ve *"B2B portal onay kuralları teyit edilecek"* notu yazılır. | Soru sarı bayrakla işaretlenir, tamamlanma sayısına **dahil edilmez**. |
| **5** | 🔴 Kritik Takip Bayrağı Ekle | `SALES-019` için `🔴 Kritik Takip` seçilir ve *"Yönetim kurulu kararı bekleniyor"* notu yazılır. | Soru kırmızı bayrakla işaretlenir, tamamlanma sayısına **dahil edilmez**. |
| **6** | Özel Soru Ekle | `+ Özel Soru Ekle` modalı açılarak bu projeye özel soru tanımlanır. | Soru SQLite `project_custom_questions` tablosuna yazılır; canonical soru paketi dokunulmaz kalır. |
| **7** | Navigatör ile Geri Atlama | Sol Soru Navigatöründen `SALES-001` seçilerek doğrudan geri dönülür ve cevap güncellenir. | Güncellenen cevap SQLite'a anında yazılır. |
| **8** | Kaydet ve Çık | "Kaydet ve Çık" butonuna basılır, uygulama kapatılır. | Bekleyen tüm yazmalar diske flush edilir, son kalınan soru ID'si kaydedilir. |
| **9** | Yeniden Açma & Resume | Uygulama tekrar açılır, projeye girilir ve "Kaldığın Yerden Devam Et" butonuna basılır. | En son kalınan soru doğrudan ekrana gelir; hiçbir veri kaybı yaşanmaz. |
| **10** | Rapor Önizleme Aç | "Rapor Önizleme" butonuna basılır. | 31 fonksiyon kapsam tablosunda listelenirken, arkada 30 adet boş fonksiyon bölümü **oluşturulmaz**; sadece Satış bölümü detaylandırılır. |
| **11** | Word (.docx) İndir | "Word (.docx)" butonuna basılır. | Masaüstü kaydetme penceresi açılır, dosya kaydedilir, Microsoft Word'de düzenlenebilir olarak açılır. |
| **12** | PDF (.pdf) İndir | "PDF" butonuna basılır. | Masaüstü kaydetme penceresi açılır, dosya kaydedilir, Adobe Acrobat / Önizleme ile Türkçe karakterler eksiksiz açılır. |

---

## 3. Rapor Kalite ve Dürüstlük İlkeleri

### 3.1 Rapor Kompaktlığı ve Şişkinlik Önleme (Scope Hardening)
* **Eski Durum:** Projede 31 fonksiyon seçildiğinde, sadece Satış analizi yapılmış olsa bile 35 sayfalık raporda 30 adet içi boş fonksiyon başlığı ve gereksiz sayfa bölünmeleri oluşuyordu.
* **FAZ-10 Çözümü:**
  * **Analiz Kapsamı & İlerleme Tablosu:** 31 fonksiyonun tümü (durumları, kategorileri ve ilerlemeleri ile) tek tabloda listelenir.
  * **İş Fonksiyonları Detay Analizi Bölümü:** Yalnızca analizi başlatılmış, soru paketi bulunan veya bulgu/risk/not/özel soru/takip bayrağı içeren fonksiyonlar detaylandırılır.
  * **Sonuç:** Tek fonksiyonlu analiz raporu 35 sayfadan 4-6 sayfalık kompakt, profesyonel bir yönetim özetine dönüşür.

### 3.2 Proje Tamamlanma Gerçeği (Project Scope Truth)
* **Kural:** Tek bir iş fonksiyonunun %100 olması, projenin tamamlandığı anlamına gelmez.
* **Metaveri ve Başlık Gösterimi:**
  * `selectedFunctionCount`: 31
  * `completedFunctionCount`: 1
  * `projectProgressPercent`: %3 (1/31)
  * `draftLabel`: *"ARA RAPOR — 31 iş fonksiyonundan 1'i tamamlandı (Soru İlerlemesi: %100)"*
  * Projenin 31 fonksiyonu da tamamlanmadan rapor hiçbir zaman `FİNAL RAPOR` veya `%100 Tamamlandı` olarak adlandırılmaz.

### 3.3 Terminoloji ve Veri Temizliği (Data Quality)
* Teknik kodlar ve veritabanı ID'leri (`NOT_STARTED`, `IN_PROGRESS`, `bf_sales`, `UUID`) son kullanıcı raporlarında gösterilmez.
* Durumlar yerel Türkçe etiketlere dönüştürülür:
  * `not_started` -> **Başlanmadı**
  * `in_progress` -> **Devam Ediyor**
  * `completed` -> **Tamamlandı**
* Hiçbir ham JSON dizisi veya serileştirme artığı raporda yer almaz.

### 3.4 Bölüm 5: Açık Sorular & Teyit Bekleyen Saha Başlıkları
Rapor Önizleme, Word ve PDF çıktılarında Bölüm 5 tablosu şu sütunlarla yapılandırılmıştır:
1. **Durum / Öncelik:** `🟡 Sonra Dön` veya `🔴 Kritik Takip` renkli rozeti
2. **İş Fonksiyonu & Süreç:** İlgili departman ve iş süreci
3. **Soru:** Metodoloji soru kodu ve tam soru metni
4. **Takip Notu / Gerekçe:** Danışmanın girdiği açıklama

---

## 4. Kullanıcı Deneyimi ve Hata Yönetimi (Error UX)

Native masaüstü eklentilerinden dönen teknik hata kodları (ACL ihlalleri, kilitli dosya erişimleri, izin reddi vb.) son kullanıcıya doğrudan gösterilmez; anlaşılır Türkçe rehberliğe dönüştürülür:

| Teknik Hata | Kullanıcı Dostu Mesaj |
|---|---|
| `plugin:fs\|write_file not allowed by ACL` | *"Dosya kaydedilemedi. Lütfen uygulamanın dosya yazma izinlerini veya hedef klasör yetkisini kontrol edin."* |
| `EBUSY: resource locked` | *"Dosya başka bir program (örn. Microsoft Word veya Adobe Acrobat) tarafından açık tutulduğu için üzerine yazılamadı. Lütfen açık dosyayı kapatıp tekrar deneyin."* |
| `EACCES: Permission denied` | *"Seçilen konuma dosya yazma izni bulunmuyor. Lütfen Masaüstü veya Belgeler klasörünü seçin."* |

---

## 5. Platform Parite Matrisi (Windows vs macOS)

| Özellik / Bileşen | Windows 10/11 (x64) | macOS Apple Silicon (M1..M5) | Parite Durumu |
|---|---|---|---|
| **Uygulama Başlatma & Pencere** | Native WebView2 | Native WebKit | **PARİTE TAM** |
| **Yerel SQLite (15 Tablo)** | `%LOCALAPPDATA%\...` | `~/Library/Application Support/...` | **PARİTE TAM** |
| **Soru Paketi Motoru (38 Soru)** | Aktif | Aktif | **PARİTE TAM** |
| **Soru Navigatörü & Atlama** | Aktif | Aktif | **PARİTE TAM** |
| **Takip Bayrakları (🟡 / 🔴)** | Aktif | Aktif | **PARİTE TAM** |
| **Proje Özel Soruları (CRUD)** | Aktif | Aktif | **PARİTE TAM** |
| **Autosave & Resume State** | Aktif | Aktif | **PARİTE TAM** |
| **Rapor Önizleme & TOC** | Aktif | Aktif | **PARİTE TAM** |
| **Word (.docx) Dışa Aktarım** | Native Save Dialog + FS | Native Save Dialog + FS | **PARİTE TAM** |
| **PDF (.pdf) Dışa Aktarım** | Native Save Dialog + FS | Native Save Dialog + FS | **PARİTE TAM** |
| **Kurulum Yardım Belgesi** | `WINDOWS_KURULUM_YARDIMI.txt` | `MACOS_KURULUM_YARDIMI.txt` | **PARİTE TAM** |
| **Dağıtım Paketi** | `.exe` NSIS Installer + ZIP | `.dmg` + `.app.tar.gz` + ZIP | **PARİTE TAM** |

---

## 6. Dağıtım Paketleri & Kurulum Kılavuzları

### Windows Dağıtım Yapısı (`ERP-CRM-Discovery-Windows-Setup.zip`):
```text
ERP-CRM-Discovery-Windows-Setup/
├── ERP-CRM-Discovery_0.1.0_x64-setup.exe
├── WINDOWS_KURULUM_YARDIMI.txt
└── SHA256SUMS.txt
```

### macOS Dağıtım Yapısı (`ERP-CRM-Discovery-macOS-Apple-Silicon.zip`):
```text
ERP-CRM-Discovery-macOS-Apple-Silicon/
├── ERP CRM Discovery_0.1.0_aarch64.dmg
├── ERP-CRM-Discovery.app.tar.gz
├── MACOS_KURULUM_YARDIMI.txt
└── SHA256SUMS.txt
```

---

## 7. Performans ve Smoke Gözlem Değerleri

| İşlem | Hedef Süre | Ölçülen Ortalama | Durum |
|---|---|---|---|
| **Uygulama Açılış (Cold Start)** | < 1.5s | ~0.8s | **PASS** |
| **Soru Navigatörü Açılış / Filtreleme** | < 100ms | ~15ms | **PASS** |
| **Cevap Kaydetme (Autosave Debounce)** | < 300ms | ~150ms | **PASS** |
| **Rapor Modeli Derleme (Build)** | < 500ms | ~85ms | **PASS** |
| **Word (.docx) Dosya Üretimi** | < 1.0s | ~180ms | **PASS** |
| **PDF (.pdf) Dosya Üretimi (Unicode)** | < 1.5s | ~320ms | **PASS** |

---

## 8. Faz Kapanış ve Kabul Durumu

```text
══════════════════════════════════════════════════
FAZ-10 Otomatik Test Sonucu: 28 PASS / 0 FAIL
Tüm Fazlar Toplamı (10 Paket): 494 PASS / 0 FAIL (%100 Başarı)
══════════════════════════════════════════════════
```

* **FIELD ACCEPTANCE:** `READY` (Fiziksel Windows ve macOS cihaz kabulü için paket hazırlandı)
* **REPORT QUALITY HARDENING:** `PASS` (Kompakt raporlama, dürüst tamamlanma oranı ve terminoloji sertleştirmesi tamamlandı)
