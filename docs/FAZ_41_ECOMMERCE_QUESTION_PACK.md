# FAZ-41: E-Ticaret ve Dijital Satış Yönetimi (ECOMMERCE) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.ecommerce.core`  
**Kanonik İş Fonksiyonu Kodu:** `ECOMMERCE`  
**Türkçe / Legacy Kod:** `E_TICARET` (Alias: `ETICARET`, `ONLINE_SATIS`, `DIGITAL_COMMERCE`)  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 26`  
**Kategori:** `Satış & Pazarlama` (Sales & Marketing)  
**Toplam Soru:** 47 Soru (`ECOM-001` .. `ECOM-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

E-Ticaret ve Dijital Satış Yönetimi (E-Commerce & Digital Sales Management) modülü; şirketlerin kendi kurumsal web mağazası (B2C/B2B), pazaryerleri (Trendyol, Hepsiburada, Amazon, N11 vb.) ve mobil kanallar üzerinden yürüttüğü dijital ticaret operasyonlarını; kanal sahipliğini, ürün kataloğu ve zengin içerik yönetimini (PIM/DAM), matris varyant ve fiyatlandırma politikalarını, sepet adımı ve dönüşüm oranlarını, online ödeme altyapılarını (Sanal POS, BDDK lisanslı ödeme kuruluşları, 3D Secure, taksit ve alternatif ödemeler), fraud/risk kontrolünü, e-Arşiv fatura entegrasyonunu, depo toplama (Pick & Pack) ve kargo API entegrasyonunu, iade/değişim ve ters lojistiği, müşteri destek kanallarını (Omni-channel), dijital reklam (ROAS) ve izinli pazarlama (İYS/KVKK) süreçlerini, kupon/sadakat sistemlerini, ERP/CRM çift yönlü entegrasyonunu ve net kanal karlılık analitiğini saha görüşmeleriyle keşfetmek üzere tasarlanmıştır.

> **Önemli Hukuki, Mali ve Platform Notu:**  
> Bu soru paketi işletmelerin e-ticaret operasyonlarının ERP/CRM sistemlerine entegrasyon olgunluğunu ve dijitalleşme seviyesini ölçmek amacıyla hazırlanmıştır. Türkiye Elektronik Ticaretin Düzenlenmesi Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği, BDDK/TCMB ödeme kuruluşu kuralları, İleti Yönetim Sistemi (İYS), pazaryeri komisyon ve ceza baremleri dinamik olup ilgili resmi mevzuat ve platform sözleşmelerinden güncel olarak doğrulanmalıdır. Bu yazılım hukuki, mali veya pazaryeri danışmanlığı teşkil etmez.

---

## 2. 25 Kanonik Süreç Envanteri

Aşağıdaki 25 kanonik süreç başlığı, soru paketi içerisindeki 47 sorunun tamamını eksiksiz ve fazlalıksız olarak kapsar:

| # | Kanonik Süreç Adı | Soru Sayısı | Soru ID Listesi | Zorunlu Soru |
|---|---|:---:|---|:---:|
| 1 | E-ticaret organizasyonu ve süreç sahipliği | 2 | `ECOM-001`, `ECOM-002` | 1 |
| 2 | Dijital satış kanalları ve kanal stratejisi | 1 | `ECOM-003` | 1 |
| 3 | Kurumsal web mağazası altyapısı | 1 | `ECOM-004` | 0 |
| 4 | Pazaryeri ve platform kullanımı | 2 | `ECOM-005`, `ECOM-006` | 1 |
| 5 | Mobil uygulama ve dijital müşteri kanalları | 2 | `ECOM-007`, `ECOM-008` | 1 |
| 6 | Ürün kataloğu ve kategori yönetimi | 2 | `ECOM-009`, `ECOM-010` | 2 |
| 7 | Ürün açıklaması, görsel ve teknik içerik yönetimi | 1 | `ECOM-011` | 1 |
| 8 | Varyant, özellik ve ürün seçenekleri | 2 | `ECOM-012`, `ECOM-013` | 1 |
| 9 | Dijital fiyatlandırma ve kampanya fiyatları | 2 | `ECOM-014`, `ECOM-015` | 1 |
| 10 | E-ticaret stok ve bulunabilirlik yönetimi | 2 | `ECOM-016`, `ECOM-017` | 1 |
| 11 | Sepet ve sipariş oluşturma süreci | 1 | `ECOM-018` | 1 |
| 12 | Sipariş onayı ve sipariş yaşam döngüsü | 1 | `ECOM-019` | 1 |
| 13 | Online ödeme ve ödeme sağlayıcıları | 1 | `ECOM-020` | 0 |
| 14 | Taksit, havale, kapıda ödeme ve alternatif ödeme | 2 | `ECOM-021`, `ECOM-022` | 1 |
| 15 | Fraud, risk ve ödeme kontrolü | 2 | `ECOM-023`, `ECOM-024` | 1 |
| 16 | E-fatura, e-arşiv ve dijital belge entegrasyonu | 2 | `ECOM-025`, `ECOM-026` | 1 |
| 17 | Depo, toplama, paketleme ve sevkiyat | 2 | `ECOM-027`, `ECOM-028` | 1 |
| 18 | Kargo, teslimat ve gönderi takibi | 2 | `ECOM-029`, `ECOM-030` | 1 |
| 19 | İptal, iade, değişim ve geri ödeme | 2 | `ECOM-031`, `ECOM-032` | 1 |
| 20 | Müşteri hizmetleri ve satış sonrası destek | 2 | `ECOM-033`, `ECOM-034` | 1 |
| 21 | Dijital pazarlama ve trafik kaynakları | 2 | `ECOM-035`, `ECOM-036` | 1 |
| 22 | Kupon, promosyon ve sadakat uygulamaları | 2 | `ECOM-037`, `ECOM-038` | 1 |
| 23 | ERP, CRM, stok ve muhasebe entegrasyonu | 2 | `ECOM-039`, `ECOM-040` | 1 |
| 24 | E-ticaret raporlama, KPI ve müşteri analitiği | 3 | `ECOM-041`, `ECOM-042`, `ECOM-043` | 1 |
| 25 | Veri güvenliği, arşivleme, riskler ve gelişim yol haritası | 4 | `ECOM-044`, `ECOM-045`, `ECOM-046`, `ECOM-047` | 2 |
| | **TOPLAM** | **47** | **47 Soru (ECOM-001..047)** | **25 Zorunlu / 22 Opsiyonel** |

---

## 3. 47 Soruluk Detaylı Soru ve Süreç Dağılım Tablosu

| # | Süreç Adı | Soru ID | Başlık / Açıklama | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | E-ticaret organizasyonu ve süreç sahipliği | `ECOM-001` | E-ticaret ve dijital satış operasyon organizasyon yapısı | single_choice | Evet | Critical |
| 2 | E-ticaret organizasyonu ve süreç sahipliği | `ECOM-002` | E-ticaret günlük operasyonunun yürütülme modeli (In-house vs. Ajans) | single_choice | Hayır | High |
| 3 | Dijital satış kanalları ve kanal stratejisi | `ECOM-003` | Aktif dijital satış kanalı karması ve web mağazası varlığı (Trigger 1) | single_choice | Evet | Critical |
| 4 | Kurumsal web mağazası altyapısı | `ECOM-004` | Kurumsal e-ticaret web mağazasının yazılım ve barındırma altyapısı (Target 1) | single_choice | Hayır | High |
| 5 | Pazaryeri ve platform kullanımı | `ECOM-005` | Pazaryeri (Trendyol, HB, Amazon vb.) mağaza ve satış faaliyeti (Trigger 2) | single_choice | Evet | Critical |
| 6 | Pazaryeri ve platform kullanımı | `ECOM-006` | Pazaryeri entegratör yazılımı ve merkezi Omni-channel panel kullanımı (Target 2) | single_choice | Hayır | High |
| 7 | Mobil uygulama ve dijital müşteri kanalları | `ECOM-007` | iOS / Android mobil alışveriş uygulaması varlığı (Trigger 3) | single_choice | Evet | High |
| 8 | Mobil uygulama ve dijital müşteri kanalları | `ECOM-008` | Mobil push bildirim, mobil kupon ve sipariş takibi yönetimi (Target 3) | single_choice | Hayır | Medium |
| 9 | Ürün kataloğu ve kategori yönetimi | `ECOM-009` | E-ticaret ürün kataloğu, kategori hiyerarşisi ve yayına alma onayı | single_choice | Evet | Critical |
| 10 | Ürün kataloğu ve kategori yönetimi | `ECOM-010` | ERP stok kartları ile e-ticaret SKU / barkod tekil eşleşmesi | single_choice | Evet | High |
| 11 | Ürün açıklaması, görsel ve teknik içerik yönetimi | `ECOM-011` | Ürün görselleri, teknik özellikler ve zengin içerik yönetimi (PIM/DAM) | single_choice | Evet | High |
| 12 | Varyant, özellik ve ürün seçenekleri | `ECOM-012` | Beden, renk, materyal gibi çoklu matris varyant yapısı (Trigger 4) | single_choice | Evet | Critical |
| 13 | Varyant, özellik ve ürün seçenekleri | `ECOM-013` | Varyant bazında bağımsız stok, ayrı barkod ve fiyatlandırma (Target 4) | single_choice | Hayır | High |
| 14 | Dijital fiyatlandırma ve kampanya fiyatları | `ECOM-014` | E-ticaret kanal bazlı fiyatlandırma ve komisyon/kargo maliyet matrisi | single_choice | Evet | Critical |
| 15 | Dijital fiyatlandırma ve kampanya fiyatları | `ECOM-015` | Zaman ayarlı otomatik kampanyalar ve sepet indirim kural motoru | single_choice | Hayır | High |
| 16 | E-ticaret stok ve bulunabilirlik yönetimi | `ECOM-016` | Emniyet stoğu, kritik stokta otomatik satışa kapatma ve rezervasyon | single_choice | Evet | Critical |
| 17 | E-ticaret stok ve bulunabilirlik yönetimi | `ECOM-017` | Çoklu depo/mağaza stok havuzu ve mağazadan sevkiyat (Omni-channel) | single_choice | Hayır | High |
| 18 | Sepet ve sipariş oluşturma süreci | `ECOM-018` | Ücretsiz kargo barajı, sepet terk oranı ve otomatik sepet kurtarma | single_choice | Evet | High |
| 19 | Sipariş onayı ve sipariş yaşam döngüsü | `ECOM-019` | Sipariş statü akışı ve müşteriye otomatik bildirimler (Trigger 5) | single_choice | Evet | Critical |
| 20 | Online ödeme ve ödeme sağlayıcıları | `ECOM-020` | Sanal POS, BDDK lisanslı ödeme gateway'leri ve komisyon mutabakatı (Target 5) | single_choice | Hayır | High |
| 21 | Taksit, havale, kapıda ödeme ve alternatif ödeme | `ECOM-021` | Kredi kartı taksit sınırları, vade farkı ve banka kartı kampanyaları | single_choice | Evet | High |
| 22 | Taksit, havale, kapıda ödeme ve alternatif ödeme | `ECOM-022` | Havale/EFT, kapıda ödeme ve dijital cüzdan tahsilat süreçleri | single_choice | Hayır | Medium |
| 23 | Fraud, risk ve ödeme kontrolü | `ECOM-023` | 3D Secure kullanımı, şüpheli işlem filtreleri ve fraud kontrolü (Trigger 6) | single_choice | Evet | High |
| 24 | Fraud, risk ve ödeme kontrolü | `ECOM-024` | Riskli sipariş inceleme kuyruğu ve ters ibraz (Chargeback) savunması (Target 6) | single_choice | Hayır | High |
| 25 | E-fatura, e-arşiv ve dijital belge entegrasyonu | `ECOM-025` | E-Arşiv Fatura düzenleme anı, TCKN doğrulama ve müşteriye iletim | single_choice | Evet | Critical |
| 26 | E-fatura, e-arşiv ve dijital belge entegrasyonu | `ECOM-026` | Pazaryeri komisyon/kargo faturaları ile şirket cari hesap mutabakatı | single_choice | Hayır | High |
| 27 | Depo, toplama, paketleme ve sevkiyat | `ECOM-027` | El terminali ile dalga toplama (Pick & Pack) ve barkodlu paketleme kontrolü | single_choice | Evet | Critical |
| 28 | Depo, toplama, paketleme ve sevkiyat | `ECOM-028` | Aynı gün kargo kesim saati (Cut-off) ve kampanya pik kapasite yönetimi | single_choice | Hayır | High |
| 29 | Kargo, teslimat ve gönderi takibi | `ECOM-029` | Anlaşmalı kargo firmaları ile API entegrasyonu ve barkod basımı (Trigger 7) | single_choice | Evet | Critical |
| 30 | Kargo, teslimat ve gönderi takibi | `ECOM-030` | Kargo takip numarasının anlık iletimi ve teslimat statü alarmları (Target 7) | single_choice | Hayır | High |
| 31 | İptal, iade, değişim ve geri ödeme | `ECOM-031` | Müşteri online iade talebi, otomatik iade kargo kodu ve kabul süreci | single_choice | Evet | Critical |
| 32 | İptal, iade, değişim ve geri ödeme | `ECOM-032` | İade ürünün depoda kalite kontrolü, gider pusulası ve POS'tan para iadesi | single_choice | Hayır | High |
| 33 | Müşteri hizmetleri ve satış sonrası destek | `ECOM-033` | Omni-channel müşteri destek paneli (WhatsApp, Canlı Destek, Pazaryeri) | single_choice | Evet | High |
| 34 | Müşteri hizmetleri ve satış sonrası destek | `ECOM-034` | Kırık/hasarlı/eksik ürün şikayetleri ve telafi siparişi süreci | single_choice | Hayır | Medium |
| 35 | Dijital pazarlama ve trafik kaynakları | `ECOM-035` | Google/Meta/Pazaryeri reklamları, ROAS ve dönüşüm takibi | single_choice | Evet | High |
| 36 | Dijital pazarlama ve trafik kaynakları | `ECOM-036` | E-posta/SMS pazarlaması, sepet hatırlatma ve İYS/KVKK izin uyumu | single_choice | Hayır | Medium |
| 37 | Kupon, promosyon ve sadakat uygulamaları | `ECOM-037` | Kişiye özel kuponlar, affiliate/influencer kodları ve puan sistemi (Trigger 8) | single_choice | Evet | High |
| 38 | Kupon, promosyon ve sadakat uygulamaları | `ECOM-038` | Influencer satış komisyonları, sahtecilik önleme ve kupon marj kontrolü (Target 8) | single_choice | Hayır | Medium |
| 39 | ERP, CRM, stok ve muhasebe entegrasyonu | `ECOM-039` | E-ticaret sipariş, stok ve cari hareketlerinin ERP/Muhasebe aktarım mimarisi | single_choice | Evet | Critical |
| 40 | ERP, CRM, stok ve muhasebe entegrasyonu | `ECOM-040` | Entegrasyon hata kuyruğu (DLQ), retry mekanizması ve admin uyarıları | single_choice | Hayır | High |
| 41 | E-ticaret raporlama, KPI ve müşteri analitiği | `ECOM-041` | E-ticaret operasyonel KPI paneli (Ciro, Sepet, İade Oranı, Kargo Gideri) | single_choice | Evet | Critical |
| 42 | E-ticaret raporlama, KPI ve müşteri analitiği | `ECOM-042` | Müşteri Edinme Maliyeti (CAC) ve net kanal karlılık analizi | single_choice | Hayır | High |
| 43 | E-ticaret raporlama, KPI ve müşteri analitiği | `ECOM-043` | Tekrarlayan müşteri oranı, kohort analizi ve RFM segmentasyonu | single_choice | Hayır | Medium |
| 44 | Veri güvenliği, arşivleme, riskler ve gelişim yol haritası | `ECOM-044` | PCI-DSS uyumu, kart tokenization, SSL ve siber güvenlik önlemleri | single_choice | Evet | Critical |
| 45 | Veri güvenliği, arşivleme, riskler ve gelişim yol haritası | `ECOM-045` | E-ticaret sipariş, fatura ve iletişim loglarının yasal saklama disiplini | single_choice | Hayır | High |
| 46 | Veri güvenliği, arşivleme, riskler ve gelişim yol haritası | `ECOM-046` | E-ticaret operasyonundaki en kritik darboğazlar ve stoksuz satış riskleri | single_choice | Hayır | High |
| 47 | Veri güvenliği, arşivleme, riskler ve gelişim yol haritası | `ECOM-047` | Yeni ERP ve entegre dijital ticaret dönüşümünden öncelikli beklentiler | single_choice | Evet | Critical |

---

## 4. 8 Koşullu Dallanma (Branching) Kuralları

1. `ECOM-003 = "kendi_web_magazamiz_ve_pazaryerleri_birlikte"` → `ECOM-004` (Kurumsal web mağazasının yazılım ve SaaS altyapısı)
2. `ECOM-005 = "aktif_coklu_pazaryeri_magazasi_var"` → `ECOM-006` (Pazaryeri entegratör yazılımı ve sipariş senkronizasyonu)
3. `ECOM-007 = "ozel_mobil_uygulama_ios_android_var"` → `ECOM-008` (Mobil push bildirim, mobil kupon ve sipariş takibi)
4. `ECOM-012 = "cok_varyantli_ve_matris_ozellikli_urunler_var"` → `ECOM-013` (Varyant bazında bağımsız stok, ayrı barkod ve fiyat farkları)
5. `ECOM-019 = "tam_entegre_otomatik_statu_akisi_ve_sms_e_posta_bildirimi"` → `ECOM-020` (Sanal POS, BDDK ödeme kuruluşları ve komisyon mutabakatı)
6. `ECOM-023 = "3d_secure_zorunlu_ve_otomatik_fraud_filtresi_var"` → `ECOM-024` (Riskli sipariş inceleme kuyruğu ve Chargeback savunması)
7. `ECOM-029 = "kargo_firmasi_ile_api_entegrasyonu_var_barkod_otomatik_basilir"` → `ECOM-030` (Kargo takip kodunun anlık iletimi ve teslimat statü takibi)
8. `ECOM-037 = "kupon_affiliate_ve_sadakat_sistemi_aktif_kullanilir"` → `ECOM-038` (Influencer satış komisyonları, sahtecilik önleme ve kupon marj kontrolü)

*Görünürlük İstatistiği:* Cevapsız varsayılan durumda **39 soru**, tüm koşullar aktifken **47 soru**.

---

## 5. Cross-Pack İzolasyonu ve Sınır Ayrımı

- **SALES (Satış):** Genel B2B satış hiyerarşisini, saha satış ekibini, teklif onay zincirini ve bayi kotalarını inceler; ECOMMERCE ise B2C/B2B online sepet adımlarını, pazaryeri mağazalarını, web mağazası CMS'ini ve anlık sipariş akışını inceler.
- **CRM (Müşteri İlişkileri):** Kurumsal müşteri kartlarını, saha görüşme aktivitelerini ve genel müşteri yaşam döngüsünü inceler; ECOMMERCE dijital müşteri deneyimini, terk edilen sepetleri, RFM e-ticaret segmentasyonunu ve Omni-channel canlı destek panellerini inceler.
- **MARKETING (Pazarlama):** Genel kurumsal marka iletişimini, fuar organizasyonlarını ve geleneksel pazarlama bütçelerini inceler; ECOMMERCE dijital performans pazarlamasını (Google Ads, Meta, Pazaryeri Sponsorlu Reklamlar), ROAS optimizasyonunu, kupon/affiliate kurgularını ve İYS izinli pazarlamayı inceler.
- **PROPOSALS (Teklif ve Fiyatlandırma):** Kurumsal proje teklif şablonlarını ve özel iskonto matrislerini inceler; ECOMMERCE sepet adımındaki süreli indirimleri, flaş kampanyaları, pazaryeri Buybox rekabet fiyatlarını ve taksit vade farkı kurgularını inceler.
- **INVENTORY & WAREHOUSE:** Genel fabrika stok seviyelerini, depo adresleme mimarisini ve sayım süreçlerini inceler; ECOMMERCE e-ticaret tampon emniyet stoğunu, anlık stoksuz satış (over-selling) kilitlemesini, el terminali ile dalga toplamayı (Pick & Pack) ve aynı gün kargo kesim saatini inceler.
- **LOGISTICS (Lojistik):** Fabrika sevkiyat planlamasını, komple/parsiyel TIR/kamyon rotalamasını inceler; ECOMMERCE koli bazlı son tüketici kargo API entegrasyonunu, ZPL termal barkod basımını, müşteri kargo takip SMS'lerini ve anlaşmalı kargo iade kodlarını inceler.
- **ACCOUNTING & INVOICING:** Genel yevmiye kayıtlarını, bilanço/mizan ve genel cari faturalamayı inceler; ECOMMERCE sipariş anında otomatik e-Arşiv faturası üretimini, pazaryeri komisyon/kargo kesinti mutabakatını ve iade gider pusulalarını inceler.
- **TREASURY (Hazine & Finans):** Kurumsal banka kredi limitlerini, nakit akış projeksiyonlarını ve çek/senet portföyünü inceler; ECOMMERCE sanal POS tahsilatlarını, BDDK lisanslı ödeme kuruluşu hakedişlerini, taksit komisyon maliyetini ve chargeback itirazlarını inceler.
- **EXPORT (İhracat):** GÇB ihracat beyannamesini, uluslararası navlunu, Incoterms ve İBKB kambiyo takibini inceler; ECOMMERCE yurtiçi ve pazaryeri dijital satışlarını inceler (Sınır ötesi e-ihracatta ETGB mikro ihracat beyannamesi EXPORT ve ECOMMERCE arasında entegrasyon temas noktasıdır).
- **FAZ-33 Managed Attachment Vault:** Soru bazlı mülakat kanıtlarını (Pazaryeri komisyon ekstresi, Sanal POS hakediş raporu, Kargo ZPL etiket örneği, e-Arşiv fatura PDF'i, İade Gider Pusulası) yerel izole kasada saklar.

---

## 6. Kabul Testleri (T01–T17) Matrisi

`test/faz41_ecommerce_question_pack_test.ts` kabul testi aşağıdaki 17 başlığı deterministik olarak doğrular:

| Test ID | Test Başlığı / Kapsamı | Sonuç |
|---|---|:---:|
| **T01** | Pack Loading & Metadata Integrity (`tr.ecommerce.core` v0.1.0, kanonik kod `ECOMMERCE`) | ✅ PASS |
| **T02** | Validator Engine Check (0 şema hatası, Kanonik kod kümesi uyumu) | ✅ PASS |
| **T03** | Soru Sayısı ve Sıralama (47 soru, `ECOM-001` .. `ECOM-047` deterministik sıra) | ✅ PASS |
| **T04** | Zorunlu / Opsiyonel Soru Doğruluğu (25 Zorunlu / 22 Opsiyonel) | ✅ PASS |
| **T05** | Seçenek Bütünlüğü (`is_other: true` ➔ `allow_note: true`, max 1 is_other) | ✅ PASS |
| **T06** | 25 Kanonik Süreç Kapsamı (Benzersiz 25 süreç, 0 yetim süreç, %100 kapsama) | ✅ PASS |
| **T07** | Her Sürecin En Az Bir Soruyla Kapsanması (%100 kanonik süreç kapsama garantisi) | ✅ PASS |
| **T08** | Koşullu Dallanma Motoru (8 branching noktası: cevapsız 39, aktifken 47 soru) | ✅ PASS |
| **T09** | İlerleme ve Bayraklı Cevapsız Soru Navigasyonu (25 zorunlu = %100, bayrak düşüşü = %92) | ✅ PASS |
| **T10** | Çapraz Soru Mükerrerlik Denetimi (30 diğer modülle 0 tam mükerrer soru) | ✅ PASS |
| **T11** | Müşteriye Özel Soru Adaptörü Uyumluluğu (`adaptCustomQuestionToQuestion`) | ✅ PASS |
| **T12** | ReportModel & Human-Readable Biçimlendirme (`formatAnswer` label/not eşleşmesi) | ✅ PASS |
| **T13** | DOCX Rapor Üretimi (Microsoft Word ikili dosya üretimi) | ✅ PASS |
| **T14** | Liberation Sans TrueType Unicode PDF Üretimi & UTF-8 Türkçe Doğrulama (`PDFParse`) | ✅ PASS |
| **T15** | Loader ve Alias Kayıt Eşleştirmesi (`ECOMMERCE`, `E_TICARET`, `ETICARET`, `ONLINE_SATIS`, `DIGITAL_COMMERCE`) | ✅ PASS |
| **T16** | E-ticaret–Satış–CRM–Pazarlama Sınır Ayrımı (Cross-Pack Isolation) | ✅ PASS |
| **T17** | E-ticaret–Depo–Lojistik–İade Sınır Ayrımı & AI-Free Doğrulaması (0 AI terimi) | ✅ PASS |
