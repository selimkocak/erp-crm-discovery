ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.4+ | Git Durumu: 34 Soru Paketi (1.492 Soru) + Yönetişim Matrisi (FAZ-46..50) + .erpcrm Taşınabilir Arşiv Motoru (FAZ-51..54.2) + Proje Yaşam Döngüsü & Dinamik Kapsam Revizyonu (FAZ-55) + Sentetik Kesikli Üretim Pilotu Marmara Endüstriyel (FAZ-57/58) + İki Seviyeli Proje & Fonksiyon Takvim Yönetimi (FAZ-59)
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_faz58_faz59_schedule_and_pilot_repair_2026_08_24
Doğrulama Durumu: 70+ Test Paketinde 1.850+ Test %100 PASS, npm run build (0 Hata, 1945 modül), cargo check (0 Hata), GitHub Actions CI 3/3 Yeşil (Linux, macOS, Windows)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 26 Tablo, 13 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 33 Kanonik Fonksiyon kataloğu, 34 Kanonik Soru Paketi (1.492 Soru, ~800 Zorunlu, 200+ Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Proje Takvimi ve İş Fonksiyonu Zaman Planı (FAZ-59): İki seviyeli zaman yönetimi: (1) Proje genel takvimi, (2) 33 iş fonksiyonunun modül bazlı bağımsız zaman planı. analysis_projects ve project_business_functions tablolarında 4 tarih alanı (planned_start_date, planned_end_date, actual_start_date, actual_end_date). 9 durumlu (not_planned, planned, not_started, in_progress, on_track, due_soon, overdue, completed_on_time, completed_late) merkezi tarih durum motoru (src/models/scheduleStatus.ts). Sıfır timezone/daylight-saving kayması garantisi. ProjectScheduleModal, FunctionScheduleModal, NewProjectView opsiyonel takvim formu, ProjectDetailView kompakt takvim kartı ve süreçler tablosu takvim filtreleri, HomeView takvim kolonu.
- Sentetik Kesikli Üretim Pilotu (FAZ-57/58/59): Marmara Endüstriyel Sistemler A.Ş. (Bursa, Endüstriyel Makine Üretimi, 251-500 çalışan, 3 şube, 19 aktif fonksiyon, 12 haftalık deterministik takvim [2026-09-01..2026-11-24], 5 dalgalı planlanan/gerçekleşen tarih dağılımı, 94 kanonik soru cevabı, bulgular, gereksinimler, riskler, notlar, yönetişim modeli). SQLite FK ve görünür kanonik AnswerData uyumu %100 mühürlendi.
- Proje Yaşam Döngüsü & Dinamik Kapsam Revizyonu (FAZ-55): Aktif/Pasif proje yaşam döngüsü geçişleri; dinamik kapsam ekleme (addOrReactivateProjectFunction); soft-remove ile kapsam dışı bırakırken verilerin (cevaplar, bulgular, riskler, notlar, ekler) %100 korunması; project_scope_changes denetim izi geçmişi.
- Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi (FAZ-46..50): 23 kanonik yönetişim nesnesi (GO_ITEM_MASTER..GO_USER_AUTH_ADMIN), özneler (kullanıcı/rol/grup), hiyerarşik kapsamlar, 3'lü sorumluluk (Owner, Steward, Custodian), 8 seviyeli yetki matrisi, onay limitleri, Görevler Ayrılığı (SoD) riskleri, yönetişim kanıt ekleri ve etkileşimli SVG Matris Görünümü.
- Proje Yedekleme, Geri Yükleme ve Taşınabilirlik (FAZ-51..54.2, FAZ-59): Standart `.erpcrm` POSIX USTAR + GZIP formatı (Schema Version 13). 26 tablonun tamamı, dinamik sorular, 4 takvim tarihi, yönetişim kayıtları ve fiziksel Managed Vault ek dosyaları tek arşivde paketlenir; SHA-256 bütünlük ve path traversal (`../`) koruması sağlanır. Şablon çoğaltmada planlanan tarihler korunur, gerçekleşen tarihler temizlenir ve fonksiyon durumları not_started yapılır. Tam klonlamada tüm tarihler korunur.
- Mevcut Proje Firma Bilgilerini Düzenleme (Edit Mode): HomeView ve ProjectDetailView tablolarında `[Düzenle]` (`Pencil` ikonu); NewProjectView ortak form altyapısında tek adımlı kompakt profil düzenleme modu; updateProjectDetails ile atomik UPDATE; tüm cevap, modül, bayrak, not ve eklerin %100 korunması.
- Firma Profili Sektör ve Şubeli Yapı Alanları: Serbest metin `Sektör / Faaliyet Alanı` (business_sector) ve `Şubeli Yapı` (has_branches) + `Şube Sayısı` (branch_count); Rapor Önizleme, DOCX ve PDF çıktılarına koşullu satır entegrasyonu.
- Soru Navigatöründe Ek Dosyası Göstergesi & Filtresi: Soru navigatöründe kanıt dosyası ekli soruların yanında `📎` (tekil) veya `📎 N` (çoklu dosya) rozeti; `Ekli (N)` / `data-filter="attachments"` filtre sekmesi; canlı arama; reaktif güncelleme.
- Semantik Kurumsal Buton Renk Sistemi: Başlat (Mavi `#2563eb`), Devam (Teal `#0f766e`), Rapor Önizleme (İndigo `#4f46e5`), Kaydet ve Çık (Koyu Zümrüt Yeşili `#15803d` / `#047857`, 5.48:1 WCAG AA), Sonraki (Mavi), Önceki (Nötr Gri), Kritik/Sil (Kırmızı).
- Tek Seçimli Sorularda Seçimi Kaldırma (Clear Selection): Görünür ikincil "Seçimi kaldır" butonu ve Escape klavye dinleyicisi; seçimi selected: [] yaparak soruyu cevapsız duruma döndürme, SQLite kalıcılığı ve ilerleme sayacını anında düşürme; bayraklı zorunlu soruda geçiş serbestisi.
- Semantik Katman: Bulgular (Findings), Gereksinimler (Requirements), Riskler (Risks), Proje Notları (Notes).
- Takip & Navigasyon: 🟡 Sonra Dön (revisit) & 🔴 Kritik Takip (critical) Bayrakları, Proje Özel Soruları (project_custom_questions), Sol Soru Navigatörü, Autosave & Resumable Analiz.
- Managed Attachment Vault (Yönetilen Kanıt Kasası): Kaynak dosyalardan bağımsız fiziksel ikiz kopyalama (`{appLocalDataDir}/projects/{projectId}/attachments/{bfCode}/{questionId}/{storedFileName}`), SQLite'a yalnızca managed `relative_path` kaydı, kaynak dosya silinse dahi kesintisiz erişim, Rapor Önizleme / DOCX / PDF `file:///...` hyperlink garantisi.
- `source_absolute_path` Gizlilik & Taşınabilirlik Mühürü: Kullanıcı dosya sistemi mutlak yollarının SQLite'a veya `.erpcrm` arşivine yazılması engellenmiştir (`null` garantisi).
- Raporlama Motoru (Tek Doğruluk Kaynağı): ReportModel üzerinden Rapor Önizleme, Word (.docx) ve Gömülü Liberation Sans TrueType Unicode PDF (.pdf) üretimi (Türkçe karakter garantili, sıfır ağ bağımlılığı). Bölüm 3.1 Proje Takvimi & Zaman Planı tabloları, sıfır undefined / sıfır Invalid Date güvencesi.
- Dağıtım Paketleri: Windows (x64 NSIS Setup .exe) ve macOS Apple Silicon (aarch64 DMG + .app).

======================================================================
2. TAMAMLANAN FAZLAR KRONOLOJİSİ
======================================================================
- FAZ-1..FAZ-10: Temel mimari, SQLite veri tabanı, soru motoru, semantik katman, ReportModel, DOCX/PDF motorları, autosave, navigatör, takip bayrakları, kapsam sertleştirmesi.
- FAZ-11..FAZ-44: 34 Kanonik Soru Paketi külliyatı (1.492 Soru, 25 süreç standardı, koşullu dallanmalar, %100 kapsama).
- FAZ-45: Soru Navigatörü Ek Göstergesi, Semantik Butonlar, Managed Vault Bütünlüğü.
- FAZ-46..FAZ-50: Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi (Nesneler, Özneler, Kapsamlar, RACI/Sorumluluklar, Yetki Matrisi, Onay Limitleri, SoD Riskleri, SVG Matris Görünümü, Rapor Entegrasyonu).
- FAZ-51..FAZ-54.2: Proje Yedekleme, Geri Yükleme ve Taşınabilirlik (.erpcrm USTAR + GZIP arşiv motoru, 23 tablo tam yedekleme, kasa transferi, saf masaüstü dialogları, sıfır-transaction havuz güvenliği).
- FAZ-55: Proje Yaşam Döngüsü, Dinamik Kapsam Revizyonu ve Geçmiş Denetim İzi (Migration 12, is_active, project_scope_changes).
- FAZ-57: Tek Tıkla Sentetik Kesikli Üretim Pilot Projesi (Marmara Endüstriyel Sistemler A.Ş., 19 fonksiyon, 94 kanonik cevap, bulgular, gereksinimler, riskler, notlar, yönetişim).
- FAZ-58.1 & FAZ-58.2: Sentetik Pilot SQLite FOREIGN KEY Onarımı ve Kanonik Görünür Cevap Formatlaması (Dinamik business_functions.id eşleme, AnswerData uyumu).
- FAZ-59: Proje Takvimi ve İş Fonksiyonu Zaman Planı (Migration 13, 9 durumlu merkezi zaman motoru, iki seviyeli takvim, modal UI, DOCX/PDF/Önizleme Bölüm 3.1, .erpcrm Schema 13 şablon ve tam çoğaltma).

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
4. KRİTİK GÜVENLİK, APİ VE ÇALIŞTIRMA KURALLARI
======================================================================
1. Sıfır SQL Transaction Kuralı: `@tauri-apps/plugin-sql` bağlantı havuzundan (SqlitePool) ötürü frontend'de `BEGIN`, `COMMIT`, `ROLLBACK` kullanılmaz; sıralı `INSERT` ve hata durumunda `deleteProject(newProjectId)` telafi mekanizması kullanılır.
2. Tarih ve Takvim Format Kuralı: Tarihler veritabanında saat içermeyen ISO `YYYY-MM-DD` biçiminde saklanır (`NULL` destekli). Gün farkı hesaplamalarında saat dilimi ve daylight-saving kaymalarını önlemek için saf matematiksel `Date.UTC / 86400000` formülü kullanılır.
3. Saf Masaüstü Kuralı: ERP CRM Discovery bir masaüstü uygulamasıdır. Tarayıcı indirmesi (`<a download>`, Blob URL, `URL.createObjectURL`) asla kullanılmaz; her zaman `@tauri-apps/plugin-dialog` ve `@tauri-apps/plugin-fs` kullanılır.
4. Yedek Klasör Hafızası: Son kullanılan klasör `localStorage['erp_crm_last_backup_directory']` hafızasında tutulur; varsayılan yol `documentDir()/ERP CRM Discovery Yedekleri` dizinidir.
5. Test Çalıştırma Standardı: Testler doğrudan `npm exec -- tsx <test_path>` veya `npm test` ile çalıştırılır (Global paket bağımlılığı yoktur).
6. Open Handle / SQLite WAL Notu: `better-sqlite3` kullanılan testlerde açık kalan veritabanı bağlantıları (`db.close()`) Node event loop'unu askıda tutabilir; testlerde db lifecycle yönetimine dikkat edilmelidir.
7. formatAnswer() dönüş tipi: { isAnswered, selectedOptions, textValue, generalNote, summaryText }
8. ReportModel şeması: { metadata, company, profile, scope[], businessFunctions[], followups[], scheduleSummary, globalFindings[], globalRequirements[], globalRisks[], projectNotes[], summaryStats }
9. buildDocxBuffer(report: ReportModel) / buildPdfBuffer(report: ReportModel) — tek argüman, async
10. PDFParse kullanımı: new PDFParse({ data: pdfBuf }).getText()
11. Branching & Progress engine: Map<string, AnswerData> kullanılır

======================================================================
5. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Tüm Testler (70+ Test Suite, 1.850+ Test): npm test
- Windows Test Paritesi (70+ Test Suite): npm run test:windows
- FAZ-59 Proje & Fonksiyon Takvim Testi: npm exec -- tsx test/faz59_project_schedule_and_function_timeline_test.ts
- FAZ-57 Sentetik Pilot & Yaşam Döngüsü Testi: npm exec -- tsx test/faz57_project_lifecycle_and_demo_pilot_test.ts
- FAZ-55 Kapsam Revizyonu & Geçmiş Testi: npm exec -- tsx test/faz55_project_lifecycle_and_scope_test.ts
- FAZ-51/54 Proje Yedekleme & Geri Yükleme Testi: npm exec -- tsx test/faz51_project_backup_restore_test.ts
- Geliştirici Atfı & Hakkında Kabul Testi: npm exec -- tsx test/attribution_and_about_test.ts
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
