# FAZ-62A — Saha Veri Toplama, OT/IT ve Endüstriyel Veri Keşfi Teslim ve Kabul Raporu

**ERP CRM Discovery** platformuna 34. kanonik iş fonksiyonu olarak **`OT_INDUSTRIAL_DATA`** (Saha Veri Toplama ve Endüstriyel Veri Keşfi) modülü ve `tr.ot_industrial_data.core v0.1.0` soru paketi başarıyla entegre edilmiştir.

Bu modül, **"Önce İş Hedefi ve Karar, Sonra Ölçüm ve Protokol"** (Purpose-Driven Industrial Data Discovery) felsefesiyle tasarlanmış olup sahadaki veriyi iş ihtiyacından başlayarak keşfeder.

---

## 1. Modül Kimliği ve Mimari Sınırlar

* **İş Fonksiyonu Kodu (Canonical Code):** `OT_INDUSTRIAL_DATA`
* **Görünen Başlık (Display Name):** `Saha Veri Toplama ve Endüstriyel Veri Keşfi`
* **Paket Kimliği (Canonical Package):** `tr.ot_industrial_data.core`
* **Sürüm / Şema:** `v0.1.0` / Şema Sürümü: `1`
* **Kategori:** `Üretim` (Production)
* **Sıralama (Sort Order):** `34`
* **Takma Adlar (Aliases):** `OT_DATA`, `OT_DISCOVERY`, `ENDUSTRIYEL_VERI`, `SAHA_VERI_TOPLAMA`, `OT_IT_DISCOVERY`, `OT_VERI`, `FIELD_DATA`

### Katı Mimari Sınırlar:
1. **Sıfır Dışa Aktarım (Zero-Egress):** %100 çevrimdışı (offline-first) masaüstü mimarisi korunmuştur.
2. **Runtime AI İzolasyonu:** Gemini/AI hiçbir runtime API çağrısına veya kütüphanesine bağlanamaz; sıfır bulut bağımlılığı.
3. **Runtime PLC / SCADA / OPC Bağlantı İzolasyonu:** Bu modül bir PLC sürücüsü veya SCADA veri toplayıcısı **değildir**. Saha karar ve veri gereksinim keşif aracıdır.
4. **Sentetik İzolasyon:** Tuna Ofis veya gerçek müşteri verisi içermez.

---

## 2. Soru Paketi İstatistikleri ve Bölüm Dağılımı

| Metrik | Değer |
| :--- | :--- |
| **Toplam Soru Sayısı** | **58 Soru** (`OTD-001` .. `OTD-058`) |
| **Zorunlu Sorular (Required)** | **39 Soru** (%67.2) |
| **Opsiyonel Sorular (Optional)** | **19 Soru** (%32.8) |
| **Koşullu Dallanma Noktaları (Branching)** | **9 Koşul** |
| **Zorunlu Bölüm Sayısı** | **18 Bölüm** |

### 18 Zorunlu Bölümün Dağılımı:

1. **OT genel profil** (`OTD-001`..`OTD-003`): OT olgunluk düzeyi, birincil iş hedefi, OT/IT sorumluluk paylaşımı.
2. **Fabrika, üretim alanı ve hat yapısı** (`OTD-004`..`OTD-006`): Tesis hiyerarşisi (Plant/Area/Line), hat sayısı, hatlar arası yarı mamul tampon alanları.
3. **İstasyon profili** (`OTD-007`..`OTD-009`): Homojen/heterojen makine çeşitliliği, anlık durum sinyalleri (Run/Idle/Alarm/Setup), Andon ışıklı ikaz kuleleri.
4. **Üretim amacı ve karar ihtiyacı** (`OTD-010`..`OTD-012`): Tetiklenecek yönetim kararları, OEE hedefleri, amaca yönelik veri prensibi ("Bütün verileri toplayalım" risk denetimi).
5. **Girdiler ve malzeme tüketimi** (`OTD-013`..`OTD-015`): Hammadde tüketim takibi (Backflush, tartım, silo sensörü), minimum seviye eşiği & ikmal, hammadde değişkenliği.
6. **Çıktılar, üretim miktarı ve fire** (`OTD-016`..`OTD-018`): Çıktı sayacı yöntemi (PLC enkoder, fotosel, vizyon), çok gözlü kalıp çarpanı, fire/hurda ayrıştırma.
7. **Enerji** (`OTD-019`..`OTD-021`): Enerji alt ölçüm (submetering) seviyesi, birim ürün enerji maliyeti/tepe güç kararları, Modbus RTU/TCP ve sayaç haberleşmesi.
8. **Operatör ve manuel veri girişi** (`OTD-022`..`OTD-024`): Panel PC/HMI/tablet arayüzleri, RFID operatör login/yetkilendirme, duruş nedeni seçme zorunluluğu.
9. **Kalite ve laboratuvar cihazları** (`OTD-025`..`OTD-027`): CMM, spektrometre ve dijital test cihazları, otomatik PDF/CSV/COM aktarımı, tolerans dışı (FAIL) durumunda kilit/karantina aksiyonu.
10. **Makine sağlığı ve bakım** (`OTD-028`..`OTD-030`): Titreşim/sıcaklık durum izleme, CMMS otomatik bakım emri açma, kalıp/takım aşınma ömrü (tool life).
11. **Alarm ve aksiyon** (`OTD-031`..`OTD-033`): ISA-18.2 alarm sınıflandırması, her alarm için sorumlu/SLA/SOP ("Alarm = Aksiyon"), kök neden (Pareto/5 Neden) analizi.
12. **İş güvenliği / safety sınırı** (`OTD-034`..`OTD-036`): Donanımsal Safety bağımsızlığı ve salt-okunur durum loglama, İSG/CE direktifi uyumu, ERP'nin safety kontrolü yapamayacağı ilkesi.
13. **PLC, controller ve sensör altyapısı** (`OTD-037`..`OTD-039`): Siemens, Omron, Schneider, Beckhoff, Rockwell marka envanteri; OPC-UA, Modbus, Profinet, MQTT protokolleri; PLC kaynak kod/şifre erişim yetkisi.
14. **Legacy makine ve retrofit seçenekleri** (`OTD-040`..`OTD-042`): Akılsız/eski makinelere harici kutu/sensör ekleme stratejisi, garanti durumu, CNC üretici API'leri (Fanuc Focas, Heidenhain, Sinumerik).
15. **Veri frekansı ve veri hacmi** (`OTD-043`..`OTD-045`): Olay bazlı vs periyodik telemetri frekansı, anlık etiket/tag sayısı, Historian (Time-Series DB) vs ERP ayrımı.
16. **Edge, gateway ve network** (`OTD-046`..`OTD-048`): Purdue Modeli Seviye 0-3 DMZ/VLAN ağ izolasyonu, DIN-ray endüstriyel edge gateway rolü, Store & Forward yerel veri tamponlama.
17. **ERP/MES/QMS/CMMS/WMS entegrasyon ihtiyacı** (`OTD-049`..`OTD-052`): Hedef kurumsal sistemler, REST API / Message Queue / Staging entegrasyon yöntemi, otomatik dosya tarama (ingestion), reçete indirme (Recipe Download) sınırları.
18. **İş değeri ve önceliklendirme** (`OTD-053`..`OTD-058`): ROI alanları, risk faktörleri (OEM direnci, alarm yorgunluğu), pilot hat yaklaşımı, offline veri güvenliği, "Bu veriye gerçekten ihtiyaç var mı?" doğrulaması, nihai yönetim yol haritası beklentisi.

---

## 3. İş Hedefinden Teknik Keşfe Geçiş Modeli

Modülün temel soru akışı şu sıralı mantık zincirini uygular:

```text
1. İş Hedefi (Business Goal)          → OTD-002 (OEE artışı, hurda azaltma, maliyet kontrolü)
      ↓
2. Karar & Aksiyon (Decision & Action) → OTD-010 (İş emri teyidi, bakım emri açma, ikmal)
      ↓
3. Gerekli Bilgi (Information Need)   → OTD-012, OTD-057 ("Bu veriye gerçekten ihtiyaç var mı?")
      ↓
4. Ölçüm & Sinyal (Measurement)       → OTD-008, OTD-016, OTD-019, OTD-028 (Durum, Sayaç, Enerji, Titreşim)
      ↓
5. Veri Kaynağı (Data Source)         → OTD-022, OTD-025, OTD-037, OTD-040 (Operatör, CMM, PLC, Retrofit)
      ↓
6. Teknik Protokol (Protocol)         → OTD-038, OTD-046 (OPC-UA, Modbus, MQTT, Profinet, DMZ/VLAN)
      ↓
7. Hedef Sistem & Depolama            → OTD-045, OTD-049, OTD-050 (Historian, ERP, MES, CMMS, REST API)
```

---

## 4. Koşullu Dallanma (Branching) Noktaları Özeti

| Tetikleyici Soru | Tetikleyici Değer | Açılan Koşullu Soru | Açıklama |
| :--- | :--- | :--- | :--- |
| **OTD-013** | `silo_tank_seviye_ve_debi_sensorleri_ile_otomatik` | **OTD-014** | Silo/tank sensörü varsa eşik uyarısı ve otomatik ikmal mekanizması sorulur. |
| **OTD-016** | `plc_ve_sensor_uzerinden_otomatik_cevrim_sayaci` | **OTD-017** | PLC sayaç sinyali varsa kalıp göz sayısı (cavity) ve vuruş çarpanı açılır. |
| **OTD-019** | `makine_ve_istasyon_bazinda_alt_olcum_submetering` | **OTD-020** | Makine alt ölçüm varsa enerji maliyet/kaçak karar hedefleri açılır. |
| **OTD-025** | `cmm_spektrometre_ve_dijital_test_cihazlari_aktif_kullanilir` | **OTD-026** | Dijital kalite cihazı varsa PDF/CSV/COM aktarım yöntemi açılır. |
| **OTD-028** | `titresim_sicaklik_ve_akım_sensorleri_ile_anlik_telemetri` | **OTD-029** | Anlık telemetri varsa CMMS bakım iş emri entegrasyonu açılır. |
| **OTD-031** | `isa182_uyumlu_onceliklendirilmis_ve_filtrelenmis_alarm_hiyerarsisi` | **OTD-032** | ISA-18.2 hiyerarşisi varsa sorumlu/SLA/SOP detayları açılır. |
| **OTD-034** | `safety_tamamen_donanimsal_bagimsizdir_yalnizca_durum_sinyali_okunur` | **OTD-035** | Donanımsal safety seçildiğinde İSG loglama ihtiyaçları açılır. |
| **OTD-046** | `guvenlik_duvari_dmz_ve_ayrik_vlan_mimarisi_kullanilmaktadir` | **OTD-047** | DMZ/VLAN varsa Endüstriyel Edge Gateway kullanım rolü açılır. |
| **OTD-050** | `dosya_transferi_csv_excel_xml_ftp_klasor_izleme` | **OTD-051** | Dosya transferi seçildiğinde otomatik klasör izleme (ingestion) açılır. |

---

## 5. Mevcut Modüllerle Sınır İlişkisi (Boundary Matrix)

`OT_INDUSTRIAL_DATA` modülü diğer modüllerin yerine geçmez; saha verisi katmanını keşfederek diğer modüllere girdi sağlar:

* **`MAINTENANCE` (Bakım):** Bakım iş emri yaşam döngüsü, periyodik bakım takvimi ve arıza kök nedeni `MAINTENANCE` modülünde analiz edilir; `OT_INDUSTRIAL_DATA` ise makinenin titreşim/çalışma saati sinyalinin sahadan nasıl okunacağını keşfeder.
* **`PRODUCTION_PLANNING` (Üretim Planlama):** MPS, MRP ve çizelgeleme `PRODUCTION_PLANNING` modülündedir; `OT_INDUSTRIAL_DATA` hat ve istasyonların fiilî çevrim süresi ve hız kaybı telemetrisini keşfeder.
* **`WORK_ORDERS` (İş Emirleri):** Rota adımları ve operatör teyidi `WORK_ORDERS` modülündedir; `OT_INDUSTRIAL_DATA` istasyon sayacı ve PLC vuruşunun iş emriyle nasıl eşleneceğini keşfeder.
* **`QUALITY` (Kalite):** Muayene planları ve uygunsuzluk tutanakları `QUALITY` modülündedir; `OT_INDUSTRIAL_DATA` CMM, terazi ve test cihazı dosya/seri port entegrasyonunu keşfeder.
* **`INFORMATION_TECHNOLOGY` (BT / IT):** Kurumsal ofis ağları, AD ve sunucu altyapısı `INFORMATION_TECHNOLOGY` modülündedir; `OT_INDUSTRIAL_DATA` saha Purdue Seviye 0-3 ağları, DMZ ve PLC ağlarını keşfeder.

---

## 6. Doğrulama ve Kabul Test Sonuçları

| Test Paketi | Kapsam | Sonuç |
| :--- | :--- | :--- |
| **`test/faz62a_ot_industrial_data_test.ts`** | T01-T18 (Metadata, Validator, 58 Soru, 18 Bölüm, Branching, Progress, DOCX/PDF, Loader, Boundary, Rules) | **58 PASS / 0 FAIL** |
| **`scripts/audit_question_corpus.mjs`** | 35 Paket, 1.550 Soru, 831 Zorunlu, 222 Branching Bütünlük Denetimi | **0 HATA / TEMİZ** |
| **`test/faz48_generator_reproducibility_test.ts`** | Generator Çıktı Determinizmi | **8 PASS / 0 FAIL** |
| **`test/faz48_corpus_quality_test.ts`** | Külliyat Sayısal Kalite ve Bütünlük Testi | **12 PASS / 0 FAIL** |
| **`test/faz48_business_function_boundary_test.ts`** | Modül İzolasyon Sınır Testi | **36 PASS / 0 FAIL** |
| **`test/faz60_agent_architecture_test.ts`** | Ajan Mimarisi Sözleşme Testi | **87 PASS / 0 FAIL** |
| **`test/faz61_agent_operational_and_schedule_integrity_test.ts`** | Operasyonel Saha ve Takvim Bütünlüğü | **55 PASS / 0 FAIL** |
| **`npm test` (73 Test Paketi)** | 73 Test Paketi, 1.960+ Test | **%100 PASS (0 HATA)** |
| **`npm run build`** | TypeScript + Vite Frontend Derlemesi (1946 modül) | **0 HATA (BAŞARILI)** |
| **`cargo check`** | Rust Tauri Backend Kontrolü | **0 HATA (BAŞARILI)** |

---

## 7. FAZ-62B İçin Açık Teknik İhtiyaçlar ve Sonraki Adım

FAZ-62A kapsamında çekirdek soru paketi ve kanonik veri modeli mühürlenmiştir. Bu fazda kasıtlı olarak uygulanmayan ve **FAZ-62B** aşamasına bırakılan konular şunlardır:

1. **İstasyon Varlık Modeli (Repeatable Station Entity):** Fabrika hiyerarşisi altında (`Plant → Area → Line → Station`) her bir istasyon/makine için bağımsız profil kartı ve tekrarlı soru-cevap veri modeli.
2. **Dinamik İstasyon Akışı UI:** Kullanıcının sahada istediği kadar makine/istasyon ekleyip her birinin PLC/sensör/protokol profilini ayrı ayrı doldurabileceği çoklu istasyon formu.
3. **Cihaz & Protokol Kütüphanesi:** Popüler PLC ve kalite cihazları için hazır marka/model şablonları.
