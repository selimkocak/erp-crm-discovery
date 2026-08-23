# ERP CRM Discovery — Saha Destek ve Olay Yönetim Prosedürü

Bu doküman, ERP CRM Discovery uygulamasının pilot kullanım ve canlı saha aşamasında kullanıcıların karşılaşabileceği sorunların sınıflandırılması, raporlanması, çözümlenmesi ve SLA hedeflerini tanımlar.

---

## 1. Olay Öncelik Seviyeleri ve SLA Hedefleri

| Seviye | Tanım | Örnek Durum | İlk Yanıt Süresi | Çözüm / Geçici Çözüm Süresi |
|:---|:---|:---|:---:|:---:|
| **P1 - Kritik (Blocker)** | Uygulama hiç açılmıyor, veritabanı bozulması, rapor üretimi tamamen kilitleniyor, veri kaybı riski. | SQLite kilitlenmesi, DOCX/PDF export crash, başlangıçta beyaz ekran. | < 2 saat | < 8 saat |
| **P2 - Yüksek (Major)** | Ana fonksiyonlardan biri çalışmıyor, ancak geçici alternatif yöntem mevcut. | Soru ekranında tek bir modülün cevapları kaydetmemesi, ek dosya kopyalama hatası. | < 4 saat | < 24 saat |
| **P3 - Normal (Minor)** | Fonksiyonel olmayan UI kayması, metin/i18n yazım hatası, rapor stil bozukluğu. | Buton hizalama hatası, filtreleme gecikmesi, rapor dipnot karakter hatası. | < 1 iş günü | < 3 iş günü |
| **P4 - Düşük (Cosmetic / Feature)** | Yeni soru paketi önerisi, UX geliştirme talebi, yeni dışa aktarma formatı isteği. | Yeni sektör soru paketi talebi, karanlık mod tema önerisi. | < 2 iş günü | Gelecek Sürüm (Backlog) |

---

## 2. Olay Yaşam Döngüsü

```
[Yeni / New] ──> [İnceleniyor / Triaged] ──> [Geliştiriliyor / In Progress] ──> [Doğrulandı / Verified] ──> [Kapatıldı / Closed]
```

* **1. Bildirim (Intake):** Kullanıcı destek şablonunu doldurarak GitHub Issue veya yerel destek masasına iletir.
* **2. Ön İnceleme (Triage):** Öncelik (P1..P4) atanır, log ve platform bilgileri doğrulanır.
* **3. Geliştirme (Fix):** Hata giderilir, test otomasyonuna yeni regresyon testi eklenir.
* **4. Doğrulama (Verify):** Test ortamında doğrulanır.
* **5. Sürüm Dağıtımı (Release):** Hotfix veya bir sonraki versiyon paketi ile dağıtılır.

---

## 3. Standart Destek Bildirim Şablonu

```markdown
### 1. Olay Özeti
[Kısa ve açıklayıcı başlık]

### 2. Öncelik
[P1 / P2 / P3 / P4]

### 3. Ortam Bilgileri
- **İşletim Sistemi:** Windows 10/11 x64 / macOS Apple Silicon (M1/M2/M3) / Linux Ubuntu 22.04+
- **Uygulama Sürümü:** v0.1.0 (veya ilgili RC/GA sürümü)
- **Proje Adı:** [Proje ID veya Kurgusal Adı]
- **İlgili İş Fonksiyonu:** [Örn. PRODUCTION_PLANNING, INVENTORY, GOVERNANCE]

### 4. Yeniden Üretim Adımları (Steps to Reproduce)
1. ...
2. ...
3. ...

### 5. Beklenen Davranış vs Gerçekleşen Davranış
- **Beklenen:** ...
- **Gerçekleşen:** ...

### 6. Ekler ve Hata Kayıtları
- Varsa ekran görüntüsü veya hata mesajı metni
- Log dizini: `%LOCALAPPDATA%\ERP CRM Discovery\logs` veya `~/.local/share/ERP CRM Discovery/logs`
```
