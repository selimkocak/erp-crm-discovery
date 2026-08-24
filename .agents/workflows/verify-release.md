# İş Akışı: verify-release

Bu iş akışı, yeni bir sürüm etiketlenmeden (`git tag`) ve dağıtım paketleri üretilmeden önce tamamlanması zorunlu olan doğrulama kapılarını belirler.

---

## 1. Yayın Öncesi Kontrol Listesi (Pre-Release Checklist)

Aşağıdaki koşulların **tamamı** sağlanmadıkça sürüm etiketi oluşturulamaz ve yayın başlatılamaz:

1. **Temiz Çalışma Ağacı:** `git status --short` çıktısı tamamen temiz olmalı (sıfır commit edilmemiş dosya).
2. **Dal Senkronizasyonu:** Yerel `HEAD` ile `origin/main` aynı commit SHA'sında olmalı (`git log -1`).
3. **Sürüm Metadata Eşitliği:** `package.json`, `src-tauri/Cargo.toml` ve `src-tauri/tauri.conf.json` içindeki sürüm numaraları birebir aynı olmalı.
4. **Yeşil Linux CI:** `main` dalındaki en son commit için GitHub Actions `CI - Core Checks & Tests` iş akışı yeşil (başarılı) olmalı.
5. **Tag Benzersizliği:** Oluşturulacak `v*` tag'i Git geçmişinde daha önce var olmamalı veya doğru hedefte olmalı (tag asla taşınmaz).
6. **Installer Tetikleyici Güvencesi:** Windows NSIS (`windows-build.yml`) ve macOS DMG (`macos-build.yml`) iş akışlarının yalnızca `v*` tag'i veya manuel çağrı (`workflow_dispatch`) ile tetiklendiği doğrulanmalı.
7. **Kurulum Rehberleri:** `docs/guides/installation/` altındaki platform kılavuzları güncel olmalı.
8. **Kullanıcının Açık Onayı:** Kullanıcı açıkça sürüm yayınlama onayı vermiş olmalıdır.

---

## 2. Yayın Sonrası Doğrulama Adımları

* **Artifact İsimlendirme:** Üretilen `.exe` ve `.dmg` dosyalarının kanonik isimlendirme formatına uyduğu denetlenmelidir.
* **SHA-256 Checksum:** Her kurulum paketi için SHA-256 hash'i hesaplanmalı ve doğrulanmalıdır.
* **Release Notları:** Değişiklikler, yeni özellikler, düzeltmeler ve bilinen sınırlamalar açıkça listelenmelidir.
* **Prerelease / Latest Yönetimi:** Hatalı bir ara sürüm kesinlikle yanlışlıkla `Latest` olarak bırakılmamalıdır.

---

## 3. İlgili Belgeler

* [Release Paketleme Becerisi](file:///.agents/skills/release-packaging/SKILL.md)
* [Git ve Sürüm Politikası](file:///.agents/policies/git-release-policy.md)
* [Kabul Raporu Şablonu](file:///.agents/templates/acceptance-report.md)
