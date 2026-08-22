# FAZ-44: Eğitim ve Gelişim Yönetimi (TRAINING) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.training.core`  
**Kanonik İş Fonksiyonu Kodu:** `TRAINING`  
**Türkçe / Legacy Kod:** `EGITIM_GLS` (Alias: `EGITIM`, `EGITIM_GELISIM`, `EGITIM_VE_GELISIM`, `LEARNING_DEVELOPMENT`, `L_AND_D`)  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 5`  
**Kategori:** `İnsan Kaynakları` (Human Resources)  
**Toplam Soru:** 47 Soru (`TRN-001` .. `TRN-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç (%100 Kapsama)  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

Eğitim ve Gelişim Yönetimi (Training & Development) modülü; şirketlerin çalışan yetkinliklerini geliştirmek, yasal ve mesleki zorunlulukları güvence altına almak, iş gücü verimliliğini artırmak ve kurumsal hafızayı güçlendirmek amacıyla uyguladıkları eğitim ve gelişim süreçlerinin AS-IS durumunu ve ERP gereksinimlerini belirlemek üzere tasarlanmıştır.

Bu soru paketi; kurumsal eğitim politikasını, yıllık eğitim mastır planını, eğitim ihtiyaç analizini (EİA), yetkinlik ve çoklu beceri (polivalans) matrislerini, pozisyon bazlı eğitim kataloglarını, işe giriş oryantasyonu ve görev başı (OJT) eğitimlerini, teknik uzmanlık programlarını, 6331 sayılı Kanun kapsamındaki temel/özel İSG eğitimlerini, KVKK ve Bilgi Güvenliği gibi yasal uyum eğitimlerini, kalite/süreç/DÖF eğitimlerini, ERP/CRM kullanıcı eğitimlerini, liderlik gelişimini, mesleki sertifika/lisans/MYK geçerlilik takibini, iç ve dış eğitmen yönetimini, eğitim bütçesi ve kişi-saat maliyetlerini, salon ve vardiya takvim planlamasını, katılım/devam kayıtlarını, sınav ve başarı ölçümünü, karekodlu sertifika üretimini, kariyer/performans entegrasyonunu, LMS (Learning Management System) dijital altyapısını ve eğitim etkinliği (Kirkpatrick 4 Düzey: Reaksiyon, Öğrenme, Davranış, Sonuç/ROI) göstergelerini keşfeder.

### Sınır Ayrımı (Cross-Pack Isolation):
- `HUMAN_RESOURCES`: Çalışan ana verisi, özlük dosyası, organizasyon şeması, kadro, izin ve disiplin süreçleri.
- `PAYROLL`: Bordro tahakkuku, net/brüt ücret, SGK bildirgeleri, mesai ve yasal kesintiler.
- `LEGAL_COMPLIANCE`: Şirket geneli hukuki riskler, sözleşme yaşam döngüsü ve dava/icra takibi.
- `STRATEGY`: Kurumsal vizyon, genel hedefler ve çok yıllık stratejik inisiyatifler.
- `TRAINING`: Yalnızca çalışan eğitimi, yetkinlik matrisi, sertifikasyon, LMS, eğitim bütçesi ve eğitim etkinliğine odaklanır.

---

## 2. 25 Kanonik Süreç Envanteri

| # | Kanonik Süreç Adı | Soru Sayısı | Soru ID Listesi | Zorunlu Soru |
|---|---|:---:|---|:---:|
| 1 | Eğitim organizasyonu ve süreç sahipliği | 2 | `TRN-001`, `TRN-002` | 1 |
| 2 | Eğitim politikası ve yönetmelikler | 2 | `TRN-003`, `TRN-004` | 1 |
| 3 | Eğitim ihtiyaç analizi | 2 | `TRN-005`, `TRN-006` | 1 |
| 4 | Yıllık eğitim planı | 2 | `TRN-007`, `TRN-008` | 1 |
| 5 | Yetkinlik ve beceri matrisi | 2 | `TRN-009`, `TRN-010` | 1 |
| 6 | Pozisyon bazlı eğitim gereksinimleri | 2 | `TRN-011`, `TRN-012` | 1 |
| 7 | İşe giriş ve oryantasyon eğitimi | 2 | `TRN-013`, `TRN-014` | 1 |
| 8 | İşbaşı ve görev eğitimi | 2 | `TRN-015`, `TRN-016` | 1 |
| 9 | Teknik eğitimler | 2 | `TRN-017`, `TRN-018` | 1 |
| 10 | İş sağlığı ve güvenliği eğitimleri | 2 | `TRN-019`, `TRN-020` | 1 |
| 11 | Yasal ve zorunlu uyum eğitimleri | 2 | `TRN-021`, `TRN-022` | 1 |
| 12 | Ürün, süreç ve kalite eğitimleri | 2 | `TRN-023`, `TRN-024` | 1 |
| 13 | ERP/CRM ve dijital sistem eğitimleri | 2 | `TRN-025`, `TRN-026` | 1 |
| 14 | Liderlik ve yönetici gelişimi | 2 | `TRN-027`, `TRN-028` | 1 |
| 15 | Mesleki sertifika ve lisanslar | 2 | `TRN-029`, `TRN-030` | 1 |
| 16 | İç eğitmen ve dış eğitmen yönetimi | 2 | `TRN-031`, `TRN-032` | 1 |
| 17 | Eğitim kurumu ve tedarikçi yönetimi | 2 | `TRN-033`, `TRN-034` | 1 |
| 18 | Eğitim bütçesi ve maliyet takibi | 2 | `TRN-035`, `TRN-036` | 1 |
| 19 | Eğitim takvimi ve katılımcı planlaması | 2 | `TRN-037`, `TRN-038` | 1 |
| 20 | Katılım, devam ve eğitim kayıtları | 2 | `TRN-039`, `TRN-040` | 1 |
| 21 | Sınav, değerlendirme ve başarı ölçümü | 1 | `TRN-041` | 1 |
| 22 | Sertifika, geçerlilik ve yenileme takibi | 1 | `TRN-042` | 1 |
| 23 | Kariyer, gelişim ve performans bağlantısı | 1 | `TRN-043` | 1 |
| 24 | LMS, içerik ve doküman yönetimi | 2 | `TRN-044`, `TRN-045` | 1 |
| 25 | Eğitim etkinliği, KPI, arşiv ve yol haritası | 2 | `TRN-046`, `TRN-047` | 1 |
| | **TOPLAM** | **47** | **47 Soru (TRN-001..047)** | **25 Zorunlu / 22 Opsiyonel** |

---

## 3. 8 Koşullu Dallanma (Branching) Matrisi

| # | Tetikleyici Soru (Trigger) | Koşul Operatörü | Tetikleyici Değer | Hedef Soru (Dependent) | Kapsam / Davranış |
|---|---|:---:|---|---|---|
| 1 | `TRN-003` | `not_equals` | `resmi_egitim_politikasi_yok_ihtiyaca_gore_karar_verilir` | `TRN-004` | Eğitim politikası varsa onay hiyerarşisi, taahhütname ve iptal kuralları açılır. |
| 2 | `TRN-005` | `not_equals` | `egitim_ihtiyac_analizi_yapilmiyor_talep_oldukca_degerlendirilir` | `TRN-006` | EİA yapılıyorsa girdi parametreleri (performans, skill gap, hata oranları) açılır. |
| 3 | `TRN-009` | `not_equals` | `yetkinlik_matrisi_kullanilmiyor_pozisyon_tanimlariyla_sinirli` | `TRN-010` | Yetkinlik matrisi varsa eğitim sonrası seviye güncelleme mekanizması açılır. |
| 4 | `TRN-013` | `not_equals` | `resmi_oryantasyon_programi_uygulanmiyor_dogrudan_ise_baslanir` | `TRN-014` | Oryantasyon varsa kontrol listesi, mentorluk ve geri bildirim anketleri açılır. |
| 5 | `TRN-021` | `not_equals` | `yasal_ve_zorunlu_uyum_egitim_takibi_yapilmiyor_veya_harici_firma_takip_ediyor` | `TRN-022` | Zorunlu uyum eğitimleri varsa gecikme eskalasyon ve yaptırım kuralları açılır. |
| 6 | `TRN-029` | `not_equals` | `mesleki_sertifika_ve_lisans_takibi_yapilmiyor` | `TRN-030` | Mesleki sertifika takibi varsa yenileme sınavı ve masraf karşılama açılır. |
| 7 | `TRN-044` | `not_equals` | `lms_kullanilmiyor_egitimler_manuel_sinif_ortaminda_yurutulur` | `TRN-045` | LMS kullanılıyorsa ERP/İK çalışan senkronizasyonu ve SSO entegrasyonu açılır. |
| 8 | `TRN-046` | `not_equals` | `resmi_etkinlik_olcum_modeli_yok` | `TRN-047` | Eğitim etkinliği ölçülüyorsa Kirkpatrick 4 Düzey, KPI paneli ve yol haritası açılır. |

---

## 4. Test ve Doğrulama

Kabul testi `test/faz44_training_question_pack_test.ts` ile 17 kritik alanda tam otomatik olarak doğrulanmıştır:
- **T01..T05:** Şema, 47 soru adedi, 25 zorunlu/22 opsiyonel, TRN-001..047 deterministik sıralama.
- **T06..T07:** 25 kanonik sürecin %100 kapsanması.
- **T08:** 8 koşullu dallanma motoru senaryosu.
- **T09:** İlerleme hesaplama ve takip bayrağı düşümü.
- **T10:** 33 diğer modülle çapraz taramada 0 mükerrer soru.
- **T11..T12:** Özel soru adaptörü ve enum sızıntısız Türkçe rapor formatlayıcı.
- **T13..T14:** DOCX ve Liberation Sans TrueType gömülü UTF-8 PDF ihracı.
- **T15:** `getPackIdForFunction("TRAINING")` ve 5 alias doğrulaması.
- **T16..T17:** İK/Bordro sınır izolasyonu ve %100 AI-Free offline mimari.
