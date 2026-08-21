# FAZ-34 — Ana Veri ve Veri Kalitesi Yönetimi Soru Paketi

**Paket Kimliği**: `tr.master_data_management.core`  
**Sürüm**: `0.1.0`  
**İş Fonksiyonu**: `MASTER_DATA_MANAGEMENT` (Alias: `MASTER_DATA`, `ANA_VERI`)  
**Soru Sayısı**: 47 Soru (25 Zorunlu, 22 Opsiyonel)  
**Kanonik Süreç Sayısı**: 25 Süreç  
**Dallanma (Branching) Sayısı**: 7 Koşullu Senaryo (Kapalı: 40 Soru, Açık: 47 Soru)  
**ID Formatı**: `MDM-001` .. `MDM-047`  

---

## 🎯 Amacı ve Kapsamı

ERP ve CRM dönüşüm projelerinden önce şirketin ana veri yönetişim olgunluğunu, veri sahipliğini (data stewardship), kodlama ve numaralandırma standartlarını, mükerrer kayıt (duplicate data) düzeyini, kategori/varyant derinliğini ve sisteme aktarılabilirlik (data migration) hazırlığını ölçmektir.

Sisteme kirli veri taşınmasını önlemek amacıyla; malzeme kartları, müşteri/tedarikçi ticari kartları, duran varlıklar, ürün ağaçları (BOM), rota/operasyonlar ve depo lokasyon ana verilerinin kalitesini keşif aşamasında tespit eder.

---

## 🛡️ Sınır Ayrımı (Cross-Pack Isolation)

| Modül | İncelenen Süreçler | FAZ-34 Sınır Ayrımı |
| :--- | :--- | :--- |
| **INVENTORY (Stok Yönetimi)** | Stok hareketleri, giriş/çıkış fişleri, transferler, depo sayım süreçleri, emniyet stoğu operasyonları. | **FAZ-34**: Stok kartı tanım standardı, akıllı kodlama şablonu, kategori hiyerarşisi, alternatif birim katsayıları ve varyant matrisi ana verisini inceler. |
| **SUPPLIER_MANAGEMENT (Tedarikçi Yönetimi)** | Tedarikçi değerlendirme kriterleri, performans puanlama, teklif toplama ve satınalma sözleşmeleri. | **FAZ-34**: Tedarikçi kartındaki resmi unvan, VKN/TCKN, GİB e-Dönüşüm mükellefiyeti, IBAN veri güvenliği ve çift onay süreçlerini inceler. |
| **CRM (Müşteri İlişkileri)** | Müşteri adayı (lead) takibi, fırsat boru hattı, satış aktiviteleri ve müşteri temas geçmişi. | **FAZ-34**: Müşteri ticari unvanı, fatura/sevk adres ayrımı, VKN doğrulama, cari gruplama ve farklı sistemler arası tekil ID eşleşmesini inceler. |
| **ASSET_MANAGEMENT (Varlık Yönetimi)** | Arıza bildirimleri, periyodik bakım takvimleri, iş emirleri ve amortisman muhasebeleştirme. | **FAZ-34**: Sabit kıymet tekil demirbaş kartı tanımı, barkod/RFID etiketleme, oda/bina lokasyon kodu ve zimmetli personel ana veri kalitesini inceler. |
| **ACCOUNTING (Muhasebe)** | Yevmiye fişleri, mizan, gelir tablosu, KDV beyannameleri ve kapanış fişleri. | **FAZ-34**: Hesap planı yapısı, KDV muafiyet ve tevkifat kurallarının ana kartlardan türetilmesi ve banka hesap ana verisini inceler. |
| **HUMAN_RESOURCES (İnsan Kaynakları)** | İşe alım, izin onayları, performans değerlendirme ve bordro tahakkuku. | **FAZ-34**: Personel, unvan, departman, masraf merkezi ve onay hiyerarşisi ana verisinin ERP kullanıcıları ve yetkileriyle senkronizasyonunu inceler. |

---

## 📊 Soru ve Süreç Dağılımı

| No | Süreç (Process) | Soru ID | Başlık | Tip | Zorunlu | Önem |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | Ana Veri Yönetişimi ve Strateji | MDM-001 | Ana veri yönetimi (Master Data Governance) politikası | single_choice | Evet | Critical |
| 2 | Ana Veri Yönetişimi ve Strateji | MDM-002 | Kart açılış ve değişiklik yazılı prosedürü | single_choice | Hayır | High |
| 3 | Veri Sahipliği ve Steward Rolleri | MDM-003 | Veri sahipleri (Data Owner / Steward) rolleri | single_choice | Evet | Critical |
| 4 | Veri Sahipliği ve Steward Rolleri | MDM-004 | Ana veri değişiklik onay iş akışı | single_choice | Hayır | Medium |
| 5 | Kodlama ve Numaralandırma Standartları | MDM-005 | Akıllı/otomatik kodlama şablonu standardı | single_choice | Evet | Critical |
| 6 | Kodlama ve Numaralandırma Standartları | MDM-006 | Karakter standardı ve normalizasyon kontrolleri | single_choice | Evet | High |
| 7 | Malzeme ve Stok Kartı Ana Verisi | MDM-007 | Stok kartı zorunlu temel alan standardı | single_choice | Evet | Critical |
| 8 | Kategori Hiyerarşisi ve Sınıflandırma | MDM-008 | Kategori sınıflandırma ağacı derinliği | single_choice | Evet | High |
| 9 | Kategori Hiyerarşisi ve Sınıflandırma | MDM-009 | Çok seviyeli kategori ilişki ve raporlama standardı (Branching) | single_choice | Hayır | Medium |
| 10 | Marka, Model ve Grup Tanımları | MDM-010 | Marka/model referans tablolarından seçim | single_choice | Hayır | Medium |
| 11 | Ölçü Birimleri ve Çevrim Katsayıları | MDM-011 | Alternatif birim ve çevrim katsayıları tanımı | single_choice | Evet | Critical |
| 12 | Ölçü Birimleri ve Çevrim Katsayıları | MDM-012 | Departmanlar arası birim çevrim kuralları | single_choice | Evet | High |
| 13 | Varyant ve Özellik Yönetimi | MDM-013 | Renk/beden/teknik varyant matrisi ihtiyacı | single_choice | Evet | High |
| 14 | Varyant ve Özellik Yönetimi | MDM-014 | Varyant bazında tekil barkod/fiyat/stok yapısı (Branching) | single_choice | Hayır | Medium |
| 15 | Satınalma ve Satış Kartı Entegrasyonu | MDM-015 | Departman operasyonel parametreleri | single_choice | Hayır | Medium |
| 16 | Satınalma ve Satış Kartı Entegrasyonu | MDM-016 | Pasif/bloke ürün statü yönetimi | single_choice | Evet | High |
| 17 | Tedarikçi Ana Verisi ve Kalitesi | MDM-017 | Tedarikçi resmi unvan, VKN ve GİB doğrulaması | single_choice | Evet | Critical |
| 18 | Tedarikçi Ana Verisi ve Kalitesi | MDM-018 | Tedarikçi banka ve IBAN güvenliği onay süreci | single_choice | Evet | Critical |
| 19 | Müşteri ve Cari Kart Ana Verisi | MDM-019 | Müşteri VKN ve e-Fatura/e-İrsaliye mükellefiyet sorgusu | single_choice | Evet | Critical |
| 20 | Müşteri ve Cari Kart Ana Verisi | MDM-020 | Fatura ve sevk adres ayrımı standardı | single_choice | Hayır | High |
| 21 | Cari Hesap Grupları ve Segmentasyon | MDM-021 | Cari hesap grubu, sektör ve segment kodları | single_choice | Hayır | Medium |
| 22 | Müşteri/Tedarikçi Çoklu Sistem Senkronizasyonu | MDM-022 | Çoklu sistemlerde bağımsız cari tutulması | single_choice | Evet | High |
| 23 | Müşteri/Tedarikçi Çoklu Sistem Senkronizasyonu | MDM-023 | Sistemler arası tekil ID ve çift yönlü senkronizasyon (Branching) | single_choice | Hayır | Critical |
| 24 | Vergi, Fiyat ve Vade Koşulları | MDM-024 | Vade, iskonto, fiyat listesi ve kredi limiti | single_choice | Evet | High |
| 25 | Vergi, Fiyat ve Vade Koşulları | MDM-025 | KDV, tevkifat ve istisna kurallarının otomatik türetimi | single_choice | Evet | High |
| 26 | Banka, IBAN ve İletişim Veri Doğruluğu | MDM-026 | Cari iletişim bilgilerinin periyodik teyidi | single_choice | Hayır | Medium |
| 27 | Banka, IBAN ve İletişim Veri Doğruluğu | MDM-027 | Yurtdışı cariler için SWIFT, ISO ülke ve VAT ID kontrolü | single_choice | Hayır | Medium |
| 28 | Duran Varlık ve Sabit Kıymet Ana Verisi | MDM-028 | Tekil demirbaş/varlık kartı tanımı | single_choice | Evet | High |
| 29 | Duran Varlık ve Sabit Kıymet Ana Verisi | MDM-029 | Amortisman, zimmet ve fiziksel lokasyon takibi | single_choice | Evet | High |
| 30 | Demirbaş Zimmet ve Lokasyon Eşleme | MDM-030 | Barkod/RFID etiketleme ve oda eşleşmesi (Branching) | single_choice | Hayır | Medium |
| 31 | Ürün Ağacı (BOM) ve Reçete Ana Verisi | MDM-031 | Ürün ağaçları (BOM / Reçete) tanımı | single_choice | Hayır | High |
| 32 | Ürün Ağacı (BOM) ve Reçete Ana Verisi | MDM-032 | Standart fire, alternatif malzeme ve versiyonlama | single_choice | Hayır | Medium |
| 33 | İş Merkezi, Rota ve Operasyon Ana Verisi | MDM-033 | İş merkezi ve standart rota (routing) ana verisi | single_choice | Evet | High |
| 34 | İş Merkezi, Rota ve Operasyon Ana Verisi | MDM-034 | Setup, birim süre, kapasite ve maliyet merkezi bağı (Branching) | single_choice | Hayır | Medium |
| 35 | Depo, Raf ve Lokasyon Ana Verisi | MDM-035 | Depo içi koridor/raf/göz hiyerarşik adresleme | single_choice | Evet | High |
| 36 | Depo, Raf ve Lokasyon Ana Verisi | MDM-036 | Lokasyon hacim, ağırlık ve ürün tipi kısıtları | single_choice | Hayır | Low |
| 37 | Personel ve Organizasyon Veri Uyumu | MDM-037 | Personel unvan ve masraf merkezlerinin ERP yetkileriyle uyumu | single_choice | Evet | High |
| 38 | Mükerrer Kayıt Tespiti ve Konsolidasyon | MDM-038 | Mevcut mükerrer stok/cari kart boyutu | single_choice | Evet | Critical |
| 39 | Mükerrer Kayıt Tespiti ve Konsolidasyon | MDM-039 | Mükerrer kart birleştirme ve temizleme stratejisi (Branching) | single_choice | Hayır | Critical |
| 40 | Zorunlu Alan ve Veri Bütünlüğü Kontrolleri | MDM-040 | Veri girişinde zorunlu alan ve format kontrolleri | single_choice | Evet | Critical |
| 41 | Zorunlu Alan ve Veri Bütünlüğü Kontrolleri | MDM-041 | Foreign Key ve referans bütünlüğü koruması | single_choice | Hayır | High |
| 42 | Veri Giriş, Doğrulama ve Onay Akışları | MDM-042 | Yeni kart açılışında departman onay iş akışı | single_choice | Evet | High |
| 43 | Eski Sistemden Veri Temizleme ve Migrasyon | MDM-043 | Yeni sisteme ana veri aktarımı (migration) planı | single_choice | Evet | Critical |
| 44 | Eski Sistemden Veri Temizleme ve Migrasyon | MDM-044 | Veri temizleme, pasif ayıklama ve eşleme prosedürü (Branching) | single_choice | Hayır | Critical |
| 45 | Eski Sistemden Veri Temizleme ve Migrasyon | MDM-045 | Excel/CSV şablonları ve deneme (mock) migrasyon testleri | single_choice | Hayır | High |
| 46 | Veri Kalitesi KPI ve Sürekli İyileştirme | MDM-046 | Veri kalitesi KPI ve SLA takibi | single_choice | Evet | Medium |
| 47 | Veri Kalitesi KPI ve Sürekli İyileştirme | MDM-047 | Periyodik veri denetimi ve toplu temizleme çalışmaları | single_choice | Hayır | Medium |

---

## 🔀 Koşullu Dallanma (Branching) Mantığı

1. **MDM-009 (Kategori Hiyerarşi Standardı)**: `MDM-008 = "cok_seviyeli_hiyerarsi"` seçildiğinde açılır.
2. **MDM-014 (Varyant Matris Detayı)**: `MDM-013 = "evet_varyant_matrisi_kullanilmaktadir"` seçildiğinde açılır.
3. **MDM-023 (Çoklu Sistem Senkronizasyonu)**: `MDM-022 = "birden_fazla_sistemde_ayri_tutuluyor"` seçildiğinde açılır.
4. **MDM-030 (Demirbaş Etiket ve Lokasyon)**: `MDM-029 = "sistemde_detayli_takip_ediliyor"` seçildiğinde açılır.
5. **MDM-034 (İş Merkezi ve Süre Parametreleri)**: `MDM-033 = "recete_ve_bom_kullaniliyor"` seçildiğinde açılır.
6. **MDM-039 (Mükerrer Kayıt Birleştirme)**: `MDM-038 = "ciddi_veya_orta_seviyede_mukerrerlik_var"` seçildiğinde açılır.
7. **MDM-044 (Veri Temizleme ve Migrasyon)**: `MDM-043 = "eski_sistemden_aktarim_yapilacak"` seçildiğinde açılır.
