ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.0 | Git Durumu: FAZ-39 Mühürlü (Temiz Çalışma Ağacı)
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_faz35_to_faz39_closure_2026_08_21
Doğrulama Durumu: 46 Test Paketinde 1.470+ Test %100 PASS, npm run build (0 Hata), cargo check (0 Hata)
Çoklu Platform Paketleri: macOS Apple Silicon (11.16 MB, ID: 9412445412) & Windows Native (3.93 MB, ID: 9412513418)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 16 Kanonik Tablo, 8 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 33 Kanonik Fonksiyon kataloğu, 29 Kanonik Soru Paketi (1.257 Soru, ~639 Zorunlu, 168 Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Tek Seçimli Sorularda Seçimi Kaldırma (Clear Selection): Platform bağımsız React mimarisinde (QuestionCard, ChoiceOption) görünür ikincil "Seçimi kaldır" butonu ve Escape klavye dinleyicisi; seçimi selected: [] yaparak soruyu cevapsız duruma döndürme, SQLite kalıcılığı ve ilerleme sayacını anında düşürme; bayraklı zorunlu cevapsız soruda Sonraki ile geçebilme, bayraksızken ilerlemeyi açıklayıcı uyarıyla engelleme; checkbox çoklu seçim bağımsızlığını koruma
- Semantik Katman: Bulgular (Findings), Gereksinimler (Requirements), Riskler (Risks), Proje Notları (Notes)
- Takip & Navigasyon: 🟡 Sonra Dön (revisit) & 🔴 Kritik Takip (critical) Bayrakları, Proje Özel Soruları (project_custom_questions), Sol Soru Navigatörü, Autosave & Resumable Analiz
- Soru Ekranı Üst Bar & Geometrik Simetri: .question-screen-toolbar 3-kolonlu CSS Grid (190px / 240px / auto), buton min-width sınırları (.btn-save-exit 142px zümrüt #047857 WCAG AA 5.48:1, .btn-nav-home 150px, .btn-custom-question 126px, .btn-interim-report 118px), .flag-actions 2-kolon simetrik grid, .active-flag-banner ve .followup-modal-container (560px max / 420px min)
- Rapor Önizleme Özel Aksiyonu: Koyu indigo (#4f46e5, hover #4338ca) dolgu ve FileText ikonu ile ara rapordan ayrıştırılmış ana çıktı tasarımı
- Managed Attachment Vault (Yönetilen Kanıt Kasası): Kaynak dosyalardan bağımsız fiziksel ikiz kopyalama ({appLocalDataDir}/projects/{projectId}/attachments/{bfCode}/{questionId}/{uuid}_{safeFileName}), SQLite'a yalnızca managed relative_path kaydı (Migration v8: source_file_name, source_absolute_path, imported_at), kaynak dosya silinse dahi kesintisiz erişim, Rapor Önizleme / DOCX / PDF file:///... hyperlink garantisi, eksik/legacy kayıtlar için re-import mekanizması
- Raporlama Motoru (Tek Doğruluk Kaynağı): ReportModel üzerinden Rapor Önizleme, Word (.docx) ve Gömülü Liberation Sans TrueType Unicode PDF (.pdf) üretimi (Türkçe karakter garantili, sıfır ağ bağımlılığı)
- Dağıtım Paketleri: Windows (x64 NSIS Setup .exe) ve macOS Apple Silicon (aarch64 DMG + .app)
- Kurulum Rehberleri: Kök dizinde ve artifact ZIP'lerinde WINDOWS_KURULUM_YARDIMI.txt & MACOS_KURULUM_YARDIMI.txt

======================================================================
2. TAMAMLANAN FAZLAR (FAZ-1 .. FAZ-39)
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

======================================================================
3. AKTİF KÜLLİYAT VE MODÜL SIRASI
======================================================================
- Mevcut Tamamlanan Külliyat (29 Modül / 1.257 Soru):
  1. SALES (38 Soru) [Kabul Edildi]
  2. PROCUREMENT (40 Soru) [Kabul Edildi]
  3. WAREHOUSE (38 Soru) [Kabul Edildi]
  4. INVENTORY (37 Soru) [Kabul Edildi]
  5. LOGISTICS (37 Soru) [Kabul Edildi]
  6. ACCOUNTING (42 Soru) [Kabul Edildi]
  7. TREASURY (42 Soru) [Kabul Edildi]
  8. BUDGET_REPORTING (42 Soru) [Kabul Edildi]
  9. REPORTING_ANALYTICS (42 Soru) [Kabul Edildi]
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

- Henüz Paketi Olmayan Kanonik Fonksiyonlar (5 Modül):
  1. MANAGEMENT (Genel Yönetim)
  2. STRATEGY (Stratejik Planlama)
  3. TRAINING (Eğitim ve Gelişim)
  4. EXPORT (İhracat ve Dış Ticaret)
  5. ECOMMERCE (E-Ticaret)

- Kural: Tek Modül = Tek Faz = Tek Kabul
- Sıradaki Modül / Faz Adayı: FAZ-40 EXPORT (İhracat ve Dış Ticaret) veya ECOMMERCE (E-Ticaret)
- Çapraz Denetim Kuralı: Cross-Pack Duplication Audit (Kelimeleri değiştirip aynı soruyu tekrar sorma YASAK, net sınır ayrımı zorunlu)

======================================================================
4. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Tüm Testler (46 Suite, 1.470+ Test): npm test
- Windows Test Paritesi: npm run test:windows
- Tekil Test (İthalat & Gümrük): npx tsx test/faz39_import_question_pack_test.ts
- Tekil Test (Doküman Yönetimi): npx tsx test/faz38_document_management_question_pack_test.ts
- Tekil Test (Faturalama): npx tsx test/faz37_invoicing_question_pack_test.ts
- Tekil Test (E-Dönüşüm): npx tsx test/faz36_e_transformation_question_pack_test.ts
- Tekil Test (Proje Yönetimi): npx tsx test/faz35_project_management_question_pack_test.ts
- Tekil Test (Ana Veri Yönetimi): npx tsx test/faz34_master_data_management_question_pack_test.ts
- Frontend Üretim Derlemesi: npm run build
- Backend Rust Derlemesi: cargo check --manifest-path src-tauri/Cargo.toml
- Kod Üretim Senkronizasyonu: npm run generate

Belleği bu bağlamla tazele ve yeni vereceğim görev için hazır olduğunu bildir.
