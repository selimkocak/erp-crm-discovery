# ADR-001: Antigravity Geliştirme Ajanı Kontrol Mimarisi

* **Durum:** KABUL EDİLDİ (ACCEPTED)
* **Tarih:** 2026-08-24
* **Karar Vericiler:** Selim Koçak (Ürün Sahibi), ChatGPT / Tars (Mimar)
* **Uygulayıcı Ortam:** Antigravity IDE (Gemini Geliştirme Ajanları)

---

## 1. Bağlam ve Problem (Context)

ERP CRM Discovery projesi; Tauri 2, React 18, TypeScript ve yerel SQLite üzerinde koşan %100 çevrimdışı (offline-first), sıfır bulut bağımlılıklı ve AI içermeyen bir kurumsal analiz ve keşif aracıdır.

Proje geliştirilirken Antigravity IDE ve Gemini geliştirme ajanları aktif olarak kodlama, test, hata teşhisi ve raporlama işlerinde kullanılmaktadır. Ancak ajanların görev sınırları açıkça çizilmediğinde:
* Gereksiz ve tekrar eden CI tetiklemeleri,
* Eski/kırılgan test beklentilerini geçirmek amacıyla doğru üretim iş kurallarının geriye çevrilmesi,
* Yetkisiz refactoring veya kapsam genişletme (scope creep),
* Otomasyon testleri ile gerçek masaüstü görsel kabulünün birbirine karıştırılması,
* Proje içine yanlışlıkla runtime AI veya API bağımlılığı ekleme riski
gibi problemler ortaya çıkmaktadır.

---

## 2. Alınan Mimari Kararlar (Decisions)

1. **Tek Kanonik Dizin:** Antigravity IDE için proje içindeki tek kanonik ajan yapılandırma dizini `.agents/` olarak belirlenmiştir.
2. **Kök Giriş Noktası:** Repository kökündeki `AGENTS.md`, tüm geliştirme araçları için kısa ve ortak giriş noktasıdır; ayrıntılı kurallar için `.agents/agents.md` sözleşmesine işaret eder.
3. **Roller ve Ayrım:**
   * **Selim Koçak:** Ürün sahibi ve nihai kabul yetkilisidir.
   * **ChatGPT / Tars:** Sistem mimarı, kapsam ve kabul kriteri üreticisidir.
   * **Antigravity IDE & Gemini Ajanları:** Repository inceleme, geliştirme, test ve raporlama müteahhididir.
   * **ERP CRM Discovery:** Geliştirilen bağımsız nihai üründür.
4. **Çalışma Zamanı (Runtime) AI İzolasyonu:** Gemini veya harici herhangi bir yapay zekâ servisi ERP CRM Discovery uygulamasının çalışma zamanı parçası **değildir**. `src/` ve `src-tauri/` içine AI API'si veya gateway eklenemez. Uygulama kesin olarak %100 çevrimdışı ve sıfır dışa veri aktarımı (zero-egress) ilkelerini korur.
5. **Ajan Görev Rolleri:**
   * **Investigator:** Salt-okunur inceleme, ilk gerçek hata tespiti ve kök neden analizi.
   * **Implementer:** Yalnızca onaylanmış kapsamı dikey dilimlerle kodlama, mevcut mimari servisleri kullanma.
   * **QA:** Hedef test öncelikli doğrulama, gerçek ürün hatası ile eski test beklentisini ayırma, masaüstü kabul adımları.
   * **Release:** Sürüm senkronizasyonu, SHA-256 doğrulama, kullanıcı onayı olmadan tag/release yapmama.
6. **Yıkıcı Git Komutları Yasağı:** `git reset --hard`, force-push ve tag taşıma kesin olarak yasaklanmıştır.

---

## 3. Değerlendirilen ve Reddedilen Alternatifler (Alternatives Considered)

* **Alternatif:** `.agent/` ve `.agents/` dizinlerinin her ikisini de depoda paralel olarak tutmak.
* **Red Gerekçesi:** Paralel dizinler çift talimat kaynağı (dual source of truth) yaratarak kural çelişkilerine, bakım zorluğuna ve ajanların farklı sürümlerdeki kuralları çalıştırmasına yol açmaktadır. Tek kanonik dizin olarak `.agents/` seçilmiştir.

---

## 4. Sonuçlar ve Kazanımlar (Consequences)

* **Pozitif:** Geliştirme ajanlarının davranışları öngörülebilir, tekrarlanabilir ve denetlenebilir hale gelmiştir.
* **Pozitif:** CI kırılmalarında deneme-yanılma döngüleri engellenmiş; tek kök neden analizi ile hızlı iyileştirme kurala bağlanmıştır.
* **Pozitif:** Uygulamanın offline-first, sıfır bulut ve yapay zekâ içermeyen kurumsal mahremiyet ilkeleri güvence altına alınmıştır.
* **Pozitif:** Kullanıcı değişikliklerinin ezilmesi ve izinsiz sürüm yayınlanması riskleri bertaraf edilmiştir.
