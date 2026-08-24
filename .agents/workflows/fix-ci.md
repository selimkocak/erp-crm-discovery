# İş Akışı: fix-ci

Bu iş akışı, GitHub Actions CI/CD boru hatlarında ortaya çıkan hataların tek döngüde, deneme-yanılma yapmadan ve kök nedene inilerek çözülmesini sağlar.

---

## 1. CI Hata Giderme Adımları

1. **İlk Gerçek Hatayı Bul:** CI çalıştırma günlüğünde (run log) ardışık hata yığınları yerine patlayan **ilk gerçek satırı ve hatayı** bulun (`gh run view <id> --job <job-id> --log`).
2. **Tekrar Eden Tetiklemelerden Kaçın:** Aynı commit veya aynı sorun için peş peşe rastgele CI tetiklemeleri başlatmayın.
3. **Hatanın Türünü Sınıflandır:**
   * **Üretim Kodu Hatası:** Gerçek bir kod, mantık veya veri tabanı kusuru.
   * **Eski / Kırılgan Test Beklentisi:** Yeni ve onaylanmış ürün davranışının (örneğin daha anlaşılır bir Türkçe metin veya yeni bir sayaç alanı) eski bir testteki sabit assertion ile çakışması.
   * **Platform Bağımlılığı:** Linux vs macOS vs Windows dosya yolu formatı (`file:///`, backslash), büyük/küçük harf duyarlılığı veya derleyici farkı.
   * **Workflow Yapılandırması:** CI YAML adımları, node sürümü veya sistem kütüphanesi eksikliği.
   * **Geçici Altyapı Sorunu:** Ağ kesintisi veya GitHub runner arızası.
4. **Yerelde Yeniden Üret:** Hatayı yerel geliştirme ortamında ilgili test dosyasını doğrudan çalıştırarak yeniden üretin.
5. **Kök Neden Düzeltmesi Hazırla:** Sorunun kaynağını tek bir mantıksal düzeltme setiyle giderin.
6. **Bütünsel Tarama:** Düzeltmenin etkilediği diğer test beklentilerini `rg` ile repository genelinde arayıp tek seferde güncelleyin.
7. **Tek Commit & Push:** Düzeltmeyi içeren tek bir commit oluşturun ve `origin/main` dalına push edin.
8. **CI'ı Yalnızca Bir Kez İzleyin:** CI iş akışını gereksiz sık polling yapmadan makul aralıklarla izleyin.

---

## 2. Üretim Davranışı vs Test Beklentisi Kuralı

> [!CAUTION]
> Kullanıcı deneyimi veya iş kuralı açısından doğru olan bir üretim davranışını (örn. `formatProjectStatus("active") -> "Aktif"` veya `"9’u tamamlandı"`), sırf eski bir testte `"active"` veya `"9'i"` aranıyor diye **ASLA** geri almayın.
> Doğru ve onaylanmış ürün davranışı korunmalı; eski test beklentisi yeni kanonik modele uyarlanmalıdır.

---

## 3. İlgili Belgeler

* [CI İyileştirme Politikası](file:///.agents/policies/ci-recovery-policy.md)
* [Test Politikası](file:///.agents/policies/testing-policy.md)
* [Git ve Sürüm Politikası](file:///.agents/policies/git-release-policy.md)
