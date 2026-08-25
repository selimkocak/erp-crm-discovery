# ERP CRM Discovery — Ajan İşletim Sistemi ve Giriş Sözleşmesi

Bu belge, **ERP CRM Discovery** deposunda görev alan tüm Antigravity IDE ajanları, Gemini modelleri ve insan geliştiriciler için **çalışma zamanı ana kontrol düzlemidir (Runtime Control Plane)**. Depodaki `.agents/` dizini pasif bir dokümantasyon deposu değil; her ajan görevinin bağlayıcı işletim sistemidir.

---

## 1. Zorunlu Ajan Yürütme Protokolü (Execution Chain)

Her ajan, bir görevi veya test adımını başlatmadan önce aşağıdaki kontrol zincirini **sırayla işletmek ve başlangıç çıktısında beyan etmekle yükümlüdür**:

```text
AGENTS.md (Ana Giriş Sözleşmesi)
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

### Başlangıç Görev Beyanı (Mandatory Task Preamble)
Bir ajan göreve veya test aşamasına başlarken ilk çıktısı şu formatı taşımalıdır:

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

## 2. Temel Mimari ve Ürün İlkeleri

* **Ürün Niteliği:** Tauri 2 (Rust) + React 18 + TypeScript + Yerel SQLite üzerinde çalışan, %100 çevrimdışı (offline-first), bağımsız masaüstü analiz ve keşif aracıdır.
* **Sıfır Dışa Veri Aktarımı (Zero-Egress):** Kullanıcı verileri, analizler, şirket profilleri veya kanıt dosyaları hiçbir koşulda harici bir buluta, API'ye veya yapay zekâ servisine gönderilemez.
* **AI İzolasyonu:** Gemini veya benzeri AI sistemleri geliştirme ortamının (Antigravity IDE) araçlarıdır; ERP CRM Discovery uygulamasının çalışma zamanı (runtime) bileşeni **değildir**. `src/` veya `src-tauri/` içine AI API çağrısı, API anahtarı yönetimi veya AI gateway eklenemez.
* **İki Katmanlı Test Ayrımı:**
  1. **Browser Test Mode (FAZ-72):** Tarayıcı/Chrome ortamında `BrowserTestRepository` + `localStorage` ile IPC hatası olmadan çalışan reaktif kullanıcı akışları.
  2. **Tauri Desktop Smoke Test:** `TauriRepository` + SQLite, yerel dosya sistemi, managed attachment vault ve native dialogların doğrulandığı masaüstü ortamı.
* **Tek Doğruluk Kaynağı:** Raporlama, metrikler ve veri hesaplamalarında UI, PDF ve DOCX çıktıları aynı kanonik veri modelini tüketir.

---

## 3. Ajan Davranış ve Geliştirme Kuralları

1. **Başlangıç İncelemesi:** Herhangi bir değişiklik yapmadan önce daima `git status --short`, aktif dal ve `HEAD` durumunu kontrol edin.
2. **Kullanıcı Değişikliklerinin Korunması:** Kullanıcıya ait mevcut çalışma ağacı değişiklikleri daima korunur; otomatik geri alınamaz veya ezilemez.
3. **Kapsam İzolasyonu:** Yalnızca açıkça talimatı verilen faza veya hata düzeltmesine odaklanın. Kapsam dışı refactor yapmayın; ilgisiz dosyalara dokunmayın.
4. **Tahribatlı (Destructive) Git Komutları Yasağı:** `git reset --hard`, force-push (`git push --force`) ve mevcut Git tag'lerini taşımak kesinlikle yasaktır.
5. **Yayın ve Tag Yetkisi:** Sürüm yükseltme, Git tag (`v*`) oluşturma ve GitHub Release açma işlemleri yalnızca kullanıcının açık talimatıyla yapılabilir. Normal `main` commit'leri installer (NSIS/DMG) üretmez.
6. **Dürüst Test ve Kalite İlkesi:** 
   - `npm test` tek başına eksiksiz kabul kanıtı sayılmaz; ortam sınırı (Browser vs Desktop) açıkça belirtilmelidir.
   - Kanıtı (log, assertion çıktısı veya ekran durumu) bulunmayan maddeler `UNVERIFIED` olarak işaretlenmelidir.
   - Kullanıcının açık onayı olmadan `PASS / Commit / Push` işlemi yapılamaz.

---

## 4. Ayrıntılı Ajan Kontrol Mimarisi

* **Ana Sözleşme:** [.agents/agents.md](file:///.agents/agents.md)
* **İş Akışları:** [.agents/workflows/](file:///.agents/workflows/)
* **Beceriler (Skills):** [.agents/skills/](file:///.agents/skills/)
* **Politikalar:** [.agents/policies/](file:///.agents/policies/)
* **Şablonlar:** [.agents/templates/](file:///.agents/templates/)
* **Mimari Karar Kaydı:** [docs/decisions/ADR-001-antigravity-agent-control-architecture.md](file:///docs/decisions/ADR-001-antigravity-agent-control-architecture.md)
