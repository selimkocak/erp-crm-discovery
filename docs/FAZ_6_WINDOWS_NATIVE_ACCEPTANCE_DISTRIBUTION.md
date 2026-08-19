# FAZ-6 — Windows Native Acceptance & Dağıtım Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6 — Windows Native Acceptance & Dağıtım (Release Automation & Packaging)  
**Versiyon:** 0.1.0  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  

---

## 1. Amaç

Bu fazın amacı, **ERP CRM Discovery** masaüstü uygulamasının FAZ-0'dan FAZ-5.1'e kadar geliştirilen tüm veri saklama, dinamik soru motoru, semantik analiz katmanı, rapor önizleme ve yerel DOCX/PDF dışa aktarım kabiliyetlerini Windows 10/11 x64 platformuna paketlemek, kurumsal dağıtıma hazır hale getirmek, CI/CD otomasyonunu mühürlemek ve Windows kullanıcı kabul standartlarını belgelemektir.

---

## 2. Dağıtım Mimarisi ve Paketleme

Uygulama son kullanıcıya ve IT yöneticilerine iki farklı formatta sunulmaktadır:

```text
[ Git Tag (v0.1.0) ]
        │
        ▼
[ GitHub Actions: release-windows.yml ]
(windows-latest Runner / MSVC x86_64)
        │
        ├──► 1. ERP-CRM-Discovery-Setup.exe (Birincil: NSIS Kurulum Paketi)
        └──► 2. ERP-CRM-Discovery-Portable.zip (İkincil: Taşınabilir Arşiv)
```

| Dağıtım Tipi | Dosya Adı | Hedef Kitle | Özellikler |
|---|---|---|---|
| **Birincil (Primary)** | `ERP-CRM-Discovery-Setup.exe` | Son Kullanıcı / Danışman | NSIS tabanlı modern kurulum, masaüstü kısayolu, başlat menüsü, Türkçe/İngilizce dil seçimi, sessiz kurulum (`/S`) |
| **İkincil (Secondary)** | `ERP-CRM-Discovery-Portable.zip` | Kısıtlı Yetkili / USB Kullanımı | Kurulum gerektirmez, doğrudan klasöre çıkartılıp çalıştırılır |

---

## 3. Tauri 2 Windows & NSIS Konfigürasyonu (`src-tauri/tauri.conf.json`)

Tauri 2 NSIS paketi kurumsal gereksinimlere göre optimize edilmiştir:

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
    "nsis": {
      "installerIcon": "icons/icon.ico",
      "installMode": "currentUser",
      "languages": ["Turkish", "English"],
      "displayLanguageSelector": true
    }
  }
}
```

### Konfigürasyon İlkeleri:
1. **`installMode: "currentUser"`:** Yönetici (UAC / Administrator) parolası sormadan doğrudan kullanıcının `%LOCALAPPDATA%\Programs\ERP CRM Discovery` dizinine kurulur. Kurumsal ortamlarda BT izni beklemeden danışmanlar tarafından anında çalıştırılabilir.
2. **Çift Dil Desteği (`languages: ["Turkish", "English"]`):** Kurulum sihirbazı otomatik dil seçimi sunar.
3. **Masaüstü ve Başlat Menüsü Kısayolları:** Kurulum sonunda otomatik eklenir, kaldırma (uninstaller) sırasında temizce kaldırılır.

---

## 4. GitHub Actions CI/CD Pipeline

İki bağımsız iş akışı (workflow) tanımlanmıştır:

### A. Sürekli Entegrasyon (`.github/workflows/ci.yml`)
- **Tetikleyici:** `main` veya `master` dallarına yapılan push veya pull request'ler.
- **İşlemler:**
  1. `npm ci` (Node.js 20)
  2. `npm test` (351/351 test çalıştırılır)
  3. `npm run build` (Vite frontend derlemesi)
  4. `cargo check` (Rust backend doğrulama)

### B. Windows Release Dağıtımı (`.github/workflows/release-windows.yml`)
- **Tetikleyici:** `v*` formatında git tag atılması (`v0.1.0` vb.) veya manual `workflow_dispatch`.
- **Ortam:** `windows-latest` (Tam yerel Microsoft MSVC x86_64 ortamı).
- **Çıktılar:**
  - `ERP-CRM-Discovery-Setup.exe` (NSIS Installer)
  - `ERP-CRM-Discovery-Portable.zip` (Taşınabilir paket)
  - Otomatik GitHub Release yayını ve asset yüklemesi.

---

## 5. Güvenlik, Gizlilik ve İzin Modeli

### Least Privilege (En Az Ayrıcalık) Yetkilendirmesi (`src-tauri/capabilities/default.json`):
```json
{
  "permissions": [
    "core:default",
    "sql:default",
    "dialog:default",
    "fs:default"
  ]
}
```
- **Sıfır Ağ Erişimi (Zero Network Egress):** `http`, `fetch`, `websocket` izinleri bulunmaz.
- **Lokal Veri İzolasyonu:** Tüm şirket verileri, analizler, bulgular ve notlar sadece yerel SQLite dosyasında (`%APPDATA%\com.erpcrm.discovery\erp_discovery.db`) saklanır.
- **Offline Lisanslama:** TrueType fontlar (`Liberation Sans`) ve soru paketleri yerel olarak gömülüdür; harici sunucu veya CDN ihtiyacı yoktur.

---

## 6. Windows Kurulum ve Çalıştırma Kılavuzu

### Standart Kurulum:
1. `ERP-CRM-Discovery-Setup.exe` dosyasını indirin ve çift tıklayın.
2. Kurulum dilini seçin (**Türkçe** veya **English**).
3. "İleri" butonuna basarak kurulumu tamamlayın.
4. Masaüstündeki veya Başlat Menüsündeki **ERP CRM Discovery** kısayolundan uygulamayı başlatın.

### IT Yöneticileri için Sessiz Kurulum (Silent Install):
Kurumsal Active Directory veya SCCM/Intune üzerinden sessiz kurulum yapmak için:
```cmd
ERP-CRM-Discovery-Setup.exe /S
```
Özel kurulum dizini belirtmek için:
```cmd
ERP-CRM-Discovery-Setup.exe /S /D=C:\CustomApps\ERP-CRM-Discovery
```

### Windows Defender SmartScreen Notu (Açık Kaynak Sürüm):
Henüz kurumsal EV kod imzalama sertifikası eklenmemiş açık kaynak sürümlerde Windows Defender mavi uyarı penceresi ("Windows bilgisayarınızı korudu") gösterebilir.
- **Aşma Adımı:** **"Ek Bilgi" (More Info)** linkine tıklayın ve **"Yine de Çalıştır" (Run Anyway)** butonuna basın. Bu işlem yalnızca ilk çalıştırmada bir defa istenir.

---

## 7. Veri Yedekleme ve Dosya Yolları

| Veri Tipi | Windows Dosya Yolu |
|---|---|
| **Lokal SQLite Veritabanı** | `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` |
| **Uygulama İkili Dosyaları** | `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` |
| **Dışa Aktarılan Raporlar (DOCX / PDF)** | Kullanıcının Native Dialog penceresinde seçtiği hedef dizin (Varsayılan: `Belgelerim` / `Masaüstü`) |

---

## 8. Test ve Doğrulama Sonuçları

```bash
npm test
# FAZ-2 Test Sonucu: 144 PASS / 0 FAIL
# FAZ-3 Semantic Layer Test Sonucu: 52 PASS / 0 FAIL
# FAZ-4 Report Model Test Sonucu: 41 PASS / 0 FAIL
# FAZ-5.1 Native Save + PDF Unicode Test Sonucu: 39 PASS / 0 FAIL
# Clean Install Test Sonucu (11 Tablo): 28 PASS / 0 FAIL
# FAZ-6 Release Readiness Test Sonucu: 47 PASS / 0 FAIL
# TOPLAM: 351 PASS / 0 FAIL

npm run build
# ✓ 1876 modules transformed.
# ✓ built in 4.50s (0 hata)

cargo check --manifest-path src-tauri/Cargo.toml
# Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.68s (0 hata)
```

---

## 9. Faz Kabul Matrisi (Acceptance Matrix)

| Kriter | Durum | Doğrulama Yöntemi |
|---|---|---|
| **Version Parity (`package.json` == `Cargo.toml` == `tauri.conf.json`)** | ✓ PASS | `faz6_release_readiness_test.ts` T01 |
| **Tauri 2 NSIS Windows Bundle Konfigürasyonu** | ✓ PASS | `faz6_release_readiness_test.ts` T02 |
| **Security & Capabilities (Zero Network, En Az Ayrıcalık)** | ✓ PASS | `faz6_release_readiness_test.ts` T03 |
| **İkon ve Görsel Varlık Bütünlüğü (`icon.ico` multi-size)** | ✓ PASS | `faz6_release_readiness_test.ts` T04 |
| **Windows Dosya Yolu ve Dosya Adı Sanitization** | ✓ PASS | `faz6_release_readiness_test.ts` T05 |
| **GitHub Actions CI Pipeline (`ci.yml`)** | ✓ PASS | `faz6_release_readiness_test.ts` T06 |
| **GitHub Actions Windows Release Pipeline (`release-windows.yml`)** | ✓ PASS | `faz6_release_readiness_test.ts` T06 |
| **Tüm Testler (351 Test)** | ✓ PASS | `npm test` %100 Başarı |
| **Frontend Üretim Derlemesi (`dist/`)** | ✓ PASS | `npm run build` 0 Hata |
| **Rust Backend Derlemesi (`src-tauri/`)** | ✓ PASS | `cargo check` 0 Hata |

---

**FAZ-6 ACCEPTANCE: PASS**  
**TÜM FAZLAR (FAZ-0..FAZ-6) BAŞARIYLA TAMAMLANDI VE MÜHÜRLENDİ.**
