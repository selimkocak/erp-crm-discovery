# FAZ-38: Doküman Yönetimi (DOCUMENT_MANAGEMENT) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.document_management.core`  
**Kanonik İş Fonksiyonu Kodu:** `DOCUMENT_MANAGEMENT`  
**Türkçe / Legacy Kod:** `DOKUMAN_YONETIMI` / `BELGE_YNT` (Alias: `DOCS`, `DOCUMENT`)  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 28`  
**Kategori:** `Yönetim` (Management)  
**Toplam Soru:** 47 Soru (`DOC-001` .. `DOC-047`)  
**Zorunlu / Opsiyonel:** 27 Zorunlu / 20 Opsiyonel  
**Kanonik Süreç:** 25 Süreç  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

Kurumsal Doküman Yönetimi (Document Management & Life Cycle), şirketlerin kurumsal hafızasını, sözleşmelerini, teknik şartnamelerini, kalite ve ISO dokümantasyonunu, personel özlük dosyalarını, ticari ve finansal evraklarını yapılandırılmış bir taksonomi, versiyon/revizyon kontrolü, onay/imza rotası, rol bazlı yetkilendirme ve yasal saklama/imha politikalarıyla güvence altına almayı hedefler.

---

## 2. 25 Kanonik Süreç ve 47 Soru Dağılımı

| # | Süreç Adı | Soru ID | Başlık / Açıklama | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | Doküman yönetimi organizasyonu ve sorumluluklar | `DOC-001` | Kurumsal doküman yönetimi prosedürleri ve yönetim sorumlulukları | single_choice | Evet | Critical |
| 2 | Doküman yönetimi organizasyonu ve sorumluluklar | `DOC-002` | EDMS/DMS yazılımı kullanım standardı ve kullanıcı adaptasyonu | single_choice | Hayır | High |
| 3 | Doküman sahipliği ve veri sorumluları | `DOC-003` | Doküman sahipliği (Document Owner) ve içerik sorumluları tanımı | single_choice | Evet | Critical |
| 4 | Doküman sahipliği ve veri sorumluları | `DOC-004` | Personel ayrılışlarında doküman sahiplik devri ve vekalet | single_choice | Hayır | High |
| 5 | Doküman sınıflandırma ve kategori yapısı | `DOC-005` | Standart doküman sınıflandırma ve kategori hiyerarşisi | single_choice | Evet | Critical |
| 6 | Doküman sınıflandırma ve kategori yapısı | `DOC-006` | Dinamik etiketleme (tags), anahtar kelimeler ve taksonomi | single_choice | Hayır | High |
| 7 | Doküman türleri ve doküman kodlama | `DOC-007` | Standart doküman kodlama ve ardışık numaralandırma kuralı | single_choice | Evet | High |
| 8 | Doküman türleri ve doküman kodlama | `DOC-008` | Kurumsal doküman şablonları kütüphanesinin yönetimi | single_choice | Hayır | Medium |
| 9 | Doküman metadata alanları | `DOC-009` | Doküman üstveri (metadata) zorunlu giriş alanları | single_choice | Evet | High |
| 10 | Doküman onay akışları | `DOC-010` | Doküman oluşturma, revizyon ve yayın onay akışı (Branching Trigger 1) | single_choice | Evet | Critical |
| 11 | Doküman onay akışları | `DOC-011` | Sıralı/paralel onay matrisi ve e-imza/zaman damgası kullanımı (Branching Target 1) | single_choice | Hayır | High |
| 12 | Doküman revizyon ve versiyon yönetimi | `DOC-012` | Versiyonlama, revizyon ve değişiklik geçmişi kontrolü (Branching Trigger 2) | single_choice | Evet | Critical |
| 13 | Doküman revizyon ve versiyon yönetimi | `DOC-013` | Eski versiyonlara erişim, sürüm karşılaştırma ve geri dönme (Target 2) | single_choice | Hayır | High |
| 14 | Taslak, inceleme ve yayın statüleri | `DOC-014` | Doküman durum geçişleri ve taslakların genel erişime kapalılığı | single_choice | Evet | High |
| 15 | Yetki, rol ve erişim kontrolü | `DOC-015` | Rol ve departman bazlı ayrıntılı okuma/yazma/silme/indirme yetkileri | single_choice | Evet | Critical |
| 16 | Yetki, rol ve erişim kontrolü | `DOC-016` | Dış paydaşlarla süreli, parola korumalı güvenli doküman paylaşımı | single_choice | Hayır | High |
| 17 | Gizli, özel ve genel doküman ayrımı | `DOC-017` | Bilgi güvenliği ve gizlilik derecelendirmesi sınıflandırması (Trigger 3) | single_choice | Evet | Critical |
| 18 | Gizli, özel ve genel doküman ayrımı | `DOC-018` | Dinamik filigran (watermark), anlık erişim logu ve DLP koruması (Target 3) | single_choice | Hayır | High |
| 19 | Departmanlar arası ortak doküman kullanımı | `DOC-019` | Eşzamanlı çalışma veya check-in / check-out kilitleme mekanizması | single_choice | Evet | High |
| 20 | Departmanlar arası ortak doküman kullanımı | `DOC-020` | Doküman güncellemelerinde otomatik paydaş bildirimleri | single_choice | Hayır | Medium |
| 21 | Doküman oluşturma ve kayıt süreci | `DOC-021` | Ağ tarayıcıları, toplu indeksleme ve doküman kayıt iş akışı | single_choice | Evet | High |
| 22 | Kalite sistemi ve ISO dokümanları | `DOC-022` | ISO 9001/14001/27001 kalite dokümantasyonu kontrolü (Trigger 4) | single_choice | Evet | Critical |
| 23 | Kalite sistemi ve ISO dokümanları | `DOC-023` | Kontrollü kopya dağıtımı ve eski belgelerin sahadan imhası (Target 4) | single_choice | Hayır | High |
| 24 | Sözleşme ve hukuki dokümanlar | `DOC-024` | Müşteri, tedarikçi, kira ve gizlilik sözleşmelerinin yönetimi (Trigger 5) | single_choice | Evet | Critical |
| 25 | Sözleşme ve hukuki dokümanlar | `DOC-025` | Sözleşme bitiş tarihi, otomatik yenileme ve ceza vadeleri takibi (Target 5) | single_choice | Hayır | High |
| 26 | Teknik çizim, proje ve üretim dokümanları | `DOC-026` | CAD çizimleri, teknik şartname ve ürün reçete dokümanları (Trigger 6) | single_choice | Evet | High |
| 27 | Teknik çizim, proje ve üretim dokümanları | `DOC-027` | Üretim sahasında terminalden güncel resim açma ve eski çizim engeli (Target 6) | single_choice | Hayır | High |
| 28 | Prosedür, talimat ve politika dokümanları | `DOC-028` | Standart operasyon prosedürleri (SOP) ve şirket politikaları yayını | single_choice | Evet | High |
| 29 | Prosedür, talimat ve politika dokümanları | `DOC-029` | Çalışanların dijital 'Okudum/Anladım' (Read & Understood) teyidi | single_choice | Hayır | Medium |
| 30 | Kontrollü kopya ve yayınlanmış doküman yönetimi | `DOC-030` | Otomatik salt okunur PDF dönüşümü ve kaynak dosya kilidi | single_choice | Evet | High |
| 31 | Satınalma, tedarikçi ve müşteri dokümanları | `DOC-031` | Ticari dokümanların ERP/CRM cari ve sipariş kartlarına bağlanması | single_choice | Evet | High |
| 32 | Satınalma, tedarikçi ve müşteri dokümanları | `DOC-032` | Tedarikçi kalite belgeleri ve vergi levhası geçerlilik süre takibi | single_choice | Hayır | Medium |
| 33 | Personel ve insan kaynakları dokümanları | `DOC-033` | Personel özlük dosyaları, sözleşmeler ve KVKK rıza formları saklama | single_choice | Evet | High |
| 34 | Personel ve insan kaynakları dokümanları | `DOC-034` | Çalışanların self-servis portaldan kendi belgelerine erişimi | single_choice | Hayır | Medium |
| 35 | Finansal ve muhasebesel dokümanlar | `DOC-035` | Ticari defterler, bilanço/mizan ve mali kanıt dosyaları arşivi | single_choice | Evet | High |
| 36 | Finansal ve muhasebesel dokümanlar | `DOC-036` | Yevmiye fişi içine taranmış fatura/fiş görselinin bağlanması | single_choice | Hayır | Medium |
| 37 | Doküman arama ve filtreleme | `DOC-037` | Özel Doküman Yönetim Sistemi (DMS/EDMS) altyapısı (Trigger 8) | single_choice | Evet | Critical |
| 38 | Doküman arama ve filtreleme | `DOC-038` | Harici DMS ile ERP/CRM arasında çift yönlü API entegrasyonu (Target 8) | single_choice | Hayır | High |
| 39 | Doküman arama ve filtreleme | `DOC-039` | Tam metin (Full-text) arama, OCR metin çıkarma ve metadata filtresi | single_choice | Evet | High |
| 40 | E-posta ve dış kaynaklı dokümanların kaydı | `DOC-040` | Kritik e-postalar ve eklerinin merkezi arşive tek tıkla kaydı | single_choice | Evet | High |
| 41 | Arşivleme, saklama ve imha politikaları | `DOC-041` | Fiziksel ve elektronik hibrit arşiv saklama modeli (Trigger 7) | single_choice | Evet | Critical |
| 42 | Arşivleme, saklama ve imha politikaları | `DOC-042` | Barkodlu kutu/klasör ile dijital sistemde raf lokasyon eşleşmesi (Target 7) | single_choice | Hayır | High |
| 43 | Arşivleme, saklama ve imha politikaları | `DOC-043` | Yasal saklama süreleri planı (TTK/VUK/KVKK 5-10 yıl) ve süre sayacı | single_choice | Evet | Critical |
| 44 | Arşivleme, saklama ve imha politikaları | `DOC-044` | İmha komisyonu onayı, tutanaklı güvenli yok etme prosedürü | single_choice | Hayır | High |
| 45 | Doküman süresi, geçerlilik tarihi ve yenileme takibi | `DOC-045` | Ruhsat, lisans ve sertifikalarda bitiş tarihi ve otomatik alarm | single_choice | Evet | High |
| 46 | Doküman süresi, geçerlilik tarihi ve yenileme takibi | `DOC-046` | Süresi dolan dokümanın sistemde otomatik pasife alınması | single_choice | Hayır | Medium |
| 47 | Doküman denetim izi, raporlama ve KPI | `DOC-047` | Zaman damgalı Audit Trail ve doküman işlem KPI dashboard'u | single_choice | Evet | Critical |

---

## 3. 8 Koşullu Dallanma (Branching) Kuralları

1. `DOC-010 = "resmi_onay_ve_imza_rotasi_uygulanir"` → `DOC-011` (Sıralı/paralel onay matrisi ve e-imza entegrasyonu)
2. `DOC-012 = "major_minor_revizyon_ve_degisiklik_tarihcesi_tutulur"` → `DOC-013` (Eski versiyon dondurma, diff ve rollback)
3. `DOC-017 = "gizli_ve_kisitli_dokuman_kategorileri_mevcuttur"` → `DOC-018` (Dinamik filigran ve güvenlik erişim logu)
4. `DOC-022 = "iso_ve_kalite_dokumanlari_yonetilmektedir"` → `DOC-023` (Kontrollü kopya ve geçersiz belgelerin imhası)
5. `DOC-024 = "sozlesmeler_ve_hukuki_evraklar_takip_edilmektedir"` → `DOC-025` (Sözleşme bitiş ve otomatik yenileme alarmları)
6. `DOC-026 = "teknik_cizim_ve_muhendislik_dokumanlari_mevcuttur"` → `DOC-027` (Üretim sahasında güncel teknik resim ve eski çizim engeli)
7. `DOC-041 = "fiziksel_ve_elektronik_hibrit_arsiv_kullanilmaktadir"` → `DOC-042` (Barkodlu arşiv kutusu ve raf adresi eşleşmesi)
8. `DOC-037 = "merkezi_dms_veya_harici_dokuman_sistemi_var"` → `DOC-038` (Harici DMS - ERP API entegrasyonu)

*Görünürlük İstatistiği:* Cevapsız varsayılan durumda **39 soru**, tüm koşullar aktifken **47 soru**.

---

## 4. Cross-Pack İzolasyonu ve Sınır Ayrımı

- **FAZ-33 Question Evidence & Managed Attachment Vault:** Soru bazlı dosya eklerini, ekran görüntülerini ve yerel dosya kasasını yönetir; DOCUMENT_MANAGEMENT kurumsal doküman yaşam döngüsünü inceler.
- **E_TRANSFORMATION:** GİB, UBL-TR, özel entegratör ve e-Fatura/e-İrsaliye teknik akışını inceler; DOCUMENT_MANAGEMENT bu belgelerin kurumsal arşiv ve erişim boyutunu inceler.
- **LEGAL_COMPLIANCE:** Hukuki yükümlülük ve mevzuat uyumunu inceler; DOCUMENT_MANAGEMENT dokümanların kontrol, saklama ve erişim mekanizmasını inceler.
- **QUALITY:** Kalite kontrol operasyonlarını inceler; DOCUMENT_MANAGEMENT kalite prosedürlerinin kontrollü yayın ve revizyonunu inceler.
- **INFORMATION_TECHNOLOGY:** Altyapı ve sistem erişimini inceler; DOCUMENT_MANAGEMENT doküman yönetim politikasını inceler.
- **MASTER_DATA_MANAGEMENT:** Ana veri yönetimini inceler; DOCUMENT_MANAGEMENT doküman metadata ve sınıflandırma yapısını inceler.
