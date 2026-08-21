# FAZ-36: E-Dönüşüm Yönetimi (E_TRANSFORMATION) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.e_transformation.core`  
**Kanonik İş Fonksiyonu Kodu:** `E_TRANSFORMATION`  
**Türkçe / Legacy Kod:** `E_DONUSUM` / `EDONUSUM`  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 33`  
**Kategori:** `Muhasebe & Finans` (Accounting & Finance)  
**Toplam Soru:** 47 Soru (`EDT-001` .. `EDT-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

Gelir İdaresi Başkanlığı (GİB) regülasyonları çerçevesinde Türkiye'de faaliyet gösteren şirketlerin e-Fatura, e-Arşiv, e-İrsaliye, e-Defter (berat oluşturma, imzalama, GİB yükleme ve ikincil saklama), e-SMM, e-Müstahsil, UBL-TR standartları, mali mühür/e-imza güvenliği, özel entegratör mimarisi, ihracat e-faturası (GTB referansı), vergi tevkifat/istisna kodları ve 10 yıllık yasal elektronik arşivleme olgunluğunu ölçen saha keşif soru paketidir.

---

## 2. 25 Kanonik Süreç ve Soru Dağılımı

| # | Süreç Adı | Soru ID | Başlık / Açıklama | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | E-Dönüşüm Organizasyonu ve Sorumluluklar | `EDT-001` | Şirket içi resmi e-Dönüşüm sorumlusu ve görev dağılımı | single_choice | Evet | Critical |
| 2 | E-Dönüşüm Organizasyonu ve Sorumluluklar | `EDT-002` | GİB mevzuat tebliğleri ve e-belge zorunlulukları takip mekanizması | single_choice | Hayır | High |
| 3 | GİB Mükellefiyet ve Kapsam Değerlendirmesi | `EDT-003` | GİB kayıtlı kullanıcı statüsü ve dahil olunan e-belgeler | single_choice | Evet | Critical |
| 4 | GİB Mükellefiyet ve Kapsam Değerlendirmesi | `EDT-004` | Grup şirketleri ve şubelerin VKN/PK/GB bazlı yönetimi | single_choice | Hayır | High |
| 5 | Özel Entegratör ve Entegrasyon Modeli | `EDT-005` | GİB Portal / Özel Entegratör / Doğrudan Entegrasyon seçimi (Branching Trigger 5) | single_choice | Evet | Critical |
| 6 | Özel Entegratör ve Entegrasyon Modeli | `EDT-006` | Özel entegratör SLA, kontör maliyeti ve coğrafi yedekleme (Branching Target 5) | single_choice | Hayır | High |
| 7 | Mali Mühür ve Elektronik İmza Yönetimi | `EDT-007` | TÜBİTAK KamuSM Mali Mühür konumu (Bulut HSM / Yerel HSM / USB Dongle) | single_choice | Evet | Critical |
| 8 | Mali Mühür ve Elektronik İmza Yönetimi | `EDT-008` | Mühür arızası, kart bozulması ve PIN kilitlenmesinde acil eylem planı | single_choice | Hayır | High |
| 9 | Sertifika, Yetki ve Süre Takibi | `EDT-009` | Mali mühür, e-imza ve SSL bitiş sürelerinin proaktif alarm sistemi | single_choice | Evet | High |
| 10 | Sertifika, Yetki ve Süre Takibi | `EDT-010` | Fatura onaylama, iptal ve berat yükleme rol bazlı çift onay yetkileri | single_choice | Hayır | Medium |
| 11 | Test ve Canlı Ortam Ayrımı | `EDT-011` | ERP ile entegratör arasında izole Sandbox/Test ve Canlı ortam ayrımı | single_choice | Evet | High |
| 12 | E-Fatura Senaryo ve Belge Akışları | `EDT-012` | Temel, Ticari, Kamu ve İhracat senaryolarının kullanımı (Branching Trigger 1) | single_choice | Evet | Critical |
| 13 | E-Fatura Senaryo ve Belge Akışları | `EDT-013` | Müşteri VKN'den otomatik GİB mükellefiyet sorgusu ve senaryo seçimi (Branching Target 1) | single_choice | Hayır | High |
| 14 | E-Fatura Gönderim, Alma ve Yanıt Yönetimi | `EDT-014` | Gelen e-faturaların otomatik ERP'ye aktarımı ve siparişle eşleşmesi | single_choice | Evet | Critical |
| 15 | E-Fatura Gönderim, Alma ve Yanıt Yönetimi | `EDT-015` | GİB 1200 / 1210 / 1215 / 1220 durum kodları ve imza izleme | single_choice | Hayır | High |
| 16 | Ticari Fatura Kabul ve Red Süreçleri | `EDT-016` | Gelen ticari faturalara 8 günlük sürede sistemik Kabul/Red yanıtı | single_choice | Evet | High |
| 17 | Ticari Fatura Kabul ve Red Süreçleri | `EDT-017` | Müşteriden gelen RED yanıtlarında ERP otomatik bloke ve ters kayıt | single_choice | Hayır | Medium |
| 18 | E-Arşiv Fatura Süreçleri | `EDT-018` | Son kullanıcı ve e-fatura dışı cari satışlarında e-Arşiv kullanımı (Branching Trigger 2) | single_choice | Evet | Critical |
| 19 | E-Arşiv Fatura Süreçleri | `EDT-019` | Alıcıya mail/SMS teslimi ve GİB'e günlük e-Arşiv rapor paketi iletimi (Branching Target 2) | single_choice | Hayır | High |
| 20 | İnternet Satış ve E-Ticaret E-Arşiv Akışları | `EDT-020` | Web satışlarında zorunlu alanlar (Web sitesi, ödeme tipi, kargo VKN/Takip no) | single_choice | Evet | High |
| 21 | İnternet Satış ve E-Ticaret E-Arşiv Akışları | `EDT-021` | Pazaryeri (Trendyol, Hepsiburada vb.) API faturası ve PDF link aktarımı | single_choice | Hayır | Medium |
| 22 | E-İrsaliye Süreçleri | `EDT-022` | Mal sevkiyatı ve depo transferlerinde e-İrsaliye uygulaması (Branching Trigger 3) | single_choice | Evet | Critical |
| 23 | E-İrsaliye Süreçleri | `EDT-023` | Fiili sevk zamanı, çekici/dorse plaka, şoför TCKN ve taşıyıcı VKN kontrolü (Branching Target 3) | single_choice | Hayır | High |
| 24 | Sevkiyat, Mal Kabul ve İrsaliye Eşleştirme | `EDT-024` | Depo mal kabulünde gelen e-irsaliyeye sistemik yanıt (Kabul/Kısmi/Red) | single_choice | Evet | High |
| 25 | Sevkiyat, Mal Kabul ve İrsaliye Eşleştirme | `EDT-025` | E-İrsaliye ETTN ve 7 günlük yasal süre fatura eşleşmesi (DespatchReference) | single_choice | Hayır | Medium |
| 26 | E-Defter Süreçleri | `EDT-026` | Yevmiye ve Kebir defterlerinin yasal sürede e-Defter olarak tutulması (Branching Trigger 4) | single_choice | Evet | Critical |
| 27 | E-Defter Süreçleri | `EDT-027` | Defter öncesi fiş denetimi, madde numaralama ve borç/alacak denkliği (Branching Target 4) | single_choice | Hayır | High |
| 28 | Berat Oluşturma, Kontrol ve Yükleme | `EDT-028` | Aylık/geçici vergi dönemlik beratların imzalanıp GİB'e yüklenmesi | single_choice | Evet | High |
| 29 | Berat Oluşturma, Kontrol ve Yükleme | `EDT-029` | GİB Saklama veya Özel Entegratör İkincil Kopya Saklama tam uyumu | single_choice | Evet | High |
| 30 | E-SMM (Serbest Meslek Makbuzu) Süreçleri | `EDT-030` | Gelen e-SMM stopaj ve KDV tevkifatı hesaplarının ERP'ye otomatik işlenmesi | single_choice | Hayır | Medium |
| 31 | E-Müstahsil Makbuzu Süreçleri | `EDT-031` | Çiftçiden alımlarda e-Müstahsil (e-MM), borsa tescil ve SGK kesintileri | single_choice | Hayır | Medium |
| 32 | E-Bilet ve Sektörel E-Belge Kullanımı | `EDT-032` | Sektörel özel e-belgeler (e-Bilet, e-Adisyon, e-Döviz belgesi vb.) | single_choice | Hayır | Low |
| 33 | İhracat ve E-Belge Bağlantıları | `EDT-033` | Yurtdışı mal ihracatlarında resmi İhracat e-Faturası düzenleme (Branching Trigger 6) | single_choice | Evet | High |
| 34 | İhracat ve E-Belge Bağlantıları | `EDT-034` | GTB 23 haneli GÇB referansı, GTİP, teslim şekli ve intaç tarihi eşleşmesi (Branching Target 6) | single_choice | Hayır | High |
| 35 | İade, İptal, İtiraz ve Düzeltme Süreçleri | `EDT-035` | İade faturaları, e-Arşiv iptalleri ve GİB İptal Portalı süreçleri (Branching Trigger 8) | single_choice | Evet | High |
| 36 | İade, İptal, İtiraz ve Düzeltme Süreçleri | `EDT-036` | GİB İptal/İtiraz Portalı onayları ve 8 günlük yasal itiraz takibi (Branching Target 8) | single_choice | Hayır | High |
| 37 | Tevkifat, İstisna, Stopaj ve Vergi Kodları | `EDT-037` | KDV Tevkifatı (örn: 5/10) veya KDV İstisnası (örn: 301, 351) kullanımı (Branching Trigger 7) | single_choice | Evet | Critical |
| 38 | Tevkifat, İstisna, Stopaj ve Vergi Kodları | `EDT-038` | Malzeme/cari kartından 3 haneli GİB vergi kodlarının otomatik türetilmesi (Branching Target 7) | single_choice | Hayır | High |
| 39 | UBL-TR ve Belge Alan Eşleşmeleri | `EDT-039` | UBL-TR 1.2.1 şematron kuralları ve kurumsal logolu XSLT şablonu | single_choice | Evet | Critical |
| 40 | UBL-TR ve Belge Alan Eşleşmeleri | `EDT-040` | Sipariş No, Sözleşme No, İban, Proje Kodu alanlarının UBL etiket eşleşmesi | single_choice | Evet | High |
| 41 | ERP, Muhasebe ve Özel Entegratör Entegrasyonu | `EDT-041` | ERP ile Özel Entegratör arasında çift yönlü otomatik API/Web servis köprüsü | single_choice | Evet | Critical |
| 42 | ERP, Muhasebe ve Özel Entegratör Entegrasyonu | `EDT-042` | Güvenli token/OAuth2, IP kısıtlaması ve TLS 1.3 şifreli veri iletimi | single_choice | Hayır | High |
| 43 | Hata, Kuyruk, Yeniden Gönderim ve Mutabakat | `EDT-043` | Kesintilerde fatura kuyruk yönetimi, asenkron retry ve kullanıcı alarmları | single_choice | Evet | High |
| 44 | Hata, Kuyruk, Yeniden Gönderim ve Mutabakat | `EDT-044` | Ay sonu ERP muhasebe ile Entegratör ve GİB e-belge adet/tutar mutabakatı | single_choice | Evet | High |
| 45 | Arşivleme, Yasal Saklama ve Denetim İzi | `EDT-045` | 10 yıl yasal süre boyunca orijinal imzalı XML formatında yasal saklama | single_choice | Evet | Critical |
| 46 | Arşivleme, Yasal Saklama ve Denetim İzi | `EDT-046` | Vergi denetiminde tek tıkla e-Defter/e-Fatura ibraz paketi ve doğrulama | single_choice | Hayır | High |
| 47 | Arşivleme, Yasal Saklama ve Denetim İzi | `EDT-047` | Zaman damgalı kullanıcı, IP ve eylem logları (Audit Trail) izlenebilirliği | single_choice | Hayır | Medium |

---

## 3. Koşullu Dallanma (Branching) Kuralları

1. `EDT-012 = "e_fatura_aktif_kullanilmaktadir"` → `EDT-013` görünür
2. `EDT-018 = "e_arsiv_aktif_kullanilmaktadir"` → `EDT-019` görünür
3. `EDT-022 = "e_irsaliye_aktif_kullanilmaktadir"` → `EDT-023` görünür
4. `EDT-026 = "e_defter_aktif_kullanilmaktadir"` → `EDT-027` görünür
5. `EDT-005 = "ozel_entegrator_kullanilmaktadir"` → `EDT-006` görünür
6. `EDT-033 = "e_fatura_ihracat_yapilmaktadir"` → `EDT-034` görünür
7. `EDT-037 = "tevkifat_ve_istisna_uygulanmaktadir"` → `EDT-038` görünür
8. `EDT-035 = "duzenli_iade_ve_itiraz_yasanmaktadir"` → `EDT-036` görünür

*Görünürlük İstatistiği:* Cevapsız varsayılan durumda **39 soru**, tüm koşullar aktifken **47 soru**.

---

## 4. Cross-Pack İzolasyonu ve Sınır Ayrımı

- **ACCOUNTING (Muhasebe):** Yevmiye fişi, tekdüzen hesap planı, mizan, gelir tablosu ve bilanço; e-belge teknik akışını içermez.
- **INVOICING (Faturalama ve Gider):** Satış faturası oluşturma, cari borç/alacak takibi ve masraf yönetimi; e-Dönüşüm teknik entegratör API ve XML detaylarını incelemez.
- **LOGISTICS (Lojistik ve Sevkiyat):** Araç rotalama, filo, navlun ve fiziksel teslimat; e-İrsaliye yasal durum kodlarını incelemez.
- **EXPORT (İhracat):** Gümrük beyannamesi, akreditif, nakliye ve menşe şahadetnamesi; e-Fatura GTB portal elektronik entegrasyon boyutunu inceler.
- **DOCUMENT_MANAGEMENT (Doküman Yönetimi):** Şirket genel doküman arşivi, versiyonlama ve OCR; 10 yıllık GİB onaylı XML yasal saklama formatını E-TRANSFORMATION yönetir.
- **INFORMATION_TECHNOLOGY (BT ve Altyapı):** Sunucu, ağ ve güvenlik duvarı altyapısı; mali mühür ve UBL şema eşleşmesini E-TRANSFORMATION yönetir.
