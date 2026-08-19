# ERP CRM Discovery — Windows Build & Release Guide

**Doküman:** Windows Derleme, Paketleme ve Yayınlama Kılavuzu  
**Versiyon:** `0.1.0` (Release Candidate 1)  
**Tarih:** 19 Ağustos 2026  

---

## 1. Ubuntu Geliştirme & Windows Derleme Modeli

- **Geliştirme Ortamı (Linux / Ubuntu 22.04 LTS):** Kodlama, TypeScript derlemesi, veritabanı migrasyonları, 354 birim/entegrasyon testi (`npm test`) ve Rust sözdizimi doğrulamaları (`cargo check`) bu ortamda yürütülür.
- **Windows Derleme Gereksinimi:** Güvenilir ve hatasız NSIS Windows installer çıktısı elde etmek için derleme doğrudan yerel **Windows MSVC (`x86_64-pc-windows-msvc`)** ortamında veya GitHub Actions `windows-latest` runner üzerinde gerçekleştirilir.

---

## 2. Windows Derleme Makinesi Önkoşulları (Build Machine Only)

> [!IMPORTANT]
> **Son Kullanıcı Ayrımı:** Aşağıdaki araç zinciri **yalnızca derleme yapacak Windows geliştirici/CI makinesi** içindir. Son kullanıcıdan hiçbir runtime kurulması istenmez.

1. **İşletim Sistemi:** Windows 10 / 11 (64-bit).
2. **Node.js:** `v20.x LTS` (npm `10.x` ile).
3. **Rust Toolchain:** `rustc 1.80+` (`x86_64-pc-windows-msvc` hedefi ile).
4. **C++ Derleme Araçları:** Visual Studio Build Tools (C++ Desktop Development paketi).
5. **WebView2:** Windows 11 ve güncel Windows 10'da yerleşik olarak bulunur.
6. **NSIS:** Tauri CLI tarafından derleme esnasında otomatik yönetilir.

---

## 3. Windows Üzerinde Yerel Derleme Adımları (Local Build Commands)

Windows makinesinde PowerShell veya Terminal açılarak:

```powershell
# 1. Proje dizinine geç ve bağımlılıkları temiz yükle
npm ci

# 2. Kanonik iş fonksiyonlarını derle
npm run generate

# 3. Tüm test suitini çalıştır (354 test)
npm test

# 4. Web frontend'ini derle (Vite + TypeScript)
npm run build

# 5. Rust backend denetimini yap
cargo check --manifest-path src-tauri/Cargo.toml

# 6. Windows NSIS Installer paketini üret
npm run tauri build
```

---

## 4. CI/CD Workflow Otomasyonu (`.github/workflows/windows-build.yml`)

Tek ve kanonik Windows derleme iş akışı [.github/workflows/windows-build.yml](file:///home/selim/projects/erp-crm-discovery/.github/workflows/windows-build.yml) altında tanımlıdır.
- **Runner:** `windows-latest`
- **Tetikleyici:** `main`/`master` push/PR veya tag (`v*`)
- **İşlemler:** `npm ci` → `npm run generate` → `npm test` → `npm run build` → `cargo check` → `npm run tauri build` → SHA-256 hesaplama → Artifact upload.

---

## 5. NSIS Paketleme ve WebView2 Stratejisi (`src-tauri/tauri.conf.json`)

```json
"bundle": {
  "active": true,
  "targets": "all",
  "icon": [
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/128x128@2x.png",
    "icons/icon.icns",
    "icons/icon.ico"
  ],
  "copyright": "Copyright © 2026 ERP CRM Discovery Team",
  "category": "Business",
  "shortDescription": "ERP and CRM Pre-Analysis & Discovery Application",
  "longDescription": "Vendor-neutral desktop tool for ERP and CRM pre-implementation discovery, process maturity evaluation, and structured report generation.",
  "publisher": "ERP CRM Discovery Team",
  "windows": {
    "webviewInstallMode": {
      "type": "downloadBootstrapper"
    },
    "nsis": {
      "installerIcon": "icons/icon.ico",
      "installMode": "currentUser",
      "languages": ["Turkish", "English"],
      "displayLanguageSelector": true
    }
  }
}
```

- **`installMode: "currentUser"`:** Yönetici (UAC) şifresi sormadan doğrudan kullanıcının `%LOCALAPPDATA%\Programs\ERP CRM Discovery` dizinine kurulur.
- **`webviewInstallMode: "downloadBootstrapper"`:** Hafif installer (~12-15 MB) sağlar; eksikse runtime internetten indirilir. (Kapalı kurumsal ağlar için `embedBootstrapper` alternatif olarak yapılandırılabilir).

---

## 6. Üretilen Artifact Konumu ve SHA-256 Doğrulama

Tauri derlemesi tamamlandığında NSIS kurulum paketi şu dizinde aranır:
```text
src-tauri/target/**/bundle/nsis/*.exe
```
(Örn: `src-tauri/target/release/bundle/nsis/ERP-CRM-Discovery_0.1.0_x64-setup.exe` veya `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/...`)

### PowerShell ile Gerçek SHA-256 Hash Alma:
```powershell
Get-FileHash -Path (Get-ChildItem -Path "src-tauri/target" -Filter "*setup.exe" -Recurse | Select-Object -First 1).FullName -Algorithm SHA256
```

---

## 7. Windows Dosya Yolları (Paths & Storage)

| Veri Tipi | Windows Gerçek Dosya Yolu | Açıklama |
|---|---|---|
| **Program Binary'leri** | `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` | Kurulum dizini (`currentUser` modu) |
| **Lokal SQLite DB** | `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` | Analiz veritabanı (Roaming AppData) |
| **Kayıt Edilen DOCX/PDF** | Kullanıcının seçtiği dizin (`Masaüstü` / `Belgelerim`) | Native Dialog ile belirlenen konum |

---

## 8. Kod İmzalama ve SmartScreen

- **Açık Kaynak Durumu:** RC1 aşamasında ticari EV kod imzalama sertifikası zorunlu tutulmamıştır.
- **SmartScreen:** İmzasız açık kaynak `.exe` indirildiğinde Windows SmartScreen "Bilinmeyen Yayıncı" uyarısı verir. Bu bir hata değildir. "Ek Bilgi" → "Yine de Çalıştır" adımıyla kurulum başlatılır.
