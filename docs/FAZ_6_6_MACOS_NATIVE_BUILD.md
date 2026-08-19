# FAZ-6.6 — macOS Apple Silicon Native Build & Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.6 — macOS Apple Silicon Native Build  
**Versiyon:** `0.1.0 RC1`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**Hedef Mimari:** Apple Silicon (`aarch64-apple-darwin` — MacBook Pro M-Serisi)  
**Çıktı Paketleri:** `ERP CRM Discovery.app` & `.dmg` Disk Image  
**GitHub Depo URL:** [https://github.com/selimkocak/erp-crm-discovery](https://github.com/selimkocak/erp-crm-discovery)  

---

## 1. macOS Masaüstü Mimarisi ve Önkoşullar

ERP CRM Discovery, cross-platform Tauri 2 mimarisi ile macOS işletim sisteminde native Apple Silicon binary olarak çalışır.

### Geliştirme ve Derleme Önkoşulları (MacBook Pro M-Serisi)
Mac üzerinde yerel native build alabilmek için tam Xcode IDE'sine gerek yoktur; masaüstü derlemesi için Xcode Command Line Tools yeterlidir:

1. **Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```
2. **Node.js 20 LTS:**
   ```bash
   node -v  # v20.x
   ```
3. **Rust Stable (Apple Silicon Target):**
   ```bash
   rustup target add aarch64-apple-darwin
   ```

---

## 2. macOS Yerel Derleme Akışı (Local Mac Workflow)

MacBook Pro (M5 Pro / M1 / M2 / M3 / M4) üzerinde projeyi yerel olarak derleme adımları:

```bash
# 1. Depoyu klonlayın
git clone git@github.com:selimkocak/erp-crm-discovery.git
cd erp-crm-discovery

# 2. Bağımlılıkları yükleyin
npm install

# 3. Kanonik iş fonksiyonlarını üretin
npm run generate

# 4. Testleri çalıştırın
npm run test:windows

# 5. Web arayüzünü derleyin
npm run build

# 6. Rust backend'ini doğrulayın
cargo check --manifest-path src-tauri/Cargo.toml

# 7. Native macOS .app ve .dmg paketlerini üretin
npm run tauri build -- --bundles app,dmg
```

**Üretilen Yerel Çıktı Yolları:**
- **Masaüstü Uygulaması:** `src-tauri/target/release/bundle/macos/ERP CRM Discovery.app`
- **Kurulum İmajı:** `src-tauri/target/release/bundle/dmg/ERP CRM Discovery_0.1.0_aarch64.dmg`

---

## 3. GitHub Actions macOS CI/CD İş Akışı

[`.github/workflows/macos-build.yml`](file:///home/selim/projects/erp-crm-discovery/.github/workflows/macos-build.yml) dosyası ile GitHub Actions üzerinde Apple Silicon macOS runner'ı yapılandırılmıştır:

- **Runner:** `macos-latest` (Apple Silicon M1 `arm64`)
- **Target:** `aarch64-apple-darwin`
- **İş Akışı Adımları:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 20)
  3. `dtolnay/rust-toolchain@stable` (`aarch64-apple-darwin`)
  4. `npm install --no-fund --no-audit`
  5. `npm run generate`
  6. `npm run test:windows`
  7. `npm run build`
  8. `cargo check --manifest-path src-tauri/Cargo.toml`
  9. `npm run tauri build -- --bundles app,dmg`
  10. `shasum -a 256` hesaplama ve Artifact Upload
- **Artifact Adı:** `ERP-CRM-Discovery-macOS-Apple-Silicon`

---

## 4. SQLite, İzinler ve Veri Kalıcılığı (macOS)

- **Veri Yolu:** `React` → `Tauri IPC` → `@tauri-apps/plugin-sql` → `SQLite (libsqlite3)`.
- **macOS SQLite Konumu:** `~/Library/Application Support/com.erpcrm.discovery/erp_discovery.db`
- **Capability İzinleri ([`src-tauri/capabilities/default.json`](file:///home/selim/projects/erp-crm-discovery/src-tauri/capabilities/default.json)):**
  - `core:default`
  - `sql:default`
  - `sql:allow-execute` (Migration şeması oluşturma ve semantik veri yazma/silme)
  - `dialog:default` (macOS yerel dosya kaydetme penceresi)
  - `fs:default` (DOCX ve PDF dosyalarının diske yazılması)

---

## 5. Gatekeeper & Kod İmzalama (Signing / Notarization)

- Bu aşamadaki release candidate paketi imzasız (unsigned) geliştirme ve fiziksel test paketidir.
- macOS Gatekeeper, internetten indirilen veya imzasız `.app`/`.dmg` dosyalarında güvenlik uyarısı gösterebilir (`Uygulama açılmıyor çünkü geliştiricisi doğrulanamadı`).
- **Geçiş Yöntemi:**
  1. `.app` veya `.dmg` dosyasına **Sağ Tık (Control + Tık) → Aç (Open)** seçilerek gelen diyalogda **Aç**'a basılır.
  2. Veya **Sistem Ayarları → Gizlilik ve Güvenlik → Genel** sekmesinden *"Yine de Aç"* (Open Anyway) onaylanır.
- Apple Developer sertifikası ve Notarization işlemi halka açık dağıtım aşamasında eklenecektir.

---

## 6. MacBook Pro M-Serisi 16 Maddelik Fiziksel Kabul Test Listesi

| # | Test Maddesi | Hedef / Beklenen Davranış | Durum |
|---|---|---|---|
| **1** | `.app` Başlatma | `ERP CRM Discovery.app` çift tıklandığında uygulamanın açılması | `NOT TESTED` |
| **2** | Gatekeeper Onayı | Control + Tık ile imzasız uygulamanın onaylanabilmesi | `EXPECTED WARNING` |
| **3** | Beyaz Ekran Kontrolü | WebView2 yerine WKWebView üzerinden arayüzün anında yüklenmesi | `NOT TESTED` |
| **4** | SQLite Otomatik Oluşumu | `~/Library/Application Support/com.erpcrm.discovery/erp_discovery.db` oluşumu | `NOT TESTED` |
| **5** | 31 İş Fonksiyonu | Satış, Satınalma vb. 31 kanonik fonksiyonun seed edilmesi | `NOT TESTED` |
| **6** | Proje Oluşturma | `FAZ-6 Test A.Ş.` projesinin oluşturulması ve listelenmesi | `NOT TESTED` |
| **7** | Proje Kalıcılığı (Restart) | `Cmd + Q` ile kapatıp açınca projenin korunması | `NOT TESTED` |
| **8** | Satış Soru Motoru | `SALES-001` soru kartının açılması ve seçeneklerin işaretlenmesi | `NOT TESTED` |
| **9** | Koşullu Dallanma | Kurala göre soruların filtrelenmesi | `NOT TESTED` |
| **10** | Semantik Kayıtlar | Bulgu, Gereksinim, Risk ve Proje Notu ekleme | `NOT TESTED` |
| **11** | Rapor Önizleme | Yönetici özeti, skorlar ve tabloların render edilmesi | `NOT TESTED` |
| **12** | macOS DOCX Kaydetme | macOS yerel Save Dialog açılarak `.docx` dosyasının kaydedilmesi | `NOT TESTED` |
| **13** | macOS PDF Kaydetme | macOS yerel Save Dialog açılarak `.pdf` dosyasının kaydedilmesi | `NOT TESTED` |
| **14** | Türkçe Glif Kontrolü | PDF içinde `Ç, ğ, ı, Ş, Ü, Ö, İ` karakterlerinin kusursuz render edilmesi | `NOT TESTED` |
| **15** | İnternetsiz (Offline) Çalışma | Wi-Fi kapalıyken uygulamanın açılması ve rapor üretmesi | `NOT TESTED` |
| **16** | `.dmg` Kurulumu | DMG açılarak Applications klasörüne sürükle-bırak kurulumu | `NOT TESTED` |

---

## 7. Kabul Durumu

```text
MACOS BUILD: READY
MACOS NATIVE ACCEPTANCE: PENDING
```

---

FAZ-6.6 macOS Apple Silicon build tamamlandı. Windows ve macOS physical acceptance sonuçları mimari inceleme bekliyor.
