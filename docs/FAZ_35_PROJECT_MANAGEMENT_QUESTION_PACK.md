# FAZ-35 — Proje Yönetimi Soru Paketi

**Paket Kimliği**: `tr.project_management.core`  
**Sürüm**: `0.1.0`  
**İş Fonksiyonu**: `PROJECT_MANAGEMENT` (Alias: `PROJECTS`, `PROJE_YONETIMI`)  
**Soru Sayısı**: 47 Soru (25 Zorunlu, 22 Opsiyonel)  
**Kanonik Süreç Sayısı**: 25 Süreç  
**Dallanma (Branching) Sayısı**: 7 Koşullu Senaryo (Kapalı: 40 Soru, Açık: 47 Soru)  
**ID Formatı**: `PRJ-001` .. `PRJ-047`  

---

## 🎯 Amacı ve Kapsamı

ERP ve CRM dönüşüm projeleri ile mühendislik, taahhüt (ETO - Engineer to Order), Ar-Ge, tesis/yatırım ve BT projelerinde şirketlerin proje yönetimi olgunluğunu ölçmektir. 

Soru paketi; kurumsal Proje Yönetim Ofisi (PMO) varlığı, İş Kırılım Yapısı (WBS), Gantt takvimi, kritik yol analizi, kaynak ve kapasite planlama, bütçe ve gerçekleşen maliyet takibi, timesheet/efor yönetimi, risk kütüğü, resmi değişiklik yönetimi (CR/CCB), alt yüklenici/taşeron koordinasyonu, doküman versiyon kontrolü, UAT/cut-over planlama ve proje kapanışı/lessons learned süreçlerini kapsamlı biçimde değerlendirir.

---

## 🛡️ Sınır Ayrımı (Cross-Pack Isolation)

| Modül | İncelenen Süreçler | FAZ-35 Sınır Ayrımı |
| :--- | :--- | :--- |
| **SALES / PROPOSALS** | Satış fırsatı (lead/opportunity), teklif hazırlama, fiyatlandırma, satış sözleşmesi ve ticari kazanım. | **FAZ-35**: Satış sonrası proje başlatma belgesi (Charter), müşteri teslimat kilometre taşları, geçici/kesin kabul ve müşteri koordinasyonunu inceler. |
| **PROCUREMENT / SUPPLIER_MANAGEMENT** | Genel satın alma talepleri, tedarikçi değerlendirme, satınalma siparişi ve satınalma sözleşmeleri. | **FAZ-35**: Projeye özel malzeme/hizmet ihtiyacı, proje bütçe blokajı, alt yüklenici (taşeron) hakediş denetimi ve proje stok rezervasyonunu inceler. |
| **PRODUCTION_PLANNING / WORK_ORDERS** | Fabrika üretim planı, iş emri rotaları, operasyon süreleri ve atölye çizelgeleme. | **FAZ-35**: Üretim projesinin üst düzey faz/WBS yapısı, teslimat takvimi, dış kaynak entegrasyonu ve proje maliyet görünürlüğünü inceler. |
| **ACCOUNTING / INVOICING / COSTING** | Genel muhasebe yevmiye kayıtları, e-Fatura kesimi, standart maliyet ve safha maliyet hesapları. | **FAZ-35**: Proje bütçesi, gerçekleşen fiili harcama tahakkuku ve Kazanılmış Değer Analizi (EVM) performansını inceler; muhasebe fişi üretmez. |
| **DOCUMENT_MANAGEMENT** | Şirket geneli doküman arşivi, fiziki evrak yönetimi ve genel klasörleme politikaları. | **FAZ-35**: Proje şartnameleri, teknik çizimler, sözleşme zeyilnameleri, onaylı test raporları ve dijital imza denetim izini inceler. |
| **MASTER_DATA_MANAGEMENT** | Stok, cari, varlık ve hiyerarşi ana veri kalitesi, kodlama standardı ve veri temizleme. | **FAZ-35**: Proje kartı, WBS yapısı, kaynak yetkinlik matrisi ve proje stok rezervasyon ana verisinin proje yürütmedeki kullanımını inceler. |

---

## 📊 Soru ve Süreç Dağılımı

| No | Süreç (Process) | Soru ID | Başlık | Tip | Zorunlu | Önem |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | Proje Yönetimi Organizasyonu ve Sorumluluklar | PRJ-001 | PMO ve standart proje yönetim metodolojisi | single_choice | Evet | Critical |
| 2 | Proje Yönetimi Organizasyonu ve Sorumluluklar | PRJ-002 | Proje portföy ve görev takip yazılımları | single_choice | Hayır | High |
| 3 | Proje Türleri ve Proje Sınıflandırması | PRJ-003 | Proje türü ve büyüklük sınıflandırma kriterleri | single_choice | Evet | Critical |
| 4 | Proje Türleri ve Proje Sınıflandırması | PRJ-004 | Dış müşteri projeleri ile iç proje dengesi (Branching Trigger) | single_choice | Evet | High |
| 5 | Proje Açılış ve Onay Süreci | PRJ-005 | Proje Başlatma Belgesi (Project Charter) ve onay | single_choice | Evet | High |
| 6 | Proje Açılış ve Onay Süreci | PRJ-006 | Fizibilite ve ROI (Business Case) analizi | single_choice | Hayır | Medium |
| 7 | Proje Yöneticisi ve Ekip Yapısı | PRJ-007 | Resmi Proje Yöneticisi ataması ve ekip rolleri | single_choice | Evet | High |
| 8 | Proje Yöneticisi ve Ekip Yapısı | PRJ-008 | Organizasyonel yapı (Matris / Fonksiyonel / Proje Odaklı) | single_choice | Hayır | Medium |
| 9 | Proje Hedefleri ve Başarı Kriterleri | PRJ-009 | Ölçülebilir başarı kriterleri (KPI, bütçe, süre, kalite) | single_choice | Evet | High |
| 10 | Proje Hedefleri ve Başarı Kriterleri | PRJ-010 | Paydaşlar arası hedef imza ve mutabakatı | single_choice | Hayır | Medium |
| 11 | Kapsam Tanımı ve Kapsam Dışı Konular | PRJ-011 | Kapsam bildirimi (Scope Statement) ve kapsam dışı maddeler | single_choice | Evet | Critical |
| 12 | İş Kırılım Yapısı (WBS) | PRJ-012 | Hiyerarşik İş Kırılım Yapısı (WBS) kullanımı (Branching Trigger) | single_choice | Evet | High |
| 13 | İş Kırılım Yapısı (WBS) | PRJ-013 | WBS sözlüğü ve sorumluluk (RACI) matrisi (Branching Target) | single_choice | Hayır | Medium |
| 14 | Aşamalar, Kilometre Taşları ve Teslimatlar | PRJ-014 | Aşamalar (Phase/Gate) ve kilometre taşları (Milestones) | single_choice | Evet | High |
| 15 | Aşamalar, Kilometre Taşları ve Teslimatlar | PRJ-015 | Müşteri geçici ve kesin kabul protokolleri (Branching Target) | single_choice | Hayır | High |
| 16 | Proje Takvimi ve Bağımlılıklar | PRJ-016 | Gantt şeması, bağımlılıklar ve Kritik Yol (CPM) analizi | single_choice | Evet | Critical |
| 17 | Proje Takvimi ve Bağımlılıklar | PRJ-017 | Başlangıç baz hattı (Baseline) ve takvim sapma takibi | single_choice | Hayır | High |
| 18 | Kaynak Planlama ve Kapasite Yönetimi | PRJ-018 | Merkezi kaynak havuzu ve kapasite planlama matrisi | single_choice | Evet | High |
| 19 | Kaynak Planlama ve Kapasite Yönetimi | PRJ-019 | Kaynak çakışmaları ve iş yükü dengelemesi (Resource Leveling) | single_choice | Hayır | Medium |
| 20 | İnsan Kaynağı Atama ve Görev Dağılımı | PRJ-020 | Rol, yetkinlik ve tahmini efor (adam-saat) bazlı atama | single_choice | Evet | High |
| 21 | İnsan Kaynağı Atama ve Görev Dağılımı | PRJ-021 | Görev bildirim ve kabul mekanizması | single_choice | Hayır | Medium |
| 22 | Makine, Ekipman ve Teknik Kaynak Planlaması | PRJ-022 | Test ekipmanı, laboratuvar ve lisans rezervasyonu | single_choice | Hayır | Medium |
| 23 | Proje Bütçesi ve Maliyet Planı | PRJ-023 | Kırılımlı onaylı proje maliyet bütçesi (Branching Trigger) | single_choice | Evet | Critical |
| 24 | Proje Bütçesi ve Maliyet Planı | PRJ-024 | Risk yedekleri (Contingency) ve bütçe aşım limiti (Branching Target) | single_choice | Hayır | High |
| 25 | Gerçekleşen Maliyet ve Bütçe Sapması | PRJ-025 | ERP üzerinden proje kodlu anlık fiili harcama tahakkuku | single_choice | Evet | Critical |
| 26 | Gerçekleşen Maliyet ve Bütçe Sapması | PRJ-026 | Kazanılmış Değer Analizi (EVM: CPI, SPI) performans takibi | single_choice | Hayır | High |
| 27 | Zaman ve Efor Takibi | PRJ-027 | Personel proje zaman/efor (Timesheet) girişi (Branching Trigger) | single_choice | Evet | High |
| 28 | Zaman ve Efor Takibi | PRJ-028 | Timesheet yönetici onayı ve proje maliyetine aktarım (Branching Target) | single_choice | Hayır | Medium |
| 29 | Müşteri, Tedarikçi ve Alt Yüklenici Koordinasyonu | PRJ-029 | Dış paydaş iletişim ve koordinasyon planı | single_choice | Evet | High |
| 30 | Müşteri, Tedarikçi ve Alt Yüklenici Koordinasyonu | PRJ-030 | Alt yüklenici (taşeron) ve dış kaynak kullanımı (Branching Trigger) | single_choice | Evet | High |
| 31 | Müşteri, Tedarikçi ve Alt Yüklenici Koordinasyonu | PRJ-031 | Alt yüklenici hakediş, SLA ve teknik teslimat denetimi (Branching Target) | single_choice | Hayır | High |
| 32 | Satın Alma ve Proje Giderleri | PRJ-032 | Proje bütçe kontrollü otomatik satın alma onayı | single_choice | Evet | High |
| 33 | Satın Alma ve Proje Giderleri | PRJ-033 | Projeye özel malzeme depo stok rezervasyonu (Stock Allocation) | single_choice | Hayır | Medium |
| 34 | Proje Risk Yönetimi | PRJ-034 | Risk Kütüğü (Risk Register) ve önleyici aksiyon takibi | single_choice | Evet | Critical |
| 35 | Proje Risk Yönetimi | PRJ-035 | Kritik riskler için B planı (Contingency / Fallback Plan) | single_choice | Hayır | High |
| 36 | Sorun, Aksiyon ve Karar Yönetimi | PRJ-036 | Merkezi sorun, aksiyon ve karar kütüğü (Action / Decision Log) | single_choice | Hayır | High |
| 37 | Değişiklik Talepleri ve Kapsam Değişikliği | PRJ-037 | Resmi Değişiklik Talebi (Change Request - CR) süreci (Branching Trigger) | single_choice | Evet | Critical |
| 38 | Değişiklik Talepleri ve Kapsam Değişikliği | PRJ-038 | Değişiklik Kontrol Kurulu (CCB) ve ek bütçe protokolü (Branching Target) | single_choice | Hayır | High |
| 39 | Onay ve Yetki Matrisi | PRJ-039 | Tutar ve konu bazlı yetki matrisi (DOA) | single_choice | Evet | High |
| 40 | Onay ve Yetki Matrisi | PRJ-040 | Proje yöneticisi harcama ve yetki limitleri | single_choice | Hayır | Medium |
| 41 | Proje Dokümanları, Versiyonlar ve Kanıt Dosyaları | PRJ-041 | Merkezi versiyon kontrollü proje doküman arşivi (DMS) | single_choice | Evet | High |
| 42 | Proje Dokümanları, Versiyonlar ve Kanıt Dosyaları | PRJ-042 | Onaylı teknik dokümanlarda dijital imza ve denetim izi | single_choice | Hayır | Medium |
| 43 | Durum Raporları, Toplantılar ve İletişim | PRJ-043 | Periyodik proje durum dashboard'u ve yönetici raporu | single_choice | Evet | High |
| 44 | Test, Kabul ve Canlıya Geçiş Hazırlığı | PRJ-044 | UAT testleri, pilot ve Canlıya Geçiş (Cut-over) planı (Branching Trigger) | single_choice | Evet | High |
| 45 | Test, Kabul ve Canlıya Geçiş Hazırlığı | PRJ-045 | Canlı geçiş provası (dry-run), kullanıcı eğitimi ve destek devri (Branching Target) | single_choice | Hayır | High |
| 46 | Proje Kapanışı, Devir ve Lessons Learned | PRJ-046 | Kapanış Raporu ve Çıkarılan Dersler (Lessons Learned) toplantısı | single_choice | Evet | High |
| 47 | Proje Kapanışı, Devir ve Lessons Learned | PRJ-047 | Operasyonel ekiplere devir-teslim ve SLA garanti süreci | single_choice | Hayır | Medium |

---

## 🔀 Koşullu Dallanma (Branching) Mantığı

1. **PRJ-024 (Risk Yedekleri ve Bütçe Aşım Kuralı)**: `PRJ-023 = "proje_bazli_ayrintili_butce_var"` seçildiğinde açılır.
2. **PRJ-013 (WBS Sözlüğü ve RACI Matrisi)**: `PRJ-012 = "detayli_hiyerarsik_wbs_kullanilir"` seçildiğinde açılır.
3. **PRJ-015 (Müşteri Geçici ve Kesin Kabul Protokolleri)**: `PRJ-004 = "dis_musteri_projeleri_agirliklidir"` seçildiğinde açılır.
4. **PRJ-031 (Alt Yüklenici Hakediş ve SLA Denetimi)**: `PRJ-030 = "duzenli_alt_yuklenici_ve_dis_kaynak_kullanilir"` seçildiğinde açılır.
5. **PRJ-038 (Değişiklik Kontrol Kurulu - CCB)**: `PRJ-037 = "resmi_cr_sureci_ve_etki_analizi_var"` seçildiğinde açılır.
6. **PRJ-028 (Timesheet Onayı ve Proje Maliyetine Aktarım)**: `PRJ-027 = "detayli_gunluk_saatlik_timesheet_tutulur"` seçildiğinde açılır.
7. **PRJ-045 (Canlıya Geçiş Provası - Dry-run ve Destek Devri)**: `PRJ-044 = "kapsamli_cut_over_ve_canliya_gecis_yapilir"` seçildiğinde açılır.
