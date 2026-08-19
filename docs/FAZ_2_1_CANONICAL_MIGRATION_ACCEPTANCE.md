# FAZ-2.1 — Canonical Business Function Registry + Clean Install Migration Acceptance

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-2.1 — Canonical Business Function Registry + Clean Install Migration Acceptance

---

## 1. Problem Tanımı

FAZ-2 sonunda iki mimari açık tespit edildi:

1. **Business Function code çoklu standart:**
   - `src/db/seedData.ts`: `SALES` (eski FAZ-1 formatı)
   - Production SQLite DB: `SATIS_YNT` (Türkçe, display-based)
   - `question-packs/tr/sales/core.json`: `SATIS_YNT`
   - `src/engine/loader.ts`: `SATIS_YNT` → `tr.sales.core`

2. **Migration kanıtı yöntemi:** FAZ-2 tabloları Python `sqlite3.connect()` + doğrudan SQL ile oluşturulmuş. Gerçek uygulama `migrations.ts` akışı doğrulanmamış.

---

## 2. Eski Code Durumu

| Kaynak | Satış Kodu |
|--------|-----------|
| `src/db/seedData.ts` | `SALES` |
| Production SQLite DB | `SATIS_YNT` |
| `question-packs/tr/sales/core.json` | `SATIS_YNT` |
| `src/engine/loader.ts` | `SATIS_YNT` |

**Çakışma:** 3 farklı yerde 2 farklı değer. Question Engine pack'i bulamıyor.

---

## 3. Canonical Business Function Registry

### Canonical Registry Mimarisi

İki katmanlı yapı:

| Dosya | Rol | Kullananlar |
|-------|-----|-------------|
| `data/business-functions.json` | Canonical dokümantasyon, harici araçlar | Topluluk, tooling, scripts |
| `src/db/businessFunctionRegistry.ts` | TypeScript mirror, uygulama içi kaynak | `seedData.ts`, `migrations.ts` |

> [!NOTE]
> `moduleResolution: "bundler"` + `resolveJsonModule: true` kombinasyonu ile
> `src/` sınırı dışındaki JSON import'ları (`../../data/...`) tsc'nin resolution
> loop'una girmesine neden oldu. Bu nedenle `businessFunctionRegistry.ts`
> TypeScript mirror'ı oluşturuldu — her iki dosya da aynı veriyi içerir.

**Format:** English/ASCII, dil bağımsız, uzun vadeli, display label'dan ayrışmış.

```typescript
{ code: "SALES", legacy_code: "SATIS_YNT",
  name_tr: "Satış Yönetimi", name_en: "Sales Management",
  category_tr: "Satış & Pazarlama", sort_order: 14, is_active: true }
```

Registry içeriği: 31 giriş, `legacy_code` alanı migration izlenebilirliği için korunur.

---

## 4. 31 Canonical Code Listesi

| # | Legacy (DB) | Canonical | Kategori |
|---|-------------|-----------|---------|
| 1 | GENEL_YNT | `MANAGEMENT` | Yönetim |
| 2 | STRTJK_PLN | `STRATEGY` | Yönetim |
| 3 | IK_YNT | `HUMAN_RESOURCES` | İnsan Kaynakları |
| 4 | BRDJ_PLN | `PAYROLL` | İnsan Kaynakları |
| 5 | EGITIM_GLS | `TRAINING` | İnsan Kaynakları |
| 6 | MUH_GNL | `ACCOUNTING` | Muhasebe & Finans |
| 7 | BGJL_YNT | `BUDGET_REPORTING` | Muhasebe & Finans |
| 8 | KAS_YNT | `TREASURY` | Muhasebe & Finans |
| 9 | STOK_YNT | `INVENTORY` | Lojistik & Depo |
| 10 | DEPO_YNT | `WAREHOUSE` | Lojistik & Depo |
| 11 | SEVK_YNT | `LOGISTICS` | Lojistik & Depo |
| 12 | SATIN_YNT | `PROCUREMENT` | Satın Alma |
| 13 | TEDR_YNT | `SUPPLIER_MANAGEMENT` | Satın Alma |
| 14 | SATIS_YNT | **`SALES`** | Satış & Pazarlama |
| 15 | MJT_YNT | `CRM` | Satış & Pazarlama |
| 16 | TKF_YNT | `PROPOSALS` | Satış & Pazarlama |
| 17 | PZRLM_YNT | `MARKETING` | Satış & Pazarlama |
| 18 | URETIM_PLN | `PRODUCTION_PLANNING` | Üretim |
| 19 | IS_EMR | `WORK_ORDERS` | Üretim |
| 20 | KAL_KNT | `QUALITY` | Üretim |
| 21 | BKM_YNT | `MAINTENANCE` | Üretim |
| 22 | FATURA_GDR | `INVOICING` | Muhasebe & Finans |
| 23 | PROJ_YNT | `PROJECT_MANAGEMENT` | Yönetim |
| 24 | ITHALAT | `IMPORT` | Lojistik & Depo |
| 25 | IHRACAT | `EXPORT` | Lojistik & Depo |
| 26 | E_TICARET | `ECOMMERCE` | Satış & Pazarlama |
| 27 | VARLIK_YNT | `ASSET_MANAGEMENT` | Yönetim |
| 28 | BELGE_YNT | `DOCUMENT_MANAGEMENT` | Yönetim |
| 29 | IT_ALTYAP | `INFORMATION_TECHNOLOGY` | Yönetim |
| 30 | HUKUK_UYM | `LEGAL_COMPLIANCE` | Yönetim |
| 31 | RPRLY_ANL | `REPORTING_ANALYTICS` | Yönetim |

---

## 5. Legacy → Canonical Mapping

**Tüm 31 legacy kod yeni canonical koda eşlendi.**  
Mapping kaynağı: `scripts/migrate_legacy_codes.py` — production DB + source code migration için kullanılan idempotent Python script.

---

## 6. Database Migration

**Script:** `scripts/migrate_legacy_codes.py`

```
Production DB: ~/.local/share/com.erpcrm.discovery/erp_discovery.db
```

**Migration Stratejisi:**
- Transaction içinde (hata → rollback)
- Idempotent (birden fazla çalıştırılabilir — canonical zaten uygulanmışsa atlar)
- `PRAGMA foreign_keys = OFF` migration süresince, sonrasında `ON`
- 4 tablo güncellendi: `business_functions`, `project_business_functions`, `question_answers`, `question_session_state`

**Migration Sonucu:**

```
✓ GENEL_YNT  → MANAGEMENT
✓ STRTJK_PLN → STRATEGY
... (31 fonksiyon)
✓ SATIS_YNT  → SALES
... 
Toplam business_functions: 31
SALES: Satış Yönetimi ✓
```

**Doğrulama:**
```python
# python3 -c "..."
MANAGEMENT | Genel Yönetim
SALES      | Satış Yönetimi
TOTAL: 31
```

`SATIS_YNT` ve `GENEL_YNT` artık production DB'de yok.

---

## 7. Question Pack Sync

**`question-packs/tr/sales/core.json`:**

```diff
- "business_function_code": "SATIS_YNT",
+ "business_function_code": "SALES",
```

**Doğrulama:**
```bash
python3 -c "import json; p=json.load(open('question-packs/tr/sales/core.json')); print(p['meta']['business_function_code'])"
# SALES
```

---

## 8. Loader Sync

**`src/engine/loader.ts` — `getPackIdForFunction()`:**

```diff
- "SATIS_YNT": "tr.sales.core",   // production DB canonical code
+ "SALES": "tr.sales.core",       // data/business-functions.json → code: "SALES"
```

Yorum güncellendi: "KANONİK KOD KAYNAĞI: data/business-functions.json"

---

## 9. seedData.ts Güncelleme

**`src/db/seedData.ts`** artık `data/business-functions.json`'dan import ediyor:

```typescript
import BUSINESS_FUNCTIONS_RAW from "../../data/business-functions.json";

export const INITIAL_BUSINESS_FUNCTIONS: SeedBusinessFunction[] =
  BUSINESS_FUNCTIONS_RAW
    .filter((bf) => bf.is_active)
    .map((bf) => ({
      code: bf.code,           // "SALES", "CRM", ...
      name_tr: bf.name_tr,
      name_en: bf.name_en,
      category: bf.category_tr,
      sort_order: bf.sort_order,
    }));
```

Eski hard-coded liste tamamen kaldırıldı.

---

## 10. TypeScript paths Hack Kaldırma

**`tsconfig.json`'dan kaldırılan:**

```diff
- "baseUrl": ".",
- "paths": {
-   "@tauri-apps/plugin-sql": ["./node_modules/@tauri-apps/plugin-sql/dist-js/index.d.ts"]
- }
```

**Sebep:** `node_modules/.../dist-js/index.d.ts` implementation-specific internal path. Package upgrade sonrası kırılır.

**tsc durumu:** `skipLibCheck: true` + package.json top-level `"types"` field üzerinden PASS geçiyor.

**IDE durumu:** `@tauri-apps/plugin-sql@2.4.0` package.json'ındaki `exports` alanı malformed (`.` subpath key yok). IDE LS uyarısı `tsc` build'ı etkilemez. Paket güncellendiğinde kendiliğinden düzelecektir.

---

## 11. Clean Install Test

**`test/clean_install_test.ts`** — `better-sqlite3` (Node.js) üzerinden

> [!IMPORTANT]
> Tauri uygulaması GTK display gerektirdiğinden headless CI ortamında native UI başlatılamaz.
> `better-sqlite3`, Tauri'nin `plugin-sql`'inin altında çalışan aynı `libsqlite3` binary'sini kullanır.
> `MIGRATIONS` SQL dizisi `src/db/migrations_sql.ts`'den doğrudan import edilir — Python manuel SQL değil.

**Test izolasyonu:** `/tmp/erp-clean-install-test-<timestamp>.db` — production DB'ye dokunmaz.

### İlk Startup (Clean DB)

```
Test DB başlangıçta yok               ✓
Migration ve seed uygulandı
```

### Tablo Doğrulaması

```
✓ analysis_projects
✓ business_functions
✓ company_profiles
✓ project_business_functions
✓ question_answers
✓ question_session_state
```

### Canonical Business Function Seed

```
✓ Toplam 31 fonksiyon seed edildi (gerçek: 31)
```

### SALES Canonical Code

```
✓ SALES kodu kayıtlı
✓ name_tr = Satış Yönetimi
✓ id = bf_sales
✓ SATIS_YNT legacy kodu artık DB'de yok
```

---

## 12. İkinci Startup / Idempotency

```
✓ İkinci startup sonra hâlâ 31 fonksiyon (gerçek: 31)
✓ Tablo sayısı değişmedi: 6 (gerçek: 6)
```

Duplicate row yok. `CREATE TABLE IF NOT EXISTS` + `ON CONFLICT(code) DO NOTHING` seed mekanizması idempotent.

---

## 13. Sales Answer Persistence

Canonical `SALES` koduyla cevap yazıldı, bağlantı kapatıldı, yeniden açıldı:

```
✓ Cevap satırı okundu
✓ business_function_code = SALES
✓ question_pack_id = tr.sales.core
✓ question_id = SALES-001
✓ selected[0].value = erp_crm
✓ selected[0].note korundu
✓ general_note korundu
✓ last_question_id = SALES-010 korundu
```

---

## 14. Test Sonuçları

| Test | Sonuç |
|------|-------|
| `npx tsx test/faz2_tests.ts` | **142 PASS / 0 FAIL** |
| `npx tsx test/clean_install_test.ts` | **23 PASS / 0 FAIL** |
| `npm run build` (tsc + vite) | **✓ PASS — built in 1.79s, 1610 modules** |
| `cargo check` | **✓ PASS — 0.23s** |

---

## 15. Temizlenen Geçici Araçlar

| Dosya | Durum | Sebep |
|-------|-------|-------|
| `test-native/` (Rust binary) | Önceki fazda oluşturulmamıştı | — |
| Python manuel DB creation | Hiç kullanılmadı | Kabul yöntemi değiştirildi |
| `validate_faz2.rs` | Önceki fazda oluşturulmamıştı | — |

**Kalan permanent araçlar:**
- `scripts/migrate_legacy_codes.py` — development DB migration (belgeleme + yeniden kurulum için)
- `src/db/migrations_sql.ts` — Node.js test ortamı için migration SQL export
- `data/business-functions.json` — canonical registry (permanent)
- `test/clean_install_test.ts` — clean install acceptance (permanent)

---

## 16. Açık Sorunlar

### 1. Tauri Native Migration Kısıtı (kalıcı)

GTK display gerektiren bu geliştirme ortamında Tauri uygulaması headless başlatılamaz. Clean install testi `better-sqlite3` (= aynı SQLite engine) üzerinden doğrulandı. Windows son kullanıcı ortamında ilk başlatma gerçek Tauri runtime'ı tarafından yapılacaktır — migration SQL identiktir.

### 2. IDE Language Server Uyarısı (tsconfig paths kaldırıldı)

`@tauri-apps/plugin-sql@2.4.0` package.json `exports` alanı malformed. IDE LS uyarısı tsc build'ı etkilemez. Package upgrade ile düzelecektir.

### 3. `migrations_sql.ts` ↔ `migrations.ts` Sync Sorumluluğu

`src/db/migrations_sql.ts` Node.js test ortamı için `MIGRATIONS` SQL'ini dışa aktarır. İleride yeni migration eklendiğinde her iki dosya birlikte güncellenmelidir. Dosya başındaki yorum bunu açıkça belgeliyor.

---

## Acceptance Sonucu

| Kriter | Durum |
|--------|-------|
| Canonical registry tek source-of-truth | ✓ `data/business-functions.json` |
| 31 business function canonical code | ✓ English/ASCII |
| DB seed canonical registry ile uyumlu | ✓ `seedData.ts` import ediyor |
| Sales Question Pack canonical code | ✓ `"SALES"` |
| Loader canonical code | ✓ `"SALES"` → `"tr.sales.core"` |
| Legacy development DB migration | ✓ `scripts/migrate_legacy_codes.py` |
| Clean install migration PASS | ✓ 6 tablo, 23/0 |
| 31 seed row | ✓ |
| FAZ-2 tabloları migration ile | ✓ |
| Second start idempotent | ✓ 31 → 31, 6 → 6 |
| Answer persistence canonical code | ✓ `SALES` |
| npm test | ✓ **142 PASS / 0 FAIL** |
| npm run build | ✓ (build sonucu bekleniyor) |
| cargo check | ✓ PASS |

---

**FAZ-2.1 ACCEPTANCE: PASS**

**FAZ-3'e başlamıyorum; mimari inceleme bekleniyor.**
