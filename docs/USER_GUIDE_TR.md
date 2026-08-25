# ERP CRM Discovery — Türkçe Kullanıcı Kılavuzu (User Guide)

> **Sürüm:** `v0.1.4`  
> **Platformlar:** Windows 10/11, macOS (Intel & Apple Silicon), Linux (Ubuntu/Debian)  
> **Lisans:** Açık Kaynak (MIT)  

---

## İçindekiler
1. [Giriş ve Temel İlkeler](#1-giriş-ve-temel-ilkeler)
2. [Uygulamayı Başlatma ve Ana Ekran](#2-uygulamayı-başlatma-ve-ana-ekran)
3. [Yeni Proje Oluşturma ve Şirket Profili](#3-yeni-proje-oluşturma-ve-şirket-profili)
4. [İş Fonksiyonlarını Seçme ve Kapsam Yönetimi](#4-iş-fonksiyonlarını-seçme-ve-kapsam-yönetimi)
5. [Soru Cevaplama, Seçim Temizleme ve Notlar](#5-soru-cevaplama-seçim-temizleme-ve-notlar)
6. [Soru Takip Bayrakları (Sonra Dön ve Kritik Takip)](#6-soru-takip-bayrakları-sonra-dön-ve-kritik-takip)
7. [Yönetilen Kanıt Kasası ve Dosya Ekleri](#7-yönetilen-kanıt-kasası-ve-dosya-ekleri)
8. [OT İstasyonları ve Endüstriyel Veri Matrisi](#8-ot-istasyonları-ve-endüstriyel-veri-matrisi)
9. [Süreç Haritaları ve Benimseme Riski Analizi](#9-süreç-haritaları-ve-benimseme-riski-analizi)
10. [Veri Sahipliği, Yetki Matrisi ve SoD Yönetişimi](#10-veri-sahipliği-yetki-matrisi-ve-sod-yönetişimi)
11. [Saha Kanıtları ve Doğrulama Kayıt Defteri](#11-saha-kanıtları-ve-doğrulama-kayıt-defteri)
12. [Go-Live Hazırlığı ve Keşif Kontrol Listesi](#12-go-live-hazırlığı-ve-keşif-kontrol-listesi)
13. [Rapor Önizleme, Word (.docx) ve PDF (.pdf) Dışa Aktarma](#13-rapor-önizleme-word-docx-ve-pdf-pdf-dışa-aktarma)
14. [Taşınabilir .erpcrm Yedeği Alma, Geri Yükleme ve Çoğaltma](#14-taşınabilir-erpcrm-yedeği-alma-geri-yükleme-ve-çoğaltma)
15. [Hassas Veriler, Gizlilik ve Güvenlik Uyarıları](#15-hassas-veriler-gizlilik-ve-güvenlik-uyarıları)

---

## 1. Giriş ve Temel İlkeler

**ERP CRM Discovery**, kurumsal yazılım (ERP, CRM, MES, WMS) yatırımları öncesinde saha gerçeklerini, süreç olgunluğunu, veri sahipliğini ve riskleri yapılandırılmış bir modelle ortaya koyan **%100 çevrimdışı (offline-first)** bir analiz aracıdır.

### Temel Güvenceler:
- 🔒 **Sıfır Bulut Bağımlılığı:** Verileriniz asla internete veya harici bir buluta gönderilmez.
- 🚫 **Yapay Zekâ İçermez:** Kararlar ve analizler insan aklına ve doğrulanmış saha verilerine dayanır.
- 📂 **Yerel Dosya Bütünlüğü:** Tüm veritabanı bilgisayarınızdaki yerel SQLite dosyasında tutulur.

---

## 2. Uygulamayı Başlatma ve Ana Ekran

Uygulamayı çalıştırdığınızda sizi **Projeler Ana Ekranı** karşılar:
- **Proje Listesi:** Daha önce açtığınız tüm projeler durumlarına göre (`Aktif`, `Pasif`, `Tamamlandı`, `Arşiv`) filtrelenebilir.
- **[+ Yeni Proje Oluştur] Butonu:** Sıfırdan bir şirket keşif projesi başlatır.
- **[Örnek Pilot Proje Oluştur] Butonu:** Kurgusal ve zengin bir kesikli imalat senaryosu olan *Marmara Endüstriyel Sistemler A.Ş.* pilotunu tek tıkla yükler.
- **[Yedekten İçe Aktar (.erpcrm)] Butonu:** Başka bir bilgisayardan alınan taşınabilir proje arşivini içeri aktarır.

---

## 3. Yeni Proje Oluşturma ve Şirket Profili

Yeni proje sihirbazı 2 temel adımdan oluşur:

1. **Proje ve Şirket Bilgileri:**
   - Proje Adı (örn: *Atlas Makine ERP Ön Analizi*)
   - Şirket Resmi Unvanı ve Ticari Adı
   - Şehir, Ülke ve Vergi Numarası
   - Çalışan Sayısı Aralığı (örn: *101–250*, *251–500*)
   - Faaliyet Alanı / Sektör (örn: *Otomotiv Yan Sanayi, Plastik Enjeksiyon*)
   - Çok Lokasyonlu / Şubeli Yapı Durumu (Şube sayısı)
2. **Proje Takvimi (Opsiyonel):**
   - Planlanan Başlangıç ve Bitiş Tarihleri
   - Fiili Başlangıç Tarihi

---

## 4. İş Fonksiyonlarını Seçme ve Kapsam Yönetimi

ERP CRM Discovery, **34 kanonik iş fonksiyonunu** destekler:
- *Satış, Satın Alma, Depo, Stok, Lojistik, Muhasebe, Finans, Bütçe, Raporlama, CRM, Teklif, Pazarlama, Tedarikçi Yönetimi, Kalite, Bakım, Üretim Planlama, İş Emirleri, Maliyet, Sabit Kıymet, İK, Bordro, Hukuk & Uyum, BT Altyapısı, Ana Veri Yönetimi, Proje Yönetimi, E-Dönüşüm, Faturalama, Doküman Yönetimi, İthalat, İhracat, E-Ticaret, Genel Yönetim, Strateji, Eğitim ve OT Endüstriyel Veri.*

Projenizin kapsamına giren fonksiyonları işaretleyin. Kapsam dışı bırakılan modüller analiz sürecinde gereksiz soru yükü oluşturmaz. Dilediğiniz zaman Proje Detay ekranındaki **[Kapsamı Düzenle]** butonuyla modül ekleyip çıkarabilirsiniz (çıkarılan modüllerin geçmiş cevapları veritabanında güvenle saklanır).

---

## 5. Soru Cevaplama, Seçim Temizleme ve Notlar

Her iş fonksiyonunun içine girdiğinizde deklaratif soru motoru açılır:
- **Tek Seçimli Sorular (Radio):** Seçeneğe tıklayarak işaretleyin. Yanlışlıkla işaretlediğiniz bir seçimi kaldırmak için klavyeden **`Escape`** tuşuna basabilir veya sağ üstteki **[Seçimi Kaldır]** butonunu kullanabilirsiniz.
- **Çoklu Seçim (Checkbox):** Birden fazla ilgili seçeneği işaretleyebilirsiniz.
- **Açık Uçlu Metin:** Şirketin özel durumunu serbest metin olarak yazabilirsiniz.
- **Seçenek Notu & Genel Not:** Belirli bir seçeneğin gerekçesini veya mülakat sırasında paylaşılan detayları yazabilirsiniz.
- **Koşullu Dallanma:** Verdiğiniz cevaplara göre ilgili olmayan alt sorular dinamik olarak gizlenir.

---

## 6. Soru Takip Bayrakları (Sonra Dön ve Kritik Takip)

Saha görüşmesi sırasında anında netleştirilemeyen sorular için sağ üstteki bayrak butonlarını kullanın:
- 🟡 **Sonra Dön (Revisit Later):** Bilgi eksikliği veya teyit ihtiyacı olan sorular için kullanılır.
- 🔴 **Kritik Takip (Critical Followup):** ERP başarısını doğrudan tehdit eden kritik belirsizlikler için kullanılır.

Bayrak atanan sorular otomatik olarak raporun **Bölüm 8 Açık Konular Tablosu**'na taşınır.

---

## 7. Yönetilen Kanıt Kasası ve Dosya Ekleri

Beyan edilen süreçlerin doğrulanması için soru ekranında ataç (**📎**) butonuna tıklayarak dosya ekleyebilirsiniz (PDF, Excel, Word, resim vb.):
- Eklenen dosya, orijinal konumundan bağımsız olarak proje dizinindeki **Yönetilen Kanıt Kasası'na (Managed Attachment Vault)** fiziksel olarak kopyalanır.
- Dosyanın **SHA-256 özeti** alınarak bütünlüğü garanti edilir.
- Dosya adına tıklayarak işletim sisteminizin varsayılan programıyla belgeyi doğrudan açabilirsiniz.

---

## 8. OT İstasyonları ve Endüstriyel Veri Matrisi

Üretim sahasındaki makineler ve otomasyon ekipmanları için:
1. **İstasyon Ekleme:** `Fabrika -> Alan -> Hat -> İstasyon -> Makine` hiyerarşisinde istasyonlar tanımlayın.
2. **OT Soru Paketi:** PLC modelleri (Siemens, Mitsubishi, Beckhoff), haberleşme protokolleri (OPC-UA, Modbus), OEE hesaplama, duruş sinyalleri ve enerji analizörü verilerini kaydedin.
3. **Legacy Makineler:** Sensörsüz veya PLC çıkışı olmayan eski makineler için manuel terminal akışlarını belirleyin.

---

## 9. Süreç Haritaları ve Benimseme Riski Analizi

Süreç Haritaları sekmesinde:
- İş akışlarını görsel adımlarla (Görev, Karar Noktası, Havuz) modelleyin.
- Sistem; onay döngüsü, karar sayısı ve aktör çeşitliliğine göre sürecin **Karmaşıklık Skorunu** hesaplar.
- Aşırı bürokratik süreçler için **Yüksek Benimseme Riski (Adoption Risk)** uyarısı üretilir.

---

## 10. Veri Sahipliği, Yetki Matrisi ve SoD Yönetişimi

Yönetişim sekmesinde:
- **RACI Matrisi:** Malzeme, tedarikçi, reçete vb. kritik nesneler için Veri Sahibi (Data Owner) ve Veri Sorumlusu (Data Steward) rollerini belirleyin.
- **Yetki Sapmaları:** Planlanan sorumluluk ile fiili ERP yetkileri arasındaki sapmaları (discrepancy) listeleyin.
- **Görevler Ayrılığı (SoD):** Satın alma açma, mal kabul yapma ve fatura onaylama gibi riskli yetki çakışmalarını tespit edin.

---

## 11. Saha Kanıtları ve Doğrulama Kayıt Defteri

Saha Kanıtları sekmesinde:
- Toplanan tüm belgelerin doğrulama durumunu (`İncelenmedi`, `Kabul Edildi`, `Reddedildi`) yönetin.
- Kanıt güvenilirlik seviyesini (`Yüksek`, `Orta`, `Düşük`) atayın.
- Kanıtsız kalan kritik konuları otomatik olarak tespit edin.

---

## 12. Go-Live Hazırlığı ve Keşif Kontrol Listesi

Proje Detay ekranındaki **🚀 Go-Live Hazırlığı** sekmesinde:
- 8 alanda (Veri, Süreç, Yönetişim, OT, Kanıt, İnsan, Raporlama, Destek) 24 standart kontrol maddesini izleyin.
- **Hazırlık Skoru:** Uygulanabilir kontroller üzerinden matematiksel yüzdeyi görün.
- **Kritik Kural:** Kritik bir kontrol maddesi bloke veya açıkken sistem asla projeyi *"Hazır"* olarak göstermez.
- **Öncelikli Aksiyonlar:** Termin tarihi ve sorumlu rol atayarak eksik maddeleri yönetin.
- **Feragat Metni:** `Bu bölüm uygulama öncesi keşif hazırlığını gösterir; canlıya geçiş onayı değildir.`

---

## 13. Rapor Önizleme, Word (.docx) ve PDF (.pdf) Dışa Aktarma

Proje Detay sayfasında **[Raporu Görüntüle]** butonuna tıklayın:
- **HTML Önizleme:** Sol taraftaki TOC içindekiler menüsüyle 8 bölüm arasında gezinin.
- **Word (.docx) İndir:** Tamamen düzenlenebilir, kurumsal tablolar ve başlıklarla Word çıktısı alın.
- **PDF (.pdf) İndir:** Liberation Sans TrueType fontu ile gömülü, kusursuz Türkçe karakterli vektörel PDF üretin.
- **Sıfır Undefined Güvencesi:** Tüm rapor çıktıları aynı veri modelinden beslenir; `undefined` veya `null` içermez.

---

## 14. Taşınabilir .erpcrm Yedeği Alma, Geri Yükleme ve Çoğaltma

- **Yedek Alma:** Proje Detay ekranında **[Yedekle (.erpcrm)]** butonuna tıklayın. Açılan pencerede yedeğin kaydedileceği klasörü seçin. Sistem tüm veritabanı tablolarını ve kanıt dosyalarını tek bir `.erpcrm` dosyasında paketler.
- **Geri Yükleme:** Ana ekrandan `.erpcrm` dosyasını seçerek projeyi tüm geçmişiyle geri yükleyin.
- **Proje Çoğaltma:**
  - *Tam Klon:* Projeyi tüm cevapları, istasyonları ve kanıtlarıyla çoğaltır.
  - *Şablon Olarak Çoğalt:* Fonksiyon yapısını korur, ancak cevapları ve Go-Live kontrollerini yeni bir müşteri için sıfırlar (`NOT_STARTED`).

---

## 15. Hassas Veriler, Gizlilik ve Güvenlik Uyarıları

> [!CAUTION]
> **Kurumsal Gizlilik Kuralları:**
> - ERP CRM Discovery %100 çevrimdışı çalışır; ancak oluşturulan `.docx`, `.pdf` ve `.erpcrm` dosyaları şirketinizin stratejik süreç bilgilerini içerir.
> - Bu dosyaları e-posta veya mesajlaşma yoluyla paylaşırken kurum içi bilgi güvenliği politikalarınıza uyunuz.
> - GitHub issue veya hata bildirimi açarken **asla gerçek müşteri firma unvanı, vergi numarası veya gizli finansal veriler içeren ekran görüntüsü paylaşmayınız.**
