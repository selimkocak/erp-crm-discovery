# FAZ-18 — Raporlama ve Analitik / REPORTING_ANALYTICS Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.reporting_analytics.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `REPORTING_ANALYTICS` (Raporlama ve Analitik)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, CIO/CDO'lar, İş Zekası (BI) Yöneticileri, Veri Ambarı Mimarları, Raporlama ve Finansal Kontrol Ekipleri  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP implementasyonu öncesinde raporlama organizasyonu ve envanteri, çoklu veri kaynakları konsolidasyonu, tek doğruluk kaynağı (Single Source of Truth), veri güncelliği ve gecikme toleransı, veri kalitesi ve doğrulama kontrolleri, veri sahipliği ve yönetişimi, semantik veri modeli ve standart boyutlar, Veri Ambarı (DWH) ve Data Mart mimarisi, ETL/ELT veri aktarım hatları, İş Zekası (BI) ve görsel dashboard kullanımı, self-service analitik yetkinliği, Excel bağımlılığı ve operasyonel riskler, standart KPI tanımları, rol ve satır bazlı yetkilendirme (RLS), otomatik rapor dağıtımı, rapor performansı ve sorgu optimizasyonu, veri soykütüğü (Data Lineage) ve izlenebilirlik ile yönetim karar desteği süreçlerinin AS-IS durumunu ve ERP/BI gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | REPORTING_ANALYTICS ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **BUDGET_REPORTING** | Yıllık bütçe süreci, versiyonlama (V0/V1), rolling forecast, bütçe-fiili sapma analizleri (Fiyat-Hacim-PVM) ve yönetim P&L hedefleri | **BUDGET_REPORTING finansal hedef ve sapmaları sorgular.** REPORTING_ANALYTICS verinin hangi kaynaktan geldiğini, veri kalitesini, DWH/BI veri modelini, ETL süreçlerini, veri tazeliğini, veri soykütüğünü ve raporlama performansını sorgular. |
| **INFORMATION_TECHNOLOGY** | Sunucu altyapısı, sanallaştırma, ağ güvenliği, firewall, depolama, veri tabanı fiziksel yedekleri ve donanım | **IT donanım ve ağ altyapısını sorgular.** REPORTING_ANALYTICS iş verisi modelini, raporlama sözlüğünü, BI platformunu ve iş birimi raporlama yetkinliğini sorgular. |
| **ACCOUNTING** | Yevmiye fişleri, Tekdüzen Hesap Planı, resmi mizan, bilanço ve vergi beyannameleri | **ACCOUNTING yasal muhasebe kaydını sorgular.** REPORTING_ANALYTICS muhasebe verisinin diğer sistemlerle (CRM, WMS) nasıl birleşip raporlandığını ve veri kalitesini sorgular. |
| **TREASURY** | Banka hesapları, nakit pozisyonu, çek/senet portföyü ve kısa vadeli nakit akışı | **TREASURY operasyonel para hareketini sorgular.** REPORTING_ANALYTICS hazine verisinin raporlama kokpitlerine anlık/gecelik nasıl aktığını sorgular. |
| **SALES & INVENTORY** | Müşteri siparişleri, teklifler, depo bakiyesi ve stok sayımı | **Operasyonel hareketleri sorgular.** REPORTING_ANALYTICS satış ve stok verilerinin çapraz raporlama modellerindeki tutarlılığını sorgular. |
| **REPORTING_ANALYTICS** | Raporlama organizasyonu, rapor envanteri, tek doğruluk kaynağı, veri güncelliği, veri kalitesi, veri sahipliği, semantik veri modeli, DWH/Data Mart, ETL, BI dashboardları, self-service analitik, Excel bağımlılığı, KPI sözlüğü, satır bazlı yetkilendirme (RLS), rapor performansı, veri soykütüğü (lineage), karar desteği | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular veri mimarisi, raporlama altyapısı, veri güvenilirliği ve analitik karar kalitesi derinliğinde yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Raporlama Organizasyonu** (2 Soru — RPT-001, RPT-002)
2. **Rapor Envanteri** (2 Soru — RPT-003, RPT-004)
3. **Veri Kaynakları** (2 Soru — RPT-005, RPT-006)
4. **Tek Doğruluk Kaynağı** (2 Soru — RPT-007, RPT-008)
5. **Veri Güncelliği** (2 Soru — RPT-009, RPT-010)
6. **Veri Kalitesi** (2 Soru — RPT-011, RPT-012)
7. **Veri Sahipliği** (2 Soru — RPT-013, RPT-014)
8. **Veri Modeli** (2 Soru — RPT-015, RPT-016)
9. **Veri Ambarı / Data Warehouse** (2 Soru — RPT-017, RPT-018)
10. **ETL / ELT ve Veri Yükleme** (2 Soru — RPT-019, RPT-020)
11. **BI ve Dashboard Platformları** (2 Soru — RPT-021, RPT-022)
12. **Self-Service Analytics** (2 Soru — RPT-023, RPT-024)
13. **Excel Bağımlılığı** (3 Soru — RPT-025, RPT-026, RPT-027)
14. **KPI Tanımları** (2 Soru — RPT-028, RPT-029)
15. **Rapor Yetkilendirme** (2 Soru — RPT-030, RPT-031)
16. **Rapor Dağıtımı** (2 Soru — RPT-032, RPT-033)
17. **Rapor Performansı** (2 Soru — RPT-034, RPT-035)
18. **Veri Lineage ve İzlenebilirlik** (2 Soru — RPT-036, RPT-037)
19. **Yönetim Karar Desteği** (5 Soru — RPT-038, RPT-039, RPT-040, RPT-041, RPT-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Raporlama Organizasyonu

#### [RPT-001] Şirketinizde kurumsal raporlama ve analitik süreçlerinin yönetimi ve sahipliği hangi organizasyonel modelle (Merkezi BI/Raporlama Ekibi / Dağıtık Departman Analistleri / IT Destekli / Bağımsız Kullanıcılar) yürütülmektedir?
- **Süreç:** Raporlama Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlama organizasyonu, ekip yapısı ve kurumsal analitik yönetişimi.
- **Seçenekler:**
  - `merkezi_bi_ve_veri_yonetimi_ekibi_tarafindan_yonetilir`: Merkezi bir İş Zekası (BI), Veri Ambarı veya Raporlama ekibi tüm şirketin analitik modellerini ve raporlarını yönetir
  - `it_departmani_rapor_taleplerini_kodlayarak_karsilar`: Ayrı bir BI ekibi yoktur; rapor talepleri IT/Yazılım ekibi tarafından SQL sorguları veya ekran geliştirmeleriyle karşılanır
  - `her_departman_kendi_analisti_ile_bagimsiz_raporlar`: Her departman (Satış, Finans, Tedarik vb.) kendi bünyesindeki raporlama uzmanı/analisti ile bağımsız çalışır *(Not Alınabilir)*
  - `belirlenmis_bir_raporlama_organizasyonu_yoktur`: Resmi bir raporlama ekibi veya modeli yoktur; her kullanıcı kendi işini görecek kadar rapor çeker
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Kurumsal Raporlama Yönetişim Modeli ve yetki matrisini belirler.

#### [RPT-002] Yeni bir yönetim raporu veya gösterge paneli (Dashboard) talep edildiğinde işleyen talep, analiz, onay ve geliştirme yaşam döngüsü nasıldır?
- **Süreç:** Raporlama Organizasyonu
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Rapor talep yönetimi, geliştirme süresi ve teslim disiplini.
- **Seçenekler:**
  - `resmi_talep_formu_ve_onayli_is_sureci_ile_kisa_surede_gelistirilir`: Resmi talep sistemi üzerinden iş ihtiyacı, veri kaynakları ve metrik tanımları onaylanarak standart sprint/süreçte teslim edilir
  - `it_veya_raporlama_uzmanina_eposta_ile_iletilir_is_yuku_fazladir`: E-posta veya sözlü iletilir; yoğunluk nedeniyle rapor geliştirme haftalar veya aylar sürebilmektedir *(Not Alınabilir)*
  - `kullanicilar_kendi_raporlarini_excelde_bireysel_olusturur`: Merkezi talep açılmaz; kullanıcılar sistemden ham veri çekip kendi Excel dosyalarında çözümler üretir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Rapor Geliştirme Süreç Çevikliği ve backlog yönetimini belirler.

---

### 2. Rapor Envanteri

#### [RPT-003] Şirket genelinde kullanılan operasyonel ve yönetsel raporların güncel bir Rapor Envanteri (Rapor adı, amacı, hedef kitlesi, veri kaynağı, sıklığı) mevcut mudur?
- **Süreç:** Rapor Envanteri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kurumsal rapor kataloğu ve envanter yönetimi.
- **Seçenekler:**
  - `guncel_ve_belgelenmis_resmi_rapor_envanteri_mevcuttur`: Evet; tüm kurumsal raporların sahibi, veri kaynağı, yenilenme sıklığı ve hedef kitlesi katalogda kayıtlıdır
  - `sadece_kritik_yonetim_raporlari_listelenmistir`: Yalnızca üst yönetime sunulan kritik 10-15 rapor belgelenmiştir; departman operasyonel raporları kayıt altında değildir
  - `rapor_envanteri_bulunmamaktadir`: Şirketimizde resmi bir rapor envanteri veya kataloğu bulunmamaktadır; kimin hangi raporu kullandığı dağınıktır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Rapor Konsolidasyonu ve geçiş (Migration) kapsamını belirler.

#### [RPT-004] Şirket bünyesinde aynı veya benzer amaca hizmet eden mükerrer raporlar, atıl kalmış raporlar veya yetim raporlar (Sahibi ayrılmış) için periyodik temizlik/konsolidasyon yapılıyor mu?
- **Süreç:** Rapor Envanteri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `RPT-003 != "rapor_envanteri_bulunmamaktadir"`
- **Açıklama:** Rapor kirliliği, mükerrerlik ve kullanılmayan raporların ayıklanması.
- **Seçenekler:**
  - `duzenli_kullanim_istatistikleri_izlenir_atil_raporlar_arsivlenir`: Kullanım logları ve açılma sıklıkları takip edilir; kullanılmayan veya mükerrer raporlar düzenli olarak sistemden kaldırılır
  - `yilda_bir_manuel_gozden_gecirme_yapilir`: Yılda bir kez ekiplerle toplantı yapılarak ihtiyaç duyulmayan raporlar temizlenmeye çalışılır
  - `rapor_temizligi_yapilmaz_yuzlerce_atil_rapor_birikmistir`: Temizlik yapılmaz; sistemlerde geçmişten kalan yüzlerce atıl, mükerrer ve kimin kullandığı bilinmeyen rapor birikmiştir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Rapor Havuzu Temizliği ve bakım maliyetlerini belirler.

---

### 3. Veri Kaynakları

#### [RPT-005] Kurumsal raporlama ve analitik için beslenilen veri kaynakları (ERP, CRM, WMS/Lojistik, E-Ticaret, Üretim/MES, İK/Bordro, Banka/Hazine, Harici Excel) kaç farklı sistemden oluşmaktadır?
- **Süreç:** Veri Kaynakları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlamayı besleyen operasyonel veri kaynaklarının çeşitliliği ve dağıtıklığı.
- **Seçenekler:**
  - `tek_bir_entegre_erp_sistemi_ana_kaynaktir`: Tüm kurumsal süreçler (Muhasebe, Satış, Stok, Üretim, İK) tek bir merkezi ERP'de toplanmıştır ve ana kaynaktır
  - `erp_arti_2_4_farkli_ozel_yazilim_ve_harici_veritabani`: ERP yanında CRM, E-Ticaret, WMS veya Üretim/MES gibi 2-4 farklı bağımsız yazılım/veritabanı bulunmaktadır
  - `5_veya_daha_fazla_parcali_sistem_ve_yogun_excel_kaynagi`: 5'ten fazla bağımsız yazılım, eski miras sistemler (Legacy) ve çok sayıda harici Excel tablosu bir arada kullanılmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri Entegrasyon Mimarisi ve Konnektör gereksinimlerini belirler.

#### [RPT-006] Farklı kaynak sistemlerden (Örn. ERP vs CRM vs E-Ticaret) gelen verilerin raporlama için konsolidasyonu ve çapraz sistem mutabakatı nasıl sağlanmaktadır?
- **Süreç:** Veri Kaynakları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Çapraz veri kaynaklarının birleştirilmesi ve mutabakat yöntemi.
- **Seçenekler:**
  - `otomatik_veri_ambari_ve_entegrasyon_hatlari_ile_mutabik`: Veri ambarı (DWH) ve ETL katmanında ortak anahtarlarla (Master ID) otomatik birleştirilir ve mutabakat sağlanır
  - `analistler_tarafindan_excelde_vlookup_ile_birlestirilir`: Sistemler arası otomatik köprü yoktur; her sistemden veri dışa aktarılıp Excel'de formüllerle eşleştirilir *(Not Alınabilir)*
  - `sistemler_arasi_capraz_raporlama_ve_mutabakat_yapilamamaktadir`: Farklı sistemlerin verileri birleştirilememekte, her sistem yalnızca kendi içinde izole raporlanmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Çapraz Sistem Entegrasyonu ve Veri Eşleştirme (Data Matching) altyapısını belirler.

---

### 4. Tek Doğruluk Kaynağı

#### [RPT-007] Şirket genelinde tüm departmanların (Satış, Finans, Tedarik, Üretim) aynı metrikleri tek bir kurumsal veri kaynağından okuduğu Tek Doğruluk Kaynağı (Single Source of Truth) mimarisi mevcut mudur?
- **Süreç:** Tek Doğruluk Kaynağı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kurumsal tek doğruluk kaynağı (SSOT) olgunluk seviyesi.
- **Seçenekler:**
  - `tam_merkezi_tek_dogruluk_kaynagi_kuruludur`: Evet; tüm raporlar ve dashboardlar doğrulanmış merkezi veri modeli/ambarı üzerinden beslenir, alternatif kaynak yasaktır
  - `finans_icin_ssot_vardir_diger_birimler_kendi_verisini_tutar`: Finans ve muhasebe için ERP tek kaynaktır; ancak Satış, Pazarlama veya Lojistik kendi bağımsız kayıtlarına bakar
  - `tek_dogruluk_kaynagi_yoktur_parcali_ve_celiskili_kaynaklar_vardir`: Hayır; her departman kendi veritabanından veya Excel tablosundan rapor üretir, ortak bir doğru kaynak yoktur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Kurumsal SSOT ve Veri Ambarı Konsolidasyon önceliğini belirler.

#### [RPT-008] Üst yönetim veya icra kurulu toplantılarında farklı departmanların sunduğu aynı metriğe (Ciro, Brüt Kâr, Stok Değeri, Müşteri Sayısı) ait rakamların uyuşmaması ve rakam tartışması (Data Discrepancy) yaşanmakta mıdır?
- **Süreç:** Tek Doğruluk Kaynağı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Veri tutarsızlığı, güven erozyonu ve yönetim toplantılarındaki rakam tartışmaları.
- **Seçenekler:**
  - `asla_yasanmaz_tum_yoneticiler_ayni_dogrulanmis_raporu_kullanir`: Hayır; tüm yöneticiler aynı merkezi rapordan baktığı için toplantılarda rakam doğruluğu değil iş kararları tartışılır
  - `sik_sik_yasanir_toplanti_zamaninin_onemli_kismi_rakam_tartismasiyla_gecer`: Evet, sıkça yaşanır; örneğin Satış cirosu ile Muhasebe cirosu farklı çıkar ve hangi rakamın doğru olduğu tartışılır *(Not Alınabilir)*
  - `ara_sira_zamanlama_veya_filtre_farklarindan_dolayi_olur`: Zaman zaman yaşanır; faturalaşmamış irsaliyeler, iadeler veya tarih filtreleri farkından kaynaklı geçici farklar çıkar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Karar Verici Güven Seviyesi ve Raporlama Standardizasyonu ihtiyacını belirler.

---

### 5. Veri Güncelliği

#### [RPT-009] Raporlarda sunulan verilerin güncellenme sıklığı ve gecikme süresi (Real-Time Canlı, Saatlik, Gecelik/Daily, Aylık Kapanış Sonrası) iş kararlarını destekleyecek düzeyde midir?
- **Süreç:** Veri Güncelliği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Veri tazeliği, yenileme periyodu ve operasyonel gecikme.
- **Seçenekler:**
  - `kritik_operasyonlar_canli_veya_saatlik_yonetim_gecelik_guncellenir`: Kritik operasyonlar (Stok, Satış, Sevkiyat) anlık/saatlik; yönetim özetleri ise her gece otomatik yenilenir
  - `tum_raporlar_yalnizca_gecelik_aktarimla_dune_ait_veriyi_gosterir`: Tüm raporlama katmanı gecelik (T-1) veriyle çalışır; gün içi operasyonel durum görülemez
  - `veriler_ay_kapanisindan_sonra_manuel_guncellenir_gecikme_coktur`: Raporlar ay kapanışı beklendikten sonra 10-15 gün gecikmeyle güncellenir; güncel karar almak zordur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri Yenileme Periyotları (Data Refresh Frequency) ve Canlı Bağlantı (DirectQuery vs Import) mimarisini belirler.

#### [RPT-010] Rapor ve gösterge panellerinde verinin ne zaman yenilendiğine dair Zaman Damgası (Last Refresh Timestamp) ve veri kesinti alarmları kullanıcılara gösterilmekte midir?
- **Süreç:** Veri Güncelliği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Veri yenilenme şeffaflığı ve veri kesintisi farkındalığı.
- **Seçenekler:**
  - `her_raporda_net_tarih_saat_gorunur_hata_durumunda_alarm_verilir`: Evet; her raporun üstünde 'Son Güncelleme: GG.AA.YYYY SS:dd' görünür, veri aktarımı gecikirse uyarı çıkar
  - `tarih_bilgisi_yazmaz_kullanici_verinin_guncel_oldugunu_varsayar`: Zaman damgası yoktur; kullanıcı verinin güncel olduğunu varsayar ancak bazen eski veriyi analiz eder *(Not Alınabilir)*
  - `veri_yenileme_zamani_bilinmemektedir`: Verinin hangi tarihe/saate ait olduğu bilinmemekte, manuel kontrollerle anlaşılmaya çalışılmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Rapor Arayüz Standartları ve Veri Tazeliği Şeffaflığını belirler.

---

### 6. Veri Kalitesi

#### [RPT-011] Kaynak sistemlerdeki eksik veri, mükerrer kayıt, format uyumsuzluğu veya hatalı girişlerin raporlara yansımasını önleyen otomatik Veri Kalitesi ve Doğrulama Kuralları bulunmakta mıdır?
- **Süreç:** Veri Kalitesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Veri temizliği, anomali tespiti ve veri kalitesi güvencesi.
- **Seçenekler:**
  - `otomatik_veri_kalite_kurallari_ve_anomali_kontrolleri_aktif`: Giriş anında zorunlu alanlar, format doğrulamaları ve ETL aşamasında otomatik anomali/mükerrerlik kontrolleri çalışır
  - `hatalar_rapor_asamasinda_fark_edilip_kaynakta_manuel_duzeltilir`: Otomatik kural yoktur; raporda saçma rakam veya eksik bilgi görüldüğünde kaynak sisteme dönülüp düzeltilir
  - `hatali_ve_mukerrer_veriler_raporlara_aynen_yansir_temizlenemez`: Kaynak sistemlerde çok fazla kirli/mükerrer veri vardır ve raporlar bu hataları aynen yansıtır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri Kalitesi Yönetim Katmanı (Data Quality Firewall) gereksinimini belirler.

#### [RPT-012] Ürün grubu, müşteri sektörü, bölge kodu veya masraf merkezi gibi Ana Veri (Master Data) sınıflandırma hataları raporlarda yanlış analiz ve sapmalara yol açmakta mıdır?
- **Süreç:** Veri Kalitesi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Ana veri kalitesinin yönetsel raporlamaya doğrudan etkisi.
- **Seçenekler:**
  - `ana_veri_yonetimi_cok_disiplinlidir_siniflandirma_hatasi_yoktur`: Ana veri açılışları onay akışına bağlıdır; ürün, müşteri ve masraf merkezi sınıflandırmaları son derece standarttır
  - `sik_sik_tanimsiz_veya_diger_kategorisinde_toplanan_kayitlar_olur`: Kullanıcılar kart açarken zorunlu alanları 'Diğer/Tanımsız' seçtiği için raporlarda büyük 'Tanımsız' grupları oluşur *(Not Alınabilir)*
  - `ana_veri_tamamen_kontrolsuz_acilir_segment_raporlari_guvenilmezdir`: Herkes serbestçe kart açabilmektedir; mükerrer kartlar ve yanlış kodlar nedeniyle kârlılık/segment raporları güvenilmezdir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Ana Veri Yönetimi (MDM) ve Veri Standardizasyonu önceliğini belirler.

---

### 7. Veri Sahipliği

#### [RPT-013] Kurumsal veri varlıklarının (Müşteri Ana Verisi, Malzeme Kartları, Finansal Rakamlar, Stok Verileri) Veri Sahipleri (Data Owners / Data Stewards) ve veri yönetim sorumlulukları tanımlı mıdır?
- **Süreç:** Veri Sahipliği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Veri sahipliği, sorumluluk matrisi ve veri yönetişimi organizasyonu.
- **Seçenekler:**
  - `her_veri_alani_icin_resmi_veri_sahibi_ve_yetki_matrisi_belirlidir`: Evet; örneğin müşteri verisinin sahibi Satış Operasyon, malzeme verisinin sahibi Ürün Yönetimi olarak atanmıştır
  - `gayriresmi_olarak_bilinir_ancak_yazili_prosedur_yoktur`: Kimin sorumlu olduğu kabataslak bilinir ancak yazılı bir veri sahipliği matrisi veya denetimi yoktur
  - `veri_sahipligi_tamamen_it_departmanina_yuklenmistir`: İş birimleri sorumluluk almaz; tüm veri hataları ve düzeltmeleri IT ekibinin sorumluluğunda görülür *(Not Alınabilir)*
  - `veri_sahibi_tanimi_bulunmamaktadir`: Şirkette veri sahipliği kavramı tanımlı değildir; verinin doğruluğundan kimse doğrudan sorumlu değildir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri Yönetişim Komitesi ve Sorumluluk Atama Modelini belirler.

#### [RPT-014] Departmanlar arasında veri paylaşımı, veri gizliliği veya veri düzeltme yetkileri konusunda net kurallar ve veri yönetişimi (Data Governance) prosedürleri uygulanmakta mıdır?
- **Süreç:** Veri Sahipliği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Veri yönetişim prosedürleri, düzeltme protokolleri ve veri gizliliği.
- **Seçenekler:**
  - `veri_yonetisimi_komitesi_ve_resmi_politikalari_mevcuttur`: Veri politikaları yazılıdır; veri düzeltme, paylaşım ve yetkilendirme standart prosedürlerle işletilir
  - `sadece_kvkk_kapsaminda_temel_guvenlik_kurallari_uygulanir`: Veri yönetişimi yoktur; yalnızca yasal KVKK/gizlilik kuralları çerçevesinde temel kısıtlamalar uygulanır
  - `veri_duzeltme_ve_paylasim_tamamen_kontrolsuzdur`: Net kurallar yoktur; departmanlar istedikleri gibi veri değiştirebilmekte veya paylaşabilmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri Yönetişim Standartları ve Kurumsal Güvenlik Politikalarını belirler.

---

### 8. Veri Modeli

#### [RPT-015] Raporlama ve analitik ihtiyaçları için tasarlanmış kurumsal bir Semantik Veri Modeli (Star Schema, Fact-Dimension tabloları, merkezi ölçü ve hiyerarşi tanımları) bulunmakta mıdır?
- **Süreç:** Veri Modeli
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Boyutsal modelleme, analitik veri şeması ve semantik katman.
- **Seçenekler:**
  - `merkezi_boyutsal_model_star_snowflake_schema_kuruludur`: Evet; Fact ve Dimension tablolarından oluşan, ilişkileri optimize edilmiş kurumsal semantik model vardır
  - `erpye_dogrudan_sql_viewsorgulari_yazilarak_raporlanir`: Ayrı bir semantik model yoktur; ERP veritabanı tablolarına karmaşık SQL View veya sorgular yazılarak rapor çekilir
  - `veri_modeli_yoktur_duz_tablolar_excelde_birlestirilir`: İlişkisel bir raporlama modeli yoktur; ham listeler dışa aktarılıp Excel'de tablolara dönüştürülür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Semantik Katman (Semantic Layer) ve Boyutsal Veri Modeli mimarisini belirler.

#### [RPT-016] Şirket, şube, mali takvim, departman, müşteri ve ürün gibi Ortak Boyutlar (Conformed Dimensions) tüm analitik raporlarda standart ve tutarlı şekilde kullanılabilmekte midir?
- **Süreç:** Veri Modeli
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Boyut standardizasyonu ve çapraz fonksiyonel analiz uyumu.
- **Seçenekler:**
  - `ortak_boyutlar_tum_fonksiyonlarda_standart_ve_tutalidir`: Evet; Satış, Finans ve Tedarik aynı müşteri hiyerarşisini, ortak takvimi ve ortak ürün ağacını kullanır
  - `departmanlar_arasi_boyut_ve_hiyerarsi_tanimlari_farklidir`: Satışın ürün grubu ile Muhasebenin ürün grubu farklıdır; raporlar birbirine uydurulmaya çalışılır *(Not Alınabilir)*
  - `ortak_boyut_kavrami_bulunmamaktadir`: Ortak boyut standardı yoktur; her rapor kendi bağımsız sınıflandırmasını kullanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Ortak Boyutlar (Conformed Dimensions) ve Master Data Konsolidasyonunu belirler.

---

### 9. Veri Ambarı / Data Warehouse

#### [RPT-017] Operasyonel sistemlerin yükünü hafifletmek ve tarihsel analiz yapmak amacıyla merkezi bir Veri Ambarı (DWH) veya Departman Veri Pazarları (Data Marts) kullanılmakta mıdır?
- **Süreç:** Veri Ambarı / Data Warehouse
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Veri ambarı (DWH / Data Mart) mimarisi ve canlı sistem izolasyonu.
- **Seçenekler:**
  - `kurumsal_veri_ambari_dwh_ve_departman_data_martlari_aktif`: Evet; operasyonel ERP'den izole çalışan, yüksek performanslı bir Kurumsal Veri Ambarı (DWH) aktiftir
  - `sadece_basit_bir_raporlama_veritabani_replikasi_vardir`: DWH yoktur; canlı veritabanının salt okunur (Read-Only) gecelik kopyası üzerinde sorgu çalıştırılır
  - `veri_ambari_veya_data_mart_kullanilmamaktadir`: Veri ambarı kullanılmamaktadır; tüm raporlar doğrudan canlı ERP veritabanından çekilir veya Excel'de tutulur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** DWH Altyapı Yatırımı ve Analitik Veri Tabanı Mimarisi seçimini belirler.

#### [RPT-018] Veri ambarında değişen ana veri geçmişi (Slowly Changing Dimensions - SCD Type 2) ve dönemsel anlık durum görüntüleri (Historical Snapshots) saklanmakta mıdır?
- **Süreç:** Veri Ambarı / Data Warehouse
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `RPT-017 != "veri_ambari_veya_data_mart_kullanilmamaktadir"`
- **Açıklama:** Tarihsel ana veri değişimi ve zaman içindeki gerçeği raporlama.
- **Seçenekler:**
  - `scd_type_2_ile_tarihsel_organizasyon_ve_segment_degisimleri_saklanir`: Evet; müşteri segmenti, ürün grubu veya plasiyer bölgesi değişse bile geçmiş satışlar o günkü haliyle raporlanabilir
  - `sadece_guncel_durum_saklanir_gecmis_veriler_yeni_koda_gore_degisir`: Tarihsel geçmiş tutulmaz; bir ürünün kategorisi değiştiğinde geçmiş tüm yılların cirosu da yeni kategoriye kayar *(Not Alınabilir)*
  - `tarihsel_snapshot_veya_scd_uygulanmamaktadir`: Tarihsel snapshot mantığı bilinmemekte veya uygulanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Tarihsel Veri Saklama (Historical Snapshot / SCD) kurgusunu belirler.

---

### 10. ETL / ELT ve Veri Yükleme

#### [RPT-019] Kaynak sistemlerden raporlama ortamına veri aktarımı (ETL / ELT) hangi yöntemle (Otomatik Zamanlanmış Pipeline, Veritabanı Trigger/CDC, Manuel Veri Aktarımı) yürütülmektedir?
- **Süreç:** ETL / ELT ve Veri Yükleme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Veri aktarım boru hatları (Data Pipelines) ve otomasyon derecesi.
- **Seçenekler:**
  - `otomatik_zamanlanmis_veya_cdc_veri_aktarim_araclari_ile_yurutulur`: Kurumsal ETL/ELT araçları veya Değişim Verisi Yakalama (CDC) ile veri aktarımı tamamen otomatik ve zamanlanmıştır
  - `ozel_yazilmis_sql_scriptleri_ve_cron_joblar_ile_aktarilir`: Özel yazılmış SQL prosedürleri ve görev zamanlayıcıları ile gece saatlerinde aktarım yapılır
  - `manuel_veri_aktarimi_veya_etl_yoktur`: Otomatik bir veri aktarımı yoktur; ihtiyaç duyuldukça personel manuel veri çeker
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** ETL/ELT Pipeline Araçları ve Entegrasyon Otomasyonunu belirler.

#### [RPT-020] Veri aktarım süreçlerinde Artımlı Yükleme (Incremental Load) ve veri yükleme hata loglama/izleme (ETL Job Monitoring) mekanizması işletilmekte midir?
- **Süreç:** ETL / ELT ve Veri Yükleme
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `RPT-019 != "manuel_veri_aktarimi_veya_etl_yoktur"`
- **Açıklama:** Veri aktarım performansı, artımlı yükleme ve arıza takip mekanizması.
- **Seçenekler:**
  - `artimli_yukleme_ve_otomatik_hata_alarm_bildirimi_mevcuttur`: Yalnızca değişen/eklenen kayıtlar aktarılır (Incremental); aktarım kesilirse IT ekibine anında SMS/E-posta alarmı gider
  - `her_gece_tum_tablolar_bastan_sona_full_load_yuklenir`: Artımlı yükleme yoktur; her gece tüm veritabanı sıfırdan aktarılır (Full Load), bu da aktarım süresini çok uzatır *(Not Alınabilir)*
  - `aktarim_hatalari_ancak_kullanicilar_sikayet_edince_fark_edilir`: Job izleme ve loglama zayıftır; veri aktarımının durduğu ancak raporlar eksik çıkınca kullanıcılar tarafından anlaşılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri Boru Hattı Güvenilirliği ve İzleme (Monitoring) altyapısını belirler.

---

### 11. BI ve Dashboard Platformları

#### [RPT-021] Şirketinizde kurumsal seviyede bir İş Zekası (BI) ve Gösterge Paneli (Dashboard) platformu (Kurumsal BI Araçları, Web Görselleştirme Kokpitleri) aktif olarak kullanılmakta mıdır?
- **Süreç:** BI ve Dashboard Platformları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** İş zekası platformunun benimsenme ve yaygınlık durumu.
- **Seçenekler:**
  - `tum_yonetici_ve_calisanlarin_aktif_kullandigi_kurumsal_bi_vardir`: Evet; şirket genelinde yaygın olarak kullanılan lisanslı kurumsal bir BI platformu ve dashboard kokpitleri vardır
  - `sadece_belirli_bir_ekip_veya_yonetim_tarafindan_kisitli_kullanilir`: BI platformu vardır ancak yalnızca birkaç analist veya üst yönetim tarafından sınırlı sayıda ekranda kullanılır
  - `kurumsal_bi_platformu_kullanilmamaktadir`: Şirketimizde herhangi bir BI veya analitik görselleştirme platformu kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Kurumsal BI Platform Seçimi ve Lisanslama Stratejisini belirler.

#### [RPT-022] İş zekası gösterge panellerinde interaktif filtreleme, ayrıntıya inme (Drill-Down / Drill-Through) ve çapraz boyut analizi yetenekleri kullanıcılar tarafından ne sıklıkla kullanılmaktadır?
- **Süreç:** BI ve Dashboard Platformları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `RPT-021 != "kurumsal_bi_platformu_kullanilmamaktadir"`
- **Açıklama:** İnteraktif analiz derinliği ve görselleştirme etkinliği.
- **Seçenekler:**
  - `grafikten_faturaya_kadar_drill_down_derinligi_aktif_kullanilir`: Kullanıcılar özet grafikten tıklayarak alt ürün grubuna, müşteriye ve ilgili kaynak faturaya kadar inebilmektedir
  - `sadece_statik_grafikler_ve_basit_tarih_filtreleri_kullanilir`: Yalnızca statik grafik görünümleri incelenir; derinlemesine drill-down veya çapraz analiz yapılmaz
  - `kullanicilar_dashboarda_bakmak_yerine_veriyi_excele_alir`: Dashboard olmasına rağmen kullanıcılar detay analizi yapmak için veriyi hemen Excel'e aktarmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Dashboard Kullanıcı Deneyimi (UX) ve Detay Seviyesi tasarımını belirler.

---

### 12. Self-Service Analytics

#### [RPT-023] İş birimi kullanıcıları (Satış, Satın Alma, Finans, Üretim) IT veya raporlama uzmanına bağımlı olmadan kendi rapor, pivot tablo veya grafik görünümlerini (Self-Service Analytics) oluşturabilmekte midir?
- **Süreç:** Self-Service Analytics
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Kullanıcıların kendi analitik raporlarını tasarlayabilme serbestisi.
- **Seçenekler:**
  - `kullanicilar_dogrulanmis_veri_modelinden_kendi_raporunu_kolayca_tasarlar`: Evet; onaylı veri modelleri üzerinden sürükle-bırak yöntemiyle kullanıcılar kendi pivot ve grafiklerini oluşturabilir
  - `sadece_onceden_hazirlanmis_raporlardaki_filtreleri_degistirebilirler`: Yeni rapor tasarlayamazlar; yalnızca kendilerine sunulan sabit şablonlarda tarih ve şube filtrelerini seçebilirler
  - `self_service_raporlama_yoktur`: Self-service imkanı yoktur; en ufak bir sütun veya filtre değişikliği için bile IT/yazılımcıya talep açılmak zorundadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Self-Service Analitik Araçları ve Eğitim Programı ihtiyacını belirler.

#### [RPT-024] Self-service rapor oluşturmada kurumsal güvenlik kuralları, veri sınırlandırmaları ve yetkisiz sorgu yükü denetimi (Governance) nasıl sağlanmaktadır?
- **Süreç:** Self-Service Analytics
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `RPT-023 != "self_service_raporlama_yoktur"`
- **Açıklama:** Self-service analitikte güvenlik, kaynak tüketimi ve rapor kaosu kontrolü.
- **Seçenekler:**
  - `merkezi_semantik_model_ile_yetkisiz_erisim_ve_asiri_yuk_engellenir`: Kullanıcılar yalnızca yetkili oldukları boyutları görür; optimize edilmiş semantik model sistemi kilitlenmelere karşı korur
  - `kontrol_zayiftir_agir_sorgular_bazen_sistemi_yavaslatir`: Yönetişim zayıftır; kullanıcıların yazdığı kontrolsüz sorgular zaman zaman veritabanı performansını düşürür *(Not Alınabilir)*
  - `self_service_raporlama_icin_herhangi_bir_denetim_yoktur`: Herhangi bir güvenlik veya kaynak kısıtlaması uygulanmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Self-Service Yönetişim (Self-Service Governance) ve Kota Yönetimini belirler.

---

### 13. Excel Bağımlılığı

#### [RPT-025] Yönetim raporlarının üretilmesinde ERP/sistemlerden veri dışa aktarma (Export) ve manuel Excel birleştirme bağımlılığı hangi düzeydedir?
- **Süreç:** Excel Bağımlılığı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlama süreçlerinde Excel operasyonel iş yükü ve bağımlılık derecesi.
- **Seçenekler:**
  - `cok_yuksek_tum_kritik_yonetim_raporlari_excelde_birlestirilerek_cikar`: Çok yüksek; ERP'den onlarca liste Excel'e aktarılır, saatlerce formüllerle işlenerek yönetim raporu haline getirilir *(Not Alınabilir)*
  - `orta_duzey_standart_raporlar_sistemden_ozel_analizler_excelden_alinir`: Orta düzey; rutin raporlar sistemden alınır ancak yönetim sunumları ve derin analizler Excel'de toparlanır
  - `dusuk_tum_raporlar_sistem_tarafindan_otomatik_ve_eksiksiz_sunulur`: Düşük; tüm operasyonel ve yönetim raporları doğrudan ERP/BI sistemi üzerinden interaktif görüntülenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Excel Bağımlılığından Kurtulma (De-Excelization) ve Raporlama Otomasyonu önceliğini belirler.

#### [RPT-026] Kritik raporların üretimi belirli kişilerin bilgisayarlarında saklanan özel Excel şablonlarına, karmaşık formüllere (VLOOKUP/XLOOKUP) veya makrolara (VBA) bağımlı mıdır?
- **Süreç:** Excel Bağımlılığı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kişiye bağımlılık, kurumsal hafıza riski ve Excel formül kırılganlığı.
- **Seçenekler:**
  - `tamamen_belirli_kisilere_ve_onlarin_ozel_excel_makrolarina_bagimlidir`: Evet; ilgili uzman izinli olduğunda veya işten ayrıldığında raporların nasıl hazırlandığını kimse çözememektedir *(Not Alınabilir)*
  - `ortak_ag_klasorunde_sablonlar_vardir_ancak_formuller_karmasiktir`: Dosyalar ortak klasördedir ancak karmaşık formüller nedeniyle formül bozulması ve hata riski yüksektir
  - `kisisel_excele_ve_makrolara_herhangi_bir_bagimlilik_yoktur`: Hayır; tüm analitik kurallar ve hesaplamalar merkezi sistemde tanımlıdır, kişilere bağımlılık yoktur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Kurumsal Bilgi Güvenliği ve Süreç Sürdürülebilirliği risk analizini belirler.

#### [RPT-027] Excel üzerinde yapılan manuel veri manipülasyonları, formül kaymaları veya bozuk dosya sürümleri sebebiyle raporlarda yaşanan zaman kaybı ve hata riski nedir?
- **Süreç:** Excel Bağımlılığı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Manuel operasyon riskleri, sürüm karmaşası ve güven kaybı.
- **Seçenekler:**
  - `ciddi_zaman_kaybi_ve_gecmiste_yanlis_yonetim_karari_riski_yasandi`: Ciddi boyutta; formül kayması veya yanlış kopyalama sebebiyle geçmişte hatalı rakamlar sunuldu ve güven zedelendi *(Not Alınabilir)*
  - `hatalar_cift_kontrol_ile_yakalaniyor_ancak_buyuk_is_gucu_israfi_var`: Hatalar son anda yakalanıyor ancak personelin vaktinin çoğu veri düzeltmek ve sağlama yapmakla heba oluyor
  - `excel_sureclerimizde_hata_veya_guvensizlik_yasanmamaktadir`: Excel modellerimiz oturmuştur, formül veya sürüm hatası yaşanmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Operasyonel Verimlilik ve Raporlama Hata Oranı azaltma hedeflerini belirler.

---

### 14. KPI Tanımları

#### [RPT-028] Şirket genelinde takip edilen kritik KPI ve performans metriklerinin hesaplama formülleri, veri kaynakları ve yorumlama kurallarını içeren bir Kurumsal Veri Sözlüğü / KPI Kataloğu mevcut mudur?
- **Süreç:** KPI Tanımları
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** KPI formül standardizasyonu ve kurumsal veri sözlüğü.
- **Seçenekler:**
  - `tam_tanimli_ve_onayli_kurumsal_kpi_sozlugu_mevcuttur`: Evet; EBITDA, Brüt Kâr, Müşteri Churn, OTIF, OEE gibi tüm KPI'ların formülü, veri kaynağı ve sahibi yazılıdır
  - `kpi_formulleri_departmanlara_gore_farklilik_gostermektedir`: Standart sözlük yoktur; örneğin 'Kârlılık' hesabı Satış departmanında farklı, Finans departmanında farklı formülle hesaplanır *(Not Alınabilir)*
  - `resmi_bir_kpi_ve_veri_sozlugu_bulunmamaktadir`: Şirketimizde tanımlı resmi bir KPI sözlüğü veya hesaplama kataloğu bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Kurumsal Metrik Kataloğu (Metric Catalog) ve KPI Yönetim Modeli tasarımını belirler.

#### [RPT-029] Raporlarda yer alan KPI hedefleri, tolerans eşikleri ve geçmiş dönem gerçekleşenleri aynı ekranda bağlamsal olarak karşılaştırılabilmekte midir?
- **Süreç:** KPI Tanımları
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** KPI bağlamı, hedef vs gerçekleşen ve dönem karşılaştırmaları.
- **Seçenekler:**
  - `hedef_gecen_yil_ve_butce_ile_renkli_esik_al राजनीतिक_karsilastirilir`: Evet; KPI değeri yanında hedefi, geçen yıl aynı dönem kıyası ve trafik ışığı renk göstergesiyle (Kırmızı/Sarı/Yeşil) sunulur
  - `sadece_fiili_rakam_gosterilir_hedef_ve_gecmis_ayri_bakilir`: Yalnızca o anki gerçekleşen rakam gösterilir; hedefe ulaşıp ulaşılmadığı başka tablodan kontrol edilir
  - `kpi_karsilastirmasi_yapilamamaktadir`: Dönemsel kıyaslama veya hedef karşılaştırması sistem üzerinden yapılamamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** KPI Görsel Kart Tasarımları ve Eşik Göstergelerini belirler.

---

### 15. Rapor Yetkilendirme

#### [RPT-030] Rapor ve gösterge panellerinde Rol Bazlı Güvenlik (Role-Based Access) ve Satır Bazlı Yetkilendirme (Row-Level Security / Kullanıcının yalnızca kendi bölge, bayi, departman veya kâr merkezini görmesi) nasıl uygulanmaktadır?
- **Süreç:** Rapor Yetkilendirme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlama güvenlik modeli ve satır bazlı veri kısıtlaması (RLS).
- **Seçenekler:**
  - `sistem_uzerinde_dinamik_satir_ve_sutun_bazli_rls_yetkilendirmesi_aktif`: Kullanıcı sisteme giriş yaptığında dinamik RLS ile yalnızca yetkili olduğu şirketi, şubeyi, bölgeyi ve bayiyi görür
  - `her_bolge_veya_departman_icin_ayri_rapor_dosyalari_kopyalanir`: Dinamik satır yetkisi yoktur; finans ekibi her bölge için ayrı Excel/PDF dosyası oluşturup ilgili kişiye gönderir *(Not Alınabilir)*
  - `satir_bazli_yetkilendirme_yoktur_raporu_acan_tum_sirketi_gorur`: Özel satır kısıtlaması yoktur; rapora erişim yetkisi olan herkes tüm Türkiye/şirket verisini görür
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Satır Bazlı Güvenlik (Row-Level Security - RLS) Mimarisini belirler.

#### [RPT-031] Maaş, kârlılık, birim maliyet, müşteri özel iskonto oranı gibi hassas ve gizli verilerin yetkisiz kişilerce görüntülenmesi ve dışarı sızdırılması nasıl engellenmektedir?
- **Süreç:** Rapor Yetkilendirme
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Hassas finansal/ticari verilerin korunması ve dışa aktarım kontrolleri.
- **Seçenekler:**
  - `sutun_bazli_maskeleme_ve_disa_aktarim_kisitlamalari_uygulanir`: Hassas sütunlar yetkisiz rollere gizlenir/maskelenir; raporun Excel/PDF olarak indirilmesi loglanır ve kısıtlanır
  - `rapor_seviyesinde_giris_yetkisi_vardir_ancak_alan_gizlenemez`: Rapora giren kullanıcı rapor içindeki maliyet veya maaş gibi tüm hassas kolonları da görür, alan kısıtlanamaz *(Not Alınabilir)*
  - `hassas_veriler_icin_ozel_bir_kisitlama_bulunmamaktadir`: Hassas veriler için özel bir güvenlik önlemi yoktur; kurumsal güvene dayalı çalışılmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Sütun Bazlı Güvenlik (Column-Level Security) ve Veri İndirme Kısıtlamalarını belirler.

---

### 16. Rapor Dağıtımı

#### [RPT-032] Yönetim ve operasyon raporlarının kullanıcılara ulaştırılması hangi yöntemle (Zamanlanmış Otomatik E-posta Dağıtımı, Self-Service Web Portalı, Mobil Bildirim, Manuel Gönderim) gerçekleştirilmektedir?
- **Süreç:** Rapor Dağıtımı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Rapor dağıtım kanalları ve otomasyon seviyesi.
- **Seçenekler:**
  - `zamanlanmis_otomatik_eposta_ve_web_portali_uzerinden_dagitilir`: Raporlar her sabah/hafta başı otomatik PDF/Excel olarak e-posta atılır ve web portalından erişilebilir
  - `raporlama_uzmani_hazirladikca_manuel_eposta_ile_gonderir`: Otomasyon yoktur; raporlama personeli raporu hazırlayıp yönetici listelerine manuel e-posta ile iletir
  - `duzenli_dagitim_yoktur_talep_eden_kisiye_ozel_gonderilir`: Düzenli bir dağıtım mekanizması yoktur; yönetici istedikçe rapor o an üretilip gönderilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Zamanlanmış Rapor Dağıtımı (Report Bursting & Scheduling) mimarisini belirler.

#### [RPT-033] Üst yönetim ve saha yöneticileri için Mobil Cihaz / Tablet üzerinden gösterge panellerine ve anlık KPI alarmlarına erişim ihtiyacı ne düzeydedir?
- **Süreç:** Rapor Dağıtımı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Mobil raporlama ihtiyacı, tablet uyumluluğu ve uzaktan karar desteği.
- **Seçenekler:**
  - `cok_yuksek_yoneticiler_cep_telefonu_ve_tabletten_anlik_takip_etmek_istiyor`: Çok yüksek; Yönetim Kurulu ve yöneticiler mobil uygulama üzerinden anlık satış, nakit ve KPI grafiklerini izlemek istemektedir
  - `orta_duzey_sadece_ofis_disindayken_mobil_erisim_isteniyor`: Orta düzey; seyahat ve saha durumlarında mobil erişim faydalı olur ancak ana kullanım masaüstü bilgisayardır
  - `mobil_erisim_ihtiyaci_bulunmamaktadir`: Mobil raporlama ihtiyacı yoktur; tüm raporlamalar ofis ortamında bilgisayar üzerinden yapılmaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Mobil BI Arayüzleri ve Responsive Dashboard gereksinimini belirler.

---

### 17. Rapor Performansı

#### [RPT-034] Yoğun veri içeren kritik operasyonel ve yönetsel raporların açılış ve çalışma süresi (Saniyeler içinde, 1-5 Dakika, 5 Dakika üzeri / Sistem Kilitlenmesi) nasıldır?
- **Süreç:** Rapor Performansı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Raporlama performansı, sorgu hızı ve sistem bekleme süreleri.
- **Seçenekler:**
  - `cok_hizli_tum_raporlar_1_5_saniye_icinde_acilir`: Çok hızlı; optimize edilmiş veri ambarı/indeksler sayesinde milyonlarca satır veri saniyeler içinde ekrana gelir
  - `orta_sure_raporun_gelmesi_30_saniye_ile_2_dakika_arasi_surer`: Kabul edilebilir; standart raporlar hızlı ancak geniş tarih aralığı seçildiğinde 1-2 dakika beklenir
  - `cok_yavas_raporlar_5_15_dakika_surmekte_veya_sistemi_kilitlemektedir`: Çok yavaş; büyük raporlar çalışırken ERP sistemi kilitlenir, zaman aşımı (Timeout) hatası alınır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veritabanı İndeksleme, Özet Tablolar (Aggregations) ve In-Memory motor seçimini belirler.

#### [RPT-035] Ağır rapor sorgularının canlı operasyonel ERP veritabanı (OLTP) performansını yavaşlatmasını önlemek için ayrı bir raporlama kopyası veya salt okunur replika kullanılmakta mıdır?
- **Süreç:** Rapor Performansı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** OLTP - OLAP veritabanı izolasyonu ve performans güvencesi.
- **Seçenekler:**
  - `canli_sistem_ile_raporlama_veritabani_tamamen_fiziksel_ayrilmistir`: Evet; rapor sorguları ayrı bir analitik sunucuya veya kopyaya yönlendirilir, canlı operasyon asla yavaşlamaz
  - `ayni_veritabaninda_calisir_agir_raporlar_mesai_disinda_cekilir`: Ayrı sunucu yoktur; sistem yavaşlamasın diye ağır raporların akşam mesai bitiminden sonra alınması istenir *(Not Alınabilir)*
  - `canli_sistemde_calisir_rapor_cekildiginde_kullanicilar_yavaslik_hisseder`: Tüm raporlar canlı sistemden çekilir; rapor çekildiğinde fatura kesen veya sipariş giren kullanıcılar yavaşlık yaşar *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Read-Replica ve Analitik Sunucu Altyapı İzolasyonunu belirler.

---

### 18. Veri Lineage ve İzlenebilirlik

#### [RPT-036] Bir raporda görülen nihai rakamın hangi kaynak tablodan, hangi işlem fişinden veya hangi hesaplama dönüşümünden geldiği (Veri Soykütüğü / Data Lineage) geriye doğru izlenebilmekte midir?
- **Süreç:** Veri Lineage ve İzlenebilirlik
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Veri soykütüğü (Data Lineage) ve denetlenebilirlik (Auditability).
- **Seçenekler:**
  - `verinin_kaynagi_ve_donusum_haritasi_belgelenmis_ve_izlenebilirdir`: Evet; rapordaki her bir sütunun kaynak tablosu, ETL dönüşüm kuralı ve hesaplama formülü şeffaf şekilde izlenebilir
  - `sadece_yazilimci_veya_raporu_yazan_kisi_kodun_icine_bakarak_anlayabilir`: Dokümante lineage yoktur; ancak SQL sorgusunu veya kodu yazan uzman kodları inceleyerek kaynağı bulabilir
  - `verinin_nereden_geldigi_ve_nasil_hesaplandigi_izlenememektedir`: Rakamın hangi mantıkla hesaplandığı veya nereden geldiği takip edilememekte, kara kutu olarak kalmaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Veri İzlenebilirlik Kataloğu (Metadata & Lineage Tool) gereksinimini belirler.

#### [RPT-037] Raporda bir rakam hatası veya tutarsızlık tespit edildiğinde hatanın kök nedeninin (Kaynak giriş hatası vs ETL dönüşüm hatası vs Rapor formülü hatası) tespiti ne kadar sürmektedir?
- **Süreç:** Veri Lineage ve İzlenebilirlik
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Hata kök neden analizi çevikliği ve sorun giderme süresi.
- **Seçenekler:**
  - `dakikalar_icinde_hata_kaynagi_ve_etkilenen_tablolar_tespit_edilir`: Dakikalar içinde; izleme logları ve veri sözlüğü sayesinde hatanın nerede oluştuğu anında bulunur ve düzeltilir
  - `tespit_etmek_saatler_veya_gunler_surebilmektedir`: Saatler veya günler sürer; birden fazla departman ve IT ekibi verileri karşılıklı kontrol etmek zorunda kalır *(Not Alınabilir)*
  - `hatalar_cogu_zaman_cozulememekte_uzerine_manuel_duzeltme_yapilmaktadir`: Kök neden bulunamaz; Excel üzerinde rakam elle düzeltilerek geçici çözümler üretilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Analitik Problem Çözme ve Veri Sorun Giderme Süreçlerini belirler.

---

### 19. Yönetim Karar Desteği

#### [RPT-038] Şirket üst yönetimi ve karar vericileri mevcut raporlama sisteminden alınan verilere ve özet rakamlara ne düzeyde güven duymaktadır?
- **Süreç:** Yönetim Karar Desteği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Raporlama güven endeksi ve yönetim karar alma kalitesi.
- **Seçenekler:**
  - `tam_guven_yonetim_kararlarini_dogrudan_bu_raporlara_dayandirir`: Tam güven; Yönetim Kurulu ve İcra Kurulu tüm stratejik ve operasyonel kararlarını doğrudan sistem raporlarıyla alır
  - `orta_duzey_guven_kritik_kararlarda_ek_saglama_ve_teyit_istenir`: Orta düzey güven; raporlar incelenir ancak büyük kararlarda finans ekibinden manuel teyit ve sağlama talep edilir
  - `dusuk_guven_yonetim_rakamlara_supheyle_bakar_sezgisel_karar_alir`: Düşük güven; sıkça hatalar çıktığı için yönetim raporlara şüpheyle yaklaşır, kararlar daha çok sezgisel alınır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Kurumsal Veri Güven Endeksi ve Yönetim Raporlama Reformu ihtiyacını belirler.

#### [RPT-039] Finans ve analitik ekiplerinin çalışma zamanının ne kadarı veri toplama ve rapor hazırlamaya, ne kadarı veriyi analiz edip iş kararlarına yön vermeye ayrılmaktadır?
- **Süreç:** Yönetim Karar Desteği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Rapor hazırlama eforu vs katma değerli analiz ve içgörü üretme oranı.
- **Seçenekler:**
  - `yuzde_20_hazirlik_yuzde_80_analiz_ve_yonetsel_icgoru`: İdeal oran; raporlar otomatik aktığı için zamanın %80'i iş kararlarına, kârlılık analizine ve iyileştirmeye ayrılır
  - `yuzde_50_hazirlik_yuzde_50_analiz`: Yarı yarıya; zamanın yarısı veri toparlamakla, kalan yarısı raporları sunmak ve yorumlamakla geçer
  - `yuzde_80_90_veri_birlestirme_ve_rapor_hazirlama_ile_gecer`: Yüksek operasyonel yük; analistlerin zamanının %80-90'ı Excel'de veri kopyalamakla geçer, analize vakit kalmaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Raporlama Otomasyonunun Yatırım Getirisi (ROI) ve İnsan Kaynağı Tasarrufunu belirler.

#### [RPT-040] Raporlama platformunda geleceğe yönelik İleri Analitik, Tahminleme (Predictive Analytics), Trend Analizi veya Senaryo Simülasyonları kullanılmakta mıdır?
- **Süreç:** Yönetim Karar Desteği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** İleri analitik olgunluğu, öngörücü modeller ve simülasyon araçları.
- **Seçenekler:**
  - `trend_tahminleme_ve_senaryo_simulasyonlari_aktif_kullanilir`: Evet; geçmiş trendler üzerinden satış tahminleri, churn olasılığı veya fiyat senaryosu simülasyonları yapılır
  - `sadece_gecmise_donuk_tanimlayici_descriptive_raporlar_vardir`: İleri analitik yoktur; raporlar yalnızca 'Geçmişte ne oldu?' sorusuna cevap veren gerçekleşen listeleridir
  - `ileri_analitik_veya_tahminleme_kullanilmamaktadir`: Şirketimizde tahminleme veya simülasyon araçları kullanılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** İleri Analitik (Advanced Analytics) Yol Haritası ve Makine Öğrenimi Hazırlığını belirler.

#### [RPT-041] Kritik operasyonel veya finansal eşikler aşıldığında (Örn. Stok kritik seviyenin altına düştüğünde, kârlılık negatife indiğinde) yöneticilere Otomatik Eşik Alarmları (Alerts / Notifications) iletilmekte midir?
- **Süreç:** Yönetim Karar Desteği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** İstisna bazlı yönetim (Management by Exception) ve otomatik uyarı mekanizmaları.
- **Seçenekler:**
  - `sistem_belirlenen_esiklerde_otomatik_eposta_veya_bildirim_gonderir`: Evet; örneğin tahsilat geciktiğinde veya stok kritik seviyenin altına indiğinde ilgili yöneticiye otomatik alarm düşer
  - `otomatik_alarm_yoktur_rapora_bakan_kisi_manuel_gorur`: Sistemik bildirim yoktur; eşik aşımı ancak kullanıcı raporu açıp tablodaki rakama dikkat ederse fark edilir
  - `esik_alarmi_mekanizmasi_kullanilmamaktadir`: Şirketimizde otomatik alarm veya eşik bildirimi mekanizması bulunmamaktadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** Proaktif Bildirim ve Eşik Uyarı Sistemi (Alerting Engine) gereksinimini belirler.

#### [RPT-042] ERP dönüşümü sonrasında hedeflenen Kurumsal Raporlama ve İş Zekası Mimarisi önceliği ve beklentisi nedir?
- **Süreç:** Yönetim Karar Desteği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), BI yatırımı öncelikleri ve kurumsal analitik beklentisi.
- **Seçenekler:**
  - `entegre_dwh_bi_ve_mobil_dashboard_ile_tam_otomasyon`: ERP ile tam entegre DWH, interaktif web/mobil dashboardlar ve Excel bağımlılığını tamamen bitiren otomasyon
  - `erp_yerlesik_raporlarinin_guvenilir_ve_hizli_calismasi_yeterlidir`: Ayrı bir BI platformu kurulmasa da olur; ERP içindeki standart raporların hızlı ve doğru çalışması yeterlidir
  - `verilerin_excele_kolay_ve_hatasiz_aktarilabilmesi_onceliklidir`: Kullanıcıların ERP'den Excel'e veri aktarımının kolaylaşması ve formüllerin standartlaştırılması hedeflenmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/BI Karar Etkisi:** ERP Dönüşüm Projesi BI & Raporlama İş Paketi Kapsamını belirler.
