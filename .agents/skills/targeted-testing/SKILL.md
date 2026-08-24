---
name: targeted-testing
description: Hedefli test sırası, regresyon yönetimi ve hızlı kalite kapısı doğrulama becerisidir.
---

# targeted-testing Becerisi

## 1. Amaç
Geliştirilen dikey dilimin doğruluğunu, tüm test külliyatını gereksiz yere baştan sona koşturup vakit kaybetmeden, odaklı ve hiyerarşik bir test sırasıyla kanıtlamak.

## 2. Kullanım Koşulları
* Kod değişikliği yapıldıktan sonra doğrulama amacıyla kullanılır.
* CI boru hattı öncesinde yerel kalite kapısı olarak zorunludur.

## 3. Girdiler
* Yeni yazılan veya güncellenen hedef test dosyası (`test/fazXX_*_test.ts`)
* Değişiklikten etkilenen modül ve bileşenler

## 4. Uygulama Adımları
Aşağıdaki standart test sırasını adım adım işlet:

```text
1. Hedef Test:
   npx tsx test/fazXX_<hedef>_test.ts

2. İlgili Regresyon Testleri:
   npx tsx test/fazYY_<etkilenen>_test.ts

3. Frontend Derleme & Tip Kontrolü:
   npm run build

4. Rust Backend Kontrolü:
   cargo check --manifest-path src-tauri/Cargo.toml

5. Biçimlendirme & Whitespace Denetimi:
   git diff --check

6. Git Durum Özeti:
   git status --short
```

> [!NOTE]
> Tam `npm test` külliyatı yalnızca:
> - Yeni faz kapanışı yapıldığında
> - Veri tabanı migrasyonu eklendiğinde
> - Ortak veri modelleri ([src/db/client.ts](file:///src/db/client.ts), [src/report/types.ts](file:///src/report/types.ts)) değiştiğinde
> - Sürüm yayın öncesinde çalıştırılmalıdır.
> İzole metin, CSS veya tekil test düzeltmelerinde her defasında 70+ test paketinin tümü çalıştırılmamalıdır.

## 5. Doğrulama
* Hedef test %100 PASS olmalı (0 FAIL).
* SKIPPED durumlar asla PASS olarak kabul edilmemelidir.
* `npm run build` ve `cargo check` sıfır hata ile tamamlanmalıdır.

## 6. Yasaklar
* ❌ Çalışmayan veya hata veren testi sessizce silmek ya da `skip` etmek.
* ❌ Eski/kırılgan test beklentilerini düzeltmek yerine doğru üretim kodunu bozmak.
* ❌ Testi geçirmek için timeout değerlerini kontrolsüzce artırmak.

## 7. Teslim Çıktısı
* [Kabul Raporu](file:///.agents/templates/acceptance-report.md) içerisinde PASS/FAIL sayıları ve kanıt dökümü.
