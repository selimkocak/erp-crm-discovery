# FAZ-12 — Depo Yönetimi (WAREHOUSE) Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.warehouse.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `WAREHOUSE` (Depo Yönetimi)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Depo ve Lojistik Müdürleri  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP/WMS implementasyonu öncesinde depo yapısı, mal kabul, lokasyon adresleme, yerleştirme, transfer, rezervasyon, sipariş toplama (picking), paketleme, sayım ve izlenebilirlik süreçlerinin AS-IS durumunu ve gereksinimlerini belirlemek.

---

## Süreç Başlıkları Özeti (16 Kanonik Süreç / 38 Soru)

1. **Depo Yapısı ve Organizasyonu** (2 Soru — WH-001, WH-002)
2. **Mal Kabul ve Giriş Kontrolü** (2 Soru — WH-003, WH-004)
3. **Siparişsiz ve Beklenmeyen Mal Kabul** (1 Soru — WH-005)
4. **Kalite Kontrol ve Karantina Alanı** (2 Soru — WH-006, WH-007)
5. **Raf / Göz / Lokasyon Yönetimi** (3 Soru — WH-008, WH-009, WH-010)
6. **Stok Yerleştirme (Putaway)** (1 Soru — WH-011)
7. **Depolar Arası Transfer ve Yoldaki Stok** (2 Soru — WH-012, WH-013)
8. **Stok Rezervasyonu ve Tahsis** (2 Soru — WH-014, WH-015)
9. **Sipariş Toplama (Picking)** (3 Soru — WH-016, WH-017, WH-018)
10. **Paketleme ve Sevkiyata Hazırlık** (2 Soru — WH-019, WH-020)
11. **Sayım ve Envanter Kontrolü** (4 Soru — WH-021, WH-022, WH-023, WH-024)
12. **Lot / Seri Numarası Takibi** (3 Soru — WH-025, WH-026, WH-027)
13. **Raf Ömrü, SKT, FIFO ve FEFO** (2 Soru — WH-028, WH-029)
14. **Hasarlı, İade ve Hurda Stok** (2 Soru — WH-030, WH-031)
15. **Barkod, QR ve El Terminali** (3 Soru — WH-032, WH-033, WH-034)
16. **Depo Performansı ve Özel Koşullar** (4 Soru — WH-035, WH-036, WH-037, WH-038)

---

## Detaylı Soru Kataloğu

### 1. Depo Yapısı ve Organizasyonu

#### [WH-001] Şirketinizde kaç adet fiziksel depo bulunmaktadır ve bu depolar nasıl sınıflandırılmaktadır?
- **Süreç:** Depo Yapısı ve Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Fiziksel depo sayısı, lokasyonları ve depo tiplerinin (Hammadde, Yarı Mamul, Mamul, Yedek Parça vb.) haritasını çıkarmak için.
- **Seçenekler:**
  - `tek_merkez_cok_bolum`: Tek bir ana yerleşkede farklı amaçlı depo alanları (Hammadde, Mamul, Sarf vb.) var *(Not Alınabilir)*
  - `coklu_lokasyon_fabrika`: Farklı fabrika, şube veya şehirlerde birden fazla bağımsız depo var *(Not Alınabilir)*
  - `harici_antrepo_3pl`: Kendi depolarımıza ek olarak harici antrepo / 3PL lojistik depoları kullanılıyor *(Not Alınabilir)*
  - `tek_depo_ayrimsiz`: Tüm malzemelerin tutulduğu tek bir depo alanı var, alan ayrımı yok
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Depo Hiyerarşisi (Warehouse Master Data), Şube-Depo yetkilendirme modeli ve çoklu lokasyon yapısını belirler.

#### [WH-002] Fiziksel depolardaki alanlar ile mevcut sistemdeki depo tanımları birbiriyle tam örtüşüyor mu?
- **Süreç:** Depo Yapısı ve Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sistemdeki depo kodlarının sahadaki fiziksel gerçekliği ne kadar yansıttığını anlamak için.
- **Seçenekler:**
  - `tam_ortusuyor`: Evet, sistemdeki her depo kodu fiziksel olarak ayrılmış gerçek bir depoya karşılık geliyor
  - `kismi_sanal_depo`: Kısmen, bazı depolar fiziksel değil muhasebesel/sanal amaçlarla açılmış *(Not Alınabilir)*
  - `sistem_fiziksel_kopuk`: Hayır, sistemdeki depo yapısı fiziksel yerleşimden çok farklı, karmaşa yaşanıyor *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sanal vs. Fiziksel depo kurgusu, transfer zorunlulukları ve muhasebe entegrasyon kurallarını netleştirir.

---

### 2. Mal Kabul ve Giriş Kontrolü

#### [WH-003] Tedarikçiden gelen malzemelerin mal kabulü sahada hangi belgeye ve sisteme dayanılarak yapılıyor?
- **Süreç:** Mal Kabul ve Giriş Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Mal kabul kayıt yöntemi ve belge dayanağı.
- **Seçenekler:**
  - `erp_siparis_karsilama`: ERP sistemi üzerinden ilgili Satın Alma Siparişi çağrılarak doğrudan mal kabul yapılır
  - `kagit_irsaliye_sonra_sistem`: Fiziksel kâğıt irsaliye kontrol edilip kaşelenir, sisteme sonradan topluca işlenir *(Not Alınabilir)*
  - `el_terminali_barkod`: El terminali ile gelen irsaliye/barkod okutularak anlık mal kabul yapılır *(Not Alınabilir)*
  - `kendi_kabul_fisi_excel`: Depo kendi kâğıt teslim tesellüm fişini veya Excel listesini doldurur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Mal Kabul (Goods Receipt PO) ekranı, anlık stok güncellemesi ve irsaliye eşleme akışını belirler.

#### [WH-004] Mal kabul sırasında sahada hangi fiziksel kontroller yapılıyor?
- **Süreç:** Mal Kabul ve Giriş Kontrolü
- **Tip:** `multiple_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Mal kabul esnasında yürütülen kontrol adımları.
- **Seçenekler:**
  - `koli_paket_sayim`: Koli/Paket/Palet adedi ve fiziksel ambalaj bütünlüğü kontrolü
  - `teknik_etiket_kod`: Ürün etiketi, katalog kodu ve teknik tanım doğrulaması
  - `lot_seri_kontrol`: Tedarikçi lot/parti veya seri numarası kontrolü *(Not Alınabilir)*
  - `skt_raf_omru`: Son kullanma tarihi ve kalan raf ömrü kontrolü *(Not Alınabilir)*
  - `kantar_tartim`: Kantar / Hassas tartım ile brüt/net ağırlık kontrolü *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Mal kabul ekranında Lot, Seri No, SKT, Tartım entegrasyonu ve zorunlu alan kurallarını belirler.

---

### 3. Siparişsiz ve Beklenmeyen Mal Kabul

#### [WH-005] Sistemde açık bir satın alma siparişi olmayan veya sipariş miktarı aşılmış malzemeler depoya geldiğinde nasıl yönetiliyor?
- **Süreç:** Siparişsiz ve Beklenmeyen Mal Kabul
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Siparişsiz mal kabul politikası ve yetki esnekliği.
- **Seçenekler:**
  - `kesin_kabul_edilmez`: Siparişi olmayan hiçbir mal depoya fiziksel olarak alınmaz, kapıdan geri çevrilir
  - `gecici_alana_onay_bekler`: Fiziksel olarak geçici bekleme alanına alınır, satın alma sipariş açınca sisteme girilir *(Not Alınabilir)*
  - `siparis_bagimsiz_stok_girisi`: Sistemde siparişsiz serbest stok girişi yapılarak depoya alınır *(Not Alınabilir)*
  - `depocu_insiyatifi`: Depo sorumlusu satın almayı telefonla arayıp sözlü teyitle depoya alır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Mal Kabul yetkilendirmesi, siparişsiz giriş yasağı (Hard Block) veya Geçici Kabul (Staging) süreci ihtiyacını belirler.

---

### 4. Kalite Kontrol ve Karantina Alanı

#### [WH-006] Kalite kontrole tabi malzemeler mal kabul anında depoda nasıl ayrıştırılıyor?
- **Süreç:** Kalite Kontrol ve Karantina Alanı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Girdi kalite kontrol bekleyen stokların kullanılabilir stokla karışmasının önlenmesi.
- **Seçenekler:**
  - `sistem_karantina_deposu`: Sistemde otomatik olarak 'Kalite Karantina / Bloke Deposu'na girer, kalite onayı vermeden üretime/satışa açılamaz *(Not Alınabilir)*
  - `fiziksel_ayri_alan`: Fiziksel olarak karantina alanına çekilir ve sarı/kırmızı etiket yapıştırılır ancak sistemde tek depodadır *(Not Alınabilir)*
  - `numune_alindiktan_sonra_serbest`: Numune alınıp doğrudan ana raflara konulur, ret çıkarsa geri toplanır *(Not Alınabilir)*
  - `kalite_kontrol_uygulanmiyor`: Gelen malzemelere girdi kalite kontrol uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kalite Kontrol Bloke Deposu (Quality Hold Warehouse) ve ERP Kalite Entegrasyonunu belirler.

#### [WH-007] Kalite kontrol tarafından onaylanan veya reddedilen malzemenin depo hareketi nasıl işliyor?
- **Süreç:** Kalite Kontrol ve Karantina Alanı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WH-006` != `kalite_kontrol_uygulanmiyor`
- **Açıklama:** Kalite kararından sonra stok transferi ve ret alanı yönetimi.
- **Seçenekler:**
  - `sistem_otomatik_transfer`: Kalite onayı verilince sistem otomatik olarak karantinadan kullanılabilir depoya/lokasyona aktarır
  - `depo_onay_gorup_tasir`: Kalite onayı sistemde görülünce depo personeli manuel transfer belgesi ile taşır *(Not Alınabilir)*
  - `ret_iade_deposu`: Reddedilen malzeme derhal 'İade / Hurda Deposu'na taşınır ve tedarikçiye sevk irsaliyesi beklenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Kullanım Kararı (Usage Decision - UD) stok hareketi ve İade Deposu yapılandırmasını belirler.

---

### 5. Raf / Göz / Lokasyon Yönetimi

#### [WH-008] Depo içinde raf, koridor, kat ve göz bazında adresli lokasyon (Bin Location) takibi yapılıyor mu?
- **Süreç:** Raf / Göz / Lokasyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Depo içi hücresel adresleme sisteminin varlığı ve olgunluğu.
- **Seçenekler:**
  - `sistemde_raf_goz_tam_tanimli`: Evet, her malzemenin hangi koridor, raf, kat ve gözde olduğu sistemde anlık takip ediliyor *(Not Alınabilir)*
  - `fiziksel_adres_var_sistemde_yok`: Depoda rafların üzerinde adres etiketleri var ancak ERP/sistemde sadece depo bazında tutuluyor *(Not Alınabilir)*
  - `sadece_kritik_alanlarda`: Sadece belirli kritik veya küçük malzemeler için raf/göz takibi yapılıyor *(Not Alınabilir)*
  - `adresleme_yok_hafizaya_bagli`: Hayır, tanımlı raf/göz adresi yok; malzemelerin yeri personelin hafızasına ve tecrübesine bağlı
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WMS (Warehouse Management System) Lokasyon Modülü ve Raf/Göz Hiyerarşisi kurulumunu belirler.

#### [WH-009] Depo lokasyon yapısı nasıl kurgulanmıştır (sabit lokasyon mu, dinamik/kaotik depolama mı)?
- **Süreç:** Raf / Göz / Lokasyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WH-008` != `adresleme_yok_hafizaya_bagli`
- **Açıklama:** Malzemenin sabit bir adresinin mi olduğu yoksa boş olan herhangi bir göze mi konulduğu.
- **Seçenekler:**
  - `sabit_urun_lokasyonu`: Her ürünün tanımlı sabit bir rafı/gözü vardır, her zaman aynı yere konur
  - `dinamik_bos_goz`: Dinamik depolama; ürün o an boş olan en uygun rafa/göze konur ve sistemde güncellenir *(Not Alınabilir)*
  - `karma_model`: Hızlı dönen ürünler için sabit alan, diğer ürünler için dinamik alanlar kullanılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sabit Lokasyon (Fixed Bin) vs. Kaotik/Dinamik Depolama (Dynamic Bin) modelini belirler.

#### [WH-010] Sistemde lokasyonların anlık doluluk ve boşluk durumu görülebiliyor mu?
- **Süreç:** Raf / Göz / Lokasyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `WH-008` != `adresleme_yok_hafizaya_bagli`
- **Açıklama:** Depo hacim ve kapasite doluluk izleme durumu.
- **Seçenekler:**
  - `anlik_hacim_doluluk`: Evet, her raf ve gözün doluluk oranı ve kalan kapasitesi sistemde anlık izlenir
  - `sadece_stok_miktari`: Lokasyonda hangi malzemeden kaç adet olduğu görünür ancak hacimsel doluluk hesaplanmaz
  - `gosterge_yok`: Hayır, boş/dolu lokasyon durumu sistemde görünmez, fiziksel gözle kontrol edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Lokasyon Kapasite Kontrolü (Bin Weight & Volume Limits) ihtiyacını netleştirir.

---

### 6. Stok Yerleştirme (Putaway)

#### [WH-011] Mal kabulü tamamlanan ürünlerin depodaki hangi rafa/lokasyona konulacağına nasıl karar veriliyor?
- **Süreç:** Stok Yerleştirme (Putaway)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Mal yerleştirme kararının sistem önerisiyle mi yoksa personelin inisiyatifiyle mi verildiği.
- **Seçenekler:**
  - `sistem_otomatik_oneri`: Sistem ürün tipi, boyut, ABC analizi ve doluluğa göre hedef rafı otomatik önerir *(Not Alınabilir)*
  - `personel_bos_yere_koyup_okutur`: Personel uygun gördüğü boş yere koyar ve el terminaliyle raf barkodunu okutarak sisteme kaydeder *(Not Alınabilir)*
  - `tanimli_sabit_alana_tasinir`: Her ürünün alanı belli olduğu için doğrudan o alana taşınır, sisteme ekstra adres girilmez
  - `serbest_yerlestirme`: Personel bulduğu boş yere koyar, lokasyon kaydı tutulmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WMS Mal Yerleştirme Stratejisi (Putaway Strategy / Rule Engine) gereksinimini belirler.

---

### 7. Depolar Arası Transfer ve Yoldaki Stok

#### [WH-012] Farklı depolar veya şubeler arasında malzeme transferleri nasıl yürütülüyor?
- **Süreç:** Depolar Arası Transfer ve Yoldaki Stok
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Depolar arası transfer emirleri, sevk irsaliyeleri ve çift taraflı onay döngüsü.
- **Seçenekler:**
  - `cift_tarafli_transfer_emri`: Sistemde transfer talebi/emri açılır, çıkış deposu sevk eder, varış deposu onaylayıp kabul eder (2 Adımlı) *(Not Alınabilir)*
  - `tek_adimli_anlik_aktarim`: Çıkış deposu doğrudan transfer fişi keser ve stok anında karşı depoya geçer (1 Adımlı)
  - `irsaliye_ile_manuel_aktarim`: Depolar arası kâğıt sevk irsaliyesi ile taşınır, muhasebe sonradan sistemde aktarır *(Not Alınabilir)*
  - `sozlu_veya_excel`: Transferler telefon/Excel ile bildirilir, sistem kaydı düzenli tutulmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** 2 Kademeli Transfer (Stock Transport Order / In-Transit) vs. 1 Kademeli Doğrudan Transfer kurgusunu belirler.

#### [WH-013] Fiziksel olarak sevk edilmiş ancak henüz varış deposuna ulaşmamış 'Yoldaki Stok' (In-Transit) sistemde izleniyor mu?
- **Süreç:** Depolar Arası Transfer ve Yoldaki Stok
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Transfer süresince stok mülkiyetinin ve miktarının havada kalmasının önlenmesi.
- **Seçenekler:**
  - `yoldaki_depo_izlenir`: Evet, sistemde 'Yoldaki Depo / Sevk Deposu' tanımlıdır ve sevk anında stoğu buraya alır
  - `cikis_yapildigi_anda_karsida`: Hayır, çıkış yapıldığı anda doğrudan varış deposunun stoğunda görünür *(Not Alınabilir)*
  - `varis_onaylayana_kadar_cikista`: Varış deposu onaylayana kadar çıkış yapan deponun stoğunda görünür
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** In-Transit Depo (Transit Warehouse) mantığı ve lojistik envanter şeffaflığını belirler.

---

### 8. Stok Rezervasyonu ve Tahsis

#### [WH-014] Satış siparişleri veya üretim iş emirleri için depodaki stok rezerve ediliyor (bağlanıyor) mu?
- **Süreç:** Stok Rezervasyonu ve Tahsis
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sipariş veya iş emri girildiğinde mevcut stoktan düşülmeden rezerve edilip mükerrer kullanımın önlenmesi.
- **Seçenekler:**
  - `sistem_otomatik_sert_rezervasyon`: Evet, sipariş/iş emri onaylandığında sistem stoku otomatik rezerve eder, başkası kullanamaz (Hard Allocation) *(Not Alınabilir)*
  - `sistem_yumusak_rezervasyon`: Evet, rezerve miktar görünür ancak depodan fiziksel çıkışta kısıtlama yapmaz (Soft Allocation)
  - `fiziksel_ayirma_etiket`: Sistemde rezervasyon yok, depocu gidip ürünün üzerine müşteri adı yazıp ayırır *(Not Alınabilir)*
  - `rezervasyon_yapilmiyor`: Hayır, rezervasyon yapılmaz; ilk gelen / ilk faturası kesilen ürünü alır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ATP (Available to Promise) Motoru, Sipariş Tahsis Kuralları ve Negatif Stok kilidini belirler.

#### [WH-015] Üretime malzeme çıkışları (besleme) rezervasyona göre mi yoksa serbest taleple mi yapılıyor?
- **Süreç:** Stok Rezervasyonu ve Tahsis
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Üretim malzeme besleme yönteminin depo entegrasyonu.
- **Seçenekler:**
  - `is_emri_recete_rezervasyonu`: İş emri ürün ağacındaki (BOM) planlı malzeme rezervasyonuna göre depodan çekilir
  - `uretimden_manuel_talep_fisi`: Üretim ustası kâğıt talep fişi yazar, depo bu fişe göre malzeme çıkarır *(Not Alınabilir)*
  - `kanban_veya_serbest_kullanim`: Hammadde üretim hattına topluca dökülür, üretim bittikçe ters kayıt (Backflush) ile düşülür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Depo-Üretim entegrasyonu (Backflush vs. Malzeme Çıkış Emri / Material Issue) modelini belirler.

---

### 9. Sipariş Toplama (Picking)

#### [WH-016] Depodan sipariş toplama (picking) işlemi hangi yöntemle gerçekleştiriliyor?
- **Süreç:** Sipariş Toplama (Picking)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Sipariş toplama emirlerinin personele iletilmesi ve sahada uygulanması.
- **Seçenekler:**
  - `el_terminali_yonlendirmeli`: El terminali personeli en uygun rota ve lokasyona yönlendirir, barkod okutarak toplar *(Not Alınabilir)*
  - `yazili_toplama_listesi`: Sistemden kâğıt Toplama Listesi (Picking List) yazdırılır, depocu listeden toplayıp işaretler *(Not Alınabilir)*
  - `dogrudan_fatura_irsaliye`: Doğrudan basılmış irsaliye/faturaya bakılarak depodan ürün toplanır
  - `hafiza_ve_sozlu`: Yazılı liste olmadan, sözlü veya WhatsApp mesajıyla ürün toplanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WMS Picking Modülü, Rota Optimizasyonu ve El Terminali Toplama Arayüzü ihtiyacını belirler.

#### [WH-017] Toplama sırasında siparişler tek tek mi yoksa birden fazla sipariş birleştirilerek (dalga/toplu toplama) mi toplanıyor?
- **Süreç:** Sipariş Toplama (Picking)
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Sipariş toplama stratejisi (Single Order vs. Batch/Wave Picking).
- **Seçenekler:**
  - `tekil_siparis_toplama`: Her sipariş tek tek bağımsız olarak toplanır
  - `toplu_dalga_toplama`: Aynı lokasyondaki birden fazla sipariş birleştirilip topluca toplanır (Wave/Batch Picking) *(Not Alınabilir)*
  - `bolge_bazli_toplama`: Depo bölgelere ayrılmıştır, her bölge kendi payını toplayıp konsolidasyon alanında birleştirir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Dalga Yönetimi (Wave Management) ve Konsolidasyon Alanı (Sortation/Staging) ihtiyacını belirler.

#### [WH-018] Toplama esnasında yanlış ürün veya yanlış miktar alınması sistem tarafından nasıl engelleniyor?
- **Süreç:** Sipariş Toplama (Picking)
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Toplama doğrulama ve hata önleme mekanizmaları.
- **Seçenekler:**
  - `zorunlu_barkod_esleme`: El terminalinde ürün ve lokasyon barkodu eşleşmeden sistem sonraki kaleme geçit vermez
  - `cikis_kontrol_masasi`: Toplanan ürünler sevkiyat öncesi kontrol masasında ikinci bir kişi tarafından tek tek taranır *(Not Alınabilir)*
  - `fiziksel_goz_kontrolu`: Sistemsel doğrulama yoktur, toplayan personelin göz kontrolüne dayanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çıkış Doğrulama (Pick Verification / Check Station) sürecini belirler.

---

### 10. Paketleme ve Sevkiyata Hazırlık

#### [WH-019] Toplanan ürünlerin koli/palet bazında paketlenmesi ve sevkiyat koli etiketlemesi nasıl yapılıyor?
- **Süreç:** Paketleme ve Sevkiyata Hazırlık
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Paketleme masası, koli barkodu ve çeki listesi (Packing List) üretimi.
- **Seçenekler:**
  - `sistem_koli_palet_etiketi`: Sistemde paketleme yapılarak her koli/palete içeriğini gösteren standart SSCC / koli barkodu basılır *(Not Alınabilir)*
  - `manuel_etiketleme`: Koli üzerine kargo etiketi veya el yazısıyla müşteri/ürün bilgisi yazılır
  - `ambalajsiz_dogrudan_sevk`: Paketleme gerekmez, ürünler doğrudan araca yüklenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Paketleme / Ambalajlama Modülü (Packing & Handling Unit - HU Management) gereksinimini belirler.

#### [WH-020] Depoda sevkiyat için ayrılmış özel bir Sevkiyat Bekleme / Yükleme Alanı (Staging Area / Rampa) bulunuyor mu?
- **Süreç:** Paketleme ve Sevkiyata Hazırlık
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Toplanan malların araç yüklenene kadar ana stoktan ayrılması.
- **Seçenekler:**
  - `tanimli_sevk_peronu`: Evet, her müşteri/araç için sistemde tanımlı rampa ve sevk bekleme peronları var *(Not Alınabilir)*
  - `genel_sevk_alani`: Fiziksel olarak depo çıkışında genel bir alan var ancak sistemde lokasyon olarak tanımlı değil
  - `ayri_alan_yok`: Hayır, toplanan ürünler rafların önünde veya koridorda bekletilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WMS Rampa ve Sevk Lokasyonu (Door & Staging Location Management) kurgusunu belirler.

---

### 11. Sayım ve Envanter Kontrolü

#### [WH-021] Fiziksel stok sayımları hangi periyotta ve hangi yöntemle gerçekleştiriliyor?
- **Süreç:** Sayım ve Envanter Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Yıllık genel sayım vs. periyodik dinamik sayım (Cycle Counting) olgunluğu.
- **Seçenekler:**
  - `surekli_cycle_count`: Yıl boyunca lokasyon veya ABC kategorisi bazında planlı sürekli sayım (Cycle Counting) yapılır *(Not Alınabilir)*
  - `yillik_genel_sayim`: Yılda bir veya iki kez depo tamamen durdurularak genel sayım yapılır
  - `aylik_manuel_kontrol`: Her ay sonu kritik malzemeler kâğıt listelerle sayılır *(Not Alınabilir)*
  - `ihtiyac_duyuldukca`: Sadece stokta açık çıkınca veya şüphe duyuldukça münferit sayım yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Cycle Counting Modülü, Sayım Emri Planlama ve Depo Sayım Kilidi (Stock Freeze) mekanizmasını belirler.

#### [WH-022] Sayım esnasında ve sonrasında sayım farkları (fazla/eksik) sisteme nasıl işleniyor?
- **Süreç:** Sayım ve Envanter Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sayım farklarının onay matrisi ve otomatik mutabakat kuralları.
- **Seçenekler:**
  - `onay_matrisli_fark_fisi`: Sistem sayım fark raporu üretir; yetkili yöneticiler onaylayınca otomatik sayım fark fişi kesilir *(Not Alınabilir)*
  - `depocu_stogu_direkt_esitler`: Depo sorumlusu serbestçe stok düzeltme fişi kesip stoku eşitler
  - `farklar_ayri_tutulur`: Farklar sistemde hemen düzeltilmez, uzun süre araştırılıp muhasebe kararıyla kapatılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sayım Fark Onay İş Akışı (Inventory Difference Approval) ve Sayım Envanter Muhasebe Entegrasyonunu belirler.

#### [WH-023] Mevcut sisteminizde fiziksel stok ile sistem stoğu arasında ne sıklıkla uyumsuzluk yaşanıyor?
- **Süreç:** Sayım ve Envanter Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Stok doğruluk oranı ve envanter güvenilirliği seviyesi.
- **Seçenekler:**
  - `cok_nadir_yuzde_98_ustu`: Çok nadir, stok doğruluğumuz %98'in üzerindedir
  - `bazi_gruplarda_sik`: Genel olarak iyi ancak sarf veya dökme malzemelerde sık fark çıkıyor *(Not Alınabilir)*
  - `sik_sik_uyusmazlik`: Sık sık uyuşmazlık çıkıyor; sistemde var görünen mal rafta bulunamıyor veya tersi *(Not Alınabilir)*
  - `stok_dogrulugu_bilinmiyor`: Düzenli ölçülmediği için doğruluk oranı bilinmiyor
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Stok Doğruluk Risk Seviyesi ve geçiş öncesi Zorunlu Sıfırlama Sayımı (Clean-Cut Inventory Count) ihtiyacını gösterir.

#### [WH-024] Sistemde stok miktarlarının eksiye (negatif stoka) düşmesine izin veriliyor mu?
- **Süreç:** Sayım ve Envanter Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Negatif stok kilidi ve operasyonel disiplin.
- **Seçenekler:**
  - `kesinlikle_yasak`: Hayır, sistemde negatif stok kesinlikle engellenmiştir, stok yoksa çıkış yapılamaz
  - `izin_veriliyor_sonradan_duzeltilir`: Evet, iş aksamasın diye eksiye düşmeye izin veriliyor, irsaliye girilince kapanıyor *(Not Alınabilir)*
  - `sadece_belirli_depolarda`: Sadece üretim besleme veya sarf depolarında izin veriliyor *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Negatif Stok Engelleme (Negative Stock Disallow) parametrelerini belirler.

---

### 12. Lot / Seri Numarası Takibi

#### [WH-025] Depoda malzemeler için Lot (Parti) veya Seri Numarası takibi yapılıyor mu?
- **Süreç:** Lot / Seri Numarası Takibi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** İleri ve geri izlenebilirlik (Traceability) omurgası.
- **Seçenekler:**
  - `hem_lot_hem_seri`: Evet, bazı ürünlerde Lot (parti), bazı ürünlerde benzersiz Seri Numarası takip ediliyor *(Not Alınabilir)*
  - `sadece_lot_takibi`: Sadece hammadde ve ürünlerde Lot/Parti takibi yapılıyor *(Not Alınabilir)*
  - `sadece_seri_no`: Sadece cihaz/ekipman bazında tekil Seri Numarası takip ediliyor *(Not Alınabilir)*
  - `lot_veya_seri_yok`: Hayır, lot veya seri numarası takibi yapılmıyor, sadece miktar bazlı tutuluyor
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Malzeme Ana Verisinde Lot/Seri Yönetimi (Batch/Serial Management) aktifliğini belirler.

#### [WH-026] Lot veya seri numaraları sisteme nasıl kazandırılıyor?
- **Süreç:** Lot / Seri Numarası Takibi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WH-025` != `lot_veya_seri_yok`
- **Açıklama:** Tedarikçi lotu mu yoksa iç üretim lotu mu kullanıldığı.
- **Seçenekler:**
  - `tedarikci_ve_dahili_otomatik`: Tedarikçinin lotu kaydedilir veya sistem giriş anında otomatik benzersiz dahili lot no üretir *(Not Alınabilir)*
  - `tedarikci_lotu_manuel_yazilir`: Tedarikçi irsaliyesindeki lot kâğıda veya sisteme manuel yazılır
  - `sadece_uretimde_lot_uretilir`: Satın almada tutulmaz, sadece kendi üretimimizde lot açılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Lot Numaralama Şablonları (Batch Numbering Ranges) ve Otomatik Lot Üretim kurallarını belirler.

#### [WH-027] Depodan çıkış yaparken belirli bir lot/seri numarasının seçilmesi zorunlu tutuluyor mu?
- **Süreç:** Lot / Seri Numarası Takibi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WH-025` != `lot_veya_seri_yok`
- **Açıklama:** Çıkış anında tam izlenebilirlik kısıtı.
- **Seçenekler:**
  - `cikis_aninda_zorunlu_okutma`: Evet, el terminali ile ilgili lot/seri barkodu okutulmadan sistem çıkışa izin vermez
  - `sistem_onerdigi_lot_secilir`: Sistem FIFO/FEFO kuralına göre lotu seçer, personel onaylar
  - `lot_secimi_serbest`: Personel sistemden herhangi bir lotu seçer, fiziksel çıkanla sistemdeki her zaman tutmayabilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çıkışta Zorunlu Lot Tahsisi (Strict Batch Determination) kuralını netleştirir.

---

### 13. Raf Ömrü, SKT, FIFO ve FEFO

#### [WH-028] Depodaki malzemeler için Son Kullanma Tarihi (SKT) veya Raf Ömrü takibi gerekiyor mu?
- **Süreç:** Raf Ömrü, SKT, FIFO ve FEFO
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kimyasal, gıda, ilaç, kauçuk, boya vb. malzemelerde raf ömrü yönetimi.
- **Seçenekler:**
  - `zorunlu_skt_fefo`: Evet, raf ömrü olan ürünlerimiz var; Son Kullanma Tarihi İlk Dolan İlk Çıkar (FEFO) zorunludur *(Not Alınabilir)*
  - `sadece_giris_tarihli_fifo`: SKT yok ancak Giriş Tarihi İlk Olan İlk Çıkar (FIFO) kuralı uygulanmalıdır
  - `raf_omru_kisiti_yok`: Hayır, ürünlerimizin bozulma veya raf ömrü riski yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** FEFO vs. FIFO Stok Çıkış Stratejisi (Stock Removal Strategy) kurgusunu belirler.

#### [WH-029] Raf ömrü yaklaşan veya dolan ürünler için sistemde otomatik blokaj veya uyarı var mı?
- **Süreç:** Raf Ömrü, SKT, FIFO ve FEFO
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WH-028` == `zorunlu_skt_fefo`
- **Açıklama:** Miadı dolan ürünün müşteriye veya üretime sevk edilmesinin engellenmesi.
- **Seçenekler:**
  - `otomatik_sistem_blokaji`: Evet, sistem süresi dolan veya kalan raf ömrü kritik eşiğin altına inen ürünü otomatik bloke eder *(Not Alınabilir)*
  - `manuel_raporla_tarama`: Personel periyodik rapor çekerek süresi yaklaşanları manuel kontrol eder *(Not Alınabilir)*
  - `otomatik_uyari_yok`: Sistemde uyarı yoktur, fiziksel kontrolle fark edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kalan Raf Ömrü Kontrolü (Minimum Remaining Shelf Life) ve Otomatik Parti Statü Değişimi gereksinimini netleştirir.

---

### 14. Hasarlı, İade ve Hurda Stok

#### [WH-030] Depoda tespit edilen hasarlı, kusurlu veya hurda malzemeler nasıl yönetiliyor?
- **Süreç:** Hasarlı, İade ve Hurda Stok
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Uygunsuz ürünlerin sağlam ürünlerden tecrit edilmesi ve fire kayıtları.
- **Seçenekler:**
  - `hurda_ve_fire_deposu`: Sistemde 'Hurda / Fire Deposu' tanımlıdır; hasarlı ürünler onaylı fire fişiyle buraya taşınır *(Not Alınabilir)*
  - `fiziksel_ayri_sistemde_aynis`: Fiziksel olarak bir köşeye ayrılır ancak sistemde sağlam stokla aynı depoda görünür *(Not Alınabilir)*
  - `dogrudan_stoktan_dusulur`: Fark edildiği anda doğrudan stoktan silinir / gider yazılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Hurda / Fire Depo Yapısı (Scrap Warehouse) ve Fire Onay Akışını belirler.

#### [WH-031] Müşteriden geri gelen iade ürünlerin depoya kabulü nasıl yapılıyor?
- **Süreç:** Hasarlı, İade ve Hurda Stok
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Satış iadesi mal kabulü ve yeniden satışa uygunluk kontrolü.
- **Seçenekler:**
  - `iade_kabul_ve_ekspertiz`: Önce 'Müşteri İade Deposu'na alınır, kalite/teknik inceleme sonrası sağlam veya hurdaya aktarılır *(Not Alınabilir)*
  - `dogrudan_saglam_stoka`: İade geldiği gibi doğrudan sağlam ürün deposuna geri alınır
  - `muhasebe_faturasi_sonra_fiziksel`: Muhasebe iade faturasını işleyinceye kadar depoda bekletilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satış İadesi Kabul Prosedürü (RMA - Return Merchandise Authorization) entegrasyonunu belirler.

---

### 15. Barkod, QR ve El Terminali

#### [WH-032] Depo operasyonlarında Barkod / QR Kod ve El Terminali (Mobil Cihaz) kullanılıyor mu?
- **Süreç:** Barkod, QR ve El Terminali
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Deponun dijitalleşme ve donanım altyapısı seviyesi.
- **Seçenekler:**
  - `aktif_el_terminali_barkod`: Evet, depoda tüm giriş, transfer, sayım ve çıkışlar el terminali ve barkod ile yapılır *(Not Alınabilir)*
  - `kismi_barkod_kullanimi`: Barkod etiketleri var ancak el terminali sadece sayımda veya belirli alanlarda kullanılıyor *(Not Alınabilir)*
  - `barkod_var_terminal_yok`: Ürünlerde barkod var ancak el terminali yok, işlemler masaüstü bilgisayardan yapılıyor *(Not Alınabilir)*
  - `barkod_ve_terminal_yok`: Hayır, ne barkod ne de el terminali kullanılmıyor; tüm süreçler kâğıt ve masaüstü ERP ile yürüyor
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Mobil Depo / WMS El Terminali (Android Barcode Scanning) lisans ve donanım kapsamını belirler.

#### [WH-033] Depoda hangi unsurlar için barkod / QR etiket basılıyor ve kullanılıyor?
- **Süreç:** Barkod, QR ve El Terminali
- **Tip:** `multiple_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WH-032` != `barkod_ve_terminal_yok`
- **Açıklama:** Barkodlama derinliği ve etiket şablonları.
- **Seçenekler:**
  - `urun_malzeme_etiketi`: Ürün / Malzeme birim ambalaj barkodu
  - `raf_lokasyon_etiketi`: Raf / Göz / Lokasyon barkodu
  - `koli_palet_etiketi`: Koli / Palet / Koli içi taşıma birimi (SSCC) etiketi *(Not Alınabilir)*
  - `lot_seri_etiketi`: Lot / Seri numarası ve Son Kullanma Tarihi barkodu
  - `tedarikci_barkodu_direkt`: Kendi etiketimiz yerine tedarikçinin üzerindeki orijinal barkod doğrudan okutuluyor *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Barkod Yazıcı (Zebra/TSC ZPL), EAN-13, Code 128, DataMatrix/QR Etiket Tasarım Şablonları gereksinimini netleştirir.

#### [WH-034] Depo alanında kesintisiz kablosuz ağ (Wi-Fi) ve endüstriyel donanım altyapısı mevcut mu?
- **Süreç:** Barkod, QR ve El Terminali
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `WH-032` != `barkod_ve_terminal_yok`
- **Açıklama:** Depo saha bağlantısı ve offline çalışma riski.
- **Seçenekler:**
  - `tum_depo_kesintisiz_wifi`: Evet, deponun tamamında endüstriyel access point'lerle kesintisiz Wi-Fi çekimi var
  - `bazi_koridorlarda_kopma`: Kısmen, bazı metal rafların arkasında veya açık alanda Wi-Fi çekim sorunları yaşanıyor *(Not Alınabilir)*
  - `wifi_yok_gsm_veya_kablolu`: Depoda Wi-Fi yok, mobil hat (GSM) veya sadece masaüstü kablolu ağ var *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WMS Terminal mimarisinin Offline/Online gereksinimlerini ve IT altyapı iyileştirme ihtiyacını belirler.

---

### 16. Depo Performansı ve Özel Koşullar

#### [WH-035] Depo yönetimi için düzenli olarak takip edilen veya raporlanmak istenen temel performans göstergeleri (KPI) nelerdir?
- **Süreç:** Depo Performansı ve Özel Koşullar
- **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Depo verimlilik ve operasyon KPI ihtiyaçları.
- **Seçenekler:**
  - `stok_dogruluk_orani`: Stok doğruluk oranı (Inventory Record Accuracy - IRA)
  - `siparis_hazirlama_hizi`: Sipariş hazırlama ve toplama çevrim süresi (Order Lead Time)
  - `toplama_hatasizlik_orani`: Toplama doğruluk ve hatasızlık oranı (Picking Accuracy)
  - `depo_kapasite_kullanim`: Depo hacim ve metrekare kapasite kullanım oranı
  - `mal_kabul_raf_alma_suresi`: Mal kabulden rafa yerleştirmeye kadar geçen süre (Dock-to-Stock Time)
  - `atil_yavas_donen_stok`: Yavaş dönen ve atıl/ölü stok raporu (Slow-moving / Dead Stock) *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Depo Yönetim Dashboard'ı ve Standart Depo Raporları tasarımını belirler.

#### [WH-036] Depo personelinin bireysel veya vardiya bazlı toplama/yerleştirme performans takibi yapılıyor mu?
- **Süreç:** Depo Performansı ve Özel Koşullar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Personel iş yükü ve verimlilik ölçümü.
- **Seçenekler:**
  - `sistem_kisi_bazli_olcer`: Evet, sistem her personelin saatte kaç satır/koli topladığını veya yerleştirdiğini loglar *(Not Alınabilir)*
  - `vardiya_veya_takim_bazli`: Kişi bazlı değil, vardiya bazında toplam sevk edilen miktar takip edilir
  - `performans_olculmuyor`: Hayır, personel bazlı hız ve verimlilik takibi yapılmıyor
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WMS İş Gücü Yönetimi (Labor Management / Task Interleaving) ihtiyacını gösterir.

#### [WH-037] Depoda özel saklama koşulu (soğuk hava, nem kontrollü, yanıcı/parlayıcı kimyasal vb.) gerektiren alanlar var mı?
- **Süreç:** Depo Performansı ve Özel Koşullar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Özel ortam ve güvenlik koşullarına tabi malzeme depolama gereksinimleri.
- **Seçenekler:**
  - `soguk_hava_ve_iklimlendirme`: Evet, soğuk hava deposu veya sıcaklık/nem takipli özel alanlarımız var *(Not Alınabilir)*
  - `yanici_tehlikeli_madde`: Evet, ADR / Yangın güvenlikli tehlikeli madde (HazMat) depolama alanı var *(Not Alınabilir)*
  - `standart_kuru_depo`: Hayır, tüm malzemelerimiz standart kuru depo ortamında saklanmaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Depo Tipi ve Lokasyon Saklama Koşulları Parametrelerini (Storage Conditions) belirler.

#### [WH-038] Depoda otomasyonlu depolama sistemleri (ASRS, Dikey Karusel, Konveyör, AGV vb.) bulunuyor veya planlanıyor mu?
- **Süreç:** Depo Performansı ve Özel Koşullar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `low`
- **Açıklama:** Otomatik depolama ve malzeme taşıma sistemleri entegrasyonu (WCS/PLC).
- **Seçenekler:**
  - `mevcut_otomasyon_entegre`: Evet, mevcut ASRS / Dikey Karusel / Konveyör sistemimiz var ve ERP ile entegre olmalı *(Not Alınabilir)*
  - `yakin_gelecekte_planlaniyor`: Şu an yok ancak yeni depo yatırımında otomasyon planlanıyor *(Not Alınabilir)*
  - `tamamen_manuel_forklift`: Hayır, tamamen standart raflar, forklift ve transpalet ile manuel çalışıyoruz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** WCS (Warehouse Control System) / PLC / Harici Donanım Entegrasyon arayüzü gereksinimini netleştirir.
