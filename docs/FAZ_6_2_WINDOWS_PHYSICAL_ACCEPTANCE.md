# FAZ-6.2 — Windows Artifact Build & Physical Native Acceptance Raporu

**Tarih:** 19 Ağustos 2026  
**Faz:** FAZ-6.2 — Windows Artifact Build + Physical Native Acceptance  
**Versiyon:** `0.1.0`  
**Uygulama Tanımlayıcısı:** `com.erpcrm.discovery`  
**Hedef Platform:** Windows 11 x64 (Birincil), Windows 10 x64 (İkincil)  

---

## 1. Git ve Dağıtım Ortamı Denetimi (Environment Audit)

Yapılan inceleme sonuçları:
```bash
git status
# fatal: not a git repository (or any of the parent directories): .git

git branch --show-current
# fatal: not a git repository

git remote -v
# fatal: not a git repository
```

- **Durum:** Çalışma dizini (`/home/selim/projects/erp-crm-discovery`) yerel bir Ubuntu geliştirme ortamıdır; henüz `git init` yapılmamış ve herhangi bir GitHub remote'a bağlanmamıştır.
- **Kural:** Kullanıcı onayı olmadan hiçbir uzak repository açılmamış, remote eklenmemiş ve push işlemi yapılmamıştır.
- **Kritik Bildirim:**  
  > **`WINDOWS ARTIFACT BUILD REQUIRES GITHUB REMOTE/PUSH`**

---

## 2. Kanıt ve Durum Sınıflandırması

Bu fazda kanıt dürüstlüğü esastır:
- **`WINDOWS BUILD: READY`**: Ubuntu tarafında tüm testler (354/354 PASS), kod üretimi (`npm run generate`), frontend derlemesi (`npm run build`) ve Rust backend kontrolü (`cargo check`) %100 tamamlanmış; tek kanonik `.github/workflows/windows-build.yml` iş akışı hazırlanmıştır.
- **`WINDOWS NATIVE ACCEPTANCE: PENDING`**: `.exe` kurulum paketi henüz fiziksel bir Windows makinesinde çalıştırılmadığı için kabul testleri beklemededir.

---

## 3. Windows Native Acceptance Yol Haritası

Artifact üretimi ve fiziksel kabul testi için iki alternatif yol bulunmaktadır:

### Seçenek 1: GitHub Actions CI/CD (Önerilen & Açık Kaynak Standardı)
1. Repository `git init` ile başlatılır.
2. GitHub üzerinde bir remote (`origin`) tanımlanır ve kod push edilir.
3. `.github/workflows/windows-build.yml` iş akışı `windows-latest` runner üzerinde otomatik çalışır.
4. Çıktı olarak üretilen `ERP-CRM-Discovery_0.1.0_x64-setup.exe` ve `.sha256` dosyası indirilir.

### Seçenek 2: Yerel Windows Geliştirici Makinesinde Doğrudan Derleme
Yerel bir Windows 10/11 makinesinde PowerShell üzerinden:
```powershell
npm ci
npm run generate
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri build
```
Üretilen dosya: `src-tauri/target/**/bundle/nsis/*.exe`

---

## 4. Standart Kabul Test Senaryoları (Windows Acceptance Dataset)

Windows ortamında icra edilecek adımlar ve test kümesi:
- **Firma Künyesi:** `FAZ-6 Test A.Ş.` (İstanbul / Türkiye / 250 Çalışan)
- **Proje:** `Windows Native Acceptance` (Hedef: `ERP_AND_CRM`)
- **İş Fonksiyonu:** `Sales` (Satış Yönetimi)
- **Doğrulanacak Fonksiyonlar:**
  1. *Clean Install & Launch:* UAC istemeden `%LOCALAPPDATA%\Programs\ERP CRM Discovery\` altına kurulum.
  2. *SQLite & Seed:* `%APPDATA%\com.erpcrm.discovery\erp_discovery.db` altında 11 tablo ve 31 iş fonksiyonunun (`SALES`) oluşumu.
  3. *State & Restart:* Cevaplar, 2 seçenek notu, genel not ve "Diğer" açıklamalarının restart sonrası tam korunması.
  4. *Semantik Katman:* 1 Bulgu, 1 Gereksinim, 1 Risk ve 1 Proje Notu oluşturulması ve restart kalıcılığı.
  5. *DOCX Export:* Native Save Dialog ile Masaüstüne kayıt, Word ile açılabilirlik ve Türkçe karakter doğrulaması.
  6. *PDF Export:* Gömülü TrueType (Liberation Sans) ile Türkçe gliflerin (`Çağrı, Çalışma, Ğ, İ, ı, Şirket, Üretim, Görüşme, İstanbul, Iğdır, Çeşme, Öğüt, Şüphe, çözüm`) aranabilir vektörel metin olarak basılması.
  7. *Offline Runtime:* İnternet bağlantısı kesildiğinde %100 çevrimdışı çalışma.
  8. *Uninstall:* Program kaldırıldığında analiz veritabanının korunması.

---

## 5. Faz Kabul Kararı

| Alan | Durum |
|---|---|
| **Ubuntu Geliştirme & Test Doğrulaması (354 Test)** | ✓ **PASS** |
| **Windows Build Yapılandırması & CI Workflow** | 🟡 **WINDOWS BUILD: READY** |
| **Gerçek Windows Cihazında Native Acceptance** | 🟡 **WINDOWS NATIVE ACCEPTANCE: PENDING** |
| **ERP CRM Discovery v0.1.0 RC1 Genel Durumu** | 🟡 **PENDING PHYSICAL TEST** |

---

**FAZ-6.2 tamamlandı. Yeni geliştirme fazına başlamıyorum; mimari inceleme bekleniyor.**
