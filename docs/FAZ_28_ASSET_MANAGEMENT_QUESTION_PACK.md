# FAZ-28 — Sabit Kıymet ve Varlık Yönetimi / ASSET_MANAGEMENT Soru Paketi Kılavuzu

Bu doküman, **ERP CRM Discovery** platformunun on dokuzuncu kanonik saha soru paketi olan **`ASSET_MANAGEMENT` (Sabit Kıymet ve Varlık Yönetimi / Duran Varlık Yaşam Döngüsü)** modülünün tüm süreçlerini, soru detaylarını, seçenek yapılarını, dallanma kurallarını ve modüller arası sınır ayrım matrisini tanımlar.

---

## 1. Paket Özeti ve Kimlik Bilgileri

- **Kanonik İş Fonksiyonu Kodu:** `ASSET_MANAGEMENT`
- **Soru Paketi Kimliği (pack_id):** `tr.asset_management.core`
- **Sürüm:** `0.1.0`
- **Şema Sürümü / Dil:** `schema_version: "1"` / `language: "tr"`
- **Gösterim Adı:** `Sabit Kıymet ve Varlık Yönetimi Ön Analizi`
- **Toplam Soru Sayısı:** **45 Soru** (`AST-001` .. `AST-045`)
- **Zorunlu Soru Sayısı:** **24 Zorunlu**
- **Opsiyonel Soru Sayısı:** **21 Opsiyonel**
- **Kanonik Süreç Sayısı:** **24 Süreç** (A'dan X'e)
- **Branching (Dallanma) Noktası:** **5 Koşullu Soru**

---

## 2. Kanonik Süreçler ve Soru Dağılım Matrisi

| No | Süreç Adı | Soru Sayısı | Soru ID'leri | Zorunlu / Opsiyonel |
| :--- | :--- | :---: | :--- | :--- |
| **1** | **Varlık Yönetimi Organizasyonu** | 2 | `AST-001`, `AST-002` | 1 Zorunlu, 1 Opsiyonel |
| **2** | **Varlık Ana Veri Yapısı** | 2 | `AST-003`, `AST-004` | 1 Zorunlu, 1 Opsiyonel |
| **3** | **Varlık Sınıflandırması** | 2 | `AST-005`, `AST-006` | 1 Zorunlu, 1 Opsiyonel |
| **4** | **Varlık Kodlama / Numaralandırma** | 2 | `AST-007`, `AST-008` | 1 Zorunlu, 1 Opsiyonel |
| **5** | **Edinim ve Aktifleştirme** | 2 | `AST-009`, `AST-010` | 1 Zorunlu, 1 Opsiyonel |
| **6** | **Varlık Maliyet Bileşenleri** | 2 | `AST-011`, `AST-012` | 1 Zorunlu, 1 Opsiyonel |
| **7** | **Fiziksel Lokasyon Yönetimi** | 2 | `AST-013`, `AST-014` | 1 Zorunlu, 1 Opsiyonel |
| **8** | **Zimmet / Kullanıcı Ataması** | 2 | `AST-015`, `AST-016` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **9** | **Organizasyon / Şirket / Şube Sahipliği** | 2 | `AST-017`, `AST-018` | 1 Zorunlu, 1 Opsiyonel |
| **10** | **Seri Numarası ve Teknik Kimlik** | 2 | `AST-019`, `AST-020` | 1 Zorunlu, 1 Opsiyonel |
| **11** | **Faydalı Ömür ve Amortisman Bağlantısı** | 2 | `AST-021`, `AST-022` | 1 Zorunlu, 1 Opsiyonel |
| **12** | **Garanti Yönetimi** | 2 | `AST-023`, `AST-024` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **13** | **Sigorta Yönetimi** | 2 | `AST-025`, `AST-026` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **14** | **Varlık Transferi** | 2 | `AST-027`, `AST-028` | 1 Zorunlu, 1 Opsiyonel |
| **15** | **Değer Artırıcı Harcamalar / Capitalization** | 2 | `AST-029`, `AST-030` | 1 Zorunlu, 1 Opsiyonel |
| **16** | **Varlık Bölme / Birleştirme** | 2 | `AST-031`, `AST-032` | 1 Zorunlu, 1 Opsiyonel |
| **17** | **Fiziksel Sayım** | 2 | `AST-033`, `AST-034` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **18** | **Kayıp / Çalınma / Hasar** | 2 | `AST-035`, `AST-036` | 1 Zorunlu, 1 Opsiyonel |
| **19** | **Kullanım Dışı / Idle Asset** | 2 | `AST-037`, `AST-038` | 1 Zorunlu, 1 Opsiyonel |
| **20** | **Hurda / Satış / Elden Çıkarma** | 2 | `AST-039`, `AST-040` | 1 Zorunlu, 1 Opsiyonel |
| **21** | **Bakım Entegrasyonu** | 2 | `AST-041`, `AST-042` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **22** | **Belge ve Dokümanlar** | 1 | `AST-043` | 1 Zorunlu |
| **23** | **Varlık Geçmişi / Audit Trail** | 1 | `AST-044` | 1 Zorunlu |
| **24** | **Varlık Raporlama ve KPI** | 1 | `AST-045` | 1 Zorunlu |
| **TOPLAM** | **24 Süreç** | **45** | **`AST-001` .. `AST-045`** | **24 Zorunlu / 21 Opsiyonel** |

---

## 3. Branching (Koşullu Dallanma) Kuralları

Paket içerisinde mantıksal bağımlılık içeren 5 adet koşullu soru tanımlanmıştır:

1. **`AST-016` (Zimmet Formu / Tutanak ve İade Kontrolü):**
   - **Tetikleyici Soru:** `AST-015` (Zimmet Takibi)
   - **Koşul:** `AST-015 != "zimmet_takibi_yapilmamaktadir"`
   - **Davranış:** Şirkette zimmet takibi yapılmıyorsa tutanak basımı ve ilişik kesme kontrolü sorusu gizlenir.

2. **`AST-024` (Garanti Bitiş Yaklaşma Alarmları ve Rücu):**
   - **Tetikleyici Soru:** `AST-023` (Garanti Yönetimi)
   - **Koşul:** `AST-023 != "garanti_takibi_yapilmamaktadir"`
   - **Davranış:** Şirkette garanti takibi yapılmıyorsa garanti alarmı ve servis rücu sorusu gizlenir.

3. **`AST-026` (Poliçe Yenileme Alarmları ve Hasar Dosyaları):**
   - **Tetikleyici Soru:** `AST-025` (Sigorta Yönetimi)
   - **Koşul:** `AST-025 != "varlik_bazli_sigorta_takibi_yapilmamaktadir"`
   - **Davranış:** Şirkette varlık bazlı sigorta izlenmiyorsa poliçe yenileme uyarısı ve hasar takip sorusu gizlenir.

4. **`AST-034` (Mobil / Barkodlu Sayım Cihazları ve Fark Mutabakatı):**
   - **Tetikleyici Soru:** `AST-033` (Fiziksel Sayım)
   - **Koşul:** `AST-033 != "fiziksel_varlik_sayimi_yapilmamaktadir"`
   - **Davranış:** Şirkette fiziksel varlık sayımı yapılmıyorsa mobil barkodlu sayım ve otomatik fark raporu sorusu gizlenir.

5. **`AST-042` (Kümülatif Bakım Maliyeti / TCO Konsolidasyonu):**
   - **Tetikleyici Soru:** `AST-041` (Bakım Entegrasyonu)
   - **Koşul:** `AST-041 != "bakim_ekipmani_ile_varlik_arasinda_iliski_kurulmamaktadir"`
   - **Davranış:** Bakım ekipmanıyla sabit kıymet kartı arasında ilişki kurulmuyorsa varlık kartı üzerinde kümülatif bakım harcaması (TCO) konsolidasyon sorusu gizlenir.

---

## 4. Detaylı Soru Listesi ve Karar Etkisi

### 1. Varlık Yönetimi Organizasyonu

#### [AST-001] Sabit kıymetlerin ve kurumsal duran varlıkların (fiziksel takip, zimmet, sayım, lokasyon ve transfer) yönetimi şirketinizde hangi departman veya ekip tarafından yürütülmektedir?
- **Süreç:** Varlık Yönetimi Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `idari_isler_ve_muhasebe_ortak_sorumlulugunda_yonetilir`: İdari İşler fiziksel varlık ve zimmeti, Muhasebe ise mali defter ve amortismanı koordine olarak yönetir
  - `ayri_bir_varlik_yonetimi_veya_tesis_yonetimi_departmani_vardir`: Tüm duran varlıkların fiziki ve operasyonel takibi ayrı bir Tesis / Varlık Yönetimi departmanı tarafından yürütülür
  - `her_departman_it_uretim_idari_kendi_varliklarini_bagimsiz_yonetir`: Her birim (IT bilişim ekipmanlarını, Üretim makineleri, İdari İşler mobilya/araçları) bağımsız takip eder
  - `yalnizca_muhasebe_tarafindan_fatura_uzerinden_takip_edilir_saha_takibi_yoktur`: Yalnızca Muhasebe departmanı tarafından yasal defterler üzerinden izlenir; sahada operasyonel varlık takibi yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Yönetimi Rol, Yetki ve Organizasyonel Sorumluluk Modelini belirler.

#### [AST-002] Duran varlıkların ediniminden hurdaya ayrılmasına kadarki fiziksel ve mali süreçleri düzenleyen yazılı bir Sabit Kıymet Prosedürü veya Varlık Yönetim Yönetmeliği bulunmakta mıdır?
- **Süreç:** Varlık Yönetimi Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `yazili_prosedur_vardir_ve_tum_tesislerde_eksiksiz_uygulanir`: Evet; aktifleştirme limiti, zimmet, transfer ve hurda kurallarını belirleyen yazılı prosedür mevcuttur ve uygulanır
  - `yazili_dokuman_vardir_ancak_sahada_uygulamada_farkliliklar_yasayabilmektedir`: Yazılı doküman vardır ancak departmanlar arası uygulamada ve onay adımlarında esneklikler yaşanmaktadır
  - `yazili_prosedur_yoktur_yonetim_kararlari_ve_teamullere_gore_yurutulur`: Yazılı bir yönetmelik yoktur; süreçler yöneticilerin tecrübesine ve anlık kararlara göre yürütülür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Sabit Kıymet Kurumsal Prosedür ve İş Akışı Standartlaşma Düzeyini belirler.

---

### 2. Varlık Ana Veri Yapısı

#### [AST-003] Kurumsal Varlık Ana Veri Kartında (Asset Master Data) hangi kimlik, teknik, finansal ve operasyonel bilgiler standart olarak tutulmaktadır?
- **Süreç:** Varlık Ana Veri Yapısı | **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `varlik_kodu_aciklama_ve_varlik_sinifi`: Varlık Kodu (Asset No), Açıklama ve Ana Varlık Sınıfı
  - `marka_model_seri_numarasi_ve_uretici_bilgisi`: Marka, Model, Üretici Seri Numarası ve İmal Yılı
  - `fiziksel_lokasyon_fabrika_bina_kat_oda_hat`: Ayrıntılı Fiziksel Lokasyon (Fabrika, Bina, Kat, Bölüm/Oda, Hat)
  - `zimmet_sahibi_personel_ve_sorumlu_departman`: Zimmet Sahibi Personel ve Sorumlu Departman / Yönetici
  - `masraf_merkezi_ve_kar_merkezi_baglantisi`: Masraf Merkezi (Cost Center) ve Kâr Merkezi Bağlantısı
  - `edinim_tarihi_aktifiestirme_tarihi_ve_fatura_no`: Edinim Tarihi, Aktifleştirme Tarihi, Fatura No ve Tedarikçi
  - `faydali_omur_amortisman_orani_ve_defter_degeri`: Faydalı Ömür, Amortisman Yöntemi/Oranı ve Net Defter Değeri
  - `garanti_ve_sigorta_police_bilgileri`: Garanti Süresi/Bitiş Tarihi ve Sigorta Poliçe Bilgileri
  - `varlik_operasyonel_statusu_aktif_atil_arizali_hurda`: Varlık Operasyonel Statüsü (Aktif, Atıl, Bakımda, Arızalı, Hurda)
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Sabit Kıymet Ana Veri Kartı Alan Tasarımı ve Veri Zenginliğini belirler.

#### [AST-004] Büyük üretim tesislerinde veya karmaşık varlıklarda Üst Varlık - Alt Varlık (Parent-Child Asset Hierarchy / Tesis → Hat → Makine → Alt Ünite) hiyerarşik ilişki yapısı kullanılmakta mıdır?
- **Süreç:** Varlık Ana Veri Yapısı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `cok_seviyeli_parent_child_varlik_hiyerarsisi_kullanilmaktadir`: Evet; üretim hatları ana varlık, bağlı makineler ve kalıplar alt varlık olarak hiyerarşik bağlanır
  - `tek_seviyeli_duz_varlik_listesi_tutulur_hiyerarsi_yoktur`: Hayır; tüm varlıklar aynı hiyerarşi düzeyinde bağımsız tekil kartlar olarak takip edilir
  - `yalnizca_muhasebede_ana_grup_kirilimi_vardir_saha_hiyerarsisi_yoktur`: Yalnızca muhasebe hesap planı düzeyinde kırılım vardır; fiziksel alt-üst varlık bağı kurulmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Parent-Child Varlık Hiyerarşisi ve Üretim Hattı Konsolidasyon Modelini belirler.

---

### 3. Varlık Sınıflandırması

#### [AST-005] Duran varlıklar sistemde hangi ana varlık sınıflarına (Asset Class / Demirbaş Kategorisi) göre gruplanmakta ve yönetilmektedir?
- **Süreç:** Varlık Sınıflandırması | **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `arazi_arsa_bina_ve_tesis_yapilari`: Arazi, Arsa, Binalar ve Tesis Yapıları
  - `uretim_makineleri_tezgahlar_ve_otomasyon_hatlari`: Üretim Makineleri, Tezgâhlar ve Otomasyon Hatları
  - `ozel_kalip_aparat_fikstur_ve_modeller`: Özel Kalıplar, Aparatlar, Fikstürler ve Modeller
  - `tasitlar_servisler_forklift_ve_istifleme_araclari`: Taşıtlar, Şirket Araçları, Forklift ve İstifleme Ekipmanları
  - `bilgi_teknolojileri_sunucu_bilgisayar_yazici_ve_el_terminalleri`: IT / Bilişim (Sunucular, Bilgisayarlar, Ağ Cihazları, El Terminalleri)
  - `ofis_mobilyalari_ve_idari_demirbaslar`: Ofis Mobilyaları, Mefruşat ve İdari Demirbaşlar
  - `laboratuvar_test_ve_olcum_cihazlari`: Laboratuvar, Test ve Kalibrasyonlu Ölçüm Cihazları
  - `yazilim_lisanslari_patent_ve_maddi_olmayan_duran_varliklar`: Yazılım Lisansları, Patent, Lisans ve Gayrimaddi Haklar
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Sabit Kıymet Sınıflandırma Ağacı ve Muhasebe/Amortisman Şablon Eşleşmesini belirler.

#### [AST-006] Şirketin mülkiyetinde olan varlıkların yanı sıra Operasyonel Kiralama (Leasing), Kiralık Araç/Ekipman veya Müşteri/Tedarikçiye ait emanet kalıp ve makineler mülkiyet tipiyle ayrı takip edilmekte midir?
- **Süreç:** Varlık Sınıflandırması | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `mulkiyet_tipi_oz_varlik_kiralik_leasing_musteri_ayrilir_ve_ayri_izlenir`: Evet; öz varlık, kiralık araç, finansal kiralama ve müşteri kalıpları mülkiyet tipiyle net ayrıştırılır
  - `yalnizca_oz_varliklar_sistemdedir_kiralik_veya_emanet_varliklar_ayri_excelde_tutulur`: Yalnızca öz varlıklar ERP'dedir; kiralık ve müşteri kalıpları harici Excel listelerinde izlenir
  - `kiralik_ve_emanet_varlik_takibi_yapilmamaktadir`: Kiralık veya emanet varlık takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Mülkiyet Tipi (Owned, Leased, Consigned) İzolasyon ve Amortisman Ayrımını belirler.

---

### 4. Varlık Kodlama / Numaralandırma

#### [AST-007] Sabit kıymetlere verilen Varlık Numarası (Asset Number / Demirbaş Numarası) nasıl üretilmekte ve hangi kodlama yapısını takip etmektedir?
- **Süreç:** Varlık Kodlama / Numaralandırma | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistem_tarafindan_varlik_sinifina_gore_otomatik_ardisik_numara_uretilir`: ERP sistemi tarafından varlık sınıfı önekine göre otomatik ardışık tekil numara üretilir
  - `manuel_olarak_muhasebe_veya_idari_isler_tarafindan_kod_verilir`: Muhasebe veya İdari İşler personeli tarafından manuel kodlama yapılarak girilir
  - `hazir_basilmis_barkod_etiketinin_numarasi_sisteme_asset_no_olarak_tanimlanir`: Önceden basılmış rulo barkod etiketindeki numara okutularak sisteme varlık no olarak kaydedilir
  - `standart_bir_kodlama_yoktur_serbest_metin_veya_fatura_no_kullanilir`: Standart bir kodlama yapısı yoktur; fatura numarası veya serbest açıklamalar kullanılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Numaralandırma ve Kod Şablonu Otomasyonunu belirler.

#### [AST-008] Fiziksel varlıkların üzerine yapıştırılan veya monte edilen etiketlerde hangi tanımlama ve etiketleme teknolojisi kullanılmaktadır?
- **Süreç:** Varlık Kodlama / Numaralandırma | **Tip:** `multiple_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `standart_1d_cizgi_barkodlu_yapiskan_etiketler`: Standart 1D Çizgi Barkodlu Yapışkan Etiketler
  - `2d_karekod_qr_kod_etiketler`: 2D Karekod / QR Kod Etiketler (Mobil cihazla okutulabilir)
  - `zorlu_fabrika_ortami_icin_metal_plaka_veya_percinli_etiket`: Zorlu Fabrika/Sıcaklık Ortamına Dayanıklı Metal Plaka veya Perçinli Etiket
  - `rfid_etiketler_veya_akilli_tagler`: RFID Çipli Etiketler veya Akıllı Tag'ler
  - `etiketleme_yapilmamaktadir_fiziksel_etiket_yoktur`: Fiziksel etiketleme yapılmamaktadır; ürünler üzerinde etiket bulunmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Etiketleme Standardı ve Donanım/Yazıcı Entegrasyon Gereksinimini belirler.

---

### 5. Edinim ve Aktifleştirme

#### [AST-009] Yeni bir duran varlık satın alındığında sistemde resmi Varlık Kartı hangi tetikleyici mekanizmayla oluşturulup aktifleştirilmektedir (Capitalization)?
- **Süreç:** Edinim ve Aktifleştirme | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `satinalma_faturasi_ve_mal_kabul_girisi_yapildiginda_otomatik_veya_tek_tikla_olusturulur`: Satın alma faturası veya mal kabul kaydı duran varlık kalemine bağlandığında otomatik/tek tıkla açılır
  - `satin_alindiktan_sonra_kurulum_ve_devreye_alma_tutanagi_onaylaninca_aktifiestirilir`: Fatura girilse de varlık kurulum ve devreye alma tutanağı onaylandığı tarihte aktifleştirilir
  - `muhasebe_tarafindan_ay_sonunda_veya_donem_sonunda_manuel_kart_acilarak_aktife_alinir`: Muhasebe personeli tarafından dönem sonlarında faturalar taranarak manuel kart açılır
  - `standart_bir_aktifiestirme_akisi_yoktur`: Standart bir aktifleştirme akışı yoktur; farklı departmanlar farklı zamanlarda kaydeder
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Satın Alma Sonrası Varlık Aktifleştirme ve Kart Açılış Tetikleyici Akışını belirler.

#### [AST-010] Fabrika inşası, yeni hat kurulumu veya Ar-Ge gibi uzun süren yatırım projelerinde harcamalar Yapılmakta Olan Yatırımlar (CIP / AUC) hesabında toplanıp proje bitiminde nihai sabit kıymetlere dağıtılmakta mıdır?
- **Süreç:** Edinim ve Aktifleştirme | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `yatirim_projeleri_cip_hesabinda_toplanir_ve_tamamlaninca_varliklara_otomatik_dagitilir`: Evet; proje süresince 258 CIP hesabında toplanır, devreye alınınca ilgili sabit kıymetlere aktarılır
  - `yatirimlar_manuel_olarak_excelde_takip_edilir_bitince_tek_seferde_aktife_alinir`: Yatırım harcamaları Excel'de toplanır, proje tamamlandığında tek seferde muhasebede aktifleştirilir
  - `uzun_sureli_yatirim_projesi_yapilmamaktadir_varliklar_dogrudan_alinir`: Uzun süreli yatırım projesi yürütülmemektedir; tüm varlıklar doğrudan kullanıma hazır satın alınır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Yapılmakta Olan Yatırımlar (CIP/AUC) ve Proje Bazlı Aktifleştirme Modül İhtiyacını belirler.

---

### 6. Varlık Maliyet Bileşenleri

#### [AST-011] Duran varlığın ilk aktifleştirme (Giriş) maliyetine fatura bedelinin yanı sıra nakliye, gümrük vergisi, sigorta, kurulum, montaj ve mühendislik test giderleri dahil edilmekte midir?
- **Süreç:** Varlık Maliyet Bileşenleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_nakliye_gumruk_montaj_ve_kurulum_giderleri_varlik_aktifiestirme_maliyetine_eklenir`: Evet; varlığı çalışır hale getirmek için yapılan tüm nakliye, gümrük, montaj ve kurulum masrafları eklenir
  - `yalnizca_ana_fatura_bedeli_aktifiestirilir_montaj_ve_nakliye_donemsel_gidere_yazilir`: Yalnızca ana makine faturası aktifleştirilir; nakliye ve montaj faturaları doğrudan dönemsel gidere yazılır
  - `buyuk_tutarlı_makinelerde_eklenir_kucuk_demirbaslarda_yalniz_fatura_tutari_alinir`: Yalnızca büyük tutarlı hat ve makinelerde ek maliyetler kapitalize edilir; diğerlerinde yalnız fatura alınır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Giriş Maliyeti ve Ek Masraf Kapitalizasyon Kuralını belirler.

#### [AST-012] Yurt dışından ithal edilen veya birden fazla faturayla devreye alınan büyük varlıklarda oluşan ek masraflar (Landed Cost / Ek Masraf Dağıtımı) varlık aktifleştirme bedeline nasıl paylaştırılmaktadır?
- **Süreç:** Varlık Maliyet Bileşenleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `ithalat_ve_kurulum_faturalari_sistemde_ilgili_varlik_veya_projeye_baglanarak_otomatik_paylastirilir`: İthalat ve montaj faturaları sistemde ilgili varlık veya yatırım projesine bağlanarak otomatik paylaştırılır
  - `masraf_paylasimi_muhasebe_tarafindan_excelde_hesaplanip_tek_tutar_olarak_varliga_girilir`: Masraf paylaştırması Excel üzerinde hesaplanır ve nihai toplam tutar manuel varlık bedeli olarak girilir
  - `ithal_veya_coklu_faturali_varlik_alimi_yapilmamaktadir`: İthal veya çoklu faturalı karmaşık varlık edinimi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** İthalat Landed Cost Masraf Dağıtım ve Çoklu Fatura Eşleştirme Mimarisini belirler.

---

### 7. Fiziksel Lokasyon Yönetimi

#### [AST-013] Sabit kıymetlerin bulunduğu fiziksel konumlar sistemde hangi detay seviyesinde tanımlanmakta ve güncellenmektedir?
- **Süreç:** Fiziksel Lokasyon Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `ayrintili_lokasyon_agaci_fabrika_bina_kat_oda_hat_ile_tam_saha_takibi_yapilir`: Ayrıntılı hiyerarşik lokasyon ağacıyla (Fabrika → Bina → Kat → Bölüm/Oda → Hat) tam takip edilir
  - `yalnizca_tesis_veya_sube_seviyesinde_genel_lokasyon_tutulur`: Yalnızca tesis veya şube seviyesinde genel lokasyon tutulur; bina/oda detayına inilmez
  - `yalnizca_departman_masraf_merkezi_tutulur_fiziksel_lokasyon_alani_yoktur`: Yalnızca zimmetli departman veya masraf merkezi bilinir; fiziki lokasyon bilgisi tutulmaz
  - `duzenli_ve_guvenilir_lokasyon_kaydi_tutulmamaktadir`: Düzenli ve güncel bir lokasyon kaydı tutulmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Fiziksel Lokasyon Ağacı Derinliği ve Tesis/Oda Seviyesi Yönetim Modelini belirler.

#### [AST-014] Fabrika sahasında veya ofisler arasında sürekli hareket eden mobil varlıkların (Forklift, el terminali, ölçüm aleti, laptop, kalıp arabası) lokasyon değişiklikleri nasıl takip edilmektedir?
- **Süreç:** Fiziksel Lokasyon Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `mobil_cihaz_barkod_okutma_veya_transfer_formuyla_anlik_guncellenir`: Mobil terminallerle barkod okutularak veya sistemden transfer formu onaylanarak anlık güncellenir
  - `yalnizca_ana_bagli_oldugu_varsayilan_sabit_lokasyonu_ve_zimmetli_sorumlusu_tutulur`: Hareket anlık izlenmez; yalnızca ana bağlı olduğu varsayılan sabit lokasyon ve sorumlu tutulur
  - `mobil_varliklarin_lokasyon_hareketi_takip_edilmemektedir`: Mobil varlıkların yer değiştirmeleri sistemde takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Mobil Varlık Dinamik Yer Değişim ve Saha Tarama Mekanizmasını belirler.

---

### 8. Zimmet / Kullanıcı Ataması

#### [AST-015] Personele veya belirli bir departmana tahsis edilen kişisel ve ortak varlıkların (Laptop, telefon, araç, el aleti, ölçüm cihazı) zimmet takibi nasıl yürütülmektedir?
- **Süreç:** Zimmet / Kullanıcı Ataması | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `erp_uzerinden_tc_kimlik_sicil_no_ile_personele_ve_departmana_birebir_zimmet_takibi_yapilir`: ERP sistemi üzerinden personelin sicil numarasına ve departmanına birebir zimmetlenerek tam izlenir
  - `idari_isler_veya_it_tarafindan_harici_excel_ve_kagit_formlarla_zimmet_tutulur`: İdari İşler ve IT tarafından harici Excel tabloları ve basılı kağıt teslim tutanaklarıyla izlenir
  - `yalnizca_arac_ve_laptop_gibi_yuksek_degerli_cihazlar_zimmetlenir_digerleri_izlenmez`: Yalnızca şirket araçları ve bilgisayarlar zimmetlenir; fabrika aletleri ve diğerleri serbest kullanımdadır
  - `zimmet_takibi_yapilmamaktadir`: Zimmet takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Personel/Departman Zimmet Modülü ve Sicil No Entegrasyon İhtiyacını belirler.

#### [AST-016] Zimmet teslim ve iade süreçlerinde sistemden barkodlu Dijital/Basılı Zimmet Teslim Tutanağı üretilmekte ve personel işten ayrılırken zimmet ilişiği kontrol edilmekte midir?
- **Süreç:** Zimmet / Kullanıcı Ataması | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `AST-015 != "zimmet_takibi_yapilmamaktadir"`
- **Seçenekler:**
  - `sistemden_resmi_zimmet_tutnagi_basilir_ve_ik_cikisinda_ilisik_kesme_otomatik_kontrol_edilir`: Evet; sistemden barkodlu zimmet tutanağı basılır/onaylanır ve İK çıkışında tüm zimmetler kontrol edilir
  - `kagit_tutanak_imzalatilir_ancak_sistemle_ik_cikis_sureci_entegre_degildir`: Kağıt tutanak imzalatılır ancak İK çıkış süreciyle ERP zimmet kaydı otomatik entegre değildir
  - `tutanak_veya_ilisik_kesme_kontrolu_yapilmamaktadir`: Resmi teslim tutanağı düzenlenmemekte veya ayrılışta sistem kontrolü yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Dijital Zimmet Formu, E-İmza ve İK İlişik Kesme (Offboarding) Entegrasyonunu belirler.

---

### 9. Organizasyon / Şirket / Şube Sahipliği

#### [AST-017] Çoklu şirket (Multi-Company) veya çoklu şube yapısında bir varlığın yasal mülkiyet sahibi olan şirket ile fiilen kullandığı şube/masraf merkezi ilişkisi nasıl yönetilmektedir?
- **Süreç:** Organizasyon / Şirket / Şube Sahipliği | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `yasal_sahip_sirket_ve_fiili_kullanan_sube_ayri_ayri_tanimlanip_sistemde_izlenir`: Varlığın mülkiyet sahibi yasal tüzel kişilik ile fiilen kullandığı fabrika/şube ayrı ayrı izlenir
  - `varlik_yalnizca_kayitli_oldugu_tek_bir_sirket_ve_sube_altinda_izlenebilir`: Varlık yalnızca faturasının kesildiği tek bir şirket ve şube altında izlenebilir; çapraz kullanım tutulmaz
  - `tek_sirketli_ve_tek_lokasyonlu_yapi_vardir_coklu_sirket_ayrimi_gerekmemektedir`: Şirketimiz tek tüzel kişilikli ve tek tesisli yapıdadır; çoklu şirket ayrımı gerekmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Çoklu Şirket Duran Varlık Mülkiyet vs Kullanım Şubesi Ayrıştırma Modelini belirler.

#### [AST-018] Grup şirketleri veya farklı şubeler arasında ortak kullanılan veya geçici tahsis edilen varlıkların şirketler arası masraf yansıtması ve transferi nasıl takip edilmektedir?
- **Süreç:** Organizasyon / Şirket / Şube Sahipliği | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `sirketler_arasi_transfer_irsaliyesi_ve_fatura_yansitmasi_sistemden_entegre_yurutulur`: Evet; şirketler arası transfer irsaliyesi, yansıtma faturası ve amortisman payı sistemden entegre yürütülür
  - `fiziksel_olarak_diger_sirkette_kullanilsa_da_masraf_ve_amortisman_sahip_sirkette_kalir`: Fiziksel olarak diğer tesiste kullanılsa da yansıtma yapılmaz; tüm amortisman mülkiyet sahibi şirkette kalır
  - `grup_sirketleri_arasi_varlik_paylasimi_veya_transferi_yapilmamaktadir`: Grup şirketleri arası varlık paylaşımı veya transferi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Şirketler Arası (Intercompany) Varlık Tahsisi ve Yansıtma Fatura Sürecini belirler.

---

### 10. Seri Numarası ve Teknik Kimlik

#### [AST-019] Üretici tarafından verilen orijinal Seri Numarası (Manufacturer Serial Number), Marka, Model, Üretim Yılı ve Teknik Spesifikasyonlar varlık kartında zorunlu tutulmakta mıdır?
- **Süreç:** Seri Numarası ve Teknik Kimlik | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `seri_no_marka_model_ve_teknik_bilgiler_sistemde_zorunlu_ve_tekillik_kontroluyle_tutulur`: Evet; üretici seri numarası, marka ve model zorunlu alandır ve sistemde mükerrerlik kontrolü yapılır
  - `seri_no_ve_marka_bilgisi_opsiyoneldir_bilindikce_serbest_metin_girilir`: Seri no ve marka alanı opsiyoneldir; bilindikçe serbest metin olarak kaydedilir
  - `yalnizca_it_ve_uretim_makinelerinde_seri_no_tutulur_diger_demirbaslarda_tutulmaz`: Yalnızca IT ve ana üretim makinelerinde seri no tutulur; mobilya ve genel demirbaşlarda girilmez
  - `seri_numarasi_takibi_yapilmamaktadir`: Seri numarası takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Teknik Kimlik Doğrulama ve Mükerrer Kayıt Engelleme Kuralını belirler.

#### [AST-020] Ana varlığın üzerinde yer alan önemli bileşenlerin veya motor/şanzıman gibi ünitelerin değişmesi durumunda teknik kimlik revizyon geçmişi varlık kartında izlenebilmekte midir?
- **Süreç:** Seri Numarası ve Teknik Kimlik | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `bilesen_veya_motor_degisiminde_yeni_seri_no_ve_degisim_tarihcesi_varlik_kartinda_saklanir`: Evet; ana parçanın motor/ünite seri no değişimi tarihçesiyle birlikte varlık kartında arşivlenir
  - `yalnizca_guncel_seri_numarasi_uzerine_yazilir_eski_numaranin_gecmisi_tutulmaz`: Yalnızca güncel seri numarası alanına yeni değer yazılır; eski parça seri numarasının geçmişi tutulmaz
  - `teknik_bilesen_seri_no_degisimleri_takip_edilmemektedir`: Teknik bileşen seri no değişimleri takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Alt Bileşen Seri No Revizyon ve Parça Değişim Tarihçe Takibini belirler.

---

### 11. Faydalı Ömür ve Amortisman Bağlantısı

#### [AST-021] Duran varlıkların Faydalı Ömür (Useful Life) süresi, amortisman yöntemi (Normal, Azalan Bakiyeler, Kıst) ve amortisman başlangıç tarihi nerede belirlenip takip edilmektedir?
- **Süreç:** Faydalı Ömür ve Amortisman Bağlantısı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `erp_varlik_kartinda_varlik_sinifina_bagli_olarak_otomatik_atanir_ve_yonetilir`: ERP varlık kartında varlık sınıfına bağlı VUK faydalı ömrü ve amortisman yöntemi otomatik atanır
  - `muhasebe_programinda_veya_harici_amortisman_modulunde_manuel_girilir`: Ayrı muhasebe programında veya harici sabit kıymet yazılımında her varlık için manuel seçilir
  - `excel_amortisman_tablolarinda_takip_edilir_ve_toplu_yevmiye_kaydi_atilir`: Excel tablolarında hesaplanır ve her dönem sonunda muhasebeye toplu yevmiye fişi girilir
  - `amortisman_surecleri_takip_edilmemektedir`: Amortisman süreçleri takip edilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Amortisman Parametreleri ve Varlık Kartı Otomasyon Seviyesini belirler.

#### [AST-022] Şirketinizde aynı varlık için hem yerel vergi mevzuatı (VUK) hem de uluslararası finansal raporlama (TFRS / IFRS / US GAAP / Management) standartlarına göre farklı amortisman ve değerleme defterleri (Depreciation Areas / Books) tutulmakta mıdır?
- **Süreç:** Faydalı Ömür ve Amortisman Bağlantısı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `coklu_amortisman_alani_vuk_ve_tfrs_ifrs_ayri_defter_ve_omurle_es_zamanli_tutulur`: Evet; aynı varlık için hem VUK hem TFRS/IFRS farklı faydalı ömür ve değerlerle paralel hesaplanır
  - `yalnizca_yasal_vuk_amortisman_defteri_tutulur_ikinci_bir_raporlama_defteri_yoktur`: Yalnızca yasal VUK amortisman defteri tutulur; ikinci bir uluslararası değerleme defteri yoktur
  - `tfrs_duzeltmeleri_yil_sonunda_bagimsiz_denetim_icin_excelde_manuel_hesaplanir`: ERP'de tek defter tutulur; TFRS amortisman farkları yıl sonunda denetim için Excel'de hesaplanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Çoklu Amortisman Defteri (Multi-Depreciation Area / VUK vs IFRS) Gereksinimini belirler.

---

### 12. Garanti Yönetimi

#### [AST-023] Satın alınan makine, araç, test cihazı ve bilişim ekipmanlarının Garanti Başlangıç ve Bitiş Tarihleri, garanti kapsamı ve yetkili servis sağlayıcı bilgileri sistemde takip edilmekte midir?
- **Süreç:** Garanti Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `garanti_tarihleri_kapsami_ve_yetkili_servis_bilgisi_varlik_kartinda_eksiksiz_izlenir`: Evet; garanti başlangıç/bitiş tarihleri, kapsamı ve yetkili servis sözleşmesi varlık kartında kayıtlıdır
  - `yalnizca_fatura_tarihi_bilinir_garanti_sureleri_dosyalanan_evraklardan_manuel_bakilir`: Sistemde yalnız fatura tarihi vardır; garanti süresi gerektiğinde basılı evraklardan incelenir
  - `yalnizca_it_ve_buyuk_makinelerde_takip_edilir_digerlerinde_tutulmaz`: Yalnızca IT sunucu/bilgisayarları ve ana üretim makinelerinde takip edilir; diğerlerinde tutulmaz
  - `garanti_takibi_yapilmamaktadir`: Garanti takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Garanti Sözleşmesi ve Servis Sağlayıcı Modül İhtiyacını belirler.

#### [AST-024] Garanti süresi dolmak üzere olan varlıklar için ilgili birimlere (Bakım, IT, İdari İşler) otomatik yaklaşma uyarısı (Alarm / Bildirim) gönderilmekte ve garanti kapsamındaki arıza masrafları tedarikçiye rücu edilmekte midir?
- **Süreç:** Garanti Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `AST-023 != "garanti_takibi_yapilmamaktadir"`
- **Seçenekler:**
  - `garanti_bitimine_30_60_gun_kala_otomatik_alarm_uretilir_ve_arizalar_garantiden_takip_edilir`: Evet; garanti bitimine 30/60 gün kala sistem alarm üretir ve arıza durumunda tedarikçi servis kaydı açılır
  - `otomatik_alarm_yoktur_ariza_oldugunda_personel_manuel_kontrol_eder`: Otomatik alarm yoktur; arıza yaşandığında bakım veya IT personeli garanti durumunu manuel sorgular
  - `garanti_alarmi_veya_tedarikci_rucu_sureci_isletilmemektedir`: Garanti yaklaşma alarmı veya rücu takip süreci işletilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Garanti Bitiş Erken Uyarı ve Tedarikçi Garanti Rücu Takibini belirler.

---

### 13. Sigorta Yönetimi

#### [AST-025] Tesis, makine, araç ve kritik ekipmanların Sigorta Poliçesi (Poliçe No, Sigorta Şirketi, Teminat Bedeli, Başlangıç ve Bitiş Tarihi) takibi sistemde varlık bazında yapılmakta mıdır?
- **Süreç:** Sigorta Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `varlik_bazinda_sigorta_policesi_teminat_bedeli_ve_bitis_tarihi_sistemde_tutulur`: Evet; araç, bina ve makinelerin sigorta poliçe no, teminat bedeli ve bitiş tarihi sistemde izlenir
  - `yalnizca_sirket_araclari_icin_kasko_trafik_sigortasi_takip_edilir_makineler_tutulmaz`: Yalnızca şirket araçları için sigorta/kasko takip edilir; üretim makineleri poliçeleri tek tek işlenmez
  - `tum_fabrika_icin_toplu_tek_bir_yangin_makine_policesi_vardir_varlik_bazinda_baglanmaz`: Tüm tesis için toplu genel sigorta poliçesi vardır; münferit varlık kartlarına tek tek bağlanmaz
  - `varlik_bazli_sigorta_takibi_yapilmamaktadir`: Varlık bazlı sigorta takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Sigorta Poliçe Entegrasyonu ve Teminat Değeri İzleme Kapsamını belirler.

#### [AST-026] Sigorta poliçesi yenileme tarihleri yaklaştığında sistem alarm vermekte ve hasar/kaza durumlarında sigorta tazminat ve onarım süreçleri varlık kartı üzerinden izlenebilmekte midir?
- **Süreç:** Sigorta Yönetimi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `AST-025 != "varlik_bazli_sigorta_takibi_yapilmamaktadir"`
- **Seçenekler:**
  - `police_yenileme_alarmlari_calisir_ve_hasar_tazminat_dosyalari_varlikla_eslesir`: Evet; poliçe bitimine yakın otomatik bildirim gider ve hasar dosyaları varlık kartına bağlanır
  - `sigorta_sirketi_veya_broker_hatirlatir_sistemden_otomatik_alarm_alinmaz`: Sigorta brokeri veya şirketi manuel hatırlatır; sistemden otomatik alarm üretilmez
  - `police_yenileme_veya_hasar_takip_sureci_sistemde_yoktur`: Poliçe yenileme veya hasar takip süreci sistemde bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Poliçe Yenileme Otomasyonu ve Hasar Tazminat Dosya Yönetimini belirler.

---

### 14. Varlık Transferi

#### [AST-027] Varlıkların farklı lokasyonlar, departmanlar, masraf merkezleri veya kullanıcılar arasındaki kurum içi transfer süreci (Asset Transfer) sistemde nasıl onaylanıp yürütülmektedir?
- **Süreç:** Varlık Transferi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistemden_transfer_talebi_acilir_gonderen_ve_alan_yonetici_onayiyla_kayitlar_otomatik_guncellenir`: Sistemden transfer talebi açılır; gönderen ve teslim alan yönetici onayıyla lokasyon ve masraf merkezi değişir
  - `fiziksel_olarak_tasinir_ancak_sistemdeki_masraf_merkezi_ve_lokasyon_manuel_veya_gecikmeli_degisir`: Fiziksel olarak taşınır; sistem kayıtları İdari İşler veya Muhasebe tarafından sonradan manuel güncellenir
  - `lokasyon_ve_kullanici_degisse_de_sabit_kiymet_kartindaki_ilk_masraf_merkezi_degistirilmez`: Varlık yer değiştirse de sistemdeki ilk kayıtlı masraf merkezi değiştirilmez, sabit kalır
  - `varlik_transfer_sureci_takip_edilmemektedir`: Varlık transfer süreci takip edilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Transfer İş Akışı, Çift Taraflı Onay ve Masraf Merkezi Güncelleme Modelini belirler.

#### [AST-028] Fabrikalar veya şehirlerarası tesisler arasındaki varlık transferlerinde nakliye ve sevk irsaliyesi bağlantısı kurularak yoldaki varlık statüsü (In-Transit Asset) takip edilmekte midir?
- **Süreç:** Varlık Transferi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `sevk_irsaliyesi_baglanir_varlik_yolda_statusune_alinir_ve_tesis_mal_kabulunde_tamamlanir`: Evet; dahili sevk irsaliyesi kesilir, varlık yolda statüsüne geçer ve karşı tesis teslim alınca lokasyon güncellenir
  - `kagit_irsaliye_kesilir_ancak_sistemde_yoldaki_varlik_statu_ayrimi_yoktur`: Kağıt irsaliye düzenlenir ancak sistemde yoldaki varlık ayrımı yoktur; doğrudan yeni lokasyona aktarılır
  - `sehirlerarasi_veya_tesisler_arasi_varlik_sevkiyati_yapilmamaktadir`: Tesisler veya şehirlerarası varlık sevkiyatı yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Yoldaki Varlık (In-Transit) ve Tesisler Arası İrsaliyeli Sevkiyat Entegrasyonunu belirler.

---

### 15. Değer Artırıcı Harcamalar / Capitalization

#### [AST-029] Mevcut bir varlığa sonradan yapılan büyük revizyon, kapasite artırımı, modernizasyon (Retrofit) veya ek aparat harcamaları varlığın defter değerine (Capital Improvement / Ek Maliyet) nasıl eklenmektedir?
- **Süreç:** Değer Artırıcı Harcamalar / Capitalization | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `fatura_mevcut_varlik_kartina_ek_maliyet_olarak_baglanir_ve_faydali_omur_amortisman_yeniden_hesaplanir`: Fatura mevcut varlık kartına ek değer olarak bağlanır; net defter değeri artırılıp amortisman planı revize edilir
  - `ek_harcama_icin_ayri_bir_alt_sabit_kiymet_karti_acilarak_ana_varliga_baglanir`: Ek harcama için bağımsız yeni bir alt sabit kıymet kartı açılır ve ana makineye referans verilir
  - `tum_sonraki_harcamalar_tutarina_bakilmaksizin_donemsel_bakim_onarim_giderine_yazilir`: Modernizasyon yapılsa dahi tüm harcamalar dönemsel 770/730 bakım-onarım giderine yazılır; varlığa eklenmez
  - `deger_artirici_harcama_sureci_takip_edilmemektedir`: Değer artırıcı harcama süreci takip edilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Sonradan Kapitalizasyon ve Amortisman Yeniden Hesaplama Yöntemini belirler.

#### [AST-030] Yapılan teknik bir harcamanın doğrudan dönemsel Bakım-Onarım Gideri mi yoksa Varlık Değerini Artırıcı Yatırım (Capitalization) mı olduğuna karar verme kriteri ve onay akışı nasıl işletilmektedir?
- **Süreç:** Değer Artırıcı Harcamalar / Capitalization | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `belirlenmis_tutar_limiti_ve_faydali_omur_uzatma_kriterine_gore_muhasebe_ve_teknik_ekip_birlikte_onaylar`: Belirlenmiş tutar eşiği ve kapasite/ömür artırma kriterine göre Teknik Müdür ve Mali İşler ortak kararla onaylar
  - `karar_tamamen_muhasebe_tarafindan_faturadaki_aciklamaya_bakilarak_tek_tarafli_verilir`: Karar tamamen Muhasebe personeli tarafından fatura açıklamasına ve yasal VUK sınırına bakılarak verilir
  - `standart_bir_kriter_veya_ayrim_yoktur_tamamen_donemsel_butce_durumuna_gore_karar_verilir`: Standart bir kriter yoktur; dönemsel kârlılık ve bütçe hedeflerine göre gider veya varlık yazılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Bakım Gideri vs Yatırım Harcaması Ayrıştırma ve Ortak Onay Mekanizmasını belirler.

---

### 16. Varlık Bölme / Birleştirme

#### [AST-031] Tek bir ana sabit kıymetin birden fazla bağımsız varlığa bölünmesi (Asset Split) veya birden fazla münferit varlığın tek bir varlık/hat altında birleştirilmesi (Asset Merge) ihtiyacı nasıl yönetilmektedir?
- **Süreç:** Varlık Bölme / Birleştirme | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `sistemden_varlik_bolme_ve_birlestirme_islemi_maliyet_ve_amortisman_paylastirilarak_yapilabilir`: Evet; sistem üzerinden varlık bölme/birleştirme işlemiyle maliyet ve birikmiş amortisman otomatik paylaştırılır
  - `eski_varliklar_sistemden_cikarilip_yeni_varliklar_manuel_yeni_degerleriyle_bastantan_tanimlanir`: Eski kartlar kayıttan düşülüp yeni varlıklar sıfırdan manuel kart açılarak sisteme girilir
  - `varlik_bolme_veya_birlestirme_ihtiyaci_olmamaktadir`: Şirketimizde varlık bölme veya birleştirme ihtiyacı oluşmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Bölme (Split) ve Birleştirme (Merge) Modül Yeteneği Gereksinimini belirler.

#### [AST-032] Varlık bölme işleminde orijinal edinim maliyeti, birikmiş amortisman ve net defter değeri yeni parçalara hangi yöntemle (Yüzde Oran, Miktar, Tutar veya Ekspertiz Değeri) dağıtılmaktadır?
- **Süreç:** Varlık Bölme / Birleştirme | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `yuzdesel_oran_veya_tutar_belirtilerek_orijinal_maliyet_ve_amortisman_oransal_dagitilir`: Yüzdesel oran veya hedef tutar girilerek orijinal maliyet ve birikmiş amortisman matematiksel paylaştırılır
  - `muhasebe_tarafindan_harici_olarak_hesaplanip_manuel_rakamlar_olarak_girilir`: Muhasebe tarafından harici olarak hesaplanır ve yeni kartlara manuel tutarlar yazılır
  - `varlik_bolme_islemi_yapilmamaktadir`: Varlık bölme işlemi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Split Matematiksel Paylaştırma ve Amortisman Dağıtım Algoritmasını belirler.

---

### 17. Fiziksel Sayım

#### [AST-033] Şirket genelinde duran varlıkların ve sabit kıymetlerin Fiziksel Sayımı (Physical Asset Count / Audit) hangi periyotlarla ve hangi yöntemle gerçekleştirilmektedir?
- **Süreç:** Fiziksel Sayım | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `yılda_en_az_bir_kez_tum_tesislerde_planli_fiziksel_sayim_yapilir_ve_kayitlarla_karsilastirilir`: Yılda en az bir kez tüm tesislerde planlı fiziksel sayım yapılır ve ERP kayıtlarıyla mutabakat sağlanır
  - `belirli_araliklarla_yalnizca_it_ve_yuksek_degerli_makineler_sayilir_mobilya_sayilmaz`: Yalnızca IT ve yüksek değerli üretim makineleri periyodik sayılır; ofis demirbaşları sayılmaz
  - `yalnizca_bagimsiz_denetim_veya_sirket_tasinmasi_gibi_ozel_durumlarda_sayim_yapilir`: Yalnızca bağımsız denetim veya taşınma gibi özel durumlarda düzensiz sayım yapılır
  - `fiziksel_varlik_sayimi_yapilmamaktadir`: Fiziksel varlık sayımı yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Fiziksel Sabit Kıymet Sayım Döngüsü ve Mutabakat Disiplinini belirler.

#### [AST-034] Fiziki sayım esnasında mobil el terminalleri / barkod / RFID okuyucular kullanılmakta ve sistemdeki kayıtlar ile sahadaki fiili varlıklar otomatik karşılaştırılarak Sayım Fark Raporu üretilmekte midir?
- **Süreç:** Fiziksel Sayım | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `AST-033 != "fiziksel_varlik_sayimi_yapilmamaktadir"`
- **Seçenekler:**
  - `mobil_terminal_veya_tablet_ile_barkod_okutularak_sayilir_ve_sistem_otomatik_fark_raporu_verir`: Evet; mobil cihazla barkod/QR okutularak sayılır, sistem bulunan/bulunamayan/yeri yanlış listesini anında döker
  - `basili_kagit_veya_excel_listesi_uzerinden_elle_isaretlenerek_sayilir_sonradan_girilir`: Basılı kağıt listeler üzerinden elle işaretlenir, sayım sonrası Excel'e manuel aktarılır
  - `sayim_yapilsa_da_sistemle_karsilastirmali_fark_raporu_cikarilmamaktadir`: Sayım yapılsa da sistemle otomatik karşılaştırmalı fark analizi raporu çıkarılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Mobil Sayım Uygulaması ve Sayım Fark Mutabakat Motorunu belirler.

---

### 18. Kayıp / Çalınma / Hasar

#### [AST-035] Fiziki sayımda veya günlük operasyonda bulunamayan, çalınan veya ağır hasar gören varlıklar için Kayıp / Hasar Araştırma ve Tutanak süreci nasıl işletilmektedir?
- **Süreç:** Kayıp / Çalınma / Hasar | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistemde_varlik_kayip_veya_hasarli_statusune_alinir_arastirma_tutanagi_ve_onay_sureci_baslatilir`: Varlık sistemde 'Kayıp/Araştırmada' statüsüne alınır; komisyon tutanağı ve araştırma süreci işletilir
  - `harici_olarak_idari_isler_tarafindan_kagit_tutanak_tutulur_sistemde_ozel_bir_statu_degisikligi_olmaz`: Harici kağıt tutanak tutulur; sistemde özel bir statü ayrımı yapılmaz, aktif görünmeye devam eder
  - `kayip_veya_hasar_durumlarinda_standart_bir_arastirma_proseduru_yoktur`: Kayıp veya hasar durumlarında standart bir araştırma ve tespit prosedürü işletilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Kayıp Varlık Araştırma, Komisyon Tutanak ve Statü İzolasyonunu belirler.

#### [AST-036] Araştırma sonucunda bulunamayan veya kullanılamaz hale gelen kayıp varlıkların aktiften çıkarılması (Write-Off / Zarara Mahsup) için yönetim onay mekanizması ve yasal işlem entegrasyonu var mıdır?
- **Süreç:** Kayıp / Çalınma / Hasar | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `genel_mudur_cfo_onayli_tutanak_ile_sistemden_write_off_yapilir_ve_zarar_kaydi_otomatik_olusturulur`: Evet; Yönetim onaylı tutanak sisteme eklenerek write-off yapılır ve net defter değeri zarara mahsup edilir
  - `kayip_varliklar_yillarca_sistemde_aktif_kalir_yalnizca_itfa_olunca_toplu_temizlenir`: Kayıp varlıklar aktiften düşülmez; amortismanı sıfırlanana kadar sistemde hayalet varlık olarak kalır
  - `kayip_varlik_aktiften_dusme_veya_write_off_sureci_isletilmemektedir`: Kayıp varlık aktiften düşme veya write-off süreci işletilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Kayıp Varlık Aktiften Düşme (Write-Off) ve Zarar Muhasebeleştirme Entegrasyonunu belirler.

---

### 19. Kullanım Dışı / Idle Asset

#### [AST-037] Üretimde veya operasyonda fiilen kullanılmayan, arıza bekleyen, yedek tutulan veya atıl durumdaki varlıklar (Idle / Mothballed / Inactive Assets) sistemde özel bir statüyle ayrıştırılmakta mıdır?
- **Süreç:** Kullanım Dışı / Idle Asset | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `varlik_statusu_atil_yedek_kullanim_disi_olarak_isaretlenir_ve_ayri_raporlanir`: Evet; çalışmayan varlıklar 'Atıl / Yedek / Kullanım Dışı' statüsüne alınır ve yönetim raporlarında ayrıştırılır
  - `tum_varliklar_calisiyor_gibi_tek_bir_aktif_statusunde_gorunur_ayrim_yapilmaz`: Tüm varlıklar çalışıyor gibi tek bir 'Aktif' statüsündedir; atıl veya yedek makine ayrımı yoktur
  - `yalnizca_fabrika_mudurunun_veya_bakim_ekibinin_kendi_listesinde_bilinir`: Sistemde görünmez; yalnızca fabrika veya bakım şefinin kendi notlarında bilinir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Atıl/Yedek Varlık Statü Yönetimi ve Kapasite Kullanım Analizini belirler.

#### [AST-038] Atıl veya kullanım dışı durumdaki varlıkların yeniden değerlendirilmesi (Farklı fabrikaya kaydırma, revizyon, satışa çıkarma veya hurdaya ayırma) için periyodik atıl varlık gözden geçirme mekanizması bulunmakta mıdır?
- **Süreç:** Kullanım Dışı / Idle Asset | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `donemsel_olarak_atil_varlik_raporu_cikarilir_ve_yeniden_degerlendirme_veya_satis_karari_alinir`: Evet; 6 aylık/yıllık periyotlarla atıl varlıklar incelenir; satış, transfer veya revizyon kararı verilir
  - `atil_varliklar_depoda_veya_sahada_bekletilir_duzenli_bir_gozden_gecirme_yapilmaz`: Atıl varlıklar depolarda bekletilir; düzenli bir inceleme ve tasfiye mekanizması işletilmez
  - `atil_varlik_gozden_gecirme_sureci_yoktur`: Atıl varlık gözden geçirme süreci yoktur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Atıl Varlık Tasfiye, Yeniden Değerlendirme ve Kaynak Verimlilik Döngüsünü belirler.

---

### 20. Hurda / Satış / Elden Çıkarma

#### [AST-039] Kullanım ömrünü tamamlayan veya elden çıkarılacak varlıkların (Hurdaya Ayırma, Satış, İtlaf, Bağış) yaşam döngüsü kapanış süreci (Asset Disposal / Retirement) nasıl yürütülmektedir?
- **Süreç:** Hurda / Satış / Elden Çıkarma | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistemden_hurda_veya_satis_talebi_acilir_komisyon_ve_yonetim_onayiyla_varlik_kapatilir`: Sistemden elden çıkarma talebi açılır; Hurda Komisyonu ve Yönetim onayıyla varlık resmi olarak kapatılır
  - `fiziksel_olarak_satilir_veya_hurdaya_verilir_muhasebe_ay_sonunda_faturadan_kapatir`: Fiziksel olarak elden çıkarılır; Muhasebe satış faturası kesildiğinde kartı sonradan kapatır
  - `hurdaya_ayrılan_varliklar_sistemde_kapatilmaz_pasif_veya_silinmis_olarak_birakilir`: Hurdaya ayrılan varlıklar resmi kapatılmaz; sistemde unutulur veya silinir
  - `standart_bir_elden_cikarma_sureci_yoktur`: Standart bir hurda veya elden çıkarma süreci yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Emekliye Ayırma (Disposal), Hurda Komisyon Onayı ve Yaşam Döngüsü Kapanışını belirler.

#### [AST-040] Duran varlık satışında veya hurdaya ayrılmasında satış faturası, hurda tutanağı, amortisman kapatma ve net kâr/zarar oluşumu sistemde tek adımda entegre olarak çözülebilmekte midir?
- **Süreç:** Hurda / Satış / Elden Çıkarma | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `satis_faturasi_kesildigi_an_varlik_karti_kapanir_birikmis_amortisman_ve_kar_zarar_otomatik_hesaplanir`: Evet; satış faturası varlığa bağlandığı an varlık kapatılır, birikmiş amortisman ve kâr/zarar otomatik işlenir
  - `fatura_kesilir_ancak_varlik_amortisman_kapatmasi_ve_kar_zarar_yevmiyesi_muhasebede_manuel_yapilir`: Fatura kesilir ancak amortisman kapatma ve kâr/zarar mahsubu muhasebe tarafından manuel fişle çözülür
  - `varlik_cikisi_muhasebe_entegrasyonu_bulunmamaktadir`: Varlık çıkışının muhasebe entegrasyonu bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Sabit Kıymet Satış/Hurda Otomatik Muhasebe Entegrasyonu ve Kâr/Zarar Ayrıştırmasını belirler.

---

### 21. Bakım Entegrasyonu

#### [AST-041] Üretim ve tesis makinelerinde Varlık Yönetimi kartı (Sabit Kıymet) ile Bakım Yönetimi modülündeki Teknik Ekipman Kartı (Maintenance Equipment) arasında doğrudan bir ilişki ve eşleşme (Asset ↔ Equipment Mapping) bulunmakta mıdır?
- **Süreç:** Bakım Entegrasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `varlik_karti_ile_teknik_ekipman_karti_birebir_entegredir_ve_ayni_kimlik_uzerinden_senkron_calisir`: Evet; kurumsal sabit kıymet kartı ile bakım ekipmanı kartı birebir eşleştirilmiştir ve senkron çalışır
  - `bakim_ekibi_ayri_bir_yazilimda_ekipman_tutar_sabit_kiymetle_aralarinda_resmi_bir_bag_yoktur`: Bakım ekibi ayrı bir CMMS/Excel listesinde ekipman tutar; muhasebe sabit kıymetiyle aralarında bağ yoktur
  - `yalnizca_ana_tezgahlarda_manuel_eslesme_vardir_diger_ekipmanlarda_bag_kurulmamistir`: Yalnızca ana üretim tezgâhlarında manuel eşleştirme vardır; diğer ekipmanlarda bağlantı kurulmamıştır
  - `bakim_ekipmani_ile_varlik_arasinda_iliski_kurulmamaktadir`: Bakım ekipmanı ile varlık kartı arasında herhangi bir ilişki kurulmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Finansal Sabit Kıymet Kartı ile Bakım Teknik Ekipman Kartı (1-to-1 Mapping) Entegrasyonunu belirler.

#### [AST-042] Bakım modülünde açılan iş emirleri, parça değişimleri ve teknisyen harcamalarının toplam kümülatif bakım maliyeti (TCO - Total Cost of Ownership) varlık kartı üzerinde konsolide görülebilmekte midir?
- **Süreç:** Bakım Entegrasyonu | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `AST-041 != "bakim_ekipmani_ile_varlik_arasinda_iliski_kurulmamaktadir"`
- **Seçenekler:**
  - `varlik_kartinda_edinim_maliyeti_birikmis_amortisman_ve_kumulatif_bakim_masrafi_birlikte_gorulur`: Evet; varlık kartında edinim bedeli, birikmiş amortisman ve ömrü boyunca yapılan toplam bakım masrafı tek ekranda izlenir
  - `bakim_masraflari_yalnizca_masraf_merkezi_raporunda_gorulur_varlik_kartina_yansimaz`: Bakım masrafları yalnızca masraf merkezi gider raporunda genel görünür; münferit varlık kartına yansımaz
  - `kumulatif_bakim_veya_tco_maliyeti_takip_edilmemektedir`: Kümülatif bakım veya toplam sahip olma (TCO) maliyeti takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Bazında Toplam Sahip Olma Maliyeti (TCO) ve Bakım Masraf Konsolidasyonunu belirler.

---

### 22. Belge ve Dokümanlar

#### [AST-043] Varlık kartına bağlı olarak fatura, garanti belgesi, araç ruhsatı, sigorta poliçesi, teknik şartname, CE uygunluk belgesi, kullanım kılavuzu, fotoğraf ve teslim tutanağı gibi dijital dokümanlar (Attachments) arşivlenmekte midir?
- **Süreç:** Belge ve Dokümanlar | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_fatura_ruhsat_garanti_fotograf_ve_kullanim_kilavuzlari_varlik_kartina_dijital_eklenir`: Evet; fatura, ruhsat, garanti, teknik çizim, fotoğraf ve zimmet tutanakları varlık kartında dijital arşivlenir
  - `yalnizca_fiziksel_klasorlerde_arsivlenir_sistemde_dijital_dosya_eklenmez`: Yalnızca muhasebe ve idari işler fiziksel klasörlerinde kağıt saklanır; sisteme dijital ek yapılmaz
  - `yalnizca_arac_ruhsatlari_ve_buyuk_makine_faturalari_eklenir_digerlerinde_tutulmaz`: Yalnızca araç ruhsatları ve ana makine faturaları taranır; genel demirbaşlarda ek dosya tutulmaz
  - `dokuman_arsivleme_yapilmamaktadir`: Dijital veya düzenli doküman arşivleme yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Sabit Kıymet Dijital Doküman Yönetimi ve İlişkili Belge Arşivi Kapsamını belirler.

---

### 23. Varlık Geçmişi / Audit Trail

#### [AST-044] Varlığın ediniminden elden çıkarılmasına kadar geçen süreçteki lokasyon, kullanıcı, zimmet, masraf merkezi, operasyonel statü, değer artışı ve transfer değişikliklerinin tarihçesi (Asset Lifecycle Audit Trail) sistemde tutulmakta mıdır?
- **Süreç:** Varlık Geçmişi / Audit Trail | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_lokasyon_zimmet_masraf_merkezi_ve_statu_degisiklikleri_kullanici_ve_tarih_damgasiyla_saklanir`: Evet; varlığın geçmişteki tüm kullanıcıları, eski lokasyonları, masraf merkezi ve statü hareketleri loglanır
  - `yalnizca_guncel_durum_bilgisi_tutulur_onceki_kullanici_veya_lokasyon_gecmisi_ezilir`: Yalnızca anlık güncel durum tutulur; değişiklik yapıldığında eski kullanıcının veya konumun geçmişi ezilir
  - `tarihce_ve_hareket_gecmisi_takip_edilmemektedir`: Varlık tarihçesi ve denetim izi (audit trail) tutulmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Yaşam Döngüsü Denetim İzi (Audit Trail) ve Değişiklik Tarihçe Motorunu belirler.

---

### 24. Varlık Raporlama ve KPI

#### [AST-045] Varlık yönetimi kapsamında toplam varlık değeri, sınıf/lokasyon bazlı dağılım, amortisman durumu, varlık yaş analizi, atıl varlık oranı, garanti/sigorta bitiş takvimi ve transfer geçmişi gibi yönetim raporları ve KPI panoları nasıl alınmaktadır?
- **Süreç:** Varlık Raporlama ve KPI | **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `varlik_sinifi_lokasyon_ve_sirket_bazinda_toplam_ve_net_defter_degeri_raporu`: Varlık Sınıfı, Lokasyon ve Şirket Bazında Toplam Maliyet ve Net Defter Değeri Raporu
  - `tamamen_itfa_olmus_ancak_fiilen_calisan_varliklar_listesi`: Tamamen İtfa Olmuş (Amortismanı Bitmiş) Ancak Sahada Fiilen Çalışan Varlıklar Listesi
  - `atil_yedek_ve_kullanim_disi_varlik_orani_ve_maliyeti`: Atıl, Yedek ve Kullanım Dışı Varlık Oranı ve Maliyet Raporu
  - `yaklasan_garanti_ve_sigorta_police_bitis_takvimi`: Yaklaşan Garanti ve Sigorta Poliçe Bitiş Takvimi / Alarm Raporu
  - `varlik_yas_ve_teknolojik_eskime_analizi`: Varlık Yaş Dağılımı ve Teknolojik Yenileme İhtiyaç Analizi
  - `fiziksel_sayim_sonuclari_ve_kayip_bulunamayan_varlik_raporu`: Fiziksel Sayım Fark Mutabakatı ve Kayıp/Bulunamayan Varlık Raporu
  - `personel_ve_departman_zimmet_dokumu`: Personel ve Departman Bazında Güncel ve Geçmiş Zimmet Dökümü
  - `yonetim_raporlari_ve_kpi_panosu_alinamamaktadir`: Yönetim raporları veya KPI panosu düzenli olarak alınamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Varlık Karar Etkisi:** Varlık Yönetimi Yönetici Gösterge Paneli (KPI Dashboard) ve Raporlama Gereksinimlerini belirler.

---

## 5. Cross-Pack Duplication Audit (Örtüşme ve Sınır Ayrımı Denetimi)

| Karşılaştırılan Modül | Örtüşen Soru Sayısı | Sınır Ayrımı Prensibi |
| :--- | :---: | :--- |
| **ACCOUNTING** | **0** | `ACCOUNTING` 253/254/255/257 hesaplarını, amortisman mahsup fişini ve dönem sonu bilanço kayıtlarını sorgular. `ASSET_MANAGEMENT` ise varlığın fiziksel kimliğini, yerini, kullanıcısını, seri numarasını, transferini ve hurda/sayım yaşam döngüsünü sorgular. |
| **MAINTENANCE** | **0** | `MAINTENANCE` arıza tamirini, bakım iş emrini, periyodik bakım takvimini ve teknisyen müdahalelerini sorgular. `ASSET_MANAGEMENT` bu makinenin kurumsal sabit kıymet kartını, garantisini, sigortasını, mülkiyetini ve bakım ekipmanı ile 1-to-1 eşleşmesini sorgular. |
| **COSTING** | **0** | `COSTING` makine saat ücretini ve amortismanın ürün maliyetine yüklenmesini sorgular. `ASSET_MANAGEMENT` amortismana tabi varlığın aktifleştirme değerini, faydalı ömrünü ve masraf merkezi bağlantısını sorgular. |
| **PROCUREMENT** | **0** | `PROCUREMENT` satın alma talebi, teklif ve sipariş sürecini yönetir. `ASSET_MANAGEMENT` mal kabul sonrası varlığın aktifleştirilmesini, nakliye/montaj masraflarının varlık değerine eklenmesini ve işletme döngüsünü sorgular. |
| **INVENTORY / WAREHOUSE** | **0** | `INVENTORY` ve `WAREHOUSE` ambar stok hareketlerini ve hammadde/parça giriş-çıkışını sorgular. `ASSET_MANAGEMENT` şirket demirbaşlarını, IT cihazlarını, ofis ve üretim varlıklarının tesis içi yerleşimini ve zimmetini sorgular. |
| **TÜM DİĞER MODÜLLER** | **0** | Külliyattaki diğer tüm modüllerle sıfır çakışma ve net fonksiyonel sınır ayrımı sağlanmıştır. |
