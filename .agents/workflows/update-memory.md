# İş Akışı: update-memory

Bu iş akışı, projenin kalıcı belleğini ([docs/project/project_memory.md](file:///docs/project/project_memory.md) ve Knowledge Item kayıtları) güncellerken hangi bilgilerin kaydedileceğini, hangilerinin ise eleneceğini belirler.

---

## 1. Kalıcı Belleğe Yazılacak Bilgiler

Yalnızca doğrulanmış ve gelecekteki oturumlarda kararları yönlendirecek kalıcı teknik gerçekler kaydedilir:

* **Kabul Edilmiş Mimari Kararlar:** Veri modeli, foreign key kuralları, dosya formatları (.erpcrm, .docx, .pdf).
* **Mevcut Sürüm ve Şema:** Aktif sürüm numarası, son uygulanan SQLite migrasyonu (örn. Migration 13).
* **Kanonik Veri Sayıları:** İş fonksiyonu sayısı (33), soru paketi sayısı (34), toplam soru sayısı (1.492), zorunlu soru sayısı.
* **Platform Davranışları:** Windows native URL çözümlemesi (`file:///`), macOS Apple Silicon DMG dinamikleri, Linux dosya izinleri.
* **Test ve Yayın Kuralları:** Test çalıştırma sırası, tag/release kısıtları.
* **Açık / Sıradaki Fazlar:** Gelecek oturumda başlanacak olan açık faz tanımı.

---

## 2. Kalıcı Belleğe Yazılması YASAK Olan Bilgiler

Aşağıdaki geçici veya gürültülü veriler kalıcı hafızaya **asla** eklenmemelidir:

* ❌ Geçici terminal ve derleyici çıktıları.
* ❌ Tek seferlik GitHub Actions run ID veya job ID numaraları.
* ❌ Uzun bekleme ve durum yoklama (polling) günlükleri.
* ❌ Çözülmüş ara hataların tüm konuşma ve deneme geçmişi.
* ❌ Kişisel veriler, kullanıcı yolları (`/home/user/..`, `C:\Users\..`) veya gerçek müşteri isimleri.

---

## 3. İlgili Belgeler

* [Kullanıcı Verisi ve Gizlilik Politikası](file:///.agents/policies/user-data-policy.md)
* [Devir ve Teslim Şablonu](file:///.agents/templates/handoff-report.md)
