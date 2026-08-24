# Politika: testing-policy

Bu politika, depodaki tüm birim, entegrasyon ve kabul testlerinin yazımı ve icrasında geçerli dürüstlük ve verimlilik kurallarını belirler.

---

## 1. Test İlkeleri ve Kurallar

1. **Hedef Test Önceliği:** Değişiklik yapıldığında öncelikle ilgili fazın hedef testi (`test/fazXX_*_test.ts`) çalıştırılmalıdır.
2. **Testin Kanıtladığı Değer:** Her test assertion'ı, arkasındaki iş mantığını veya veri kısıtını net bir Türkçe mesajla ifade etmelidir (`✓ T01: ...`).
3. **SKIPPED ≠ PASS:** Çalıştırılmayan veya atlanan (skipped) bir test asla "başarılı" (PASS) olarak raporlanamaz.
4. **Platform Bağımlılığı Ayrımı:** Test ortamında native bir işletim sistemi bileşeni (örn. Windows shell, macOS dialog) yoksa, bu durum "test çalıştırılamadı / yerel masaüstü kontrolü gerekiyor" olarak dürüstçe raporlanır.
5. **Dinamik vs Kırılgan Assertion:** Testlerde toplam tablo sayısı, toplam soru sayısı veya migrasyon sayısı gibi değerler mümkün olduğunca dinamik olarak (`MIGRATION_DEFINITIONS.length`, `BUSINESS_FUNCTION_REGISTRY.length`) türetilmelidir.
6. **Davranış Odaklı Testler:** Kaynak dosya metninde harfiyen string arayan kırılgan testler yerine, fonksiyon çıktısını, dönen veri modelini ve veritabanı durumunu doğrulayan sözleşme testleri tercih edilmelidir.
7. **Bütünlük Koruma:** Hiçbir test, geçmesini sağlamak amacıyla üretimdeki doğru bir veri doğrulama kuralını veya hata denetimini gevşetemez.

---

## 2. İlgili Belgeler

* [Hedefli Test Becerisi](file:///.agents/skills/targeted-testing/SKILL.md)
* [CI İyileştirme Politikası](file:///.agents/policies/ci-recovery-policy.md)
* [Kabul Raporu Şablonu](file:///.agents/templates/acceptance-report.md)
