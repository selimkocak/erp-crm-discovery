# FAZ-11: Satın Alma (PROCUREMENT) Soru Paketi Kılavuzu

**Kanonik İş Fonksiyonu:** `PROCUREMENT` (Satın Alma)  
**Soru Paketi Kimliği:** `tr.procurement.core`  
**Sürüm:** `0.1.0`  
**Şema Sürümü:** `1` (JSON Schema v1)  
**Hedef Kitle:** Türkiye'deki orta ve büyük ölçekli işletmelerin ERP geçiş öncesi AS-IS süreç analizi

---

## 1. Yönetici Özeti ve Metrikler

- **Toplam Soru Sayısı:** 40 Soru
- **Zorunlu (Required) Soru Sayısı:** 20 Soru (%50)
- **Süreç Grubu Sayısı:** 15 Süreç (A'dan O'ya)
- **Kritiklik Dağılımı:**
  - 🔴 **Kritik (Critical):** 7 Soru
  - 🟠 **Yüksek (High):** 18 Soru
  - 🟡 **Orta (Medium):** 14 Soru
  - 🟢 **Düşük (Low):** 1 Soru
- **Branching (Koşullu Görünürlük) Noktası:** 7 Ana Karar Kuralı

---

## 2. Süreç Grupları ve Soru Dağılım Tablosu

| Kod | Süreç Adı | Soru Adedi | Zorunlu Adedi | Branching Kuralı |
|---|---|---|---|---|
| A | **Satın Alma Talebi** | 4 | 2 | Yok |
| B | **Talep Onayı** | 2 | 1 | `PROC-005` != `onaysiz_dogrudan` -> `PROC-006` |
| C | **Tedarikçi Seçimi** | 2 | 1 | Yok |
| D | **Teklif Toplama ve Karşılaştırma** | 3 | 2 | `PROC-009` != `teklif_alinmiyor` -> `PROC-010`, `PROC-011` |
| E | **Fiyat ve Ticari Koşullar** | 4 | 2 | `PROC-013` != `sozlesme_kullanilmiyor` -> `PROC-014` |
| F | **Satın Alma Siparişi** | 4 | 2 | Yok |
| G | **Sipariş Onay Süreci** | 2 | 1 | `PROC-020` != `onay_yok_serbest` -> `PROC-021` |
| H | **Termin ve Teslimat Takibi** | 2 | 2 | Yok |
| I | **Kısmi Teslimat / Eksik Teslimat** | 2 | 1 | Yok |
| J | **Depo Mal Kabul Entegrasyonu** | 2 | 1 | Yok |
| K | **Kalite Kontrol Entegrasyonu** | 2 | 1 | `PROC-028` != `kalite_kontrol_yok` -> `PROC-029` |
| L | **Satın Alma Faturası / Eşleştirme** | 3 | 1 | Yok |
| M | **Tedarikçi Performansı** | 2 | 1 | `PROC-033` != `performans_olculmuyor` -> `PROC-034` |
| N | **İthal Satın Alma / Döviz İhtiyaçları**| 3 | 1 | `PROC-035` != `hayir_sadece_tl` -> `PROC-036`, `PROC-037` |
| O | **Satın Alma Raporlama ve KPI** | 3 | 1 | Yok |
| **Toplam** | **15 Süreç** | **40** | **20** | **7 Koşullu Kural** |

---

## 3. Detaylı Soru ve Seçenek Kataloğu

### A. Satın Alma Talebi
- **PROC-001 (Zorunlu / Critical)**: Satın alma talepleri departmanlar tarafından sisteme nasıl iletiliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. ERP / Kurumsal yazılım içindeki satın alma talep modülü üzerinden [Not Girişi Aktif]
    2. Ayrı bir talep/bilet (helpdesk, intranet vb.) uygulaması üzerinden [Not Girişi Aktif]
    3. Excel / Ortak ağ dosyası üzerinden [Not Girişi Aktif]
    4. E-posta ile
    5. Sözlü bildirim / Telefon / Anlık mesajlaşma ile
    6. Departmana veya malzeme türüne göre farklı yöntemler kullanılıyor [Not Girişi Aktif]
    7. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* ERP Requisition modülünün tüm kurumsal çalışanlara mı yoksa sadece satın alma birimine mi açılacağını belirler.

- **PROC-002 (Zorunlu / High)**: Satın alma talebi oluşturulurken stok kontrolü yapılıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem talep anında mevcut stoku ve rezerve miktarları otomatik gösteriyor
    2. Evet, talep eden veya satın alma personeli depoyu manuel kontrol ediyor [Not Girişi Aktif]
    3. Depo sorumlusuna telefon veya e-posta ile soruluyor
    4. Stok kontrolü yapılmadan doğrudan satın alma sürecine geçiliyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* ATP (Kullanılabilir Stok) kontrolü ve dahili transfer yönlendirmesini belirler.

- **PROC-003 (Opsiyonel / Medium)**: Satın alma talepleri bütçe veya masraf merkezi ile ilişkilendiriliyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, hem masraf merkezi/proje hem de tanımlı departman bütçesi kontrol ediliyor [Not Girişi Aktif]
    2. Evet, masraf merkezi / departman kodu seçiliyor ancak bütçe kontrolü yok
    3. Sadece proje bazlı işlerde proje kodu ile ilişkilendiriliyor [Not Girişi Aktif]
    4. Hayır, talep aşamasında bütçe veya masraf merkezi seçilmiyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Hard/Soft Stop bütçe kontrol mekanizması gereksinimini netleştirir.

- **PROC-004 (Opsiyonel / Medium)**: Hangi tür ihtiyaçlar için satın alma talebi açılıyor?
  - *Tip:* `multiple_choice`
  - *Seçenekler:*
    1. Hammadde ve ticari mallar (üretim/satış amaçlı)
    2. İşletme malzemesi ve sarf malzemeleri
    3. Hizmet alımları (danışmanlık, bakım, nakliye vb.) [Not Girişi Aktif]
    4. Demirbaş ve yatırım alımları (CapEx) [Not Girişi Aktif]
    5. Müşteri projesine özel malzeme ve ekipmanlar
    6. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Malzeme kartı zorunluluğu ile serbest metin/hizmet kalemi ayrımını belirler.

---

### B. Talep Onayı
- **PROC-005 (Zorunlu / Critical)**: Satın alma talepleri satın alma departmanına iletilmeden önce bir onay sürecinden geçiyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem üzerinde tanımlı bir onay akışı var [Not Girişi Aktif]
    2. Evet, e-posta veya yazılı imza ile yönetici onayı alınıyor [Not Girişi Aktif]
    3. Evet, sözlü veya duruma göre onay alınıyor
    4. Hayır, talep açan herkes doğrudan satın almaya iletebiliyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Requisition Onay İş Akışı (Workflow) gereksinimini belirler.

- **PROC-006 (Opsiyonel / High)**: Talep onay akışında hangi kriterlere göre onay kademeleri değişiyor?
  - *Koşul:* `PROC-005` != `onaysiz_dogrudan`
  - *Tip:* `multiple_choice`
  - *Seçenekler:*
    1. Talep tutarı limitlerine göre (kademeli yetki matrisi) [Not Girişi Aktif]
    2. Talep eden kişinin departman ve organizasyon hiyerarşisine göre
    3. Malzeme/hizmet kategorisine veya masraf tipine göre (örn. Demirbaş vs Sarf) [Not Girişi Aktif]
    4. Bütçe aşımı durumuna göre ek onay [Not Girişi Aktif]
    5. Proje bazlı işlerde proje yöneticisi onayı
    6. Kriter olmaksızın sadece ilk amir onayı yeterli
    7. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Dinamik onay matrisi kurallarını yapılandırmayı sağlar.

---

### C. Tedarikçi Seçimi
- **PROC-007 (Zorunlu / High)**: Satın alma işlemlerinde onaylı tedarikçi listesi (Approved Vendor List) kullanılıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistemde sadece onaylı tedarikçilerden satın alma yapılmasına izin veriliyor [Not Girişi Aktif]
    2. Onaylı liste var ancak zorunlu değil, serbestçe yeni tedarikçi seçilebiliyor [Not Girişi Aktif]
    3. Resmi bir liste yok, satın alma sorumlusu piyasa tecrübesine göre seçiyor
    4. Çoğu malzeme için tek yetkili/sözleşmeli tedarikçiyle çalışılıyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Tedarikçi-Malzeme yetkilendirme kısıtı kurgusunu belirler.

- **PROC-008 (Opsiyonel / Medium)**: Aynı malzeme veya hizmet için alternatif tedarikçiler sistemde kayıtlı mı?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, her malzeme kartına bağlı alternatif tedarikçiler ve kodları tanımlı
    2. Satın alma personelinin bilgi ve geçmişinde var ama sistemde kayıtlı değil [Not Girişi Aktif]
    3. Ayrı bir Excel veya dokümanda alternatif listesi tutuluyor [Not Girişi Aktif]
    4. Hayır, alternatif tedarikçi kaydı tutulmuyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Tedarikçi Katalog Numarası (Vendor Part Number) kullanımını belirler.

---

### D. Teklif Toplama ve Karşılaştırma
- **PROC-009 (Zorunlu / Critical)**: Satın alma siparişi öncesinde tedarikçilerden teklif toplama süreci nasıl yürütülüyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. ERP / Satın alma portalı üzerinden teklif talebi açılıp karşılaştırma yapılıyor [Not Girişi Aktif]
    2. E-posta ile teklif toplanıp Excel tablosunda karşılaştırılıyor [Not Girişi Aktif]
    3. E-posta / Telefon ile toplanıyor, resmi karşılaştırma tablosu yapılmıyor
    4. Sözleşmeli/sabit fiyatlı çalışıldığı için teklif toplanmıyor [Not Girişi Aktif]
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* ERP RFQ (Teklif Toplama) ve Karşılaştırma Tablosu modülünü belirler.

- **PROC-010 (Zorunlu / High)**: Bir alım için kural olarak en az kaç farklı tedarikçiden teklif alınması gerekiyor?
  - *Koşul:* `PROC-009` != `teklif_alinmiyor`
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Kural olarak en az 3 teklif zorunlu [Not Girişi Aktif]
    2. En az 2 teklif yeterli
    3. Alım tutarına göre gereken teklif sayısı değişiyor (örn. belirli tutar üzeri 3 teklif) [Not Girişi Aktif]
    4. Belirlenmiş asgari bir teklif sayısı kuralı yok
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Teklif onayında asgari teklif sayısı kuralını belirler.

- **PROC-011 (Opsiyonel / Medium)**: Tedarikçi teklifleri değerlendirilirken hangi kriterler karşılaştırılıyor?
  - *Koşul:* `PROC-009` != `teklif_alinmiyor`
  - *Tip:* `multiple_choice`
  - *Seçenekler:*
    1. Birim fiyat ve toplam maliyet
    2. Ödeme vadesi ve ödeme koşulları [Not Girişi Aktif]
    3. Teslimat süresi / Termin tarihi
    4. Teslim şekli ve nakliye/sigorta masrafları (Incoterms) [Not Girişi Aktif]
    5. Teknik şartnameye uygunluk, marka ve kalite referansı
    6. Tedarikçinin geçmiş teslimat ve kalite performansı
    7. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Teklif değerlendirme puanlama matrisi tasarımını netleştirir.

---

### E. Fiyat ve Ticari Koşullar
- **PROC-012 (Zorunlu / High)**: Satın alma personeli sipariş veya teklif anında malzemenin son alış fiyatını ve fiyat geçmişini görebiliyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem son alış fiyatını, tedarikçisini ve tarihini otomatik gösteriyor
    2. Evet, ancak eski faturaları veya raporları manuel aratarak bakabiliyor [Not Girişi Aktif]
    3. Ayrı bir Excel fiyat takip dosyasından kontrol ediliyor [Not Girişi Aktif]
    4. Hayır, son alış fiyatı ve geçmişi anlık olarak görülemiyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Sipariş satırında otomatik Son Alış Fiyatı gösterimi ihtiyacını belirler.

- **PROC-013 (Zorunlu / High)**: Tedarikçilerle yapılan çerçeve anlaşmalar veya dönemsel sözleşmeli fiyat listeleri kullanılıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistemde sözleşme ve geçerlilik tarihli fiyat listeleri tanımlı ve otomatik uygulanıyor [Not Girişi Aktif]
    2. Sözleşmeler var ancak siparişe fiyatlar manuel giriliyor [Not Girişi Aktif]
    3. Sadece birkaç kritik stratejik malzeme için sözleşme yapılıyor
    4. Hayır, her alım spot piyasadan / anlık teklifle yapılıyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Satın Alma Sözleşmeleri (Blanket PO) mekanizmasını belirler.

- **PROC-014 (Opsiyonel / Medium)**: Sözleşmeli alımlarda taahhüt edilen miktar ve bakiye takibi yapılıyor mu?
  - *Koşul:* `PROC-013` != `sozlesme_kullanilmiyor`
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem sözleşmeden çekilen miktarı ve kalan bakiyeyi otomatik düşüyor
    2. Evet, Excel üzerinden manuel bakiye takibi yapılıyor [Not Girişi Aktif]
    3. Hayır, taahhüt miktarı/bakiye takibi yapılmıyor
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Sözleşme bakiye tüketim takibi kurgusunu belirler.

- **PROC-015 (Opsiyonel / Medium)**: Tedarikçilerin belirlediği Minimum Sipariş Miktarı (MOQ) veya ambalaj katları nasıl yönetiliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistemde malzeme/tedarikçi bazında MOQ ve koli katları tanımlı, siparişte uyarı veriyor/tamamlıyor
    2. Satın alma personeli bildiği için sipariş miktarını manuel yuvarlıyor [Not Girişi Aktif]
    3. Minimum sipariş miktarı kuralı uygulanmıyor / takip edilmiyor
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Malzeme kartı MOQ / Sipariş Katı parametrelerini belirler.

---

### F. Satın Alma Siparişi
- **PROC-016 (Zorunlu / Critical)**: Satın alma siparişi (PO) resmi olarak hangi ortamda oluşturuluyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. ERP sistemi üzerinden oluşturuluyor ve onaylanıyor [Not Girişi Aktif]
    2. Excel veya Word şablonu ile hazırlanıp PDF yapılıyor [Not Girişi Aktif]
    3. Doğrudan muhasebe / ticari yazılımdan açılıyor [Not Girişi Aktif]
    4. Özel bir sipariş formu olmadan doğrudan e-posta metni ile iletiliyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Satın Alma Sipariş döngüsünün omurgasını belirler.

- **PROC-017 (Zorunlu / High)**: Satın alma siparişleri onaylı bir talep veya tekliften otomatik dönüştürülebiliyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, onaylanan talep veya tekliften tek tıkla siparişe dönüştürülüyor
    2. Kısmen, bazı bilgiler kopyalanıyor ama sipariş elle tekrar oluşturuluyor [Not Girişi Aktif]
    3. Hayır, tüm sipariş satırları sıfırdan manuel giriliyor [Not Girişi Aktif]
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Belge akış zinciri (Document Flow) entegrasyonunu belirler.

- **PROC-018 (Opsiyonel / Medium)**: Siparişte yapılan değişiklikler ve revizyonlar (fiyat, miktar, termin) nasıl izleniyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistem her değişikliği versiyonlayarak (Rev 1, Rev 2) ve loglayarak saklıyor
    2. Mevcut sipariş üzerinde değişiklik yapılıyor, eski hali eziliyor [Not Girişi Aktif]
    3. Eski sipariş iptal edilip yeni sipariş açılıyor
    4. Değişiklikler sistematik olarak izlenmiyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* PO Değişiklik Yönetimi ve Versiyonlama ihtiyacını belirler.

- **PROC-019 (Opsiyonel / Medium)**: Sipariş iptali veya satır kapatma süreci nasıl işletiliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. İptal nedeni seçilerek ve yetkili onayıyla satır/sipariş kapatılıyor [Not Girişi Aktif]
    2. Satın alma personeli serbestçe siparişi silebiliyor veya kapatabiliyor
    3. Kullanılmayan siparişler sistemde açık kalıyor, periyodik temizlik yok [Not Girişi Aktif]
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* İptal Neden Kodları ve Bakiye Kapatma (Force Close) yetkilerini belirler.

---

### G. Sipariş Onay Süreci
- **PROC-020 (Zorunlu / Critical)**: Satın alma siparişleri tedarikçiye gönderilmeden önce bir onay sürecinden geçiyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem üzerinde tutar ve yetki matrisine bağlı onay akışı var [Not Girişi Aktif]
    2. Evet, sipariş çıktısı alınıp yöneticilere ıslak imza imzalatılıyor [Not Girişi Aktif]
    3. Evet, e-posta ile yönetici onayı alındıktan sonra gönderiliyor
    4. Hayır, satın alma personeli oluşturduğu siparişi doğrudan tedarikçiye gönderebiliyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* PO Release Strategy / Onay İş Akışını belirler.

- **PROC-021 (Opsiyonel / High)**: Sipariş onay akışında hangi yetkilendirme ve kontrol kriterleri uygulanıyor?
  - *Koşul:* `PROC-020` != `onay_yok_serbest`
  - *Tip:* `multiple_choice`
  - *Seçenekler:*
    1. Tutar baremlerine göre kademeli onay (örn. Müdür → Direktör → Genel Müdür) [Not Girişi Aktif]
    2. Departman bütçesi kontrolü ve bütçe aşımında ek onay [Not Girişi Aktif]
    3. Peşin / Avans ödemeli siparişlerde finans onayı [Not Girişi Aktif]
    4. Sözleşmesiz veya onaylı liste dışı tedarikçi alımlarında özel onay
    5. Dövizli veya yüksek tutarlı alımlarda yönetim kurulu onayı
    6. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Sipariş onay matrisinin karmaşıklığını belirler.

---

### H. Termin ve Teslimat Takibi
- **PROC-022 (Zorunlu / High)**: Sipariş satırlarında vaat edilen teslim tarihi (termin) nasıl takip ediliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistemde her sipariş satırı için ayrı termin tarihi giriliyor ve izleniyor
    2. Tüm sipariş için tek bir teslimat tarihi giriliyor
    3. Sistemde girilmiyor, ayrı bir Excel teslimat takip tablosunda izleniyor [Not Girişi Aktif]
    4. Termin tarihi sistematik olarak takip edilmiyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Satır bazlı Termin Tarihi (Promised Date) ve Teslimat Planı gereksinimini belirler.

- **PROC-023 (Zorunlu / High)**: Geciken veya teslim tarihi yaklaşan siparişler nasıl tespit ediliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistem geciken siparişleri otomatik raporluyor veya uyarı/bildirim gönderiyor
    2. Satın alma personeli açık sipariş listesini periyodik manuel tarıyor [Not Girişi Aktif]
    3. Üretim veya ilgili departman malzeme gelmedi diye arayınca fark ediliyor [Not Girişi Aktif]
    4. Gecikmeler için sistematik bir kontrol yapılmıyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Geciken Sipariş Dashboard'ı ve otomatik eskalasyon kurgusunu belirler.

---

### I. Kısmi Teslimat / Eksik Teslimat
- **PROC-024 (Zorunlu / High)**: Tedarikçiden gelen kısmi teslimatlar (parçalı sevkıyatlar) sistemde nasıl yönetiliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistem her irsaliyeyi siparişle eşleştirir, teslim alınan ve kalan bakiyeyi otomatik izler
    2. Kalan miktar manuel notlarla veya Excel'de hesaplanıyor [Not Girişi Aktif]
    3. Kısmi teslimat gelse de sipariş tek seferde kapatılıyor / sorun yaşanıyor [Not Girişi Aktif]
    4. Tedarikçiden kesinlikle kısmi teslimat kabul edilmiyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Açık Sipariş Bakiye Yönetimi (Open PO Quantity) kurgusunu belirler.

- **PROC-025 (Opsiyonel / Medium)**: Sipariş miktarından fazla veya eksik teslimatlarda tolerans uygulanıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistemde tanımlı % tolerans sınırı içinde fazla/eksik mal kabulüne izin veriliyor [Not Girişi Aktif]
    2. Fazla mal kabul edilmez, eksik teslimatta kalan bakiye açık bırakılır
    3. Tolerans kuralı tanımlı değil, depo sorumlusunun onayına göre alınıyor [Not Girişi Aktif]
    4. Tam adetli çalışıldığı için tolerans ihtiyacı yok
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Aşırı/Eksik Teslimat Toleransı (Over/Under Delivery %) parametresini belirler.

---

### J. Depo Mal Kabul Entegrasyonu
- **PROC-026 (Zorunlu / Critical)**: Depoda mal kabul (irsaliye girişi) işlemi doğrudan satın alma siparişine bağlanarak mı yapılıyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, siparişi olmayan hiçbir malzeme depoya kabul edilemez, sistem siparişi zorunlu tutar
    2. Sipariş seçilerek kabul yapılır ancak siparişsiz giriş yapılmasına da sistem izin verir [Not Girişi Aktif]
    3. Depo irsaliyeyi siparişten bağımsız stok girişi olarak işler, sonradan eşleştirilir [Not Girişi Aktif]
    4. Fiziksel kabul yapılıp irsaliye faturayla birlikte muhasebeye gider, depoda sistem kaydı açılmaz [Not Girişi Aktif]
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* PO Referanslı Mal Kabul (Goods Receipt PO) sıkı kontrolünü belirler.

- **PROC-027 (Opsiyonel / Medium)**: Mal kabul sırasında irsaliye ile sipariş arasında fiyat veya ürün kodu kontrolü depoda yapılabiliyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Depo sadece ürün kodunu ve beklenen miktarı görür, fiyat gizlidir
    2. Depo siparişteki fiyat dahil tüm detayları görür
    3. Deponun sistemde siparişi görme yetkisi yoktur, sadece gelen kâğıt irsaliyeyi kontrol eder [Not Girişi Aktif]
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Depo ekranlarında fiyat gizleme (Blind PO Receiving) yetkisini belirler.

---

### K. Kalite Kontrol Entegrasyonu
- **PROC-028 (Zorunlu / High)**: Depoya gelen satın alma malzemeleri için mal kabulde Kalite Kontrol (girdi kalite) süreci uygulanıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, kaliteye tabi ürünler doğrudan kullanılabilir stoka girmez, Kalite Kontrol (bloke) stokta bekler [Not Girişi Aktif]
    2. Evet, fiziksel olarak kalite onayı verildikten sonra irsaliye sisteme girilir [Not Girişi Aktif]
    3. Sadece belirli kritik hammadde/ürünler için kalite kontrol yapılır [Not Girişi Aktif]
    4. Hayır, gelen tüm mallar doğrudan kullanılabilir stoka kabul edilir
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Girdi Kalite Kontrol ve Kalite Bloke Stok kurgusunu belirler.

- **PROC-029 (Opsiyonel / High)**: Kalite kontrol tarafından reddedilen (uygunsuz) malzemelerin tedarikçiye iade veya şartlı kabul süreci nasıl işliyor?
  - *Koşul:* `PROC-028` != `kalite_kontrol_yok`
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistemde uygunsuzluk raporu (NCR) açılır, onaylı iade irsaliyesi ile tedarikçiye sevk edilir [Not Girişi Aktif]
    2. Duruma göre şartlı kabul (fiyat indirimi/ayıklama) veya manuel iade faturası kesilir [Not Girişi Aktif]
    3. Fiziksel tutanak tutulup malzeme hemen geri gönderilir, sistemde kayıt açılmaz
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Satın Alma İade İrsaliyesi / Faturası ve Şartlı Kabul süreçlerini belirler.

---

### L. Satın Alma Faturası / Sipariş Eşleştirmesi
- **PROC-030 (Zorunlu / Critical)**: Satın alma faturası işlenirken Sipariş — Mal Kabul (İrsaliye) — Fatura 3'lü eşleştirmesi (3-Way Match) yapılıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem fatura tutarını ve miktarını irsaliye ve siparişle otomatik karşılaştırır, fark varsa uyarı verir/bloke eder [Not Girişi Aktif]
    2. Fatura doğrudan irsaliyeden aktarılır ancak birim fiyat farkları manuel kontrol edilir [Not Girişi Aktif]
    3. Muhasebe gelen faturayı kâğıt sipariş/irsaliye ile manuel karşılaştırıp sisteme sıfırdan girer [Not Girişi Aktif]
    4. Eşleştirme yapılmadan fatura doğrudan gider/stok hesabı seçilerek kaydedilir
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Fatura Doğrulama (3-Way Matching) tolerans limitleri ve Fatura Bloke kurgusunu belirler.

- **PROC-031 (Opsiyonel / High)**: Faturada siparişten farklı bir fiyat veya ek masraf (navlun, sigorta, vade farkı) geldiğinde nasıl yönetiliyor?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Belirli limit üzerindeki fiyat farkları için satın alma onayına düşer veya fark faturası talep edilir [Not Girişi Aktif]
    2. Ek masraflar (navlun vb.) mal kabul faturasına veya malzeme maliyetine dağıtılır [Not Girişi Aktif]
    3. Fiyat farkı veya ek masraf sorgulanmadan doğrudan finansman/gider hesabına atılır
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Satın Alma Masraf Dağıtımı (Landed Cost) ve Fiyat Farkı Hesabını belirler.

- **PROC-032 (Opsiyonel / Medium)**: Satın alma faturası onaylanmadan önce tedarikçi cari hesap bakiyesi ve mutabakat durumu kontrol ediliyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, satın alma personeli ve muhasebe cari karttaki açık hesap bakiyesini ve vadesini anlık görür
    2. Cari durumu sadece muhasebe görür, satın almanın erişimi yoktur
    3. Sadece ay sonlarında BA/BS ve cari mutabakatı ile kontrol edilir [Not Girişi Aktif]
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Satın alma ekranlarında Tedarikçi Finansal Özeti yetkilendirmesini belirler.

---

### M. Tedarikçi Performansı
- **PROC-033 (Zorunlu / High)**: Tedarikçilerin performansı (termin uyumu, kalite, fiyat istikrarı) sistematik olarak ölçülüyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, sistem teslimat gecikmesi ve kalite ret oranlarına göre otomatik tedarikçi skoru üretir [Not Girişi Aktif]
    2. Evet, dönemsel olarak anket ve değerlendirme formları ile manuel puanlama yapılır [Not Girişi Aktif]
    3. Yazılı bir sistem yok, satın alma yöneticisinin kişisel tecrübe ve kanaatine dayanır
    4. Hayır, tedarikçi performansı ölçülmüyor
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* ERP Tedarikçi Değerlendirme (Vendor Scoring) modülünü belirler.

- **PROC-034 (Opsiyonel / Medium)**: Tedarikçi değerlendirmesinde hangi performans kriterleri kullanılıyor veya hedefleniyor?
  - *Koşul:* `PROC-033` != `performans_olculmuyor`
  - *Tip:* `multiple_choice`
  - *Seçenekler:*
    1. Zamanında teslimat oranı (OTIF - On-Time In-Full)
    2. Kalite kabul/ret ve PPM (milyonda hata) oranı
    3. Fiyat rekabetçiliği ve indirim esnekliği
    4. İletişim hızı, teknik destek ve problem çözme kabiliyeti
    5. Ödeme vadesi ve finansal esneklik
    6. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Tedarikçi puan kartı (Vendor Scorecard) ağırlık matrisini belirler.

---

### N. İthal Satın Alma / Döviz İhtiyaçları
- **PROC-035 (Zorunlu / Critical)**: Şirketinizde yurt dışından ithal satın alma veya dövizli alım yapılıyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, düzenli olarak ithalat operasyonu ve dövizli alımlar yapılıyor [Not Girişi Aktif]
    2. İthalatı kendimiz yapmıyoruz ancak iç piyasadan dövize endeksli alımlar yapıyoruz [Not Girişi Aktif]
    3. Yılda birkaç kez münferit ithalat yapılıyor [Not Girişi Aktif]
    4. Hayır, tüm satın almalarımız yurt içinden ve Türk Lirası iledir
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* İthalat Yönetimi ve Dövizli Fiyatlandırma/Kur Farkı mekanizmasını belirler.

- **PROC-036 (Opsiyonel / High)**: Dövizli sipariş ve faturalarda kur türü (TCMB Alış, Satış, Efektif vb.) nasıl belirleniyor?
  - *Koşul:* `PROC-035` != `hayir_sadece_tl`
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistem TCMB kurlarını günlük otomatik çeker ve belirlenen kur tipini uygular [Not Girişi Aktif]
    2. Fatura tarihindeki kur manuel olarak girilir veya faturadaki kur esas alınır [Not Girişi Aktif]
    3. Sözleşmede önceden sabitlenmiş kur kullanılır [Not Girişi Aktif]
    4. Ödeme günündeki kur ile kur farkı faturası kesilerek kapatılır
    5. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Günlük Otomatik Kur Çekme ve Kur Tipi parametrelerini belirler.

- **PROC-037 (Opsiyonel / High)**: İthalat dosyası masrafları (gümrük, navlun, ordino, KKDF, sigorta vb.) ürün maliyetine nasıl dağıtılıyor?
  - *Koşul:* `PROC-035` != `hayir_sadece_tl`
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Sistemdeki ithalat modülü ile tüm masraflar ithalat dosyasına girilip malzeme maliyetine otomatik dağıtılır [Not Girişi Aktif]
    2. Excel'de ithalat maliyeti hesaplanıp depoya maliyetli birim fiyat manuel girilir [Not Girişi Aktif]
    3. İthalat masrafları malzeme maliyetine eklenmez, doğrudan dönem gideri yazılır
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* İthalat Masraf Dağıtımı (Landed Cost) ve İthalat Dosya Kapatma modülü ihtiyacını belirler.

---

### O. Satın Alma Raporlama ve KPI
- **PROC-038 (Zorunlu / High)**: Satın alma departmanının yönetim için düzenli olarak ürettiği veya ihtiyaç duyduğu temel raporlar nelerdir?
  - *Tip:* `multiple_choice`
  - *Seçenekler:*
    1. Açık ve geciken satın alma siparişleri raporu
    2. Tedarikçi ve malzeme grubu bazında toplam harcama analizi
    3. Malzeme bazında fiyat değişim ve enflasyon trend analizi
    4. Departman/Kategori bazlı satın alma bütçe-gerçekleşen raporu [Not Girişi Aktif]
    5. Tedarikçi teslimat performansı ve kalite ret raporu
    6. Satın alma talep-sipariş-teslimat döngü süreleri (Lead Time)
    7. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Standart Satın Alma Raporları ve Yönetim Dashboard'larını belirler.

- **PROC-039 (Opsiyonel / Medium)**: Tedarikçi yoğunlaşma riski (belirli tedarikçilere aşırı bağımlılık) takip ediliyor mu?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, harcamaların tedarikçilere dağılımı (Pareto / ABC analizi) düzenli raporlanır [Not Girişi Aktif]
    2. Resmi raporlama yok ancak kritik tedarikçiler biliniyor
    3. Hayır, tedarikçi yoğunlaşma riski takip edilmiyor
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* Harcama Analitiği (Spend Analytics) ve Tedarikçi ABC/Risk Raporlama ihtiyacını belirler.

- **PROC-040 (Opsiyonel / Low)**: Satın alma süreçlerinde dijital onay ve mobil kullanım ihtiyacı var mı?
  - *Tip:* `single_choice`
  - *Seçenekler:*
    1. Evet, yöneticilerin ofis dışından mobil cihaz veya e-posta ile onay verebilmesi kritik bir ihtiyaç [Not Girişi Aktif]
    2. Hayır, onay verenlerin ERP masaüstü ekranını kullanması yeterli
    3. Mobil onay gerekmez, e-posta ile uyarı gelmesi yeterli
    4. Diğer [Zorunlu Not Alanı]
  - *Karar Etkisi:* ERP Mobil Uygulama ve E-posta Onaylama altyapı gereksinimini netleştirir.
