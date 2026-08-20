# FAZ-26 — İş Emirleri / WORK_ORDERS Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.work_orders.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `WORK_ORDERS` (İş Emirleri)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Fabrika Müdürleri, Üretim Şefleri, Endüstri Mühendisleri, Çözüm Mimarları ve ERP/MES Proje Yöneticileri  
**Amaç:** Türkiye'deki orta ve büyük ölçekli sanayi ve üretim işletmelerinde ERP/MES dönüşümü öncesinde üretim iş emri oluşturma (Manuel, Planlı emirden dönüşüm, Satış siparişinden), onay ve sahaya serbest bırakma (Release), iş emri yaşam döngüsü statüleri, mamul ve yarı mamul iş emirleri hiyerarşisi (Parent-Child), reçete dondurma (BOM Snapshot) ve revizyon kilitleme, rota kopyası (Routing Snapshot) ve alternatif operasyonlar, iş merkezi ve operatör/ekip ataması, sahada barkod/kiosk/terminal ile operasyon başlatma/durdurma, operasyon bazlı gerçekleşen üretim teyidi (Confirmation) ve kısmi bildirimler (Partial Confirmation), gerçekleşen üretim miktarları (Sağlam, Fire, Hurda, Rework), fiili hammadde ve malzeme sarfı (Material Issue), üretim bildirimiyle otomatik tüketim (Backflush) ve düzeltmeler, ek sarf ve ikame malzeme yönetimi, girdi-çıktı lot/seri izlenebilirliği (Genealogy), fiili işçilik adam-saat ve makine çalışma süreleri, duruş/bekleme süreleri ve duruş neden kodları (Downtime Reasons), rework/yeniden işleme rotaları ve iş emirleri, operasyonlar arası kalite beklemesi/blokajı, mamul ve yarı mamullerin ambara stok girişi (Goods Receipt), iş emri teknik/mali kapanış kuralları, planlanan vs gerçekleşen (Plan vs Actual) sapma analizleri ve üretim icra KPI'larının AS-IS durumunu ve ERP/MES gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | WORK_ORDERS ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **PRODUCTION_PLANNING** | Ne üretilmeli, ne kadar, ne zaman, hangi kaynakta, MPS, MRP patlatması, net ihtiyaç, lot büyüklükleri, sonlu/sonsuz kapasite yükleme, darboğaz yönetimi | **PRODUCTION_PLANNING planlama yapar.** WORK_ORDERS sahada gerçekte ne olduğunu sorgular: İş emri açılışı, serbest bırakma, operatör, fiili sarf, fire, gerçekleşen süreler, mamul girişi ve iş emri kapanışı. *(0 MRP/Forecast/Kapasite sorusu)*. |
| **INVENTORY** | Envanter ana verisi, ambar bakiyeleri, min/max seviyeleri, stok maliyetleme | **INVENTORY genel ambar stoğunu yönetir.** WORK_ORDERS iş emrinde hangi hammadde lotunun fiilen sarf edildiğini ve hangi mamul lotunun üretildiğini sorgular. |
| **WAREHOUSE** | Fiziksel depo adresleme, raf yerleşimi, toplama (picking), putaway | **WAREHOUSE depo içi fiziksel hareketleri yönetir.** WORK_ORDERS üretime malzeme besleme tetiklemesini ve üretimden çıkan mamulün ambara bildirimini sorgular. |
| **MAINTENANCE** | Makine arıza tamiri, periyodik bakım takvimi, kalibrasyon | **MAINTENANCE bakım müdahalesini yönetir.** WORK_ORDERS üretim iş emri esnasında meydana gelen duruş süresini ve duruş neden kodunu sorgular. |
| **QUALITY** | Giriş/proses muayeneleri, numune ölçümleri, NCR, CAPA | **QUALITY muayene adımlarını ve uygunsuzlukları yönetir.** WORK_ORDERS iş emrinin kalite beklemesi nedeniyle bloke kalmasını ve kalite onay kilitlerini sorgular. |
| **WORK_ORDERS** | İş emri yaşam döngüsü, parent-child hiyerarşisi, BOM snapshot, routing snapshot, operatör kaydı, saha terminali, gerçekleşen miktar, fire kodları, malzeme sarfı, backflush, ikame malzeme, lot şeceresi, duruşlar, rework, mamul girişi, kapanış ve plan vs actual sapmaları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular saha üretim icrası ve iş emri yönetimi odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (25 Kanonik Süreç / 45 Soru)

1. **Üretim İş Emri Oluşturma** (2 Soru — WOR-001, WOR-002)
2. **Planlı Emirden Dönüşüm** (2 Soru — WOR-003, WOR-004)
3. **İş Emri Onay / Serbest Bırakma** (2 Soru — WOR-005, WOR-006)
4. **İş Emri Statüleri** (2 Soru — WOR-007, WOR-008)
5. **Mamul / Yarı Mamul İş Emirleri** (2 Soru — WOR-009, WOR-010)
6. **BOM / Reçete Snapshot** (2 Soru — WOR-011, WOR-012)
7. **Rota / Operasyon Snapshot** (2 Soru — WOR-013, WOR-014)
8. **İş Merkezi Ataması** (2 Soru — WOR-015, WOR-016)
9. **Operatör / Ekip Ataması** (2 Soru — WOR-017, WOR-018)
10. **Operasyon Başlatma** (2 Soru — WOR-019, WOR-020)
11. **Operasyon Bildirimi** (2 Soru — WOR-021, WOR-022)
12. **Üretim Miktarı Bildirimi** (2 Soru — WOR-023, WOR-024)
13. **Fire / Hatalı Ürün** (2 Soru — WOR-025, WOR-026)
14. **Malzeme Sarfı** (2 Soru — WOR-027, WOR-028)
15. **Backflush ve Otomatik Sarf** (2 Soru — WOR-029, WOR-030)
16. **Ek Sarf / İkame Malzeme** (2 Soru — WOR-031, WOR-032)
17. **Lot / Seri İzlenebilirliği** (2 Soru — WOR-033, WOR-034)
18. **İşçilik ve Makine Süresi** (2 Soru — WOR-035, WOR-036)
19. **Duruş / Bekleme Nedenleri** (2 Soru — WOR-037, WOR-038)
20. **Rework / Yeniden İşleme** (2 Soru — WOR-039, WOR-040)
21. **Kalite Bekleme / Blokaj** (1 Soru — WOR-041)
22. **Mamul / Yarı Mamul Girişi** (1 Soru — WOR-042)
23. **İş Emri Kapanışı** (1 Soru — WOR-043)
24. **Planlanan / Gerçekleşen Karşılaştırması** (1 Soru — WOR-044)
25. **Üretim İş Emri KPI** (1 Soru — WOR-045)

---

## 3. Detaylı Soru Kataloğu ve ERP/MES Karar Etkisi

### 1. Üretim İş Emri Oluşturma

#### [WOR-001] Fabrikanızda üretim faaliyetlerini başlatan resmi Üretim İş Emirleri (Production Work Order / İmalat Emri) hangi tetikleyici mekanizmayla (Satış Siparişinden, MRP Planlı Emrinden, Projeden, Manuel) açılmaktadır?
- **Süreç:** Üretim İş Emri Oluşturma | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `mrp_veya_satis_siparisi_onaylandiginda_sistemden_resmi_is_emri_olarak_otomatik_veya_tek_tikla_acilir`: Evet; MRP önerisi veya kesin satış siparişi onaylandığında sistemde numaralı resmi iş emri olarak açılır
  - `planlamaci_veya_ustabasi_sisteme_girip_her_is_icin_tek_tek_manuel_is_emri_olusturur`: Otomatik açılış yoktur; planlamacı veya ustabaşı ekrandan her iş için manuel iş emri oluşturur
  - `sistemik_is_emri_yoktur_kagit_form_veya_excel_is_dagitim_listesiyle_uretime_baslanir`: Sistemde iş emri açılmaz; matbu kağıt veya Excel iş listesi yazdırılarak sahaya verilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Açılış Tetikleyicisi ve Numaralandırma Mimarisini belirler.

#### [WOR-002] Sık tekrarlanan seri üretimler veya özel müşteri projeleri için standart şablonlardan türetilen Şablon İş Emirleri (Template Work Orders) kullanılmakta mıdır?
- **Süreç:** Üretim İş Emri Oluşturma | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `sablon_is_emirleri_tanimlidir_tekrar_eden_islerde_saniyeler_icinde_is_emri_turetir`: Evet; standart ürünler için şablonlar hazırdır; miktar ve termin girilerek hızla iş emri açılır
  - `her_seferinde_urun_ve_recete_bastan_secilerek_standart_is_emri_acilir`: Şablon yoktur; her defasında mamul kodu, reçete ve rota baştan seçilerek açılır
  - `sablon_is_emri_kullanilmamaktadir`: Şablon iş emri kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Şablon İş Emri ve Hızlı Açılış Altyapısını belirler.

---

### 2. Planlı Emirden Dönüşüm

#### [WOR-003] Üretim planlama (MRP/MPS) tarafından üretilen Planlı Emirlerin (Planned Orders) sahadaki fiili Üretim İş Emrine dönüştürülmesi ve kesinleştirilmesi (Firming) süreci sistemde nasıl işletilmektedir?
- **Süreç:** Planlı Emirden Dönüşüm | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `planlama_kokpitinde_planli_emirler_secilip_tek_tikla_veya_toplu_olarak_kesin_is_emrine_donusturulur`: Evet; planlamacı onayladığı planlı emirleri tek tıkla kesinleştirir; sistem reçeteyi ve rotayı bağlayarak iş emrini üretir
  - `planli_emir_kavrami_yoktur_talep_dogrudan_fiili_is_emri_olarak_acilir`: Planlı emir aşaması yoktur; sisteme girilen her üretim talebi doğrudan fiili iş emri olarak oluşur
  - `planli_emirden_donusum_manuel_veri_girisiyle_yapilir`: Otomatik dönüşüm yoktur; planlamacı plandaki miktara bakarak üretim ekranına baştan manuel iş emri girer *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Planlı Emirden Kesin İş Emrine Dönüşüm (Firming) İş Akışını belirler.

#### [WOR-004] Müşteri satış siparişi veya haftalık üretim programı kapsamında birden fazla mamul ve yarı mamul için Toplu İş Emri Oluşturma (Mass Work Order Creation) kabiliyeti kullanılmakta mıdır?
- **Süreç:** Planlı Emirden Dönüşüm | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `haftalik_veya_siparis_bazinda_onlarca_is_emri_tek_seferde_toplu_olarak_olusturulabilir`: Evet; haftalık programdaki tüm kalemler veya çok satırlı bir satış siparişi tek seferde toplu iş emrine çevrilir
  - `is_emirleri_yalnizca_tek_tek_acilir_toplu_islem_yapilamaz`: Toplu açılış yoktur; planlamacı her ürün ve yarı mamul için tek tek iş emri açmak zorundadır
  - `toplu_is_emri_olusturma_kullanilmamaktadir`: Toplu iş emri oluşturma kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Toplu İş Emri Oluşturma ve Sipariş Grubu Eşleştirme Motorunu belirler.

---

### 3. İş Emri Onay / Serbest Bırakma

#### [WOR-005] Açılan bir iş emrinin sahaya verilip üretime başlanabilmesi için resmi bir Serbest Bırakma / Onaylama (Release / Sahaya Verme) aşaması var mıdır?
- **Süreç:** İş Emri Onay / Serbest Bırakma | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `is_emri_once_taslak_acilir_yetkili_serbest_birakmadan_release_sahada_islem_yapilamaz`: Evet; iş emri serbest bırakılmadan (Release) sahada barkod okutulamaz, malzeme çekilemez veya operasyon başlatılamaz
  - `is_emri_acildigi_an_otomatik_serbesttir_ayri_bir_onay_adimi_yoktur`: Ayrı bir release adımı yoktur; iş emri oluşturulduğu anda sahada işlem yapılabilir durumdadır
  - `serbest_birakma_kagit_formun_imzalanmasiyla_fiziki_yurutulur`: Sistemik kilit yoktur; üretim müdürü kağıt formu imzalayıp ustabaşına teslim edince iş serbest sayılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Serbest Bırakma (Release) Onay Hiyerarşisini belirler.

#### [WOR-006] İş emri serbest bırakılırken reçetedeki hammadde ve yarı mamullerin ambarda eksik olması durumunda sistemin iş emrini serbest bırakmayı engellemesi veya uyarı vermesi sağlanmakta mıdır?
- **Süreç:** İş Emri Onay / Serbest Bırakma | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `malzeme_eksikse_sistem_is_emrini_serbest_birakmaz_veya_onay_icin_yonetici_sifresi_ister`: Evet; ambarda hammadde hazır değilse iş emri serbest bırakılamaz; hat başında malzeme beklemesi engellenir
  - `malzeme_eksik_olsa_da_is_emri_serbest_birakilabilir_yalnizca_uyari_gorunur`: Sert kilit yoktur; sistem sarı uyarı verir fakat planlamacı isterse iş emrini yine de sahaya verebilir
  - `serbest_birakmada_malzeme_kontrolu_yapilmamaktadir`: Serbest bırakma esnasında malzeme mevcudiyet kontrolü yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Serbest Bırakma Aşamasında Otomatik Malzeme Meşguliyet/Eksiklik Denetimini belirler.

---

### 4. İş Emri Statüleri

#### [WOR-007] İş emirlerinin sahadaki anlık durumları sistemde standart statülerle (Taslak, Serbest Bırakıldı, Üretimde / Başladı, Duraklatıldı / Beklemede, Tamamlandı, Kapatıldı, İptal) takip edilmekte midir?
- **Süreç:** İş Emri Statüleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_is_emirleri_sistemde_resmi_statuler_taslak_serbest_uretimde_tamamlandi_kapandi_ile_anlik_izlenir`: Evet; bir iş emrinin sahada hangi aşamada olduğu statüsünden (Taslak -> Serbest -> Üretimde -> Tamamlandı -> Kapandı) canlı izlenir
  - `yalnizca_acik_ve_kapali_seklinde_2_statu_vardir_ara_durumlar_gorulemez`: Statü yapısı sığdır; iş emri ya 'Açık' ya 'Kapalı' görünür, sahada başlayıp başlamadığı anlaşılamaz
  - `is_emri_statuleri_sistemde_takip_edilmemektedir`: İş emri statüleri sistemde takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Yaşam Döngüsü Statü Haritasını belirler.

#### [WOR-008] İş emirlerine aciliyet ve müşteri önemine göre Öncelik Seviyesi (Acil / Yüksek / Standart / Düşük) atanabilmekte ve saha ekranlarında işler bu önceliğe göre sıralanmakta mıdır?
- **Süreç:** İş Emri Statüleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `oncelik_seviyesi_atanir_ve_operator_ekraninda_acil_isler_otomatik_olarak_en_uste_dizilir`: Evet; iş emrine acil kodu verildiğinde operatörün kiosk/terminal ekranında en üstte kırmızı olarak öne çıkar
  - `oncelik_kodu_vardir_ancak_siralamayi_otomatik_etkilemez_ustabasi_sozlu_yonlendirir`: Öncelik seçilir fakat ekran sırasını değiştirmez; ustabaşı personele 'Önce şu işi yap' diye sözlü söyler
  - `is_emri_oncelik_takibi_yapilmamaktadir`: İş emri öncelik takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Saha Önceliklendirme ve Kiosk Sıralama Algoritmasını belirler.

---

### 5. Mamul / Yarı Mamul İş Emirleri

#### [WOR-009] Çok seviyeli ürünlerde nihai mamul iş emri ile alt yarı mamul iş emirleri arasında Hiyerarşik Bağ (Parent-Child / Üst İş Emri - Alt İş Emri İlişkisi) kurulmakta mıdır?
- **Süreç:** Mamul / Yarı Mamul İş Emirleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `ust_ve_alt_is_emirleri_parent_child_hiyerarsisiyle_birbirine_baglidir_tum_zincir_tek_ekranda_gorulur`: Evet; ana mamul iş emri açıldığında altındaki tüm yarı mamul iş emirleri hiyerarşik olarak açılır ve birbirine bağlı izlenir
  - `her_yari_mamul_icin_bagimsiz_ayri_bir_is_emri_acilir_aralarinda_sistemik_bag_yoktur`: Yarı mamuller için ayrı iş emri açılır fakat bunlar birbirinden bağımsızdır; hangi yarı mamulün hangi mamule gittiği sistemde görünmez
  - `tek_seviyeli_is_emri_kullanilir_yari_mamuller_ayri_is_emri_olmaz`: Tek seviyeli iş emri kullanılır; yarı mamuller için ayrı iş emri açılmaz, tüm işlemler tek emirde toplanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Çok Seviyeli İş Emri Hiyerarşisi (Parent-Child Work Order Network) Tasarımını belirler.

#### [WOR-010] Alt yarı mamul iş emri üretilip tamamlanmadan, onu girdi olarak kullanan üst montaj iş emrinin başlatılması sistem tarafından engellenmekte midir?
- **Süreç:** Mamul / Yarı Mamul İş Emirleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WOR-009 != "tek_seviyeli_is_emri_kullanilir_yari_mamuller_ayri_is_emri_olmaz"`
- **Seçenekler:**
  - `alt_yari_mamul_stoga_girmeden_ust_montaj_is_emrinin_baslatilmasina_sistem_izin_vermez`: Evet; alt yarı mamul tamamlanıp ambara/hatta teslim edilmeden üst montaj iş emri başlatılamaz
  - `sistem_uyari_verir_ancak_fiziki_olarak_parca_hazirsa_operator_ust_isi_baslatabilir`: Sert kilit yoktur; sistem uyarı verir fakat fiili montaj başlamışsa üst iş emri kaydı başlatılabilir
  - `is_emirleri_arasi_bagimlilik_kiliti_bulunmamaktadir`: İş emirleri arasında tamamlama bağımlılık kilidi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Alt/Üst İş Emri Başlatma Bağımlılık Kilidi Kurgusunu belirler.

---

### 6. BOM / Reçete Snapshot

#### [WOR-011] Bir iş emri açıldığında ürün ağacının (BOM) o anki güncel kopyası İş Emri Reçetesi (BOM Snapshot) olarak dondurulmakta mıdır; sonradan ana BOM revize edilse bile açık iş emri kendi açılış reçetesini korur mu?
- **Süreç:** BOM / Reçete Snapshot | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `is_emri_acildiginda_bom_kopyasi_dondurulur_ana_bom_degisse_de_is_emri_kendi_recetesini_korur`: Evet; iş emri açıldığı andaki reçete kopyalanır (BOM Snapshot); ana reçetede yapılan revizyon açık iş emrini bozmaz
  - `is_emri_canli_bom_a_baglidir_ana_recete_degisirse_acik_is_emrinin_malzemeleri_de_otomatik_degisir`: Snapshot yoktur; iş emri canlı ana BOM'a bağlıdır, ana reçete değişirse açık iş emrinin ihtiyaçları da anında değişir
  - `bom_snapshot_kavrami_bilinmemekte_veya_kullanilmamaktadir`: BOM snapshot kavramı kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri BOM Snapshot Mimarisi ve Geçmiş Üretim Audit Güvenliğini belirler.

#### [WOR-012] Özel bir sipariş veya üretim zorunluluğu nedeniyle yetkili mühendis/planlamacı tarafından ana ürün ağacını bozmadan yalnızca o İş Emrine Özel Bileşen veya Sarf Miktarı Değişikliği (Order-Specific BOM Change) yapılabilmekte midir?
- **Süreç:** BOM / Reçete Snapshot | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `yetkili_kullanici_ana_bom_u_bozmadan_yalnizca_ilgili_is_emrinde_malzeme_ekleyip_miktar_degistirebilir`: Evet; yalnızca o iş emrine mahsus olmak üzere ek hammadde eklenebilir veya sarf miktarı yetkiyle revize edilebilir
  - `is_emrindeki_malzemeler_kilitlidir_degisiklik_icin_ana_bom_degistirilip_is_emri_bastan_acilir`: İş emri üzerinde değişiklik yapılamaz; değişiklik gerekiyorsa ana reçete değiştirilip yeni iş emri açılır
  - `is_emrine_ozel_recete_degisikligi_yapilamamaktadir`: İş emrine özel reçete değişikliği yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Düzeyinde Münferit Reçete Revizyon Yetkisi ve Esnekliğini belirler.

---

### 7. Rota / Operasyon Snapshot

#### [WOR-013] İş emri oluşturulduğunda standart üretim rotası İş Emri Rotası (Routing Snapshot) olarak kopyalanmakta mıdır ve gerektiğinde sahada operasyon ekleme/silme (Örn. Ekstra zımpara veya ara kontrol operasyonu) yapılabilmekte midir?
- **Süreç:** Rota / Operasyon Snapshot | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `rota_is_emrine_kopyalanir_ve_yetkiyle_o_is_emrine_ozel_ekstra_operasyon_eklenebilir_silinebilir`: Evet; iş emri rotası bağımsız kopyadır; gerekirse sadece o iş için 'Ekstra Temizlik' veya 'Fason Taşlama' operasyonu eklenebilir
  - `rota_kilitlidir_standart_operasyonlar_disinda_is_emrinde_hicbir_adim_degistirilemez`: Rota kilitlidir; ana rotada ne varsa iş emri o sırayı takip etmek zorundadır, münferit operasyon eklenemez
  - `sistemde_operasyon_adimlari_takip_edilmemektedir`: Sistem üzerinde operasyon adımları takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Routing Snapshot ve Sahada Dinamik Operasyon Ekleme Esnekliğini belirler.

#### [WOR-014] İş emrindeki bir operasyon için tezgâh arızası veya yoğunluk nedeniyle standart iş merkezi yerine Onaylı Alternatif İş Merkezi seçilerek operasyon o tezgâha aktarılabilmekte midir?
- **Süreç:** Rota / Operasyon Snapshot | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `operasyon_esnasinda_alternatif_tezgah_secilebilir_ve_islem_o_tezgahin_maliyetiyle_kaydolur`: Evet; operatör veya ustabaşı iş emrindeki tezgâhı listeden alternatif bir makineye kolayca yönlendirebilir
  - `baska_tezgahta_islenir_ancak_sistemde_standart_tezgah_uzerinde_tamamlanmis_gosterilir`: Fiziken başka makinede işlenir fakat sistemde orijinal planlanan makinede yapılmış gibi onaylanır
  - `alternatif_is_merkezi_secimi_yapilamamaktadir`: Alternatif iş merkezi seçimi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Operasyon Esnasında Alternatif Tezgâh Yönlendirme ve Gerçek Maliyet Kaydını belirler.

---

### 8. İş Merkezi Ataması

#### [WOR-015] İş emirlerindeki her bir operasyon adımı sahada belirli bir İş Merkezine (Work Center / Tezgâh / İstasyon / Hat) atanmakta ve operatörler yalnızca kendi iş merkezine atanan işleri mi görmektedir?
- **Süreç:** İş Merkezi Ataması | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `her_operasyon_ilgili_is_merkezine_atanir_ve_istasyon_terminalinde_sadece_o_makinenin_is_kuyrugu_gorulur`: Evet; her operasyon ilgili makineye atanır; tezgâh başındaki ekranda sadece o tezgâhın sıradaki işleri listelenir
  - `tum_fabrikanin_is_emirleri_tek_bir_genel_havuzda_gorulur_tezgah_filtresi_yoktur`: İstasyon bazlı kuyruk yoktur; tüm açık iş emirleri tek bir ortak listede durur
  - `is_merkezi_atamasi_sistemde_yapilmamaktadir`: İş merkezi ataması veya dijital iş kuyruğu bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Tezgâh Bazlı İş Dağıtım Listesi (Work Center Dispatch List) Altyapısını belirler.

#### [WOR-016] Birden fazla makinenin veya hattın paralel çalıştığı durumlarda (Örn. 5 adet CNC Torna veya 3 Montaj Masası) tek bir iş emrinin parçaları farklı makineler arasında bölünerek (Split Work Order) eşzamanlı işletilebilmekte midir?
- **Süreç:** İş Merkezi Ataması | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `is_emri_partilere_bolunerek_farkli_makinelerde_es_zamanli_uretilebilir_ve_takip_edilir`: Evet; 10.000 adetlik iş emri sistemde 2 ayrı tezgâha (5.000 + 5.000) bölünerek paralel yürütülebilir
  - `is_emri_bolunemez_tek_makinede_bastansona_kadar_tamamlanmak_zorundadir`: İş emri bölünemez; tek bir tezgâhta başlar ve orada biter; bölünmesi için ayrı iş emri açmak gerekir
  - `is_emri_bolme_sureci_kullanilmamaktadir`: İş emri bölme süreci kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Bölme (Work Order Splitting) ve Paralel Tezgâh Yönetimini belirler.

---

### 9. Operatör / Ekip Ataması

#### [WOR-017] Üretim iş emri veya operasyonuna müdahaleyi yapan Operatör veya Üretim Ekibi (Vardiya / İstasyon Takımı) sistemde kaydedilmekte ve yetkinlik kontrolü yapılmakta mıdır?
- **Süreç:** Operatör / Ekip Ataması | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `operatör_kendi_kullanici_veya_barkoduyla_ise_giris_yapar_hangi_parcayi_kimin_urettigi_tam_kaydolur`: Evet; operatör işe başlarken kendi kimliğini/barkodunu okutur; üretilen her parçanın hangi operatörden çıktığı bilinir
  - `isler_kisiye_degil_vardiyaya_veya_atolyeye_yazilir_tekil_operator_kaydi_tutulmaz`: Kişi bazında tutulmaz; '1. Vardiya Pres Ekibi' gibi toplu ekip olarak kaydedilir
  - `operator_kaydi_tutulmamaktadir`: Operatör veya çalışan kişi kaydı sisteme işlenmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Operatör Sicil Kaydı ve İş Gücü İzlenebilirlik Altyapısını belirler.

#### [WOR-018] Saha terminallerinde operatörlerin giriş yapması (Login / Personel Tanıma) hangi donanım ve yöntemle (Barkod / Karekod Okutma, RFID / Personel Kartı, Parmak İzi, Kullanıcı Adı/Şifre, Ortak Terminal) sağlanmaktadır?
- **Süreç:** Operatör / Ekip Ataması | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `rfid_personel_karti_veya_yaka_karti_barkodunun_okutulmasiyla_hizlica_giris_yapilir`: RFID personel kartı veya yaka kartındaki barkodun terminale okutulmasıyla saniyeler içinde giriş yapılır
  - `dokunmatik_ekrandan_kullanici_adi_ve_sifre_veya_pin_kodu_girilerek_giris_yapilir`: Kiosk/tablet dokunmatik ekranından kullanıcı adı ve PIN/şifre girilerek açılır
  - `ortak_genel_bir_hesap_surekli_aciktir_kimse_bireysel_giris_yapmaz`: Terminalde ortak genel bir kullanıcı sürekli açıktır; operatörler şahsi giriş yapmadan işlem yapar
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Shop-Floor Kimlik Doğrulama ve Donanım Entegrasyon Modelini belirler.

---

### 10. Operasyon Başlatma

#### [WOR-019] Üretim sahasında bir operasyon fiilen başladığında ve durduğunda Zaman Kaydı (Başlangıç ve Bitiş Saati) hangi ortam ve araçla (Hat Başı Dokunmatik Kiosk, El Terminali / Tablet, Barkod Okutma, Kağıt Form, MES / PLC) yapılmaktadır?
- **Süreç:** Operasyon Başlatma | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `operator_hat_basindaki_terminal_tablet_veya_barkod_okuyucuyla_isi_aninda_baslatir_ve_durdurur`: Evet; operatör iş emri refakat kartındaki barkodu okutarak işi başlatır ve bitirir; başlama/bitiş anlık kaydolur
  - `plc_veya_makine_otomasyonu_ise_baslama_ve_bitisi_otomatik_olarak_sisteme_gonderir_mes`: Makine/PLC entegrasyonu vardır; tezgâh çalışmaya başladığı an sistemik zaman kaydı otomatik başlar
  - `vardiya_veya_gun_bitiminde_kagit_forma_yazilan_saatler_toplu_olarak_bilgisayara_girilir`: Anlık zaman kaydı yoktur; vardiya sonunda operatörün kağıda yazdığı başlama/bitiş saatleri sisteme sonradan girilir
  - `operasyon_baslangic_ve_bitis_saatleri_kaydedilmemektedir`: Operasyon başlama ve bitiş saati takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Gerçek Zamanlı Operasyon Başlatma/Durdurma ve Saha Terminal Altyapısını belirler.

#### [WOR-020] Üretim partisine eşlik eden ve üzerinde iş emri barkodu, rota adımları ve teknik çizim referansı bulunan İş Emri Refakat Kartı (Job Traveler / Rota Kartı / İmalat Fişi) basılıp sahada dolaştırılmakta mıdır?
- **Süreç:** Operasyon Başlatma | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `barkodlu_refakat_karti_yazdirilir_ve_kasa_palet_uzerinde_tum_operasyonlar_boyunca_parcaya_eslik_eder`: Evet; iş emri açıldığında barkodlu refakat kartı basılır; kasa/palet üzerinde tüm istasyonları gezer
  - `tamamen_dijital_ve_kagitsiz_calisilir_operator_isleri_ekrandan_gorur_kagit_basilmaz`: Kâğıtsız fabrika (Paperless) çalışılır; kasalarda dijital barkod/RFID etiket vardır, basılı form kullanılmaz
  - `standart_bir_refakat_karti_kullanilmamaktadir`: Standart bir iş emri refakat kartı kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Refakat Kartı (Job Traveler) Tasarımı ve Kâğıtsız Fabrika Vizyonunu belirler.

---

### 11. Operasyon Bildirimi

#### [WOR-021] Üretim onayları Operasyon Bazında Tek Tek (Her operasyon bittiğinde o operasyonun sağlam ve fire miktarı onaylanarak) mi, yoksa yalnızca En Son Mamul Çıkışında Toplu olarak mı sisteme bildirilmektedir?
- **Süreç:** Operasyon Bildirimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `her_operasyon_ayri_ayri_onaylanir_kesim_torna_kaynak_montaj_adimlari_sistemde_tek_tek_tamamlanir`: Evet; her operasyon adımında teyit (Confirmation) verilir; parça hangi istasyonda bekliyor anlık görülür
  - `yalnizca_kritik_bir_iki_ana_asamada_milestone_bildirim_yapilir_diger_ara_adımlar_otomatik_kapanir`: Milestone operasyon onayı uygulanır; sadece 1-2 ana istasyonda onay verilir, aradaki adımlar otomatik tamamlanır
  - `operasyon_bazli_bildirim_yapilmaz_yalniz_mamul_cikinca_toplu_kapatilir`: Operasyon bazlı onay yoktur; ürün tüm aşamalardan geçip bitmiş mamul olunca tek seferde toplu bildirilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Operasyonel Teyit (Operation Confirmation) vs Milestone Bildirim Kurgusunu belirler.

#### [WOR-022] Bir iş emri günlerce sürdüğünde veya birden fazla vardiyaya yayıldığında Kısmi Üretim Bildirimleri (Partial Confirmation — Örn. 1.000 adetten ilk vardiyada üretilen 350 adedin girilmesi) yapılabilmekte midir?
- **Süreç:** Operasyon Bildirimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WOR-021 != "operasyon_bazli_bildirim_yapilmaz_yalniz_mamul_cikinca_toplu_kapatilir"`
- **Seçenekler:**
  - `kismi_bildirimler_yapilabilir_her_vardiya_urettigi_kadarini_onaylar_kalan_miktar_acik_kalir`: Evet; vardiya bittiğinde üretilen 350 adet onaylanır, kalan 650 adet bir sonraki vardiyaya açık olarak devreder
  - `kismi_bildirim_yapilamaz_is_emrinin_tamami_bitmeden_sisteme_miktar_girilemez`: Kısmi onay yoktur; 1.000 adedin tamamı bitene kadar iş emri sistemde açık bekler, tek seferde kapatılır
  - `kismi_uretim_bildirimi_kullanilmamaktadir`: Kısmi üretim bildirimi kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Kısmi Bildirim (Partial Confirmation) ve Çoklu Vardiya Devir Mekanizmasını belirler.

---

### 12. Üretim Miktarı Bildirimi

#### [WOR-023] Üretim bildirimi yapılırken üretilen miktarlar Sağlam Ürün (Good Yield), Hurda / Fire Miktarı (Scrap) ve Yeniden İşlenecek Miktar (Rework) olarak net biçimde ayrıştırılarak mı sisteme girilmektedir?
- **Süreç:** Üretim Miktarı Bildirimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `saglam_fire_ve_rework_miktarlari_bildirim_ekraninda_ayri_ayri_zorunlu_olarak_girilir`: Evet; ekranda 950 adet sağlam, 30 adet fire, 20 adet rework ayrı alanlara girilir ve net üretim verimi hesaplanır
  - `yalnizca_saglam_cikan_miktar_girilir_fire_veya_hurdalar_sisteme_islenmez`: Sadece sağlam adet girilir; hurda veya fire olan parçalar kayda geçirilmez, ambardan kayıp olarak kalır
  - `toplam_uretilen_miktar_tahmini_yazilir_ayrim_yapilmaz`: Toplam miktar tahmini yazılır; sağlam/fire ayrımı yapılmaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Gerçekleşen Üretim Miktar Sınıflandırması ve Verimlilik (Yield) Hesabını belirler.

#### [WOR-024] Planlanan miktarın üzerinde Fazla Üretim Bildirimi (Over-Delivery / Over-Production) yapılmasını engelleyen veya yönetici onayına bağlayan bir Tolerans Kontrol Mekanizması var mıdır?
- **Süreç:** Üretim Miktarı Bildirimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `tolerans_limiti_vardir_orn_yuzde_5_fazla_uretime_izin_verilir_uzeri_icin_onay_gerekir`: Evet; iş emri miktarının en fazla %5-10 fazlası bildirilebilir; toleransı aşan fazla üretim sistem tarafından engellenir
  - `hicbir_limit_yoktur_operator_istedigi_kadar_yuksek_miktar_bildirebilir`: Limit yoktur; 100 adetlik iş emrine operatör 500 adet de bildirse sistem kabul eder
  - `fazla_uretim_tolerans_kontrolu_bulunmamaktadir`: Fazla üretim tolerans kontrolü bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Fazla Üretim Tolerans Kontrolü ve Yönetici Onay Kuralını belirler.

---

### 13. Fire / Hatalı Ürün

#### [WOR-025] Üretim sırasında oluşan fire ve hurdalar için standart Fire Neden Kodları (Hammadde Hatası, Tezgâh/Kalıp Ayarı, Operatör Hatası, Elektrik Kesintisi, Ölçü Kaçıklığı, Çatlak/Yırtılma vb.) seçilmekte midir?
- **Süreç:** Fire / Hatalı Ürün | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `standart_fire_neden_katalogu_vardir_hurda_girilirken_neden_kodu_secilmesi_zorunludur`: Evet; standart fire kodları tanımlıdır; operatör hurda miktarını yazarken nedenini (Hammadde, Ayar, Çapak vb.) seçmek zorundadır
  - `fire_nedeni_serbest_metin_olarak_aciklamaya_yazilir_standart_kod_yoktur`: Standart kod yoktur; forma veya sisteme 'Kalıp sıkıştı' gibi serbest not düşülür
  - `fire_neden_kaydi_tutulmamaktadir`: Fire neden kaydı tutulmamaktadır; yalnızca hurda ayrılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Fire Neden Kataloğu ve Kök Neden Analitiği Tasarımını belirler.

#### [WOR-026] İşin başındaki kalıp ayarı ve tezgâh ısınmasında verilen Ayar / Başlangıç Firesi (Setup Scrap) ile proses sırasında oluşan İşleme Firesi (Process Scrap) sistemde ayrı ayrı raporlanabilmekte midir?
- **Süreç:** Fire / Hatalı Ürün | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `ayar_firesi_ve_proses_firesi_ayri_kodlarla_ve_ayri_asamlarda_kaydedilir`: Evet; ilk kalıp bağlama deneme parçaları 'Ayar Firesi' olarak, çalışma esnasındaki hurdalar 'Proses Firesi' olarak ayrılır
  - `tum_fireler_tek_bir_toplam_hurda_olarak_kaydedilir_ayrim_yapilmaz`: Ayrım yapılmaz; iş boyunca çıkan tüm hurda parçalar tek kalemde toplanır
  - `ayar_ve_proses_firesi_ayrimi_yapilmamaktadir`: Ayar ve proses firesi ayrımı yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Ayar Firesi vs Proses Firesi Ayrımı ve Parti Boyutu Maliyetlemesini belirler.

---

### 14. Malzeme Sarfı

#### [WOR-027] İş emrinde kullanılan hammadde, yardımcı malzeme ve yarı mamullerin stoktan düşümü (Fiili Malzeme Sarfı / Goods Issue to Work Order) hangi yöntemle yürütülmektedir?
- **Süreç:** Malzeme Sarfı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `barkod_okutularak_veya_is_emri_ekranindan_kullanilan_fiili_miktar_secilerek_anlik_sarf_edilir`: Evet; sahada hammadde barkodu okutularak veya sarf ekranından fiili miktar onaylanarak iş emrine anında sarf edilir
  - `uretim_onayi_verildiginde_recetedeki_standart_miktara_gore_otomatik_sarf_edilir_backflush`: Otomatik sarf (Backflush) kullanılır; üretilen mamul adedi girilince sistem reçetedeki oranda hammaddeyi stoktan düşer
  - `ay_sonunda_veya_hafta_sonunda_depocu_kalan_miktara_bakarak_toplu_sarf_fisi_keser`: Anlık sarf yoktur; ay sonlarında ambardaki sayım farkına göre toplu genel sarf fişi kesilir
  - `malzeme_sarflari_sistemde_takip_edilmemektedir`: İş emri bazında malzeme sarf takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Malzeme Sarf Yöntemi (Manuel / Barkodlu / Otomatik) ve Hat Başı Envanter Modelini belirler.

#### [WOR-028] Depodan iş emrine hammadde çekilirken yanlış malzeme kullanımını engellemek için Barkod / Karekod Doğrulama (Poka-Yoke / Hata Önleme) kontrolü yapılmakta mıdır?
- **Süreç:** Malzeme Sarfı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `hammadde_barkodu_okutuldugunda_receteyle_eslesmezse_sistem_sesli_ve_gorsel_kirmizi_uyari_verir`: Evet; operatör yanlış bir hammadde veya boya barkodu okutursa sistem 'Reçetede Bu Malzeme Yok' uyarısıyla engeller
  - `barkod_okutulmaz_operatör_ambardan_gelen_etikete_gozle_bakarak_malzemeyi_alır`: Barkod doğrulaması yoktur; operatör çuval veya palet üzerindeki etikete gözle bakıp tezgâha döker
  - `poka_yoke_veya_barkodlu_dogrulama_bulunmamaktadir`: Barkodlu malzeme doğrulama sistemi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Hat Başı Barkodlu Malzeme Doğrulama (Poka-Yoke) Kurgusunu belirler.

---

### 15. Backflush ve Otomatik Sarf

#### [WOR-029] Üretim gerçekleşme onayı girildiğinde ürün ağacındaki standart miktarlara göre hammaddelerin stoktan otomatik düşülmesi (Backflush / Ters Yıkama Tüketimi) yöntemi uygulanmakta mıdır?
- **Süreç:** Backflush ve Otomatik Sarf | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `backflush_kullanilir_mamul_veya_operasyon_onaylandigi_an_bilesenler_otomatik_sarf_olur`: Evet; parça başı standart sarf miktarları tanımlıdır; 100 adet montaj onayı verildiğinde 100x reçete otomatik stoktan düşer
  - `sadece_civata_somun_gibi_onemsiz_c_grubu_parcalarda_backflush_ana_parcalarda_manuel_sarf_yapilir`: Hibrit model; küçük bağlantı elemanları otomatik backflush ile, pahalı ana gövde ve motorlar barkodla manuel sarf edilir
  - `backflush_kullanilmaz_tum_malzemeler_manuel_sarf_edilir`: Backflush kullanılmaz; tüm hammaddeler tartılarak veya sayılarak manuel sarf fişiyle düşülür
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Backflush Sarf Parametreleri ve Malzeme Türü Bazlı Tüketim Stratejisini belirler.

#### [WOR-030] Backflush sarfı sonrasında fiili tüketim ile standart sarf arasında fark oluştuğunda (Örn. Standart 100 kg ama fiilen 108 kg kullanıldı) bu farkın iş emri üzerinde kolayca düzeltilmesi sağlanabilmekte midir?
- **Süreç:** Backflush ve Otomatik Sarf | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WOR-029 != "backflush_kullanilmaz_tum_malzemeler_manuel_sarf_edilir"`
- **Seçenekler:**
  - `otomatik_sarftan_sonra_ekstra_kullanilan_miktar_fark_sarfi_olarak_is_emrine_islenir`: Evet; otomatik düşülen miktar üzerine eklenen veya iade edilen miktar iş emrinde kolayca revize edilir
  - `backflush_miktari_degistirilemez_farklar_ay_sonu_sayim_acigi_olarak_muhasebeye_kalir`: İş emrinde düzeltme yapılamaz; standart neyse o düşer, aradaki 8 kg fark ay sonunda genel fire yazılır
  - `backflush_fark_duzeltmesi_yapilamamaktadir`: Backflush sapma düzeltmesi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Backflush Sapma Düzeltme ve Fiili Tüketim Mutabakatı İş Akışını belirler.

---

### 16. Ek Sarf / İkame Malzeme

#### [WOR-031] Üretim esnasında reçetede olmayan bir malzemenin kullanılması (Ek Sarf / Extra Issue) veya hammadde bittiğinde onaylı alternatif/muadil malzemenin iş emrine ikame edilmesi (Substitute Material) sistemi nasıl yönetilmektedir?
- **Süreç:** Ek Sarf / İkame Malzeme | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `yetkili_onayi_ile_is_emrine_ek_malzeme_veya_ikame_muadil_hammadde_secilerek_sarf_edilebilir`: Evet; reçete dışı ek malzeme veya muadil hammadde yetkili onayıyla iş emrine eklenir ve nedeni kaydedilir
  - `muadil_malzeme_fiziken_kullanilir_ancak_sistemde_orijinal_malzeme_sarf_edilmis_gibi_gosterilir`: Sistemik ikame yoktur; sahada başka hammadde kullanılır fakat sisteme orijinal reçetedeki parça yazılır
  - `recete_disi_ek_sarf_veya_ikame_malzeme_kullanimi_yapilamamaktadir`: Ek malzeme sarfı veya ikame malzeme yönetimi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emrinde Ek Malzeme Sarfı ve İkame Malzeme Onay Mekanizmasını belirler.

#### [WOR-032] Kullanılan ikame malzemelerin maliyet farkları ve ürün kalitesine etkisi sonradan Denetim İzi (Audit Trail) ve sapma raporu olarak incelenebilmekte midir?
- **Süreç:** Ek Sarf / İkame Malzeme | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `hangi_is_emrinde_hangi_muadil_parcanin_kullanildigi_ve_maliyet_farki_raporlanir`: Evet; muadil parça kullanımı sonucu oluşan hammadde maliyet farkı ve kalite onayı sistemde raporlanır
  - `ikame_kullanimi_sonradan_ayristirilamaz_genel_maliyet_icinde_kaybolur`: Ayrıştırılamaz; hangi partide muadil kullanıldığı sonradan raporlarda görülemez
  - `ikame_denetim_izi_tutulmamaktadir`: İkame malzeme denetim izi veya sapma takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İkame Malzeme Denetim İzi ve Maliyet Farkı Raporlamasını belirler.

---

### 17. Lot / Seri İzlenebilirliği

#### [WOR-033] Üretim iş emrinde tüketilen Hammadde ve Yarı Mamul Lot / Seri Numaraları ile üretilen Nihai Mamul Lot / Seri Numarası arasında Girdi-Çıktı Şeceresi (Genealogy / Traceability — İleri ve Geri İzlenebilirlik) kurulabilmekte midir?
- **Süreç:** Lot / Seri İzlenebilirliği | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tam_secereli_izlenebilirlik_vardir_mamul_seri_no_sundan_hangi_hammadde_lotu_kullanildigi_aninda_dokulur`: Evet; mamulün lot/seri numarası girildiğinde içinde kullanılan tüm hammadde lotları, tezgâh ve operatör şeceresi tek tıkla dökülür
  - `yalnizca_mamule_yeni_lot_numarasi_verilir_icine_giren_hammadde_lotlari_eslestirilemez`: Tek taraflıdır; üretilen mamule parti no verilir fakat o partide hangi hammadde lotunun kullanıldığı sistemde eşleşmez
  - `lot_veya_seri_izlenebilirligi_tutulmamaktadir`: Üretimde lot veya seri bazında izlenebilirlik tutulmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Üretim Şeceresi (Product Genealogy / As-Built BOM) Veri Modelini belirler.

#### [WOR-034] Kritik bileşenler içeren montajlarda (Örn. Motor Seri No, Elektronik Kart Seri No, Akü Barkodu) her bir seri numaralı parça mamulün kendi seri numarasına birebir (1-to-1 Serial Mapping) olarak mı işlenmektedir?
- **Süreç:** Lot / Seri İzlenebilirliği | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `WOR-033 != "lot_veya_seri_izlenebilirligi_tutulmamaktadir"`
- **Seçenekler:**
  - `montaj_esnasinda_motor_ve_kart_seri_numaralari_okutularak_mamul_seri_kartina_birebir_kaydolur`: Evet; montaj sırasında bileşen seri numarası barkodla okutulur ve mamulün kimlik kartına kalıcı olarak işlenir
  - `seri_numaralari_kağıt_montaj_formuna_elle_yazilir_sistemde_seri_eslesmesi_yoktur`: Sistemde tutulmaz; teknisyen motor seri numarasını kağıt forma elle yazar, klasörde saklanır
  - `birebir_seri_seri_eslestirmesi_yapilamamaktadir`: Birebir seri-seri eşleştirmesi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Bileşen Seri Numarası Eşleştirme (Component Serial Capture) Altyapısını belirler.

---

### 18. İşçilik ve Makine Süresi

#### [WOR-035] İş emrinde harcanan Fiili İşçilik Süresi (Adam-Saat / Labor Time) ve Tezgâh Çalışma Süresi (Makine Saati / Machine Run Time) operatör bazında kaydedilmekte midir?
- **Süreç:** İşçilik ve Makine Süresi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `baslama_bitis_aninda_otomatik_hesaplanir_hem_fiili_iscilik_hem_fiili_makine_suresi_kaydolur`: Evet; operatör işe girip çıktığında fiili adam-saat ve tezgâhın net çalışma dakikası sisteme otomatik kaydedilir
  - `yalnizca_standart_sureler_baz_alinir_fiili_sure_tutulmaz_100_adet_icin_standart_ne_ise_o_yazilir`: Fiili süre tutulmaz; iş bittiğinde standart süre ne ise o kadar işçilik harcanmış kabul edilir
  - `iscilik_ve_makine_sureleri_kaydedilmemektedir`: İşçilik veya makine çalışma süresi kaydı tutulmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Fiili İşçilik ve Makine Saati Kaydı ve Maliyet Muhasebesi Entegrasyonunu belirler.

#### [WOR-036] Bir operatörün aynı anda birden fazla tezgâhı çalıştırması (Çoklu Tezgâh Kullanımı / Multi-Machine Handling) durumunda işçilik adam-saat maliyetinin iş emirlerine paylaştırılması nasıl yönetilmektedir?
- **Süreç:** İşçilik ve Makine Süresi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `operator_ayni_anda_3_tezgaha_giris_yapabilir_sistem_iscilik_suresini_3_is_emrine_otomatik_boler`: Evet; operatör 3 makineye aynı anda oturum açabilir; sistem 1 saatlik işçiliği 3 iş emrine 20'şer dakika olarak dağıtır
  - `operator_tek_bir_is_emrine_giris_yapar_diger_tezgahlardaki_isler_isciliksiz_kalir`: Çoklu dağıtım yoktur; operatör sadece tek bir makineye giriş yapabilir, diğer makinelerdeki süreler karışır
  - `coklu_tezgah_iscilik_dagitimi_bulunmamaktadir`: Çoklu tezgâh işçilik paylaştırma mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Çoklu Tezgâh İşçilik Paylaştırma (Multi-Machine Labor Allocation) Mantığını belirler.

---

### 19. Duruş / Bekleme Nedenleri

#### [WOR-037] Üretim esnasında meydana gelen plansız duruşlar (Makine Arızası, Malzeme Bekleme, Kalıp/Ayar Değişimi, Kalite Onay Bekleme, Elektrik Kesintisi, Personel Molası vb.) sahadan Duruş Neden Kodlarıyla (Downtime Reasons) kaydedilmekte midir?
- **Süreç:** Duruş / Bekleme Nedenleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tezgah_durdugunda_operator_terminalden_durus_nedenini_zorunlu_secer_durus_suresi_anlik_sayar`: Evet; makine durduğunda operatör ekrandan 'Malzeme Bekliyor', 'Arıza' veya 'Kalıp Ayarı' kodunu seçer ve duruş süresi kaydolur
  - `duruslar_vardiya_raporuna_elle_dakika_olarak_yazilir_sistemik_durus_kodu_secilmez`: Sistemik duruş kaydı yoktur; operatör kağıt forma '1 saat arıza oldu' diye yazar
  - `durus_ve_bekleme_sureleri_kaydedilmemektedir`: Duruş süreleri veya neden kodları kaydedilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Duruş Neden Kodları (Downtime Tracking) ve OEE Kullanılabilirlik (Availability) Analizini belirler.

#### [WOR-038] Operatörün kaydetmediği kısa süreli duruşlar (Micro-Stops — Örn. 1-2 dakikalık parça takılmaları) ve hat hızı düşüşleri sistem tarafından otomatik tespit edilebilmekte midir?
- **Süreç:** Duruş / Bekleme Nedenleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `plc_otomasyonundan_kisa_duruslar_ve_hiz_kayiplari_otomatik_yakalanir_ve_raporlanir`: Evet; makine PLC'sinden gelen sinyallerle 2 dakikalık duruşlar dahi otomatik loglanır
  - `yalnizca_uzun_duruslar_orn_15_dakika_uzeri_operator_tarafindan_manuel_girilir`: Sadece 15 dakikadan uzun büyük duruşlar manuel kaydedilir; kısa duruşlar ölçülmez
  - `kisa_durus_takibi_yapilamamaktadir`: Kısa duruş veya hız kaybı takibi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Mikro Duruş Algılama ve Otomasyon Entegrasyon İhtiyacını belirler.

---

### 20. Rework / Yeniden İşleme

#### [WOR-039] Hatalı çıkan ancak hurdaya atılmayıp tamir edilebilecek parçalar için Rework / Yeniden İşleme süreci (Ayrı Rework İş Emri açılması veya Mevcut İş Emrine Rework Operasyonu eklenmesi) sistemde nasıl yürütülmektedir?
- **Süreç:** Rework / Yeniden İşleme | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `hatali_parcalar_icin_sistemden_ayri_bir_rework_is_emri_acilir_veya_is_emrinde_rework_operasyonu_isletilir`: Evet; tamir edilecek parçalar için resmi Rework İş Emri açılır; harcanan ek süre ve malzeme ana işten ayrı izlenir
  - `rework_gayriresmi_yapilir_operator_ayni_makinede_parcayi_duzeltir_ekstra_kayit_tutulmaz`: Sistemik kayıt yoktur; operatör hatalı parçayı tezgâhta tekrar işleyip düzeltir, ek işçilik normal süreye karışır
  - `rework_sureci_yoktur_hatali_parca_tamamen_hurdaya_ayrilir`: Rework yapılmaz; hatalı çıkan tüm parçalar doğrudan hurdaya ayrılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Rework İş Emri Açılışı ve Yeniden İşleme Rotası Mimarisini belirler.

#### [WOR-040] Rework işlemi sırasında harcanan ilave işçilik süresi ve tüketilen ek malzemeler orijinal iş emrinin maliyetine mi, yoksa ayrı bir Kalite/Rework Masraf Merkezine mi yüklenmektedir?
- **Süreç:** Rework / Yeniden İşleme | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `WOR-039 != "rework_sureci_yoktur_hatali_parca_tamamen_hurdaya_ayrilir"`
- **Seçenekler:**
  - `rework_iscilik_ve_malzemesi_ayri_maliyetlendirilir_orijinal_urun_maliyeti_yapay_olarak_sismez`: Evet; rework maliyeti ayrı bir masraf kaleminde izlenir; ürünün standart maliyetiyle rework kaynaklı kayıp ayrıştırılır
  - `ana_is_emrine_eklenir_ve_o_partinin_birim_maliyetini_artirir`: Ayrı tutulmaz; ek işçilik ve sarf ana iş emrine yüklenir ve o partinin toplam maliyetini yükseltir
  - `rework_maliyeti_ayrilamamaktadir`: Rework maliyeti ayrıştırılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Rework Maliyet Muhasebesi Ayrıştırmasını belirler.

---

### 21. Kalite Bekleme / Blokaj

#### [WOR-041] İş emrinde ara operasyonlarda (Örn. Isıl işlem sonrası sertlik testi) veya son operasyonda Kalite Kontrol Onayı verilmeden iş emrinin bir sonraki adıma geçmesi veya mamul ambarına aktarılması sistem tarafından engellenmekte midir?
- **Süreç:** Kalite Bekleme / Blokaj | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `kalite_onay_vermeden_is_emri_blokedir_bir_sonraki_operasyon_baslatilamaz_ve_stoga_giremez`: Evet; kalite kontrol personeli sistemden 'Kabul' onayı vermeden sonraki operasyona geçilemez ve mamul stoğuna alınamaz
  - `kaliteci_fiziki_olarak_etiket_yapistirir_ancak_sistemde_operasyon_engeli_yoktur`: Fiziki kontrol yapılır fakat ERP'de kilit yoktur; operatör kalite onayını beklemeden işi sonraki tezgâha geçirebilir
  - `uretim_esnasinda_kalite_blokaj_mekanizmasi_bulunmamaktadir`: Üretim esnasında sistemik kalite blokaj mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Süreç İçi Kalite Geçiş Kapısı (Quality Gate / Hold) Kurgusunu belirler.

---

### 22. Mamul / Yarı Mamul Girişi

#### [WOR-042] Üretimi tamamlanan mamul ve yarı mamullerin ambara stok giriş bildirimi (Goods Receipt from Production / Mamul Ambar Girişi) nasıl gerçekleşmekte ve barkodlu etiket ne zaman basılmaktadır?
- **Süreç:** Mamul / Yarı Mamul Girişi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `son_operasyon_onaylandigi_an_mamul_otomatik_stoga_girer_ve_palet_etiketi_yazicidan_cikar`: Evet; son operasyon onayıyla birlikte mamul ambar stoğuna otomatik girer, lotlu palet barkodu yazıcıdan basılır
  - `mamul_ambara_tasinir_depocu_fiziki_sayip_sisteme_manuel_stok_giris_fisi_keser`: Otomatik giriş yoktur; ürün ambara taşınır, depocu sayarak sisteme manuel üretimden giriş fişi keser
  - `mamul_stok_giris_bildirimi_sistemde_takip_edilmemektedir`: Mamul stok giriş bildirimi sistemde anlık takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Üretimden Mamul Ambar Girişi ve Otomatik Palet/Koli Etiketleme Akışını belirler.

---

### 23. İş Emri Kapanışı

#### [WOR-043] Bir iş emrinin Kapatılması (Technical Completion / Final Close) sırasında açık kalan miktar, eksik malzeme sarfı veya tamamlanmamış operasyon kontrolleri sistem tarafından denetlenmekte midir ve kapatma yetkisi kimdedir?
- **Süreç:** İş Emri Kapanışı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistem_eksik_sarf_ve_acik_operasyonlari_kontrol_eder_yetkili_onayi_olmadan_is_emri_kapatilamaz`: Evet; sistem tüm malzeme sarfları ve operasyon bildirimleri tamamlanmadan iş emrinin kapanmasına izin vermez
  - `operator_veya_ustabasi_eksik_varsa_bile_tek_tikla_is_emrini_kapatildi_statu_yapabilir`: Sistemik denetim yoktur; kullanıcı eksik bildirim olsa bile iş emrini kapatabilir
  - `is_emirleri_resmi_olarak_kapatilmaz_sistemde_surekli_acik_kalir`: İş emirleri kapatılmaz; sistemde açık olarak kalır, eski işler temizlenmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** İş Emri Kapanış Kuralları (TECO / Close Verification) ve Yetki Modelini belirler.

---

### 24. Planlanan / Gerçekleşen Karşılaştırması

#### [WOR-044] İş emri kapandığında Planlanan ile Gerçekleşen Değerler (Miktar, Hammadde Sarfı, Hurda Oranı, İşçilik Süresi, Makine Süresi ve Üretim Maliyeti) sapma analizleriyle (Variance Analysis) raporlanabilmekte midir?
- **Süreç:** Planlanan / Gerçekleşen Karşılaştırması | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `planlanan_ile_gerceklesen_miktar_sarf_sure_ve_maliyet_sapmalari_is_emri_bazinda_tek_ekranda_raporlanir`: Evet; iş emri karnesinde 'Planlanan 100 kg sarf / Fiili 106 kg sarf' veya 'Planlanan 4 saat / Fiili 5.5 saat' sapmaları net dökülür
  - `sapmalar_yalnizca_ay_sonu_maliyet_muhasebesi_calismasinda_toplu_olarak_ortaya_cikar`: İş emri bazında anlık sapma analizi yoktur; ay sonlarında genel fabrika maliyet farkı olarak görülür
  - `planlanan_vs_gerceklesen_karsilastirmasi_yapilamamaktadir`: Planlanan ile gerçekleşen karşılaştırması veya sapma analizi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Planlanan vs Gerçekleşen Sapma Analitiği (Variance Cockpit) İhtiyacını belirler.

---

### 25. Üretim İş Emri KPI

#### [WOR-045] Fabrikanızda İş Emri Tamamlama Oranı (Work Order Completion Rate), Hurda/Fire Oranı, Fiili Çevrim Süresi (Cycle Time), Hat Verimliliği ve OEE Saha Verileri düzenli olarak izlenmekte midir?
- **Süreç:** Üretim İş Emri KPI | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `is_emri_tamamlama_orani_hurda_yuzdesi_ve_fiili_cevrim_sureleri_canli_kpi_panolarinda_izlenir`: Evet; iş emri performans göstergeleri ve hat bazlı ilk seferde doğru üretme (First Pass Yield) canlı panolardan takip edilir
  - `aylik_toplantilarda_bazi_uretim_rakamlari_excel_tablolarindan_manuel_derlenerek_sunulur`: Canlı pano yoktur; ay sonu toplantılarında üretim şefi Excel'den derlediği hurda ve üretim adetlerini sunar
  - `uretim_icra_kpi_lari_olculmemektedir`: Üretim icra KPI'ları veya iş emri verimlilik göstergeleri ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MES Karar Etkisi:** Üretim İcra Yönetici Kokpiti ve Performans Panolarını belirler.
