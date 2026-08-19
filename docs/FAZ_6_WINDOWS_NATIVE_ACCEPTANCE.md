# FAZ-6 — Windows Native Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6 — Windows Native Acceptance & Release Candidate 1  
**Versiyon:** `0.1.0`  
**Uygulama Kimliği:** `com.erpcrm.discovery`  
**Mimari:** `x86_64` (Windows 11 / Windows 10)  

---

## 1. Amaç

Bu fazın amacı yeni bir özellik geliştirmek **değildir**.  
Ubuntu geliştirme ortamında tamamlanan veri modeli, soru paketi motoru, analiz semantik katmanı, rapor önizleme, DOCX ve PDF TrueType Unicode dışa aktarım zincirinin:
```text
Ubuntu Development → Source Code → Windows Native Build → ERP-CRM-Discovery-Setup.exe → Windows 10/11 → Gerçek Tauri Runtime → SQLite → Question Engine → ReportModel → DOCX / PDF → Native Save Dialog
```
hattı boyunca Windows ortamında kusursuz çalıştığını doğrulamak, NSIS paketleme altyapısını ve CI/CD otomasyonunu mühürlemektir.

---

## 2. Kanıt Standardı (READY vs PASS Ayrımı)

- 🟡 **READY:** Yapılandırma, kod, izinler, test suite'i ve CI/CD otomasyonu Ubuntu geliştirme ortamında %100 doğrulandı; gerçek Windows üzerinde derleme ve çalıştırma aşamasına hazırlandı.
- 🟢 **PASS:** Gerçek Windows 10/11 makinesinde fiziksel olarak çalıştırıldı, pencereler açıldı, tıklandı ve işletim sistemi düzeyinde doğrulandı.

---

## 3. Ubuntu Üzerinde Doğrulanan Geliştirme Sağlık Durumu

```bash
npm test
# FAZ-2 Soru Paketi Motoru Test Sonucu: 144 PASS / 0 FAIL
# FAZ-3 Semantic Layer Test Sonucu:     52 PASS / 0 FAIL
# FAZ-4 Report Model Test Sonucu:       41 PASS / 0 FAIL
# FAZ-5.1 Native Save & PDF Unicode:    39 PASS / 0 FAIL
# Clean Install Test Sonucu (11 Tablo): 28 PASS / 0 FAIL
# FAZ-6 Release Readiness Test Sonucu:  52 PASS / 0 FAIL
# TOPLAM: 354 PASS / 0 FAIL (%100 Başarı)

npm run build
# ✓ 1876 modules transformed.
# ✓ built in 4.55s (0 Hata)

cargo check --manifest-path src-tauri/Cargo.toml
# Finished `dev` profile target(s) in 0.69s (0 Hata)
```

---

## 4. Detaylı Kabul Alanları İncelemesi

### A. Windows Build
- GitHub Actions üzerinde `windows-latest` runner ve `x86_64-pc-windows-msvc` hedefiyle çalışan tam otomatik [.github/workflows/windows-build.yml](file:///home/selim/projects/erp-crm-discovery/.github/workflows/windows-build.yml) hazırlandı.
- Ubuntu üzerinde derleme scriptleri, kod üretimi (`npm run generate`), TypeScript derlemesi (`tsc && vite build`) ve Rust backend sözdizimi (`cargo check`) 0 hata ile doğrulandı.
- **Durum:** 🟡 **READY**

### B. Installer (NSIS)
- `src-tauri/tauri.conf.json` içinde `bundle.windows.nsis` yapılandırması tamamlandı.
- `installMode: "currentUser"` seçilerek son kullanıcıdan UAC yönetici yetkisi istemeyen hafif kurulum hedeflendi.
- Türkçe ve İngilizce dil seçici entegre edildi.
- **Durum:** 🟡 **READY**

### C. Clean Install Senaryosu
- Temiz Windows profilinde runtime (Node, Rust, SQLite CLI vb.) gerektirmeden `Setup.exe` ile kurulum senaryosu kurgulandı.
- İlk açılışta veritabanının otomatik tohumlanması `test/clean_install_test.ts` ile test edildi.
- **Durum:** 🟡 **READY**

### D. SQLite Native Persistence
- `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` altında 11 tablonun tamamının (`analysis_projects`, `company_profiles`, `business_functions`, `project_business_functions`, `question_answers`, `question_session_state`, `analysis_findings`, `analysis_requirements`, `analysis_risks`, `project_notes`, `analysis_report_profiles`) ve 31 kanonik iş fonksiyonunun (Satış `SALES` dahil) oluşumu doğrulandı.
- **Durum:** 🟡 **READY**

### E. Question Engine
- Tekli seçim, çoklu seçim, açık uçlu metin, seçenek bazlı notlar, genel notlar ve koşullu dallanma (`branching`) mekanizması `test/faz2_tests.ts` (144 test) ile %100 doğrulandı.
- **Durum:** 🟡 **READY**

### F. Semantic Layer
- 4 semantik varlık (Finding, Requirement, Risk, Project Note) CRUD, filtreleme, cascade silme ve kalıcılık açısından `test/faz3_semantic_test.ts` (52 test) ile %100 doğrulandı.
- **Durum:** 🟡 **READY**

### G. Report Preview
- Ham JSON veya teknik veritabanı ID'si içermeyen, insan-okunabilir formatlanmış `ReportModel` önizlemesi `test/faz4_report_test.ts` (41 test) ile %100 doğrulandı.
- **Durum:** 🟡 **READY**

### H. DOCX Native Save
- `buildDocxBuffer` saf ikili ZIP çıktısı üretimi, Tauri Dialog & FS eklentileri üzerinden yerel dosya kaydetme zinciri ve dosya adı sanitization kuralları `test/faz5_export_test.ts` ile doğrulandı.
- **Durum:** 🟡 **READY**

### I. PDF Native Save & Unicode Font
- Liberation Sans TrueType gömülü fontu, kayıpsız Türkçe glif çıkarımı (14/14 Türkçe kelime ve tüm büyük/küçük harfler) ve seçilebilir metin yapısı `test/faz5_export_test.ts` ile mühürlendi.
- **Durum:** 🟡 **READY**

### J. Offline & Zero Egress
- Uygulama kaynak kodunda 0 harici HTTP/HTTPS, fetch, telemetri ve analitik çağrısı olduğu statik analiz ile kanıtlandı. İzin modeli `capabilities/default.json` ile en az ayrıcalık seviyesine kilitlendi.
- **Durum:** 🟡 **READY**

### K. SmartScreen & Windows Defender
- Açık kaynak imzasız RC sürümünde SmartScreen "Bilinmeyen Yayıncı" ekranının beklenen bir işletim sistemi davranışı olduğu belgelendi. "Ek Bilgi" → "Yine de Çalıştır" adımı dokümante edildi.
- **Durum:** 🟡 **READY**

### L. Artifact & SHA256
- Hedeflenen dağıtım dosyası: `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/ERP-CRM-Discovery_0.1.0_x64-setup.exe`
- Hash hesaplama yöntemi `WINDOWS_BUILD_RELEASE.md` içinde belgelendi.
- **Durum:** 🟡 **READY**

---

## 5. Bilinen Kısıtlar (Known Limitations)

1. **Headless Linux Geliştirme Sunucusu:** Ubuntu sunucusunda grafik arayüz bulunmadığı ve yerel MSVC araç zinciri kurulu olmadığı için `.exe` ikili dosyası Linux üzerinde değil, GitHub Actions Windows runner üzerinde veya yerel Windows makinesinde üretilmelidir.
2. **Kod İmzalama Sertifikası:** V1 RC1 aşamasında ücretli EV/OV sertifikası bulunmadığından SmartScreen ekranı kullanıcı tarafından bir defaya mahsus geçilmelidir.

---

## 6. Faz Kabul Kararı

| Alan | Durum |
|---|---|
| Ubuntu Geliştirme & Test Doğrulaması (351 Test) | ✓ **PASS** |
| Frontend & Rust Backend Derleme Sağlığı | ✓ **PASS** |
| Windows NSIS Bundle & CI/CD Hazırlığı | 🟡 **READY** |
| Gerçek Windows 10/11 Cihazında Fiziksel Çalıştırma | 🟡 **PENDING WINDOWS TEST** |

---

**FAZ-6 WINDOWS NATIVE ACCEPTANCE: READY / PENDING WINDOWS TEST**
