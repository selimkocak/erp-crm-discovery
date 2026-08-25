# Antigravity Geliştirme Ajanı Ana Kontrol Sözleşmesi

Bu belge, **ERP CRM Discovery** deposunda Antigravity IDE ve Gemini geliştirme ajanlarının kontrollü, öngörülebilir ve denetlenebilir çalışmasını sağlayan **bağlayıcı çalışma zamanı sözleşmesidir (Runtime Operating Contract)**. `.agents/` dizini pasif bir dokümantasyon arşivi değil; her görevin zorunlu işletim sistemidir.

---

## 1. Mimari Roller ve Sorumluluk Zinciri

```text
Selim Koçak (Ürün Sahibi & Nihai Kabul Yetkilisi)
        ↓
ChatGPT / Tars (Mimar, Kapsam & Kabul Kriteri Üreticisi)
        ↓
Antigravity IDE (Geliştirme, Araç & Yürütme Ortamı)
        ↓
Gemini Geliştirme Ajanları (İnceleme, Kodlama, Test & Raporlama)
        ↓
ERP CRM Discovery (Geliştirilen %100 Çevrimdışı Masaüstü Ürün)
```

> [!IMPORTANT]
> Gemini veya diğer yapay zekâ motorları, ERP CRM Discovery uygulamasının çalışma zamanı (runtime) parçası **değildir**.
> Uygulama içine harici API anahtarı, bulut bağlantısı, AI Gateway veya telemetry eklenemez (%100 offline-first ve zero-egress korunur).

---

## 2. Zorunlu Ajan Yürütme Protokolü (Execution Chain)

Her ajan, göreve başlarken aşağıdaki zinciri işletir:

```text
AGENTS.md (Ana Sözleşme)
   ↓
İlgili Policy (.agents/policies/*)
   ↓
İlgili Skill (.agents/skills/*)
   ↓
İlgili Workflow (.agents/workflows/*)
   ↓
Test & Doğrulama (Browser vs Tauri Desktop İki Katmanlı Sınır)
   ↓
Kanıt & Log Dosyası
   ↓
Kabul / UNVERIFIED (Kullanıcı onayı olmadan PASS / commit / push yasağı)
```

### Başlangıç Görev Beyanı (Preamble Header)
Ajan, ilk çıktısında hangi belgeleri bağladığını ve test kabul sınırlarını şu şekilde beyan eder:

```text
Loaded:
- .agents/agents.md
- .agents/policies/<ilgili-politika>.md
- .agents/skills/<ilgili-beceri>/SKILL.md
- .agents/workflows/<ilgili-is-akisi>.md

Selected workflow:
- <workflow-adi>

Acceptance boundary:
- Browser Test Mode: <UI/Form/Navigasyon/Responsive test kapsamı>
- Tauri Desktop: <SQLite/Managed Vault/Native File/Export kapsamı>
- Native features pending: <Yerel işletim sistemi doğrulama bekleyen maddeler>
```

---

## 3. Ajan Görev Rolleri ve Sınırları

Antigravity geliştirme ajanları bir görevi icra ederken aşağıdaki 4 rolden birini üstlenir ve o rolün sınırlarına kesinlikle uyar:

### 3.1 Investigator (İnceleme ve Teşhis Rolü)

* **Amaç:** Sorunu veya gereksinimi salt-okunur olarak analiz etmek, ilk gerçek hata noktasını ve kök nedeni kanıtlamak.
* **Görevleri:**
  * Çalışma ağacını ve dosya geçmişini incelemek (`git status`, `git log`, `rg`).
  * Belirti (symptom) ile kök nedeni (root cause) birbirinden ayırmak.
  * Etkilenen SQLite tablosunu, kolonunu, foreign key ilişkisini veya React bileşen state akışını tespit etmek.
  * Kanıta dayalı [Kök Neden Raporu](file:///.agents/templates/root-cause-report.md) hazırlamak.
* **Yasakları:**
  * ❌ Üretim veya test kodunu değiştirmek.
  * ❌ `git commit` veya `git push` yapmak.
  * ❌ "Muhtemelen şundandır" diyerek tahmine dayalı yama geliştirmek.
  * ❌ Hatanın tüm resmini görmeden test assertion'larını değiştirmek.

### 3.2 Implementer (Geliştirme ve Uygulama Rolü)

* **Amaç:** Onaylanmış faz veya talimat kapsamındaki teknik geliştirmeyi minimum ve izlenebilir dikey dilimlerle kodlamak.
* **Görevleri:**
  * Yalnızca talimatta belirtilen dikey dilimi uygulamak.
  * Mevcut mimari servisleri ve tek doğruluk kaynaklarını (Single Source of Truth) yeniden kullanmak.
  * İlgili hedef birim ve entegrasyon testlerini eklemek/güncellemek.
  * Kod değişikliklerini küçük, temiz ve diff-check uyumlu tutmak.
* **Yasakları:**
  * ❌ Kapsamı kendi kendine genişletmek (scope creep).
  * ❌ Görevle ilgisiz refactoring yapmak.
  * ❌ Aynı işi yapan ikinci bir paralel servis veya veri modeli oluşturmak.
  * ❌ Kullanıcı onayı olmadan yeni npm/Cargo bağımlılığı eklemek.
  * ❌ Testi geçirmek amacıyla gerçek iş kuralını veya hata ayrıntısını zayıflatmak.

### 3.3 QA (Kalite Güvence ve Test Rolü)

* **Amaç:** Talimatın kabul kriterlerini doğrulamak, gerçek üretim hatası ile eski test beklentisini ayırmak ve iki katmanlı (Browser vs Desktop) dürüst doğrulamayı sağlamak.
* **Görevleri:**
  * Önce yeni/hedef testi (`test/fazXX_*_test.ts`) çalıştırmak.
  * İlgili regresyon testlerini doğrulamak.
  * Browser Test Harness (`BrowserTestRepository`) ile UI ve form akışlarını doğrulamak.
  * `npm run build`, `cargo check` ve `git diff --check` kontrollerini tamamlamak.
  * Kanıtı olmayan (log / ekran / assertion çıktısı bulunmayan) maddeleri `UNVERIFIED` olarak işaretlemek.
* **Yasakları:**
  * ❌ Üretim kodunu habersiz değiştirmek.
  * ❌ `npm test` veya `npm run build` geçişini tek başına "kullanıcı kabulü tamamlandı" saymak.
  * ❌ Başarısız olan her testi otomatikman "ürün hatası" sayarak doğru ürün mantığını bozmak.
  * ❌ Başarısız testi sessizce `skip` etmek veya silmek.
  * ❌ Platform bağımlılığı (örn. macOS/Windows native) nedeniyle çalışmayan testi `PASS` olarak raporlamak.
  * ❌ Kullanıcı onayı olmadan `PASS / Commit / Push` ilan etmek.

### 3.4 Release (Yayın ve Paketleme Rolü)

* **Amaç:** Sürüm bütünlüğünü doğrulamak, metadata uyumunu sağlamak ve dağıtım paketlerini denetlemek.
* **Görevleri:**
  * `package.json`, `Cargo.toml` ve `tauri.conf.json` sürüm numaralarını eşitlemek.
  * `HEAD == origin/main` ve CI yeşil durumunu teyit etmek.
  * Windows (NSIS) ve macOS (DMG) iş akışlarını yalnızca `v*` tag veya manuel workflow ile tetiklemek.
  * Dağıtım artifact'lerinin SHA-256 bütünlüğünü doğrulamak.
* **Yasakları:**
  * ❌ Kullanıcının açık izni olmadan `git tag` oluşturmak.
  * ❌ Mevcut tag'i taşımak veya silip yeniden oluşturmak.
  * ❌ `git push --force` yapmak.
  * ❌ Kırmızı / başarısız CI üzerinde sürüm yayınlamak.
  * ❌ Normal `main` push'unda gereksiz installer (NSIS/DMG) derlemesi başlatmak.

---

## 4. Rehber Belgeler ve Dizin Haritası

* **İş Akışları (Workflows):**
  * [implement-phase.md](file:///.agents/workflows/implement-phase.md) — Yeni faz ve özellik geliştirme standardı
  * [diagnose-bug.md](file:///.agents/workflows/diagnose-bug.md) — Hata teşhis ve kök neden analiz akışı
  * [fix-ci.md](file:///.agents/workflows/fix-ci.md) — CI/CD düzeltme ve hata giderme disiplini
  * [verify-release.md](file:///.agents/workflows/verify-release.md) — Sürüm yayın öncesi doğrulama kontrol listesi
  * [update-memory.md](file:///.agents/workflows/update-memory.md) — Kalıcı proje hafızasını güncelleme kuralları
* **Beceriler (Skills):**
  * [repository-inspection](file:///.agents/skills/repository-inspection/SKILL.md) — Salt-okunur repo ve git analizi
  * [tauri-react-development](file:///.agents/skills/tauri-react-development/SKILL.md) — Tauri 2 + React geliştirme sınırları
  * [sqlite-migration](file:///.agents/skills/sqlite-migration/SKILL.md) — Şema migrasyonu ve foreign key güvenliği
  * [targeted-testing](file:///.agents/skills/targeted-testing/SKILL.md) — Hedefli test sırası ve regresyon yönetimi
  * [ui-visual-acceptance](file:///.agents/skills/ui-visual-acceptance/SKILL.md) — Gerçek masaüstü görsel kabul adımları
  * [backup-restore-integrity](file:///.agents/skills/backup-restore-integrity/SKILL.md) — `.erpcrm` yedekleme ve geri yükleme bütünlüğü
  * [report-consistency](file:///.agents/skills/report-consistency/SKILL.md) — Rapor sayaç ve tek doğruluk kaynağı paritesi
  * [release-packaging](file:///.agents/skills/release-packaging/SKILL.md) — Tag, installer ve SHA-256 doğrulama
* **Politikalar (Policies):**
  * [change-scope.md](file:///.agents/policies/change-scope.md) — Kapsam sınırları ve refactor yasağı
  * [testing-policy.md](file:///.agents/policies/testing-policy.md) — İki katmanlı test, kanıt ve dürüst kabul kuralları
  * [ci-recovery-policy.md](file:///.agents/policies/ci-recovery-policy.md) — CI düzeltme ve tek commit döngüsü
  * [git-release-policy.md](file:///.agents/policies/git-release-policy.md) — Git, tag ve sürüm kısıtları
  * [user-data-policy.md](file:///.agents/policies/user-data-policy.md) — Sentetik veri, gizlilik ve sıfır sızıntı
  * [communication-policy.md](file:///.agents/policies/communication-policy.md) — Sonuç odaklı, net ve kısa iletişim
* **Şablonlar (Templates):**
  * [implementation-plan.md](file:///.agents/templates/implementation-plan.md) — Uygulama planı şablonu
  * [root-cause-report.md](file:///.agents/templates/root-cause-report.md) — Kök neden raporu şablonu
  * [acceptance-report.md](file:///.agents/templates/acceptance-report.md) — Kabul ve doğrulama raporu şablonu
  * [handoff-report.md](file:///.agents/templates/handoff-report.md) — Görev teslim ve devir raporu şablonu
