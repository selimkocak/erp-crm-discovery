# Politika: change-scope

Bu politika, geliştirme ajanlarının kod ve dosya değişikliklerinde uymak zorunda olduğu kesin kapsam sınırlarını belirler.

---

## 1. Kapsam Sınırları ve Kural Maddeleri

1. **Yalnızca Talimat Kapsamı:** Ajan, yalnızca kullanıcı veya mimar talimatında açıkça belirtilen dosyalara ve dikey dilime dokunabilir.
2. **Yetkisiz Refactoring Yasağı:** Görevle doğrudan ilgisi olmayan modülleri, bileşenleri veya stil dosyalarını "iyileştirme" gerekçesiyle değiştirmek kesinlikle yasaktır.
3. **Kapsam Dışı Hataların Raporlanması:** Görev sırasında kapsam dışı başka bir hata fark edilirse, bu hata anında aynı commit'e eklenmez; durum tespit edilip kullanıcıya raporlanır.
4. **Üretilen (Generated) Dosyaların Durumu:** Kod üreticileri (`scripts/generate_business_functions.mjs` vb.) tarafından üretilen dosyalar (`src/generated/...`), yalnızca veri tabanında veya şemada gerçek bir içerik değişikliği olduğunda commit edilir.
5. **Kullanıcı Çalışma Ağacının Korunması:** Kullanıcıya ait commit edilmemiş veya yerel değişiklikler daima korunur; otomatik geri alınamaz ya da ezilemez.
6. **Bağımlılık İzolasyonu:** Projeye yeni bir npm paketi veya Rust crate'i eklemek kullanıcının açık onayına bağlıdır.

---

## 2. İlgili Belgeler

* [Uygulama İş Akışı](file:///.agents/workflows/implement-phase.md)
* [Git ve Sürüm Politikası](file:///.agents/policies/git-release-policy.md)
