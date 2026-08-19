# FAZ-6.1 — Windows Artifact Build & Native Acceptance Paketi Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.1 — Windows Artifact Build + Native Acceptance Paketi  
**Versiyon:** `0.1.0`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**Hedef Mimari:** `x86_64` (Windows 11 / Windows 10)  

---

## 1. Workflow Audit
- **Mevcut Workflow Dizin Durumu:** `.github/workflows/` dizini denetlendi.
- **Bulunan ve Korunan Dosyalar:**
  1. `.github/workflows/ci.yml` — Linux üzerinde 354 test, build ve cargo check doğrulaması yapan CI iş akışı.
  2. `.github/workflows/windows-build.yml` — Windows native runner (`windows-latest`) üzerinde NSIS setup üretimi ve SHA-256 hash hesaplaması yapan tek ve kanonik iş akışı.
- **Düzeltilen Tutarsızlık:** Önceden taslak olarak bahsedilen mükerrer `release-windows.yml` dosyası silinerek tek kanonik workflow `windows-build.yml` olarak sabitlendi.

---

## 2. Windows Build Configuration
- **Platform Hedefi:** `windows-latest` (GitHub Actions) veya yerel Windows 10/11 x64 geliştirici makinesi.
- **Rust Toolchain:** `stable` with target `x86_64-pc-windows-msvc`.
- **Node.js Sürümü:** `20.x LTS`.
- **NSIS Ayarları (`tauri.conf.json`):** `installMode: "currentUser"`, `languages: ["Turkish", "English"]`, `displayLanguageSelector: true`.

---

## 3. Actual Build Command (Kanonik Derleme Komutu)
`package.json` ve CI workflow'unda standartlaştırılan tek kanonik komut:
```bash
npm run tauri build
```

---

## 4. Actual Artifact Path (Gerçek Çıktı Arama Yolu)
Tauri derleme motorunun Windows üzerinde ürettiği dosya konumu:
```text
src-tauri/target/**/bundle/nsis/*.exe
```
(Yerel host derlemesinde `src-tauri/target/release/bundle/nsis/`, hedef belirtildiğinde `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/`).

---

## 5. Installer Name
Tauri NSIS paketleyici tarafından üretilen dosya adı:
```text
ERP-CRM-Discovery_0.1.0_x64-setup.exe
```

---

## 6. Version Parity
- `package.json`: `"version": "0.1.0"`
- `src-tauri/Cargo.toml`: `version = "0.1.0"`
- `src-tauri/tauri.conf.json`: `"version": "0.1.0"`
- **Sonuç:** 3/3 dosya arasında 0 sapma (drift) bulunmaktadır.

---

## 7. WebView2 Configuration
- **Yapılandırılmış Mod:** `downloadBootstrapper` (`bundle.windows.webviewInstallMode.type: "downloadBootstrapper"`).
- **Gerekçe:** Windows 11 ve güncel Windows 10 makinelerinde WebView2 yerleşik bulunur. Installer boyutu minimumda (~12-15 MB) kalır.
- **Offline Alternatifi:** Air-gapped kurumsal ortamlar için `embedBootstrapper` alternatif olarak dokümante edilmiştir.

---

## 8. AppData Path (Gerçek Windows Veri Yolu)
- **Windows SQLite Veritabanı:** `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` (Tauri `app_data_dir()` / `tauri-plugin-sql` Roaming dizini).
- **Uygulama Kurulum Dizini:** `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` (`installMode: "currentUser"`).

---

## 9. Build Result
- **Ubuntu Ortamı Doğrulaması:** 354/354 Test PASS, `npm run build` PASS (4.55s), `cargo check` PASS (0.69s).
- **Windows Runner Durumu:** Repository henüz GitHub remote'a bağlı olmadığından CI otomatik tetiklenmemiştir; workflow ve yerel Windows komutları `READY` durumundadır.

---

## 10. Artifact Size
- **Tahmini Installer Boyutu:** ~12 - 15 MB (Gömülü Liberation Sans TrueType font ve frontend bundle dahil).
- **Tahmini Kurulu Disk Alanı:** ~35 - 45 MB.
- *(Gerçek bayt boyutu ilk Windows build sonrası hash ile birlikte mühürlenecektir).*

---

## 11. SHA-256
- **Hesaplama Yöntemi:**
  ```powershell
  Get-FileHash -Path "src-tauri/target/**/bundle/nsis/*setup.exe" -Algorithm SHA256
  ```
- *(Gerçek Windows derlemesi icra edildiğinde gerçek SHA-256 değeri buraya işlenecektir).*

---

## 12. Windows Manual Acceptance
- **Test Veri Seti:** `FAZ-6 Test A.Ş.`, `Windows Native Acceptance`, `Sales` (Satış), `İstanbul / Türkiye`, `250 Çalışan`.
- **Kontrol Listesi:** [WINDOWS_RC_ACCEPTANCE_CHECKLIST.md](file:///home/selim/projects/erp-crm-discovery/docs/WINDOWS_RC_ACCEPTANCE_CHECKLIST.md) (24 kontrol maddesi).

---

## 13. SQLite Acceptance
- **Beklenen:** İlk açılışta 11 tablonun (`analysis_projects`, `company_profiles`, `business_functions`, `project_business_functions`, `question_answers`, `question_session_state`, `analysis_findings`, `analysis_requirements`, `analysis_risks`, `project_notes`, `analysis_report_profiles`) ve 31 kanonik iş fonksiyonunun (Satış `SALES` dahil) otomatik oluşumu.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 14. Question Engine Acceptance
- **Beklenen:** `single_choice`, `multiple_choice`, seçenek notları, genel not, "Diğer" seçeneği, koşullu dallanma ve restart sonrası state korunumu.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 15. Semantic Layer Acceptance
- **Beklenen:** 1 Bulgu, 1 Gereksinim, 1 Risk ve 1 Proje Notu oluşturulması, listelenmesi ve restart sonrası korunması.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 16. Report Acceptance
- **Beklenen:** Ham JSON veya teknik DB ID içermeyen, insan-okunabilir `ReportModel` önizlemesi (Firma künyesi, kapsam, cevaplar, notlar, semantik kayıtlar, yönetici özeti).
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 17. DOCX Acceptance
- **Beklenen:** "Word (.docx)" butonuna basıldığında native Windows Save Dialog açılması, Masaüstü/Belgelerim seçildiğinde dosyanın ikili ZIP olarak yazılması, Word ile açılabilmesi.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 18. PDF Acceptance
- **Beklenen:** "PDF (.pdf)" butonuna basıldığında native Save Dialog açılması, gömülü TrueType (Liberation Sans) ile Türkçe karakterlerin (**Çağrı, Çalışma, Ğ, İ, ı, Şirket, Üretim, Görüşme, İstanbul, Iğdır, Çeşme, Öğüt, Şüphe, çözüm**) hatasız ve seçilebilir vektörel metin olarak basılması.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 19. Offline Acceptance
- **Beklenen:** İnternet kesildiğinde uygulamanın sıfır hata ile açılması, analiz yapılması, rapor önizleme, DOCX ve PDF üretilmesi.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 20. Uninstall Acceptance
- **Beklenen:** Windows Ayarlar üzerinden kaldırıldığında program binary'lerinin silinmesi; kullanıcının `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` veritabanının korunması.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 21. SmartScreen
- **Beklenen Davranış:** `EXPECTED UNSIGNED RC BEHAVIOR` (İmzasız açık kaynak sürüm için "Ek Bilgi" → "Yine de Çalıştır" adımı dokümante edilmiştir).

---

## 22. Defender
- **Beklenen Davranış:** Windows Defender gerçek zamanlı korumasının uygulamayı engellememesi/karantinaya almaması.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 23. Performance Smoke
- **Beklenen Deneyim:** Uygulama açılışı ~1-2 sn, Soru ekranı geçişi anlık, PDF üretimi < 1 sn.
- **Durum:** `NOT TESTED (Awaiting Windows Execution)`

---

## 24. Remaining Limitations
1. **GitHub Remote / Push Beklentisi:** Repository henüz GitHub remote'a bağlanmadığı için CI otomatik çalıştırılmamıştır.
2. **Fiziksel Windows Makine Testi:** Gerçek Windows ekran etkileşimi yapılana kadar sonuçlar `NOT TESTED` / `READY` olarak korunmaktadır.

---

## 25. Final Acceptance

| Kategori | Sonuç |
|---|---|
| **Ubuntu Test & Derleme Doğrulaması** | ✓ **PASS (354/354 Test)** |
| **Windows Build Yapılandırması & CI Workflow** | 🟡 **WINDOWS BUILD: READY** |
| **Gerçek Windows Cihazında Native Acceptance** | 🟡 **WINDOWS NATIVE ACCEPTANCE: PENDING** |

---

**FAZ-6.1 tamamlandı. Yeni ürün özelliğine başlamıyorum; Windows native acceptance sonucu mimari inceleme bekliyor.**
