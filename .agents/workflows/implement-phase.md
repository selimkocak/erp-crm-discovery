# İş Akışı: implement-phase

Bu iş akışı, onaylanmış yeni bir geliştirme fazının veya modülün repository içinde uygulanması sürecini tanımlar.

---

## 1. Adım Adım Yürütme Sırası

```text
1. Talimatı Oku & Kapsamı Çıkar
        ↓
2. Başlangıç Git Durumunu Al (`git status --short`, `git log -1`)
        ↓
3. İlgili Kodu İncele & Mevcut Tek Doğruluk Kaynaklarını Belirle
        ↓
4. En Küçük Dikey Dilimi Uygula (Clean, Focused Changes)
        ↓
5. Hedef Testi Çalıştır (`npx tsx test/fazXX_*_test.ts`)
        ↓
6. İlgili Regresyon Testlerini Çalıştır
        ↓
7. Derleme ve Statik Kontroller (`npm run build`, `cargo check`, `git diff --check`)
        ↓
8. Değişen Dosyaları ve Test Sonuçlarını Özetle
        ↓
9. Kullanıcı Yetkisi Varsa Atomik Commit & Push Yap
        ↓
10. Sonucu Teslim Et ([Handoff Report](file:///.agents/templates/handoff-report.md))
```

---

## 2. Kurallar ve Kısıtlar

* **Yeniden Onay İstememe:** Kullanıcı talimatı yeterince açık ve onaylıysa, izin gerekmeyen sıradan geliştirme adımlarında süreci durdurup tekrar onay istemeyin; doğrudan icra edin.
* **İşi Yarıda Bırakmama:** Teknik bir engel veya açık soru yoksa görevi uçtan uca tamamlayın.
* **Gürültüsüz Çalışma:** Her küçük dosya düzenlemesinden sonra uzun durum raporları üretmeyin.
* **İlerleme Bildirimi:** Bir dakikadan uzun süren arka plan işlemlerinde kullanıcıyı kısa ve net ilerleme mesajlarıyla bilgilendirin.
* **Test Verimliliği:** Tam test külliyatını her ara adımda değil, faz kapanış kapısında veya ortak veri modeli değiştiğinde çalıştırın.
* **Mevcut Servislerin Yeniden Kullanımı:** Aynı işlevi gören paralel yardımcı fonksiyonlar veya servisler yazmayın; mevcut mimari katmanı ([src/db/client.ts](file:///src/db/client.ts), [src/report/builder.ts](file:///src/report/builder.ts), [src/storage/backupManager.ts](file:///src/storage/backupManager.ts)) kullanın.

---

## 3. İlgili Belgeler

* [Kapsam Politikası](file:///.agents/policies/change-scope.md)
* [Test Politikası](file:///.agents/policies/testing-policy.md)
* [Uygulama Planı Şablonu](file:///.agents/templates/implementation-plan.md)
