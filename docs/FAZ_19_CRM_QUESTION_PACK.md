# FAZ-19 — Müşteri Yönetimi / CRM Soru Paketi Saha Kılavuzu

**Soru Paketi Kimliği:** `tr.crm.core`  
**Sürüm:** `0.1.0`  
**Kanonik İş Fonksiyonu:** `CRM` (Müşteri Yönetimi)  
**Dil:** Türkçe (`tr`)  
**Hedef Kitle:** Saha Danışmanları, Proje Yöneticileri, Satış Direktörleri, Müşteri Deneyimi (CX/CRM) Yöneticileri, Müşteri Hizmetleri Ekipleri ve Çözüm Mimarları  
**Amaç:** Türkiye'deki orta ve büyük ölçekli işletmelerde ERP/CRM dönüşümü öncesinde müşteri ana veri yapısı, potansiyel (lead) ve aday yönetimi, müşteri açılış ve VKN doğrulama süreçleri, kurumsal organizasyon ve hiyerarşi, iletişim kişileri, müşteri sınıflandırma ve segmentasyon, müşteri temsilcisi ataması ve portföy dağıtımı, Müşteri 360 görünümü, etkileşim ve görüşme geçmişi zaman çizelgesi, aktivite ve görev yönetimi, saha müşteri ziyaretleri, müşteri talep takibi, müşteri şikâyet ve geri bildirim yönetimi (SLA), müşteri memnuniyeti (CSAT/NPS), müşteri devir ve temsilci değişikliği, iletişim izinleri ve tercihler, müşteri veri kalitesi ve denetim izi (Audit Trail), mükerrer kayıt (Duplicate) engelleme ve CRM raporlama/KPI süreçlerinin AS-IS durumunu ve ERP/CRM gereksinimlerini belirlemek.

---

## 1. Modüller Arası Sınır Ayrımı ve Duplication Denetimi (Cross-Pack Duplication Audit)

| Modül | Temel Odak | CRM ile Sınır Çizgisi ve Ayrım |
|---|---|---|
| **SALES** | Fırsatlar (Opportunity), teklif hazırlama, fiyatlandırma kuralları, satış siparişleri (SO), satış hedefleri ve satış forecast | **SALES ticari satış aşamalarını sorgular.** CRM müşterinin kim olduğunu, iletişim kişilerini, hiyerarşisini, geçmiş temas/görüşme kütüğünü, açık şikâyetlerini ve müşteri 360 ekranındaki ilişki özetini sorgular. *(Fırsat → Teklif → Sipariş döngüsü CRM'de tekrarlanmaz)*. |
| **MARKETING** | Kampanya kurguları, hedef kitle yönetimi, toplu e-posta/SMS gönderimleri, lead generation ve kampanya ROI | **MARKETING pazarlama kampanyalarını sorgular.** CRM kampanyadan gelen adayın merkezi müşteri kartına dönüşmesini ve birebir ilişki takibini sorgular. |
| **REPORTING_ANALYTICS** | DWH/Data Mart mimarisi, ETL hatları, BI semantik modelleri, kurumsal raporlama performansı | **REPORTING_ANALYTICS veri altyapısını sorgular.** CRM operasyonel müşteri verisinin doğruluğunu, temas sıklığını ve müşteri memnuniyet KPI'larını sorgular. |
| **ACCOUNTING & TREASURY** | Resmi cari hesap defteri, yevmiye fişleri, fatura kayıtları, banka tahsilatları ve risk limiti | **Finansal omurga resmi muhasebe ve nakit hareketini sorgular.** CRM müşteri kartında satış temsilcisinin göreceği açık hesap bakiyesi ve risk özetini sorgular. |
| **QUALITY** | Fabrika kalite kontrolü, malzeme giriş kontrolü, NCR (Uygunsuzluk), CAPA ve fabrika kök neden analizleri | **QUALITY teknik ürün kalitesini sorgular.** CRM müşteri şikâyetinin alınmasını, temsilciye atanmasını, müşteri/siparişle bağlanmasını ve müşteriye geri dönüş SLA'sını sorgular. |
| **LEGAL_COMPLIANCE** | Hukuki mevzuat, yasal KVKK denetimi ve sözleşme hukuku | **LEGAL mevzuat ve uyumu sorgular.** CRM iletişim izin ve tercihlerinin operasyonel kaydını ve tarih damgasını sorgular. |
| **CRM** | Müşteri ana verisi, lead ayrımı, açılış onayı, hiyerarşi, kontaklar, segmentasyon, temsilci portföyü, müşteri 360, görüşme geçmişi, aktiviteler, saha ziyaretleri, talepler, şikâyetler, memnuniyet (NPS), temsilci devri, izinler, veri kalitesi, mükerrer kayıt, CRM KPI'ları | **Mükerrer soru yoktur (0 Overlap).** Tüm sorular müşteri ilişkileri, kurumsal hafıza ve veri kalitesi odağında yapılandırılmıştır. |

---

## 2. Süreç Başlıkları Özeti (19 Kanonik Süreç / 42 Soru)

1. **Müşteri Ana Veri Yapısı** (2 Soru — CRM-001, CRM-002)
2. **Potansiyel / Aday Müşteri Yönetimi** (2 Soru — CRM-003, CRM-004)
3. **Müşteri Açılış Süreci** (2 Soru — CRM-005, CRM-006)
4. **Müşteri Organizasyon ve Hiyerarşi Yapısı** (2 Soru — CRM-007, CRM-008)
5. **İletişim Kişileri** (2 Soru — CRM-009, CRM-010)
6. **Müşteri Sınıflandırma ve Segmentasyon** (2 Soru — CRM-011, CRM-012)
7. **Müşteri Sorumlusu / Temsilci Ataması** (2 Soru — CRM-013, CRM-014)
8. **Müşteri 360 Görünümü** (2 Soru — CRM-015, CRM-016)
9. **İletişim ve Etkileşim Geçmişi** (2 Soru — CRM-017, CRM-018)
10. **Aktivite / Görev / Hatırlatma Yönetimi** (2 Soru — CRM-019, CRM-020)
11. **Müşteri Ziyaretleri** (2 Soru — CRM-021, CRM-022)
12. **Müşteri Talep Yönetimi** (2 Soru — CRM-023, CRM-024)
13. **Şikâyet ve Geri Bildirim Yönetimi** (3 Soru — CRM-025, CRM-026, CRM-027)
14. **Müşteri Memnuniyeti** (2 Soru — CRM-028, CRM-029)
15. **Müşteri Devir / Temsilci Değişikliği** (2 Soru — CRM-030, CRM-031)
16. **İletişim Tercihleri ve İzin Bilgileri** (2 Soru — CRM-032, CRM-033)
17. **Müşteri Veri Kalitesi** (2 Soru — CRM-034, CRM-035)
18. **Mükerrer Kayıt Yönetimi** (2 Soru — CRM-036, CRM-037)
19. **CRM Raporlama ve KPI** (5 Soru — CRM-038, CRM-039, CRM-040, CRM-041, CRM-042)

---

## 3. Detaylı Soru Kataloğu

### 1. Müşteri Ana Veri Yapısı

#### [CRM-001] Şirketinizde müşteri ana verileri ve cari bilgileri hangi teknolojik ortamda (Merkezi CRM, Entegre ERP Cari Kartı, Bağımsız CRM + ERP Senkronizasyonu, Excel Tabloları) yönetilmektedir?
- **Süreç:** Müşteri Ana Veri Yapısı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Müşteri ana veri ortamı, operasyonel kayıt alanı ve sistem mimarisi.
- **Seçenekler:**
  - `merkezi_ve_entegre_erp_crm_tek_sistemde_yonetilir`: Tüm müşteri, aday ve cari bilgileri tek bir entegre ERP/CRM platformunda merkezi olarak tutulur
  - `bagimsiz_crm_yazilimi_ve_ayri_erp_cari_karti_kullanilir`: Müşteri ilişkileri bağımsız bir CRM yazılımında, faturalama ve cari hesaplar ayrı bir ERP'de tutulur *(Not Alınabilir)*
  - `yalnizca_erp_muhasebe_cari_kartlari_uzerinden_yurutulur`: Ayrı bir CRM yoktur; yalnızca ERP cari kartı ve temel müşteri listeleri üzerinden operasyon yürütülür
  - `excel_ve_kisisel_rehberler_uzerinde_daginik_tutulur`: Müşteri bilgileri satış temsilcilerinin kişisel Excel dosyalarında ve telefon rehberlerinde dağınıktır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Ana Veri Mimarisi ve entegrasyon modelini belirler.

#### [CRM-002] CRM ve ERP sistemleri arasında müşteri ana verisi entegrasyonu ve müşteri numaralandırma otoritesi (Hangi sistem cari kod üretir / iki yönlü senkronizasyon) nasıl kurgulanmıştır?
- **Süreç:** Müşteri Ana Veri Yapısı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteri kodu tekilliği, ana veri otoritesi ve CRM-ERP senkronizasyon disiplini.
- **Seçenekler:**
  - `tek_sistem_veya_otomatik_iki_yonlu_canli_senkronizasyon`: Tek sistemdir veya CRM'de onaylanan müşteri otomatik ERP cari kartı açar ve kodlar çift yönlü senkronize kalır
  - `erpde_manuel_kod_acilir_crme_elle_eslestirilir`: ERP'de finans ekibi cari kod açar; satış ekibi bu kodu CRM'deki müşteri kartına manuel yazar
  - `sistemler_arasi_entegrasyon_yoktur_ayri_kodlar_kullanilir`: Entegrasyon yoktur; aynı müşteri CRM'de ve ERP'de farklı kod ve unvanlarla kayıtlıdır *(Not Alınabilir)*
  - `tek_bir_sistem_vardir_ayri_senkronizasyon_ihtiyaci_yoktur`: Yalnızca tek bir sistem kullanıldığı için sistemler arası senkronizasyon ihtiyacı bulunmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Ana Veri Otoritesi (Master Authority) ve İki Yönlü Senkronizasyon kurallarını belirler.

---

### 2. Potansiyel / Aday Müşteri Yönetimi

#### [CRM-003] Henüz satış yapılmamış Potansiyel Müşteriler (Lead / Aday / Prospekt) ile ticari cari hesabı açılmış Gerçek Müşteriler sistemde nasıl ayrıştırılmaktadır?
- **Süreç:** Potansiyel / Aday Müşteri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Aday müşteri havuzu, ERP cari kirliliğinin önlenmesi ve lead ayrımı.
- **Seçenekler:**
  - `adaylar_ayri_lead_havuzunda_tutulur_erpye_cari_acilarak_kirletilmez`: Adaylar CRM'de ayrı bir 'Lead/Aday' statüsünde tutulur; satış kesinleşmeden ERP'ye cari kart açılmaz
  - `her_aday_icin_dogrudan_erpde_gecici_veya_normal_cari_acilir`: Adaylar için de doğrudan ERP'de cari hesap açılır; sistemde binlerce hiç alışveriş yapmamış boş cari oluşur *(Not Alınabilir)*
  - `aday_kayitlari_excelde_tutulur_musteri_olunca_erpye_girilir`: Adaylar satışçıların Excel tablolarında tutulur; ilk sipariş onaylandığında ERP'ye resmi giriş yapılır
  - `aday_ve_gercek_musteri_ayrimi_yapilmamaktadir`: Aday ve gerçek müşteri ayrımı yoktur; tüm kontaklar tek bir listede karışık tutulur
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Aday (Lead) Yönetimi ve ERP Cari Kirliliği İzolasyonu mimarisini belirler.

#### [CRM-004] Bir adayın gerçek müşteriye dönüşüm (Lead Conversion) onay kriterleri ve ERP cari kartı oluşturulma tetikleyicisi nasıldır?
- **Süreç:** Potansiyel / Aday Müşteri Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Adayın müşteriye dönüşüm tetikleyicisi, zorunlu alanlar ve onay akışı.
- **Seçenekler:**
  - `ilk_siparis_veya_sozlesme_onayi_ile_otomatik_donusturulur`: İlk sipariş veya resmi sözleşme onaylandığında zorunlu alanlar kontrol edilerek otomatik müşteriye dönüşür
  - `satis_temsilcisinin_manuel_butona_basmasiyla_donusturulur`: Satış temsilcisi adayı yeterince olgun gördüğünde tek tuşla dönüştürür; sistemik onay gerekmez
  - `finans_kredi_kontrol_onayi_sonrasi_donusturulur`: Finans/Muhasebe departmanı vergi levhası ve risk limitini onayladıktan sonra dönüşüm gerçekleşir *(Not Alınabilir)*
  - `resmi_bir_donusum_ve_onay_sureci_bulunmamaktadir`: Resmi bir dönüşüm süreci yoktur; ihtiyaç oldukça manuel olarak cari kart açılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Aday Dönüşüm Akışı (Lead Conversion Workflow) tetikleyicilerini belirler.

---

### 3. Müşteri Açılış Süreci

#### [CRM-005] Yeni bir müşteri kaydı açılırken hangi onay ve kontrol hiyerarşisi (Satış Temsilcisi -> Satış Müdürü -> Finans/Kredi Onayı) işletilmektedir?
- **Süreç:** Müşteri Açılış Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Müşteri ana veri açılış iş akışı ve çok kademeli onay disiplini.
- **Seçenekler:**
  - `satis_yoneticisi_ve_finans_kredi_onayindan_gecer`: Satış temsilcisi talep açar; Satış Müdürü ve Finans/Kredi İstihbarat birimi onayladıktan sonra müşteri aktifleşir
  - `sadece_satis_yoneticisinin_onayi_ile_acilir`: Yalnızca Satış Yöneticisi onaylar; finans birimi açılış sonrasında bilgilendirilir
  - `tum_satis_ekibi_onaysiz_serbestce_musteri_acabilir`: Herhangi bir onay süreci yoktur; yetkili tüm satış temsilcileri anında yeni müşteri açabilir *(Not Alınabilir)*
  - `yalnizca_muhasebe_finans_ekibi_musteri_acma_yetkisine_sahiptir`: Satış ekibi açamaz; satıştan gelen evraklara istinaden müşteri kaydını yalnızca Muhasebe/Finans ekibi açar
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Açılış Onay İş Akışı (Approval Workflow) tasarımını belirler.

#### [CRM-006] Müşteri açılışında resmi ticari unvan, vergi dairesi/numarası (GİB / VKN doğrulaması) ve adres doğrulaması sistemsel olarak nasıl kontrol edilmektedir?
- **Süreç:** Müşteri Açılış Süreci
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** GİB e-fatura/VKN entegrasyonu, resmi unvan teyidi ve adres standardizasyonu.
- **Seçenekler:**
  - `gib_vkn_sorgusu_ile_otomatik_dogrulanir_ve_e_fatura_mukellefligi_cekilir`: VKN/TCKN girildiğinde sistem GİB'den unvan, vergi dairesi ve e-Fatura/e-İrsaliye posta kutusu adresini otomatik çeker
  - `vergi_levhasi_manuel_kontrol_edilir_bilgiler_elle_yazilir`: Otomatik sorgulama yoktur; personeller vergi levhasına bakarak unvan ve vergi dairesini elle yazar
  - `dogrulama_yapilmaz_kullanicinin_yazdigi_bilgi_dogru_kabul_edilir`: Herhangi bir VKN veya e-fatura sorgusu yapılmaz; fatura kesilmeye çalışıldığında hata çıkarsa düzeltilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** GİB VKN/e-Fatura Entegrasyonu ve Müşteri Ana Veri Doğrulama kurallarını belirler.

---

### 4. Müşteri Organizasyon ve Hiyerarşi Yapısı

#### [CRM-007] Müşterilerinizin kurumsal hiyerarşi yapısı (Ana Firma, Holding/Grup Şirketleri, Şubeler, Bölge Bayileri, Mağazalar) sistemde nasıl modellenmektedir?
- **Süreç:** Müşteri Organizasyon ve Hiyerarşi Yapısı
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Müşteri organizasyon ağacı, ana/bağlı ortaklık hiyerarşisi ve şube yapıları.
- **Seçenekler:**
  - `cok_kademeli_holding_ana_firma_ve_sube_agaci_desteklenir`: Evet; Holding -> Grup Şirketi -> Şube/Mağaza şeklinde çok kademeli hiyerarşik ağaç modellenmiştir
  - `sadece_ana_cari_ve_alt_sube_baglantisi_kurulabilir`: Yalnızca basit 2 seviyeli (Ana Firma - Şube) ilişkisi kurulabilmektedir
  - `hiyerarsi_yapisi_kullanilmaz_her_cari_bagimsizdir`: Hiyerarşik yapı yoktur; tüm şubeler ve bağlı şirketler birbirinden bağımsız cari kartlar olarak açılır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Hiyerarşi Modeli ve konsolide hesap yönetimini belirler.

#### [CRM-008] Çok şubeli veya holding yapısındaki müşterilerde faturalama adresi, sevk adresi, konsolide risk ve sözleşme ilişkileri hiyerarşik olarak nasıl yönetilmektedir?
- **Süreç:** Müşteri Organizasyon ve Hiyerarşi Yapısı
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `CRM-007 != "hiyerarsi_yapisi_kullanilmaz_her_cari_bagimsizdir"`
- **Açıklama:** Hiyerarşik sözleşme, konsolide ciro/bakiye ve çoklu adres yönetimi.
- **Seçenekler:**
  - `ana_firmaya_faturalanip_subeye_sevk_ve_konsolide_risk_takibi_mumkundur`: Sözleşme ve fatura ana firmaya kesilirken sevk şubeye yapılabilir; holding risk limiti konsolide izlenebilir
  - `fatura_ve_sevk_ayrilabilir_ancak_konsolide_risk_izlenemez`: Adresler ayrılabilir ancak holding düzeyinde toplam ciro veya risk konsolidasyonu yapılamaz
  - `holding_ve_sube_iliskisi_excelde_manuel_hesaplanir`: Sistem hiyerarşik yönetemez; grup şirketlerin toplam bakiyesi Excel'de toplanarak manuel takip edilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Çoklu Sevk/Fatura Adresi ve Konsolide Risk Limiti kurgusunu belirler.

---

### 5. İletişim Kişileri

#### [CRM-009] Bir müşteri kartı altında birden fazla İletişim Kişisi (Kontak / Yetkili — Satın Alma Müdürü, Muhasebe Sorumlusu, Depo Şefi vb.) unvan, departman ve karar yetkisiyle tutulmakta mıdır?
- **Süreç:** İletişim Kişileri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Çoklu iletişim kişisi yönetimi, departman, rol ve karar verici işaretlemesi.
- **Seçenekler:**
  - `sinirsiz_iletisim_kisis_unvan_departman_ve_karar_rolu_ile_kayitlidir`: Evet; her müşteri altında sınırsız kontak, unvanı, cep telefonu, e-postası ve karar yetkisiyle tutulur
  - `sadece_1_veya_2_temel_yetkili_bilgisi_yazilabilir`: Müşteri kartında yalnızca 1-2 kişinin adı ve sabit telefonu için alan vardır, detaylı liste tutulamaz
  - `iletisim_kisileri_satiscilarin_kisisel_telefon_rehberinde_tutulur`: Sistemde kontak tutulmaz; yetkili bilgileri satış temsilcilerinin kişisel telefonlarında veya notlarındadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** İletişim Kişileri (Contact Persons) Veri Yapısı ve rol bazlı eşleştirmeleri belirler.

#### [CRM-010] Müşteri bünyesinde işten ayrılan veya pozisyonu değişen iletişim kişilerinin geçmiş ilişki ve görüşme kayıtları tarihsel olarak korunmakta mıdır?
- **Süreç:** İletişim Kişileri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kontak geçmişi, pasife alma ve ilişki devamlılığı.
- **Seçenekler:**
  - `ayrilan_kisi_pasife_alinir_gecmis_tum_gorusmeleri_korunur`: Evet; ayrılan kontak 'Pasif/Ayrıldı' işaretlenir, geçmiş görüşme kayıtları silinmeden korunur
  - `eski_kisinin_uzerine_yeni_gelen_kisinin_bilgileri_yazilir`: Yeni yetkili geldiğinde eski kişinin ismi silinip üzerine yazılır; geçmişte kiminle ne konuşulduğu kaybolur *(Not Alınabilir)*
  - `kontak_gecmisi_ve_ayrilma_takibi_yapilmamaktadir`: İletişim kişisi geçmişi takip edilmez; sistemdeki kontak listesi güncellenmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** İletişim Kişisi Tarihçesi (Contact Lifecycle & History) tasarımını belirler.

---

### 6. Müşteri Sınıflandırma ve Segmentasyon

#### [CRM-011] Müşteriler hangi kriterlere göre sınıflandırılmakta ve segmentlere (Stratejik / VIP / A-B-C Grubu, Sektör, Ciro Potansiyeli, Bölge) ayrılmaktadır?
- **Süreç:** Müşteri Sınıflandırma ve Segmentasyon
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteri segmentasyon kriterleri, sektör kodları ve ticari değer sınıflandırması.
- **Seçenekler:**
  - `cok_boyutlu_sektor_abc_grubu_ve_ciro_potansiyeline_gore_siniflandirilir`: Evet; sektör (NACE/özel), müşteri tipi (Bayi, Son Kullanıcı, OEM), A-B-C öncelik grubu ve ciro potansiyeli tanımlıdır
  - `sadece_basit_bir_sektor_veya_bolge_kodu_secilir`: Yalnızca temel bir sektör veya coğrafi bölge seçimi vardır; derin bir segmentasyon modeli yoktur
  - `musteri_siniflandirmasi_ve_segmentasyon_yapilmamaktadir`: Herhangi bir segmentasyon yapılmaz; tüm müşteriler aynı statüde ve aynı önemde listelenir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Segmentasyon Modeli ve Ticari Kategori matrisini belirler.

#### [CRM-012] Müşteri segmentleri ve müşteri statüleri (Aktif, Pasif, Potansiyel, Kayıp/Terk Müşteri - Churn) sistemde dinamik olarak güncellenmekte midir?
- **Süreç:** Müşteri Sınıflandırma ve Segmentasyon
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Müşteri yaşam döngüsü statüleri ve otomatik/periyodik segment güncellemesi.
- **Seçenekler:**
  - `alisveris_sikligina_gore_sistem_otomatik_aktif_pasif_ve_kayip_statuye_alir`: Evet; son 6/12 aydır sipariş vermeyen müşteri otomatik olarak 'Uykuda/Kayıp Riski' statüsüne geçer
  - `satis_ekibi_yilda_bir_statu_ve_segmentleri_manuel_gunceller`: Otomasyon yoktur; yılda bir kez satış yönetimi müşterilerin A-B-C sınıflarını manuel revize eder
  - `statu_ve_segmentler_hic_guncellenmez_acildigi_gibi_kalir`: Statüler güncellenmez; 10 yıldır hiç alışveriş yapmamış müşteriler bile sistemde 'Aktif' görünür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Dinamik Müşteri Statü Motoru ve Yaşam Döngüsü kurallarını belirler.

---

### 7. Müşteri Sorumlusu / Temsilci Ataması

#### [CRM-013] Her müşterinin birincil Satış Temsilcisi (Account Manager / Müşteri Temsilcisi) ve varsa ürün/bölge bazlı ikincil sorumluları sistemde nasıl tanımlanmaktadır?
- **Süreç:** Müşteri Sorumlusu / Temsilci Ataması
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Portföy sahipliği, sorumlu satış temsilcisi ve ikincil ürün/hizmet uzmanı atamaları.
- **Seçenekler:**
  - `her_musterinin_birincil_temsilcisi_ve_ikincil_urun_uzmanlari_net_tanimlidir`: Evet; müşteri kartında sorumlu ana temsilci, müşteri destek sorumlusu ve ilgili bölge yöneticisi kayıtlıdır
  - `sadece_tek_bir_satis_temsilcisi_kodu_secilebilir`: Kart üzerinde yalnızca tek bir satışçı kodu vardır; çoklu temsilci veya ürün uzmanı atanamaz
  - `temsilci_atamasi_sistemde_yoktur_kim_ilgilenirse_o_yurutur`: Müşteri kartlarında temsilci bağı yoktur; sahada hangi satışçı boşsa o müşteriye gider *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Portföy Sahipliği ve Çoklu Temsilci Atama Yapısını belirler.

#### [CRM-014] Sahipsiz / sorumlusu atanmamış müşteri kayıtlarının takibi ve temsilcilere müşteri havuzundan otomatik veya manuel dağıtım kuralları nasıldır?
- **Süreç:** Müşteri Sorumlusu / Temsilci Ataması
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Unassigned müşteri havuzu, lead dağıtım kuralları ve adil portföy yönetimi.
- **Seçenekler:**
  - `ortak_havuzdan_bolge_sektor_veya_round_robin_ile_otomatik_atanir`: Gelen yeni müşteriler/adaylar bölge, sektör veya sırayla (Round-Robin) satış temsilcilerine otomatik atanır
  - `satis_muduru_haftalik_toplantida_sahipsiz_musterileri_manuel_dagitir`: Satış Müdürü sahipsiz havuzu inceler ve temsilcilere manuel olarak paylaştırır
  - `sahipsiz_musteri_takibi_yapilmaz_bircok_musteri_atıl_kalir`: Sahipsiz müşteri havuzu takip edilmez; ilgilenilmeyen yüzlerce müşteri sistemde atıl kalır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Otomatik Aday/Müşteri Dağıtım Motoru (Lead Routing) gereksinimini belirler.

---

### 8. Müşteri 360 Görünümü

#### [CRM-015] Satış ve müşteri temsilcileri tek bir ekran üzerinden Müşteri 360 Görünümüne (Temel bilgiler, iletişim kişileri, geçmiş görüşmeler, açık talepler, sipariş/bakiye özeti) erişebilmekte midir?
- **Süreç:** Müşteri 360 Görünümü
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Customer 360 ekranı, tüm temas noktalarının ve ticari özetin tek pencereden görünürlüğü.
- **Seçenekler:**
  - `tam_musteri_360_kokpiti_tek_ekrandan_kesintisiz_sunulur`: Evet; temsilci müşteri kartını açtığında görüşmeleri, siparişleri, açık hesap bakiyesini ve şikâyetleri anında görür
  - `temel_bilgiler_gorunur_fakat_siparis_ve_bakiye_icin_baska_ekrana_bakilir`: CRM'de görüşmeler görünür ancak müşterinin güncel borcu ve sipariş durumu için ERP muhasebe ekranına geçmek gerekir
  - `musteri_360_gorunumu_yoktur_bilgiler_5_farkli_yerden_toplanir`: Müşteri 360 yoktur; bir müşteri hakkında bilgi sahibi olmak için muhasebeye, sevkiyata ve satışçıya ayrı ayrı sorulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Customer 360 Ekran Tasarımı ve ERP-CRM Entegre Gösterge Panellerini belirler.

#### [CRM-016] Müşteri kartı üzerinden ilgili müşteriye ait sözleşmeler, kurumsal yazışmalar, teknik şartnameler ve özel anlaşma dokümanları görüntülenebilmekte midir?
- **Süreç:** Müşteri 360 Görünümü
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Müşteri ilişkili dijital doküman yönetimi ve kurumsal dosya arşivi.
- **Seçenekler:**
  - `tum_sozlesme_ve_dokumanlar_musteri_kartina_eklenir_ve_erisim_yetkilidir`: Evet; imzalı sözleşmeler, vergi levhası, imza sirküleri ve teknik protokoller müşteri kartına eklenip görüntülenebilir
  - `dokumanlar_ortak_ag_klasorunde_saklanir_sisteme_bagli_degildir`: Dosyalar ortak sunucu klasöründe saklanır; müşteri kartı üzerinden doğrudan açılamaz
  - `sozlesmeler_fiziksel_arsivde_veya_kisisel_bilgisayarlarda_tutulur`: Dijital doküman bağı yoktur; sözleşmeler fiziksel klasörlerde veya satışçıların kendi bilgisayarlarındadır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Doküman Yönetim Entegrasyonu (DMS) ihtiyacını belirler.

---

### 9. İletişim ve Etkileşim Geçmişi

#### [CRM-017] Müşterilerle yapılan telefon görüşmeleri, e-postalar, toplantı notları ve mesajlaşmalar merkezi sistemde zaman çizelgesi (Timeline) olarak kayıt altına alınmakta mıdır?
- **Süreç:** İletişim ve Etkileşim Geçmişi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** İletişim ve etkileşim geçmişi, kronolojik temas kütüğü ve kurumsal hafıza.
- **Seçenekler:**
  - `tum_gorusme_toplanti_ve_notlar_zaman_cizelgesine_duzenli_girilir`: Evet; müşteriyle yapılan her telefon, toplantı ve temas tarihi, konusu ve sonucuyla zaman çizelgesine işlenir
  - `sadece_cok_onemli_kararlar_alindiginda_ozet_not_yazilir`: Rutin görüşmeler girilmez; yalnızca büyük anlaşmazlık veya sözleşme kararlarında kısa bir not yazılır
  - `gorusmeler_whatsapp_ve_kisisel_ajandalarda_kalir_sisteme_girilmez`: Tüm iletişim WhatsApp ve kişisel not defterlerinde kalır; merkezi bir görüşme geçmişi tutulmaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** İletişim Zaman Çizelgesi (Activity Timeline) ve Kurumsal Hafıza Altyapısını belirler.

#### [CRM-018] E-posta entegrasyonu (Outlook / Gmail / Mail İstemcisi) ve takvim senkronizasyonu ile müşteri yazışmaları otomatik olarak müşteri kartına işlenmekte midir?
- **Süreç:** İletişim ve Etkileşim Geçmişi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** E-posta istemcisi eklentileri (Add-in), gelen/giden mail arşivleme ve takvim senkronu.
- **Seçenekler:**
  - `outlook_veya_gmail_eklentisi_ile_e_postalar_tek_tikla_musteriye_baglanir`: Evet; e-posta istemcisi eklentisiyle müşteriden gelen ve giden mailler doğrudan müşteri tarihçesine arşivlenir
  - `onemli_e_postalar_manuel_kopyala_yapistir_ile_not_olarak_girilir`: Otomatik entegrasyon yoktur; kritik e-postalar personeller tarafından kopyalanıp sisteme not olarak yapıştırılır
  - `e_posta_entegrasyonu_yoktur_yazismalar_kisisel_posta_kutusunda_kalir`: E-posta entegrasyonu yoktur; kimin müşteriyle ne yazıştığı yalnızca o personelin şahsi posta kutusunda kalır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Mail İstemcisi Entegrasyonu (Outlook/Gmail CRM Plugin) gereksinimini belirler.

---

### 10. Aktivite / Görev / Hatırlatma Yönetimi

#### [CRM-019] Müşteriyle ilgili yapılacak işler, geri arama görevleri, teklif takip hatırlatmaları ve ekip içi görev atamaları sistem üzerinden nasıl yönetilmektedir?
- **Süreç:** Aktivite / Görev / Hatırlatma Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Aktivite ve görev takibi, hatırlatma kuralları ve ekip içi iş atama disiplini.
- **Seçenekler:**
  - `gorev_ve_hatirlatmalar_sistemden_atanir_ve_takvimde_izlenir`: Evet; 'Pazartesi ara', 'Numune gönder' gibi görevler bitiş tarihiyle atanır, sistem hatırlatır ve takvimde görünür
  - `herkes_kendi_outlook_takvimini_veya_kisisel_ajandasini_kullanir`: Merkezi görev yönetimi yoktur; çalışanlar kendi kişisel takvimlerine veya ajandalarına not alır
  - `gorev_ve_hatirlatma_takibi_yapilmaz_bircok_is_unutulur`: Görev sistemi yoktur; müşteriye geri dönüşler ve hatırlatmalar sıklıkla unutulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Görev Takip ve Hatırlatma (Task & Reminder Engine) altyapısını belirler.

#### [CRM-020] Zamanında tamamlanmayan gecikmiş müşteri aktiviteleri ve görevler için yöneticilere ve personele otomatik hatırlatma/eskalasyon bildirimi gitmekte midir?
- **Süreç:** Aktivite / Görev / Hatırlatma Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Geciken görev eskalasyonu, yönetici bildirimleri ve iş teslim güvencesi.
- **Seçenekler:**
  - `geciken_aktiviteler_icin_otomatik_bildirim_ve_yonetici_uyarisi_vardir`: Evet; süresi geçen görevlerde kullanıcıya bildirim düşer, 48 saat aşılırsa satış müdürüne eskalasyon raporu gider
  - `sadece_kullanicinin_kendi_ekraninda_kirmizi_uyari_gorunur`: Yalnızca ilgili personelin listesinde görev kırmızıya döner; yöneticiye otomatik bildirim gitmez
  - `gecikme_takibi_ve_eskalasyon_mekanizmasi_yoktur`: Gecikme takibi yoktur; açık kalan ve yapılmayan görevler sistemde süresiz bekler *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Otomatik Eskalasyon ve Görev Uyarı Sistemini belirler.

---

### 11. Müşteri Ziyaretleri

#### [CRM-021] Saha satış ve müşteri ziyaretleri sistem üzerinden önceden planlanmakta ve ziyaret sonrasında Ziyaret Raporu / Görüşme Notu sisteme girilmekte midir?
- **Süreç:** Müşteri Ziyaretleri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Saha ziyaret planlama, ziyaret frekansı ve ziyaret sonu raporlama disiplini.
- **Seçenekler:**
  - `ziyaretler_onceden_planlanir_ve_ziyaret_raporu_ayni_gun_girilir`: Evet; haftalık ziyaret rotası sistemde planlanır ve ziyaret bitiminde standart form ile rapor girilir
  - `ziyaretler_serbest_yapilir_hafta_sonu_toplu_kisa_not_yazilir`: Önceden sisteme plan girilmez; satışçı ziyareti yapar, hafta sonu veya ay sonu topluca kısa not yazar
  - `saha_ziyaret_plani_ve_raporu_tutulmamaktadir`: Ziyaret planı ve raporu tutulmaz; kimin hangi müşteriye ne zaman gittiği takip edilmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Saha Ziyaret Yönetimi (Field Visit Management) modülünü belirler.

#### [CRM-022] Saha ziyaretlerinde mobil uygulama üzerinden anlık konum/check-in doğrulaması ve ziyaret sonuçlarının ekipçe anlık görünürlüğü sağlanmakta mıdır?
- **Süreç:** Müşteri Ziyaretleri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `CRM-021 != "saha_ziyaret_plani_ve_raporu_tutulmamaktadir"`
- **Açıklama:** Mobil CRM, saha GPS/Check-in doğrulaması ve anlık ziyaret notu girişi.
- **Seçenekler:**
  - `mobil_crm_ile_sahada_konum_dogrulamali_anlik_rapor_girisi_yapilir`: Evet; temsilciler mobilden müşteriye check-in yapar, görüşme notunu, fotoğrafları ve talepleri anında girer
  - `mobil_uygulama_vardir_ancak_konum_dogrulamasi_kullanilmaz`: Mobilden not girilebilir ancak GPS check-in veya konum doğrulaması kullanılmamaktadır
  - `mobil_uygulama_yoktur_ziyaret_notlari_ofise_donunce_bilgisayardan_girilir`: Mobil CRM yoktur; saha personeli notlarını kağıda alır, akşam ofise dönünce bilgisayardan sisteme girer *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Mobil Saha CRM ve GPS Doğrulama ihtiyaçlarını belirler.

---

### 12. Müşteri Talep Yönetimi

#### [CRM-023] Müşterilerden gelen ticari olmayan bilgi talepleri, teknik destek istekleri, numune talepleri veya özel ricalar merkezi olarak (Talep / Ticket Sistemi) kayıt altına alınmakta mıdır?
- **Süreç:** Müşteri Talep Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteri destek talepleri, numune/bilgi istekleri ve talep takip mekanizması.
- **Seçenekler:**
  - `merkezi_talep_ticket_sistemi_ile_numaralandirilarak_takip_edilir`: Evet; her müşteri talebi (numune, teknik soru, evrak isteği) bir talep numarasıyla sisteme kaydedilir
  - `talepler_e_posta_veya_sozlu_olarak_ilgili_kisiye_iletilir`: Merkezi talep sistemi yoktur; e-posta ile ilgili birime iletilir, takibi e-posta zinciri üzerinden yapılır
  - `musteri_talepleri_kayit_altina_alinmaz_takipsizlik_yasanir`: Talepler kayıt altına alınmaz; satışçıların aklında tuttuğu kadarıyla ilerler, sıkça aksamalar yaşanır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Talep ve Destek (Ticketing) Modeli tasarımını belirler.

#### [CRM-024] Müşteri taleplerinin ilgili departmanlara (Teknik Servis, Kalite, Lojistik, Muhasebe) yönlendirilmesi ve talep sonuçlanma süresi (SLA) izlenmekte midir?
- **Süreç:** Müşteri Talep Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Departmanlar arası talep yönlendirme, SLA takibi ve müşteri bilgilendirmesi.
- **Seçenekler:**
  - `departmanlara_otomatik_atanir_ve_sla_sureleri_olculur`: Evet; talep konusuna göre ilgili ekibe atanır, yanıtlama ve çözüm süreleri SLA raporlarıyla izlenir
  - `manuel_yonlendirilir_ancak_sla_veya_kapanis_suresi_olculmez`: Talep departmana iletilir ancak ne kadar sürede çözüldüğüne dair bir ölçüm veya hedef süre yoktur
  - `taleplerin_departmanlar_arasi_takibi_yapilamamaktadir`: Talebin hangi departmanda beklediği veya çözülüp çözülmediği takip edilememektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Departmanlar Arası Talep Yönlendirme ve SLA Takibini belirler.

---

### 13. Şikâyet ve Geri Bildirim Yönetimi

#### [CRM-025] Müşteri şikâyetleri hangi kanallardan (Çağrı merkezi, web formu, e-posta, satış temsilcisi) toplanmakta ve CRM sistemine nasıl kaydedilmektedir?
- **Süreç:** Şikâyet ve Geri Bildirim Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Müşteri şikâyet toplama kanalları, vaka (case) oluşturma ve şikâyet kayıt disiplini.
- **Seçenekler:**
  - `tum_kanallardan_gelen_sikayetler_merkezi_crm_vaka_havuzuna_kaydedilir`: Evet; web, e-posta, çağrı veya satışçıdan gelen tüm şikâyetler tek bir şikâyet/vaka havuzunda toplanır
  - `sikayetler_excel_tablosunda_veya_ayri_bir_formda_tutulur`: CRM'e girilmez; müşteri ilişkileri veya kalite birimi şikâyetleri ayrı bir Excel tablosunda listeler
  - `musteri_sikayetleri_sisteme_kaydedilmemektedir`: Şikâyetler kayıt altına alınmaz; müşteri kime ulaştıysa o kişi aralarında sözlü olarak konuyu halleder
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Şikâyet Yönetimi (Case Management) temel altyapısını belirler.

#### [CRM-026] Müşteri şikâyeti kaydedilirken şikâyet konusu (Ürün kalitesi, geciken teslimat, fatura hatası, personel davranışı vb.) sınıflandırılıp ilgili fatura/sipariş/sevkiyat ile ilişkilendirilebilmekte midir?
- **Süreç:** Şikâyet ve Geri Bildirim Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `CRM-025 != "musteri_sikayetleri_sisteme_kaydedilmemektedir"`
- **Açıklama:** Şikâyet kök neden kategorizasyonu ve ticari işlem (fatura/sipariş) bağlantısı.
- **Seçenekler:**
  - `sikayet_konusu_siniflandirilir_ve_ilgili_siparis_faturaya_baglanir`: Evet; kategori seçilir ve şikâyet doğrudan ilgili siparişe, irsaliyeye, faturaya veya malzemeye bağlanır
  - `sikayet_konusu_secilir_ancak_siparis_veya_faturaya_baglanamaz`: Kategori seçilebilir ancak şikâyetin hangi faturaya veya partiye ait olduğu metin olarak elle yazılır
  - `kategorizasyon_ve_islem_baglantisi_yapilmaz_serbest_metin_yazilir`: Herhangi bir kategori veya işlem bağlantısı yoktur; yalnızca şikâyet açıklaması serbest metin olarak tutulur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Şikâyet İşlem İlişkilendirmesi (Complaint-to-Transaction Link) modelini belirler.

#### [CRM-027] Şikâyetin çözümlenme süreci, müşteriye geri bildirim verilmesi, müşteri onayının alınması ve şikâyet kapatma SLA süreleri nasıl takip edilmektedir?
- **Süreç:** Şikâyet ve Geri Bildirim Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Koşul:** `CRM-025 != "musteri_sikayetleri_sisteme_kaydedilmemektedir"`
- **Açıklama:** Şikâyet çözüm akışı, SLA kapatma süresi, müşteri onay döngüsü ve tekrar eden şikâyet analizi.
- **Seçenekler:**
  - `sla_sureleri_izlenir_musteri_memnuniyet_teyidi_ile_sikayet_kapatilir`: Evet; çözüm süresi hedefleri (SLA) izlenir, müşteri aranıp çözüldüğü teyit edildikten sonra şikâyet kapatılır
  - `sikayet_cozulunce_ic_ekip_tarafindan_kapatilir_musteri_teyidi_alinmaz`: İç ekip işlemi tamamlayınca şikâyeti kapatır; müşteriden tekrar onay veya memnuniyet teyidi alınmaz
  - `sikayet_kapanis_ve_sure_takibi_yapilmamaktadir`: Şikâyetin ne zaman çözüldüğü veya açık kalıp kalmadığı sistem üzerinden takip edilmez *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Şikâyet Kapatma Protokolü ve Müşteri Çözüm Teyit Mekanizmasını belirler.

---

### 14. Müşteri Memnuniyeti

#### [CRM-028] Satış sonrası veya şikâyet/hizmet kapanışı sonrasında Müşteri Memnuniyeti Anketleri (CSAT / NPS / Müşteri Sadakat Ölçümü) düzenli olarak uygulanmakta mıdır?
- **Süreç:** Müşteri Memnuniyeti
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteri memnuniyet anketleri, NPS/CSAT metodolojisi ve düzenli anket gönderimi.
- **Seçenekler:**
  - `otomatik_anketler_csat_nps_ile_duzenli_olarak_olculur`: Evet; teslimat veya vaka kapanışı sonrasında otomatik SMS/e-posta anketi gönderilir ve NPS/CSAT ölçülür
  - `yilda_bir_kritik_musterilere_manuel_memnuniyet_anketi_yapilir`: Yılda bir kez seçilen ana müşteriler telefonla aranarak veya anket formu gönderilerek manuel ölçüm yapılır
  - `musteri_memnuniyeti_olculmemektedir`: Müşteri memnuniyeti ölçümü veya anket çalışması yapılmamaktadır
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Deneyimi (CX) ve Memnuniyet Anket Entegrasyonu (NPS/CSAT) gereksinimini belirler.

#### [CRM-029] Memnuniyet anket sonuçları ve NPS skorları doğrudan müşteri 360 kartı üzerinde ve müşteri temsilcisi performansında görüntülenebilmekte midir?
- **Süreç:** Müşteri Memnuniyeti
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Koşul:** `CRM-028 != "musteri_memnuniyeti_olculmemektedir"`
- **Açıklama:** Anket sonuçlarının müşteri kartına entegrasyonu ve performans göstergesi olarak kullanımı.
- **Seçenekler:**
  - `anket_skorlari_musteri_360_kartinda_ve_temsilci_kpisinde_anlik_gorunur`: Evet; anket puanı doğrudan müşteri 360 kartına işlenir ve temsilcinin başarı puanına etki eder
  - `anketler_ayri_bir_anket_aracinda_kalir_musteri_kartina_yansimaz`: Anketler ayrı bir form aracında (Google Forms/SurveyMonkey vb.) kalır; CRM müşteri kartına aktarılmaz *(Not Alınabilir)*
  - `anket_sonuclari_raporlanmamakta_ve_kullanilmamaktadir`: Anket sonuçları toplanır ancak analiz edilmez ve müşteri kartıyla ilişkilendirilmez
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** NPS/CSAT Skorlarının Müşteri Kartı ve Performans Panellerine Bağlantısını belirler.

---

### 15. Müşteri Devir / Temsilci Değişikliği

#### [CRM-030] Bir satış temsilcisi işten ayrıldığında veya bölge/portföy değişikliği olduğunda müşterinin tüm geçmiş görüşme, kontak ve açık işleri yeni temsilciye sistem üzerinden eksiksiz devredilebilmekte midir?
- **Süreç:** Müşteri Devir / Temsilci Değişikliği
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Portföy devir mekanizması, yetki transferi ve açık işlerin devri.
- **Seçenekler:**
  - `tek_tikla_tum_musteri_portfoyu_ve_gecmis_hafiza_yeni_temsilciye_devredilir`: Evet; sistem üzerinden temsilci değişikliği yapıldığında tüm kontaklar, görüşme geçmişi ve açık işler yeni kişiye geçer
  - `musteri_karti_temsilcisi_degisir_ancak_gecmis_notlar_tam_aktarilamaz`: Müşteri kartındaki isim değiştirilir ancak geçmiş görüşmeler ve görevler eski kullanıcının hesabında asılı kalır
  - `sistemik_devir_yoktur_temsilci_ayrilinca_musteri_hafizasi_kaybolur`: Sistemik devir yoktur; temsilci ayrıldığında müşterinin tüm ilişkisi, notları ve kontak bilgileri kaybolur *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Portföy Devir ve Müşteri İlişki Transferi (Account Handover) mekanizmasını belirler.

#### [CRM-031] Temsilci ayrıldığında müşteri hafızasının (Kişisel notlar, telefon rehberleri, gizli anlaşmalar) şirkette kalması ve kurumsal hafıza kaybının önlenmesi nasıl sağlanmaktadır?
- **Süreç:** Müşteri Devir / Temsilci Değişikliği
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kurumsal hafıza sürekliliği, kişiye bağımlılık riski ve müşteri koruma.
- **Seçenekler:**
  - `tum_bilgiler_merkezi_crmde_oldugu_icin_kurumsal_hafiza_kaybi_yasanmaz`: Tüm bilgiler merkezi CRM'de zorunlu tutulduğu için temsilci ayrılsa dahi yeni temsilci ilk günden itibaren tüm detayı bilir
  - `ayrilan_personelden_sozlu_veya_excel_ile_devir_teslim_raporu_istenir`: Personelden Excel ile müşteri devir listesi istenir ancak bilgilerin çoğu personelin hafızasında kalır
  - `temsilci_ayriliklarinda_ciddi_musteri_ve_ciro_kaybi_yasanmaktadir`: Kişiye bağımlılık çok yüksektir; temsilci ayrıldığında müşteriler de temsilciyle birlikte şirketi terk edebilmektedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Kurumsal Hafıza Koruma ve Müşteri Sadakat Güvencesini belirler.

---

### 16. İletişim Tercihleri ve İzin Bilgileri

#### [CRM-032] Müşterilerin ve iletişim kişilerinin ticari elektronik ileti izinleri (E-posta, SMS, Telefon arama onayları) ve izin alma tarih/kanal bilgileri sistemde tutulmakta mıdır?
- **Süreç:** İletişim Tercihleri ve İzin Bilgileri
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Ticari iletişim izinleri (İYS uyumu), izin kaynağı ve tarihsel onay kütüğü.
- **Seçenekler:**
  - `iletisim_izinleri_kanal_bazinda_eposta_sms_arama_ve_tarihle_kayitlidir`: Evet; E-posta, SMS ve Arama izinleri ayrı ayrı, izin tarihi ve onay metni referansıyla kayıtlıdır
  - `sadece_genel_bir_onay_kutusu_vardir_ayrintili_kanal_tutulmaz`: Kart üzerinde tek bir 'İletişim İzni Var/Yok' seçeneği vardır; izin tarihi ve kanallar ayrıştırılmaz
  - `iletisim_izinleri_sistemde_takip_edilmemektedir`: İletişim izinleri sistemde takip edilmez; tüm iletişim kurumsal güvene dayalı yürütülür *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** İletişim İzinleri (Consent Management) ve İYS Uyumluluk Veri Yapısını belirler.

#### [CRM-033] Müşteri iletişim tercihleri (Örn. 'Yalnızca e-posta ile ulaşılsın', 'Cuma günleri aranmasın') ve iletişim kısıtlamaları müşteri kartında temsilcilerin görebileceği şekilde işaretlenmekte midir?
- **Süreç:** İletişim Tercihleri ve İzin Bilgileri
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Müşteri özel iletişim tercihleri, zaman kısıtlamaları ve rahatsız etmeme kuralları.
- **Seçenekler:**
  - `tercihler_ve_kisitlamalar_kartta_belirgin_uyari_olarak_gorunur`: Evet; 'Aramayın sadece e-posta', 'Şu saatler arası arayın' gibi tercihler kartta ve aktivite ekranında belirgin görünür
  - `sadece_serbest_not_alanina_yazilirsa_gorunur`: Özel bir tercih alanı yoktur; temsilci unutmayıp genel not kutusuna yazarsa görülebilir
  - `iletisim_tercihleri_tutulmamaktadir`: İletişim tercihleri tutulmaz; müşteri rahatsız edilse bile bu bilgi diğer temsilcilere yansımaz *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri İletişim Tercihleri ve İletişim Kural Motorunu belirler.

---

### 17. Müşteri Veri Kalitesi

#### [CRM-034] Müşteri veritabanında eksik bilgi (Adres, telefon, e-posta, vergi no, yetkili kişi) oranı ve güncel olmayan atıl/ölü müşteri kayıtlarının tespiti ve temizliği nasıl yapılmaktadır?
- **Süreç:** Müşteri Veri Kalitesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Müşteri veri bütünlüğü, eksik alan kontrolleri ve atıl kart temizleme disiplini.
- **Seçenekler:**
  - `veri_tamlik_orani_izlenir_ve_eksik_kartlar_duzenli_raporlanip_tamamlanir`: Evet; müşteri kartlarındaki doluluk oranı (%) izlenir, eksik bilgisi olan kartlar satış ekibine tamamlatılır
  - `hata_veya_ihtiyac_oldukca_manuel_duzeltme_yapilir`: Düzenli bir kontrol yoktur; kargo gitmediğinde veya fatura kesilemediğinde eksik bilgi fark edilip düzeltilir
  - `veritabaninda_ciddi_oranda_eksik_ve_hatali_kayit_birikmistir`: Veri kalitesi çok düşüktür; binlerce kartta telefon, adres veya vergi numarası boştur ya da geçersizdir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Veri Kalitesi (Data Quality & Completeness) Kurallarını belirler.

#### [CRM-035] Müşteri kartındaki temel bilgileri kimlerin değiştirebileceğine dair Değişiklik Yetki Matrisi ve değişiklik tarihçe logları (Audit Trail / Kim, ne zaman, hangi alanı değiştirdi) tutulmakta mıdır?
- **Süreç:** Müşteri Veri Kalitesi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `high`
- **Açıklama:** Müşteri kartı güncelleme yetki matrisi, alan bazlı kilit ve denetim logları.
- **Seçenekler:**
  - `alan_bazli_yetkilendirme_ve_tam_degisiklik_tarihcesi_audit_trail_aktif`: Evet; unvan/VKN kilitlidir yalnızca yetkili değiştirir, yapılan her alan değişikliği eski/yeni değeriyle loglanır
  - `kart_duzenleme_yetkisi_vardir_ancak_degisiklik_gecmisi_tutulmaz`: Kullanıcılar kartı güncelleyebilir ancak daha önce ne yazdığı veya kimin değiştirdiği geriye dönük izlenemez
  - `herkes_istedigi_alanı_degistirebilir_kontrol_ve_log_yoktur`: Yetki veya loglama yoktur; herhangi bir personel müşteri unvanını veya telefonunu kontrolsüzce değiştirebilir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Alan Bazlı Yetkilendirme (Field-Level Security) ve Denetim İzi (Audit Trail) altyapısını belirler.

---

### 18. Mükerrer Kayıt Yönetimi

#### [CRM-036] Yeni müşteri kaydı açılırken aynı vergi numarası, telefon, unvan veya e-posta ile mükerrer (Duplicate) kayıt oluşmasını engelleyen sistemsel önleyici kontroller var mıdır?
- **Süreç:** Mükerrer Kayıt Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Mükerrer müşteri önleme kuralları, VKN/TCKN tekilliği ve benzerlik uyarıları.
- **Seçenekler:**
  - `ayni_vkn_telefon_veya_unvanda_sistem_kaydi_engeller_veya_uyarir`: Evet; aynı VKN/TCKN, e-posta veya benzer unvanda sistem mükerrer kaydı anında engeller ve mevcut kartı gösterir
  - `sadece_ayni_vkn_birebir_girilirse_uyarir_unvan_farkliysa_engellemez`: Yalnızca VKN birebir aynıysa uyarır; unvan veya telefon benzerliklerinde mükerrer kayda izin verir
  - `mukerrer_kayit_kontrolu_yoktur_ayni_firma_defalarca_acilabilir`: Mükerrer kontrolü yoktur; aynı firma farklı temsilciler tarafından defalarca mükerrer açılmıştır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Mükerrer Kayıt Engelleme (Duplicate Prevention Rules) kurallarını belirler.

#### [CRM-037] Geçmişten gelen mükerrer müşteri kayıtlarının tespit edilmesi, birleştirilmesi (Merge) ve geçmiş hareketlerin tek bir ana cariye bağlanması süreci nasıl yürütülmektedir?
- **Süreç:** Mükerrer Kayıt Yönetimi
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Mükerrer kayıt birleştirme (Customer Merge), hareket aktarımı ve temizlik aracı.
- **Seçenekler:**
  - `otomatik_birlestirme_merge_araci_ile_tum_gecmis_hareketler_tek_karta_aktarilir`: Evet; mükerrer iki kart seçilerek tek tıkla birleştirilir, tüm geçmiş görüşmeler ve siparişler ana karta taşınır
  - `biri_pasife_alinir_ve_koduna_kullanmayiniz_yazilir`: Birleştirme aracı yoktur; mükerrer kartın unvanına 'KULLANMAYINIZ' yazılıp pasife alınır ancak geçmiş hareketler bölünmüş kalır
  - `mukerrer_kayit_temizligi_veya_birlestirme_yapilamamaktadir`: Mükerrer kayıtlar birleştirilemez; sistemde aynı müşteriye ait çok sayıda aktif kart yaşamaya devam eder *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Müşteri Birleştirme (Customer Merge Tool) ve Veri Temizleme aracını belirler.

---

### 19. CRM Raporlama ve KPI

#### [CRM-038] Müşteri ilişkileri ve CRM performansı için hangi temel göstergeler (Müşteri kazanım oranı, Müşteri kayıp/churn oranı, Ziyaret/görüşme sıklığı, Şikâyet çözüm süresi, NPS) takip edilmektedir?
- **Süreç:** CRM Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Açıklama:** Kurumsal CRM performans göstergeleri ve müşteri yönetim metrikleri.
- **Seçenekler:**
  - `tum_crm_kpi_ve_donusum_metrikleri_gosterge_panellerinde_izlenir`: Evet; yeni kazanılan müşteri, churn oranı, temas sıklığı, açık şikâyet sayısı ve NPS puanı kokpitlerde canlı izlenir
  - `sadece_ziyaret_sayisi_veya_yeni_musteri_adedi_takip_edilir`: Yalnızca ayda kaç yeni müşteri açıldığı veya kaç ziyaret yapıldığı takip edilir; derinlemesine CRM KPI'ı yoktur
  - `crm_ve_musteri_iliskileri_kpi_takibi_yapilmamaktadir`: CRM KPI takibi yapılmamaktadır; müşteri ilişkilerinin performansı ölçülmemektedir
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** CRM Yönetim Kokpitleri ve Performans Göstergelerini belirler.

#### [CRM-039] Son 3/6/12 aydır hiç iletişim kurulmayan, teklif verilmeyen veya siparişi duran Terk Riski Taşıyan Müşteriler (Dormant / Churn Risk) sistem tarafından otomatik raporlanmakta mıdır?
- **Süreç:** CRM Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kayıp müşteri (Churn) erken uyarı sinyalleri ve temas edilmeyen müşteri alarmları.
- **Seçenekler:**
  - `otomatik_churn_alarmi_ve_temassiz_musteri_listesi_temsilciye_sunulur`: Evet; sistem belirli süre temas edilmeyen müşterileri 'Terk Riski' olarak işaretler ve temsilciye geri kazanım görevi açar
  - `satis_ekibi_excelde_siparis_gecmisini_filtreleyerek_manuel_bulur`: Otomatik alarm yoktur; satış yöneticisi ERP'den sipariş raporu çekip aylardır sipariş vermeyenleri Excel'de tespit eder
  - `terk_riski_veya_hareketsiz_musteri_takibi_yapilmamaktadir`: Hareketsiz müşteri takibi yapılmaz; müşterinin şirketi terk ettiği ancak aylar sonra tesadüfen anlaşılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Churn Erken Uyarı Sistemi ve Proaktif Müşteri Geri Kazanım motorunu belirler.

#### [CRM-040] Satış temsilcilerinin günlük/haftalık aktivite yoğunluğu (Kaç arama yapıldı, kaç ziyaret tamamlandı, kaç talep kapatıldı) yönetim gösterge panellerinde izlenmekte midir?
- **Süreç:** CRM Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Açıklama:** Temsilci efor ve aktivite verimliliği, temas kotaları ve yönetim görünürlüğü.
- **Seçenekler:**
  - `temsilci_aktivite_ve_performans_karsilastirmasi_canli_izlenir`: Evet; temsilcilerin haftalık ziyaret, görüşme ve görev tamamlama sayıları karşılaştırmalı panellerde izlenir
  - `haftalik_satis_toplantisinda_sozlu_olarak_raporlanir`: Sistem üzerinden izlenmez; temsilciler haftalık toplantıda kime gittiklerini sözlü olarak anlatır
  - `aktivite_yogunlugu_takip_edilmemektedir`: Aktivite yoğunluğu takip edilmez; yalnızca ay sonunda kesilen faturaya bakılır *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Satış Gücü Otomasyonu (SFA) ve Temsilci Aktivite Panellerini belirler.

#### [CRM-041] Satış ekibinin CRM sistemini düzenli kullanma ve müşteri bilgilerini eksiksiz girme oranı (CRM User Adoption) ve sistem dışı (WhatsApp/Excel) çalışma alışkanlığı ne boyuttadır?
- **Süreç:** CRM Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Kullanıcı benimseme (User Adoption), sistem direnci ve gölge kayıt alışkanlıkları.
- **Seçenekler:**
  - `cok_yuksek_benimseme_tum_ekip_crmi_ana_calisma_alani_olarak_kullanir`: Çok yüksek; tüm ekip sabah ilk iş CRM'i açar, sisteme girilmeyen görüşme veya bilgi yok sayılır
  - `orta_duzey_bazi_temsilciler_duzenli_girer_bazilari_zorlamayla_yazar`: Orta düzey; genç temsilciler sistemi aktif kullanırken eski çalışanlar Excel ve defter alışkanlığını sürdürmektedir
  - `dusuk_benimseme_sistem_bos_durmaktadir_tum_is_whatsapp_ve_exceldedir`: Düşük; CRM sistemi kurulmuş ancak veri girilmediği için atıl kalmıştır, tüm operasyon WhatsApp ve Excel'dedir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** Değişim Yönetimi (Change Management) ve Kullanıcı Deneyimi (UX) önceliklerini belirler.

#### [CRM-042] ERP dönüşümü sonrasında hedeflenen Kurumsal CRM ve Müşteri İlişkileri Yönetimi vizyonu ve temel önceliği nedir?
- **Süreç:** CRM Raporlama ve KPI
- **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Açıklama:** Gelecek vizyonu (TO-BE), CRM yatırım hedefleri ve kurumsal öncelikler.
- **Seçenekler:**
  - `entegre_musteri_360_mobil_saha_ve_kurumsal_hafizanin_tamamen_sistemlesmesi`: ERP ile tam entegre Müşteri 360, mobil saha ziyareti, şikâyet/talep SLA takibi ve kurumsal hafızanın tam sistemleşmesi
  - `sadece_musteri_kontak_ve_gorusme_notlarinin_duzenli_tutulmasi_yeterlidir`: Müşteri yetkililerinin ve yapılan görüşmelerin düzenli kayıt altına alınması ilk aşamada yeterlidir
  - `mukerrer_kayitlarin_temizlenmesi_ve_vkn_dogrulamasinin_otomasyonu`: Mükerrer müşteri kayıtlarının engellenmesi ve VKN/e-fatura adres doğrulamalarının otomatikleşmesi önceliklidir *(Not Alınabilir)*
  - `other`: Diğer *(Not Alınabilir, Diğer)*
- **ERP/CRM Karar Etkisi:** ERP Dönüşüm Projesi CRM İş Paketi Kapsamını belirler.
