# FAZ-39: İthalat ve Gümrük Yönetimi (IMPORT) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.import.core`  
**Kanonik İş Fonksiyonu Kodu:** `IMPORT`  
**Türkçe / Legacy Kod:** `ITHALAT` (Alias: `ITHALAT_GUMRUK`, `DIS_TICARET_IMPORT`, `IMPORT_CUSTOMS`)  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 24`  
**Kategori:** `Lojistik & Depo` (Logistics & Warehouse)  
**Toplam Soru:** 47 Soru (`IMP-001` .. `IMP-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

İthalat ve Gümrük Yönetimi (Import & Customs Management) modülü, şirketlerin yurtdışı hammadde, ticari mal ve makine-teçhizat tedarik süreçlerini; uluslararası sözleşmeler, Incoterms teslim şekilleri, dış ticaret ödeme türleri (akreditif, vesaik mukabili, peşin), uluslararası navlun ve lojistik modları, gümrük müşavirliği temsil modeli, GTİP / HS kodu yönetimi, menşe belgeleri (A.TR, EUR.1), ithalat izinleri (TAREKS / TPS), antrepo rejimleri, gümrük vergileri (GV, İGV, EMY, KKDF, KDV/ÖTV), ithalat fiili maliyetlerinin (Landed Cost) stok kartlarına dağıtımı ve muhasebe 159 hesap kapatma döngüsünü saha görüşmeleriyle keşfetmek için tasarlanmıştır.

> **Önemli Hukuki ve Mevzuat Notu:**  
> Bu soru paketi işletmelerin ithalat ve gümrük süreçlerinin ERP/CRM sistemlerine entegrasyon olgunluğunu ölçmek amacıyla hazırlanmıştır. Türkiye gümrük mevzuatı, vergi oranları (GV, İGV, KKDF vb.) ve tebliğler dinamik olup her ithalat operasyonunda yetkili gümrük müşaviri ve mevzuat kaynaklarından doğrulanmalıdır. Bu uygulama hukuki, mali veya gümrük danışmanlığı teşkil etmez.

---

## 2. 25 Kanonik Süreç Envanteri

Aşağıdaki 25 kanonik süreç başlığı, soru paketi içerisindeki 47 sorunun tamamını eksiksiz ve fazlalıksız olarak kapsar:

| # | Kanonik Süreç Adı | Soru Sayısı | Soru ID Listesi | Zorunlu Soru |
|---|---|:---:|---|:---:|
| 1 | İthalat organizasyonu ve süreç sahipliği | 2 | `IMP-001`, `IMP-002` | 1 |
| 2 | İthalat yapılan ülke ve tedarikçi coğrafyası | 2 | `IMP-003`, `IMP-004` | 1 |
| 3 | İthalat ürün ve malzeme kapsamı | 1 | `IMP-005` | 1 |
| 4 | İthalat tedarikçi seçimi | 1 | `IMP-006` | 0 |
| 5 | İthalat ödeme şekilleri | 1 | `IMP-007` | 1 |
| 6 | Akreditif ve banka teminatları | 1 | `IMP-008` | 0 |
| 7 | Incoterms kullanımı | 1 | `IMP-009` | 1 |
| 8 | Navlun ve taşıma planlaması | 1 | `IMP-010` | 1 |
| 9 | Nakliye türü ve taşıyıcı seçimi | 1 | `IMP-011` | 0 |
| 10 | Gümrük müşaviri ve temsil modeli | 2 | `IMP-012`, `IMP-013` | 1 |
| 11 | GTİP / HS kodu yönetimi | 2 | `IMP-014`, `IMP-015` | 1 |
| 12 | İthalat izinleri ve özel belgeler | 2 | `IMP-016`, `IMP-017` | 1 |
| 13 | Menşe ve tercihli menşe belgeleri | 2 | `IMP-018`, `IMP-019` | 1 |
| 14 | Antrepo, geçici depolama ve gümrük statüsü | 2 | `IMP-020`, `IMP-021` | 1 |
| 15 | Gümrük vergileri ve mali yükümlülükler | 2 | `IMP-022`, `IMP-023` | 1 |
| 16 | KDV, ÖTV ve diğer ithalat vergileri | 1 | `IMP-024` | 1 |
| 17 | İthalat masraflarının maliyete dağıtılması | 2 | `IMP-025`, `IMP-026` | 1 |
| 18 | Dış ticaret sözleşmeleri | 1 | `IMP-027` | 1 |
| 19 | Proforma fatura ve sipariş süreci | 2 | `IMP-028`, `IMP-029` | 1 |
| 20 | Gümrük beyannamesi hazırlığı | 2 | `IMP-030`, `IMP-031` | 1 |
| 21 | Ürün uygunluk ve teknik mevzuat belgeleri | 2 | `IMP-032`, `IMP-033` | 1 |
| 22 | Muayene, eksiklik ve gümrük kontrolü | 2 | `IMP-034`, `IMP-035` | 1 |
| 23 | İthalat lojistik takibi ve teslim alma | 2 | `IMP-036`, `IMP-037` | 1 |
| 24 | İthalat muhasebe ve ERP entegrasyonu | 5 | `IMP-038`, `IMP-039`, `IMP-040`, `IMP-044`, `IMP-045` | 2 |
| 25 | İthalat raporlama, riskler ve iyileştirme planı | 5 | `IMP-041`, `IMP-042`, `IMP-043`, `IMP-046`, `IMP-047` | 3 |
| | **TOPLAM** | **47** | **47 Soru (IMP-001..047)** | **25 Zorunlu** |

---

## 3. 47 Soruluk Detaylı Soru ve Süreç Dağılım Tablosu

| # | Süreç Adı | Soru ID | Başlık / Açıklama | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | İthalat organizasyonu ve süreç sahipliği | `IMP-001` | İthalat ve dış ticaret operasyon organizasyon yapısı | single_choice | Evet | Critical |
| 2 | İthalat organizasyonu ve süreç sahipliği | `IMP-002` | İthalat dosyası yaşam döngüsü ve dosya bazlı takip | single_choice | Hayır | High |
| 3 | İthalat yapılan ülke ve tedarikçi coğrafyası | `IMP-003` | İthalat ülkeleri, STA, Gümrük Birliği ve tercihli rejim yönetimi | single_choice | Evet | High |
| 4 | İthalat yapılan ülke ve tedarikçi coğrafyası | `IMP-004` | Transit süreler, tedarik termin süreleri ve gecikme riskleri | single_choice | Hayır | Medium |
| 5 | İthalat ürün ve malzeme kapsamı | `IMP-005` | İthal malzeme türleri ve ERP stok kartı / GTİP eşleşmesi | single_choice | Evet | Critical |
| 6 | İthalat tedarikçi seçimi | `IMP-006` | Yurtdışı tedarikçi değerlendirme ve onaylı tedarikçi listesi | single_choice | Hayır | High |
| 7 | İthalat ödeme şekilleri | `IMP-007` | Uluslararası dış ticaret ödeme şekilleri (Branching Trigger 1) | single_choice | Evet | Critical |
| 8 | Akreditif ve banka teminatları | `IMP-008` | Akreditif (L/C) açılışı, rezerv ve teyit süreci (Branching Target 1) | single_choice | Hayır | High |
| 9 | Incoterms kullanımı | `IMP-009` | Incoterms 2020 teslim şekilleri ve masraf/risk paylaşımı | single_choice | Evet | Critical |
| 10 | Navlun ve taşıma planlaması | `IMP-010` | Uluslararası lojistik ve taşıma modları (Branching Trigger 2) | single_choice | Evet | High |
| 11 | Nakliye türü ve taşıyıcı seçimi | `IMP-011` | Forwarder seçimi, navlun sözleşmesi ve demuraj takibi (Target 2) | single_choice | Hayır | High |
| 12 | Gümrük müşaviri ve temsil modeli | `IMP-012` | Gümrük temsil modeli (Doğrudan/Dolaylı temsil) (Branching Trigger 3) | single_choice | Evet | Critical |
| 13 | Gümrük müşaviri ve temsil modeli | `IMP-013` | Müşavir yazılımı ile dijital veri/evrak entegrasyonu (Target 3) | single_choice | Hayır | High |
| 14 | GTİP / HS kodu yönetimi | `IMP-014` | GTİP tespiti ve kurumsal tarife yönetişimi (Branching Trigger 4) | single_choice | Evet | Critical |
| 15 | GTİP / HS kodu yönetimi | `IMP-015` | Bağlayıcı Tarife Bilgisi (BTB) ve periyodik tarife denetimi (Target 4) | single_choice | Hayır | High |
| 16 | İthalat izinleri ve özel belgeler | `IMP-016` | Ön izin, gözetim belgesi ve lisans gereksinimleri (Branching Trigger 5) | single_choice | Evet | Critical |
| 17 | İthalat izinleri ve özel belgeler | `IMP-017` | TAREKS e-denetim ve Tek Pencere Sistemi (TPS) onayları (Target 5) | single_choice | Hayır | High |
| 18 | Menşe ve tercihli menşe belgeleri | `IMP-018` | Menşe Şahadetnamesi, A.TR, EUR.1 ve tedarikçi beyanları | single_choice | Evet | High |
| 19 | Menşe ve tercihli menşe belgeleri | `IMP-019` | Menşe sonradan kontrol talepleri ve ceza riskleri | single_choice | Hayır | Medium |
| 20 | Antrepo, geçici depolama ve gümrük statüsü | `IMP-020` | Antrepo (Genel/Özel) ve geçici depolama kullanımı (Branching Trigger 6) | single_choice | Evet | Critical |
| 21 | Antrepo, geçici depolama ve gümrük statüsü | `IMP-021` | 7100 Antrepo Rejimi, antrepo stok kartı ve kısmi çekimler (Target 6) | single_choice | Hayır | High |
| 22 | Gümrük vergileri ve mali yükümlülükler | `IMP-022` | Gümrük Vergisi, İGV, EMY ve Damping vergisi hesaplamaları | single_choice | Evet | Critical |
| 23 | Gümrük vergileri ve mali yükümlülükler | `IMP-023` | Vadeli ithalatta Kaynak Kullanımını Destekleme Fonu (KKDF) takibi | single_choice | Hayır | High |
| 24 | KDV, ÖTV ve diğer ithalat vergileri | `IMP-024` | İthalatta KDV matrahı oluşumu, ÖTV ve gümrük makbuzu muhasebesi | single_choice | Evet | High |
| 25 | İthalat masraflarının maliyete dağıtılması | `IMP-025` | İthalat fiili masraflarının stok maliyetine dağıtılması (Trigger 7) | single_choice | Evet | Critical |
| 26 | İthalat masraflarının maliyete dağıtılması | `IMP-026` | Masraf dağıtım anahtarları ve geç gelen faturalar (Target 7) | single_choice | Hayır | High |
| 27 | Dış ticaret sözleşmeleri | `IMP-027` | Uluslararası satınalma sözleşmeleri, garanti ve ceza şartları | single_choice | Evet | High |
| 28 | Proforma fatura ve sipariş süreci | `IMP-028` | Proforma Fatura (P/I) onayı ve dövizli sipariş oluşturma | single_choice | Evet | Critical |
| 29 | Proforma fatura ve sipariş süreci | `IMP-029` | Parçalı yükleme (partial shipment) ve sipariş bakiye takibi | single_choice | Hayır | Medium |
| 30 | Gümrük beyannamesi hazırlığı | `IMP-030` | Gümrük Giriş Beyannamesi (GÇB) tescil ve kapanış süreci | single_choice | Evet | Critical |
| 31 | Gümrük beyannamesi hazırlığı | `IMP-031` | Beyanname ile fatura/çeki listesi kalemlerinin mutabakatı | single_choice | Hayır | High |
| 32 | Ürün uygunluk ve teknik mevzuat belgeleri | `IMP-032` | CE deklarasyonu, TSE belgesi, MSDS ve analiz sertifikaları | single_choice | Evet | High |
| 33 | Ürün uygunluk ve teknik mevzuat belgeleri | `IMP-033` | Türkçe kullanma kılavuzu, etiketleme ve SSHYB yönetimi | single_choice | Hayır | Medium |
| 34 | Muayene, eksiklik ve gümrük kontrolü | `IMP-034` | Gümrük muayene hatları (Kırmızı/Sarı vb.) ve laboratuvar tahlilleri | single_choice | Evet | High |
| 35 | Muayene, eksiklik ve gümrük kontrolü | `IMP-035` | Hasarlı/eksik eşya için tutanak, sigorta hasarı ve tedarikçi debit note | single_choice | Hayır | High |
| 36 | İthalat lojistik takibi ve teslim alma | `IMP-036` | Orijinal konşimento (B/L), ordino alımı ve iç nakliye sevki | single_choice | Evet | High |
| 37 | İthalat lojistik takibi ve teslim alma | `IMP-037` | Fabrika deposuna fiziki kabul, barkodlu sayım ve millileşme | single_choice | Hayır | Medium |
| 38 | İthalat muhasebe ve ERP entegrasyonu | `IMP-038` | İthalat dosyasının kapatılması (159 hesabın 150/153'e devri) | single_choice | Evet | Critical |
| 39 | İthalat muhasebe ve ERP entegrasyonu | `IMP-039` | İthalatta kur farkları ve muhasebeleştirme kuralları (VUK) | single_choice | Hayır | High |
| 40 | İthalat muhasebe ve ERP entegrasyonu | `IMP-040` | Gümrük teminat mektupları ve teminat çözümü takibi | single_choice | Hayır | High |
| 41 | İthalat raporlama, riskler ve iyileştirme planı | `IMP-041` | İthalat operasyonel KPI paneli ve maliyet analiz dashboard'u | single_choice | Evet | Critical |
| 42 | İthalat raporlama, riskler ve iyileştirme planı | `IMP-042` | Yetkilendirilmiş Yükümlü Statüsü (YYS) ve yerinde gümrükleme | single_choice | Hayır | High |
| 43 | İthalat raporlama, riskler ve iyileştirme planı | `IMP-043` | İthalat evrak setinin 5-10 yıllık yasal gümrük arşivleme disiplini | single_choice | Evet | High |
| 44 | İthalat muhasebe ve ERP entegrasyonu | `IMP-044` | İthalat yazılım altyapısı (Özel Dış Ticaret / ERP / Excel) (Trigger 8) | single_choice | Evet | Critical |
| 45 | İthalat muhasebe ve ERP entegrasyonu | `IMP-045` | Harici dış ticaret yazılımı ile ERP arasında API veri akışı (Target 8) | single_choice | Hayır | High |
| 46 | İthalat raporlama, riskler ve iyileştirme planı | `IMP-046` | Kambiyo mevzuatı ve döviz transferi bildirimleri (İKÇ) | single_choice | Hayır | Medium |
| 47 | İthalat raporlama, riskler ve iyileştirme planı | `IMP-047` | İthalat darboğazları ve yeni ERP dönüşümünden öncelikli beklentiler | single_choice | Evet | Critical |

---

## 4. 8 Koşullu Dallanma (Branching) Kuralları

1. `IMP-007 = "akreditif_veya_vadeli_kredili_odeme"` → `IMP-008` (Akreditif açılışı, rezerv ve teyit takibi)
2. `IMP-010 = "coklu_kombine_multimodal_veya_deniz_hava_tasima"` → `IMP-011` (Forwarder sözleşmesi, free time ve demuraj takibi)
3. `IMP-012 = "dolayli_temsil_harici_gumruk_musavirligi"` → `IMP-013` (Müşavir sistemi ile API veri entegrasyonu)
4. `IMP-014 = "sirket_ici_ve_musavir_birlikte_gtip_belirler"` → `IMP-015` (Bağlayıcı Tarife Bilgisi BTB ve tarife denetimi)
5. `IMP-016 = "ithalatta_on_izin_ve_tareks_tps_onaylari_gerekir"` → `IMP-017` (TAREKS ve TPS e-belge onay takibi)
6. `IMP-020 = "genel_veya_ozel_antrepo_kullanilmaktadir"` → `IMP-021` (7100 Antrepo Rejimi ve gümrüklü stok kartı)
7. `IMP-025 = "fiili_ithalat_maliyetleri_stok_maliyetine_dagitilir"` → `IMP-026` (Çoklu masraf dağıtım anahtarları ve maliyet farkı fişi)
8. `IMP-044 = "ozel_dis_ticaret_yazilimi_ve_erp_entegrasyonu_var"` → `IMP-045` (Harici dış ticaret sistemi - ERP API senkronizasyonu)

*Görünürlük İstatistiği:* Cevapsız varsayılan durumda **39 soru**, tüm koşullar aktifken **47 soru**.

---

## 5. Cross-Pack İzolasyonu ve Sınır Ayrımı

- **EXPORT (İhracat):** İhracat operasyonlarını, e-İhracat faturasını, İBKB döviz bozdurma ve KDV iadesini yönetir; IMPORT ithalat ve gümrük giriş işlemlerini inceler.
- **PROCUREMENT (Satın Alma):** Genel yurtiçi satınalma taleplerini, tedarikçi teklif toplamayı ve onay hiyerarşisini inceler; IMPORT uluslararası tedarik, navlun, gümrük vergileri ve dış ticaret mevzuatını inceler.
- **SUPPLIER_MANAGEMENT:** Genel tedarikçi değerlendirme ve kalite denetimlerini inceler; IMPORT yurtdışı tedarikçi akreditasyonu ve menşe doğrulamasını inceler.
- **LOGISTICS (Lojistik):** Yurtiçi sevkiyat, dağıtım ve rota optimizasyonunu inceler; IMPORT uluslararası denizyolu/havayolu navlununu, konşimentoyu ve ordino/liman ardiye süreçlerini inceler.
- **INVENTORY & WAREHOUSE:** Depo içi raflama ve stok hareketlerini inceler; IMPORT 7100 antrepo rejimi, gümrüklü/millileşmiş stok ayrımını ve ithalat fiili maliyet dağıtımını inceler.
- **ACCOUNTING & COSTING:** Genel muhasebe fişlerini ve ürün maliyet muhasebesini inceler; IMPORT ithalat KDV matrahını, ÖTV'yi, gümrük makbuzunu ve 159 ithalat hesabı kapatma virmanlarını inceler.
- **E_TRANSFORMATION:** GİB, UBL-TR, e-Fatura, e-İrsaliye teknik protokollerini inceler; IMPORT gümrük beyannamesi (GÇB), TAREKS ve TPS gümrük e-belgelerini inceler.
- **LEGAL_COMPLIANCE:** Genel kurumsal mevzuat ve KVKK uyumunu inceler; IMPORT gümrük ve kambiyo mevzuatı uyumunu inceler.
- **FAZ-33 Managed Attachment Vault:** Soru bazlı mülakat kanıtlarını (GÇB PDF, B/L, konşimento, analiz raporu) yerel izole kasada saklar.
