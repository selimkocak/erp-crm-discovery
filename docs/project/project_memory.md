ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.4+ | Git Durumu: 34 Soru Paketi (1.492 Soru) + Yönetişim Matrisi (FAZ-46..50) + .erpcrm Taşınabilir Arşiv Motoru (FAZ-51..54.2) + Proje Yaşam Döngüsü & Dinamik Kapsam Revizyonu (FAZ-55) + Sentetik Kesikli Üretim Pilotu Marmara Endüstriyel (FAZ-57/58) + İki Seviyeli Proje & Fonksiyon Takvim Yönetimi (FAZ-59) + Antigravity Geliştirme Ajanı Kontrol Mimarisi (FAZ-60) + Ajan Mimarisi Saha Testi & Takvim Bütünlüğü (FAZ-61) + .gitignore ve Temiz Çalışma Ağacı Mühürü
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_faz60_faz61_agent_architecture_and_schedule_integrity_2026_08_24
Doğrulama Durumu: 72 Test Paketinde 1.900+ Test %100 PASS, npm run build (0 Hata, Vite 1945 modül), cargo check (0 Hata), GitHub Actions CI 3/3 Yeşil (Linux, macOS, Windows)
Git HEAD: 2d4f5d0 (main = origin/main)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 23 Kanonik Tablo, 13 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 33 Kanonik Fonksiyon kataloğu, 34 Kanonik Soru Paketi (1.492 Soru, ~800 Zorunlu, 200+ Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Geliştirme Ajanı Kontrol Mimarisi (FAZ-60):
  · Antigravity IDE ve Gemini geliştirme ajanları için `.agents/` kanonik kontrol altyapısı kuruldu.
  · Rol Hiyerarşisi: Selim Koçak (Ürün Sahibi & Nihai Kabul Yetkilisi) → ChatGPT / Tars (Mimar, Kapsam & Kabul Kriteri Üreticisi) → Antigravity IDE (Geliştirme & Yürütme Ortamı) → Gemini Geliştirme Ajanları (İnceleme, Kodlama, Test & Raporlama) → ERP CRM Discovery (Masaüstü Ürün).
  · Ayrılmış Ajan Rolleri: `ROLE: Investigator` (salt-okunur derin analiz), `ROLE: Implementer` (kanıtlanan hata/faz düzeltme), `ROLE: QA` (hedefli test ve kalite kapısı), `ROLE: Release` (yalnızca kullanıcı açık talimatıyla tag/release).
  · AI İzolasyonu: AI araçları yalnızca IDE geliştirme yardımcısıdır; `src/` ve `src-tauri/` içinde AI runtime bileşeni veya API çağrısı yer alamaz.
  · Kök Dizin & ADR-001: Kök `AGENTS.md` → `.agents/agents.md`, 5 iş akışı (`implement-phase`, `diagnose-bug`, `fix-ci`, `verify-release`, `update-memory`), 8 beceri (YAML frontmatter), 6 politika (`change-scope`, `testing-policy`, `ci-recovery-policy`, `git-release-policy`, `user-data-policy`, `communication-policy`), 4 şablon.
- İki Seviyeli Proje & İş Fonksiyonu Takvim Yönetimi (FAZ-59 & FAZ-61):
  · Proje Seviyesi: `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date` (Migration 13).
  · İş Fonksiyonu Seviyesi: 33 modülün her biri için bağımsız 4 takvim tarihi.
  · Zero-Timezone / UTC Epoch Güvenliği: `Date.UTC(y, m-1, d)` ve saf matematiksel gün farkı ile yerel saat dilimi kaymalarına karşı tam koruma.
  · 9 Durumlu Zaman Motoru: `not_planned`, `planned`, `not_started`, `in_progress`, `on_track`, `due_soon`, `overdue`, `completed_on_time`, `completed_late`.
  · Kapsam İzolasyonu: Kapsam dışı bırakılan modüllerin takvim verileri SQLite'da korunur, aktif takvim istatistiklerine (`scheduleStats`) dahil edilmez.
  · Çoğaltma Kuralı: Şablon kopyada planlanan tarihler korunur, fiilî tarihler sıfırlanır (`null`); tam kopyada tüm anlık tarihler korunur.
  · Rapor & Export Paritesi: UI Önizleme, PDF ve Word (DOCX) çıktıları Bölüm 3.1 Proje Takvimi & Zaman Planı altında aynı kanonik `ReportScheduleSummary` modelini tüketir; sıfır `undefined` ve sıfır ham enum garantisi.
- Sentetik Marmara Endüstriyel Pilot Projesi (FAZ-57/58 & FAZ-61):
  · 19 Aktif İş Fonksiyonu (9 Tamamlandı, 10 Devam Ediyor, 0 Başlanmadı).
  · 94 Kanonik Cevap, 427 Zorunlu Soru, %22 İlerleme.
  · 5 Dalgalı Deterministik Takvim: Proje 01.09.2026 – 24.11.2026 (12 hafta).
- Taşınabilir Format (.erpcrm): Sıfır bağımlılıklı POSIX USTAR + GZIP arşiv motoru (`src/storage/tarArchive.ts`). 23 SQLite tablosu, manifest.json (Schema Version 13), project-data.json, checksums.json ve Managed Vault kanıt dosyaları.
- Sıfır SQL Transaction Kilidi: `@tauri-apps/plugin-sql` bağlantı havuzundan (SqlitePool) ötürü frontend'de `BEGIN`/`ROLLBACK` kullanılmaz; sıralı `INSERT` ve hata anında `deleteProject(newProjectId)` telafi temizliği uygulanır.
- Saf Masaüstü Save/Open: Browser download (Blob URL, `<a download>`) tamamen söküldü; `@tauri-apps/plugin-dialog` ve `@tauri-apps/plugin-fs` kullanılır. Varsayılan klasör: `Belgeler/ERP CRM Discovery Yedekleri` ve `localStorage['erp_crm_last_backup_directory']`.
- Managed Attachment Vault: Kaynak dosyalardan bağımsız fiziksel ikiz kopyalama ({appLocalDataDir}/ERP CRM Discovery/attachment/{projectId}/{bfCode}/{questionId}/{uuid}_{safeFileName}), SQLite'a yalnızca managed relative_path kaydı (Migration 8 & 9), kaynak dosya silinse dahi kesintisiz erişim, Rapor Önizleme / DOCX / PDF `file:///` hyperlink garantisi (RFC-8089 3-slash).
- Semantik Kurumsal Buton Renk Sistemi: Başlat (Mavi `#2563eb`), Devam (Teal `#0f766e`), Rapor Önizleme (İndigo `#4f46e5`), Kaydet (Zümrüt `#15803d`/`#047857` WCAG AA 5.48:1), Tehlike (Kırmızı `#dc2626`).
- Dağıtım Paketleri: Windows (x64 NSIS Setup .exe) ve macOS Apple Silicon (aarch64 DMG + .app) — yalnızca `v*` taglerinde üretilir.

======================================================================
2. TAMAMLANAN FAZLAR
======================================================================
- FAZ-1..45: 34 Soru Paketi, dinamik motor, semantik katman, attachment vault, DOCX/PDF, buton tasarım sistemi, soru navigatörü ek göstergesi.
- FAZ-46..50: Veri sahipliği, yetki ve SoD yönetişim matrisi, yönetişim raporu, yönetişim kanıt kasası.
- FAZ-51..54.2: Taşınabilir .erpcrm yedekleme/geri yükleme motoru, CI/CD tag optimizasyonu, Tauri Opener ve çift tıkla ön inceleme.
- FAZ-55..56: Proje yaşam döngüsü & dinamik kapsam revizyonu (soft remove, restore, geçmiş kaydı).
- FAZ-57..58.3: Sentetik kesikli üretim pilotu (Marmara Endüstriyel), foreign key stabilizasyonu, rapor sayaç tutarlılığı (94 kanonik cevap, %22 soru ilerlemesi).
- FAZ-59: İki seviyeli proje ve modül takvim yönetimi, Migration 13, 9 durumlu zaman motoru, PDF/DOCX/UI takvim entegrasyonu, .erpcrm Schema 13.
- FAZ-60: Antigravity geliştirme ajanı kontrol mimarisi, `.agents/` kanonik yapısı, rol geçiş sözleşmesi, AI izolasyonu ve ADR-001 kararı.
- FAZ-61: Ajan mimarisi operasyonel saha testi, takvim bütünlüğü doğrulaması, inline hata standardı, 22 senaryoluk kabul testi ve `.gitignore` mühürlemesi.

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

======================================================================
4. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Tüm Testler (72 Test Paketi, 1.900+ Test): npm test
- Windows Test Paritesi: npm run test:windows
- FAZ-61 Saha & Takvim Kabul Testi: npm exec -- tsx test/faz61_agent_operational_and_schedule_integrity_test.ts
- FAZ-60 Ajan Mimarisi Kabul Testi: npm exec -- tsx test/faz60_agent_architecture_test.ts
- FAZ-59 Takvim Modeli Testi: npm exec -- tsx test/faz59_project_schedule_and_function_timeline_test.ts
- FAZ-58.3 Rapor Sayaç Tutarlılığı Testi: npm exec -- tsx test/faz58_report_counter_consistency_test.ts
- FAZ-51 .erpcrm Yedekleme & Geri Yükleme Testi: npm exec -- tsx test/faz51_project_backup_restore_test.ts
- Registry Yenileme: npm run generate
- Frontend Üretim Derlemesi: npm run build
- Backend Rust Derlemesi: cargo check --manifest-path src-tauri/Cargo.toml

Belleği bu bağlamla tazele ve yeni vereceğim görev için hazır olduğunu bildir.
