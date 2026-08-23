# ERP CRM Discovery — FAZ-51 Proje Yedekleme, Geri Yükleme ve Taşınabilirlik (v0.1.2 Scope)

## 1. Genel Bakış ve Amaç

ERP CRM Discovery v0.1.2 kapsamında geliştirilen **FAZ-51: Proje Yedekleme, Geri Yükleme ve Taşınabilirlik**, analistlerin ve danışmanların bir keşif projesini tüm verileriyle (soru cevapları, modül seçimleri, notlar, bulgular, riskler, rapor profili, veri/yetki yönetişim modeli ve Managed Vault içerisindeki fiziksel kanıt/ek dosyaları) birlikte **tek bir bağımsız `.erpcrm` arşiv paketi** hâlinde dışa aktarmasını (Export), başka bir bilgisayarda/ortamda kayıpsız ve çakışmasız geri yüklemesini (Restore) ve mevcut projeyi şablon veya tam kopya olarak çoğaltmasını (Duplicate) sağlar.

---

## 2. Mimari Prensipler

### 2.1. Sıfır Dış Bağımlılık (Zero External Dependency)
* **Paket Formatı:** Standart POSIX USTAR TAR + GZIP sıkıştırması (`.erpcrm`).
* **Motor:** Node.js ortamında `node:zlib`, modern tarayıcı ve Tauri WebView ortamında native `Blob.stream().pipeThrough(new CompressionStream("gzip"))` ve `DecompressionStream("gzip")` Web Streams API'si kullanılmıştır. Hiçbir harici npm paketi (`archiver`, `tar`, `pako` vb.) eklenmemiştir.
* **Hash Algoritması:** Evrensel SHA-256 (`crypto.subtle.digest` / `node:crypto`).

### 2.2. Gizlilik ve Güvenlik Güvencesi (Privacy & Security by Design)
* **İşletim Sistemi İzolasyonu:** Dışa aktarılan arşiv paketinde kesinlikle hiçbir mutlak işletim sistemi dosya yolu (`C:\Users\...`, `/home/...`), makine adı veya OS kullanıcı bilgisi yer almaz. `source_absolute_path` alanları dışa aktarımda otomatik olarak `null` yapılır.
* **Zip-Slip & Path Traversal Koruması:** Arşiv açılırken ve paketlenirken göreli yollar sıkı kontrolden geçirilir. `..`, `\0` veya kök ile başlayan şüpheli yollar anında tespit edilerek işlem engellenir.
* **Bütünlük Kontrolü (Tamper Protection):** Arşiv içindeki `checksums.json` ve `manifest.json` dosyaları, tüm veri dosyalarının ve fiziksel eklerin SHA-256 özetlerini doğrular. Bozulmuş veya tahrif edilmiş arşivlerin yüklenmesi reddedilir.

### 2.3. Bağımsız Proje İçe Aktarımı ve ID/FK Haritalama (Remapping)
* Geri yüklenen veya çoğaltılan projeler asla mevcut bir projenin üzerine yazmaz.
* İçe aktarım sırasında projeye yeni bir benzersiz `project_id` atanır.
* Tüm alt kayıtların (firma profili, iş fonksiyonları, cevaplar, özel sorular, bulgular, riskler, rapor profili, yönetişim nesneleri, özneleri, kapsamları, sorumlulukları, yetkileri, limitleri, SoD kuralları ve ek dosyaları) yabancı anahtarları (Foreign Keys) ve ID'leri deterministik olarak yeniden haritalanır.
* Ek dosyalar yeni projenin Managed Attachment Vault dizinine (`attachment/{newProjectId}/...`) kopyalanır.

### 2.4. Atomik Transaction ve Rollback Güvenliği
* Geri yükleme işlemi veritabanı seviyesinde `BEGIN TRANSACTION` ... `COMMIT` bloğunda icra edilir.
* Herhangi bir doğrulama hatası, FK kısıt ihlali veya disk I/O probleminde `ROLLBACK` tetiklenir.
* Açılan geçici/yetim disk dosyaları (`deleteProjectAttachmentsDirectory(newProjectId)`) otomatik temizlenerek diskte çöp veri kalması önlenir.

---

## 3. `.erpcrm` Arşiv Paketi Yapısı

Tek dosyalık sıkıştırılmış `.erpcrm` arşivi aşağıdaki hiyerarşik yapıya sahiptir:

```text
proje_yedek.erpcrm (POSIX USTAR + GZIP)
├── manifest.json            # Proje üst verileri, sürüm bilgileri, tablo kayıt sayıları, ek dosya sayısı ve SHA-256 özeti
├── project-data.json        # 23 SQLite tablosuna ait normalize edilmiş JSON veri seti
├── checksums.json           # Arşiv içindeki tüm dosyaların göreli yol ve SHA-256 hash tablosu
└── attachments/             # Fiziksel kanıt ve ek dosyalar (göreli hiyerarşik yapı)
    ├── SALES/
    │   └── SAL-001/
    │       └── uuid1_fabrika_akisi.png
    └── PROCUREMENT/
        └── PRC-001/
            └── uuid2_satinalma_matrisi.xlsx
```

### 3.1. Dışa Aktarılan Tablo Kapsamı (23 SQLite Tablosu)
1. `analysis_projects`
2. `company_profiles`
3. `project_business_functions`
4. `project_notes`
5. `question_answers`
6. `question_followups`
7. `analysis_findings`
8. `analysis_requirements`
9. `analysis_risks`
10. `analysis_report_profiles`
11. `project_custom_questions`
12. `project_custom_question_options`
13. `project_custom_question_answers`
14. `question_attachments`
15. `governance_objects`
16. `governance_subjects`
17. `governance_scopes`
18. `governance_responsibilities`
19. `governance_authorizations`
20. `governance_limits`
21. `governance_sod_risks`
22. `governance_matrix_cells`
23. `governance_attachments`

---

## 4. Kullanıcı Arayüzü ve İş Akışları

### 4.1. Proje Detay Ekranı (`ProjectDetailView.tsx`)
* **[Yedekle (.erpcrm)]:** Projeyi tüm ekleriyle arşivler ve tarayıcı/Tauri dosya indirme diyaloğunu tetikler.
* **[Çoğalt]:** Açılan modal üzerinden:
  - *Yeni Proje Adı* girişi.
  - *Cevapları ve ekleri de kopyala* onay kutusu. (İşaretlenmezse fonksiyonlar ve yönetişim yapısı sıfırlanmış şablon olarak çoğaltılır).
* **[Yedekten Geri Yükle]:** Arşiv yükleme modalını açar.
* **[Projeyi Sil]:** Güvenlik onaylı silme işlemi ve fiziksel kasa temizliği.

### 4.2. Ana Sayfa (`HomeView.tsx`)
* Üst eylem çubuğunda **[Yedekten Geri Yükle (.erpcrm)]** butonu.
* Proje tablosu satır içi aksiyonlarında **[Yedekle]** ve **[Çoğalt]** hızlı erişim ikonları.

### 4.3. Geri Yükleme Önizleme ve Doğrulama Modalı (`RestoreProjectModal`)
* Dosya seçildikten sonra otomatik ön inceleme (`inspectProjectBackup`).
* Format sürümü, şema uyumu, firma adı, cevap/bulgu/yönetişim sayıları ve ek dosya listesi özeti.
* Yeni proje adı tanımlama imkânı.
* Başarılı geri yüklemede doğrudan yeni projeye yönlendirme.

### 4.4. Bildirim Standardı
* Tüm işlemler FAZ-50 `.gov-toast` bildirim sistemiyle kullanıcıya bilgi verir. Native `alert()` kullanımı tamamen engellenmiştir.

---

## 5. Kabul ve Doğrulama Testleri

`test/faz51_project_backup_restore_test.ts` kabul testi aşağıdaki senaryoları kapsar:

| No | Test Senaryosu | Beklenen Sonuç |
|---|---|---|
| 1 | Sentetik Üretim Pilotu Tohumlama (`Atlas Modüler Makine Sanayi A.Ş.`) | 5 fonksiyon, 10 cevap, 1 özel soru, bulgu, risk, rapor profili, yönetişim nesneleri, 2 fiziksel ek dosya başarıyla oluşturulur. |
| 2 | `.erpcrm` Dışa Aktarma (Export) | Manifest, project-data, attachments ve checksums içeren arşiv üretilir. |
| 3 | Gizlilik ve Güvenlik Denetimi | `source_absolute_path` alanlarının `null` olduğu, kullanıcı işletim sistemi dizinlerinin sızmadığı doğrulanır. |
| 4 | Ön Doğrulama (Inspect) ve Bütünlük | Geçerli arşiv onaylanır; tahrif edilmiş dosya veya bozuk checksum tespit edilip engellenir. |
| 5 | Path Traversal Güvenlik Engeli | `../../` içeren yol enjeksiyonları anında yakalanır ve reddedilir. |
| 6 | Geri Yükleme (Restore) | Yeni `project_id` ve remapped FK'lar ile 23 tablo ve 2 kanıt dosyası yeni projeye aktarılır; orijinal proje bozulmadan korunur. |
| 7 | Projeyi Çoğaltma (Duplicate) | Şablon (answers=0) ve tam kopya (answers=100%, attachments=100%) ayrımı doğrulanır. |
| 8 | Transaction & Rollback Güvenliği | Hata anında DB rollback gerçekleşir; veritabanında veya diskte yetim kayıt kalmaz. |
