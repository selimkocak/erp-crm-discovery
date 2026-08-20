# FAZ-22 — Tedarikçi Yönetimi / SUPPLIER_MANAGEMENT Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.supplier_management.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `SUPPLIER_MANAGEMENT` (Tedarikçi Yönetimi)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Satın Alma Direktörleri (CPO), Tedarik Zinciri Yöneticileri, Kalite Güvence Müdürleri, Stratejik Satın Alma Uzmanları ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP/SRM dönüşümü öncesinde tedarikçi ana veri yapısı ve de-duplication, aday tedarikçi yönetimi ve portal ön başvuruları, tedarikçi açılış yetkileri ve zorunlu evrak kontrolleri, departmanlar arası tedarikçi onay iş akışları, onaylı tedarikçi listesi (AVL) ve satın alma kısıtlamaları, tedarikçi sınıflandırması ve kademelendirme (Tier 1/Tier 2), ürün/hizmet kategori yetkinliği ve kapasite takibi, alternatif tedarikçi yönetimi ve çift kaynak politikası (Dual Sourcing), kritik ve stratejik tedarikçi yönetimi (QBR), tek kaynak (Single Source) ve tedarikçi harcama konsantrasyon riskleri, kalite sertifikaları ve belge geçerlilik takibi, tedarikçi kalite performansı ve red oranları (PPM), zamanında ve eksiksiz teslimat performansı (OTD/OTIF), ticari performans ve fiyat istikrarı, tedarikçi değerlendirme karnesi (Scorecard) ve siparişe etkisi, finansal/operasyonel tedarikçi risk analizi, tedarikçi blokajı (Vendor Block) ve kara liste mekanizmaları, tedarikçi geliştirme ve düzeltici faaliyetler (SCAR), tedarikçi KPI kokpiti ve SRM vizyonu süreçlerinin AS-IS durumunu ve ERP/SRM gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | SUPPLIER_MANAGEMENT ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **PROCUREMENT** | Satın alma talebi (PR), teklif toplama (RFQ), teklif karşılaştırma matrisi, sipariş (PO), fiyat, ticari şartlar, teslimat takibi, 3-way match | **PROCUREMENT satın alma operasyonel döngüsünü sorgular.** SUPPLIER_MANAGEMENT tedarikçinin kimliğini, onay sürecini, AVL listesini, performans karnesini (Scorecard), tek kaynak riskini ve blokajını sorgular. *(0 PO / Satın Alma Talebi sorusu)*. |
| **ACCOUNTING** | Cari hesap defteri, yevmiye kayıtları, fatura muhasebeleştirme, ödeme planı ve yaşlandırma | **ACCOUNTING mali defter kayıtlarını sorgular.** SUPPLIER_MANAGEMENT tedarikçi ana veri doğruluğunu ve ticari performansını sorgular. |
| **INVENTORY & WAREHOUSE** | Stok hareketleri, sayım, depo lokasyonları, envanter değerlemesi | **INVENTORY/WAREHOUSE depo ve stok operasyonunu sorgular.** SUPPLIER_MANAGEMENT tedarikçinin zamanında (OTD) ve eksiksiz teslimat (OTIF) oranlarını sorgular. |
| **QUALITY** | Giriş muayene kontrol kriterleri, numune alma standartları (AQL), fabrika içi uygunsuzluk (NCR) ve CAPA | **QUALITY teknik muayene adımlarını sorgular.** SUPPLIER_MANAGEMENT tedarikçinin genel kalite red puanını ve tedarikçi düzeltici aksiyonlarını (SCAR) sorgular. |
| **SUPPLIER_MANAGEMENT** | Tedarikçi ana verisi, aday tedarikçi, onay iş akışı, AVL, yetkinlik, alternatif tedarikçiler, tek kaynak riski, sertifikalar, performans scorecard, blokaj, SCAR ve SRM KPI'ları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular tedarikçi ilişkileri, satıcı kalifikasyonu ve risk yönetimi odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Tedarikçi Ana Veri Yapısı** (2 Soru — SUP-001, SUP-002)
2. **Aday Tedarikçi Yönetimi** (2 Soru — SUP-003, SUP-004)
3. **Tedarikçi Açılış Süreci** (2 Soru — SUP-005, SUP-006)
4. **Tedarikçi Onay Süreci** (2 Soru — SUP-007, SUP-008)
5. **Onaylı Tedarikçi Listesi** (2 Soru — SUP-009, SUP-010)
6. **Tedarikçi Sınıflandırması** (2 Soru — SUP-011, SUP-012)
7. **Ürün / Hizmet / Kategori Yetkinliği** (2 Soru — SUP-013, SUP-014)
8. **Alternatif Tedarikçi Yönetimi** (2 Soru — SUP-015, SUP-016)
9. **Kritik ve Stratejik Tedarikçiler** (2 Soru — SUP-017, SUP-018)
10. **Tek Kaynak / Bağımlılık Riski** (2 Soru — SUP-019, SUP-020)
11. **Tedarikçi Belge ve Sertifikaları** (2 Soru — SUP-021, SUP-022)
12. **Tedarikçi Kalite Performansı** (2 Soru — SUP-023, SUP-024)
13. **Teslimat Performansı** (2 Soru — SUP-025, SUP-026)
14. **Ticari Performans** (2 Soru — SUP-027, SUP-028)
15. **Tedarikçi Değerlendirme / Scorecard** (2 Soru — SUP-029, SUP-030)
16. **Tedarikçi Risk Yönetimi** (2 Soru — SUP-031, SUP-032)
17. **Askıya Alma / Blokaj / Kara Liste** (2 Soru — SUP-033, SUP-034)
18. **Tedarikçi Geliştirme** (2 Soru — SUP-035, SUP-036)
19. **Tedarikçi Raporlama ve KPI** (6 Soru — SUP-037, SUP-038, SUP-039, SUP-040, SUP-041, SUP-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Tedarikçi Ana Veri Yapısı

#### [SUP-001] Şirketinizde tedarikçi ana veri kayıtları (Unvan, VKN/TCKN, İletişim Kişileri, Banka IBAN, Adres, Para Birimi) hangi sistemde tutulmakta ve nasıl tekilleştirilmektedir?
- **Süreç:** Tedarikçi Ana Veri Yapısı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi ana veri yönetim sistemi, merkezi sicil standardı ve tekilleştirme yapısı.
- **Seçenekler:**
  - `merkezi_erp_sisteminde_tek_ve_standart_tedarikci_karti_olarak_tutulur`: Tüm tedarikçi verileri merkezi ERP sisteminde tekil kayıt olarak açılır ve standart alanlarla yönetilir
  - `muhasebe_programinda_cari_kart_olarak_tutulur_satinalma_ayri_liste_tutar`: Muhasebede cari kart vardır; ancak satın alma ekibi tedarikçi iletişim ve banka bilgilerini ayrı Excel'de tutar
  - `ayni_tedarikci_farkli_sube_veya_kodlarla_mukerrer_acilabilmektedir`: Merkezi kural yoktur; aynı firma farklı departmanlar tarafından mükerrer kodlarla açılabilmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Merkezi Tedarikçi Sicil ve Master Data Mimarisini belirler.

#### [SUP-002] Tedarikçi açılışında VKN/Vergi Dairesi doğrulaması, e-Fatura mükellefiyet sorgusu ve mükerrer cari kaydı (Duplicate) engelleme kuralları sistemsel olarak işletilmekte midir?
- **Süreç:** Tedarikçi Ana Veri Yapısı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** VKN kontrolü, GİB e-Fatura entegrasyonu ve otomatik mükerrer kart blokajı.
- **Seçenekler:**
  - `vkn_ve_efatura_mukellefiyeti_gib_uzerinden_otomatik_dogrulanir_mukerrer_engellenir`: Evet; VKN girildiğinde unvan ve e-Fatura durumu GİB'den anlık çekilir, aynı VKN ile ikinci kart açılamaz
  - `vkn_alani_vardir_ancak_manuel_girilir_mukerrerlik_kontrolu_yapilmaz`: Sistemde VKN alanı vardır fakat otomatik entegrasyon yoktur; mükerrer girişler sistem tarafından engellenmez
  - `vkn_veya_efatura_kontrolu_yapilmamaktadir`: VKN doğrulaması veya e-Fatura sorgulaması yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** GİB VKN/e-Fatura Entegrasyonu ve Otomatik De-duplication Kuralını belirler.

---

### 2. Aday Tedarikçi Yönetimi

#### [SUP-003] Sisteme henüz onaylanmamış yeni tedarikçi adayları (Aday / Potansiyel Tedarikçi) ile resmi onaylı tedarikçiler arasında statü ayrımı bulunmakta mıdır?
- **Süreç:** Aday Tedarikçi Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Aday tedarikçi havuzu, statü yaşam döngüsü (Aday -> Değerlendirmede -> Onaylı -> Pasif).
- **Seçenekler:**
  - `aday_tedarikci_statu_ayrimi_vardir_onaylanmadan_aktif_karta_donusmez`: Evet; aday tedarikçiler ayrı statüde tutulur, değerlendirme tamamlanmadan resmi tedarikçi statüsüne geçemez
  - `ayri_aday_havuzu_yoktur_tum_firmalar_dogrudan_aktif_tedarikci_acilir`: Aday ayrımı yoktur; teklif alınan her firma doğrudan ana sisteme aktif cari/tedarikçi olarak kaydedilir
  - `aday_tedarikciler_satinalmacilarin_kisisel_notlarinda_veya_excelde_tutulur`: Sistemik havuz yoktur; aday tedarikçiler satın almacıların e-postalarında veya Excel listelerinde tutulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Aday Tedarikçi Yaşam Döngüsü ve Statü Geçiş Motorunu belirler.

#### [SUP-004] Yeni aday tedarikçilerin kendi kurumsal bilgilerini, sertifikalarını, kataloglarını ve ön tekliflerini sisteme girebildiği bir Tedarikçi Portalı / Ön Başvuru Formu kullanılmakta mıdır?
- **Süreç:** Aday Tedarikçi Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Tedarikçi self-servis portalı, online başvuru ve belge yükleme altyapısı.
- **Seçenekler:**
  - `online_tedarikci_portali_uzerinden_self_servis_basvuru_ve_belge_yukleme_aktif`: Evet; tedarikçiler web portalından şirket bilgilerini, sertifikalarını ve banka hesaplarını kendileri yükler
  - `bilgiler_eposta_ile_alinir_sirket_personeli_tarafindan_sisteme_girilir`: Portal yoktur; tedarikçi evrakları e-posta ile gönderir, satın alma personeli bilgileri elle sisteme kaydeder
  - `tedarikci_on_basvuru_formu_veya_portali_bulunmamaktadir`: Ön başvuru formu veya tedarikçi portalı bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Self-Servis Portalı (SRM Supplier Portal) gereksinimini belirler.

---

### 3. Tedarikçi Açılış Süreci

#### [SUP-005] Şirketinizde yeni bir tedarikçi kartı açma yetkisi hangi departman/role (Satın Alma Uzmanı, Satın Alma Müdürü, Muhasebe/Finans, Kalite Birimi) aittir?
- **Süreç:** Tedarikçi Açılış Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi kartı açılış yetki matrisi ve rol bazlı güvenlik.
- **Seçenekler:**
  - `yalnizca_yetkili_merkezi_veri_yoneticisi_veya_finans_tarafindan_acilir`: Yetki sınırlandırılmıştır; yalnızca Satın Alma Müdürü onayı sonrası Muhasebe/Master Data ekibi açabilir
  - `satinalma_uzmanlari_ihtiyac_duydukca_serbestce_tedarikci_acabilir`: Tüm satın alma uzmanları sisteme serbestçe yeni tedarikçi kartı tanımlayabilir
  - `herkes_tedarikci_acabilir_yetki_kisitlamasi_yoktur`: Sistemde kısıtlama yoktur; teklif veya fatura giren herhangi bir kullanıcı tedarikçi açabilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Kartı Açılış Yetki Matrisi ve Rol Güvenliğini belirler.

#### [SUP-006] Tedarikçi açılışında zorunlu yasal/ticari evraklar (Vergi Levhası, İmza Sirküleri, Ticaret Sicil Gazetesi, Banka Teyit Yazısı / Kaşeli Hesap Cüzdanı) eksiksiz toplanmadan kart açılışına izin verilmekte midir?
- **Süreç:** Tedarikçi Açılış Süreci
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Zorunlu evrak seti denetimi, yasal uyumluluk ve banka hesap teyidi.
- **Seçenekler:**
  - `zorunlu_evraklar_sisteme_yuklenmeden_tedarikci_karti_onaylanamaz_ve_kullanilamaz`: Evet; vergi levhası, imza sirküleri ve banka teyit yazısı eklenmeden sistem kartın açılmasına izin vermez
  - `evraklar_fiziki_dosyada_tutulur_sistemde_zorunlu_evrak_kontrolu_yoktur`: Evraklar klasörde arşivlenir fakat sisteme yükleme zorunluluğu yoktur; evraksız da kart açılabilir
  - `tedarikci_acilisi_icin_resmi_evrak_toplanmamaktadir`: Resmi evrak toplanmadan yalnızca unvan ve telefon bilgisiyle tedarikçi açılmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Zorunlu Tedarikçi Evrak Seti ve Doğrulama Kilit Mekanizmasını belirler.

---

### 4. Tedarikçi Onay Süreci

#### [SUP-007] Yeni bir tedarikçi ile çalışmaya başlamadan önce departmanlar arası (Satın Alma, Kalite Güvence, Finans/Muhasebe, Genel Müdürlük) resmi bir Tedarikçi Onay İş Akışı (Onboarding Approval Workflow) işletilmekte midir?
- **Süreç:** Tedarikçi Onay Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi onay iş akışı, çok departmanlı onay zinciri ve denetim izi.
- **Seçenekler:**
  - `sistem_uzerinden_cok_kademeli_satinalma_kalite_ve_finans_onay_is_akisi_vardir`: Evet; Satın Alma -> Kalite Güvence -> Finans Müdürü onayından geçerek onaylı duruma gelir
  - `yalnizca_satinalma_yoneticisi_sozlu_veya_eposta_ile_onay_verir`: Sistemik onay yoktur; Satın Alma Müdürü sözlü veya e-posta ile 'Çalışalım' derse kart açılır
  - `onay_sureci_yoktur_tedarikci_hemen_kullanima_acilir`: Herhangi bir onay süreci yoktur; kart açıldığı an herkes tarafından sipariş için kullanılabilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Çok Departmanlı Tedarikçi Onay İş Akışı (Vendor Onboarding Workflow) tasarımını belirler.

#### [SUP-008] Onay süreci tamamlanmamış veya onay bekleyen bir tedarikçiye sistem üzerinden Satın Alma Siparişi (PO) açılması veya avans/ödeme yapılması engellenmekte midir?
- **Süreç:** Tedarikçi Onay Süreci
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Açıklama:** Onaysız tedarikçiye sipariş ve ödeme blokajı, sistemsel yaptırım.
- **Seçenekler:**
  - `onaysiz_tedarikciye_siparis_veya_odeme_acilmasi_sistem_tarafindan_kesinlikle_engellenir`: Evet; onay süreci bitmemiş tedarikçi sipariş veya ödeme ekranlarında seçilemez, sistem blokaj koyar
  - `sistem_uyari_verir_ancak_kullanici_uyariyi_gecip_siparis_acabilir`: Sistem 'Tedarikçi onaylanmadı' uyarısı gösterir fakat sipariş veya ödeme açılmasını engellemez
  - `onay_durumu_kontrol_edilmez_her_tedarikciye_siparis_acilabilir`: Sistemde onay kontrolü yoktur; onay almamış tedarikçilere de doğrudan sipariş ve ödeme çıkılabilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Onaysız Tedarikçi Satın Alma & Ödeme Blokajını belirler.

---

### 5. Onaylı Tedarikçi Listesi

#### [SUP-009] Şirket genelinde ve malzeme/kategori bazında güncel bir Onaylı Tedarikçi Listesi (Approved Vendor List - AVL) yönetilmekte midir?
- **Süreç:** Onaylı Tedarikçi Listesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Onaylı tedarikçi listesi (AVL), şirket ve malzeme bazlı tedarikçi uygunluk listesi.
- **Seçenekler:**
  - `malzeme_ve_kategori_bazinda_dinamik_onayli_tedarikci_listesi_yonetilir`: Evet; hangi tedarikçinin hangi malzeme veya hizmet grubu için onaylı olduğu sistemde tanımlıdır
  - `sirket_genelinde_tek_bir_genel_onayli_tedarikci_listesi_vardir`: Kategori/malzeme bazlı ayrım yoktur; şirket genelinde onaylı firmaların yer aldığı tek bir liste vardır
  - `onayli_tedarikci_listesi_kullanilmamaktadir`: Şirketimizde resmi bir Onaylı Tedarikçi Listesi (AVL) uygulaması bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Onaylı Tedarikçi Listesi (AVL Engine) ve Kategori Tabanlı Kalifikasyonu belirler.

#### [SUP-010] Satın alma talebi (Requisition) ve sipariş oluşturulurken onaylı listede (AVL) yer almayan tedarikçilerin seçilmesi sistemik olarak kısıtlanmakta mıdır?
- **Süreç:** Onaylı Tedarikçi Listesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `SUP-009 != "onayli_tedarikci_listesi_kullanilmamaktadir"`
- **Açıklama:** AVL dışı alım kontrolü, liste harici tedarikçi engeli veya özel onay kuralı.
- **Seçenekler:**
  - `yalnizca_avl_listesindeki_onayli_tedarikciler_secilebilir_digerleri_engellenir`: Evet; malzeme seçildiğinde yalnızca o malzemenin onaylı tedarikçileri gelir, liste dışı alım engellenir
  - `avl_disi_tedarikci_icin_ust_yonetim_ozel_onayi_gerekir`: Liste dışı tedarikçi seçilebilir ancak siparişin onaylanması için Satın Alma Direktörü onayı gerekir
  - `sistemik_kisitlama_yoktur_kullanici_istedigi_tedarikciyi_secebilir`: AVL listesi sadece bilgi amaçlıdır; sipariş oluştururken kullanıcı istediği tedarikçiyi seçebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** AVL Dışı Satın Alma Kısıtı ve İstisna Onay Kuralını belirler.

---

### 6. Tedarikçi Sınıflandırması

#### [SUP-011] Tedarikçiler kurumsal yapılarına (Üretici/Fabrika, Yetkili Distribütör, Toptancı/Bayi, Hizmet/Taşeron Sağlayıcı, İthalatçı) ve lokasyonlarına (Yerli, İthal, Serbest Bölge) göre sınıflandırılmakta mıdır?
- **Süreç:** Tedarikçi Sınıflandırması
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi tipolojisi, kurumsal rolü, yerli/yabancı statüsü ve sınıflandırma yapısı.
- **Seçenekler:**
  - `uretici_distributor_hizmet_ve_lokasyon_bazinda_detayli_siniflandirilir`: Evet; üretici, ana dağıtıcı, bayi, taşeron ve yerli/ithal kırılımları tedarikçi kartında zorunlu tanımlıdır
  - `yalnizca_yerli_ve_yabanci_tedarikci_ayrimi_yapilir`: Yalnızca yurt içi ve yurt dışı ayrımı yapılır; üretici veya aracı ayrımı tutulmaz
  - `tedarikci_siniflandirmasi_yapilmamaktadir`: Tedarikçiler sınıflandırılmamaktadır; tüm tedarikçiler tek tip firma olarak açılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Tipolojisi ve Kurumsal Rol Modellemesini belirler.

#### [SUP-012] Tedarikçilerin ticari büyüklük, yıllık satın alma hacmi ve kurumsal risk düzeyine göre kademelendirilmesi (Tier 1 - Ana Tedarikçi, Tier 2 - Alt Tedarikçi) yapılmakta mıdır?
- **Süreç:** Tedarikçi Sınıflandırması
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Tedarikçi kademelendirmesi (Tiering), stratejik önem derecesi ve tedarik zinciri seviyesi.
- **Seçenekler:**
  - `tier1_ve_tier2_seviyeleri_ve_stratejik_onem_kademesi_sistemde_tanimlidir`: Evet; Tier 1 (Doğrudan ana girdi sağlayanlar) ve Tier 2 (Alt bileşen tedarikçileri) kademeleri tanımlıdır
  - `sadece_satin_alma_harcama_tutarlarina_gore_abc_analizi_yapilir`: Tiering yapılmaz; yalnızca harcama büyüklüğüne göre A-B-C sınıfı tedarikçi ayrımı yapılır
  - `kademelendirme_veya_tiering_yapilmamaktadir`: Tedarikçi kademelendirmesi veya önem derecelendirmesi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarik Zinciri Kademelendirme (Supplier Tiering) ve Risk Katmanlarını belirler.

---

### 7. Ürün / Hizmet / Kategori Yetkinliği

#### [SUP-013] Tedarikçiler tedarik edebilecekleri malzeme grupları ve hizmet kategorileri (Örn. Mekanik Parçalar, Kimyasal Hammadde, Ambalaj, Nakliye Hizmeti) ile sistemde eşleştirilmekte midir?
- **Süreç:** Ürün / Hizmet / Kategori Yetkinliği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi yetkinlik matrisi, kategori eşleştirmesi ve ürün grubu uzmanlığı.
- **Seçenekler:**
  - `tedarikciler_yetkin_olduklari_malzeme_ve_hizmet_gruplariyla_birebir_eslesir`: Evet; her tedarikçinin hangi ürün gruplarını sağlayabileceği sistemde tanımlıdır, RFQ buna göre dağıtılır
  - `genel_sektor_tanimi_vardir_ancak_malzeme_kodu_duzeyinde_eslesme_yoktur`: Tedarikçinin genel sektörü bilinir fakat hangi spesifik malzemeleri sağlayabildiği sistemde eşleştirilmemiştir
  - `kategori_veya_urun_yetkinlik_eslestirmesi_yapilmamaktadir`: Tedarikçiler ürün kategorileriyle eşleştirilmez; satın almacılar hafızalarına göre teklif ister *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Kategori/Malzeme Yetkinlik Matrisi ve Otomatik RFQ Yönlendirmesini belirler.

#### [SUP-014] Tedarikçilerin belirli ürün veya parça bazında teknik üretim kabiliyeti, makine parkuru, kapasite sınırı ve asgari sipariş miktarı (MOQ) verileri sistemde kayıt altına alınmakta mıdır?
- **Süreç:** Ürün / Hizmet / Kategori Yetkinliği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Tedarikçi teknik kapasitesi, makine parkuru, MOQ ve üretim kısıtları.
- **Seçenekler:**
  - `teknik_kapasite_makine_parkuru_ve_moq_bilgileri_sistemde_detayli_saklanir`: Evet; tedarikçinin aylık üretim kapasitesi, asgari sipariş miktarı (MOQ) ve tolerans limitleri kayıtlıdır
  - `yalnizca_sozlesmelerde_veya_teklif_metinlerinde_yazar_sistemik_alan_yoktur`: Teklif dosyalarında veya sözleşmede yazar; ERP üzerinde yapısal kapasite veya MOQ alanı tutulmaz
  - `tedarikci_kapasite_ve_moq_verileri_takip_edilmemektedir`: Tedarikçi teknik kapasitesi ve sipariş kısıtları takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Teknik Kapasite ve MOQ Parametre Yönetimini belirler.

---

### 8. Alternatif Tedarikçi Yönetimi

#### [SUP-015] Kritik malzeme ve hizmetler için sistemde birincil tedarikçi (Primary Source) yanında tanımlanmış Alternatif Tedarikçiler (Second Source / Yedek Tedarikçi) bulunmakta mıdır?
- **Süreç:** Alternatif Tedarikçi Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Alternatif tedarikçi tanımları, çoklu kaynak yönetimi (Multi-Sourcing) ve tedarik sürekliliği.
- **Seçenekler:**
  - `her_kritik_malzeme_icin_onayli_birincil_ve_ikincil_alternatif_tedarikciler_tanimlidir`: Evet; her kritik malzeme kartında 1. Tercih Edilen (Primary) ve 2. Yedek (Secondary) tedarikçiler tanımlıdır
  - `alternatif_firmalar_vardir_ancak_sistemde_onceden_tanimlanmaz_kriz_aninda_aranir`: Piyasada alternatifler bilinir fakat sistemde bağlı değildir; ana tedarikçi aksadığında manuel araştırılır
  - `alternatif_tedarikci_yonetimi_yoktur_tek_kaynakla_calisilir`: Şirketimizde alternatif tedarikçi politikası yoktur; çoğu malzeme için tek tedarikçiyle çalışılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Çoklu Kaynak (Multi-Sourcing) ve Alternatif Tedarikçi Eşleme Mimarisini belirler.

#### [SUP-016] Alternatif tedarikçi dağıtımında çoklu tedarik politikası (Dual Sourcing — Örn. %70 Ana Tedarikçi / %30 Yedek Tedarikçi kota paylaşımı) uygulanmakta mıdır?
- **Süreç:** Alternatif Tedarikçi Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `SUP-015 != "alternatif_tedarikci_yonetimi_yoktur_tek_kaynakla_calisilir"`
- **Açıklama:** Kota paylaşımı (Split Order / Dual Sourcing), risk dağıtımı ve tedarikçi canlı tutma.
- **Seçenekler:**
  - `dual_sourcing_kota_oranlarina_gore_siparisler_otomatik_paylastirilir`: Evet; tedarik riskini azaltmak için siparişler %70/%30 veya %80/%20 gibi kotalarla iki tedarikçiye paylaştırılır
  - `fiyat_veya_vade_avantajina_gore_manuel_olarak_biri_tercih_edilir`: Kota kuralı yoktur; o anki fiyat, stok durumu veya satın almacının tercihine göre biri seçilir
  - `kota_veya_dual_sourcing_kullanilmamaktadir`: Kota paylaşımı veya Dual Sourcing politikası uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Dual Sourcing Kota Bölüşümü ve Sipariş Dağıtım Kurallarını belirler.

---

### 9. Kritik ve Stratejik Tedarikçiler

#### [SUP-017] Şirketinizin üretimini, operasyonunu veya nihai ürün kalitesini doğrudan durdurabilecek Kritik ve Stratejik Tedarikçiler (Strategic Suppliers) sistemde ayrı bir statüde izlenmekte midir?
- **Süreç:** Kritik ve Stratejik Tedarikçiler
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Stratejik tedarikçi ayrımı, kritiklik matrisi ve özel yönetim statüsü.
- **Seçenekler:**
  - `kritik_ve_stratejik_tedarikciler_sistemde_etiketlenmis_ve_ozel_takip_edilir`: Evet; iş sürekliliği açısından kritik olan firmalar sistemde işaretlidir, özel risk ve performans kurallarına tabidir
  - `yonetim_tarafindan_sozlu_bilinir_ancak_sistemde_ayri_bir_statu_yoktur`: Kimin kritik olduğu tecrübeyle bilinir fakat sistemde standart bir etiket veya filtreleme alanı yoktur
  - `kritik_tedarikci_ayrimi_yapilmamaktadir`: Kritik veya stratejik tedarikçi ayrımı yapılmamaktadır; tüm tedarikçilere aynı kurallar uygulanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Stratejik Tedarikçi Segmentasyonu ve Önceliklendirme Kurallarını belirler.

#### [SUP-018] Stratejik tedarikçiler ile dönemsel üst düzey iş ortaklığı toplantıları (QBR - Quarterly Business Review) yapılmakta ve ortak iyileştirme hedefleri belirlenmekte midir?
- **Süreç:** Kritik ve Stratejik Tedarikçiler
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Stratejik tedarikçi inceleme toplantıları (QBR), ortak inovasyon ve iş birliği.
- **Seçenekler:**
  - `duzenli_ceyrek_donem_qbr_toplantilari_yapilir_ve_aksiyonlar_takip_edilir`: Evet; stratejik tedarikçilerle çeyreklik değerlendirme yapılır, kapasite ve maliyet hedefleri resmi tutulur
  - `yalnizca_ciddi_kriz_veya_fiyat_artisi_oldugunda_ust_duzey_gorusulur`: Planlı periyot yoktur; sadece teslimat aksadığında veya büyük fiyat zammı geldiğinde toplantı yapılır
  - `stratejik_is_ortakligi_toplantilari_yapilmamaktadir`: Stratejik tedarikçi toplantıları veya ortak iş birliği çalışmaları yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Stratejik Tedarikçi Ortak Yönetim (QBR / Joint SRM) Disiplinini belirler.

---

### 10. Tek Kaynak / Bağımlılık Riski

#### [SUP-019] Şirketinizde piyasada alternatifi bulunmayan veya tek bir tedarikçiye bağımlı olunan Tek Kaynaklı (Single Source / Sole Source) malzemeler ve bağımlılık oranları takip edilmekte midir?
- **Süreç:** Tek Kaynak / Bağımlılık Riski
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tek kaynak (Single/Sole Source) malzeme envanteri ve bağımlılık analizi.
- **Seçenekler:**
  - `tek_kaynakli_malzemeler_ve_bagimlilik_oranlari_sistemden_raporlanabilir`: Evet; alternatifsiz tek kaynaklı malzemeler sistemde etiketlidir, tedarik riski düzenli olarak izlenir
  - `tek_kaynakli_urunler_bilinir_ancak_resmi_bir_risk_takibi_yapilmaz`: Ürünlerin tek kaynaklı olduğu bilinir fakat sistemik raporlanmaz, alternatif geliştirme planı yoktur
  - `tek_kaynak_bagimlilik_takibi_yapilmamaktadir`: Tek kaynak bağımlılık durumu veya risk analizi takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tek Kaynak (Single Source) Risk Analitiği ve Bağımlılık İzlemeyi belirler.

#### [SUP-020] Şirketin toplam satın alma bütçesinin belirli bir tedarikçide aşırı yoğunlaşması (Tedarikçi Konsantrasyon Riski — Örn. Yıllık cironun %40'ının tek firmadan alınması) izlenmekte ve raporlanmakta mıdır?
- **Süreç:** Tek Kaynak / Bağımlılık Riski
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Harcama yoğunlaşması, tedarikçi ciro payı ve konsantrasyon riski.
- **Seçenekler:**
  - `harcama_konsantrasyon_oranlari_ve_tedarikci_finansal_bagimliligi_olculur`: Evet; satın alma hacminin tedarikçilere dağılımı analiz edilir, tek firmada aşırı yoğunlaşma risk sayılır
  - `yil_sonlarinda_muhasebe_ekstresinden_manuel_gorulur_risk_olarak_degerlendirilmez`: Yıl sonunda toplam ödemelere bakılır fakat tedarik zinciri riski olarak analiz edilmez
  - `tedarikci_konsantrasyon_riski_takip_edilmemektedir`: Tedarikçi konsantrasyon riski takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Harcama Konsantrasyonu ve Finansal Kırılganlık Ölçümünü belirler.

---

### 11. Tedarikçi Belge ve Sertifikaları

#### [SUP-021] Tedarikçilerin kalite sertifikaları (ISO 9001, ISO 14001, IATF 16949, CE, TSE, Helal vb.) ve sektörel yetki belgeleri sistemde geçerlilik tarihleriyle (Expiry Date) saklanmakta mıdır?
- **Süreç:** Tedarikçi Belge ve Sertifikaları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi kalite sertifikaları, yasal yetki belgeleri ve geçerlilik tarihleri.
- **Seçenekler:**
  - `tum_sertifikalar_belge_tipi_ve_gecerlilik_bitis_tarihiyle_sistemde_tutulur`: Evet; sertifika adı, belgelendirme kuruluşu ve geçerlilik bitiş tarihi sistemde dijital dosyasıyla saklanır
  - `belgeler_klasorde_veya_taranmis_pdf_olarak_tutulur_tarih_takibi_yoktur`: Belge fotokopileri veya PDF'leri arşivdedir fakat sistemde bitiş tarihi ve süre takibi yoktur
  - `sertifika_ve_belgeler_sistemde_takip_edilmemektedir`: Tedarikçi sertifikaları veya belge geçerlilikleri takip edilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Sertifika ve Belge Yaşam Döngüsü Takip Modülünü belirler.

#### [SUP-022] Belge geçerlilik süresi dolmak üzere olan tedarikçiler için otomatik uyarı üretilmekte ve süresi dolmuş zorunlu sertifikası olan tedarikçiden satın alma bloke edilmekte midir?
- **Süreç:** Tedarikçi Belge ve Sertifikaları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `SUP-021 != "sertifika_ve_belgeler_sistemde_takip_edilmemektedir"`
- **Açıklama:** Sertifika bitiş alarmları, otomatik uyarılar ve süresi dolan sertifikada sipariş blokajı.
- **Seçenekler:**
  - `suresi_dolmadan_30_gun_once_uyari_verilir_ve_dolunca_siparis_otomatik_engellenir`: Evet; bitime 30 gün kala bildirim gönderilir, süresi dolan zorunlu belgeli tedarikçiye sipariş açılması kilitlenir
  - `yalnizca_eposta_ile_uyari_gider_ancak_satinalma_islemi_engellenmez`: Kaliteye veya satın almacıya e-posta uyarısı gider fakat sistemik satın alma engeli uygulanmaz
  - `otomatik_uyari_veya_blokaj_bulunmamaktadir`: Otomatik uyarı veya satın alma blokaj mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Sertifika Geçerlilik Alarmları ve Otomatik Satın Alma Blokajını belirler.

---

### 12. Tedarikçi Kalite Performansı

#### [SUP-023] Giriş kalite kontrolde veya üretim hattında tespit edilen tedarikçi kaynaklı hatalı/uygunsuz malzemeler (Kalite Red Oranı / PPM / Hurda Oranı) tedarikçi kartıyla eşleştirilerek ölçülmekte midir?
- **Süreç:** Tedarikçi Kalite Performansı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi kalite performansı, giriş red oranı, üretim içi hata oranı (PPM) ve uygunsuzluklar.
- **Seçenekler:**
  - `kalite_redleri_ve_ppm_oranlari_tedarikci_bazinda_sistemden_otomatik_hesaplanir`: Evet; kalite kontrol redleri ve hat içi uygunsuzluklar tedarikçiyle eşleşir, PPM ve red oranı hesaplanır
  - `kalite_birimi_aylik_excel_raporu_hazirlar_satinalma_ile_manuel_paylasir`: Sistemde otomatik entegrasyon yoktur; kalite ekibi red kayıtlarını Excel'de tutar ve satın almaya bildirir
  - `tedarikci_kalite_performansi_sistemik_olculmemektedir`: Tedarikçi kalite performansı veya hata oranları sayısal olarak ölçülmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Kalite Red (PPM) Entegrasyonu ve Performans Karnesi Bağlantısını belirler.

#### [SUP-024] Tedarikçiye yapılan hatalı malzeme iadeleri (RMA / Tedarikçi İade Faturası) ve oluşan işçilik/hat duruşu zararlarının tedarikçiye rücu edilmesi (Debit Note / Ceza Faturası) sistemde takip edilmekte midir?
- **Süreç:** Tedarikçi Kalite Performansı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Hatalı malzeme iade süreci, maliyet rücu mekanizması ve tedarikçi ceza yönetimi.
- **Seçenekler:**
  - `iade_ve_zarar_rucu_surecleri_kalite_ve_muhasebe_ile_tam_entegre_yonetilir`: Evet; reddedilen parti iade edilir, oluşan duruş maliyeti tedarikçiye rücu edilerek cari hesabından kesilir
  - `sadece_fiziki_malzeme_iadesi_yapilir_ek_maliyetler_rucu_edilmez`: Sadece hatalı parça iade faturası kesilir; hat duruşu veya işçilik kaybı gibi ek zararlar takip edilmez
  - `iade_veya_maliyet_rucu_takibi_yapilamamaktadir`: İade süreçleri veya maliyet rücu mekanizması takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Hatalı Malzeme İade (RMA) ve Rücu (Debit Note) Akışını belirler.

---

### 13. Teslimat Performansı

#### [SUP-025] Tedarikçilerin sipariş teyit tarihine göre Zamanında Teslimat Oranı (On-Time Delivery - OTD) ve Eksiksiz Teslimat (OTIF - On-Time In-Full) performansı sistem tarafından otomatik hesaplanmakta mıdır?
- **Süreç:** Teslimat Performansı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Zamanında teslimat (OTD), eksiksiz teslimat (OTIF) ve tedarik lojistik performansı.
- **Seçenekler:**
  - `otd_ve_otif_oranlari_siparis_ve_irsaliye_tarihleriyle_sistemden_canli_hesaplanir`: Evet; sipariş onay tarihi ile depo mal kabul tarihi kıyaslanır, OTD ve OTIF oranları otomatik üretilir
  - `satinalma_ekibi_donem_sonlarinda_gecikmeleri_manuel_olarak_raporlar`: Sistemik oran üretilmez; satın almacılar geciken siparişleri Excel'de manuel listeleyerek değerlendirir
  - `zamaninda_ve_eksiksiz_teslimat_orani_takip_edilmemektedir`: Tedarikçilerin zamanında veya eksiksiz teslimat performansları ölçülmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** OTD ve OTIF Otomatik Teslimat Performans Hesaplama Motorunu belirler.

#### [SUP-026] Tedarikçinin taahhüt ettiği teslim süresi (Lead Time) ile fiili teslimat gerçekleşme süresi arasındaki termin sapmaları sipariş bazında raporlanabilmekte midir?
- **Süreç:** Teslimat Performansı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Tedarik süresi (Lead Time) doğruluğu, termin sapma analizi ve erken/geç teslimat takibi.
- **Seçenekler:**
  - `lead_time_sapmalari_gun_bazinda_her_siparis_ve_tedarikci_icin_raporlanir`: Evet; taahhüt edilen termin ile gerçekleşen mal kabul günü arasındaki sapma (Erken/Geç teslim) raporlanır
  - `yalnizca_cok_buyuk_gecikmelerde_tedarikciye_manuel_hesap_sorulur`: Sistemik sapma analizi yoktur; sadece fabrika duruşuna sebep olan büyük gecikmelerde uyarılır
  - `termin_sapmalari_ve_lead_time_takip_edilmemektedir`: Termin sapmaları veya teslim süresi güvenilirliği takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarik Lead Time Sapma Analizi ve Termin Güvenilirlik Raporlamasını belirler.

---

### 14. Ticari Performans

#### [SUP-027] Tedarikçilerin fiyat istikrarı, teklif verme hızı, sözleşme şartlarına uyumu ve vade/ödeme kolaylıkları ticari performans kriteri olarak değerlendirilmekte midir?
- **Süreç:** Ticari Performans
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Ticari güvenilirlik, fiyat tutarlılığı, teklif yanıt süresi ve vade performansı.
- **Seçenekler:**
  - `fiyat_istikrari_ve_ticari_sartlara_uyum_sistemde_kriter_olarak_puanlanir`: Evet; teklif verilen fiyat ile gerçekleşen fatura fiyatı uyumu, vade şartları ve teklif hızı puanlanır
  - `satinalma_ekibi_sozlu_veya_kanaat_uzerinden_ticari_degerlendirme_yapar`: Sayısal kriter yoktur; satın alma uzmanının tedarikçiyle olan genel ilişkisi ve izlenimi esas alınır
  - `ticari_performans_degerlendirmesi_yapilmamaktadir`: Tedarikçilerin ticari performansı veya fiyat güvenilirliği değerlendirilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Ticari Performans ve Fiyat İstikrarı Değerlendirme Kriterlerini belirler.

#### [SUP-028] Tedarikçiye verilen toplam satın alma hacmi ve geçmiş fatura tutarları tedarikçi bazında konsolide olarak tek ekranda incelenebilmekte midir?
- **Süreç:** Ticari Performans
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi harcama görünürlüğü (Supplier Spend 360), geçmiş sipariş ve fatura konsolidasyonu.
- **Seçenekler:**
  - `tedarikci_360_ekraninda_tum_gecmis_siparis_fatura_ve_harcama_hacmi_gorulur`: Evet; tedarikçi kartından geçmiş siparişler, açık PO'lar, fatura toplamları ve ciro payı tek ekranda izlenir
  - `muhasebeden_ayri_ekstre_satinalmadan_ayri_rapor_cekilerek_birlestirilir`: Tek ekran yoktur; satın alma sipariş raporu ve muhasebe cari ekstresi Excel'de birleştirilerek incelenir
  - `tedarikci_harcama_ve_siparis_gecmisi_konsolide_gorulememektedir`: Tedarikçi harcama ve sipariş geçmişi konsolide olarak görülememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi 360° Harcama ve Ticari Tarihçe Görünümünü belirler.

---

### 15. Tedarikçi Değerlendirme / Scorecard

#### [SUP-029] Tedarikçiler belirli dönemlerde (Aylık, Çeyreklik, Yıllık) ağırlıklı kriterlerle (Kalite %40, Teslimat %30, Fiyat %20, Hizmet %10) resmi bir Tedarikçi Değerlendirme Karnesi (Supplier Scorecard / Puanlama) ile derecelendirilmekte midir?
- **Süreç:** Tedarikçi Değerlendirme / Scorecard
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi değerlendirme karnesi (Scorecard), çok kriterli ağırlıklı puanlama modeli.
- **Seçenekler:**
  - `erp_uzerinde_kalite_teslimat_fiyat_ve_hizmet_agirlikli_otomatik_scorecard_calisir`: Evet; ERP içinde kalite, teslimat ve fiyat verileri ağırlıklandırılarak otomatik tedarikçi skoru üretilir
  - `excel_tablolari_uzerinden_periyodik_olarak_manuel_scorecard_hesaplanir`: Sistemik otomatik karne yoktur; kalite ve satın alma verileri çeyreklik dönemlerde Excel'de puanlanır
  - `yalnizca_sorun_yasanan_tedarikciler_icin_durumsal_degerlendirme_yapilir`: Rutin karne yoktur; yalnızca ciddi problem çıkaran tedarikçiler masaya yatırılır
  - `tedarikci_degerlendirme_karnesi_kullanilmamaktadir`: Şirketimizde resmi bir tedarikçi değerlendirme veya puanlama sistemi bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Scorecard Puanlama Motoru ve Ağırlıklı Kriter Modelini belirler.

#### [SUP-030] Tedarikçi puanlama sonuçları (A - Mükemmel, B - Onaylı, C - Şartlı/Geliştirilmeli, D - Yetersiz) satın alma teklif/sipariş ekranlarında satın almacıya gösterilmekte ve sipariş dağıtımını etkilemekte midir?
- **Süreç:** Tedarikçi Değerlendirme / Scorecard
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `SUP-029 != "tedarikci_degerlendirme_karnesi_kullanilmamaktadir"`
- **Açıklama:** Scorecard puanının satın alma kararlarına entegrasyonu ve sipariş payı kuralı.
- **Seçenekler:**
  - `scorecard_derecesi_siparis_ekraninda_gorunur_ve_dusuk_puanliya_siparis_engellenir`: Evet; tedarikçi derecesi satın alma ekranında anlık görünür, 'D' alan tedarikçiye onay verilmez
  - `derece_yalnizca_yonetim_raporlarinda_kalir_satinalma_ekranina_yansimaz`: Puanlar raporlanır fakat satın almacının ekranında görünmez; sipariş açarken karar satın almacıdadır
  - `puanlama_sonuclari_satinalma_kararlarini_etkilememektedir`: Puanlama sonuçları satın alma kararlarını etkilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Scorecard Sonuçlarının Satın Alma Karar Destek Ekranlarına Entegrasyonunu belirler.

---

### 16. Tedarikçi Risk Yönetimi

#### [SUP-031] Tedarikçilerin finansal gücü (İflas/Konkordato riski, Kredi skoru), operasyonel kapasitesi ve jeopolitik/lojistik riskleri düzenli olarak analiz edilmekte midir?
- **Süreç:** Tedarikçi Risk Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi risk değerlendirmesi, finansal istihbarat ve operasyonel kırılganlık.
- **Seçenekler:**
  - `finansal_kredi_istihbarat_ve_jeopolitik_riskler_sistemde_kategorize_takip_edilir`: Evet; kritik tedarikçilerin finansal istihbarat raporları, borçluluk ve ülke riskleri sisteme kaydedilir
  - `yalnizca_piyasa_duyumlari_ve_banka_haberleri_ile_manuel_takip_edilir`: Resmi bir risk analizi yoktur; piyasada olumsuz bir haber duyulduğunda önlem alınmaya çalışılır
  - `tedarikci_risk_analizi_yapilmamaktadir`: Tedarikçilerin finansal veya operasyonel riskleri analiz edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Risk Analiz Modülü ve Finansal İstihbarat Entegrasyonunu belirler.

#### [SUP-032] Yüksek riskli olarak işaretlenen tedarikçiler için erken uyarı bildirimleri üretilmekte ve risk azaltma planları (Risk Mitigation / Alternatif Kaynak Bulma) devreye alınmakta mıdır?
- **Süreç:** Tedarikçi Risk Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Risk azaltma planları (Risk Mitigation), erken uyarı mekanizması ve acil durum senaryoları.
- **Seçenekler:**
  - `erken_uyari_bildirimleri_ile_risk_azaltma_ve_yedek_stok_plani_otomatik_tetiklenir`: Evet; tedarikçide risk yükseldiğinde satın almaya bildirim düşer ve güvenlik stoğu/yedek kaynak süreci başlar
  - `risk_fark_edilince_yonetimle_manuel_toplanti_yapilir`: Sistemik erken uyarı yoktur; kriz oluştukça yönetim toplantısıyla alternatif aranır
  - `risk_azaltma_veya_erken_uyari_mekanizmasi_bulunmamaktadir`: Risk azaltma veya erken uyarı mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarik Zinciri Erken Uyarı ve Risk Azaltma (Risk Mitigation) Akışlarını belirler.

---

### 17. Askıya Alma / Blokaj / Kara Liste

#### [SUP-033] Düşük performanslı, kalite standartlarını karşılamayan veya ticari uyuşmazlık yaşanan tedarikçiler için Sistemik Blokaj / Askıya Alma (Vendor Block) işlemi yapılabilmekte midir?
- **Süreç:** Askıya Alma / Blokaj / Kara Liste
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi blokajı, askıya alma ve satın alma kısıtlaması.
- **Seçenekler:**
  - `tedarikci_satinalma_veya_odeme_duzeyinde_sistemden_bloke_edilebilir`: Evet; tedarikçi 'Yeni Sipariş Engeli', 'Mal Kabul Engeli' veya 'Ödeme Blokajı' statüsüne alınabilir
  - `tedarikci_adi_pasife_alinir_ancak_eski_siparisler_ve_odemeler_otomatik_kilitlenmez`: Kart pasife alınabilir fakat sistemsel kilit yoktur; açık siparişlerin akışı devam eder
  - `sistemik_tedarikci_blokaji_bulunmamaktadir`: Şirketimizde sistemsel tedarikçi blokajı veya askıya alma mekanizması bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Kademeli Tedarikçi Blokaj Motoru (PO, GR, Payment Lock) tasarımını belirler.

#### [SUP-034] Bloke edilen veya kara listeye (Blacklist) alınan tedarikçinin blokaj nedeni, blokajı koyan yetkili ve blokajın kaldırılması için gerekli onay süreci sistemde kurala bağlı mıdır?
- **Süreç:** Askıya Alma / Blokaj / Kara Liste
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `SUP-033 != "sistemik_tedarikci_blokaji_bulunmamaktadir"`
- **Açıklama:** Blokaj neden kütüğü, denetim izi, yetki kontrolü ve blokaj kaldırma onay zinciri.
- **Seçenekler:**
  - `blokaj_nedeni_ve_tarihcesi_zorunlu_kaydedilir_kaldirma_icin_yonetim_onayi_gerekir`: Evet; blokaj nedeni (Kalite, Hukuk, Finans) kayıt altına alınır; kaldırmak için Direktör onayı zorunludur
  - `blokaj_konulabilir_ancak_herhangi_bir_kullanici_blokaji_kolayca_kaldirabilir`: Blokaj konulabilir fakat kaldırma için yetki kısıtı yoktur; satın almacı blokajı kendisi açabilir
  - `blokaj_nedeni_veya_onay_kurallari_tutulmamaktadir`: Blokaj nedeni veya blokaj kaldırma onay kuralları tutulmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Blokaj Tarihçesi, Denetim İzi (Audit Trail) ve Blokaj Kaldırma Yetki Matrisini belirler.

---

### 18. Tedarikçi Geliştirme

#### [SUP-035] Performansı sınırda veya yetersiz çıkan tedarikçiler için Tedarikçi Düzeltici Faaliyet Talebi (SCAR - Supplier Corrective Action Request) ve Geliştirme Planı (Supplier Development) açılmakta mıdır?
- **Süreç:** Tedarikçi Geliştirme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi düzeltici faaliyetleri (SCAR), 8D metodolojisi ve tedarikçi iyileştirme planı.
- **Seçenekler:**
  - `resmi_scar_ve_gelistirme_aksiyon_plani_sistem_uzerinden_tedarikciye_iletilir_ve_izlenir`: Evet; uygunsuzluk durumunda SCAR formu açılır, tedarikçinin kök neden analizi ve aksiyonu sistemde izlenir
  - `eposta_ile_uyari_yazisi_gonderilir_aksiyon_takibi_manuel_yapilir`: Sistemik SCAR yoktur; tedarikçiye e-posta ile 'Düzeltin' yazılır, takip satın almacının inisiyatifindedir
  - `tedarikci_duzeltici_faaliyet_ve_gelistirme_yapilmaz`: Tedarikçi geliştirme veya resmi düzeltici faaliyet süreci uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Düzeltici Faaliyet (SCAR) ve 8D İyileştirme Modülünü belirler.

#### [SUP-036] Tedarikçiye atanan düzeltici faaliyet aksiyonları, saha denetim tarihleri (Supplier Audit) ve terminlerin tamamlanma durumu sistem üzerinden takip edilmekte midir?
- **Süreç:** Tedarikçi Geliştirme
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `SUP-035 != "tedarikci_duzeltici_faaliyet_ve_gelistirme_yapilmaz"`
- **Açıklama:** Tedarikçi denetimleri (Supplier Audits), aksiyon terminleri ve yeniden değerlendirme.
- **Seçenekler:**
  - `tedarikci_saha_denetimleri_ve_aksiyon_terminleri_sistemde_takvime_bagli_izlenir`: Evet; tedarikçi denetim raporları, aksiyon terminleri ve yeniden puanlama takvim üzerinden yönetilir
  - `denetim_yapilir_ancak_raporlar_word_excelde_kalir_sisteme_islenmez`: Tedarikçi ziyaret edilir fakat denetim puanı ve aksiyonlar sistemde değil, Word/Excel raporlarında kalır
  - `tedarikci_denetimleri_ve_aksiyon_terminleri_takip_edilmemektedir`: Tedarikçi denetimleri veya aksiyon terminleri takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Saha Denetimleri (Supplier Audit) ve Aksiyon Takip Takvimini belirler.

---

### 19. Tedarikçi Raporlama ve KPI

#### [SUP-037] Şirket genelinde Tedarikçi Zamanında Teslimat Oranı (OTD %), Kalite Red Oranı (PPM) ve Genel Tedarikçi Memnuniyet Puanı canlı dashboardlarda izlenmekte midir?
- **Süreç:** Tedarikçi Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Tedarikçi performans gösterge paneli (Supplier KPI Dashboard), OTD ve PPM takibi.
- **Seçenekler:**
  - `canli_tedarikci_performans_kokpiti_yonetim_tarafindan_anlik_izlenir`: Evet; OTD %, PPM hata oranları ve genel tedarikçi skorları canlı panellerde anlık izlenir
  - `aylik_veya_ceyrek_donemlerde_manuel_excel_raporlari_hazirlanir`: Canlı panel yoktur; ay sonlarında satın alma ve kalite verileri Excel'de birleştirilerek sunulur
  - `tedarikci_performans_dashboardu_kullanilmamaktadir`: Düzenli bir tedarikçi performans paneli veya KPI takibi bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Performans Kokpiti ve Canlı KPI Paneli Tasarımını belirler.

#### [SUP-038] Tek kaynaklı (Single Source) malzeme sayısı, kritik tedarikçi bağımlılık oranı ve süresi dolan sertifika sayısı yönetim raporlarında düzenli sunulmakta mıdır?
- **Süreç:** Tedarikçi Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarik zinciri risk KPI'ları (Tek kaynak sayısı, sertifika expiry sayısı, kritik bağımlılık).
- **Seçenekler:**
  - `tedarik_risk_kpilari_tek_kaynak_ve_sertifika_uyarilari_duzenli_raporlanir`: Evet; alternatifsiz parça adedi, yüksek riskli tedarikçiler ve süresi dolacak belgeler yönetim raporundadır
  - `donem_sonlarinda_manuel_olarak_soruldugunda_cikarilir`: Rutin raporlama yoktur; genel müdürlük veya denetim sorduğunda Excel'den manuel çıkartılır
  - `tedarik_risk_kpilari_raporlanmamaktadir`: Tedarik risk KPI'ları veya sertifika geçerlilikleri raporlanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarik Zinciri Risk ve Süreklilik KPI Raporlamasını belirler.

#### [SUP-039] Tedarikçi bazında harcama konsantrasyonu (Spend Analysis — En çok harcama yapılan ilk 10/20 tedarikçi ve kategori payları) sistemden analiz edilebilmekte midir?
- **Süreç:** Tedarikçi Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Satın alma harcama analitiği (Spend Analysis), tedarikçi ciro dağılımı ve pazar gücü.
- **Seçenekler:**
  - `harcama_analizi_kategori_malzeme_ve_tedarikci_bazinda_grafiklerle_incelenir`: Evet; harcamanın hangi tedarikçilerde yoğunlaştığı, kategori ve dönem bazında interaktif analiz edilir
  - `muhasebe_muzanindan_en_cok_odenen_firmalar_manuel_siralanir`: Sistemik analiz yoktur; muhasebe mizanından en büyük cari bakiyeler Excel'e alınıp sıralanır
  - `tedarikci_harcama_analizi_yapilamamaktadir`: Tedarikçi harcama analizi yapılamamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Satın Alma Harcama Analitiği (Spend Analytics Engine) altyapısını belirler.

#### [SUP-040] Geçmiş dönem tedarikçi değerlendirme karne sonuçları ve puan değişim trendleri (Tedarikçi İyileşme / Kötüleşme Analizi) sistemde arşivlenip karşılaştırılabilmekte midir?
- **Süreç:** Tedarikçi Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tedarikçi karne tarihçesi, performans trend analizi ve geriye dönük karşılaştırma.
- **Seçenekler:**
  - `gecmis_karne_puanlari_ve_performans_trendleri_sistemde_yillar_itibariyla_saklanir`: Evet; tedarikçinin son 3-5 yıldaki karne puanları saklanır, iyileşme veya gerileme grafiği çıkarılır
  - `yalnizca_en_son_yapilan_karne_sonucu_tutulur_gecmis_trend_gorulmez`: Yalnızca en son dönemin puanı bilinir; geçmişe dönük trend ve puan değişimi görülemez
  - `karne_tarihcesi_veya_trend_takibi_yapilmamaktadir`: Karne tarihçesi veya performans trend analizi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Performans Tarihçesi ve Trend Analizi Modülünü belirler.

#### [SUP-041] Tedarikçi ana verilerinin güncelliği, iletişim kişileri ve banka teyitlerinin doğruluğu periyodik olarak denetlenmekte midir?
- **Süreç:** Tedarikçi Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Tedarikçi veri tabanı hijyeni, sahte fatura/banka dolandırıcılığı önleme ve teyit süreci.
- **Seçenekler:**
  - `tedarikci_ana_verileri_ve_banka_bilgileri_yillik_periyotlarla_teyit_edilir_ve_guncellenir`: Evet; aktif tedarikçilerin iletişim ve banka bilgileri yılda bir teyit edilir, pasifler arşive alınır
  - `yalnizca_odeme_hatasi_veya_eposta_ulasmadiginda_manuel_guncellenir`: Planlı denetim yoktur; para yanlış yere gidince veya e-posta dönünce fark edilip düzeltilir
  - `tedarikci_veri_hijyeni_denetimi_yapilmamaktadir`: Tedarikçi veri kalitesi veya hijyeni denetimi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** Tedarikçi Veri Tabanı Hijyeni ve Güvenlik Teyit Periyodunu belirler.

#### [SUP-042] ERP/SRM dönüşümü sonrasında hedeflenen Kurumsal Tedarikçi ve Satıcı İlişkileri Yönetimi (SRM) vizyonu ve temel önceliği nedir?
- **Süreç:** Tedarikçi Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), tedarikçi ilişkileri yönetimi (SRM) ve stratejik satın alma hedefleri.
- **Seçenekler:**
  - `onayli_avl_entegre_otomatik_scorecard_ve_risk_yonetimli_tam_srm_altyapisi`: Onaylı tedarikçi listesi (AVL), otomatik karne puanlaması ve tek kaynak riskini yöneten SRM altyapısı
  - `tedarikci_kartlarinin_tekillesmesi_ve_gecerli_belge_takibinin_disipline_edilmesi`: Mükerrer tedarikçi kayıtlarının temizlenmesi ve süresi dolan sertifikaların takibi önceliklidir
  - `tedarikci_performansinin_satinalma_ve_kalite_tarafindan_ortak_gorulebilmesi`: Satın alma ve kalite ekiplerinin aynı tedarikçi performans verisine şeffaf erişebilmesi hedeflenmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/SRM Karar Etkisi:** ERP/SRM Tedarikçi Yönetimi İş Paketi Kapsamı ve Faz Planlamasını belirler.
