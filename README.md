# ERP CRM Discovery

> **"ERP projesi yazılımla değil, doğru soruyla başlar."**  
> *(An ERP project starts with the right questions, not the software.)*

**ERP CRM Discovery**, kurumsal dönüşüm ve yazılım geçiş süreçleri öncesinde; süreç danışmanları, proje yöneticileri ve analistlerin saha ihtiyaçlarını sistematik, yapılandırılmış ve tekrar kullanılabilir biçimde toplamalarını sağlayan **ücretsiz, açık kaynaklı ve %100 çevrimdışı (offline-first)** masaüstü ön analiz uygulamasıdır.

Bu ürün bir ERP/CRM transactional operasyon yazılımı **değildir**; kurumsal dönüşümün başlangıcındaki keşif (discovery), olgunluk değerlendirmesi, kapsam belirleme, darboğaz/risk tespiti ve şartname hazırlık aşamalarını dijitalleştiren tarafsız (vendor-neutral) bir süreç analiz aracıdır.

---

## Temel Özellikler (Features)

- **31 Standart İş Fonksiyonu Kataloğu:** Satış, Satın Alma, Üretim Planlama, Depo, Kalite, Muhasebe, Finans, İK ve BT altyapısı dahil 31 standart kurumsal süreç alanı.
- **Deklaratif Soru Paketi Motoru (Question Engine):** Kod yazmadan, tamamen açık JSON şeması ile genişletilebilir soru paketleri. Tekli seçim, çoklu seçim, açık uçlu metin, seçenek bazlı özel notlar ve genel görüşme notları.
- **Dinamik Koşullu Dallanma (Branching):** Şirketin yapısına göre ilgili olmayan soruları dinamik olarak gizleyen akıllı soru akışı.
- **Analiz Semantik Katmanı:** Ham soru-cevapların ötesinde yapılandırılmış **Bulgu (Finding)**, **Gereksinim (Requirement)**, **Risk** ve **Proje Notu** yönetimi.
- **Kesintisiz Çalışma (Offline Persistence):** Gömülü yerel SQLite veritabanı, otomatik kaydetme (debounced autosave) ve uygulamayı kapatıp açınca kaldığı yerden devam edebilme.
- **Profesyonel Dışa Aktarım (DOCX & PDF):**
  - **Microsoft Word (.docx):** Tamamen düzenlenebilir kurumsal başlık hiyerarşisi, renkli tablolar ve risk kartları.
  - **PDF (.pdf):** Yerel gömülü Liberation Sans TrueType fontu ile %100 kayıpsız Türkçe Unicode desteği ve seçilebilir/aranabilir vektörel metin.
- **Yerel İşletim Sistemi Entegrasyonu:** Web indirme hack'leri yerine Tauri 2 Native Save Dialog ve doğrudan diske ikili yazma.

---

## Gizlilik ve Güvenlik İlkeleri (Privacy by Design)

- 🔒 **Sıfır Bulut Bağımlılığı (Zero Cloud / Offline-First):** Şirket ticari sırları, süreç zayıflıkları ve analiz verileri **yalnızca** kullanıcının kendi bilgisayarındaki yerel SQLite veritabanında saklanır.
- 🚫 **Telemetri ve Analitik Yok:** Uygulama hiçbir harici sunucuya kullanım istatistiği, analitik veya telemetri verisi göndermez.
- 🚫 **Kullanıcı Hesabı / Kayıt Zorunluluğu Yok:** Doğrudan indir, kur ve çevrimdışı çalış.
- 🛡️ **En Az Ayrıcalık (Least Privilege):** Tauri güvenlik modelinde harici ağ erişimi (`http`/`fetch`) tamamen kapatılmıştır.

---

## Teknoloji Altyapısı (Technology Stack)

```text
Frontend:         React 18 / TypeScript 5.x / Vite 6.x / Vanilla CSS (Design Tokens)
Desktop Engine:   Tauri 2 (Rust)
Database:         Lokal SQLite (@tauri-apps/plugin-sql / sqlx)
Native I/O:       @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs
Reporting:        docx (npm), jsPDF + jsPDF-AutoTable (Embedded TrueType Fonts)
Icons:            Lucide React
```

---

## Geliştirici Kurulumu (Development Setup)

Projeyi yerel Linux veya Windows makinenizde geliştirmek için:

### Önkoşullar
- **Node.js:** `v20.x LTS`
- **Rust Toolchain:** `1.80+` (ve ilgili platform derleme araçları)

### Komutlar
```bash
# 1. Depoyu klonlayın ve bağımlılıkları yükleyin
npm ci

# 2. Kanonik iş fonksiyonlarını derleyin
npm run generate

# 3. Test suitini çalıştırın (354 test)
npm test

# 4. Web frontend'ini derleyin
npm run build

# 5. Rust backend denetimini yapın
cargo check --manifest-path src-tauri/Cargo.toml

# 6. Geliştirme sunucusunu başlatın
npm run tauri dev
```

---

## Soru Paketleri ve Açık Kaynak Katkı Modeli (Question Packs)

Bu projenin temel felsefesi:  
> **"Bir ERP danışmanının soru paketi geliştirmek için Rust veya React bilmesi gerekmez."**

Süreç uzmanları yalnızca [`question-packs/`](question-packs/) dizini altındaki standart JSON şemasına uygun dosyaları düzenleyerek veya yeni sektörel paketler (örn: Otomotiv, Tekstil, Perakende) ekleyerek projeye katkı sağlayabilir.

Detaylı şema kılavuzu için: [`docs/QUESTION_PACK_SCHEMA_V1.md`](docs/QUESTION_PACK_SCHEMA_V1.md)  
Katkı kuralları için: [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## Dağıtım ve Windows Durumu (Windows Distribution)

- **Birincil Hedef:** Windows 11 x64 / Windows 10 x64.
- **Paketleme Formatı:** NSIS Setup Executable (`ERP-CRM-Discovery_0.1.0_x64-setup.exe`).
- **Mevcut Durum:** `v0.1.0 Release Candidate 1` (Windows native acceptance aşamasında).
- **Kurulum Rehberi:** [`docs/WINDOWS_BUILD_RELEASE.md`](docs/WINDOWS_BUILD_RELEASE.md)
- **Kabul Kontrol Listesi:** [`docs/WINDOWS_RC_ACCEPTANCE_CHECKLIST.md`](docs/WINDOWS_RC_ACCEPTANCE_CHECKLIST.md)

---

## Lisans (License)

- **Uygulama Kaynak Kodu:** [MIT License](LICENSE) — Copyright (c) 2026 ERP CRM Discovery Contributors.
- **Gömülü Liberation Sans Fontu:** GNU GPL v2 + Font Exception ([`licenses/FONT_LICENSE.txt`](licenses/FONT_LICENSE.txt)).
- **Üçüncü Taraf Bildirimleri:** [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
