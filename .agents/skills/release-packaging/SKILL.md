---
name: release-packaging
description: Sürüm hazırlığı, metadata senkronizasyonu, installer tetikleyicileri ve SHA-256 doğrulama becerisidir.
---

# release-packaging Becerisi

## 1. Amaç
Yeni bir sürüm yayınlanırken metadata sürümlerinin tam uyumunu sağlamak, Windows (NSIS Setup .exe) ve macOS (Apple Silicon .dmg) dağıtım paketlerinin yalnızca doğru zamanda üretilmesini denetlemek.

## 2. Kullanım Koşulları
* Resmi bir sürüm (Release Candidate veya Final) etiketlenirken kullanılır.
* Dağıtım paketleri ve kurulum rehberleri hazırlanırken uygulanır.

## 3. Girdiler
* `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`
* `.github/workflows/windows-build.yml`, `.github/workflows/macos-build.yml`
* `docs/guides/installation/` kılavuzları

## 4. Uygulama Adımları
1. **Sürüm Metadata Eşitleme:** 3 konfigürasyon dosyasındaki (`package.json`, `Cargo.toml`, `tauri.conf.json`) sürüm dizesini eşitle.
2. **CI Tetikleyici Kontrolü:** Installer üretim boru hatlarının `on: push: tags: ['v*']` veya `workflow_dispatch` ile sınırlandığını doğrula (normal `main` commit'inde tetiklenmez).
3. **Annotated Tag:** Sürüm etiketini açık kullanıcı izniyle ve açıklayıcı mesajla oluştur (`git tag -a vX.Y.Z -m "..."`).
4. **SHA-256 Checksum:** Üretilen dağıtım paketleri için SHA-256 hash dosyalarını (`.sha256`) hazırla.
5. **Kurulum Yardımı:** `WINDOWS_KURULUM_YARDIMI.txt` ve `MACOS_KURULUM_YARDIMI.txt` dosyalarının güncel olduğunu doğrula.
6. **Release Durumu:** Sürümün `Latest` veya `Prerelease` durumunu dürüstçe işaretle.

## 5. Doğrulama
* `package.json` sürümü == `Cargo.toml` sürümü == `tauri.conf.json` sürümü.
* Tag öncesi `main` dalı CI hattı yeşil olmalı.

## 6. Yasaklar
* ❌ Kullanıcı onayı olmadan `git tag` oluşturmak veya push etmek.
* ❌ Var olan bir sürüm etiketini taşımak veya ezmek.
* ❌ Normal `main` push'larında ağır Windows/macOS derlemeleri başlatmak.

## 7. Teslim Çıktısı
* Doğrulanmış sürüm metadata'sı, tag hazırlığı ve SHA-256 sağlama toplamları.
