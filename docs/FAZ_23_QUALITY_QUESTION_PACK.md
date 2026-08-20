# FAZ-23 — Kalite Kontrol / QUALITY Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.quality.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `QUALITY` (Kalite Kontrol)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Kalite Güvence Müdürleri, Kalite Kontrol Mühendisleri, Üretim Yöneticileri, Denetçiler ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP/QMS dönüşümü öncesinde kalite organizasyonu ve sorumluluk matrisi, ürün ve operasyon bazlı kalite kontrol planları, teknik resim ve revizyon uyumu, giriş kalite kontrol (IQC) ve dinamik muayene seviyeleri (Skip-lot), proses/ara kalite kontrol (IPQC) ve ilk parça onayı (FAI), final ve sevk öncesi kalite kontrol (FQC/OQC), istatistiksel numune alma standartları (AQL / ISO 2859), boyutsal/kimyasal/fiziksel kontrol kriterleri ve tolerans limitleri, sayısal ölçüm verisi kaydı ve tolerans aşım alarmları, kalite kabul/red ve stok serbest bırakma (Release) mekanizması, şartlı kabul (Concession/Deviation) onayları, uygunsuzluk yönetimi ve hata kodları, sistemik NCR (Non-Conformance Report) takibi, karantina alanı ve disposition kararları, yeniden işleme (Rework) ve tamir iş emirleri, hurda (Scrap) ve imha maliyetleri, kök neden analizi metodolojileri (5 Why, Balık Kılçığı, 8D), CAPA (Düzeltici ve Önleyici Faaliyet) yönetimi ve etkinlik doğrulaması, ölçüm cihazları ve kalibrasyon geçerlilik denetimi, kalite sonuçlarının Lot/Seri izlenebilirliği, Analiz Sertifikası (CoA / CoC) üretimi, İlk Seferde Doğru Oranı (FPY), PPM hata oranları, Kötü Kalite Maliyeti (COPQ) ve kalite yönetim kokpiti süreçlerinin AS-IS durumunu ve ERP/QMS gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | QUALITY ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **SUPPLIER_MANAGEMENT** | Tedarikçi kartı, onay iş akışı, AVL, tedarikçi değerlendirme karnesi (Scorecard), SCAR, tedarikçi blokajı | **SUPPLIER_MANAGEMENT tedarikçinin genel karne puanını ve tedarikçi yaşam döngüsünü sorgular.** QUALITY gelen malın teknik kontrol kriterlerini, ölçümlerini, kabul/red kararını ve fabrika içi NCR/CAPA süreçlerini sorgular. *(0 Tedarikçi Scorecard / AVL sorusu)*. |
| **WAREHOUSE** | Fiziksel mal kabul, depo raf adresleme, karantina alanı, putaway, iç transferler | **WAREHOUSE fiziksel depo hareketlerini sorgular.** QUALITY malın kalite onay durumunu, kontrol planını ve kalite serbest bırakma (Release) kararını sorgular. |
| **INVENTORY** | Stok seviyeleri, lot/seri takibi, sayım, stok rezervasyonu | **INVENTORY envanter bakiyesini sorgular.** QUALITY "Bu test sonucu hangi lot/seri ile eşleşir ve bu lot kalite onayı aldı mı?" sorusunu sorgular. |
| **CRM** | Müşteri ilişkileri, şikâyet kaydı, müşteri memnuniyeti | **CRM müşteri temasını ve şikâyet kaydını sorgular.** QUALITY müşteri şikâyetine bağlı fabrika içi teknik kök neden analizini, NCR ve CAPA aksiyonlarını sorgular. |
| **QUALITY** | Kalite organizasyonu, kontrol planları, giriş/proses/final kontroller, numune (AQL), ölçüm/tolerans, serbest bırakma, NCR, karantina disposition, rework, hurda, 5 Why / 8D, CAPA, kalibrasyon, lot izlenebilirliği, CoA/CoC ve COPQ | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular teknik kalite kontrol, muayene spesifikasyonları, uygunsuzluk yönetimi ve kalite güvence odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (20 Kanonik Süreç / 42 Soru)

1. **Kalite Organizasyonu** (2 Soru — QLT-001, QLT-002)
2. **Kalite Planları ve Kontrol Spesifikasyonları** (2 Soru — QLT-003, QLT-004)
3. **Giriş Kalite Kontrol** (2 Soru — QLT-005, QLT-006)
4. **Proses / Ara Kontrol** (2 Soru — QLT-007, QLT-008)
5. **Final Kalite Kontrol** (2 Soru — QLT-009, QLT-010)
6. **Numune Alma** (2 Soru — QLT-011, QLT-012)
7. **Ölçüm ve Kontrol Kriterleri** (2 Soru — QLT-013, QLT-014)
8. **Tolerans ve Kabul Limitleri** (2 Soru — QLT-015, QLT-016)
9. **Kalite Sonucu ve Serbest Bırakma** (2 Soru — QLT-017, QLT-018)
10. **Uygunsuzluk Yönetimi** (2 Soru — QLT-019, QLT-020)
11. **NCR / Non-Conformance** (2 Soru — QLT-021, QLT-022)
12. **Karantina ve Disposition** (2 Soru — QLT-023, QLT-024)
13. **Yeniden İşleme / Rework** (2 Soru — QLT-025, QLT-026)
14. **Hurda ve Şartlı Kabul** (2 Soru — QLT-027, QLT-028)
15. **Kök Neden Analizi** (2 Soru — QLT-029, QLT-030)
16. **CAPA / Düzeltici ve Önleyici Faaliyet** (2 Soru — QLT-031, QLT-032)
17. **Ölçüm Cihazı / Kalibrasyon Bağlantısı** (2 Soru — QLT-033, QLT-034)
18. **Lot / Seri İzlenebilirliği** (2 Soru — QLT-035, QLT-036)
19. **Kalite Dokümanları ve Sertifikalar** (2 Soru — QLT-037, QLT-038)
20. **Kalite Raporlama ve KPI** (4 Soru — QLT-039, QLT-040, QLT-041, QLT-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Kalite Organizasyonu

#### [QLT-001] Şirketinizde kalite kontrol ve güvence faaliyetleri (Giriş muayenesi, Proses kontrolleri, Laboratuvar testleri, Final kontrol, Belgelendirme) hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?
- **Süreç:** Kalite Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kalite departmanı yapısı, bağımsız denetim gücü ve organizasyonel olgunluk.
- **Seçenekler:**
  - `uretimden_bagimsiz_ayri_bir_kalite_kontrol_ve_guvence_departmani_vardir`: Üretimden bağımsız ayrı bir Kalite Departmanı (Giriş, Proses, Final ve QMS uzmanları) tarafından yönetilir
  - `uretim_veya_depo_personeli_kendi_yaptigi_isi_kontrol_eder_ayri_ekip_yoktur`: Ayrı bir kalite ekibi yoktur; üretimi yapan operatör veya depocu temel göz kontrolünü kendisi yapar
  - `yalnizca_laboratuvar_veya_teknik_mudur_ihtiyac_oldukca_numune_bakar`: Rutin kontrol ekibi yoktur; sadece problem çıktığında veya müşteri istediğinde teknik yönetici numune inceler *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kalite Organizasyonel Rolleri ve Onay Yetki Hiyerarşisini belirler.

#### [QLT-002] Kalite kontrol personelinin vardiya düzeni, fabrika içi yetki matrisi (Üretimi veya sevkiyatı durdurma yetkisi) ve onay sınırları sistemde tanımlı mıdır?
- **Süreç:** Kalite Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kalite yetki matrisi, hattı durdurma yetkisi (Line Stop Authority) ve vardiya kapsamı.
- **Seçenekler:**
  - `kalite_ekibinin_uretimi_ve_sevkıyatı_resmi_durdurma_yetkisi_ve_vardiya_plani_vardir`: Evet; kalite teknisyeni uygunsuzluk anında hattı durdurma ve sevkiyatı kilitleme tam yetkisine sahiptir
  - `kalite_ekibi_uyari_verir_ancak_durdurma_yetkisi_fabrika_veya_uretim_mudurundedir`: Kalite personeli hata bulsa bile hattı veya sevkiyatı durduramaz; son karar üretim yöneticisindedir
  - `yetki_matrisi_veya_resmi_durdurma_kurali_tanimli_degildir`: Resmi bir kalite yetki matrisi veya durdurma kuralı tanımlı değildir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Hattı Durdurma ve Sevkiyat Kilitleme Yetki Matrisini belirler.

---

### 2. Kalite Planları ve Kontrol Spesifikasyonları

#### [QLT-003] Malzemeler, yarı mamuller ve bitmiş ürünler için hangi aşamada hangi kontrollerin yapılacağını belirleyen Kalite Kontrol Planları (Inspection Plans) sistemde tanımlı mıdır?
- **Süreç:** Kalite Planları ve Kontrol Spesifikasyonları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kalite kontrol planı, ürün bazlı kontrol adımları ve test spesifikasyonları.
- **Seçenekler:**
  - `malzeme_ve_operasyon_bazinda_parametre_ve_tolerans_iceren_kontrol_planlari_tanimlidir`: Evet; ERP/QMS içinde her ürünün giriş, operasyon ve final kontrol kriterleri ve toleransları tanımlıdır
  - `kontrol_planlari_excel_veya_teknik_dokuman_olarak_klasorde_tutulur`: Planlar vardır fakat sistemik değildir; kalite masalarında asılı kağıt formlarda veya Excel'de tutulur
  - `tanimlanmis_resmi_bir_kalite_kontrol_plani_bulunmamaktadir`: Resmi bir kontrol planı yoktur; kontrolü yapan kişinin mesleki tecrübesine ve göz kararına göre bakılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kalite Kontrol Planı Veri Modeli ve Test Karakteristikleri Yapısını belirler.

#### [QLT-004] Ürün revizyonları, mühendislik değişiklikleri (ECO/ECN) veya teknik resim güncellemeleri kalite kontrol kriterlerine anlık olarak yansıtılmakta mıdır?
- **Süreç:** Kalite Planları ve Kontrol Spesifikasyonları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Revizyon uyumu, teknik resim bağlantısı ve mühendislik değişikliği (ECO) entegrasyonu.
- **Seçenekler:**
  - `revizyon_ve_teknik_resim_degisiklikleri_kalite_kontrol_planina_otomatik_baglidir`: Evet; teknik resim veya BOM revizyonu değiştiğinde kalite kontrol ekranındaki kriterler otomatik güncellenir
  - `muhendislik_degisiklikleri_kaliteye_eposta_ile_bildirilir_manuel_guncellenir`: Entegrasyon yoktur; AR-GE/Mühendislik ekibi e-posta atar, kalite sorumlusu kontrol formunu elle revize eder
  - `revizyon_veya_teknik_resim_takibi_yapilamamaktadir`: Revizyon takibi yapılamaz; eski teknik resme veya eski toleranslara göre kontrol yapılması riski vardır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Mühendislik Değişiklik Yönetimi (ECO) ve Revizyon Bazlı Kalite Kriterleri Entegrasyonunu belirler.

---

### 3. Giriş Kalite Kontrol

#### [QLT-005] Tedarikçilerden gelen hammadde, yardımcı malzeme ve ticari malların mal kabulü sırasında Giriş Kalite Kontrol (IQC - Incoming Quality Control) süreci işletilmekte midir?
- **Süreç:** Giriş Kalite Kontrol
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Giriş kalite kontrol varlığı, kontrol kapsamı ve mal kabul entegrasyonu.
- **Seçenekler:**
  - `tum_veya_belirlenmis_kritik_hammaddeler_giris_kalite_kontrolunden_gecer`: Evet; satın alma siparişine bağlı gelen malzemeler kontrol edilip onaylanmadan kullanıma açılmaz
  - `yalnizca_irsaliye_miktar_ve_paket_hasar_kontrolu_yapilir_teknik_muayene_yoktur`: Sadece depocu koli sayısını ve dış hasarı kontrol eder; teknik ölçüm veya laboratuvar testi yapılmaz
  - `giris_kalite_kontrol_yapilmamaktadir`: Şirketimizde giriş kalite kontrol süreci uygulanmamaktadır; gelen mal doğrudan üretime/stoka alınır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Giriş Kalite Kontrol (IQC) Muayene Akışı ve Mal Kabul Entegrasyonunu belirler.

#### [QLT-006] Giriş kalite kontrolde tedarikçinin geçmiş performansına ve ürün riskine göre Dinamik Muayene Seviyeleri (Normal, Sıkılaştırılmış, İndirgenmiş / Skip-lot) uygulanmakta mıdır?
- **Süreç:** Giriş Kalite Kontrol
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `QLT-005 != "giris_kalite_kontrol_yapilmamaktadir"`
- **Açıklama:** Dinamik kalite seviyesi, tedarikçi güven derecesi ve skip-lot muayene kuralları.
- **Seçenekler:**
  - `tedarikci_performansina_gore_sistem_muayene_seviyesini_otomatik_belirler`: Evet; güvenilir tedarikçide Skip-lot (her 5 partide 1 kontrol), sorunlu tedarikçide %100 sıkı kontrol açılır
  - `her_zaman_ayni_sabit_oranda_veya_sabit_numune_sayisiyla_kontrol_edilir`: Tedarikçiye göre değişmez; gelen her partiden standart olarak aynı sayıda numune alınıp bakılır
  - `dinamik_muayene_veya_skip_lot_kullanilmamaktadir`: Dinamik muayene veya seviyelendirme uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Dinamik Muayene Kuralları (Skip-Lot Rules) ve Tedarikçi Risk Seviyesi Entegrasyonunu belirler.

---

### 4. Proses / Ara Kontrol

#### [QLT-007] Üretim ve montaj aşamalarında operasyon bazlı Proses / Ara Kalite Kontrol (IPQC - In-Process Quality Control) ve istasyon kontrolleri yapılmakta mıdır?
- **Süreç:** Proses / Ara Kontrol
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Hat içi ara kontrol, operasyon onayları ve üretim esnası testler.
- **Seçenekler:**
  - `is_emri_ve_operasyon_bazinda_sistemik_ara_kalite_onaylari_zorunludur`: Evet; belirlenen kritik operasyonlarda kalite onayı verilmeden iş emri bir sonraki istasyona ilerleyemez
  - `operatorler_ara_olcumleri_yapar_ancak_sisteme_kaydetmez_kendi_aralarinda_bakar`: Operatörler kumpas/mikrometre ile kontrol eder fakat sistemik onay kısıtı veya kayıt zorunluluğu yoktur
  - `proses_kalite_kontrol_yapilmamaktadir`: Üretim sırasında ara kalite kontrol yapılmaz; yalnızca en son bitmiş ürüne bakılır veya hiç bakılmaz
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Hat İçi Ara Kalite Kapıları (Quality Gates / IPQC) ve Operasyon Kilitleme Kurgusunu belirler.

#### [QLT-008] Yeni bir iş emri veya kalıp/ayar başlangıcında İlk Parça Onayı (First Article Inspection - FAI / Ayar Onayı) süreci işletilmekte midir?
- **Süreç:** Proses / Ara Kontrol
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `QLT-007 != "proses_kalite_kontrol_yapilmamaktadir"`
- **Açıklama:** İlk parça kontrolü (FAI), kalıp/ayar doğrulama ve seri üretime başlama onayı.
- **Seçenekler:**
  - `ilk_parca_kalite_tarafindan_olculup_sistemden_onaylanmadan_seri_uretime_gecilemez`: Evet; makine ayarından sonra üretilen ilk parça onaylanmadan iş emrinin seri üretimine izin verilmez
  - `ayar_onayi_usta_veya_operator_tarafindan_sozlu_verilir_kayit_tutulmaz`: Usta veya vardiya amiri parçayı kontrol edip 'Tamam çalıştır' der; sistemik FAI kaydı tutulmaz
  - `ilk_parca_onayi_fai_uygulanmamaktadir`: İlk parça onayı veya ayar kontrol süreci uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** İlk Parça Onayı (FAI) ve Seri Üretime Geçiş Kilit Mekanizmasını belirler.

---

### 5. Final Kalite Kontrol

#### [QLT-009] Üretimi tamamlanan bitmiş mamullerin depoya aktarımı ve müşteriye sevk edilmesinden önce Final Kalite Kontrol (FQC / OQC - Outgoing Quality Control) testi yapılmakta mıdır?
- **Süreç:** Final Kalite Kontrol
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Son kontrol, sevk öncesi muayene, paketleme/etiketleme kontrolleri ve ürün kabulü.
- **Seçenekler:**
  - `bitmis_tum_mamuller_final_kontrol_ve_fonksiyon_testinden_gecerek_onaylanir`: Evet; üretim bitiminde görsel, boyutsal ve elektriksel/fonksiyonel testler tamamlanıp final onay verilir
  - `yalnizca_ambalaj_etiket_ve_koli_adeti_kontrol_edilir`: Teknik son test yapılmaz; yalnızca doğru etiket ve koli adedi kontrol edilip depoya aktarılır
  - `final_kalite_kontrol_yapilmamaktadir`: Şirketimizde final kalite kontrol süreci uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Final Kalite Kontrol (FQC) ve Mamul Ambarına Devir Onay Mekanizmasını belirler.

#### [QLT-010] Final kalite kontrol onayı almamış veya test sonucu 'Red' olan ürünlerin müşteriye İrsaliye/Sevkiyat yapılması sistem üzerinden engellenmekte midir?
- **Süreç:** Final Kalite Kontrol
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `critical`
- **Koşul:** `QLT-009 != "final_kalite_kontrol_yapilmamaktadir"`
- **Açıklama:** Kalite onaysız mamul sevkiyat kilit mekanizması ve blokaj kuralı.
- **Seçenekler:**
  - `kalite_onaysiz_veya_redli_urunlerin_irsaliyesi_ve_sevkiyati_kesinlikle_engellenir`: Evet; sistem final onay statüsü 'Kabul' olmayan hiçbir palet veya lotun çeki listesine girmesine izin vermez
  - `sistem_uyari_verir_ancak_sevkiyatci_uyariyi_gecip_irsaliye_kesebilir`: Sistem uyarı gösterir fakat irsaliye basımını kilitlemez; acil sevkiyat durumunda redli ürün sevk edilebilir
  - `kalite_onay_durumu_sevkiyatta_denetlenmemektedir`: Sevkiyat sırasında kalite onay durumu kontrol edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kalite Onayı Olmadan Sevkiyat Blokajı (Shipping Lock) Güvenliğini belirler.

---

### 6. Numune Alma

#### [QLT-011] Kalite kontrollerde partiden kaç adet numune alınacağı (Numune Büyüklüğü) hangi yöntemle (AQL / ISO 2859 İstatistiksel Tablo, Yüzde Oranı, Sabit Adet, %100 Muayene) belirlenmektedir?
- **Süreç:** Numune Alma
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Numune alma standardı (Sampling Standard), AQL kurgusu ve parti kabul kriterleri.
- **Seçenekler:**
  - `uluslararasi_aql_iso2859_standartlarina_gore_parti_hacminden_otomatik_hesaplanir`: Evet; parti büyüklüğüne göre ISO 2859 / AQL Seviye II tablosundan numune adedi ve kabul/red sayısı belirlenir
  - `parti_miktarinin_sabit_yuzdesi_veya_sabit_adet_numune_alinir`: AQL kullanılmaz; her partiden sabit (Örn. her kutudan 3 adet veya partinin %5'i) numune alınır
  - `numune_sayisi_kontrolu_yapan_kisinin_inisiyatifindedir`: Standart kural yoktur; kontrolör o an gözüne çarpan 1-2 parçaya bakar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** İstatistiki Numune Alma Motoru (AQL / ISO 2859 Sampling Logic) tasarımını belirler.

#### [QLT-012] Üretilen veya satın alınan ürünler arasında numune alma yerine %100 Kontrol (Tüm parçaların tek tek muayenesi / Poka-Yoke / Kamera Kontrolü) gerektiren kritik ürünler var mıdır?
- **Süreç:** Numune Alma
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** %100 muayene gereksinimi, güvenlik kritik parçalar ve otomatik optik/kamera kontrolü.
- **Seçenekler:**
  - `kritik_ve_guvenlik_parcalarinda_yuzde100_manuel_veya_otomatik_kamera_kontrolu_vardir`: Evet; kritik parçalar %100 boyutsal veya kamera kontrolünden geçer, her parçanın test kaydı oluşur
  - `tum_urunlerde_sadece_numune_kontrolu_yapilir_yuzde100_kontrol_yoktur`: %100 kontrol yapılmaz; tüm ürün gruplarında yalnızca örnekleme/numune yöntemi kullanılır
  - `yuzde100_kontrol_ihtiyaci_veya_kurali_bulunmamaktadir`: %100 kontrol ihtiyacı veya kuralı bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** %100 Muayene ve Seri Numarası Bazlı Test Kayıt Altyapısını belirler.

---

### 7. Ölçüm ve Kontrol Kriterleri

#### [QLT-013] Kalite kontrol süreçlerinde hangi tip kontrol kriterleri (Boyutsal Ölçümler, Kimyasal/Laboratuvar Analizleri, Görsel/Estetik Kusurlar, Mekanik/Çekme Testleri, Fonksiyonel/Elektriksel Testler) incelenmektedir?
- **Süreç:** Ölçüm ve Kontrol Kriterleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kontrol karakteristikleri tipleri (Değişken / Niteliksel - Variable vs Attribute).
- **Seçenekler:**
  - `hem_sayisal_olcumler_boyut_agirlik_sertlik_hem_niteliksel_gorsel_fonksiyonel_kriterler_birlikte_izlenir`: Evet; boyutsal ölçümler, laboratuvar/kimyasal değerler ve görsel/kusur kriterleri yapısal olarak kontrol edilir
  - `yalnizca_gorsel_ve_fiziksel_gozle_muayene_yapilir_sayisal_olcum_azdir`: Laboratuvar veya hassas ölçüm yoktur; yalnızca çizik, renk ve dış görünüş gibi gözle kontroller yapılır
  - `olcum_kriterleri_standartlastirilmamistir`: Ölçüm kriterleri standartlaştırılmamıştır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Niteliksel (Attribute) ve Sayısal (Variable) Test Parametreleri Veri Yapısını belirler.

#### [QLT-014] Ölçüm cihazlarından (Dijital Kumpas, Mikrometre, CMM Koordinat Ölçüm Cihazı, Spektrometre, Terazi) ölçüm verileri sisteme otomatik (RS232/USB/IoT API) aktarılmakta mıdır?
- **Süreç:** Ölçüm ve Kontrol Kriterleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Cihaz entegrasyonu, otomatik veri toplama ve manuel giriş hatalarının engellenmesi.
- **Seçenekler:**
  - `olcum_cihazlarindan_veriler_kablo_veya_iot_ile_kalite_ekranina_otomatik_duser`: Evet; dijital kumpas veya CMM cihazındaki butona basıldığında ölçülen değer anında sisteme aktarılır
  - `olcum_cihazindan_okunan_deger_operator_tarafindan_klavyeyle_manuel_girilir`: Cihaz bağlantısı yoktur; operatör ekrandaki veya göstergedeki değeri görüp klavyeyle sisteme yazar
  - `sayisal_olcum_verisi_sisteme_kaydedilmemektedir`: Ölçüm verileri sisteme girilmez; kağıda yazılır veya hiç kaydedilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kalite Cihaz Entegrasyonları (RS232/IoT/OPC-UA CMM Entegrasyonu) gereksinimini belirler.

---

### 8. Tolerans ve Kabul Limitleri

#### [QLT-015] Kalite kontrol kriterlerinde Hedef Değer (Nominal), Alt Tolerans (USL) ve Üst Tolerans (LSL) limitleri sistemde tanımlı mıdır ve girilen ölçüm sonucu toleransla otomatik karşılaştırılmakta mıdır?
- **Süreç:** Tolerans ve Kabul Limitleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Sayısal tolerans limitleri (Nominal, Min, Max), tolerans denetimi ve otomatik uygunluk kararı.
- **Seçenekler:**
  - `nominal_ve_tolerans_limitleri_tanimlidir_olcum_girildiginde_sistem_uygunlugu_otomatik_hesaplar`: Evet; ölçülen değer girildiği an sistem Min/Max limitlerine bakar ve 'Uygun' veya 'Tolerans Dışı' kararını verir
  - `toleranslar_teknik_resimde_vardir_ancak_sistemde_yoktur_uygunluk_kararini_kisi_verir`: Sistemde sadece 'Geçti/Kaldı' seçilir; kişi teknik resimdeki toleransa bakıp uygunluğa kendisi karar verir
  - `sayisal_olcum_ve_tolerans_takibi_yapilmamaktadir`: Sayısal ölçüm veya tolerans takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Otomatik Tolerans Karşılaştırma ve Limit Denetim Motorunu belirler.

#### [QLT-016] Tolerans dışı (Out of Specification) bir ölçüm girildiğinde sistem anında sesli/görsel alarm vermekte ve partiyi otomatik 'Şüpheli / Red' durumuna kilitlemekte midir?
- **Süreç:** Tolerans ve Kabul Limitleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `QLT-015 != "sayisal_olcum_ve_tolerans_takibi_yapilmamaktadir"`
- **Açıklama:** Spesifikasyon dışı durum alarmları, otomatik şartlı kilit ve hatalı partinin ilerlemesinin önlenmesi.
- **Seçenekler:**
  - `tolerans_asildiginda_ekran_kirmizi_uyari_verir_ve_parti_otomatik_kilitlenir`: Evet; tolerans dışı değer girildiğinde sistem kabul butonunu kilitler ve partiyi otomatik karantinaya çeker
  - `tolerans_asilsa_bile_kontrolor_isterse_manuel_kabul_verebilir`: Sistem uyarı gösterse de kilit koymaz; kontrolör inisiyatif kullanarak partiyi 'Kabul' seçebilir
  - `tolerans_asimi_alarmi_bulunmamaktadir`: Tolerans aşımı alarmı veya kilit mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Tolerans Dışı Ölçümlerde Anlık Alarm ve Otomatik Blokaj Kurallarını belirler.

---

### 9. Kalite Sonucu ve Serbest Bırakma

#### [QLT-017] Kalite kontrol sonucunda verilen kullanım kararları (Kabul - Unrestricted Use, Red - Blocked, Şartlı Kabul - Concession, Tedarikçiye İade, Hurda) sistemde stok statüsünü doğrudan değiştirmekte midir?
- **Süreç:** Kalite Sonucu ve Serbest Bırakma
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kullanım kararı (Usage Decision), stok statüsü değişimi (Kalite Kontrol Stok -> Kullanılabilir Stok).
- **Seçenekler:**
  - `kullanim_karari_verildigi_an_stok_statu_ve_lokasyonu_sistemde_otomatik_degisir`: Evet; 'Kabul' verilince stok serbest kalır, 'Red' verilince bloke stoğa çekilir ve tüketime kapatılır
  - `kalite_karari_sadece_metin_olarak_kalir_stok_transferi_depocu_tarafindan_elle_yapilir`: Sistemik otomatik geçiş yoktur; kalite onay verir, depocu gidip malı manuel olarak kullanılabilir stoka taşır
  - `stok_kalite_kontrol_statu_ayrimi_yoktur_tum_stok_her_an_kullanilabilir`: Stokta kalite statü ayrımı yoktur; depoya giren her mal kalite kararı beklenmeden tüketilebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kullanım Kararı (Usage Decision) ve Dinamik Stok Statü Geçişini belirler.

#### [QLT-018] Hafif tolerans dışı malzemeler için Şartlı Kabul / Sapma Onayı (Concession / Deviation Permit) verilirken hangi onay mekanizması (Mühendislik, Kalite Müdürü, Üretim Müdürü, Müşteri Onayı) işletilmektedir?
- **Süreç:** Kalite Sonucu ve Serbest Bırakma
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Şartlı kabul (Concession) onay hiyerarşisi ve sapma izin süreçleri.
- **Seçenekler:**
  - `sapma_turu_ve_nedeni_kaydedilerek_kalite_ve_muhendislik_coklu_onayi_ile_verilir`: Evet; sapma gerekçesi girilir, Kalite Müdürü + Üretim/AR-GE ortak onayı ile şartlı kabul verilir
  - `yalnizca_ilgili_kontrolor_veya_usta_kendi_inisiyatifiyle_kabul_eder`: Sistemik iş akışı yoktur; kontrolör veya vardiya ustası 'Bu partiyi kullanırız' diyerek geçirir
  - `sartli_kabul_mekanizmasi_kullanilmamaktadir_ya_tam_kabul_ya_tam_red_yapilir`: Şartlı kabul uygulanmaz; toleransa uymayan malzeme doğrudan reddedilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Sapma İzni (Concession / Deviation) Onay İş Akışı ve Belge Tarihçesini belirler.

---

### 10. Uygunsuzluk Yönetimi

#### [QLT-019] Fabrika içinde (Giriş kontrol, Üretim hatları, Depo, Sevkiyat) tespit edilen kalite uygunsuzlukları ve müşteri iadeleri nasıl kayıt altına alınmakta ve izlenmektedir?
- **Süreç:** Uygunsuzluk Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Uygunsuzluk tespit noktaları, bildirim kanalları ve merkezi uygunsuzluk kütüğü.
- **Seçenekler:**
  - `tum_uygunsuzluklar_merkezi_erp_qms_sisteminde_tekil_kayit_olarak_acilip_takip_edilir`: Evet; nerede çıkarsa çıksın uygunsuzluk kaynağı, tespit eden, ürün ve miktar detaylarıyla anlık kaydedilir
  - `uygunsuzluklar_excel_tablosunda_veya_aylik_kalite_formunda_tutulur`: Sistemik kayıt yoktur; kalite birimi aylık Excel tablosuna uygunsuzlukları elle işler
  - `uygunsuzluklar_sozlu_iletilir_resmi_bir_kayit_tutulmaz`: Resmi kayıt tutulmaz; hatta çıkan hatalar anlık olarak ustaya söylenir ve düzeltilmeye çalışılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Merkezi Uygunsuzluk Yönetim Modeli ve Olay Kayıt Altyapısını belirler.

#### [QLT-020] Müşterilerden gelen kalite şikâyetleri ve iadeler (RMA / Müşteri Uygunsuzluğu) ile fabrika içi kalite ve üretim süreçleri arasında çift yönlü izlenebilirlik bağı kurulabilmekte midir?
- **Süreç:** Uygunsuzluk Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Müşteri şikâyeti - fabrika içi uygunsuzluk köprüsü ve iade analiz entegrasyonu.
- **Seçenekler:**
  - `musteri_sikayeti_ilgili_lot_is_emri_ve_kalite_raporuyla_sistemde_birebir_eslesir`: Evet; müşteri şikâyet kaydı açıldığında partinin üretim iş emri, operatörü ve test verisi anında çekilir
  - `musteri_sikayetleri_crmde_ayri_kalite_analizi_excelde_ayri_tutulur_kopuktur`: İki taraf kopuktur; satış ekibi CRM'de şikâyet açar fakat kalitenin inceleme raporuyla sistemik bağı yoktur
  - `musteri_kalite_sikayetleri_sistemde_izlenmemektedir`: Müşteri kalite şikâyetleri sistemik olarak izlenmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Müşteri Şikâyeti - Fabrika İçi Kalite ve Üretim Şecere Entegrasyonunu belirler.

---

### 11. NCR / Non-Conformance

#### [QLT-021] Kalite uygunsuzlukları için sistem üzerinden benzersiz numaraya sahip resmi Uygunsuzluk Raporu (NCR - Non-Conformance Report) açılmakta mıdır?
- **Süreç:** NCR / Non-Conformance
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** NCR dokümantasyonu, benzersiz numara üretimi ve uygunsuzluk yaşam döngüsü.
- **Seçenekler:**
  - `sistemden_otomatik_numarali_ncr_karti_acilir_ve_cozum_sureci_is_akisiyla_yonetilir`: Evet; her uygunsuzluk için sistemden NCR numarası oluşur; sorumlu, miktar ve aksiyon adımları izlenir
  - `yalnizca_cok_buyuk_hatalarda_veya_musteri_istediginde_word_formatinda_ncr_yazilir`: Sistemik NCR yoktur; yalnızca büyük krizlerde Word/PDF formatında NCR tutanağı tutulur
  - `ncr_kaydi_acilmamaktadir`: Şirketimizde resmi NCR (Uygunsuzluk Raporu) süreci uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Sistemik NCR Yönetim Modülü ve Yaşam Döngüsü Tasarımını belirler.

#### [QLT-022] NCR kayıtlarında standart Hata Kodları (Defect Codes / Kusur Kataloğu — Örn. Çapak, Çatlak, Ölçü Kaçıklığı, Yanlış Etiket) kullanılmakta ve tekrarlayan hatalar raporlanabilmekte midir?
- **Süreç:** NCR / Non-Conformance
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `QLT-021 != "ncr_kaydi_acilmamaktadir"`
- **Açıklama:** Standart hata kataloğu (Defect Catalog), kusur ağacı ve tekrarlayan hata analizi.
- **Seçenekler:**
  - `standart_hata_katalogu_vardir_ve_en_cok_tekrarlayan_hata_turleri_pareto_ile_izlenir`: Evet; hata kodları standarttır; hangi kusur tipinin ne sıklıkla çıktığı Pareto grafikleriyle raporlanır
  - `hata_nedeni_serbest_metin_olarak_yazilir_standart_kod_listesi_yoktur`: Standart kodlama yoktur; personelin kendi ifadesiyle serbest metin olarak yazılır, raporlanması zordur
  - `hata_kodu_siniflandirmasi_yapilmamaktadir`: Hata kodu sınıflandırması yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Standart Hata Kataloğu (Defect Hierarchy) ve Kusur Pareto Analitiğini belirler.

---

### 12. Karantina ve Disposition

#### [QLT-023] Uygunsuz bulunan veya şüpheli görülen malzemeler için Karantina Kararı (Disposition: Karantinaya Al, İncele, Tedarikçiye İade, Hurdaya Ayır, Yeniden İşle) nasıl verilmekte ve uygulanmaktadır?
- **Süreç:** Karantina ve Disposition
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Karantina disposition süreci, malzeme akıbet kararları ve fiziksel/sistemsel izolasyon.
- **Seçenekler:**
  - `kalite_kurulu_veya_yetkili_tarafindan_sistemden_disposition_karari_secilir_ve_uygulanir`: Evet; sistem üzerinden karantina kararı verilir, malzeme fiziksel ve sistemsel olarak kullanıma kapatılır
  - `malzemenin_uzerine_kirmizi_etiket_yapistirilir_ancak_sistemde_kilitlenmez`: Fiziksel kırmızı etiket yapıştırılır fakat ERP sisteminde stok serbest görünmeye devam eder
  - `karantina_veya_disposition_sureci_bulunmamaktadir`: Karantina veya resmi disposition süreci bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Karantina Disposition Akışı ve Karar Matrisi Tasarımını belirler.

#### [QLT-024] Karantinaya alınan malzemelerin fiziki Karantina Depo / Raf Lokasyonuna transferi ve sistemik blokajı eş zamanlı olarak otomatik gerçekleşmekte midir?
- **Süreç:** Karantina ve Disposition
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Karantina depo lokasyon entegrasyonu ve stok kilit garantisi.
- **Seçenekler:**
  - `red_karari_verildiginde_stok_otomatik_olarak_karantina_adresine_tasinir_ve_kilitlenir`: Evet; sistem otomatik transfer fişi üretir, mal karantina rafına çekilmeden başka işlem yapılamaz
  - `fiziki_olarak_ayri_alana_konur_ancak_sistemde_lokasyon_transferi_yapilmaz`: Fiziken köşeye ayrılır fakat sistemde ana ambarda görünmeye devam eder, elle transfer gerekir
  - `karantina_lokasyon_takibi_yapilamamaktadir`: Karantina lokasyon takibi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Karantina Depo Adresi Otomatik Transferi ve Çift Yönlü İzolasyon Kurallarını belirler.

---

### 13. Yeniden İşleme / Rework

#### [QLT-025] Uygunsuz ürünlerin düzeltilmesi için Yeniden İşleme / Tamir (Rework / Repair) kararı verildiğinde, bu işlem için özel bir Rework İş Emri açılmakta ve ek işçilik/malzeme maliyeti takip edilmekte midir?
- **Süreç:** Yeniden İşleme / Rework
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Rework iş emirleri, yeniden işleme operasyonları ve ek maliyetlerin ayrıştırılması.
- **Seçenekler:**
  - `ayri_rework_is_emri_acilir_ek_iscilik_ve_malzeme_harcamasi_urunun_maliyetine_yansir`: Evet; sistemde Rework tipi iş emri açılır, düzeltme için harcanan süre ve fireler tam izlenir
  - `ayri_is_emri_acilmaz_ana_is_emri_uzerinde_gayriresmi_olarak_duzeltilir`: Sistemik rework iş emri yoktur; operatör hattan alıp kenarda düzeltir, ek işçilik maliyeti görünmez
  - `yeniden_isleme_rework_uygulanmamaktadir_hatali_urun_dogrudan_hurdaya_cikar`: Şirketimizde yeniden işleme uygulanmaz; hatalı ürünler tamir edilmeden doğrudan hurdaya ayrılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Rework İş Emri Türü ve Yeniden İşleme Maliyet Muhasebesini belirler.

#### [QLT-026] Yeniden işlenen (Rework gören) ürünler tamamlandıktan sonra zorunlu olarak Yeniden Kalite Muayenesine (Re-Inspection) tabi tutulmakta mıdır?
- **Süreç:** Yeniden İşleme / Rework
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Rework sonrası yeniden muayene zorunluluğu ve ikinci onay döngüsü.
- **Seçenekler:**
  - `rework_sonrasi_kalite_onayi_alinmadan_urunun_serbest_stoga_gecisi_engellenir`: Evet; tamir edilen parça tekrar kalite muayenesine girer, onay almadan kullanılabilir stoka geçemez
  - `tamiri_yapan_operatorun_onayiyla_dogrudan_ambalaja_veya_sevkiyata_verilir`: Kaliteye tekrar gitmez; tamiri yapan usta 'Oldu' dediğinde doğrudan sevkiyata veya stoka gönderilir
  - `yeniden_muayene_sureci_bulunmamaktadir`: Yeniden muayene süreci bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Rework Sonrası Zorunlu Kalite Onay Kilitlerini belirler.

---

### 14. Hurda ve Şartlı Kabul

#### [QLT-027] Düzeltilemeyecek durumdaki ürünlerin Hurdaya Ayrılması (Scrap / İmha) kararı nasıl verilmekte, hurda yetki limitleri ve hurda onay iş akışı nasıl işletilmektedir?
- **Süreç:** Hurda ve Şartlı Kabul
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Hurda kararı yetki sınırları, imha tutanağı ve hurda onay hiyerarşisi.
- **Seçenekler:**
  - `hurda_tutari_ve_miktarina_gore_sistemden_kalite_ve_fabrika_muduru_onay_is_akisi_vardir`: Evet; hurda nedeni girilir, tutar limitine göre Kalite Müdürü -> Fabrika Müdürü onayıyla hurdaya çıkar
  - `fiziki_hurda_tutanagi_imzalanir_ay_sonunda_muhasebeye_toplu_iletilir`: Sistemik iş akışı yoktur; kağıt tutanak imzalanır, ay sonunda muhasebe stoktan elle düşer
  - `resmi_hurda_onay_sureci_yoktur_operator_veya_usta_hurdaya_atar`: Resmi onay süreci yoktur; usta veya operatör parçayı hurda kasasına atar, kaydı tutulmaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Hurda Onay İş Akışı ve İmha Yetki Limitlerini belirler.

#### [QLT-028] Hurdaya ayrılan hammadde ve ürünlerin maliyeti (Fire/Hurda Gideri) doğrudan ilgili iş emrine, ürün grubuna veya departman masraf merkezine otomatik muhasebeleşmekte midir?
- **Süreç:** Hurda ve Şartlı Kabul
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Hurda maliyet muhasebesi, fire masraf merkezi ve fiili maliyete yansıma.
- **Seçenekler:**
  - `hurda_maliyeti_ilgili_is_emrine_veya_bolum_gider_hesabina_otomatik_yansir`: Evet; hurda fişi kesildiğinde maliyet otomatik olarak o iş emrinin veya birimin fire giderine yazılır
  - `yil_sonlarinda_sayim_farklarina_genel_gider_olarak_yansitilir`: İş emri bazlı ayrışmaz; yıl sonu sayımında çıkan stok eksiği genel şirket fire giderine atılır
  - `hurda_maliyeti_takip_edilememektedir`: Hurda maliyetleri muhasebesel olarak takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Hurda/Fire Masraf Merkezi ve Fiili Üretim Maliyetine Hurda Yansıtma Kuralını belirler.

---

### 15. Kök Neden Analizi

#### [QLT-029] Kritik veya tekrarlayan kalite problemlerinde resmi Kök Neden Analizi metodolojileri (5 Why / 5 Neden, Ishikawa / Balık Kılçığı, 8D Metodolojisi, FMEA) uygulanmakta mıdır?
- **Süreç:** Kök Neden Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kök neden analiz teknikleri (5 Why, Fishbone, 8D, Pareto) ve problem çözme disiplini.
- **Seçenekler:**
  - `sistemde_8d_veya_5_why_sablonlari_ile_resmi_kok_neden_analizi_yapilir_ve_kaydedilir`: Evet; kritik hatalarda 8D veya 5-Why formu açılır, kök neden kökünden tespit edilip doğrulanır
  - `yalnizca_sozlu_toplanti_yapilir_neden_oldugu_konusulur_ancak_sablon_kullanilmaz`: Toplantıda 'Neden oldu?' diye konuşulur fakat standart bir kök neden analiz şablonu tutulmaz
  - `kok_neden_analizi_yapilmamaktadir_sadece_hata_anlik_duzeltilir`: Kök neden analizi yapılmaz; hata o an düzeltilir ve üretime devam edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kök Neden Analizi (8D / 5-Why / Fishbone) Sistem Şablonları Tasarımını belirler.

#### [QLT-030] Benzer kök nedenlerden kaynaklanan tekrarlayan hatalar (İnsan hatası, Kalıp aşınması, Hammadde değişkenliği, Sıcaklık/Ortam şartları) sistem üzerinden kategorize olarak analiz edilebilmekte midir?
- **Süreç:** Kök Neden Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Tekrarlayan kök neden analizi, hata trendleri ve önleyici aksiyon tetikleyicisi.
- **Seçenekler:**
  - `kok_neden_kategorileri_sistemde_siniflandirilir_ve_kronik_problemler_raporlanir`: Evet; hataların kök neden dağılımı (Makine, Metot, Malzeme, İnsan) sistemden grafiklerle analiz edilir
  - `kronik_problemler_tecrubeyle_bilinir_ancak_sistemik_kategori_analizi_yoktur`: Hangi makinenin veya kalıbın sorunlu olduğu bilinir fakat sistemik kök neden raporu üretilemez
  - `kok_neden_kategori_takibi_yapilmamaktadir`: Kök neden kategori takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kök Neden Sınıflandırması ve Kronik Problem Trend Analitiğini belirler.

---

### 16. CAPA / Düzeltici ve Önleyici Faaliyet

#### [QLT-031] Kalite uygunsuzlukları, denetim bulguları ve müşteri şikâyetleri sonrasında sistemde Düzeltici ve Önleyici Faaliyet (CAPA - Corrective and Preventive Action) süreci işletilmekte midir?
- **Süreç:** CAPA / Düzeltici ve Önleyici Faaliyet
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** CAPA yönetimi, düzeltici/önleyici aksiyon planı, sorumlu atama ve termin takibi.
- **Seçenekler:**
  - `sistem_uzerinden_sorumlusu_ve_termin_tarihi_olan_capa_is_akisi_yurutulur`: Evet; CAPA açılır, sorumlu kişiye görev ve termin atanır, aksiyon adımları sistem üzerinden takip edilir
  - `capa_takibi_excel_listesinde_veya_kalite_yonetim_temsilcisinin_dosyasinda_tutulur`: Sistemik CAPA yoktur; Kalite Yöneticisi Excel'de aksiyon listesi tutar ve toplantılarda sorar
  - `capa_sureci_uygulanmamaktadir`: Şirketimizde resmi CAPA (Düzeltici ve Önleyici Faaliyet) süreci uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** CAPA Yönetim Modülü ve Görev/Termin Eskalasyon Akışını belirler.

#### [QLT-032] Açılan CAPA'ların kapanışı öncesinde alınan aksiyonun kalıcı olarak hatayı önlediğini kanıtlayan Etkinlik Doğrulaması (Effectiveness Verification) yapılmakta ve onaylanmakta mıdır?
- **Süreç:** CAPA / Düzeltici ve Önleyici Faaliyet
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `QLT-031 != "capa_sureci_uygulanmamaktadir"`
- **Açıklama:** CAPA etkinlik doğrulaması, izleme süresi ve resmi kapanış onayı.
- **Seçenekler:**
  - `aksiyon_sonrasi_belirli_sure_izleme_yapilir_ve_etkinlik_kanitlanmadan_capa_kapatilamaz`: Evet; 1-3 ay sonra hata tekrarlamadığı doğrulanır, Kalite Müdürü onayıyla CAPA resmi olarak kapatılır
  - `aksiyon_yapildigi_an_etkinlik_beklenmeden_capa_hemen_kapatilir`: Etkinlik takibi yapılmaz; ilgili birim 'Aksiyonu tamamladım' dediği an dosya kapatılır
  - `etkinlik_dogrulamasi_yapilmamaktadir`: Etkinlik doğrulaması yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** CAPA Kapanış Onay Kriterleri ve Etkinlik Doğrulama Döngüsünü belirler.

---

### 17. Ölçüm Cihazı / Kalibrasyon Bağlantısı

#### [QLT-033] Kalite kontrolde kullanılan ölçüm ve test cihazları (Kumpas, Mikrometre, Mastar, Tork Anahtarı, Terazi, Basınç Sensörü vb.) sistemde kimlik ve kalibrasyon geçerlilik tarihleriyle takip edilmekte midir?
- **Süreç:** Ölçüm Cihazı / Kalibrasyon Bağlantısı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Ölçüm aletleri envanteri, kalibrasyon periyotları ve geçerlilik durumu.
- **Seçenekler:**
  - `tum_olcum_cihazlari_seri_no_ve_kalibrasyon_gecerlilik_tarihiyle_sistemde_kayitlidir`: Evet; cihazın kalibrasyon sertifikası, son kalibrasyon tarihi ve gelecek kalibrasyon günü sistemde izlenir
  - `cihazlarin_uzerinde_kalibrasyon_etiketi_vardir_ancak_sistemik_takip_yoktur`: Cihazın üstüne tarihli etiket yapıştırılır fakat ERP sisteminde kayıt ve alarm mekanizması yoktur
  - `olcum_cihazi_kalibrasyon_takibi_yapilmamaktadir`: Ölçüm cihazlarının kalibrasyon takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Ölçüm Cihazları Kalibrasyon Yaşam Döngüsü ve Uygunluk Takibini belirler.

#### [QLT-034] Kalibrasyon süresi dolmuş veya arızalı bir ölçüm cihazı ile kalite kontrol ölçümü yapılması sistem tarafından engellenmekte midir ve ölçümü yapan cihaz kayda bağlanmakta mıdır?
- **Süreç:** Ölçüm Cihazı / Kalibrasyon Bağlantısı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kalibrasyonsuz cihazla ölçüm engeli ve ölçüm aleti izlenebilirliği.
- **Seçenekler:**
  - `olcum_girilirken_kullanilan_cihaz_secilir_ve_suresi_dolmussa_olcum_kilitlenir`: Evet; kontrolör cihazı barkodla okutur, kalibrasyonu geçmiş cihazla test yapılmasına sistem izin vermez
  - `olcumde_hangi_cihazin_kullanildigi_kaydedilmez_sistemik_engel_yoktur`: Test sonucuna cihaz bağlanmaz; kalibrasyon sorumluluğu tamamen ölçümü yapan operatördedir
  - `kalibrasyon_gecerlilik_engeli_bulunmamaktadir`: Kalibrasyon geçerlilik kontrolü veya sistemsel engel bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Ölçüm Sırasında Cihaz Eşleştirme ve Kalibrasyon Kilitleme Kuralını belirler.

---

### 18. Lot / Seri İzlenebilirliği

#### [QLT-035] Yapılan tüm kalite kontrol test sonuçları, ölçüm değerleri ve onay kayıtları ilgili Hammadde Lotu, Üretim Parti/Seri Numarası veya İş Emri ile birebir eşleştirilmekte midir?
- **Süreç:** Lot / Seri İzlenebilirliği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kalite sonuçlarının Lot/Seri/İş Emri ile eşleşmesi ve şecere (Genealogy) izlenebilirliği.
- **Seçenekler:**
  - `tum_test_ve_olcum_sonuclari_lot_seri_ve_is_emri_koduyla_birebir_eslesir_ve_saklanir`: Evet; herhangi bir lot veya seri no sorgulandığında o partinin tüm giriş, proses ve final test verisi dökülür
  - `yalnizca_tarih_ve_urun_kodu_yazilir_spesifik_lot_veya_seriyle_baglantisi_kopuktur`: O gün test yapıldığı bilinir fakat hangi specific lot numarasına ait olduğu kayıtlardan net anlaşılamaz
  - `kalite_sonuclari_lot_veya_seri_bazinda_izlenmemektedir`: Kalite sonuçları lot veya seri bazında izlenmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kalite Sonuçlarının Lot/Seri/İş Emri Şecere İndeksi ile Eşleşmesini belirler.

#### [QLT-036] Piyasadan veya müşteriden gelen bir şikâyet anında, o ürünün geriye dönük hammadde kalite sonuçlarına, üretim ara ölçümlerine ve ölçümü yapan operatöre kadar Denetim İzi (Audit Trail) çıkarılabilmekte midir?
- **Süreç:** Lot / Seri İzlenebilirliği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Geriye dönük kalite denetim izi (Backward Quality Traceability) ve operatör/zaman damgası doğrulaması.
- **Seçenekler:**
  - `saniyeler_icinde_hammadde_giris_testinden_son_sevkiyata_kadar_tam_kalite_secere_raporu_alinir`: Evet; seri no girildiğinde hangi operatörün ne zaman hangi ölçümü yaptığı ve hammadde onayları tek tıkla dökülür
  - `arsiv_klasorleri_ve_excel_dosyalari_manuel_taranarak_gunler_suren_arastirmayla_bulunur`: Otomatik rapor yoktur; kağıt formlar ve Excel dosyaları geriye dönük taranarak zahmetli bir araştırmayla bulunur
  - `geriye_donuk_kalite_izlenebilirligi_saglanamamaktadir`: Geriye dönük kalite izlenebilirliği sağlanamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Uçtan Uca Kalite Denetim İzi (End-to-End Quality Audit Trail) Hızını belirler.

---

### 19. Kalite Dokümanları ve Sertifikalar

#### [QLT-037] Müşterilere sevk edilen ürünler için Analiz Sertifikası (CoA - Certificate of Analysis), Uygunluk Belgesi (CoC - Certificate of Conformance) veya Test Raporu düzenlenmekte midir?
- **Süreç:** Kalite Dokümanları ve Sertifikalar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Analiz sertifikası (CoA/CoC), ürün kalite pasaportu ve müşteri sertifika talepleri.
- **Seçenekler:**
  - `sevkiyat_onaylanan_test_sonuclari_uzerinden_sistemden_otomatik_coa_coc_belgesi_uretir`: Evet; partinin gerçek ölçüm sonuçları çekilerek sistemden barkodlu ve resmi onaylı CoA/CoC üretilir
  - `coa_belgesi_word_veya_excel_sablonunda_manuel_doldurulup_imzalanir`: Sistemik üretim yoktur; kaliteci Word şablonuna değerleri elle yazar, imzalar ve müşteriye mail atar
  - `musteriye_analiz_veya_uygunluk_sertifikasi_verilmemektedir`: Müşterilere analiz sertifikası veya kalite belgesi verilmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Otomatik Analiz Sertifikası (CoA / CoC Generator) Modülünü belirler.

#### [QLT-038] Tedarikçilerden gelen hammadde Analiz Sertifikaları (Tedarikçi CoA) sisteme dijital olarak yüklenmekte ve standart parametrelerle sistemsel olarak karşılaştırılmakta mıdır?
- **Süreç:** Kalite Dokümanları ve Sertifikalar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Gelen tedarikçi sertifikası (Inbound CoA) doğrulaması ve dijital arşivleme.
- **Seçenekler:**
  - `tedarikci_coa_degerleri_sisteme_islenir_ve_spektlere_uygunlugu_otomatik_denetlenir`: Evet; tedarikçinin sertifika değerleri girilir, sistem hammadde spesifikasyonlarına uygunluğu teyit eder
  - `tedarikci_sertifikasi_sadece_pdf_olarak_arsivlenir_deger_kontrolu_manueldir`: PDF olarak taranır veya klasörde tutulur; değerlerin sistemsel bir kontrolü yapılmaz
  - `tedarikci_analiz_sertifikasi_toplanmamakta_veya_incelenmemektedir`: Tedarikçi analiz sertifikası toplanmamakta veya incelenmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Gelen Tedarikçi Analiz Sertifikası (Inbound CoA) Doğrulama Altyapısını belirler.

---

### 20. Kalite Raporlama ve KPI

#### [QLT-039] Şirketinizde İlk Seferde Doğru Oranı (First Pass Yield - FPY), Kalite Red Oranı (PPM) ve Hurda/Fire Oranları düzenli olarak hesaplanıp takip edilmekte midir?
- **Süreç:** Kalite Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Temel kalite üretim metrikleri (FPY, PPM, Scrap Rate, Rework Rate).
- **Seçenekler:**
  - `fpy_ppm_ve_hurda_oranlari_hat_ve_urun_bazinda_sistemden_canli_izlenir`: Evet; ilk seferde doğru çıkma oranı (FPY) ve PPM hata oranları üretimden anlık otomatik hesaplanır
  - `aylik_veya_donemsel_olarak_excel_tablolarinda_manuel_hesaplanir`: Canlı takip yoktur; ay sonlarında hurda ve üretim adetleri Excel'de oranlanarak raporlanır
  - `fpy_veya_ppm_oranlari_hesaplanmamaktadir`: FPY veya PPM gibi kalite performans oranları hesaplanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** İlk Seferde Doğru Oranı (FPY) ve Kalite Metrikleri Motorunu belirler.

#### [QLT-040] Kötü Kalite Maliyeti (Cost of Poor Quality - COPQ — Hurda maliyeti, Rework işçiliği, Müşteri iade zararları, Garanti/Tazminat giderleri) kurumsal olarak ölçülmekte midir?
- **Süreç:** Kalite Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kötü kalite maliyeti (COPQ), iç hata maliyeti, dış hata maliyeti ve önleme maliyetleri.
- **Seçenekler:**
  - `ic_hata_hurda_rework_ve_dis_hata_iade_tazminat_maliyetleri_finansal_olarak_olculur`: Evet; kalitesizlikten kaynaklanan hurda, tamir işçiliği ve müşteri ceza maliyetleri TL/Döviz bazında raporlanır
  - `sadece_fiziksel_hurda_maliyeti_bilinir_rework_veya_musteri_zararlari_hesaplanmaz`: Yalnızca hurdaya çıkan malzeme tutarı bilinir; rework işçiliği veya müşteri tazminatları hesaplanmaz
  - `kotu_kalite_maliyeti_copq_olculmemektedir`: Kötü kalite maliyetleri ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Kötü Kalite Maliyeti (COPQ Analytics) ve Finansal Fire Raporlamasını belirler.

#### [QLT-041] Açık NCR sayısı, geciken CAPA aksiyonları ve ortalama hata kapatma süresini gösteren Canlı Kalite Yönetim Paneli (Quality Dashboard) kullanılmakta mıdır?
- **Süreç:** Kalite Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kalite kokpiti, açık uygunsuzluklar, CAPA yaşlandırma ve operasyonel KPI paneli.
- **Seçenekler:**
  - `canli_kalite_kokpiti_uzerinden_acik_ncr_geciken_capa_ve_kpi_durumu_anlik_izlenir`: Evet; yönetim panelinde bekleyen karantinalar, açık NCR'lar ve geciken aksiyonlar canlı takip edilir
  - `aylik_kalite_gozden_gecirme_toplantisinda_statik_rapor_olarak_sunulur`: Canlı panel yoktur; ayda bir yapılan kalite toplantısında PowerPoint veya Excel olarak sunulur
  - `kalite_performans_paneli_kullanilmamaktadir`: Kalite performans paneli veya düzenli KPI raporlaması bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** Canlı Kalite Yönetim Kokpiti ve CAPA Yaşlandırma Paneli Tasarımını belirler.

#### [QLT-042] ERP/QMS dönüşümü sonrasında hedeflenen Kurumsal Kalite Yönetimi vizyonu ve temel önceliği nedir?
- **Süreç:** Kalite Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), kalite güvence dijitalleşmesi ve entegrasyon hedefleri.
- **Seçenekler:**
  - `tam_entegre_kontrol_planlari_sayisal_tolerans_denetimi_ve_ucluca_ncr_capa_takibi`: Girişten finale tam entegre kontrol planları, tolerans denetimli stok kilitleme ve uçtan uca NCR/CAPA
  - `giris_ve_final_kalite_onaylarinin_sisteme_baglanmasi_ve_kagit_formlarin_kalkmasi`: Giriş ve sevk onaylarının sisteme bağlanması ve sahadaki kağıt kalite formlarının dijitalleşmesi önceliklidir
  - `kalite_maliyetlerinin_ve_hurda_zararlarinin_seffaflasmasi`: Hangi ürün veya operasyonda ne kadar kalitesizlik maliyeti (Hurda/Rework) oluştuğunun şeffaflaşması hedeflenmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/QMS Karar Etkisi:** ERP/QMS Kalite Kontrol İş Paketi Kapsamı ve Proje Yol Haritasını belirler.
