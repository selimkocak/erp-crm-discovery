# FAZ-13 — Stok Yönetimi (INVENTORY) Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.inventory.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `INVENTORY` (Stok Yönetimi)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Stok ve Tedarik Zinciri Yöneticileri, Mali İşler Ekipleri  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP implementasyonu öncesinde stok ana veri yapısı, varyant matrisi, ölçü birimi çevrimleri, konsinye/emanet mülkiyeti, Min/Max ve emniyet stoğu seviyeleri, ATP rezervasyon formülü, negatif stok politikası, stok değerleme ve maliyetleme yöntemleri (FIFO/Yürüyen Ortalama/Standart Maliyet), stok yaşlandırma, envanter muhasebesi entegrasyonu ve stok KPI'larının AS-IS durumunu ve gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | INVENTORY ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **PROCUREMENT** | Tedarikçi ilişkileri, Satın Alma Talepleri, RFQ Teklif Toplama, Fiyat Anlaşmaları, Satın Alma Siparişi (PO), 3-Way Match Fatura Doğrulama, İthalat Masraf Dosyaları | **Stok Yönetimi satın alma süreçlerini tekrar sormaz.** Yalnızca satın alma birimi dönüşümünü ve Landed Cost masraf dağıtımının ürün birim maliyetine etkisini inceler. |
| **WAREHOUSE** | Fiziksel depo organizasyonu, kapı mal kabulü, raf/göz/lokasyon adresleme, yerleştirme (putaway), sipariş toplama (picking) rotaları, paketleme masası, el terminali ve Wi-Fi altyapısı | **Stok Yönetimi fiziksel depo hareketlerini tekrar sormaz.** Fiziksel hareket yerine mülkiyet, değerleme, muhasebe entegrasyonu, ölçü birimi çevrimleri, emniyet stoğu ve yaşlandırmaya odaklanır. |
| **INVENTORY** | Stok kartı ana verisi, varyant matrisi, çoklu ölçü birimi çevrimleri, konsinye/emanet stok mülkiyeti, Min/Max & Emniyet Stoğu, ATP kullanılabilir stok formülü, negatif stok maliyeti, Stok Değerleme Yöntemleri (FIFO, Yürüyen Ortalama, Standart Maliyet), Dövizli Envanter, Stok Yaşlandırma & Değer Düşüklüğü Karşılığı, Sürekli Envanter Muhasebe Entegrasyonu, Stok Devir Hızı (DSI/Turnover) KPI'ları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular finansal, planlama ve ana veri derinliğinde yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (16 Kanonik Süreç / 37 Soru)

1. **Stok Ana Veri Yapısı ve Kodlama** (3 Soru — INV-001, INV-002, INV-003)
2. **Malzeme Sınıflandırması ve Nitelik Yönetimi** (2 Soru — INV-004, INV-005)
3. **Ölçü Birimleri ve Birim Dönüşümleri** (2 Soru — INV-006, INV-007)
4. **Stok Türleri ve Özel Sahiplikler (Konsinye & Emanet)** (3 Soru — INV-008, INV-009, INV-010)
5. **Stok Seviyeleri ve Yeniden Sipariş Politikaları** (3 Soru — INV-011, INV-012, INV-013)
6. **Stok Kullanılabilirliği ve Rezervasyon Mantığı (ATP)** (2 Soru — INV-014, INV-015)
7. **Negatif Stok Politikası ve Stok Bütünlüğü** (2 Soru — INV-016, INV-017)
8. **Stok Değerleme ve Maliyet Yöntemleri** (4 Soru — INV-018, INV-019, INV-020, INV-021)
9. **Stok Yaşlandırma, Yavaş Hareket Eden ve Ölü Stok** (3 Soru — INV-022, INV-023, INV-024)
10. **Envanter Muhasebesi ve Defter Entegrasyonu** (2 Soru — INV-025, INV-026)
11. **Stok Transferleri ve Şubeler Arası Değer Takibi** (1 Soru — INV-027)
12. **Sayım Mutabakatı ve Stok Doğruluk Yönetimi** (2 Soru — INV-028, INV-029)
13. **Stok Raporlama, Devir Hızı ve KPI'lar** (4 Soru — INV-030, INV-031, INV-032, INV-033)
14. **İkame (Alternatif) Malzeme ve Revizyon Yönetimi** (2 Soru — INV-034, INV-035)
15. **Promosyon, Set ve Takım (Kitting) Stokları** (1 Soru — INV-036)
16. **İade, Hurda ve Fire Stok Muhasebeleştirmesi** (1 Soru — INV-037)

---

## 3. Detaylı Soru Kataloğu

### 1. Stok Ana Veri Yapısı ve Kodlama

#### [INV-001] Stok kartları (malzeme ana verisi) hangi kurallara göre ve kimler tarafından sisteme açılıyor?
- **Süreç:** Stok Ana Veri Yapısı ve Kodlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Stok kartı açma disiplini, yetkilendirme ve mükerrer kart oluşumunun önlenmesi.
- **Seçenekler:**
  - `merkezi_yetkili_ekip`: Sadece tanımlı merkezi bir ana veri (MDM) / ürün yönetimi ekibi onaylı taleple açar
  - `departman_bazli_serbest`: Departman personeli (Satın alma, satış veya üretim) ihtiyaç duydukça doğrudan stok kartı açabilir *(Not Alınabilir)*
  - `muhasebe_kod_verir`: Teknik ekip ürünü belirler, muhasebe/finans kod vererek sisteme girer
  - `standartsiz_serbest`: Herhangi bir yetki kısıtı yoktur, herkes açabildiği için mükerrer kartlar oluşmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Malzeme Ana Veri Onay İş Akışı (Item Master Approval Workflow) ve kullanıcı rol yetkilerini belirler.

#### [INV-002] Stok kodlama yapınız nasıl kurgulanmıştır (anlamlı/akıllı kod mu, sıralı/otomatik numara mı)?
- **Süreç:** Stok Ana Veri Yapısı ve Kodlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Stok kodunda ürün özelliklerinin gömülü olup olmadığı (Smart Code vs. Sequential Numbering).
- **Seçenekler:**
  - `akilli_kodlama`: Anlamlı kodlama; kodun içinde ürün grubu, hammadde tipi, ölçü vb. kurallar şifrelenmiştir *(Not Alınabilir)*
  - `sirali_otomatik_numara`: Sıralı otomatik numara (ör. 100001, 100002); ürün özellikleri kodda değil nitelik alanlarında tutulur
  - `tedarikci_veya_oem_kodu`: Doğrudan tedarikçinin veya üreticinin parça/katalog kodu kullanılır *(Not Alınabilir)*
  - `karma_standartsiz`: Eski ve yeni ürünlerde farklı yapılar var, kural birliği bulunmuyor *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Stok Numaralama Şablonları (Numbering Series) ve Nitelik Tabanlı Arama (Attribute Search) altyapısını belirler.

#### [INV-003] Aynı fiziksel malzemenin birden fazla farklı stok koduyla sistemde mükerrer açılması nasıl engelleniyor?
- **Süreç:** Stok Ana Veri Yapısı ve Kodlama
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Mükerrer stok kartı kirliliğinin sistemsel veya operasyonel kontrolü.
- **Seçenekler:**
  - `sistem_otomatik_kontrol`: Sistem parça no, üretici kodu, barkod veya teknik parametre eşleşmesinde uyarı verip açılışı engeller
  - `manuel_arama_kontrol`: Kartı açan personel önce sistemde benzer isim ve kodları manuel arayarak kontrol eder
  - `mukerrer_engelleme_yok`: Sistemde veya süreçte kontrol yoktur; aynı ürün için sık sık mükerrer kartlar açılmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Malzeme Ana Verisi Tekillik Kontrolü (Unique Key / Manufacturer Part Number Constraint) kuralını belirler.

---

### 2. Malzeme Sınıflandırması ve Nitelik Yönetimi

#### [INV-004] Malzemeler (stoklar) ERP sisteminde kaç seviyeli bir hiyerarşi ve sınıflandırma ile gruplanmaktadır?
- **Süreç:** Malzeme Sınıflandırması ve Nitelik Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Stok Ana Grup, Alt Grup, Kategori, Malzeme Türü hiyerarşisi.
- **Seçenekler:**
  - `cok_seviyeli_tam_hiyerarsi`: 3 veya daha fazla seviyeli hiyerarşik yapı (Ana Grup -> Alt Grup -> Kategori -> Tip) tanımlıdır *(Not Alınabilir)*
  - `iki_seviyeli_temel_grup`: Sadece 2 seviyeli (Ana Grup ve Alt Grup) temel sınıflandırma kullanılmaktadır
  - `tek_seviyeli_veya_duz`: Sadece tek bir stok grubu alanı vardır, alt kırılımlar bulunmamaktadır
  - `siniflandirma_yok`: Herhangi bir grup hiyerarşisi tanımlı değildir, stoklar serbest listelenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Malzeme Hiyerarşi Ağacı (Product Hierarchy) ve Muhasebe Hesap Grubu eşlemelerini belirler.

#### [INV-005] Renk, beden, ölçü, alaşım, kalınlık gibi varyantlı (nitelikli) ürünler sistemde nasıl yönetilmektedir?
- **Süreç:** Malzeme Sınıflandırması ve Nitelik Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Varyant matrisi kullanımı vs. her kombinasyon için bağımsız stok kartı açılması.
- **Seçenekler:**
  - `tek_ana_kart_varyant_matrisi`: Tek bir ana model kartı altında dinamik Varyant/Nitelik matrisi ile yönetilir *(Not Alınabilir)*
  - `her_varyanta_ayri_stok_karti`: Her renk, beden veya ölçü kombinasyonu için tamamen ayrı ve bağımsız bir stok kartı açılır *(Not Alınabilir)*
  - `konfigurator_ozel_kod`: Ürün konfigüratörü ile sipariş anında dinamik parametrik stok kodu ve reçete üretilir *(Not Alınabilir)*
  - `varyantli_urunumuz_yok`: Ürünlerimizde varyant/matris ihtiyacı yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Varyant Yönetimi (Product Variant / Matrix Engine) veya Ürün Konfigüratörü modülü ihtiyacını belirler.

---

### 3. Ölçü Birimleri ve Birim Dönüşümleri

#### [INV-006] Malzemeler için birden fazla ölçü birimi (stok birimi, satın alma birimi, satış birimi) kullanılıyor mu?
- **Süreç:** Ölçü Birimleri ve Birim Dönüşümleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Çift veya çoklu ölçü birimi yönetimi (Base UoM vs. Purchasing/Sales UoM).
- **Seçenekler:**
  - `coklu_birim_ve_donusum`: Evet, ürünler ana stok biriminden farklı birimlerle satın alınıp veya satılabilmektedir *(Not Alınabilir)*
  - `sabit_tek_olcu_birimi`: Hayır, her ürün tek bir standart ölçü birimiyle işlem görür
  - `paket_koli_iliski`: Sadece koli içi adet / palet içi koli gibi standart ambalaj katları takip edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çoklu Ölçü Birimi (Multi-UoM) ve Otomatik Birim Çevrim Tablosu gereksinimini belirler.

#### [INV-007] Ölçü birimleri arasındaki dönüşüm katsayıları sabit midir yoksa partiye/harekete göre değişken (kesirli/dinamik) midir?
- **Süreç:** Ölçü Birimleri ve Birim Dönüşümleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `INV-006` == `coklu_birim_ve_donusum`
- **Açıklama:** Sabit katsayı vs. değişken/ağırlık bazlı katsayı (Catch Weight / Paralel Birim).
- **Seçenekler:**
  - `sabit_donusum_katsayisi`: Sabittir; her ürünün birim dönüşüm katsayısı stok kartında tanımlıdır ve değişmez
  - `degisken_dinamik_agirlik`: Değişkendir; aynı adetteki ürünün ağırlığı partiden partiye değişir (Catch Weight / Paralel Birim takibi gerekir) *(Not Alınabilir)*
  - `boyut_ve_yogunluk_formulu`: Formüle bağlıdır; en x boy x kalınlık x yoğunluk hesaplamasıyla miktar türetilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çift Paralel Birim (Catch Weight Management - Dual UoM) ve Dinamik Formüllü Birim Çevrim mimarisini belirler.

---

### 4. Stok Türleri ve Özel Sahiplikler (Konsinye & Emanet)

#### [INV-008] Tedarikçiye ait olup firmanızın deposunda duran ve kullanıldıkça faturalanan 'Konsinye Giriş Stoğu' var mı?
- **Süreç:** Stok Türleri ve Özel Sahiplikler (Konsinye & Emanet)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi konsinye stoklarının mülkiyet ve stok değerlemesinden ayrılması.
- **Seçenekler:**
  - `tedarikci_konsinye_var`: Evet, tedarikçi konsinye malzemeleri tutuyoruz; tüketime/üretime çekildikçe fatura kesilir *(Not Alınabilir)*
  - `tedarikci_konsinye_yok`: Hayır, depomuza giren tüm malzemelerin mülkiyeti doğrudan şirketimize aittir
  - `nadir_proje_bazli`: Sadece belirli büyük projelerde istisnai olarak uygulanmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Tedarikçi Konsinye Stok Modülü (Vendor Consignment Stock) ve Otomatik Tüketim Faturası eşlemesini belirler.

#### [INV-009] Şirketinize ait olup müşteride duran (müşteri konsinyesi) veya fason tedarikçide işlenmeyi bekleyen stoklarınız var mı?
- **Süreç:** Stok Türleri ve Özel Sahiplikler (Konsinye & Emanet)
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Şirket dışındaki mülkiyeti bize ait harici stokların (Subcontracting / Customer Consignment) izlenmesi.
- **Seçenekler:**
  - `hem_fason_hem_musteri_konsinye`: Evet, hem fason üreticideki hammadde stoğumuzu hem de müşterideki konsinye mamul stoğumuzu izliyoruz *(Not Alınabilir)*
  - `sadece_fasoncu_stogu`: Sadece fason tedarikçilere gönderdiğimiz malzeme ve yarı mamul stoklarını izliyoruz *(Not Alınabilir)*
  - `sadece_musteri_konsinye`: Sadece bayilerde / müşterilerde duran konsinye ürünlerimizi izliyoruz *(Not Alınabilir)*
  - `harici_stok_yok`: Şirket dışındaki tesislerde mülkiyeti bize ait hiçbir stok bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fason Stok Yönetimi (Subcontractor Special Stock) ve Müşteri Konsinye İrsaliye Takibini belirler.

#### [INV-010] Müşteriye ait olup tamir, bakım veya fason işleme amacıyla deponuzda tutulan 'Emanet Stoklar' nasıl izleniyor?
- **Süreç:** Stok Türleri ve Özel Sahiplikler (Konsinye & Emanet)
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Şirket aktiflerine girmeyen emanet malzemelerin (Customer Custody / Third-Party Stock) yasal ve sistemsel takibi.
- **Seçenekler:**
  - `sistem_ozel_stok_tipi`: Sistemde maliyetsiz 'Emanet / Müşteri Malı' özel stok statüsünde izlenir, şirket envanterine girmez *(Not Alınabilir)*
  - `ayri_sanal_depo`: Sistemde 'Müşteri Emanet Deposu' adı altında ayrı bir depoda tutulur
  - `sisteme_alinmaz_fiziksel_tutanak`: Sisteme girilmez, kâğıt teslim tutanağı ve Excel ile fiziksel olarak takip edilir *(Not Alınabilir)*
  - `emanet_stok_alinmiyor`: Depomuzda müşteriye ait emanet malzeme tutulmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Müşteri Özel Stoğu (Customer Own Stock / Non-Valuated Special Stock) parametrelerini belirler.

---

### 5. Stok Seviyeleri ve Yeniden Sipariş Politikaları

#### [INV-011] Malzemeler için Minimum ve Maksimum stok seviyeleri tanımlanmakta ve sistem tarafından takip edilmekte midir?
- **Süreç:** Stok Seviyeleri ve Yeniden Sipariş Politikaları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Stok seviye eşikleri ve kritik stok uyarı altyapısı.
- **Seçenekler:**
  - `sistemde_urun_bazli_aktif`: Evet, ERP sisteminde ürün bazında Min/Max seviyeleri tanımlıdır ve sistem kritik seviyede uyarı üretir *(Not Alınabilir)*
  - `urun_grubu_bazli_tanimli`: Ürün bazında değil, malzeme grupları veya kategoriler bazında genel sınırlar tanımlıdır
  - `excelde_takip_edilir`: Sistemde tanımlı değildir, stok sorumluları Excel tablolarında manuel takip eder *(Not Alınabilir)*
  - `min_max_seviye_tanimi_yok`: Minimum veya maksimum stok seviye kuralı uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** MRP Min-Max Stok Planlama Parametreleri (Reorder Point Planning) ve Otomatik Satın Alma Talep Tetikleyicilerini belirler.

#### [INV-012] Emniyet Stoğu (Safety Stock) ve Yeniden Sipariş Noktası (Reorder Point) hesaplamaları nasıl yapılmaktadır?
- **Süreç:** Stok Seviyeleri ve Yeniden Sipariş Politikaları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarik süresi (Lead Time) ve tüketim değişkenliğine göre dinamik vs. statik emniyet stoğu hesabı.
- **Seçenekler:**
  - `sistem_tuketim_leadtime_hesaplar`: Sistem geçmiş tüketim hızı ve tedarikçi temin süresine (lead time) göre dinamik hesaplar/önerir *(Not Alınabilir)*
  - `sabit_gunluk_tuketim_carpani`: Planlamacı sabit bir formülle (ör. 15 günlük ortalama tüketim) hesaplayıp sisteme sabit yazar
  - `tamamen_tecrube_ve_goz_karari`: Matematiksel hesaplama yapılmaz; sorumluların tecrübesine ve göz kararına göre belirlenir
  - `emniyet_stogu_kullanilmiyor`: Emniyet stoğu tutulmaz; sadece gelen sipariş kadar malzeme alınır (JIT/Sıfır Stok)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Dinamik Emniyet Stoğu Algoritmaları ve Tedarik Süresi Parametrelerini belirler.

#### [INV-013] Minimum sipariş miktarı (MOQ) veya sipariş katları (katı miktar kısıtı) stok planlamasında dikkate alınıyor mu?
- **Süreç:** Stok Seviyeleri ve Yeniden Sipariş Politikaları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Tedarikçi koli/palet/kamyon bazlı sipariş kısıtları.
- **Seçenekler:**
  - `sistem_moq_ve_katlari_tam_uygular`: Evet, sistem ihtiyaç miktarını otomatik olarak tedarikçi MOQ ve paket katlarına yuvarlar
  - `manuel_yuvarlama_yapilir`: Sistem net ihtiyacı çıkarır, satın alma personeli tedarikçiye geçerken manuel yuvarlar *(Not Alınabilir)*
  - `moq_kisiti_yok`: Minimum sipariş veya paket katı kısıtımız bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** MRP Parti Büyüklüğü Kuralları (Lot-Sizing Procedures: Exact, Fixed, Periodic, MOQ) yapılandırmasını belirler.

---

### 6. Stok Kullanılabilirliği ve Rezervasyon Mantığı (ATP)

#### [INV-014] Kullanılabilir Stok (ATP - Available to Promise) miktarınız sistemde nasıl hesaplanmaktadır?
- **Süreç:** Stok Kullanılabilirliği ve Rezervasyon Mantığı (ATP)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Fiziksel Stok - Rezerve Stok - Kalite Bloke + Yoldaki Sipariş formülü.
- **Seçenekler:**
  - `tam_atp_formulasyonu`: Fiziksel Stoktan; Satış Rezervasyonları, Üretim Rezervasyonları ve Karantina düşülüp, onaylı Satın Alma Siparişleri eklenerek anlık hesaplanır *(Not Alınabilir)*
  - `sadece_fizikselden_rezerve_dusulur`: Fiziksel stoktan sadece onaylı satış siparişleri düşülür, bekleyen satın almalar hesaba katılmaz
  - `ayrim_yok_sadece_fiziksel`: Kullanılabilir stok ayrımı yoktur, sistemde sadece deponun anlık fiziksel miktarı görünür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ATP (Kullanılabilirlik Kontrolü) Kural Matrisi (Scope of Availability Check) ve Sipariş Teyit Motorunu belirler.

#### [INV-015] Stok yetersizliğinde sipariş rezervasyonlarında önceliklendirme kuralı (müşteri segmenti, sözleşme, sipariş tarihi vb.) uygulanıyor mu?
- **Süreç:** Stok Kullanılabilirliği ve Rezervasyon Mantığı (ATP)
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Stok tahsisinde öncelik algoritmaları (Allocation Priority Rules).
- **Seçenekler:**
  - `sistem_oncelik_skoruna_gore`: Evet, sistem müşteri grubu, VIP statüsü veya teslim tarihine göre otomatik öncelikli rezervasyon yapar *(Not Alınabilir)*
  - `ilk_siparis_ilk_rezerve`: Sipariş onay tarihine göre kesin kronolojik sıra (FIFO rezervasyon) uygulanır
  - `yonetim_manuel_tahsis_eder`: Kritik durumlarda satış/genel müdürlük manuel müdahale ile kime verileceğine karar verir *(Not Alınabilir)*
  - `oncelik_kurali_yok`: Öncelik kuralı yoktur, faturası/irsaliyesi ilk kesilen stoku alır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gelişmiş Stok Tahsis Motoru (aATP / Backorder Processing) ihtiyacını belirler.

---

### 7. Negatif Stok Politikası ve Stok Bütünlüğü

#### [INV-016] ERP sisteminde stok miktarlarının ve maliyetlerinin negatife (eksi bakiyeye) düşmesine izin verilmekte midir?
- **Süreç:** Negatif Stok Politikası ve Stok Bütünlüğü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Negatif stok kilidi ve maliyet bozulması riski.
- **Seçenekler:**
  - `kesinlikle_engellenmistir`: Hayır, sistem negatif stoka kesinlikle izin vermez; giriş belgesi işlenmeden çıkış yapılamaz
  - `izin_verilir_maliyet_sonra_duzelir`: Evet, operasyon durmasın diye negatif çıkışa izin verilir, giriş faturası gelince bakiye kapanır *(Not Alınabilir)*
  - `sadece_belirli_urun_ve_depolarda`: Sadece sarf malzemelerde veya üretim hat içi depolarında izin verilir, mamulde yasaktır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Negatif Stok Kilidi (Disallow Negative Inventory) ve Dönem Sonu Maliyet Düzeltme Parametrelerini belirler.

#### [INV-017] Negatif stok durumunda ürün maliyetleri ve kârlılık raporları sistemde nasıl etkilenmektedir?
- **Süreç:** Negatif Stok Politikası ve Stok Bütünlüğü
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `INV-016` != `kesinlikle_engellenmistir`
- **Açıklama:** Eksi stokta çıkış yapıldığında COGS (Satılan Malın Maliyeti) sapmaları.
- **Seçenekler:**
  - `son_alis_fiyatindan_gecici_maliyet`: Sistem son alış fiyatından geçici maliyet atar, asıl fatura girilince otomatik fark fişi üretir *(Not Alınabilir)*
  - `sifir_veya_hatali_maliyet_olur`: Maliyet sıfır veya hatalı görünür, dönem sonlarında muhasebe manuel düzeltme yapar *(Not Alınabilir)*
  - `etkisi_takip_edilmiyor`: Negatif stokların maliyet üzerindeki etkisi ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Negatif Stok Maliyetleme Motoru gereksinimini netleştirir.

---

### 8. Stok Değerleme ve Maliyet Yöntemleri

#### [INV-018] Stok değerleme ve maliyet takibinde hangi yöntem kullanılmaktadır?
- **Süreç:** Stok Değerleme ve Maliyet Yöntemleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Yürüyen Ağırlıklı Ortalama, FIFO, Standart Maliyet, Aylık Ortalama vb.
- **Seçenekler:**
  - `yuruyen_agirlikli_ortalama`: Yürüyen Ağırlıklı Ortalama Maliyet (Moving Average Cost)
  - `fifo_ilk_giren_ilk_cikar`: Fiili FIFO (İlk Giren İlk Çıkar Maliyeti)
  - `standart_maliyet_ve_sapma`: Standart Maliyet (Standard Cost) + Ay Sonu Fiili Sapma Dağıtımı *(Not Alınabilir)*
  - `aylik_agirlikli_ortalama`: Aylık Ağırlıklı Ortalama Maliyet (Dönem Sonu Kapatma ile)
  - `lot_parti_bazli_fiili`: Lot / Parti bazında bağımsız gerçek fiili maliyet *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Malzeme Değerleme Yöntemi (Material Ledger / Costing Method) mimarisini belirler.

#### [INV-019] Farklı depo, fabrika veya şirketleriniz için farklı stok maliyetleme/değerleme ihtiyacınız var mı?
- **Süreç:** Stok Değerleme ve Maliyet Yöntemleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Şirket geneli tek maliyet vs. Depo/Tesis bazında bağımsız değerleme (Valuation Area Level: Company vs. Plant).
- **Seçenekler:**
  - `tesis_fabrika_bazinda_bagimsiz`: Evet, her fabrika veya tesisin stok maliyeti kendi girdi maliyetine göre bağımsız hesaplanmalıdır *(Not Alınabilir)*
  - `sirket_geneli_tek_maliyet`: Hayır, tüm depolarda aynı ürün için şirket genelinde tek bir ağırlıklı maliyet geçerlidir
  - `grup_sirketleri_arasi_farkli`: Farklı tüzel kişilikli grup şirketlerimiz arasında bağımsız maliyet takip edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Değerleme Seviyesi (Valuation Area: Plant Level vs. Company Code Level) mimarisini belirler.

#### [INV-020] Stok maliyetleri Türk Lirası dışında döviz (USD, EUR vb.) cinsinden de anlık takip ediliyor mu?
- **Süreç:** Stok Değerleme ve Maliyet Yöntemleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Çift para birimli stok muhasebesi (Parallel Currencies / Multi-Currency Valuation).
- **Seçenekler:**
  - `cift_para_birimli_anlik`: Evet, hem TL hem de raporlama dövizi (USD/EUR) cinsinden anlık paralel stok maliyeti tutulur *(Not Alınabilir)*
  - `sadece_ithal_urunlerde_doviz`: Sadece ithal hammaddelerin alış dövizi saklanır, genel stok TL değerlenir
  - `sadece_tl_degerleme`: Hayır, tüm stoklarımız sadece Türk Lirası olarak değerlenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çoklu Para Birimli Envanter Defteri (Multi-Currency Inventory Ledger) yapılandırmasını belirler.

#### [INV-021] Satın alma fiyatı dışındaki hangi ek maliyet unsurları doğrudan stok maliyetine (ürün birim maliyetine) dahil edilmektedir?
- **Süreç:** Stok Değerleme ve Maliyet Yöntemleri
- **Tip:** `multiple_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Navlun, gümrük, sigorta, elleçleme ve millileştirme masraflarının maliyete yedirilmesi (Landed Cost).
- **Seçenekler:**
  - `gumruk_ve_ithalat_masraflari`: Gümrük vergisi, ordino, konşimento ve ithalat dosya masrafları
  - `nakliye_navlun_faturasi`: Malzeme nakliye ve navlun faturaları
  - `nakliyat_sigortasi`: Emtia nakliyat sigortası bedeli
  - `fason_iscilik_bedeli`: Dışarıda yaptırılan fason işçilik faturaları
  - `masraflar_stoga_degil_gidere_yazilir`: Ek masraflar ürün maliyetine yedirilmez, doğrudan dönem gideri yazılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Ürün Maliyet Dağıtım Modülü (Landed Cost Allocation Engine) kurallarını belirler.

---

### 9. Stok Yaşlandırma, Yavaş Hareket Eden ve Ölü Stok

#### [INV-022] Stok Yaşlandırma Raporu (Inventory Aging) düzenli olarak alınıp analiz edilmekte midir?
- **Süreç:** Stok Yaşlandırma, Yavaş Hareket Eden ve Ölü Stok
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Giriş tarihinden itibaren stokta bekleme gün aralıklarının (0-30, 31-90, 91-180, 180-365, 365+ gün) izlenmesi.
- **Seçenekler:**
  - `sistemden_duzenli_alinir`: Evet, sistemden FIFO bazlı gün aralıklı stok yaşlandırma raporu aylık/haftalık çekilir *(Not Alınabilir)*
  - `excelde_manuel_hesaplanir`: Sistemde standart rapor yoktur, giriş ve çıkışlar Excel'e aktarılarak manuel hesaplanır *(Not Alınabilir)*
  - `yaslandirma_takibi_yapilmiyor`: Stok yaşlandırma analizi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Standart FIFO Stok Yaşlandırma Raporu (Inventory Aging Grid) gereksinimini belirler.

#### [INV-023] Hareketsiz (Non-moving), Yavaş Dönen (Slow-moving) ve Ölü (Dead) stok kriterleriniz nasıl tanımlanmıştır?
- **Süreç:** Stok Yaşlandırma, Yavaş Hareket Eden ve Ölü Stok
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kaç gün veya ay hareket görmeyen malzemenin atıl stok sınıfına alınacağı kuralı.
- **Seçenekler:**
  - `tanimli_gun_kurali_var`: Evet, kesin kuralımız vardır (ör. 90 gün = yavaş, 180 gün = hareketsiz, 365 gün = ölü) *(Not Alınabilir)*
  - `urun_grubuna_gore_degisir`: Ürün grubuna göre değişir; yedek parçada 1 yıl normal iken mamulde 45 gün ölü sayılır *(Not Alınabilir)*
  - `tanimli_bir_kriter_yok`: Sistematik bir kriter tanımlı değildir, stok fazlası çıktıkça incelenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Atıl Stok Sınıflandırma ve Uyarı Kurallarını belirler.

#### [INV-024] Ölü ve hareketsiz stoklar için sistemde Değer Düşüklüğü Karşılığı (Stok Amortismanı / Provizyon) ayrılmakta mıdır?
- **Süreç:** Stok Yaşlandırma, Yavaş Hareket Eden ve Ölü Stok
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** TFRS/VUK stok değer düşüklüğü karşılıklarının muhasebeleştirilmesi.
- **Seçenekler:**
  - `sistem_otomatik_karsilik_hesaplar`: Evet, bekleme süresine göre belirli oranlarda (%20, %50, %100) otomatik değer düşüklüğü hesaplanır *(Not Alınabilir)*
  - `muhasebe_donem_sonunda_manuel_ayirir`: Mali işler yıl sonunda denetim raporu için Excel'de hesaplayıp manuel karşılık kaydı atar *(Not Alınabilir)*
  - `stok_karsiligi_ayrilmiyor`: Stok değer düşüklüğü karşılığı ayrılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Stok Değer Düşüklüğü Karşılık Modülü (Inventory Write-down / Provision Engine) ihtiyacını belirler.

---

### 10. Envanter Muhasebesi ve Defter Entegrasyonu

#### [INV-025] Stok hareketleri gerçekleştiği anda genel muhasebe hesap planına (150, 151, 152, 153, 620 vb.) anlık entegre olmakta mıdır?
- **Süreç:** Envanter Muhasebesi ve Defter Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Sürekli Envanter Sistemi (Perpetual Inventory) vs. Aralıklı Envanter (Dönem Sonu Manuel Entegrasyon).
- **Seçenekler:**
  - `surekli_envanter_anlik_entegrasyon`: Evet, her mal kabul, üretim çıkışı, sevk ve sayım anında ilgili muhasebe fişi sistem tarafından otomatik kesilir (Sürekli Envanter)
  - `gunluk_veya_aylik_toplu_entegrasyon`: Stok hareketleri gün veya ay sonunda topluca muhasebe fişine dönüştürülür *(Not Alınabilir)*
  - `muhasebe_ayri_manuel_isler`: Stok modülü ile muhasebe entegre değildir; muhasebe faturalardan ayrı kayıt girer (Aralıklı Envanter) *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sürekli Envanter Muhasebe Entegrasyonu (Automatic Account Determination / Postings) parametrelerini belirler.

#### [INV-026] Malzeme hareketlerinde muhasebe hesap kodları malzeme grubuna göre mi, depo tipine göre mi, yoksa hareket koduna göre mi belirlenir?
- **Süreç:** Envanter Muhasebesi ve Defter Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Hesap tayin matrisi kuralları (Account Determination Matrix).
- **Seçenekler:**
  - `malzeme_grubu_ve_hareket_tipi`: Malzeme değerleme sınıfı + Hareket tipi kombinasyonu ile tam otomatik eşleşir *(Not Alınabilir)*
  - `sadece_depo_bazli_hesap`: Hangi depodan hareket gördüğüne bağlı olarak ilgili depo muhasebe hesabı çalışır
  - `kullanici_manuel_hesap_secer`: Kullanıcı her harekette muhasebe hesap kodunu manuel seçer veya teyit eder *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Hesap Tayini (Automatic Posting Rule Matrix) karmaşıklığını belirler.

---

### 11. Stok Transferleri ve Şubeler Arası Değer Takibi

#### [INV-027] Depolar veya şubeler arası stok transferlerinde transfer maliyeti ve navlun masrafı nasıl yönetilmektedir?
- **Süreç:** Stok Transferleri ve Şubeler Arası Değer Takibi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Transfer anında ürün maliyetinin aynen korunması vs. transfer navlununun stok maliyetine eklenmesi.
- **Seçenekler:**
  - `maliyet_aynen_korunur`: Ürün maliyeti değişmez, çıkış deponun maliyetiyle varış deposuna aktarılır
  - `transfer_navlunu_stoga_eklenir`: Şubeler arası taşıma navlunu varış deposundaki ürünün maliyetine eklenir *(Not Alınabilir)*
  - `farkli_sirketler_arasi_faturali_satis`: Farklı tüzel kişilikli şubeler arasında transferler kârlı/faturalı satış işlemi olarak yürür (Intercompany) *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Şirketler Arası Ticaret (Intercompany Sales & Transfer Pricing) ve Stok Transfer Maliyet Dağıtımını belirler.

---

### 12. Sayım Mutabakatı ve Stok Doğruluk Yönetimi

#### [INV-028] Stok doğruluk oranı (Inventory Record Accuracy) düzenli olarak hesaplanmakta ve takip edilmekte midir?
- **Süreç:** Sayım Mutabakatı ve Stok Doğruluk Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Sistemdeki adet ve tutar ile fiziksel sayım sonuçlarının mutabakat disiplini.
- **Seçenekler:**
  - `duzenli_ira_olculur_yuzde_95_ustu`: Evet, düzenli ölçülür; stok doğruluk oranımız adet ve tutar bazında %95'in üzerindedir *(Not Alınabilir)*
  - `olculur_ancak_farklar_yuksek`: Ölçülmektedir ancak uyuşmazlıklar ve fark oranları hedeflenen seviyenin altındadır *(Not Alınabilir)*
  - `sadece_yil_sonu_sayiminda_gorulur`: Düzenli ölçülmez, sadece yıl sonu genel sayımında toplam fark tutarı ortaya çıkar
  - `hic_olculmuyor`: Stok doğruluk oranı ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Stok Doğruluk KPI'ı ve Sistem Geçişi Öncesi Envanter Düzeltme İhtiyacını gösterir.

#### [INV-029] Sayım farklarının muhasebeleştirilmesinde yetki onay sınırları ve tutarsal limitler uygulanmakta mıdır?
- **Süreç:** Sayım Mutabakatı ve Stok Doğruluk Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Sayım fark fişi onay hiyerarşisi (Tolerance Limits for Inventory Difference).
- **Seçenekler:**
  - `tutar_limitli_onay_matrisi`: Evet, belirli bir parasal tutarı aşan farklar Genel Müdür / Mali İşler onayına düşer *(Not Alınabilir)*
  - `tum_farklar_tek_yetkiliye_gider`: Tutar fark etmeksizin tüm sayım farkları fabrika/mali işler müdürünün onayına gider
  - `onay_limiti_yok_depocu_kapatir`: Onay kuralı yoktur, sayım farkları doğrudan sisteme işlenip bakiye eşitlenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sayım Fark Tolerans Limitleri (Physical Inventory Tolerance Groups) ve Onay İş Akışını belirler.

---

### 13. Stok Raporlama, Devir Hızı ve KPI'lar

#### [INV-030] Stok yönetimi kapsamında düzenli olarak takip edilen veya ihtiyaç duyulan temel envanter KPI'ları nelerdir?
- **Süreç:** Stok Raporlama, Devir Hızı ve KPI'lar
- **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Stok finansal ve operasyonel yönetim göstergeleri.
- **Seçenekler:**
  - `stok_devir_hizi`: Stok Devir Hızı (Inventory Turnover Ratio)
  - `ortalama_stok_gun_sayisi`: Ortalama Stokta Kalma Gün Sayısı (Days Sales of Inventory - DSI)
  - `stok_tutma_maliyeti`: Stok Finansman ve Tutma Maliyeti (Inventory Holding Cost)
  - `hizmet_seviyesi_siparis_karsilama`: Stoktan Sipariş Karşılama Oranı (Fill Rate / Service Level)
  - `atil_ve_olu_stok_orani`: Toplam Envanter İçinde Atıl/Ölü Stok Oranı (% Dead Stock)
  - `brut_marj_stok_yatirimi_getirisi`: Stok Yatırımı Kârlılık Oranı (GMROI - Gross Margin Return on Investment) *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Stok Yönetici Kokpiti ve Standart ERP Raporlama Paketini belirler.

#### [INV-031] Stok raporları anlık (real-time) olarak çekilebilmekte midir, yoksa dönem kapatma / maliyet çalıştırma sonrasında mı güncellenir?
- **Süreç:** Stok Raporlama, Devir Hızı ve KPI'lar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Stok envanter ve mizan raporlarının anlık güvenilirliği.
- **Seçenekler:**
  - `anlik_canli_raporlanir`: Evet, miktar ve değer bazlı tüm stok raporları anlık canlı olarak çekilir
  - `miktar_anlik_deger_donem_sonu`: Miktar anlık izlenir ancak parasal maliyet değerleri dönem sonu maliyet kapatmasından sonra netleşir *(Not Alınabilir)*
  - `raporlar_gecikmeli_ve_guvensiz`: Raporlar gecikmeli üretilir, sistemdeki stok tutarlarına tam güvenilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Anlık Envanter Değerleme Altyapısı ve Dönem Sonu Kapanış Sürelerini belirler.

#### [INV-032] ABC / XYZ Stok Analizi (değer ve tüketim sıklığına göre matris gruplama) yapılmakta mıdır?
- **Süreç:** Stok Raporlama, Devir Hızı ve KPI'lar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** ABC analizi ve XYZ analizi matris gruplama olgunluğu.
- **Seçenekler:**
  - `sistem_otomatik_abc_xyz_yapar`: Evet, sistem ürünleri ciro ve talep değişkenliğine göre otomatik ABC/XYZ kategorisine ayırır *(Not Alınabilir)*
  - `sadece_ciroya_gore_abc_var`: Sadece satış/tüketim tutarına göre ABC analizi Excel'de manuel yapılır
  - `abc_analizi_yapilmiyor`: ABC veya XYZ analizi yapılmamaktadır, tüm ürünlere aynı stok politikası uygulanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik ABC/XYZ Sınıflandırma ve Kategori Bazlı Emniyet Stoğu Politikalarını belirler.

#### [INV-033] Gelecek dönem stok seviyeleri ve bütçesi için Envanter Bütçelemesi ve Simülasyonu yapılıyor mu?
- **Süreç:** Stok Raporlama, Devir Hızı ve KPI'lar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `low`
- **Açıklama:** Stok yatırım bütçesi ve nakit akış planlama entegrasyonu.
- **Seçenekler:**
  - `erp_entegre_stok_butcesi`: Evet, yıllık/çeyreklik hedeflere göre stok bağlama bütçesi planlanır ve ERP'de izlenir *(Not Alınabilir)*
  - `excelde_ust_duzey_tahmin`: Finans tarafından Excel'de makro seviyede toplam stok hedefi belirlenir
  - `stok_butcelemesi_yapilmiyor`: Geleceğe dönük stok bütçelemesi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Finansal Envanter Bütçesi ve İşletme Sermayesi (Working Capital) Raporlamasını belirler.

---

### 14. İkame (Alternatif) Malzeme ve Revizyon Yönetimi

#### [INV-034] Stokta bulunmayan bir malzeme yerine kullanılabilecek 'İkame / Alternatif Malzeme' tanımları sistemde tutuluyor mu?
- **Süreç:** İkame (Alternatif) Malzeme ve Revizyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bir ürün bittiğinde otomatik veya öneri olarak alternatif stok kartının devreye alınması.
- **Seçenekler:**
  - `sistem_otomatik_ikame_onerir`: Evet, her ürünün teknik olarak onaylanmış ikame kodları tanımlıdır; stok yoksa sistem alternatifi önerir *(Not Alınabilir)*
  - `personel_bilgisine_gore_secilir`: Sistemde ikame tanımı yoktur, personel tecrübesiyle seçer
  - `ikame_kullanimi_yasaktir`: Ürünlerimizde ikame malzeme kullanımı kesinlikle yasaktır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Alternatif Malzeme Belirleme (Item Substitution) modülünü belirler.

#### [INV-035] Teknik resim veya formül değişikliği geçiren malzemelerde 'Mühendislik Revizyon / Versiyon Seviyesi' stokta nasıl izleniyor?
- **Süreç:** İkame (Alternatif) Malzeme ve Revizyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Revizyon A, B, C değişikliklerinde eski stokların tüketim kuralları (Engineering Change Management - ECM).
- **Seçenekler:**
  - `ayni_karta_revizyon_seviyesi_atanir`: Aynı stok kodu altında Revizyon seviyesi (Rev 01, Rev 02) tutulur; eski revizyon bitmeden yenisi verilmez *(Not Alınabilir)*
  - `her_revizyona_yeni_stok_kodu`: Her teknik değişiklikte eski kod kapatılıp tamamen yeni bir stok kodu açılır
  - `revizyon_takibi_yapilmaz`: Revizyon takibi yapılmaz, ürün aynı kodla güncellenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Mühendislik Değişiklik Yönetimi (ECM) ve Stok Faz Çıkış (Phase-in / Phase-out) kurgusunu belirler.

---

### 15. Promosyon, Set ve Takım (Kitting) Stokları

#### [INV-036] Birden fazla stok kartının bir araya gelerek tek bir ürün gibi satıldığı 'Set / Paket / Kit' ürünler nasıl yönetilmektedir?
- **Süreç:** Promosyon, Set ve Takım (Kitting) Stokları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Satış anında alt bileşenlerin stoktan düşülmesi (Dinamik Kit) vs. Önceden montajlanmış set stoku (Statik Kit).
- **Seçenekler:**
  - `dinamik_kit_satista_patlar`: Sistemde Set Kodu girilir, fatura/irsaliye anında alt bileşenler kendi stoklarından otomatik düşülür (Sales Kit) *(Not Alınabilir)*
  - `onceden_paketlenen_fiziksel_set`: Setler depoda önceden birleştirilip ayrı bir set stok kartı olarak üretilir ve raflanır
  - `manuel_tek_tek_girilir`: Setteki tüm parçalar sipariş satırına tek tek manuel yazılır
  - `set_veya_kit_urunumuz_yok`: Set / Paket / Kit şeklinde ürünümüz bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satış Setleri / Kit Yönetimi (Sales BOM / Kitting) parametrelerini belirler.

---

### 16. İade, Hurda ve Fire Stok Muhasebeleştirmesi

#### [INV-037] Üretim ve depolama sırasında oluşan doğal fireler veya kusurlu hurda malzemelerin stoktan düşümü ve maliyet kaydı nasıl işlemektedir?
- **Süreç:** İade, Hurda ve Fire Stok Muhasebeleştirmesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Standart fire toleransı vs. fiili hurda çıkışlarının maliyete / gidere yansıtılması.
- **Seçenekler:**
  - `onayli_fire_fisi_ile_gider_yazilir`: Sistemde onaylı Fire/Hurda Çıkış Fişi kesilir; ilgili gider ve stok hesaplarına otomatik aktarılır *(Not Alınabilir)*
  - `standart_recete_firesi_otomatik_duser`: Ürün ağacındaki (BOM) tanımlı standart fire oranı kadar stoktan otomatik düşülür
  - `donem_sonu_sayim_farkina_atilir`: Fireler anlık işlenmez, dönem sonu sayım açığı olarak genel farka atılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fire/Hurda Maliyet Muhasebesi (Scrap Accounting / BOM Scrap Factors) yapılandırmasını belirler.
