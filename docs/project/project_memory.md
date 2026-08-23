ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.0 (Release Candidate 1) | Git Durumu: 34 Paket Tamamlandı + Soru Navigatörü Ek Göstergesi + Semantik Buton Sistemi + Managed Vault Windows Native İkiz Kopya + Sektör/Şube Alanları + Mevcut Proje Firma Bilgilerini Düzenleme (Edit Mode) + Kaynak Yolu Gizlilik Mühürü + Geliştirici Atıf & Hakkında Modalı + Kök Dizin Kütüphaneci Arşiv Düzenlemesi (Temiz Çalışma Ağacı)
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_attribution_and_root_archive_2026_08_23
Doğrulama Durumu: 59 Test Paketinde 1.800+ Test %100 PASS, npm run build (0 Hata, Vite 1922 modül), cargo check (0 Hata), GitHub Actions CI 3/3 Yeşil (Linux, macOS, Windows)
Git HEAD: 213d7bc (main = origin/main)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 16 Kanonik Tablo, 10 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 33 Kanonik Fonksiyon kataloğu, 34 Kanonik Soru Paketi (1.492 Soru, ~800 Zorunlu, 200+ Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Mevcut Proje Firma Bilgilerini Düzenleme (Project Profile Edit Mode): HomeView ve ProjectDetailView tablolarında `[Düzenle]` (`Pencil` ikonu, `btn btn-secondary btn--sm`); NewProjectView ortak form altyapısında tek adımlı kompakt profil düzenleme modu (11 alan); updateProjectDetails(projectId, payload) fonksiyonu ile analysis_projects ve company_profiles tablolarında atomik UPDATE; cevapların (question_answers), modüllerin (project_business_functions), takip bayraklarının (question_followups), proje notlarının (project_notes), kanıt kasası eklerinin (question_attachments) %100 korunması (test/project_profile_edit_test.ts 40/40 PASS)
- Firma Profili Sektör ve Şubeli Yapı Alanları: Serbest metin `Sektör / Faaliyet Alanı` (business_sector) ve `Şubeli veya Çok Lokasyonlu Yapı` (has_branches: 'yes' | 'no' | NULL) + `Şube / Lokasyon Sayısı` (branch_count: INTEGER, min 1 pozitif sayı sanitizasyonu); Migration 10 ile DB şeması genişletildi; Rapor Önizleme, DOCX ve PDF çıktılarına koşullu satır entegrasyonu (test/company_profile_sector_and_branch_test.ts 33/33 PASS)
- Soru Navigatöründe Ek Dosyası Göstergesi & Filtresi: Soru navigatöründe kanıt dosyası ekli soruların yanında `📎` (tekil) veya `📎 N` (çoklu dosya) rozeti; `Ekli (N)` / `data-filter="attachments"` filtre sekmesi; ek dosya adı ve ek açıklamasına göre canlı arama; dinamik ekleme/silme reaktivitesi; bayraklarla (Sarı/Kırmızı) simetrik ve çakışmasız çalışma (`pointer-events: none`, `flex-shrink: 0`)
- Semantik Kurumsal Buton Renk Sistemi: İşleve göre açıkça ayrışan renk sistemi:
  · Başlat: Mavi (`#2563eb`, `.button--start`)
  · Devam: Turkuaz / Teal (`#0f766e`, `.button--continue`)
  · Rapor Önizleme: Koyu İndigo (`#4f46e5`, `.button--report`)
  · Kaydet ve Çık / Değişiklikleri Kaydet: Koyu Zümrüt Yeşili (`#15803d` / `#047857`, 5.48:1 WCAG AA, `.button--save`)
  · Sonraki: Mavi (`.button--next`)
  · Önceki / Geri: Nötr gri (`.button--back`)
  · Kritik / Sil: Kırmızı (`.button--danger`)
- Tek Seçimli Sorularda Seçimi Kaldırma (Clear Selection): Platform bağımsız React mimarisinde (QuestionCard, ChoiceOption) görünür ikincil "Seçimi kaldır" butonu ve Escape klavye dinleyicisi; seçimi selected: [] yaparak soruyu cevapsız duruma döndürme, SQLite kalıcılığı ve ilerleme sayacını anında düşürme; bayraklı zorunlu cevapsız soruda Sonraki ile geçebilme, bayraksızken ilerlemeyi açıklayıcı uyarıyla engelleme; checkbox çoklu seçim bağımsızlığını koruma
- Semantik Katman: Bulgular (Findings), Gereksinimler (Requirements), Riskler (Risks), Proje Notları (Notes)
- Takip & Navigasyon: 🟡 Sonra Dön (revisit) & 🔴 Kritik Takip (critical) Bayrakları, Proje Özel Soruları (project_custom_questions), Sol Soru Navigatörü, Autosave & Resumable Analiz
- Soru Ekranı Üst Bar & Geometrik Simetri: .question-screen-toolbar 3-kolonlu CSS Grid (190px / 240px / auto), buton min-width sınırları (.btn-save-exit 142px zümrüt #047857 WCAG AA 5.48:1, .btn-nav-home 150px, .btn-custom-question 126px, .btn-interim-report 118px), .flag-actions 2-kolon simetrik grid, .active-flag-banner ve .followup-modal-container (560px max / 420px min)
- Managed Attachment Vault (Yönetilen Kanıt Kasası): Kaynak dosyalardan bağımsız fiziksel ikiz kopyalama ({appLocalDataDir}/ERP CRM Discovery/attachment/{projectId}/{bfCode}/{questionId}/{uuid}_{safeFileName}), SQLite'a yalnızca managed relative_path kaydı (Migration 8 & 9), kaynak dosya silinse dahi kesintisiz erişim, Rapor Önizleme / DOCX / PDF file:///... hyperlink garantisi
- `source_absolute_path` Gizlilik & Taşınabilirlik Mühürü: Kullanıcı dosya sistemi mutlak yollarının (`C:\Users\...`, `/home/...`) SQLite veritabanına kaydedilmesi engellendi; INSERT/UPDATE işlemlerinde mutlak yol NULL yapıldı; Migration 9 ile eski kayıtlar temizlendi; sadece relative_path ve SHA-256 saklandı
- Attachment Hyperlink Mimarisi: openAttachment() → resolveAttachmentAbsolutePath() (relative→appLocalDataDir→backslash native) → invoke("open_attachment_path") → Rust explorer.exe (Windows) / open (macOS) / xdg-open (Linux). DOCX/PDF: resolveAttachmentFileUrlFromRelative() ile async runtime çözümleme. file:///C:/... (RFC-8089, 3 slash). Path traversal: validateRelativePath() + ".." segment normalizasyonu çift katman.
- Raporlama Motoru (Tek Doğruluk Kaynağı): ReportModel üzerinden Rapor Önizleme, Word (.docx) ve Gömülü Liberation Sans TrueType Unicode PDF (.pdf) üretimi (Türkçe karakter garantili, sıfır ağ bağımlılığı)
- Dağıtım Paketleri: Windows (x64 NSIS Setup .exe) ve macOS Apple Silicon (aarch64 DMG + .app)
- Kurulum Rehberleri: docs/guides/installation/ ve artifact ZIP'lerinde WINDOWS_KURULUM_YARDIMI.txt & MACOS_KURULUM_YARDIMI.txt

======================================================================
2. TAMAMLANAN FAZLAR (FAZ-1 .. FAZ-46 & RC1 STABİLİZASYONU)
======================================================================
- FAZ-1 / FAZ-2.2: 31/32 Fonksiyon, soru paketi motoru, SQLite tohumlama ve clean install
- FAZ-3: Semantik analiz katmanı (Bulgu, Gereksinim, Risk, Not)
- FAZ-4: ReportModel mimarisi & Rapor Önizleme ekranı
- FAZ-5 / FAZ-5.1: DOCX & PDF motoru, Native Save Dialog & fs:allow-write-file yetkileri, PDF TrueType Unicode font gömme
- FAZ-6 / FAZ-6.7: Windows ve macOS Apple Silicon CI/CD hatları, Tauri SQL/FS ACL capability'leri
- FAZ-7: Autosave, question_session_state ile son kalınan soru durumu, "Kaldığın Yerden Devam Et" ve Ara Rapor desteği
- FAZ-8: Sol Soru Navigatörü (durum filtreleri, tek tıkla doğrudan soruya atlama) & Proje Özel Soruları (project_custom_questions)
- FAZ-9: Soru Takip Bayrakları (🟡 Sonra Dön / revisit & 🔴 Kritik Takip / critical), Bölüm 5 Açık Konular tablosu, dürüst ilerleme hesabı
- FAZ-10: Saha Kabulü & Rapor Kalite Sertleştirmesi (Scope Hardening: unstarted boş fonksiyonların detay sayfalarından elenmesi, 4-6 sayfa kompakt rapor)
- FAZ-11: PROCUREMENT — Satın Alma Soru Paketi (tr.procurement.core v0.1.0, 40 soru, 20 req, 15 süreç)
- FAZ-12: WAREHOUSE — Depo Yönetimi Soru Paketi (tr.warehouse.core v0.1.0, 38 soru, 19 req, 16 süreç)
- FAZ-13: INVENTORY — Stok Yönetimi Soru Paketi (tr.inventory.core v0.1.0, 37 soru, 19 req, 16 süreç)
- FAZ-14: LOGISTICS — Sevkiyat ve Lojistik Soru Paketi (tr.logistics.core v0.1.0, 37 soru, 19 req, 17 süreç)
- FAZ-15: ACCOUNTING — Muhasebe (Genel) Soru Paketi (tr.accounting.core v0.1.0, 42 soru, 22 req, 19 süreç)
- FAZ-16: TREASURY — Hazine ve Nakit Yönetimi Soru Paketi (tr.treasury.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-17: BUDGET_REPORTING — Bütçe ve Raporlama Soru Paketi (tr.budget_reporting.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-18: REPORTING_ANALYTICS — Raporlama ve Analitik Soru Paketi (tr.reporting_analytics.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-19: CRM — Müşteri Yönetimi Soru Paketi (tr.crm.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-20: PROPOSALS — Teklif ve Fiyatlandırma Soru Paketi (tr.proposals.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-21: MARKETING — Pazarlama ve Kampanya Soru Paketi (tr.marketing.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-22: SUPPLIER_MANAGEMENT — Tedarikçi Yönetimi Soru Paketi (tr.supplier_management.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-23: QUALITY — Kalite Yönetimi Soru Paketi (tr.quality.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-24: MAINTENANCE — Bakım ve Onarım Soru Paketi (tr.maintenance.core v0.1.0, 42 soru, 22 req, 18 süreç)
- FAZ-25: PRODUCTION_PLANNING — Üretim Planlama Soru Paketi (tr.production_planning.core v0.1.0, 44 soru, 24 req, 20 süreç)
- FAZ-26: WORK_ORDERS — İş Emirleri Soru Paketi (tr.work_orders.core v0.1.0, 45 soru, 24 req, 22 süreç)
- FAZ-27: COSTING — Maliyetlendirme Soru Paketi (tr.costing.core v0.1.0, 45 soru, 24 req, 22 süreç)
- FAZ-28: ASSET_MANAGEMENT — Varlık Yönetimi Soru Paketi (tr.asset_management.core v0.1.0, 45 soru, 24 req, 24 süreç)
- FAZ-29: HUMAN_RESOURCES — İnsan Kaynakları Soru Paketi (tr.human_resources.core v0.1.0, 46 soru, 25 req, 25 süreç)
- FAZ-30: PAYROLL — Bordro ve Maaş Soru Paketi (tr.payroll.core v0.1.0, 47 soru, 26 req, 25 süreç)
- FAZ-31: LEGAL_COMPLIANCE — Hukuk ve Mevzuat Uyum Soru Paketi (tr.legal_compliance.core v0.1.0, 46 soru, 25 req, 25 süreç)
- FAZ-32: IT_INFRASTRUCTURE — Bilgi Teknolojileri Altyapısı Soru Paketi (tr.it_infrastructure.core v0.1.0, 47 soru, 26 req, 25 süreç)
- FAZ-33: Soru Bazlı Kanıt ve Dosya Ekleri (Question Evidence & Attachments), Managed Attachment Vault (Yönetilen Kanıt Kasası), Tıklanabilir DOCX/PDF file:/// Hyperlink'leri, Soru Ekranı Sabit Grid Üst Bar & Simetrik Takip Bayrakları Düzeni
- FAZ-34: MASTER_DATA_MANAGEMENT — Ana Veri ve Veri Kalitesi Yönetimi Soru Paketi (tr.master_data_management.core v0.1.0, 47 soru, 25 req, 25 süreç, 7 branching, 0 mükerrerlik) ve Tek Seçimli Cevabı Geri Alma (Clear Selection & Escape) kalıcı çözümü
- FAZ-35: PROJECT_MANAGEMENT — Proje Yönetimi Soru Paketi (tr.project_management.core v0.1.0, 47 soru, 25 req, 25 süreç, 7 branching)
- FAZ-36: E_TRANSFORMATION — E-Dönüşüm Yönetimi Soru Paketi (33. Kanonik Fonksiyon, tr.e_transformation.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-37: INVOICING — Faturalama ve Gider Yönetimi Soru Paketi (tr.invoicing.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-38: DOCUMENT_MANAGEMENT — Doküman Yönetimi Soru Paketi (tr.document_management.core v0.1.0, 47 soru, 27 req, 25 süreç, 8 branching)
- FAZ-39: IMPORT — İthalat ve Gümrük Yönetimi Soru Paketi (tr.import.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching, Landed Cost maliyet dağıtımı & GÇB/GTİP takibi)
- FAZ-40: EXPORT — İhracat ve Dış Ticaret Soru Paketi (tr.export.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-41: ECOMMERCE — E-Ticaret ve Dijital Satış Soru Paketi (tr.ecommerce.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-42: MANAGEMENT — Genel Yönetim ve Kurumsal Yönetişim Soru Paketi (tr.management.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-43: STRATEGY — Stratejik Planlama Soru Paketi (tr.strategy.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-44: TRAINING — Eğitim ve Gelişim Soru Paketi (tr.training.core v0.1.0, 47 soru, 25 req, 25 süreç, 8 branching)
- FAZ-45 (Soru Navigatörü Ek Göstergesi, Semantik Butonlar & Managed Vault Bütünlüğü):
  · Soru Navigatöründe Ek Göstergesi (📎 / 📎 N), Ekli Sorular Filtre Sekmesi ve Arama
  · Kurumsal Semantik Buton Renk Sistemi (Mavi Başlat, Teal Devam, İndigo Rapor, Zümrüt Kaydet)
  · Windows Managed Attachment Vault Native Rust Motoru & Fiziksel Bütünlük Güvencesi
  · 34 Paketlik Külliyat Bağımsız Kalite Denetimi & Süreç/Handle Teşhisi
- FAZ-46 (Firma Profili Düzenleme Modu, Sektör/Şube Alanları & Gizlilik Mühürü):
  · Mevcut Proje Firma Bilgilerini Düzenleme (HomeView & ProjectDetailView Düzenle aksiyonu, NewProjectView tek adımlı kompakt edit modu, updateProjectDetails ile atomik UPDATE, cevap/kapsam/bayrak/ek %100 veri izolasyonu)
  · Firma Profili Sektör ve Şubeli Yapı Alanları (business_sector, has_branches, branch_count, Migration 10, DOCX/PDF koşullu render)
  · `source_absolute_path` Gizlilik & Taşınabilirlik Mühürü (Migration 9 ile mutlak yolların temizlenmesi, SQLite'a yalnızca relative_path kaydı)
  · 58 Test Paketi %100 PASS (1.800+ test), GitHub Actions 3 Platform (Linux, macOS ARM64, Windows NSIS) Yeşil Mühürleme

======================================================================
3. AKTİF KÜLLİYAT VE MODÜL LİSTESİ (34 PAKET / 1.492 SORU — %100 TAMAMLANDI)
======================================================================
1.  SALES (38 Soru) [Kabul Edildi]
2.  PROCUREMENT (40 Soru) [Kabul Edildi]
3.  WAREHOUSE (38 Soru) [Kabul Edildi]
4.  INVENTORY (37 Soru) [Kabul Edildi]
5.  LOGISTICS (37 Soru) [Kabul Edildi]
6.  ACCOUNTING (42 Soru) [Kabul Edildi]
7.  TREASURY (42 Soru) [Kabul Edildi]
8.  BUDGET_REPORTING (42 Soru) [Kabul Edildi]
9.  REPORTING_ANALYTICS (42 Soru) [Kabul Edildi]
10. CRM (42 Soru) [Kabul Edildi]
11. PROPOSALS (42 Soru) [Kabul Edildi]
12. MARKETING (42 Soru) [Kabul Edildi]
13. SUPPLIER_MANAGEMENT (42 Soru) [Kabul Edildi]
14. QUALITY (42 Soru) [Kabul Edildi]
15. MAINTENANCE (42 Soru) [Kabul Edildi]
16. PRODUCTION_PLANNING (44 Soru) [Kabul Edildi]
17. WORK_ORDERS (45 Soru) [Kabul Edildi]
18. COSTING (45 Soru) [Kabul Edildi]
19. ASSET_MANAGEMENT (45 Soru) [Kabul Edildi]
20. HUMAN_RESOURCES (46 Soru) [Kabul Edildi]
21. PAYROLL (47 Soru) [Kabul Edildi]
22. LEGAL_COMPLIANCE (46 Soru) [Kabul Edildi]
23. IT_INFRASTRUCTURE (47 Soru) [Kabul Edildi]
24. MASTER_DATA_MANAGEMENT (47 Soru, Yatay) [Kabul Edildi]
25. PROJECT_MANAGEMENT (47 Soru) [Kabul Edildi]
26. E_TRANSFORMATION (47 Soru) [Kabul Edildi]
27. INVOICING (47 Soru) [Kabul Edildi]
28. DOCUMENT_MANAGEMENT (47 Soru) [Kabul Edildi]
29. IMPORT (47 Soru) [Kabul Edildi]
30. EXPORT (47 Soru) [Kabul Edildi]
31. ECOMMERCE (47 Soru) [Kabul Edildi]
32. MANAGEMENT (47 Soru) [Kabul Edildi]
33. STRATEGY (47 Soru) [Kabul Edildi]
34. TRAINING (47 Soru) [Kabul Edildi]

- Henüz Paketi Olmayan Kanonik Fonksiyon: 0 (Külliyat %100 tamamlandı)
- v0.2.0 Teknik Borç Notu: `inventory` ve `invoicing` arasındaki `INV-` öneki çakışması (runtime SQLite composite key ile güvende; v0.2.0'da INVC- önekine migration ile taşınacak)

======================================================================
4. KRİTİK APİ, TEST VE ÇALIŞTIRMA NOTLARI
======================================================================
- Test Çalıştırma Standardı: Testler doğrudan `npm exec -- tsx <test_path>` veya `npm test` ile çalıştırılmalıdır (Global paket veya PATH bağımlılığı yoktur).
- Open Handle / SQLite WAL Notu: `better-sqlite3` kullanılan testlerde açık kalan veritabanı bağlantıları (`db.close()`) Node event loop'unu askıda tutabilir; testlerde db lifecycle yönetimine dikkat edilmelidir.
- formatAnswer() dönüş tipi: { isAnswered, selectedOptions, textValue, generalNote, summaryText }
- ReportModel şeması: { metadata, company, profile, scope[], businessFunctions[], followups[], globalFindings[], globalRequirements[], globalRisks[], projectNotes[], summaryStats }
- buildDocxBuffer(report: ReportModel) / buildPdfBuffer(report: ReportModel) — tek argüman, async
- PDFParse kullanımı: new PDFParse({ data: pdfBuf }).getText()
- Branching & Progress engine: Map<string, AnswerData> kullanılır

======================================================================
5. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Tüm Testler (58 Test Suite, 1.800+ Test): npm test
- Mevcut Proje Düzenleme Kabul Testi: npm exec -- tsx test/project_profile_edit_test.ts
- Sektör ve Şube Doğrulama Testi: npm exec -- tsx test/company_profile_sector_and_branch_test.ts
- Navigatör Ek Göstergesi Testi: npm exec -- tsx test/question_navigator_attachment_indicator_test.ts
- Windows Managed Vault Bütünlük Testi: npm exec -- tsx test/managed_vault_physical_integrity_test.ts
- Windows Hyperlink URI Testi: npm exec -- tsx test/windows_attachment_hyperlink_test.ts
- Semantik Buton Renk Testi: npm exec -- tsx test/ui_button_design_system_test.ts
- Registry Yenileme: npm run generate
- Frontend Üretim Derlemesi: npm run build
- Backend Rust Derlemesi: cargo check --manifest-path src-tauri/Cargo.toml

Belleği bu bağlamla tazele ve yeni vereceğim görev için hazır olduğunu bildir.
