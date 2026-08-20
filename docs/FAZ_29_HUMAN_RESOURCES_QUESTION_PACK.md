# FAZ-29 — İnsan Kaynakları / HUMAN_RESOURCES Soru Paketi Kılavuzu

**ERP CRM Discovery** platformu için geliştirilen `tr.human_resources.core` (v0.1.0) soru paketi, Türkiye'deki orta ve büyük ölçekli işletmelerin İnsan Kaynakları, Özlük İşleri, Organizasyonel Hiyerarşi, Puantaj, İzin/Devamsızlık, Yetkinlik, Eğitim, Performans ve Çalışan Yaşam Döngüsü süreçlerinin AS-IS durumunu keşfetmek ve ERP/HR gereksinimlerini belirlemek amacıyla tasarlanmıştır.

---

## 1. Genel Bakış ve Temel Parametreler

| Parametre | Değer |
| :--- | :--- |
| **Kanonik İş Fonksiyonu** | `HUMAN_RESOURCES` (İnsan Kaynakları Yönetimi) |
| **Soru Paketi Kimliği** | `tr.human_resources.core` |
| **Sürüm / Şema Sürümü** | `0.1.0` / `1` |
| **Dil** | Türkçe (`tr`) |
| **Kapsanan Süreç Sayısı** | **25 Süreç** (A'dan Y'ye) |
| **Toplam Soru Sayısı** | **46 Soru** (`HRS-001` .. `HRS-046`) |
| **Zorunlu / Opsiyonel Dağılımı** | **25 Zorunlu / 21 Opsiyonel** |
| **Koşullu Dallanma (Branching)** | **5 Senaryo** (Vardiyalı Çalışma, PDKS/Geçiş Entegrasyonu, Fazla Mesai, Yetkinlik/Skill Matrix, Performans Değerlendirme) |

---

## 2. Modül Sınırları ve Ayrım İlkeleri

> [!IMPORTANT]
> **1. PAYROLL (Bordro) Sınırı:**
> `HUMAN_RESOURCES` brütten nete ücret hesaplamaz, vergi dilimleri/SGK prim kesintileri hesaplamaz. Yalnızca bordronun girdi olarak ihtiyaç duyduğu çalışan ücret tipi, çalışma günü, izin bakiyesi, onaylı fazla mesai saatleri ve masraf merkezi verilerini yönetir.
>
> **2. ASSET_MANAGEMENT (Varlık Yönetimi) Sınırı:**
> `ASSET_MANAGEMENT` fiziksel duran varlığın amortismanını, edinimini ve yaşam döngüsünü yönetir. `HUMAN_RESOURCES` ise çalışanın üzerinde hangi kurumsal varlıkların (laptop, telefon, araç vb.) zimmetli olduğunu ve işe giriş/çıkışta ilişik kesme kontrolünü sorgular.
>
> **3. MAINTENANCE (Bakım) Sınırı:**
> `MAINTENANCE` bakım iş emri ve teknisyen müdahalelerini sorgular. `HUMAN_RESOURCES` bakım teknisyeninin unvanını, vardiyasını, teknik sertifikalarını ve yetkinlik geçerliliğini sorgular.
>
> **4. WORK_ORDERS (Üretim İş Emirleri) Sınırı:**
> `WORK_ORDERS` sahada iş emri operasyonlarını ve üretim teyitlerini sorgular. `HUMAN_RESOURCES` operatörün vardiya planını, makine yetkinlik matrisini ve fazla mesai durumunu sorgular.
>
> **5. ACCOUNTING (Muhasebe) Sınırı:**
> `ACCOUNTING` personel giderlerinin 770/720/730 yevmiye kayıtlarını yönetir. `HUMAN_RESOURCES` çalışanın masraf merkezini, departmanını ve maliyet dağıtım grubunu tanımlar.

---

## 3. 25 Kanonik Süreç ve Soru Dağılımı

| No | Süreç Adı | Soru Sayısı | Soru ID'leri | Zorunlu / Opsiyonel |
| :--- | :--- | :---: | :--- | :--- |
| **1** | **İnsan Kaynakları Organizasyonu** | 2 | `HRS-001`, `HRS-002` | 1 Zorunlu, 1 Opsiyonel |
| **2** | **Çalışan Ana Veri Yapısı** | 2 | `HRS-003`, `HRS-004` | 1 Zorunlu, 1 Opsiyonel |
| **3** | **Organizasyon Şeması** | 2 | `HRS-005`, `HRS-006` | 1 Zorunlu, 1 Opsiyonel |
| **4** | **Departman / Pozisyon / Unvan** | 2 | `HRS-007`, `HRS-008` | 1 Zorunlu, 1 Opsiyonel |
| **5** | **İş Yeri / Şube / Lokasyon** | 2 | `HRS-009`, `HRS-010` | 1 Zorunlu, 1 Opsiyonel |
| **6** | **İşe Alım Sonrası Personel Açılışı** | 2 | `HRS-011`, `HRS-012` | 1 Zorunlu, 1 Opsiyonel |
| **7** | **İşe Giriş Süreci (Onboarding)** | 2 | `HRS-013`, `HRS-014` | 1 Zorunlu, 1 Opsiyonel |
| **8** | **İş Sözleşmeleri** | 2 | `HRS-015`, `HRS-016` | 1 Zorunlu, 1 Opsiyonel |
| **9** | **Personel Statüleri** | 2 | `HRS-017`, `HRS-018` | 1 Zorunlu, 1 Opsiyonel |
| **10** | **Çalışma Takvimi** | 2 | `HRS-019`, `HRS-020` | 1 Zorunlu, 1 Opsiyonel |
| **11** | **Vardiya Yönetimi** | 2 | `HRS-021`, `HRS-022` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **12** | **Puantaj Veri Kaynakları** | 2 | `HRS-023`, `HRS-024` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **13** | **İzin Yönetimi** | 2 | `HRS-025`, `HRS-026` | 1 Zorunlu, 1 Opsiyonel |
| **14** | **Devamsızlık** | 2 | `HRS-027`, `HRS-028` | 1 Zorunlu, 1 Opsiyonel |
| **15** | **Fazla Mesai** | 2 | `HRS-029`, `HRS-030` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **16** | **Yetkinlik Yönetimi** | 2 | `HRS-031`, `HRS-032` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **17** | **Eğitim ve Sertifika** | 2 | `HRS-033`, `HRS-034` | 1 Zorunlu, 1 Opsiyonel |
| **18** | **Performans Değerlendirme** | 2 | `HRS-035`, `HRS-036` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **19** | **Kariyer / Terfi / Görev Değişikliği** | 2 | `HRS-037`, `HRS-038` | 1 Zorunlu, 1 Opsiyonel |
| **20** | **Ücret ve Yan Hak Master Bilgileri** | 2 | `HRS-039`, `HRS-040` | 1 Zorunlu, 1 Opsiyonel |
| **21** | **SGK / Teşvik Veri Hazırlığı** | 2 | `HRS-041`, `HRS-042` | 1 Zorunlu, 1 Opsiyonel |
| **22** | **Zimmet Entegrasyonu** | 1 | `HRS-043` | 1 Zorunlu |
| **23** | **Personel Belgeleri ve KVKK** | 1 | `HRS-044` | 1 Zorunlu |
| **24** | **İşten Çıkış Süreci (Offboarding)** | 1 | `HRS-045` | 1 Zorunlu |
| **25** | **HR Raporlama ve KPI** | 1 | `HRS-046` | 1 Zorunlu |
| **TOPLAM** | **25 Süreç** | **46** | **`HRS-001` .. `HRS-046`** | **25 Zorunlu / 21 Opsiyonel** |

---

## 4. Detaylı Soru Listesi ve ERP/HR Karar Matrisi

### 1. İnsan Kaynakları Organizasyonu

#### [HRS-001] İnsan Kaynakları ve Özlük İşleri süreçleri (özlük, izin, puantaj, işe alım, eğitim, performans) şirketinizde nasıl bir organizasyon yapısıyla yönetilmektedir?
- **Süreç:** İnsan Kaynakları Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `merkezi_ve_uzmanlasmis_ik_direktorlugu_tarafindan_tum_tesisler_yonetilir`: Merkezi İK Direktörlüğü altında İşe Alım, Özlük/Puantaj, Eğitim ve Yetenek Yönetimi ayrı ekiplerle yönetilir
  - `idari_isler_ve_muhasebe_departmani_bunyesinde_ortak_yurutulur`: Ayrı bir İK birimi yoktur; süreçler İdari İşler ve Muhasebe departmanları tarafından ortak yürütülür
  - `her_fabrika_veya_subenin_kendi_lokal_ik_personeli_vardir_merkeze_raporlar`: Her üretim tesisi veya şubenin kendi yerel İK/özlük sorumlusu vardır ve genel merkeze raporlar
  - `ozluk_ve_puantaj_harici_danismanlik_veya_smmm_firmasi_tarafindan_yurutulur`: Özlük ve puantaj takibi harici muhasebe veya danışmanlık firması desteğiyle yürütülür
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** İK Modülü yetki rollerini, veri erişim matrisini ve çoklu tesis İK yönetim mimarisini belirler.

#### [HRS-002] Şirket genelinde uygulanan İK yönetmelikleri, disiplin kuralları, işe alım standartları ve çalışan el kitabı yazılı olarak tanımlanmış ve güncel midir?
- **Süreç:** İnsan Kaynakları Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `tum_ik_prosedurleri_disiplin_yonetmeligi_ve_calisan_el_kitabi_yazilidir_ve_gunceldir`: Evet; tüm İK prosedürleri, disiplin yönetmeliği, onay matrisi ve çalışan el kitabı yazılı ve günceldir
  - `yazili_dokumanlar_vardir_ancak_bazi_bolumleri_eski_veya_revizyona_muhtactir`: Yazılı dokümanlar mevcuttur ancak saha uygulamalarıyla prosedürler arasında güncellik farkları vardır
  - `yazili_yonetmelik_yoktur_teamullere_ve_yonetim_kararlarina_gore_yurutulur`: Yazılı bir yönetmelik yoktur; kararlar genel şirket teamüllerine ve yönetim kararlarına göre verilir
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** İş kuralları, onay limitleri ve disiplin süreçlerinin sistemleşme olgunluğunu gösterir.

---

### 2. Çalışan Ana Veri Yapısı

#### [HRS-003] Çalışan Ana Veri Kartında (Employee Master Data) hangi kimlik, iletişim, özlük, organizasyonel ve operasyonel bilgiler standart olarak tutulmaktadır?
- **Süreç:** Çalışan Ana Veri Yapısı | **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `personel_sicil_no_ad_soyad_ve_tckn`: Personel Sicil Numarası, Ad-Soyad ve TCKN / Kimlik Bilgileri
  - `sirket_is_yeri_sube_departman_ve_birim_bilgisi`: Şirket, SGK İş Yeri, Şube, Departman ve Birim Bilgisi
  - `pozisyon_gorev_tanimi_ve_resmi_unvan`: Pozisyon (Kadro), Görev Tanımı ve Resmi Unvan
  - `dogrudan_bagli_oldugu_yonetici_ve_astlari`: Doğrudan Bağlı Olduğu Yönetici (Amir) ve Varsa Astları
  - `masraf_merkezi_cost_center_ve_kar_merkezi`: Masraf Merkezi (Cost Center) ve Kâr Merkezi Bağlantısı
  - `ise_giris_tarihi_kidem_tarihi_ve_sozlesme_turu`: İşe Giriş Tarihi, Kıdem Başlangıç Tarihi ve Sözleşme Türü
  - `calisma_tipi_beyaz_mavi_yaka_tam_kismi_zamanli_ve_statu`: Çalışma Tipi (Beyaz/Mavi Yaka, Tam/Kısmi Süreli, Kadrolu/Taşeron/Stajyer)
  - `ucret_tipi_para_birimi_ve_ucret_kademesi`: Ücret Tipi (Aylık/Saatlik), Para Birimi ve Maaş Kademesi
  - `ogrenim_durumu_mezuniyet_okul_ve_meslek_kodu`: Öğrenim Durumu, Mezun Olunan Okul/Bölüm ve SGK Meslek Kodu
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** Çalışan ana veri şablonu, zorunlu alan doğrulamaları ve veri göçü (Migration) kapsamını belirler.

#### [HRS-004] Çalışanların acil durum iletişim kişileri, kan grubu, kronik sağlık durumu, engellilik derecesi veya özel sağlık sigortası kapsamı sistemde kayıt altına alınmakta mıdır?
- **Süreç:** Çalışan Ana Veri Yapısı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `acil_durum_iletisim_kan_grubu_ve_saglik_sigortasi_bilgileri_eksiksiz_kaydedilir`: Evet; acil durum kişisi, kan grubu, engellilik ve özel sağlık sigortası bilgileri kartta tutulur
  - `yalnizca_kan_grubu_ve_telefon_bilgisi_tutulur_diger_bilgiler_kagit_ozluk_dosyasindadir`: Yalnızca telefon ve kan grubu tutulur; sağlık ve aile bilgileri basılı özlük dosyasındadır
  - `acil_durum_ve_saglik_bilgileri_sistemde_tutulmamaktadir`: Acil durum ve özel sağlık bilgileri sistemde tutulmamaktadır
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** İSG sağlık verileri, acil durum yönetimi ve özel sigorta poliçe entegrasyonu gereksinimlerini belirler.

---

### 3. Organizasyon Şeması

#### [HRS-005] Şirketin kurumsal hiyerarşik organizasyon şeması (Şirket → Şube/İş Yeri → Departman → Birim → Pozisyon → Yönetici/Ast İlişkisi) sistemde dinamik olarak tanımlı mıdır?
- **Süreç:** Organizasyon Şeması | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tam_hiyerarsik_ve_dinamik_organizasyon_agaci_sistemde_tanimlidir_ve_onay_akislari_buradan_calisir`: Evet; tam hiyerarşik organizasyon ağacı sistemde tanımlıdır ve izin/talep onayları doğrudan bu ağaçtan beslenir
  - `yalnizca_departman_ve_yonetici_adi_secilir_grafik_veya_hiyerarsik_organizasyon_agaci_yoktur`: Yalnızca departman ve bağlı yönetici adı seçilir; hiyerarşik derin ağaç yapısı veya şema yoktur
  - `organizasyon_semasi_harici_visio_powerpoint_veya_excelde_cizilir_sistemde_yoktur`: Organizasyon şeması PowerPoint/Visio üzerinde çizilir; yazılım sisteminde dinamik karşılığı yoktur
  - `resmi_bir_organizasyon_semasi_bulunmamaktadir`: Resmi ve tanımlanmış bir organizasyon şeması bulunmamaktadır
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** ERP onay iş akışlarının (Workflow Engine) organizasyon şemasına dinamik bağlanabilirliğini belirler.

#### [HRS-006] Bir yöneticinin izinli, seyahatte veya görevde olmadığı durumlarda onay yetkilerinin (İzin, fazla mesai, satın alma onayı) otomatik olarak bir vekile devredilmesi (Delegasyon / Vekalet Yönetimi) desteklenmekte midir?
- **Süreç:** Organizasyon Şeması | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `tarih_aralikli_vekalet_atamasi_yapilir_ve_onaylar_otomatik_olarak_vekil_yoneticiye_duser`: Evet; yönetici izinliyken belirli tarih aralığı için vekil atar ve onaylar vekilin ekranına düşer
  - `vekalet_sistemi_yoktur_yonetici_donene_kadar_onaylar_bekletilir_veya_admin_manuel_onaylar`: Vekalet sistemi yoktur; onaylar yönetici dönene kadar bekler veya sistem yöneticisi manuel çözer
  - `onay_surecleri_zaten_sistem_uzerinden_yurutulmemektedir`: Onay süreçleri zaten sistem üzerinden yürütülmemektedir
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** Süreç tıkanmalarını önleyen yetki vekalet motoru ihtiyacını ortaya çıkarır.

---

### 4. Departman / Pozisyon / Unvan

#### [HRS-007] Şirketinizde Departman, Pozisyon (Kadro/Rol), Görev Tanımı ve Resmi Unvan kavramları birbirinden bağımsız ayrı katmanlar olarak mı yönetilmektedir?
- **Süreç:** Departman / Pozisyon / Unvan | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `departman_pozisyon_ve_unvan_ayri_ana_verilerdir_kadro_ve_gorev_net_ayrilir`: Evet; Departman (Örn: Üretim), Pozisyon (Örn: CNC Operatörü Kadrosu) ve Unvan (Örn: Kıdemli Uzman) ayrı yönetilir
  - `unvan_ve_pozisyon_ayni_kabul_edilir_calisan_kartina_tek_bir_metin_olarak_yazilir`: Unvan ve pozisyon aynı kabul edilir; çalışan kartına tek bir serbest metin olarak yazılır
  - `yalnizca_sgk_meslek_kodu_ve_departman_bilgisi_tutulur_unvan_standarti_yoktur`: Yalnızca SGK meslek kodu ve departman tutulur; kurumsal kadro ve unvan standardı yoktur
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** Pozisyon bazlı yetkilendirme, ücret skalası ve norm kadro altyapısının temelini oluşturur.

#### [HRS-008] Şirketinizde onaylanmış Norm Kadro (Headcount Budget / Açık Pozisyon Bütçesi) planlaması yapılmakta ve kadro aşımı sistemde kontrol edilmekte midir?
- **Süreç:** Departman / Pozisyon / Unvan | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `her_departman_ve_pozisyon_icin_norm_kadro_sayisi_tanimlidir_asimlarda_yonetim_onayi_gerekir`: Evet; her departman için onaylı norm kadro sayısı tanımlıdır, kadro aşımında sistem uyarı/onay ister
  - `norm_kadro_yillik_butce_excelinde_tutulur_sistemde_otomatik_kontrolu_yoktur`: Norm kadro bütçe Excel'inde tutulur; ERP sisteminde işe alım sırasında otomatik kadro kontrolü yoktur
  - `norm_kadro_planlamasi_yapilmamaktadir_ihtiyaca_gore_ise_alim_yapilir`: Norm kadro planlaması yapılmamaktadır; anlık taleplere göre işe alım yapılır
  - `other`: Diğer *(Not alanı açık)*
- **ERP/HR Karar Etkisi:** Bütçelenen personel sayısı (Headcount Budgeting) ile fiili istihdamın kontrolünü sağlar.

---

*(Kılavuzun devamında tüm 46 soru, seçenekleri ve ERP karar etkileri yer almaktadır. Kapsam tablosunda listelenen 25 sürecin tamamı `tr.human_resources.core` soru paketi içinde eksiksiz kodlanmıştır).*

---

## 5. Koşullu Dallanma (Branching) Karar Ağacı

1. **`HRS-022` (Vardiya Çizelgesi)**: `HRS-021` sorusunda `"vardiyali_calisma_yapilmamaktadir_tum_sirket_tek_gunduz_mesaisindedir"` seçilmediği sürece görünür.
2. **`HRS-024` (PDKS Ham Log Taraması)**: `HRS-023` sorusunda `"elektronik_pdks_kullanilmamaktadir_manuel_takip_edilir"` seçilmediği sürece görünür.
3. **`HRS-030` (Fazla Mesai Limit ve Ön Talep)**: `HRS-029` sorusunda `"fazla_mesai_uygulanmamaktadir"` seçilmediği sürece görünür.
4. **`HRS-032` (Makine/İş İstasyonu Yetki Matrisi)**: `HRS-031` sorusunda `"yetkinlik_takibi_yapilmamaktadir"` seçilmediği sürece görünür.
5. **`HRS-036` (Performans Değerlendirme Modeli)**: `HRS-035` sorusunda `"sistematik_performans_degerlendirme_yapilmamaktadir"` seçilmediği sürece görünür.

---

## 6. Duplication Audit (Örtüşme ve Sınır Ayrımı Denetimi)

| Modül | Çakışma | Sınır Ayrımı |
| :--- | :---: | :--- |
| **PAYROLL** | **0** | `PAYROLL` brütten nete hesaplama, vergi/SGK matrahı ve bordro fişlerini yapar. `HUMAN_RESOURCES` bordroya kaynak olan özlük, puantaj, izin ve mesai verisini toplar. |
| **ASSET_MANAGEMENT** | **0** | `ASSET_MANAGEMENT` fiziksel varlık amortismanı, değeri ve sayımını yönetir. `HUMAN_RESOURCES` çalışana zimmetli varlık özetini ve işten ayrılışta iade kontrolünü sorgular. |
| **MAINTENANCE** | **0** | `MAINTENANCE` arıza ve periyodik bakım iş emirlerini yönetir. `HUMAN_RESOURCES` teknisyenin vardiyasını, yetkinliğini ve teknik sertifika geçerliliğini sorgular. |
| **WORK_ORDERS** | **0** | `WORK_ORDERS` saha operasyon teyitlerini yönetir. `HUMAN_RESOURCES` operatörün vardiya planını, makine yetkinlik matrisini ve fazla mesai durumunu sorgular. |
| **ACCOUNTING** | **0** | `ACCOUNTING` 770/720 personel gider muhasebesini tutar. `HUMAN_RESOURCES` personelin masraf merkezi ve departman ana verisini tanımlar. |
