# İş Akışı: implement-phase

Bu iş akışı, onaylanmış yeni bir geliştirme fazının veya modülün **ERP CRM Discovery Ajan İşletim Sistemi** kurallarına tam uyumlu olarak uygulanması sürecini tanımlar.

---

## 1. Adım Adım Yürütme Sırası

```text
0. Bağlam Yükleme ve Preamble Beyanı (AGENTS.md → Policy → Skill → Workflow)
        ↓
1. Talimatı Oku & Kapsamı Çıkar
        ↓
2. Başlangıç Git Durumunu Al (`git status --short`, `git log -1`)
        ↓
3. İlgili Kodu İncele & Mevcut Tek Doğruluk Kaynaklarını Belirle
        ↓
4. En Küçük Dikey Dilimi Uygula (Clean, Focused Changes)
        ↓
5. İki Katmanlı Test & Doğrulama:
   a. Browser Test Harness (UI, Layout, Form Akışları)
   b. Tauri Desktop Smoke Test (`tsx test/fazXX_*_test.ts`)
        ↓
6. İlgili Regresyon Testlerini Çalıştır
        ↓
7. Derleme ve Statik Kontroller (`npm run build`, `cargo check`, `git diff --check`)
        ↓
8. Kanıt Toplama & Kabul Tablosu Hazırlama (Kanıtsız maddeler = UNVERIFIED)
        ↓
9. Kullanıcı Kabulüne Sun (Kullanıcı onayı olmadan Commit/Push YAPILMAZ)
        ↓
10. Kullanıcı Onayı Sonrası Atomik Commit & Push
```

---

## 2. Zorunlu Başlangıç Formatı (Preamble)

Ajan her görev başlangıcında şu beyanı üretir:

```text
Loaded:
- .agents/agents.md
- .agents/policies/testing-policy.md
- .agents/skills/targeted-testing/SKILL.md
- .agents/workflows/implement-phase.md

Selected workflow:
- implement-phase

Acceptance boundary:
- Browser Test Mode: <UI/Form/Navigasyon test kapsamı>
- Tauri Desktop: <SQLite/Managed Vault/Native File/Export kapsamı>
- Native features pending: <Yerel masaüstü doğrulama bekleyen maddeler>
```

---

## 3. Kurallar ve Kısıtlar

* **Önce Oku, Sonra Çalıştır:** İlgili politika ve beceri okunmadan kodlama veya test yapılamaz.
* **Kanıtsız Kabul Yasağı:** Test logu veya ölçüm kanıtı olmayan hiçbir çıktıya `PASS` yazılamaz; dürüstçe `UNVERIFIED` yazılır.
* **Mevcut Servislerin Yeniden Kullanımı:** Aynı işlevi gören paralel yardımcı fonksiyonlar veya servisler yazmayın; mevcut mimari katmanı ([src/db/client.ts](file:///src/db/client.ts), [src/report/builder.ts](file:///src/report/builder.ts), [src/infrastructure/repository/createRepository.ts](file:///src/infrastructure/repository/createRepository.ts)) kullanın.
* **İki Katmanlı Ayrım:** Tarayıcıda `BrowserTestRepository`, masaüstünde `TauriRepository` doğrulanmalıdır.

---

## 4. İlgili Belgeler

* [Kapsam Politikası](file:///.agents/policies/change-scope.md)
* [Test Politikası](file:///.agents/policies/testing-policy.md)
* [Uygulama Planı Şablonu](file:///.agents/templates/implementation-plan.md)
* [Kabul Raporu Şablonu](file:///.agents/templates/acceptance-report.md)
