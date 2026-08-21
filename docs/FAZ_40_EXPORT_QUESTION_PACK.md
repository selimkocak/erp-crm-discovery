# FAZ-40: İhracat ve Gümrük Yönetimi (EXPORT) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.export.core`  
**Kanonik İş Fonksiyonu Kodu:** `EXPORT`  
**Türkçe / Legacy Kod:** `IHRACAT` (Alias: `IHRACAT_GUMRUK`, `DIS_TICARET_EXPORT`, `EXPORT_CUSTOMS`)  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 25`  
**Kategori:** `Lojistik & Depo` (Logistics & Warehouse)  
**Toplam Soru:** 47 Soru (`EXP-001` .. `EXP-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

İhracat ve Gümrük Yönetimi (Export & Customs Management) modülü; şirketlerin yurtdışı pazarlara yönelik mamul, yarı mamul ve hizmet ihracatı süreçlerini; müşteri ve pazar analizini, uluslararası satış sözleşmelerini, Incoterms 2020 teslim şekillerini, dış ticaret ödeme/tahsilat araçlarını (akreditif, vesaik mukabili, peşin), uluslararası navlun ve lojistik modlarını, gümrük müşavirliği temsil modelini, GTİP / HS kodu yönetişimini, menşe ve dolaşım belgelerini (A.TR, EUR.1, Menşe Şahadetnamesi), ihracat e-Faturasını, KDV istisnası ve İBKB döviz getirme yükümlülüklerini, ihracat operasyon maliyetlerinin (Landed Cost benzeri navlun/komisyon/gümrükleme) sipariş karlılığına dağıtımını ve ERP/CRM/Dış Ticaret sistemleri entegrasyon olgunluğunu saha görüşmeleriyle keşfetmek üzere tasarlanmıştır.

> **Önemli Hukuki ve Mevzuat Notu:**  
> Bu soru paketi işletmelerin ihracat ve dış ticaret süreçlerinin ERP/CRM sistemlerine entegrasyon olgunluğunu ve dijitalleşme seviyesini ölçmek amacıyla hazırlanmıştır. Türkiye gümrük ve kambiyo mevzuatı, vergi istisnaları (KDV 11/1-a, İBKB döviz bozdurma oranları, DİİB taahhüt kuralları vb.) ve uluslararası yaptırım listeleri dinamik olup her sevkiyatta yetkili gümrük müşaviri, YMM ve resmi mevzuat kaynaklarından güncel olarak doğrulanmalıdır. Bu yazılım hukuki, mali, vergi veya gümrük danışmanlığı teşkil etmez.

---

## 2. 25 Kanonik Süreç Envanteri

Aşağıdaki 25 kanonik süreç başlığı, soru paketi içerisindeki 47 sorunun tamamını eksiksiz ve fazlalıksız olarak kapsar:

| # | Kanonik Süreç Adı | Soru Sayısı | Soru ID Listesi | Zorunlu Soru |
|---|---|:---:|---|:---:|
| 1 | İhracat organizasyonu ve süreç sahipliği | 2 | `EXP-001`, `EXP-002` | 1 |
| 2 | İhracat yapılan ülke ve pazarlar | 2 | `EXP-003`, `EXP-004` | 1 |
| 3 | İhracat ürün ve hizmet kapsamı | 1 | `EXP-005` | 1 |
| 4 | İhracat müşteri ve bayi yapısı | 2 | `EXP-006`, `EXP-007` | 1 |
| 5 | İhracat fırsat, teklif ve sipariş süreci | 2 | `EXP-008`, `EXP-009` | 1 |
| 6 | Dış ticaret sözleşmeleri | 1 | `EXP-010` | 1 |
| 7 | Proforma fatura ve sipariş teyidi | 1 | `EXP-011` | 1 |
| 8 | İhracat ödeme şekilleri ve tahsilat riski | 3 | `EXP-012`, `EXP-013`, `EXP-014` | 1 |
| 9 | Incoterms kullanımı | 1 | `EXP-015` | 1 |
| 10 | İhracat fiyatlandırması ve teslim şekli | 1 | `EXP-016` | 1 |
| 11 | Ambalaj, paketleme ve etiketleme | 2 | `EXP-017`, `EXP-018` | 1 |
| 12 | Navlun, taşıma ve forwarder yönetimi | 2 | `EXP-019`, `EXP-020` | 1 |
| 13 | Gümrük müşaviri ve temsil modeli | 2 | `EXP-021`, `EXP-022` | 1 |
| 14 | İhracat beyannamesi ve gümrük çıkış işlemleri | 2 | `EXP-023`, `EXP-024` | 1 |
| 15 | GTİP / HS kodu yönetimi | 1 | `EXP-025` | 1 |
| 16 | Menşe ve tercihli menşe belgeleri | 1 | `EXP-026` | 1 |
| 17 | ATR, EUR.1 ve diğer dolaşım belgeleri | 1 | `EXP-027` | 0 |
| 18 | İhracat izinleri ve ürün uygunluk belgeleri | 2 | `EXP-028`, `EXP-029` | 1 |
| 19 | Ticari fatura, çeki listesi ve sevk evrakı | 2 | `EXP-030`, `EXP-031` | 1 |
| 20 | Konşimento, CMR, AWB ve taşıma belgeleri | 2 | `EXP-032`, `EXP-033` | 1 |
| 21 | İhracat KDV istisnası ve mali süreç | 3 | `EXP-034`, `EXP-035`, `EXP-036` | 1 |
| 22 | İhracat maliyetleri, komisyon ve navlun dağıtımı | 2 | `EXP-037`, `EXP-038` | 1 |
| 23 | ERP/CRM, dış ticaret ve lojistik entegrasyonu | 3 | `EXP-039`, `EXP-040`, `EXP-041` | 1 |
| 24 | İhracat raporlama, KPI ve risk takibi | 3 | `EXP-042`, `EXP-043`, `EXP-044` | 1 |
| 25 | İhracat arşivi, kanıt dokümanları ve iyileştirme yol haritası | 3 | `EXP-045`, `EXP-046`, `EXP-047` | 2 |
| | **TOPLAM** | **47** | **47 Soru (EXP-001..047)** | **25 Zorunlu / 22 Opsiyonel** |

---

## 3. 47 Soruluk Detaylı Soru ve Süreç Dağılım Tablosu

| # | Süreç Adı | Soru ID | Başlık / Açıklama | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | İhracat organizasyonu ve süreç sahipliği | `EXP-001` | İhracat ve dış ticaret operasyon organizasyon yapısı | single_choice | Evet | Critical |
| 2 | İhracat organizasyonu ve süreç sahipliği | `EXP-002` | İhracat dosyası yaşam döngüsü ve dosya bazlı takip | single_choice | Hayır | High |
| 3 | İhracat yapılan ülke ve pazarlar | `EXP-003` | İhracat yapılan ana coğrafyalar ve hedef pazar çeşitliliği (Trigger 1) | single_choice | Evet | Critical |
| 4 | İhracat yapılan ülke ve pazarlar | `EXP-004` | Hedef ülkelerin gümrük rejimleri, ambargo ve yaptırım kontrolleri (Target 1) | single_choice | Hayır | High |
| 5 | İhracat ürün ve hizmet kapsamı | `EXP-005` | İhraç malzeme türleri ve ERP stok kartı / GTİP eşleşmesi | single_choice | Evet | Critical |
| 6 | İhracat müşteri ve bayi yapısı | `EXP-006` | Yurtdışı satış kanalı ve müşteri yapısı (Trigger 2) | single_choice | Evet | High |
| 7 | İhracat müşteri ve bayi yapısı | `EXP-007` | Distribütör sözleşmeleri, bölge koruması ve acente komisyon takibi (Target 2) | single_choice | Hayır | High |
| 8 | İhracat fırsat, teklif ve sipariş süreci | `EXP-008` | Yurtdışı lead, satış fırsatları ve dövizli teklif yönetimi | single_choice | Evet | High |
| 9 | İhracat fırsat, teklif ve sipariş süreci | `EXP-009` | Fuar, B2B ticaret portalları ve müşteri dönüşüm ölçümü | single_choice | Hayır | Medium |
| 10 | Dış ticaret sözleşmeleri | `EXP-010` | Uluslararası satış sözleşmeleri, yetkili hukuk ve tahkim şartları | single_choice | Evet | Critical |
| 11 | Proforma fatura ve sipariş teyidi | `EXP-011` | Proforma Fatura (P/I) onayı ve kesin ihracat siparişi oluşturma | single_choice | Evet | Critical |
| 12 | İhracat ödeme şekilleri ve tahsilat riski | `EXP-012` | Uluslararası dış ticaret tahsilat ve ödeme yöntemleri (Trigger 3) | single_choice | Evet | Critical |
| 13 | İhracat ödeme şekilleri ve tahsilat riski | `EXP-013` | İhracat akreditifleri (L/C), rezerv riskleri ve teyit süreci (Target 3) | single_choice | Hayır | High |
| 14 | İhracat ödeme şekilleri ve tahsilat riski | `EXP-014` | Yurtdışı alıcı kredi limiti, Eximbank sigortası ve tahsilat güvencesi | single_choice | Hayır | High |
| 15 | Incoterms kullanımı | `EXP-015` | Incoterms 2020 teslim şekilleri ve masraf/risk intikal noktaları | single_choice | Evet | Critical |
| 16 | İhracat fiyatlandırması ve teslim şekli | `EXP-016` | Dövizli fiyat listeleri ve teslim şekline göre navlun/sigorta ekleme | single_choice | Evet | High |
| 17 | Ambalaj, paketleme ve etiketleme | `EXP-017` | İhracat ambalajı, paletleme, ISPM 15 standardı ve etiket kuralları | single_choice | Evet | High |
| 18 | Ambalaj, paketleme ve etiketleme | `EXP-018` | GS1-128 / SSCC lojistik barkod etiketleri ve çeki listesi eşleşmesi | single_choice | Hayır | Medium |
| 19 | Navlun, taşıma ve forwarder yönetimi | `EXP-019` | Uluslararası lojistik ve taşıma modları (Deniz/Hava/Kara/Demiryolu) | single_choice | Evet | High |
| 20 | Navlun, taşıma ve forwarder yönetimi | `EXP-020` | Forwarder seçimi, navlun ihale teklifleri ve booking takibi (Trigger 4) | single_choice | Hayır | High |
| 21 | Gümrük müşaviri ve temsil modeli | `EXP-021` | Müşavir sistemi ve forwarder portalları ile API entegrasyonu (Target 4) | single_choice | Hayır | High |
| 22 | Gümrük müşaviri ve temsil modeli | `EXP-022` | İhracat gümrük temsil modeli (Doğrudan/Dolaylı temsil) | single_choice | Evet | Critical |
| 23 | İhracat beyannamesi ve gümrük çıkış işlemleri | `EXP-023` | Gümrük Çıkış Beyannamesi (GÇB / VEDOP) tescili ve fiili çıkış teyidi | single_choice | Evet | Critical |
| 24 | İhracat beyannamesi ve gümrük çıkış işlemleri | `EXP-024` | Gümrük muayene hatları (Kırmızı/Sarı/Yeşil) ve kapı çıkış kontrolleri | single_choice | Hayır | High |
| 25 | GTİP / HS kodu yönetimi | `EXP-025` | 12 haneli GTİP tespiti ve alıcı ülke tarife uyumu | single_choice | Evet | Critical |
| 26 | Menşe ve tercihli menşe belgeleri | `EXP-026` | Menşe Şahadetnamesi, tercihli menşe ve tedarikçi beyanları (Trigger 5) | single_choice | Evet | High |
| 27 | ATR, EUR.1 ve diğer dolaşım belgeleri | `EXP-027` | A.TR, EUR.1, Onaylanmış İhracatçı ve REX sistemi (Target 5) | single_choice | Hayır | High |
| 28 | İhracat izinleri ve ürün uygunluk belgeleri | `EXP-028` | Kayda bağlı ihracat, Dual-Use ve ön izin belgeleri (Trigger 6) | single_choice | Evet | High |
| 29 | İhracat izinleri ve ürün uygunluk belgeleri | `EXP-029` | CE deklarasyonu, Sağlık/Bitki Sertifikası, CoA ve TPS belgeleri (Target 6) | single_choice | Hayır | High |
| 30 | Ticari fatura, çeki listesi ve sevk evrakı | `EXP-030` | e-İhracat Faturası, Commercial Invoice ve Packing List üretimi | single_choice | Evet | Critical |
| 31 | Ticari fatura, çeki listesi ve sevk evrakı | `EXP-031` | Net/brüt kilo, hacim (m3) ve koli sayımı kantar mutabakatı | single_choice | Hayır | High |
| 32 | Konşimento, CMR, AWB ve taşıma belgeleri | `EXP-032` | Konşimento (B/L), CMR veya AWB taslak kontrolü ve orijinal takibi | single_choice | Evet | High |
| 33 | Konşimento, CMR, AWB ve taşıma belgeleri | `EXP-033` | Orijinal evrak setinin bankaya ibrazı veya hızlı kurye sevkiyatı | single_choice | Hayır | Medium |
| 34 | İhracat KDV istisnası ve mali süreç | `EXP-034` | KDV Kanunu 11/1-a istisnası, intaç tarihi ve KDV iadesi hazırlığı | single_choice | Evet | Critical |
| 35 | İhracat KDV istisnası ve mali süreç | `EXP-035` | İBKB döviz getirme yükümlülüğü (180 gün) ve TCMB bozdurma takibi | single_choice | Hayır | High |
| 36 | İhracat KDV istisnası ve mali süreç | `EXP-036` | Dahilde İşleme İzin Belgesi (DİİB) taahhüt kapatma ve tecil-terkin | single_choice | Hayır | High |
| 37 | İhracat maliyetleri, komisyon ve navlun dağıtımı | `EXP-037` | İhracat operasyonel fiili maliyetlerinin izlenmesi (Trigger 7) | single_choice | Evet | Critical |
| 38 | İhracat maliyetleri, komisyon ve navlun dağıtımı | `EXP-038` | Masraf dağıtım anahtarları ve sipariş net karlılık analizi (Target 7) | single_choice | Hayır | High |
| 39 | ERP/CRM, dış ticaret ve lojistik entegrasyonu | `EXP-039` | İhracat yazılım altyapısı ve ERP entegrasyon düzeyi | single_choice | Evet | Critical |
| 40 | ERP/CRM, dış ticaret ve lojistik entegrasyonu | `EXP-040` | B2B/B2C E-İhracat, Mikro İhracat (ETGB) ve pazar yeri satışı (Trigger 8) | single_choice | Hayır | High |
| 41 | ERP/CRM, dış ticaret ve lojistik entegrasyonu | `EXP-041` | Mikro İhracat (ETGB) beyannameleri ve KDV iade entegrasyonu (Target 8) | single_choice | Hayır | High |
| 42 | İhracat raporlama, KPI ve risk takibi | `EXP-042` | İhracat operasyonel KPI paneli ve yönetim raporlaması | single_choice | Evet | Critical |
| 43 | İhracat raporlama, KPI ve risk takibi | `EXP-043` | Yetkilendirilmiş Yükümlü Statüsü (YYS) ve yerinde gümrükleme | single_choice | Hayır | High |
| 44 | İhracat raporlama, KPI ve risk takibi | `EXP-044` | Yurtdışı müşteri şikayetleri ve Mahrece İade (Rejim 6000) yönetimi | single_choice | Hayır | High |
| 45 | İhracat arşivi, kanıt dokümanları ve iyileştirme yol haritası | `EXP-045` | İhracat evrak setinin 5-10 yıllık yasal gümrük arşivleme disiplini | single_choice | Evet | High |
| 46 | İhracat arşivi, kanıt dokümanları ve iyileştirme yol haritası | `EXP-046` | Ticaret Bakanlığı ihracat devlet yardımları (DYS) ve teşvik takibi | single_choice | Hayır | High |
| 47 | İhracat arşivi, kanıt dokümanları ve iyileştirme yol haritası | `EXP-047` | İhracat darboğazları ve yeni ERP dönüşümünden öncelikli beklentiler | single_choice | Evet | Critical |

---

## 4. 8 Koşullu Dallanma (Branching) Kuralları

1. `EXP-003 = "coklu_ulke_ve_farkli_ticaret_bolgeleri"` → `EXP-004` (Ülke bazlı rejim, ambargo ve yaptırım kısıtları)
2. `EXP-006 = "distributor_bayi_ve_harici_acente_agi"` → `EXP-007` (Distribütör sözleşmeleri, bölge koruması ve acente komisyon takibi)
3. `EXP-012 = "akreditif_veya_vesaik_mukabili_vadeli"` → `EXP-013` (İhracat akreditifi, şartname uyumu ve rezerv riski yönetimi)
4. `EXP-020 = "anlasmali_forwarder_ve_gumrukcu_portali_kullanilir"` → `EXP-021` (Gümrük müşaviri ve forwarder yazılımı API entegrasyonu)
5. `EXP-026 = "tercihli_mense_ve_dolasim_belgeleri_kullanilir"` → `EXP-027` (A.TR, EUR.1 dolaşım belgeleri, Onaylanmış İhracatçı ve REX)
6. `EXP-028 = "ihracatta_on_izin_lisans_ve_teknik_belge_gerekir"` → `EXP-029` (CE DoC, analiz sertifikası ve TPS e-belge onayları)
7. `EXP-037 = "fiili_ihracat_maliyetleri_siparis_ve_urune_dagitilir"` → `EXP-038` (Sipariş/ürün bazında masraf dağıtım anahtarları ve net kar analizi)
8. `EXP-040 = "e_ihracat_mikro_ihracat_ve_pazaryeri_satisi_var"` → `EXP-041` (Mikro İhracat ETGB beyannameleri ve pazar yeri KDV iade entegrasyonu)

*Görünürlük İstatistiği:* Cevapsız varsayılan durumda **39 soru**, tüm koşullar aktifken **47 soru**.

---

## 5. Cross-Pack İzolasyonu ve Sınır Ayrımı

- **IMPORT (İthalat):** Yurtdışı tedarik, ithalat gümrük giriş beyannamesi (4000/7100), ithalat gümrük vergileri (GV, İGV, EMY, KKDF) ve ithalat fiili maliyet dağıtımını inceler; EXPORT ise ihracat satışlarını, GÇB çıkış işlemlerini, e-İhracat faturasını, İBKB döviz transferini ve KDV 11/1-a iadesini inceler.
- **SALES (Satış):** Genel yurtiçi satış hiyerarşisini, satış kotalarını ve sevkiyat onaylarını inceler; EXPORT uluslararası teslim şekillerini (Incoterms), dövizli ihracat sözleşmelerini ve uluslararası pazar kanallarını inceler.
- **CRM (Müşteri Yönetimi):** Müşteri kartlarını, yerel temas geçmişini ve genel segmentasyonu inceler; EXPORT yabancı alıcı kredi istihbaratını, uluslararası fuar temaslarını ve distribütör bölge korumasını inceler.
- **PROPOSALS (Teklif ve Fiyatlandırma):** Genel teklif şablonlarını ve yerel iskonto kurallarını inceler; EXPORT dövizli proforma faturaları (P/I), teslim şekline göre türetilen FOB/CIF fiyatlandırmayı ve akreditif şartlarını inceler.
- **LOGISTICS & WAREHOUSE:** Yurtiçi dağıtım rotalama ve depo stok hareketlerini inceler; EXPORT uluslararası denizyolu/havayolu konteyner yüklemelerini, ISPM 15 ahşap ambalaj standartlarını, konşimento (B/L) ve CMR belgelerini inceler.
- **ACCOUNTING & INVOICING:** Genel muhasebe yevmiye fişlerini ve yurtiçi faturalamayı inceler; EXPORT GÇB intaç tarihli e-İhracat faturalarını, KDV istisnasını, yüklenilen KDV listelerini ve İBKB döviz bozdurma taahhütlerini inceler.
- **E_TRANSFORMATION:** Türkiye genel e-Dönüşüm (e-Fatura, e-İrsaliye, e-Defter) altyapısını inceler; EXPORT gümrük çıkışlı e-İhracat faturasını ve MEDOS e-A.TR/EUR.1 sistemlerini inceler.
- **LEGAL_COMPLIANCE:** Genel kurumsal uyum ve KVKK süreçlerini inceler; EXPORT uluslararası ticaret hukuku (CISG), ICC tahkim şartları, kambiyo mevzuatı ve yaptırım (Sanctions) taramasını inceler.
- **ECOMMERCE:** Genel e-ticaret sitelerini ve yerel pazar yerlerini inceler; EXPORT sınır ötesi E-İhracat, Mikro İhracat (ETGB) ve yurtdışı pazar yeri entegrasyonunu inceler.
- **FAZ-33 Managed Attachment Vault:** Soru bazlı mülakat kanıtlarını (GÇB PDF, Commercial Invoice, Packing List, B/L konşimento, A.TR, İBKB dekontu) yerel izole kasada saklar.

---

## 6. Kabul Testleri (T01–T16) Matrisi

`test/faz40_export_question_pack_test.ts` kabul testi aşağıdaki 16 başlığı deterministik olarak doğrular:

| Test ID | Test Başlığı / Kapsamı | Sonuç |
|---|---|:---:|
| **T01** | Pack Loading & Metadata Integrity (`tr.export.core` v0.1.0, kanonik kod `EXPORT`) | ✅ PASS |
| **T02** | Validator Engine Check (0 şema hatası, Kanonik kod kümesi uyumu) | ✅ PASS |
| **T03** | Soru Sayısı ve Sıralama (47 soru, `EXP-001` .. `EXP-047` deterministik sıra) | ✅ PASS |
| **T04** | Zorunlu / Opsiyonel Soru Doğruluğu (25 Zorunlu / 22 Opsiyonel) | ✅ PASS |
| **T05** | Seçenek Bütünlüğü (`is_other: true` ➔ `allow_note: true`, max 1 is_other) | ✅ PASS |
| **T06** | 25 Kanonik Süreç Kapsamı (Benzersiz 25 süreç, 0 yetim süreç, %100 kapsama) | ✅ PASS |
| **T07** | Koşullu Dallanma Motoru (8 branching noktası: cevapsız 39, aktifken 47 soru) | ✅ PASS |
| **T08** | İlerleme ve Bayraklı Cevapsız Soru Navigasyonu (25 zorunlu = %100, bayrak düşüşü = %92) | ✅ PASS |
| **T09** | Çapraz Soru Mükerrerlik Denetimi (29 diğer modülle 0 tam mükerrer soru) | ✅ PASS |
| **T10** | Müşteriye Özel Soru Adaptörü Uyumluluğu (`adaptCustomQuestionToQuestion`) | ✅ PASS |
| **T11** | ReportModel & Human-Readable Biçimlendirme (`formatAnswer` label/not eşleşmesi) | ✅ PASS |
| **T12** | DOCX Rapor Üretimi (Microsoft Word ikili dosya üretimi) | ✅ PASS |
| **T13** | Liberation Sans TrueType Unicode PDF Üretimi & UTF-8 Türkçe Doğrulama (`PDFParse`) | ✅ PASS |
| **T14** | Loader ve Alias Kayıt Eşleştirmesi (`EXPORT`, `IHRACAT`, `IHRACAT_GUMRUK`, `DIS_TICARET_EXPORT`, `EXPORT_CUSTOMS`) | ✅ PASS |
| **T15** | Sınır Ayrımı / Cross-Pack İzolasyonu (`IMPORT` ve `SALES` süreçlerinden tam ayrım) | ✅ PASS |
| **T16** | AI-Free, Zero Cloud, Offline-First & Evidence-First Kapsam Doğrulaması (0 AI terimi) | ✅ PASS |

