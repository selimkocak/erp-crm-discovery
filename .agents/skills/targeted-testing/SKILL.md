---
name: targeted-testing
description: İki katmanlı (Browser Test Harness vs Tauri Desktop) hedefli test sırası, regresyon yönetimi ve dürüst kalite kapısı doğrulama becerisidir.
---

# targeted-testing Becerisi

## 1. Amaç
Geliştirilen dikey dilimin doğruluğunu, tüm test külliyatını gereksiz yere baştan sona koşturup vakit kaybetmeden, iki katmanlı (Browser Test Harness ve Tauri Desktop) odaklı ve hiyerarşik bir test protokolüyle kanıtlamak.

## 2. Kullanım Koşulları
* Kod veya test değişikliği yapıldığında doğrulama amacıyla kullanılır.
* CI boru hattı öncesinde iki katmanlı yerel kalite kapısı olarak zorunludur.

## 3. Girdiler
* Yeni yazılan veya güncellenen hedef test dosyası (`test/fazXX_*_test.ts`)
* Değişiklikten etkilenen modül ve bileşenler

## 4. İki Katmanlı Test Ayrımı ve Uygulama Adımları

```text
1. Hedef Test:
   npx tsx test/fazXX_<hedef>_test.ts

2. İlgili Regresyon Testleri:
   npx tsx test/fazYY_<etkilenen>_test.ts

3. Browser Test Harness Doğrulaması (Katman 1):
   Vite/Chrome üzerinde 0 konsol hatası ve doğru DOM render kontrolü

4. Frontend Derleme & Tip Kontrolü:
   npm run build

5. Rust Backend Kontrolü:
   cargo check --manifest-path src-tauri/Cargo.toml

6. Biçimlendirme & Whitespace Denetimi:
   git diff --check

7. Git Durum Özeti:
   git status --short
```

## 5. Doğrulama ve Kabul Kuralları
* Hedef test %100 PASS olmalı (0 FAIL).
* SKIPPED ≠ PASS: Atlanan durumlar asla başarılı kabul edilmez.
* Somut kanıtı (log veya ekran ölçümü) olmayan maddeler `UNVERIFIED` yazılmalıdır.
* `npm test` tek başına tam kabul kanıtı sayılmaz; Browser Harness ve Desktop sınırları ayrı beyan edilmelidir.
* Kullanıcı onayı olmadan commit veya push yapılmaz.

## 6. Yasaklar
* ❌ Çalışmayan veya hata veren testi sessizce silmek ya da `skip` etmek.
* ❌ Eski/kırılgan test beklentilerini düzeltmek yerine doğru üretim kodunu bozmak.
* ❌ Testi geçirmek için timeout değerlerini kontrolsüzce artırmak.
* ❌ Browser Test Harness ile doğrulanmamış UI akışına "görsel kabul tamam" demek.

## 7. Teslim Çıktısı
* İki katmanlı test sonuçları, kanıt logları ve `acceptance-report.md` şablonuna uygun durum tablosu.
