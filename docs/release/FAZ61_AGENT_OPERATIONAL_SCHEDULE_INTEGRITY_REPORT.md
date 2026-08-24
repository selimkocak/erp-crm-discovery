# FAZ-61 — Ajan Mimarisi Operasyonel Saha Testi ve Takvim Bütünlüğü Stabilizasyon Raporu

* **Tarih:** 2026-08-24
* **Ajan Rolü:** Investigator & Implementer & QA
* **Kapsam:** Antigravity `.agents/` Kontrol Mimarisi Saha Doğrulaması ve İki Seviyeli Proje & Modül Takvim Bütünlüğü

---

## 1. Investigator Bulguları ve Veri Akış Analizi

FAZ-60 ile tesis edilen `.agents` kontrol mimarisi kurallarına tam uyum sağlanarak aşağıdaki 14 veri akışı uçtan uca incelenmiştir:

1. **Proje Oluşturma (`createProject`):** `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date` alanları `analysis_projects` tablosuna atomik olarak kaydedilir.
2. **Proje Düzenleme (`updateProjectDetails`):** Proje profil düzenleme modunda tarih aralıkları `validateScheduleDates` ile doğrulanır.
3. **Proje Detayını Okuma (`getProjectDetail`):** Proje ve 19 aktif modülün tüm takvim kolonları SQLite'dan eksiksiz çekilir.
4. **Proje Takvimini Kaydetme (`updateProjectSchedule`):** `ProjectScheduleModal` üzerinden başlangıç-bitiş doğrulaması yapılarak kaydedilir.
5. **İş Fonksiyonu Takvimini Kaydetme (`updateProjectFunctionSchedule`):** `FunctionScheduleModal` üzerinden modül bazlı planlanan ve gerçekleşen tarihler güncellenir.
6. **İş Fonksiyonunu Kapsam Dışına Alma (`toggleProjectFunctionActive` / `updateProjectFunctionsScope`):** Modül pasife alındığında (`is_active = 0`) tarih kayıtları SQLite'da %100 korunur.
7. **İş Fonksiyonunu Yeniden Aktifleştirme:** Modül aktif kapsama döndüğünde (`is_active = 1`) eski takvim verileri kayıpsız geri gelir.
8. **Projeyi Pasife Alma ve Aktifleştirme (`setProjectStatus`):** Proje pasife alındığında takvim bilgileri korunur ve arayüzde salt-okunur (read-only) gösterilir.
9. **Proje Yedekleme (`exportProjectBackup`):** `.erpcrm` POSIX USTAR arşivi içindeki `project-data.json`, 8 takvim kolonunu eksiksiz paketler.
10. **Yedekten Geri Yükleme (`restoreProjectBackup`):** Arşivdeki tarihler yeni oluşturulan projeye birebir aktarılır; eski formatlı (tarihsiz) yedekler `NULL` fallback ile hatasız açılır.
11. **Proje Çoğaltma (`duplicateProject`):** Şablon kopyada planlanan tarihler korunur, fiilî tarihler bağımsız yeni başlangıç için sıfırlanır (`null`). Tam kopyada ise tüm tarihler korunur.
12. **Sentetik Pilot Proje Oluşturma (`createManufacturingPilotProject`):** 19 aktif modül için 5 dalgalı deterministik takvim modeli tohumlanır.
13. **Rapor Önizleme (`ReportPreviewView`):** `report.scheduleSummary` üzerinden Proje ve İş Fonksiyonları Zaman Çizelgesi UI'da gösterilir.
14. **PDF/DOCX Rapor Modeli (`pdfExporter`, `docxExporter`):** Bölüm 3.1 altında Türkçe etiketlerle, `undefined`/`null`/ham enum sızıntısı olmaksızın takvim tabloları basılır.

---

## 2. Kanıtlanan ve İyileştirilen Noktalar

* **Form Hata Bildirimi:** `NewProjectView` içerisinde iş fonksiyonu seçilmediğinde native `alert()` çağrısı yerine `setErrorMessage(...)` inline Türkçe hata bileşeni kullanımına geçildi.
* **Test Sağlamlığı:** `test/faz61_agent_operational_and_schedule_integrity_test.ts` yazılarak 22 zorunlu senaryo ve 85+ assertion ile takvim motoru mühürlendi.
* **Sayaç Bütünlüğü:** Kapsam dışı bırakılan modüllerin aktif takvim istatistiklerine (`scheduleStats`) dahil edilmediği doğrulandı.

---

## 3. Rapor ve Arayüz Parite Tablosu

| Bileşen | UI Önizleme | PDF Raporu | Word (DOCX) |
| :--- | :--- | :--- | :--- |
| **Proje Planlanan Tarih** | 01.09.2026 – 24.11.2026 | 01.09.2026 – 24.11.2026 | 01.09.2026 – 24.11.2026 |
| **Proje Fiilî Tarih** | 01.09.2026 – Devam Ediyor | 01.09.2026 – Devam Ediyor | 01.09.2026 – Devam Ediyor |
| **Takvim Durumu** | Yolunda | Yolunda | Yolunda |
| **Modül Takvim Tablosu** | 19 Aktif Modül | 19 Aktif Modül | 19 Aktif Modül |
| **Geciken / Tamamlanan** | Merkezi `scheduleStats` | Merkezi `scheduleStats` | Merkezi `scheduleStats` |
| **Undefined / Null / Ham Enum** | 0 | 0 | 0 |

---

## 4. Doğrulama ve Test Sonuçları

* **FAZ-61 Kabul Testi (`test/faz61_agent_operational_and_schedule_integrity_test.ts`):** **92 PASS / 0 FAIL**
* **FAZ-60 Ajan Kontrol Mimarisi Testi:** **87 PASS / 0 FAIL**
* **FAZ-59 Takvim Testi:** **149 PASS / 0 FAIL**
* **FAZ-58.3 Rapor Sayaç Testi:** **80 PASS / 0 FAIL**
* **FAZ-51 Yedekleme & Geri Yükleme Testi:** **49 PASS / 0 FAIL**
* **Frontend Derleme (`npm run build`):** `0 Hata`, 1945 modül dönüştürüldü.
* **Rust Backend Kontrolü (`cargo check`):** `0 Hata`, 0 Uyarı.
* **Git Format Denetimi (`git diff --check`):** Temiz (0 hata).
