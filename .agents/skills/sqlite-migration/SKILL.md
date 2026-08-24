---
name: sqlite-migration
description: SQLite veri tabanı şema migrasyonu, foreign key kısıtları ve veri bütünlüğü yönetimi becerisidir.
---

# sqlite-migration Becerisi

## 1. Amaç
Uygulamanın yerel SQLite veritabanı şemasını güvenli, idempotent ve veri kaybına yol açmayacak şekilde genişletmek ve foreign key bütünlüğünü korumak.

## 2. Kullanım Koşulları
* Yeni bir veri tabanı tablosu veya kolonu eklendiğinde kullanılır.
* Migrasyon tanımı ([src/db/migrationDefinitions.ts](file:///src/db/migrationDefinitions.ts)) güncellenirken zorunludur.

## 3. Girdiler
* [src/db/migrationDefinitions.ts](file:///src/db/migrationDefinitions.ts)
* Hedef tablo ve kolon tanımları
* Foreign key ilişkileri

## 4. Uygulama Adımları
1. Tek doğruluk kaynağı olan `MIGRATION_DEFINITIONS` dizisine yeni sürüm kaydını ekle.
2. Migrasyon SQL cümlelerini (`sql: [...]`) atomik ve idempotent şekilde yaz.
3. Test ortamında `better-sqlite3` mock DB ile `PRAGMA foreign_keys = ON` altında tüm migrasyonları sırayla çalıştır.
4. `PRAGMA foreign_key_check` ile 0 ihlal olduğunu doğrula.
5. Tauri SqlitePool ortamında JavaScript seviyesinde bağlantıya bağlı `BEGIN/COMMIT/ROLLBACK` varsayımı yapma; hata anında telafi temizliği (cleanup) sağla.
6. Testlerde toplam migrasyon veya tablo sayısını sabit sayılara bağlamak yerine dinamik türet.

## 5. Doğrulama
* `PRAGMA foreign_key_check` sonucu 0 satır dönmeli.
* Eski veriler migrasyon sonrasında %100 korunmalı.
* Temiz kurulum (clean install) ve yükseltme (upgrade) senaryoları hatasız çalışmalı.

## 6. Yasaklar
* ❌ `PRAGMA foreign_keys = OFF` yaparak foreign key hatalarını süpürmek.
* ❌ Mevcut kullanıcının veritabanını silip baştan oluşturan yıkıcı komutlar eklemek.
* ❌ Rastgele uydurma ID'lerle master tablolarda bulunmayan yabancı anahtarlar eklemek.

## 7. Teslim Çıktısı
* Güvenli `MIGRATION_DEFINITIONS` güncellemesi ve sıfır foreign key ihlali kanıtı.
