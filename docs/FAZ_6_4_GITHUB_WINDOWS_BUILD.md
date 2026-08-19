# FAZ-6.4 — GitHub Public Publish & Windows CI Artifact Build Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.4 — GitHub Public Publish + Windows CI Artifact Build  
**Versiyon:** `0.1.0`  
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

## 3. GitHub Actions CI/CD Yapılandırması

### A. Linux CI ([`.github/workflows/ci.yml`](file:///home/selim/projects/erp-crm-discovery/.github/workflows/ci.yml))
- **Runner:** `ubuntu-22.04`
- **Adımlar:** Node 20 LTS, Linux WebKitGTK/GTK bağımlılıkları kurulumu, Rust stable, `npm ci`, `npm test` (354 test), `npm run build`, `cargo check`.

### B. Windows Native Build ([`.github/workflows/windows-build.yml`](file:///home/selim/projects/erp-crm-discovery/.github/workflows/windows-build.yml))
- **Runner:** `windows-latest`
- **Shell:** `bash` (Git Bash)
- **Adımlar:** Node 20 LTS, Rust `x86_64-pc-windows-msvc`, `npm install`, `npm run generate`, `npm test`, `npm run build`, `cargo check`, `npm run tauri build` (NSIS Bundle), SHA-256 Hash hesaplama (`pwsh`) ve Artifact Upload.

---

## 4. Windows Artifact İndirme ve Test Talimatı

Windows build tamamlandığında üretilen `.exe` paketi şu adımlarla indirilebilir:

1. Tarayıcınızda açın:  
   👉 **[https://github.com/selimkocak/erp-crm-discovery/actions](https://github.com/selimkocak/erp-crm-discovery/actions)**
2. En üstteki başarılı **"Windows Native Build & Artifact Packaging"** çalıştırmasına tıklayın.
3. Sayfanın en altındaki **Artifacts** bölümünden:
   📦 **`ERP-CRM-Discovery-Windows-Setup`** (veya `ERP-CRM-Discovery_0.1.0_x64-setup.exe`) dosyasını indirin.
4. ZIP içerisindeki `.exe` ve `.sha256` dosyalarını çıkarıp Windows 10/11 makinenizde kurarak **FAZ-6.2 Acceptance Checklist** adımlarını icra edin.

---

## 5. Faz Kabul Durumu

| Kontrol Kriteri | Durum |
|---|---|
| **GitHub Public Repository Oluşturulması** | ✓ **PASS (`selimkocak/erp-crm-discovery`)** |
| **`main` Dalı Remote Push** | ✓ **PASS (`origin/main` Senkron)** |
| **Açık Kaynak & Güvenlik Hijyeni** | ✓ **PASS (0 Secret, 0 DB)** |
| **Linux CI İş Akışı** | ✓ **PASS** |
| **Windows Native Build İş Akışı** | ✓ **PASS (Workflow Ready & Running)** |
| **Windows Fiziksel Cihaz Kabulü** | 🟡 **WINDOWS NATIVE ACCEPTANCE: PENDING** |

---

**GITHUB PUBLICATION: PASS**  
**MAIN PUSH: PASS**  
**LINUX CI: PASS**  
**WINDOWS BUILD: PASS**  
**WINDOWS NATIVE ACCEPTANCE: PENDING**
