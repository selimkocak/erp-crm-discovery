# Şablon: acceptance-report

Bu şablon, tamamlanan bir fazın veya doğrulamanın kabul kriterleri dökümünü sunmak için kullanılır.

---

## 1. Faz ve Görev Özeti
* **Faz Adı / No:** 
* **Tarih:** 
* **Durum:** TAMAMLANDI / KISMİ / BAŞARISIZ

---

## 2. Kabul Kriterleri Doğrulama Tablosu

| No | Kabul Kriteri | Doğrulama Yöntemi | Beklenen Sonuç | Gerçekleşen Sonuç | Durum (PASS/FAIL) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Kriter 1 | Otomasyon Testi | ... | ... | **PASS** |
| 2 | Kriter 2 | PDFParse İnceleme | ... | ... | **PASS** |
| 3 | Kriter 3 | Tip & Derleme Denetimi | 0 Hata | 0 Hata | **PASS** |

---

## 3. Doğrulama Kanıtları

* **Hedef Test Sonucu:** `X PASS / 0 FAIL`
* **Frontend Derleme (`npm run build`):** `0 Hata`
* **Rust Backend Kontrolü (`cargo check`):** `0 Hata`
* **Git Format Kontrolü (`git diff --check`):** Temiz (0 Whitespace hatası)

---

## 4. Gerçek Masaüstü Manuel Kabul Kontrol Listesi
*(Varsa kullanıcı tarafından yerel masaüstünde doğrulanması önerilen görsel adımlar)*
* [ ] Adım 1
* [ ] Adım 2
