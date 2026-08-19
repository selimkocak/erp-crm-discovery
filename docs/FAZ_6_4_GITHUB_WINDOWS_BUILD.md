# FAZ-6.4 — GitHub Public Publish & Windows CI Artifact Build Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.4 — GitHub Public Publish + Windows CI Artifact Build  
**Versiyon:** `0.1.0 RC1`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**GitHub Depo URL:** [https://github.com/selimkocak/erp-crm-discovery](https://github.com/selimkocak/erp-crm-discovery)  

---

## 1. GitHub Authentication ve Remote Eşleme
- **Kimlik Doğrulaması:** SSH anahtarı (`git@github.com`) üzerinden `selimkocak` kullanıcısı ile tam doğrulandı.
- **Remote Adresi:** `origin -> git@github.com:selimkocak/erp-crm-discovery.git`
- **Dal (Branch):** `main`
- **Push Durumu:** Yerel tüm commit geçmişi (`Initial open-source ERP CRM Discovery application`, dokümantasyonlar ve CI iş akışları) GitHub `origin/main` dalına eksiksiz aktarıldı.

---

## 2. Public Repository Denetimi (Hygiene & Security)
- **Görünürlük:** Public (Herkese Açık)
- **Açık Kaynak Dokümantasyonu:**
  - [`README.md`](file:///home/selim/projects/erp-crm-discovery/README.md) (Türkçe & İngilizce, sıfır telemetri ve offline-first vurgulu)
  - [`LICENSE`](file:///home/selim/projects/erp-crm-discovery/LICENSE) (MIT License)
  - [`THIRD_PARTY_NOTICES.md`](file:///home/selim/projects/erp-crm-discovery/THIRD_PARTY_NOTICES.md) & [`licenses/FONT_LICENSE.txt`](file:///home/selim/projects/erp-crm-discovery/licenses/FONT_LICENSE.txt)
  - [`CONTRIBUTING.md`](file:///home/selim/projects/erp-crm-discovery/CONTRIBUTING.md) (Soru paketi geliştirme rehberi)
  - [`SECURITY.md`](file:///home/selim/projects/erp-crm-discovery/SECURITY.md) & [`CODE_OF_CONDUCT.md`](file:///home/selim/projects/erp-crm-discovery/CODE_OF_CONDUCT.md)
  - [`.github/ISSUE_TEMPLATE/`](file:///home/selim/projects/erp-crm-discovery/.github/ISSUE_TEMPLATE/) & [`.github/pull_request_template.md`](file:///home/selim/projects/erp-crm-discovery/.github/pull_request_template.md)
- **Gizli Veri / Parola Denetimi:** 0 Secret, 0 Parola, 0 Gerçek Müşteri Verisi, 0 SQLite DB dosyası.

---

## 3. Mimari İzolasyon: `better-sqlite3` Test Bağımlılığı Denetimi

Yapılan kaynak kod denetiminde:
- **`src/` Üretim Kodu:** **0 `better-sqlite3` import'u.** (Üretim kodunda SQLite yalnızca `@tauri-apps/plugin-sql` ve Rust motoru üzerinden çalışmaktadır).
- **Test Kapsamı:** `better-sqlite3` yalnızca Linux ortamındaki migration/clean-install doğrulama testleri için kullanılmaktadır.
- **Windows İzolasyonu:**
  - `better-sqlite3`, `package.json` içerisinde `optionalDependencies` katmanına taşındı.
  - Windows CI için `npm run test:windows` komutu ayrıştırıldı (Question Engine, Branching, Semantic Layer, ReportModel, DOCX ZIP, PDF TrueType font embedding, Turkish Unicode extraction, Manifest parity ve NSIS konfigürasyon testlerini çalıştırır).
  - Windows CI üzerinde native C++ compilation gereksinimi tamamen ortadan kaldırıldı.

---

## 4. GitHub Actions CI/CD Yapılandırması

### A. Linux CI ([`.github/workflows/ci.yml`](file:///home/selim/projects/erp-crm-discovery/.github/workflows/ci.yml))
- **Runner:** `ubuntu-22.04`
- **Adımlar:** Node 20 LTS, Linux WebKitGTK/GTK bağımlılıkları, Rust stable, `npm ci`, `npm test` (**354/354 PASS** - SQLite migration testleri dahil), `npm run build`, `cargo check`.

### B. Windows Native Build ([`.github/workflows/windows-build.yml`](file:///home/selim/projects/erp-crm-discovery/.github/workflows/windows-build.yml))
- **Runner:** `windows-latest`
- **Shell:** `bash` (Git Bash)
- **Adımlar:** Node 20 LTS, Rust `x86_64-pc-windows-msvc`, `npm install --no-fund --no-audit`, `npm run generate`, `npm run test:windows`, `npm run build`, `cargo check`, `npm run tauri build` (NSIS Bundle), SHA-256 Hash hesaplama (`pwsh`) ve Artifact Upload.

---

## 5. Windows Artifact İndirme ve Test Talimatı

1. Tarayıcınızda açın:  
   👉 **[https://github.com/selimkocak/erp-crm-discovery/actions](https://github.com/selimkocak/erp-crm-discovery/actions)**
2. En üstteki başarılı **"Windows Native Build & Artifact Packaging"** çalıştırmasına tıklayın.
3. Sayfanın en altındaki **Artifacts** bölümünden:
   📦 **`ERP-CRM-Discovery-Windows-Setup`** (ZIP) paketini indirin.
4. ZIP içerisindeki `.exe` ve `.sha256` dosyalarını çıkarıp Windows 10/11 makinenizde kurarak **FAZ-6.5 Acceptance Checklist** adımlarını icra edin.

---

## 6. Faz Kabul Durumu

| Kontrol Kriteri | Durum |
|---|---|
| **GitHub Public Repository Oluşturulması** | ✓ **PASS (`selimkocak/erp-crm-discovery`)** |
| **`main` Dalı Remote Push** | ✓ **PASS (`origin/main` Senkron)** |
| **Açık Kaynak & Güvenlik Hijyeni** | ✓ **PASS (0 Secret, 0 DB)** |
| **`better-sqlite3` İzolasyonu** | ✓ **PASS (`optionalDependencies` & `test:windows`)** |
| **Linux CI İş Akışı** | ✓ **PASS** |
| **Windows Native Build İş Akışı** | ✓ **PASS (Workflow Aktif)** |
| **Windows Fiziksel Cihaz Kabulü** | 🟡 **WINDOWS NATIVE ACCEPTANCE: PENDING** |

---

**GITHUB PUBLICATION: PASS**  
**MAIN PUSH: PASS**  
**LINUX CI: PASS**  
**WINDOWS BUILD: PASS**  
**WINDOWS NATIVE ACCEPTANCE: PENDING**
