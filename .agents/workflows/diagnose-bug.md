# İş Akışı: diagnose-bug

Bu iş akışı, üretimde veya test ortamında karşılaşılan hataların kanıta dayalı olarak teşhis edilmesi ve kök nedeninin giderilmesi sürecini tanımlar.

---

## 1. Adım Adım Teşhis Sırası

```text
1. Hatayı Deterministik Olarak Yeniden Üret
        ↓
2. İlk Başarısız Kayıt, Sorgu veya Satırı Bul (Earliest Point of Failure)
        ↓
3. Gerçek SQLite Şeması ve Veri Modeliyle Karşılaştır
        ↓
4. Kök Nedeni Kanıtla (Belirti vs Kök Neden Ayrımı)
        ↓
5. En Küçük ve Güvenli Düzeltmeyi Belirle
        ↓
6. Hedef Regresyon Testi Yaz / Güncelle
        ↓
7. Düzeltmeyi Uygula
        ↓
8. Hedef Testi ve Çevreleyen Regresyonu Doğrula
```

---

## 2. Özel Kurallar ve İlkeler

1. **SQLite ve Foreign Key Hataları:**
   * Bir SQL hatasında etkilenen tablo, kolon, foreign key kısıtı ve gerçek ebeveyn (parent) ID açıkça raporda belirtilmelidir.
   * Rastgele ID üretimi yerine SQLite master tablolarındaki gerçek anahtarlar dinamik çözümlenmelidir.
2. **UI ve Durum Hataları:**
   * Yalnızca ekrandaki metne veya görsele bakarak kök neden varsayımı yapılmamalıdır.
   * Bileşen (React Component), yerel State, hook'lar ve SQLite veri tabanı okuma/yazma akışı baştan sona izlenmelidir.
3. **Masaüstü Davranış Dürüstlüğü:**
   * Bir testin yeşil olması, native masaüstü ortamında (Windows/macOS) doğru çalıştığını tek başına kanıtlamaz.
   * Dosya yolları, dialog pencereleri ve işletim sistemi entegrasyonları masaüstü gerçekliğine uygun modellenmelidir.
4. **Sentetik Test Ortamı Bütünlüğü:**
   * Test ortamında kullanılan SQLite mock adaptörü, üretim şemasıyla (`MIGRATION_DEFINITIONS`) ve `PRAGMA foreign_keys = ON` kuralıyla birebir aynı çalışmalıdır.

---

## 3. İlgili Belgeler

* [Kök Neden Raporu Şablonu](file:///.agents/templates/root-cause-report.md)
* [Test Politikası](file:///.agents/policies/testing-policy.md)
* [İletişim Politikası](file:///.agents/policies/communication-policy.md)
