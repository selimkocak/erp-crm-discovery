# ERP CRM Discovery — FAZ-48 Soru Külliyatı Kalite ve Bütünlük Denetim Raporu

---

## 1. Yönetici Özeti

FAZ-48 kapsamında, ERP CRM Discovery platformunun tüm kanonik soru külliyatını (34 Soru Paketi / 1.492 Soru) bağımsız ve otomatik olarak denetleyen `scripts/audit_question_corpus.mjs` denetim motoru devreye alınmıştır.

Külliyat genelinde **0 ID mükerrerliği**, **0 bileşik anahtar çakışması**, **0 bozuk branching koşulu**, **0 boş seçenek** ve **%100 biçimsel temizlik** doğrulanmıştır.

---

## 2. Külliyat Sayısal Metrikleri

| Metrik | Değer | Oran / Detay |
|:---|:---:|:---:|
| **Toplam Soru Paketi** | **34** | 33 Kanonik İş Fonksiyonu + 1 Temel Eğitim Paketi |
| **Toplam Soru Sayısı** | **1.492** | Ortalama ~44 soru / paket |
| **Zorunlu Sorular (Required: true)** | **792** | %53.1 (Süreç ana omurgası) |
| **Opsiyonel Sorular (Required: false)** | **700** | %46.9 (Derinlemesine detay ve alt süreçler) |
| **Koşullu Sorular (Branching / Condition)** | **213** | %14.3 (Dinamik akış ve dallanma) |

---

## 3. Yapısal Bütünlük ve Güvenlik Denetimleri

### 3.1 Kimlik ve Anahtar Benzersizliği
* **Paket İçi Soru ID Tekilliği:** 34 pakette 0 mükerrer ID (`inPackIdDuplicates = 0`).
* **Çalışma Zamanı Bileşik Anahtarı (`${bfCode}::${questionId}`):** 1.492 soruda %100 tekil (`compositeKeyDuplicates = 0`).
* **Önek Çakışma Yönetimi:** `INVENTORY` (`INV-001..037`) ve `INVOICING` (`INV-001..047`) paketlerindeki tarihsel `INV-` önek benzerliği, veritabanı composite key `UNIQUE(analysis_project_id, business_function_code, question_id)` ve Managed Vault `{bfCode}/{questionId}` namespace izolasyonu sayesinde sıfır çakışmayla korunmaktadır.

### 3.2 Branching ve Koşul Bütünlüğü (213 Koşullu Soru)
* **Parent Soru Varlığı:** Tüm child soruların `condition.question_id` referansları kendi paketinde eksiksiz mevcuttur.
* **Tetikleyici Değer Geçerliliği:** `condition.value` değerlerinin tamamı parent sorunun `options[].value` listesinde yer almaktadır.
* **Döngüsel Bağımlılık (Circular Dependency):** 0 döngüsel bağımlılık (A ↔ B döngüsü yoktur).
* **Self-Triggering:** Hiçbir soru kendi kendisini tetiklememektedir.
* **Deadlock Koruması:** Gizlenen koşullu soruların form tamamlama kilitlenmesine (completion deadlock) yol açmadığı doğrulanmıştır.

### 3.3 Dil, Seçenek ve Metin Kalitesi
* **Boş Seçenek Denetimi:** 0 boş etiket veya boş değer.
* **Mükerrer Seçenek Değeri:** Soru içerisinde 0 mükerrer `value`.
* **Biçim ve Boşluk Denetimi:** Baştaki/sondaki gereksiz boşluklar ve çift boşluklar temizlenmiştir (0 uyarı).
* **Paket İçi Metin Kopyası:** Birebir aynı metne sahip mükerrer soru bulunmamaktadır.

---

## 4. Çapraz Paket Bağlamsal Örtüşme (Intentional Overlap) Analizi

Külliyat genelinde Jaccard token benzerliği $\ge \%80$ olan maddeler incelenmiştir:

| Eşleşen Sorular | Benzerlik | Soru Metinleri | Karar & Gerekçe |
|:---|:---:|:---|:---|
| `EXPORT:EXP-021` ↔ `IMPORT:IMP-013` | %87 | Gümrük müşavirliği yazılımı ve lojistik portalı ERP entegrasyonu | **Intentional Overlap (Bilinçli Örtüşme):** İhracat ve ithalat operasyonlarında gümrük yazılımı entegrasyonu bağımsız departmanlarca yürütülen ayna süreçlerdir. |
| `EXPORT:EXP-047` ↔ `IMPORT:IMP-047` | %87 | İhracat/İthalat süreçlerinde geçmiş darboğazlar ve ERP beklentileri | **Intentional Overlap (Bilinçli Örtüşme):** Dış ticaret kapanış değerlendirme soruları ilgili iş fonksiyonunun özel bağlamında sorulmaktadır. |

---

## 5. Çalıştırma ve Otomasyon

Audit motoru CI/CD süreçlerine ve `package.json` içerisine entegre edilmiştir:

```bash
npm run audit:corpus
```
