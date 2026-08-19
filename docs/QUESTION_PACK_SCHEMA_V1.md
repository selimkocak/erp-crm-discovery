# Question Pack Schema V1

ERP CRM Discovery soru paketleri için teknik referans.
Bu rehber, yeni iş fonksiyonu paketleri yazmak isteyen danışmanlar ve katkı sahipleri içindir.

---

## 1. Dosya Konumu

```
question-packs/
└── tr/
    └── <iş-fonksiyonu>/
        └── core.json
```

Örnek: `question-packs/tr/sales/core.json`

Paket, aynı zamanda `public/question-packs/` altına kopyalanmalıdır.

---

## 2. Desteklenen Diller

| Dizin | Dil       |
|-------|-----------|
| `tr/` | Türkçe    |
| `en/` | İngilizce (gelecek) |

---

## 3. Kök Yapı

```json
{
  "meta": { ... },
  "questions": [ ... ]
}
```

---

## 4. `meta` Alanı

| Alan                   | Tip    | Zorunlu | Açıklama                              |
|------------------------|--------|---------|---------------------------------------|
| `pack_id`              | string | ✓       | `"tr.sales.core"` formatı             |
| `version`              | string | ✓       | Semver: `"0.1.0"`                    |
| `schema_version`       | string | ✓       | Şema versiyonu: `"1"`                |
| `language`             | string | ✓       | `"tr"` veya `"en"`                   |
| `business_function_code` | string | ✓  | `"SATIS_YNT"` gibi kod               |
| `name`                 | string | ✓       | Ekrana gösterilecek isim             |
| `description`          | string | ✓       | Kısa açıklama                        |

---

## 5. `questions[]` — Tek Soru Yapısı

```json
{
  "id":           "SALES-001",
  "process":      "Müşteri Yönetimi",
  "sub_process":  "Segment",
  "order":        1,
  "question":     "Müşteri bilgileri nerede tutulur?",
  "description":  "Hangi sistemde ana veri saklandığını anlamaya çalışıyoruz.",
  "example_answers": ["SAP CRM", "Excel dosyaları"],
  "answer_type":  "multiple_choice",
  "required":     true,
  "criticality":  "high",
  "options":      [ ... ],
  "condition":    { ... },
  "tags":         ["crm", "veri"]
}
```

### Zorunlu Alanlar

| Alan          | Tip     | Açıklama                                     |
|---------------|---------|----------------------------------------------|
| `id`          | string  | Pakette benzersiz, büyük harf (SALES-001)    |
| `process`     | string  | Süreç adı (navigation için)                 |
| `order`       | number  | Sıralama değeri (küçükten büyüğe)           |
| `question`    | string  | Türkçe soru metni                            |
| `answer_type` | enum    | Aşağıda açıklanmıştır                       |
| `required`    | boolean | `true` = zorunlu, ilerlemeyi etkiler        |
| `criticality` | enum    | Soru önemi                                   |

### Opsiyonel Alanlar

| Alan            | Tip      | Açıklama                                           |
|-----------------|----------|----------------------------------------------------|
| `sub_process`   | string   | Alt süreç                                          |
| `description`   | string   | "Bu soruyu neden soruyoruz?" — kullanıcıya gösterilir |
| `example_answers` | string[] | Seçenek olmayan rehber örnekler               |
| `options`       | Option[] | `single_choice`/`multiple_choice` için zorunlu   |
| `condition`     | Condition | Koşullu görünürlük                               |
| `tags`          | string[] | Filtreleme etiketleri (gelecek)                  |

---

## 6. `answer_type` Değerleri

| Değer             | Açıklama                            | `options` Zorunlu |
|-------------------|-------------------------------------|:-----------------:|
| `single_choice`   | Tek seçenek (radio)                 | ✓                |
| `multiple_choice` | Birden fazla seçenek (checkbox)     | ✓                |
| `short_text`      | Kısa serbest metin                  | ✗                |
| `long_text`       | Uzun serbest metin (textarea)       | ✗                |
| `number`          | Sayısal değer                       | ✗                |

---

## 7. `criticality` Değerleri

| Değer      | Açıklama                                     |
|------------|----------------------------------------------|
| `low`      | Güzel olur ama olmasa da olur               |
| `medium`   | Genel bağlamı anlamak için önemli           |
| `high`     | Implementasyon tasarımı için kritik         |
| `critical` | Eksik olursa implementasyon yanlış gidebilir |

---

## 8. `options[]` — Seçenek Yapısı

```json
{
  "value":      "erp_crm",
  "label":      "ERP/CRM sistemi üzerinden",
  "allow_note": true,
  "is_other":   false
}
```

| Alan         | Tip     | Açıklama                                                      |
|--------------|---------|---------------------------------------------------------------|
| `value`      | string  | Makine tarafından okunan benzersiz kod                       |
| `label`      | string  | Kullanıcıya gösterilen Türkçe metin                         |
| `allow_note` | boolean | `true` = seçilince "Açıklama ekle" toggle gösterilir       |
| `is_other`   | boolean | `true` = "Diğer" seçeneği; seçilince açıklama **zorunlu** |

### Kurallar

- Bir soru içinde **en fazla bir** `is_other: true` seçenek olabilir.
- `is_other: true` olan seçenekte `allow_note` **mutlaka** `true` olmalıdır.
- `value` değerleri bir soru içinde **benzersiz** olmalıdır.

---

## 9. `condition` — Koşullu Görünürlük

```json
{
  "question_id": "SALES-006",
  "operator":    "not_equals",
  "value":       "takip_yok"
}
```

Bu koşulu taşıyan soru, yalnızca `SALES-006` sorusunun cevabı `takip_yok` **olmadığında** görünür.

### Desteklenen Operatörler

| Operatör    | Açıklama                                           | Uygun Tip            |
|-------------|-----------------------------------------------------|----------------------|
| `equals`    | Seçilen değer `value` ile tam eşleşmeli            | single/multiple      |
| `not_equals`| Seçilen değer `value` ile eşleşmemeli              | single/multiple      |
| `contains`  | Seçilen değerler arasında `value` bulunmalı        | multiple_choice      |

### Önemli Notlar

- Koşul belirtilmemiş sorular **her zaman** görünür.
- Referans edilen `question_id` aynı pakette var olmalıdır.
- `not_equals` için: referans soru **cevaplanmamışsa** soru **görünür**.
- `equals` / `contains` için: referans soru **cevaplanmamışsa** soru **görünmez**.

---

## 10. Answer Data Modeli (SQLite)

Cevaplar SQLite'ta JSON string olarak saklanır:

```json
{
  "selected": [
    { "value": "erp_crm", "note": "SAP SD modülü kullanıyoruz." },
    { "value": "excel",   "note": "Bölge ofisleri ayrıca kullanıyor." }
  ],
  "general_note": "İstanbul ve Ankara süreci farklı yürütüyor."
}
```

| Alan           | Tip              | Açıklama                                              |
|----------------|------------------|-------------------------------------------------------|
| `selected`     | SelectedAnswer[] | `single_choice`/`multiple_choice` cevapları          |
| `selected[].value` | string      | Seçilen option.value                                  |
| `selected[].note`  | string?     | Seçeneğe ait açıklama (allow_note ise)               |
| `text`         | string?          | `short_text`/`long_text`/`number` cevabı            |
| `general_note` | string?          | Seçeneklere sığmayan ek bağlam                       |

---

## 11. Pack ID Sözleşmesi

Format: `{language}.{domain}.{level}`

| Örnek               | Anlamı                              |
|---------------------|--------------------------------------|
| `tr.sales.core`     | Türkçe, Satış, Temel sorular        |
| `tr.purchasing.core`| Türkçe, Satın Alma, Temel          |
| `en.sales.core`     | İngilizce, Satış, Temel            |

---

## 12. Doğrulama Kuralları (Validator)

Pack yüklenirken otomatik kontrol edilir:

| Kural Kodu                  | Açıklama                                                  |
|-----------------------------|-----------------------------------------------------------|
| `INVALID_ROOT`              | JSON kök nesnesi değil                                    |
| `MISSING_META`              | `meta` alanı yok                                          |
| `MISSING_META_FIELD`        | `meta` içinde zorunlu alan eksik                         |
| `MISSING_QUESTIONS`         | `questions` dizisi yok veya boş                          |
| `DUPLICATE_QUESTION_ID`     | Aynı `id` birden fazla kullanılmış                       |
| `MISSING_QUESTION_ID`       | Bir soruda `id` alanı yok                               |
| `INVALID_ANSWER_TYPE`       | Geçersiz `answer_type`                                    |
| `INVALID_CRITICALITY`       | Geçersiz `criticality`                                   |
| `MISSING_OPTIONS`           | Choice soru için `options` yok                           |
| `DUPLICATE_OPTION_VALUE`    | Bir soru içinde aynı option `value` tekrar ediyor       |
| `MISSING_OPTION_VALUE`      | Option `value` alanı yok                                |
| `OTHER_WITHOUT_NOTE`        | `is_other: true` ama `allow_note: false`                |
| `MULTIPLE_OTHER`            | Bir soru içinde birden fazla `is_other: true`           |
| `INVALID_CONDITION_OPERATOR`| Geçersiz condition operator                              |
| `DANGLING_CONDITION_REFERENCE` | Condition'daki `question_id` pakette bulunamadı    |

---

## 13. Örnek Minimal Pack

```json
{
  "meta": {
    "pack_id": "tr.purchasing.core",
    "version": "0.1.0",
    "schema_version": "1",
    "language": "tr",
    "business_function_code": "SATIN_ALMA",
    "name": "Satın Alma Ön Analizi",
    "description": "Satın alma süreçlerini anlamaya yönelik temel sorular."
  },
  "questions": [
    {
      "id": "PO-001",
      "process": "Tedarikçi Yönetimi",
      "order": 1,
      "question": "Tedarikçi bilgileri nerede tutulur?",
      "answer_type": "single_choice",
      "required": true,
      "criticality": "high",
      "options": [
        { "value": "erp", "label": "ERP sistemi", "allow_note": true, "is_other": false },
        { "value": "excel", "label": "Excel", "allow_note": false, "is_other": false },
        { "value": "other", "label": "Diğer", "allow_note": true, "is_other": true }
      ]
    }
  ]
}
```

---

## 14. Yeni Pack Katkısı Adımları

1. `question-packs/tr/<domain>/core.json` dosyasını oluşturun
2. Bu dokümandaki kurallara uyun
3. Pack'i `public/question-packs/tr/<domain>/core.json` konumuna kopyalayın
4. `src/engine/loader.ts` içindeki `PACK_URLS` tablosuna ekleyin
5. `src/engine/loader.ts` içindeki `getPackIdForFunction()` tablosuna ekleyin
6. `npx tsx test/faz2_tests.ts` ile testleri çalıştırın
7. `npm run build` ile derlemeyi doğrulayın

---

*Schema Version 1 — FAZ-2 — ERP CRM Discovery*
