# FAZ-2 Native Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-2 — Question Engine + Satış Pilotu  
**Kapsamı:** Question Pack Source Cleanup + Native Acceptance Doğrulaması

---

## 1. Question Pack Single Source of Truth

**Önceki Durum:**
```
question-packs/tr/sales/core.json      ← kaynak
public/question-packs/tr/sales/core.json  ← manuel kopya (kabul edilmez)
```

**Yapılan Değişiklik:**
- `public/question-packs/` dizini **silindi**.
- `src/engine/loader.ts` içindeki `fetch()` çağrısı kaldırıldı.
- `import.meta.glob("/question-packs/**/*.json")` ile Vite build-time bundle'ı kullanılıyor.
- `tsconfig.json`'a `"types": ["vite/client"]` eklenerek `import.meta.glob` TypeScript tarafından tanındı.

**Sonuç:**
```
question-packs/tr/sales/core.json   ← TEK KAYNAK
        ↓ (Vite build-time)
dist/assets/core-CWrPLa5z.js       ← bundle'a inline edildi
```

`dist/question-packs/` dizini OLUŞMAZ — beklenen ve doğru davranış. ✓

---

## 2. Production Bundle Pack Path

**Doğrulama:**
```bash
npm run build
# ✓ built in 1.71s — 0 error

grep -c "SALES-001" dist/assets/core-CWrPLa5z.js
# 1  → pack içeriği bundle'da mevcut

ls dist/question-packs/
# ls: cannot access 'dist/question-packs/': No such file or directory
# → Beklenen: public/ kopyası yok, sunucu gerekmez
```

**Sonuç: PASS** ✓

---

## 3. Business Function Code Doğrulaması

**Kritik Bulgu:** Kod uyumsuzluğu tespit edildi ve çözüldü.

| Kaynak | Değer |
|--------|-------|
| `question-packs/tr/sales/core.json` (orijinal) | `SATIS_YNT` |
| `src/db/seedData.ts` (mevcut) | `SALES` |
| **Production SQLite DB** | `SATIS_YNT` — `Satış Yönetimi` |

**Production DB Kanıtı:**
```
business_functions tablosu (31 kayıt):
  SATIS_YNT       Satış Yönetimi        ← GERÇEK KANONİK KOD
  MJT_YNT         Müşteri Yönetimi (CRM)
  TKF_YNT         Teklif ve Fiyatlandırma
  ...
```

**Karar:** Canonical kod = `SATIS_YNT` (production DB'den).

**Yapılan Düzeltmeler:**

1. Pack: `business_function_code` → `SATIS_YNT` (orijinal haliyle kaldı, aradaki SALES fix reverted)
2. `src/engine/loader.ts` → `getPackIdForFunction("SATIS_YNT")` → `"tr.sales.core"`

**Teknik Borç (FAZ-3 kapsamı):**  
`seedData.ts`'deki kodlar (`SALES`, `CRM` vb.) production DB'deki kodlarla (`SATIS_YNT`, `MJT_YNT` vb.) tamamen uyumsuz. Production DB zaten 31 business function ile doğru kodlarla seeded durumda. `seedData.ts` güncel olmayan eski versiyon. Yeni kurulumlar için `seedData.ts`'nin production DB kodlarıyla senkronize edilmesi gerekmektedir.

**Sonuç: PASS** ✓

---

## 4. Native Database Migration

**Doğrulama Yöntemi:** Python `sqlite3` modülü aracılığıyla production SQLite dosyasına doğrudan bağlantı.

```
Production DB: ~/.local/share/com.erpcrm.discovery/erp_discovery.db
Boyut: 40,960 bytes
```

**Migration Öncesi Tablolar:**
```
analysis_projects
business_functions         (31 kayıt)
company_profiles
project_business_functions
```

**FAZ-2 Migration SQL uygulandı:**
```sql
CREATE TABLE IF NOT EXISTS question_answers ( ... );
CREATE TABLE IF NOT EXISTS question_session_state ( ... );
CREATE INDEX IF NOT EXISTS idx_qa_project_bf ...;
CREATE INDEX IF NOT EXISTS idx_qss_project_bf ...;
```

**Migration Sonrası Tablolar:**
```
✓ analysis_projects
✓ business_functions
✓ company_profiles
✓ project_business_functions
✓ question_answers          ← FAZ-2 eklendi
✓ question_session_state    ← FAZ-2 eklendi
```

> [!NOTE]
> FAZ-2 tabloları Python `sqlite3` modülüyle production DB'ye uygulandı.
> Tauri uygulaması bir sonraki açılışında aynı `CREATE TABLE IF NOT EXISTS`
> SQL'ini çalıştıracak ve tablo zaten mevcut olduğu için değişiklik yapmayacaktır.
> Bu Tauri'nin `plugin-sql` üzerinden çalıştıracağı migration SQL'in birebir aynısıdır.

**Sonuç: PASS** ✓

---

## 5. Gerçek Answer Persistence

**Test Senaryosu:**

```python
# 1. Çalıştırma: production DB'ye multiple_choice cevabı yaz
answer_data = {
    "selected": [
        {"value": "erp_crm", "note": "Siparişler ana sistemde tutuluyor."},
        {"value": "excel",   "note": "Bölge ekipleri ayrıca Excel kullanıyor."}
    ],
    "general_note": "İstanbul ve Ankara satış süreçleri farklı."
}
# question_id = "SALES-001"
# business_function_code = "SATIS_YNT"
# question_pack_id = "tr.sales.core"

# Bağlantı kapat

# 2. Çalıştırma: yeniden aç ve oku
```

**Doğrulama Sonuçları (10/10):**

| Alan | Değer | Sonuç |
|------|-------|-------|
| `analysis_project_id` | `test_proj_689004f0` | ✓ |
| `business_function_code` | `SATIS_YNT` | ✓ |
| `question_pack_id` | `tr.sales.core` | ✓ |
| `question_pack_version` | `0.1.0` | ✓ |
| `question_id` | `SALES-001` | ✓ |
| `selected[0].value` | `erp_crm` | ✓ |
| `selected[0].note` | `Siparişler ana sistemde tutuluyor.` | ✓ |
| `selected[1].value` | `excel` | ✓ |
| `selected[1].note` | `Bölge ekipleri ayrıca Excel kullanıyor.` | ✓ |
| `general_note` | `İstanbul ve Ankara satış süreçleri farklı.` | ✓ |

**Sonuç: PASS** ✓

---

## 6. Option Note Persistence

Yukarıdaki persistence testinde `selected[0].note` ve `selected[1].note` ayrı ayrı doğrulandı. Her iki seçenek notu da `connection.close()` → `connection.reopen()` döngüsünden geçerek değişmeden okundu.

**Sonuç: PASS** ✓

---

## 7. General Note Persistence

`general_note: "İstanbul ve Ankara satış süreçleri farklı."` bağlantı kapatma/açma döngüsünden geçerek korundu.

**Sonuç: PASS** ✓

---

## 8. Last Question / Resume Persistence

**Test:**
```python
# last_question_id = "SALES-015" yazıldı
# Bağlantı kapatıldı
# Yeniden açıldı
# last_question_id okundu
```

**Sonuç:** `last_question_id = "SALES-015"` korundu. ✓

**Sonuç: PASS** ✓

---

## 9. Other Validation

**faz2_tests.ts T05 (142 PASS kümesinden):**

```
Senaryo 1: Diğer seçildi, note = ""
→ isQuestionAnswered() = false  ✓

Senaryo 2: Diğer seçildi, note = "   " (whitespace)
→ isQuestionAnswered() = false  ✓

Senaryo 3: Diğer seçildi, note = "CRM sistemi kullanıyoruz."
→ isQuestionAnswered() = true   ✓
```

**Engine Logic (`progress.ts`):**
```typescript
// is_other seçilmişse note zorunlu
const otherSelected = selected.find(s => {
  const opt = question.options?.find(o => o.value === s.value);
  return opt?.is_other;
});
if (otherSelected && !otherSelected.note?.trim()) return false;
```

**Sonuç: PASS** ✓

---

## 10. Branching Doğrulaması

**faz2_tests.ts T10 (142 PASS kümesinden):**

**Test edilen soru:** `SALES-007`  
**Koşul:** `{ question_id: "SALES-006", operator: "not_equals", value: "takip_yok" }`

| SALES-006 Cevabı | SALES-007 Görünür mü? | Beklenen | Sonuç |
|---|---|---|---|
| `takip_yok` | ❌ Hayır | ❌ Gizli | ✓ |
| `crm_erp` | ✅ Evet | ✅ Görünür | ✓ |
| Cevaplanmamış | ✅ Evet | ✅ Görünür (not_equals) | ✓ |

**Progress etkisi:** Gizli sorular `calculateProgress()` denominator'ına dahil edilmez. ✓

**Sonuç: PASS** ✓

---

## 11. Progress Doğrulaması

**faz2_tests.ts T11 (142 PASS kümesinden):**

```
Boş cevaplar:   answered=0, total=21, percentage=0%   ✓
3 soru cevap:   answered=3, total=21, percentage=14%  ✓
```

**Hesaplama yöntemi:** Yalnız `required: true` ve o an `visible: true` olan sorular sayılır.

**Sonuç: PASS** ✓

---

## 12. Business Function Status

**Engine Logic (`progress.ts`):**

```typescript
export function progressToStatus(answered: number, total: number): FunctionStatus {
  if (total === 0 || answered === 0) return "not_started";
  if (answered >= total) return "completed";
  return "in_progress";
}
```

**Davranış:**

| Cevap Durumu | Status |
|---|---|
| 0 cevap | `not_started` |
| 1–20 zorunlu cevap | `in_progress` |
| 21/21 zorunlu cevap | `completed` |

`updateFunctionStatusByCode()` her autosave sonrasında çağrılır ve `project_business_functions.status` alanını günceller.

**Sonuç: PASS** ✓

---

## 13. TypeScript / IDE Resolution Durumu

**Sorun:** IDE language server (Antigravity) `@tauri-apps/plugin-sql` için `"Cannot find module"` uyarısı veriyordu.

**Kök Sebep:**  
`@tauri-apps/plugin-sql@2.4.0` package.json'ındaki `exports` alanı malformed:

```json
// Mevcut (yanlış format)
"exports": {
    "types": "./dist-js/index.d.ts",
    "import": "./dist-js/index.js",
    "require": "./dist-js/index.cjs"
}

// Doğru format (subpath key gerekir)
"exports": {
    ".": {
        "types": "./dist-js/index.d.ts",
        "import": "./dist-js/index.js"
    }
}
```

`moduleResolution: "bundler"` ile TypeScript, `exports["."]` anahtarını arar. Bu anahtar yoksa:
- `tsc`: top-level `"types"` alanına fallback yapar → PASS
- IDE LS: daha katı yorumlar, fallback yapmaz → uyarı verir

**Uygulanan Çözüm:**  
`tsconfig.json`'a `paths` alias eklendi:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@tauri-apps/plugin-sql": ["./node_modules/@tauri-apps/plugin-sql/dist-js/index.d.ts"]
    }
  }
}
```

Bu alias IDE LS'nin doğru `.d.ts` dosyasını bulmasını sağlar.

**Sonuç:** `npm run build` (tsc + vite) → 0 error ✓  
IDE LS uyarısının `paths` alias sonrasında düzeliyor olması bekleniyor.

---

## 14. npm Test

```bash
npx tsx test/faz2_tests.ts

FAZ-2 Test Sonucu: 142 PASS / 0 FAIL
BAŞARILI: Tüm testler PASS.
```

**Sonuç: PASS** ✓

---

## 15. Frontend Build

```bash
npm run build

vite v6.4.3 building for production...
✓ 1609 modules transformed.
dist/assets/index-CbqIZjoX.css   14.64 kB
dist/assets/core-CWrPLa5z.js     26.31 kB  ← Satış pack bundle
dist/assets/index-Bm9BokYk.js   205.84 kB
✓ built in 1.71s
```

**Sonuç: PASS** ✓

---

## 16. Cargo Check

```bash
cargo check --manifest-path src-tauri/Cargo.toml

Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.29s
```

**Sonuç: PASS** ✓

---

## 17. Açık Sorunlar / Teknik Borç

### 1. seedData.ts ↔ Production DB Kod Uyumsuzluğu (FAZ-3 kapsamı)

**Durum:** Production DB kodları (`SATIS_YNT`, `MJT_YNT`, vb.) mevcut `seedData.ts` kodlarından (`SALES`, `CRM`, vb.) tamamen farklı.

**Risk:** Yeni kurulumda (production DB yoksa) `seedData.ts` farklı kodlarla seed yapar; mevcut kurulumda pack doğru çalışır (production DB canonical).

**Çözüm yönü:** `seedData.ts`'i production DB kodlarıyla tam senkronize etmek — FAZ-3'te ele alınmalı.

### 2. Tauri Headless Runtime Kısıtı (kalıcı kısıt)

Tauri'nin WebKit gerektirdiği bu geliştirme ortamında UI end-to-end testi yapılamamaktadır. Native persistence, engine logic ve migration SQL tüm Python + tsx testleriyle doğrulandı.

### 3. IDE Language Server Uyarısı

`paths` alias eklendi. IDE index yenilenmesi gerekebilir. `tsc` 0 hata ile geçiyor.

---

## 18. Acceptance Sonucu

| Kriter | Durum |
|--------|-------|
| Question pack tek source-of-truth | ✓ PASS |
| Production bundle pack load | ✓ PASS (`SALES-001` bundle'da) |
| Sales business function code match | ✓ PASS (`SATIS_YNT` production DB'de) |
| Real SQLite migration | ✓ PASS (6 tablo doğrulandı) |
| Real answer persistence | ✓ PASS (10/10 alan korundu) |
| Option notes | ✓ PASS |
| General note | ✓ PASS |
| Other validation | ✓ PASS (T05/T06) |
| Branching | ✓ PASS (T10, SALES-007 doğrulandı) |
| Progress | ✓ PASS (T11) |
| Resume (last_question_id) | ✓ PASS (`SALES-015` korundu) |
| npm test | ✓ PASS (142/0) |
| npm run build | ✓ PASS (1.71s, 0 error) |
| cargo check | ✓ PASS (0.29s) |

---

**FAZ-2 NATIVE ACCEPTANCE: PASS**

**FAZ-3'e başlamıyorum; mimari inceleme bekleniyor.**
