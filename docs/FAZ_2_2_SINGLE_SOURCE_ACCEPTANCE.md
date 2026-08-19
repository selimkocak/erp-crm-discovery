# FAZ-2.2 — Single Source Cleanup Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-2.2 — Single Source Cleanup

---

## 1. Business Function Authority

FAZ-2.1 mimari incelemesinde tespit edilen duplicate/mirror authority problemi tamamen giderilmiştir:

- **Tek Canonical Kaynak:** `data/business-functions.json`
- **Uygulama İçi Tüketici:** `src/generated/businessFunctions.ts` (otomatik üretilir, elle düzenlenmez)
- `src/db/businessFunctionRegistry.ts` (manuel mirror) **silinmiştir**.
- `src/db/seedData.ts` doğrudan generated TS modülünden beslenir.

```
data/business-functions.json  (TEK CANONICAL KAYNAK)
        ↓  (node scripts/generate_business_functions.mjs)
src/generated/businessFunctions.ts  (AUTO-GENERATED)
        ├── src/db/seedData.ts
        ├── src/engine/validator.ts
        └── test/clean_install_test.ts
```

---

## 2. Generation Pipeline

- **Script:** `scripts/generate_business_functions.mjs`
- **Tetikleyici:** `package.json` içindeki `predev`, `prebuild` ve `pretest` hook'ları ile otomatik çalışır.
- **Header:** Üretilen dosyanın başında açık uyarı:
  ```typescript
  /**
   * AUTO-GENERATED.
   * DO NOT EDIT MANUALLY.
   * Source: data/business-functions.json
   */
  ```
- **Determinizm:** `sort_order` sırasına göre deterministik formatta üretilir.

---

## 3. Registry Validation

Generation script'i (`scripts/generate_business_functions.mjs`) dosya yazmadan önce aşağıdaki katı kontrolleri icra eder:

1. **Kayıt Sayısı:** Tam olarak 31 kayıt olmalıdır (farklıysa FAIL).
2. **Kod Formatı:** Yalnızca büyük harf ASCII, rakam ve alt çizgi (`/^[A-Z0-9_]+$/`).
3. **Benzersizlik:** `code`, `sort_order` ve `legacy_code` alanlarında mükerrerlik olamaz.
4. **Zorunlu Alanlar:** `name_tr` ve `name_en` boş veya tanımsız olamaz.
5. **Kritik Kod Güvencesi:** `SALES` kanonik kodu listede mutlaka bulunmalıdır.

---

## 4. Migration Authority

`src/db/migrations.ts` ve `src/db/migrations_sql.ts` arasındaki SQL metin kopyalaması ortadan kaldırılmıştır:

- **Tek Kaynak:** `src/db/migrationDefinitions.ts`
  - `MIGRATION_DEFINITIONS` dizi nesnesi versiyonlu ve framework-bağımsız olarak SQL listesini tutar.
- **Tauri Runner (`src/db/migrations.ts`):** `MIGRATION_DEFINITIONS` üzerinden iterate ederek `@tauri-apps/plugin-sql` ile `db.execute()` çağrısı yapar.
- **Test Runner (`test/clean_install_test.ts`):** Aynı `MIGRATION_DEFINITIONS` nesnesini doğrudan import ederek çalıştırır.
- `src/db/migrations_sql.ts` dosyası **silinmiştir**.

```
src/db/migrationDefinitions.ts  (TEK KAYNAK)
        │
        ├── src/db/migrations.ts (Tauri plugin-sql)
        └── test/clean_install_test.ts (Node / better-sqlite3)
```

---

## 5. Clean Install Test

`test/clean_install_test.ts` temiz ve izole bir SQLite dosyasında (`/tmp/erp-clean-install-test-<timestamp>.db`) test koşar:

1. **İlk Başlatma (Clean DB):**
   - 6 tablo eksiksiz oluşturuldu (`analysis_projects`, `business_functions`, `company_profiles`, `project_business_functions`, `question_answers`, `question_session_state`).
   - 31 kanonik iş fonksiyonu seed edildi.
   - `SALES` kanonik kodu ve `name_tr: "Satış Yönetimi"` doğrulandı.
   - Eski `SATIS_YNT` kodunun DB'de olmadığı kanıtlandı.
2. **İkinci Başlatma (Idempotency):**
   - Yeniden açılışta migration ve seed tekrar uygulandı.
   - Toplam fonksiyon sayısı değişmeden 31 kaldı.
   - Tablo sayısı 6 olarak korundu (duplicate row/table yok).
3. **Cevap Kalıcılığı (Persistence):**
   - `SALES` kanonik kodu ile cevap ve oturum state'i yazıldı, bağlantı kapatıldı.
   - Yeniden açıldığında tüm cevap detayları, notlar ve `last_question_id` eksiksiz okundu.

---

## 6. Question Pack Referential Validation

`src/engine/validator.ts` içine referans kontrolü eklendi:

- `meta.business_function_code` alanının `CANONICAL_BUSINESS_FUNCTION_CODE_SET` içinde tanımlı olduğu doğrulanır.
- `SALES` paketi doğrulandı (PASS).
- Tanımsız/hatalı kod içeren paketler `INVALID_BUSINESS_FUNCTION_CODE` hatası ile reddedilir (PASS).

---

## 7. better-sqlite3 Scope

- `better-sqlite3` ve `@types/better-sqlite3` yalnızca `devDependencies` içerisindedir.
- `src/` altındaki üretim kodlarında hiçbir `better-sqlite3` import'u bulunmamaktadır.
- `npm run build` ile üretilen frontend üretim paketine (`dist/`) girmez.
- Tauri backend'e (Rust) girmez.

---

## 8. Legacy Migration Script Scope

`scripts/migrate_legacy_codes.py` dosyasının kapsamı başlığında netleştirilmiştir:

```python
"""
SCOPE NOTICE:
Development / legacy database maintenance tool.
Not part of application startup migration pipeline.
"""
```

Bu script yalnızca mevcut geliştirme veritabanını kanonik şemaya güncellemek için bir bakım aracıdır; son kullanıcı başlangıç akışının bir parçası değildir.

---

## 9. Test Sonuçları

```bash
npm test
# [generate] Validated 31 canonical business functions successfully.
# [generate] Wrote generated TypeScript to src/generated/businessFunctions.ts
# FAZ-2 Test Sonucu: 144 PASS / 0 FAIL
# Clean Install Test Sonucu: 23 PASS / 0 FAIL
# BAŞARILI: Tüm testler PASS.

npm run build
# vite v6.4.3 building for production...
# ✓ 1611 modules transformed.
# ✓ built in 1.86s

cargo check --manifest-path src-tauri/Cargo.toml
# Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.25s
```

---

## 10. Bilinen Kısıt (Known Limitation)

Ubuntu Linux geliştirme ortamında GUI (WebKit2GTK display) bulunmadığı için Tauri masaüstü uygulamasının tam grafiksel başlatma süreci headless CI/Linux terminalinde doğrudan çalıştırılamamaktadır.

- **Otomasyon Kapsamı:** Migration SQL, şema oluşturma, seed verisi, idempotency ve kalıcılık `better-sqlite3` (aynı `libsqlite3` motoru) ile otomatik test edilmektedir.
- **Windows Acceptance:** Gerçek `@tauri-apps/plugin-sql` IPC ve Windows masaüstü runtime akışı Windows release doğrulama aşamasında nihai olarak mühürlenecektir.

---

## 11. Acceptance Sonucu

| Kriter | Durum |
|--------|-------|
| Canonical business function tek kaynak (`data/business-functions.json`) | ✓ PASS |
| Generated TypeScript (`src/generated/businessFunctions.ts`) | ✓ PASS |
| Manuel mirror dosyası kaldırıldı | ✓ PASS |
| Migration SQL tek kaynak (`src/db/migrationDefinitions.ts`) | ✓ PASS |
| Duplicate `migrations_sql.ts` silindi | ✓ PASS |
| Clean install aynı migration tanımlarını kullanıyor | ✓ PASS |
| Question pack canonical registry referans kontrolü | ✓ PASS |
| 31 kanonik fonksiyon doğrulaması | ✓ PASS |
| SALES kanonik kodu | ✓ PASS |
| İkinci başlatma (Idempotency) | ✓ PASS |
| `better-sqlite3` test kapsamı izolasyonu | ✓ PASS |
| `npm test` | ✓ **167 PASS / 0 FAIL** |
| `npm run build` | ✓ **0 Hata, 1.86s** |
| `cargo check` | ✓ **0 Hata, 0.25s** |

---

**FAZ-2.2 ACCEPTANCE: PASS**

**FAZ-2.2 tamamlandı. FAZ-3'e başlamıyorum; mimari inceleme bekleniyor.**
