# Şablon: root-cause-report

Bu şablon, karşılaşılan bir hatanın veya CI kırılmasının kök neden analizini raporlamak için kullanılır.

---

## 1. Belirti (Symptom)
*Kullanıcının veya testin karşılaştığı görünür hata mesajı ve davranış.*

## 2. Yeniden Üretim (Reproduction)
*Hatayı yerel ortamda tetikleyen kesin test veya kullanım adımları.*

## 3. İlk Gerçek Hata Noktası (Earliest Failure Point)
*Hatanın ilk meydana geldiği satır, SQL sorgusu veya bileşen.*

## 4. Kök Neden Analizi (Root Cause Analysis)
*Hatanın asıl mantıksal veya yapısal kaynağı (Belirti vs Kök Neden).*

## 5. Etkilenen Veri Akışı ve Bileşenler
* SQLite Tabloları / Kolonları / Foreign Key'ler:
* İlgili Servis Fonksiyonları:
* UI Bileşenleri / Modelleri:

## 6. Kanıt (Evidence)
*Test veya terminal çıktısından somut log ve veri dökümü.*

## 7. Uygulanan Düzeltme (Remediation)
*Kök nedeni ortadan kaldıran en küçük ve güvenli kod değişikliği.*

## 8. Regresyon Koruması (Regression Guard)
*Bu hatanın gelecekte tekrar etmesini önleyen otomatik test (`test/...`).*

## 9. Kalan Riskler ve Notlar
*Varsa dikkat edilmesi gereken açık noktalar.*
