# ERP CRM Discovery — FAZ-62B Kapanış Raporu

**Faz Adı:** FAZ-62B — OT İstasyon Profili ve Tekrarlayan İstasyon Keşif Akışı  
**Tarih:** 24 Ağustos 2026  
**Sürüm:** v0.1.4 (Geliştirme / Unreleased)  
**Kapsam:** Saha Veri Toplama, OT/IT ve Endüstriyel Veri Keşfi dikey dilimi için tekrarlayan istasyon profili, izole istasyon cevap motoru, Migration 14 SQLite şeması, rapor/DOCX/PDF entegrasyonu ve Schema 14 taşınabilir arşiv bütünlüğü.

---

## 1. Mimari Özet ve Temel Prensipler

FAZ-62A'da oluşturulan `OT_INDUSTRIAL_DATA` (Saha Veri Toplama ve Endüstriyel Veri Keşfi) modülü, tekil bir soru-cevap akışından çıkarılarak tesis içindeki tüm üretim istasyonlarının, makinelerin ve hatların ayrı ayrı keşfedilebileceği kontrollü bir dikey dilime dönüştürülmüştür.

### 1.1 Hiyerarşi Modeli
```text
Plant (Fabrika / Tesis)
 └── Production Area (Üretim Alanı)
      └── Production Line (Üretim Hattı)
           └── Station (İstasyon / Hücre)
                └── Machine / Device / Sensor (Makine, Kontrolör, Sensör)
```

### 1.2 İzole İstasyon Veri Modeli
* **`ot_stations`:** Projeye bağlı istasyon tanımlarını saklar (`id`, `project_id`, `area_name`, `line_name`, `station_code`, `station_name`, `station_type`, `machine_name`, `machine_manufacturer`, `machine_model`, `plc_or_controller`, `operator_count`, `status`, `sort_order`).
* **`ot_station_answers`:** Her bir istasyon için verilen cevapları izole saklar (`id`, `project_id`, `station_id`, `business_function_code`, `question_pack_id`, `question_pack_version`, `question_id`, `answer_data`).
* **Sıfır Çakışma ve İzolasyon:** İstasyon A için verilen cevaplar İstasyon B'ye veya projenin genel `question_answers` tablosuna kesinlikle sızmaz (`UNIQUE(project_id, station_id, question_id)`).

---

## 2. Gerçekleştirilen Değişiklikler ve Bileşenler

### 2.1 SQLite Şeması ve Migration 14
* `src/db/migrationDefinitions.ts` altına Migration 14 tanımlandı:
  * `ot_stations` tablosu ve `idx_ot_stations_project` indeksi.
  * `ot_station_answers` tablosu ve `idx_ot_station_answers_lookup` indeksi.
* `src/db/migrations.ts` baseline tespiti versiyon 14 olarak güncellendi.

### 2.2 Veritabanı ve Domain Katmanı
* `src/types/index.ts`: `OtStation`, `StationStatus`, `OtStationAnswer`, `OtStationsSummaryStats` tipleri eklendi.
* `src/db/client.ts`:
  * `getOtStations(projectId)`
  * `getOtStationById(id)`
  * `createOtStation(payload)` (Aynı projede tekil `station_code` denetimi)
  * `updateOtStation(id, payload)`
  * `toggleOtStationStatus(id, status)`
  * `deleteOtStation(id)` (Bağlı `ot_station_answers` kayıtlarının cascade silinmesi)
  * `getOtStationAnswers(projectId, stationId)`
  * `getOtStationAnswer(projectId, stationId, questionId)`
  * `saveOtStationAnswer(projectId, stationId, questionId, answerData)`
  * `getOtStationsSummary(projectId)` (Toplam istasyon, aktif, pasif, alan ve hat sayıları)

### 2.3 Taşınabilir Arşiv (.erpcrm Schema 14) ve Çoğaltma
* `src/types/backup.ts` ve `src/storage/backupManager.ts`:
  * `BACKUP_CURRENT_SCHEMA_VERSION = 14` olarak mühürlendi.
  * `.erpcrm` dışa aktarımında `ot_stations` ve `ot_station_answers` verileri ve manifest sayacı dahil edildi.
  * İçe aktarmada (`restoreProjectBackup`) istasyonlar ve cevapları yeni UUID'lerle haritalandırıldı.
  * Şablon çoğaltmada (`copyAnswers: false`) istasyon mimarisi korunurken cevaplar temizlendi.
  * Tam klonlamada (`copyAnswers: true`) istasyonlar ve cevapları yeni haritalandırılmış kimliklerle kopyalandı.

### 2.4 Raporlama ve Dışa Aktarım (Preview, DOCX, PDF)
* `src/report/types.ts`: `ReportOtStation`, `ReportOtStationsSummary` eklendi; `ReportModel.otStationsSummary` bağlandı.
* `src/report/builder.ts`: `getOtStations(projectId)` ile istasyonlar ve özet istatistikler çekilerek `ReportModel`'e dahil edildi.
* `src/views/ReportPreviewView.tsx`: HTML rapor önizlemesinde "3.2 Saha İstasyonları ve Makine Envanteri (OT/IT)" tablosu ve özet rozetleri eklendi.
* `src/export/docxExporter.ts`: Word çıktısında Bölüm 3.2 istasyon envanter tablosu ve durum etiketleri eklendi.
* `src/export/pdfExporter.ts`: Liberation Sans TrueType Unicode destekli Türkçe PDF çıktısında Bölüm 3.2 istasyon envanter tablosu eklendi.

### 2.5 Kullanıcı Arayüzü (UI)
* `src/components/modals/OtStationModal.tsx`:
  * İstasyon kodu, adı, alanı, hattı, tipi, makine üreticisi/modeli, PLC/kontrolör bilgisi, operatör sayısı ve durum seçimlerini içeren modal.
* `src/components/OtStationsSection.tsx`:
  * `OT_INDUSTRIAL_DATA` aktif olduğunda proje detay sayfasında beliren istasyon yönetim paneli.
  * İstasyon özet çipleri (toplam, aktif, alanlar, hatlar).
  * Tablo görünümü, durum değiştirme, inline silme onayı, düzenleme ve doğrudan istasyon keşif akışını başlatma butonu.
* `src/views/QuestionScreen.tsx`:
  * `station?: OtStation | null` desteği eklendi.
  * İstasyon bağlamında üst barda istasyon kodu ve adını içeren rozet gösterimi.
  * Cevapların istasyon bazlı izole yüklenmesi ve kaydedilmesi.
* `src/views/ProjectDetailView.tsx`:
  * `handleOpenStationQuestions(station)` ve soru ekranı dönüşünde istasyon bağlamının sıfırlanması entegrasyonu.

---

## 3. Test ve Kalite Güvencesi

* **Yeni Test Paketi:** `test/faz62b_ot_station_profile_test.ts` (17 Başlık, 76/76 PASS)
  * T01: Migration 14 SQLite şema ve indeks varlığı
  * T02: İstasyon oluşturma ve proje içi `station_code` tekilliği
  * T03: Çoklu projede aynı istasyon kodunun bağımsız kullanımı
  * T04: İstasyon güncelleme ve kod çakışma engeli
  * T05: İstasyon aktif/pasif durum değişimi
  * T06: Tekrarlayan istasyon cevap izolasyonu (Station A vs Station B)
  * T07: Proje düzeyi `question_answers` ile sıfır karışma
  * T08: İstasyon cevabı güncelleme (UPSERT)
  * T09: İstasyon silme ve cascade cevap temizliği
  * T10: `getOtStationsSummary` istatistik doğruluğu
  * T11: `buildReportModel` çıktısında istasyon özeti
  * T12: DOCX çıktısı Bölüm 3.2 uyumluluğu
  * T13: PDF çıktısı Türkçe karakter ve Bölüm 3.2 uyumluluğu
  * T14: `.erpcrm` Schema 14 yedekleme ve geri yükleme
  * T15: Şablon çoğaltma (istasyonlar korunur, cevaplar sıfırlanır)
  * T16: Tam klon çoğaltma (istasyonlar ve cevaplar kopyalanır)
  * T17: %100 Çevrimdışı, Zero-Egress ve AI-Free kuralları

---

## 4. Güvenlik ve Kapsam İzolasyonu Mührü

1. **Zero-Egress / %100 Offline-First:** Hiçbir ağ çağrısı veya harici bulut servisi eklenmemiştir.
2. **AI İzolasyonu:** Çalışma zamanında AI/LLM API çağrısı, anahtar veya geçidi bulunmamaktadır.
3. **Kapsam Sınırı:** Yalnızca `OT_INDUSTRIAL_DATA` için tekrarlayan istasyon mimarisi geliştirilmiş; genel amaçlı entity framework veya PLC/SCADA runtime entegrasyonu yapılmamıştır.
