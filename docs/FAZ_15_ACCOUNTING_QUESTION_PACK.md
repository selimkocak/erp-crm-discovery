# FAZ-15 — Muhasebe (Genel) / ACCOUNTING Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.accounting.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `ACCOUNTING` (Muhasebe (Genel))  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Mali İşler Direktörleri (CFO), Muhasebe Müdürleri, Mali Müşavirler  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP implementasyonu öncesinde Tekdüzen Hesap Planı (THP), otomatik yevmiye entegrasyonu, cari muhasebe (120/320), masraf merkezleri (7/A), KDV, tevkifat, stopaj, e-Defter beratları, döviz değerleme ve kur farkları, dönemsellik (180/280/381), sabit kıymet amortismanı (257), sürekli envanter (150/620/621), GR/IR takas hesapları, 3-way match fatura doğrulama, banka ekstresi fişleşmesi, dönem sonu mali kapanış kontrol listesi, denetim izi (Audit Trail), storno ters kayıt ve finansal raporlama süreçlerinin AS-IS durumunu ve ERP tasarım gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | ACCOUNTING ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **TREASURY** | Nakit yönetimi, likidite tahminleri, tahsilat/ödeme günleri planlaması, banka kredi limitleri ve faiz optimizasyonu | **Accounting nakit akış planı veya banka ilişkisi sormaz.** Yalnızca 100 Kasa / 102 Banka hesap hareketlerinin fişleşmesi, online ekstre (MT940) muhasebe kaydı ve banka mutabakatına odaklanır. |
| **SALES** | Müşteri ilişkileri, Fırsatlar, Teklifler, Satış Siparişleri (SO), Fiyatlandırma, İskonto ve Ticari Ödeme Şartları | **Accounting satış sipariş sürecini tekrar sormaz.** Satış faturasının 600 Gelir, 391 KDV ve 120 Müşteri hesaplarına aktarımı, iskonto muhasebeleştirmesi ve tevkifat kaydına odaklanır. |
| **PROCUREMENT** | Tedarikçi araştırması, Talep, Satınalma Siparişi (PO), Teklif Karşılaştırma ve Tedarikçi Onayları | **Accounting satınalma onayını tekrar sormaz.** Satınalma faturasının 3'lü eşleşmesi (PO-GR-IR), fiyat farkı hesapları ve 150/191/320 kaydına odaklanır. |
| **INVENTORY** | Stok kartı ana verisi, varyant matrisi, ölçü birimi çevrimleri, konsinye/emanet stok, Min/Max seviyeleri, ATP kullanılabilir stok, sayım operasyonu | **Accounting depo transferi veya sayım operasyonu sormaz.** Sürekli envanter defter kaydı, STMM hesaplama yöntemi ve GR/IR fatura bekleyen mal alımları geçici hesabına odaklanır. |
| **LOGISTICS** | Araç/taşıyıcı seçimi, rota planlama, randevulu teslimat, yükleme hacim kontrolü, sevk irsaliyesi, POD ve OTIF | **Accounting araç veya kargo takibi sormaz.** Yalnızca e-İrsaliye ile fatura arasındaki muhasebe bağlantısı ve navlun faturalarının gider/maliyet kaydına odaklanır. |
| **BUDGET_REPORTING** | Çok boyutlu bütçe hazırlama, dinamik tahminler (Forecasting), bütçe revizyonları ve varyans analizleri | **Accounting detaylı bütçe hazırlama sormaz.** Yalnızca fiş girişinde bütçe/masraf merkezi kontrolü ve standart mali tablolar (Mizan, Bilanço, Gelir Tablosu) üretimine odaklanır. |
| **ACCOUNTING** | Hesap planı (THP), yevmiye fişleri, otomatik hesap tayini (Account Determination), cari mutabakatı (120/320), masraf merkezi gider muhasebesi (7/A), KDV, tevkifat, stopaj, e-Defter beratları, döviz değerleme ve kur farkları, dönemsellik (180/280/381), sabit kıymet amortismanı (257), sürekli envanter (150/620/621), GR/IR takas hesapları, 3-way match, banka ekstresi fişleşmesi, dönem sonu mali kapanış kontrol listesi, denetim izi (Audit Trail), storno ters kayıt ve finansal raporlama | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular defteri kebir, vergi mevzuatı uyumu, finansal kontrol ve ERP muhasebe parametreleri derinliğinde yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Hesap Planı ve Muhasebe Organizasyonu** (2 Soru — ACC-001, ACC-002)
2. **Yevmiye ve Muhasebe Fişleri Yönetimi** (2 Soru — ACC-003, ACC-004)
3. **Otomatik Muhasebe Entegrasyonu ve Hesap Tayini** (2 Soru — ACC-005, ACC-006)
4. **Satıcı ve Müşteri Cari Muhasebesi** (2 Soru — ACC-007, ACC-008)
5. **Masraf ve Gider Muhasebesi** (3 Soru — ACC-009, ACC-010, ACC-011)
6. **Vergi ve KDV Süreçleri Yönetimi** (2 Soru — ACC-012, ACC-013)
7. **Tevkifat ve Stopaj Süreçleri** (3 Soru — ACC-014, ACC-015, ACC-016)
8. **e-Belge ve e-Defter Muhasebe Süreçleri** (2 Soru — ACC-017, ACC-018)
9. **Dövizli İşlemler ve Kur Farkları Yönetimi** (2 Soru — ACC-019, ACC-020)
10. **Dönemsellik, Tahakkuk ve Gelecek Aylara Ait Giderler** (2 Soru — ACC-021, ACC-022)
11. **Sabit Kıymet ve Amortisman Muhasebesi** (2 Soru — ACC-023, ACC-024)
12. **Stok Muhasebesi ve Satılan Malın Maliyeti** (2 Soru — ACC-025, ACC-026)
13. **Satın Alma Muhasebesi ve Fatura Eşleştirme** (2 Soru — ACC-027, ACC-028)
14. **Satış Muhasebesi ve Gelir Tahakkuku** (2 Soru — ACC-029, ACC-030)
15. **Banka ve Kasa Muhasebe Entegrasyonu** (2 Soru — ACC-031, ACC-032)
16. **Mutabakat Süreçleri** (2 Soru — ACC-033, ACC-034)
17. **Dönem Sonu ve Mali Kapanış** (3 Soru — ACC-035, ACC-036, ACC-037)
18. **Denetim İzi ve Güvenlik** (2 Soru — ACC-038, ACC-039)
19. **Finansal Raporlama ve Standartlar** (3 Soru — ACC-040, ACC-041, ACC-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Hesap Planı ve Muhasebe Organizasyonu

#### [ACC-001] Hesap planı yapınız nasıldır ve grup şirketleri / şubeler arasında nasıl yönetilmektedir?
- **Süreç:** Hesap Planı ve Muhasebe Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tekdüzen Hesap Planı (THP), merkezi tek hesap planı vs. şube/şirket bazında bağımsız hesap planları.
- **Seçenekler:**
  - `merkezi_tek_hesap_plani_tum_sirketler`: Tüm grup şirketleri ve şubelerde merkezi tek ve standart Tekdüzen Hesap Planı (THP) kullanılır
  - `ortak_ana_hesap_sirket_ozel_alt_hesap`: Ana hesaplar (3 basamak) ortaktır; ancak şirket/şube bazında özel alt hesap kodları açılabilir *(Not Alınabilir)*
  - `her_sirket_tamamen_bagimsiz`: Her tüzel kişilik ve şirket tamamen kendine ait bağımsız bir hesap planı kullanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Çoklu Şirket (Multi-Company) Hesap Planı mimarisi ve Konsolidasyon gereksinimini belirler.

#### [ACC-002] Yeni muhasebe ana ve alt hesap kodu açma yetkisi ve standart kodlama kuralları nasıl yönetilmektedir?
- **Süreç:** Hesap Planı ve Muhasebe Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Hesap planının kirlenmesini ve mükerrer hesap açılmasını önleyen merkezi kontrol.
- **Seçenekler:**
  - `merkezi_yetkili_ekip_onayli_acar`: Merkezi Muhasebe/Finans ekibi açar; hesap kodu açılışında katı kodlama standardı ve onay akışı vardır *(Not Alınabilir)*
  - `muhasebe_kullanicilari_ihtiyaca_gore_acar`: Tüm muhasebe personeli ihtiyaç duydukça doğrudan kendi yetkisiyle alt hesap açabilmektedir
  - `dis_mali_musavir_acar`: Hesap açılışları şirket içi yapılmaz, anlaşmalı dış mali müşavir veya muhasebe ofisi tarafından yönetilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Hesap Planı Master Data Yönetimi (Master Data Governance) ve yetki matrisini belirler.

---

### 2. Yevmiye ve Muhasebe Fişleri Yönetimi

#### [ACC-003] Muhasebe kayıtlarının ne kadarı operasyonel belgelerden otomatik üretilmekte, ne kadarı manuel yevmiye fişi olarak girilmektedir?
- **Süreç:** Yevmiye ve Muhasebe Fişleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Muhasebe otomasyon seviyesi ve operasyonel iş yükü.
- **Seçenekler:**
  - `cogulukla_otomatik_yuzde_80_uzeri`: Kayıtların %80'inden fazlası fatura, banka, stok vb. kaynak belgelerden sistemsel otomatik oluşur; manuel fiş oranı çok düşüktür
  - `yari_otomatik_yari_manuel`: Faturalar otomatik muhasebeleşir; ancak banka, masraf, amortisman ve düzeltmeler manuel girilir (%50-%50) *(Not Alınabilir)*
  - `cogulukla_manuel_fis_girisi`: Operasyonel sistemlerden otomatik entegrasyon yoktur; muhasebe ekibi fişleri elle tek tek işler *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Otomatik Muhasebe Entegratörleri (Accounting Automatic Posting Engine) kapsamını belirler.

#### [ACC-004] Yevmiye fişi tipleri (Mahsup, Tahsil, Tediye, Açılış, Kapanış, Kur Farkı vb.) ve fiş numaralandırma yapısı nasıl kurgulanmıştır?
- **Süreç:** Yevmiye ve Muhasebe Fişleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Yasal yevmiye sıra no vs. İç kontrol amaçlı fiş türü ayrımı.
- **Seçenekler:**
  - `standart_tur_ve_aylik_yasal_yevmiye_sirasi`: Fişler türlerine göre (Mahsup, Tahsil, Tediye) ayrılır; yasal defter için müteselsil yevmiye no otomatik verilir
  - `tek_tip_mahsup_fisi_kullanilir`: Tüm kayıtlar tek tip mahsup fişi olarak kaydedilir, özel fiş tipi ayrımı yapılmaz
  - `modul_bazli_ayri_fis_serileri_var`: Her modül (Fatura, Banka, Üretim vb.) kendi fiş serisinden bağımsız numara alır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yevmiye Fiş Tipleri (Document Types / Journal Numbering Schemes) konfigürasyonunu belirler.

---

### 3. Otomatik Muhasebe Entegrasyonu ve Hesap Tayini

#### [ACC-005] Operasyonel işlemlerin (satış, satınalma, stok, masraf) muhasebeleşmesinde Hesap Tayini (Account Determination) nasıl belirlenmektedir?
- **Süreç:** Otomatik Muhasebe Entegrasyonu ve Hesap Tayini
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Malzeme grubu, cari grubu, vergi kodu veya işlem tipine göre otomatik hesap tayin matrisi.
- **Seçenekler:**
  - `parametre_ve_matris_tablolari_ile_otomatik`: Malzeme grubu, cari türü, vergi oranı ve şube parametrelerine göre sistem doğru muhasebe hesabını otomatik bulur *(Not Alınabilir)*
  - `kullanici_belge_girerken_manuel_secer`: Kullanıcı her faturada veya işlemde ilgili muhasebe hesap kodunu listeden manuel seçer *(Not Alınabilir)*
  - `sabit_tek_hesaba_atar_sonradan_duzeltilir`: Tüm işlemler tek bir havuz hesaba gider, ay sonunda muhasebeci mahsupla doğru hesaplara dağıtır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Hesap Tayini Motoru (Automatic Account Determination Matrix) tasarımını belirler.

#### [ACC-006] Oluşan bir muhasebe fişinden kaynak ticari belgeye (fatura, irsaliye, banka hareketi vb.) ve tersine doğrudan çift yönlü izlenebilirlik (Drill-Down) sağlanabiliyor mu?
- **Süreç:** Otomatik Muhasebe Entegrasyonu ve Hesap Tayini
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Yevmiye kaydı ile operasyonel belge arasındaki bağ ve denetim kolaylığı.
- **Seçenekler:**
  - `tam_cift_yonlu_canli_baglanti`: Evet, muhasebe fişinden tek tıkla orijinal faturaya/irsaliyeye; faturadan da oluşan muhasebe kaydına anında gidilebilir
  - `sadece_fis_aciklamasinda_belge_no_yazar`: Sistemde canlı link yoktur; fiş açıklama satırına fatura no yazılır, arama yapılarak manuel bulunur *(Not Alınabilir)*
  - `izlenebilirlik_yoktur_baglanti_kopuk`: Muhasebe fişi bağımsız oluşur, kaynak belge ile hiçbir sistemsel bağlantısı yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kaynak Belge - Yevmiye Belge Akışı (Document Flow / Drill-Down Traceability) altyapısını belirler.

---

### 4. Satıcı ve Müşteri Cari Muhasebesi

#### [ACC-007] Müşteri ve Tedarikçi cari hesapları ile Defteri Kebir (120 Alıcılar / 320 Satıcılar) hesapları arasındaki bağlantı nasıl kurgulanmıştır?
- **Süreç:** Satıcı ve Müşteri Cari Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Alt hesap bazında tek tek muhasebe hesabı açılması vs. Kontrol hesabı (Reconciliation Account / Yardımcı Defter) mantığı.
- **Seçenekler:**
  - `her_cari_icin_ayri_alt_muhasebe_kodu_acilir`: Her müşteri için 120.XX.XXXX, her tedarikçi için 320.XX.XXXX şeklinde ayrı birer muhasebe alt hesabı açılır *(Not Alınabilir)*
  - `kontrol_hesabi_ve_yardimci_defter_kullanilir`: Tüm müşteriler tek/birkaç ana 120 hesabına bağlıdır; detay bakiye yardımcı defterde (Subledger) cari kodla tutulur *(Not Alınabilir)*
  - `sadece_bolge_veya_grup_bazinda_muhasebe_hesabi`: Cariler grup veya bölge bazında toplu muhasebe hesaplarına bağlanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Cari-Muhasebe Entegrasyon Mimarisi (Direct Chart of Accounts Subaccounts vs. Subledger Reconciliation Account) seçimini belirler.

#### [ACC-008] Cari hesap bakiyeleri (Müşteri/Tedarikçi Modülü) ile Muhasebe Mizan bakiyeleri (120/320 Defteri Kebir) arasında fark/uyumsuzluk oluşmakta mıdır?
- **Süreç:** Satıcı ve Müşteri Cari Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Yardımcı defter ile büyük defter arasındaki tutarsızlık ve mutabakat sorunları.
- **Seçenekler:**
  - `asla_fark_olusmaz_sistem_tam_entegre`: Hayır, cari hareket ile muhasebe kaydı aynı anda oluşur; mizan ile cari bakiye daima %100 kuruşu kuruşuna eşittir
  - `zaman_zaman_manuel_kayitlar_yuzunden_fark_cikar`: Evet, muhasebeye carisiz doğrudan 120/320 fişi atıldığı için ay sonlarında cari-mizan mutabakatı yapmak gerekir *(Not Alınabilir)*
  - `surekli_fark_vardir_manuel_duzeltilir`: Cari modül ile muhasebe modülü ayrı çalıştığı için sürekli bakiye farkı çıkar, manuel mahsupla eşitlenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Cari-Muhasebe Senkronizasyonu ve Doğrudan Yevmiye Girişi Blokajı ihtiyacını belirler.

---

### 5. Masraf ve Gider Muhasebesi

#### [ACC-009] Gider hesapları yapınızda 7/A seçeneği (Fonksiyonel: 750 Üretim, 760 Pazarlama, 770 Genel Yönetim, 780 Finansman) mi yoksa 7/B seçeneği (Çeşit Esası) mi kullanılmaktadır?
- **Süreç:** Masraf ve Gider Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Türk Tekdüzen Hesap Planı gider muhasebesi standardı.
- **Seçenekler:**
  - `7a_secenegi_fonksiyonel_giderler`: 7/A seçeneği kullanılmaktadır (710/720/730 Üretim, 750 Ar-Ge, 760 Pazarlama, 770 Genel Yönetim, 780 Finansman)
  - `7b_secenegi_cesit_esasli_giderler`: 7/B seçeneği kullanılmaktadır (790 İlk Madde, 791 İşçi Ücret, 792 Memur Ücret, 793 Dışarıdan Sağlanan Fayda vb.)
  - `her_ikisi_birlikte_veya_ozel_kurgu`: Şirket türlerine göre karma yapı veya özel raporlama hesapları kullanılmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Gider Hesap Planı Yapılandırması ve Fonksiyonel Masraf Kırılımını belirler.

#### [ACC-010] Gider fişlerinde Masraf Merkezi (Cost Center), Departman veya Proje kodu seçilmesi zorunlu tutulmakta mıdır?
- **Süreç:** Masraf ve Gider Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Masraf merkezi dağıtımı ve gider bütçesi kontrolü.
- **Seçenekler:**
  - `tum_7li_hesaplarda_masraf_merkezi_zorunludur`: Evet, 7'li gider hesabı seçildiğinde masraf merkezi / departman seçilmeden fiş kaydedilemez
  - `opsiyoneldir_kullanici_isterse_secer`: Masraf merkezi alanı vardır ancak zorunlu değildir, çoğu kayıtta boş bırakılmaktadır *(Not Alınabilir)*
  - `masraf_merkezi_kullanilmiyor`: Sistemde masraf merkezi veya departman bazlı gider takibi yapılmamaktadır
  - `proje_bazli_takip_zorunludur`: Departman yerine her gider kaydında ilgili Müşteri/İç Proje Kodu seçilmesi zorunludur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Alan Durum Mantığı (Field Status Groups / Mandatory Cost Center Assignment) kuralını belirler.

#### [ACC-011] Dönem sonlarında ortak genel giderlerin (kira, elektrik, yemek, yönetim giderleri) üretim ve ürün maliyetlerine dağıtım anahtarları ile dağıtımı yapılıyor mu?
- **Süreç:** Masraf ve Gider Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** İkincil maliyet dağıtımı ve yükleme katsayıları (Cost Allocation Cycles).
- **Seçenekler:**
  - `sistemde_tanimli_dagitim_anahtarlari_ile_otomatik`: Evet, m2, personel sayısı, makine saati gibi dağıtım anahtarlarıyla sistem genel giderleri otomatik paylaştırır *(Not Alınabilir)*
  - `excelde_hesaplanip_manuel_mahsupla_dagitilir`: Dağıtım Excel'de hesaplanır, ay sonunda muhasebeci manuel mahsup fişiyle giderleri yansıtır *(Not Alınabilir)*
  - `gider_dagitimi_yapilmaz_direkt_gider_yazilir`: Ortak giderler ürünlere dağıtılmaz, doğrudan dönem gideri olarak kapatılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Maliyet Muhasebesi Dağıtım Motoru (Cost Allocation & Assessment Engine) ihtiyacını belirler.

---

### 6. Vergi ve KDV Süreçleri Yönetimi

#### [ACC-012] KDV oranları (%1, %10, %20 vb.) ve KDV hesapları (191 İndirilecek, 391 Hesaplanan, 360 Ödenecek) sistemde nasıl eşleştirilmektedir?
- **Süreç:** Vergi ve KDV Süreçleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Vergi göstergeleri (Tax Codes) ve otomatik vergi matrah/tutar hesaplama.
- **Seçenekler:**
  - `vergi_kodlari_uzerinden_otomatik_hesaplanir_ve_ayrisir`: Sistemde her KDV oranı için vergi kodu tanımlıdır; fatura girilirken matrah ve KDV tutarı otomatik ayrışıp ilgili alt hesaba işlenir
  - `kullanici_kdv_hesabini_ve_tutarini_manuel_yazar`: Kullanıcı faturada veya fişte KDV satırını ve hesap kodunu manuel seçip tutarı elle yazar *(Not Alınabilir)*
  - `kdv_oranlarina_gore_ayri_hesap_tutulmaz_tek_hesap`: Tüm KDV'ler tek bir 191 ve tek bir 391 hesabında toplanır, oran kırılımı yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Vergi Kodu ve Otomatik Vergi Hesaplama Motoru (Tax Engine) konfigürasyonunu belirler.

#### [ACC-013] KDV İstisnası, İhraç Kayıtlı Satış (Tecil-Terkin), Dahilde İşleme İzin Belgesi (DİİB) veya İade Hakkı Doğuran İşlemleriniz var mı?
- **Süreç:** Vergi ve KDV Süreçleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Özel KDV istisna kodları, 192 Diğer KDV ve 392 Diğer KDV tecil hesapları.
- **Seçenekler:**
  - `evet_ihrac_kayitli_ve_istisna_kodlu_islemler_var`: Evet, ihraç kayıtlı teslimler (Tecil/Terkin), KDV istisna kodlu satışlar ve KDV iade süreçleri düzenli uygulanır *(Not Alınabilir)*
  - `sadece_standart_ihracat_kdv_istisnasi_var`: Sadece 301 İstisna Kodu ile standart yurtdışı mal ihracatı KDV muafiyeti uygulanır
  - `istisna_veya_tecil_terkin_islemi_yoktur`: Tüm işlemlerimiz standart oranlı yurtiçi işlemlerdir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** KDV İstisna Kodları, Beyanname Ekleri ve Tecil/Terkin Muhasebe Akışını belirler.

---

### 7. Tevkifat ve Stopaj Süreçleri

#### [ACC-014] Satış veya satınalma faturalarınızda Kısmi KDV Tevkifatı (2/10, 3/10, 5/10, 7/10, 9/10 vb.) uygulanmakta mıdır?
- **Süreç:** Tevkifat ve Stopaj Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tevkifatlı fatura düzenleme, tevkifatlı satınalma faturası kabulü ve KDV-2 beyannamesi.
- **Seçenekler:**
  - `hem_satista_hem_satinalmada_tevkifat_var`: Evet, hem müşterilere kestiğimiz hem tedarikçilerden gelen faturalarda düzenli tevkifat uygulanır *(Not Alınabilir)*
  - `sadece_satinalma_gider_faturalarinda_tevkifat_var`: Biz tevkifatlı fatura kesmeyiz; ancak servis, nakliye, işgücü gibi gider faturalarında tevkifat uygularız *(Not Alınabilir)*
  - `sadece_satista_tevkifatli_kesiyoruz`: Belirli kurumsal müşterilerimize kestiğimiz faturalarda tevkifat hesaplanır *(Not Alınabilir)*
  - `tevkifatli_islemimiz_bulunmamaktadir`: Hiçbir işlemimizde KDV tevkifatı uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** KDV Tevkifat Matrisi (Withholding VAT Rates & 2 Nolu KDV Integration) modülünü belirler.

#### [ACC-015] Tevkifatlı faturalarda tevkif edilen KDV tutarı ve satıcıya ödenecek net tutar sistemde otomatik muhasebeleşiyor mu?
- **Süreç:** Tevkifat ve Stopaj Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `ACC-014` != `tevkifatli_islemimiz_bulunmamaktadir`
- **Açıklama:** 360 Ödenecek KDV (KDV-2) ve tevkifat muhasebe satırlarının ayrışması.
- **Seçenekler:**
  - `sistem_tevkifati_otomatik_hesaplar_ve_360a_isler`: Evet, tevkifat kodu seçildiğinde sistem tevkif edilen kısmı 360 Sorumlu Sıfatıyla KDV hesabına, kalanı satıcıya otomatik ayırır
  - `muhasebe_kullanicisi_satirlari_manuel_hesaplar`: Fatura genel tutarı girilir, tevkifat ve 360 satırları kullanıcı tarafından elle hesaplanıp fişe yazılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Tevkifat Fiş Şablonları (Automated Withholding Tax Posting Rules) mimarisini belirler.

#### [ACC-016] Kira ödemeleri, Serbest Meslek Makbuzları (SMM) ve diğer hizmet alımlarında Stopaj (Gelir/Kurumlar Vergisi Kesintisi) nasıl yönetilmektedir?
- **Süreç:** Tevkifat ve Stopaj Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Muhtasar prim ve hizmet beyannamesi stopaj kesintileri (021, 022, 041 vb. kodlar).
- **Seçenekler:**
  - `smm_ve_kira_modulunden_stopaj_otomatik_muhasebelesir`: Evet, makbuz veya kira kaydı girildiğinde brüt tutar, net tutar ve %20 stopaj otomatik 360 hesabına işlenir *(Not Alınabilir)*
  - `manuel_mahsup_fisi_ile_hesaplanir`: Her ay kira ve SMM kayıtları Excel'de brütleştirilip manuel mahsup fişi olarak girilir *(Not Alınabilir)*
  - `stopajli_odememiz_bulunmamaktadir`: Stopaj doğuran kira veya serbest meslek ödememiz yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Stopaj Hesaplama ve Muhtasar Beyanname Veri Toplama Entegrasyonunu belirler.

---

### 8. e-Belge ve e-Defter Muhasebe Süreçleri

#### [ACC-017] e-Defter (Yevmiye ve Kebir Beratları) oluşturma, berat imzalama ve GİB portalına yükleme süreci nasıl yürütülmektedir?
- **Süreç:** e-Belge ve e-Defter Muhasebe Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** e-Defter uyumluluğu, fiş sınır kuralları ve yevmiye kapanış takvimi.
- **Seçenekler:**
  - `erp_icine_gomulu_e_defter_modulu_ile`: ERP içindeki e-Defter modülü yevmiye fişlerini standart XML şemasına göre doğrular, imzalar ve beratları hazırlar *(Not Alınabilir)*
  - `harici_ozel_entegrator_veya_yazilim_ile`: ERP'den yevmiye verisi Excel/dosya olarak alınıp harici bir e-Defter yazılımında beratlaştırılır *(Not Alınabilir)*
  - `dis_mali_musavir_ofisi_yurutur`: e-Defter berat işlemleri şirket dışında serbest muhasebeci mali müşavir tarafından yürütülür *(Not Alınabilir)*
  - `e_defter_mukellefi_degiliz`: e-Defter kullanıcısı değiliz, yasal kâğıt defter tutuyoruz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** GİB Uyumlu e-Defter Modülü (e-Ledger GİB Schema Standards) ihtiyacını belirler.

#### [ACC-018] e-Fatura ve e-Arşiv faturalarında oluşan iptal, red veya iade belgeleri muhasebe sistemine nasıl yansıtılmaktadır?
- **Süreç:** e-Belge ve e-Defter Muhasebe Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** İptal edilen e-faturaların yevmiye ters kaydı, iade faturası eşleşmesi.
- **Seçenekler:**
  - `entegrator_durumuna_gore_otomatik_ters_kayit`: e-Fatura iptal edildiğinde veya reddedildiğinde sistem ilgili yevmiye fişine otomatik ters kayıt atar veya taslağa çeker *(Not Alınabilir)*
  - `muhasebe_iptali_gorup_manuel_ters_fis_yazar`: Entegratörden iptal olduğu görülünce muhasebeci manuel ters mahsup fişi keser *(Not Alınabilir)*
  - `fatura_silinir_tekrar_kesilir`: Sistemde fatura kaydı silinir veya düzeltilip tekrar kaydedilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** e-Fatura Yaşam Döngüsü & Muhasebe Ters Kayıt Otomasyonunu belirler.

---

### 9. Dövizli İşlemler ve Kur Farkları Yönetimi

#### [ACC-019] Dövizli işlemlerinizde (müşteri, tedarikçi, banka hesapları) fatura kesim ve tahsilat/ödeme tarihindeki kur farkları nasıl hesaplanmaktadır?
- **Süreç:** Dövizli İşlemler ve Kur Farkları Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Gerçekleşmiş Kur Farkı (Realized FX Gain/Loss) ve otomatik kur farkı faturası/fişi.
- **Seçenekler:**
  - `odeme_ve_tahsilat_eslesmesinde_sistem_otomatik_hesaplar`: Sistem cari hareketleri eşleştirdiği (kapatma yaptığı) anda kur farkını otomatik hesaplar ve 646/656 hesaplarına işler *(Not Alınabilir)*
  - `ay_sonunda_excelde_hesaplanip_manuel_islenir`: Her tahsilatta hesaplanmaz; ay sonlarında cariler tek tek Excel'de hesaplanıp manuel kur farkı fişi girilir *(Not Alınabilir)*
  - `kur_farki_faturasi_kesildikce_islenir`: Sadece taraflar birbirine resmi kur farkı faturası kestiğinde muhasebeye işlenir, otomatik hesaplama yoktur *(Not Alınabilir)*
  - `dovizli_islemimiz_bulunmamaktadir`: Tüm operasyonlarımız yalnızca Türk Lirası (TL) üzerindendir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gerçekleşmiş Kur Farkı Otomatik Fişleme (Realized FX Engine) modülünü belirler.

#### [ACC-020] Ay sonlarında ve geçici vergi dönem sonlarında açık dövizli bakiyelerin değerlemesi (Gerçekleşmemiş Kur Farkı) nasıl yapılmaktadır?
- **Süreç:** Dövizli İşlemler ve Kur Farkları Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Koşul:** `ACC-019` != `dovizli_islemimiz_bulunmamaktadir`
- **Açıklama:** Dönem sonu döviz değerlemesi (Unrealized FX Revaluation / TCMB Döviz Alış Kuru).
- **Seçenekler:**
  - `sistem_tcmb_kurlariyla_toplu_degerleme_yapar`: Dönem sonunda tek tuşla tüm açık dövizli cari, banka ve kasa hesapları TCMB efektif/alış kurlarıyla değerlenir ve değerleme fişi oluşur
  - `muhasebeci_hesap_bazinda_manuel_mahsup_yapar`: Muhasebe personeli mizan döviz bakiyelerini hesaplayıp elle değerleme mahsubu girer *(Not Alınabilir)*
  - `donem_sonu_doviz_degerlemesi_yapilmaz`: Sadece yıl sonunda değerleme yapılır veya değerleme kaydı atılmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Dönem Sonu Dövizli Bakiye Değerleme Kokpiti (FX Revaluation Workbench) ihtiyacını belirler.

---

### 10. Dönemsellik, Tahakkuk ve Gelecek Aylara Ait Giderler

#### [ACC-021] Peşin ödenen yıllık giderler (sigorta, kasko, bakım, kira vb.) 180 Gelecek Aylara ve 280 Gelecek Yıllara Ait Giderler hesaplarına aktarılıp aylık itfa ediliyor mu?
- **Süreç:** Dönemsellik, Tahakkuk ve Gelecek Aylara Ait Giderler
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Gider dönemselliği ve aylık otomatik dağıtım takvimi.
- **Seçenekler:**
  - `sistemde_itfa_takvimi_tanimlanir_aylik_otomatik_dagitilir`: Evet, fatura girilirken dönemi (ör. 12 ay) belirtilir; sistem 180 hesabından ilgili 770 gider hesabına her ay otomatik virman yapar *(Not Alınabilir)*
  - `muhasebe_her_ay_manuel_mahsupla_giderlestirir`: Fatura 180'e atılır, muhasebeci her ay Excel tablosuna bakarak manuel mahsup fişi keser *(Not Alınabilir)*
  - `pesin_odenen_giderler_dogrudan_tek_seferde_giderlestirilir`: Dönemsellik ayrımı yapılmaz, fatura geldiği ay doğrudan tamamı gider yazılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gelecek Aylara Ait Giderler İtfa Dağıtım Motoru (Prepaid Expenses & Amortization Engine) gereksinimini belirler.

#### [ACC-022] Dönem sonunda henüz faturası gelmemiş ancak gerçekleşmiş giderler için Gider Tahakkuku (381 Gider Tahakkukları) kaydı yapılıyor mu?
- **Süreç:** Dönemsellik, Tahakkuk ve Gelecek Aylara Ait Giderler
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Elektrik, doğalgaz, nakliye gibi faturası sonraki ay gelen giderlerin tahakkuku.
- **Seçenekler:**
  - `duzenli_tahakkuk_fisi_kesilir_ve_sonraki_ay_ters_kayitla_kapatilir`: Evet, tahmini gider fişi kesilir; fatura geldiğinde ters kayıtla fatura eşleştirilir *(Not Alınabilir)*
  - `tahakkuk_yapilmaz_fatura_ne_zaman_gelirse_o_aya_islenir`: Tahakkuk kaydı atılmaz, fatura hangi ay gelirse o ayın giderine yazılır
  - `sadece_yil_sonlarinda_tahakkuk_yapilir`: Aylık yapılmaz, sadece yıl sonu bilançosu öncesinde kritik giderler için yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gider Tahakkuku ve Otomatik Ters Kayıt (Accrual & Reversal Workflow) tasarımını belirler.

---

### 11. Sabit Kıymet ve Amortisman Muhasebesi

#### [ACC-023] Duran varlık alımları (25'li grup) ve aylık/yıllık Amortisman (257 Birikmiş Amortisman) fişleri muhasebeye nasıl işlenmektedir?
- **Süreç:** Sabit Kıymet ve Amortisman Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sabit kıymet kartından otomatik amortisman fişi üretimi vs. Manuel muhasebe mahsubu.
- **Seçenekler:**
  - `sabit_kiymet_modulunden_otomatik_amortisman_fisi_olusur`: Sabit kıymet modülü faydalı ömre göre aylık amortisman tutarını hesaplar ve yevmiye fişini tek tuşla muhasebeye aktarır *(Not Alınabilir)*
  - `excelde_amortisman_tablosu_tutulur_manuel_mahsup_kesilir`: Sabit kıymetler Excel'de izlenir, amortisman tutarları hesaplanıp manuel mahsup fişi olarak girilir *(Not Alınabilir)*
  - `dis_mali_musavir_yil_sonunda_topluca_isler`: Amortisman kayıtları yıl sonunda dış mali müşavir tarafından topluca deftere işlenir *(Not Alınabilir)*
  - `sabit_kiymetimiz_bulunmamaktadir`: Şirket bünyesinde takip edilen sabit kıymet yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sabit Kıymet Muhasebe Entegrasyonu (Fixed Asset Subledger to General Ledger Link) gereksinimini belirler.

#### [ACC-024] Sabit kıymet satışlarında veya hurdaya ayırma işlemlerinde kâr/zarar (679/689) muhasebe kaydı nasıl oluşturulmaktadır?
- **Süreç:** Sabit Kıymet ve Amortisman Muhasebesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `ACC-023` != `sabit_kiymetimiz_bulunmamaktadir`
- **Açıklama:** Varlık çıkışında maliyet, birikmiş amortisman ve satış faturasının netleştirilmesi.
- **Seçenekler:**
  - `sistem_sabit_kiymet_cikis_fisinde_net_kar_zarari_otomatik_hesaplar`: Evet, satış faturası sabit kıymet kartıyla eşleştiğinde birikmiş amortismanı kapatır ve kâr/zararı otomatik yazar
  - `muhasebe_kullanicisi_manuel_mahsupla_kapatir`: Kullanıcı sabit kıymetin net defter değerini hesaplayıp manuel çıkış fişi düzenler *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sabit Kıymet Satış ve Hurda Muhasebeleştirme (Asset Disposal & Gain/Loss Posting) kurgusunu belirler.

---

### 12. Stok Muhasebesi ve Satılan Malın Maliyeti

#### [ACC-025] Stok hareketleri muhasebeye Sürekli Envanter (Her irsaliye/sevk hareketinde anlık stok-maliyet kaydı) yöntemiyle mi yoksa Dönem Sonu Envanteri ile mi yansıtılmaktadır?
- **Süreç:** Stok Muhasebesi ve Satılan Malın Maliyeti
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** 150/151/152/153 hesaplarının anlık çalışması vs. Dönem sonunda sayımla 620/621 STMM kaydı atılması.
- **Seçenekler:**
  - `surekli_envanter_her_malzeme_hareketinde_otomatik_kayit`: Sürekli Envanter; her mal kabulde 15'li stok hesabına borç, her sevkiyatta anlık STMM (620/621) ve stok çıkış kaydı oluşur
  - `donem_sonu_maliyetlendirme_ve_toplu_stmm_kaydi`: Günlük sevk kaydı atılmaz; ay/çeyrek sonunda fiili sayım ve maliyet hesaplamasıyla toplu STMM mahsup fişi kesilir *(Not Alınabilir)*
  - `stok_muhasebesi_harici_ofis_tarafindan_yil_sonunda_yapilir`: Stok kayıtları sistemde muhasebeleşmez, yıl sonunda mali müşavir tarafından genel kâr/zarara göre ayarlanır *(Not Alınabilir)*
  - `hizmet_sirketiyiz_stok_muhasebemiz_yoktur`: Hizmet firmasıyız, ticari mal veya hammadde stok muhasebemiz yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sürekli Envanter Muhasebe Motoru (Perpetual Inventory vs. Periodic Inventory Posting) mimarisini belirler.

#### [ACC-026] Mal kabulü yapılmış ancak faturası henüz gelmemiş satınalmalar (İrsaliyeli Mal Girişi) muhasebede nasıl izlenmektedir?
- **Süreç:** Stok Muhasebesi ve Satılan Malın Maliyeti
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `ACC-025` != `hizmet_sirketiyiz_stok_muhasebemiz_yoktur`
- **Açıklama:** GR/IR geçici takas hesapları (ör. 159 veya 381 Verilen Sipariş Avansları / Fatura Bekleyen Mal Girişleri).
- **Seçenekler:**
  - `gr_ir_gecici_hesabi_kullanilir_fatura_gelince_kapanir`: Mal kabul anında 150 Borç / 159/381 Fatura Bekleyen Mal Alımları Alacak kaydı atılır; fatura gelince bu geçici hesap 320 Satıcı ile kapanır *(Not Alınabilir)*
  - `irsaliye_asamasinda_muhasebe_kaydi_atilmaz`: İrsaliyeye muhasebe kaydı yapılmaz, yalnızca fatura geldiğinde doğrudan 150/320 kaydı işlenir
  - `faturasiz_mal_kabul_yapilmaz_fatura_sarttir`: Faturası gelmeyen hiçbir mal depoya kabul edilmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** GR/IR Takas Hesabı (Goods Receipt / Invoice Receipt Clearing Account) kurgusunu belirler.

---

### 13. Satın Alma Muhasebesi ve Fatura Eşleştirme

#### [ACC-027] Satın alma faturalarının muhasebeleşmesinden önce Sipariş - Mal Kabul - Fatura (3-Way Matching) kontrolü yapılıyor mu?
- **Süreç:** Satın Alma Muhasebesi ve Fatura Eşleştirme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Miktar ve fiyat farkı denetimi, tolerans limitleri ve onay blokajı.
- **Seçenekler:**
  - `sistem_siparis_ve_mal_kabulu_otomatik_karsilastirir_fark_varsa_bloke_eder`: Evet, sistem fatura tutarını ve miktarını onaylı sipariş ve teslimatla karşılaştırır; tolerans üstü fark varsa faturayı bloke eder *(Not Alınabilir)*
  - `muhasebe_personeli_kagit_irsaliye_ile_faturayi_manuel_karsilastirir`: Sistemde otomatik eşleşme yoktur, muhasebeci faturanın arkasındaki irsaliye çıktısını kontrol edip kaydeder *(Not Alınabilir)*
  - `siparis_veya_irsaliye_kontrolu_yapilmaz_onaylanan_fatura_islenir`: Yönetici faturayı onaylamışsa sipariş/irsaliye kontrolü yapılmadan doğrudan muhasebeye işlenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satın Alma Fatura Doğrulama ve Eşleştirme (Invoice Verification & 3-Way Matching Engine) modülünü belirler.

#### [ACC-028] Satın alma faturası ile sipariş fiyatı arasındaki fiyat farkları veya sonradan gelen tedarikçi fiyat farkı faturaları muhasebeye nasıl yansıtılır?
- **Süreç:** Satın Alma Muhasebesi ve Fatura Eşleştirme
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Stok maliyetine yansıtma vs. 659/679 veya 770 doğrudan gider/gelir yazma.
- **Seçenekler:**
  - `stok_eldeyse_stok_maliyetine_yoksa_satilan_mal_maliyetine_yansitilir`: Sistem stok miktarını kontrol eder; mal depodaysa 150 stok maliyetine ekler, satılmışsa STMM'ye atar *(Not Alınabilir)*
  - `dogrudan_fiyat_farki_gider_hesabina_yazilir`: Stokla ilişkilendirilmez, doğrudan 659 Diğer Olağan Gider veya 770 gider hesabına atılır
  - `fiyat_farki_islemi_olmamaktadir`: Sipariş fiyatı dışında fatura kabul edilmez, fiyat farkı faturası alınmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fiyat Farkı Muhasebe Dağıtım Kuralları (Price Variance Posting & Material Ledger) altyapısını belirler.

---

### 14. Satış Muhasebesi ve Gelir Tahakkuku

#### [ACC-029] Satış faturalarının muhasebe kaydı hangi aşamada ve nasıl oluşturulmaktadır?
- **Süreç:** Satış Muhasebesi ve Gelir Tahakkuku
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Satış faturasının 600/601 Gelir, 391 KDV ve 120 Müşteri hesaplarına aktarımı.
- **Seçenekler:**
  - `fatura_onaylandigi_anda_sistemde_otomatik_muhasebelesir`: Fatura onaylandığı/kesildiği anda arka planda otomatik yevmiye fişi oluşur
  - `gun_sonunda_veya_toplu_entegrasyonla_muhasebelesir`: Faturalar gün boyunca kesilir, akşam veya belirlenen periyotla topluca muhasebeye aktarılır *(Not Alınabilir)*
  - `muhasebe_ekibi_faturalari_tek_tek_manuel_isler`: Satış sisteminden muhasebeye otomatik aktarım yoktur, muhasebe personeli elle fiş girer *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satış Faturası Muhasebe Tetikleyicisi (Billing Document to FI Real-time Integration) mimarisini belirler.

#### [ACC-030] Satış iskontoları (satır altı iskonto, fatura altı iskonto, ciro primi / yıl sonu iade faturası) muhasebede nasıl ayrıştırılmaktadır?
- **Süreç:** Satış Muhasebesi ve Gelir Tahakkuku
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Net gelir vs. 610 Satıştan İadeler, 611 Satış İskontoları ve 612 Diğer İndirimler hesap tayini.
- **Seçenekler:**
  - `iskonto_tutarlari_otomatik_611_hesabina_borc_yazilir`: Evet, fatura brüt tutarı 600'e, uygulanan indirimler 611 Satış İskontoları hesabına ayrı ayrı işlenir
  - `gelir_hesabina_dogrudan_net_tutar_yazilir`: İskonto ayrıştırılmaz, faturadaki net satış tutarı doğrudan 600 hesabına yazılır
  - `ciro_ve_donem_sonu_iskontolari_musteri_faturasiyla_islenir`: Dönem içi faturalar net kesilir; yıl sonu ciro primleri müşteriden gelen iskonto faturasıyla 611'e kaydedilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gelir İndirimleri ve İskonto Hesap Tayin Kurgusunu (Revenue Deductions & Discount Accounts) belirler.

---

### 15. Banka ve Kasa Muhasebe Entegrasyonu

#### [ACC-031] Banka hesap hareketleri (Gelen Havale/EFT, Gönderilen EFT, Kredi Kartı POS tahsilatı, Kredi ödemeleri) muhasebeye nasıl işlenmektedir?
- **Süreç:** Banka ve Kasa Muhasebe Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Banka hareketlerinin 102 Bankalar hesabı ve ilgili cari/masraf hesaplarına entegrasyonu.
- **Seçenekler:**
  - `banka_online_ekstre_mt940_api_ile_otomatik_muhasebelesir`: Banka hareketleri API veya MT940 formatıyla sisteme akar, müşteri cari eşleştirmesi yapılarak otomatik fiş oluşur *(Not Alınabilir)*
  - `excel_ekstresi_sisteme_yuklenerek_toplu_muhasebelesir`: Bankadan indirilen Excel ekstresi sisteme yüklenir, kurallara göre toplu mahsup fişleri üretilir *(Not Alınabilir)*
  - `muhasebe_ekibi_banka_ekstresine_bakarak_manuel_fis_girer`: Muhasebe personeli internet bankacılığı ekstresini açıp satır satır manuel fiş girer
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Ekstre Entegratörü (Bank Statement Parser / MT940 / Open Banking API) kapsamını belirler.

#### [ACC-032] Nakit Kasa (100 Kasa) hareketleri, avans kapatmaları ve kasa sayım mutabakatları nasıl yürütülmektedir?
- **Süreç:** Banka ve Kasa Muhasebe Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Şube/merkez kasaları, günlük kasa defteri ve kasa limit kontrolleri.
- **Seçenekler:**
  - `kasa_modulunden_tahsil_tediye_makbuzuyla_gunluk_kapatilir`: Her kasa hareketi makbuzla kaydedilir, gün sonunda sistem kasa bakiyesi fiili nakitle eşleştirilip yevmiyeye aktarılır
  - `harcamalar_toplu_masraf_fisi_olarak_girilir`: Nakit ödemeler biriktirilir, haftalık/aylık toplu masraf mahsubu kesilir *(Not Alınabilir)*
  - `sirketimizde_nakit_kasa_kullanilmamaktadir`: Tüm ödeme ve tahsilatlar banka üzerinden yürütülür, nakit kasa yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kasa Yönetimi ve Günlük Kasa Kapanış Kontrolü (Cash Desk Management) gereksinimini belirler.

---

### 16. Mutabakat Süreçleri

#### [ACC-033] Müşteri ve Tedarikçi cari hesap mutabakatları (BA/BS, Bakiye Mutabakatı, e-Mutabakat) nasıl yürütülmektedir?
- **Süreç:** Mutabakat Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Düzenli cari hesap mutabakatı, e-Mutabakat portalları ve uyuşmazlık çözümü.
- **Seçenekler:**
  - `sistemden_entegre_e_mutabakat_otomasyonu_ile`: Sistem tek tıkla carilere otomatik e-Mutabakat (BA/BS ve Bakiye) mektubu gönderir, onay/red yanıtları sisteme otomatik yansır *(Not Alınabilir)*
  - `excel_ekstresi_e_posta_ile_gonderilerek_manuel_yapilir`: Cari ekstreler Excel/PDF olarak e-posta atılır, telefonla aranarak mutabakat aranır
  - `sadece_yil_sonlarinda_resmi_yazi_ile`: Aylık mutabakat yapılmaz, sadece yıl sonu bilançosu için ıslak imzalı mektup gönderilir
  - `mutabakat_sureci_yurutulmemektedir`: Carilerle düzenli mutabakat yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** e-Mutabakat Entegrasyonu (Electronic Reconciliation Workflow) ihtiyacını belirler.

#### [ACC-034] Banka hesapları ile muhasebe 102 kayıtları arasında Banka Mutabakatı (Bank Reconciliation) ne sıklıkla ve nasıl yapılır?
- **Süreç:** Mutabakat Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Yoldaki çekler, bekleyen virmanlar ve banka masraflarının mutabakatı.
- **Seçenekler:**
  - `gunluk_otomatik_banka_mutabakati`: Sistem banka hareketleri ile muhasebe fişlerini günlük otomatik eşleştirir, açık kalan farkları raporlar *(Not Alınabilir)*
  - `ay_sonunda_manuel_ekstre_karsilastirmasi`: Ay sonunda muhasebeci banka ekstresi ile mizan 102 muavinini karşılaştırıp açık kalemleri bulur *(Not Alınabilir)*
  - `duzenli_banka_mutabakati_yapilmaz`: Banka mutabakatı yapılmaz, sadece yıl sonunda bakiyeye bakılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Otomatik Eşleştirme ve Mutabakat (Bank Reconciliation Statement) modülünü belirler.

---

### 17. Dönem Sonu ve Mali Kapanış

#### [ACC-035] Ay sonu ve yıl sonu Mali Kapanış süreci tanımlı bir Kapanış Kontrol Listesi (Closing Checklist) ile mi yürütülmektedir?
- **Süreç:** Dönem Sonu ve Mali Kapanış
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Ön muhasebe, stok maliyeti, amortisman, kur değerleme, yansıtma ve kebir kapanış adımlarının sırası.
- **Seçenekler:**
  - `evet_sistemde_tanimli_adim_adim_kapanis_checklisti_var`: Evet, hangi kullanıcının hangi sıra ve tarihe kadar hangi işlemi tamamlayacağı sistemde tanımlıdır ve izlenir *(Not Alınabilir)*
  - `kullanicilarin_hafizasinda_ve_excelde_takip_edilir`: Yazılı bir akış vardır ancak Excel tablosunda manuel takip edilir
  - `standart_bir_kapanis_listesi_yoktur_isler_geldikce_kapatilir`: Belirli bir kapanış prosedürü yoktur, işlemler tamamlandıkça kapanış yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Mali Kapanış Kokpiti (Financial Closing Cockpit / Task Manager) ihtiyacını belirler.

#### [ACC-036] Aylık mali kapanış (tüm alt modüllerin kapatılıp kesin mizan ve gelir tablosunun alınması) ortalama kaç iş günü sürmektedir?
- **Süreç:** Dönem Sonu ve Mali Kapanış
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Finansal kapanış hızı ve operasyonel verimlilik.
- **Seçenekler:**
  - `hizli_kapanis_1_3_is_gunu`: Çok hızlı; ay bitiminden itibaren 1-3 iş günü içinde tüm mali tablolar hazırdır
  - `standart_kapanis_4_7_is_gunu`: Standart; ay bitiminden itibaren 4-7 iş günü sürer
  - `uzun_kapanis_8_15_is_gunu`: Uzun; KDV/Muhtasar beyanname gününe kadar (15-20 gün) kapanış işlemleri devam eder *(Not Alınabilir)*
  - `aylik_mali_kapanis_yapilmaz_sadece_gecici_vergi_donemleri`: Aylık kapanış yapılmaz, sadece 3 aylık geçici vergi dönemlerinde kapanış yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Muhasebe Süreç Optimizasyonu ve Otomasyon Önceliklerini belirler.

#### [ACC-037] Kapanmış bir muhasebe dönemine (ay veya yıl) geçmişe dönük kayıt girişi veya değişiklik yapılması sistemde engellenmekte midir?
- **Süreç:** Dönem Sonu ve Mali Kapanış
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Açıklama:** Dönem kilitleme (Period Locking / Posting Period Control).
- **Seçenekler:**
  - `kesin_donem_kilidi_var_yetkisiz_kimse_kayit_atamaz`: Evet, ay kapandığı anda muhasebe dönemi kilitlenir; Finans Direktörü onayı olmadan geçmişe tek bir kayıt dahi atılamaz
  - `modul_bazli_kilit_var_muhasebe_acik_kalir`: Ön modüller (fatura, stok) kilitlenir ancak muhasebe ekibi geçmişe fiş girmeye devam edebilir *(Not Alınabilir)*
  - `sistemde_donem_kilidi_yoktur_gecmise_serbestce_kayit_girilir`: Sistemde kısıt yoktur, kullanıcılar aylar öncesine dahi serbestçe kayıt atabilmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Muhasebe Dönem Kilitleme Mimarisi (Posting Period Control / Subledger vs. GL Period Locks) konfigürasyonunu belirler.

---

### 18. Denetim İzi ve Güvenlik

#### [ACC-038] Muhasebe fişlerinde ve hesap planında yapılan her türlü değişiklik, silme veya iptal işlemi tarih, saat ve kullanıcı bazında denetim iziyle (Audit Trail) kaydediliyor mu?
- **Süreç:** Denetim İzi ve Güvenlik
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Açıklama:** Fiş geçmişi loglama, kim değiştirdi, eski değer/yeni değer izlenebilirliği.
- **Seçenekler:**
  - `tam_denetim_izi_eski_ve_yeni_deger_loglanir`: Evet, fişin ilk oluşturanı, değiştireni, değiştirilen tutar/hesap ve değişiklik tarihi sistemde silinemez log olarak tutulur
  - `sadece_son_guncelleyen_kullanici_gorunur`: Detaylı değişiklik geçmişi yoktur, sadece kaydı en son güncelleyen kişi ve tarih görünür *(Not Alınabilir)*
  - `kayit_silinebilir_ve_iz_birakmaz`: Fişler sistemden tamamen silinebilir, geçmişe dönük denetim izi tutulmaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Değişiklik Günlüğü (Audit Trail / Change Log Table) ve İç Kontrol Güvenlik Seviyesini belirler.

#### [ACC-039] Kaydedilmiş ve yevmiye numarası almış bir muhasebe fişinin silinmesine izin veriliyor mu, yoksa düzeltme için Ters Kayıt (Storno / Reversal) zorunluluğu var mı?
- **Süreç:** Denetim İzi ve Güvenlik
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Yasal defter bütünlüğü ve fiş silme yasağı.
- **Seçenekler:**
  - `fis_silinemez_sadece_ters_kayitla_iptal_edilir`: Yevmiyeleşmiş fiş asla silinemez; düzeltme ancak sistemden Ters Kayıt (Storno) oluşturularak yapılabilir
  - `yetkili_kullanici_fisi_silebilir`: Yetkili yönetici veya muhasebe müdürü fişi doğrudan sistemden silebilir *(Not Alınabilir)*
  - `her_kullanici_kendi_fisini_silebilir`: Fişi giren kullanıcı istediği zaman fişi silebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fiş İptal Prosedürü (Storno Document / True Reversal Enforcement) kuralını belirler.

---

### 19. Finansal Raporlama ve Standartlar

#### [ACC-040] Şirketinizde ERP sisteminden doğrudan (Excel'de ek düzenleme gerektirmeden) hangi finansal raporlar alınabilmektedir?
- **Süreç:** Finansal Raporlama ve Standartlar
- **Tip:** `multiple_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Açıklama:** Temel mali tabloların sistemden anlık üretilebilirliği.
- **Seçenekler:**
  - `aylik_ve_yillik_mizan`: Aylık ve Yıllık Ayrıntılı Mizan (2/3/4/Büyük Defter Kırılımlı)
  - `resmi_bilanco`: Resmi Bilanço (VUK Formatında Aktif/Pasif Tablosu)
  - `resmi_gelir_tablosu`: Resmi Gelir Tablosu (Dönem Kâr/Zarar Özeti)
  - `masraf_merkezi_gider_raporu`: Masraf Merkezi / Departman Bazlı Gider Dağılım Raporu
  - `muavin_ve_hesap_ekstresi`: Muavin Defter ve Hesap Ekstreleri
  - `nakit_akim_tablosu`: Nakit Akım Tablosu (Cash Flow Statement) *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Standart Finansal Rapor Seti (Financial Statements Report Generator) tasarımını belirler.

#### [ACC-041] Yerel Vergi Mevzuatı (VUK) dışında UFRS/TFRS (Uluslararası Finansal Raporlama Standartları) veya Bağımsız Denetim amaçlı İkinci Bir Defter (Çift Defter / Parallel Ledger) tutuluyor mu?
- **Süreç:** Finansal Raporlama ve Standartlar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Çift defter mimarisi (VUK Defteri vs. IFRS / US GAAP Defteri) ve paralel değerleme.
- **Seçenekler:**
  - `evet_sistemde_es_zamanli_cift_defter_ufrs_tutulmaktadir`: Evet, her yevmiye kaydı hem VUK hem IFRS defterine kurallarına göre paralel işlenir *(Not Alınabilir)*
  - `vuk_disinda_rapor_icin_excelde_duzeltme_yapilir`: Sistemde tek defter (VUK) tutulur; UFRS raporları yıl sonunda bağımsız denetçiyle Excel'de hazırlanır *(Not Alınabilir)*
  - `sadece_vuk_defteri_tutulur_ufrs_ihtiyacimiz_yoktur`: Sadece yasal Türk Vergi Mevzuatı (VUK) defteri tutulur, çift defter ihtiyacı yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çoklu Defter Mimarisi (Parallel Accounting / Multi-GAAP Ledger) ihtiyacını belirler.

#### [ACC-042] Mali İşler ekibi tarafından Yönetim Kuruluna sunulan Yönetim Raporları ile Resmi Yasal Muhasebe Verileri arasında tutarsızlık yaşanıyor mu?
- **Süreç:** Finansal Raporlama ve Standartlar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Finansal muhasebe ile yönetim muhasebesi arasındaki tek doğruluk kaynağı (Single Source of Truth).
- **Seçenekler:**
  - `tek_dogruluk_kaynagi_tamamen_tutarlidir`: Hayır, tüm yönetim raporları doğrudan ERP muhasebe veritabanından çekilir, sıfır tutarsızlık vardır
  - `excelde_bircok_duzeltme_yapildigi_icin_zaman_zaman_fark_cikar`: Yönetim raporu Excel'de farklı varsayımlarla derlendiği için yasal bilançoyla sık sık rakamsal uyumsuzluk yaşanır *(Not Alınabilir)*
  - `yonetim_raporlamasi_yapilmamaktadir`: Resmi mizan dışında düzenli bir yönetim raporu hazırlanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yönetim Muhasebesi ve Finansal Kontrolör Kokpiti (Management Accounting / Controlling Bridge) ihtiyacını belirler.
