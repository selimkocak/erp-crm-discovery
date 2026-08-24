ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.4+ | Git Durumu: 35 Soru Paketi (1.550 Soru) + Yönetişim Matrisi (FAZ-46..50) + .erpcrm Taşınabilir Arşiv Motoru (FAZ-51..54.2) + Proje Yaşam Döngüsü & Dinamik Kapsam Revizyonu (FAZ-55) + Sentetik Kesikli Üretim Pilotu Marmara Endüstriyel (FAZ-57/58.3) + İki Seviyeli Proje & Fonksiyon Takvim Yönetimi (FAZ-59) + Antigravity Geliştirme Ajanı Kontrol Mimarisi (FAZ-60) + Ajan Mimarisi Operasyonel Saha Testi & Takvim Bütünlüğü (FAZ-61) + Saha Veri Toplama ve Endüstriyel Veri Keşfi (FAZ-62A) + OT İstasyon Profili & Tekrarlayan İstasyon Keşif Akışı (FAZ-62B)
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_faz62a_faz62b_ot_industrial_data_and_station_profile_2026_08_24
Doğrulama Durumu: 73 Test Paketinde 1.980+ Test %100 PASS, npm run build (0 Hata, 1.948 modül), cargo check (0 Hata), GitHub Actions CI 3/3 Yeşil (Linux, macOS, Windows)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 27 Kanonik Tablo, 14 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 34 Kanonik Fonksiyon kataloğu, 35 Kanonik Soru Paketi (1.550 Soru, ~839 Zorunlu, 209+ Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Geliştirme Ajanı Kontrol Mimarisi (FAZ-60):
  · Antigravity IDE ve Gemini geliştirme ajanları için `.agents/` kanonik kontrol altyapısı kuruldu.
  · Rol Hiyerarşisi: Selim Koçak (Ürün Sahibi & Nihai Kabul Yetkilisi) → ChatGPT / Tars (Mimar, Kapsam & Kabul Kriteri Üreticisi) → Antigravity IDE (Geliştirme & Yürütme Ortamı) → Gemini Geliştirme Ajanları (İnceleme, Kodlama, Test & Raporlama) → ERP CRM Discovery (Masaüstü Ürün).
  · Ayrılmış Roller: `ROLE: Investigator` (salt-okunur analiz), `ROLE: Implementer` (kanıtlanan hata/faz düzeltme), `ROLE: QA` (hedefli test ve kalite kapısı), `ROLE: Release` (yalnızca kullanıcı açık talimatıyla tag/release).
  · AI İzolasyonu: AI araçları yalnızca geliştirme ortamı yardımcısıdır; `src/` veya `src-tauri/` içine AI runtime bileşeni veya API çağrısı eklenemez.
  · Kök Dizin & ADR-001: Kök `AGENTS.md` → `.agents/agents.md`, 5 iş akışı (`implement-phase`, `diagnose-bug`, `fix-ci`, `verify-release`, `update-memory`), 8 beceri (YAML frontmatter), 6 politika (`change-scope`, `testing-policy`, `ci-recovery-policy`, `git-release-policy`, `user-data-policy`, `communication-policy`), 4 şablon.
- İki Seviyeli Proje & İş Fonksiyonu Takvim Yönetimi (FAZ-59 & FAZ-61):
  · Proje Seviyesi: `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date` (Migration 13).
  · İş Fonksiyonu Seviyesi: 34 modülün her biri için bağımsız 4 takvim tarihi.
  · Zero-Timezone / UTC Epoch Güvenliği: `Date.UTC(y, m-1, d)` ve saf matematiksel gün farkı ile yerel saat dilimi ve daylight-saving kaymalarına karşı tam koruma.
  · 9 Durumlu Zaman Motoru: `not_planned`, `planned`, `not_started`, `in_progress`, `on_track`, `due_soon`, `overdue`, `completed_on_time`, `completed_late`.
  · Kapsam İzolasyonu: Kapsam dışı bırakılan modüllerin takvim verileri SQLite'da korunur, aktif takvim istatistiklerine (`scheduleStats`) dahil edilmez.
  · Çoğaltma Kuralı: Şablon kopyada planlanan tarihler korunur, fiilî tarihler sıfırlanır (`null`); tam kopyada tüm anlık tarihler korunur.
  · Rapor & Export Paritesi: UI Önizleme, PDF ve Word (DOCX) çıktıları Bölüm 3.1 Proje Takvimi & Zaman Planı altında aynı kanonik `ReportScheduleSummary` modelini tüketir; sıfır `undefined` ve sıfır ham enum garantisi.
- OT & Saha İstasyonları Keşif Mimarisi (FAZ-62A & FAZ-62B):
  · `OT_INDUSTRIAL_DATA` Çekirdek Soru Paketi: İş hedefi odaklı (Purpose-Driven) endüstriyel veri keşfi; 58 soru, 22 süreç, 9 branching.
  · Hiyerarşi: Plant → Production Area → Production Line → Station → Machine / Device / Sensor.
  · SQLite Migration 14: `ot_stations` ve `ot_station_answers` tabloları (`FOREIGN KEY ON DELETE CASCADE`, `UNIQUE(project_id, station_code)`, `UNIQUE(project_id, station_id, question_id)`).
  · İzole İstasyon Cevap Motoru: İstasyon A ve İstasyon B cevapları `station_id` düzeyinde tamamen izole; projenin genel `question_answers` tablosundaki kayıtlar bozulmadan korunur.
  · Taşınabilir Arşiv (.erpcrm Schema 14): `BACKUP_CURRENT_SCHEMA_VERSION = 14`; geri yüklemede `stationIdMap` ile yeni UUID eşlemeleri; şablon kopyada istasyon yapılandırması korunup cevaplar sıfırlanır; tam kopyada her ikisi kopyalanır.
  · Rapor & Export Paritesi: HTML Rapor Önizleme, Word (.docx) ve Liberation Sans TrueType PDF (.pdf) çıktıları Bölüm 3.2 "Saha İstasyonları ve Makine Envanteri (OT/IT)" altında aynı kanonik `ReportOtStationsSummary` modelini tüketir.
  · Kullanıcı Arayüzü: `OtStationModal.tsx`, `OtStationsSection.tsx` (özet istatistik çipleri, tablo, durum değiştirme, istasyon silme, istasyon bazlı soru başlatma) ve `QuestionScreen.tsx` (üst bar istasyon rozeti ve izole persistence).
- Sentetik Marmara Endüstriyel Pilot Projesi (FAZ-57/58.3 & FAZ-61):
  · 19 Aktif İş Fonksiyonu (9 Tamamlandı, 10 Devam Ediyor, 0 Başlanmadı).
  · 94 Kanonik Cevap, 427 Zorunlu Soru, %22 İlerleme.
  · 5 Dalgalı Deterministik Takvim: Proje 01.09.2026 – 24.11.2026 (12 hafta).
- Taşınabilir Format (.erpcrm): Sıfır bağımlılıklı POSIX USTAR + GZIP arşiv motoru (`src/storage/tarArchive.ts`). 27 SQLite tablosu, manifest.json (Schema Version 14), project-data.json, checksums.json ve Managed Vault kanıt dosyaları.
- Sıfır SQL Transaction Kilidi: `@tauri-apps/plugin-sql` bağlantı havuzundan (SqlitePool) ötürü frontend'de `BEGIN`/`ROLLBACK` kullanılmaz; sıralı `INSERT` ve hata anında `deleteProject(newProjectId)` telafi temizliği uygulanır.
- Saf Masaüstü Save/Open: Browser download (Blob URL, `<a download>`) tamamen söküldü; `@tauri-apps/plugin-dialog` ve `@tauri-apps/plugin-fs` kullanılır. Varsayılan klasör: `Belgeler/ERP CRM Discovery Yedekleri` ve `localStorage['erp_crm_last_backup_directory']`.
- Managed Attachment Vault: Kaynak dosyalardan bağımsız fiziksel ikiz kopyalama ({appLocalDataDir}/ERP CRM Discovery/attachment/{projectId}/{bfCode}/{questionId}/{uuid}_{safeFileName}), SQLite'a yalnızca managed relative_path kaydı (Migration 8 & 9), kaynak dosya silinse dahi kesintisiz erişim, Rapor Önizleme / DOCX / PDF `file:///` hyperlink garantisi (RFC-8089 3-slash).
- Semantik Kurumsal Buton Renk Sistemi: Başlat (Mavi `#2563eb`), Devam (Teal `#0f766e`), Rapor Önizleme (İndigo `#4f46e5`), Kaydet (Zümrüt `#15803d`/`#047857` WCAG AA 5.48:1), Tehlike (Kırmızı `#dc2626`).
- Dağıtım Paketleri: Windows (x64 NSIS Setup .exe) ve macOS Apple Silicon (aarch64 DMG + .app) — yalnızca `v*` taglerinde üretilir.

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
- FAZ-58.1 & FAZ-58.3: Sentetik Pilot SQLite FOREIGN KEY Onarımı, Kanonik Görünür Cevap Formatlaması ve Rapor Sayaç Tutarlılığı (94 kanonik cevap, %22 soru ilerlemesi).
- FAZ-59: Proje Takvimi ve İş Fonksiyonu Zaman Planı (Migration 13, 9 durumlu merkezi zaman motoru, iki seviyeli takvim, modal UI, DOCX/PDF/Önizleme Bölüm 3.1, .erpcrm Schema 13 şablon ve tam çoğaltma).
- FAZ-60: Antigravity Geliştirme Ajanı Kontrol Mimarisi (.agents/ kanonik yapısı, rol geçiş sözleşmesi, AI izolasyonu ve ADR-001 kararı).
- FAZ-61: Ajan Mimarisi Operasyonel Saha Testi, Takvim Bütünlüğü Doğrulaması, Satır İçi Hata Standardı, 22 Senaryoluk Kabul Testi ve .gitignore Mühürlemesi.
- FAZ-62A: Saha Veri Toplama, OT/IT ve Endüstriyel Veri Keşfi Çekirdek Modülü (34. kanonik iş fonksiyonu `OT_INDUSTRIAL_DATA`, `tr.ot_industrial_data.core` v0.1.0, 58 soru, 22 süreç, 9 branching, 1.550 soruluk külliyat).
- FAZ-62B: OT İstasyon Profili ve Tekrarlayan İstasyon Keşif Akışı (Plant -> Area -> Line -> Station -> Machine hiyerarşisi, SQLite Migration 14 ot_stations & ot_station_answers, izole cevap motoru, .erpcrm Schema 14, HTML/DOCX/PDF Bölüm 3.2 Saha İstasyonları tablosu, OtStationModal & OtStationsSection UI).

======================================================================
3. AKTİF KÜLLİYAT VE MODÜL LİSTESİ (35 PAKET / 1.550 SORU — %100 TAMAMLANDI)
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
35. OT_INDUSTRIAL_DATA (58 Soru, Saha Veri Toplama & OT/IT) [Kabul Edildi]

======================================================================
4. KRİTİK GÜVENLİK, APİ VE AJAN ÇALIŞTIRMA KURALLARI
======================================================================
1. Ajan Rol Disiplini: Her fazda `ROLE: Investigator` → `ROLE: Implementer` → `ROLE: QA` tek satırlık rol beyanları kullanılmalıdır. Kapsam dışı dosyalara veya mimariye dokunulmamalıdır.
2. AI İzolasyonu: Gemini veya benzeri AI sistemleri geliştirme ortamının araçlarıdır; ERP CRM Discovery uygulamasının çalışma zamanı (runtime) bileşeni değildir. `src/` veya `src-tauri/` içine AI API çağrısı eklenemez.
3. Sıfır SQL Transaction Kuralı: `@tauri-apps/plugin-sql` bağlantı havuzundan (SqlitePool) ötürü frontend'de `BEGIN`, `COMMIT`, `ROLLBACK` kullanılmaz; sıralı `INSERT` ve hata durumunda `deleteProject(newProjectId)` telafi mekanizması kullanılır.
4. Tarih ve Takvim Format Kuralı: Tarihler veritabanında saat içermeyen ISO `YYYY-MM-DD` biçiminde saklanır (`NULL` destekli). Gün farkı hesaplamalarında saat dilimi ve daylight-saving kaymalarını önlemek için saf matematiksel `Date.UTC / 86400000` formülü kullanılır.
5. Saf Masaüstü Kuralı: ERP CRM Discovery bir masaüstü uygulamasıdır. Tarayıcı indirmesi (`<a download>`, Blob URL, `URL.createObjectURL`) asla kullanılmaz; her zaman `@tauri-apps/plugin-dialog` ve `@tauri-apps/plugin-fs` kullanılır.
6. Yedek Klasör Hafızası: Son kullanılan klasör `localStorage['erp_crm_last_backup_directory']` hafızasında tutulur; varsayılan yol `documentDir()/ERP CRM Discovery Yedekleri` dizinidir.
7. Test Çalıştırma Standardı: Testler doğrudan `npm exec -- tsx <test_path>` veya `npm test` ile çalıştırılır (Global paket bağımlılığı yoktur).
8. Pager ve Arka Plan Görev Güvenliği: `git diff` veya terminal komutlarında sayfalayıcı kilitlenmelerini önlemek için `PAGER=cat` kullanılmalıdır. Asılı kalan süreçler `manage_task` ile temizlenmelidir.
9. formatAnswer() dönüş tipi: { isAnswered, selectedOptions, textValue, generalNote, summaryText }
10. ReportModel şeması: { metadata, company, profile, scope[], businessFunctions[], followups[], scheduleSummary, otStationsSummary, globalFindings[], globalRequirements[], globalRisks[], projectNotes[], summaryStats }
11. buildDocxBuffer(report: ReportModel) / buildPdfBuffer(report: ReportModel) — tek argüman, async
12. PDFParse kullanımı: new PDFParse({ data: pdfBuf }).getText()
13. Branching & Progress engine: Map<string, AnswerData> kullanılır

======================================================================
5. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Tüm Testler (73 Test Paketi, 1.980+ Test): npm test
- Windows Test Paritesi (73 Test Paketi): npm run test:windows
- FAZ-62B OT İstasyon Profili Kabul Testi: npm exec -- tsx test/faz62b_ot_station_profile_test.ts
- FAZ-62A Endüstriyel Veri Keşfi Kabul Testi: npm exec -- tsx test/faz62a_ot_industrial_data_pack_test.ts
- FAZ-61 Saha & Takvim Kabul Testi: npm exec -- tsx test/faz61_agent_operational_and_schedule_integrity_test.ts
- FAZ-60 Ajan Mimarisi Kabul Testi: npm exec -- tsx test/faz60_agent_architecture_test.ts
- FAZ-59 Proje & Fonksiyon Takvim Testi: npm exec -- tsx test/faz59_project_schedule_and_function_timeline_test.ts
- FAZ-58.3 Rapor Sayaç Tutarlılığı Testi: npm exec -- tsx test/faz58_report_counter_consistency_test.ts
- FAZ-57 Sentetik Pilot & Yaşam Döngüsü Testi: npm exec -- tsx test/faz57_project_lifecycle_and_demo_pilot_test.ts
- FAZ-55 Kapsam Revizyonu & Geçmiş Testi: npm exec -- tsx test/faz55_project_lifecycle_and_scope_test.ts
- FAZ-51/54 Proje Yedekleme & Geri Yükleme Testi: npm exec -- tsx test/faz51_project_backup_restore_test.ts
- Registry Yenileme: npm run generate
- Frontend Üretim Derlemesi: npm run build
- Backend Rust Derlemesi: cargo check --manifest-path src-tauri/Cargo.toml

Belleği bu bağlamla tazele ve yeni vereceğim görev için hazır olduğunu bildir.
