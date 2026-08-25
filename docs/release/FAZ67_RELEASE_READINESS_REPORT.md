# ERP CRM Discovery — Yayın Hazırlık Raporu (Release Readiness Report)

> **Belge Kodu:** `DOC-REL-FAZ67-001`  
> **Hazırlanma Tarihi:** `2026-08-25`  
> **Hedef Sürüm:** `v0.1.4` (Release Candidate / Hazırlık Durumu)  
> **Değerlendirme Sonucu:** `RELEASE_READY_FOR_REVIEW` (Uzman İncelemesine ve Kontrollü Yayına Hazır)  
> **Yayın Yetkisi Kuralı:** Gerçek tagleme, GitHub Release açma ve installer üretimi yalnızca kullanıcının (Selim Koçak) açık talimatıyla yapılır.  

---

## 1. Uygulamanın Amacı ve Kapsamı

**ERP CRM Discovery**; kurumsal ERP ve CRM dönüşüm projeleri öncesinde işletmelerin iş süreçlerini, endüstriyel veri kaynaklarını (OT/IT), veri yönetişim sorumluluklarını, görevler ayrılığı (SoD) risklerini ve saha kanıtlarını sistematik olarak toplayan **açık kaynaklı (MIT Lisanslı), %100 çevrimdışı (offline-first)** bir masaüstü keşif ve veri analiz aracıdır.

Platform bir ERP/CRM işlemsel operasyon yazılımı **değildir**; kurumsal dönüşümün başlangıcındaki keşif (discovery), olgunluk değerlendirmesi, kapsam belirleme, darboğaz/risk tespiti ve şartname hazırlık aşamalarını yapılandıran tarafsız (vendor-neutral) bir süreç analiz aracıdır.

---

## 2. Temel Güvenlik ve Mimari İlkeler

### 2.1 Sıfır Dışa Veri Aktarımı (Zero-Egress) ve Çevrimdışı Güvencesi
- Uygulama harici hiçbir bulut sunucusuna, analiz API'sine veya telemetri servisine veri göndermez.
- Tauri 2 güvenlik katmanında dış ağ yetkileri (`http`, `fetch`, `external IPC`) tamamen devre dışı bırakılmıştır.
- Tüm veriler yalnızca kullanıcının yerel bilgisayarında, işletim sistemi kullanıcı dizinindeki gömülü SQLite veritabanında saklanır.

### 2.2 Sıfır Gerçek Veri İlkesi (%100 Sentetik Pilot)
- Depoda ve testlerde hiçbir gerçek müşteri, kurum veya Tuna Ofis verisi yer almaz.
- Test ve doğrulama amacıyla kullanılan `Marmara Endüstriyel Sistemler A.Ş.` verisi tamamen sentetik, kurgusal ve etik kurallara uygun biçimde üretilmiştir.

### 2.3 AI İzolasyonu İlkesi (AI-Free Runtime)
- Uygulamanın çalışma zamanında (runtime) hiçbir yapay zekâ (LLM, Gemini, OpenAI, Claude vb.) API'si, API anahtarı veya AI ağ geçidi **bulunmaz**.
- Sistem deterministik, şeffaf ve denetlenebilir iş kuralları ile çalışır.
- Raporlama metrikleri matematiksel kesinlik ve kanonik veri modeli kurallarıyla hesaplanır.

### 2.4 Lisans ve Üçüncü Taraf Bildirimleri
- Ana Lisans: **MIT Lisansı** ([LICENSE](file:///home/selim/projects/erp-crm-discovery/LICENSE))
- Telif Hakkı: `Copyright (c) 2026 Selim Koçak (ERP CRM Discovery Contributors)`
- Tüm üçüncü taraf açık kaynak kütüphaneler (React, Tauri, Lucide, docx, jsPDF, better-sqlite3) ticari ve akademik kullanıma izin veren MIT / Apache 2.0 lisanslıdır.

---

## 3. Dokümantasyon ve Sürüm Senkronizasyonu

| Doküman | Konum | Durum | Açıklama |
|---|---|:---:|---|
| **Ana Sözleşme & Kurallar** | [AGENTS.md](file:///home/selim/projects/erp-crm-discovery/AGENTS.md) | ✅ GÜNCEL | Zero-egress, AI izolasyonu ve rol sınırları mühürlü |
| **Kullanıcı Kılavuzu (TR)** | [docs/USER_GUIDE_TR.md](file:///home/selim/projects/erp-crm-discovery/docs/USER_GUIDE_TR.md) | ✅ GÜNCEL | 15 bölüm, baştan sona resimli & açıklamalı kullanım |
| **Uzman İnceleme Rehberi** | [docs/review/FAZ67_EXPERT_FIELD_REVIEW_GUIDE.md](file:///home/selim/projects/erp-crm-discovery/docs/review/FAZ67_EXPERT_FIELD_REVIEW_GUIDE.md) | ✅ GÜNCEL | MCS ve bağımsız uzmanlar için değerlendirme protokolü |
| **Soru Paketi İnceleme Matrisi** | [docs/review/FAZ67_QUESTION_PACK_REVIEW_MATRIX.md](file:///home/selim/projects/erp-crm-discovery/docs/review/FAZ67_QUESTION_PACK_REVIEW_MATRIX.md) | ✅ GÜNCEL | 35 soru paketinin tamamını içeren denetim matrisi |
| **Marmara Pilot Kabul Rehberi** | [docs/review/FAZ67_MARMARA_PILOT_ACCEPTANCE_GUIDE.md](file:///home/selim/projects/erp-crm-discovery/docs/review/FAZ67_MARMARA_PILOT_ACCEPTANCE_GUIDE.md) | ✅ GÜNCEL | 14 aşamalı pilot kabul adımları ve UAT kontrol listesi |
| **Proje README** | [README.md](file:///home/selim/projects/erp-crm-discovery/README.md) | ✅ GÜNCEL | 34 fonksiyon, 35 paket, 1.550 soru, 39 tablo, 19 migrasyon |
| **Değişiklik Günlüğü** | [CHANGELOG.md](file:///home/selim/projects/erp-crm-discovery/CHANGELOG.md) | ✅ GÜNCEL | v0.1.4 altındaki tüm son fazlar (FAZ-62A..67) eksiksiz |
| **Güvenlik Politikası** | [SECURITY.md](file:///home/selim/projects/erp-crm-discovery/SECURITY.md) | ✅ GÜNCEL | Offline veri hassasiyeti ve bildirim kuralları |
| **Katkı Rehberi** | [CONTRIBUTING.md](file:///home/selim/projects/erp-crm-discovery/CONTRIBUTING.md) | ✅ GÜNCEL | Deklaratif JSON soru paketi geliştirme standartları |

---

## 4. Sürüm ve Metadata Tutarlılığı

Aşağıdaki 3 temel metadata kaynağının sürüm bilgisi ve proje tanımlayıcıları `%100` senkronizedir:

1. **`package.json`**: `"version": "0.1.4"`, `"name": "erp-crm-discovery"`
2. **`src-tauri/tauri.conf.json`**: `"version": "0.1.4"`, `"productName": "ERP CRM Discovery"`, `"identifier": "com.erpcrm.discovery"`
3. **`src-tauri/Cargo.toml`**: `version = "0.1.4"`, `name = "erp-crm-discovery"`

---

## 5. Dağıtım ve İşletim Sistemi Hazırlığı

### 5.1 Windows Dağıtım Hazırlığı (.exe / NSIS Installer)
- **Paketleme Formatı:** Modern NSIS Windows Installer (`.exe`).
- **Kurulum Modu:** `currentUser` (Yönetici şifresi / UAC gerektirmeden sorunsuz yerel kurulum).
- **Webview2 Entegrasyonu:** `downloadBootstrapper` modu ile Windows 10/11 uyumluluğu.
- **Yönetilen Kanıt Kasası:** `%LOCALAPPDATA%\com.erpcrm.discovery\attachments\` altında güvenli fiziksel kopyalama ve `file:///` köprüsü.
- **Font ve Unicode:** Gömülü TrueType Liberation Sans ile sıfır font bağımlılığı ve %100 Türkçe karakter garantisi.
- **Workflow:** `.github/workflows/windows-build.yml` — Yalnızca `v*` etiketlerinde veya manuel dispatch ile installer derler.

### 5.2 macOS Dağıtım Hazırlığı (.dmg / .app)
- **Paketleme Formatı:** Standart Apple Disk Image (`.dmg`) ve evrensel `.app` paketi.
- **Minimum macOS Sürümü:** `10.13` (High Sierra ve üzeri, Apple Silicon & Intel destekli).
- **Veri Kasası:** `~/Library/Application Support/com.erpcrm.discovery/` altında güvenli yerel SQLite ve ek dosyalar.
- **Workflow:** `.github/workflows/macos-build.yml` — Yalnızca `v*` etiketlerinde veya manuel dispatch ile DMG derler.

---

## 6. Veri Tabanı, Migrasyon ve Yedekleme Uyumluluğu

- **SQLite Tablo Sayısı:** 39 Tablo
- **Migrasyon Sayısı:** 19 Migrasyon (Tümü geriye dönük uyumlu ve sıralı)
- **Clean Install Durumu:** `test/clean_install_test.ts` -> **57 PASS / 0 FAIL** (Yeni kurulumda 39 tablo eksiksiz ve hatasız oluşuyor).
- **Taşınabilir Arşiv Formatı:** `.erpcrm` Schema 19 (POSIX USTAR + GZIP + SHA-256 bütünlük doğrulaması + path traversal koruması).
- **Geri Yükleme & Çoğaltma Paritesi:**
  - Tam Geri Yükleme: 39 tablonun tamamı yeni UUID'lerle geri yüklenir.
  - Şablon Çoğaltma: Sorular ve yapı korunurken, cevaplar ve Go-Live kontrolleri `NOT_STARTED` olarak sıfırlanır.

### 6.1 Kanonik Soru Külliyatı İstatistikleri (`npm run audit:corpus`)
- **Toplam Soru Paketi:** 35 Paket
- **Toplam Kanonik Soru:** 1.550 Soru
- **Zorunlu Sorular (Required):** 831 Soru (%53.6)
- **Opsiyonel Sorular (Optional):** 719 Soru (%46.4)
- **Koşullu Dallanma Noktası (Branching):** 222 Nokta
- **Kapsanan İş Fonksiyonu:** 34 Kanonik İş Fonksiyonu (%100 Kapsama)
- **Külliyat Bütünlüğü:** 0 ID Mükerrerliği, 0 Bileşik Anahtar Çakışması, 0 Branching Hatası (%100 TEMİZ)

---

## 7. Kalite Kapıları ve Doğrulama Durumu

| Kalite Kapısı | Komut / Araç | Sonuç | Açıklama |
|---|---|:---:|---|
| **Kabul & Smoke Testi** | `test/faz66_pilot_readiness_smoke_test.ts` | **88 PASS / 0 FAIL** | CRUD, payda, kritik kural, backup, pilot, docx/pdf |
| **Clean Install Testi** | `test/clean_install_test.ts` | **57 PASS / 0 FAIL** | 39 tablo şema doğrulaması, 34 master fonksiyon |
| **Web Frontend Build** | `npm run build` | **BAŞARILI** | 1.971 modül 0 hata ile derlendi (Vite / TypeScript) |
| **Rust Backend Check** | `cargo check` | **BAŞARILI** | 0 hata, 0 uyarı |
| **Git Diff Whitespace** | `git diff --check` | **BAŞARILI** | 0 whitespace veya EOF hatası |
| **Git Çalışma Ağacı** | `git status --short` | **TEMİZ** | İzole ve kontrollü değişiklikler |

---

## 8. Bilinen Sınırlamalar ve Sınır Çizgileri

1. **ERP / CRM İşlemsel Yazılım Değildir:** Uygulama sipariş girme, fatura kesme, muhasebe fişi kaydetme gibi canlı işlemleri yapmaz; analiz ve keşif verisi üretir.
2. **Tek Kullanıcılı Masaüstü Aracıdır:** Eş zamanlı çok kullanıcılı canlı oturum (multi-tenant live collaboration) içermez; kullanıcılar projelerini `.erpcrm` dosyalarıyla paylaşır.
3. **Otomatik Karar Vermez:** Keşif Hazırlık Skoru matematiksel bir göstergedir; nihai canlıya geçiş onayı uzman proje liderlerine aittir.

---

## 9. Kullanıcı Onayı Gerektiren Yayın Adımları

Bu rapor yalnızca teknik ve dokümantasyonel **Release Readiness** (Yayın Hazırlığı) durumunu tespit eder. Gerçek sürüm dağıtımı için aşağıdaki adımlar kullanıcının (Selim Koçak) açık onayını bekler:

```bash
# 1. Git Tag oluşturma (yalnızca kullanıcı onayıyla)
git tag v0.1.4

# 2. Tag'i remote'a gönderme (Windows/macOS installer build'lerini tetikler)
git push origin v0.1.4

# 3. GitHub Release yayınlama (notlar ve installer paketleriyle)
```
