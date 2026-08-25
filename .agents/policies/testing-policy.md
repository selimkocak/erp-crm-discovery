# Politika: testing-policy

Bu politika, **ERP CRM Discovery** deposundaki tüm birim, entegrasyon, kullanıcı arayüzü ve kabul testlerinde geçerli **çalışma zamanı zorunlu test protokolünü** belirler.

---

## 1. Temel Test İlkeleri ve Sınır Ayrımı

1. **Hedef Test Önceliği:** Değişiklik yapıldığında öncelikle ilgili fazın hedef testi (`test/fazXX_*_test.ts`) ve ardından regresyon testleri çalıştırılmalıdır.
2. **SKIPPED ≠ PASS:** Çalıştırılmayan veya atlanan (skipped) bir test asla "başarılı" (PASS) olarak raporlanamaz.
3. **İki Katmanlı Test Ayrımı (Dual-Layer Boundary):**
   * **Katman 1 — Browser Test Mode (FAZ-72 Harness):** 
     - Vite/Chrome ortamında `BrowserTestRepository` (`localStorage`) ile test edilir.
     - Kapsam: React bileşenleri, 10px responsive layout, soru-cevap navigasyonu, firma profili formları, dinamik sayaçlar ve rapor önizleme akışları.
     - Kanıt: Tarayıcı DOM doğrulaması, snapshot/log veya konsol hata denetimi (0 invoke hatası).
   * **Katman 2 — Tauri Desktop Smoke Test:** 
     - Node.js (`tsx`) veya yerel Tauri runtime (`cargo tauri dev / build`) ile test edilir.
     - Kapsam: SQLite tabloları, foreign key kısıtları, dosya sistemi yazma/okuma, Managed Attachment Vault, `.erpcrm` POSIX USTAR arşivleme, Word (.docx) ve Liberation Sans TrueType PDF (.pdf) binary üretimi.
     - Kanıt: Test runner logları (`npm test` / `tsx test/fazXX_*_test.ts`), SHA-256 doğrulama çıktıları.

4. **Kanıt-Odaklı Raporlama (Evidence-First):**
   - Raporlanan her doğrulama maddesi arkasında somut bir kanıt (terminal logu, assertion çıktısı veya layout ölçümü) taşımalıdır.
   - Kanıtı sunulamayan veya ortam gereği (örn. native OS save dialogu) çalıştırılamayan maddeler asla `PASS` yazılamaz; açıkça `UNVERIFIED` olarak mühürlenir.

5. **npm test Tek Başına Yeterli Değildir:**
   - `npm test`'in geçmesi yalnızca Node.js SQLite sözleşmelerini doğrular; tarayıcı/UI davranışını veya gerçek masaüstü görsel kabulünü tek başına kanıtlamaz.
   - Her rapor, hangi katmanın (Browser Harness vs Tauri Desktop) ne ölçüde doğrulandığını ayrı tabloda sunmalıdır.

6. **Kullanıcı Onayı Olmadan PASS / Commit / Push Yasağı:**
   - Bir fazın nihai kabulü yalnızca Ürün Sahibi (Selim Koçak) tarafından verilir. Ajan kendi kendine `Kabul tamamlandı` diyerek izinsiz `git commit` veya `git push` yapamaz.

7. **Dürüst Test İlkesi:**
   - Hata veren bir test assertion'ı, doğru iş mantığını veya veri kısıtını gevşetmek için değiştirilemez.
   - Gerçek üretim kusuru ile eski/kırılgan test beklentisi birbirinden dürüstçe ayrılmalıdır.

---

## 2. Test Kabul Tablosu Formatı

Her test veya faz raporunda aşağıdaki format zorunludur:

| Bileşen / Akış | Doğrulama Katmanı | Kanıt / Log | Durum |
| :--- | :--- | :--- | :--- |
| Soru Ekranı 10px Layout | Browser Test Harness | Computed layout (sol: 10px, sağ: viewport-10px) | PASS |
| Soru-Cevap & localStorage | Browser Test Harness | BrowserTestRepository test verisi | PASS |
| SQLite Şema & FK Kısıtı | Tauri Desktop / Node | `tsx test/fazXX_test.ts` (0 FAIL) | PASS |
| Native File Save Dialog | Tauri Desktop | Yerel işletim sistemi doğrulama | UNVERIFIED |

---

## 3. İlgili Belgeler

* [Hedefli Test Becerisi](file:///.agents/skills/targeted-testing/SKILL.md)
* [Masaüstü Görsel Kabul Becerisi](file:///.agents/skills/ui-visual-acceptance/SKILL.md)
* [Kabul Raporu Şablonu](file:///.agents/templates/acceptance-report.md)
