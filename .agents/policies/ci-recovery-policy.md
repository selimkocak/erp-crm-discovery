# Politika: ci-recovery-policy

Bu politika, GitHub Actions CI boru hattında karşılaşılan başarısızlıkların tek döngüde, gereksiz deneme-yanılma commit'leri yapmadan ve kesin kök nedene dayalı olarak çözülmesini zorunlu kılar.

---

## 1. CI İyileştirme Kuralları

1. **Deneme-Yanılma Döngüsü Yasağı:** Aynı CI hatasını peş peşe küçük tahminlerle veya art arda commit'ler atarak kovalamak kesinlikle yasaktır.
2. **İlk Gerçek Hatanın Tespiti:** Hata günlüğünden ilk patlayan gerçek satır ve hata tipi analiz edilir.
3. **Bütünsel Etki Taraması:** Yeni bir veri modeli veya metin değişikliği yapıldığında, repository'deki diğer test dosyaları `rg` ile taranarak eski assertion'lar tek seferde güncellenir.
4. **Tek Kök Neden, Tek Düzeltme Seti:** Sorun tek bir mantıksal düzeltme paketi olarak hazırlanır, yerelde doğrulanır ve tek bir commit ile push edilir.
5. **Gereksiz Polling Yapmama:** CI sonucu beklenirken çok sık aralıklarla durum sorgusu yapılmaz; orantılı zamanlayıcılar (`schedule`) kullanılır.
6. **Doğru Ürün Davranışını Koruma:** Kullanıcı arayüzünde veya raporda iyileştirilmiş doğru bir Türkçe metin ya da format, sadece eski bir test başarısız oldu diye ASLA eski hatalı haline geri döndürülmez. Test, yeni onaylanmış modele uyarlanır.

---

## 2. İlgili Belgeler

* [CI Düzeltme İş Akışı](file:///.agents/workflows/fix-ci.md)
* [Test Politikası](file:///.agents/policies/testing-policy.md)
