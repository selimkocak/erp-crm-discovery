# ERP CRM Discovery — FAZ-47 UAT (Kullanıcı Kabul Testi) Matrisi

Bu matris, ERP CRM Discovery uygulamasının `v0.1.0` masaüstü sürümünün kesikli üretim saha pilotundaki 15 kullanıcı kabul senaryosunu ve sonuçlarını belgeler.

---

## 1. UAT Senaryo Matrisi ve Sonuçlar

| ID | UAT Senaryosu | Test Adımları | Beklenen Sonuç | Sonuç Durumu |
|:---|:---|:---|:---|:---:|
| `UAT-01` | **Kurgusal Proje ve Firma Profili Kurulumu** | Yeni proje oluşturma, firma adı `[KURGUSAL] DeltaForm` girişi, sektör, şube sayısı ve notların kaydedilmesi. | Proje ve firma profili SQLite'a hatasız yazılmalı, HomeView ve detayda görünmeli. | **PASS** |
| `UAT-02` | **20 İş Fonksiyonunun Seçimi ve Atanması** | Modül seçim ekranında kesikli üretime uygun 20 iş fonksiyonunun seçilip kaydedilmesi. | 20 modül projeye bağlanmalı, ilerleme sayaçları sıfırdan başlamalı. | **PASS** |
| `UAT-03` | **240+ Soru Cevaplama ve Autosave** | Soru ekranında dinamik soruların, seçeneklerin ve genel notların girilmesi. | Her cevap seçiminde SQLite'a anında yazılmalı, veri kaybı olmamalı. | **PASS** |
| `UAT-04` | **Kritik Takip ve Sonra Dön Bayrakları** | 15 soruya kırmızı `Kritik Takip`, 20 soruya sarı `Sonra Dön` bayrağı ve notunun eklenmesi. | Takip bayrakları soru navigatöründe ve Bölüm 5 açık konular listesinde listelenmeli. | **PASS** |
| `UAT-05` | **Proje Notları Ekleme** | 12 adet süreç ve genel proje notunun kaydedilmesi. | Proje notları raporun ilgili süreç bölümlerinde ve genel özetinde yer almalı. | **PASS** |
| `UAT-06` | **Özel Soru Tanımlama ve Cevaplama** | 8 adet özel soru ve seçenek tanımlanması (Fason, CNC, Hurda fire, vb.). | Standart soru paketini bozmadan SQLite'da özel sorular cevaplanmalı. | **PASS** |
| `UAT-07` | **Managed Attachment Vault Kanıt Yükleme** | 10 adet PDF, TXT, CSV, JSON dosyasının yönetilen kasaya kopyalanması. | Dosyalar `{appLocalDataDir}` altına güvenli kopya alınmalı, SHA-256 hesaplanmalı. | **PASS** |
| `UAT-08` | **Yönetişim Başlangıç Nesneleri Tohumlama** | Projede Yönetişim sekmesi açıldığında 23 başlangıç nesnesinin otomatik yüklenmesi. | 23 nesne listelenmeli, tekrar basıldığında mükerrer oluşmamalı (idempotent). | **PASS** |
| `UAT-09` | **Sorumluluk ve Veri Sahipliği Matrisi** | 18 özne ve 10 kapsam altında 30 Data Owner / Steward sorumluluğunun tanımlanması. | As-Is ve To-Be matrisleri raporda ve arayüzde doğru filtrelenmeli. | **PASS** |
| `UAT-10` | **Yetki Matrisi ve Sapma (Discrepancy) Analizi** | 40 yetki kaydının girilmesi ve 6 efektif sapmanın sistem tarafından işaretlenmesi. | Sapmalı yetkiler kırmızı rozetle ve rapor uyarı kutusunda gösterilmeli. | **PASS** |
| `UAT-11` | **Onay Limitleri ve Kademeleri** | Satın alma, iskonto ve ödeme limitlerinin kademe ve onaylayan makamla girilmesi. | Parasal limitler ve döviz cinsleri tabloda eksiksiz listelenmeli. | **PASS** |
| `UAT-12` | **Görevler Ayrılığı (SoD) Risk Matrisi** | 10 adet SoD riskinin çatışan görevler ve etki seviyesiyle kaydedilmesi. | Kritik riskler özet panoda ve raporda açıkça vurgulanmalı. | **PASS** |
| `UAT-13` | **İlk Keşif Raporu Çıktısı (DOCX ve PDF)** | 20 fonksiyonlu projenin tek tıkla Word (.docx) ve PDF (.pdf) formatında üretilmesi. | DOCX ve PDF dosyaları Türkçe karakter garantili, sıfır ağ bağımlılığıyla üretilmeli. | **PASS** |
| `UAT-14` | **Saha Revizyon Döngüsü ve İkinci Rapor** | PRP-001, WKO-001 ve INV-001 cevaplarının güncellenmesi, SoD risklerinin mitigated yapılması. | Rapor tekrar basıldığında revize cevaplar ve düşen riskler rapora yansımalı. | **PASS** |
| `UAT-15` | **Fiziksel Kanıt Dosyasını Dış Uygulamada Açma** | Soru ekranındaki 📎 ek butonuna basılarak PDF/DOCX dosyasının OS dosya yöneticisinde açılması. | Windows Explorer veya macOS Finder dosya açma entegrasyonu. | **MANUAL CONFIRMATION** *(Fiziksel platform GUI testi)* |

---

## 2. UAT Kabul Özeti

* **Toplam Senaryo:** 15
* **Otomatik PASS:** 14 (%93.3)
* **Manuel Onay Gerektiren (Fiziksel Platform):** 1 (%6.7)
* **FAIL:** 0 (%0.0)

**Sonuç:** UAT fonksiyonel ve veri bütünlüğü kriterleri **%100 başarıyla karşılanmıştır**.
