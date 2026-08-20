# FAZ-14 — Sevkiyat ve Lojistik (LOGISTICS) Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.logistics.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `LOGISTICS` (Sevkiyat ve Lojistik)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Sevkiyat ve Lojistik Yöneticileri, Satış Operasyon ve Müşteri Hizmetleri Ekipleri  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP implementasyonu öncesinde sevkiyat talepleri, teslimat emirleri, finansal kredi blokajı, kısmi ve konsolide sevkiyatlar, araç ve taşıyıcı seçimi, rota planlama, randevulu teslimatlar, e-İrsaliye ve sevk belgeleri, dijital teslim kanıtı (POD), tersine lojistik, kargo entegrasyonu, navlun maliyetleri ve OTIF KPI'larının AS-IS durumunu ve gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | LOGISTICS ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **SALES** | Müşteri ilişkileri, Fırsatlar, Teklifler, Satış Siparişleri (SO), Fiyatlandırma, İskonto ve Ticari Ödeme Şartları | **Lojistik satış sipariş sürecini tekrar sormaz.** Yalnızca siparişten türeyen teslimat tarihi, sevk adresi, kısmi teslimat izni ve navlun faturası yansıtma şartına odaklanır. |
| **WAREHOUSE** | Fiziksel depo organizasyonu, kapı mal kabulü, raf/göz/lokasyon adresleme, yerleştirme (putaway), sipariş toplama (picking) rotaları, paketleme masası, el terminali ve Wi-Fi altyapısı | **Lojistik depo içi picking/paketlemeyi tekrar sormaz.** Depo kapısında paketlenmiş malın teslim alınmasından müşteriye fiziksel teslimine, taşıyıcıya, rotaya, araç tonajına ve e-İrsaliye akışına odaklanır. |
| **INVENTORY** | Stok kartı ana verisi, varyant matrisi, ölçü birimi çevrimleri, konsinye/emanet stok, Min/Max seviyeleri, ATP kullanılabilir stok formülü, Stok Değerleme Yöntemleri (FIFO, Yürüyen Ortalama, Standart Maliyet), Stok Yaşlandırma | **Lojistik stok değerleme veya emniyet stoğu sormaz.** Sevk irsaliyesi kesildiğinde stokun düşülmesi ve teslim edilen miktarın bakiye takibine odaklanır. |
| **LOGISTICS** | Sevkiyat talebi ve teslimat emri, finansal onay blokajı, sevkiyat önceliklendirme, kısmi/birleştirilmiş sevkiyat, araç ve taşıyıcı yönetimi, rota/durak planlama, randevulu teslimat, yükleme hacim/tonaj kontrolü, e-İrsaliye ve sevk belgeleri, teslim kanıtı (POD), teslim edilememe/iade lojistiği, kargo entegrasyonu, müşteri özel etiket/palet şartları, navlun maliyeti ve kârlılık dağıtımı, 3PL veri arayüzü, ihracat gümrük intaç takibi, kantar entegrasyonu ve OTIF KPI'ları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular lojistik, taşıma, resmi sevk belgeleri ve teslimat kanıtı derinliğinde yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (17 Kanonik Süreç / 37 Soru)

1. **Sevkiyat Talebi ve Teslimat Emri Başlatma** (2 Soru — LOG-001, LOG-002)
2. **Sevkiyat Planlama ve Önceliklendirme** (2 Soru — LOG-003, LOG-004)
3. **Kısmi ve Birleştirilmiş Sevkiyat Yönetimi** (2 Soru — LOG-005, LOG-006)
4. **Araç, Filo ve Taşıyıcı Yönetimi** (3 Soru — LOG-007, LOG-008, LOG-009)
5. **Rota, Dağıtım ve Randevu Planlama** (2 Soru — LOG-010, LOG-011)
6. **Yükleme Organizasyonu ve Kapasite Kontrolü** (2 Soru — LOG-012, LOG-013)
7. **İrsaliye ve Sevk Belgeleri Yönetimi (e-İrsaliye)** (3 Soru — LOG-014, LOG-015, LOG-016)
8. **Teslimat Doğrulaması ve Teslim Kanıtı (POD)** (2 Soru — LOG-017, LOG-018)
9. **Teslim Edilememe, Red ve İade Lojistiği** (2 Soru — LOG-019, LOG-020)
10. **Kargo ve Kurye Entegrasyonu** (2 Soru — LOG-021, LOG-022)
11. **Müşteri Özel Sevkiyat ve Teslimat Şartları** (2 Soru — LOG-023, LOG-024)
12. **Navlun ve Lojistik Maliyetleri Yönetimi** (3 Soru — LOG-025, LOG-026, LOG-027)
13. **Dış Kaynak Lojistik ve 3PL Yönetimi** (2 Soru — LOG-028, LOG-029)
14. **İhracat Sevkiyatları ve Gümrük Çıkış Süreçleri** (2 Soru — LOG-030, LOG-031)
15. **Sevkiyat Güvenliği, Kantar ve Mühür Yönetimi** (2 Soru — LOG-032, LOG-033)
16. **Sevkiyat Performansı, OTIF ve KPI'lar** (3 Soru — LOG-034, LOG-035, LOG-036)
17. **İade Alım ve Müşteriden Toplama Lojistiği** (1 Soru — LOG-037)

---

## 3. Detaylı Soru Kataloğu

### 1. Sevkiyat Talebi ve Teslimat Emri Başlatma

#### [LOG-001] Sevkiyat süreci sistemde hangi belge veya tetikleyici ile başlatılmaktadır?
- **Süreç:** Sevkiyat Talebi ve Teslimat Emri Başlatma
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Satış siparişinden doğrudan sevk emri / teslimat belgesi (Outbound Delivery) üretilmesi vs. manuel sevk talebi.
- **Seçenekler:**
  - `otomatik_teslimat_emri`: Onaylanan satış siparişinden sistem otomatik olarak 'Teslimat / Sevk Emri' oluşturur
  - `satis_ekibi_manuel_talep_acar`: Satış temsilcisi siparişi hazırlatmak için sevkiyat/lojistik ekibine manuel sevk talebi girer *(Not Alınabilir)*
  - `depo_hazir_bildirimiyle_baslar`: Üretim veya depo ürünün hazır olduğunu bildirdiğinde sevkiyat listesi oluşturulur *(Not Alınabilir)*
  - `belgesiz_telefon_whatsapp`: Sistemde sevk emri yoktur, e-posta/telefon/WhatsApp ile sevk talimatı verilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Çıkış Teslimatı (Outbound Delivery Document) oluşturma otomasyonu ve onay kurallarını belirler.

#### [LOG-002] Sevkiyat öncesinde finansal onay (kredi limiti, vadesi geçmiş bakiye veya avans tahsilat kontrolü) yapılıyor mu?
- **Süreç:** Sevkiyat Talebi ve Teslimat Emri Başlatma
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Finansal risk kontrolü sebebiyle sevkiyat blokajı konulması.
- **Seçenekler:**
  - `sistem_otomatik_bloke_koyar`: Evet, müşterinin kredi limiti aşılmışsa veya vadesi geçmiş borcu varsa sistem sevk irsaliyesi/teslimat kesilmesini otomatik engeller
  - `finans_ekibi_manuel_onay_verir`: Her sevkiyat listesi önce Finans/Muhasebe onayına sunulur, onay gelince araç yüklenir *(Not Alınabilir)*
  - `sadece_pesin_musterilerde_kontrol`: Sadece peşin çalışan müşterilerde dekont kontrol edilir, vadeli müşterilerde kısıt yoktur
  - `sevkiyatta_finans_kontrolu_yok`: Sevkiyat aşamasında finans kontrolü yapılmaz, sipariş onayında biter
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kredi Yönetimi Sevkiyat Blokajı (Credit Limit Check on Delivery) parametrelerini belirler.

---

### 2. Sevkiyat Planlama ve Önceliklendirme

#### [LOG-003] Hangi siparişlerin hangi gün ve sırayla sevk edileceğine nasıl karar verilmektedir (Sevkiyat Planlama)?
- **Süreç:** Sevkiyat Planlama ve Önceliklendirme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Sevkiyat planlama mekanizması (Teslim tarihi, bölge/rota, müşteri önceliği).
- **Seçenekler:**
  - `erp_teslim_tarihi_ve_rota_planlar`: ERP sistemi sipariş teslim tarihi, rota bölgesi ve stok durumuna göre sevkiyat planı önerir *(Not Alınabilir)*
  - `lojistik_sorumlusu_excelde_planlar`: Lojistik yöneticisi günlük/haftalık siparişleri Excel'e çekip araç ve teslimat planı yapar *(Not Alınabilir)*
  - `satis_ve_musteri_baskisina_gore`: Önceden plan yapılmaz; satış ekibinin veya müşterinin aciliyet baskısına göre anlık sevk edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Sevkiyat Planlama Kokpiti (Transportation / Dispatch Planning Workbench) ihtiyacını belirler.

#### [LOG-004] Araç kapasitesi veya stok yetersiz olduğunda sevkiyatlarda hangi önceliklendirme kuralı uygulanır?
- **Süreç:** Sevkiyat Planlama ve Önceliklendirme
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Sevkiyat kuyruğu öncelik kriterleri.
- **Seçenekler:**
  - `musteri_segmenti_ve_sozlesme_cezasi`: Müşteri önem derecesi (Key Account / VIP) ve gecikme cezası ilk sırayı alır *(Not Alınabilir)*
  - `kesin_siparis_ve_teslim_tarihi`: İlk sipariş veren veya teslim tarihi en eski olan önceliklidir (FIFO Sevkiyat)
  - `tam_kamyon_tam_arac_dolulugu`: Rotadaki aracı en yüksek hacim/ağırlık doluluğuna ulaştıran teslimatlar öne çekilir
  - `yonetim_anlik_karar_verir`: Yönetim/Satış direktörü acil durumlarda hangi aracın kime gideceğini manuel belirler *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sevkiyat Öncelik Kuralları (Dispatch Priority Matrix) konfigürasyonunu belirler.

---

### 3. Kısmi ve Birleştirilmiş Sevkiyat Yönetimi

#### [LOG-005] Siparişlerin kısmi olarak sevk edilmesine (parçalı teslimat) izin verilmekte midir?
- **Süreç:** Kısmi ve Birleştirilmiş Sevkiyat Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kısmi sevkiyat izni, müşteri bazlı kısıtlar ve bakiye takibi.
- **Seçenekler:**
  - `musteri_veya_siparis_bazinda_parametre`: Evet, ancak her müşterinin veya siparişin 'Kısmi Sevkiyat İzni / Toleransı' sözleşmesine göre parametrik yönetilir *(Not Alınabilir)*
  - `her_zaman_serbest_kismi_sevk`: Evet, hazır olan kalem veya miktar anında sevk edilir, kalanlar sonraki sevkiyata bakiye kalır
  - `kesinlikle_yasak_tek_seferde_teslim`: Hayır, siparişteki tüm kalemler ve miktarlar eksiksiz hazır olmadan asla sevk edilemez (Tek Seferde Teslim) *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Müşteri/Sipariş Kısmi Teslimat Bayrağı (Partial Delivery Allowed) ve Kalan Bakiye (Backorder) takibini belirler.

#### [LOG-006] Aynı müşteriye ait birden fazla farklı satış siparişi tek bir sevkiyat/araç ve tek bir irsaliyede birleştirilebiliyor mu?
- **Süreç:** Kısmi ve Birleştirilmiş Sevkiyat Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sipariş konsolidasyonu (Order Consolidation into Single Shipment).
- **Seçenekler:**
  - `sistem_otomatik_birlestirir`: Evet, aynı teslimat adresine gidecek açık siparişler tek bir sevkiyat emrinde ve tek irsaliyede konsolide edilir
  - `kullanici_manuel_birlestirir`: Kullanıcı irsaliye/sevk aşamasında ilgili siparişleri manuel seçerek birleştirir *(Not Alınabilir)*
  - `birlestirme_yapilmaz_her_siparis_ayri`: Hayır, her sipariş için mutlaka ayrı bir sevkiyat ve ayrı bir irsaliye düzenlenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çoklu Sipariş Konsolidasyon Motoru (Shipment Consolidation / Combined Deliveries) ayarlarını belirler.

---

### 4. Araç, Filo ve Taşıyıcı Yönetimi

#### [LOG-007] Sevkiyatlarda kullanılan araç ve taşıyıcı yapınız nasıldır?
- **Süreç:** Araç, Filo ve Taşıyıcı Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Özmal filo vs. Sözleşmeli nakliyeci vs. Kargo/Ambar kullanımı.
- **Seçenekler:**
  - `karma_yapi`: Karma; hem kendi özmal araçlarımız hem de sözleşmeli nakliyeciler ve kargo/ambar firmaları kullanılır *(Not Alınabilir)*
  - `sadece_dis_nakliye_ve_kargo`: Kendi aracımız yoktur; tamamen dış nakliye firmaları, ambarlar ve kargo şirketleri kullanılır *(Not Alınabilir)*
  - `sadece_ozmal_filo`: Sadece firmamıza ait özmal araç filosu ve kendi şoförlerimiz kullanılır
  - `musteri_kendi_araciyla_alir`: Nakliye yapmıyoruz; müşteriler kendi araçlarıyla depomuzdan teslim alır (Ex-Works)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Taşıyıcı ve Filo Yönetimi Modülü (Fleet Management / Carrier Integration) kapsamını belirler.

#### [LOG-008] Nakliye firması / taşıyıcı seçimi hangi kriterlere göre ve nasıl yapılmaktadır?
- **Süreç:** Araç, Filo ve Taşıyıcı Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `LOG-007` != `musteri_kendi_araciyla_alir`
- **Açıklama:** Sabit sözleşmeli tarife vs. Spot nakliye teklif toplama.
- **Seçenekler:**
  - `sistemde_tanimli_bolge_fiyat_tarifesi`: Sistemde her bölge ve araç tipi için taşıyıcıların sözleşmeli fiyat tarifeleri tanımlıdır, en uygunu seçilir *(Not Alınabilir)*
  - `spot_teklif_toplanarak_secilir`: Her büyük sevkiyatta birkaç nakliyeciden spot fiyat teklifi alınarak en ucuzuna verilir *(Not Alınabilir)*
  - `tek_anlasmali_ana_tasiyici`: Tüm nakliye işimiz tek bir lojistik firmasına veya ana kargo şirketine devredilmiştir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Taşıyıcı Tarife Sözleşmeleri (Freight Rate Agreements) ve Nakliye Masraf Matrisi mimarisini belirler.

#### [LOG-009] Özmal araçlarınızın periyodik bakım, muayene, sigorta/kasko, yakıt tüketimi ve sürücü görevlendirmeleri sistemde takip ediliyor mu?
- **Süreç:** Araç, Filo ve Taşıyıcı Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `LOG-007` == `karma_yapi`
- **Açıklama:** Filo operasyonel bakım ve maliyet takibi.
- **Seçenekler:**
  - `erp_filo_modulunde_tam_takip`: Evet, araçların tüm bakım, muayene, sigorta ve km/yakıt verileri ERP filo modülünde entegre izlenir *(Not Alınabilir)*
  - `excel_veya_harici_yazilimda`: ERP dışında bağımsız bir filo yazılımı veya Excel tablolarında manuel takip edilir
  - `takip_edilmiyor_masraf_olarak_girilir`: Sadece faturaları geldikçe muhasebeye genel gider olarak işlenir, operasyonel takip yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Filo Yönetimi (Fleet Management) ve Araç Masraf Merkezi entegrasyonunu belirler.

---

### 5. Rota, Dağıtım ve Randevu Planlama

#### [LOG-010] Şehir içi ve şehirlerarası dağıtımlarda rota planlama ve durak sıralaması nasıl yapılmaktadır?
- **Süreç:** Rota, Dağıtım ve Randevu Planlama
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Manuel rota vs. Dinamik rota optimizasyonu.
- **Seçenekler:**
  - `sistem_veya_harita_destekli_rota`: Sistem/Yazılım adres konumlarına, trafik ve araç kapasitesine göre durak sırasını optimize eder *(Not Alınabilir)*
  - `sevkiyat_sorumlusu_ve_sofor_belirler`: Sevkiyat sorumlusu ve şoför kendi tecrübesine göre güzergah ve teslimat sırasını belirler
  - `sabit_gunluk_dagitim_hatlari_var`: Her bölge için sabit haftalık/günlük dağıtım hatlarımız vardır
  - `rota_planlama_ihtiyacimiz_yok`: Çok duraklı rota ihtiyacımız yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Rota Planlama ve Harita/Coğrafi Bilgi Sistemi (GIS / Route Optimization) entegrasyonunu belirler.

#### [LOG-011] Müşterilerinizde veya teslimat noktalarında 'Randevulu Teslimat / Teslimat Zaman Penceresi' zorunluluğu var mı?
- **Süreç:** Rota, Dağıtım ve Randevu Planlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Zincir marketler, büyük fabrikalar veya AVM teslimatlarında saatlik/günlük randevu alma zorunluluğu.
- **Seçenekler:**
  - `evet_zincir_market_ve_buyuk_musteriler`: Evet, özellikle zincir marketler ve kurumsal müşterilerde portal üzerinden randevu saati alınması zorunludur *(Not Alınabilir)*
  - `sadece_gun_belirlenir_saat_esnektir`: Gün teyit edilir ancak gün içinde herhangi bir saatte teslimat yapılabilir
  - `randevu_zorunlulugu_yoktur`: Randevu gerekmez, mesai saatleri içinde doğrudan teslim edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sevkiyat Randevu Takip Sistemi (Delivery Slot & Appointment Management) altyapısını belirler.

---

### 6. Yükleme Organizasyonu ve Kapasite Kontrolü

#### [LOG-012] Araç yükleme öncesinde ağırlık (tonaj) ve hacim (desimetreküp / metreküp / palet sayısı) kapasite kontrolleri nasıl yapılır?
- **Süreç:** Yükleme Organizasyonu ve Kapasite Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Aşırı yükleme (aşırı tonaj) veya boş hacim kalmasının sistemde kontrol edilmesi.
- **Seçenekler:**
  - `sistem_hacim_ve_agirlik_kontrol_eder`: ERP sistemi sipariş kalemlerinin ağırlık ve desilerini toplayarak araç kapasitesinin aşılıp aşılmadığını otomatik denetler *(Not Alınabilir)*
  - `depo_ve_sofor_goz_karari_yukler`: Fiziksel olarak araca sığdığı kadar yüklenir, sistemde hacim/ağırlık kontrolü yapılmaz
  - `kantar_tartim_sonucuna_gore`: Araç çıkışta kantara girer, tonaj aşımı varsa fazla yük geri indirilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yükleme Optimizasyonu (Vehicle Load Capacity & Cube-Weight Calculation) motorunu belirler.

#### [LOG-013] Araç yüklemesi sırasında araç plakası, çekici/dorse no, sürücü kimlik ve telefon bilgileri sisteme kaydediliyor mu?
- **Süreç:** Yükleme Organizasyonu ve Kapasite Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Taşıma belgesi, kantar fişi ve e-İrsaliye taşıyıcı bilgileri doğrulaması.
- **Seçenekler:**
  - `sevkiyat_aninda_sisteme_zorunlu_girilir`: Evet, plaka, şoför adı-soyadı ve TC kimlik / pasaport no girilmeden irsaliye oluşturulamaz
  - `guvenlik_veya_kantar_kapida_kaydeder`: Sisteme girilmez, fabrika nizamiyesinde güvenlik defterine veya kantar yazılımına yazılır *(Not Alınabilir)*
  - `sadece_ozmal_araclarda_bilinir`: Özmal araçlarımızın plakası bellidir, dış nakliyede plaka kaydedilmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** e-İrsaliye Taşıyıcı/Şoför Zorunlu Bilgi Alanları ve Kantar Entegrasyonunu belirler.

---

### 7. İrsaliye ve Sevk Belgeleri Yönetimi (e-İrsaliye)

#### [LOG-014] Sevk İrsaliyesi / e-İrsaliye belgesi sevkiyat sürecinin hangi adımında oluşturulmakta ve onaylanmaktadır?
- **Süreç:** İrsaliye ve Sevk Belgeleri Yönetimi (e-İrsaliye)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Mal yüklenmeden önce mi, yükleme bittikten sonra mı, yoksa araç kapıdan çıkarken mi irsaliye kesilir?
- **Seçenekler:**
  - `yukleme_ve_kontrol_bittikten_hemen_sonra`: Yükleme ve son kontrol tamamlandığı anda sistemden e-İrsaliye kesilir ve GİB'e iletilir
  - `siparis_hazirlanirken_onceden_kesilir`: Depo hazırlığı başlamadan önce irsaliye kesilip depoya kâğıt çıktı verilir *(Not Alınabilir)*
  - `gun_sonunda_toplu_kesilir`: Fiziksel sevk irsaliyesiz yapılır, e-İrsaliyeler gün veya hafta sonunda topluca kesilir *(Not Alınabilir)*
  - `kantar_cikisinda_otomatik_kesilir`: Araç nizamiyedeki kantar çıkışından geçerken net ağırlığa göre otomatik kesilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** e-İrsaliye Tetikleme Zamanlaması (e-Waybill Trigger Point) ve Entegratör İş Akışını belirler.

#### [LOG-015] e-İrsaliye sürecinde iptal, red veya miktar düzeltme durumları nasıl yönetilmektedir?
- **Süreç:** İrsaliye ve Sevk Belgeleri Yönetimi (e-İrsaliye)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Yoldaki aracın e-İrsaliyesinin iptali, alıcının sistemden e-İrsaliyeyi kısmi/tam reddetmesi.
- **Seçenekler:**
  - `sistem_uzerinden_entegre_yanit_ve_fark_irsaliyesi`: Alıcının e-İrsaliye uygulama yanıtı (Kabul/Kısmi Kabul/Red) ERP'ye düşer, reddedilen miktar için otomatik ters kayıt oluşur *(Not Alınabilir)*
  - `yeni_irsaliye_kesilir_eski_iptal_edilir`: Muhasebe GİB portalından irsaliyeyi iptal eder veya yeni düzeltme irsaliyesi keser *(Not Alınabilir)*
  - `fatura_asamasinda_fark_duzeltilir`: İrsaliye ellenmez, aradaki fark fatura kesilirken manuel düşülür *(Not Alınabilir)*
  - `e_irsaliye_kullanmiyoruz`: e-İrsaliye mükellefi değiliz, matbu kâğıt irsaliye kullanıyoruz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** e-İrsaliye Uygulama Yanıtı Entegrasyonu (e-Waybill Application Response Management) mimarisini belirler.

#### [LOG-016] Sevkiyat sırasında irsaliye dışında hangi ek belgeler (Çeki Listesi / Packing List, Analiz Sertifikası, MSDS, Gümrük Beyannamesi vb.) zorunludur?
- **Süreç:** İrsaliye ve Sevk Belgeleri Yönetimi (e-İrsaliye)
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Sevk paketi belgeleri ve otomatik belge basımı.
- **Seçenekler:**
  - `ceki_listesi_ve_kalite_sertifikasi_zorunlu`: Evet, her sevkiyatta sistemden otomatik üretilen Çeki Listesi ve Kalite Analiz Sertifikası eklenir *(Not Alınabilir)*
  - `ihracat_sevkiyatlarinda_tum_gumruk_evraklari`: Yurtiçinde sadece irsaliye yeterlidir; ihracatta ATR/EUR1, Çeki Listesi ve Menşe Şahadetnamesi zorunludur *(Not Alınabilir)*
  - `sadece_sevk_irsaliyesi_yeterlidir`: İrsaliye dışında herhangi bir ek belge düzenlenmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Otomatik Sevkiyat Belge Seti Basımı (Automated Shipping Document Bundle) fonksiyonunu belirler.

---

### 8. Teslimat Doğrulaması ve Teslim Kanıtı (Proof of Delivery - POD)

#### [LOG-017] Müşterinin malları teslim aldığına dair Teslim Kanıtı (POD - Proof of Delivery) sisteme nasıl işlenmektedir?
- **Süreç:** Teslimat Doğrulaması ve Teslim Kanıtı (POD)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Islak imzalı kâğıt irsaliye nüshası vs. Mobil cihazda dijital imza / fotoğraf kanıtı.
- **Seçenekler:**
  - `mobil_surucu_uygulamasi_dijital_imza_ve_foto`: Sürücü teslim anında mobil uygulamadan müşteriye dijital imza attırır ve teslimat fotoğrafını sisteme yükler *(Not Alınabilir)*
  - `imzali_kagit_nusha_taranarak_sisteme_eklenir`: Fiziksel imzalı/kaşeli irsaliye nüshası merkeze döner, taranarak ERP'deki sevkiyat kaydına arşivlenir *(Not Alınabilir)*
  - `kargo_veya_nakliyeci_portal_entegrasyonu`: Kargo/nakliye firmasının online teslim API'sinden teslim edildi bilgisi otomatik çekilir *(Not Alınabilir)*
  - `sisteme_islenmez_fiziksel_arsivde_durur`: Sistemde teslim teyit adımı yoktur; kâğıt nüshalar klasörde saklanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Dijital Teslim Kanıtı (Proof of Delivery / POD Integration) ve Fatura Tetikleme Koşullarını belirler.

#### [LOG-018] Satış faturasının kesilmesi için teslimatın müşteriye fiilen ulaşmış olması (Teslim Teyidi) şartı aranmakta mıdır?
- **Süreç:** Teslimat Doğrulaması ve Teslim Kanıtı (POD)
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sevk anında faturalama vs. Teslim kanıtı (POD) geldikten sonra faturalama.
- **Seçenekler:**
  - `sevk_aninda_irsaliye_ile_birlikte_kesilir`: Hayır, fatura sevk anında irsaliye ile birlikte doğrudan kesilir veya sevk günü faturalandırılır
  - `teslim_kaniti_gelmeden_fatura_kesilmez`: Evet, özellikle konsinye veya onaylı teslimat gerektiren müşterilerde POD onaylanmadan fatura kesilemez *(Not Alınabilir)*
  - `ay_sonunda_toplu_faturalanir`: Ay içinde sevk edilen tüm irsaliyeler ayın son günü topluca faturaya dönüştürülür
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fatura Kesim Kuralları (Billing Trigger on Goods Issue vs. Proof of Delivery) akışını belirler.

---

### 9. Teslim Edilememe, Red ve İade Lojistiği

#### [LOG-019] Müşterinin adreste bulunamaması, kapıdan tam red veya kısmi red durumunda sevkiyat süreci nasıl işlemektedir?
- **Süreç:** Teslim Edilememe, Red ve İade Lojistiği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Geri dönen yükün kabulü, red gerekçesi ve irsaliye eşleşmesi.
- **Seçenekler:**
  - `sistemde_red_nedeni_girilir_tersine_lojistik_baslar`: Sistemde kayıtlı teslimat red gerekçesiyle kapatılır, geri gelen ürünler 'İade Mal Kabul / Karantina' deposuna otomatik yönlendirilir *(Not Alınabilir)*
  - `sofor_mallari_geri_getirir_manuel_tutanak_tutulur`: Şoför malları depoya geri getirir, kâğıt tutanak tutulur; satış ekibi yeniden sevk planlar *(Not Alınabilir)*
  - `musteri_kendi_iade_irsaliyesini_keser`: Müşteri teslim alıp beğenmediği ürün için kendi e-İrsaliyesini keserek nakliyeciyle geri yollar *(Not Alınabilir)*
  - `red_ve_iade_surecimiz_yoktur`: Red ve iade sürecimiz yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Tersine Lojistik ve İade Teslimatı (Reverse Logistics / Return Delivery Workflow) modülünü belirler.

#### [LOG-020] Teslimat sırasında oluşan hasar, kırılma veya eksiklik durumunda sorumluluk ve tazmin (hasar rücu) süreci nasıl yürütülür?
- **Süreç:** Teslim Edilememe, Red ve İade Lojistiği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Nakliyeci sigortası, hasar tutanağı ve hasarlı malın stoktan ayrıştırılması.
- **Seçenekler:**
  - `aninda_hasar_tutanagi_ve_fotograf_sisteme_islenir`: Müşteri ve şoför ortak Hasar Tespit Tutanağı imzalar, fotoğrafla birlikte sisteme girilir; nakliyeciye/sigortaya rücu edilir *(Not Alınabilir)*
  - `nakliyeci_kendi_karsilar_faturadan_kesilir`: Hasar bedeli nakliye şirketinin hakediş faturasından doğrudan mahsup edilir *(Not Alınabilir)*
  - `firmamiz_hasari_zarar_yazar`: Küçük hasarlar şirket tarafından fire/zarar yazılır, büyük hasarlarda sigorta devreye sokulur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Lojistik Hasar / Tazmin Yönetimi (Freight Claim & Damage Settlement) iş akışını belirler.

---

### 10. Kargo ve Kurye Entegrasyonu

#### [LOG-021] Anlaşmalı kargo firmaları (Yurtiçi, Aras, MNG, DHL, UPS vb.) ile doğrudan yazılımsal ERP entegrasyonu kullanılıyor mu?
- **Süreç:** Kargo ve Kurye Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Otomatik barkod alma, kargo takip numarası (Tracking No) ve durum sorgulama.
- **Seçenekler:**
  - `tam_api_entegrasyonu`: Evet, irsaliye kesildiği anda kargo API'sinden kargo barkodu ve takip no çekilir, müşteriye SMS/E-posta ile iletilir *(Not Alınabilir)*
  - `kargo_portalina_excel_aktarimi`: ERP'den sevk listesi Excel formatında alınıp kargo firmasının web portalına manuel yüklenir *(Not Alınabilir)*
  - `kargo_subesinde_manuel_islem`: Kargo personeli geldiğinde kâğıt irsaliyeden manuel barkod basar
  - `kargo_kullanmiyoruz`: Kargo veya kurye firmalarıyla çalışmıyoruz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kargo Servis Sağlayıcı Entegrasyonu (Carrier API Integration) gereksinimini belirler.

#### [LOG-022] Müşterilere kargo takip numarası ve canlı sevkiyat durum bildirimleri (SMS, E-posta, WhatsApp) otomatik gönderiliyor mu?
- **Süreç:** Kargo ve Kurye Entegrasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `LOG-021` != `kargo_kullanmiyoruz`
- **Açıklama:** Müşteri teslimat bilgilendirme otomasyonu.
- **Seçenekler:**
  - `sistem_otomatik_sms_ve_eposta_atar`: Evet, ürün kargoya verildiğinde ve teslim edildiğinde müşteriye anlık bilgilendirme gider
  - `musteri_temsilcisi_sorulursa_manuel_iletir`: Otomatik bildirim gitmez, müşteri bilgi isterse kargo portalından bakılıp söylenir *(Not Alınabilir)*
  - `musteri_bildirimi_yapilmaz`: Müşteriye takip bildirimi iletilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sevkiyat Müşteri Bildirim Entegrasyonu (Automated Shipping Notification) altyapısını belirler.

---

### 11. Müşteri Özel Sevkiyat ve Teslimat Şartları

#### [LOG-023] Müşterilerinizin (özellikle zincir marketler, ihracat alıcıları veya otomotiv ana sanayi) talep ettiği özel teslimat şartları nelerdir?
- **Süreç:** Müşteri Özel Sevkiyat ve Teslimat Şartları
- **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Euro Palet standardı, palet etiketleri, maksimum palet yüksekliği, araç özellikleri (liftli kamyon, tenteli vb.).
- **Seçenekler:**
  - `ozel_etiket_ve_sscc_barkod`: Müşteri özel sevkiyat koli/palet etiketi ve SSCC barkod formatı
  - `standart_euro_palet_ve_strecleme`: Sadece onaylı standardında Euro palet (EPAL) ve köşe koruyuculu streçleme kuralı
  - `maksimum_palet_yukseklik_ve_agirlik_siniri`: Rampa kısıtları nedeniyle palet başı maksimum yükseklik ve ağırlık sınırı
  - `arac_kasa_ozelligi`: Liftli araç, frigorifik kasa veya tenteli/açık kasa zorunluluğu
  - `ozel_teslimat_sartimiz_yok`: Özel bir teslimat şartı bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Müşteri Özel Paketleme ve Sevkiyat Talimatları (Customer-Specific Packing & Delivery Instructions) profilini belirler.

#### [LOG-024] Aynı müşterinin birden fazla teslimat adresi, şantiyesi veya deposu sisteme nasıl tanımlanmakta ve yönetilmektedir?
- **Süreç:** Müşteri Özel Sevkiyat ve Teslimat Şartları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Müşteri cari kartı altında çoklu teslimat adresleri (Ship-to Parties).
- **Seçenekler:**
  - `ana_cari_altinda_coklu_teslimat_adresi_secilir`: Evet, tek bir cari hesap altında onlarca teslimat adresi tanımlıdır; siparişte doğru sevk adresi seçilir
  - `her_adrese_ayri_alt_cari_kart_acilir`: Her teslimat yeri için bağımsız alt müşteri cari kartı açılarak yönetilir *(Not Alınabilir)*
  - `siparis_aciklamasina_manuel_yazilir`: Sistemde tek adres vardır, farklı teslimat yerleri sipariş notuna manuel yazılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Çoklu Teslim Noktası Mimarisi (Multi Ship-to Address Structure) parametrelerini belirler.

---

### 12. Navlun ve Lojistik Maliyetleri Yönetimi

#### [LOG-025] Nakliye ve navlun bedeli ticari olarak kim tarafından karşılanmaktadır (Teslim Şekilleri / Incoterms)?
- **Süreç:** Navlun ve Lojistik Maliyetleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Navlun dahil satış, alıcı ödemeli teslimat veya fatura bedeline navlun yansıtılması.
- **Seçenekler:**
  - `siparis_veya_musteri_bazinda_degisir`: Değişken; bazı müşterilere navlun dahil (C-şartları/DAP), bazılarına alıcı ödemeli veya belirli sepet tutarı üstü ücretsiz sevk edilir *(Not Alınabilir)*
  - `her_zaman_firmasi_tarafindan_odenir`: Tüm satışlarımız adrese teslimdir; navlunu her zaman firmamız karşılar ve ürün fiyatına dahildir
  - `her_zaman_alici_oder`: Tüm sevkiyatlarda nakliye masrafı müşteriye aittir (Fabrika Teslim / Ex-Works)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Teslim Şekli ve Navlun Fatura Yansıtma Kuralları (Incoterms & Freight Pricing Conditions) mimarisini belirler.

#### [LOG-026] Dış nakliyecilerden ve kargo firmalarından gelen navlun faturaları sevkiyat/sipariş bazında eşleştirilip doğrulanmakta mıdır?
- **Süreç:** Navlun ve Lojistik Maliyetleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Nakliye faturası kontrolü (Freight Invoice Verification / 3-Way Match with Transportation Order).
- **Seçenekler:**
  - `sistemde_anlasmali_tarife_ile_otomatik_eslesir`: Evet, nakliyeci faturası sistemdeki sevkiyat kaydı ve sözleşmeli tarife fiyatı ile otomatik karşılaştırılır *(Not Alınabilir)*
  - `lojistik_ve_muhasebe_manuel_kontrol_eder`: Lojistik sorumlusu faturadaki sevk listelerini tek tek Excel'den kontrol edip onaylar *(Not Alınabilir)*
  - `toplu_kontrolsuz_odeme_yapilir`: Ayrıntılı sevkiyat eşleştirmesi yapılmaz, nakliyecinin kestiği genel cari fatura onaylanıp ödenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Navlun Faturası Denetim Modülü (Freight Settlement & Verification) gereksinimini belirler.

#### [LOG-027] Gerçekleşen nakliye ve dağıtım maliyetleri sipariş veya ürün bazında kârlılık analizine (COPA) dağıtılmakta mıdır?
- **Süreç:** Navlun ve Lojistik Maliyetleri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Müşteri ve sipariş net kârlılığında lojistik maliyet payı.
- **Seçenekler:**
  - `siparis_ve_musteri_karliligina_tam_dagitilir`: Evet, her teslimatın gerçek navlun payı ilgili satış siparişine maliyet yazılarak net sipariş kârlılığı ölçülür *(Not Alınabilir)*
  - `sadece_donemsel_genel_pazarlama_gideri_yazilir`: Sipariş bazında dağıtılmaz, genel muhasebede 760 Pazarlama Satış Dağıtım giderine topluca atılır
  - `lojistik_maliyeti_karlilikta_izlenmez`: Nakliye maliyetlerinin ürün/müşteri kârlılığına etkisi analiz edilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kârlılık Analizi Lojistik Masraf Dağıtımı (CO-PA Freight Cost Allocation) altyapısını belirler.

---

### 13. Dış Kaynak Lojistik ve 3PL Yönetimi

#### [LOG-028] Şirketiniz dış kaynak lojistik hizmet sağlayıcıları (3PL - Üçüncü Parti Lojistik Depo veya Dağıtım) kullanmakta mıdır?
- **Süreç:** Dış Kaynak Lojistik ve 3PL Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Harici 3PL depo ve dağıtım merkezi entegrasyonu.
- **Seçenekler:**
  - `evet_3pl_depo_ve_dagitim_kullaniyoruz`: Evet, belirli bölgelerdeki depolarımız ve dağıtımımız 3PL lojistik firmaları tarafından yürütülmektedir *(Not Alınabilir)*
  - `sadece_nakliye_icin_kullaniyoruz_depo_bizim`: Depolama tamamen kendi bünyemizdedir; sadece nakliye/taşıma için lojistik firmaları kullanılır
  - `3pl_kullanmiyoruz_tum_operasyon_ic_kaynak`: Hayır, hem depolama hem de sevkiyat tamamen kendi şirket kaynaklarımızla yönetilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** 3PL Arayüz Entegrasyonu (Third-Party Logistics / 3PL EDI Interface) gereksinimini belirler.

#### [LOG-029] 3PL lojistik firması ile stok, sevk emri ve teslimat teyidi veri akışı nasıl sağlanmaktadır?
- **Süreç:** Dış Kaynak Lojistik ve 3PL Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `LOG-028` == `evet_3pl_depo_ve_dagitim_kullaniyoruz`
- **Açıklama:** EDI / Web Servis / API vs. Manuel Excel e-posta trafiği.
- **Seçenekler:**
  - `otomatik_edi_api_arayuzu_ile`: ERP'den sevk emirleri 3PL sistemine otomatik düşer; 3PL'in irsaliye ve teslim teyitleri ERP'ye anlık geri akar *(Not Alınabilir)*
  - `gunluk_excel_ve_eposta_ile`: Sevk listeleri her sabah Excel ile e-posta atılır, gün sonunda gerçekleşenler yine Excel ile alınıp sisteme girilir *(Not Alınabilir)*
  - `3pl_in_kendi_portalindan_manuel_girilir`: Personelimiz 3PL'in web ekranına girip siparişleri manuel açar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** 3PL Veri Değişim Protokolü (EDIFACT, XML, REST API) tasarımını belirler.

---

### 14. İhracat Sevkiyatları ve Gümrük Çıkış Süreçleri

#### [LOG-030] Yurtdışı (İhracat) sevkiyatlarınız var mı ve gümrükleme/konteyner yükleme süreçleri nasıl yürütülüyor?
- **Süreç:** İhracat Sevkiyatları ve Gümrük Çıkış Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Gümrük beyannamesi, intaç tarihi, konteyner mühürleme ve gümrük müşaviri entegrasyonu.
- **Seçenekler:**
  - `evet_duzenli_ihracat_gumruk_musaviri_ile`: Evet, düzenli ihracatımız var; gümrük müşaviri ve nakliye acentesi ile entegre konteyner/tır sevkiyatları yapılır *(Not Alınabilir)*
  - `mikro_ihracat_hizli_kargo_ile`: Sadece ETGB kapsamında mikro ihracat ve kargo gönderileri yapılır *(Not Alınabilir)*
  - `nadir_proje_bazli_ihracat`: Yılda birkaç kez proje bazlı yurtdışı sevkiyatı yapılmaktadır
  - `ihracatimiz_yok_sadece_yurtici`: Hayır, sadece yurtiçi sevkiyat yapıyoruz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** İhracat Lojistiği ve Gümrük Çıkış Modülü (Export Logistics & Customs Declaration Tracking) kapsamını belirler.

#### [LOG-031] İhracatta fiili çıkış tarihi (İntaç Tarihi / VEDOP kapanma) sisteme işlenerek KDV iadesi ve muhasebe kapatması nasıl yapılır?
- **Süreç:** İhracat Sevkiyatları ve Gümrük Çıkış Süreçleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `LOG-030` != `ihracatimiz_yok_sadece_yurtici`
- **Açıklama:** Gümrük çıkış beyannamesi (GBB/VEDOP) kapanış tarihi entegrasyonu.
- **Seçenekler:**
  - `gumruk_entegrasyonu_veya_musavir_ile_otomatik`: Gümrük müşavirliği yazılımından fiili intaç tarihi ERP'ye otomatik akar ve kur farkı/KDV kaydı kapanır *(Not Alınabilir)*
  - `muhasebe_vedoptan_sorgulayip_manuel_isler`: Mali işler GİB VEDOP ekranından intaç tarihini sorgulayıp ERP'deki ihracat faturasına manuel yazar *(Not Alınabilir)*
  - `intac_takibi_yapilmaz_fatura_tarihi_esas`: Fiili intaç tarihi sisteme işlenmez, fatura tarihi baz alınır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** İhracat Kapanış ve VEDOP İntaç Entegrasyonu (Customs Export Clearance & Currency Valuation) mimarisini belirler.

---

### 15. Sevkiyat Güvenliği, Kantar ve Mühür Yönetimi

#### [LOG-032] Sevkiyatta araç kantar tartımı (Dolu Kantar / Boş Kantar) yapılmakta ve tartım fişi sistemle entegre olmakta mıdır?
- **Süreç:** Sevkiyat Güvenliği, Kantar ve Mühür Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Dökme yük veya paletli yüklerde kantar otomasyonu.
- **Seçenekler:**
  - `kantar_cihazi_erp_ile_tam_entegre`: Evet, araç kantara girdiğinde net ağırlık doğrudan ERP sevk irsaliyesi kalemine aktarılır *(Not Alınabilir)*
  - `ayri_kantar_programi_ciktisi_kullanilir`: Kantarın ayrı bir PC yazılımı vardır, tartım fişi basılır ve irsaliyeye zımbalanır *(Not Alınabilir)*
  - `kantar_tartimi_yapilmaz`: Ürünlerimiz adet/koli bazlıdır, kantar tartımına ihtiyaç duyulmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Endüstriyel Kantar Cihazı / Seri Port Entegrasyonu (Weighbridge Serial Port Integration) gereksinimini belirler.

#### [LOG-033] Kamyon, tır kasası veya konteyner çıkışlarında güvenlik mühür numarası (Seal No) takibi yapılıyor mu?
- **Süreç:** Sevkiyat Güvenliği, Kantar ve Mühür Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `low`
- **Açıklama:** Mühür no'nun irsaliye ve çeki listesinde beyanı.
- **Seçenekler:**
  - `muhur_no_irsaliye_ve_gumruk_belgesine_yazilir`: Evet, araç mühürlenir ve mühür numarası sisteme girilerek irsaliye/çeki listesine basılır *(Not Alınabilir)*
  - `sadece_ihracat_konteynerlerinde`: Sadece yurtdışı deniz ve tır konteyner sevkiyatlarında mühür takılır
  - `muhur_takibi_yapilmaz`: Mühür uygulamamız bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Güvenlik Mührü ve Sevkiyat Kilidi (Seal Number Tracking) alanlarını belirler.

---

### 16. Sevkiyat Performansı, OTIF ve KPI'lar

#### [LOG-034] Lojistik ve sevkiyat operasyonlarınızda hangi temel performans göstergeleri (KPI) düzenli ölçülmektedir?
- **Süreç:** Sevkiyat Performansı, OTIF ve KPI'lar
- **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** OTIF, gecikme günleri, taşıyıcı başarı oranı vb.
- **Seçenekler:**
  - `otif_tam_ve_zamaninda_teslimat`: OTIF (On-Time In-Full — Zamanında ve Eksiksiz Teslimat Oranı)
  - `sevkiyat_gecikme_suresi`: Ortalama Sevkiyat Gecikme Süresi
  - `teslimat_basari_orani`: İlk Seferde Başarılı Teslimat Oranı
  - `sevkiyat_ve_koli_basi_maliyet`: Koli / Palet / Sefer Başına Ortalama Nakliye Maliyeti
  - `tasiyici_ve_sofor_performansi`: Taşıyıcı / Kargo Firması Performans ve Şikayet Oranı
  - `hasarli_ve_hatali_teslimat_orani`: Sevkiyatta Hasar ve Eksik Malzeme Oranı *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Lojistik Yönetici Kokpiti (Logistics Performance Dashboard & OTIF Engine) gereksinimini belirler.

#### [LOG-035] Söz verilen teslim tarihi (Commitment Date) ile fiili teslim tarihi arasındaki sapmaların nedenleri sistemde kategorize edilip raporlanıyor mu?
- **Süreç:** Sevkiyat Performansı, OTIF ve KPI'lar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Gecikme kök neden analizi.
- **Seçenekler:**
  - `gecikme_neden_kodlari_zorunlu_girilir`: Evet, geciken her sevkiyatta standart bir neden kodu seçilir ve raporlanır *(Not Alınabilir)*
  - `manuel_aylik_toplantida_konusulur`: Sistemde neden kodu yoktur, gecikmeler aylık operasyon toplantısında Excel'den konuşulur
  - `gecikme_nedenleri_olculmez`: Gecikme nedenleri analiz edilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Sevkiyat Gecikme Kök Neden Analizi (Delay Reason Code Analysis) modülünü belirler.

#### [LOG-036] Müşterilere sevkiyat sonrasında otomatik 'Lojistik ve Teslimat Memnuniyet Anketi' gönderilmekte midir?
- **Süreç:** Sevkiyat Performansı, OTIF ve KPI'lar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `low`
- **Açıklama:** Müşteri teslimat deneyimi ölçümü (CSAT / NPS).
- **Seçenekler:**
  - `sistem_otomatik_memnuniyet_anketi_atar`: Evet, teslimat tamamlandığında müşteriye SMS/E-posta ile 1-5 puanlık teslimat değerlendirme linki gider *(Not Alınabilir)*
  - `musteri_hizmetleri_orneklem_arama_yapar`: Müşteri temsilcileri belirli müşterileri telefonla arayarak teslimat durumunu sorar
  - `teslimat_anketi_uygulanmiyor`: Lojistik memnuniyet anketi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Müşteri Deneyimi & Lojistik CSAT (Post-Delivery Customer Feedback) entegrasyonunu belirler.

---

### 17. İade Alım ve Müşteriden Toplama Lojistiği

#### [LOG-037] Müşteriden arızalı, fazla veya iade malzemelerin kendi aracınız veya anlaşmalı nakliyeci ile aldırılması (Toplama / Pickup Emri) nasıl organize edilir?
- **Süreç:** İade Alım ve Müşteriden Toplama Lojistiği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteriden mal toplama emri ve taşıyıcı koordinasyonu.
- **Seçenekler:**
  - `sistemden_tasiyiciya_otomatik_toplama_emri_gider`: Sistemde onaylanan İade Talebinden kargo/nakliyeciye otomatik 'Adresten Alım / Pickup Emri' iletilir *(Not Alınabilir)*
  - `sevkiyat_ekibi_donus_aracina_yukletir`: Bölgeye mal götüren kendi aracımızın dönüş yükü olarak müşteriden aldırılır *(Not Alınabilir)*
  - `musteri_kendisi_gonderir_biz_karismayiz`: Müşteri kendi ayarladığı kargo veya ambarla gönderir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Tersine Lojistik Toplama Talebi (Return Pickup Order / Reverse Dispatch) iş akışını belirler.
