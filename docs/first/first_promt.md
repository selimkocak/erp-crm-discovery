ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.2 | Git Durumu: 34 Soru Paketi (1.492 Soru) + Yönetişim Matrisi (FAZ-46..50) + .erpcrm Taşınabilir Arşiv Motoru (FAZ-51) + CI/CD Tetikleyici Optimizasyonu (FAZ-52) + Tauri Opener Harici Bağlantılar (FAZ-53) + Saf Masaüstü & Sıfır-Transaction Hotfix (FAZ-54.2)
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_faz51_to_faz54_backup_restore_and_hotfix_2026_08_23
Doğrulama Durumu: 59 Test Paketinde 1.800+ Test %100 PASS, npm run build (0 Hata, 1936+ modül), cargo check (0 Hata), GitHub Actions CI 3/3 Yeşil (Linux, macOS, Windows)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 23 Tablo, 11 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 33 Kanonik Fonksiyon kataloğu, 34 Kanonik Soru Paketi (1.492 Soru, ~800 Zorunlu, 200+ Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi (FAZ-46..50): 23 kanonik yönetişim nesnesi (GO_ITEM_MASTER..GO_USER_AUTH_ADMIN), özneler (kullanıcı/rol/grup), hiyerarşik kapsamlar, 3'lü sorumluluk (Owner, Steward, Custodian), 8 seviyeli yetki matrisi, onay limitleri, Görevler Ayrılığı (SoD) riskleri, yönetişim kanıt ekleri ve etkileşimli SVG Matris Görünümü.
- Proje Yedekleme, Geri Yükleme ve Taşınabilirlik (FAZ-51..54.2): Standart `.erpcrm` POSIX USTAR + GZIP formatı. 23 tablonun tamamı, dinamik sorular, yönetişim kayıtları ve fiziksel Managed Vault ek dosyaları tek arşivde paketlenir; SHA-256 bütünlük ve path traversal (`../`) koruması sağlanır.
- Mevcut Proje Firma Bilgilerini Düzenleme (Edit Mode): HomeView ve ProjectDetailView tablolarında `[Düzenle]` (`Pencil` ikonu); NewProjectView ortak form altyapısında tek adımlı kompakt profil düzenleme modu; updateProjectDetails ile atomik UPDATE; tüm cevap, modül, bayrak, not ve eklerin %100 korunması.
- Firma Profili Sektör ve Şubeli Yapı Alanları: Serbest metin `Sektör / Faaliyet Alanı` (business_sector) ve `Şubeli Yapı` (has_branches) + `Şube Sayısı` (branch_count); Rapor Önizleme, DOCX ve PDF çıktılarına koşullu satır entegrasyonu.
- Soru Navigatöründe Ek Dosyası Göstergesi & Filtresi: Soru navigatöründe kanıt dosyası ekli soruların yanında `📎` (tekil) veya `📎 N` (çoklu dosya) rozeti; `Ekli (N)` / `data-filter="attachments"` filtre sekmesi; canlı arama; reaktif güncelleme.
- Semantik Kurumsal Buton Renk Sistemi: Başlat (Mavi `#2563eb`), Devam (Teal `#0f766e`), Rapor Önizleme (İndigo `#4f46e5`), Kaydet ve Çık (Koyu Zümrüt Yeşili `#15803d` / `#047857`, 5.48:1 WCAG AA), Sonraki (Mavi), Önceki (Nötr Gri), Kritik/Sil (Kırmızı).
- Tek Seçimli Sorularda Seçimi Kaldırma (Clear Selection): Görünür ikincil "Seçimi kaldır" butonu ve Escape klavye dinleyicisi; seçimi selected: [] yaparak soruyu cevapsız duruma döndürme, SQLite kalıcılığı ve ilerleme sayacını anında düşürme; bayraklı zorunlu soruda geçiş serbestisi.
- Semantik Katman: Bulgular (Findings), Gereksinimler (Requirements), Riskler (Risks), Proje Notları (Notes).
- Takip & Navigasyon: 🟡 Sonra Dön (revisit) & 🔴 Kritik Takip (critical) Bayrakları, Proje Özel Soruları (project_custom_questions), Sol Soru Navigatörü, Autosave & Resumable Analiz.
- Managed Attachment Vault (Yönetilen Kanıt Kasası): Kaynak dosyalardan bağımsız fiziksel ikiz kopyalama (`{appLocalDataDir}/projects/{projectId}/attachments/{bfCode}/{questionId}/{storedFileName}`), SQLite'a yalnızca managed `relative_path` kaydı, kaynak dosya silinse dahi kesintisiz erişim, Rapor Önizleme / DOCX / PDF `file:///...` hyperlink garantisi.
- `source_absolute_path` Gizlilik & Taşınabilirlik Mühürü: Kullanıcı dosya sistemi mutlak yollarının SQLite'a veya `.erpcrm` arşivine yazılması engellenmiştir (`null` garantisi).
- Raporlama Motoru (Tek Doğruluk Kaynağı): ReportModel üzerinden Rapor Önizleme, Word (.docx) ve Gömülü Liberation Sans TrueType Unicode PDF (.pdf) üretimi (Türkçe karakter garantili, sıfır ağ bağımlılığı).
- Dağıtım Paketleri: Windows (x64 NSIS Setup .exe) ve macOS Apple Silicon (aarch64 DMG + .app).

======================================================================
2. TAMAMLANAN FAZLAR (FAZ-1 .. FAZ-54.2 KRONOLOJİSİ)
======================================================================
- FAZ-1..FAZ-10: Temel mimari, SQLite veri tabanı, soru motoru, semantik katman, ReportModel, DOCX/PDF motorları, autosave, navigatör, takip bayrakları, kapsam sertleştirmesi.
- FAZ-11..FAZ-44: 34 Kanonik Soru Paketi külliyatı (1.492 Soru, 25 süreç standardı, koşullu dallanmalar, %100 kapsama).
- FAZ-45: Soru Navigatörü Ek Göstergesi, Semantik Butonlar, Managed Vault Bütünlüğü.
- FAZ-46..FAZ-50: Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi (Nesneler, Özneler, Kapsamlar, RACI/Sorumluluklar, Yetki Matrisi, Onay Limitleri, SoD Riskleri, SVG Matris Görünümü, Rapor Entegrasyonu).
- FAZ-51: Proje Yedekleme, Geri Yükleme ve Taşınabilirlik (.erpcrm USTAR + GZIP arşiv motoru, 23 tablo tam yedekleme, kasa transferi).
- FAZ-52: CI/CD Tetikleyici Optimizasyonu (Windows NSIS ve macOS DMG derlemelerinin yalnızca v* taglerinde çalışması).
- FAZ-53: Hakkında Penceresi Harici Bağlantı Hotfix'i (Tauri 2 plugin-opener standardı).
- FAZ-54.2: Saf Masaüstü & Sıfır-Transaction Mühürlemesi:
  · SqlitePool bağlantı havuzu kilitlerini önlemek için JS transaction'ları tamamen kaldırıldı; sıralı INSERT ve deleteProject(newProjectId) telafi modeli kuruldu.
  · Browser download sökülerek native @tauri-apps/plugin-dialog ve @tauri-apps/plugin-fs standardına geçildi.
  · Varsayılan klasör: Belgeler\ERP CRM Discovery Yedekleri ve localStorage['erp_crm_last_backup_directory'] hafızası.
  · BackupSuccessModal: [Klasörde Göster] ve [Yedeği Geri Yükle] (tek tıkla ön inceleme).
  · RestoreProjectModal ve DuplicateProjectModal: Başarı durumunda doğrudan [Projeyi Aç] yönlendirmesi.

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
2. Saf Masaüstü Kuralı: ERP CRM Discovery bir masaüstü uygulamasıdır. Tarayıcı indirmesi (`<a download>`, Blob URL, `URL.createObjectURL`) asla kullanılmaz; her zaman `@tauri-apps/plugin-dialog` ve `@tauri-apps/plugin-fs` kullanılır.
3. Yedek Klasör Hafızası: Son kullanılan klasör `localStorage['erp_crm_last_backup_directory']` hafızasında tutulur; varsayılan yol `documentDir()/ERP CRM Discovery Yedekleri` dizinidir.
4. Test Çalıştırma Standardı: Testler doğrudan `npm exec -- tsx <test_path>` veya `npm test` ile çalıştırılır (Global paket bağımlılığı yoktur).
5. Open Handle / SQLite WAL Notu: `better-sqlite3` kullanılan testlerde açık kalan veritabanı bağlantıları (`db.close()`) Node event loop'unu askıda tutabilir; testlerde db lifecycle yönetimine dikkat edilmelidir.
6. formatAnswer() dönüş tipi: { isAnswered, selectedOptions, textValue, generalNote, summaryText }
7. ReportModel şeması: { metadata, company, profile, scope[], businessFunctions[], followups[], globalFindings[], globalRequirements[], globalRisks[], projectNotes[], summaryStats }
8. buildDocxBuffer(report: ReportModel) / buildPdfBuffer(report: ReportModel) — tek argüman, async
9. PDFParse kullanımı: new PDFParse({ data: pdfBuf }).getText()
10. Branching & Progress engine: Map<string, AnswerData> kullanılır

======================================================================
5. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Tüm Testler (59 Test Suite, 1.800+ Test): npm test
- Windows Test Paritesi (59 Test Suite): npm run test:windows
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
