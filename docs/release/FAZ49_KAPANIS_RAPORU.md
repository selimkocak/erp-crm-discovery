# ERP CRM Discovery — FAZ-49 v0.1.0 Kararlı Sürüm Kapanış Raporu

---

## 1. Faz Özeti

* **Faz:** FAZ-49 — v0.1.0 Kararlı Sürüm (Stable Release)
* **Sürüm:** `v0.1.0` (Kararlı Sürüm — Stable / Latest)
* **Geliştirici & Bakımcı:** Selim Koçak (`selimkocak@gmail.com`)
* **Lisans:** MIT Lisansı

---

## 2. Külliyat ve Teknik Metrikler

* **Kanonik İş Fonksiyonları:** **33 Fonksiyon (%100 Kapsama)**
* **Kanonik Soru Paketleri:** **34 Paket** (33 Dikey Süreç + 1 Temel Eğitim Paketi)
* **Toplam Soru Sayısı:** **1.492 Soru**
  * **Zorunlu Sorular:** 792 Soru (%53.1)
  * **Opsiyonel Sorular:** 700 Soru (%46.9)
  * **Koşullu Dallanma (Branching):** 213 Soru (%14.3)
* **Otomasyon Test Süiti:** **71 Test Paketi (2.120+ Test %100 PASS)**
* **Veritabanı Mimarisi:** SQLite Migration v11 (25 Tablo — `schema_migrations` ve Transaction/Rollback korumalı)
* **Yönetişim Katmanı:** 23 Kanonik Yönetişim Nesnesi, RACI, Efektif Sapma Analizi ve SoD Risk Matrisi
* **Saha Pilotu:** `[KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş.` (20 Süreç, 860 Soru Cevabı, 15 Kritik Problem, UAT ve Go-Live Değerlendirmesi)

---

## 3. Dağıtım Varlıkları (Release Assets)

1. `ERP-CRM-Discovery_0.1.0_x64-setup.exe` (Windows NSIS Kurulum Yükleyicisi)
2. `WINDOWS_KURULUM_YARDIMI.txt` (Windows Kurulum Kılavuzu)
3. `WINDOWS_SHA256SUMS.txt` (Windows SHA-256 Sağlama Dosyası)
4. `ERP-CRM-Discovery_0.1.0_aarch64.dmg` (macOS Apple Silicon Kurulum İmajı)
5. `ERP CRM Discovery.app.tar.gz` (macOS Taşınabilir Paket)
6. `MACOS_KURULUM_YARDIMI.txt` (macOS Kurulum Kılavuzu)
7. `MACOS_SHA256SUMS.txt` (macOS SHA-256 Sağlama Dosyası)

---

## 4. Çoklu Platform Kalite ve CI Onayı

| Hat / İş Akışı | Platform | Çıktı / Paket | Durum |
|:---|:---:|:---:|:---:|
| **Linux CI** | Ubuntu 22.04 | Test, Lint & Bundle (71/71 PASS) | **PASS (✓)** |
| **Windows NSIS Build** | Windows Server 2022 | PE32+ NSIS Installer (.exe) | **PASS (✓)** |
| **macOS Apple Silicon Build** | macOS 14 (arm64) | Mach-O arm64 DMG (.dmg) | **PASS (✓)** |

---

## 5. Bilinen Sınırlamalar (Known Limitations)

1. **Kod İmzası:** Windows ve macOS paketleri ticari sertifika ile imzalanmamıştır; ilk açılışta işletim sistemi güvenlik onayları gerekebilir.
2. **macOS Mimarisi:** Hazır paketler Apple Silicon (M1/M2/M3/M4) arm64 mimarisine yöneliktir; Intel Mac kullanıcıları kaynak koddan derleyebilir.
3. **Danışmanlık Sınırı:** ERP CRM Discovery tarafsız bir saha keşif ve teşhis aracıdır; yazılım seçimi veya kurumsal kararları otomatik olarak almaz.
