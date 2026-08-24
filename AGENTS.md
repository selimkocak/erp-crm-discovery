# ERP CRM Discovery — Geliştirici ve Ajan Giriş Sözleşmesi

Bu belge, **ERP CRM Discovery** projesinde görev alan tüm geliştiriciler, Antigravity IDE ajanları ve yapay zekâ asistanları için ortak, araçtan bağımsız ana giriş noktasıdır. Ayrıntılı kurallar, iş akışları, yetenekler ve politikalar için [.agents/agents.md](file:///.agents/agents.md) dosyasına başvurunuz.

---

## 1. Temel Mimari ve Ürün İlkeleri

* **Ürün Niteliği:** Tauri 2 (Rust) + React 18 + TypeScript + Yerel SQLite üzerinde çalışan, %100 çevrimdışı (offline-first), bağımsız masaüstü analiz ve keşif aracıdır.
* **Sıfır Dışa Veri Aktarımı (Zero-Egress):** Kullanıcı verileri, analizler, şirket profilleri veya kanıt dosyaları hiçbir koşulda harici bir buluta, API'ye veya yapay zekâ servisine gönderilemez.
* **AI İzolasyonu:** Gemini veya benzeri AI sistemleri geliştirme ortamının (Antigravity IDE) araçlarıdır; ERP CRM Discovery uygulamasının çalışma zamanı (runtime) bileşeni **değildir**. `src/` veya `src-tauri/` içine AI API çağrısı, API anahtarı yönetimi veya AI gateway eklenemez.
* **Tek Doğruluk Kaynağı:** Raporlama, metrikler ve veri hesaplamalarında UI, PDF ve DOCX çıktıları aynı kanonik veri modelini tüketir.

---

## 2. Ajan Davranış ve Geliştirme Kuralları

1. **Başlangıç İncelemesi:** Herhangi bir değişiklik yapmadan önce daima `git status --short`, aktif dal ve `HEAD` durumunu kontrol edin.
2. **Kullanıcı Değişikliklerinin Korunması:** Kullanıcıya ait mevcut çalışma ağacı değişiklikleri daima korunur; otomatik geri alınamaz veya ezilemez.
3. **Kapsam İzolasyonu:** Yalnızca açıkça talimatı verilen faza veya hata düzeltmesine odaklanın. Kapsam dışı refactor yapmayın; ilgisiz dosyalara dokunmayın.
4. **Tahribatlı (Destructive) Git Komutları Yasağı:** `git reset --hard`, force-push (`git push --force`) ve mevcut Git tag'lerini taşımak kesinlikle yasaktır.
5. **Yayın ve Tag Yetkisi:** Sürüm yükseltme, Git tag (`v*`) oluşturma ve GitHub Release açma işlemleri yalnızca kullanıcının açık talimatıyla yapılabilir. Normal `main` commit'leri installer (NSIS/DMG) üretmez.
6. **Dürüst Test ve Kalite İlkesi:** Üretim iş kuralını veya kullanıcı deneyimini yalnız eski/kırılgan bir testi geçirmek amacıyla geriye çevirmeyin. Hata durumunda gerçek üretim kusuru ile eski test beklentisini birbirinden ayırın.

---

## 3. Ayrıntılı Ajan Kontrol Mimarisi

Tüm geliştirme ajanları, rol tanımları, iş akışları, beceriler ve politikalar için proje içi kanonik dizini kullanın:

* **Ana Sözleşme:** [.agents/agents.md](file:///.agents/agents.md)
* **İş Akışları:** [.agents/workflows/](file:///.agents/workflows/)
* **Beceriler (Skills):** [.agents/skills/](file:///.agents/skills/)
* **Politikalar:** [.agents/policies/](file:///.agents/policies/)
* **Şablonlar:** [.agents/templates/](file:///.agents/templates/)
* **Mimari Karar Kaydı:** [docs/decisions/ADR-001-antigravity-agent-control-architecture.md](file:///docs/decisions/ADR-001-antigravity-agent-control-architecture.md)
