---
name: report-consistency
description: Rapor veri modeli, sayaç tutarlılığı, UI / PDF / DOCX paritesi ve sıfır undefined denetimi becerisidir.
---

# report-consistency Becerisi

## 1. Amaç
Raporlama motorunda (`buildReportModel`), Rapor Önizleme ekranında, PDF ve Word (DOCX) çıktılarında bütün metriklerin aynı kanonik sayaç kurallarına uymasını ve veri sızıntısı olmamasını sağlamak.

## 2. Kullanım Koşulları
* Raporlama, özet istatistikler (`summaryStats`), PDF/DOCX dışa aktarımı veya soru sayaçları değiştirildiğinde kullanılır.
* Pilot projeler (Marmara Endüstriyel vb.) doğrulanırken zorunludur.

## 3. Girdiler
* [src/report/builder.ts](file:///src/report/builder.ts), [src/report/formatters.ts](file:///src/report/formatters.ts), [src/report/types.ts](file:///src/report/types.ts)
* [src/export/pdfExporter.ts](file:///src/export/pdfExporter.ts), [src/export/docxExporter.ts](file:///src/export/docxExporter.ts)
* [src/views/ReportPreviewView.tsx](file:///src/views/ReportPreviewView.tsx)

## 4. Uygulama Adımları
1. **Merkezi Kanonik Sayaç:** Tüm cevap sayımlarını [src/report/formatters.ts](file:///src/report/formatters.ts) altındaki `isValidAnswer` fonksiyonu üzerinden yap.
2. **Parite Denetimi:** UI sayaçları = PDF sayaçları = DOCX sayaçları eşitliğini doğrula.
3. **Formatlı Metinler:** Ham enum değerleri (`251_500`, `active`) yerine kullanıcı dostu etiketleri (`251–500`, `Aktif`) kullan.
4. **Sıfır Sızıntı:** PDF ve DOCX metinlerinde `undefined`, `null`, `[object Object]` veya `Invalid Date` bulunmadığını `PDFParse` ile test et.
5. **Kapsam İzolasyonu:** Pasif/kapsam dışı bırakılmış iş fonksiyonlarının cevaplarını veritabanında koru ancak aktif rapor sayaçlarına dahil etme.
6. **Süreç vs Soru Ayrımı:** Tamamlanan iş fonksiyonu sayısı (örn. 9/19) ile cevaplanan soru sayısını (örn. 94/427) birbirine karıştırma.

## 5. Doğrulama
* PDF çıktı metninde `undefined` ve `Invalid Date` sayısı 0 olmalıdır.
* Rapor kapak bilgileri veritabanı şirket künyesiyle birebir eşleşmelidir.

## 6. Yasaklar
* ❌ Opsiyonel sorulara verilen geçerli cevapları sayaçtan dışlamak.
* ❌ Fonksiyon durumu `in_progress` veya `not_started` diye geçerli cevapları saymamak.
* ❌ Modüller arasında aynı `question_id` (örn. `INV-001`) çakışmasını yanlış tekilleştirmek (bileşik kimlik: `business_function_code + question_id`).

## 7. Teslim Çıktısı
* %100 tutarlı, güvenilir ve doğrulanmış `ReportModel` ve PDF/DOCX çıktıları.
