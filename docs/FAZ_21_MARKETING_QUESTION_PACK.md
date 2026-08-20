# FAZ-21 — Pazarlama ve Kampanya / MARKETING Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.marketing.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `MARKETING` (Pazarlama ve Kampanya)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Pazarlama Direktörleri (CMO), Dijital Pazarlama Yöneticileri, Talep Yaratma (Demand Gen) Ekipleri ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP/CRM dönüşümü öncesinde pazarlama organizasyonu ve ajans yönetimi, dönemsel pazarlama hedefleri ve satış kotalarıyla hizalanma, kurumsal kampanya planlama ve takvim yönetimi, hedef kitle segmentasyonu ve dinamik filtreler, kampanya listeleri ve mükerrer kayıt temizliği (de-duplication), izinli pazarlama veri tabanı ve kara liste (suppression list), omni-channel lead generation ve inbound web formları, lead kaynakları ve UTM parametreleri izlenebilirliği, dijital reklam kanalları (Google, LinkedIn, Meta) ve CRM API entegrasyonu, toplu e-posta pazarlama altyapısı ve teslim/açılma/tıklanma metrikleri, SMS/mesajlaşma ve İYS izin süreçleri, fiziksel/çevrimiçi etkinlik ve fuar yönetimi ile follow-up iş akışları, kampanya içerik ve onay mekanizmaları, kampanya bütçe planlaması ve gerçekleşen harcama takibi, lead nitelendirme (MQL/SQL) ve lead scoring puanlama modelleri, satışa lead dağıtımı (CRM handoff) ve SLA takibi, kampanya dönüşüm takibi ve kayıp nedenleri analizi, çoklu temas noktası gelir paylaşımı (attribution modelleme), müşteri edinme maliyeti (CAC), aday maliyeti (CPL), pazarlama ROI/ROAS ve pazarlama KPI kokpiti süreçlerinin AS-IS durumunu ve ERP/CRM/Marketing gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | MARKETING ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **CRM** | Müşteri ana verisi, kontaklar, hiyerarşi, müşteri 360 ekranı, görüşme kütüğü, açık şikâyetler ve müşteri memnuniyeti | **CRM mevcut müşteri hafızasını ve müşteri ilişkisini sorgular.** MARKETING yeni aday (lead) yaratmayı, kampanyaları, hedef kitle seçimini, MQL nitelendirmeyi ve CRM'e lead aktarımını sorgular. *(Müşteri kartı veya şikâyet soruları MARKETING'te tekrarlanmaz)*. |
| **SALES** | Fırsatlar (Opportunity), satış pipeline, teklif/sipariş döngüsü, satış kotaları ve forecast | **SALES ticari satış sürecini sorgular.** MARKETING lead yaratma kanallarını, lead scoring kriterlerini ve satışa handoff anını sorgular. *(Fırsat/Pipeline/Satış Hedefi soruları MARKETING'te tekrarlanmaz)*. |
| **PROPOSALS** | Fiyat listeleri, müşteri özel fiyatları, maliyet görünürlüğü, marj zırhı, iskontolar, teklif versiyonlama ve onay | **PROPOSALS ticari teklif ve fiyatlandırma hesaplarını sorgular.** MARKETING kampanya duyurularını ve promosyon iletişimini sorgular. *(Teklif dokümanı veya fiyat motoru soruları MARKETING'te tekrarlanmaz)*. |
| **BUDGET_REPORTING** | Kurumsal bütçe, departman bütçeleri, fiili-bütçe sapmaları | **BUDGET_REPORTING şirket geneli bütçe defterini sorgular.** MARKETING kampanya özel bütçesini, kanal harcamalarını ve kampanya bazlı harcama kontrolünü sorgular. |
| **REPORTING_ANALYTICS** | DWH/ETL mimarisi, veri ambarı, BI semantik modelleri | **REPORTING_ANALYTICS analitik veri altyapısını sorgular.** MARKETING pazarlama performans metriklerinin (CPL, CAC, ROI) operasyonel kullanımını sorgular. |
| **MARKETING** | Pazarlama organizasyonu, kampanya planlama, hedef kitle/segmentasyon, kampanya listeleri, lead generation, lead kaynakları, dijital reklamlar, e-posta/SMS, fuar/etkinlik, kampanya bütçesi, lead scoring, CRM handoff, attribution, ROI ve CAC | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular pazarlama yönetimi, kampanya icrası ve talep yaratma odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Pazarlama Organizasyonu** (2 Soru — MKT-001, MKT-002)
2. **Pazarlama Hedefleri** (2 Soru — MKT-003, MKT-004)
3. **Kampanya Planlama** (2 Soru — MKT-005, MKT-006)
4. **Hedef Kitle ve Segmentasyon** (2 Soru — MKT-007, MKT-008)
5. **Kampanya Listeleri** (2 Soru — MKT-009, MKT-010)
6. **Lead Generation** (2 Soru — MKT-011, MKT-012)
7. **Lead Kaynakları** (2 Soru — MKT-013, MKT-014)
8. **Dijital Kanallar** (2 Soru — MKT-015, MKT-016)
9. **E-posta Pazarlama** (2 Soru — MKT-017, MKT-018)
10. **SMS / Mesajlaşma** (2 Soru — MKT-019, MKT-020)
11. **Etkinlik / Fuar / Webinar** (2 Soru — MKT-021, MKT-022)
12. **Kampanya İçerik ve Materyal Yönetimi** (2 Soru — MKT-023, MKT-024)
13. **Kampanya Onay Süreci** (2 Soru — MKT-025, MKT-026)
14. **Kampanya Bütçesi** (2 Soru — MKT-027, MKT-028)
15. **Lead Nitelendirme / Scoring Kullanımı** (2 Soru — MKT-029, MKT-030)
16. **Lead Dağıtımı ve CRM Handoff** (2 Soru — MKT-031, MKT-032)
17. **Kampanya Dönüşüm Takibi** (2 Soru — MKT-033, MKT-034)
18. **Attribution / Kaynak Analizi** (2 Soru — MKT-035, MKT-036)
19. **Pazarlama KPI ve ROI** (6 Soru — MKT-037, MKT-038, MKT-039, MKT-040, MKT-041, MKT-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Pazarlama Organizasyonu

#### [MKT-001] Şirketinizde pazarlama faaliyetleri (Kurumsal pazarlama, Dijital pazarlama, Ürün/Kategori pazarlaması, Etkinlik yönetimi) hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?
- **Süreç:** Pazarlama Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Pazarlama departman yapısı, uzmanlık alanları ve organizasyonel olgunluk.
- **Seçenekler:**
  - `ayri_ve_uzmanlasmis_pazarlama_departmani_tarafindan_merkezi_yurutulur`: Ayrı bir Pazarlama Departmanı (Dijital, İletişim, Ürün Yöneticileri) tarafından merkezi olarak yönetilir
  - `satis_departmani_altinda_pazarlama_sorumlulari_tarafindan_yurutulur`: Ayrı bir birim yoktur; Satış Departmanı içindeki personeller pazarlama görevlerini de üstlenir
  - `sirket_ortaklari_veya_ust_yonetim_tarafindan_dogrudan_yonetilir`: Şirket ortakları veya genel yönetim pazarlama faaliyetlerini doğrudan organize eder *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Pazarlama organizasyonel rol hiyerarşisi ve yetki matrisini belirler.

#### [MKT-002] Pazarlama operasyonlarında dış ajanslar (Reklam/Medya ajansı, Dijital performans ajansı, Etkinlik organizasyon firması, PR ajansı) ile iş birliği ve bilgi akışı nasıl yönetilmektedir?
- **Süreç:** Pazarlama Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Ajans ekosistemi, dış hizmet sağlayıcılar ve veri paylaşım modeli.
- **Seçenekler:**
  - `dis_ajanslarla_entegre_proje_ve_raporlama_araclari_uzerinden_duzenli_calisilir`: Evet; dijital reklam, kreatif veya etkinlik ajanslarıyla ortak paneller ve haftalık KPI toplantılarıyla çalışılır
  - `ajanslarla_yalnizca_eposta_ve_donem_sonu_raporlari_ile_manuel_iletisim_kurulur`: Ajanslar bağımsız çalışır; sadece ay sonu harcama ve lead raporları e-posta ile alınır
  - `dis_ajans_kullanilmamaktadir_tum_faaliyetler_ic_ekiple_yurutulur`: Dış ajans kullanılmamaktadır; tüm pazarlama ve kreatif işler şirket içi kaynaklarla yapılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Dış Ajans Entegrasyonu ve Veri Paylaşım Güvenliğini belirler.

---

### 2. Pazarlama Hedefleri

#### [MKT-003] Şirketinizin dönemsel (Yıllık/Çeyreklik) pazarlama hedefleri (Yeni lead adedi, Marka bilinirliği, Web trafiği, Müşteri adayı yaratma, Pazarlama kaynaklı ciro payı) tanımlı mıdır?
- **Süreç:** Pazarlama Hedefleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Pazarlama hedefleri, KPI çerçevesi ve hedef takip disiplini.
- **Seçenekler:**
  - `sayisal_ve_olculebilir_pazarlama_hedefleri_yillik_ceyrek_olarak_belirlenmistir`: Evet; yeni lead sayısı, MQL hedefi ve pazarlama kaynaklı ciro payı (%) net hedeflerle tanımlıdır
  - `genel_butce_ve_etkinlik_sayisi_vardir_ancak_net_lead_hedefi_yoktur`: Kaç fuara gidileceği veya ne kadar reklam bütçesi harcanacağı bellidir ancak net lead/ciro hedefi yoktur
  - `tanimlanmis_resmi_bir_pazarlama_hedefi_bulunmamaktadir`: Tanımlanmış resmi bir pazarlama hedefi yoktur; faaliyetler fırsat çıktıkça plansız yürütülür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Pazarlama Hedef ve KPI Yönetim Modeli tasarımını belirler.

#### [MKT-004] Belirlenen pazarlama hedefleri satış hedefleriyle (Sales Quota & Pipeline gereksinimleri) ne sıklıkla hizalanmakta ve gözden geçirilmektedir?
- **Süreç:** Pazarlama Hedefleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Pazarlama ve satış hizalanması (SMarketing Alignment), ortak hedef paylaşımı.
- **Seçenekler:**
  - `pazarlama_ve_satis_hedefleri_aylik_ortak_toplantilarla_hizalanir`: Evet; satışın pipeline ihtiyacına göre pazarlama hedefleri aylık/çeyreklik olarak senkronize edilir
  - `yalnizca_yil_basinda_butce_doneminde_konusulur_yil_ici_ayri_ilerler`: Yalnızca yıl başında bütçe yapılırken görüşülür; yıl içinde iki departman birbirinden bağımsız çalışır
  - `satis_ve_pazarlama_arasinda_hedef_hizalanmasi_yapilmamaktadir`: İki departman arasında hedef paylaşımı yoktur; satış kendi hedefine, pazarlama kendi işine bakar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Satış-Pazarlama Ortak Pipeline Hedefleme Mimarisi gereksinimini belirler.

---

### 3. Kampanya Planlama

#### [MKT-005] Pazarlama kampanyaları (Ürün lansmanı, Sezonluk indirim, Fuar/Etkinlik duyurusu, Sektörel talep yaratma) hangi ortamda (ERP/CRM kampanya modülü, Excel takvimi, Proje yönetim aracı) planlanmaktadır?
- **Süreç:** Kampanya Planlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kampanya yönetim yazılımı, planlama altyapısı ve kampanya süreçleri.
- **Seçenekler:**
  - `merkezi_crm_marketing_modulunde_planlanir_ve_yonetilir`: Kampanyalar merkezi CRM/Marketing modülünde hedef, bütçe, kanal ve takvim detaylarıyla açılır
  - `proje_yonetim_veya_gorev_takip_yazilimlarinda_planlanir`: Kampanya adımları genel proje/görev yönetim araçlarında (Trello, Asana vb.) takip edilir *(Not Alınabilir)*
  - `excel_tablolarinda_veya_ortak_takvimlerde_planlanir`: Sistemik kampanya modülü yoktur; kampanyalar Excel takviminde ve e-posta yazışmalarıyla planlanır
  - `onceden_planlama_yapilmaz_anlik_kampanyalar_duzenlenir`: Önceden planlama yapılmaz; ihtiyaç duyuldukça anlık kararla kampanya yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kampanya Yönetim Modülü ve İş Akışı Mimarisi seçimini belirler.

#### [MKT-006] Tüm pazarlama iletişimlerini ve kanallarını (E-posta, Sosyal medya, Dijital reklam, Fuar, Basın) gösteren merkezi bir Kurumsal Kampanya Takvimi kullanılmakta mıdır?
- **Süreç:** Kampanya Planlama
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Merkezi pazarlama takvimi, omni-channel iletişim planı ve çakışma kontrolü.
- **Seçenekler:**
  - `tum_kanallari_ve_sorumlulari_gosteren_canli_merkezi_takvim_aktif`: Evet; tüm ekiplerin gördüğü dijital/fiziksel temasları içeren merkezi pazarlama takvimi kullanılır
  - `her_kanal_kendi_takvimini_ayri_excelde_tutar`: Merkezi takvim yoktur; dijital reklamcı ayrı, etkinlikçi ayrı Excel dosyası tutar
  - `kurumsal_kampanya_takvimi_kullanilmamaktadir`: Kampanya takvimi tutulmamaktadır; ne zaman hangi iletişimin çıkacağı önceden görülmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Merkezi Kampanya Takvimi ve İletişim Çakışma Yönetimini belirler.

---

### 4. Hedef Kitle ve Segmentasyon

#### [MKT-007] Kampanyalarda hedef kitle (Sektör, Şirket ölçeği/ciro, Bölge, Satın alma geçmişi, Ürün ilgi grubu, Müşteri/Aday statüsü) nasıl belirlenmekte ve segmentlere ayrılmaktadır?
- **Süreç:** Hedef Kitle ve Segmentasyon
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Hedef kitle belirleme kriterleri, segmentasyon stratejisi ve veri filtreleme.
- **Seçenekler:**
  - `crm_ve_erp_verileri_uzerinden_cok_kriterli_akilli_segmentasyon_yapilir`: Evet; sektör, geçmiş ciro, son satın alma tarihi ve ürün grubu bazında hedef segmentler belirlenir
  - `genel_musteri_listesine_toplu_kampanya_cıkilir_ozel_segmentasyon_azdir`: Detaylı segmentasyon yapılmaz; tüm müşteri ve aday listesine genel toplu iletişim yapılır
  - `satis_temsilcilerinin_onerdigi_musteri_isimleri_toplanarak_olusturulur`: Sistemik filtreleme yoktur; satışçılardan 'Kimi arayalım?' diye liste istenir, birleştirilip kampanya yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Akıllı Müşteri Segmentasyon Motoru ve Dinamik Kitle Modellemesini belirler.

#### [MKT-008] Hedef kitle segmentasyonu CRM/ERP müşteri veritabanı üzerinden dinamik filtrelerle (Örn. 'Son 6 aydır sipariş vermeyen B2B müşteriler') otomatik oluşturulabilmekte midir?
- **Süreç:** Hedef Kitle ve Segmentasyon
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Dinamik segmentasyon filtreleri, otomatik güncellenen hedef listeler.
- **Seçenekler:**
  - `dinamik_filtrelerle_otomatik_guncellenen_akilli_listeler_kullanilir`: Evet; kural tanımlanır (Örn. 'Marmara Bölgesi + >1M TL Ciro') ve bu kritere uyanlar listeye otomatik eklenir
  - `her_kampanya_oncesi_manuel_rapor_cekilip_statik_liste_olusturulur`: Dinamik liste yoktur; her kampanya için ERP'den Excel raporu çekilir, temizlenir ve statik liste yüklenir
  - `segment_bazli_hedefleme_yapilamamaktadir`: Segment filtreleme yapılamaz; veritabanı ayrıştırılamadığı için hedefleme yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Dinamik Liste Filtreleme ve Gerçek Zamanlı Kitle Güncelleme kurgusunu belirler.

---

### 5. Kampanya Listeleri

#### [MKT-009] Kampanya hedef listeleri (İletişim kişileri, Aday havuzları, Fuar katılımcı listeleri) nasıl oluşturulmakta ve mükerrer kayıtlar (De-duplication) nasıl temizlenmektedir?
- **Süreç:** Kampanya Listeleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Liste birleştirme, veri tekilleştirme (De-duplication) ve liste hijyeni.
- **Seçenekler:**
  - `sistem_eposta_telefon_ve_vkn_bazinda_mukerrerleri_otomatik_birlestirir`: Evet; farklı kaynaklardan gelen listeler tekilleştirilir, mükerrer e-posta ve telefonlar elenir
  - `listeler_excelde_manuel_birlestirilir_mukerrerler_gozle_temizlenir`: Sistemik temizlik yoktur; pazarlama sorumlusu Excel'de 'Yinelenenleri Kaldır' yaparak listeyi hazırlar
  - `mukerrer_kontrolu_yapilmaz_ayni_kisiye_birden_fazla_mesaj_gidebilir`: Mükerrer kontrolü yapılmaz; aynı müşteriye aynı anda birden fazla temsilciden veya kanaldan mesaj gidebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Otomatik De-duplication (Tekilleştirme) Motoru gereksinimini belirler.

#### [MKT-010] İletişim izni bulunmayan, abonelikten çıkan (Unsubscribe) veya kara listede (Suppression List) yer alan kişi/firmalar kampanya listelerinden otomatik ayıklanmakta mıdır?
- **Süreç:** Kampanya Listeleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Açıklama:** Kara liste yönetimi (Suppression List), abonelik iptali ve izinli gönderim garantisi.
- **Seçenekler:**
  - `sistem_izin_ve_ret_listesini_kontrol_ederek_otomatik_engeller`: Evet; sistem izin durumunu ve ret listesini kontrol eder, izni olmayanlar gönderim listesinden otomatik düşürülür
  - `ret_talepleri_ayri_bir_excelde_tutulur_manuel_cikarilmaya_calisilir`: Otomatik engelleme yoktur; ayrılmak isteyenler bir Excel listesinde tutulur ve gönderimden önce elle silinir
  - `kara_liste_veya_izin_kontrolu_yapilmamaktadir`: İzin veya ret kontrolü yapılmaz; eldeki tüm e-posta ve telefonlara doğrudan gönderim yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Otomatik Suppression List ve İzinli Gönderim Korumasını belirler.

---

### 6. Lead Generation

#### [MKT-011] Şirketinizde yeni müşteri adayı (Lead) yaratma süreçleri hangi yöntemlerle (Gelen inbound talepler, Dış kaynaklı outbound aramalar, İçerik pazarlaması, Etkinlikler, Dijital reklamlar) yürütülmektedir?
- **Süreç:** Lead Generation
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Lead yaratma kanalları karması (Inbound / Outbound / Event / Digital).
- **Seçenekler:**
  - `cok_kanalli_inbound_ve_outbound_dijital_ve_fiziksel_birlikte_kullanilir`: Evet; web sitesi, dijital reklamlar, fuarlar, sektörel etkinlikler ve içerik indirmeleriyle çok kanallı lead toplanır
  - `agirlikli_olarak_fuarlar_ve_mevcut_musteri_referanslari_ile_lead_gelir`: Dijital kanallar zayıftır; ana lead kaynağımız yılda birkaç kez katıldığımız ihtisas fuarları ve referanslardır
  - `satis_temsilcilerinin_soguk_arama_ve_ziyaretleri_ile_aday_bulunur`: Pazarlama lead üretmez; satış personeli kendi çabasıyla sahada veya rehberden soğuk arama yaparak aday bulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Çok Kanallı Lead Toplama (Omni-Channel Lead Capture) mimarisini belirler.

#### [MKT-012] Web sitesi formlarından (İletişim, Teklif İste, Katalog İndir, Demo Talebi) gelen potansiyel müşteri talepleri anlık olarak merkezi sisteme (CRM/Marketing) otomatik düşmekte midir?
- **Süreç:** Lead Generation
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Web formu entegrasyonu, anlık lead yakalama ve form-to-CRM akışı.
- **Seçenekler:**
  - `web_formlarindan_gelen_tum_talepler_crm_lead_havuzuna_anlik_akar`: Evet; form doldurulduğu saniye CRM'de yeni lead kartı açılır, bildirim üretilir ve temsilciye yönlenir
  - `formlar_genel_bir_info_eposta_adresine_duser_manuel_aktarilir`: Sisteme akmaz; form bilgisi info@ veya pazarlama e-postasına mail olarak gelir, personel bunu elle sisteme girer
  - `web_sitesinde_form_veya_online_talep_toplama_bulunmamaktadir`: Web sitesinde form entegrasyonu yoktur; müşteriler sadece sitedeki telefon numarasını arar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Webhook / Web-to-Lead Entegrasyonu altyapısını belirler.

---

### 7. Lead Kaynakları

#### [MKT-013] Sisteme giriş yapan her yeni müşteri adayının (Lead) geliş kaynağı (Web Formu, Google Arama/Reklam, LinkedIn/Sosyal Medya, Fuar/Etkinlik, Bayi/Referans, Doğrudan Telefon) zorunlu olarak kaydedilmekte midir?
- **Süreç:** Lead Kaynakları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Lead kaynağı (Lead Source) takibi, zorunlu kaynak standardı ve kaynak analitiği.
- **Seçenekler:**
  - `lead_kaynagi_tum_kanallarda_standart_ve_zorunlu_olarak_kaydedilir`: Evet; her adayın sisteme nereden girdiği (Google Ads, Fuar, Web Form, Referans vb.) zorunlu seçilir
  - `lead_kaynagi_alani_vardir_ancak_istege_baglidir_genelde_bos_birakilir`: Sistemde alan vardır fakat zorunlu değildir; kullanıcılar genelde seçmeden geçer, veriler eksiktir
  - `lead_kaynagi_takip_edilmemektedir`: Adayın nereden geldiği tutulmaz; satışın hangi kanaldan beslendiği bilinmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Zorunlu Lead Kaynağı Alanı ve Kaynak Takip Disiplinini belirler.

#### [MKT-014] Dijital kanallardan gelen taleplerde kampanya izleme kodları (UTM Parametreleri — Source, Medium, Campaign, Term, Content) lead kaydına otomatik işlenmekte midir?
- **Süreç:** Lead Kaynakları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** UTM parametresi takibi, dijital reklam izlenebilirliği ve kampanya eşleştirme.
- **Seçenekler:**
  - `tum_utm_parametreleri_lead_kartiyla_otomatik_eslestirilip_saklanir`: Evet; adayın tıkladığı reklam kampanyası (utm_source, utm_campaign vb.) CRM lead kartına otomatik yazılır
  - `sadece_genel_siteye_geldigi_bilinir_kampanya_bazli_utm_tutulmaz`: Yalnızca 'Web' olarak kaydedilir; hangi Google veya LinkedIn reklamından geldiği bilinmez
  - `utm_veya_dijital_kampanya_izleme_kullanilmamaktadir`: UTM takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** UTM İzleme ve Dijital Kampanya Attribution Entegrasyonunu belirler.

---

### 8. Dijital Kanallar

#### [MKT-015] Şirketiniz dijital pazarlama ve reklam kanallarını (Google Ads Arama/Görüntülü, LinkedIn B2B Reklamları, Meta/Instagram, YouTube, Sektörel Portallar) aktif olarak kullanmakta mıdır?
- **Süreç:** Dijital Kanallar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Dijital reklam varlığı, kanal çeşitliliği ve dijital pazarlama bütçesi kullanımı.
- **Seçenekler:**
  - `coklu_dijital_reklam_ve_sosyal_medya_kanallari_aktif_olarak_kullanilir`: Evet; Google Ads, LinkedIn B2B reklamları ve sektörel dijital platformlar bütçe ayrılarak aktif kullanılır
  - `yalnizca_temel_google_arama_reklamlari_veya_sosyal_medya_paylasimi_yapilir`: Kapsamlı reklam yapılmaz; sadece temel Google aramada görünürlük veya organik sosyal medya paylaşımları vardır
  - `dijital_reklam_ve_pazarlama_kanallari_kullanilmamaktadir`: Şirketimizde dijital reklam veya online pazarlama kanalları kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Dijital Reklam Kanalları Kapsamı ve Dijital Harcama Entegrasyonunu belirler.

#### [MKT-016] Dijital reklam platformlarından elde edilen form/lead verileri API entegrasyonu (Webhook / CRM Connector) ile otomatik olarak CRM lead havuzuna aktarılmakta mıdır?
- **Süreç:** Dijital Kanallar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MKT-015 != "dijital_reklam_ve_pazarlama_kanallari_kullanilmamaktadir"`
- **Açıklama:** Reklam formları entegrasyonu (LinkedIn Lead Gen Forms, Facebook Lead Ads, Google Lead Extensions).
- **Seçenekler:**
  - `reklam_formu_dolduran_adaylar_crm_sistemine_aninda_otomatik_duser`: Evet; LinkedIn/Google formunu dolduran kişinin bilgileri API ile saniyeler içinde CRM'e aktarılır
  - `haftalik_veya_aylik_olarak_reklam_panellerinden_excel_indirilip_yuklenir`: Entegrasyon yoktur; reklam panelinden (LinkedIn Ads/Meta) Excel listesi çekilir ve elle aktarılır
  - `reklam_formu_leadleri_sisteme_aktarilmamaktadir`: Reklam formlarından gelen veriler sisteme girilmez; ajans veya reklam yöneticisinde kalır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Lead Ads API Entegratörleri (LinkedIn/Google Lead Gen Sync) gereksinimini belirler.

---

### 9. E-posta Pazarlama

#### [MKT-017] Müşteri ve adaylara yönelik toplu e-posta gönderimleri (E-bülten, Ürün duyurusu, Özel kampanya, Fuar daveti) hangi altyapı üzerinden yapılmaktadır?
- **Süreç:** E-posta Pazarlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** E-posta pazarlama platformu, kurumsal mailing araçları ve sistem entegrasyonu.
- **Seçenekler:**
  - `crm_ile_entegre_profesyonel_eposta_pazarlama_platformu_kullanilir`: Evet; CRM ile entegre çalışan profesyonel bir e-posta platformu (Mailing Engine) üzerinden gönderilir
  - `crmden_bagimsiz_harici_bir_mailing_yazilimi_uzerinden_yapilir`: Bağımsız harici bir mailing platformu kullanılır; listeler Excel ile yüklenir, CRM ile bağı yoktur
  - `outlook_veya_standart_mail_istemcisinden_toplu_bcc_ile_gonderilir`: Özel bir platform yoktur; personelin Outlook hesabından yüzlerce kişi BCC'ye eklenerek mail atılır *(Not Alınabilir)*
  - `toplu_eposta_pazarlamasi_yapilmamaktadir`: Şirketimizde toplu e-posta veya e-bülten çalışması yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** E-posta Pazarlama Altyapısı (Marketing Automation / ESP Entegrasyonu) seçimini belirler.

#### [MKT-018] Gönderilen e-postaların teslim, açılma (Open Rate), tıklanma (Click-Through Rate), geri dönme (Bounce) ve üyelikten ayrılma oranları CRM/Pazarlama sisteminde izlenebilmekte midir?
- **Süreç:** E-posta Pazarlama
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MKT-017 != "toplu_eposta_pazarlamasi_yapilmamaktadir"`
- **Açıklama:** E-posta kampanya metrikleri, kişi bazında etkileşim kaydı ve geri dönüş analizi.
- **Seçenekler:**
  - `kampanya_ve_kisi_bazinda_acilma_tiklanma_ve_etkilesim_crmde_kaydedilir`: Evet; kimin maili açtığı, hangi linke tıkladığı CRM müşteri kartı zaman çizelgesine anlık yazılır
  - `yalnizca_harici_mailing_panelinde_genel_toplu_yuzdeler_gorulur`: Yalnızca genel açılma yüzdesi (%25) panelde görülür; hangi müşterinin ne yaptığı CRM'de görünmez
  - `eposta_performans_metrikleri_takip_edilmemektedir`: E-postaların gidip gitmediği, açılıp açılmadığı takip edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** E-posta Etkileşim İzleme (Email Engagement Telemetry) ve Skorlama Entegrasyonunu belirler.

---

### 10. SMS / Mesajlaşma

#### [MKT-019] Pazarlama ve bilgilendirme amacıyla toplu SMS veya anlık mesajlaşma kanalları (WhatsApp Business, SMS Gateway) kullanılmakta mıdır?
- **Süreç:** SMS / Mesajlaşma
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `medium`
- **Açıklama:** SMS ve anlık mesajlaşma kanalları, toplu bildirim ve mobil pazarlama.
- **Seçenekler:**
  - `crm_ile_entegre_sms_ve_whatsapp_is_hesabi_aktif_kullanilir`: Evet; CRM içinden veya entegre gateway ile hedef listelere SMS veya kurumsal WhatsApp mesajı atılır
  - `harici_sms_baslik_paneli_uzerinden_manuel_liste_yuklenerek_atilir`: Bağımsız SMS operatör panelinden Excel listesi yüklenerek gönderim yapılır
  - `sms_veya_mesajlasma_kampanyasi_yapilmamaktadir`: Şirketimizde toplu SMS veya pazarlama amaçlı mesajlaşma kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** SMS / WhatsApp Kurumsal Mesajlaşma Entegrasyonu modelini belirler.

#### [MKT-020] SMS ve mesajlaşma gönderimlerinde İYS (İleti Yönetim Sistemi) izin kontrolü, ret hakkı (Opt-out) kodu ve gönderim raporları sistemsel olarak işletilmekte midir?
- **Süreç:** SMS / Mesajlaşma
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MKT-019 != "sms_veya_mesajlasma_kampanyasi_yapilmamaktadir"`
- **Açıklama:** İYS izin doğrulaması, ret mekanizması ve yasal bildirim uyumu.
- **Seçenekler:**
  - `iys_entegrasyonu_ve_ret_kodu_sistemden_otomatik_denetlenir`: Evet; İYS üzerinden izinli numaralar filtrelenir ve mesaj sonuna standart ret kodu otomatik eklenir
  - `iys_kontrolu_sms_operatoru_tarafindan_harici_yapilir`: Şirket sisteminde kontrol yoktur; gönderim yapılan SMS operatörünün kendi kontrolüne bırakılmıştır
  - `iys_veya_ret_hakki_kontrolu_yapilmamaktadir`: İYS veya ret kontrolü yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** İYS Entegrasyonu ve Otomatik Ret Kodu Yönetimini belirler.

---

### 11. Etkinlik / Fuar / Webinar

#### [MKT-021] Şirketinizin katıldığı veya düzenlediği fiziksel/çevrimiçi etkinlikler (Yurt içi/Yurt dışı İhtisas Fuarları, Müşteri Seminerleri, Webinarlar, Lansmanlar) nasıl organize edilmektedir?
- **Süreç:** Etkinlik / Fuar / Webinar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Etkinlik yönetimi, fuar katılım süreçleri ve etkinlik organizasyonu.
- **Seçenekler:**
  - `yillik_etkinlik_takvimi_kapsaminda_butce_ve_hedef_lead_planiyla_yonetilir`: Evet; her fuar ve webinar için bütçe, stand alanı, hedef ziyaretçi/lead sayısı önceden belirlenir
  - `donemsel_olarak_onemli_sektorel_fuarlara_katilinir_ancak_net_hedef_yoktur`: Fuarlara düzenli katılım sağlanır ancak öncesinde sayısal lead hedefi veya kurgu yapılmaz
  - `fiziksel_veya_cevrimici_etkinlik_fuar_yapilmamaktadir`: Şirketimiz fuar, seminer veya webinar gibi etkinliklere katılmamakta ve düzenlememektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Etkinlik Yönetim Modülü ve Fuar Takip Süreçlerini belirler.

#### [MKT-022] Fuar veya etkinlik standında toplanan kartvizit, yaka kartı tarama (Badge Scan) ve ziyaretçi formları etkinlik bitiminde sisteme nasıl aktarılmakta ve takip süreci (Follow-up) nasıl başlatılmaktadır?
- **Süreç:** Etkinlik / Fuar / Webinar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MKT-021 != "fiziksel_veya_cevrimici_etkinlik_fuar_yapilmamaktadir"`
- **Açıklama:** Fuar leadlerinin toplanması, dijitalleştirilmesi ve hızlı satış takibi.
- **Seçenekler:**
  - `mobil_kartvizit_tarayici_veya_formla_aninda_crm_fuar_kampanyasina_eklenir`: Evet; standda mobilden taranan kartvizitler CRM fuar kampanyasına akar ve satışçıya anında arama görevi açılır
  - `fuar_sonrasi_kartvizitler_toplanip_excel_yapilir_haftalar_sonra_dagitilir`: Standda toplanan kartvizitler ofise gelince bir asistan tarafından Excel'e yazılır, süreç yavaş ilerler
  - `kartvizitler_temsilcilerin_cebinde_kalir_merkezi_sisteme_girilmez`: Merkezi sisteme girilmez; her satışçı kendi görüştüğü kişilerin kartını alır, takip kendi inisiyatifindedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Fuar Standı Mobil Kartvizit / Form Tarama ve Anlık Görev Üretimini belirler.

---

### 12. Kampanya İçerik ve Materyal Yönetimi

#### [MKT-023] Pazarlama materyalleri (E-kataloglar, Broşürler, Ürün sunumları, Tanıtım videoları, Vaka analizleri / Case Study, Sosyal medya görselleri) nerede depolanmakta ve satış ekibiyle nasıl paylaşılmaktadır?
- **Süreç:** Kampanya İçerik ve Materyal Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `medium`
- **Açıklama:** Dijital varlık yönetimi (DAM), satış destek dokümanları ve kurumsal kütüphane.
- **Seçenekler:**
  - `crm_veya_bulut_kutuphanesinde_guncel_ve_kategorize_olarak_saklanir`: Evet; tüm ekiplerin eriştiği merkezi dijital kütüphanede en güncel onaylı dokümanlar kategorize tutulur
  - `ortak_klasor_veya_google_drive_klasorunde_tutulur`: Ağdaki paylaşımlı klasörde veya Drive'da tutulur; bazen eski ve yeni broşürler birbirine karışır
  - `merkezi_bir_arsiv_yoktur_materyaller_eposta_ile_istendikce_gonderilir`: Merkezi arşiv yoktur; satışçılar broşür veya sunum istedikçe pazarlama sorumlusu mail ile iletir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Satış Destek Kütüphanesi (Sales Enablement Content Hub) mimarisini belirler.

#### [MKT-024] Pazarlama içeriklerinin kurumsal marka standartlarına uygunluğu, güncel logo/şablon kullanımı ve onaylı materyal versiyonları sistemde nasıl denetlenmektedir?
- **Süreç:** Kampanya İçerik ve Materyal Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Marka standartları denetimi, güncel logo kullanımı ve versiyon kontrolü.
- **Seçenekler:**
  - `onayli_kurumsal_kimlik_kilavuzu_ve_versiyon_kontrollu_sablonlar_vardir`: Evet; marka kılavuzuna uygun güncel şablonlar kilitlidir, yetkisiz eski logo/içerik kullanımı engellenir
  - `kontrol_yoktur_satiscilar_kendi_sunum_ve_gorsellerini_kendileri_tasarlar`: Denetim yoktur; her temsilci internetten veya eski dosyalardan bulduğu görsellerle kendi sunumunu yapar
  - `marka_ve_icerik_standardi_takip_edilmemektedir`: Marka ve içerik standartları takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kurumsal Marka Uyumu ve Şablon Kilit Denetimini belirler.

---

### 13. Kampanya Onay Süreci

#### [MKT-025] Yeni bir pazarlama kampanyası, promosyon iletişimi veya büyük bütçeli reklam yayını başlatılmadan önce hangi Onay Süreçleri (Pazarlama Müdürü, Satış Direktörü, Hukuk/KVKK, Genel Müdür) işletilmektedir?
- **Süreç:** Kampanya Onay Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kampanya onay hiyerarşisi, bütçe onay sınırları ve çoklu onay mekanizması.
- **Seçenekler:**
  - `butce_ve_icerik_kriterine_gore_cok_kademeli_onay_is_akisi_vardir`: Evet; bütçe büyüklüğüne ve iletişim tipine göre Pazarlama Müdürü -> Satış Direktörü -> GM onayı gerekir
  - `yalnizca_pazarlama_muduru_veya_yonetim_sozlu_onay_verir`: Sistemik onay yoktur; Pazarlama Müdürü veya Genel Müdür sözlü ya da e-posta ile 'Başlatın' der
  - `onay_sureci_yoktur_pazarlama_sorumlusu_kampanyayi_serbestce_yayinlar`: Resmi bir onay süreci yoktur; pazarlama personeli kampanyayı doğrudan yayına alır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kampanya Onay İş Akışı (Campaign Approval Workflow) tasarımını belirler.

#### [MKT-026] Kampanya onay süreçleri ve içerik onay kayıtları sistem üzerinden iş akışı (Workflow) ile mi yoksa e-posta/sözlü olarak mı yürütülmektedir?
- **Süreç:** Kampanya Onay Süreci
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Kampanya onay iş akışı, denetim izi (Audit Trail) ve onay geçmişi.
- **Seçenekler:**
  - `sistem_uzerinden_zaman_damgali_onay_is_akisi_ile_yurutulur`: Evet; kampanya sistem üzerinden onaya gönderilir, kimin ne zaman onayladığı tarihçede saklanır
  - `eposta_yazismalari_veya_mesajlasma_uzerinden_yurutulur`: Sistemik iş akışı yoktur; e-posta zinciri veya WhatsApp üzerinden onaylaşılır
  - `onay_kayitlari_saklanmamaktadir`: Onay kayıtları saklanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kampanya Karar Tarihçesi ve Denetim İzi (Audit Trail) altyapısını belirler.

---

### 14. Kampanya Bütçesi

#### [MKT-027] Pazarlama kampanyaları için kampanya bazında ve kanal bazında (Dijital reklam, Fuar alanı, Baskı/Materyal, Ajans bedeli) Bütçe Planlaması yapılmakta mıdır?
- **Süreç:** Kampanya Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kampanya bütçe tahsisi, kanal bazlı bütçe kırılımı ve finansal planlama.
- **Seçenekler:**
  - `her_kampanya_icin_kalem_bazinda_onayli_butce_tanimlanir`: Evet; her kampanya için dijital reklam, ajans, stand, materyal vb. kalem bazında bütçe açılır
  - `sadece_yillik_genel_pazarlama_butcesi_vardir_kampanya_bazli_ayrilmaz`: Şirketin yıllık toplam pazarlama bütçesi vardır; kampanyalar bu havuzdan rastgele harcama yapar
  - `kampanya_butcesi_tutulmaz_harcamalar_genel_gider_yazilir`: Pazarlama bütçesi planlanmaz; faturalar geldikçe muhasebeye genel şirket gideri olarak işlenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kampanya Finansal Bütçe Modeli ve Kalem Kırılımlarını belirler.

#### [MKT-028] Gerçekleşen ajans faturaları, reklam harcamaları ve etkinlik giderleri sistemde doğrudan ilgili kampanyaya bağlanarak bütçe aşım kontrolü yapılabilmekte midir?
- **Süreç:** Kampanya Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MKT-027 != "kampanya_butcesi_tutulmaz_harcamalar_genel_gider_yazilir"`
- **Açıklama:** Fiili pazarlama harcaması, kampanya maliyet eşleştirmesi ve bütçe sapma kontrolü.
- **Seçenekler:**
  - `harcamalar_kampanya_koduyla_eslestirilir_ve_butce_asimi_anlik_gorulur`: Evet; gelen faturalar kampanya koduyla işlenir, planlanan vs gerçekleşen bütçe anlık karşılaştırılır
  - `harcamalar_pazarlamanin_kendi_excel_tablosunda_manuel_tutulur`: Sistemik eşleştirme yoktur; pazarlama sorumlusu faturaları kendi Excel tablosuna elle işler
  - `kampanya_harcama_ve_butce_asimi_takip_edilememektedir`: Kampanya harcamaları ve bütçe aşımı takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kampanya Fiili Maliyet Muhasebesi ve Bütçe Aşım Blokajını belirler.

---

### 15. Lead Nitelendirme / Scoring Kullanımı

#### [MKT-029] Toplanan adayların (Lead) satışa hazır olup olmadığını belirlemek için Lead Nitelendirme (MQL - Marketing Qualified Lead / SQL - Sales Qualified Lead ayrımı) ve Lead Puanlama (Lead Scoring) kriterleri uygulanmakta mıdır?
- **Süreç:** Lead Nitelendirme / Scoring Kullanımı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** MQL / SQL ayrımı, aday olgunluk değerlendirmesi ve puanlama modeli.
- **Seçenekler:**
  - `kural_ve_davranis_bazli_lead_scoring_kullanilarak_mql_sql_ayrimi_yapilir`: Evet; adayın firma büyüklüğü, unvanı, web etkileşimi puanlanır; puanı eşiği geçenler satışa iletilir
  - `pazarlama_ekibi_adayi_telefonla_arar_uygunsa_satisa_yonlendirir`: Otomatik skorlama yoktur; pazarlama personeli adayı arayıp ihtiyacını sorar, uygunsa satışa devreder
  - `lead_nitelendirme_yapilmaz_gelen_her_talep_dogrudan_satisa_yonlendirilir`: Nitelendirme yapılmaz; gelen tüm form ve iletişimler filtrelenmeden doğrudan satış ekibine aktarılır
  - `lead_nitelendirme_ve_scoring_kullanilmamaktadir`: Şirketimizde lead nitelendirme ve scoring süreci bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Lead Scoring Motoru ve MQL/SQL Geçiş Kriterlerini belirler.

#### [MKT-030] Lead puanlaması hangi parametrelere (Demografik/Firma büyüklüğü, Bütçe yetkisi, Web sitesi ziyaret sıklığı, E-posta tıklaması, Form doldurma sayısı) göre ve nasıl hesaplanmaktadır?
- **Süreç:** Lead Nitelendirme / Scoring Kullanımı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MKT-029 != "lead_nitelendirme_ve_scoring_kullanilmamaktadir"`
- **Açıklama:** Skorlama bileşenleri (Demografik, Firma Ölçeği, BANT, Dijital Davranış).
- **Seçenekler:**
  - `hem_firma_profili_hem_dijital_davranis_puanlari_birlikte_hesaplanir`: Evet; B2B firma ölçeği (+30 puan) ve e-posta/web etkileşimleri (+10 puan) toplanarak dinamik skor üretilir
  - `yalnizca_adayi_giren_kisinin_tahmini_sicak_ilik_soguk_secimiyle_belirlenir`: Otomasyon yoktur; temsilci adayı sisteme girerken 'Sıcak', 'Ilık' veya 'Soğuk' etiketini elle seçer
  - `puanlama_kriterleri_standartlastirilmamistir`: Puanlama kriterleri standartlaştırılmamıştır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Davranışsal ve Profil Bazlı Puanlama Algoritmalarını belirler.

---

### 16. Lead Dağıtımı ve CRM Handoff

#### [MKT-031] Nitelendirilen müşteri adayları (Lead) satış ekiplerine veya temsilcilere hangi kurallarla (Bölge/İl bazlı, Ürün uzmanlığı, Müşteri sektörü/büyüklüğü, Sırayla Round-Robin) atanmaktadır?
- **Süreç:** Lead Dağıtımı ve CRM Handoff
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Lead yönlendirme ve atama kuralları (Lead Routing Matrix), satışa devir yöntemi.
- **Seçenekler:**
  - `bolge_urun_ve_sektor_kurallarina_gore_sistemden_otomatik_atanir`: Evet; adayın bulunduğu il, ilgilendiği ürün ve sektör kuralına göre sorumlu satış temsilcisine anında atanır
  - `satis_muduru_veya_koordinator_gelen_adaylari_inceleyip_manuel_dagitir`: Otomatik dağıtım yoktur; Satış Müdürü lead havuzuna bakar ve personellere elle paylaştırır
  - `ortak_eposta_veya_havuza_duser_bosa_cikan_temsilci_kendisi_alir`: Ortak havuza düşer; ilk gören veya o an müsait olan satışçı adayı sahiplenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Otomatik Lead Dağıtım ve Yönlendirme Motoru (Lead Routing Rules) tasarımını belirler.

#### [MKT-032] Satış temsilcisine aktarılan lead'in ilk aranma süresi (Lead Response Time SLA — Örn. '2 saat içinde aranmalı') ve satışçının lead'i kabul/red etme durumu izlenmekte midir?
- **Süreç:** Lead Dağıtımı ve CRM Handoff
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Adaya ilk temas SLA'sı, satış kabul/red döngüsü ve eskalasyon kuralları.
- **Seçenekler:**
  - `ilk_temas_sla_suresi_ve_satisa_kabul_durumu_sistemden_canli_izlenir`: Evet; temsilcinin adayı ne kadar sürede aradığı ölçülür, 24 saat aranmayan lead başka temsilciye aktarılır
  - `temsilciye_devredildikten_sonra_ne_zaman_arandigi_takip_edilmez`: Temsilciye iletilir ancak ne zaman aradığı veya arayıp aramadığı sistem üzerinden denetlenmez
  - `lead_yanit_suresi_ve_takip_mekanizmasi_bulunmamaktadir`: Lead yanıt süresi ve takip mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Lead Yanıt Süresi (Speed-to-Lead SLA) ve Eskalasyon Akışlarını belirler.

---

### 17. Kampanya Dönüşüm Takibi

#### [MKT-033] Pazarlama kampanyasından gelen bir lead'in Satış Fırsatına (Opportunity), Teklife veya Satış Siparişine (Closed-Won Deal) dönüşümü uçtan uca izlenebilmekte midir?
- **Süreç:** Kampanya Dönüşüm Takibi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Uçtan uca dönüşüm hunisi (Full-Funnel Tracking: Lead -> Opportunity -> Quote -> Order).
- **Seçenekler:**
  - `lead_den_siparis_ve_faturaya_kadar_tam_entegre_donusum_izlenebilir`: Evet; adayın hangi kampanyadan geldiği, ne zaman fırsata, teklife ve siparişe dönüştüğü eksiksiz izlenir
  - `yalnizca_lead_adedi_bilinir_satisa_donusup_donusmedigi_kopuktur`: Kaç lead geldiği bilinir fakat satış ERP'de ayrı yürütüldüğü için hangi adayın sipariş verdiği görülemez
  - `kampanya_donusum_takibi_yapilamamaktadir`: Kampanyaların satışa dönüşümü takip edilemez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Uçtan Uca Pazarlama-Satış Dönüşüm Hunisi Entegrasyonunu belirler.

#### [MKT-034] Satış ekibinin sonuçlandıramadığı veya kaybettiği lead'lerin (Lost Lead) nedenleri (Bütçe yetersizliği, Yanlış kontak, Zamanlama uyuşmazlığı) pazarlama ekibine geri bildirilmekte midir?
- **Süreç:** Kampanya Dönüşüm Takibi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kayıp aday nedenleri (Lead Disqualification Reasons) ve pazarlama geri bildirim döngüsü.
- **Seçenekler:**
  - `standart_red_sebepleri_sisteme_girilir_ve_pazarlama_hedeflemesini_iyilestirir`: Evet; satışçı adayı kapattığında nedenini seçer; pazarlama bu veriye bakarak hedef kitlesini ve reklamını düzeltir
  - `satis_ekibi_adayi_sistemden_silmekte_veya_nedensiz_kapatmaktadir`: Gerekçe girilmez; satışçı olumsuz gördüğü adayı siler veya aramadığı halde sistemde açık bırakır
  - `kayip_lead_nedenleri_takip_edilmemektedir`: Kayıp aday nedenleri takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kapalı Döngü Geri Bildirim (Closed-Loop Feedback) ve Hedefleme İyileştirmesini belirler.

---

### 18. Attribution / Kaynak Analizi

#### [MKT-035] Bir müşterinin satışla sonuçlanan yolculuğunda birden fazla kampanya ve temas noktası (Örn. Önce web reklamı, sonra webinar, ardından fuar ziyareti) olduğunda Satış Gelir Paylaşımı (Attribution Modeli — First-touch, Last-touch, Multi-touch) nasıl analiz edilmektedir?
- **Süreç:** Attribution / Kaynak Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Pazarlama attribution modelleri, çoklu temas noktası analitiği ve gelir paylaştırma.
- **Seçenekler:**
  - `tum_temas_noktalari_kaydedilir_ve_coklu_temas_attribution_analizi_yapilir`: Evet; müşterinin ilk teması, katıldığı etkinlikler ve son teklif öncesi teması kaydedilip ağırlıklı analiz edilir
  - `sadece_adayi_getiren_ilk_kaynak_veya_son_temas_noktasi_esas_alinir`: Yalnızca adayın ilk geldiği kanal (First-Touch) veya sipariş öncesi son dokunulan kanal esas alınır
  - `attribution_veya_temas_noktasi_analizi_yapilmamaktadir`: Attribution analizi yapılmaz; satışın hangi pazarlama çalışmasından doğduğu bilinemez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Pazarlama Attribution ve Çoklu Temas Noktası Gelir Paylaşımı mimarisini belirler.

#### [MKT-036] Şirket genelinde hangi pazarlama kanalının (Google, LinkedIn, Fuarlar, Doğrudan Referanslar) en kaliteli müşteri adaylarını ve en yüksek kârlı satışları getirdiği raporlanabilmekte midir?
- **Süreç:** Attribution / Kaynak Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kanal verimlilik karşılaştırması ve en kârlı müşteri kaynaklarının tespiti.
- **Seçenekler:**
  - `kanal_bazli_lead_kalitesi_firsat_tutari_ve_kazanilan_ciro_raporlanir`: Evet; kanalların ürettiği ciro ve kârlılık karşılaştırılır, bütçe en verimli kanallara kaydırılır
  - `yalnizca_hangi_kanaldan_kac_adet_lead_geldigi_sayi_olarak_bilinir`: Yalnızca gelen lead sayısı bilinir; o kanalın şirkete ne kadar kâr getirdiği ölçülemez
  - `kanal_verimliligi_ve_kalite_karsilastirmasi_yapilamamaktadir`: Kanal verimliliği ve kalite karşılaştırması yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Pazarlama Kanal Verimlilik ve Yatırım Tahsis Analitiğini belirler.

---

### 19. Pazarlama KPI ve ROI

#### [MKT-037] Kampanya Yatırım Getirisi (Marketing ROI / ROAS — Harcanan pazarlama bütçesi vs Kampanyadan kazanılan net ciro/kâr) hesaplanmakta mıdır?
- **Süreç:** Pazarlama KPI ve ROI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kampanya kârlılığı, pazarlama yatırım getirisi (ROI/ROAS) hesaplama yöntemi.
- **Seçenekler:**
  - `kampanya_harcamasi_ile_kazanilan_ciro_karsilastirilarak_roi_otomatik_hesaplanir`: Evet; her kampanyanın maliyeti ile getirdiği ciro sistemde eşleştirilerek net ROI oranı (%) üretilir
  - `yil_sonlarinda_excelde_tahmini_ve_manuel_olarak_hesaplanmaya_calisilir`: Sistemik hesaplanmaz; yıl sonunda toplam pazarlama harcaması ile genel ciro Excel'de kabaca oranlanır
  - `pazarlama_kampanya_roi_hesabi_yapilmamaktadir`: Pazarlama harcamalarının geri dönüşü (ROI) hesaplanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kampanya Finansal Kârlılık ve Marketing ROI/ROAS Motorunu belirler.

#### [MKT-038] Aday Başına Maliyet (Cost Per Lead - CPL) ve Müşteri Edinme Maliyeti (Customer Acquisition Cost - CAC) kanal ve kampanya bazında ölçülmekte midir?
- **Süreç:** Pazarlama KPI ve ROI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Birim müşteri edinme maliyeti (CAC) ve aday maliyeti (CPL) metrikleri.
- **Seçenekler:**
  - `cpl_ve_cac_metrikleri_kanal_ve_kampanya_bazinda_duzenli_olculur`: Evet; 1 adet lead kazanmanın maliyeti (CPL) ve 1 yeni müşteri kazanmanın maliyeti (CAC) takip edilir
  - `yalnizca_dijital_reklamlarda_tiklama_maliyeti_cpc_gorulur`: Sadece Google/LinkedIn panelindeki tıklama maliyetine bakılır; gerçek müşteri edinme maliyeti bilinmez
  - `cpl_veya_cac_metrikleri_hesaplanmamaktadir`: Aday veya müşteri edinme maliyeti ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Birim Müşteri Kazanım Maliyeti (CAC) ve CPL Raporlama Altyapısını belirler.

#### [MKT-039] Pazarlama liderleri ve üst yönetim için canlı Pazarlama Performans Gösterge Panelleri (Pazarlama Dashboard & KPI Raporları) kullanılmakta mıdır?
- **Süreç:** Pazarlama KPI ve ROI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Yönetim dashboardları, pazarlama KPI kokpiti ve canlı performans sunumu.
- **Seçenekler:**
  - `canli_pazarlama_ve_lead_kokpiti_yonetim_tarafindan_anlik_izlenir`: Evet; lead akışı, dönüşüm oranları, harcanan bütçe ve kampanya durumunu gösteren canlı kokpit kullanılır
  - `aylik_hazirlanan_statik_powerpoint_veya_excel_raporlari_sunulur`: Canlı panel yoktur; ay sonlarında hazırlanan PowerPoint sunumu veya Excel tablosu üzerinden raporlanır
  - `pazarlama_performans_raporlamasi_yapilmamaktadir`: Düzenli bir pazarlama performans raporlaması yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Pazarlama Yönetim Kokpiti ve Canlı KPI Paneli tasarımını belirler.

#### [MKT-040] Satışa aktarılan lead'lerin Fırsata Dönüşüm Oranı (Lead-to-Opportunity Conversion Rate %) düzenli olarak takip edilmekte midir?
- **Süreç:** Pazarlama KPI ve ROI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Adaydan fırsata dönüşüm oranı (Lead-to-Opp % Conversion Rate) takibi.
- **Seçenekler:**
  - `lead_firsat_donusum_orani_temsilci_ve_kampanya_bazinda_raporlanir`: Evet; gelen her 100 lead'in kaç tanesinin nitelikli satış fırsatına dönüştüğü düzenli raporlanır
  - `donem_sonlarinda_manuel_olarak_tahmin_edilir`: Sistemik oran yoktur; yıl sonunda kaç lead geldi kaç fırsat açıldı tahmini kıyaslanır
  - `firsata_donusum_orani_olculmemektedir`: Lead dönüşüm oranı ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Huni Dönüşüm Analitiği ve Satış-Pazarlama Verimlilik Oranlarını belirler.

#### [MKT-041] Pazarlama verilerinin doğruluğu, iletişim veri tabanının güncelliği ve kampanya raporlarının güvenilirliği ne sıklıkla denetlenmektedir?
- **Süreç:** Pazarlama KPI ve ROI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Veri hijyeni denetimi, pazarlama veri kalitesi ve rapor güvenilirliği.
- **Seçenekler:**
  - `veri_tabani_ve_kampanya_raporlari_duzenli_periyotlarla_denetlenir_ve_temizlenir`: Evet; hatalı e-postalar, kapanan şirketler ve geçersiz numaralar dönemsel temizlikten geçirilir
  - `yalnizca_kampanya_gonderimi_hata_verince_manuel_temizlik_yapilir`: Planlı denetim yoktur; e-posta geri döndükçe (Bounce) veya telefon açılmadıkça fark edilip silinir
  - `pazarlama_veri_kalitesi_denetimi_yapilmamaktadir`: Veri kalitesi denetimi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Pazarlama Veri Tabanı Hijyeni ve Veri Kalitesi Denetim Frekansını belirler.

#### [MKT-042] ERP/CRM dönüşümü sonrasında hedeflenen Kurumsal Pazarlama ve Kampanya Yönetimi vizyonu ve temel önceliği nedir?
- **Süreç:** Pazarlama KPI ve ROI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), pazarlama ve talep yaratma yatırım hedefleri.
- **Seçenekler:**
  - `omni_channel_lead_akisi_otomatik_scoring_ve_tam_entegre_roi_takibi`: Tüm kanallardan akan lead'lerin otomatik nitelendirilmesi, satışa hızlı devri ve net ROI ölçümü
  - `duzenli_toplu_eposta_ve_fuar_ziyaretci_takibinin_disipline_edilmesi`: Fuarlardan ve webden toplanan kartvizitlerin kaybolmadan CRM'e girmesi ve e-bülten süreçleri önceliklidir
  - `pazarlama_ile_satis_arasindaki_iletisim_kopuklugunun_giderilmesi`: Pazarlamanın ürettiği lead'lerin satış tarafından neden aranmadığının şeffaflaşması hedeflenmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** ERP/CRM Pazarlama ve Talep Yaratma İş Paketi Kapsamını belirler.
