# FAZ-24 — Bakım ve Onarım / MAINTENANCE Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.maintenance.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `MAINTENANCE` (Bakım ve Onarım)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Bakım Onarım Müdürleri, Teknik Hizmetler Yöneticileri, Fabrika Müdürleri, Güvenilirlik Mühendisleri ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli sanayi ve hizmet işletmelerinde ERP/EAM dönüşümü öncesinde bakım organizasyonu ve ekip yapısı, makine/ekipman teknik ana verisi (Marka, Model, Seri No, Garanti, Lokasyon), teknik varlık hiyerarşisi (Tesis -> Hat -> Makine -> Alt Ekipman -> Komponent), kritik ekipman sınıflandırması ve tek nokta arıza (Single Point of Failure) analizi, arıza bildirim kanalları ve duruş süresi (Downtime) başlangıç kaydı, bakım talepleri ve önceliklendirme, bakım iş emirleri (Maintenance Work Order) ve işçilik süreleri, planlı/periyodik bakım takvimleri ve periyotları (Günlük, Haftalık, Aylık, Yıllık), preventif bakım ve otonom bakım (TPM), kestirimci bakım (PdM / Durum İzleme) ve IoT sensör verisi kullanımı, sayaç ve çalışma saati bazlı dinamik bakım tetikleme, standart bakım kontrol listeleri (Checklist) ve görev adımları, bakım personeli yetkinliği ve İSG / LOTO (Enerji Kesme-Kilitleme) güvenlik prosedürleri, dış servis ve taşeron bakım sözleşmeleri (SLA), bakım iş emrinde yedek parça tüketimi ve kritik yedek parça emniyet stoğu, arıza kök neden kodları ve plansız duruş analizi, ekipman bazında bakım maliyet muhasebesi (İşçilik + Parça + Dış Servis), ölçüm cihazları ve ekipman kalibrasyon yaşam döngüsü takibi, ekipman bakım geçmişi (Karnesi) ve teknik doküman arşivi, MTBF (Arızalar Arası Ortalama Süre), MTTR (Ortalama Onarım Süresi), Ekipman Kullanılabilirliği (Availability / OEE) ve Planlı Bakım Uyum Oranı (PM Compliance) süreçlerinin AS-IS durumunu ve ERP/EAM gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | MAINTENANCE ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **QUALITY** | Kalite muayenesi, numune alma (AQL), boyutsal toleranslar, NCR, CAPA, test anında cihaz geçerlilik kontrolü | **QUALITY muayene testlerini ve ürün uygunsuzluğunu sorgular.** MAINTENANCE ekipman ve ölçüm cihazlarının periyodik bakım/kalibrasyon takvimini, teknik yaşam döngüsünü ve arıza onarımlarını sorgular. *(0 Kalite muayene / NCR / CAPA sorusu)*. |
| **INVENTORY** | Genel stok seviyeleri, depo sayımları, lot/seri takibi, envanter değerlemesi | **INVENTORY ambar bakiyesini ve stok hareketini sorgular.** MAINTENANCE bakım iş emrinde hangi yedek parçanın tüketildiğini ve kritik parça stok ihtiyacını sorgular. |
| **WAREHOUSE** | Depo adresleme, mal kabul, putaway, iç transferler | **WAREHOUSE fiziksel depo hareketlerini sorgular.** MAINTENANCE atölye ve bakım sahasında ekipman onarımını ve teknisyen müdahalesini sorgular. |
| **PROCUREMENT & SUPPLIER_MANAGEMENT** | Satın alma siparişleri, tedarikçi onayları, tedarikçi değerlendirme karnesi (Scorecard) | **PROCUREMENT/SUPPLIER satın alma ve tedarikçi performansını sorgular.** MAINTENANCE dış servis sağlayıcıların bakım müdahale sürelerini (SLA) ve servis sözleşmelerini sorgular. |
| **MAINTENANCE** | Ekipman ana verisi, varlık hiyerarşisi, kritik makineler, arıza bildirimi, bakım iş emri, planlı/preventif bakım, sayaçlar, kontrol listeleri, yedek parça sarfı, kök nedenler, bakım maliyetleri, kalibrasyon periyotları, ekipman karnesi ve MTBF/MTTR/Availability KPI'ları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular teknik ekipman yönetimi, arıza-bakım iş emirleri, duruş analizi ve kalibrasyon yaşam döngüsü odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (20 Kanonik Süreç / 42 Soru)

1. **Bakım Organizasyonu** (2 Soru — MNT-001, MNT-002)
2. **Makine / Ekipman Ana Verisi** (2 Soru — MNT-003, MNT-004)
3. **Teknik Varlık Hiyerarşisi** (2 Soru — MNT-005, MNT-006)
4. **Kritik Ekipman Yönetimi** (2 Soru — MNT-007, MNT-008)
5. **Arıza Bildirimi** (2 Soru — MNT-009, MNT-010)
6. **Bakım Talebi** (2 Soru — MNT-011, MNT-012)
7. **Bakım İş Emri** (2 Soru — MNT-013, MNT-014)
8. **Planlı / Periyodik Bakım** (2 Soru — MNT-015, MNT-016)
9. **Preventif Bakım** (2 Soru — MNT-017, MNT-018)
10. **Kestirimci Bakım Kullanımı** (2 Soru — MNT-019, MNT-020)
11. **Sayaç / Çalışma Saati Bazlı Bakım** (2 Soru — MNT-021, MNT-022)
12. **Bakım Kontrol Listeleri** (2 Soru — MNT-023, MNT-024)
13. **Bakım Personeli ve Yetkinlik** (2 Soru — MNT-025, MNT-026)
14. **Dış Servis Yönetimi** (2 Soru — MNT-027, MNT-028)
15. **Yedek Parça Kullanımı** (2 Soru — MNT-029, MNT-030)
16. **Arıza Nedeni ve Duruş Analizi** (2 Soru — MNT-031, MNT-032)
17. **Bakım Maliyeti** (2 Soru — MNT-033, MNT-034)
18. **Kalibrasyon Yönetimi** (2 Soru — MNT-035, MNT-036)
19. **Bakım Dokümanları ve Teknik Kayıtlar** (2 Soru — MNT-037, MNT-038)
20. **Bakım Raporlama ve KPI** (4 Soru — MNT-039, MNT-040, MNT-041, MNT-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Bakım Organizasyonu

#### [MNT-001] Şirketinizde fabrika makineleri, üretim hatları, yardımcı tesisler (Kompresör, Trafo, Chiller vb.) ve bina bakım faaliyetleri hangi organizasyonel yapıda ve ekip sorumluluğunda yürütülmektedir?
- **Süreç:** Bakım Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bakım departmanı yapısı, mekanik/elektrik/otomasyon uzmanlıkları ve yönetim modeli.
- **Seçenekler:**
  - `ayri_ve_uzmanlasmis_bakim_onarim_mudurlugu_mekanik_elektrik_otomasyon_tarafindan_yonetilir`: Üretimden bağımsız ayrı bir Bakım Onarım Departmanı (Mekanik, Elektrik ve Otomasyon ekipleriyle) tarafından yönetilir
  - `uretim_operatorleri_ve_ustalar_arizaya_kendileri_mudahele_eder_ayri_ekip_yoktur`: Ayrı bir bakım ekibi yoktur; üretimi yapan operatör veya ustalar arızaları kendi imkânlarıyla çözer
  - `sadece_1_2_teknisyen_vardir_buyuk_islerde_tamamen_dis_servise_bagimlidir`: Küçük bir iç teknik personel vardır fakat büyük arıza ve bakımlarda tamamen dış yetkili servislere bağımlıdır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım Departmanı Organizasyonel Rolleri ve İş Gücü Kapasitesini belirler.

#### [MNT-002] Bakım ekibinin vardiya düzeni (7/24 vardiyalı destek, nöbetçi teknisyen, tek vardiya) ve arızaya anlık müdahale yetki sınırları nasıl organize edilmiştir?
- **Süreç:** Bakım Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Vardiya bakım kapsamı, nöbetçilik düzeni ve müdahale hızı.
- **Seçenekler:**
  - `uretim_vardiyalariyla_tam_uyumlu_7_24_bakim_ekibi_ve_nobet_sistemi_vardir`: Evet; tüm üretim vardiyalarında hazır bakım personeli ve gece/hafta sonu nöbetçi teknisyen sistemi çalışır
  - `yalnizca_gunduz_tek_vardiya_calisilir_diger_vardiyalarda_ariza_olunca_telefonla_cagrilir`: Bakım yalnız gündüz tek vardiyadır; diğer vardiyalarda acil duruş olunca teknisyen evden telefonla çağrılır
  - `vardiyali_bakim_veya_nobet_duzeni_bulunmamaktadir`: Vardiyalı bakım desteği veya nöbet düzeni bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Vardiyalı Bakım Çizelgelemesi ve Müdahale SLA Kurgusunu belirler.

---

### 2. Makine / Ekipman Ana Verisi

#### [MNT-003] Fabrikadaki tüm makine, tezgâh, hat, yardımcı tesis ve ölçüm ekipmanları ERP/EAM sisteminde benzersiz bir Ekipman Kodu ve teknik kimlik kartıyla kayıt altında mıdır?
- **Süreç:** Makine / Ekipman Ana Verisi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Ekipman ana veri kartı (Marka, Model, Seri No, İmal Yılı, Kurulum Tarihi, Lokasyon, Kapasite).
- **Seçenekler:**
  - `tum_ekipmanlar_barkodlu_benzersiz_kod_marka_model_ve_teknik_parametrelerle_sistemde_tanimlidir`: Evet; her makinenin sistemde kodu, seri numarası, marka/modeli, kurulum tarihi ve fiziksel konumu tanımlıdır
  - `ekipman_listesi_excel_tablosunda_veya_amortisman_defterinde_tutulur_sistemde_yoktur`: Sistemik ekipman kartı yoktur; Excel listesinde veya muhasebenin sabit kıymet defterinde isim olarak tutulur
  - `resmi_bir_ekipman_envanteri_veya_kodlamasi_bulunmamaktadir`: Makineler için standart bir kodlama veya güncel teknik envanter kaydı bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Ekipman Ana Veri Modeli ve Varlık Sicil Kartı Yapısını belirler.

#### [MNT-004] Ekipman ana kartlarında üretici garantisi bitiş tarihi, montaj/devreye alma tarihi ve tedarikçi servis irtibat bilgileri kayıt altında mıdır?
- **Süreç:** Makine / Ekipman Ana Verisi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Garanti takibi, devreye alma tarihi ve yetkili satıcı/servis irtibatları.
- **Seçenekler:**
  - `garanti_sureleri_devreye_alma_tarihi_ve_servis_iletisim_bilgileri_sistemde_kayitlidir`: Evet; ekipman kartında garanti başlangıç/bitiş günleri ve yetkili servis sözleşme irtibatları tam izlenir
  - `garanti_ve_servis_bilgileri_klasorlerdeki_sozlesmelerde_aranarak_bulunur`: Sistemde izlenmez; garanti durumu gerektiğinde arşivdeki kağıt faturaya veya servis sözleşmesine bakılarak bulunur
  - `garanti_ve_servis_irtibat_takibi_yapilamamaktadir`: Garanti süresi veya servis irtibat takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Ekipman Garanti Takibi ve Tedarikçi Servis İrtibat Yönetimini belirler.

---

### 3. Teknik Varlık Hiyerarşisi

#### [MNT-005] Fabrikanızda Teknik Varlık Hiyerarşisi (Tesis / Fabrika → Üretim Hattı / Bölüm → Ana Makine → Alt Ekipman → Motor / Pompa / Komponent) yapısı kullanılmakta mıdır?
- **Süreç:** Teknik Varlık Hiyerarşisi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Varlık ağacı (Asset Hierarchy / Functional Location), üst-alt ekipman ilişkisi.
- **Seçenekler:**
  - `cok_seviyeli_fonksiyonel_lokasyon_ve_alt_ekipman_agac_yapisi_sistemde_kullanilir`: Evet; Fabrika -> Hat -> Makine -> Alt Bileşen (Örn. Hidrolik Ünite, Motor) ağaç hiyerarşisiyle tanımlıdır
  - `yalnizca_ana_makineler_tek_seviyede_tutulur_alt_ekipman_ayrimi_yoktur`: Hiyerarşi sığdır; sadece ana makineler listelenir, altındaki motor veya üniteler ayrı takip edilmez
  - `hiyerarsi_kullanilmamaktadir_sadece_tekil_makine_listesi_vardir`: Teknik varlık hiyerarşisi kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Fonksiyonel Lokasyon Ağacı ve Çok Seviyeli Ekipman Hiyerarşisi Tasarımını belirler.

#### [MNT-006] Makinelerden sökülüp takılabilen veya revizyona gönderilen kritik alt komponentlerin (Spindle, Servo Motor, Pompa, Redüktör) parça geçmişi ve konum değişimleri izlenebilmekte midir?
- **Süreç:** Teknik Varlık Hiyerarşisi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MNT-005 != "hiyerarsi_kullanilmamaktadir_sadece_tekil_makine_listesi_vardir"`
- **Açıklama:** Dönebilen varlıklar (Rotable Assets / Interchangeable Components) ve alt ekipman geçmişi.
- **Seçenekler:**
  - `alt_komponentlerin_hangi_makineden_sokulup_hangisine_takildigi_ve_tamir_gecmisi_izlenir`: Evet; motor veya spindle söküldüğünde revizyona alınır ve hangi makineye takılırsa geçmişi oraya taşınır
  - `parca_degisimi_yapilir_ancak_alt_komponent_seri_no_bazinda_tarihce_tutulmaz`: Parça değiştirilir fakat motorun seri numarası bazında hangi makineden geldiği kayıtlara geçmez
  - `alt_komponent_gecmisi_takip_edilememektedir`: Alt komponent veya rotable varlık takibi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Dönebilen Varlıklar (Rotable Assets) ve Komponent Bazlı Şecere Takibini belirler.

---

### 4. Kritik Ekipman Yönetimi

#### [MNT-007] Fabrikadaki ekipmanlar arızalandığında tüm üretimi durdurma riski (Single Point of Failure / Darboğaz Makine), İSG veya çevre riski oluşturma derecesine göre Kritiklik Seviyelerine (A-B-C / Kritik, Önemli, Standart) ayrılmış mıdır?
- **Süreç:** Kritik Ekipman Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Ekipman kritiklik analizi, darboğaz makineler ve bakım önceliklendirme matrisi.
- **Seçenekler:**
  - `tum_ekipmanlar_uretim_ve_isg_etkisine_gore_a_b_c_kritiklik_sinifina_ayrilmistir`: Evet; A-Kritik (darboğaz), B-Önemli ve C-Standart olarak sınıflandırılmıştır; arızada A sınıfına öncelik verilir
  - `kritik_makineler_ustalarin_kafasinda_bilinir_ancak_sistemik_siniflandirma_yoktur`: Hangi makinenin kritik olduğu tecrübeyle bilinir fakat sistemde resmi bir kritiklik puanı veya ayrımı yoktur
  - `ekipman_kritiklik_analizi_yapilmamistir`: Ekipman kritiklik analizi veya sınıflandırması yapılmamıştır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Ekipman Kritiklik Matrisi (Criticality Matrix / ABC Sınıflandırması) Kurallarını belirler.

#### [MNT-008] A sınıfı kritik makineler için arıza durumunda üretimin devamını sağlayacak Yedek Makine / Alternatif Hat / Baypas Senaryoları tanımlı mıdır?
- **Süreç:** Kritik Ekipman Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kritik ekipman yedekliliği (Redundancy), alternatif hatlar ve acil durum planları.
- **Seçenekler:**
  - `kritik_ekipmanlarin_yedegi_veya_is_emrini_kaydirabilecegimiz_onayli_alternatif_rotalar_vardir`: Evet; kritik tezgâh durduğunda iş emrinin yönlendirileceği alternatif tezgâh ve kalıp eşleşmesi hazırdır
  - `bazi_makinelerin_alternatifi_yoktur_ariza_aninda_tum_fabrika_veya_hat_durur`: Darboğaz makinelerin alternatifi yoktur; arıza çıktığında o makine tamir edilene kadar tüm hat durur
  - `yedek_veya_alternatif_ekipman_analizi_yapilmamistir`: Yedek makine veya baypas senaryosu analizi yapılmamıştır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Kritik Ekipman Baypas Senaryoları ve Üretim Acil Eylem Entegrasyonunu belirler.

---

### 5. Arıza Bildirimi

#### [MNT-009] Üretim sahasında bir makine arızalandığında operatör arıza bildirimini hangi yöntemle (Sistem Ekranı / Barkod / Kiosk, Telsiz, Telefon, WhatsApp, Kağıt Form, Sözlü) yapmaktadır ve arıza başlangıç zamanı nasıl kaydedilmektedir?
- **Süreç:** Arıza Bildirimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Arıza bildirim kanalları, operatör arıza çağrısı ve duruş süresi başlangıç saatinin tespiti.
- **Seçenekler:**
  - `operator_hat_basindaki_terminal_veya_tabletten_ariza_cagrisi_acar_baslangic_saati_aninda_kaydolur`: Evet; operatör ekrandan arıza bildirimi açtığı an arıza saati başlar, bakım ekibine otomatik bildirim düşer
  - `telefon_whatsapp_veya_telsiz_ile_bakimciya_haber_verilir_ariza_saati_tahmini_yazilir`: Telefon veya WhatsApp ile haber verilir; arıza saati form doldurulurken tahmini olarak yazılır
  - `ariza_saati_kaydedilmez_bakimci_gelip_tamir_eder_kayit_tutulmaz`: Arıza başlangıç saati kaydedilmez; bakımcı çağrılır, tamir bittikten sonra sözlü kapatılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Sahadan Dijital Arıza Çağrısı (Andon / Kiosk Arıza Girişi) Altyapısını belirler.

#### [MNT-010] Arıza bildirimi yapılırken makinenin tamamen durup durmadığı (Tam Duruş / Hız Düşüşü / Kalite Problemi Oluşturan Arıza) ve arıza belirtileri sisteme seçilebilmekte midir?
- **Süreç:** Arıza Bildirimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Arıza ciddiyet derecesi (Severity), hat durduran arıza vs minör arıza ayrımı.
- **Seçenekler:**
  - `arizanin_uretimi_tam_durdurup_durdurmadigi_ve_oncelik_seviyesi_bildirimde_zorunlu_secilir`: Evet; bildirimde 'Makine Tamamen Durdu' veya 'Duruş Yok / Minör Kusur' seçilerek bakım önceliği belirlenir
  - `sadece_ariza_var_denir_durus_durumu_ve_oncelik_bakimci_sahaya_gelince_anlasilir`: Ayrıntı girilmez; bakım teknisyeni makinenin başına geldiğinde durumun vahametini anlar
  - `ariza_ciddiyet_derecesi_takip_edilmemektedir`: Arıza ciddiyet derecesi veya öncelik takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Arıza Ciddiyet Sınıflandırması ve Otomatik Önceliklendirme Algoritmasını belirler.

---

### 6. Bakım Talebi

#### [MNT-011] Fabrikada arıza dışındaki bakım ihtiyaçları (İyileştirme, Modifikasyon, Yağ Değişimi, Güvenlik Önlemi vb.) için personelin Bakım Talebi (Maintenance Request) açabildiği bir onay ve yönetim süreci var mıdır?
- **Süreç:** Bakım Talebi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bakım talepleri (Maintenance Notification/Request) ve talep havuzu yönetimi.
- **Seçenekler:**
  - `tum_calisanlar_sistemden_bakim_veya_iyilestirme_talebi_acabilir_yonetici_onayindan_gecer`: Evet; sistemde bakım talebi açılır, Bakım Yöneticisi talebi onaylayarak bakım iş emrine dönüştürür
  - `talepler_eposta_veya_toplantilarda_dile_getirilir_sistemik_talep_havuzu_yoktur`: Sistemik talep ekranı yoktur; istekler e-posta ile veya haftalık üretim toplantılarında söylenir
  - `ariza_disinda_bakim_talebi_sureci_bulunmamaktadir`: Arıza dışında planlı bakım talebi veya iyileştirme açma süreci bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım Talep Havuzu ve Talep Onay İş Akışını belirler.

#### [MNT-012] Açılan bakım talepleri öncelik puanına, işin aciliyetine ve makine planına göre planlanmış bir Bakım İş Emrine (Work Order) nasıl dönüştürülmektedir?
- **Süreç:** Bakım Talebi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Bakım talebinden iş emrine dönüşüm iş akışı ve planlama kuyruğu.
- **Seçenekler:**
  - `bakim_yoneticisi_talepleri_inceleyip_tek_tikla_is_emrine_cevirir_ve_teknisyene_atar`: Evet; onaylanan talep sistemde tek tıkla iş emri olur, termin ve sorumlu teknisyen belirlenir
  - `talepler_excel_listesinde_bekletilir_vakit_oldukca_bakimcilar_yonlendirilir`: Otomatik dönüşüm yoktur; talepler Excel'de toplanır, bakım ekibinin boş vaktine göre iş atanır
  - `talep_is_emri_donusum_sureci_bulunmamaktadir`: Talep - iş emri dönüşüm süreci bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım Talebinden İş Emrine Dönüşüm ve Kuyruk Yönetimini belirler.

---

### 7. Bakım İş Emri

#### [MNT-013] Hem arızi hem planlı bakımlar için sistem üzerinden resmi Bakım İş Emri (Maintenance Work Order / MWO) açılmakta ve durumu (Açık, Devam Ediyor, Malzeme Bekliyor, Tamamlandı, Onaylandı) izlenmekte midir?
- **Süreç:** Bakım İş Emri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Bakım iş emri yaşam döngüsü, numara takibi ve durum yönetimi.
- **Seçenekler:**
  - `tum_bakim_ve_onarımlar_sistemden_numarali_bakim_is_emri_ile_acilir_ve_statuyle_izlenir`: Evet; her müdahale için MWO numarası oluşur; başlama, bitiş, parça ve işçilik iş emrine kaydedilir
  - `bakim_is_emirleri_kağıt_form_uzerinde_veya_kara_kapli_defterde_takip_edilir`: Sistemde iş emri açılmaz; bakım atölyesindeki kağıt bakım formlarına veya deftere elle yazılır
  - `bakim_is_emri_kullanilmamaktadir`: Şirketimizde resmi bakım iş emri kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım İş Emri (Maintenance Work Order) Çekirdek Veri Modeli ve Yaşam Döngüsünü belirler.

#### [MNT-014] Bakım iş emri üzerinde müdahaleyi yapan teknisyenin fiili çalışma süresi (Adam-Saat / İşçilik Süresi) ve müdahale başlangıç/bitiş saatleri kaydedilmekte midir?
- **Süreç:** Bakım İş Emri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Bakım işçilik süresi kaydı, teknisyen zaman takibi ve onarım eforu.
- **Seçenekler:**
  - `teknisyen_barkod_okutarak_ise_baslar_ve_bitirir_fiili_iscilik_dakika_olarak_hesaplanir`: Evet; teknisyen iş emrine giriş-çıkış yapar, harcanan fiili işçilik adam-saat olarak net hesaplanır
  - `is_bittikten_sonra_toplam_harcanan_sure_tahmini_olarak_yazilir`: Zaman saati tutulmaz; iş bittiğinde forma '2 saat sürdü' gibi tahmini bir işçilik süresi yazılır
  - `bakim_iscilik_suresi_kaydedilmemektedir`: Bakım işçilik süresi veya teknisyen zaman kaydı tutulmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım Adam-Saat İşçilik Puantajı ve Maliyet Dağıtımını belirler.

---

### 8. Planlı / Periyodik Bakım

#### [MNT-015] Makineler ve tesisler için belirli periyotlarda (Günlük, Haftalık, Aylık, 3 Aylık, Yıllık) yapılması gereken Planlı / Periyodik Bakım Takvimi sistemde tanımlı mıdır?
- **Süreç:** Planlı / Periyodik Bakım
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Planlı periyodik bakım planları, bakım periyotları ve otomatik bakım planlama.
- **Seçenekler:**
  - `tum_makineler_icin_periyotlari_ve_gorevleri_olan_dinamik_planli_bakim_takvimi_vardir`: Evet; periyot günü geldiğinde sistem otomatik olarak planlı bakım iş emirlerini üretir ve uyarır
  - `periyodik_bakimlar_excel_tablosunda_takip_edilir_zaman_gelince_manuel_is_yapilir`: Takvim Excel'dedir; bakım şefi her pazartesi Excel'e bakarak hangi makinenin bakımı olduğunu ekibe söyler
  - `planli_periyodik_bakim_yapilmamaktadir_yalniz_ariza_olunca_bakilir`: Planlı periyodik bakım yapılmamaktadır; yalnızca makine bozulduğunda tamire gidilir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Periyodik Bakım Planlama Motoru (Preventive Maintenance Scheduler) Tasarımını belirler.

#### [MNT-016] Planlı bakım yapılacağı zaman, ilgili makinenin üretim planlama sisteminde otomatik olarak 'Kapasite Dışı / Bakımda' olarak bloke edilmesi sağlanmakta mıdır?
- **Süreç:** Planlı / Periyodik Bakım
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MNT-015 != "planli_periyodik_bakim_yapilmamaktadir_yalniz_ariza_olunca_bakilir"`
- **Açıklama:** Bakım - Üretim Planlama entegrasyonu, makine kapasite kısıtı ve duruş planı.
- **Seçenekler:**
  - `planli_bakim_saatlerinde_makine_uretim_cizelgelemesinde_otomatik_kapasite_disi_gorunur`: Evet; bakım saatlerinde üretim planlama makineye iş emri atayamaz, kapasite otomatik düşer
  - `bakim_ve_uretim_sozlu_anlasir_sistemik_kapasite_blokaji_yoktur`: Entegrasyon yoktur; bakımcı üretim müdürüne 'Yarın sabah bu makineyi durduracağım' der, sözlü planlanır
  - `planli_bakimda_makine_kapasite_entegrasyonu_bulunmamaktadir`: Planlı bakımda makine kapasite entegrasyonu bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım Duruşu ile Üretim Kapasite Çizelgeleme Entegrasyonunu belirler.

---

### 9. Preventif Bakım

#### [MNT-017] Arızalar oluşmadan önce parça aşınması, yağlama, filtre temizliği ve keçe kontrollerini içeren Önleyici / Preventif Bakım stratejileri uygulanmakta mıdır?
- **Süreç:** Preventif Bakım
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Preventif bakım stratejisi, arıza öncesi müdahale ve TPM (Toplam Verimli Bakım) yaklaşımı.
- **Seçenekler:**
  - `ekipman_omru_ve_asinma_kriterlerine_gore_resmi_preventif_bakim_rutinleri_isletilir`: Evet; kritik parçalar arızalanması beklenmeden ömür ve aşınma sınırına göre önceden yenilenir
  - `sadece_gozle_kontrol_ve_basit_yaglama_yapilir_parca_bozulana_kadar_degistirilmez`: Yalnızca basit yağlama yapılır; pahalı parçalar tamamen bozulup durana kadar değiştirilmez
  - `preventif_bakim_uygulanmamaktadir_reaktif_calisilir`: Preventif bakım uygulanmaz; tamamen arıza odaklı (Reaktif) çalışılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Preventif Bakım Rutinleri ve Parça Ömür Takip Kurgusunu belirler.

#### [MNT-018] Üretim operatörlerinin her vardiya başında yaptığı temizlik, yağlama, sıkma ve görsel kontrolleri içeren Otonom Bakım (TPM 1. Seviye / Autonomous Maintenance) uygulanmakta mıdır?
- **Süreç:** Preventif Bakım
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Otonom bakım (Autonomous Maintenance), operatör kontrol listeleri ve TPM 1. Seviye.
- **Seçenekler:**
  - `operatorler_vardiya_basinda_tablet_veya_formla_otonom_bakim_adimlari_tamamlayip_onaylar`: Evet; operatör vardiya başlangıcında 5-10 dakikalık standart kontrol ve yağlama adımlarını sisteme işler
  - `operatorler_makineyi_temizler_ancak_resmi_otonom_bakim_kaydi_tutulmaz`: Operatör kaba temizlik yapar fakat standart bir otonom bakım listesi veya sistemik onay yoktur
  - `otonom_bakim_sureci_bulunmamaktadir`: Otonom bakım süreci bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Otonom Bakım (TPM 1. Seviye) Operatör Arayüzü İhtiyacını belirler.

---

### 10. Kestirimci Bakım Kullanımı

#### [MNT-019] Makinelerdeki titreşim (Vibrasyon Analizi), çalışma sıcaklığı (Termal Kamera), yağ analizi, motor akımı veya ultrasonik ses ölçümleri ile Kestirimci Bakım / Durum İzleme (Condition Monitoring / Predictive Maintenance) yapılmakta mıdır?
- **Süreç:** Kestirimci Bakım Kullanımı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kestirimci bakım (PdM), vibrasyon, termografi, yağ kirlilik analizi ve durum izleme.
- **Seçenekler:**
  - `kritik_ekipmanlarda_titresim_isi_veya_yag_analiziyle_durum_izleme_ve_kestirimci_bakim_yapilir`: Evet; titreşim ve sıcaklık trendleri periyodik ölçülür, eşik değer aşıldığında arıza çıkmadan bakım açılır
  - `yalnizca_yilda_bir_harici_firmaya_termal_kamera_veya_trafo_yag_analizi_yaptirilir`: Rutin takip yoktur; yılda bir kere harici taşeron firma gelip elektrik panolarına termal kamerayla bakar
  - `kestirimci_bakim_veya_durum_izleme_kullanilmamaktadir`: Kestirimci bakım veya durum izleme yöntemleri kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Durum İzleme (Condition-Based Maintenance) ve Kestirimci Bakım Altyapısını belirler.

#### [MNT-020] Makinelerden veya IoT sensörlerinden (SCADA / PLC / IoT Ağ Geçidi) anlık toplanan telemetri verilerine göre sistemde otomatik Bakım Uyarısı veya Bakım İş Emri tetiklenebilmekte midir?
- **Süreç:** Kestirimci Bakım Kullanımı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `MNT-019 != "kestirimci_bakim_veya_durum_izleme_kullanilmamaktadir"`
- **Açıklama:** IoT / SCADA entegrasyonu, otomatik arıza eşiği alarmları ve kestirimci iş emri tetikleme.
- **Seçenekler:**
  - `scada_iot_sensorunden_esik_asildiginda_erp_eam_sisteminde_otomatik_bakim_isemri_acilir`: Evet; motor sıcaklığı veya titreşim limiti aşıldığında SCADA'dan ERP'ye sinyal gider ve acil iş emri açılır
  - `sensor_verisi_scada_ekraninda_gorulur_ancak_erp_ye_bagli_degildir_insan_bakip_is_acar`: Sensör vardır fakat ERP'ye bağlı değildir; teknisyen SCADA ekranında kırmızıyı görünce elle iş açar
  - `otomatik_iot_bakim_tetikleme_bulunmamaktadir`: Otomatik sensör/IoT bakım tetikleme altyapısı bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** IoT / SCADA Entegrasyonu ve Otomatik Eşik Değer İş Emri Tetikleme Kurallarını belirler.

---

### 11. Sayaç / Çalışma Saati Bazlı Bakım

#### [MNT-021] Makinelerin ve ekipmanların Çalışma Saati, Üretim Vuruş / Çevrim Adedi, Kilometre veya Tüketim Sayaçları sistemde takip edilmekte ve bakımlar bu sayaç değerlerine göre tetiklenmekte midir?
- **Süreç:** Sayaç / Çalışma Saati Bazlı Bakım
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Sayaç bazlı bakım (Meter-based Maintenance / Runtime Maintenance), çalışma saati ve çevrim takibi.
- **Seçenekler:**
  - `ekipman_calisma_saati_veya_vurus_sayisi_sistemde_tutulur_orn_her_1000_saatte_bir_bakim_acilir`: Evet; takvimden bağımsız olarak makine 500 saat veya 100.000 vuruşa ulaştığında sistem otomatik bakım açar
  - `calisma_saati_makine_uzerindeki_gostergeden_manuel_okunur_sistemik_tetikleme_yoktur`: Sayaç makinede vardır; bakımcı ayda bir panodan saate bakar ve bakım gerekip gerekmediğine karar verir
  - `sayac_veya_calisma_saati_takibi_yapilmamaktadir`: Sayaç veya çalışma saati takibi yapılmamaktadır; sadece takvim gününe bakılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Sayaç / Çalışma Saati Bazlı Dinamik Bakım Tetikleme Motorunu belirler.

#### [MNT-022] Makine sayacı arızalandığında, sıfırlandığında (Reset) veya yeni sayaç takıldığında Sayaç Değişim Geçmişi ve kümülatif çalışma ömrü sistemde doğru korunabilmekte midir?
- **Süreç:** Sayaç / Çalışma Saati Bazlı Bakım
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `MNT-021 != "sayac_veya_calisma_saati_takibi_yapilmamaktadir"`
- **Açıklama:** Sayaç değişim yönetimi (Meter Replacement/Rollover) ve kümülatif çalışma saati bütünlüğü.
- **Seçenekler:**
  - `sayac_degisiminde_eski_ve_yeni_deger_kaydedilir_kumulatif_omur_otomatik_hesaplanir`: Evet; sayaç sıfırlansa veya değişse bile sistem toplam makine ömrünü kümülatif olarak korur
  - `sayac_sifirlandiginda_gecmis_karisir_elle_not_tutulur`: Sistemik sayaç değişimi yönetilemez; sayaç bozulunca eski çalışma saati kaybolur veya elle not alınır
  - `sayac_degisim_gecmisi_takip_edilememektedir`: Sayaç değişim geçmişi takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Sayaç Değişim ve Sıfırlama Yönetimi (Meter Rollover Logic) Tasarımını belirler.

---

### 12. Bakım Kontrol Listeleri

#### [MNT-023] Bakım teknisyenlerinin bakım sırasında adım adım uygulayacağı Standart Bakım Kontrol Listeleri (Maintenance Checklists — Örn. Yağ seviyesi kontrolü, Basınç testi, Kayış gerginliği, Filtre temizliği) sistemde tanımlı mıdır?
- **Süreç:** Bakım Kontrol Listeleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Standart bakım adımları, kontrol listeleri (Checklist), operasyon talimatları ve test protokolleri.
- **Seçenekler:**
  - `her_makine_ve_bakim_tipi_icin_sistemde_standart_kontrol_listesi_maddeleri_tanimlidir`: Evet; bakım iş emri açıldığında teknisyenin ekranına kontrol listesi maddeleri sırayla gelir ve onaylanır
  - `kontrol_listeleri_makine_basindaki_laminasyonlu_kagitlarda_yazilidir`: Sistemik liste yoktur; makinenin panosuna asılı kağıt listedeki maddelere bakılarak bakım yapılır
  - `standart_bir_bakim_kontrol_listesi_bulunmamaktadir`: Standart bir kontrol listesi yoktur; teknisyen kendi tecrübesine göre gereken yerlere bakar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Standart Bakım Görev Listeleri ve Dijital Checklist Veri Modelini belirler.

#### [MNT-024] Bakım kontrol listesindeki zorunlu maddeler (Örn. Güvenlik sensörü testi, Yağ basınç ölçümü) tamamlanıp onaylanmadan bakım iş emrinin kapatılması sistem tarafından engellenmekte midir?
- **Süreç:** Bakım Kontrol Listeleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Zorunlu kontrol listesi onay kısıtı ve eksik bakım adımlarının engellenmesi.
- **Seçenekler:**
  - `zorunlu_checklist_maddeleri_tek_tek_onaylanmadan_is_emri_kapatilamaz`: Evet; tüm maddeler (Uygun / Uygun Değil / Ölçülen Değer) girilmeden sistem iş emrinin kapanmasına izin vermez
  - `maddeler_doldurulmasa_da_teknisyen_direkt_tamamlandi_secip_kapatabilir`: Sistemik kilit yoktur; teknisyen maddeleri tek tek işaretlemeden de iş emrini 'Tamamlandı' yapabilir
  - `checklist_kapatma_engeli_bulunmamaktadir`: Kontrol listesi tamamlama engeli bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Kontrol Listesi Adımları Tamamlanmadan Kapanış Engeli Kurallarını belirler.

---

### 13. Bakım Personeli ve Yetkinlik

#### [MNT-025] Bakım personelinin uzmanlık alanları (Mekanik, Elektrik, Elektronik, PLC/Otomasyon, Hidrolik/Pnömatik, Kaynakçılık) ve yasal yetki belgeleri (Yüksekte Çalışma, EKAT Yüksek Gerilim vb.) sistemde kayıtlı mıdır ve iş atamaları bu yetkinliklere göre mi yapılmaktadır?
- **Süreç:** Bakım Personeli ve Yetkinlik
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Bakım personel yetkinlik matrisi (Skills Matrix), sertifikalar ve yetkili iş atama.
- **Seçenekler:**
  - `teknisyen_yetkinlikleri_ve_sertifikalari_sistemdedir_isler_yetkin_personele_otomatik_veya_manuel_atanir`: Evet; yüksek gerilim veya PLC işi açıldığında sistem sadece o sertifikaya sahip yetkili personele atama yapar
  - `yetkinlikler_bakim_sefinin_zihnindedir_isleri_kendi_bilgisine_gore_dagitir`: Sistemik yetkinlik eşleşmesi yoktur; bakım amiri kimin hangi işten anladığını bildiği için görevi sözlü dağıtır
  - `teknisyen_yetkinlik_ve_atama_takibi_yapilmamaktadir`: Teknisyen yetkinlik veya özel sertifika takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Teknisyen Yetkinlik Matrisi ve Yetki Bazlı Görev Atama Motorunu belirler.

#### [MNT-026] Makinelere müdahale öncesinde İş Sağlığı ve Güvenliği (İSG) kapsamında Enerji Kesme, Kilitleme ve Etiketleme (LOTO - Lockout / Tagout / Sıcak Çalışma İzni) prosedürleri sistemik olarak işletilmekte midir?
- **Süreç:** Bakım Personeli ve Yetkinlik
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** İSG / LOTO prosedürleri, iş güvenliği izinleri (Permit to Work) ve güvenlik kilitleri.
- **Seçenekler:**
  - `loto_ve_is_izni_onaylanmadan_bakim_is_emrine_baslanamaz_ve_makineye_enerji_verilemez`: Evet; tehlikeli ekipmanlarda LOTO onayı ve İSG izin formu tamamlanmadan iş emri başlatılamaz
  - `loto_asmasi_fiziki_asmapayladir_ancak_sistemik_bir_onay_adimi_yoktur`: Fiziki kilit/asma kilit takılır fakat ERP sistemi üzerinde dijital bir LOTO onay adımı yoktur
  - `loto_veya_ozel_is_izni_proseduru_uygulanmamaktadir`: Resmi LOTO veya özel iş izni prosedürü uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** İSG / LOTO (Enerji Kesme-Kilitleme) Dijital İzin Süreci Gereksinimini belirler.

---

### 14. Dış Servis Yönetimi

#### [MNT-027] Makineler, asansörler, kompresörler veya laboratuvar cihazları için Harici Dış Servis / Yetkili Servis / Taşeron Bakım Hizmeti alınmakta mıdır ve servis sözleşmeleri takip edilmekte midir?
- **Süreç:** Dış Servis Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Dış servis yönetimi, taşeron bakım, yıllık bakım sözleşmeleri ve servis çağrıları.
- **Seçenekler:**
  - `dis_servis_sozlesmeleri_cagri_kayitlari_ve_servis_faturalari_ekipmanla_esleserek_yonetilir`: Evet; dış servis sözleşmeleri, garanti kapsamı, servis çağrısı ve gelen servis formu sistemde iş emrine bağlanır
  - `dis_servis_ariza_oldukca_telefonla_cagrilir_sozlesme_takibi_sistemde_yoktur`: Yalnız arıza çıkınca yetkili servis çağrılır; servis formu klasörde tutulur, sistemik sözleşme takibi yoktur
  - `dis_servis_kullanilmamaktadir_tum_bakim_ic_ekiple_cozulur`: Dış servis kullanılmamaktadır; tüm bakım ve tamir işleri işletmenin kendi personeliyle çözülür
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Dış Servis Sözleşmeleri ve Taşeron Bakım Takip Modelini belirler.

#### [MNT-028] Dış servis sağlayıcıların sözleşmede taahhüt ettiği Müdahale ve Çözüm Süreleri (SLA - Service Level Agreement) ve servis sonrası teknik onay süreci sistemde denetlenmekte midir?
- **Süreç:** Dış Servis Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MNT-027 != "dis_servis_kullanilmamaktadir_tum_bakim_ic_ekiple_cozulur"`
- **Açıklama:** Dış servis SLA takibi, geç müdahale cezaları ve servis raporu kalite onayı.
- **Seçenekler:**
  - `servisin_cagri_saati_ve_gelis_saati_kaydedilir_sla_asimlari_ve_servis_raporu_onaylanir`: Evet; çağrı açılış ve servisin tesise varış saati tutulur; SLA gecikmeleri ve servis raporu onaylanmadan fatura ödenmez
  - `sla_takibi_yapilmaz_servis_geldiginde_kağıt_servis_formu_imzalanip_arsivlenir`: SLA süresi ölçülmez; teknisyen işi bitirince kağıt servis formunu imzalatır, muhasebeye teslim eder
  - `servis_sla_ve_onay_denetimi_bulunmamaktadir`: Dış servis SLA ve onay denetimi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Dış Servis SLA Performans Denetimi ve Hakediş Onay Akışını belirler.

---

### 15. Yedek Parça Kullanımı

#### [MNT-029] Bakım ve onarımlarda kullanılan yedek parçalar (Rulman, Kayış, Valf, Sensör, Filtre, Yağ vb.) ilgili Bakım İş Emrine girilerek stoktan otomatik düşülmekte midir?
- **Süreç:** Yedek Parça Kullanımı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Bakım iş emri malzeme tüketimi, yedek parça ambarından otomatik çıkış ve maliyetleme.
- **Seçenekler:**
  - `kullanilan_parcalar_bakim_is_emrine_girilir_ve_yedek_parca_ambari_stogundan_otomatik_duser`: Evet; iş emrinde kullanılan parça ve yağlar seçilir, stoktan otomatik sarf fişi kesilerek düşer
  - `yedek_parcalar_ambardan_toplu_cikilir_hangi_makinede_kullanildigi_sistemde_gorunmez`: Depodan ayda bir toplu sarf edilir fakat hangi parçanın hangi makinede harcandığı sistemde izlenmez
  - `yedek_parca_stok_takibi_yapilmamaktadir`: Yedek parçaların stok veya makine bazlı sarf takibi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Bakım İş Emri - Yedek Parça Ambarı Otomatik Sarf ve Maliyet Entegrasyonunu belirler.

#### [MNT-030] Kritik makinelerin arızalanması durumunda uzun süre parça beklememek için Kritik Yedek Parça Listesi, Minimum Emniyet Stoğu ve Otomatik Satın Alma Talebi sistemi çalışmakta mıdır?
- **Süreç:** Yedek Parça Kullanımı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kritik yedek parçalar (Critical Spare Parts), minimum stok seviyeleri ve tedarik süresi (Lead Time) güvencesi.
- **Seçenekler:**
  - `kritik_yedek_parcalar_icin_emniyet_stogu_tanimlidir_stok_dustugunde_otomatik_satinalma_talebi_acar`: Evet; kritik parçalar stokta rezerve tutulur, kritik seviyenin altına indiğinde sistem otomatik satın alma uyarısı verir
  - `parca_bitince_veya_ariza_olunca_fark_edilir_acil_siparis_verilir`: Minimum stok kuralı yoktur; parça arıza anında rafta bulunamazsa acil satın alma açılır ve makine bekler
  - `kritik_yedek_parca_yonetimi_bulunmamaktadir`: Kritik yedek parça yönetimi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Kritik Yedek Parça Emniyet Stoğu ve Satın Alma Talebi Otomasyonunu belirler.

---

### 16. Arıza Nedeni ve Duruş Analizi

#### [MNT-031] Arıza tamamlandığında arızanın Kök Nedeni (Mekanik Aşınma, Elektriksel Arıza, Elektronik Kart / PLC, Hidrolik / Pnömatik Kaçak, Operatör / Kullanıcı Hatası, Yağsız Kalma, Toz / Ortam) standart kodlarla sınıflandırılmakta mıdır?
- **Süreç:** Arıza Nedeni ve Duruş Analizi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Arıza kök neden katalogları (Failure Cause Codes), arıza tipleri ve kusur ağacı.
- **Seçenekler:**
  - `standart_ariza_neden_katalogu_vardir_is_emri_kapatilirken_neden_kodu_secilmesi_zorunludur`: Evet; standart neden kodları vardır; arızanın mekanik, elektrik veya kullanıcı hatası olduğu zorunlu seçilir
  - `ariza_nedeni_teknisyenin_kendi_ifadesiyle_serbest_metin_olarak_yazilir`: Standart kodlama yoktur; teknisyen forma 'Rulman dağılmış', 'Sensör kırık' gibi serbest açıklama yazar
  - `ariza_nedeni_kaydedilmemektedir`: Arıza nedeni veya kök neden sınıflandırması kaydedilmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Standart Arıza Kök Neden Hiyerarşisi (Failure Cause Hierarchy) Tasarımını belirler.

#### [MNT-032] Tekrarlayan arızalar (Kronik Arızalar) ve plansız duruş süreleri (Breakdown Downtime) ekipman ve neden bazında Pareto / Kök Neden grafikleriyle analiz edilebilmekte midir?
- **Süreç:** Arıza Nedeni ve Duruş Analizi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Tekrarlayan arıza analizi (Bad Actors / Chronic Failures) ve plansız duruş trendleri.
- **Seçenekler:**
  - `en_cok_durus_yaratan_ekipmanlar_ve_kronik_ariza_nedenleri_pareto_grafikleriyle_raporlanir`: Evet; en çok arızalanan 'Kötü Huylu' makineler ve kök neden dağılımları sistemden tek tıkla analiz edilir
  - `hangi_makinenin_cok_ariza_yaptigi_bilinir_fakat_sistemik_durus_raporu_uretmek_zordur`: Sorunlu makineler bilinir fakat duruş saatleri ve arıza sıklığı raporu üretmek için manuel çalışma gerekir
  - `tekrarlayan_ariza_ve_durus_analizi_yapilmamaktadir`: Tekrarlayan arıza veya duruş analizi yapılmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Kronik Arıza (Bad Actors) Analitiği ve Duruş Süresi Pareto Raporlamasını belirler.

---

### 17. Bakım Maliyeti

#### [MNT-033] Her bir makine ve ekipmanın Toplam Bakım Maliyeti (Kullanılan Yedek Parça Maliyeti + İşçilik / Adam-Saat Maliyeti + Dış Servis / Taşeron Faturası) sistemde ekipman bazında kümülatif olarak görülebilmekte midir?
- **Süreç:** Bakım Maliyeti
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Ekipman bazlı bakım maliyet muhasebesi (Maintenance Cost by Asset) ve bütçe gerçekleşme takibi.
- **Seçenekler:**
  - `ekipman_bazinda_parca_iscilik_ve_dis_servis_maliyetleri_aylik_ve_yillik_net_raporlanir`: Evet; herhangi bir makinenin yıl boyunca şirkete ne kadar bakım maliyeti (Parça + İşçilik + Servis) getirdiği tam izlenir
  - `bakim_giderleri_sirketin_genel_masraf_merkezinde_toplu_tutulur_makineye_indirgenemez`: Şirket genelinde toplam bakım faturası bilinir fakat hangi makineye ne kadar harcandığı ayrıştırılamaz
  - `makine_bazinda_bakim_maliyeti_takip_edilememektedir`: Makine bazında bakım maliyetleri takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Ekipman Bazlı Fiili Bakım Maliyeti Muhasebesi ve Bütçe Kurgusunu belirler.

#### [MNT-034] Arıza kaynaklı plansız duruşların yarattığı Üretim Kayıp Maliyeti (Duruş Saati x Hat Saat Ücreti / Üretilemeyen Ürün Kâr Kaybı) hesaplanmakta mıdır?
- **Süreç:** Bakım Maliyeti
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Duruş kaynaklı üretim kaybı maliyeti ve bakımın finansal iş etkisi.
- **Seçenekler:**
  - `ariza_durus_saatleri_hattin_saatlik_maliyetiyle_carpilarak_finansal_kayip_hesaplanir`: Evet; bakım raporlarında arızanın sadece tamir maliyeti değil, hattan kaynaklanan ciro/kâr kaybı da gösterilir
  - `yalnizca_tamir_ve_parca_masrafi_bilinir_uretim_kayip_maliyeti_hesaplanmaz`: Sadece parçaya ve tamire ödenen para bilinir; üretilemeyen adetlerin finansal kaybı hesaplanmaz
  - `durus_kaynakli_uretim_kayip_maliyeti_olculmemektedir`: Duruş kaynaklı üretim kayıp maliyeti ölçülmemektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Duruş Kaynaklı Ciro/Kayıp Maliyeti Analitiğini belirler.

---

### 18. Kalibrasyon Yönetimi

#### [MNT-035] Fabrikadaki ölçüm cihazları, sensörler, test tezgâhları ve kalıpların Kalibrasyon Yaşam Döngüsü (Kalibrasyon Periyodu, Son Kalibrasyon Tarihi, Gelecek Kalibrasyon Tarihi, Kalibrasyon Kuruluşu, Sertifika No) sistemde takip edilmekte midir?
- **Süreç:** Kalibrasyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kalibrasyon periyotları, geçerlilik takibi, kalibrasyon planı ve sertifika yönetimi.
- **Seçenekler:**
  - `tum_olcum_ve_test_cihazlarinin_kalibrasyon_periyotlari_ve_sertifikalari_sistemde_takip_edilir`: Evet; kalibrasyon günü yaklaşan cihazlar için sistem otomatik uyarı verir, sertifika ve sonuçlar kartında saklanır
  - `kalibrasyon_tarihleri_excel_tablosunda_takip_edilir_cihazlarin_uzerine_etiket_yapistirilir`: Sistemik takip yoktur; kalite/bakım sorumlusu Excel listesine bakar, günü gelen cihazları kalibrasyona gönderir
  - `cihaz_ve_ekipman_kalibrasyon_takibi_yapilmamaktadir`: Cihaz ve ekipman kalibrasyon takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Kalibrasyon Yönetimi Modülü ve Periyodik Kalibrasyon Planlama Motorunu belirler.

#### [MNT-036] Kalibrasyon süresi dolan veya kalibrasyon test sonucu 'Uygunsuz' çıkan cihaz ve ekipmanların kullanımının sistem tarafından otomatik bloke edilmesi sağlanmakta mıdır?
- **Süreç:** Kalibrasyon Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `MNT-035 != "cihaz_ve_ekipman_kalibrasyon_takibi_yapilmamaktadir"`
- **Açıklama:** Kalibrasyonsuz cihaz/ekipman sistemik kilit mekanizması ve blokaj kuralı.
- **Seçenekler:**
  - `kalibrasyon_suresi_doldugunda_cihaz_sistemde_bloke_olur_ve_olcumde_kullanilamaz`: Evet; kalibrasyon süresi bittiği gün cihaz bloke statüsüne geçer, üretim veya kalite kaydına seçilemez
  - `cihaz_uzerine_kirmizi_etiket_yapistirilir_ancak_sistemde_kilit_mekanizmasi_yoktur`: Fiziken kırmızı etiket yapıştırılır fakat sistem üzerinde kullanıma engel koyan bir mekanizma yoktur
  - `kalibrasyon_blokaji_bulunmamaktadir`: Kalibrasyon süresi dolan cihazlar için blokaj mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Kalibrasyonu Geçmiş Cihaz/Ekipman Blokaj ve Kilit Kuralını belirler.

---

### 19. Bakım Dokümanları ve Teknik Kayıtlar

#### [MNT-037] Bir makinenin geçmişte geçirdiği tüm arızalar, yapılan periyodik bakımlar, değişen parçalar ve revizyonları tek ekranda gösteren Ekipman Karnesi / Bakım Geçmişi (Equipment Maintenance History) raporlanabilmekte midir?
- **Süreç:** Bakım Dokümanları ve Teknik Kayıtlar
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Ekipman tarihçesi (Asset Lifecycle Log), bakım karnesi ve tek ekranda şecere dökümü.
- **Seçenekler:**
  - `her_makinenin_gecmis_tum_ariza_ve_parca_degisim_tarihcesi_ekipman_karnesinde_tek_tikla_dokulur`: Evet; makine kodu girildiğinde kurulduğu günden bugüne yapılan tüm iş emirleri, değişen parçalar ve maliyet listelenir
  - `gecmis_isler_farkli_excel_ve_kağıt_arsivlerde_tutulur_birlestirmek_zordur`: Tek bir karne yoktur; eski işler klasörlerdeki servis formlarında veya eski Excel'lerde dağınık durur
  - `ekipman_bakim_gecmisi_ve_karne_takibi_yapilamamaktadir`: Ekipman bakım geçmişi veya karne takibi yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Dijital Ekipman Karnesi (Asset Maintenance Log) Raporlama Tasarımını belirler.

#### [MNT-038] Makinelerin kullanım kılavuzları, hidrolik/elektrik devre şemaları, montaj çizimleri ve teknik servis bültenleri sisteme dijital olarak yüklenip teknisyenlerin sahada erişimine sunulmakta mıdır?
- **Süreç:** Bakım Dokümanları ve Teknik Kayıtlar
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Teknik doküman arşivi, şemalar, kılavuzlar ve sahadan mobil/kiosk erişim.
- **Seçenekler:**
  - `teknik_semalar_ve_kullanim_kilavuzlari_ekipman_kartina_baglidir_sahadan_tabletle_gorulebilir`: Evet; elektrik ve hidrolik şemalar sistemdedir; teknisyen iş emri başındayken şemayı ekrandan açıp inceler
  - `kilavuzlar_ve_semalar_bakim_odasindaki_dolaplarda_kitap_veya_klasor_olarak_durur`: Dokümanlar basılı olarak atölyedeki dolaplardadır; arıza olunca gidip sayfalar karıştırılır
  - `teknik_dokuman_ve_sema_arsivi_bulunmamaktadir`: Teknik doküman veya devre şeması arşivi bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Teknik Çizim ve Şema Dijital Doküman Entegrasyonunu belirler.

---

### 20. Bakım Raporlama ve KPI

#### [MNT-039] Şirketinizde Arızalar Arası Ortalama Süre (MTBF - Mean Time Between Failures) ve Ortalama Onarım Süresi (MTTR - Mean Time To Repair) metrikleri ekipman ve hat bazında hesaplanmakta mıdır?
- **Süreç:** Bakım Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Temel bakım güvenilirlik metrikleri (MTBF, MTTR, MTTF).
- **Seçenekler:**
  - `mtbf_ve_mttr_degerleri_ekipman_ve_hat_bazinda_sistemden_otomatik_hesaplanir_ve_izlenir`: Evet; MTBF (güvenilirlik) ve MTTR (onarım hızı) metrikleri iş emri verilerinden sistem tarafından otomatik üretilir
  - `aylik_toplantilarda_excel_verileriyle_bazi_kritik_makineler_icin_manuel_hesaplanir`: Otomatik hesaplama yoktur; ay sonlarında bakım şefi Excel'deki duruş sürelerini formülle oranlar
  - `mtbf_veya_mttr_hesaplanmamaktadir`: MTBF veya MTTR metrikleri hesaplanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** MTBF ve MTTR Güvenilirlik Hesaplama Motorunu belirler.

#### [MNT-040] Fabrika genelinde ve darboğaz makinelerde Ekipman Kullanılabilirlik Oranı (Equipment Availability / OEE Bakım Kullanılabilirlik Faktörü) ve Toplam Duruş Süresi canlı olarak ölçülmekte midir?
- **Süreç:** Bakım Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Ekipman kullanılabilirliği (Availability), OEE bakım faktörü ve toplam duruş süresi.
- **Seçenekler:**
  - `ekipman_kullanilabilirligi_availability_ve_toplam_durus_oranlari_canli_gostergeyle_izlenir`: Evet; planlı çalışma süresine göre arıza ve bakım kaynaklı kayıplar canlı hesaplanarak kullanılabilirlik yüzdesi izlenir
  - `durus_sureleri_vardiya_raporlarinda_manuel_tutulur_aylik_rapora_yansir`: Canlı takip yoktur; operatörlerin kağıda yazdığı duruş dakikaları ay sonunda toplanarak raporlanır
  - `ekipman_kullanilabilirlik_orani_olculmemektedir`: Ekipman kullanılabilirlik oranı veya OEE duruş faktörü ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Ekipman Kullanılabilirliği (Availability) ve Canlı Duruş Kokpiti Tasarımını belirler.

#### [MNT-041] Planlanan periyodik bakımların zamanında yapılma oranını gösteren Planlı Bakım Uyum Oranı (PM Compliance Rate) ve Geciken Bakımlar (Overdue PM) takip edilmekte midir?
- **Süreç:** Bakım Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Planlı bakım gerçekleşme oranı (PM Compliance), geciken iş emirleri ve bakım disiplini.
- **Seçenekler:**
  - `pm_compliance_orani_ve_geciken_bakimlar_sistemik_kokpit_uzerinden_anlik_izlenir`: Evet; planlanan bakımların kaçının zamanında yapıldığı (%) ve geciken iş emirleri yönetim panelinde kırmızı uyarıyla izlenir
  - `aylik_bakim_toplantisinda_yapilan_ve_yapilamayan_isler_sozlu_degerlendirilir`: Sistemik gösterge yoktur; ay sonu toplantısında bakım amiri hangi bakımları yetiştiremediğini açıklar
  - `planli_bakim_uyum_orani_takip_edilmemektedir`: Planlı bakım uyum oranı veya geciken bakım takibi yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** Planlı Bakım Uyum Oranı (PM Compliance) ve Gecikme Uyarı Sistemini belirler.

#### [MNT-042] ERP/EAM dönüşümü sonrasında hedeflenen Kurumsal Bakım ve Varlık Yönetimi vizyonu ve temel önceliği nedir?
- **Süreç:** Bakım Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), dijital bakım yönetimi ve entegrasyon hedefleri.
- **Seçenekler:**
  - `tam_entegre_ekipman_karnesi_otomatik_sayac_ve_kestirimci_bakimla_sifir_plansiz_durus`: Tam entegre ekipman karnesi, sayaç/IoT tetiklemeli preventif bakım ve sıfır plansız duruş (Zero Breakdown) hedefi
  - `ariza_bildirimlerinin_dijitallesmesi_ve_is_emirlerinde_yedek_parca_iscilik_takibinin_kurulmasi`: Arıza çağrılarının sahadan dijital açılması, iş emirlerinde yedek parça ve işçilik maliyetinin şeffaflaşması
  - `periyodik_bakim_disiplininin_saglanmasi_ve_kalibrasyon_blokajlarinin_otomasyonu`: Planlı bakım takvimine uyumun garantiye alınması ve kalibrasyon süresi dolan cihazların sistemsel engellenmesi *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/EAM Karar Etkisi:** ERP/EAM Bakım Onarım Modülü Kapsamı ve Proje Yol Haritasını belirler.
