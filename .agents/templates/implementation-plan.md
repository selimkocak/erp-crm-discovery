# Şablon: implementation-plan

Bu şablon, karmaşık bir geliştirme veya mimari faza başlarken teknik planı yapılandırmak için kullanılır.

---

## 1. Amaç
*Bu değişikliğin neyi çözdüğünü ve hedefini kısaca açıklayın.*

## 2. Mevcut Davranış ve Kök Problem
*Sistem şu anda nasıl davranıyor ve neden bu değişiklik gerekiyor?*

## 3. Mimari Karar ve Yaklaşım
*Hangi mimari servislerin veya veri modellerinin kullanılacağını açıklayın.*

## 4. Değişecek Dosyalar
* [ ] `src/...`
* [ ] `test/...`

## 5. Değişmeyecek / Korunacak Dosyalar
* [ ] `src/db/seedData.ts`
* [ ] `package.json`

## 6. Kabul Kriterleri
1. Kriter 1
2. Kriter 2
3. Kriter 3

## 7. Hedef Testler ve Doğrulama Planı
* `npx tsx test/fazXX_..._test.ts`
* `npm run build`
* `cargo check --manifest-path src-tauri/Cargo.toml`
* `git diff --check`

## 8. Riskler ve Kısıtlar
* *Varsa geriye dönük uyumluluk veya platform riskleri.*

## 9. Teslim Biçimi
* Commit mesajı ve beklenen çıktı formatı.
