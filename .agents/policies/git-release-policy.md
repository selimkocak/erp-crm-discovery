# Politika: git-release-policy

Bu politika, Git sürüm kontrolü, commit disiplini, tag oluşturma ve yayın süreçlerindeki kesin kuralları belirler.

---

## 1. Git ve Commit Standartları

1. **Yıkıcı Komutlar Yasağı:** `git reset --hard`, destructive checkout (`git checkout -f`) ve `git push --force` komutları kesinlikle yasaktır.
2. **Kapsamlı ve Temiz Commit:** Commit'e yalnızca ilgili göreve veya faza ait dosyalar dahil edilir.
3. **Standart Commit Mesajları:** Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) formatına uymalıdır (`feat(...)`, `fix(...)`, `docs(...)`, `test(...)`, `refactor(...)`).
4. **Tag Taşıma Yasağı:** Bir kere oluşturulan Git tag'i (`git tag -a vX.Y.Z`) asla silinip başka bir commite taşınamaz.

---

## 2. Yayın ve Paketleme Standartları

1. **Açık Kullanıcı Onayı:** Sürüm etiketi (`v*`) oluşturmak veya GitHub Release açmak yalnızca kullanıcının açık talimatıyla mümkündür.
2. **Normal Push Sınırı:** `main` dalına yapılan normal commit ve push işlemleri ağır installer (Windows NSIS / macOS DMG) derlemelerini **tetiklemez**.
3. **Yayın Öncesi Doğrulama:** Tag oluşturulmadan önce `HEAD == origin/main` eşitliği, sürüm numaralarının senkronizasyonu ve Linux CI yeşil durumu teyit edilmiş olmalıdır.
4. **Bütünlük Denetimi:** Üretilen her sürüm paketi için SHA-256 sağlama toplamı dosyası oluşturulmalıdır.

---

## 3. İlgili Belgeler

* [Yayın Doğrulama İş Akışı](file:///.agents/workflows/verify-release.md)
* [Release Paketleme Becerisi](file:///.agents/skills/release-packaging/SKILL.md)
