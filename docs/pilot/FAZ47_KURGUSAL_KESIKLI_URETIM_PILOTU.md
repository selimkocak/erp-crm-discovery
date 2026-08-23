# ERP CRM Discovery — FAZ-47 Kurgusal Kesikli Üretim Saha Pilotu Raporu

> **ETİK VE GİZLİLİK BEYANI:**  
> Bu belgede ve test senaryolarında yer alan şirket adı (`[KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş.`), çalışan adları, veriler, finansal rakamlar, adresler ve belgeler **tamamen kurgusaldır**.  
> Hiçbir gerçek kişi, müşteri, tedarikçi veya kuruma ait veri içermez.

---

## 1. Pilot Şirket Profili ve Kesikli Üretim Modeli

* **Şirket Adı:** `[KURGUSAL] DeltaForm Endüstriyel Sistemler A.Ş.`
* **Ticari Unvanı:** DeltaForm Endüstriyel Mobilya San. ve Tic. A.Ş.
* **Sektör:** Endüstriyel ve Ofis Mobilyası Üretimi (Kesikli Üretim / Discrete Manufacturing)
* **Üretim Modeli:** Siparişe Özel Üretim (Make-to-Order) + Sınırlı Seri Standart Üretim (Make-to-Stock)
* **Çalışan Sayısı:** 285 (220 Mavi Yaka, 65 Beyaz Yaka)
* **Kullanıcı Sayısı:** ERP: 82 kullanıcı, CRM: 34 kullanıcı
* **Yıllık Sipariş Hacmi:** ~9.500 sipariş
* **Aktif Stok Kartı Sayısı:** 18.500 kart (Mükerrerlik oranı: ~%13)

### Lokasyon Yapısı (3 Lokasyon)
1. **Kocaeli Dilovası Fabrika Yerleşkesi:** Ana üretim tesisleri (Lazer, Abkant, Kaynak, CNC Ahşap, Döşeme, Montaj) ve Merkez Depo (210 çalışan)
2. **İstanbul Maltepe Ofisi:** Genel Müdürlük, Yurt İçi/Yurt Dışı Satış, Finans ve Tasarım Ekibi (55 çalışan)
3. **Bursa Nilüfer Bölge Deposu:** Marmara ve Ege lojistik aktarma ve tampon deposu (20 çalışan)

---

## 2. Taranan 20 İş Fonksiyonu ve Departman Kapsamı

Pilot analiz kapsamında işletmenin uçtan uca tüm değer zincirini kapsayan 20 iş fonksiyonu incelenmiştir:

| No | İş Fonksiyonu | Kapsanan Departman / Süreç | Soru Sayısı | Kritik Problem Tespiti |
|:---|:---|:---|:---:|:---:|
| 1 | `STRATEGY` | Yönetim Kurulu & Stratejik Planlama | 43 | Hedef KPI entegrasyonu |
| 2 | `MANAGEMENT` | Genel Yönetim ve Yönetişim | 43 | Süreç sahiplikleri |
| 3 | `PRODUCTION_PLANNING` | Üretim Planlama ve Kontrol (ÜPK) | 43 | 🔴 Excel kapasite darboğazı (`PRP-001`) |
| 4 | `WORK_ORDERS` | Metal, Ahşap ve Montaj Hatları | 43 | 🔴 E-posta ile reçete revizyonu (`WKO-001`) |
| 5 | `QUALITY` | Kalite Güvence ve Laboratuvar | 43 | 🔴 Hurda/red katalog eksikliği (`QLT-001`) |
| 6 | `MAINTENANCE` | Bakım Onarım Şefliği | 43 | 🔴 Reaktif plansız arıza duruşu (`MNT-001`) |
| 7 | `INVENTORY` | Stok ve Malzeme Yönetimi | 43 | 🔴 Mükerrer 2.400 stok kartı (`INV-001`) |
| 8 | `WAREHOUSE` | Fabrika ve Bursa Depoları | 43 | 🔴 Bursa deposu kör noktası (`WRH-001`) |
| 9 | `LOGISTICS` | Sevkiyat ve Dağıtım | 43 | 🔴 Nakliye masrafının siparişe dağıtılamaması (`LOG-001`) |
| 10 | `PROCUREMENT` | Satın Alma ve Tedarik | 43 | 🔴 Talep açan ile onaylayan aynı kişi (`PRC-001`) |
| 11 | `SUPPLIER_MANAGEMENT` | Tedarikçi İlişkileri | 43 | 🔴 Tedarikçi karne/puanlama eksikliği (`SUP-001`) |
| 12 | `SALES` | Proje Satış ve İhracat | 43 | 🔴 Kapasiteye sorulmadan termin verilmesi (`SAL-001`) |
| 13 | `PROPOSALS` | Teklif ve İhale Yönetimi | 43 | 🔴 Yetkisiz iskonto tanımları (`PRP-002`) |
| 14 | `CRM` | Müşteri İlişkileri ve Servis | 43 | Satış sonrası şikayet takibi |
| 15 | `ACCOUNTING` | Genel Muhasebe ve E-Dönüşüm | 43 | Dönem sonu fiili maliyet mutabakatı |
| 16 | `COSTING` | Maliyet Muhasebesi | 43 | 🔴 Fiili maliyet sapması (`CST-001`) |
| 17 | `TREASURY` | Finans ve Hazine | 43 | 🔴 Süpervizör ortak şifre kullanımı (`TRS-001`) |
| 18 | `HUMAN_RESOURCES` | İnsan Kaynakları | 43 | Yetkinlik ve norm kadro analizi |
| 19 | `PAYROLL` | Bordro ve Puantaj | 43 | 🔴 PDKS Excel manuel puantaj aktarımı (`PAY-001`) |
| 20 | `IT_INFRASTRUCTURE` | Bilgi Teknolojileri | 43 | 🔴 12 aydır yapılmayan restore tatbikatı (`ITI-001`) |

*Toplam Soru Sayısı:* **860 Soru Cevabı**  
*Özel Kurgulanmış Kritik Problem:* **15 Adet**  
*Takip Bayrakları:* **35 Adet** (15 Kritik Takip 🔴, 20 Sonra Dön 🟡)  
*Proje Notları:* **12 Adet**  
*Özel Sorular (Custom Questions):* **8 Adet** (Fason takip, fire, CNC, vb.)

---

## 3. FAZ-46 Yönetişim Katmanı Uygulaması

Pilot veri setinde kurumsal yönetişim olgunluğunu ölçmek üzere aşağıdaki yapılar tam olarak modellendi:

1. **23 Başlangıç Yönetişim Nesnesi (Governance Objects):** Stok Kartı (`GO_ITEM_MASTER`), Cari Kart (`GO_CUSTOMER_MASTER`, `GO_VENDOR_MASTER`), Ürün Ağacı (`GO_BOM`), Satın Alma Siparişi (`GO_PURCHASE_ORDER`), Satış Siparişi (`GO_SALES_ORDER`), vb.
2. **18 Yönetişim Öznesi (Governance Subjects):**
   * 8 Rol (Genel Müdür, Fabrika Müdürü, CFO, Satın Alma Müdürü, Satış Direktörü, vb.)
   * 4 Grup (Satış Ekibi, Muhasebe Uzmanları, Satın Alma Uzmanları, Depo Sorumluları)
   * 6 Sentetik Kullanıcı (`[Kurgusal] Can Demir`, `[Kurgusal] Elif Kaya`, `[Kurgusal] Murat Çelik`, vb.)
3. **10 Kapsam (Governance Scopes):** Şirket Geneli, Fabrika, Merkez Ofis, Bursa Depo, Metal Hattı, Ahşap Hattı, Döşeme Hattı, vb.
4. **30 Sorumluluk Ataması (Responsibilities):** 15 As-Is ve 15 To-Be Data Owner / Data Steward ataması.
5. **40 Yetki Matrisi Kaydı (Authorizations):**
   * 6 Efektif Sapma (Discrepancy) tespit edildi (Örn. Satış temsilcisinin yetki grubundan dolayı malzeme kartı açabilmesi, muhasebe şefinin fiilen banka ödeme onayı yapabilmesi).
6. **8 Onay Limiti (Governance Limits):** Satın alma kademeleri, iskonto limitleri, banka ödeme limitleri.
7. **10 Görevler Ayrılığı (SoD) Riski:**
   * 🔴 Tedarikçi kartı açan ile banka ödemesi hazırlayanın aynı kullanıcı olması (`sod-p01`)
   * 🔴 Satın alma talebi oluşturan uzmanın kendi siparişini onaylayabilmesi (`sod-p02`)
   * 🔴 Depo şefinin sayım fark fişini tek başına silebilmesi (`sod-p05`)

---

## 4. İki Rapor Çevrimi ve Revizyon Deltası

Uçtan uca pilot testi, saha analizinin iki aşamalı döngüsünü simüle etmiştir:

```
[İlk Keşif Analizi] ──> İlk DOCX/PDF Raporu ──> [Revizyon & İyileştirme] ──> Revize DOCX/PDF Raporu
```

### Revizyon İyileştirmeleri:
1. `PRP-001` cevabı "Excel kapasite planlaması" durumundan "ERP MRP ve Kapasite Modülü Devreye Alındı" durumuna revize edildi.
2. `WKO-001` cevabı "E-posta talimatı" durumundan "Mühendislik Değişiklik Yönetimi (ECN)" durumuna güncellendi.
3. `INV-001` cevabı "Mükerrer serbest metin kartlar" durumundan "Akıllı tekil kodlama ve barkod temizliği" durumuna güncellendi.
4. `sod-p01` ve `sod-p02` SoD riskleri operasyonel önlemlerle `mitigated` statüsüne taşındı.
5. Kanıt kasasında taslak doküman kaldırılarak temizlenmiş ana veri kataloğu (`att-p11`) eklendi.
6. Hem ilk rapor hem revize rapor DOCX ve PDF formatlarında sıfır kayıpla başarıyla üretildi.
