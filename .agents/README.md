# .agents — Antigravity Geliştirme Ajanı Altyapısı

Bu dizin, **ERP CRM Discovery** projesinde görev alan Antigravity IDE ve Gemini geliştirme ajanlarının mimari yapısını, rol ayrımlarını, iş akışlarını, becerilerini ve politikalarını içerir.

---

## 1. Dizin Organizasyonu

```text
.agents/
├── agents.md          # Ana ajan sözleşmesi ve rol tanımları
├── README.md          # Bu genel bakış dosyası
├── workflows/         # Standart geliştirme, hata giderme ve yayın iş akışları
│   ├── implement-phase.md
│   ├── diagnose-bug.md
│   ├── fix-ci.md
│   ├── verify-release.md
│   └── update-memory.md
├── skills/            # Göreve özel beceri talimatları (YAML frontmatter'lı SKILL.md)
│   ├── repository-inspection/
│   │   └── SKILL.md
│   ├── tauri-react-development/
│   │   └── SKILL.md
│   ├── sqlite-migration/
│   │   └── SKILL.md
│   ├── targeted-testing/
│   │   └── SKILL.md
│   ├── ui-visual-acceptance/
│   │   └── SKILL.md
│   ├── backup-restore-integrity/
│   │   └── SKILL.md
│   ├── report-consistency/
│   │   └── SKILL.md
│   └── release-packaging/
│       └── SKILL.md
├── policies/          # Bağlayıcı davranış ve güvenlik politikaları
│   ├── change-scope.md
│   ├── testing-policy.md
│   ├── ci-recovery-policy.md
│   ├── git-release-policy.md
│   ├── user-data-policy.md
│   └── communication-policy.md
└── templates/         # Standart raporlama ve planlama şablonları
    ├── implementation-plan.md
    ├── root-cause-report.md
    ├── acceptance-report.md
    └── handoff-report.md
```

---

## 2. Temel İlkeler

1. **Tek Kanonik Dizin:** Antigravity için tek proje içi ajan dizini `.agents/`'tir. Depoda `.agent/` gibi paralel dizinler barındırılmaz.
2. **Kapsam İzolasyonu:** Ajanlar kendilerine verilen faza odaklanır; yetkisiz refactor veya bağımlılık ekleme yapmaz.
3. **Masaüstü ve Çevrimdışı Güvencesi:** Uygulama %100 çevrimdışı, sıfır bulut bağımlılıklı ve AI içermeyen bir masaüstü aracıdır. Ajan altyapısı uygulamaya runtime AI eklemez.
4. **Denetlenebilir ve Dürüst Test:** Hedef testler önceliklidir; SKIPPED durumlar asla PASS sayılmaz; gerçek ürün hatası ile eski test beklentisi açıkça ayrıştırılır.
