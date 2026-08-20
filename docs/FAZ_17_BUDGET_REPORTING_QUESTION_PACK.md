# FAZ-17 — Bütçe ve Raporlama / BUDGET_REPORTING Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.budget_reporting.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `BUDGET_REPORTING` (Bütçe ve Raporlama)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, CFO'lar, Bütçe ve Kontroling Müdürleri, Finans Direktörleri, İş Zekası (BI) Yöneticileri  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP implementasyonu öncesinde bütçe organizasyonu ve takvimi, departman ve masraf merkezi bütçeleri, çok boyutlu gelir/gider bütçelemesi, proje ve duran varlık (CAPEX) yatırım bütçeleri, tahakkuktan nakde dönüşüm (nakit bütçesi köprüsü), operasyonel işlemler sırasında sistemsel bütçe kontrolü ve blokaj kuralları (Hard/Soft Block / Advisory), bütçe versiyonlama (V0 Base, V1, V2), rolling forecast (12-18 aylık dinamik tahmin), bütçe-fiili gerçekleşen karşılaştırması (Budget vs Actual), analitik sapma analizleri (Fiyat-Hacim-Kur-PVM sapması), yönetim raporlama paketleri (Management P&L, Segment Kârlılıkları), kurumsal KPI panelleri, raporlama veri kaynakları ve tek doğruluk kaynağı (Single Source of Truth) güvenilirliği, Excel bağımlılığı ve satır bazlı veri güvenliği (Row-Level Security) süreçlerinin AS-IS durumunu ve ERP gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | BUDGET_REPORTING ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **TREASURY** | Gerçekleşen anlık nakit pozisyonu, banka bakiyeleri, kısa/orta vadeli operasyonel nakit akış tahminleri (Havale, DBS, Çek, Krediler) | **TREASURY operasyonel para hareketini ve anlık likiditeyi sorgular.** BUDGET_REPORTING yıllık hedeflenen nakit bütçesini, gelir/gider bütçesi gerçekleşenlerini, bütçe versiyonlarını ve yönetim sapma analizini sorgular. |
| **ACCOUNTING** | Yasal defteri kebir kayıtları, Tekdüzen Hesap Planı (100..799), KDV beyannameleri, resmi mali tablolar (Mizan, Bilanço, Gelir Tablosu) | **ACCOUNTING yasal defter ve fiş kaydını sorgular.** BUDGET_REPORTING yönetsel gelir tablosu (Management P&L), masraf merkezi bütçe aşım alarmları, rolling forecast ve KPI gerçekleşmelerini sorgular. |
| **SALES** | Müşteri teklifleri, siparişler (SO), fiyatlandırma, sevkiyat onayları ve müşteri risk limiti | **SALES operasyonel satış sürecini sorgular.** BUDGET_REPORTING ürün/müşteri/bölge bazlı satış bütçesini ve bütçe-fiili satış sapma analizini sorgular. |
| **PROCUREMENT** | Tedarikçi araştırması, satın alma talebi (PR), sipariş (PO) onayları ve tedarikçi seçimi | **PROCUREMENT operasyonel satın alma sürecini sorgular.** BUDGET_REPORTING satın alma talebi ve sipariş açılışında bütçe kontrolü (Blokaj / Uyarı) ve departman satın alma bütçelerini sorgular. |
| **INVENTORY** | Stok kartı, sayım, depo bakiye, konsinye stok ve malzeme transferleri | **INVENTORY stok miktarını ve operasyonunu sorgular.** BUDGET_REPORTING stok devir hızı hedefi ve malzeme alım bütçesi sapmalarını sorgular. |
| **LOGISTICS** | Araç yükleme, rota planlama, kargo/nakliye entegrasyonu, irsaliye ve teslimat takibi | **LOGISTICS lojistik operasyonunu sorgular.** BUDGET_REPORTING lojistik navlun bütçesi ve birim taşıma maliyeti sapmasını sorgular. |
| **BUDGET_REPORTING** | Yıllık bütçe, revize bütçe, departman/masraf merkezi bütçesi, yatırım (CAPEX) bütçesi, nakit bütçesi, operasyonel bütçe kontrolü, rolling forecast, bütçe-gerçekleşen, sapma analizi, yönetim raporları, kurumsal KPI'lar, rapor güvenilirliği | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular stratejik hedefleme, yönetim kontrolü, performans ölçümü ve yönetsel karar kalitesi derinliğinde yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Bütçe Organizasyonu** (2 Soru — BGT-001, BGT-002)
2. **Yıllık Bütçe Süreci** (2 Soru — BGT-003, BGT-004)
3. **Departman Bütçeleri** (2 Soru — BGT-005, BGT-006)
4. **Gelir Bütçesi** (3 Soru — BGT-007, BGT-008, BGT-009)
5. **Gider Bütçesi** (3 Soru — BGT-010, BGT-011, BGT-012)
6. **Masraf Merkezi Bütçesi** (2 Soru — BGT-013, BGT-014)
7. **Proje Bütçesi** (2 Soru — BGT-015, BGT-016)
8. **Yatırım / CAPEX Bütçesi** (2 Soru — BGT-017, BGT-018)
9. **Nakit Bütçesi Bağlantısı** (2 Soru — BGT-019, BGT-020)
10. **Bütçe Onay Süreci** (2 Soru — BGT-021, BGT-022)
11. **Bütçe Versiyonları ve Revizyonlar** (2 Soru — BGT-023, BGT-024)
12. **Forecast ve Rolling Forecast** (2 Soru — BGT-025, BGT-026)
13. **Bütçe-Gerçekleşen Analizi** (2 Soru — BGT-027, BGT-028)
14. **Sapma Analizi** (3 Soru — BGT-029, BGT-030, BGT-031)
15. **Yönetim Raporları** (3 Soru — BGT-032, BGT-033, BGT-034)
16. **KPI ve Performans Raporlama** (2 Soru — BGT-035, BGT-036)
17. **Rapor Veri Kaynakları** (2 Soru — BGT-037, BGT-038)
18. **Excel Bağımlılığı** (2 Soru — BGT-039, BGT-040)
19. **Rapor Yetkilendirme ve Dağıtım** (2 Soru — BGT-041, BGT-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Bütçe Organizasyonu

#### [BGT-001] Şirketinizde kurumsal bütçe hazırlama süreci bulunuyor mu ve bütçe yönetimi hangi organizasyonel modelle (Merkezi Finans / Dağıtık Departman Katılımlı / Şirketler Grubu) yürütülmektedir?
- **Süreç:** Bütçe Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Bütçe hazırlama kültürü, sahipliği ve organizasyonel yaklaşım.
- **Seçenekler:**
  - `dagitik_katilimli_merkezi_finans_konsolidasyonlu`: Tüm departmanlar kendi bütçelerini hazırlar; Bütçe/Kontroling departmanı konsolide eder ve koordine eder
  - `merkezi_finans_ekibi_tum_sirket_butcesini_hazirlar`: Departman katılımı sınırlıdır; Bütçe/Mali İşler ekibi geçmiş verilere dayanarak tüm bütçeyi merkezi hazırlar
  - `grup_holding_merkezi_butce_modeli`: Holding/Grup bütçe direktörlüğü tarafından belirlenen şablon ve hedefler doğrultusunda hazırlanır *(Not Alınabilir)*
  - `butce_hazirlanmamaktadir`: Şirketimizde resmi/yazılı bir bütçe süreci işletilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Modülü organizasyonel yapısını, konsolidasyon kurgusunu ve branching dallanmasını belirler.

#### [BGT-002] Bütçe hazırlık takvimi nasıl işletilmektedir (Bütçe başlangıç ayı, bütçe rehberi yayınlanması, departman teslim tarihleri ve yönetim kurulu nihai onay takvimi)?
- **Süreç:** Bütçe Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bütçe döngüsü, başlangıç zamanı ve onay takvimi disiplini.
- **Seçenekler:**
  - `eylul_ekim_baslangicli_resmi_takvim_ve_yil_sonu_yonetim_onayi`: Eylül/Ekim aylarında bütçe rehberi yayınlanır, departmanlar Kasım'da teslim eder ve Aralık'ta Yönetim Kurulu onaylar
  - `aralik_ayinda_hizli_butce_calismasi_yapilir`: Yılın son ayında (Aralık) hızlandırılmış tek seferlik bir bütçe çalışması yapılarak yeni yıla girilir
  - `yil_basladiktan_sonra_ocak_subatta_tamamlanir`: Bütçe takvimi gecikmeli işler; yeni yıl başladıktan sonra Ocak veya Şubat aylarında bütçe tamamlanır *(Not Alınabilir)*
  - `belirli_bir_butce_takvimi_yoktur`: Belirlenmiş resmi bir bütçe takvimi veya teslim disiplini bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Dönemleri (Budget Cycles) ve takvim kısıtlamalarını belirler.

---

### 2. Yıllık Bütçe Süreci

#### [BGT-003] Yıllık bütçe hangi teknolojik ortamda (ERP Entegre Bütçe Modülü, Kurumsal CPM/Bütçe Yazılımı, Excel Şablonları) hazırlanmaktadır?
- **Süreç:** Yıllık Bütçe Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Bütçe hazırlama altyapısı ve araç bağımlılığı.
- **Seçenekler:**
  - `erp_entegre_butce_modulunde_hazirlanir`: Bütçe doğrudan ERP'nin entegre bütçe modülünde kullanıcı girişleri ve onaylarıyla hazırlanır
  - `ozel_kurumsal_cpm_butce_yazilimi_kullanilir`: ERP dışında özel bir Kurumsal Performans Yönetimi (CPM / Bütçe Yazılımı) kullanılır ve ERP ile entegredir
  - `excel_sablonlarinda_hazirlanip_erpye_yuklenir`: Bütçe departmanlardan Excel ile toplanır, konsolide edilip ERP'ye toplu veri olarak yüklenir *(Not Alınabilir)*
  - `tamamen_bagimsiz_excel_dosyalarinda_kalir`: Bütçe tamamen Excel çalışma kitaplarında hazırlanır ve ERP'ye hiçbir zaman aktarılmaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** ERP Bütçe Giriş Ekranları ve Entegrasyon API mimarisini belirler.

#### [BGT-004] Bütçe hazırlama yöntemi ve yaklaşımı (Sıfır Tabanlı Bütçeleme - Zero-Based Budgeting, Geçmiş Yıl Gerçekleşenlerine Artış Oranı, Aktivite Tabanlı Bütçeleme) nasıldır?
- **Süreç:** Yıllık Bütçe Süreci
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `BGT-001 != "butce_hazirlanmamaktadir"`
- **Açıklama:** Bütçe hesaplama metodolojisi ve mantığı.
- **Seçenekler:**
  - `sifir_tabanli_butcele_zbb_tum_giderler_gerekcelendirilir`: Sıfır Tabanlı Bütçeleme (ZBB); her harcama kalemi sıfırdan gerekçelendirilerek bütçelenir
  - `gecmis_yil_gercekleseni_uzerine_enflasyon_artis_orani`: Geçmiş yıl gerçekleşenlerine büyüme ve enflasyon artış oranı eklenerek artış bazlı bütçe yapılır
  - `aktivite_ve_hacim_tabanli_surucu_odakli_butce`: Sürücü Odaklı (Driver-Based); üretim hacmi, çalışan sayısı, sipariş adedi gibi operasyonel sürücülerle hesaplanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Hesaplama Motoru (Budget Calculation Engine / Drivers) kurgusunu belirler.

---

### 3. Departman Bütçeleri

#### [BGT-005] Departman yöneticileri (Satış, Pazarlama, Üretim, İK, IT, Lojistik vb.) kendi operasyonel bütçelerini doğrudan hazırlar ve bütçe sorumlusu olarak takip eder mi?
- **Süreç:** Departman Bütçeleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bütçe sahipliği ve departman bazlı hesap verebilirlik.
- **Seçenekler:**
  - `tum_departman_yoneticileri_kendi_butcesinden_tam_sorumludur`: Evet; tüm departman müdürleri kendi bütçe kalemlerini girer, harcamaları onaylar ve bütçe aşımından sorumludur
  - `sadece_ana_departmanlar_hazirlar_genel_giderler_merkezdedir`: Yalnızca Satış ve Üretim gibi ana birimler hazırlar; destek birimlerin giderleri finans tarafından bütçelenir
  - `departmanlarin_butce_farkindaligi_ve_takibi_yoktur`: Departman yöneticilerinin bütçe hedefi yoktur; bütçe yalnızca finans ve üst yönetim arasında tutulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Departman Bütçe Sahipliği ve Kullanıcı Giriş Yetki Matrisini belirler.

#### [BGT-006] Departmanlar arası bütçe aktarımı (Virement / Bütçe Revirmanı) kuralları ve yetki sınırları nasıl yönetilmektedir?
- **Süreç:** Departman Bütçeleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `BGT-001 != "butce_hazirlanmamaktadir"`
- **Açıklama:** Bütçe kalemleri arası ödenek aktarımı ve esneklik kuralları.
- **Seçenekler:**
  - `katı_kurallar_dahilinde_cfo_genel_mudur_onayi_ile_yapilir`: Kalemler veya departmanlar arası aktarım katı onay akışına bağlıdır (CFO / Genel Müdür onayı zorunludur)
  - `departman_kendi_alt_kalemleri_arasinda_serbestce_aktarabilir`: Departman müdürü toplam bütçesini aşmamak kaydıyla kendi alt gider hesapları arasında aktarım yapabilir
  - `butce_aktarimi_uygulanmaz_asimlarda_ek_butce_istenir`: Kalemler arası aktarım yasaktır; bütçe yetmediğinde resmi ek bütçe talebi oluşturulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Revirmanı (Budget Transfer / Virement Workflow) kurallarını belirler.

---

### 4. Gelir Bütçesi

#### [BGT-007] Satış ve Gelir Bütçesi hangi analitik boyutlarda (Müşteri/Bayi, Ürün/Ürün Grubu, Satış Kanalı, Bölge/Ülke, Para Birimi) ve hangi detayda hazırlanmaktadır?
- **Süreç:** Gelir Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Gelir bütçesinin detay seviyesi ve çok boyutlu kırılımları.
- **Seçenekler:**
  - `cok_boyutlu_musteri_urun_kanal_bolge_ve_doviz_bazli`: Müşteri/bayi, ürün grubu, satış kanalı (B2B, B2C, İhracat), bölge ve para birimi bazında çok boyutlu hazırlanır
  - `urun_grubu_ve_kanal_bazinda_toplu_hazirlanir`: Müşteri detayı olmadan yalnızca ürün grubu ve ana satış kanalları bazında bütçelenir
  - `sadece_sirket_toplam_ciro_hedefi_olarak_belirlenir`: Detaylı boyut kırılımı yoktur; yalnızca şirketin yıllık toplam ciro büyüme hedefi belirlenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satış Bütçesi Veri Modeli ve çok boyutlu analitik küp yapısını belirler.

#### [BGT-008] Gelir bütçesinde fiyat artışları, kur beklentileri, kampanya iskontoları ve hacim/miktar hedefleri nasıl modellenmektedir?
- **Süreç:** Gelir Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Fiyat x Miktar ayrımı ve kur varsayımları.
- **Seçenekler:**
  - `fiyat_ve_miktar_ayri_modellenir_kur_ve_iskonto_senaryolari_calisilir`: Satış miktarı ve birim fiyat ayrı bütçelenir; döviz kurları ve kampanya iskontoları parametrik simüle edilir
  - `sadece_tutar_bazli_tahmin_yapilir_fiyat_miktar_ayrismaz`: Miktar ve birim fiyat ayrımı yapılmaz; doğrudan hedeflenen TL/Döviz ciro tutarı girilir
  - `gecmis_ciroya_toptan_fiyat_artisi_uygulanir`: Geçmiş yılın cirosuna genel bir fiyat artış yüzdesi uygulanarak basit tahmin yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gelir Tahminleme Parametreleri ve Senaryo Yönetimini belirler.

#### [BGT-009] Satış bütçesinde satış kotaları, prim/komisyon hedefleri ve müşteri iskonto bütçeleri nasıl ilişkilendirilmektedir?
- **Süreç:** Gelir Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Satış personeli kotaları ve iskonto bütçesi kontrolü.
- **Seçenekler:**
  - `satis_kotalari_ve_primler_butce_hedefleriyle_birebir_baglidir`: Plasiyer satış kotaları ve iskonto yetki bütçeleri ana satış bütçesiyle sistem üzerinden tam entegredir
  - `kotalar_ayri_excel_tablolarinda_yonetilir_butceye_manuel_baglanir`: Satış kotaları ve prim hesaplamaları satış yöneticisinin Excel tablolarında bağımsız yürütülür *(Not Alınabilir)*
  - `bireysel_kota_ve_iskonto_butcesi_uygulanmaz`: Bireysel satış kotası veya iskonto bütçe sınırı uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Satış Kotaları ve İskonto Bütçe Entegrasyonunu belirler.

---

### 5. Gider Bütçesi

#### [BGT-010] Operasyonel Gider (OPEX) bütçesinde sabit giderler (Kira, Sigorta, Bakım vb.) ile değişken giderler nasıl ayrıştırılmakta ve bütçelenmektedir?
- **Süreç:** Gider Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Gider yapısı, sabit/değişken maliyet ayrımı ve bütçeleme kuralları.
- **Seçenekler:**
  - `sabit_ve_degisken_giderler_ayri_hesap_ve_davranis_modelleriyle_butcelenir`: Sabit giderler sözleşmelere göre, değişken giderler üretim/satış hacmine endeksli dinamik kurallarla bütçelenir
  - `tum_giderler_tekduzen_hesap_kodlari_bazinda_aylik_girilir`: Sabit/değişken ayrımı olmadan tüm giderler muhasebe hesap kodu (770/760/740) bazında aylık tutar olarak bütçelenir
  - `giderler_departman_bazli_toplu_tavan_rakam_olarak_belirlenir`: Detaylı hesap bazında değil; her departmana yıllık harcayabileceği toplu bir masraf tavanı verilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gider Bütçesi Hesap Planı ve Sabit/Değişken Maliyet Davranış Matrisini belirler.

#### [BGT-011] Personel ve Bordro bütçesi (Mevcut kadro, planlanan yeni işe alımlar, ücret artış zam oranları, SGK/Vergi yükleri, prim ve yan haklar) nasıl bütçelenmektedir?
- **Süreç:** Gider Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** İnsan kaynakları bütçesi, kadro planlaması ve işgücü maliyet modellemesi.
- **Seçenekler:**
  - `kisi_ve_pozisyon_bazli_kadro_plani_zam_ve_yan_haklarla_detayli_modellenir`: Pozisyon bazında mevcut çalışanlar, zam oranları, yeni işe alım ayları, SGK tavanı ve yan haklar tam detaylı hesaplanır
  - `departman_toplam_bordro_giderine_toplu_artis_yuzdesi_uygulanir`: Kişi bazlı değil; departman bazında toplam bordro maliyetine tahmini zam ve yeni personel payı eklenir
  - `ik_tarafindan_excelde_kabataslak_tahmin_edilir`: İnsan kaynakları ekibi tarafından Excel'de yaklaşık toplam personel maliyeti tahmin edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** İK & Bordro Bütçe Simülasyon Modülü gereksinimini belirler.

#### [BGT-012] Pazarlama, reklam, seyahat ve temsil-ağırlama gider bütçelerinin kampanya ve departman bazında sınırlandırılması nasıl yürütülmektedir?
- **Süreç:** Gider Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Özel gider kalemlerinde bütçe tavanı ve kampanya maliyeti takibi.
- **Seçenekler:**
  - `kampanya_ve_etkinlik_kodlari_uzerinden_butce_asimi_anlik_izlenir`: Her pazarlama kampanyası veya etkinlik için ayrı bütçe kodu açılır ve harcamalar anlık bütçeden düşülür
  - `departman_aylik_masraf_limitiyle_manuel_takip_edilir`: Aylık departman temsil/seyahat limitleri vardır; harcamalar Excel'de takip edilir
  - `pazarlama_ve_seyahat_giderlerinde_onceden_butce_tahsis_edilmez`: Önceden sınır tahsis edilmez; harcama yapıldıkça yönetim onayına sunulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Pazarlama Kampanyası & Harcama Bütçe Kontrolü mimarisini belirler.

---

### 6. Masraf Merkezi Bütçesi

#### [BGT-013] Bütçe planlaması Masraf Merkezleri (Cost Centers) ve Kâr Merkezleri (Profit Centers) bazında detaylandırılmakta mıdır?
- **Süreç:** Masraf Merkezi Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bütçenin sorumluluk merkezleri ve organizasyonel birimler bazında dağılımı.
- **Seçenekler:**
  - `tum_gelir_ve_giderler_masraf_ve_kar_merkezleri_bazinda_butcelenir`: Evet; tüm gelirler kâr merkezleri, tüm giderler ise hiyerarşik masraf merkezleri bazında planlanır
  - `sadece_ana_departmanlar_masraf_merkezi_olarak_tanimlidir`: Yalnızca ana departman düzeyinde masraf merkezi ayrımı vardır, alt detay merkezler kullanılmaz
  - `masraf_merkezi_yapisi_kullanilmaz_sadece_hesap_plani_vardir`: Masraf merkezi bazlı bütçeleme yoktur; bütçe yalnızca Tekdüzen Hesap Planı kodları üzerinden yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Masraf/Kâr Merkezi Hiyerarşisi ve Kontroling (CO-OM) bütçe veri modelini belirler.

#### [BGT-014] Ortak genel giderlerin (Merkez yönetim, bina/güvenlik, IT altyapı vb.) kâr merkezlerine veya üretim hatlarına dağıtım anahtarları bütçede nasıl kurgulanmaktadır?
- **Süreç:** Masraf Merkezi Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** İkincil maliyet dağıtımları ve genel gider dağıtım anahtarları (Allocation Keys).
- **Seçenekler:**
  - `dinamik_dagitim_anahtarlari_metrekare_calisan_ciro_ile_sistemde_hesaplanir`: Metrekare, çalışan sayısı, makine saati veya ciro oranına göre sistem otomatik ikincil bütçe dağıtımı yapar
  - `sabit_yuzdelerle_excel_tablolarinda_dagitilir`: Yıl başında belirlenen sabit yüzdelerle Excel üzerinde kâr merkezlerine dağıtım yapılır *(Not Alınabilir)*
  - `ortak_giderler_dagitilmaz_merkez_gideri_olarak_kalir`: Ortak giderler kâr merkezlerine dağıtılmaz; doğrudan şirket genel gideri olarak bilançoda/gelir tablosunda kalır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Maliyet Dağıtım Kuralları (Cost Allocation Cycles) motorunu belirler.

---

### 7. Proje Bütçesi

#### [BGT-015] Şirketinizde proje bazlı işler, Ar-Ge projeleri, danışmanlık veya pazarlama kampanyaları için bağımsız Proje Bütçeleri (WBS / İş Kırılımı) oluşturuluyor mu?
- **Süreç:** Proje Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Dönemsel bütçeden bağımsız proje yaşam döngüsü bütçelemesi.
- **Seçenekler:**
  - `her_proje_icin_wbs_kirilimli_bagimsiz_proje_butcesi_acilir`: Evet; her proje için İş Kırılım Yapısı (WBS) tanımlanır, gelir ve giderleri çok yıllı proje bütçesinde takip edilir
  - `projeler_departman_butcesi_icinde_alt_kalem_olarak_tutulur`: Ayrı bir proje bütçe yapısı yoktur; harcamalar ilgili departmanın yıllık bütçesi içinden karşılanır
  - `proje_bazli_butce_kullanilmamaktadir`: Şirketimizde proje bazlı iş veya proje bütçelemesi kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Proje Sistemi (PS / Project Systems) Bütçe Modülü gereksinimini ve branching dallanmasını belirler.

#### [BGT-016] Proje bütçelerinin gerçekleşen maliyet takibi, taahhüt (Commitment) kontrolü ve proje kârlılık sapmaları nasıl izlenmektedir?
- **Süreç:** Proje Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `BGT-015 != "proje_bazli_butce_kullanilmamaktadir"`
- **Açıklama:** Proje maliyet aşımları, açık sipariş taahhütleri ve proje kârlılık kontrolü.
- **Seçenekler:**
  - `erp_proje_modulunde_fiili_maliyet_ve_acik_siparis_taahhutleri_anlik_izlenir`: Faturalaşan fiili maliyetler ve verilen sipariş taahhütleri proje bütçesinden anlık düşülerek kârlılık izlenir
  - `proje_maliyetleri_excel_tablolarinda_manuel_takip_edilir`: Muhasebeden proje kodlu masraflar çekilip Excel tablosunda bütçeyle manuel karşılaştırılır *(Not Alınabilir)*
  - `proje_butce_asimlari_takip_edilememektedir`: Proje bütçe aşımları veya taahhütler sistem üzerinden düzenli olarak takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Proje Taahhüt Yönetimi (Project Commitment Tracking) konfigürasyonunu belirler.

---

### 8. Yatırım / CAPEX Bütçesi

#### [BGT-017] Makine, bina, tesis, taşıt, yazılım/lisans gibi Duran Varlık Yatırımları (CAPEX Bütçesi) operasyonel giderlerden ayrı olarak bütçelenip takip ediliyor mu?
- **Süreç:** Yatırım / CAPEX Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sermaye harcamaları bütçesi ve duran varlık yatırımlarının yönetimi.
- **Seçenekler:**
  - `ayri_capex_yatirim_butcesi_tanimlidir_proje_bazli_izlenir`: Evet; tüm duran varlık yatırımları için ayrı CAPEX bütçesi açılır ve amortisman/nakit etkisi modellenir
  - `yatirimlar_genel_butce_icinde_tek_satir_olarak_yer_alir`: Ayrı detaylı yatırım bütçesi yoktur; yıllık genel bütçede toplu bir yatırım payı ayrılır
  - `capex_yatirim_butcesi_tutulmamaktadir`: Şirketimizde düzenli bir CAPEX veya yatırım bütçelemesi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yatırım Yönetimi Modülü (Investment Management / CAPEX) gereksinimini belirler.

#### [BGT-018] Yatırım harcaması onaylarında bütçe kontrolü (Yatırım Onay Formu / AFEs / Bütçe Aşılamazlık Kuralı) ve yatırım geri dönüş (ROI/NPV) analizi nasıl yapılmaktadır?
- **Süreç:** Yatırım / CAPEX Bütçesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `BGT-017 != "capex_yatirim_butcesi_tutulmamaktadir"`
- **Açıklama:** Yatırım harcama onay süreci ve finansal fizibilite kontrolü.
- **Seçenekler:**
  - `resmi_afe_onay_formu_ve_roi_hesabi_ile_butceden_tahsis_edilir`: Sistem üzerinden Yatırım Harcama Onayı (AFE) açılır; ROI/Geri dönüş fizibilitesi onaylanmadan sipariş açılamaz
  - `yonetim_kurulu_veya_genel_mudur_imzasiyla_manuel_onaylanir`: Bütçe aşımı veya harcama fizibilitesi Yönetim Kurulu / Genel Müdür yazılı onayı ile manuel işletilir *(Not Alınabilir)*
  - `yatirim_harcamalarinda_onceden_fizibilite_ve_butce_kontrolu_yapilmaz`: İhtiyaç doğdukça yönetim sözlü kararıyla yatırım satın alması gerçekleştirilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yatırım Harcama Onay Akışı (AFE Workflow) mimarisini belirler.

---

### 9. Nakit Bütçesi Bağlantısı

#### [BGT-019] Gelir, gider ve yatırım bütçelerinden türetilen dinamik bir Yıllık/Çeyreklik Nakit Bütçesi (Tahakkuktan Nakde Dönüşüm) hazırlanıyor mu?
- **Süreç:** Nakit Bütçesi Bağlantısı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Tahakkuk esaslı gelir/gider bütçesinin tahsilat ve ödeme vadelerine göre nakit bütçesine çevrilmesi.
- **Seçenekler:**
  - `erp_tahakkuk_butcesini_vadelere_gore_otomatik_nakit_butcesine_cevirir`: Evet; ERP bütçe modülü satış ve alım vadelerini dikkate alarak bütçelenmiş nakit giriş/çıkış tablosunu otomatik üretir
  - `finans_ekibi_excelde_ayri_bir_yillik_nakit_butcesi_modeller`: Evet; gelir ve gider bütçeleri baz alınarak finans ekibi tarafından Excel üzerinde yıllık nakit bütçesi hazırlanır *(Not Alınabilir)*
  - `nakit_butcesi_hazirlanmamaktadir`: Nakit bütçesi hazırlanmaz; bütçe yalnızca tahakkuk esaslı gelir tablosu olarak takip edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçelenmiş Nakit Akım Tablosu (Budgeted Cash Flow Statement) üretim motorunu belirler.

#### [BGT-020] Nakit bütçesi ile Hazine (Treasury) operasyonel nakit akış tahminleri arasındaki mutabakat ve köprü (Reconciliation) nasıl kurulmaktadır?
- **Süreç:** Nakit Bütçesi Bağlantısı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Stratejik nakit bütçesi hedefleri ile hazine günlük/haftalık fiili nakit akışının uyumlaştırılması.
- **Seçenekler:**
  - `butce_nakit_hedefi_ile_hazine_fiili_nakit_akisi_sistemde_karsilastirilir`: Hazine fiili nakit akış gerçekleşmeleri ile bütçelenen nakit akış hedefleri aylık olarak sistemde karşılaştırılır
  - `hazine_ve_butce_ekipleri_ay_sonu_excelde_mutabakat_yapar`: Hazine uzmanı ile bütçe uzmanı ay sonlarında Excel tablolarını birleştirerek farkları analiz eder *(Not Alınabilir)*
  - `hazine_ile_butce_arasinda_herhangi_bir_kopru_veya_karsilastirma_yoktur`: Hazine operasyonu ve bütçe planlaması tamamen birbirinden kopuk yürütülmektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Hazine ile Bütçe/Kontroling Entegrasyon Seviyesini belirler.

---

### 10. Bütçe Onay Süreci

#### [BGT-021] Hazırlanan bütçelerin onay hiyerarşisi (Departman Müdürü -> Bütçe/Kontroling Müdürü -> CFO -> Genel Müdür/Yönetim Kurulu) nasıl işletilmektedir?
- **Süreç:** Bütçe Onay Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Bütçe onay iş akışı, konsolidasyon adımları ve yönetim onay zinciri.
- **Seçenekler:**
  - `erp_uzerinde_hiyerarsik_dijital_onay_ve_kilit_mekanizmasi_vardir`: Bütçe girişi tamamlandığında ERP üzerinden onay akışına girer; onaylanan bütçe revizyona karşı sistemce kilitlenir
  - `excel_dosyalari_eposta_ve_toplanti_notuyla_yonetime_onaylatilir`: Bütçe sunumu toplantıda yapılır; Yönetim Kurulu/Genel Müdür onayı e-posta veya ıslak imzalı tutanakla alınır *(Not Alınabilir)*
  - `resmi_bir_butce_onay_hiyerarsisi_yoktur`: Resmi bir onay akışı yoktur; bütçe finans müdürü tarafından hazırlanıp doğrudan uygulamaya alınır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Onay ve Kilitleme İş Akışı (Budget Approval & Lock Workflow) tasarımını belirler.

#### [BGT-022] Günlük operasyonel işlemlerde (Satın Alma Talebi, Sipariş Açma, Masraf Girişi) sistemsel Bütçe Kontrolü ve Blokaj (Advisory / Warning / Soft Block / Hard Block) uygulanmakta mıdır?
- **Süreç:** Bütçe Onay Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** İşlem anında bütçe uygunluk kontrolü (Budget Availability Control).
- **Seçenekler:**
  - `hard_block_butce_asildiginda_sistem_islemi_kesinlikle_engeller`: Sert Blokaj (Hard Block); bütçesi yetersiz olan satın alma talebi veya sipariş sistem tarafından kesinlikle durdurulur
  - `soft_block_ek_onay_veya_cfo_onayi_ile_asima_izin_verilir`: Yumuşak Blokaj (Soft Block); bütçe aşıldığında ek onay akışı (CFO / Genel Müdür onayı) tetiklenerek devam edilebilir
  - `uyari_verir_ancak_islemi_engellemez_advisory`: Uyarıcı (Warning); kullanıcıya bütçenin aşıldığı uyarısını gösterir fakat işleme engel olmaz
  - `islem_aninda_kontrol_yoktur_yalnizca_ay_sonu_raporlanir`: Operasyon anında bütçe kontrolü yoktur; aşımlar yalnızca ay sonu gerçekleşen raporlarında fark edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Uygunluk Kontrolü (Active Budget Availability Control - BAC) motorunu belirler.

---

### 11. Bütçe Versiyonları ve Revizyonlar

#### [BGT-023] Bütçe versiyonlama yapısı (İlk Onaylı Bütçe - Version 0 / Base Budget, Revize Bütçeler - V1, V2, Simülasyon Senaryoları) nasıl yönetilmektedir?
- **Süreç:** Bütçe Versiyonları ve Revizyonlar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bütçe ana tabanı, revizyon versiyonları ve senaryo saklama.
- **Seçenekler:**
  - `erpde_v0_baz_butce_sabit_kalir_v1_v2_versiyonlari_ayri_saklanir`: İlk onaylanan V0 baz bütçe asla ezilmez; yapılan revizyonlar V1, V2 ve simülasyon senaryosu olarak ayrı saklanır
  - `revizyon_yapildiginda_eski_butcenin_uzerine_yazilir`: Yeni bütçe onaylandığında eski bütçe verisi ezilir veya arşivlenmeden güncellenir *(Not Alınabilir)*
  - `versiyonlar_farkli_excel_dosya_isimleriyle_arsivlenir`: ERP'de versiyonlama yoktur; her revizyon farklı Excel dosya adıyla (örn. Butce_2026_Revize_V2.xlsx) saklanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Versiyonlama ve Arşivleme Mimarisi tasarımını belirler.

#### [BGT-024] Bütçe revizyonları hangi periyotta (Yılda 1 kez 6+6, Çeyreklik 3+9 / 9+3, Olağanüstü Ekonomik Dalgalanmalarda) ve hangi onay akışıyla yapılmaktadır?
- **Süreç:** Bütçe Versiyonları ve Revizyonlar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Revizyon sıklığı, tetikleyici şartlar ve revizyon onay disiplini.
- **Seçenekler:**
  - `ceyrek_donemlerde_duzenli_3_9_6_6_9_3_revizyonu_yapilir`: Her çeyrek dönem sonunda (3+9, 6+6, 9+3) gerçekleşen verilerle güncellenerek düzenli revize edilir
  - `yilda_yalnizca_bir_kez_yil_ortasinda_6_6_revize_edilir`: Yılda sadece bir kez, 6. ayın (Haziran) sonunda yılın ikinci yarısı için revize bütçe hazırlanır
  - `sadece_asiri_kur_enflasyon_veya_kriz_anlarinda_revize_edilir`: Düzenli revizyon yapılmaz; olağanüstü kur, enflasyon veya pazar dalgalanması olduğunda revize edilir *(Not Alınabilir)*
  - `yil_icinde_hic_revizyon_yapilmaz`: Yıl içinde bütçe revizyonu yapılmaz; yıl sonuna kadar ilk onaylanan bütçe hedefi takip edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Revizyon Periyotları ve onay prosedürlerini belirler.

---

### 12. Forecast ve Rolling Forecast

#### [BGT-025] Yıl içinde gerçekleşen aylar ile kalan ayların beklentilerini birleştiren Dinamik Tahmin (Forecast / Rolling Forecast) çalışması yapılıyor mu?
- **Süreç:** Forecast ve Rolling Forecast
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Statik bütçeden dinamik tahminleme modeline geçiş düzeyi.
- **Seçenekler:**
  - `aylik_veya_ceyrek_bazli_surekli_rolling_forecast_yapilir`: Evet; gerçekleşen aylar kilitlenip kalan aylar için sürekli dinamik Rolling Forecast güncellenir
  - `sadece_yil_sonu_kapanis_tahmini_year_end_forecast_yapilir`: Sürekli rolling yapılmaz; yalnızca yıl sonunun nasıl kapanacağını görmek için yıl ortasında tahmin yapılır
  - `forecast_calismasi_yapilmamaktadir`: Hayır; yıl içinde dinamik forecast yapılmaz, yalnızca statik bütçe ile çalışılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Rolling Forecast Modülü ve dinamik tahminleme motorunu belirler.

#### [BGT-026] Rolling Forecast ufku (12-18 Aylık Dinamik Bütçe), tahmin sıklığı (Aylık/Çeyreklik) ve tahmin doğruluk oranı (Forecast Accuracy) nasıl ölçülmektedir?
- **Süreç:** Forecast ve Rolling Forecast
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `BGT-025 != "forecast_calismasi_yapilmamaktadir"`
- **Açıklama:** Tahmin ufku, güncelleme periyodu ve tahmin sapma performansı.
- **Seçenekler:**
  - `12_18_aylik_surekli_ufuk_ve_tahmin_dogruluk_kpi_olculur`: Daima önümüzdeki 12-18 ayı görecek şekilde güncellenir ve departman bazlı tahmin doğruluğu (Accuracy KPI) ölçülür
  - `icinde_bulunulan_mali_yil_sonuna_kadar_olan_donem_tahmin_edilir`: Ufuk bir sonraki yıla taşmaz; sadece içinde bulunulan takvim yılı sonuna kadar olan aylar güncellenir
  - `tahmin_dogruluk_orani_olculmemektedir`: Forecast yapılır ancak tahminin ne kadar isabetli olduğu geriye dönük ölçülmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Tahmin Ufku Parametreleri (Forecast Horizon) ve Tahmin Doğruluk Metriklerini belirler.

---

### 13. Bütçe-Gerçekleşen Analizi

#### [BGT-027] Bütçe ile fiili gerçekleşenlerin karşılaştırması (Budget vs Actual) hangi sıklıkla ve hangi araçla hazırlanmaktadır?
- **Süreç:** Bütçe-Gerçekleşen Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Gerçekleşen verilerin bütçeyle kıyaslanma periyodu ve otomasyon seviyesi.
- **Seçenekler:**
  - `erp_veya_bi_uzerinden_anlik_ve_otomatik_raporlanir`: Muhasebe kayıtları oluştukça ERP veya BI sistemi üzerinden bütçe-gerçekleşen anlık ve otomatik izlenir
  - `ay_kapanisindan_sonra_excel_raporu_olarak_hazirlanir`: Aylık mali kapanış tamamlandıktan sonra finans ekibi tarafından Excel'de karşılaştırmalı tablo üretilir *(Not Alınabilir)*
  - `ceyrek_donemlerde_veya_duzensiz_araliklarla_bakilir`: Aylık düzenli karşılaştırma yapılmaz; 3 aylık dönemlerde veya talep edildikçe hazırlanır *(Not Alınabilir)*
  - `duzenli_butce_gerceklesen_karsilastirmasi_yapilmaz`: Şirketimizde bütçe ile fiili gerçekleşenlerin düzenli bir karşılaştırması yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe vs Fiili Karşılaştırma Raporlama Motorunu belirler.

#### [BGT-028] Muhasebe fiili kayıtları (Defteri Kebir / THP 7'li hesaplar) ile bütçe kalemleri arasındaki hesap tayin ve eşleştirme matrisi (Mapping) ERP'de nasıl kurgulanmıştır?
- **Süreç:** Bütçe-Gerçekleşen Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Muhasebe hesap planı ile bütçe satırları arasındaki eşleştirme mantığı.
- **Seçenekler:**
  - `tam_birebir_veya_n_1_otomatik_hesap_tayini_matrisi_tanimlidir`: Tüm muhasebe hesapları bütçe kalemlerine kurallarla bağlanmıştır; her yevmiye kaydı anında ilgili bütçe satırına işlenir
  - `excel_vlookup_ile_manuel_eslestirme_yapilir`: Sistemde otomatik eşleştirme yoktur; muhasebe mizanı çekilip Excel'de formüllerle bütçe satırlarına dağıtılır *(Not Alınabilir)*
  - `muhasebe_hesaplari_ile_butce_kalemleri_uyumsuzdur`: Muhasebe hesap planı ile bütçe kalemleri farklı dillerde kurgulandığı için eşleştirme zor ve zahmetlidir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Hesap Tayini (Account Determination / Mapping Matrix) altyapısını belirler.

---

### 14. Sapma Analizi

#### [BGT-029] Bütçe sapmaları (Fiyat Farkı Sapması, Hacim/Miktar Sapması, Kur Sapması, Verimsizlik Sapması) analitik olarak ayrıştırılabilmekte midir?
- **Süreç:** Sapma Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sapmanın kök neden analizi ve etken faktörlere ayrıştırılması.
- **Seçenekler:**
  - `fiyat_hacim_kur_ve_miktor_sapmalari_analitik_ayristirilir`: Sapmanın ne kadarının döviz kurundan, ne kadarının fiyat artışından, ne kadarının miktar/hacimden kaynaklandığı ayrıştırılır
  - `sadece_tutar_bazinda_artis_azalis_farki_gorulebilir`: Kök neden ayrıştırılmaz; yalnızca bütçelenen tutar ile gerçekleşen tutar arasındaki net TL/Döviz farkı raporlanır
  - `sapma_analizi_yapilamaz_detay_gorulemez`: Sapma analizi yapılamamaktadır; farkların nedeni finans ekibi tarafından tek tek araştırılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Gelişmiş Sapma Analiz Motoru (Variance Analysis Engine) tasarımını belirler.

#### [BGT-030] Belirli bir yüzdeyi (örn. %10) veya tutarı aşan olumsuz bütçe sapmalarında departmanlardan Bütçe Sapma Gerekçe Raporu ve Düzeltici Aksiyon Planı istenmekte midir?
- **Süreç:** Sapma Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Bütçe disiplini, sapma hesap verebilirliği ve aksiyon takibi.
- **Seçenekler:**
  - `esik_asildiginda_sistem_gerekce_ve_aksiyon_girisini_zorunlu_tutar`: Belirlenen tolerans eşiği aşıldığında sistem ilgili departman müdüründen yazılı gerekçe ve aksiyon planı talep eder
  - `aylik_kontroling_toplantisinda_sozlu_veya_sunumla_aciklanir`: Sistemsel zorunluluk yoktur; aylık yönetim toplantısında departman müdürü sapmayı sözlü/sunumla açıklar
  - `sapma_gerekcesi_ve_aksiyon_raporu_istenmemektedir`: Bütçe aşımlarında departmanlardan herhangi bir resmi gerekçe veya düzeltici plan talep edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Bütçe Sapma Gerekçelendirme ve Aksiyon Takip İş Akışını belirler.

#### [BGT-031] Ürün, müşteri ve kanal bazında marj ve kârlılık sapma analizi (Price-Volume-Mix PVM analizi) yapılabilmekte midir?
- **Süreç:** Sapma Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Fiyat-Hacim-Ürün Karışımı (PVM) analizi ile brüt kâr sapması tespiti.
- **Seçenekler:**
  - `pvm_analizi_otomatik_yapilir_marj_sapmasi_aninda_gorulur`: Evet; sistem kârlılık sapmasını Fiyat Etkisi, Hacim Etkisi ve Ürün Karışımı (Mix) bazında otomatik ayrıştırır
  - `excelde_donemsel_olarak_manuel_hesaplanir`: Sistemde otomatik PVM yoktur; finans uzmanları çeyreklik dönemlerde Excel üzerinden hesaplar *(Not Alınabilir)*
  - `pvm_ve_marj_sapma_analizi_yapilamamaktadir`: Kârlılık sapmasının hangi üründen veya fiyattan kaynaklandığı analitik olarak hesaplanamamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Fiyat-Hacim-Ürün Karışımı (PVM Analytics) kurgusunu belirler.

---

### 15. Yönetim Raporları

#### [BGT-032] Üst Yönetim ve İcra Kurulu için hazırlanan Aylık Yönetim Raporlama Paketi (Management Reporting Pack / P&L, Bilanço, Nakit Akım, Segment Kârlılıkları) neleri içerir ve nasıl hazırlanır?
- **Süreç:** Yönetim Raporları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Yönetim raporlama paketi kapsamı, formatı ve üretim yöntemi.
- **Seçenekler:**
  - `tam_kapsamli_yonetsel_gelir_tablosu_nakit_akim_ve_karlilik_paketi`: Yönetsel Gelir Tablosu, Bilanço, Nakit Akım, Segment Kârlılıkları ve KPI özetlerini içeren standart paket sunulur
  - `yalnizca_satis_ve_brut_kar_ozeti_sunulur`: Tam yönetim paketi yoktur; sadece satış cirosu, tahsilat durumu ve brüt kâr rakamları raporlanır
  - `resmi_mizan_ve_gelir_tablosu_ozeti_verilir`: Yönetsel özel raporlama yoktur; muhasebenin ürettiği yasal mizan ve gelir tablosu yönetime iletilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yönetim Raporlama Paketi Şablonları (Executive Reporting Suite) tasarımını belirler.

#### [BGT-033] Aylık yönetim raporlama paketinin hazırlanıp sunulması ay kapanışından (Mali Kapanış) sonra kaç iş günü sürmektedir?
- **Süreç:** Yönetim Raporları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Raporlama çevikliği, veri tazeliği ve rapor teslim hızı.
- **Seçenekler:**
  - `hizli_kapanis_1_3_is_gunu_icinde_hazirdir`: Hızlı Kapanış (Fast Close); ay sonundan sonraki 1-3 iş günü içinde tüm yönetim raporları hazırdır
  - `standart_sure_4_7_is_gunu_icinde_tamamlanir`: Standart süre; ay sonunu takip eden 4-7 iş günü içinde raporlar hazırlanıp yönetime sunulur
  - `uzun_sure_8_15_is_gunu_veya_daha_gec_surmektedir`: Uzun süre; verilerin toparlanması ve raporun çıkması ayın 15'ini veya daha geç bir tarihi bulmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Hızlı Mali Kapanış ve Raporlama Otomasyonu (Fast Close Engine) ihtiyacını belirler.

#### [BGT-034] Yönetim kurulu ve icra kurulu için interaktif görsel gösterge panelleri (Executive Dashboards) ve mobil raporlama kullanılıyor mu?
- **Süreç:** Yönetim Raporları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Görsel yönetici kokpitleri, mobil erişim ve grafiksel KPI sunumu.
- **Seçenekler:**
  - `interaktif_bi_ve_mobil_yonetici_kokpiti_aktif_kullanilir`: Evet; Yönetim Kurulu ve yöneticiler BI/ERP mobil kokpitleri üzerinden anlık interaktif grafikleri takip eder
  - `statik_pdf_veya_powerpoint_sunumu_olarak_dagitilir`: İnteraktif ekran yoktur; raporlar statik PDF veya PowerPoint sunumu formatında hazırlanıp e-posta ile iletilir
  - `sadece_basili_veya_excel_rapor_kullanilir`: Görsel gösterge paneli yoktur; sadece yazdırılmış kağıt veya Excel tabloları incelenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Yönetici Görsel Dashboard (Executive Analytics) mimarisini belirler.

---

### 16. KPI ve Performans Raporlama

#### [BGT-035] Şirket genelinde ve departmanlar bazında takip edilen Kurumsal KPI ve Performans Göstergeleri (EBITDA Marjı, Brüt Kâr Marjı, ROIC, Kapasite Kullanım, OEE vb.) tanımlı mıdır?
- **Süreç:** KPI ve Performans Raporlama
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kurumsal performans göstergeleri ve hedef takibi.
- **Seçenekler:**
  - `kurumsal_ve_departman_bazli_kpi_sozlugu_tam_tanimlidir`: Evet; şirket genelinde ve her departmanda formülleri, hedefleri ve sahipleri net belirlenmiş KPI sözlüğü vardır
  - `sadece_temel_finansal_ve_satis_kpilari_takip_edilir`: Yalnızca ciro, brüt kâr, EBITDA ve tahsilat süresi gibi temel finansal göstergeler takip edilir
  - `kurumsal_kpi_takibi_yapilmamaktadir`: Şirketimizde standartlaştırılmış bir KPI ve performans göstergesi takip sistemi bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kurumsal KPI Sözlüğü ve Hedef Takip Altyapısı (KPI Framework) kapsamını belirler.

#### [BGT-036] KPI hedefleri, gerçekleşen değerleri, hesaplama formülleri ve KPI sorumluları bir Performans Kokpiti / Dashboard üzerinden görsel olarak izlenmekte midir?
- **Süreç:** KPI ve Performans Raporlama
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `BGT-035 != "kurumsal_kpi_takibi_yapilmamaktadir"`
- **Açıklama:** KPI panelleri, sapma alarmları ve hedef-gerçekleşen görünürlüğü.
- **Seçenekler:**
  - `sistem_uzerinde_kpi_kokpiti_hedef_sapma_alarmlariyla_izlenir`: Sistem üzerinden hedef/gerçekleşen grafikleri, trafik ışığı alarmları (Kırmızı/Sarı/Yeşil) ile anlık izlenir
  - `ay_sonlarinda_excel_kpi_tablosunda_manuel_hesaplanir`: Sistemsel kokpit yoktur; KPI gerçekleşmeleri ay sonunda Excel tablosunda manuel hesaplanıp doldurulur *(Not Alınabilir)*
  - `kpi_sonuclari_gorsellestirilmemektedir`: KPI sonuçları görselleştirilmez, yalnızca ham liste olarak raporlanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** KPI Görselleştirme ve Eşik Alarmları (Threshold Alerting) gereksinimini belirler.

---

### 17. Rapor Veri Kaynakları

#### [BGT-037] Yönetim raporlarının üretildiği veri kaynakları (ERP Tek Doğruluk Kaynağı / Kurumsal Veri Ambarı DWH / İş Zekası BI / Bağımsız Excel Tabloları) nasıldır?
- **Süreç:** Rapor Veri Kaynakları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlama mimarisi ve tek doğruluk kaynağı (Single Source of Truth) varlığı.
- **Seçenekler:**
  - `tek_dogruluk_kaynagi_erp_ve_entegre_kurumsal_dwh_bi_mimarisi`: Tüm raporlar tek doğruluk kaynağı olan ERP ve entegre Veri Ambarı (DWH / BI) üzerinden doğrudan üretilir
  - `hibrit_model_erp_verileri_harici_excel_tablolariyla_birlestirilir`: ERP'den ham veriler alınır, departmanların harici Excel tablolarıyla birleştirilerek rapor üretilir *(Not Alınabilir)*
  - `cok_sayida_bagimsiz_ve_parcali_excel_kaynagi_kullanilir`: Merkezi veri kaynağı yoktur; her departman kendi bağımsız Excel veritabanından rapor üretir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Kurumsal Raporlama Mimarisi ve Veri Ambarı (DWH) entegrasyon modelini belirler.

#### [BGT-038] Farklı departmanların (örn. Satış vs Muhasebe) yönetim kurulu veya genel müdüre sunduğu rapor rakamlarında uyumsuzluk / çelişki (Data Discrepancy) yaşanmakta mıdır?
- **Süreç:** Rapor Veri Kaynakları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Veri tutarlılığı, mutabakat sorunları ve rakam güvenilirliği.
- **Seçenekler:**
  - `asla_yasanmaz_tum_departmanlar_ayni_sistem_verisini_gorur`: Hayır, yaşanmaz; tüm departmanlar aynı merkezi veritabanı üzerinden rapor aldığı için rakamlar birebir tutarlıdır
  - `sik_sik_yasanir_toplantilarda_rakam_tartismasi_olur`: Evet, sıkça yaşanır; satış cirosu veya kârlılık rakamları departmanlar arasında farklı çıkar ve toplantılarda tartışma yaratır *(Not Alınabilir)*
  - `zaman_zaman_tanim_veya_zamanlama_farkindan_kaynaklanir`: Bazen yaşanır; faturalaşma zamanlaması veya iade/iskonto tanımlarındaki farklılıklardan kaynaklı geçici farklar oluşur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Tek Doğruluk Kaynağı (Single Source of Truth) ve Veri Yönetişimi (Data Governance) ihtiyacını belirler.

---

### 18. Excel Bağımlılığı

#### [BGT-039] Yönetim raporları ve bütçe süreçlerinin yürütülmesinde Manuel Excel Bağımlılığı ve kişiye bağımlılık düzeyi nedir?
- **Süreç:** Excel Bağımlılığı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlama operasyonunda Excel iş yükü ve kurumsal hafıza riski.
- **Seçenekler:**
  - `cok_yuksek_bagimlilik_excel_ve_ilgili_kisi_olmadan_rapor_cikmaz`: Çok yüksek; tüm bütçe ve raporlama belirli kişilerin hazırladığı karmaşık Excel modellerine ve makrolara bağımlıdır *(Not Alınabilir)*
  - `orta_duzey_bagimlilik_erpden_veri_cekilip_excelde_bicimlendirilir`: Orta düzey; veriler ERP'den güvenle çekilir ancak son görselleştirme ve analiz Excel üzerinde yapılır
  - `dusuk_bagimlilik_tum_raporlar_sistem_tarafindan_otomatik_uretilir`: Düşük; tüm raporlar ve bütçe takipleri ERP/BI sistemi üzerinden doğrudan alınır, Excel'e bağımlılık yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Excel Bağımlılığından Kurtulma (De-Excelization) ve Raporlama Otomasyonu önceliğini belirler.

#### [BGT-040] Excel üzerinde elle yapılan veri birleştirme, formül hataları, sürüm karışıklığı veya makro bozulmaları sebebiyle yaşanan zaman ve güven kaybı ne boyuttadır?
- **Süreç:** Excel Bağımlılığı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Manuel operasyon hataları, formül riskleri ve raporlama güveni.
- **Seçenekler:**
  - `ciddi_zaman_ve_guven_kaybi_yasaniyor_yanlis_karar_riski_var`: Ciddi boyutta; formül kaymaları, yanlış kopyalamalar veya bozuk dosyalar sebebiyle raporlarda sıkça hatalar ve gecikmeler yaşanır *(Not Alınabilir)*
  - `kontrollerle_hata_onleniyor_ancak_cok_fazla_is_gucu_harcaniyor`: Hatalar çift kontrollerle yakalanıyor; ancak personelin zamanının büyük kısmı formül düzeltmek ve veri birleştirmekle geçiyor
  - `excel_kaynakli_herhangi_bir_guven_veya_hata_sorunu_yasanmiyor`: Excel modellerimiz oturmuştur, formül veya sürüm hatası yaşanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Raporlama Operasyonel Risk Analizini ve Veri Bütünlüğü Güvencesini belirler.

---

### 19. Rapor Yetkilendirme ve Dağıtım

#### [BGT-041] Yönetim raporlarında Rol Bazlı Güvenlik ve Satır Bazlı Yetkilendirme (Row-Level Security / Departman yöneticisinin sadece kendi birimini görmesi, kârlılık gizliliği) nasıl sağlanmaktadır?
- **Süreç:** Rapor Yetkilendirme ve Dağıtım
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Rapor veri gizliliği, satır bazlı kısıtlama ve yetki matrisi.
- **Seçenekler:**
  - `sistem_uzerinde_rol_ve_satir_bazli_dinamik_yetki_tanimlidir`: Kullanıcı sisteme girdiğinde satır bazlı yetkilendirme (RLS) ile yalnızca kendi departmanının veya bölgesinin bütçe/maliyetini görür
  - `finans_ekibi_her_departmana_kendi_sayfasini_ayri_dosya_olarak_gonderir`: Sistemsel satır yetkisi yoktur; finans personeli Excel dosyasını departmanlara göre bölerek ayrı ayrı e-posta atar *(Not Alınabilir)*
  - `yetkilendirme_yoktur_raporlar_tum_yoneticilere_aciktir`: Özel satır kısıtlaması yoktur; hazırlanan genel yönetim raporu tüm yöneticilerle paylaşılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Raporlama Yetkilendirme ve Satır Bazlı Güvenlik (Row-Level Security - RLS) mimarisini belirler.

#### [BGT-042] Yönetim raporlarının otomatik dağıtımı (Zamanlanmış E-posta Rapor Gönderimi, Mobil Bildirim, Self-Service BI Portalı) işletilmekte midir?
- **Süreç:** Rapor Yetkilendirme ve Dağıtım
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Rapor servis otomasyonu, zamanlanmış dağıtım ve self-servis erişim.
- **Seçenekler:**
  - `zamanlanmis_otomatik_eposta_ve_self_service_portal_aktif`: Evet; yöneticilere her sabah/hafta başı otomatik PDF/Excel raporları postalanır ve portal üzerinden self-servis çalışabilirler
  - `finans_ekibi_hazirladikca_manuel_eposta_ile_gonderir`: Otomatik dağıtım yoktur; finans uzmanı raporu hazırladıktan sonra ilgili dağıtım listesine manuel e-posta atar
  - `rapor_dagitimi_yapilmaz_isteyen_talep_eder`: Düzenli bir rapor dağıtımı yapılmaz; yönetici ihtiyaç duyduğunda finans ekibinden talep eder *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP Karar Etkisi:** Zamanlanmış Rapor Dağıtımı (Report Bursting / Scheduling) ve Self-Service BI gereksinimini belirler.
