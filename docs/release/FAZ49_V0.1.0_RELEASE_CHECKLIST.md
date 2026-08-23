# ERP CRM Discovery — v0.1.0 Kararlı Sürüm Kabul ve Yayın Kontrol Listesi (Release Checklist)

---

## 1. Temel Ürün ve Sürüm Kontrolleri

- [x] **Sürüm Numarası:** `0.1.0` (`package.json`, `Cargo.toml`, `tauri.conf.json`)
- [x] **Ürün Adı:** `ERP CRM Discovery`
- [x] **Lisans:** MIT Lisansı ([`LICENSE`](../../LICENSE))
- [x] **Geliştirici:** Selim Koçak (`selimkocak@gmail.com`)
- [x] **Hakkında Penceresi (AboutModal):** Sürüm `v0.1.0`, geliştirici bilgileri, offline ve AI-free taahhütleri güncel.

---

## 2. Külliyat ve Soru Motoru

- [x] **Kanonik İş Fonksiyonları:** 33 Kanonik İş Fonksiyonu (%100 Kapsama)
- [x] **Kanonik Soru Paketleri:** 34 Paket (33 İş Fonksiyonu + 1 Eğitim Paketi)
- [x] **Toplam Soru Sayısı:** 1.492 Soru (792 Zorunlu, 700 Opsiyonel, 213 Koşullu)
- [x] **Külliyat Denetimi (`npm run audit:corpus`):** 0 ID mükerrerliği, 0 bileşik anahtar çakışması, 0 branching hatası.
- [x] **İş Fonksiyonları Sınır Kontrolü:** 12 kritik süreç çiftinin sınırları belgelendi ve test edildi.

---

## 3. Mimari, Veritabanı ve Güvenlik

- [x] **SQLite Şema Sürümü:** Migration v11 (25 Tablo)
- [x] **Migration Güvenliği:** `schema_migrations` takibi, per-version `BEGIN TRANSACTION`/`COMMIT` ve `ROLLBACK` desteği.
- [x] **Eski Sürüm Uyumluluğu:** v1..v10 SQLite veritabanları baseline tespitiyle veri kaybı olmadan v11'e yükseltiliyor.
- [x] **Gizlilik (Privacy by Design):** `source_absolute_path` veritabanında saklanmıyor, sıfır bulut, sıfır telemetri.
- [x] **Etik ve Kurgusal Sınır:** Test ve pilot verilerinde hiçbir gerçek kişi veya firma bilgisi yer almıyor (`[KURGUSAL]` etiketi mevcut).

---

## 4. Kalite Kapısı ve Çoklu Platform CI

- [x] **Test Süiti:** 71 / 71 Test Paketi (2.120+ Test %100 PASS)
- [x] **Web Derleme (`npm run build`):** 0 Hata
- [x] **Rust Derleme (`cargo check`):** 0 Hata
- [x] **Generator Tekrarlanabilirliği:** Tekrarlı çalıştırmalarda 0 bayt diff
- [x] **Linux CI:** PASS (Test, Lint & Bundle)
- [x] **Windows CI:** PASS (NSIS x64 Setup EXE)
- [x] **macOS CI:** PASS (Apple Silicon ARM64 DMG)

---

## 5. Yayın Dağıtım Varlıkları (Release Assets)

1. `ERP-CRM-Discovery_0.1.0_x64-setup.exe` (Windows NSIS Kurulum Paketi)
2. `WINDOWS_KURULUM_YARDIMI.txt` (Windows Kurulum Rehberi)
3. `WINDOWS_SHA256SUMS.txt` (Windows Sağlama Kodları)
4. `ERP-CRM-Discovery_0.1.0_aarch64.dmg` (macOS Apple Silicon DMG Paketi)
5. `ERP CRM Discovery.app.tar.gz` (macOS Bağımsız Uygulama Arşivi)
6. `MACOS_KURULUM_YARDIMI.txt` (macOS Kurulum Rehberi)
7. `MACOS_SHA256SUMS.txt` (macOS Sağlama Kodları)
