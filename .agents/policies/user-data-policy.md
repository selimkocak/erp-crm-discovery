# Politika: user-data-policy

Bu politika, kullanıcı verilerinin mahremiyeti, veri sızıntısının önlenmesi, sentetik veri kullanımı ve sıfır dışa veri aktarımı (zero-egress) ilkelerini belirler.

---

## 1. Veri Mahremiyeti ve Sentetik Veri İlkeleri

1. **Gerçek Veri Yasağı:** Test dosyalarında, fixture'larda, ekran görüntülerinde veya örnek projelerde gerçek şahıs, müşteri veya kurum isimleri (örn. Tuna Ofis vb.) kesinlikle kullanılamaz.
2. **Sentetik Pilot Verisi:** Örnek projeler (örn. Marmara Endüstriyel Sistemler A.Ş.) açıkça ve tamamen kurgusal/sentetik olarak tasarlanmalıdır.
3. **Mutlak Dosya Yolu İzolasyonu:** Kullanıcının işletim sistemine ait mutlak dosya yolları (`C:\Users\...`, `/home/...`) veritabanına, yedek arşivlerine veya raporlara yazılamaz; yalnızca göreli yollar (`relative_path`) saklanır.
4. **Sıfır Sızıntı (Zero-Egress):** Hiçbir kullanıcı verisi, rapor içeriği veya kanıt eki ağ üzerinden dış servislere, telemetri sunucularına veya üçüncü taraf bulutlarına gönderilemez.
5. **Günlük Güvenliği:** Terminal çıktılarında, commit mesajlarında veya raporlarda şifre, anahtar veya hassas sistem bilgisi gösterilemez.

---

## 2. İlgili Belgeler

* [Bellek Güncelleme İş Akışı](file:///.agents/workflows/update-memory.md)
* [Yedekleme ve Geri Yükleme Becerisi](file:///.agents/skills/backup-restore-integrity/SKILL.md)
