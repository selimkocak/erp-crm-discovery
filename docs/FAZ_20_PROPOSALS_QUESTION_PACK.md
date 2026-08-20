# FAZ-20 — Teklif ve Fiyatlandırma / PROPOSALS Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.proposals.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `PROPOSALS` (Teklif ve Fiyatlandırma)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Satış Direktörleri, Teklif/İhale Yöneticileri, Fiyatlandırma ve Gelir Yönetimi (Revenue Management) Ekipleri ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP/CRM dönüşümü öncesinde müşteri teklif taleplerinin başlatılması, teklif hazırlama sorumluluğu ve departmanlar arası iş birliği, kurumsal teklif şablonları, ürün ve hizmet satırları yönetimi, ürün konfigürasyonu (variant/CPQ), merkezi ve kademeli fiyat listeleri, müşteri özel fiyatları ve geçmiş fiyat referansları, sözleşmeli/anlaşmalı fiyat takibi, maliyet bazlı fiyatlandırma (cost-plus), brüt kâr marjı kontrolü ve minimum marj koruması, satır/belge/kademe iskontoları ve yetki sınırları, teklif onay iş akışları (approval workflow), dövizli teklifler ve kur sabitleme yönetimi, teslim (Incoterms) ve ticari ödeme koşulları, teklif versiyonlama ve revizyon takibi, alternatif teklif ve opsiyon yönetimi, otomatik PDF/Word teklif dokümanı üretimi ve e-posta gönderimi, teklif kabul/red/kayıp nedenleri takibi, tekliften satış siparişine otomatik dönüşüm ve teklif KPI/dönüşüm analizi süreçlerinin AS-IS durumunu ve ERP/PROPOSALS gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | PROPOSALS ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **SALES** | Fırsatlar (Opportunity), pipeline olasılıkları, sipariş onayları, müşteri kredi limiti, satış hedefleri ve satış forecast | **SALES ticari satış operasyonunu ve hedeflerini sorgular.** PROPOSALS teklif içeriğini, fiyatlandırma kurallarını, marj kontrolünü, iskonto yetkilerini, onay hiyerarşisini, revizyon takibini ve tekliften siparişe dönüşümü sorgular. *(Fırsat/Pipeline ve Satış Hedefi soruları PROPOSALS'ta tekrarlanmaz)*. |
| **CRM** | Müşteri kimliği, kontaklar, görüşme kütüğü, müşteri 360, şikâyetler ve talepler | **CRM ilişki geçmişini sorgular.** PROPOSALS müşteriye sunulan ticari teklif detaylarını, ürün satırlarını ve fiyatlandırma hesaplamalarını sorgular. |
| **INVENTORY** | Stok hareketleri, sayım, depo lokasyonları, envanter değerleme metodolojisi (FIFO/LIFO/Ağırlıklı Ortalama) | **INVENTORY envanter muhasebesini sorgular.** PROPOSALS teklif satırında maliyetin görünürlüğünü ve kâr marjı zırhını sorgular. |
| **TREASURY** | Banka bakiyeleri, nakit akış projeksiyonu, kur risk pozisyonu | **TREASURY nakit ve döviz pozisyonunu sorgular.** PROPOSALS teklif üzerindeki döviz kurunu, kur sabitleme süresini ve kur risk şartlarını sorgular. |
| **ACCOUNTING** | Yasal defterler, yevmiye fişleri, Tekdüzen Hesap Planı, mizan ve bilanço | **ACCOUNTING resmi muhasebe kayıtlarını sorgular.** PROPOSALS satış fiyatı ve kârlılık marjı hesaplarını sorgular. |
| **PROPOSALS** | Teklif talebi, şablonlar, satırlar, ürün konfigürasyonu, fiyat listeleri, müşteri özel fiyatı, sözleşmeli fiyatlar, cost-plus maliyet, marj zırhı, kademeli iskonto yetkileri, onay iş akışı, döviz/kur sabitleme, Incoterms, versiyonlama (V1/V2 Diff), alternatif teklifler, PDF doküman üretimi, tekliften siparişe dönüşüm, teklif KPI'ları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular teklif hazırlama, fiyatlandırma stratejisi, kârlılık marjı ve onay mekanizması odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (20 Kanonik Süreç / 42 Soru)

1. **Teklif Talebinin Başlatılması** (2 Soru — PRP-001, PRP-002)
2. **Teklif Hazırlama Sorumluluğu** (2 Soru — PRP-003, PRP-004)
3. **Teklif Şablonları** (2 Soru — PRP-005, PRP-006)
4. **Ürün / Hizmet Satırları** (2 Soru — PRP-007, PRP-008)
5. **Ürün Konfigürasyonu ve Alternatifler** (2 Soru — PRP-009, PRP-010)
6. **Fiyat Listeleri** (2 Soru — PRP-011, PRP-012)
7. **Müşteri Özel Fiyatları** (2 Soru — PRP-013, PRP-014)
8. **Sözleşmeli / Anlaşmalı Fiyatlar** (2 Soru — PRP-015, PRP-016)
9. **Maliyet Bazlı Fiyatlandırma** (2 Soru — PRP-017, PRP-018)
10. **Marj Kontrolü** (2 Soru — PRP-019, PRP-020)
11. **İskonto Yönetimi** (2 Soru — PRP-021, PRP-022)
12. **İskonto ve Fiyat Onayları** (2 Soru — PRP-023, PRP-024)
13. **Dövizli Teklifler ve Kur Yönetimi** (2 Soru — PRP-025, PRP-026)
14. **Ticari Koşullar** (2 Soru — PRP-027, PRP-028)
15. **Teklif Versiyonlama ve Revizyon** (2 Soru — PRP-029, PRP-030)
16. **Alternatif Teklif / Opsiyon Yönetimi** (2 Soru — PRP-031, PRP-032)
17. **Teklif Dokümanı ve Gönderim** (2 Soru — PRP-033, PRP-034)
18. **Teklif Kabul / Red / Bekleme Takibi** (2 Soru — PRP-035, PRP-036)
19. **Tekliften Siparişe Dönüşüm** (2 Soru — PRP-037, PRP-038)
20. **Teklif KPI ve Dönüşüm Analizi** (4 Soru — PRP-039, PRP-040, PRP-041, PRP-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Teklif Talebinin Başlatılması

#### [PRP-001] Müşteri teklif talepleri (RFQ) hangi kanallardan (E-posta, Web/Portal, Telefon, Saha Satış Görüşmesi, İhale Dokümanı) gelmekte ve teklif süreci sistemde nasıl başlatılmaktadır?
- **Süreç:** Teklif Talebinin Başlatılması
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Teklif talebi giriş kanalları, talep kaydı ve teklif açılış yöntemi.
- **Seçenekler:**
  - `tum_kanallardan_gelen_talepler_merkezi_sistemde_teklif_olarak_baslatilir`: Tüm e-posta, web portalı veya saha talepleri tek bir sistemde doğrudan teklif kaydına dönüştürülür
  - `satis_temsilcisi_talebi_aldiktan_sonra_manuel_teklif_acar`: Temsilci talebi e-posta veya telefonla alır, teklif hazırlayacağı zaman sisteme giriş yapar
  - `teklifler_sistem_disinda_excel_veya_word_olarak_baslatilir`: Sistemik bir teklif kaydı açılmaz; temsilci bilgisayarındaki boş Excel/Word şablonunu açarak başlar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Talep Yönetimi (RFQ Intake) ve Omni-Channel Teklif Başlatma mimarisini belirler.

#### [PRP-002] Teklif açılışında müşteri cari kartı, aday (lead) kaydı veya henüz sisteme kayıtlı olmayan geçici muhatap tanımları nasıl kullanılmaktadır?
- **Süreç:** Teklif Talebinin Başlatılması
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Teklif muhatap tipi, adaylara teklif verme ve geçici cari yönetimi.
- **Seçenekler:**
  - `hem_kayitli_cari_hem_aday_musteriye_resmi_cari_acmadan_teklif_verilebilir`: Evet; adaylara ERP'de cari hesap açmadan teklif verilebilir, teklif kabul edilince cari oluşur
  - `teklif_verebilmek_icin_mutlaka_onceden_erp_cari_karti_acilmalidir`: Sistem adaya izin vermez; teklif verilecek her firma için önceden ERP'de resmi cari kart açılmalıdır
  - `gecici_serbest_unvan_ve_iletisim_yazilarak_teklif_verilir`: Herhangi bir kart seçilmeden teklif başlığına müşteri unvanı serbest metin olarak yazılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Aday/Cari Teklif Muhatap Ayrımı ve ERP Cari Kart İzolasyonunu belirler.

---

### 2. Teklif Hazırlama Sorumluluğu

#### [PRP-003] Şirketinizde teklif hazırlama ve içerik oluşturma süreci hangi ekip/roller (Satış Temsilcisi, Teklif/İhale Uzmanı, Teknik Çözüm Mühendisi, Satış Yöneticisi) tarafından yürütülmektedir?
- **Süreç:** Teklif Hazırlama Sorumluluğu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Teklif hazırlama organizasyonu, rol dağılımı ve yetki sınırları.
- **Seçenekler:**
  - `satis_temsilcisi_standart_fiyatlarla_kendi_teklifini_hazirlar`: Satış temsilcileri standart fiyat ve iskontolar dahilinde tekliflerini doğrudan kendileri hazırlar
  - `merkezi_teklif_veya_ihale_departmani_hazirlar_temsilci_sunar`: Satışçı sahada talebi toplar; teklifi merkezi Teklif/Maliyetlendirme veya İhale ekibi hazırlar
  - `teknik_cozum_ekibi_ile_satis_ekibi_ortaklasa_hazirlar`: Teknik şartname ve ürün listesini Mühendislik/Teknik ekip, fiyat ve ticari şartları Satış ekibi doldurur *(Not Alınabilir)*
  - `belirlenmis_bir_sorumluluk_yoktur_herkes_farkli_yontemle_hazirlar`: Standart bir rol tanımı yoktur; duruma göre yönetici veya satış personeli teklif üretir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Hazırlama Rol ve Yetki Matrisini belirler.

#### [PRP-004] Teknik çizim, mühendislik onayı, numune veya özel maliyet çalışması gerektiren karmaşık tekliflerde departmanlar arası (Mühendislik, Üretim, Satın Alma) iş birliği sistemden nasıl yönetilmektedir?
- **Süreç:** Teklif Hazırlama Sorumluluğu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Çok departmanlı teklif iş birliği, teknik fizibilite ve iç onay akışı.
- **Seçenekler:**
  - `sistem_uzerinden_ilgili_departmanlara_gorev_ve_maliyet_talebi_acilir`: Evet; teklif içinden Üretim/Satın Alma/Ar-Ge ekiplerine iş atanır, teknik onay ve maliyet sisteme girilir
  - `departmanlar_arasi_iletisim_e_posta_veya_toplanti_ile_manuel_yurutulur`: Sistemik iş akışı yoktur; e-posta ile maliyet ve teknik bilgi sorulur, gelen yanıt teklife elle aktarılır
  - `teknik_onay_ve_ozel_maliyet_calismasi_yapilmamaktadir`: Şirketimizde karmaşık veya mühendislik gerektiren özel teklif süreci bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Departmanlar Arası Teklif İş Birliği ve Mühendislik Görev Akışını belirler.

---

### 3. Teklif Şablonları

#### [PRP-005] Teklifler hangi ortamda (ERP/CRM dahili teklif modülü, Excel/Word şablonları, Özel CPQ yazılımı) hazırlanmakta ve kurumsal teklif şablonları nasıl yönetilmektedir?
- **Süreç:** Teklif Şablonları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif hazırlama yazılımı, şablon standardizasyonu ve kurumsal kimlik.
- **Seçenekler:**
  - `merkezi_erp_crm_teklif_modulu_ve_standart_sablonlar_kullanilir`: Teklifler merkezi ERP/CRM teklif modülünde hazırlanır ve sistemik kurumsal şablonlarla çıktı üretilir
  - `ozel_bir_cpq_konfigurator_yazilimi_uzerinden_hazirlanir`: Teklifler gelişmiş bir CPQ (Configure Price Quote) yazılımında hazırlanıp ERP'ye aktarılır *(Not Alınabilir)*
  - `ortak_agdaki_excel_veya_word_sablonlari_uzerinde_hazirlanir`: ERP'de teklif modülü yoktur; ortak klasördeki standart Excel veya Word şablonları kullanılır
  - `her_satiscinin_kendi_bilgisayarinda_kisisel_teklif_taslagi_vardir`: Standart şablon yoktur; her satış temsilcisi kendi oluşturduğu Word/Excel dosyasını kullanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Şablon Yönetimi ve CPQ/Doküman Üretim Mimarisi seçimini belirler.

#### [PRP-006] Farklı şirket, marka, dil (Türkçe/İngilizce/Almanca), ürün grubu veya müşteri segmentlerine göre özelleştirilmiş dinamik teklif şablonları kullanılabilmekte midir?
- **Süreç:** Teklif Şablonları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Çok dilli teklif şablonları, marka bazlı düzen ve dinamik şablon seçimi.
- **Seçenekler:**
  - `cok_dilli_ve_sirket_marka_bazli_dinamik_sablonlar_sistemde_mevcuttur`: Evet; teklif diline (TR/EN/DE) ve markaya göre uygun kurumsal şablon tek tıkla seçilip çıktı alınabilir
  - `sadece_tek_bir_standart_turkce_sablon_vardir_ingilizce_elle_duzenlenir`: Yalnızca tek bir Türkçe şablon vardır; yabancı teklifler Word üzerinde manuel tercüme edilerek hazırlanır
  - `dinamik_veya_cok_dilli_sablon_destegi_bulunmamaktadir`: Dinamik şablon desteği yoktur; tüm çıktılar sabit tek formattan alınır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Çok Dilli Teklif Şablonları ve Marka Bazlı Görsel Düzen gereksinimini belirler.

---

### 4. Ürün / Hizmet Satırları

#### [PRP-007] Teklif satırlarına malzeme kartları, hizmet kalemleri, masraf satırları ve serbest metinli özel açıklamalar nasıl eklenmektedir?
- **Süreç:** Ürün / Hizmet Satırları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif satır tipleri, malzeme/hizmet karması ve serbest açıklama esnekliği.
- **Seçenekler:**
  - `stoklu_malzeme_hizmet_ve_serbest_metin_satirlari_birlikte_kullanilabilir`: Evet; stok kartı, hizmet/işçilik kalemi, nakliye/montaj masrafı ve satır altı özel teknik açıklama girilebilir
  - `sadece_sistemde_tanimli_stok_kartlari_eklenebilir_serbest_satir_yoktur`: Yalnızca önceden açılmış stok kartları seçilebilir; serbest açıklama veya geçici ürün girilemez
  - `tum_satirlar_serbest_metin_ve_elle_fiyat_yazilarak_olusturulur`: Stok kartı bağlantısı yoktur; ürün adı, miktar ve fiyat tamamen serbest metin olarak elle yazılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Satır Türleri (Stok/Hizmet/Masraf/Metin) ve Esnek Satır Modelini belirler.

#### [PRP-008] Teklif üzerinde ürün satırlarının gruplanması (Başlık/Ara Toplam, Opsiyonel Paketler, Montaj/Nakliye Grubu) ve satır sıralaması dinamik olarak yönetilebilmekte midir?
- **Süreç:** Ürün / Hizmet Satırları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Satır hiyerarşisi, ara toplamlar, bölüm başlıkları ve görsel düzenleme.
- **Seçenekler:**
  - `satir_gruplama_ara_toplam_ve_surukle_birak_siralama_desteklenir`: Evet; satırlar alt başlıklara bölünebilir, grup bazında ara toplam alınabilir ve sıra değiştirilebilir
  - `sadece_duz_liste_halinde_satirlar_siralanir_ara_toplam_alinamaz`: Yalnızca düz satır listesi oluşturulur; grup başlığı veya ara toplam sistemi desteklenmez
  - `satir_gruplama_ve_duzenleme_yalnizca_excelde_yapilabilir`: Sistem satır gruplamayı desteklemez; bu tür düzenlemeler Excel'e aktarılarak manuel yapılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Satır Hiyerarşisi ve Ara Toplam Hesaplama (Subtotal Grouping) yeteneğini belirler.

---

### 5. Ürün Konfigürasyonu ve Alternatifler

#### [PRP-009] Teklif hazırlarken özellik bazlı ürün konfigürasyonu (Variant / CPQ — Örn. Ebat, renk, motor gücü, opsiyonel aksesuarlar seçimi) yapılmakta mıdır?
- **Süreç:** Ürün Konfigürasyonu ve Alternatifler
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Ürün varyantları, dinamik konfigürasyon ve teknik kural denetimi.
- **Seçenekler:**
  - `ozellik_ve_kural_bazli_dinamik_urun_konfigurasyonu_kullanilir`: Evet; varyant ve konfigüratör kurallarıyla müşteri talebine göre ürün özellikleri seçilip fiyat hesaplanır
  - `her_varyasyon_icin_onceden_ayri_stok_karti_acilmistir`: Dinamik konfigüratör yoktur; her renk, ebat ve opsiyon kombinasyonu için sistemde ayrı stok kartı açılmıştır
  - `ozellik_bazli_urun_konfigurasyonu_kullanilmaz`: Şirketimizde ürün konfigürasyonu veya varyant seçimi ihtiyacı bulunmamaktadır; ürünler standarttır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Ürün Varyant ve Konfigüratör (CPQ Engine) İhtiyacını belirler.

#### [PRP-010] Müşteriye sunulan ana ürün/hizmet satırı için alternatif ürün seçenekleri veya opsiyonel (Teklif genel toplamını etkilemeyen) teklif satırları nasıl sunulmaktadır?
- **Süreç:** Ürün Konfigürasyonu ve Alternatifler
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `PRP-009 != "ozellik_bazli_urun_konfigurasyonu_kullanilmaz"`
- **Açıklama:** Alternatif satırlar, opsiyonel ürün sunumu ve toplam tutar ayrımı.
- **Seçenekler:**
  - `opsiyonel_satirlar_toplama_dahil_edilmeden_belgede_ayri_gosterilir`: Evet; satır 'Opsiyonel' işaretlenerek genel toplama katılmaz, müşteri seçerse ana satıra dahil edilir
  - `alternatifler_icin_tamamen_ayri_teklif_revizyonlari_hazirlanir`: Teklif içine opsiyonel satır konulamaz; her alternatif için ayrı bir teklif belgesi hazırlanır
  - `opsiyonel_satir_veya_alternatif_urun_yonetimi_yoktur`: Alternatif satır yönetimi yoktur; yalnızca tek ve sabit ürün listesi teklif edilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Opsiyonel Satır ve Alternatif Kalem Görselleştirme kurgusunu belirler.

---

### 6. Fiyat Listeleri

#### [PRP-011] Şirketinizde satış fiyatları hangi fiyat listesi mimarisiyle (Merkezi liste, Bayi/Kanal listeleri, Bölgesel listeler, Dövizli listeler, Miktar kırılımlı basamaklı listeler) yönetilmektedir?
- **Süreç:** Fiyat Listeleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Fiyat listesi yapısı, kanal/bayi fiyatları ve miktar kademeli fiyatlandırma.
- **Seçenekler:**
  - `coklu_kanal_bayi_bolge_ve_miktar_kademeli_fiyat_listeleri_aktif`: Evet; müşteri tipine, para birimine, satış kanalına ve sipariş miktarına (1-10 adet, 11-50 adet) göre fiyat listeleri tanımlıdır
  - `tek_bir_standart_liste_fiyati_vardir_iskontolarla_fiyat_degisir`: Tek bir standart liste fiyatı vardır; farklı kanallara ve bayilere liste fiyatı üzerinden iskonto uygulanır
  - `merkezi_fiyat_listesi_yoktur_satiscilar_fiyati_manuel_belirler`: Sistemde fiyat listesi yoktur; temsilciler her teklifte fiyatı serbestçe kendi belirler veya yöneticiye sorar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Fiyat Listesi Mimarisi (Pricelist Hierarchy & Volume Tiering) tasarımını belirler.

#### [PRP-012] Fiyat listelerinin geçerlilik tarih aralıkları (Başlangıç-Bitiş tarihi), dönemsel zam/güncelleme kuralları ve geleceğe dönük fiyat hazırlığı nasıl yürütülmektedir?
- **Süreç:** Fiyat Listeleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Fiyat geçerlilik süreleri, toplu fiyat artışı ve geleceğe dönük fiyat listeleri.
- **Seçenekler:**
  - `tarih_aralikli_fiyat_listeleri_ve_otomatik_yururluk_mekanizmasi_aktif`: Evet; fiyat listelerinin başlangıç/bitiş tarihi vardır, zamlı yeni liste önceden hazırlanıp tarihi gelince otomatik devreye girer
  - `zam_gunu_mevcut_fiyatlarin_uzerine_toplu_yuzde_ile_guncelleme_yapilir`: Tarihli liste tutulmaz; zam günü mevcut fiyat listesindeki rakamlar doğrudan güncellenir, geçmiş fiyat ezilir
  - `fiyat_gecerlilik_tarihi_takip_edilmemektedir`: Fiyatların ne zamandan beri geçerli olduğu veya ne zaman değişeceği sistemde takip edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Fiyat Listesi Zaman Aşımı ve Toplu Fiyat Güncelleme Kurallarını belirler.

---

### 7. Müşteri Özel Fiyatları

#### [PRP-013] Belirli müşterilere veya müşteri gruplarına tanımlanmış Müşteri Özel Fiyat Listeleri (Özel net fiyat matrisi) teklif satırına otomatik yansımakta mıdır?
- **Süreç:** Müşteri Özel Fiyatları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteri bazlı özel net fiyatlar, cari-malzeme özel fiyat eşleştirmesi.
- **Seçenekler:**
  - `musteri_ve_urun_bazli_ozel_net_fiyat_teklife_otomatik_gelir`: Evet; müşteri seçildiğinde o müşteriye özel tanımlanmış net fiyat liste fiyatının önüne geçerek otomatik gelir
  - `ozel_fiyatlar_excelde_tutulur_temsilci_teklife_manuel_yazar`: Sistemde otomatik gelmez; özel fiyat anlaşmaları Excel listesindedir, temsilci fiyata bakıp teklife elle yazar
  - `musteri_ozel_fiyati_uygulamasi_bulunmamaktadir`: Müşteri bazlı özel fiyat uygulamamız yoktur; tüm müşteriler standart liste ve iskontolarla çalışır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Müşteri Özel Fiyat Matrisi ve Öncelik Hiyerarşisini belirler.

#### [PRP-014] Teklif hazırlama esnasında ilgili müşteriye daha önce verilen son teklif fiyatı, son satış fatura fiyatı ve tarihi teklif ekranında temsilciye gösterilmekte midir?
- **Süreç:** Müşteri Özel Fiyatları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Müşteri geçmiş fiyat referansı, son satış fiyatı görünürlüğü ve fiyat tutarlılığı.
- **Seçenekler:**
  - `son_satis_ve_son_teklif_fiyati_ve_tarihi_ekranda_anlik_gorunur`: Evet; ürün seçildiğinde bu müşteriye en son kaçtan faturalandığı ve son teklif fiyatı ekranda referans olarak görünür
  - `ayri_ekrandan_veya_muhasebe_ekstresinden_manuel_kontrol_edilir`: Teklif ekranında görünmez; temsilci geçmiş faturaları veya cari ekstreyi açıp son fiyatı manuel arar
  - `gecmis_fiyat_bilgisi_goruntulenememektedir`: Müşteriye daha önce hangi fiyattan satıldığı teklif anında görülemez, fiyat tutarsızlıkları yaşanabilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Fiyat Tutarlılığı ve Geçmiş Fiyat İstihbarat Ekranını belirler.

---

### 8. Sözleşmeli / Anlaşmalı Fiyatlar

#### [PRP-015] Müşterilerle yapılan yıllık çerçeve sözleşmeler, ihale taahhütleri ve sabit fiyat anlaşmaları sistemde nasıl takip edilmekte ve tekliflere bağlanmaktadır?
- **Süreç:** Sözleşmeli / Anlaşmalı Fiyatlar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Çerçeve sözleşmeler, taahhütlü fiyat anlaşmaları ve teklif-sözleşme ilişkisi.
- **Seçenekler:**
  - `cerceve_sozlesmeler_sistemde_tanimlidir_teklif_sozlesmeye_baglanir`: Evet; sözleşme numarası, süresi ve taahhüt edilen fiyatlar tanımlıdır; teklif doğrudan sözleşmeye bağlanır
  - `sozlesmeler_hukuk_veya_satista_dosyalanir_fiyat_manuel_yazilir`: Sözleşmeler fiziksel/PDF arşivdedir; teklif hazırlanırken sözleşme şartları kontrol edilip fiyat elle girilir
  - `cerceve_sozlesme_veya_sabit_fiyat_anlasmasi_kullanilmamaktadir`: Şirketimizde çerçeve sözleşmeli veya taahhütlü fiyat anlaşması uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Çerçeve Sözleşme Entegrasyonu ve Fiyat Taahhüt Takibini belirler.

#### [PRP-016] Sözleşmeli fiyat anlaşmalarında taahhüt edilen miktar/ciro kotası ve sözleşme süresi aşıldığında sistemik fiyat kontrolü veya uyarı mekanizması bulunmakta mıdır?
- **Süreç:** Sözleşmeli / Anlaşmalı Fiyatlar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Sözleşme kota aşımı, taahhüt kontrolü ve sözleşme bitiş uyarıları.
- **Seçenekler:**
  - `taahhut_miktari_veya_sure_doldugunda_sistem_otomatik_uyarir_veya_bloke_eder`: Evet; sözleşme süresi veya taahhüt edilen miktar bittiğinde sistem özel fiyatı kapatır ve uyarı verir
  - `sozlesme_kotalari_manuel_excel_tablolarinda_takip_edilir`: Sistemik kota kontrolü yoktur; satış yöneticisi müşterinin taahhüdünü doldurup doldurmadığını Excel'de izler
  - `sozlesme_kota_ve_sure_kontrolu_yapilmamaktadir`: Kota veya süre takibi yapılmaz; sözleşme bitse dahi müşteri eski fiyattan almaya devam edebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Sözleşme Kotası ve Fiyat Geçerlilik Denetimini belirler.

---

### 9. Maliyet Bazlı Fiyatlandırma

#### [PRP-017] Teklif satırlarında ürün ve hizmetlerin maliyet bilgisi (Son alış maliyeti, Standart maliyet, Ağırlıklı ortalama maliyet veya Tahmini proje maliyeti) satış temsilcisine gösterilmekte midir?
- **Süreç:** Maliyet Bazlı Fiyatlandırma
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif anında maliyet görünürlüğü, yetkilendirme ve maliyet referans tipi.
- **Seçenekler:**
  - `yetkili_kullanicilara_guncel_maliyet_bilgisi_teklif_ekraninda_gosterilir`: Evet; yetkisi olan temsilciler ürünün güncel maliyetini (son alış, standart veya ortalama) satırda görür
  - `maliyet_bilgisi_satiscilara_kesinlikle_gizlidir_yalnizca_yonetici_gorur`: Satış personeli maliyeti göremez; sadece liste fiyatını ve izin verilen maksimum iskontoyu görür
  - `sistemde_guncel_maliyet_bulunmamakta_maliyet_bilinmeden_fiyat_verilmektedir`: Sistemde ürün maliyetleri güncel tutulmamaktadır; teklifler maliyet bilinmeden tahmini fiyatlandırılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Anı Maliyet Görünürlüğü ve Alan Bazlı Yetkilendirmeyi (Field Security) belirler.

#### [PRP-018] Satış fiyatının maliyet üzerine hedef kâr marjı eklenerek otomatik hesaplandığı (Cost-Plus Pricing) formüller teklif hazırlığında kullanılmakta mıdır?
- **Süreç:** Maliyet Bazlı Fiyatlandırma
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Maliyet artı kâr marjı formülleri, proje maliyetlendirme ve dinamik fiyat türetimi.
- **Seçenekler:**
  - `maliyet_arti_hedef_marj_formulu_ile_satis_fiyati_otomatik_hesaplanir`: Evet; ürün maliyeti üzerine istenen kâr marjı (% veya tutar) girildiğinde satış fiyatı otomatik hesaplanır
  - `maliyet_arti_marj_hesabi_excelde_yapilip_sisteme_manuel_girilir`: Sistem otomatik hesaplamaz; temsilci Excel'de maliyete marj ekleyerek bulduğu fiyatı sisteme yazar
  - `maliyet_bazli_fiyatlandirma_kullanilmaz_yalnizca_liste_fiyati_esas_alinir`: Cost-plus kullanılmaz; piyasa liste fiyatları ve standart katalog fiyatları üzerinden çalışılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Cost-Plus Dinamik Fiyatlandırma Motoru gereksinimini belirler.

---

### 10. Marj Kontrolü

#### [PRP-019] Teklif hazırlama aşamasında satır bazında ve teklif genelinde brüt kâr marjı hesabı yapılmakta ve minimum kâr marjı kontrolü (Margin Floor) uygulanmakta mıdır?
- **Süreç:** Marj Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kâr marjı hesaplama, minimum marj eşikleri ve kârlılık denetimi.
- **Seçenekler:**
  - `satir_ve_toplamda_brut_kar_marji_hesaplanir_ve_minimum_marj_kontrolu_vardir`: Evet; satır ve teklif toplamında kâr marjı (%) canlı hesaplanır, belirlenen minimum marjın altına inilemez
  - `kar_marji_gorunur_ancak_minimum_marj_sinirlamasi_veya_engeli_yoktur`: Marj ekranda görünür ancak sistemik bir sınır yoktur; temsilci düşük marjla teklif kaydedebilir
  - `marj_hesabi_ve_minimum_marj_kontrolu_yapilmamaktadir`: Teklif aşamasında marj hesabı yapılmaz; teklifin kârlı olup olmadığı ancak satış sonrası anlaşılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Brüt Kâr Marjı Denetimi ve Minimum Marj Zırhını belirler.

#### [PRP-020] Minimum kâr marjının altına inen veya zararına (Negatif marjlı) teklif verildiğinde sistem teklifi otomatik bloke edip onay mekanizmasını tetiklemekte midir?
- **Süreç:** Marj Kontrolü
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Koşul:** `PRP-019 != "marj_hesabi_ve_minimum_marj_kontrolu_yapilmamaktadir"`
- **Açıklama:** Düşük marjlı teklif blokajı, negatif marj koruması ve onay tetikleyicisi.
- **Seçenekler:**
  - `minimum_marj_altindaki_teklif_otomatik_bloke_olur_yonetim_onayi_gerekir`: Evet; minimum marjın altına inildiğinde teklif kilitlenir, Satış Direktörü veya Genel Müdür onayı olmadan gönderilemez
  - `sadece_uyari_mesaji_cikar_fakat_kaydetmeyi_engellemez`: Sistem 'Kâr marjı düşük' uyarısı verir ancak teklifin kaydedilmesini veya yazdırılmasını engellemez
  - `dusuk_marj_blokesi_veya_onay_tetiklemesi_bulunmamaktadir`: Herhangi bir blokaj veya onay mekanizması yoktur; düşük marjlı teklifler doğrudan müşteriye iletilebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Otomatik Düşük Marj Blokajı ve Zararına Satış Korumasını belirler.

---

### 11. İskonto Yönetimi

#### [PRP-021] Tekliflerde hangi iskonto tipleri (Satır iskontosu, Belge/Genel toplam iskontosu, Müşteri kademe iskontosu, Hacim/Miktar iskontosu, Çoklu basamaklı iskonto 10+5+3) uygulanmaktadır?
- **Süreç:** İskonto Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** İskonto mimarisi, çoklu iskonto basamakları ve iskonto hiyerarşisi.
- **Seçenekler:**
  - `satir_genel_toplam_ve_coklu_basamakli_iskonto_10_5_3_desteklenir`: Evet; hem satır bazında çoklu basamaklı iskonto hem de teklif dip toplamında ek iskonto uygulanabilir
  - `yalnizca_tek_bir_satir_iskontosu_orani_girilebilir`: Yalnızca her satır için tek bir yüzde iskonto girilebilir; çoklu basamak veya dip iskonto desteklenmez
  - `yalnizca_teklif_genel_toplamina_tek_bir_iskonto_orani_uygulanir`: Satır bazında iskonto girilmez; teklifin dip toplamına tek bir genel iskonto uygulanır
  - `iskonto_uygulanmaz_fiyatlar_net_girilir`: İskonto sistemi kullanılmaz; tüm ürünlerin teklif fiyatı doğrudan net olarak girilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** İskonto Hesaplama Mimarisi (Multi-tier Discount Structure) seçimini belirler.

#### [PRP-022] Satış temsilcilerinin unvan, departman veya ürün grubuna göre tanımlanmış maksimum İskonto Yetki Limitleri (Örn. Temsilci: %5, Müdür: %15, GM: %25) sistemsel olarak sınırlandırılmış mıdır?
- **Süreç:** İskonto Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** İskonto yetki matrisi, kullanıcı bazlı maksimum iskonto sınırları ve yetki aşım kontrolleri.
- **Seçenekler:**
  - `kullanici_ve_rol_bazli_kademeli_iskonto_yetki_matrisi_sistemde_tanimlidir`: Evet; her temsilcinin azami iskonto sınırı tanımlıdır, yetki aşan oran girildiğinde sistem izin vermez veya onay ister
  - `yazili_prosedur_vardir_ancak_sistemde_engelleme_veya_limit_kurali_yoktur`: Yetki limitleri şirket içinde bilinir ancak sistemde limit kuralı yoktur; temsilci %50 iskonto da yazabilir
  - `iskonto_yetki_sinirlamasi_bulunmamaktadir`: İskonto sınırlaması yoktur; tüm satış personeli serbestçe iskonto verebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Kademeli İskonto Yetki Matrisi ve Limit Denetimini belirler.

---

### 12. İskonto ve Fiyat Onayları

#### [PRP-023] Standart liste fiyatının dışına çıkıldığında, yetki aşan iskonto verildiğinde veya yüksek tutarlı tekliflerde Teklif Onay İş Akışı (Approval Workflow) nasıl işletilmektedir?
- **Süreç:** İskonto ve Fiyat Onayları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif onay hiyerarşisi, kural bazlı onay tetikleyicileri ve yönetici onayı.
- **Seçenekler:**
  - `tutar_iskonto_ve_marj_kriterlerine_gore_cok_kademeli_otomatik_onay_isler`: Evet; teklif tutarı, iskonto oranı ve marja göre Satış Müdürü -> Satış Direktörü -> GM onay akışı otomatik tetiklenir
  - `sadece_teklif_toplam_tutari_belirli_bir_limiti_asinca_onay_istenir`: İskontoya bakılmaz; yalnızca teklif toplamı belirli bir bütçeyi (Örn. 500.000 TL) aştığında onay istenir
  - `onay_e_posta_veya_sozlu_olarak_alinir_sistemik_onay_akisi_yoktur`: Sistemik onay yoktur; temsilci yöneticisine e-posta atıp 'Uygun mudur?' diye sorar, onay alınca teklifi gönderir
  - `onay_sureci_yoktur_temsilci_serbestce_gonderir`: Herhangi bir onay süreci yoktur; satış temsilcisi hazırladığı teklifi doğrudan müşteriye gönderir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Onay İş Akışı (Quote Approval Hierarchy) kurallarını belirler.

#### [PRP-024] Teklif onay süreçleri mobil uygulama üzerinden veya tek tıkla e-posta ile onaylanabilmekte ve onay bekleyen teklifler için SLA/hatırlatma mekanizması çalışmakta mıdır?
- **Süreç:** İskonto ve Fiyat Onayları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `PRP-023 != "onay_sureci_yoktur_temsilci_serbestce_gonderir"`
- **Açıklama:** Mobil onay, e-posta onay linkleri, onay SLA süreleri ve eskalasyon.
- **Seçenekler:**
  - `mobil_veya_eposta_ile_anlik_onaylanabilir_gecikmelerde_hatirlatma_gider`: Evet; yöneticiler mobilden veya e-postadaki butondan anında onaylayabilir, 24 saati aşan onaylar eskalasyona uğrar
  - `yalnizca_masaustu_erp_ekranina_giris_yapilarak_onaylanabilir`: Mobil veya e-posta onayı yoktur; yöneticinin ofiste bilgisayar başına geçip ERP onay ekranını açması gerekir
  - `onay_bekleyen_teklifler_takip_edilememekte_surecler_cok_uzamaktadir`: Onay takibi yapılamaz; teklifin kimin onayında beklediği bilinmediği için müşteriye dönüş günlerce gecikir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Mobil Onay (Mobile Approvals) ve Onay SLA Eskalasyonunu belirler.

---

### 13. Dövizli Teklifler ve Kur Yönetimi

#### [PRP-025] Yabancı para birimlerinde (USD, EUR, GBP vb.) dövizli teklif hazırlanmakta mıdır ve teklif üzerinde hangi kur tipi (TCMB Efektif Satış, Serbest Piyasa, Şirket Sabit Kuru) kullanılmaktadır?
- **Süreç:** Dövizli Teklifler ve Kur Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Çoklu para birimi, dövizli teklif yönetimi ve kur tipi seçimi.
- **Seçenekler:**
  - `coklu_dovizli_teklif_verilir_ve_guncel_tcmb_serbest_piyasa_kurlari_otomatik_alinir`: Evet; USD/EUR teklif verilebilir, teklif tarihindeki TCMB veya serbest piyasa kuru sistemden otomatik çekilir
  - `dovizli_teklif_verilir_ancak_kur_manuel_olarak_elle_yazilir`: Dövizli teklif verilir ancak sistemik kur çekilmez; temsilci günün kurunu internete bakıp elle yazar
  - `yalnizca_turk_lirasi_teklif_verilir_dovizli_teklif_yoktur`: Şirketimizde dövizli teklif uygulaması yoktur; tüm teklifler yalnızca Türk Lirası (TRY) olarak verilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Çoklu Para Birimi (Multi-Currency Quotation) ve Otomatik Kur Besleme altyapısını belirler.

#### [PRP-026] Teklif üzerinde kur sabitleme (Kur garantisi süresi), kur farkı risk koruma şartları veya Türk Lirası faturalandırma kuru koşulları nasıl yönetilmektedir?
- **Süreç:** Dövizli Teklifler ve Kur Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `PRP-025 != "yalnizca_turk_lirasi_teklif_verilir_dovizli_teklif_yoktur"`
- **Açıklama:** Kur sabitleme garantisi, fatura anı kur farkı şartları ve kur riski yönetimi.
- **Seçenekler:**
  - `kur_sabitleme_suresi_ve_fatura_tarihi_tcmb_kuru_sartlari_metinde_otomatik_tanimlidir`: Evet; 'Teklif kuru 7 gün geçerlidir' veya 'Fatura tarihindeki TCMB döviz satış kuru esas alınır' şartı otomatik eklenir
  - `kur_sartlari_temsilci_tarafindan_serbest_metin_olarak_elle_yazilir`: Standart kural yoktur; temsilci aklına geldikçe teklif açıklamasına kur ile ilgili not yazar
  - `kur_riski_koruma_sarti_kullanilmamaktadir`: Kur riski şartı eklenmez; kur dalgalanmalarından kaynaklanan zararlar şirkete yansır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Kur Riski Koruma ve Kur Sabitleme Kuralları (FX Hedging Terms) tasarımını belirler.

---

### 14. Ticari Koşullar

#### [PRP-027] Teklif üzerinde teslim şekli (Incoterms — EXW, FOB, CIF, DDP vb.), teslim süresi, sevkiyat noktası ve nakliye/sigorta masraf sorumluluğu nasıl tanımlanmaktadır?
- **Süreç:** Ticari Koşullar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Teslim şekilleri (Incoterms), lojistik şartlar, sevkiyat noktası ve teslimat süresi.
- **Seçenekler:**
  - `uluslararasi_incoterms_teslim_sekli_ve_teslim_suresi_standart_secilmektedir`: Evet; Incoterms teslim şekli (Fabrika teslim, Müşteri adresi vb.), sevkiyat ambarı ve termin süresi standart seçilir
  - `teslim_sartlari_teklif_aciklama_alanina_serbest_metin_yazilir`: Standart alan yoktur; nakliyenin kime ait olduğu ve teslim süresi serbest açıklama kutusuna yazılır
  - `teslim_sekli_ve_lojistik_sartlari_teklif_uzerinde_belirtilmemektedir`: Teklifte teslim şekli belirtilmez; teslimat şartları sipariş veya sevk aşamasında sözlü netleştirilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Incoterms ve Lojistik Masraf Yönetimi parametrelerini belirler.

#### [PRP-028] Teklif geçerlilik süresi (Örn. '15 gün geçerlidir'), ödeme vadesi, peşinat oranı, banka teminatı ve gecikme faizi şartları teklif üzerinde standart kurallara bağlı mıdır?
- **Süreç:** Ticari Koşullar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Geçerlilik tarihi, ödeme vadeleri, peşinat şartları ve ticari protokoller.
- **Seçenekler:**
  - `gecerlilik_tarihi_odeme_vadesi_ve_pesinat_orani_sistemde_zorunlu_ve_standarttir`: Evet; teklif geçerlilik bitiş tarihi, ödeme planı (%30 peşin, 60 gün vadeli çek) standart seçilir ve kontrol edilir
  - `gecerlilik_tarihi_yazilir_ancak_odeme_sartlari_metin_olarak_elle_girilir`: Geçerlilik tarihi seçilir ancak ödeme vadesi ve peşinat şartları şablonun altındaki metin kutusuna yazılır
  - `gecerlilik_suresi_ve_odeme_sartlari_teklifte_yer_almamaktadir`: Standart geçerlilik süresi yoktur; müşteri aylar sonra gelse dahi teklif geçerli sayılabilmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Geçerlilik Kontrolleri ve Standart Ticari Ödeme Şartlarını belirler.

---

### 15. Teklif Versiyonlama ve Revizyon

#### [PRP-029] Müşteriden gelen fiyat, miktar veya kapsam değişiklik taleplerinde Teklif Versiyonlama (Revizyon Takibi — V1, V2, V3) mekanizması sistemde nasıl işletilmektedir?
- **Süreç:** Teklif Versiyonlama ve Revizyon
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif revizyon takibi, versiyon numaralandırma (V1..Vn) ve tarihçe kilitlenmesi.
- **Seçenekler:**
  - `otomatik_versiyonlama_ile_eski_versiyon_kilitlenir_ve_v2_olarak_kopyalanir`: Evet; revizyon yapıldığında V1 kilitlenir, sistem otomatik V2 açar; hangi tarihte ne değiştiği revizyon sebebiyle saklanır
  - `eski_teklifin_kopyasi_yeni_bir_teklif_numarasiyla_acilir_bag_kurulamaz`: Ayrı versiyon oluşmaz; teklif kopyalanıp bambaşka yeni bir teklif numarası alır, eski teklifle ilişkisi kopar
  - `versiyon_takibi_yapilmaz_ayni_dosya_uzerine_yazilir`: Versiyon takibi yoktur; müşteri indirim istedikçe aynı teklif satırındaki rakam değiştirilip üzerine kaydedilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Versiyonlama ve Revizyon Tarihçesi (Quotation Versioning) mimarisini belirler.

#### [PRP-030] Önceki teklif versiyonları ile güncel versiyon arasındaki satır, fiyat, iskonto ve kârlılık farkları (Versiyon Karşılaştırma / Diff Analizi) sistem üzerinden incelenebilmekte midir?
- **Süreç:** Teklif Versiyonlama ve Revizyon
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `PRP-029 != "versiyon_takibi_yapilmaz_ayni_dosya_uzerine_yazilir"`
- **Açıklama:** Versiyon karşılaştırma aracı, fiyat/iskonto değişim geçmişi ve kârlılık fark analizi.
- **Seçenekler:**
  - `sistem_iki_versiyon_arasindaki_tum_fiyat_iskonto_ve_marj_farklarini_gosterir`: Evet; V1 ile V2 yan yana karşılaştırılabilir; hangi ürünün fiyatı düşürüldü, kârlılık ne kadar azaldı görülebilir
  - `eski_versiyonlar_listelenir_ancak_karsilastirma_icin_iki_ayri_ekran_acilmalidir`: Eski versiyonlara ulaşılabilir ancak sistemik bir karşılaştırma ekranı yoktur; gözle kontrol edilir
  - `versiyonlar_arasi_fark_analizi_yapilamamaktadir`: Versiyonlar arası fark analizi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Versiyon Karşılaştırma (Quote Diff & Variance Tool) gereksinimini belirler.

---

### 16. Alternatif Teklif / Opsiyon Yönetimi

#### [PRP-031] Aynı müşteri talebi için farklı bütçe, marka veya teknik konfigürasyon içeren alternatif teklif opsiyonları (Opsiyon A - Ekonomik, Opsiyon B - Premium) hazırlanabilmekte midir?
- **Süreç:** Alternatif Teklif / Opsiyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Alternatif teklif paketleri, opsiyonel bütçe senaryoları ve çoklu seçenek sunumu.
- **Seçenekler:**
  - `tek_bir_teklif_numarasi_altinda_coklu_opsiyon_a_b_c_sunulabilir`: Evet; aynı teklif altında 'Opsiyon 1 (Standart)', 'Opsiyon 2 (Gelişmiş)' gibi alternatifler hazırlanıp tek belgede sunulur
  - `her_alternatif_icin_ayri_ayri_bagimsiz_teklifler_hazirlanir`: Teklif içinde opsiyonlama yoktur; müşteriye 3 alternatif sunulacaksa 3 ayrı teklif dosyası oluşturulur
  - `alternatifli_veya_opsiyonlu_teklif_hazirlanmamaktadir`: Alternatifli teklif çalışması yapılmaz; müşteriye tek bir kesin teklif iletilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Çoklu Teklif Opsiyonları ve Paket Teklif (Bundle Options) modelini belirler.

#### [PRP-032] Alternatifli tekliflerde müşteri bir opsiyonu onayladığında diğer opsiyonların otomatik kapatılması ve seçilen opsiyonun ana teklife dönüştürülmesi nasıl yürütülmektedir?
- **Süreç:** Alternatif Teklif / Opsiyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Opsiyon seçimi, kazanılan alternatifin siparişleşmesi ve atıl opsiyonların kapanışı.
- **Seçenekler:**
  - `secilen_opsiyon_onaylaninca_diger_opsiyonlar_otomatik_iptale_alinir`: Evet; müşteri 'Opsiyon B'yi kabul ettiğinde diğer seçenekler otomatik kapanır ve B opsiyonu siparişe aktarılır
  - `temsilci_secilen_opsiyonu_ayri_bir_siparis_olarak_manuel_yazar`: Otomasyon yoktur; müşteri hangi opsiyonu seçtiyse temsilci o ürünleri sıfırdan siparişe elle girer
  - `alternatif_opsiyon_kapanis_sureci_takip_edilmemektedir`: Opsiyon takibi yapılmaz; açıkta kalan tekliflerin durumu takip edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Alternatif Opsiyon Kapanış ve Seçilen Opsiyonu Siparişleştirme akışını belirler.

---

### 17. Teklif Dokümanı ve Gönderim

#### [PRP-033] Teklif çıktısı kurumsal kimliğe uygun olarak sistemden otomatik PDF/Word olarak üretilebilmekte ve ürün görselleri, teknik föyler, genel satış şartları dokümana eklenebilmekte midir?
- **Süreç:** Teklif Dokümanı ve Gönderim
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Otomatik teklif çıktısı, PDF/Word formatı, görsel katalog ve teknik ekler.
- **Seçenekler:**
  - `sistemden_tek_tikla_urun_gorselli_ve_sozlesme_ekli_profesyonel_pdf_uretilir`: Evet; logo, ürün fotoğrafları, teknik özellikler ve satış şartlarını içeren profesyonel PDF otomatik basılır
  - `sistemden_basit_bir_liste_cikar_gorsel_ve_tasarim_icin_worde_tasinir`: Sistem sadece ham metin/fiyat listesi verir; satışçı bunu Word'e kopyalayıp görsel ve kapak ekleyerek düzenler
  - `tum_teklif_dokumani_bastan_sona_excel_veya_wordde_elle_tasarlanir`: Sistemden teklif çıktısı alınamaz; tüm teklif dokümanı Excel veya Word'de manuel hazırlanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Otomatik PDF Teklif Raporlama Motoru ve Belge Tasarım Standartlarını belirler.

#### [PRP-034] Teklif dokümanı müşteriye sistem üzerinden otomatik e-posta ile gönderilmekte ve gönderim tarihi, teslim bilgisi veya müşterinin teklifi inceleme durumu izlenebilmekte midir?
- **Süreç:** Teklif Dokümanı ve Gönderim
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Sistemden doğrudan e-posta gönderimi, gönderim zaman damgası ve okundu takibi.
- **Seçenekler:**
  - `sistem_uzerinden_eposta_ile_gonderilir_ve_gonderim_tarihi_loglanir`: Evet; teklif tek tıkla müşteriye e-posta atılır, gönderim tarihi, kime gittiği ve ekler sistemde loglanır
  - `pdf_bilgisayara_indirilir_temsilcinin_kisisel_outlookundan_gonderilir`: Sistemden doğrudan mail atılamaz; PDF indirilip personelin şahsi Outlook hesabından eklenerek iletilir
  - `gonderim_takibi_yapilmaz_teklifin_musteriye_gidip_gitmedigi_bilinmez`: Gönderim takibi yoktur; teklifin müşteriye ne zaman iletildiği sistem üzerinden izlenemez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Otomatik E-posta Gönderimi ve İletim Günlüğü (Dispatch Audit Log) gereksinimini belirler.

---

### 18. Teklif Kabul / Red / Bekleme Takibi

#### [PRP-035] Müşteriye iletilen tekliflerin sonuç durumu (Açık/Beklemede, Kabul Edildi, Reddedildi, İptal, Süresi Doldu) nasıl takip edilmekte ve güncellenmektedir?
- **Süreç:** Teklif Kabul / Red / Bekleme Takibi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif yaşam döngüsü statüleri, sonuç takibi ve teklif havuzu yönetimi.
- **Seçenekler:**
  - `teklif_statuleri_sistemde_anlik_guncellenir_ve_yonetim_panellerinde_izlenir`: Evet; her teklifin statüsü (Açık, Müşteride, Onaylandı, Reddedildi) güncellenir ve havuz canlı izlenir
  - `sadece_siparis_olanlar_kaydedilir_reddedilen_veya_bekleyenler_takip_edilmez`: Yalnızca kabul edilen teklifler sisteme girer; kaybedilen veya bekleyen yüzlerce teklif unutulur
  - `teklif_sonuc_durumu_takip_edilmemektedir`: Tekliflerin akıbeti takip edilmez; kaç teklifin onaylandığı veya reddedildiği bilinmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Havuzu Yaşam Döngüsü ve Statü Yönetimini belirler.

#### [PRP-036] Reddedilen veya kaybedilen tekliflerde standart Red / Kayıp Nedenleri (Yüksek Fiyat, Rakip Tercihi, Bütçe İptali, Geç Teslimat, Teknik Yetersizlik) zorunlu olarak kayıt altına alınmakta mıdır?
- **Süreç:** Teklif Kabul / Red / Bekleme Takibi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kayıp teklif analizleri, standart red gerekçeleri ve rakip analitiği.
- **Seçenekler:**
  - `red_nedeni_ve_rakip_bilgisi_zorunlu_secilerek_analiz_edilir`: Evet; teklif 'Kaybedildi' işaretlenirken standart red sebebi ve kazanan rakip firma bilgisi zorunlu girilir
  - `sadece_serbest_aciklama_olarak_istege_bagli_yazilir`: Standart kategori yoktur; temsilci isterse açıklama kutusuna 'Fiyat pahalı geldi' gibi serbest metin yazar
  - `kayip_nedeni_kayit_altina_alinmamaktadir`: Tekliflerin neden kaybedildiği kaydedilmez ve analiz edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Kayıp Teklif Analitiği (Lost Deal Analysis) ve Rakip Fiyatlandırma İstihbaratını belirler.

---

### 19. Tekliften Siparişe Dönüşüm

#### [PRP-037] Müşteri tarafından kabul edilen teklif tek tıkla otomatik olarak Satış Siparişine (Sales Order) dönüştürülebilmekte midir?
- **Süreç:** Tekliften Siparişe Dönüşüm
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif-sipariş entegrasyonu, veri aktarımı ve mükerrer veri girişinin önlenmesi.
- **Seçenekler:**
  - `kabul_edilen_teklif_tek_tikla_eksiksiz_satis_siparisine_donusturulur`: Evet; onaylanan teklif tek tuşla siparişe dönüşür; satırlar, miktarlar, fiyatlar ve teslim şartları aynen aktarılır
  - `teklifteki_bilgiler_siparis_ekranina_manuel_bastan_girilir`: Otomatik dönüşüm yoktur; satış veya sipariş personeli teklif çıktısına bakarak ERP'ye sıfırdan sipariş girer
  - `kismi_donusum_vardir_fakat_fiyat_ve_iskontolar_tekrar_elle_yazilir`: Ürün satırları kopyalanır ancak fiyatlar ve iskontolar sipariş ekranında tekrar elle girilmek zorundadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Tekliften Siparişe Dönüşüm Otomasyonu (Quote-to-Order Conversion) tasarımını belirler.

#### [PRP-038] Tekliften siparişe dönüşüm esnasında teklifteki onaylı fiyatlar, iskontolar, ödeme koşulları ve teslimat şartları kilitlenerek yetkisiz son dakika değişiklikleri engellenmekte midir?
- **Süreç:** Tekliften Siparişe Dönüşüm
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Teklif-sipariş veri bütünlüğü, fiyat kilidi ve yetkisiz değişiklik engelleme.
- **Seçenekler:**
  - `teklif_sartlari_kilitlenir_onay_alinmadan_siparis_asamasinda_degistirilemez`: Evet; onaylı teklifin fiyatı ve iskontosu sipariş ekranında kilitli gelir, değişiklik için yeniden onay gerekir
  - `siparis_girisi_yapan_kullanici_fiyat_ve_iskontoyu_serbestce_degistirebilir`: Kilit yoktur; sipariş girişi yapan personel teklifteki onaylı fiyattan farklı bir fiyat veya ek iskonto girebilir
  - `fiyat_ve_iskonto_bütünlüğü_takip_edilememektedir`: Teklifteki fiyatla kesilen sipariş fiyatı arasındaki farklar sistem üzerinden denetlenemez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Fiyat Bütünlüğü Koruması ve Sipariş Değişiklik Kilidi kurallarını belirler.

---

### 20. Teklif KPI ve Dönüşüm Analizi

#### [PRP-039] Şirket genelinde ve satış temsilcisi bazında Teklif Kazanma Oranı (Win/Loss Rate — Açılan teklif tutarı vs Siparişe dönen tutar) düzenli olarak raporlanmakta mıdır?
- **Süreç:** Teklif KPI ve Dönüşüm Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Teklif kazanma/kaybetme başarı oranı, temsilci başarı analizi ve dönüşüm yüzdeleri.
- **Seçenekler:**
  - `win_loss_orani_temsilci_urun_ve_sektor_bazinda_canli_raporlanir`: Evet; toplam açılan teklif adedi/tutarı ile siparişe dönüşen oran (%) temsilci ve ürün bazında izlenir
  - `donem_sonlarinda_excelde_manuel_hesaplanmaya_calisilir`: Canlı takip yoktur; yıl sonunda teklif listesi ve siparişler Excel'de eşleştirilerek kaba bir oran bulunur
  - `teklif_kazanma_veya_donusum_orani_olculmemektedir`: Teklif kazanma oranı ölçülmemektedir; verilen tekliflerin yüzde kaçının siparişe döndüğü bilinmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Win/Loss Dönüşüm Raporlama ve Satış Başarı Metriklerini belirler.

#### [PRP-040] Ortalama teklif hazırlama süresi, ortalama revizyon sayısı, verilen ortalama iskonto yüzdesi ve teklif kârlılık marjı yönetim panellerinde izlenmekte midir?
- **Süreç:** Teklif KPI ve Dönüşüm Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Teklif operasyonel verimlilik KPI'ları, ortalama iskonto, revizyon frekansı ve marj analizi.
- **Seçenekler:**
  - `tum_teklif_verimlilik_kpi_ve_iskonto_analizleri_gosterge_panellerinde_izlenir`: Evet; ortalama hazırlama hızı, ortalama revizyon adedi, ortalama iskonto ve gerçekleşen kâr marjı izlenir
  - `yalnizca_toplam_teklif_adedi_ve_tutari_takip_edilir`: Yalnızca bu ay kaç liralık teklif verildiği takip edilir; revizyon, süre veya ortalama iskonto ölçülmez
  - `teklif_verimlilik_ve_maliyet_kpi_takibi_yapilmamaktadir`: Teklif KPI takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Teklif Yönetim Kokpiti ve Operasyonel Verimlilik Göstergelerini belirler.

#### [PRP-041] Geçerlilik süresi dolmak üzere olan veya müşteriden uzun süredir yanıt alınamayan açık teklifler için temsilcilere otomatik takip/hatırlatma alarmları iletilmekte midir?
- **Süreç:** Teklif KPI ve Dönüşüm Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Teklif takip hatırlatmaları, geçerlilik süresi alarmları ve proaktif teklif takibi.
- **Seçenekler:**
  - `sistem_gecerlilik_bitmeden_once_temsilciye_otomatik_hatirlatma_ve_gorev_acar`: Evet; teklif süresi bitmeden 3 gün önce temsilciye bildirim düşer ve 'Müşteriyi Ara' görevi tetiklenir
  - `temsilci_kendi_hafizasinda_veya_ajandasinda_takip_ederse_arar`: Otomatik bildirim yoktur; satışçı ajandasına not aldıysa müşteriyi arar, almadıysa teklif unutulur
  - `acik_teklif_takip_ve_hatirlatma_mekanizmasi_bulunmamaktadir`: Açık teklif takip mekanizması yoktur; verilen tekliflerin büyük kısmı takipsizlikten kaybedilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** Proaktif Teklif Takip ve Hatırlatma Bildirim Motorunu belirler.

#### [PRP-042] ERP dönüşümü sonrasında hedeflenen Kurumsal Teklif ve Fiyatlandırma Yönetimi vizyonu ve temel önceliği nedir?
- **Süreç:** Teklif KPI ve Dönüşüm Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), teklif-fiyatlandırma yatırım hedefleri ve kurumsal öncelikler.
- **Seçenekler:**
  - `merkezi_fiyat_listeleri_marj_zirhi_versiyonlama_ve_tek_tikla_siparislesme`: Merkezi fiyat listeleri, marj zırhı, kademeli iskonto onayı, versiyonlama ve tek tıkla siparişleşen tam entegre mimari
  - `profesyonel_pdf_ciktisi_ve_hizli_teklif_olusturma_onceliklidir`: Satış ekibinin dakikalar içinde kurumsal PDF teklif hazırlayıp müşteriye iletebilmesi önceliklidir
  - `excel_bagimliliginin_bitmesi_ve_gecmis_teklif_fiyatlarinin_gorunurlugu`: Excel'deki dağınık tekliflerin sisteme girmesi ve müşteriye verilen eski fiyatların anında görülmesi hedeflenmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/Teklif Karar Etkisi:** ERP Dönüşüm Projesi Teklif & Fiyatlandırma İş Paketi Kapsamını belirler.
