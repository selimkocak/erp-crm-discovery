# ERP CRM Discovery — Marmara Sentetik Pilotu Saha Kabul Rehberi (Pilot Acceptance Guide)

> **Belge Kodu:** `DOC-REV-FAZ67-003`  
> **Sürüm:** `v0.1.4`  
> **Sentetik Aktör:** Marmara Endüstriyel Sistemler A.Ş. (Bursa Nilüfer OSB)  
> **Sektör:** Kesikli İmalat (Discrete Manufacturing — Endüstriyel Makine ve Otomasyon Ekipmanları)  
> **Gizlilik / Veri İlkesi:** %100 Kurgusal ve Sentetik Pilot Veri Seti (Sıfır Gerçek Müşteri Verisi)  

---

## 1. Sentetik Pilotun Amacı ve Kapsamı

**Marmara Endüstriyel Sistemler A.Ş.**; ERP CRM Discovery platformunun tüm modüllerini, veri ilişkilerini, OT/IT entegrasyon katmanını, yönetişim matrislerini ve raporlama çıktılarını uçtan uca test etmek amacıyla oluşturulmuş **deterministik, sentetik bir referans pilot projedir**.

Bu pilot; gerçek bir müşterinin gizli ticari verilerini ifşa etmeden, tipik bir orta-büyük ölçekli (350 çalışanlı, 3 lokasyonlu) imalat işletmesinin karmaşık ERP/CRM dönüşüm senaryosunu canlandırır.

---

## 2. Pilot Şirket Profili ve Temel Parametreler

```text
Firma Adı:         Marmara Endüstriyel Sistemler A.Ş.
Kısa / Ticari Adı: Marmara Endüstriyel
Şehir / Ülke:      Bursa / Türkiye (Nilüfer OSB)
Çalışan Sayısı:    251–500 (350 Kişi)
Faaliyet Alanı:    Endüstriyel Makine ve Ekipman Üretimi (Kesikli İmalat)
Şube Durumu:       Evet (3 Lokasyon: Merkez Fabrika, Talaşlı İmalat Şubesi, İstanbul Satış Ofisi)
Proje Takvimi:     2026-09-01 — 2026-11-24 (5 Dalgalı Uygulama Modeli)
Proje Durumu:      Aktif (active)
```

---

## 3. Adım Adım Pilot Kabul ve Doğrulama Protokolü

### Adım 1: Sentetik Pilotun Oluşturulması
1. ERP CRM Discovery ana ekranında (`HomeView`) **[Örnek Pilot Proje Oluştur]** butonuna tıklayın.
2. Açılan onay modalında **"Marmara Endüstriyel Sistemler A.Ş. pilot projesini yükle"** onayını verin.
3. Sistem arka planda 14 aşamalı atomik tohumlama (`src/demo/manufacturingPilot.ts`) çalıştırarak projeyi hazır hale getirir.

---

### Adım 2: İş Fonksiyonları ve Soru Cevaplarının Doğrulanması (Bölüm 1-2)
- **Aktif Fonksiyon Sayısı:** 19 Kanonik İş Fonksiyonu (Satış, Satın Alma, Depo, Stok, Lojistik, Muhasebe, Finans, Bütçe, Raporlama, CRM, Teklif, Kalite, Bakım, Üretim Planlama, İş Emirleri, Maliyet, Sabit Kıymet, İK, OT Endüstriyel Veri).
- **Kayıtlı Cevap Sayısı:** 94 Kanonik Cevap (`AnswerData` formatında seçenekler, açıklamalar ve notlar).
- **İlerleme Durumu:** 9 Fonksiyon Tamamlandı, 10 Fonksiyon Devam Ediyor, 0 Başlanmadı.
- **Doğrulama Kriteri:** Her 19 fonksiyonun içine girildiğinde cevapların eksiksiz yüklendiği ve soru navigatöründe yeşil/mavi durumların tutarlı olduğu görülmelidir.

---

### Adım 3: OT İstasyon Hiyerarşisi ve Veri Matrisi Doğrulaması (Bölüm 3)
- **Tanımlı OT İstasyonu:** 11 İstasyon (CNC İşleme Merkezi 1-2, Lazer Kesim, Robotik Kaynak Hücresi, Otomatik Boyahane, Montaj Hattı 1-2, Test & Kalite İstasyonu, PLC Paketleme, Basınçlı Hava Kompresör Dairesi, AGV Taşıma Filosu).
- **Hiyerarşik Düzey:** `Plant: Bursa Ana Fabrika` -> `Area: İmalat & Montaj` -> `Line: Hat 1-4` -> `Station` -> `Machine`.
- **Endüstriyel Veri Matrisi:** 58 OT sorusunun istasyon bazlı cevapları (Siemens S7-1500, Modbus TCP, OPC-UA, Dark Data durumu, enerji analizörü).
- **Doğrulama Kriteri:** Proje detayında "OT İstasyonları" ve "OT Veri Matrisi" sekmelerinde istasyon profilleri ve veri gereksinimleri listelenmelidir.

---

### Adım 4: Süreç Haritaları ve Benimseme Riski Analizi (Bölüm 4)
- **Tanımlı Süreç Haritası:** 4 Temel Süreç Haritası (Siparişten Teslimata, Satın Almadan Ödemeye, Üretim Emrinden Stoklamaya, Kalite Red ve DÖF Yönetimi).
- **BPMN Elemanları:** Başlangıç/Bitiş olayları, görevler (Task), karar kapıları (Gateway), havuzlar (Pool/Lane).
- **Karmaşıklık ve Risk Skoru:** 7 onay döngüsü içeren satın alma sürecinde **"Yüksek Benimseme Riski" (High Adoption Risk)** uyarısının görüntülendiği doğrulanmalıdır.

---

### Adım 5: Veri Sahipliği, Yetki Sapmaları ve SoD Riskleri (Bölüm 5)
- **Yönetişim Nesneleri:** 5 Kanonik Nesne (Malzeme Ana Verisi, Tedarikçi Ana Verisi, Ürün Reçetesi/BOM, Satın Alma Siparişi, Yevmiye Fişi).
- **RACI Sorumlulukları:** Data Owner (Veri Sahibi) ve Data Steward (Veri Sorumlusu) atamaları.
- **Yetki Sapması (Discrepancy):** Planlanan RACI ile fiili yetkiler arasındaki 2 adet yetki sapması.
- **SoD Çakışması:** Satın alma siparişi açan kullanıcının aynı zamanda mal kabul ve fatura onayı yapabilmesi (`CHK-GOV-03` SoD çakışması) tespit edilmiş ve `BLOCKED` olarak işaretlenmiştir.

---

### Adım 6: Saha Kanıtları ve Doğrulama Kayıt Defteri (Bölüm 6)
- **Kayıtlı Kanıt Sayısı:** 3 Fiziksel Saha Kanıtı (`sayim_tutanagi.pdf`, `plc_network_topolojisi.png`, `kalite_cmm_olcum_raporu.pdf`).
- **Doğrulama Durumları:** 2 Kabul Edildi (`ACCEPTED`), 1 İncelemede (`UNREVIEWED`).
- **Kanıtsız Kritik Konu:** Fiyat onay matrisi için kanıt yüklenmediğinden 1 adet `unsupportedCriticalFinding` uyarısı üretilmelidir.

---

### Adım 7: Go-Live Hazırlığı ve Pilot Saha Kabulü (Bölüm 7)
- **Standart Kontrol Listesi:** 8 Kategoride 24 Kontrol Maddesi tohumlanmış durumdadır.
- **Hazırlık Skoru:** %50–%70 bandında hesaplanır (tamamı hazır değildir; Marmara pilotu bilinçli olarak açık aksiyonlar içerir).
- **Kritik Kural:** `CHK-GOV-03` SoD çakışması `BLOCKED` olduğu için proje **"Keşif Hazırlığı Sürüyor"** durumundadır; asla "Keşif İncelemesi Tamamlandı" veya "Go-Live Onaylandı" **diyemez**.
- **Feragat Uyarısı:** `Bu bölüm uygulama öncesi keşif hazırlığını gösterir; canlıya geçiş onayı değildir.`

---

### Adım 8: HTML / DOCX / PDF Çıktı Paritesi ve Sıfır Undefined Denetimi
1. Proje Detay sayfasında **[Raporu Görüntüle]** (İndigo buton) tıklanır.
2. Sol TOC navigasyonunda 8 bölümün tamamının yer aldığı görülür.
3. **Word (.docx)** indirilir; Word içinde tüm tabloların renkli ve düzgün hizalandığı kontrol edilir.
4. **PDF (.pdf)** indirilir; Türkçe karakterlerin (`ğ, ü, ş, ı, ö, ç, İ`) bozulmadığı, sayfa taşmalarının olmadığı doğrulanır.
5. PDF ve DOCX metinlerinde `undefined`, `null` veya `Invalid Date` aranır (**0 eşleşme olmalıdır**).

---

## 4. Kullanıcı Kabul Testi (UAT) Kontrol Listesi

| No | Kontrol Maddesi | Beklenen Sonuç | UAT Sonucu |
|:---:|---|---|:---:|
| 1 | Demo Proje Tek Tıkla Oluşturma | Hata vermeden Marmara Endüstriyel projesini açar | [ ] PASS |
| 2 | 19 Fonksiyon & 94 Cevap Bütünlüğü | Sayaç 94/427 (%22) gösterir; cevaplar okunur | [ ] PASS |
| 3 | 11 İstasyonlu OT Hiyerarşisi | İstasyon listesi ve veri matrisi eksiksiz listelenir | [ ] PASS |
| 4 | Süreç Haritası & Benimseme Riski | 4 harita çizilir; karmaşık süreçte risk uyarısı verir | [ ] PASS |
| 5 | RACI & SoD Risk Yönetişimi | 5 nesne, yetki sapmaları ve SoD çakışması listelenir | [ ] PASS |
| 6 | Kanıt Kasası & SHA-256 İkiz Kopya | Ekli dosyalar izole kasadan açılır; hash doğrulanır | [ ] PASS |
| 7 | Go-Live Hazırlık Kontrol Listesi | 24 madde listelenir; bloke madde varken hazır saymaz | [ ] PASS |
| 8 | Feragat Uyarısı Görünürlüğü | Rapor ve UI'da canlıya geçiş onayı olmadığı yazar | [ ] PASS |
| 9 | HTML / DOCX / PDF Sayaç Paritesi | Üç formatta da cevap, bulgu ve risk sayıları eşittir | [ ] PASS |
| 10 | Sıfır Ağ Bağımlılığı & Zero-Egress | Ağ kapalıyken tüm sistem tam fonksiyonel çalışır | [ ] PASS |

---

## 5. Bilinen Sınırlamalar ve Sınır Çizgileri

1. **Sentetik Pilot Gerçek ERP Entegrasyonu Yapmaz:** Marmara A.Ş. verileri yerel SQLite içinde simüle edilir; gerçek bir SAP/Oracle veritabanına bağlanmaz.
2. **Canlı Kullanıcı Yetkilendirmesi İçermez:** Uygulama tek kullanıcılı masaüstü aracıdır; Active Directory üzerinden rol doğrulaması yapmaz.
3. **Otomatik Karar Vermez:** Karar matrisi matematiksel bir hazırlık yüzdesi üretir; nihai uygulama onayını insan proje yöneticisine bırakır.
