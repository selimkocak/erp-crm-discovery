# FAZ-27 — MALİYETLENDİRME / COSTING SAHA SORU PAKETİ KILAVUZU

Bu doküman, **ERP CRM Discovery** platformunun on sekizinci kanonik saha soru paketi olan **`COSTING` (Maliyetlendirme / Ürün Maliyet Muhasebesi ve Sapma Analizi)** modülünün tüm süreçlerini, soru kataloğunu, koşullu dallanma kurallarını, ERP/Maliyet karar etkilerini ve çapraz modül sınır ayrımı denetimlerini (Cross-Pack Duplication Audit) içerir.

---

## 1. Modül Kimliği ve Temel Parametreler

- **Kanonik İş Fonksiyonu Kodu:** `COSTING`
- **Türkçe Adı:** Maliyetlendirme
- **İngilizce Adı:** Costing
- **Paket Kimliği (Pack ID):** `tr.costing.core`
- **Sürüm:** `0.1.0`
- **Şema Sürümü:** `1`
- **Dil:** `tr` (Türkçe)
- **Toplam Soru Sayısı:** **45 Soru** (`CST-001` .. `CST-045`)
- **Zorunlu Soru Sayısı:** **24 Zorunlu**
- **Opsiyonel Soru Sayısı:** **21 Opsiyonel**
- **Kapsanan Süreç Sayısı:** **25 Kanonik Süreç**
- **Branching (Koşullu Dallanma) Sayısı:** **5 Koşullu Kural**

---

## 2. 25 Kanonik Süreç Dağılımı

1. **Maliyet Organizasyonu** (2 Soru — CST-001, CST-002)
2. **Maliyet Nesneleri** (2 Soru — CST-003, CST-004)
3. **Maliyet Yöntemleri** (2 Soru — CST-005, CST-006)
4. **Standart Maliyet** (2 Soru — CST-007, CST-008)
5. **Fiili Maliyet** (2 Soru — CST-009, CST-010)
6. **Tahmini / Simülasyon Maliyeti** (2 Soru — CST-011, CST-012)
7. **Malzeme Maliyeti Kaynağı** (2 Soru — CST-013, CST-014)
8. **Çok Seviyeli BOM Maliyet Roll-Up** (2 Soru — CST-015, CST-016)
9. **Yarı Mamul Maliyeti** (2 Soru — CST-017, CST-018)
10. **İşçilik Maliyeti** (2 Soru — CST-019, CST-020)
11. **Makine / Work Center Maliyeti** (2 Soru — CST-021, CST-022)
12. **Setup Maliyeti** (2 Soru — CST-023, CST-024)
13. **Genel Üretim Giderleri** (2 Soru — CST-025, CST-026)
14. **Dış Operasyon Maliyeti** (2 Soru — CST-027, CST-028)
15. **Fire ve Rework Maliyeti** (2 Soru — CST-029, CST-030)
16. **Landed Cost / Ek Maliyetler** (2 Soru — CST-031, CST-032)
17. **Kur ve Döviz Etkisi** (2 Soru — CST-033, CST-034)
18. **Maliyet Versiyonları** (2 Soru — CST-035, CST-036)
19. **Maliyet Güncelleme ve Freeze** (2 Soru — CST-037, CST-038)
20. **Standart / Fiili Sapmalar** (2 Soru — CST-039, CST-040)
21. **Üretim Sapma Analizi** (1 Soru — CST-041)
22. **Stok Değerleme Entegrasyonu** (1 Soru — CST-042)
23. **Teklif / Fiyatlandırma Entegrasyonu** (1 Soru — CST-043)
24. **Maliyet Kapanışı** (1 Soru — CST-044)
25. **Maliyet Raporlama ve KPI** (1 Soru — CST-045)

---

## 3. Detaylı Soru Kataloğu ve ERP/Maliyet Karar Etkisi

### 1. Maliyet Organizasyonu

#### [CST-001] Şirketinizde ürün maliyetlendirme, reçete/rota maliyet hesaplamaları ve üretim sapma analizi faaliyetleri hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?
- **Süreç:** Maliyet Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `ayri_ve_uzmanlasmis_maliyet_muhasebesi_veya_finansal_kontrol_ekibi_tarafindan_yonetilir`: Evet; Muhasebe/Finans Direktörlüğü altında ayrı bir Maliyet Muhasebesi / Kontrolörlük ekibi yönetir
  - `genel_muhasebe_ekibi_donem_sonlarinda_toplu_maliyet_hesaplamasi_yapar`: Ayrı bir maliyet ekibi yoktur; genel muhasebe personeli dönem sonlarında toplu hesaplama yapar
  - `uretim_planlama_veya_arge_ekibi_excel_tablolarinda_maliyet_cikarir_finansla_baglantisizdir`: Üretim veya Ar-Ge ekibi Excel'de tahmini maliyet çıkarır; muhasebe defter kayıtlarıyla bağımsız yürür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet Muhasebesi Rol ve Yetkilendirme Matrisini belirler.

#### [CST-002] Maliyet muhasebesi sonuçları ile genel muhasebe mali defter kayıtları arasındaki mutabakat hangi periyotta (Aylık, Çeyreklik, Yıllık) ve yöntemle sağlanmaktadır?
- **Süreç:** Maliyet Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `aylik_mali_kapanis_kapsaminda_maliyet_ve_muhasebe_kayitlari_tam_mutabakatla_kapatilir`: Evet; her ay sonunda maliyet sonuçları ile mizan/yevmiye hesapları tam olarak mutabık kılınır
  - `yalnizca_yil_sonlarinda_resmi_bilanco_oncesi_genel_bir_mutabakat_yapilir`: Aylık mutabakat yoktur; yalnızca yıl sonlarında resmi bilanço ve gelir tablosu için toparlanır
  - `maliyet_ve_genel_muhasebe_arasi_resmi_bir_mutabakat_yapilmamaktadir`: Maliyet ve genel muhasebe arasında düzenli bir mutabakat yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet-Muhasebe Mutabakat ve Dönem Kapanış Entegrasyonunu belirler.

---

### 2. Maliyet Nesneleri

#### [CST-003] Şirketinizde maliyetlerin biriktirildiği ve izlendiği temel Maliyet Nesneleri (Cost Objects — Nihai Ürün/Mamul, Yarı Mamul, Üretim İş Emri, Müşteri Siparişi, Proje, Masraf Merkezi) nelerdir?
- **Süreç:** Maliyet Nesneleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `hem_mamul_yari_mamul_hem_de_is_emri_ve_proje_bazinda_cok_boyutlu_maliyet_izlenir`: Evet; mamul, alt yarı mamuller, tekil iş emirleri, müşteri projeleri ve masraf merkezleri bazında çok boyutlu izlenir
  - `yalnizca_nihai_mamul_kodu_bazinda_standart_maliyet_tutulur_is_emri_maliyeti_yoktur`: Sadece nihai mamul kartı bazında birim maliyet tutulur; tekil iş emirlerinin ayrı maliyeti tutulmaz
  - `maliyet_sadece_fabrika_geneli_toplu_harcama_olarak_izlenir_urun_bazinda_ayrilmaz`: Ürün bazında ayrılmaz; ay sonunda fabrikaya giren toplam hammadde ve giderler topluca görülür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet Nesnesi (Cost Object) ve Maliyet Taşıyıcısı Hiyerarşisini belirler.

#### [CST-004] Müşteriye özel üretilen siparişlerde veya uzun süren projelerde Sözleşme / Müşteri Siparişi Bazlı Maliyet Biriktirme (Sales Order / Project Costing) yapılabilmekte midir?
- **Süreç:** Maliyet Nesneleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `satis_siparisi_veya_proje_kodu_altinda_tum_malzeme_iscilik_ve_dis_hizmetler_toplanarak_net_kar_gorulur`: Evet; projeye/siparişe ait tüm satın almalar ve üretim süreleri o siparişe yüklenir ve gerçekleşen kârlılık dökülür
  - `proje_bazli_ayrim_yoktur_standart_urun_maliyeti_uzerinden_tahmini_kar_hesaplanir`: Sipariş bazlı biriktirme yoktur; standart birim maliyet satış adediyle çarpılarak yaklaşık kâr hesaplanır
  - `proje_veya_siparis_bazli_maliyet_biriktirme_kullanilmamaktadir`: Proje veya sipariş bazlı maliyet biriktirme kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Sipariş ve Proje Bazlı Kârlılık ve Maliyet Muhasebesi Kurgusunu belirler.

---

### 3. Maliyet Yöntemleri

#### [CST-005] Fabrikanızda ürün ve yarı mamul maliyetlerinin hesaplanmasında hangi Temel Maliyet Yöntemi (Standart Maliyet, Fiili Maliyet / Actual Costing, Sipariş Maliyeti / Job Costing, Safha / Proses Maliyeti, Hibrit) esas alınmaktadır?
- **Süreç:** Maliyet Yöntemleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `standart_maliyet_ile_onceden_hesaplanir_donem_sonunda_fiili_maliyet_sapmalari_analiz_edilir_hibrit`: Hibrit Standart/Fiili model; bütçelenmiş standart maliyetler kullanılır, dönem sonunda fiili sapmalar hesaplanır
  - `tamamen_fiili_maliyet_actual_costing_kullanilir_harcanan_fiili_fatura_ve_surelere_gore_cikar`: Tamamen Fiili Maliyet (Actual Costing); her ay gerçekleşen faturalar ve fiili süreler doğrudan ürünlere yüklenir
  - `yalnizca_hareketli_ortalama_veya_son_satin_alma_fiyatina_gore_tahmini_maliyet_hesaplanir`: Resmi bir maliyetleme modeli yoktur; sadece son alış fiyatı veya ortalama hammadde maliyeti baz alınır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Ana Maliyet Hesaplama Motoru ve Metodolojisini belirler.

#### [CST-006] Proses, kimya veya sürekli hat üretimi yapan tesislerde Eşdeğer Birim Maliyet (Equivalent Units / Safha Maliyeti) hesabı uygulanmakta mıdır?
- **Süreç:** Maliyet Yöntemleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `proses_maliyeti_ve_esdeger_birim_hesabi_kazan_tank_hatti_bazinda_uygulanir`: Evet; sürekli hatlarda dönem sonu yarı mamul tamamlama derecesine göre eşdeğer birim maliyet hesaplanır
  - `ayrik_parti_imalati_yapildigi_icin_esdeger_birim_kullanilmaz_parti_maliyeti_baz_alinir`: Ayrık/kesikli imalat yapıldığı için proses safha maliyeti kullanılmaz; parti/iş emri maliyeti geçerlidir
  - `safha_maliyeti_veya_esdeger_birim_kullanilmamaktadir`: Safha maliyeti veya eşdeğer birim hesabı kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Safha Maliyetleme ve Eşdeğer Ürün Değerleme Mimarisini belirler.

---

### 4. Standart Maliyet

#### [CST-007] Ürünlerin planlanan birim maliyetini belirleyen Standart Maliyet (Standard Costing) sistemi hangi periyotta (Yıllık bütçe dönemi, 6 aylık, çeyreklik, aylık) oluşturulup sisteme yüklenmektedir?
- **Süreç:** Standart Maliyet | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `yillik_butce_doneminde_resmi_standart_maliyet_olusturulur_gerekirse_ceyreklerde_revize_edilir`: Evet; her yıl bütçe döneminde onaylı standart maliyet hesaplanır; enflasyon veya kur artışında ara revizyon yapılır
  - `her_ay_bastan_yeni_bir_standart_maliyet_calismasi_yapilir`: Her ay başında güncel hammadde ve işçilik tarifelerine göre yeni standart maliyet oluşturulur
  - `standart_maliyet_sistemi_kullanilmamaktadir`: Standart maliyet sistemi kullanılmamaktadır; yalnızca gerçekleşen harcamalar izlenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Standart Maliyet Çalışma Takvimi ve Bütçe Entegrasyonunu belirler.

#### [CST-008] Standart maliyetler hesaplanırken Ar-Ge, Üretim Mühendisliği, Satın Alma ve Finans ekiplerinin onayını içeren resmi bir Maliyet Onay İş Akışı (Cost Approval Workflow) işletilmekte midir?
- **Süreç:** Standart Maliyet | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `recete_rota_ve_fiyatlar_ilgili_departmanlarca_onaylandiktan_sonra_sistemde_resmi_standart_maliyet_olur`: Evet; reçete Ar-Ge'den, süreler Üretimden, fiyatlar Satın Almadan onaylanır ve Finans tarafından nihai onay verilir
  - `maliyet_uzmani_hesaplamayi_tek_basina_yapar_ve_sisteme_kaydeder_resmi_onay_adimi_yoktur`: Resmi iş akışı yoktur; maliyet uzmanı Excel'de hesaplayıp sisteme doğrudan aktarır
  - `maliyet_onay_is_akisi_bulunmamaktadir`: Standart maliyet onay iş akışı bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Standart Maliyet Onay Matrisi ve Çoklu Departman Doğrulama Kuralını belirler.

---

### 5. Fiili Maliyet

#### [CST-009] Üretim tamamlandığında sahadan gelen fiili malzeme sarfları, fiili işçilik ve makine süreleriyle hesaplanan Fiili Maliyet (Actual Costing) sistemi çalıştırılmakta mıdır?
- **Süreç:** Fiili Maliyet | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `her_is_emri_icin_harcanan_fiili_malzeme_sure_ve_dis_islemlerle_gerceklesen_fiili_maliyet_hesaplanir`: Evet; iş emri kapandığında tüketilen fiili malzeme ve harcanan net saatlerle o partinin fiili maliyeti hesaplanır
  - `yalnizca_standart_maliyet_tutulur_fiili_maliyet_urun_bazinda_hesaplanamaz`: Fiili maliyet hesaplanmaz; ürünler sadece standart maliyetle izlenir, sapmalar genel havuzda kalır
  - `fiili_maliyet_hesaplamasi_yapilmamaktadir`: Fiili ürün maliyeti hesaplaması yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Fiili Maliyetleme (Actual Costing) ve İş Emri Bazlı Değerleme Kurgusunu belirler.

#### [CST-010] Uzun süren üretim iş emirlerinde iş emri henüz tamamlanmadan ara aşamalarda Kümülatif Gerçekleşen Maliyet (WIP Cost to Date) anlık olarak izlenebilmekte midir?
- **Süreç:** Fiili Maliyet | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `is_emri_sururken_o_ana_kadar_yapilan_sarf_ve_iscilik_maliyeti_anlik_ekranda_gorulur`: Evet; iş emrinin henüz 3. operasyonunda dahi o ana kadar ne kadarlık maliyet oluştuğu izlenebilir
  - `is_emri_tamamen_kapanip_ay_sonu_calismasi_bitene_kadar_maliyet_gorulemez`: Ara maliyet görülemez; iş emri kapanıp ay sonu maliyet motoru çalıştırılınca maliyet netleşir
  - `ara_asama_fiili_maliyet_takibi_yapilamamaktadir`: Ara aşama fiili maliyet takibi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Canlı Yarı Mamul (WIP) Maliyet Takibi ve Süreç İçi Maliyet İzleme Kapsamını belirler.

---

### 6. Tahmini / Simülasyon Maliyeti

#### [CST-011] Yeni ürün devreye alma, hammadde zamları veya döviz kuru artışları öncesinde ürünün gelecekteki maliyetini öngören Maliyet Simülasyonu (Cost Simulation / What-If Analizi) yapılabilmekte midir?
- **Süreç:** Tahmini / Simülasyon Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `sistemde_farkli_hammadde_ve_kur_varsayimlariyla_maliyet_simulasyonlari_calistirilip_senaryolar_karsilastirilir`: Evet; sisteme zarar vermeden 'EUR kuru 40 olursa' veya 'Sac fiyatı %15 artarsa' simülasyonları tek tıkla çalıştırılır
  - `simulasyonlar_excel_tablolarinda_manuel_formul_ve_kopyalamalarla_yapilir`: Sistemik simülasyon yoktur; maliyet uzmanı verileri Excel'e çekip formüllerle senaryoları kendisi dener
  - `maliyet_simulasyonu_yapilmamaktadir`: Maliyet simülasyonu veya senaryo analizi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet Simülasyon Motoru ve What-If Senaryo Altyapısını belirler.

#### [CST-012] What-If senaryolarında belirli bir hammadde veya enerji artışının tüm ürün portföyüne etkisini Toplu Simülasyonla (Mass Cost Roll-Up Simulation) dakikalar içinde görmek mümkün müdür?
- **Süreç:** Tahmini / Simülasyon Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `CST-011 != "maliyet_simulasyonu_yapilmamaktadir"`
- **Seçenekler:**
  - `tek_bir_hammadde_zammi_girildiginde_onu_kullanan_tum_mamullerin_yeni_maliyetleri_toplu_hesaplanir`: Evet; 'Alüminyum %10 arttı' dendiğinde alüminyum içeren 500 ürünün yeni maliyeti ve marj erimesi anında dökülür
  - `toplu_simulasyon_yapilamaz_urunler_tek_tek_elle_hesaplanmak_zorundadir`: Toplu simülasyon yoktur; yalnızca seçilen tek bir ürün için münferit hesaplama yapılabilir
  - `toplu_maliyet_simulasyonu_kullanilmamaktadir`: Toplu maliyet simülasyonu kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Toplu Maliyet Simülasyonu (Mass Simulation) ve Portföy Etki Analizini belirler.

---

### 7. Malzeme Maliyeti Kaynağı

#### [CST-013] Ürün reçetesindeki (BOM) hammaddelerin ve satın alınan parçaların maliyeti hesaplanırken Fiyat Otorite Kaynağı (Son Satın Alma Fiyatı, Yürüyen Ağırlıklı Ortalama, Standart Fiyat, FIFO Katmanı, Tedarikçi Sözleşme Fiyatı) olarak hangisi kullanılmaktadır?
- **Süreç:** Malzeme Maliyeti Kaynağı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `standart_maliyette_onayli_standart_fiyat_fiili_maliyette_yuruyen_ortalama_veya_fifo_kati_kullanilir`: Standart maliyette onaylı bütçe fiyatı; fiili maliyette yürüyen ortalama veya FIFO katman fiyatı kullanılır
  - `tum_hesaplamalarda_en_son_kesilen_satinalma_faturasi_fiyati_last_purchase_price_kullanilir`: En son satın alma faturası fiyatı (Last Purchase Price) baz alınır
  - `tedarikcilerle_yapilan_yillik_sozlesmeli_fiyat_listesi_esas_alinir`: Tedarikçilerle yapılan resmi sözleşmeli fiyat listesi (Contract Price) esas alınır
  - `malzeme_fiyat_kaynagi_net_belirlenmemistir_degiskenlik_gosterir`: Fiyat kaynağı net tanımlı değildir; kişiden kişiye farklı kaynaklar kullanılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Malzeme Fiyat Kaynağı Önceliği (Price Source Strategy) Kuralını belirler.

#### [CST-014] Tedarikçilerle yapılan çerçeve sözleşmelerdeki vadeli/iskontolu fiyatlar veya satın alma siparişindeki onaylı birim fiyatlar standart maliyet hesabında otomatik önceliklendirilebilmekte midir?
- **Süreç:** Malzeme Maliyeti Kaynağı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `sistem_sozlesmeli_tedarikci_fiyat_listesini_otomatik_onceliklendirerek_maliyete_ceker`: Evet; onaylı tedarikçi sözleşmesindeki geçerli birim fiyat doğrudan reçete maliyetine aktarılır
  - `sozlesme_fiyatlari_maliyet_ekranina_manuel_bakilarak_elle_yazilir`: Otomatik çekiş yoktur; maliyet uzmanı sözleşmedeki fiyata bakıp maliyet kartına elle girer
  - `sozlesmeli_fiyat_entegrasyonu_bulunmamaktadir`: Sözleşmeli fiyat önceliklendirme entegrasyonu bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Sözleşmeli Fiyat Entegrasyonu ve Fiyat Listesi Önceliğini belirler.

---

### 8. Çok Seviyeli BOM Maliyet Roll-Up

#### [CST-015] Çok seviyeli ürün ağaçlarında (Multi-Level BOM) en alt hammadde ve yarı mamullerden başlayarak yukarıya doğru kademe kademe maliyet toplayan Çok Seviyeli Maliyet Patlatması (Recursive Multi-Level Cost Roll-Up) sistem tarafından otomatik yapılmakta mıdır?
- **Süreç:** Çok Seviyeli BOM Maliyet Roll-Up | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sistem_en_alt_seviyeden_baslayarak_tum_yari_mamulleri_maliyetlendirir_ve_nihai_mamule_otomatik_roll_up_eder`: Evet; en alt kademedeki parçadan başlar (Low-Level Code); yarı mamul malzeme+işçilik maliyetini hesaplayıp ana ürüne otomatik toplar
  - `her_yari_mamul_icin_planlamaci_once_tek_tek_maliyet_cikarir_sonra_mamul_maliyetine_manuel_ekler`: Otomatik roll-up yoktur; uzman önce yarı mamul maliyetlerini tek tek hesaplar, sonra ana reçeteye elle yazar
  - `tek_seviyeli_hesaplanir_yari_mamul_roll_up_yapilmaz`: Tek seviyeli hesaplanır; yarı mamul kademesi olmadan tüm hammaddeler doğrudan mamule toplanır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Çok Seviyeli Maliyet Patlatması ve Recursive Roll-Up Algoritmasını belirler.

#### [CST-016] Çok seviyeli maliyet roll-up işlemi sırasında hatalı ürün ağacı tanımlarından kaynaklanan Döngüsel Reçete (Circular BOM Loop — A parçası B'nin içinde, B parçası A'nın içinde hatası) kontrolü sistem tarafından denetlenmekte midir?
- **Süreç:** Çok Seviyeli BOM Maliyet Roll-Up | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `CST-015 != "tek_seviyeli_hesaplanir_yari_mamul_roll_up_yapilmaz"`
- **Seçenekler:**
  - `sistem_dongusel_recete_hatasini_aninda_tespit_eder_ve_kullaniciyi_hatali_parca_koduyla_uyarir`: Evet; döngüsel ağaç veya sonsuz döngü tespit edildiğinde sistem işlemi durdurur ve hatalı bileşeni gösterir
  - `dongusel_kontrol_yoktur_hata_olunca_sistem_kilitlenir_veya_hatali_maliyet_uretir`: Döngü kontrolü yoktur; reçetede hata varsa hesaplama sonsuz döngüye girer veya hatalı sonuç verir
  - `dongusel_bom_kontrolu_kullanilmamaktadir`: Döngüsel BOM kontrol mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Döngüsel Reçete (Circular Reference) Güvenlik Doğrulamasını belirler.

---

### 9. Yarı Mamul Maliyeti

#### [CST-017] Kendi ürettiğiniz Yarı Mamullerin (Montaj Ara Parçaları) maliyeti, içine giren hammadde + işçilik + makine + genel gider paylarıyla ayrı bir yarı mamul maliyeti olarak hesaplanıp stoklanmakta mıdır?
- **Süreç:** Yarı Mamul Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `her_yari_mamulun_kendi_bilesen_ve_operasyon_maliyetiyle_ayri_birim_stok_maliyeti_olusturulur`: Evet; her yarı mamul kendi hammadde ve operasyon katma değeriyle bağımsız stok kartı maliyetine sahiptir
  - `yari_mamullere_maliyet_hesaplanmaz_yalnizca_nihai_mamul_cikinca_tek_maliyet_olusturulur`: Yarı mamul maliyetlendirilmez; tüm harcamalar nihai mamul tamamlandığında tek kalemde hesaplanır
  - `yari_mamul_maliyet_yapisi_kullanilmamaktadir`: Yarı mamul maliyet yapısı kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Yarı Mamul Ara Stok Maliyetleme ve Katma Değer Ayrıştırma Modelini belirler.

#### [CST-018] Yarı mamuller ambarda beklerken veya farklı fabrikalar arası transfer edilirken nakliye ve ara taşıma masrafları yarı mamul maliyetine eklenebilmekte midir?
- **Süreç:** Yarı Mamul Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `tesisler_arasi_yari_mamul_transfer_masraflari_parca_maliyetine_otomatik_yuklenir`: Evet; fabrikalar arası transfer navlunu yarı mamulün birim stok maliyetine eklenir
  - `transfer_giderleri_genel_lojistik_masrafi_olarak_muhasebeye_yazilir_parcaya_yuklenmez`: Parçaya yüklenmez; dönem içi genel lojistik gideri olarak muhasebeleştirilir
  - `yari_mamul_transfer_maliyeti_takip_edilmemektedir`: Yarı mamul transfer maliyeti takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Tesisler Arası Yarı Mamul Transfer Maliyet Yükleme Kuralını belirler.

---

### 10. İşçilik Maliyeti

#### [CST-019] Üretim rotasındaki standart operasyon süreleri için uygulanan Standart İşçilik Saat Ücreti (Labor Hourly Rate / Personel Maliyet Tarifesi) nasıl belirlenmekte ve maliyete yüklenmektedir?
- **Süreç:** İşçilik Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `is_merkezi_veya_operasyon_grubu_bazinda_saatlik_iscilik_tarifesi_tanimlidir_rotadaki_sureyle_carpilir`: Evet; her iş merkezinin saatlik standart işçilik ücreti (TL/Saat) tanımlıdır; operasyon standart süresiyle çarpılarak yüklenir
  - `tum_fabrika_icin_tek_bir_ortalama_iscilik_saat_ucreti_kullanilir`: Tek bir fabrika ortalaması kullanılır; tornacı ile montajcının saat ücreti aynı katsayıdan hesaplanır
  - `iscilik_sure_bazli_hesaplanmaz_malzeme_maliyetinin_yuzdesi_olarak_yaklasik_eklenir`: Süre bazlı hesaplanmaz; malzeme maliyetinin %10-15'i kadar göz kararı işçilik eklenir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Standart İşçilik Maliyeti Tarifesi (Labor Rate) ve Yükleme Anahtarını belirler.

#### [CST-020] Saatlik işçilik ücreti hesaplanırken brüt çıplak maaşın yanı sıra SGK işveren payı, yemek/servis, vardiya primi, ikramiye ve kıdem tazminatı karşılıkları da saat ücretine dahil edilmekte midir?
- **Süreç:** İşçilik Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `tum_yan_haklar_sgk_servis_yemek_ve_tazminat_karsiliklari_tam_maliyetli_saat_ucretine_dahildir`: Evet; personelin şirkete olan giydirilmiş toplam maliyeti (Fully Burdened Rate) üzerinden saatlik tarife çıkarılır
  - `yalnizca_bordrodaki_brut_maas_baz_alinir_yan_haklar_ve_tazminat_dahil_edilmez`: Sadece brüt maaş bölünür; yemek, servis ve tazminat karşılıkları genel gidere atılır
  - `giydirilmis_iscilik_saat_ucreti_kullanilmamaktadir`: Giydirilmiş işçilik saat ücreti kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Giydirilmiş İşçilik Maliyet Modeli (Fully Burdened Labor Rate) Yapısını belirler.

---

### 11. Makine / Work Center Maliyeti

#### [CST-021] İş merkezlerindeki tezgâh ve hatlar için amortisman, elektrik/enerji, bakım ve sarf malzemelerini içeren Makine Saati Maliyet Tarifesi (Machine Hour Rate) hesaplanmakta ve ürün maliyetine yansıtılmakta mıdır?
- **Süreç:** Makine / Work Center Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `her_makine_grubu_icin_ayri_saatlik_makine_tarifesi_tl_saat_hesaplanir_ve_rotadaki_makine_suresiyle_yuklenir`: Evet; CNC, Pres, Boyahane gibi her tezgâhın saatlik makine maliyeti (Amortisman+Enerji+Bakım) rotadaki süreyle çarpılarak ürüne yüklenir
  - `makine_maliyeti_ayri_tutulmaz_genel_fabrika_gideri_icerisinde_topluca_dagitilir`: Makine saati tarifesi yoktur; amortisman ve elektrik genel üretim gideri havuzunda toplanıp dağıtılır
  - `makine_saati_maliyeti_hesaplanmamaktadir`: Makine saati maliyeti hesaplanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Makine Saati Maliyeti (Machine Hour Rate) Tarifesi ve Yükleme Modelini belirler.

#### [CST-022] Makine saat ücreti hesaplanırken elektrik/doğalgaz gibi enerji tüketimleri kurulu güç veya alt sayaç ölçümlerine göre tezgâh bazında hassas olarak ayrıştırılabilmekte midir?
- **Süreç:** Makine / Work Center Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `CST-021 != "makine_saati_maliyeti_hesaplanmamaktadir"`
- **Seçenekler:**
  - `enerji_tuketimi_alt_sayac_veya_tezgah_kW_gucune_gore_hassas_ayristirilarak_tarifeye_eklenir`: Evet; fırın veya pres gibi yüksek enerji tüketen makinelerin elektrik payı alt sayaç/kW gücüne göre yüksek tarifelendirilir
  - `toplam_elektrik_faturasi_tum_makinelere_esit_veya_metrekareye_gore_dagitilir`: Hassas ayrım yoktur; toplam elektrik faturası tüm makinelere çalışma saatine göre eşit dağıtılır
  - `enerji_ayristirmasi_yapilamamaktadir`: Enerji tüketimi tezgâh bazında ayrıştırılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Tezgâh Bazlı Enerji Dağıtım Hassasiyetini belirler.

---

### 12. Setup Maliyeti

#### [CST-023] Kalıp bağlama, renk değişimi ve hazırlık sürelerinin maliyeti (Setup Cost), parti büyüklüğüne bölünerek (Setup Cost per Batch / Parça Başı Hazırlık Payı) ürün birim maliyetine dahil edilmekte midir?
- **Süreç:** Setup Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `setup_suresi_maliyeti_parti_buyuklugune_bolunerek_parca_basina_dusen_hazirlik_maliyeti_hesaplanir`: Evet; 2 saatlik kalıp ayar maliyeti 1.000 adetlik partide parça başına 0.002 saat, 100 adetlik partide 0.02 saat olarak yansıtılır
  - `setup_sureleri_ayri_maliyetlendirilmez_normal_calisma_cevrim_suresine_yedirilir`: Setup ayrı hesaplanmaz; parça başı standart çevrim süresi biraz yüksek tutularak içinde eritilir
  - `setup_maliyeti_takip_edilmemektedir`: Setup veya kalıp hazırlık maliyeti takip edilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Setup Maliyeti Amortizasyonu ve Parti Büyüklüğü (Lot Sizing) Etki Modelini belirler.

#### [CST-024] Müşteri özel partilerinde küçük adetli sipariş açıldığında artan setup maliyeti nedeniyle sistemin teklif veya planlama ekibine 'Küçük Parti Maliyet Uyarısı' vermesi sağlanmakta mıdır?
- **Süreç:** Setup Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `parti_kuculdukce_artan_birim_maliyet_farki_sistemde_karlilik_uyarisi_olarak_gorunur`: Evet; parti adedi düştükçe yükselen birim maliyet teklif ekranında görünür ve marj kaybı engellenir
  - `parti_adedi_ne_olursa_olsun_sistem_hep_ayni_sabit_standart_maliyeti_gosterir`: Sistem sabittir; 10 adet de üretilse 10.000 adet de üretilse aynı standart birim maliyeti gösterir
  - `kucuk_parti_maliyet_uyarisi_bulunmamaktadir`: Küçük parti maliyet uyarı mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Minimum Ekonomik Parti Büyüklüğü (EOQ) ve Marj Koruma Kontrolünü belirler.

---

### 13. Genel Üretim Giderleri

#### [CST-025] Fabrika amortismanı, fabrika yönetimi, kalite, bakım ve ortak tesis giderleri gibi Genel Üretim Giderleri (GÜG / Overhead Cost) ürünlere hangi Dağıtım Anahtarı (Makine Saati, Direkt İşçilik Saati, Malzeme Maliyeti Oranı, Aktivite Tabanlı / ABC) ile yüklenmektedir?
- **Süreç:** Genel Üretim Giderleri | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `masraf_merkezleri_bazinda_makine_saati_ve_iscilik_saatine_gore_farkli_gider_katsayilari_ile_yuklenir`: Evet; her atölyenin gider havuzu makine saati veya adam-saat katsayılarıyla ürünlere yüklenir
  - `tum_genel_giderler_direkt_hammadde_veya_iscilik_maliyetinin_sabit_bir_yuzdesi_olarak_yuklenir`: Sabit yüzde uygulanır; toplam malzeme maliyetinin üzerine %20 genel gider eklenir
  - `aktivite_tabanli_maliyetleme_abc_yontemiyle_cok_kriterli_olarak_dagitilir`: Aktivite Tabanlı Maliyetleme (ABC); sipariş sayısı, kalite testi sayısı gibi sürücülerle dağıtılır
  - `genel_uretim_giderleri_urun_maliyetine_yuklenmemektedir`: Genel üretim giderleri ürün maliyetine yüklenmez; doğrudan dönem gideri yazılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Genel Üretim Giderleri Yükleme Oranları (Overhead Absorption Rates) ve Masraf Merkezi Dağıtımını belirler.

#### [CST-026] Dönem sonunda fiili oluşan genel üretim giderleri ile ürünlere yüklenen genel giderler arasındaki Fazla/Eksik Yükleme Farkı (Over/Under Absorption of Overhead) hesaplanıp muhasebeleştirilmekte midir?
- **Süreç:** Genel Üretim Giderleri | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `yuklenen_gider_ile_fiili_gider_karsilastirilir_fark_stok_ve_satilan_malin_maliyetine_dagitilir`: Evet; fazla/eksik yüklenen genel gider farkı hesaplanır ve SMM ile dönem sonu stoklarına dağıtılarak tasfiye edilir
  - `fark_hesaplanmaz_fiili_gider_neyse_ay_sonunda_direkt_gelir_tablosuna_yansitilir`: Yükleme farkı takip edilmez; fiili harcamalar doğrudan dönem gideri olarak kapatılır
  - `genel_gider_yukleme_farki_takip_edilmemektedir`: Genel gider yükleme farkı takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Genel Gider Yükleme Farkı (Over/Under Absorption) Tasfiye Mantığını belirler.

---

### 14. Dış Operasyon Maliyeti

#### [CST-027] Üretim rotasında dış tedarikçiye gönderilen Fason / Dış Operasyonların (Subcontracting — Isıl İşlem, Kaplama, Boya) işçilik ve nakliye bedelleri ürün maliyetine doğrudan operasyon bazında mı eklenmektedir?
- **Süreç:** Dış Operasyon Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `fason_hizmet_faturasi_ilgili_is_emri_ve_operasyona_baglanarak_birim_urun_maliyetine_net_yansitilir`: Evet; fasoncunun kestiği fatura iş emrindeki fason operasyona eşleştirilir ve parça maliyetine doğrudan girer
  - `fason_giderleri_genel_gider_havuzuna_atilir_urun_bazinda_birebir_eslesmez`: Ürün bazında eşleşmez; fason faturaları genel hizmet alımı olarak kaydedilip tüm ürünlere dağıtılır
  - `dis_operasyon_fason_kullanilmamaktadir`: Dış operasyon veya fason imalat kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Fason Operasyon Maliyeti ve Dış Hizmet Fatura Eşleştirme Mimarisini belirler.

#### [CST-028] Fason tedarikçiye gönderilen yarı mamullerin gidiş-dönüş nakliye ve sigorta masrafları fason operasyon maliyetine dahil edilebilmekte midir?
- **Süreç:** Dış Operasyon Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `CST-027 != "dis_operasyon_fason_kullanilmamaktadir"`
- **Seçenekler:**
  - `fason_nakliyesi_ve_sigortasi_da_dis_operasyon_kalemine_eklenerek_urun_maliyetine_yansitilir`: Evet; fasoncuya gidiş-geliş nakliye maliyeti fason işleme eklenerek ürün maliyetine yansıtılır
  - `fason_nakliyesi_genel_fabrika_nakliye_giderine_yazilir`: Parçaya eklenmez; şirketin genel nakliye giderleri içinde muhasebeleşir
  - `fason_nakliye_maliyeti_takip_edilmemektedir`: Fason nakliye maliyeti takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Fason Lojistik Giderlerinin Parça Maliyetine Yüklenmesini belirler.

---

### 15. Fire ve Rework Maliyeti

#### [CST-029] Ürün ağacındaki standart fire katsayıları (Planned Scrap) ve sahada gerçekleşen plansız hurdaların (Unplanned Scrap / Rework) parasal maliyet etkisi ürün maliyetinde nasıl takip edilmektedir?
- **Süreç:** Fire ve Rework Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `planli_fire_standart_maliyete_dahildir_plansiz_hurdalar_ise_uretim_sapmasi_olarak_ayri_raporlanir`: Evet; reçetedeki %3 fire standart maliyete eklenir; sahada çıkan fazla hurda ise 'Hurda Maliyet Sapması' olarak raporlanır
  - `tum_fireler_ve_hurdalar_dogrudan_saglam_kalan_parcalarin_maliyetini_artiracak_sekilde_yuklenir`: Ayrım yapılmaz; 100 adetlik işte 20 adet hurda çıkarsa kalan 80 adet sağlam parça tüm maliyeti yüklenir
  - `fire_ve_hurda_maliyeti_ayri_hesaplanmamaktadir`: Fire ve hurda maliyeti ayrı olarak hesaplanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Planlı Fire vs Plansız Hurda Maliyet Muhasebesi ve Sapma Raporlamasını belirler.

#### [CST-030] Hatalı üretilen parçaların tamirinde harcanan Rework İşçilik ve Ek Malzeme Maliyetleri ayrı bir Kalite Kayıp Masraf Merkezinde izlenebilmekte midir?
- **Süreç:** Fire ve Rework Maliyeti | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `rework_maliyetleri_ayri_masraf_merkezinde_toplanir_ve_aylik_kalitesizlik_maliyeti_olarak_raporlanir`: Evet; rework işçiliği ve ek sarflar standart ürün maliyetinden ayrı tutularak Kalitesizlik Maliyeti (COPQ) olarak raporlanır
  - `rework_maliyeti_orijinal_is_emrine_eklenir_ve_o_partinin_maliyetini_sisirir`: Ayrı masraf merkezi yoktur; ek süreler ana iş emrine yüklenir ve o partinin maliyeti yüksek çıkar
  - `rework_maliyeti_ayrilamamaktadir`: Rework maliyeti ayrıştırılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Kalitesizlik Maliyeti (Cost of Poor Quality) Ayrıştırmasını belirler.

---

### 16. Landed Cost / Ek Maliyetler

#### [CST-031] İthal veya yurt içi hammadde alımlarında ödenen Navlun, Gümrük Vergisi, Sigorta, Tahmil/Tahliye ve Millileştirme Masrafları (Landed Cost) malzeme birim maliyetine oranlanarak dağıtılmakta mıdır?
- **Süreç:** Landed Cost / Ek Maliyetler | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `ithalat_dosyasindaki_tum_navlun_gumruk_ve_masraflar_malzemenin_birim_stok_maliyetine_otomatik_yuklenir`: Evet; gümrük ve navlun faturaları ithalat dosyasına girilir ve malzemelerin net birim maliyetine tutar/ağırlık oranında eklenir
  - `masraflar_malzeme_fiyatina_eklenmez_genel_gider_olarak_muhasebeye_yazilir`: Birim fiyata eklenmez; malın sadece çıplak fatura fiyatı stoğa girer, navlun ve gümrük dönem gideri yazılır
  - `landed_cost_dagitimi_yapilmamaktadir`: Landed cost veya ithalat masraf dağıtımı yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Landed Cost Dağıtım Motoru ve Hammadde Net Giriş Fiyatı Standardını belirler.

#### [CST-032] Landed cost masraf dağıtımı yapılırken konteyner bazında Ağırlık, Hacim (Desi/m3) veya Fatura Tutarı anahtarlarıyla esnek dağıtım seçenekleri kullanılabilmekte midir?
- **Süreç:** Landed Cost / Ek Maliyetler | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `navlun_agirlik_hacme_gore_gumruk_vergisi_ise_fatura_tutarina_gore_ayri_anahtarlarla_dagitilir`: Evet; navlun masrafı ağırlığa göre, vergi ve harçlar ise CIF mal bedeli oranına göre doğru dağıtılır
  - `tum_masraflar_yalnizca_fatura_tutarina_gore_tek_duze_dagitilir`: Ağırlık/hacim ayrımı yoktur; tüm masraflar sadece fatura tutarı oranında bölünür
  - `esnek_landed_cost_dagitim_anahtarlari_bulunmamaktadir`: Esnek masraf dağıtım anahtarları bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Masraf Dağıtım Anahtarları (Ağırlık vs Değer) Hassasiyetini belirler.

---

### 17. Kur ve Döviz Etkisi

#### [CST-033] İthal hammaddeler veya dövizli fason işlemlerde kur değişimlerinin ürün maliyetine etkisi (Çoklu Para Birimi / Multi-Currency Costing) hangi kur tipi ve tarihi (Standart Bütçe Kuru, Güncel TCMB Alış Kuru, Fatura Tarihi Kuru) ile modellenmektedir?
- **Süreç:** Kur ve Döviz Etkisi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `hem_orijinal_doviz_hem_tl_karsiligi_tutulur_standart_icin_butce_kuru_fiili_icin_islem_kuru_baz_alinir`: Evet; ürün maliyeti hem döviz (USD/EUR) hem TL olarak izlenir; standartta bütçe kuru, fiilide güncel fatura kuru kullanılır
  - `tum_maliyetler_fatura_tarihindeki_tl_tutara_cevrilerek_yalnizca_tl_olarak_saklanir`: Döviz izlenmez; mal alındığı günkü TL kurundan kaydedilir, sonradan kur artsa bile maliyet eski TL olarak kalır
  - `dovizli_maliyet_takibi_yapilamamaktadir`: Dövizli maliyet veya çoklu para birimi takibi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Çoklu Para Birimi Maliyet Muhasebesi ve Kur Tipi Parametrelerini belirler.

#### [CST-034] Döviz kuru artışlarından kaynaklanan Kur Farkı Zararları veya Kârları ürün üretim maliyetine mi (KDV/VUK gereği) yoksa doğrudan Finansman Gideri / Gelirine mi aktarılmaktadır?
- **Süreç:** Kur ve Döviz Etkisi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `hammadde_stoga_girene_kadarki_kur_farki_maliyete_stoktan_sonraki_finansman_giderine_yazilir`: Evet; mal kabul tarihine kadar olan kur farkları malzeme maliyetine, vadedeki ödeme kur farkları finansman giderine atılır
  - `tum_kur_farklari_ayrim_yapilmaksizin_direkt_finansman_giderine_yazilir`: Maliyete eklenmez; tüm kur farkları genel finansman gideri/geliri olarak kaydedilir
  - `kur_farki_ayrimi_yapilmamaktadir`: Kur farkı ayrımı yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Kur Farkı Maliyet/Finansman Ayrımı ve Defter Kayıt Entegrasyonunu belirler.

---

### 18. Maliyet Versiyonları

#### [CST-035] Yıl içinde değişen hammadde fiyatları ve enerji zamlarına göre ürünün farklı dönemlerdeki maliyetlerini karşılaştırmak için Maliyet Versiyonlama (Cost Versions — Bütçe Maliyeti, Revize Standart, Fiili Dönem Maliyeti) kullanılmakta mıdır?
- **Süreç:** Maliyet Versiyonları | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Seçenekler:**
  - `farkli_maliyet_versiyonlari_v1_butce_v2_q2_revizyonu_sistemde_tanimlanir_ve_yan_yana_kiyaslanir`: Evet; sistemde 'V1-2026 Bütçe', 'V2-Haziran Revize' gibi versiyonlar tutulur ve ürün maliyetindeki artış trendi izlenir
  - `maliyet_guncellendiginde_eski_maliyet_ezilir_sistemde_gecmis_versiyon_karsilastirmasi_yapilamaz`: Versiyonlama yoktur; yeni maliyet girilince eski rakamın üzerine yazılır, geçmiş arşiv tutulamaz
  - `maliyet_versiyonu_tutulmaz_tek_bir_guncel_rakam_vardir`: Maliyet versiyonu tutulmamaktadır; sistemde tek bir güncel rakam bulunur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet Versiyonlama (Cost Versions) ve Karşılaştırmalı Maliyet Tablosunu belirler.

#### [CST-036] Geçmiş maliyet versiyonları arasında 'Neden Maliyet Arttı?' sorusuna cevap veren Bileşen Bazlı Maliyet Değişim Analizi (Cost Change Bridge / Hangi Hammadde Ne Kadar Arttı?) dökülebilmekte midir?
- **Süreç:** Maliyet Versiyonları | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `CST-035 != "maliyet_versiyonu_tutulmaz_tek_bir_guncel_rakam_vardir"`
- **Seçenekler:**
  - `sistem_maliyet_artisinin_ne_kadarinin_hammadde_ne_kadarinin_enerji_iscilik_kaynakli_oldugunu_ayristirir`: Evet; ürün maliyeti 100 TL'den 125 TL'ye çıktıysa bunun 18 TL'si sac zammı, 7 TL'si asgari ücret artışı olarak köprü raporu verir
  - `toplam_artis_gorulur_ancak_bilesen_kirilimi_ayristirilamaz`: Sadece toplam tutar farkı görülür; hangi hammaddenin ne kadar etki ettiği dökülemez
  - `maliyet_degisim_koprusu_raporlanamamaktadir`: Maliyet değişim köprü analizi raporlanamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet Köprü Analizi (Cost Bridge Analysis) ve Artış Sürücüleri Görünürlüğünü belirler.

---

### 19. Maliyet Güncelleme ve Freeze

#### [CST-037] Onaylanan standart ürün maliyetleri sistemde belirli bir Geçerlilik Tarihi (Effective Date) ile dondurulmakta (Freeze) ve geçmiş maliyet arşivi korunmakta mıdır?
- **Süreç:** Maliyet Güncelleme ve Freeze | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `maliyet_onaylandigi_an_dondurulur_freeze_tarih_araliginda_kilitli_kalir_gecmis_kayitlar_asla_degismez`: Evet; onaylanan maliyet dondurulur; geçerlilik başlangıç/bitiş tarihleri atanır ve geriye dönük manipülasyon engellenir
  - `maliyet_kilitlenmez_isteyen_kullanici_gecmis_tarihli_maliyeti_dahi_degistirebilir`: Kilit yoktur; kullanıcı istediği zaman ürün maliyetini güncelleyebilir, denetim izi tutulmaz
  - `maliyet_dondurma_kavrami_kullanilmamaktadir`: Maliyet dondurma mekanizması kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Standart Maliyet Dondurma (Cost Freeze) ve Geçerlilik Tarihi (Effective Date) Kurgusunu belirler.

#### [CST-038] Dondurulmuş standart maliyetin yıl ortasında olağanüstü piyasa koşullarında (Hiperenflasyon, devalüasyon) ara dönemde revize edilmesi (Mid-Year Cost Revaluation) ve stokların yeni standart maliyetle yeniden değerlenmesi kuralı var mıdır?
- **Süreç:** Maliyet Güncelleme ve Freeze | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `ara_donemde_standart_maliyet_revize_edilebilir_ve_stoktaki_mallar_aradaki_fark_gelir_tablosuna_yazilarak_guncellenir`: Evet; ara dönemde yeni standart maliyet devreye alınabilir ve ambar stokları aradaki fark bilançoya yansıtılarak yeniden değerlenir
  - `yil_icinde_standart_asla_degismez_aradaki_farklar_aylik_sapma_hesaplarinda_biriktirilir`: Yıl içinde standart değiştirilmez; maliyet artışları ay sonu sapma hesaplarında izlenir
  - `ara_donem_maliyet_revizyonu_kullanilmamaktadir`: Ara dönem maliyet revizyonu kullanılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Yıl Ortası Yeniden Değerleme (Mid-Year Revaluation) ve Stok Düzeltme Mantığını belirler.

---

### 20. Standart / Fiili Sapmalar

#### [CST-039] Dönem sonunda veya iş emri kapandığında Standart Maliyet ile Fiili Maliyet arasındaki Toplam Üretim Sapması (Total Production Variance) sistem tarafından hesaplanıp raporlanmakta mıdır?
- **Süreç:** Standart / Fiili Sapmalar | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_is_emirleri_icin_planlanan_standart_vs_gerceklesen_fiili_maliyet_sapmasi_tl_ve_yuzde_olarak_raporlanir`: Evet; iş emri ve mamul bazında 'Planlanan Maliyet 1.000 TL / Fiili Maliyet 1.120 TL / Sapma: +%12 (120 TL Olumsuz)' anında raporlanır
  - `sapmalar_is_emri_bazinda_gorulemez_yalnizca_fabrika_geneli_toplam_kar_zararda_hissedilir`: İş emri bazında sapma görülmez; yalnızca ay sonunda kasanın ve kârın durumundan genel fark anlaşılır
  - `standart_fiili_sapma_analizi_yapilmamaktadir`: Standart ile fiili maliyet sapma analizi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Standart vs Fiili Toplam Üretim Sapması Raporlama Altyapısını belirler.

#### [CST-040] Bir iş emrinde gerçekleşen fiili maliyet standart maliyetin belirlenen tolerans limitini (Örn. %10'dan fazla sapma) aştığında sistemin otomatik alarm verip yönetici incelemesine düşürmesi sağlanmakta mıdır?
- **Süreç:** Standart / Fiili Sapmalar | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `sapma_toleransi_asan_is_emirleri_yonetici_kontrol_panosunda_kirmizi_alarm_olarak_listelenir`: Evet; maliyeti %10'dan fazla sapan iş emirleri otomatik olarak 'İnceleme Gerekli' listesine düşer ve neden analizi istenir
  - `otomatik_alarm_yoktur_maliyet_uzmani_raporlari_gozle_tarayarak_yuksek_sapmalari_bulur`: Otomatik alarm yoktur; uzman ay sonu Excel tablosunu filtreleyerek yüksek sapan işleri bulmaya çalışır
  - `maliyet_sapma_alarmi_bulunmamaktadir`: Maliyet sapma alarm mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** İstisna ile Yönetim (Management by Exception) ve Maliyet Alarm Eşiklerini belirler.

---

### 21. Üretim Sapma Analizi

#### [CST-041] Üretim sapmaları kök nedenlerine göre (Malzeme Fiyat Farkı, Miktar Kullanım Farkı, İşçilik Saat/Ücret Farkı, Makine Verim Farkı, Genel Gider Hacim Farkı) ayrıntılı olarak ayrıştırılabilmekte midir?
- **Süreç:** Üretim Sapma Analizi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sapmalar_5_ana_kategoride_malzeme_fiyat_miktar_iscilik_sure_ucret_makine_verim_gider_ayristirilir`: Evet; 120 TL'lik sapmanın 50 TL'si pahalı hammadde alımından (Fiyat), 40 TL'si fazla sarftan (Miktar), 30 TL'si fazla mesai süresinden ayrıştırılır
  - `yalnizca_toplam_fark_gorulur_fiyattan_mi_yoksa_fazla_kullanimdan_mi_kaynaklandigi_ayristirilamaz`: Ayrıştırılamaz; sadece '120 TL fazla maliyet oldu' denir, sebebin satın alma mı yoksa fabrika firesi mi olduğu bilinemez
  - `detayli_uretim_sapma_analizi_yapilamamaktadir`: Detaylı üretim sapma analizi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** 5 Kategori Kök Neden Sapma Ayrıştırma Matrisini (Price/Usage/Labor/Machine/Overhead Variance) belirler.

---

### 22. Stok Değerleme Entegrasyonu

#### [CST-042] Üretilen mamullerin ambara stok girişinde kullanılan maliyet ile envanter değerleme yöntemi (FIFO / Hareketli Ortalama) arasındaki entegrasyon ve dönem sonu fark düzeltmeleri (Settlement) nasıl işletilmektedir?
- **Süreç:** Stok Değerleme Entegrasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `mamul_standart_maliyetle_stoga_girer_donem_sonunda_fiili_maliyet_farklari_stok_ve_smmye_otomatik_dagitilir`: Evet; mamul ambarına standart maliyetle girer; ay sonunda fiili sapmalar stokta kalan ve satılan ürünlere otomatik tasfiye edilir
  - `mamul_girisleri_fiyatsiz_veya_tahmini_rakamla_yapilir_ay_sonunda_muhasebeci_manuel_fiyat_yazar`: Stok girişi fiyatsız yapılır; ay sonunda muhasebeci manuel hesapladığı birim maliyeti stok kartlarına elle yazar
  - `stok_degerleme_maliyet_entegrasyonu_bulunmamaktadir`: Stok değerleme ile üretim maliyeti arasında sistemik entegrasyon bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Mamul Stok Giriş Değerlemesi ve Dönem Sonu Tasfiye (Settlement) Kurgusunu belirler.

---

### 23. Teklif / Fiyatlandırma Entegrasyonu

#### [CST-043] Satış ve teklif ekiplerine güncel ve karlı fiyatlandırma yapabilmeleri için ERP/Maliyet modülünden canlı ürün maliyeti ve minimum kar marjı kuralı beslenmekte midir?
- **Süreç:** Teklif / Fiyatlandırma Entegrasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `teklif_hazirlanirken_sistem_en_guncel_onayli_veya_simule_edilmis_maliyeti_otomatik_getirir_marj_altina_uyarir`: Evet; satışçı teklif hazırlarken sistem en güncel onaylı maliyeti çeker; belirlenen kâr marjının altına inilirse yönetici onayı ister
  - `satis_ekibi_maliyet_bilgisini_gormez_gecmis_satis_fiyatina_veya_piyasa_fiyatina_gore_tahmini_teklif_verir`: Sistemik maliyet beslemesi yoktur; satışçı piyasa tecrübesine göre fiyat yazar, gerçekte kâr edip etmediği bilinmez
  - `teklif_maliyet_entegrasyonu_bulunmamaktadir`: Teklif ile maliyet sistemi arasında entegrasyon bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Teklif ve Fiyatlandırma Modülüne Canlı Maliyet Beslemesi ve Marj Eşiğini belirler.

---

### 24. Maliyet Kapanışı

#### [CST-044] Ay sonlarında açık iş emirlerinin (WIP - Yarı Mamul Envanteri) değerlemesi, tamamlanan işlerin maliyet kapanışı ve maliyet mutabakatı (Cost Closing / Settlement) hangi disiplinle yürütülmektedir?
- **Süreç:** Maliyet Kapanışı | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `ay_sonunda_wip_otomatik_hesaplanir_kapanan_is_emirlerinin_sapmalari_muhasebelestirilir_ve_donem_kilitlenir`: Evet; ay sonunda sistem açık emirlerdeki yarı mamulü (WIP) hesaplar, tamamlanan işlerin sapmalarını yansıtır ve maliyet dönemini kilitler
  - `wip_hesaplanmaz_ay_sonunda_tum_acik_ve_kapali_islerin_masraflari_tek_kalemde_genel_gidere_yazilir`: WIP hesabı yoktur; ay sonu tüm açık/kapalı işlerin harcamaları topluca genel gidere yazılıp kapatılır
  - `resmi_bir_ay_sonu_maliyet_kapanis_sureci_yurutulmemektedir`: Resmi bir dönem sonu maliyet kapanış ve tasfiye süreci yürütülmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Dönem Sonu Maliyet Kapanış Takvimi ve WIP Değerleme Disiplinini belirler.

---

### 25. Maliyet Raporlama ve KPI

#### [CST-045] Fabrikanızda Ürün Brüt Kar Marjı, Birim Maliyet Trendi, Malzeme Fiyat Sapması, Hurda Maliyet Oranı ve Kapasite Gider Emme Oranı (Overhead Absorption) metrikleri düzenli yönetici KPI'ı olarak izlenmekte midir?
- **Süreç:** Maliyet Raporlama ve KPI | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `brut_kar_marji_maliyet_sapmalari_ve_maliyet_trendleri_canli_yonetici_kokpitinde_grafiksel_izlenir`: Evet; ürün kârlılıkları, malzeme ve işçilik sapmaları ile birim maliyet değişim grafikleri canlı yönetim panosunda izlenir
  - `aylik_mali_tablolarda_bazi_genel_maliyet_ve_kar_rakamlari_excelden_sunulur`: Canlı pano yoktur; ay sonlarında maliyet uzmanı Excel'den hazırladığı kârlılık özetini yönetime sunar
  - `maliyet_ve_karlilik_kpi_lari_olculmemektedir`: Maliyet ve kârlılık KPI'ları düzenli olarak ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Maliyet Karar Etkisi:** Maliyet ve Kârlılık Yönetici Gösterge Paneli (Cost Cockpit) Altyapısını belirler.

---

## 4. Cross-Pack Duplication Audit (Sınır Ayrımı ve Sıfır Çakışma Denetimi)

| Karşılaştırılan Modül | Örtüşen Soru Sayısı | Sınır Ayrımı Prensibi |
| :--- | :---: | :--- |
| **PRODUCTION_PLANNING** | **0** | `PRODUCTION_PLANNING` ne üretileceğini, reçeteleri, rotaları ve kapasiteyi planlar. `COSTING` bu reçete ve rotanın standart birim maliyetini, saatlik makine/işçilik ücretlerini ve çok seviyeli maliyet roll-up işlemini yapar. |
| **WORK_ORDERS** | **0** | `WORK_ORDERS` sahada iş emrini açar, fiili sarfı ve operatör çalışma süresini toplar. `COSTING` bu gerçekleşen tüketimlerin parasal maliyetini ve standartla arasındaki üretim sapmalarını hesaplar. |
| **INVENTORY** | **0** | `INVENTORY` stok miktarlarını, depo bakiyelerini ve hareketlerini izler. `COSTING` mamulün stok değerleme yöntemine hangi maliyetle aktarılacağını ve ay sonu fark tasfiyesini çözer. |
| **ACCOUNTING** | **0** | `ACCOUNTING` yevmiye defteri, 150/151/152 ve 7/A hesap kayıtlarını tutar. `COSTING` masraf merkezlerini, aktivite tarifelerini, genel gider yükleme oranlarını ve sapma kök nedenlerini hesaplar. |
| **PROCUREMENT** | **0** | `PROCUREMENT` satın alma siparişlerini ve tedarikçi tekliflerini yönetir. `COSTING` satın alma fiyatının maliyet otorite kaynağını ve landed cost masraf dağıtımını sorgular. |
| **PROPOSALS** | **0** | `PROPOSALS` satış fiyatını, iskonto onayını ve müşteri teklifini yönetir. `COSTING` teklif ekranına en güncel onaylı maliyeti ve minimum kâr marjı kuralını besler. |
| **TÜM DİĞER MODÜLLER** | **0** | Tüm diğer ticari, finansal ve analitik modüllerle tam izolasyon ve sıfır çakışma sağlanmıştır. |
