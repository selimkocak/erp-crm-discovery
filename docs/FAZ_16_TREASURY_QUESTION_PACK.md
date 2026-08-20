# FAZ-16 — Kasa ve Banka / TREASURY Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.treasury.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `TREASURY` (Kasa ve Banka)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, CFO'lar, Hazine Müdürleri, Finans Yöneticileri, Nakit Yönetimi Uzmanları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP implementasyonu öncesinde çoklu banka ve hesap organizasyonu, nakit kasa ve limit yönetimi, müşteri tahsilat kanalları (Havale/EFT/FAST, DBS, Sanal POS, Fiziki POS, Çek/Senet), tahsilat eşleştirme ve askı hesaplar, tedarikçi ödeme planlama ve erken ödeme iskontosu, görevler ayrılığı ilkesine dayalı ödeme onay yetkileri (Segregation of Duties / 4-Eyes Principle), MT940 / CAMT.053 / Açık Bankacılık (Open Banking) API ekstre entegrasyonu, toplu ödeme dosyaları (ISO 20022 / Banka Özel TXT), kredi kartı valör ve komisyon takibi, Türkiye pratiğinde çek ve senet portföy yaşam döngüsü (Ciro, Tahsil, Teminat, Karşılıksız/Protesto), çoklu dövizli nakit yönetimi ve arbitraj, anlık konsolide nakit pozisyonu, dinamik nakit akış tahmini (DSO, DPO, CCC, nakit açığı alarmları), banka kredi ve gayrinakdi teminat mektubu limitleri, banka masraf/komisyon denetimi ve banka mutabakat süreçlerinin AS-IS durumunu ve ERP tasarım gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | TREASURY ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **ACCOUNTING** | Yevmiye fişleri, Tekdüzen Hesap Planı (100/102/120/320 GL), yasal defterler, KDV tevkifatı, dönem sonu mali kapanış kontrol listesi | **Accounting banka hareketinin muhasebe fişini ve GL hesabını sorgular.** TREASURY ise paranın hangi banka hesabında olduğunu, fiilen ne zaman kullanılabilir olduğunu, ödeme onay yetkilerini, MT940/API entegrasyonuyla açık fatura tahsilat eşleştirmesini ve anlık likiditeyi sorgular. |
| **SALES** | Müşteri teklifleri, fiyatlandırma, satış siparişleri (SO), ticari iskontolar ve satış aşamasındaki müşteri kredi limiti | **SALES sipariş aşamasındaki ticari riski ve satış sürecini sorgular.** TREASURY fiili tahsilat kanallarını (Banka havalesi, DBS, Sanal POS, Mail Order), açık fatura eşleştirmesini ve vadesi geçen alacakların nakit akışına etkisini sorgular. |
| **PROCUREMENT** | Tedarikçi araştırması, satın alma talebi, sipariş (PO) onayları ve ticari anlaşmalar | **PROCUREMENT tedarikçi ticari şartlarını sorgular.** TREASURY tedarikçiye ödemenin ne zaman, hangi onay akışıyla, hangi bankadan toplu dosya (EFT/FAST) veya vadeli enstrümanla yapılacağını sorgular. |
| **INVENTORY** | Stok kartı, sayım, depo bakiye, konsinye stok ve malzeme transferleri | **INVENTORY stok miktarını ve operasyonunu sorgular.** TREASURY yalnızca açık siparişlerin ve stok alımlarının nakit akış tahminine olan likidite etkisini sorgular. |
| **LOGISTICS** | Araç yükleme, rota planlama, kargo/nakliye entegrasyonu, irsaliye ve teslimat takibi | **LOGISTICS sevkiyat operasyonunu sorgular.** TREASURY kapıda ödeme veya teslimat sonrası tahsilatların banka/kasa hesaplarına intikalini ve valörünü sorgular. |
| **BUDGET_REPORTING** | Yıllık/çeyreklik şirket bütçesi, gelir/gider bütçe gerçekleşen-sapma analizleri | **BUDGET_REPORTING yıllık stratejik bütçe hedefleri ve sapmaları sorgular.** TREASURY operasyonel kısa/orta vadeli (günlük/haftalık/aylık) fiili nakit giriş-çıkış projeksiyonunu ve nakit açığı/fazlası alarmlarını sorgular. |
| **TREASURY** | Banka hesapları, nakit kasa, tahsilat kanalları, ödeme planlama ve onay yetkileri, ekstre entegrasyonu, toplu ödeme, POS süreçleri, çek/senet portföyü, dövizli nakit, konsolide nakit pozisyonu, nakit akış tahmini, banka kredileri/limitleri, masraf denetimi, likidite riski ve banka mutabakatı | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular nakit operasyonları, bankacılık entegrasyonu, ödeme kontrolleri ve likidite yönetimi derinliğinde yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Banka Hesapları ve Organizasyonu** (2 Soru — TRS-001, TRS-002)
2. **Kasa Yönetimi** (2 Soru — TRS-003, TRS-004)
3. **Müşteri Tahsilatları** (2 Soru — TRS-005, TRS-006)
4. **Tedarikçi Ödemeleri** (2 Soru — TRS-007, TRS-008)
5. **Ödeme Planlama** (2 Soru — TRS-009, TRS-010)
6. **Ödeme Onay Süreçleri** (2 Soru — TRS-011, TRS-012)
7. **Banka Hareketleri ve Ekstre Entegrasyonu** (2 Soru — TRS-013, TRS-014)
8. **Havale / EFT / FAST / Toplu Ödeme** (2 Soru — TRS-015, TRS-016)
9. **Otomatik Tahsilat ve Sanal POS Bağlantıları** (2 Soru — TRS-017, TRS-018)
10. **Kredi Kartı / POS Süreçleri** (2 Soru — TRS-019, TRS-020)
11. **Çek ve Senet Yönetimi** (4 Soru — TRS-021, TRS-022, TRS-023, TRS-024)
12. **Dövizli Nakit Yönetimi** (2 Soru — TRS-025, TRS-026)
13. **Nakit Pozisyonu** (2 Soru — TRS-027, TRS-028)
14. **Nakit Akış Tahmini** (3 Soru — TRS-029, TRS-030, TRS-031)
15. **Banka Kredileri ve Limitler** (3 Soru — TRS-032, TRS-033, TRS-034)
16. **Banka Masraf / Komisyon Yönetimi** (2 Soru — TRS-035, TRS-036)
17. **Likidite ve Finansal Risk** (2 Soru — TRS-037, TRS-038)
18. **Banka Mutabakatı** (2 Soru — TRS-039, TRS-040)
19. **Treasury Raporlama ve KPI** (2 Soru — TRS-041, TRS-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Banka Hesapları ve Organizasyonu

#### [TRS-001] Kaç farklı banka ile çalışılmaktadır ve banka hesaplarının (Vadesiz TL/Döviz, Vadeli, POS, Kredi) ERP içindeki tanımlama ve kodlama standardı nasıldır?
- **Süreç:** Banka Hesapları ve Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Banka şube, IBAN, hesap türü ve para birimi bazında hesap tanımlarının standartlaştırılması ve çoklu banka yönetimi.
- **Seçenekler:**
  - `cok_sayida_banka_standart_kodlama_ve_iban_bazli_tanim`: 5 ve üzeri banka ile çalışılmaktadır; tüm hesaplar IBAN, şube, döviz cinsi ve hesap türüne göre merkezi standart kodlama ile yönetilir
  - `orta_olcek_banka_standart_kodlama`: 2-4 banka ile çalışılmaktadır; hesaplar ERP'de banka ve hesap türü bazında ayrı ayrı tanımlıdır
  - `tek_banka_veya_sinirli_hesap`: Yalnızca 1-2 bankada sınırlı sayıda temel hesap kullanılmaktadır
  - `hesap_tanimlari_standart_degil_manuel_takip`: Banka hesap tanımları ERP'de dağınık ve standart dışıdır, hesap listesi Excel'de güncel tutulmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Banka Master Data mimarisini, IBAN format kontrollerini ve çoklu banka entegrasyon profilini belirler.

#### [TRS-002] Şirket, şube ve grup şirketleri bazında banka hesap yetkileri ve günlük banka bakiyelerinin ERP üzerinden konsolide izlenebilirliği nasıldır?
- **Süreç:** Banka Hesapları ve Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Çoklu tüzel kişilik ve şubeler arasında banka hesap bakiyelerinin merkezi veya ayrıştırılmış olarak izlenmesi.
- **Seçenekler:**
  - `tum_sirket_ve_subeler_tek_ekranda_anlik_konsolide_izlenir`: Tüm şirket, şube ve döviz hesap bakiyeleri tek bir merkezi hazine kokpitinden yetki bazlı anlık konsolide izlenir
  - `sirket_bazinda_ayri_ekranlardan_raporlanir`: Her şirket/şube kendi ERP ekranından izlenir; konsolide bakiye gün sonunda Excel ortamında birleştirilir *(Not Alınabilir)*
  - `erpden_degil_internet_bankaciligi_portallarindan_bakilir`: Günlük bakiyeler ERP'den değil, ilgili bankaların internet bankacılığı portallarına tek tek girilerek kontrol edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Multi-Company Hazine Yönetimi ve rol bazlı banka hesap yetkilendirme mimarisini belirler.

---

### 2. Kasa Yönetimi

#### [TRS-003] Şirketinizde fiziki nakit kasa (Merkez Kasa, Şube/Mağaza Kasası, Döviz Kasası, Masraf/Avans Kasası) kullanılıyor mu ve kasa yapısı nasıldır?
- **Süreç:** Kasa Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Fiziki nakit giriş-çıkışları, kasa türleri ve kasa sorumluluğu.
- **Seçenekler:**
  - `coklu_kasa_merkez_sube_doviz_ayri_sorumlular`: Evet; Merkez Kasa, Şube Kasaları, Döviz Kasaları ve Masraf Avans Kasası tanımlıdır; her kasanın zimmetli sorumlusu vardır
  - `tek_merkez_kasa_ve_masraf_kasasi`: Evet; sadece merkez ofiste tek bir ana nakit kasa ve küçük harcamalar için masraf avans kasası kullanılır
  - `sadece_kucuk_masraf_kasasi_petty_cash`: Ticari nakit tahsilat/ödeme yoktur; yalnızca ufak ofis giderleri için küçük harcama kasası (Petty Cash) tutulur
  - `nakit_kasa_kullanilmamaktadir`: Hayır; tüm tahsilat ve ödemeler bankacılık kanallarıyla yürütülür, fiziki nakit kasa kullanılmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kasa Modülü kapsamını, fiziki kasa master verisini ve alt soru branching akışını belirler.

#### [TRS-004] Fiziki kasalarda azami nakit bakiye limitleri, günlük kasa sayım/kapanış tutanakları ve kasa açık/fazla kontrolleri nasıl yönetilmektedir?
- **Süreç:** Kasa Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `TRS-003 != "nakit_kasa_kullanilmamaktadir"`
- **Açıklama:** Kasa iç kontrolü, nakit bakiye tavanı ve gün sonu fiili sayım mutabakatı.
- **Seçenekler:**
  - `gunluk_sayim_tutanagi_ve_sistem_tavan_limiti_kontrolu`: Her gün sonu fiziki sayım yapılıp tutanakla kapatılır; sistemde tanımlı tavan nakit limiti aşıldığında bankaya yatırma zorunluluğu vardır
  - `gunluk_kapanis_yapilir_ancak_limit_kontrolu_manuel`: Günlük sayım ve fiş kapatması yapılır; ancak kasa tavan bakiye kontrolü sistemsel değil manuel yürütülür
  - `periyodik_veya_ay_sonu_sayim_yapilir`: Günlük tutanak tutulmaz; haftalık veya ay sonlarında kasa sayımı yapılarak bakiye mutabakatı sağlanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gün sonu kasa kapama zorunluluğu (Cash Desk Day-End Closing) ve kasa açık/fazla hesap kurgusunu belirler.

---

### 3. Müşteri Tahsilatları

#### [TRS-005] Müşteri tahsilatları hangi kanallarla (Banka Havalesi/EFT/FAST, Doğrudan Borçlandırma Sistemi - DBS, Sanal POS, Fiziki POS, Çek/Senet, Nakit) tahsil edilmektedir?
- **Süreç:** Müşteri Tahsilatları
- **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Nakit giriş kanallarının dağılımı ve operasyonel çeşitliliği.
- **Seçenekler:**
  - `banka_havale_eft_fast`: Banka Havalesi / EFT / FAST
  - `dogrudan_borclandirma_sistemi_dbs`: Doğrudan Borçlandırma Sistemi (DBS / ATS)
  - `sanal_pos_b2b_b2c_portal`: Sanal POS (Web Sitesi / B2B Bayi Tahsilat Portalı)
  - `fiziki_pos_ve_kredi_karti`: Fiziki POS ve Mail Order Kredi Kartı
  - `musteri_ceki_ve_senet`: Müşteri Çeki ve Senet
  - `nakit_tahsilat`: Elden Nakit Tahsilat
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Tahsilat kanalları mimarisini, ödeme geçitleri (Payment Gateways) ve DBS entegrasyon gereksinimini belirler.

#### [TRS-006] Banka hesaplarına gelen müşteri tahsilatları, açık faturalar ve müşteri cari hesapları ile nasıl eşleştirilmektedir (Eşleştirme Referansı / Algoritması)?
- **Süreç:** Müşteri Tahsilatları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Gelen paranın doğru müşteri, sipariş veya fatura ile eşleştirilme mekanizması.
- **Seçenekler:**
  - `otomatik_vkn_fatura_no_veya_siparis_kodu_ile_eslesir`: Ekstre açıklamasındaki VKN/TCKN, Fatura No veya Sipariş Kodu algoritma ile okunur ve açık fatura otomatik kapatılır
  - `cari_otomatik_bulunur_acik_fatura_fifo_veya_manuel_kapatilir`: Müşteri cari hesabı VKN/IBAN ile otomatik bulunur; ancak açık fatura kapatması FIFO esasına göre veya kullanıcı tarafından manuel yapılır
  - `tamamen_manuel_ekstre_kontrolu_ve_cari_eslestirme`: Finans personeli banka hareketini inceler, müşteriyi tespit eder ve cari tahsilat kaydını elle açar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Tahsilat Eşleştirme Motoru (Automatic Clearing Engine) ve açık kalem kapama kurallarını belirler.

---

### 4. Tedarikçi Ödemeleri

#### [TRS-007] Tedarikçi ve hizmet satıcılarına yapılacak ödemelerin periyodu ve ödeme yöntemi dağılımı (Haftalık ödeme günü, EFT/Havale, Çek keşidesi, DBS) nasıldır?
- **Süreç:** Tedarikçi Ödemeleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi ödeme periyotları, nakit çıkış ritmi ve kullanılan ödeme araçları.
- **Seçenekler:**
  - `sabit_haftalik_odeme_gunu_toplu_eft_havale`: Haftanın belirlenen sabit gününde (örn. Cuma) vadesi gelen tüm borçlar için toplu banka EFT/Havale çalıştırılır
  - `karma_yontem_nakit_eft_cek_ve_tedarikci_dbs`: Tedarikçi anlaşmasına göre vadeli çek keşidesi, tedarikçi DBS'si ve banka havalesi karma olarak kullanılır *(Not Alınabilir)*
  - `fatura_vadesi_geldikce_gunluk_tekil_odeme`: Belirli bir ödeme günü yoktur; faturanın vadesi doldukça günlük olarak tek tek ödeme yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Ödeme Programı (Automatic Payment Run / F110) periyodu ve çalışma frekansını belirler.

#### [TRS-008] Tedarikçi fatura vadeleri ve erken ödeme / nakit iskonto (Cash Discount) fırsatları finansal olarak nasıl takip edilmekte ve değerlendirilmektedir?
- **Süreç:** Tedarikçi Ödemeleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Erken ödeme iskontolarının nakit getirisi ve vade optimizasyonu.
- **Seçenekler:**
  - `erp_erken_odeme_iskonto_firsatlarini_ve_vade_getirisini_otomatik_onerir`: ERP, erken ödeme nakit iskontosu sağlayan faturaları tespit eder ve finansal getiriye göre ödeme listesinde önceliklendirir
  - `finans_ekibi_manuel_degerlendirir_ve_yonetime_sunar`: İskonto teklifleri finans ekibi tarafından manuel hesaplanır; nakit durumuna göre yönetim onayıyla erken ödenir *(Not Alınabilir)*
  - `erken_odeme_yapilmaz_kesin_fatura_vadesi_beklenir`: Erken ödeme iskontosu uygulanmaz; ödemeler daima sözleşmedeki net vade tarihinde gerçekleştirilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Erken Ödeme İskontosu Hesaplama ve Vade Optimizasyonu algoritmasını belirler.

---

### 5. Ödeme Planlama

#### [TRS-009] Haftalık veya aylık tedarikçi ödeme listesi (Payment Proposal / Ödeme Öneri Listesi) nasıl hazırlanmakta ve vadesi gelen borçlar nasıl önceliklendirilmektedir?
- **Süreç:** Ödeme Planlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Ödeme teklif listesinin otomatik oluşturulması, blokajlar ve kritik tedarikçi önceliklendirmesi.
- **Seçenekler:**
  - `erp_oneri_listesi_otomatik_olusturur_kullanici_revize_eder`: ERP, vadesi gelen onaylı faturalardan otomatik ödeme öneri listesi oluşturur; treasury uzmanı nakit durumuna göre revize eder
  - `excel_uzerinde_manuel_odeme_listesi_hazirlanir`: Muhasebeden açık fatura listesi çekilir; Excel tablosunda manuel elenerek haftalık ödeme listesi hazırlanır *(Not Alınabilir)*
  - `tedarikci_aramasi_ve_baski_durumuna_gore_anlik_odeme_listesi`: Sistematik planlama listesi yoktur; arayan ve teslimatı durduran kritik tedarikçilere öncelik verilerek liste oluşturulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Ödeme Öneri Motoru (Payment Proposal Engine) ve ödeme blokajı (Payment Block) mekanizmasını belirler.

#### [TRS-010] Nakit sıkışıklığı veya likidite kısıtı durumunda tedarikçi ödemelerinin kısmi ödenmesi, ötelenmesi veya vadeli enstrümanlara (çek vb.) dönüştürülmesi kararı nasıl verilmektedir?
- **Süreç:** Ödeme Planlama
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Ödeme erteleme, kısmi tahsis ve vadeli ödeme kararlarının yönetimi.
- **Seçenekler:**
  - `erp_nakit_simulasyonu_ve_tedarikci_oncelik_puanina_gore_karar_verilir`: ERP nakit simülasyonu çalıştırılır; tedarikçi kritiklik skoru ve açık sipariş durumuna göre kısmi ödeme veya çek teklifi kararı verilir
  - `cfo_ve_yonetim_kurulu_tarafindan_manuel_belirlenir`: Finans Direktörü (CFO) veya Şirket Yönetimi listeyi inceleyerek kimlere ne kadar ödeneceğini manuel belirler *(Not Alınabilir)*
  - `tedarikcilerle_birebir_gorusulerek_vade_uzatimi_yapilir`: Satın alma birimi tedarikçilerle tek tek görüşerek ek vade veya çek kabulü konusunda mutabakat sağlar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Likidite Önceliklendirme ve Kısmi Ödeme Tahsis kurallarını belirler.

---

### 6. Ödeme Onay Süreçleri

#### [TRS-011] Tedarikçi ve masraf ödemelerinde Görevler Ayrılığı İlkesi (Segregation of Duties — Hazırlayan, Kontrol Eden, Onaylayan ve Bankadan Gönderen Yetkililer) nasıl işletilmektedir?
- **Süreç:** Ödeme Onay Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** İç kontrol, dolandırıcılık önleme ve ödeme sürecindeki rol ayrımı.
- **Seçenekler:**
  - `tam_gorevler_ayriligi_erp_ve_bankada_ayri_yetkililer`: Tam ayrılık vardır; listeyi hazırlayan uzman, onaylayan müdür ve bankadan transfer emrini veren/token sahibi kesinlikle farklı kişilerdir
  - `erp_onayi_var_ancak_banka_tokeni_tek_kiside`: ERP üzerinde hazırlama ve onay akışı vardır; ancak banka transfer yetkisi ve token tek bir imza yetkilisindedir *(Not Alınabilir)*
  - `gorevler_ayriligi_yok_ayni_kisi_hazirlayip_oder`: Görevler ayrılığı işletilmemektedir; finans/muhasebe yetkilisi listeyi hazırlayıp doğrudan bankadan ödemeyi gerçekleştirir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Finansal Yetki Matrisi ve Görevler Ayrılığı (SoD) iç kontrol mekanizmasını belirler.

#### [TRS-012] Ödeme onaylarında tutar bazlı hiyerarşik onay limitleri (Approval Limits) ve çift imza / çift onay yetki matrisi nasıl uygulanmaktadır?
- **Süreç:** Ödeme Onay Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tutar kademeleri, çift onay (4-eyes principle) ve yönetim onay eşikleri.
- **Seçenekler:**
  - `erp_sisteminde_tutar_kademeli_ve_cift_onay_matrisi_zorunludur`: Belirlenen tutar eşiklerine göre (örn. 250.000 TL üzeri Genel Müdür onayı, çift onay) ERP'de onaylanmadan banka ödeme dosyası üretilemez
  - `erpde_tek_onay_bankada_cift_imza_kullanilir`: ERP'de tek kademe onay verilir; ancak banka internet şubesinde şirket imza sirkülerine uygun çift onay (1. ve 2. imza) işletilir
  - `tutar_limiti_ve_cift_onay_kurali_yoktur`: Tutar bazlı limit veya çift onay mekanizması yoktur; tek yetkili tüm ödemeleri serbest bırakabilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Ödeme Onay İş Akışı (Payment Approval Workflow) limit kademelerini belirler.

---

### 7. Banka Hareketleri ve Ekstre Entegrasyonu

#### [TRS-013] Banka hesap hareketleri (Ekstre / Hesap Özeti) ERP sistemine hangi teknolojik yöntemle aktarılmaktadır?
- **Süreç:** Banka Hareketleri ve Ekstre Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Açık bankacılık API, MT940, SFTP veya manuel ekstre aktarım altyapısı.
- **Seçenekler:**
  - `online_banka_api_veya_open_banking_ile_anlik_otomatik`: Banka Açık Bankacılık (Open Banking) API entegrasyonu ile hareketler ERP'ye anlık/gün içi otomatik akar
  - `mt940_veya_camt053_sftp_ile_gunluk_otomatik`: Bankalardan her gece SFTP üzerinden gelen standart MT940 / CAMT.053 elektronik ekstre dosyaları ile otomatik yüklenir
  - `internet_subesinden_excel_csv_indirilip_ice_aktarilir`: Finans personeli her sabah internet bankacılığından Excel/CSV indirir ve ERP içe aktarma aracıyla sisteme yükler
  - `tamamen_manuel_ekstreye_bakilarak_satir_satir_islenir`: Elektronik dosya aktarımı yoktur; banka ekstresi ekrandan okunarak hareketler tek tek elle sisteme girilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Entegrasyon Protokolü (Open Banking API, SFTP, MT940 Parser) mimarisini belirler.

#### [TRS-014] Banka hareketlerinin (gelen havale, giden EFT, POS blokesi çözülmesi, kredi taksiti, masraf/faiz) cari, masraf ve finans hesaplarıyla otomatik eşleşme (Otomatik Mutabakat / Rule Engine) oranı nedir?
- **Süreç:** Banka Hareketleri ve Ekstre Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kural motoruyla hareketlerin otomatik tanınması ve manuel müdahale ihtiyacı.
- **Seçenekler:**
  - `yuksek_otomasyon_yuzde_85_uzeri_kural_motoru_ile_eslesir`: Gelişmiş kural motoru (IBAN, VKN, açıklama anahtar kelimeleri) sayesinde hareketlerin %85'ten fazlası kullanıcı onayı gerekmeden otomatik eşleşir
  - `orta_otomasyon_yuzde_50_85_arasi_kullanici_onayli`: Hareketlerin %50-%85'i sistem tarafından önerilir, kullanıcı tek tıkla onaylayarak eşleştirir
  - `dusuk_otomasyon_yuzde_50_alti_cogunlukla_manuel`: Kural motoru yetersizdir; hareketlerin yarısından fazlası kullanıcı tarafından manuel aranarak eşleştirilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Ekstre Kural Motoru (Statement Matching Rule Engine) konfigürasyonunu belirler.

---

### 8. Havale / EFT / FAST / Toplu Ödeme

#### [TRS-015] Onaylanan tedarikçi ve personel ödemeleri bankalara nasıl iletilmektedir (Toplu Ödeme Dosyası / Host-to-Host / API / Manuel Giriş)?
- **Süreç:** Havale / EFT / FAST / Toplu Ödeme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Banka ödeme talimatlarının transfer yöntemi ve entegrasyon seviyesi.
- **Seçenekler:**
  - `host_to_host_veya_banka_api_ile_tek_tikla_gonderilir`: ERP'den bankaya doğrudan Host-to-Host (SFTP) veya API ile gönderilir; onaylanan ödemeler otomatik banka emrine dönüşür
  - `standart_banka_odeme_dosyasi_iso20022_txt_yuklenir`: ERP'den bankanın istediği formatta toplu ödeme dosyası (ISO 20022 XML / Banka Özel TXT-Excel) üretilir ve internet şubesine yüklenir
  - `internet_subesinden_tek_tek_manuel_girilir`: Dosya transferi kullanılmaz; finans personeli banka internet şubesine girip her alıcı için tek tek EFT/Havale talimatı oluşturur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Toplu Ödeme Dosyası Oluşturucu (Bulk Payment File Generator / ISO 20022) formatlarını belirler.

#### [TRS-016] Acil ödemeler, 7/24 FAST transferleri ve tekil para transferi talimatlarının ERP üzerinde kaydı ve onay süreci nasıl yürütülmektedir?
- **Süreç:** Havale / EFT / FAST / Toplu Ödeme
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Plan dışı acil nakit çıkışları, FAST limitleri ve sonradan belge eşleştirme kontrolleri.
- **Seçenekler:**
  - `erp_uzerinden_acil_onay_akisi_ile_fast_emri_verilir`: ERP üzerinde mobil onaylı acil ödeme akışı çalıştırılır, FAST emri sistem üzerinden kayıt altına alınarak gönderilir
  - `bankadan_manuel_gonderilir_ayni_gun_erpye_kaydi_girilir`: Yetkili banka mobil/web şubesinden acil FAST yapar; dekont aynı gün içinde ERP'ye işlenip fatura/masraf ile kapatılır
  - `ekstre_gelene_kadar_kayitsiz_kalir_sonradan_arastirilir`: Acil ödemeler anında sisteme girilmez; banka ekstresi geldiğinde fark edilip kaynağı araştırılarak kapatılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Anlık Ödeme & FAST Entegrasyonu ve acil ödeme kayıt disiplinini belirler.

---

### 9. Otomatik Tahsilat ve Sanal POS Bağlantıları

#### [TRS-017] Müşterilerden doğrudan tahsilat için Doğrudan Borçlandırma Sistemi (DBS), Sanal POS veya Bayi Tahsilat Portalı kullanılıyor mu?
- **Süreç:** Otomatik Tahsilat ve Sanal POS Bağlantıları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Otomatik tahsilat altyapıları, banka DBS limitleri ve Sanal POS entegrasyonu.
- **Seçenekler:**
  - `hem_dbs_hem_sanal_pos_b2b_aktif_kullanilir`: Evet; hem banka Doğrudan Borçlandırma Sistemi (DBS) hem de B2B/B2C Sanal POS tahsilat altyapısı aktif olarak kullanılmaktadır
  - `sadece_dbs_kullanilmaktadir`: Evet; bayi ve distribütör tahsilatları için yalnızca banka DBS (Doğrudan Borçlandırma) sistemi kullanılır
  - `sadece_sanal_pos_b2b_b2c_kullanilmaktadir`: Evet; kredi kartı ile tahsilat için Sanal POS ve online ödeme geçidi (Payment Gateway) kullanılır
  - `sanal_pos_veya_otomatik_tahsilat_yoktur`: Hayır; DBS veya Sanal POS kullanılmamaktadır; tüm tahsilatlar klasik havale veya çek ile yürütülür
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka DBS entegrasyonu ve B2B Ödeme Portalı entegrasyon mimarisini belirler.

#### [TRS-018] Sanal POS veya DBS tahsilatlarında işlem komisyon oranları, taksit maliyetleri ve banka hesap entegrasyonu ERP'de nasıl yönetilmektedir?
- **Süreç:** Otomatik Tahsilat ve Sanal POS Bağlantıları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `TRS-017 != "sanal_pos_veya_otomatik_tahsilat_yoktur"`
- **Açıklama:** Komisyon kesintilerinin net tahsilat tutarından ayrıştırılması ve ERP mutabakatı.
- **Seçenekler:**
  - `komisyon_otomatik_ayrisir_net_tutar_bankaya_brut_musteriye_islenir`: ERP/Ödeme Entegratörü brüt tahsilatı müşteri cariye, kesilen POS komisyonunu masrafa, net tutarı banka hesabına otomatik işler
  - `brut_tutar_islenir_komisyon_ay_sonu_toplu_fatura_ile_kaydedilir`: Tahsilat brüt tutar üzerinden kaydedilir; bankanın kestiği komisyonlar ay sonunda gelen dekont/fatura ile toplu muhasebeleştirilir
  - `komisyonlar_manuel_hesaplanip_ayri_mahsupla_girilir`: Otomatik ayrıştırma yoktur; her işlem veya gün sonu ekstresindeki komisyon tutarları elle girilerek düzeltilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sanal POS Komisyon Ayrıştırma ve Otomatik Gelir/Gider Kaydı kurgusunu belirler.

---

### 10. Kredi Kartı / POS Süreçleri

#### [TRS-019] Şirketinizde fiziki mağaza / saha tahsilatlarında Fiziki POS (Banka POS, Ortak POS, Mobil POS) cihazları kullanılıyor mu?
- **Süreç:** Kredi Kartı / POS Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Fiziki POS cihaz sayısı, banka dağılımı ve saha tahsilat operasyonu.
- **Seçenekler:**
  - `coklu_banka_fiziki_ve_mobil_pos_aktif_kullanilir`: Evet; mağazalarda ve saha satış ekiplerinde birden fazla bankaya ait fiziki ve mobil POS cihazları kullanılmaktadır
  - `tek_banka_veya_ortak_yazar_kasa_pos_kullanilir`: Evet; yalnızca merkezde/mağazada tek bir banka veya Ortak Yazar Kasa POS (ÖKC) kullanılır
  - `fiziki_pos_kullanilmiyor`: Hayır; fiziki POS kullanılmamaktadır (tamamen B2B havale, çek veya sanal tahsilat yürütülür)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fiziki POS Cihaz Entegrasyonu ve Gün Sonu (Z Raporu) eşleştirme gereksinimini belirler.

#### [TRS-020] POS cihazlarından geçen tahsilatların bloke gün süreleri (Valör Tarihi), komisyon kesintileri ve banka hesabına fiili net geçiş tarihleri nasıl izlenmektedir?
- **Süreç:** Kredi Kartı / POS Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `TRS-019 != "fiziki_pos_kullanilmiyor"`
- **Açıklama:** Bloke çözülme tarihleri (valör), nakit likiditeye dönüş zamanı ve POS mutabakatı.
- **Seçenekler:**
  - `erp_valor_ve_bloke_tarihlerini_otomatik_hesaplar_ve_nakit_akisa_alir`: ERP, banka sözleşmesindeki valör gününe (örn. T+28 gün veya ertesi gün komisyonlu) göre paranın hesaba geçeceği günü ve net tutarı otomatik hesaplar
  - `gunluk_pos_gun_sonu_ve_ekstre_karsilastirmasi_manuel_yapilir`: POS gün sonu slip toplamları ile banka ekstresine yansıyan tutarlar finans personeli tarafından Excel'de manuel karşılaştırılır *(Not Alınabilir)*
  - `valor_takibi_yapilmaz_para_hesaba_girdikce_kaydedilir`: Önceden valör ve bloke takibi yapılmaz; para banka hesabına yansıdığı gün tahsilat kaydı açılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kredi Kartı Valör Motoru (Value Date Calculation) ve bloke nakit takibini belirler.

---

### 11. Çek ve Senet Yönetimi

#### [TRS-021] Şirketinizin ticari operasyonlarında Müşteri Çeki, Kendi Çekimiz (Keşide Çek) veya Senet kullanılıyor mu?
- **Süreç:** Çek ve Senet Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kıymetli evrak ve vadeli ödeme araçlarının portföy büyüklüğü ve işlem hacmi.
- **Seçenekler:**
  - `hem_alinan_cek_hem_keside_cek_yogun_kullanilir`: Evet; hem müşterilerden alınan çekler hem de tedarikçilere keşide edilen kendi çeklerimiz yoğun şekilde kullanılmaktadır
  - `sadece_musteriden_alinan_cekler_kullanilir`: Evet; müşterilerden çek alınır, kendi keşide çekimiz kullanılmaz (alınan çekler ciro edilir veya bankaya tahsile verilir)
  - `cek_ve_senet_nadir_istisnai_kullanilir`: Evet; ancak çok nadir ve istisnai durumlarda teminat veya özel tahsilat amacıyla kullanılır *(Not Alınabilir)*
  - `cek_ve_senet_hic_kullanilmaz`: Hayır; şirketimizde çek ve senet kesinlikle kullanılmamaktadır (tamamen nakit/banka çalışılır)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Çek/Senet Portföy Yönetim Modülü kapsamını ve branching dallanmasını belirler.

#### [TRS-022] Alınan müşteri çeklerinin portföydeki yaşam döngüsü (Portföyde, Bankaya Tahsile Verildi, Bankaya Teminata Verildi, Tedarikçiye Ciro Edildi, İade) ERP'de nasıl takip edilmektedir?
- **Süreç:** Çek ve Senet Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `TRS-021 != "cek_ve_senet_hic_kullanilmaz"`
- **Açıklama:** Çek bordroları, statü değişiklikleri ve fiziki lokasyon takibi.
- **Seçenekler:**
  - `tam_bordro_ve_statu_takibi_erpde_anlik_izlenir`: Giriş, bankaya tahsil/teminat çıkışı, tedarikçiye ciro ve tahsilat adımları ERP çek bordroları ile statü bazında eksiksiz takip edilir
  - `giris_ve_cikis_kaydedilir_ancak_statu_degisimi_manuel`: Çekin girişi ve çıkışı ERP'ye kaydedilir; ancak bankadaki tahsil/teminat durumları ve takas akıbeti manuel takip edilir *(Not Alınabilir)*
  - `cek_kasasi_ve_portfoy_excelde_tutulur`: ERP'de çek modülü aktif kullanılmaz; çeklerin vadesi ve nerede olduğu Excel çek takip listesinde izlenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çek Bordroları ve Yaşam Döngüsü Durum Makineleri (Check State Machine) tasarımını belirler.

#### [TRS-023] Çeklerin vade dağılımı (Çek Yaşlandırma / Ortalama Vade), karşılıksız çıkan veya protesto olan çeklerin takibi ve müşteri riskine etkisi nasıl izlenmektedir?
- **Süreç:** Çek ve Senet Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `TRS-021 != "cek_ve_senet_hic_kullanilmaz"`
- **Açıklama:** Kıymetli evrak vade riski, karşılıksız çek ihbarları ve müşteri açık hesap riskine otomatik yansıma.
- **Seçenekler:**
  - `ortalama_vade_ve_karsiliksiz_riski_musteri_kredi_limitini_otomatik_etkiler`: Çeklerin ortalama vadesi sistemde anlık hesaplanır; karşılıksız çek durumu oluştuğunda müşterinin sipariş/sevkiyat onayı sistemce otomatik kilitlenir
  - `vade_dagilimi_gorulur_karsiliksiz_takibi_manuel_yapilir`: Çek vade listesi raporlanabilir; ancak karşılıksız çıkan çekler hukuk/finans tarafından manuel takip edilip cariye borç kaydedilir
  - `ortalama_vade_ve_risk_analizi_yapilamaz`: Sistemde ortalama vade veya karşılıksız çek risk analizi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çek Yaşlandırma ve Karşılıksız Çek Risk Entegrasyonunu belirler.

#### [TRS-024] Alınan ve verilen senetlerin (Borç ve Alacak Senetleri) vade, tahsilat, ciro ve yasal takip (protesto/icra) süreçleri nasıl yürütülmektedir?
- **Süreç:** Çek ve Senet Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `TRS-021 != "cek_ve_senet_hic_kullanilmaz"`
- **Açıklama:** Senet takibi, kefil bilgileri, protesto işlemleri ve tahsilat süreçleri.
- **Seçenekler:**
  - `senetler_ayri_senet_modulunde_tum_hukuki_asamalariyla_takip_edilir`: Senetler ERP senet modülünde kefil, vade, protesto ve icra takip aşamalarıyla eksiksiz yönetilir
  - `senet_sayisi_azdir_manuel_makbuz_ve_excel_ile_takip_edilir`: İşlem hacmi düşüktür; senetler kasada fiziki saklanır, tahsilatı manuel makbuz ve Excel üzerinden yürütülür *(Not Alınabilir)*
  - `senet_kullanilmamaktadir_yalnizca_cek_vardir`: Şirketimizde senet kullanılmaz; kıymetli evrak olarak sadece çek ile işlem yapılmaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Senet Modülü ve Yasal Takip Süreçleri konfigürasyonunu belirler.

---

### 12. Dövizli Nakit Yönetimi

#### [TRS-025] Şirketinizde döviz cinsinden (USD, EUR, GBP vb.) banka hesapları, dövizli tahsilat/ödeme veya döviz kredisi işlemleri bulunuyor mu?
- **Süreç:** Dövizli Nakit Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Çoklu para birimi nakit yönetimi, döviz hesapları ve döviz nakit akışı.
- **Seçenekler:**
  - `yogun_dovizli_hesaplar_ihracat_ithalat_ve_doviz_kredileri_var`: Evet; yoğun dövizli tahsilat/ödeme, çoklu para birimli banka hesapları, ihracat bedelleri ve döviz kredileri yönetilmektedir
  - `sinirli_dovizli_islemler_sadece_usd_eur_mevduat_var`: Evet; ancak sınırlı hacimde yalnızca temel USD ve EUR vadesiz hesapları kullanılmaktadır
  - `dovizli_banka_hesabimiz_ve_islemimiz_yoktur`: Hayır; tüm ticari ve finansal operasyonlar yalnızca Türk Lirası (TL) üzerinden yürütülmektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Multi-Currency Treasury mimarisini ve döviz pozisyon takip modülünü belirler.

#### [TRS-026] Döviz alış/satış (Arbitraj), forward/türev işlemler ve anlık döviz pozisyonu (Döviz Açık/Fazla Pozisyonu) treasury tarafında nasıl takip edilmektedir?
- **Süreç:** Dövizli Nakit Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `TRS-025 != "dovizli_banka_hesabimiz_ve_islemimiz_yoktur"`
- **Açıklama:** Kur riski, döviz pozisyon dengesi ve bankalar arası döviz alım-satım işlemleri.
- **Seçenekler:**
  - `anlik_doviz_pozisyonu_ve_kur_riski_erp_hazine_ekraninda_izlenir`: Tüm bankalardaki döviz varlıkları ve dövizli yükümlülükler tek ekranda net döviz pozisyonu (Açık/Fazla) olarak anlık izlenir
  - `doviz_pozisyonu_excel_tablolarinda_gunluk_hesaplanir`: Döviz hesap bakiyeleri ERP'den alınıp Excel tablosuna aktarılır; net pozisyon ve arbitraj ihtiyacı manuel hesaplanır *(Not Alınabilir)*
  - `doviz_pozisyon_takibi_yapilmaz_ihtiyac_oldukca_alim_satim_yapilir`: Net döviz pozisyonu hesaplanmaz; dövizli ödeme günü geldiğinde ihtiyaç duyulan tutar kadar piyasadan döviz alınır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Döviz Pozisyonu & Kur Riski Takip Ekranı (FX Exposure Cockpit) gereksinimini belirler.

---

### 13. Nakit Pozisyonu

#### [TRS-027] Şirketin günlük konsolide nakit pozisyonu (Tüm bankalardaki serbest nakit, blokeli nakit, kasalar ve anlık kullanılabilir likidite toplamı) nasıl hesaplanmakta ve raporlanmaktadır?
- **Süreç:** Nakit Pozisyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Bugün itibarıyla şirketin harcanabilir net nakit büyüklüğünün anlık tespiti.
- **Seçenekler:**
  - `erp_hazine_kokpiti_anlik_konsolide_serbest_nakit_gosterir`: ERP Hazine Kokpiti üzerinden tüm banka, kasa ve fonlardaki kullanılabilir serbest nakit ve blokeli tutarlar anlık konsolide görülür
  - `her_sabah_finans_uzmani_excelde_nakit_durum_raporu_hazirlar`: Finans personeli her sabah tüm banka ve kasaları kontrol ederek Excel'de Günlük Nakit Durum tablosu hazırlar ve yönetime iletir *(Not Alınabilir)*
  - `konsolide_nakit_pozisyonu_cikarilamaz_parcali_bilgi_vardir`: Şirketin toplamda ne kadar net kullanılabilir nakdi olduğu anlık görülemez; ihtiyaç oldukça banka hesaplarına tek tek bakılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Konsolide Hazine Kokpiti (Consolidated Daily Cash Position Dashboard) tasarımını belirler.

#### [TRS-028] Bankalarda bloke olan mevduatlar (kredi teminat blokeleri, POS blokeleri, teminat mektubu karşılıkları) ile serbest kullanılabilir nakit ayrımı nasıl yapılmaktadır?
- **Süreç:** Nakit Pozisyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kullanımı kısıtlı nakit varlıkların operasyonel likiditeden arındırılması.
- **Seçenekler:**
  - `sistem_blokeli_ve_serbest_bakiyeyi_otomatik_ayristirir`: ERP, kredi ve teminat karşılığı blokeli bakiyeleri serbest bakiyeden ayrı hesaplar; ödeme önerilerinde blokeli tutarı kullandırmaz
  - `blokeli_hesaplar_manuel_bilinir_ve_excelde_dusulur`: ERP hesap toplamını tek bakiye gösterir; hangi paranın blokeli olduğu finans uzmanının takibindedir ve Excel'de düşülür *(Not Alınabilir)*
  - `hesaplarimizda_herhangi_bir_bloke_bulunmamaktadir`: Şirketimizin banka hesaplarında teminat veya kredi kaynaklı herhangi bir bloke nakit bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Blokeli Bakiye Yönetimi ve Kullanılabilir Net Likidite Filtrelerini belirler.

---

### 14. Nakit Akış Tahmini

#### [TRS-029] Geleceğe dönük Dinamik Nakit Akış Tahmini (Haftalık / Aylık / 90 Günlük Cash Flow Forecast) yapılıyor mu ve hangi veri kaynaklarından beslenmektedir?
- **Süreç:** Nakit Akış Tahmini
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Nakit giriş ve çıkışlarının ileriye dönük simülasyonu ve tahmin ufku.
- **Seçenekler:**
  - `erp_dinamik_nakit_akis_motoru_tum_modullerden_beslenir`: Evet; ERP Dinamik Nakit Akış Modülü faturalar, çekler, siparişler, maaş, vergi ve kredi planlarından beslenerek haftalık/aylık projeksiyon üretir
  - `excel_uzerinde_haftalik_aylik_nakit_projeksiyonu_yapilir`: Evet; ancak ERP içinde değil, farklı departmanlardan toplanan verilerle Excel üzerinde manuel nakit akış modeli yürütülür *(Not Alınabilir)*
  - `yalnizca_kisa_vadeli_1_haftalik_tahmin_yapilabilmektedir`: Yalnızca önümüzdeki 1 haftalık acil ödeme ve tahsilat tahmini yapılabilir; orta/uzun vadeli nakit akış projeksiyonu yapılamaz
  - `nakit_akis_tahmini_yapilmamaktadir`: Geleceğe dönük nakit akış tahmini yapılmamaktadır; ödemeler anlık bakiye durumuna göre yönetilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Dinamik Nakit Akış Motoru (Dynamic Cash Flow Forecasting Engine) mimarisini belirler.

#### [TRS-030] Nakit akış projeksiyonunda beklenen müşteri tahsilatları, beklenen tedarikçi ödemeleri, personel maaşları, vergi/SGK ve kredi taksitleri nasıl modellenmektedir?
- **Süreç:** Nakit Akış Tahmini
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Sabit ve değişken nakit kalemlerinin tahminde ağırlıklandırılması.
- **Seçenekler:**
  - `tum_kalemler_fatura_vadesi_ve_odeme_takvimlerine_gore_otomatik_modellenir`: Ticari faturalar vadesine göre, maaş/vergi/kira gibi periyodik giderler takvime göre, kredi taksitleri amortisman tablosuna göre otomatik modellenir
  - `ticari_borc_alacak_sistemden_sabit_giderler_manuel_eklenir`: Faturalı borç ve alacaklar sistemden çekilir; maaş, SGK, vergi ve kredi gibi sabit giderler Excel'de manuel eklenir *(Not Alınabilir)*
  - `tahmin_sadece_tahmini_yuvarlak_rakamlarla_yapilir`: Kalem bazlı detaylı modelleme yoktur; geçmiş ayların ortalamalarına göre yaklaşık toplu bütçe tahminleri kullanılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Nakit Akış Veri Kaynakları Matrisi (Cash Flow Data Source Mapping) kurgusunu belirler.

#### [TRS-031] Henüz faturalaşmamış açık satın alma siparişleri (PO) ve açık satış siparişleri (SO) nakit akış tahminine dahil edilmekte midir?
- **Süreç:** Nakit Akış Tahmini
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Erken aşama taahhütlerin likidite projeksiyonuna etkisi.
- **Seçenekler:**
  - `onayli_acik_siparisler_teslimat_ve_odeme_vadelerine_gore_tahmine_dahildir`: Evet; onaylanmış açık siparişler planlanan teslim tarihi ve ödeme vadesi hesaplanarak nakit akış simülasyonuna dahil edilir
  - `sadece_acik_satinalma_siparisleri_dahil_edilir`: Yalnızca gelecekteki nakit çıkışını görmek için onaylı satın alma siparişleri dahil edilir; satış siparişleri faturalanmadan alınmaz
  - `acik_siparisler_alinmaz_yalnizca_kesilmis_faturalar_dahildir`: Hayır; sipariş aşamasındaki taahhütler dikkate alınmaz, yalnızca kesinleşmiş ve muhasebeleşmiş açık faturalar nakit akışına girer
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satın Alma ve Satış Modüllerinin Hazine Nakit Tahmin Entegrasyonu seviyesini belirler.

---

### 15. Banka Kredileri ve Limitler

#### [TRS-032] Şirketinizde banka nakdi kredileri (BCH, Rotatif, Spot, Taksitli Ticari Kredi, Eximbank) veya gayrinakdi kredi limitleri kullanılmakta mıdır?
- **Süreç:** Banka Kredileri ve Limitler
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Banka finansman enstrümanları, limit hacmi ve kredi kullanım yapısı.
- **Seçenekler:**
  - `hem_nakdi_krediler_hem_gayrinakdi_limitler_aktif_kullanilir`: Evet; rotatif/spot/taksitli nakdi krediler, Eximbank kredileri ve teminat mektubu gibi gayrinakdi limitler aktif kullanılır
  - `sadece_rotatif_veya_spot_kisa_vadeli_nakit_kredi_kullanilir`: Evet; yalnızca nakit ihtiyacı doğduğunda kullanılan kısa vadeli rotatif (BCH) veya spot krediler mevcuttur
  - `sadece_gayrinakdi_teminat_mektubu_limiti_kullanilir`: Nakdi kredi kullanılmaz; yalnızca ihaleler ve tedarikçi teminatları için gayrinakdi teminat mektubu limitleri kullanılır
  - `banka_kredisi_ve_kredi_limiti_kullanilmamaktadir`: Hayır; şirketimiz banka kredisi veya kredi limiti kullanmamaktadır (özkaynaklarla çalışılmaktadır)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Kredileri Modülü kapsamını ve branching dallanmasını belirler.

#### [TRS-033] Kullanılan banka kredilerinin geri ödeme planları (Anapara, Faiz, BSMV, Taksit Vadeleri) ve kredi faiz giderleri ERP'de nasıl takip edilmektedir?
- **Süreç:** Banka Kredileri ve Limitler
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `TRS-032 != "banka_kredisi_ve_kredi_limiti_kullanilmamaktadir"`
- **Açıklama:** Kredi itfa tabloları (amortization schedule), faiz tahakkukları ve taksit alarmları.
- **Seçenekler:**
  - `kredi_itfa_tablolari_erpde_tanimlidir_taksitler_otomatik_odeme_planina_girer`: Kredi itfa planı anapara/faiz/BSMV kırılımıyla ERP'de tanımlıdır; taksit vadeleri nakit akışına ve ödeme önerilerine otomatik yansır
  - `kredi_geri_odeme_tablosu_excelde_tutulur_taksit_gunu_manuel_odeme_yapilir`: Banka ödeme planı Excel'de takip edilir; taksit günü geldiğinde ilgili banka hesabına para aktarılıp manuel kapatılır *(Not Alınabilir)*
  - `kredi_takibi_muhasebe_fisleriyle_ay_sonlarinda_yapilir`: Gelecek taksitler takip edilmez; banka hesaptan faiz/anapara çektikçe ekstreden geriye dönük muhasebeleştirilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kredi Amortisman Takip Motoru ve Faiz Gider Tahakkuk entegrasyonunu belirler.

#### [TRS-034] Bankalar nezdindeki gayrinakdi limitler, verilen/alınan teminat mektupları (Geçici, Kesin, Avans) ve mektup komisyonları treasury tarafından nasıl izlenmektedir?
- **Süreç:** Banka Kredileri ve Limitler
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `TRS-032 != "banka_kredisi_ve_kredi_limiti_kullanilmamaktadir"`
- **Açıklama:** Teminat mektubu vadeleri, limit doluluk oranları, yenileme ve iade süreçleri.
- **Seçenekler:**
  - `teminat_mektubu_modulunde_limit_vade_ve_komisyonlar_eksiksiz_izlenir`: Banka bazında limit doluluğu, mektup vadeleri, muhatap kurum, mektup iadeleri ve dönemlik komisyon tahakkukları sistemde izlenir
  - `teminat_mektuplari_excel_listesiyle_ve_fiziki_dosyayla_takip_edilir`: Teminat mektubu fotokopileri ve vadeleri Excel tablosunda tutulur; komisyonlar geldikçe masrafa yazılır *(Not Alınabilir)*
  - `gayrinakdi_teminat_mektubu_islemi_bulunmamaktadir`: Şirketimizin bankalarda teminat mektubu veya gayrinakdi limit işlemi bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gayrinakdi Kredi & Teminat Mektupları Takip Modülü gereksinimini belirler.

---

### 16. Banka Masraf / Komisyon Yönetimi

#### [TRS-035] Bankaların kestiği EFT/havale masrafları, hesap işletim ücretleri, POS komisyonları ve kredi kullanım giderleri kontrol edilip banka sözleşme şartlarıyla karşılaştırılıyor mu?
- **Süreç:** Banka Masraf / Komisyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Banka giderlerinin denetimi, sözleşme tarife kontrolü ve maliyet azaltma.
- **Seçenekler:**
  - `sozlesme_oranlari_sistemde_tanimlidir_hatali_kesintiler_otomatik_tespit_edilir`: Bankalarla yapılan komisyon ve masraf sözleşmeleri sistemde kayıtlıdır; ekstredeki kesintiler bu oranlarla otomatik denetlenir
  - `finans_ekibi_ay_sonlarinda_ornekleme_ile_manuel_kontrol_eder`: Ay sonu ekstreleri incelenir; yüksek tutarlı POS komisyonu veya kredi masrafları sözleşmeyle manuel karşılaştırılır *(Not Alınabilir)*
  - `banka_masraflari_kontrol_edilmez_ekstredeki_tutar_dogrudan_masrafa_yazilir`: Banka masraf ve komisyonları için tarife kontrolü yapılmaz; bankanın kestiği tutar doğrudan genel gidere işlenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Masraf ve Komisyon Denetim Motoru (Bank Fee Audit) konfigürasyonunu belirler.

#### [TRS-036] Hatalı veya sözleşme oranlarının üzerinde kesilen banka masraf ve komisyonlarının tespiti, bankaya itirazı ve iade takibi süreci nasıl işletilmektedir?
- **Süreç:** Banka Masraf / Komisyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Haksız veya fazla kesintilerin iadesi ve finansal geri kazanım takibi.
- **Seçenekler:**
  - `itiraz_ve_iade_kayitlari_erpde_takip_edilir_iade_tutari_hesaba_alinarak_kapatilir`: Fazla kesintiler için bankaya itiraz kaydı açılır; iade gelen tutar ilgili masraf kalemiyle eşleştirilerek kapatılır
  - `finans_muduru_banka_temsilcisiyle_gorusur_iade_manuel_takip_edilir`: Banka portföy yöneticisi ile e-posta/telefonla görüşülür; iade edilen tutar ekstrede takip edilir *(Not Alınabilir)*
  - `itiraz_ve_iade_sureci_isletilmemektedir`: Kesilen masraflara yönelik herhangi bir itiraz veya iade takip süreci yürütülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Banka Masraf İtiraz ve İade Takip İş Akışı tasarımını belirler.

---

### 17. Likidite ve Finansal Risk

#### [TRS-037] Olası kısa vadeli nakit açıkları (Cash Shortage) sistem üzerinden önceden tespit edilebiliyor mu ve açığın kapatılması için hangi finansman aksiyonları devreye alınıyor?
- **Süreç:** Likidite ve Finansal Risk
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Nakit açığı erken uyarıları, kredi kullanımı veya tahsilat hızlandırma aksiyonları.
- **Seçenekler:**
  - `erp_erken_uyari_verir_rotatif_kredi_veya_cek_faktoring_tetiklenir`: Nakit açığı oluşacağı tarihten günler önce sistem uyarı verir; rotatif kredi kullanımı veya vadesi gelmemiş çeklerin iskonto/tahsili planlanır
  - `finans_ekibi_excelde_tahmin_eder_ve_odemeleri_oteler`: Nakit açığı Excel nakit tablosundan fark edilir; tedarikçi ödemeleri ötelenerek veya ortaklardan fon sağlanarak açık kapatılır *(Not Alınabilir)*
  - `nakit_acigi_gununde_fark_edilir_anlik_kriz_yonetimi_yapilir`: Önceden alarm mekanizması yoktur; ödeme günü hesapta bakiye yetmediğinde acil kredi çekilerek veya ödeme bekletilerek yönetilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Likidite Riski Erken Uyarı Sistemi ve Finansman Karar Destek Mekanizmasını belirler.

#### [TRS-038] Gün içi veya dönemlik atıl / fazla nakdin (Excess Cash) getiri optimizasyonu (Gecelik Repo, Ters Repo, Vadeli Mevduat, Likit Fon) kararları nasıl verilmekte ve yönetilmektedir?
- **Süreç:** Likidite ve Finansal Risk
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Serbest nakit fazlasının değerlendirilmesi, nemalandırma ve hazine kârı optimizasyonu.
- **Seçenekler:**
  - `otomatik_gecelik_nemalandirma_veya_hazine_uzmani_ile_gunluk_mevduat_baglanir`: Gün sonu serbest bakiyeler banka otomatik fon/repo sistemine aktarılır veya treasury yöneticisi en yüksek oranlı vadeli mevduata bağlar
  - `belirli_buyuklukte_nakit_birikince_yonetim_karariyla_degerlendirilir`: Günlük repo yapılmaz; hesaplarda yüklü nakit biriktiğinde yönetim onayıyla vadeli hesaba veya dövize aktarılır *(Not Alınabilir)*
  - `nakit_vadesiz_hesapta_nemalanmadan_bekletilir`: Fazla nakit değerlendirilmez, ödemelere hazırlık amacıyla vadesiz hesapta faizsiz olarak bekletilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Likidite Süpürme (Cash Sweeping / Zero-Balance Accounts) ve Vadeli Mevduat Entegrasyonunu belirler.

---

### 18. Banka Mutabakatı

#### [TRS-039] ERP banka hesap bakiyeleri ile banka internet bankacılığı / ekstre fiili bakiyeleri arasındaki Banka Mutabakatı (Bank Reconciliation) hangi sıklıkla ve nasıl yapılmaktadır?
- **Süreç:** Banka Mutabakatı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Operasyonel banka bakiyesi ile banka fiili bakiyesinin denkleştirilmesi.
- **Seçenekler:**
  - `gunluk_otomatik_ekstre_eslestirmesi_ile_anlik_mutabakat_saglanir`: Banka API / MT940 sistemiyle her gün sonu otomatik mutabakat çalışır; kuruş farkları ve açık kayıtlar anında listelenir
  - `haftalik_veya_ay_sonu_manuel_ekstre_karsilastirmasi_yapilir`: Haftalık veya ay sonlarında banka ekstre dökümü ile ERP muavin defteri satır satır karşılaştırılarak mutabık kalınır *(Not Alınabilir)*
  - `sadece_yil_sonu_resmi_mizan_kapanisinda_mutabakat_yapilir`: Dönem içinde düzenli banka mutabakatı yapılmaz; sadece yıl sonu veya üç aylık geçici vergi dönemlerinde bakiye kontrol edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Banka Mutabakat Motoru (Automated Bank Reconciliation Engine) frekansını belirler.

#### [TRS-040] Banka ile ERP arasındaki bakiye farkları (yoldaki transferler, henüz tahsil olmamış çekler, provizyondaki işlemler) nasıl tespit edilmekte ve mutabakat raporuna nasıl yansıtılmaktadır?
- **Süreç:** Banka Mutabakatı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Mutabakat fark kalemleri (Reconciling Items) ve askı kayıtlarının takibi.
- **Seçenekler:**
  - `erp_banka_mutabakat_raporunda_yoldaki_paralar_ve_farklar_ayri_listelenir`: ERP Banka Mutabakat Kokpiti yoldaki transferleri, takastaki çekleri ve provizyonları fark sebebi olarak ayrı kategoride raporlar
  - `farklar_excel_uzerinde_arastirilip_not_olarak_yazilir`: Farkların neden kaynaklandığı muhasebe personeli tarafından araştırılır ve Excel mutabakat çalışma sayfasına not edilir *(Not Alınabilir)*
  - `fark_kalemleri_detaylandirilmaz_dogrudan_duzeltme_kaydi_atilir`: Neden kaynaklandığı detaylı araştırılmaz; bakiye uyuşmadığında tek taraflı düzeltme fişi ile hesap eşitlenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Mutabakat Fark Raporu ve Açık Kalem Yönetimi (Reconciliation Difference Analysis) tasarımını belirler.

---

### 19. Treasury Raporlama ve KPI

#### [TRS-041] Üst yönetim ve finans direktörlüğü için Günlük / Haftalık Hazine ve Likidite Yönetim Raporu (Treasury Dashboard) hazırlanıyor mu?
- **Süreç:** Treasury Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Yönetici hazine raporlaması, serbest likidite özeti ve finansal durum paneli.
- **Seçenekler:**
  - `erp_yonetici_kokpitinden_anlik_otomatik_raporlanir`: Evet; ERP Yönetici Paneli (Dashboard) ve mobil ekranlar üzerinden nakit, çek, kredi, döviz pozisyonu ve haftalık akış anlık izlenir
  - `finans_ekibi_her_sabah_standart_excel_raporu_hazirlar`: Evet; finans ekibi tarafından her sabah standart şablonda hazırlanan Hazine Durum Raporu e-posta ile yönetime sunulur *(Not Alınabilir)*
  - `periyodik_hazine_raporu_yoktur_talep_edildikce_hazirlanir`: Düzenli bir hazine raporu yoktur; genel müdür veya patron talep ettikçe anlık durum özeti çıkarılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yönetici Hazine Kokpiti ve Mobil Raporlama gereksinimlerini belirler.

#### [TRS-042] Hazine operasyonlarında hangi Finansal ve Likidite KPI'ları (DSO - Alacak Tahsil Süresi, DPO - Borç Ödeme Süresi, Nakit Döngüsü Süresi, Kredi Limit Kullanım Oranı) periyodik ölçülmektedir?
- **Süreç:** Treasury Raporlama ve KPI
- **Tip:** `multiple_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Nakit yönetimi performans metrikleri ve finansal verimlilik göstergeleri.
- **Seçenekler:**
  - `dso_alacak_tahsil_suresi`: DSO (Days Sales Outstanding — Ortalama Alacak Tahsilat Süresi)
  - `dpo_borc_odeme_suresi`: DPO (Days Payable Outstanding — Ortalama Tedarikçi Ödeme Süresi)
  - `ccc_nakit_donusum_dongusu`: CCC (Cash Conversion Cycle — Nakit Döngüsü Süresi)
  - `kredi_limit_doluluk_orani`: Kredi Limit Doluluk ve Boş Limit Oranı (Credit Headroom)
  - `serbest_nakit_akisi_fcf`: Serbest Nakit Akışı (Free Cash Flow) ve Likidite Karşılama Oranı
  - `kpi_olculmemektedir`: Hazine KPI'ları şirketimizde düzenli olarak ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Hazine KPI ve Analitik Gösterge Panelleri (Treasury KPI Analytics) tasarımını belirler.
