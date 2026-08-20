# FAZ-25 — Üretim Planlama / PRODUCTION_PLANNING Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.production_planning.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `PRODUCTION_PLANNING` (Üretim Planlama)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Üretim Planlama Müdürleri, Fabrika Müdürleri, Tedarik Zinciri Direktörleri, Endüstri Mühendisleri ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli sanayi ve üretim işletmelerinde ERP/MRP/APS dönüşümü öncesinde üretim organizasyonu, üretim stratejisi (MTS, MTO, ATO, CTO, ETO) ve akış tipleri (Kesikli, Seri, Proses, Proje), mamul/yarı mamul yapısı, tek ve çok seviyeli ürün ağaçları (Multi-Level BOM), alternatif reçeteler ve revizyon geçerlilik tarihleri, üretim rotaları ve operasyon adımları, iş merkezleri (Work Center) ve standart süreler (Setup, Run, Queue, Move, Fason), fabrika takvimi ve vardiya kurgusu, talep kaynakları ve satış siparişinden üretim ihtiyacı dönüşümü, Ana Üretim Çizelgesi (MPS) ve satış tahminleri (Forecast), Malzeme İhtiyaç Planlaması (MRP) ve çok seviyeli patlatma (Multi-Level Explosion), brüt-net ihtiyaç hesabı (Net Requirements), lot büyüklüğü ve parti politikaları (Lot-for-lot, Min/Max, EOQ), teslim süreleri (Lead Times) ve geriye doğru çizelgeleme, kaba ve detaylı kapasite planlama (Finite / Infinite Capacity), darboğaz yönetimi, kalıp/ayar değişim (Setup/Changeover) optimizasyonu, malzeme eksikliği (Shortage) ve hazır bulunurluk kontrolü, planlı üretim emirleri (Planned Orders) ve kesinleştirme (Firming), dinamik yeniden planlama (Replanning), Excel bağımlılığı ve üretim planlama KPI'larının AS-IS durumunu ve ERP/MRP gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | PRODUCTION_PLANNING ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **WORK_ORDERS** *(Gelecek Faz)* | Saha üretim icrası, operatör iş adımları, fiili üretim bildirimi, fire/hurda kaydı, fiili malzeme sarfı (Backflush/Manuel issue), mamul girişi ve iş emri kapanışı | **PRODUCTION_PLANNING yalnız planlama yapar:** Ne, ne kadar, ne zaman, hangi kaynakta, hangi malzemelerle üretilmeli? *(0 Fiili saha icrası / operatör bildirimi sorusu)*. |
| **INVENTORY** | Envanter ana verisi, depo sayımları, lot/seri takibi, ambar değerlemesi | **INVENTORY stok bakiyelerini ve hareketlerini sorgular.** PRODUCTION_PLANNING mevcut eldeki stok ve emniyet stoğunun net ihtiyaç formülünde (`Gross - Stock = Net`) nasıl düşüldüğünü sorgular. |
| **PROCUREMENT** | Satın alma operasyonu, PR/RFQ/PO yönetimi, tedarikçi müzakeresi | **PROCUREMENT satın alma sürecini sorgular.** PRODUCTION_PLANNING MRP sonucunda dış hammadde ihtiyacının nasıl oluştuğunu ve tedarik teslim süresinin (Lead Time) planı nasıl ötelediğini sorgular. |
| **MAINTENANCE** | Makine arıza onarımları, periyodik bakım takvimi, kalibrasyon | **MAINTENANCE bakım işlemlerini sorgular.** PRODUCTION_PLANNING planlı bakım duruşlarının makine kapasitesine (Availability) kısıt olarak yansıtılıp yansıtılmadığını sorgular. |
| **QUALITY** | Muayene adımları, boyutsal toleranslar, NCR, CAPA | **QUALITY kalite süreçlerini sorgular.** PRODUCTION_PLANNING kalite kontrol bekleme süresinin (QC Lead Time) üretim teslimat terminine etkisini sorgular. |
| **SALES & PROPOSALS** | Ticari teklifler, fiyatlandırma, müşteri sipariş sözleşmesi | **SALES/PROPOSALS ticari akışı sorgular.** PRODUCTION_PLANNING satış siparişinin üretim ihtiyacına dönüşümünü ve müşteriye termin verme (CTP) kabiliyetini sorgular. |
| **PRODUCTION_PLANNING** | Üretim stratejisi, çok seviyeli BOM derinliği, rotalar, iş merkezleri, takvim/vardiya, MPS, MRP patlatması, net ihtiyaç, lot politikaları, kapasite yükleme, darboğaz, setup, eksik malzeme, planlı emirler, yeniden planlama ve KPI'lar | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular üretim planlama ve malzeme ihtiyaç hesabı odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (23 Kanonik Süreç / 44 Soru)

1. **Üretim Organizasyonu** (2 Soru — PRD-001, PRD-002)
2. **Üretim Tipi ve Stratejisi** (2 Soru — PRD-003, PRD-004)
3. **Mamul / Yarı Mamul Yapısı** (2 Soru — PRD-005, PRD-006)
4. **Ürün Ağacı / BOM** (2 Soru — PRD-007, PRD-008)
5. **Çok Seviyeli BOM** (2 Soru — PRD-009, PRD-010)
6. **Alternatif BOM / Reçete** (2 Soru — PRD-011, PRD-012)
7. **Rota ve Operasyon Yapısı** (2 Soru — PRD-013, PRD-014)
8. **İş Merkezi / Work Center** (2 Soru — PRD-015, PRD-016)
9. **Üretim Takvimi ve Vardiya** (2 Soru — PRD-017, PRD-018)
10. **Talep Kaynakları** (2 Soru — PRD-019, PRD-020)
11. **Satış Siparişinden Üretim İhtiyacı** (2 Soru — PRD-021, PRD-022)
12. **Forecast ve MPS** (2 Soru — PRD-023, PRD-024)
13. **MRP / Malzeme İhtiyaç Planlama** (2 Soru — PRD-025, PRD-026)
14. **Net İhtiyaç Hesabı** (2 Soru — PRD-027, PRD-028)
15. **Lot Büyüklüğü ve Parti Politikaları** (2 Soru — PRD-029, PRD-030)
16. **Lead Time ve Termin Hesabı** (2 Soru — PRD-031, PRD-032)
17. **Kapasite Planlama** (2 Soru — PRD-033, PRD-034)
18. **Darboğaz Yönetimi** (2 Soru — PRD-035, PRD-036)
19. **Setup / Changeover Etkisi** (2 Soru — PRD-037, PRD-038)
20. **Malzeme Eksikliği Yönetimi** (2 Soru — PRD-039, PRD-040)
21. **Planlı Üretim Emirleri** (2 Soru — PRD-041, PRD-042)
22. **Önceliklendirme ve Yeniden Planlama** (1 Soru — PRD-043)
23. **Üretim Planlama KPI** (1 Soru — PRD-044)

---

## 3. Detaylı Soru Kataloğu ve ERP/MRP Karar Etkisi

### 1. Üretim Organizasyonu

#### [PRD-001] Şirketinizde fabrika üretim planlama, malzeme ihtiyaç hesabı ve çizelgeleme faaliyetleri hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?
- **Süreç:** Üretim Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `ayri_ve_uzmanlasmis_merkezi_uretim_planlama_departmani_tarafindan_yonetilir`: Üretimden bağımsız ayrı bir Üretim Planlama Departmanı (Tedarik Zinciri veya Fabrika Müdürlüğü altında) tarafından yönetilir
  - `uretim_muduru_veya_atolyedeki_ustabasilari_gunluk_olarak_kendileri_planlar`: Ayrı bir planlama ekibi yoktur; fabrika müdürü veya ustabaşılar ne üretileceğine günlük kendileri karar verir
  - `satis_pazarlama_ekibi_siparis_geldikce_uretime_dogrudan_is_listesi_verir`: Satış ekibi gelen müşteri siparişlerine göre üretim sırasını ve terminleri doğrudan fabrikaya dikte eder *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Planlama Departmanı Rolleri, Yetki Seviyeleri ve İş Akışlarını belirler.

#### [PRD-002] Üretim planlama ekibi ile Satış, Satın Alma ve Üretim Sahası arasındaki plan koordinasyonu ve bilgi akışı hangi periyotta ve yöntemle yürütülmektedir?
- **Süreç:** Üretim Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `haftalik_veya_gunluk_duzenli_planlama_koordinasyon_toplantilari_ve_canli_erp_uzerinden_yurutulur`: Evet; haftalık S&OP toplantıları ve her sabah yapılan günlük saha koordinasyon toplantılarıyla plan canlı ERP üzerinden yönetilir
  - `kriz_ve_acil_siparis_oldukca_telefon_eposta_ve_whatsapp_gruplari_uzerinden_konusulur`: Rutin bir toplantı yoktur; acil sipariş veya hammadde gecikmesi çıktıkça WhatsApp ve telefonla anlık çözülür
  - `departmanlar_arasi_plan_koordinasyonu_zayiftir_kopukluklar_yasanir`: Departmanlar arası koordinasyon zayıftır; satışın verdiği terminle fabrikanın ürettiği arasında sıkça kopukluk olur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Satış ve Operasyon Planlama (S&OP) İş Akışı ve Toplantı Rutinlerini belirler.

---

### 2. Üretim Tipi ve Stratejisi

#### [PRD-003] Fabrikanızdaki ana üretim stratejisi (Stoka Üretim / MTS, Siparişe Göre Üretim / MTO, Siparişe Göre Montaj / ATO, Siparişe Göre Tasarım / ETO) hangisidir veya hangi kombinasyonda uygulanmaktadır?
- **Süreç:** Üretim Tipi ve Stratejisi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tamamen_siparise_gore_uretim_make_to_order_mto_calisilir`: Siparişe Göre Üretim (Make-to-Order / MTO) — Müşteri siparişi kesinleşmeden üretime başlanmaz
  - `stoka_uretim_make_to_stock_mts_tahmin_ve_hedef_stoklara_gore_uretilir`: Stoka Üretim (Make-to-Stock / MTS) — Satış tahminlerine ve ambar emniyet stoğu hedeflerine göre üretilir
  - `yari_mamuller_stoka_nihai_mamul_siparise_gore_monte_edilir_assemble_to_order_ato`: Siparişe Göre Montaj (Assemble-to-Order / ATO) — Standart yarı mamuller stoka üretilir, nihai montaj siparişle yapılır
  - `siparise_gore_muhendislik_ve_tasarim_engineer_to_order_eto_her_urun_ozeldir`: Siparişe Göre Tasarım/Mühendislik (Engineer-to-Order / ETO) — Her sipariş için özel tasarım ve yeni ürün ağacı açılır
  - `karma_model_bazi_urunler_stoka_ozel_urunler_siparise_gore_uretilir`: Karma Model — Standart hızlı dönen ürünler stoka (MTS), müşteri varyantları siparişe göre (MTO/ATO) üretilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** ERP Planlama Strateji Grupları ve Ayrışma Noktası (Decoupling Point) Mimarisini belirler.

#### [PRD-004] Üretim tesislerinizdeki fiziksel malzeme ve operasyon akış tipi (Kesikli / Ayrık İmalat, Seri / Hat Tipi, Sürekli / Proses / Kimya, Proje Tipi) nasıl yapılandırılmıştır?
- **Süreç:** Üretim Tipi ve Stratejisi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `kesikli_ayrik_uretim_discrete_manufacturing_is_merkezleri_arasi_parti_parti_akis`: Kesikli / Ayrık İmalat (Discrete Manufacturing) — Talaşlı imalat, pres, kaynak vb. atölyeler arası parti bazlı akış
  - `seri_veya_montaj_hatti_uretimi_line_repetitive_manufacturing_surekli_konveyor_akisi`: Seri / Montaj Hattı (Repetitive / Line Assembly) — Yüksek adetli, hat boyunca akan konveyör tipi montaj
  - `proses_veya_surekli_uretim_process_manufacturing_reaktor_kazan_kimya_gida`: Proses / Sürekli Üretim (Process Manufacturing) — Reçete/formül bazlı, kazan, tank, kimya, gıda veya döküm akışı
  - `proje_tipi_uretim_project_manufacturing_buyuk_makine_tesis_insa_tarzi`: Proje Tipi Üretim (Project Manufacturing) — Uzun süren, aşamalı şantiye veya büyük özel makine üretimi
  - `karma_akis_hem_kesikli_parca_uretimi_hem_seri_montaj_hatti_vardir`: Karma Akış — Önce kesikli parça üretimi yapılır, ardından seri montaj hattında birleştirilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** ERP Üretim Modülü Çekirdek Tipini (Discrete, Process, Repetitive) belirler.

---

### 3. Mamul / Yarı Mamul Yapısı

#### [PRD-005] Üretim süreçlerinizde Mamul (Bitmiş Ürün), Yarı Mamul (Montaj Öncesi Parça / Ara Ürün), Satın Alınan Hammadde ve Dışarıdan Alınan Fason Parça ayrımları sistemde net olarak kodlanmış ve stoklanabilir durumda mıdır?
- **Süreç:** Mamul / Yarı Mamul Yapısı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_mamul_yari_mamul_ve_hammaddeler_ayri_kodlarla_ve_kendi_stok_alanlarinda_net_tanimlidir`: Evet; mamul, alt montaj yarı mamulleri ve hammaddeler ayrı malzeme tipleriyle sistemde net izlenir
  - `sadece_nihai_mamul_ve_hammadde_vardir_ara_yari_mamuller_kodlanmaz_hatti_terk_etmez`: Yarı mamul kodu açılmaz; hammadde hatta girer, doğrudan nihai mamul çıkar, ara parçalar stoksuz akar
  - `bazi_yari_mamuller_kodludur_bazi_ara_parcalar_kodsuz_fiziki_olarak_takip_edilir`: Kısmi tanımlıdır; önemli birkaç yarı mamul sistemdedir fakat birçok ara bileşenin resmi kodu yoktur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Malzeme Türü Hiyerarşisi (FERT, HALB, ROH) ve Yarı Mamul Stoklama Politikasını belirler.

#### [PRD-006] Fiziksel olarak ambarda depolanmayan fakat mühendislik veya montaj kolaylığı için ürün ağacında gruplanan Hayali / Sanal Yarı Mamul (Phantom BOM / Blow-Through) yapıları kullanılmakta mıdır?
- **Süreç:** Mamul / Yarı Mamul Yapısı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `phantom_bom_yapisi_kullanilir_ara_stok_giris_cikisi_yapilmadan_alt_bilesenler_patlatilir`: Evet; kablo seti veya vida grubu gibi ara montajlar Phantom BOM olarak tanımlanır, iş emrinde doğrudan ana ürüne akar
  - `tum_gruplar_icin_resmi_yari_mamul_ve_stok_karti_acilir_phantom_kullanilmaz`: Phantom kullanılmaz; her alt grup için ayrı iş emri ve ayrı yarı mamul stok girişi yapılır
  - `phantom_bom_kavrami_bilinmemekte_veya_kullanilmamaktadir`: Phantom BOM kavramı kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Phantom Assembly Parametreleri ve İhtiyaç Patlatma Ayarlarını belirler.

---

### 4. Ürün Ağacı / BOM

#### [PRD-007] Üretilen her mamul ve yarı mamul için 1 birim üretimde hangi hammadde ve bileşenden ne miktarda (Birim Sarf Standardı) kullanılacağını gösteren resmi Ürün Ağacı (BOM / Reçete) sistemde mevcut mudur?
- **Süreç:** Ürün Ağacı / BOM | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_mamul_ve_yari_mamullerin_standart_sarf_miktarlari_sistemde_resmi_bom_olarak_kayitlidir`: Evet; her ürünün ERP sisteminde onaylı ürün ağacı tanımlıdır ve planlama bu standart sarflarla çalışır
  - `urun_agaclari_excel_tablolarinda_veya_arge_klasorlerinde_tutulur_sistemde_yoktur`: Sistemik BOM yoktur; Excel tablolarında veya Ar-Ge teknik çizimlerinde malzeme listesi olarak tutulur
  - `standart_bir_bom_yoktur_usta_veya_operator_tecrubesine_gore_malzeme_alir`: Resmi bir ürün ağacı yoktur; tecrübeli usta hangi ürüne ne kadar hammadde gideceğini bilerek depodan çeker *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Ürün Ağacı Ana Veri Kalitesi ve BOM Standartlaştırma İhtiyacını belirler.

#### [PRD-008] Ürün ağaçlarında üretim prosesine bağlı Fire Oranları (Scrap Factor — Sabit / Yüzdesel Fire) ve üretimden çıkan Eş Ürün / Yan Ürün / Geri Kazanım (Co-Product / By-Product / Çapak / Hurda) tanımlanabilmekte midir?
- **Süreç:** Ürün Ağacı / BOM | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `bilesen_bazinda_yuzdesel_fire_sabit_fire_ve_varsa_yan_urun_bom_da_tanimlidir`: Evet; saç büküm veya enjeksiyon firesi (%) BOM'da tanımlıdır ve net malzeme ihtiyacına otomatik eklenir
  - `fireler_bom_a_yazilmaz_planlamaci_veya_usta_kafasindan_bir_miktar_fazla_malzeme_ister`: BOM'da fire oranı yoktur; planlamacı sipariş açarken manuel olarak %5-10 fazla hammadde hesaplar
  - `fire_ve_yan_urun_takibi_yapilamamaktadir`: BOM üzerinde fire oranı veya yan ürün tanımlaması yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Bileşen Hurda/Fire Oranları ve Yan Ürün Maliyet Dağıtım Modelini belirler.

---

### 5. Çok Seviyeli BOM

#### [PRD-009] Fabrikanızdaki ürünlerin ürün ağacı hiyerarşisi kaç seviyelidir (Çok Seviyeli BOM — Nihai Mamul → Üst Yarı Mamul → Alt Yarı Mamul → İşlenmiş Parça → Hammadde) ve sistem bunu özyinelemeli (Recursive / Multi-Level) çözebilmekte midir?
- **Süreç:** Çok Seviyeli BOM | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `cok_seviyeli_bom_kullanilir_3_veya_daha_fazla_derinlikte_yari_mamul_agaci_sistemde_cozulur`: Evet; 3 veya daha fazla seviyeli derin ağaç yapısı vardır; en üst mamulden en alt hammaddeye kadar hiyerarşik çözülür
  - `2_seviyeli_bom_vardir_yalnizca_mamul_ve_bir_kademe_yari_mamul_bulunur`: 2 seviyelidir; mamul altında bir grup yarı mamul vardır, onların altında sadece hammaddeler yer alır
  - `tek_seviyeli_bom_kullanilir_yari_mamul_agaci_yoktur`: Tek seviyelidir (Flat BOM); mamulün altında yarı mamul ayrımı olmadan tüm hammaddeler tek listede durur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Çok Seviyeli BOM Derinliği ve Düşük Seviye Kodu (Low-Level Code) Yapısını belirler.

#### [PRD-010] Bir nihai mamul için üretim planı veya satış siparişi açıldığında sistem otomatik olarak tüm alt yarı mamullerin ve onların altındaki hammaddelerin ihtiyaçlarını eşzamanlı (Multi-Level Explosion) patlatabilmekte midir?
- **Süreç:** Çok Seviyeli BOM | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Koşul:** `PRD-009 != "tek_seviyeli_bom_kullanilir_yari_mamul_agaci_yoktur"`
- **Seçenekler:**
  - `sistem_tek_seferde_tum_seviyeleri_otomatik_patlatir_ve_kademe_kademe_ihtiyac_cikarir`: Evet; nihai ürün ihtiyacı girildiğinde sistem en alt seviyedeki civataya kadar tüm yarı mamul ve hammadde planını üretir
  - `her_seviye_icin_planlamaci_ayri_ayri_manuel_patlatma_veya_is_emri_acar`: Otomatik çok seviyeli patlatma yoktur; planlamacı önce mamulü, sonra tek tek yarı mamulleri manuel hesaplar
  - `cok_seviyeli_ihtiyac_patlatma_yapilamamaktadir`: Çok seviyeli ihtiyaç patlatma yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Otomatik Çok Seviyeli İhtiyaç Patlatma (Multi-Level Explosion Engine) İhtiyacını belirler.

---

### 6. Alternatif BOM / Reçete

#### [PRD-011] Bir ürünün farklı hatlarda üretilmesi, hammadde muadilleri, üretim mevsimi veya müşteri talebine göre Alternatif Ürün Ağaçları (Alternatif BOM / Reçete) ve Revizyon / Geçerlilik Tarihi (Effective Date) takibi yapılmakta mıdır?
- **Süreç:** Alternatif BOM / Reçete | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `bir_urunun_birden_fazla_onayli_alternatif_bom_u_ve_tarih_bazli_revizyon_gecmisi_sistemde_takip_edilir`: Evet; reçete versiyonları (Rev 01, Rev 02), geçerlilik başlangıç/bitiş tarihleri ve alternatif reçeteler sistemde tam yönetilir
  - `her_urun_icin_sistemde_yalniz_tek_bir_guncel_bom_vardir_eski_revizyon_ezilir`: Tek bir BOM vardır; değişiklik olunca eski reçete güncellenir, geçmiş versiyonların arşivi sistemde tutulamaz
  - `alternatif_bom_kullanilmamaktadir_tek_standart_recete_vardir`: Alternatif reçete veya revizyon takibi kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Alternatif Reçete Seçim Kurgusu ve Mühendislik Değişiklik Yönetimini (ECM) belirler.

#### [PRD-012] Üretim miktarına göre (Örn. 100 adet altı farklı reçete / el montajı, 10.000 adet üzeri otomatik hat reçetesi) veya müşteri/proje bazlı dinamik reçete seçimi yapılabilmekte midir?
- **Süreç:** Alternatif BOM / Reçete | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `PRD-011 != "alternatif_bom_kullanilmamaktadir_tek_standart_recete_vardir"`
- **Seçenekler:**
  - `uretim_miktari_araligina_veya_musteriye_gore_sistem_dogru_alternatif_bom_u_otomatik_secer`: Evet; parti büyüklüğüne veya siparişteki müşteriye göre sistem ilgili reçeteyi otomatik iş emrine bağlar
  - `planlamaci_is_emri_acarken_hangi_alternatif_bom_un_kullanilacagini_manuel_secer`: Otomatik kural yoktur; planlamacı iş emrini oluştururken hangi reçeteyi kullanacağını listeden elle seçer
  - `miktar_bazli_recete_secimi_bulunmamaktadir`: Miktar veya proje bazlı reçete seçimi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Lot Büyüklüğü ve Müşteri Bazlı Dinamik BOM Belirleme Kurallarını tanımlar.

---

### 7. Rota ve Operasyon Yapısı

#### [PRD-013] Ürünlerin hangi sırayla, hangi tezgâhlarda ve ne kadar sürede üretileceğini belirleyen standart Üretim Rotaları (Routing — Kesim → Torna → Kaynak → Boya → Montaj → Paketleme) sistemde tanımlı mıdır?
- **Süreç:** Rota ve Operasyon Yapısı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `her_urunun_standart_operasyon_sirasi_hazirlik_ve_birim_islem_sureleri_sistemde_tanimlidir`: Evet; her ürünün rotası, operasyon sırası, setup süresi ve parça başı standart işlem süresi sistemde kayıtlıdır
  - `operasyon_sirasi_teknik_resimlerde_veya_formene_sozlu_olarak_bilinir_sistemde_sure_yoktur`: Sistemde standart rota/süre yoktur; operasyon adımları teknik resimde yazar, ustabaşı sırayla işi yürütür
  - `standart_rota_veya_operasyon_tanimi_bulunmamaktadir`: Resmi bir rota veya operasyon süre standardı bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Standart Üretim Rotaları, Operasyon Sıralaması ve Standart Zaman Veritabanını belirler.

#### [PRD-014] Üretim rotasında dışarıya gönderilen Fason Operasyonlar (Dış İşlem / Subcontracting — Örn. Kaplama, Isıl İşlem, Boya vb.) ve operasyonlar arası bekleme/taşıma süreleri (Queue / Move Time) planlamada dikkate alınıyor mu?
- **Süreç:** Rota ve Operasyon Yapısı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `fason_operasyon_sureleri_ve_hatlar_arasi_tasima_bekleme_sureleri_rotaya_dahildir`: Evet; ısıl işlem fasoncusuna gidiş-geliş süresi rotada tanımlıdır ve genel üretim teslimat süresine eklenir
  - `fason_islemler_manuel_takip_edilir_sistemik_rotada_sure_ve_termin_baglantisi_yoktur`: Fason vardır fakat rotada standart süresi yoktur; malzeme fasondan gelince bir sonraki operasyona geçilir
  - `fason_operasyon_veya_kuyruk_suresi_kullanilmamaktadir`: Fason operasyon veya istasyonlar arası bekleme süresi takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Fason Operasyon Satın Alma Entegrasyonu ve İstasyonlar Arası Taşıma/Bekleme Süresi Ayarlarını belirler.

---

### 8. İş Merkezi / Work Center

#### [PRD-015] Üretim operasyonlarının yürütüldüğü İş Merkezleri (Work Centers — Makine, Makine Grubu, Montaj Hattı, El İşi İstasyonu) kapasite parametreleriyle birlikte sistemde tanımlı mıdır?
- **Süreç:** İş Merkezi / Work Center | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_makine_ve_istasyonlar_is_merkezi_olarak_kapasite_ve_maliyet_merkezi_baglantisiyla_tanimlidir`: Evet; CNC Grubu, Pres Hattı, Manuel Montaj gibi tüm iş merkezleri makine adetleri ve kapasiteleriyle sistemdedir
  - `is_merkezleri_sadece_isim_olarak_vardir_kapasite_veya_calisma_saati_kurali_tanimli_degildir`: İş merkezleri sistemde isim olarak vardır fakat kapasite sınırı veya standart çalışma saati tanımlı değildir
  - `resmi_bir_is_merkezi_tanimi_bulunmamaktadir`: Resmi iş merkezi veya makine grubu tanımlaması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** İş Merkezi Ana Veri Modeli ve Maliyet Merkezi Eşleşmelerini belirler.

#### [PRD-016] İş merkezlerinin kapasitesi hesaplanırken yalnızca Makine Kapasitesi mi, yoksa İnsan Gücü / Operatör Sayısı (Personel Kapasitesi) kısıtı da eşzamanlı olarak modellenmekte midir?
- **Süreç:** İş Merkezi / Work Center | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `hem_makine_hem_operator_kapasitesi_birlikte_modellenir_hangisi_darsa_limit_odur`: Evet; makine olsa bile onu çalıştıracak sertifikalı operatör yoksa kapasite sınırlı kabul edilir
  - `yalnizca_makine_saati_baz_alinir_operator_sayisi_sinirsiz_varsayilir`: Sadece makinenin çalışma saati baz alınır; operatör iş gücü kısıtı sistemde ayrı modellenmez
  - `yalnizca_adam_saat_iscilik_kapasitesi_takip_edilir_manuel_agirliklidir`: Makine yoktur veya önemsizdir; tamamen adam-saat işçilik kapasitesine göre planlama yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** İş Gücü vs Makine Kısıtlı Kapasite Modelleme (Dual Capacity Constraint) Stratejisini belirler.

---

### 9. Üretim Takvimi ve Vardiya

#### [PRD-017] Fabrika genelinde ve iş merkezi bazında Çalışma Günleri, Vardiya Saatleri (1, 2 veya 3 Vardiya), Resmi/Dini Tatiller ve Fabrika Yıllık Duruş Günlerini içeren Üretim Takvimi sistemde aktif olarak işletilmekte midir?
- **Süreç:** Üretim Takvimi ve Vardiya | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_is_merkezlerinin_vardiya_saatleri_ve_tatil_takvimi_sistemde_tanimlidir_terminler_buna_gore_hesaplanir`: Evet; hangi hattın kaç vardiya çalıştığı ve tatil günleri takvimdedir; sistem pazar gününü otomatik atlayarak termin verir
  - `takvim_sistemde_vardir_ancak_statiktir_vardiya_degisiklikleri_veya_mesailer_yansitilmaz`: Standart 5 gün takvim vardır fakat cumartesi mesaisi veya 2. vardiyaya geçiş gibi durumlar sisteme işlenmez
  - `sistemik_uretim_takvimi_kullanilmamaktadir`: Sistemik üretim takvimi veya vardiya yönetimi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Fabrika Takvimleri, Vardiya Modelleri ve Net Çalışma Saatleri Hesabını belirler.

#### [PRD-018] Yoğun dönemlerde açılan Fazla Mesailer, Hafta Sonu Çalışmaları veya Bakım Nedeniyle Planlı Duruşlar üretim takvimine esnek olarak yansıtılarak kapasite anlık artırılıp azaltılabilmekte midir?
- **Süreç:** Üretim Takvimi ve Vardiya | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `mesai_veya_bakim_durusu_takvime_islenir_ve_o_haftanin_net_kapasitesi_otomatik_guncellenir`: Evet; cumartesi mesaisi girildiğinde hattın kapasitesi artar; planlı bakım girildiğinde o saatler kapasiteden düşer
  - `mesailer_sistem_disinda_tutulur_sistemdeki_kapasite_hep_standart_kalir`: Mesai veya bakım takvime işlenmez; sistem standart 8 saat üzerinden planlamaya devam eder
  - `esnek_kapasite_takvimi_kullanilmamaktadir`: Esnek takvim veya dinamik kapasite uyarlaması kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Dinamik Kapasite İstisnaları ve Bakım-Üretim Takvim Entegrasyonunu belirler.

---

### 10. Talep Kaynakları

#### [PRD-019] Fabrikanızda üretim planını ve malzeme ihtiyaçlarını tetikleyen temel Talep Kaynakları (Kesin Satış Siparişleri, Satış Tahminleri / Forecast, Emniyet Stoğu Tamamlama, Proje İş Planı vb.) nelerdir?
- **Süreç:** Talep Kaynakları | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `hem_kesin_satis_siparisleri_hem_de_aylik_forecast_tahminleri_birlikte_talep_kaynagidir`: Kesin Müşteri Siparişleri ve Satış Tahminleri (Forecast) birlikte değerlendirilerek üretim tetiklenir
  - `yalnizca_onaylanmis_kesin_musteri_satis_siparisleri_uretimi_tetikler`: Yalnızca onaylı kesin satış siparişleri üretim talebi oluşturur; forecast kullanılmaz
  - `min_max_stok_ve_emniyet_stogu_seviyelerinin_altina_dusen_urunler_otomatik_uretim_tetikler`: Min/Max stok hedeflerine göre ambar stoğu kritik seviyenin altına indikçe üretim tetiklenir
  - `uretim_talebi_yonetim_karariyla_manuel_hazirlanan_aylik_is_listeleriyle_baslatilir`: Sistemik talep entegrasyonu yoktur; fabrika yönetimi her ay başında ne üretileceğini manuel liste olarak belirler *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Talep Yönetimi (Demand Management) ve Üretim Tetikleme Kurallarını belirler.

#### [PRD-020] Kritik ürünler veya uzun tedarik süreli hammaddeler için Emniyet Stoğu (Safety Stock) ve Stratejik Yarı Mamul Tamponları (Buffer Stock) planlama motoru tarafından otomatik hesaba katılıyor mu?
- **Süreç:** Talep Kaynakları | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `emniyet_stoklari_sistemdedir_stok_bu_seviyenin_altina_indiginde_mrp_otomatik_uretim_satinalma_onerir`: Evet; kritik parçaların emniyet stoğu tanımlıdır ve net ihtiyaç hesabında emniyet stoğunu tamamlayacak miktar eklenir
  - `emniyet_stoklari_excel_listesinde_tavsiye_olarak_durur_sisteme_bagli_degildir`: Emniyet stoğu Excel'de takip edilir; planlamacı sipariş açarken manuel göz kararı ilave yapar
  - `emniyet_stogu_politikasi_uygulanmamaktadir`: Resmi bir emniyet stoğu veya tampon stok politikası bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Emniyet Stoğu Boyutlandırma ve Otomatik Tamamlama Parametrelerini belirler.

---

### 11. Satış Siparişinden Üretim İhtiyacı

#### [PRD-021] Satış departmanı tarafından sisteme girilen bir satış siparişi onaylandığında üretim ihtiyacı (Production Demand / MTO İhtiyacı) otomatik olarak oluşmakta ve siparişe özel izlenebilmekte midir?
- **Süreç:** Satış Siparişinden Üretim İhtiyacı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `satis_siparisi_onaylaninca_otomatik_uretim_ihtiyaci_olur_ve_siparis_is_emri_baglantisi_korunur`: Evet; satış siparişi onaylandığı an üretim talebine dönüşür, hangi iş emrinin hangi müşteriye ait olduğu uçtan uca izlenir
  - `satis_ekibi_siparis_formunu_yazdirir_veya_eposta_atar_planlamaci_sisteme_tekrar_elle_girer`: Otomatik akış yoktur; satış ekibi e-posta atar, planlamacı bilgileri kendi planlama sistemine manuel işler
  - `satis_ve_uretim_sistemleri_tamamen_ayridir_entegrasyon_yoktur`: Satış ve üretim sistemleri ayrıdır; üretim sipariş bazında değil toplu parti olarak planlanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Satış-Üretim Uçtan Uca İzlenebilirlik ve Sipariş Eşleştirme (Pegging) Modelini belirler.

#### [PRD-022] Satış ekibi yeni bir sipariş alırken veya teklif verirken müşteriye Teslim Tarihi / Termin Sözü (CTP - Capable-to-Promise / ATP - Available-to-Promise) verirken fabrikanın mevcut kapasite ve malzeme durumunu sistemden görebilmekte midir?
- **Süreç:** Satış Siparişinden Üretim İhtiyacı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `sistem_malzeme_stok_ve_hat_kapasitesini_kontrol_ederek_otomatik_ve_gercekci_termin_tarihi_onerir`: Evet; sistem hattın doluluk takvimine ve malzeme tedarik süresine bakarak teslim tarihini (CTP) otomatik önerir
  - `satis_temsilcisi_planlama_veya_uretim_mudurunu_arayıp_ne_zamana_cikar_diye_sorar`: Sistemik kontrol yoktur; satışçı telefonla planlamacıyı arar, 'Haftaya çıkar mı?' diye sorarak sözlü termin alır
  - `standart_bir_termin_suresi_soylenir_fabrika_durumu_kontrol_edilmez`: Fabrikaya sorulmadan standart '3 hafta' denir; fabrikada sıkışıklık olunca teslimatlar gecikir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Canlı ATP/CTP Termin Hesaplama Motoru İhtiyacını belirler.

---

### 12. Forecast ve MPS

#### [PRD-023] Şirketinizde satış tahminleri ve kesin siparişleri birleştirerek haftalık/aylık bazda Ana Üretim Çizelgesi (MPS - Master Production Schedule) oluşturulmakta mıdır?
- **Süreç:** Forecast ve MPS | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `haftalik_ve_aylik_donemler_icin_onayli_ana_uretim_cizelgesi_mps_sistemde_resmi_calistirilir`: Evet; mamul bazında haftalık/aylık MPS çizelgesi oluşturulur, gelen siparişler forecast tahminlerini tüketerek planlanır
  - `mps_cizelgesi_excel_tablolarinda_hazirlanir_yonetime_sunulur_fakat_erp_ye_girilmez`: Excel'de haftalık/aylık üretim çizelgesi yapılır fakat ERP içine aktarılmadan manuel takip edilir
  - `mps_veya_forecast_kullanilmamaktadir_yalniz_anlik_siparisle_planlanir`: MPS veya forecast kullanılmamaktadır; sadece anlık gelen siparişlere göre günlük/haftalık plan yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Ana Üretim Çizelgesi (MPS) Modülü ve Talep Tüketim Kurallarını belirler.

#### [PRD-024] MPS çizelgesinde üretime çok yakın günlerde planın bozulmasını engellemek için Dondurulmuş Dönem / Donuk Ufuk (Frozen Horizon / Time Fence) kuralları uygulanmakta mıdır?
- **Süreç:** Forecast ve MPS | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `PRD-023 != "mps_veya_forecast_kullanilmamaktadir_yalniz_anlik_siparisle_planlanir"`
- **Seçenekler:**
  - `onumuzdeki_1_2_haftalik_plan_dondurulur_acil_onay_olmadan_kimse_plani_degistiremez`: Evet; önümüzdeki 1-2 haftalık plan dondurulmuştur (Frozen); yeni sipariş gelse bile acil onay olmadan plan bozulamaz
  - `dondurulmus_donem_kurali_yoktur_yonetici_istedigi_an_mevcut_plani_degistirip_yeni_is_araya_sokar`: Donuk dönem kuralı yoktur; hat çalışırken bile satış veya yönetim araya acil iş sokarak planı değiştirebilir
  - `dondurulmus_donem_kurali_uygulanmamaktadir`: Dondurulmuş dönem veya time fence kuralları uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Planlama Zaman Çitleri (Planning Time Fence / Frozen Horizon) Tasarımını belirler.

---

### 13. MRP / Malzeme İhtiyaç Planlama

#### [PRD-025] Fabrikanızda tüm mamul, yarı mamul ve hammadde ihtiyaçlarını stoklar, açık siparişler ve teslim sürelerine göre hesaplayan Malzeme İhtiyaç Planlaması (MRP - Material Requirements Planning) sistemi çalıştırılmakta mıdır?
- **Süreç:** MRP / Malzeme İhtiyaç Planlama | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `erp_uzerinde_tam_entegre_mrp_motoru_duzenli_calistirilir_satinalma_ve_uretim_onerileri_uretir`: Evet; ERP MRP motoru periyodik çalışır; stokları ve siparişleri tarayarak ne zaman ne üretilmeli ve ne satın alınmalı listesini çıkarır
  - `mrp_benzeri_hesaplamalar_excel_tablolarinda_formul_ve_makrolarla_manuel_yapilir`: Sistemik MRP yoktur; planlama uzmanı Excel tablolarında formüllerle hammadde ihtiyaçlarını kendisi hesaplar
  - `mrp_kullanilmamaktadir_malzeme_ihtiyaclari_manuel_veya_tecrubeyle_cikarilir`: MRP kullanılmamaktadır; malzeme ihtiyaçları sipariş geldikçe veya ambara bakılarak göz kararı çıkarılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** MRP Motoru Kurulumu ve Otomatik Öneri Üretme Altyapısını belirler.

#### [PRD-026] MRP sistemi hangi sıklıkta (Her gece toplu / Regenerative MRP, Gün içinde anlık / Net-Change MRP, Haftalık) çalıştırılmaktadır ve hangi ambar/tesisleri kapsamaktadır?
- **Süreç:** MRP / Malzeme İhtiyaç Planlama | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `PRD-025 != "mrp_kullanilmamaktadir_malzeme_ihtiyaclari_manuel_veya_tecrubeyle_cikarilir"`
- **Seçenekler:**
  - `her_gece_otomatik_calisir_tum_fabrika_ve_ambar_stoklarini_kapsar`: Her gece otomatik (Regenerative/Batch) çalışır ve tüm fabrika ambarlarını tarayarak sabah planlama ekranına hazır getirir
  - `siparis_girdikce_veya_degistikce_anlik_net_change_mrp_calisir`: Anlık (Net-Change) çalışır; sisteme yeni sipariş girildiği an sadece etkilenen parçalar için plan güncellenir
  - `haftada_bir_veya_ihtiyac_oldukca_planlamaci_tarafindan_manuel_calistirilir`: Haftada bir gün (Örn. Pazartesi sabahı) planlamacı tarafından manuel tetiklenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** MRP Çalıştırma Frekansı ve Ambar Filtreleme Kapsamını belirler.

---

### 14. Net İhtiyaç Hesabı

#### [PRD-027] MRP çalışmasında Brüt İhtiyaçtan (Gross Requirement) mevcut stoklar, yoldaki siparişler ve rezerve miktarlar düşülerek Net İhtiyaç (Net Requirement) hesaplama mantığı nasıl işletilmektedir?
- **Süreç:** Net İhtiyaç Hesabı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `brut_ihtiyactan_mevcut_stok_ve_acik_siparisler_dusulup_emniyet_stogu_eklenerek_net_ihtiyac_cikar`: Evet; sistem (Brüt Talep - Eldeki Stok - Açık Satın Alma + Emniyet Stoğu) formülüyle net ihtiyaç ve tedarik tarihi üretir
  - `eldeki_stok_dusulur_ancak_yoldaki_siparisler_veya_rezervasyonlar_tam_hesaba_katilmaz`: Sadece ambardaki stoğa bakılır; yoldaki satın alma siparişleri veya başka işe rezerve stoklar tam düşülemez
  - `stoklar_ve_acik_siparisler_dusulmez_her_siparis_icin_sifirdan_tum_malzeme_alinir_uretilir`: Netleştirme yapılmaz; ambarda malzeme olsa bile her sipariş için baştan hammadde satın alınır/üretilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Net İhtiyaç Hesaplama Formülasyonu ve Stok Tahsis Mantığını belirler.

#### [PRD-028] Açık Satın Alma Siparişleri (PO) ve Yoldaki Malların Tahmini Varış Tarihleri (Scheduled Receipts) net ihtiyaç hesabında hangi güvenilirlikle dikkate alınmaktadır?
- **Süreç:** Net İhtiyaç Hesabı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `satinalma_siparislerindeki_onayli_termin_tarihleri_mrp_tarafindan_zaman_ekseninde_dogru_kullanilir`: Evet; satın alma siparişindeki tedarikçi teyit tarihi baz alınır, malın geleceği günden önce o hammaddeye ihtiyaç duyulursa uyarı verir
  - `siparislerin_tarihleri_guncellenmez_geciken_siparisler_yuzunden_plan_yaniltici_olur`: Tarihler güncellenmez; tedarikçi gecikse bile sistem malı eski tarihte varmış gibi sayar ve hatalı plan üretir
  - `yoldaki_siparisler_hesaba_katilmamaktadir`: Yoldaki siparişler net ihtiyaç hesabına katılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Yoldaki Mal Entegrasyonu ve Tedarik Gecikme Alarmlarını belirler.

---

### 15. Lot Büyüklüğü ve Parti Politikaları

#### [PRD-029] Üretim ve satın alma ihtiyaçları oluşturulurken Lot Büyüklüğü Politikaları (Birebir İhtiyaç / Lot-for-Lot, Sabit Parti, Minimum Üretim Miktarı, Ekonomik Sipariş Miktarı / EOQ) nasıl belirlenmektedir?
- **Süreç:** Lot Büyüklüğü ve Parti Politikaları | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `malzeme_bazinda_lot_politikasi_tanimlidir_orn_min_500_adet_veya_100_un_katlari_seklinde_yuvarlanir`: Evet; her ürün ve hammadde için Min Parti, Katları (Yuvarlama) veya Birebir (L4L) kuralları sistemde tanımlıdır
  - `tum_urunler_icin_yalnizca_birebir_ihtiyac_kadar_lot_for_lot_emir_acilir`: Yalnızca birebir (Lot-for-Lot) çalışılır; 37 adet lazımsa tam 37 adetlik iş emri veya satın alma açılır
  - `parti_buyuklukleri_planlamacinin_tecrubesine_gore_manuel_duzeltilir`: Sistemik parti kuralı yoktur; planlamacı ekrandaki ihtiyacı görüp 'Bunu 1.000 adede tamamlayalım' diye elle düzeltir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Lot Sizing Parametreleri (Min/Max, Fixed, Rounding, EOQ) Kurgusunu belirler.

#### [PRD-030] Üretim partilerinde ilk ayar firesi (Setup Scrap) veya proses hurda oranları hesaplanarak açılacak iş emri miktarının otomatik olarak artırılması sağlanmakta mıdır?
- **Süreç:** Lot Büyüklüğü ve Parti Politikaları | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `fire_katsayisi_partiye_otomatik_eklenir_1000_adet_saglam_icin_1050_adetlik_is_emri_acilir`: Evet; 1.000 adet net mamul gerekiyorsa %5 fire katsayısıyla sistem 1.050 adetlik iş emri önerir
  - `tam_miktar_acilir_fire_verilirse_eksik_kalan_icin_sonradan_ek_is_emri_acilir`: Fire önceden eklenmez; tam miktar açılır, üretimde fire çıkıp eksik kalırsa sonradan telafi emri açılır
  - `parti_bazli_fire_artirimi_yapilmamaktadir`: Parti bazlı fire artırımı yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Otomatik Parti Hurda/Fire Telafi Katsayısı Ayarını belirler.

---

### 16. Lead Time ve Termin Hesabı

#### [PRD-031] Müşterinin istediği teslim tarihinden geriye doğru (Backward Scheduling) giderek her bir yarı mamulün ve hammaddenin üretime/siparişe başlama tarihleri (Lead Time Ofsetleri) sistem tarafından otomatik hesaplanmakta mıdır?
- **Süreç:** Lead Time ve Termin Hesabı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `teslim_tarihinden_geriye_dogru_tum_operasyon_ve_tedarik_lead_time_lari_hesaplanarak_baslama_tarihi_bulunur`: Evet; geriye doğru çizelgeleme (Backward Scheduling) ile en geç hangi gün hammadde siparişi verileceği ve iş emri başlatılacağı bulunur
  - `ileriye_dogru_cizelgeleme_yapilir_bugun_baslanirsa_ne_zaman_bitecegi_hesaplanir`: İleriye doğru (Forward Scheduling) planlanır; iş bugünden başlatılır, toplam lead time eklenerek bitiş tarihi bulunur
  - `lead_time_hesabi_manuel_veya_tahmini_yapilir_sistemik_cizelgeleme_yoktur`: Sistemik çizelgeleme yoktur; planlamacı kafasından 'Bu iş 10 gün sürer' diyerek başlama tarihi yazar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Geriye / İleriye Doğru Çizelgeleme (Scheduling Direction) Motorunu belirler.

#### [PRD-032] Hammadde mal kabulünde veya yarı mamul ara aşamalarında yapılan Kalite Kontrol Muayene ve Laboratuvar Bekleme Süreleri (QC Lead Time) planlanan teslimat sürelerine dahil edilmekte midir?
- **Süreç:** Lead Time ve Termin Hesabı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `kalite_onay_ve_laboratuvar_sureleri_malzemenin_lead_time_ina_eklenir_kullanilabilirlik_buna_gore_hesaplanir`: Evet; hammadde gelse bile 2 günlük kalite onay süresi geçmeden o malzemenin üretime hazır olmayacağı planlanır
  - `kalite_suresi_plana_eklenmez_mal_fabrikaya_girdigi_an_kullanilabilir_sayilir`: Kalite süresi hesaba katılmaz; mal ambara girdiği an üretime verilebilir kabul edilir
  - `kalite_bekleme_suresi_takip_edilmemektedir`: Kalite kontrol bekleme süresi takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Kalite Kontrol Bekleme Süresi (QC Inspection Lead Time) Entegrasyonunu belirler.

---

### 17. Kapasite Planlama

#### [PRD-033] Fabrikanızda makinelerin ve montaj hatlarının kapasite yükleri (Kaba Kapasite / RCCP veya Detaylı Kapasite / CRP) sistemde hesaplanmakta ve aşırı yüklenmeler (Overload) grafiksel olarak izlenmekte midir?
- **Süreç:** Kapasite Planlama | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_is_merkezlerinin_kapasite_ve_yuk_oranlari_sistemden_grafiksel_olarak_anlik_izlenir`: Evet; her tezgâhın o haftaki kapasitesi ve üzerine planlanan iş yükü (%) grafiksel olarak izlenir, aşırı yükler kırmızı görünür
  - `makine_ve_hat_yukleri_excel_tablolarinda_toplam_saat_olarak_takip_edilir`: Sistemik kapasite yükleme yoktur; planlama şefi Excel'de makinelerin toplam saatini formülle takip eder
  - `sistemik_kapasite_planlama_yapilmamaktadir_sonsuz_kapasite_varsayilir`: Kapasite planlama yapılmamaktadır; işler açılır, makineler yetişebildiği kadarını üretir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Kapasite İhtiyaç Planlaması (CRP) ve Grafiksel Yükleme Panosu İhtiyacını belirler.

#### [PRD-034] Kapasite aşımı durumunda sistem işleri Sonlu Kapasite Çizelgeleme (Finite Scheduling) ile otomatik olarak boş günlere veya alternatif tezgâhlara kaydırmakta mıdır?
- **Süreç:** Kapasite Planlama | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `PRD-033 != "sistemik_kapasite_planlama_yapilmamaktadir_sonsuz_kapasite_varsayilir"`
- **Seçenekler:**
  - `sonlu_kapasite_kullanilir_makine_doldugunda_sistem_isi_otomatik_bir_sonraki_musait_zamana_otar`: Evet; sonlu kapasite (Finite Scheduling) uygulanır; makinenin kapasitesi dolunca sistem işi otomatik erteler
  - `sonsuz_kapasite_planlanir_asiri_yuk_varsa_planlamaci_isleri_manuel_baska_gune_kaydirir`: Sonsuz kapasite (Infinite) planlanır; sistem aynı güne %200 yük bindirebilir, planlamacı çakışmaları elle çözer
  - `sonlu_kapasite_cizelgeleme_kullanilmamaktadir`: Sonlu kapasite çizelgeleme kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Sonlu Kapasite (Finite) vs Sonsuz Kapasite (Infinite) Çizelgeleme Algoritmasını belirler.

---

### 18. Darboğaz Yönetimi

#### [PRD-035] Fabrikanızdaki Darboğaz İş Merkezleri (Bottleneck Work Centers — Tüm fabrikanın çıkış hızını belirleyen kısıtlı makineler) belirlenmiş midir ve üretim planı bu darboğazların ritmine göre mi (TOC / Drum-Buffer-Rope) kurulmaktadır?
- **Süreç:** Darboğaz Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `darbogaz_is_merkezleri_tanimlidir_tum_fabrika_plani_darbogazin_hizina_ve_onundeki_tampona_gore_yapilir`: Evet; darboğaz tezgâhlar bellidir ve planlama önce darboğazı %100 dolduracak şekilde kurgulanır
  - `darbogaz_makineler_bilinir_ancak_planlama_sisteminde_ozel_bir_oncelik_veya_kural_yoktur`: Darboğazlar tecrübeyle bilinir fakat sistem tüm makineleri eşit ağırlıkta planlar
  - `darbogaz_analizi_yapilmamistir`: Darboğaz analizi veya darboğaz odaklı planlama yapılmamıştır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Darboğaz Odaklı Çizelgeleme (Drum-Buffer-Rope) Stratejisini belirler.

#### [PRD-036] Darboğaz iş merkezlerinde yığılma veya arıza olduğunda işlerin onaylı Alternatif İş Merkezlerine (Alternative Work Centers) veya fason tedarikçiye aktarılması sistemde nasıl yönetilmektedir?
- **Süreç:** Darboğaz Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `rotada_onayli_alternatif_is_merkezleri_tanimlidir_tek_tikla_veya_otomatik_is_aktarilir`: Evet; rotada 1. ve 2. alternatif tezgâhlar tanımlıdır; darboğaz sıkışınca iş emri alternatif kaynağa kolayca atanır
  - `alternatif_makine_atamasi_sistemde_rotayi_ve_sureleri_bastandegistirerek_manuel_yapilir`: Otomatik alternatif yoktur; planlamacı iş emrini silip yeni rotayla baştan açmak zorunda kalır
  - `alternatif_is_merkezi_yonetimi_bulunmamaktadir`: Alternatif iş merkezi yönetimi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Alternatif İş Merkezi ve Fason Yük Dengeleme Kurallarını tanımlar.

---

### 19. Setup / Changeover Etkisi

#### [PRD-037] Makinelerdeki Kalıp Değişimi, Renk Değişimi, Ebat Ayarı ve Temizlik (Setup / Changeover) süreleri üretim çizelgelemesinde dikkate alınmakta mıdır?
- **Süreç:** Setup / Changeover Etkisi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `her_is_icin_standart_setup_sureleri_rotada_tanimlidir_ve_hat_kapasitesinden_otomatik_duser`: Evet; kalıp veya ayar değişim süreleri rotada tanımlıdır ve planlanan üretim süresine net olarak eklenir
  - `setup_sureleri_ayri_tutulmaz_parca_basi_cevrim_suresinin_icine_yedirilir`: Setup ayrı süre olarak tutulmaz; parça başı üretim süresi biraz yüksek tutularak setup içinde eritilir
  - `setup_sureleri_planlamada_dikkate_alinmamaktadir`: Setup ve kalıp değişim süreleri planlamada dikkate alınmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Setup Süresi Kapasite Düşüm ve Çizelgeleme Kurgusunu belirler.

#### [PRD-038] Setup sürelerini ve firelerini en aza indirmek için benzer ürünlerin ardışık üretilmesini sağlayan Sıralama Optimizasyonu (Sequence-Dependent Setup / Matris Planlama — Örn. Açık renkten koyu renge, inceden kalına, aynı kalıptaki işlerin gruplanması) uygulanmakta mıdır?
- **Süreç:** Setup / Changeover Etkisi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `benzer_urunler_kalip_renk_ebat_kriterine_gore_gruplanarak_ardisik_siraya_dizilir_setup_minimize_edilir`: Evet; sistem veya planlamacı aynı kalıbı kullanan işleri bir araya toplayarak gereksiz kalıp sökme-takmayı engeller
  - `isler_sadece_musteri_terminine_gore_siralanir_setup_kayiplari_onemsenmez`: Gruplama yapılmaz; sipariş teslim tarihi hangisi önceyse o üretilir, gün içinde defalarca kalıp değiştirilir
  - `siralama_optimizasyonu_uygulanmamaktadir`: Sıralama optimizasyonu veya setup matrisi uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Sıraya Bağlı Setup Matrisleri (Setup Matrix Optimization) İhtiyacını belirler.

---

### 20. Malzeme Eksikliği Yönetimi

#### [PRD-039] Bir iş emri üretime verilmeden önce reçetesindeki tüm hammadde ve yarı mamullerin ambarda tam olarak mevcut olup olmadığını gösteren Malzeme Hazır Bulunurluk / Eksik Malzeme Kontrolü (Material Availability Check / Shortage Analysis) yapılmakta mıdır?
- **Süreç:** Malzeme Eksikliği Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistem_is_emri_oncesinde_eksik_malzeme_kontrolu_yapar_eksik_varsa_uyarir_veya_is_emrini_bloke_eder`: Evet; tüm bileşenler ambarda hazır olmadan iş emrinin sahaya serbest bırakılmasına (Release) izin verilmez
  - `malzeme_kontrolu_ambara_sozlu_sorularak_yapilir_eksik_parca_oldugu_cogu_zaman_uretim_ortasinda_anlasilir`: Sistemik kontrol yoktur; iş başlar, montaj sırasında bir civatanın veya parçanın eksik olduğu anlaşılınca hat durur
  - `malzeme_eksikligi_kontrolu_yapilmamaktadir`: Malzeme hazır bulunurluk kontrolü yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Otomatik Malzeme Hazır Bulunurluk Denetimi (ATP Check) ve Blokaj Kuralını belirler.

#### [PRD-040] Eksik malzemesi olan iş emirlerinin, ilgili satın alma siparişi depoya girdiği an otomatik olarak 'Üretime Hazır' durumuna geçirilmesi ve planlamacıya bildirim verilmesi sağlanmakta mıdır?
- **Süreç:** Malzeme Eksikliği Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `eksik_parca_depoya_girdigi_an_bekleyen_is_emirleri_sistemde_otomatik_uretime_hazir_statu_alir`: Evet; mal kabul yapıldığı anda o parçayı bekleyen tüm planlı iş emirleri yeşile döner ve planlamacı uyarılır
  - `malzemenin_geldigi_manuel_takip_edilir_depocu_veya_satinalmaci_planlamaciya_sozlu_haber_verir`: Sistemik tetik yoktur; depocu planlamacıya 'Beklediğin hammadde geldi' derse işleme başlanır
  - `eksik_malzeme_otomatik_bildirimi_bulunmamaktadir`: Eksik malzeme otomatik bildirim mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Mal Kabulü ile Bekleyen İş Emirlerinin Otomatik Tetiklenmesini belirler.

---

### 21. Planlı Üretim Emirleri

#### [PRD-041] MRP sonucunda oluşan Planlı Üretim Emirleri (Planned Orders / Üretim Önerileri) planlamacı tarafından incelenip onaylanarak kesinleşmiş Üretim Emrine (Firm / Released Work Order) nasıl dönüştürülmektedir?
- **Süreç:** Planlı Üretim Emirleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `planlamaci_mrp_ekraninda_planli_emirleri_gorur_toplu_veya_tek_tek_onaylayarak_kesin_is_emrine_donusturur`: Evet; planlama kokpitinde öneriler incelenir, kapasite ve malzeme teyidiyle tek tıkla kesin iş emri yapılır
  - `planli_emir_kavrami_yoktur_mrp_veya_planlamaci_dogrudan_kesin_is_emri_acar`: Planlı emir aşaması yoktur; sisteme girilen her talep doğrudan kesin iş emri olarak oluşur
  - `is_emirleri_sistem_disinda_excel_veya_kagit_uzerinde_acilir`: Sistemde iş emri açılmaz; matbu kağıt veya Excel iş dağıtım formu doldurularak sahaya verilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Planlı Emir Kesinleştirme (Firming) ve Planlama Kokpiti İş Akışını belirler.

#### [PRD-042] Bir planlı emir kesin iş emrine dönüştürüldüğü anda gereken hammadde ve yarı mamul stokları o iş emri için sistemde rezerve edilip başka işlerin kullanımına kapatılmakta mıdır?
- **Süreç:** Planlı Üretim Emirleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `is_emri_kesinlestigi_an_malzemeler_stokta_rezerve_edilir_baska_is_emri_o_malzemeyi_kullanamaz`: Evet; iş emri açılınca hammadde stoğu o iş emrine rezerve olur (Tahsis), fiili sarf olmasa bile başkası çekemez
  - `rezervasyon_yapilmaz_ambara_ilk_giden_usta_malzemeyi_alir_sonraki_is_emri_malzemesiz_kalir`: Sistemik rezervasyon yoktur; rafta malzeme varsa ilk başlayan iş emri kullanır, diğeri açıkta kalır
  - `stok_rezervasyonu_kullanilmamaktadir`: Stok rezervasyon mekanizması kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Sert Stok Tahsisi (Hard Allocation) ve Malzeme Çakışma Önleme Kuralını belirler.

---

### 22. Önceliklendirme ve Yeniden Planlama

#### [PRD-043] Acil bir müşteri siparişi geldiğinde, kritik bir makine arızalandığında veya hammadde geciktiğinde üretim planının Dinamik Olarak Yeniden Çizelgelenmesi (Dynamic Replanning / Rescheduling) nasıl yönetilmektedir?
- **Süreç:** Önceliklendirme ve Yeniden Planlama | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistem_guncel_ariza_veya_oncelige_gore_etkilenen_tum_isleri_otomatik_yeniden_cizelgeler_ve_uyari_verir`: Evet; makine arızası veya acil sipariş girildiğinde sistem kalan işlerin terminlerini dinamik olarak yeniden hesaplar
  - `planlamaci_excel_uzerinde_tum_cizelgeyi_bastan_manuel_kaydirarak_revize_eder`: Otomatik yeniden planlama yoktur; planlamacı Excel tablosunu açıp saatlerce tüm işleri tek tek elle kaydırır
  - `plan_revize_edilmez_sahada_ustabasi_kendi_inisiyatifiyle_islerin_sirasini_degistirir`: Plan revize edilmez; atölyede ustabaşı telefonla gelen talimata göre işlerin sırasını sahada anlık değiştirir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Dinamik Yeniden Çizelgeleme ve İstisna Yönetimi (Exception Handling) Mekanizmasını belirler.

---

### 23. Üretim Planlama KPI

#### [PRD-044] Fabrikanızda Üretim Planına Uyum Oranı (Plan Adherence / Schedule Adherence), Kapasite Kullanım Oranı (Capacity Utilization), Malzeme Eksikliği Kaynaklı Duruş Sayısı ve Planlanan vs Gerçekleşen Bitiş Tarihi metrikleri düzenli ölçülmekte midir?
- **Süreç:** Üretim Planlama KPI | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `plana_uyum_orani_kapasite_kullanimi_ve_gecikme_metrikleri_sistemden_canli_kpi_panosuyla_izlenir`: Evet; planlanan ile gerçekleşen teslim tarihi uyumu (%), hat kapasite doluluğu ve backlog metrikleri sistemden raporlanır
  - `aylik_toplantilarda_bazi_kpi_lar_excel_tablolarindan_manuel_derlenerek_sunulur`: Canlı takip yoktur; ay sonlarında planlama sorumlusu Excel verilerini toparlayarak yönetime uyum yüzdesi sunar
  - `uretim_planlama_kpi_lari_olculmemektedir`: Üretim planlama performans göstergeleri veya plana uyum oranı ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/MRP Karar Etkisi:** Üretim Planlama Yönetici Kokpiti ve Performans Analitiği Tasarımını belirler.
