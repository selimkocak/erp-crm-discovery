ERP CRM Discovery Projesi — Bellek Tazeleme ve Oturum Başlangıç Talimatı

Çalışma Dizini: /home/selim/projects/erp-crm-discovery
Mevcut Sürüm: v0.1.4 | Git Durumu: bfc18c0 (main ve origin/main senkron, çalışma ağacı %100 temiz) | 35 Soru Paketi (1.550 Soru, 831 Zorunlu, 719 Opsiyonel, 222 Branching, 34 İş Fonksiyonu + 1 Temel Eğitim Paketi) + Yönetişim Matrisi (FAZ-46..50) + .erpcrm Schema 19 Taşınabilir Arşiv (FAZ-51..66) + Proje Yaşam Döngüsü & Kapsam Revizyonu (FAZ-55) + Sentetik Kesikli Üretim Pilotu Marmara Endüstriyel (FAZ-57/58) + İki Seviyeli Takvim (FAZ-59) + Ajan Mimarisi (FAZ-60/61) + OT Endüstriyel Veri Keşfi & İstasyon Profili (FAZ-62A/B/C) + BPMN Süreç Haritaları & Benimseme Riski (FAZ-63) + Veri Yönetişimi Varlıkları (FAZ-64) + Saha Kanıtları Doğrulama Defteri (FAZ-65) + Pilot Saha Kabulü & Go-Live Hazırlığı (FAZ-66) + Uzman İnceleme Rehberi & Yayın Hazırlığı (FAZ-67) + Son Adversarial Kalite Denetimi R2 (FAZ-68) + Responsive UI ve 10px Layout Harmonizasyonu (FAZ-69) + macOS Apple Silicon DMG ve Windows Native NSIS Setup Dağıtım Paketleri (FAZ-70)
Kalıcı Bellek Kaydı (Knowledge Item): wo_erp_crm_discovery_faz68_to_faz70_responsive_ui_and_packaging_2026_08_25
Doğrulama Durumu: 39 SQLite Tablosu, 19 Migrasyon, 86 Test Paketi (1.800+ Test %100 PASS, 0 Hata), Clean Install (57/57 PASS), FAZ-66 Smoke Testi (88/88 PASS), npm run build (0 Hata, 1.971 modül), cargo check (0 Hata), GitHub Actions CI & Paketleme %100 Yeşil (Linux, macOS, Windows)

======================================================================
1. MİMARİ VE TEKNOLOJİ ÖZETİ
======================================================================
- Temel Konumlandırma: Field-first · Data-first · Analysis-first · Offline-first · Evidence-first · Human-led. Bu proje bir AI uygulaması değildir; AI modeli, tahmin veya otomatik yorum içermez; çekirdek uygulamanın sıfır bulut bağımlılığı vardır.
- Kabuk: Tauri 2 (Rust) + React 18 + TypeScript + Vite 6 + Vanilla CSS (Design Tokens) + Lucide Icons
- Veritabanı: %100 Offline yerel SQLite (erp_discovery.db), 39 Kanonik Tablo, 19 Migrasyon (Tauri plugin-sql)
- Soru Motoru: 34 Kanonik İş Fonksiyonu kataloğu, 35 Kanonik Soru Paketi (1.550 Soru, 831 Zorunlu, 719 Opsiyonel, 222 Koşullu Dallanma/Branching), dinamik soru setleri (tekli/çoklu seçim, koşullu dallanma, zorunlu soru doğrulaması, allow_note, is_other)
- Geliştirme Ajanı Kontrol Mimarisi (FAZ-60 & FAZ-61):
  · Antigravity IDE ve Gemini geliştirme ajanları için `.agents/` kanonik kontrol altyapısı kuruldu.
  · Rol Hiyerarşisi: Selim Koçak (Ürün Sahibi & Nihai Kabul Yetkilisi) → ChatGPT / Tars (Mimar, Kapsam & Kabul Kriteri Üreticisi) → Antigravity IDE (Geliştirme & Yürütme Ortamı) → Gemini Geliştirme Ajanları (İnceleme, Kodlama, Test & Raporlama) → ERP CRM Discovery (Masaüstü Ürün).
  · Ayrılmış Roller: `ROLE: Investigator` (salt-okunur analiz), `ROLE: Implementer` (kanıtlanan hata/faz düzeltme), `ROLE: QA` (hedefli test ve kalite kapısı), `ROLE: Release` (yalnızca kullanıcı açık talimatıyla tag/release).
  · AI İzolasyonu: AI araçları yalnızca geliştirme ortamı yardımcısıdır; `src/` veya `src-tauri/` içine AI runtime bileşeni veya API çağrısı eklenemez.
  · Kök Dizin & ADR-001: Kök `AGENTS.md` → `.agents/agents.md`, 5 iş akışı (`implement-phase`, `diagnose-bug`, `fix-ci`, `verify-release`, `update-memory`), 8 beceri (YAML frontmatter), 6 politika (`change-scope`, `testing-policy`, `ci-recovery-policy`, `git-release-policy`, `user-data-policy`, `communication-policy`), 4 şablon.
- İki Seviyeli Proje & İş Fonksiyonu Takvim Yönetimi (FAZ-59):
  · Proje Seviyesi: `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date` (Migration 13).
  · İş Fonksiyonu Seviyesi: 34 modülün her biri için bağımsız 4 takvim tarihi.
  · Zero-Timezone / UTC Epoch Güvenliği: `Date.UTC(y, m-1, d)` ve saf matematiksel gün farkı ile yerel saat dilimi ve daylight-saving kaymalarına karşı tam koruma.
  · 9 Durumlu Zaman Motoru: `not_planned`, `planned`, `not_started`, `in_progress`, `on_track`, `due_soon`, `overdue`, `completed_on_time`, `completed_late`.
- OT, Saha İstasyonları & Endüstriyel Veri Matrisi (FAZ-62A..62C):
  · `OT_INDUSTRIAL_DATA` Çekirdek Soru Paketi: İş hedefi odaklı (Purpose-Driven) endüstriyel veri keşfi; 58 soru, 22 süreç, 9 branching.
  · Hiyerarşi: Plant → Production Area → Production Line → Station → Machine / Device / Sensor.
  · SQLite Migration 14 & 15: `ot_stations`, `ot_station_answers`, `ot_data_requirements`, `ot_alarm_requirements`, `ot_quality_devices` tabloları.
  · İzole İstasyon Cevap Motoru: İstasyon bazlı cevaplar izole; projenin genel `question_answers` tablosundaki kayıtlar korunur.
- BPMN Süreç Haritaları & Benimseme Riski Analizi (FAZ-63):
  · SQLite Migration 16: `process_maps`, `process_nodes`, `process_edges`.
  · Onay döngüleri, karar düğümleri ve aktör çeşitliliğine göre otomatik süreç karmaşıklığı hesaplama, Yüksek Benimseme Riski (Adoption Risk) uyarısı ve Bölüm 4 rapor paritesi.
- Veri Yönetişimi Varlıkları ve Çok Kademeli Onaylar (FAZ-64):
  · SQLite Migration 17: `data_governance_assets`, `data_governance_access`, `data_governance_approvals`.
  · Veri varlığı yaşam döngüsü, RACI matrisi, yetki sapmaları (discrepancy) ve Bölüm 5 raporlama entegrasyonu.
- Saha Kanıtları ve Doğrulama Kayıt Defteri (FAZ-65):
  · SQLite Migration 18: `evidence_items`, `evidence_links`.
  · Managed Attachment Vault SHA-256 bütünlüğü, kanıt doğrulama durumları ve kanıtsız kritik konular (`unsupportedCriticalFindings`) tespiti.
- Pilot Saha Kabulü ve Go-Live Hazırlığı (FAZ-66):
  · SQLite Migration 19: `readiness_checks` tablosu.
  · 8 Kategori, 24 standart kontrol maddesi tohumlaması, NOT_APPLICABLE payda düşüm formülü.
  · Kritik Kural: Kritik bir kontrol açık veya blokeyken sistem asla projeyi hazır (`isDiscoveryReady = true`) olarak göstermez.
  · Bağlayıcı Feragat: `Bu bölüm uygulama öncesi keşif hazırlığını gösterir; canlıya geçiş onayı değildir.`
- Uzman Saha İnceleme ve Yayın Hazırlık Paketi (FAZ-67):
  · `docs/review/FAZ67_EXPERT_FIELD_REVIEW_GUIDE.md`: MCS ve bağımsız uzmanlar için 10 başlıklı saha inceleme rehberi.
  · `docs/review/FAZ67_QUESTION_PACK_REVIEW_MATRIX.md`: 35 soru paketinin tekil süreç ve soru denetim matrisi.
  · `docs/review/FAZ67_MARMARA_PILOT_ACCEPTANCE_GUIDE.md`: Marmara pilotu 14 aşamalı kabul rehberi ve UAT kontrol listesi.
  · `docs/release/FAZ67_RELEASE_READINESS_REPORT.md`: Kapsamlı yayın hazırlık raporu.
  · `docs/USER_GUIDE_TR.md`: 15 bölümlü Türkçe son kullanıcı kılavuzu.
- Son Uzman Kalite Kontrolü R2 (FAZ-68):
  · `docs/review/FAZ68_FINAL_EXPERT_QUALITY_REVIEW_R2.md`: 35 paket, 1.550 soru, 831 zorunlu soru, 222 branching kuralı, 7 çapraz benzer çift (Jaccard ≥ %65) bağımsız script doğrulaması.
  · Model metadata standardı: `Claude Opus 4.6 (Thinking) — Antigravity IDE`.
  · `READY_WITH_MANUAL_ACCEPTANCE` sınıflandırması, Managed Vault `DESIGN_VERIFIED` statüsü.
- Responsive UI ve 10px Layout Harmonizasyonu (FAZ-69):
  · Global `--page-padding: 10px;` token'ı tanımlandı; tüm view, header, question screen, modal ve döküman kenar boşlukları 10px'e bağlandı.
  · Anti-overflow kuralları ile `100vw` kaynaklı yatay taşmalar temizlendi; `.main-content` ve `.header-inner` için `max-width: 1560px; margin: 0 auto;` ortalaması yapıldı.
  · `QuestionNavigator.tsx`: Mobilde (`<=900px`) sabit sticky yerine backdrop'lu modal drawer ve `Escape` klavye dinleyicisi ile erişilebilir kılındı.
  · `HomeView.tsx`: Mobilde (`<=768px`) gereksiz kolonlar `.hide-on-mobile` ile gizlendi, tablo yatay scroll korumasına alındı.
  · 10 modal bileşeninde `calc(100vw - 20px)` ve dinamik `100dvh` viewport sınırları uygulandı.
  · Canlı Vite dev sunucusu (`http://localhost:1420`) ayağa kaldırılarak `curl -I` ve tarayıcı oturumu ile PNG/WebP görsel kanıtları üretildi.
  · `docs/review/FAZ69_RESPONSIVE_UI_ACCEPTANCE_REVIEW.md` raporu `ACCEPTED_WITH_MINOR_ISSUES` ile mühürlendi; `bfc18c0` commit'i ile `origin/main` senkronize edildi.
- Sentetik Marmara Endüstriyel Pilot Projesi (FAZ-57/58 & FAZ-66):
  · 19 Aktif İş Fonksiyonu (9 Tamamlandı, 10 Devam Ediyor, 0 Başlanmadı).
  · 94 Kanonik Cevap, 427 Zorunlu Soru, %22 İlerleme.
  · 11 OT İstasyonu, 4 BPMN Süreç Haritası, 5 Yönetişim Nesnesi, SoD çakışması (`CHK-GOV-03` BLOCKED), 3 Saha Kanıtı.
- Taşınabilir Format (.erpcrm Schema 19): Sıfır bağımlılıklı POSIX USTAR + GZIP arşiv motoru (`src/storage/tarArchive.ts`). 39 SQLite tablosu, manifest.json (Schema Version 19), project-data.json, checksums.json ve Managed Vault kanıt dosyaları.
- Dağıtım Paketleri (v0.1.4 — FAZ-70):
  · macOS Apple Silicon (`aarch64-apple-darwin` DMG + .app.tar.gz) — GitHub Actions Run #32842377269 (SUCCESS):
    `ERP-CRM-Discovery-macOS-Apple-Silicon` (12.31 MB — SHA-256 doğrulandı).
  · Windows Native NSIS (`x86_64-pc-windows-msvc` Setup .exe) — GitHub Actions Run #32842380436 (SUCCESS):
    `ERP-CRM-Discovery-Windows-Setup` (4.41 MB — SHA-256 doğrulandı).

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
- FAZ-62C: Endüstriyel Veri ve Alarm Gereksinim Matrisi (SQLite Migration 15 ot_data_requirements, ot_alarm_requirements, ot_quality_devices, PLC/SCADA protokolleri, kalite cihazları, PDF-only senaryoları).
- FAZ-63: BPMN Süreç Haritaları & Benimseme Riski Analizi (SQLite Migration 16 process_maps, process_nodes, process_edges, süreç karmaşıklığı, High Adoption Risk uyarısı, Bölüm 4 rapor paritesi).
- FAZ-64: Veri Yönetişimi Varlıkları ve Çok Kademeli Onay Akışları (SQLite Migration 17 data_governance_assets, data_governance_access, data_governance_approvals, Bölüm 5 raporu).
- FAZ-65: Saha Kanıtları ve Doğrulama Kayıt Defteri (SQLite Migration 18 evidence_items, evidence_links, Managed Attachment Vault SHA-256 doğrulaması, kanıtsız kritik konular uyarısı).
- FAZ-66: Pilot Saha Kabulü, Rapor Kalitesi ve Go-Live Hazırlığı (SQLite Migration 19 readiness_checks, 8 kategori, 24 kontrol maddesi, NOT_APPLICABLE payda hesabı, kritik açık kuralı, .erpcrm Schema 19, Bölüm 7 rapor paritesi).
- FAZ-67: Uzman Saha İncelemesi, Ürünleştirme ve Yayın Hazırlığı (5 uzman dokümanı, 35 paket matrisi, Marmara kabul rehberi, 15 bölümlü kullanıcı kılavuzu, Release Readiness raporu).
- FAZ-68: Son Uzman Kalite Kontrolü R2 (35 paket 1.550 soru, 831 zorunlu soru, 222 branching kuralı, 7 çapraz çift doğrulaması, Claude Opus 4.6 Thinking metadata mühürleme, R1 taslak temizliği).
- FAZ-69: Responsive UI ve Layout Harmonizasyonu (Global 10px sayfa dolgusu, anti-overflow, max-width: 1560px, QuestionNavigator mobil çekmece & Escape desteği, HomeView mobil kolon gizleme, 10 modal 100dvh güncellemesi, canlı önizleme görsel kabulü, FAZ69_RESPONSIVE_UI_ACCEPTANCE_REVIEW.md raporu, bfc18c0 commit & push).
- FAZ-70: macOS ve Windows Release Paketleme Doğrulaması (GitHub Actions Run #32842377269 macOS DMG ve Run #32842380436 Windows NSIS Setup %100 SUCCESS, SHA-256 doğrulaması).

======================================================================
3. AKTİF KÜLLİYAT VE MODÜL LİSTESİ (35 PAKET / 1.550 SORU — %100 TAMAMLANDI)
======================================================================
1.  SALES (38 Soru / 21 Zorunlu / 4 Branching) [Kabul Edildi]
2.  PROCUREMENT (40 Soru / 20 Zorunlu / 9 Branching) [Kabul Edildi]
3.  WAREHOUSE (38 Soru / 19 Zorunlu / 8 Branching) [Kabul Edildi]
4.  INVENTORY (37 Soru / 19 Zorunlu / 2 Branching) [Kabul Edildi]
5.  LOGISTICS (37 Soru / 19 Zorunlu / 5 Branching) [Kabul Edildi]
6.  ACCOUNTING (42 Soru / 22 Zorunlu / 4 Branching) [Kabul Edildi]
7.  TREASURY (42 Soru / 22 Zorunlu / 9 Branching) [Kabul Edildi]
8.  BUDGET_REPORTING (42 Soru / 22 Zorunlu / 6 Branching) [Kabul Edildi]
9.  REPORTING_ANALYTICS (42 Soru / 22 Zorunlu / 5 Branching) [Kabul Edildi]
10. CRM (42 Soru / 22 Zorunlu / 5 Branching) [Kabul Edildi]
11. PROPOSALS (42 Soru / 22 Zorunlu / 5 Branching) [Kabul Edildi]
12. MARKETING (42 Soru / 22 Zorunlu / 6 Branching) [Kabul Edildi]
13. SUPPLIER_MANAGEMENT (42 Soru / 22 Zorunlu / 6 Branching) [Kabul Edildi]
14. QUALITY (42 Soru / 22 Zorunlu / 6 Branching) [Kabul Edildi]
15. MAINTENANCE (42 Soru / 22 Zorunlu / 6 Branching) [Kabul Edildi]
16. PRODUCTION_PLANNING (44 Soru / 24 Zorunlu / 5 Branching) [Kabul Edildi]
17. WORK_ORDERS (45 Soru / 24 Zorunlu / 5 Branching) [Kabul Edildi]
18. COSTING (45 Soru / 24 Zorunlu / 5 Branching) [Kabul Edildi]
19. ASSET_MANAGEMENT (45 Soru / 24 Zorunlu / 5 Branching) [Kabul Edildi]
20. HUMAN_RESOURCES (46 Soru / 25 Zorunlu / 5 Branching) [Kabul Edildi]
21. PAYROLL (47 Soru / 26 Zorunlu / 5 Branching) [Kabul Edildi]
22. LEGAL_COMPLIANCE (46 Soru / 25 Zorunlu / 6 Branching) [Kabul Edildi]
23. IT_INFRASTRUCTURE (47 Soru / 25 Zorunlu / 6 Branching) [Kabul Edildi]
24. MASTER_DATA_MANAGEMENT (47 Soru / 25 Zorunlu / 7 Branching, Yatay) [Kabul Edildi]
25. PROJECT_MANAGEMENT (47 Soru / 25 Zorunlu / 7 Branching) [Kabul Edildi]
26. E_TRANSFORMATION (47 Soru / 25 Zorunlu / 8 Branching) [Kabul Edildi]
27. INVOICING (47 Soru / 25 Zorunlu / 8 Branching) [Kabul Edildi]
28. DOCUMENT_MANAGEMENT (47 Soru / 27 Zorunlu / 8 Branching) [Kabul Edildi]
29. IMPORT (47 Soru / 25 Zorunlu / 8 Branching) [Kabul Edildi]
30. EXPORT (47 Soru / 25 Zorunlu / 8 Branching) [Kabul Edildi]
31. ECOMMERCE (47 Soru / 25 Zorunlu / 8 Branching) [Kabul Edildi]
32. MANAGEMENT (47 Soru / 25 Zorunlu / 7 Branching) [Kabul Edildi]
33. STRATEGY (47 Soru / 25 Zorunlu / 8 Branching) [Kabul Edildi]
34. TRAINING (47 Soru / 25 Zorunlu / 8 Branching, Temel Eğitim) [Kabul Edildi]
35. OT_INDUSTRIAL_DATA (58 Soru / 39 Zorunlu / 9 Branching, Saha Veri Toplama & OT/IT) [Kabul Edildi]

Külliyat Toplamı: 35 Paket, 1.550 Soru, 831 Zorunlu (%53.6), 719 Opsiyonel (%46.4), 222 Koşullu Dallanma Noktası (%100 Bütünlük).

======================================================================
4. KRİTİK GÜVENLİK, APİ VE AJAN ÇALIŞTIRMA KURALLARI
======================================================================
1. Ajan Rol Disiplini: Her fazda `ROLE: Investigator` → `ROLE: Implementer` → `ROLE: QA` → `ROLE: Release` tek satırlık rol beyanları kullanılmalıdır. Kapsam dışı dosyalara veya mimariye dokunulmamalıdır.
2. AI İzolasyonu: Gemini veya benzeri AI sistemleri geliştirme ortamının araçlarıdır; ERP CRM Discovery uygulamasının çalışma zamanı (runtime) bileşeni değildir. `src/` veya `src-tauri/` içine AI API çağrısı eklenemez.
3. Sıfır SQL Transaction Kuralı: `@tauri-apps/plugin-sql` bağlantı havuzundan (SqlitePool) ötürü frontend'de `BEGIN`, `COMMIT`, `ROLLBACK` kullanılmaz; sıralı `INSERT` ve hata durumunda `deleteProject(newProjectId)` telafi mekanizması kullanılır.
4. Tarih ve Takvim Format Kuralı: Tarihler veritabanında saat içermeyen ISO `YYYY-MM-DD` biçiminde saklanır (`NULL` destekli). Gün farkı hesaplamalarında saat dilimi ve daylight-saving kaymalarını önlemek için saf matematiksel `Date.UTC / 86400000` formülü kullanılır.
5. Saf Masaüstü Kuralı: ERP CRM Discovery bir masaüstü uygulamasıdır. Tarayıcı indirmesi (`<a download>`, Blob URL, `URL.createObjectURL`) asla kullanılmaz; her zaman `@tauri-apps/plugin-dialog` ve `@tauri-apps/plugin-fs` kullanılır.
6. Responsive & Layout Kuralı: Kenar boşlukları daima `--page-padding: 10px;` token'ına bağlanır. `width: 100vw` yerine `width: 100%` ve `overflow-x: hidden` kullanılır. Modallarda `calc(100vw - 20px)` ve `100dvh` kullanılır.
7. Yedek Klasör Hafızası: Son kullanılan klasör `localStorage['erp_crm_last_backup_directory']` hafızasında tutulur; varsayılan yol `documentDir()/ERP CRM Discovery Yedekleri` dizinidir.
8. Test Çalıştırma Standardı: Testler doğrudan `npm exec -- tsx <test_path>` veya `npm test` ile çalıştırılır (Global paket bağımlılığı yoktur).
9. Pager ve Arka Plan Görev Güvenliği: `git diff` veya terminal komutlarında sayfalayıcı kilitlenmelerini önlemek için `PAGER=cat` kullanılmalıdır. Asılı kalan süreçler `manage_task` ile temizlenmelidir.
10. formatAnswer() dönüş tipi: { isAnswered, selectedOptions, textValue, generalNote, summaryText }
11. ReportModel şeması: { metadata, company, profile, scope[], businessFunctions[], followups[], scheduleSummary, otStationsSummary, processMapsSummary, dataGovernanceSummary, evidenceSummary, readinessSummary, globalFindings[], globalRequirements[], globalRisks[], projectNotes[], summaryStats }
12. buildDocxBuffer(report: ReportModel) / buildPdfBuffer(report: ReportModel) — tek argüman, async
13. PDFParse kullanımı: new PDFParse({ data: pdfBuf }).getText()
14. Branching & Progress engine: Map<string, AnswerData> kullanılır

======================================================================
5. TEMEL DOĞRULAMA KOMUTLARI
======================================================================
- Külliyat Bütünlüğü Denetimi: npm run audit:corpus
- Test Paketi Çalıştırma (86 Test): npm test
- Clean Install Şema Testi (39 Tablo): npm exec -- tsx test/clean_install_test.ts
- FAZ-66 Go-Live Hazırlığı Kabul Testi: npm exec -- tsx test/faz66_pilot_readiness_smoke_test.ts
- FAZ-62C OT Veri Gereksinim Matrisi Testi: npm exec -- tsx test/faz62c_ot_data_requirement_matrix_test.ts
- FAZ-62B OT İstasyon Profili Kabul Testi: npm exec -- tsx test/faz62b_ot_station_profile_test.ts
- FAZ-62A Endüstriyel Veri Keşfi Kabul Testi: npm exec -- tsx test/faz62a_ot_industrial_data_pack_test.ts
- FAZ-58.3 Rapor Sayaç Tutarlılığı Testi: npm exec -- tsx test/faz58_report_counter_consistency_test.ts
- FAZ-57 Sentetik Pilot & Yaşam Döngüsü Testi: npm exec -- tsx test/faz57_project_lifecycle_and_demo_pilot_test.ts
- FAZ-51/54 Proje Yedekleme & Geri Yükleme Testi: npm exec -- tsx test/faz51_project_backup_restore_test.ts
- Registry Yenileme: npm run generate
- Frontend Üretim Derlemesi: npm run build
- Backend Rust Derlemesi: cargo check --manifest-path src-tauri/Cargo.toml
- macOS Apple Silicon DMG Paketi: GitHub Actions Run #32842377269 (12.31 MB — SUCCESS)
- Windows Native NSIS Setup Paketi: GitHub Actions Run #32842380436 (4.41 MB — SUCCESS)

Belleği bu bağlamla tazele ve yeni vereceğim görev için hazır olduğunu bildir.
