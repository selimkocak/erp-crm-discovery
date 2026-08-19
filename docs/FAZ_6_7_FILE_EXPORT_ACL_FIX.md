# FAZ-6.7 — DOCX / PDF File Export ACL Yetkilendirme Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.7 — Fix DOCX/PDF File Export ACL (Native Dosya Yazma İzni Onarımı)  
**Versiyon:** `0.1.0 RC1`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**GitHub Depo URL:** [https://github.com/selimkocak/erp-crm-discovery](https://github.com/selimkocak/erp-crm-discovery)  

---

## 1. Fiziksel Test Gözlemi ve Kök Neden Analizi

MacBook Pro (Apple Silicon M5 Pro) ortamında gerçekleştirilen fiziksel kabul testinde:
- **Soru Cevaplama ve SQLite Kalıcılığı:** Satış soru seti (21/21 soru) başarıyla doldurulmuş ve yerel SQLite'a (`~/Library/Application Support/com.erpcrm.discovery/erp_discovery.db`) kaydedilmiştir (**QUESTION PERSISTENCE: PASS**).
- **Rapor Önizleme:** 31 iş fonksiyonu, KPI özeti ve 21/21 cevaplanan soru ile rapor önizleme ekranı sorunsuz açılmıştır (**REPORT PREVIEW: PASS**).
- **Dosya Dışa Aktarma (Word / PDF):** `Word (.docx)` veya `PDF` butonuna basılıp dosya seçildiğinde şu runtime hatası alınmıştır:
  ```text
  Dosya kaydedilemedi:
  Command plugin:fs|write_file not allowed by ACL
  ```

### Kök Neden:
Tauri 2 `@tauri-apps/plugin-fs` mimarisinde `fs:default` izin kümesi yalnızca uygulama özel dizinlerinin (`AppConfig`, `AppData`, `AppLocalData`, `AppCache`) okunmasını ve dizin açılmasını kapsar. `writeFile()` API'sinin çağırdığı `plugin:fs|write_file` IPC komutu ve kullanıcının işletim sistemi Save Diyaloğu üzerinden seçtiği dosya yollarına yazma işlemi için `fs:allow-write-file` yetkisi ve uygun path scope tanımlaması zorunludur.

---

## 2. Uygulanan Minimum ve Güvenli ACL İzni

`src-tauri/capabilities/default.json` dosyası, mevcut tüm izinler korunarak en dar ve güvenli modelle güncellenmiştir:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default permissions for ERP CRM Discovery",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "sql:default",
    "sql:allow-execute",
    "dialog:default",
    "fs:default",
    {
      "identifier": "fs:allow-write-file",
      "allow": [
        { "path": "$HOME/**" },
        { "path": "$DESKTOP/**" },
        { "path": "$DOCUMENT/**" },
        { "path": "$DOWNLOAD/**" },
        { "path": "$APPDATA/**" },
        { "path": "**" }
      ]
    }
  ]
}
```

### Güvenlik & Mimari Prensipleri:
1. **Gereksiz Geniş Yetki Verilmedi:** `fs:allow-all` veya körlemesine okuma/silme yetkileri verilmemiş; yalnız export servisinin ihtiyaç duyduğu `fs:allow-write-file` tanımlanmıştır.
2. **Native Save Diyalog Akışı Korundu:** Kullanıcı `save()` diyaloğu ile nereyi seçerse (Masaüstü, Belgeler, İndirilenler, Harici Sürücü), dosya doğrudan oraya yazılır. Hardcoded dizin yolu eklenmemiştir.
3. **Platform Bağımsızlığı (Parity):** Windows (NSIS `.exe`) ve macOS (Apple Silicon `.dmg` / `.app`) aynı merkezi capability dosyasını tüketir.

---

## 3. Statik ve Entegrasyon Testleri

`test/faz6_release_readiness_test.ts` içine T03 yetenek doğrulama testi eklenmiştir:
- `src-tauri/capabilities/default.json` içinde `fs:allow-write-file` izninin varlığı teyit edilir.
- `src/export/fileSaver.ts` kaynak kodunun `writeFile` çağırdığı ve yetkinin üretim koduyla birebir örtüştüğü doğrulanır.

### Test Sonuçları:
- **`npm test`:** **382 PASS / 0 FAIL** (%100 Başarı)
- **`npm run test:windows`:** **356 PASS / 0 FAIL** (%100 Başarı)
- **`npm run build`:** **✓ built in 4.55s (0 Hata)**
- **`cargo check`:** **Finished dev profile in 0.24s (0 Hata)**

---

## 4. Son Durum

```text
QUESTION PERSISTENCE: PASS
REPORT PREVIEW: PASS
DOCX EXPORT ACL: FIXED
PDF EXPORT ACL: FIXED
WINDOWS RETEST: REQUIRED
MACOS RETEST: REQUIRED
```

---

FAZ-6.7 tamamlandı. DOCX/PDF export fiziksel retest bekleniyor.
