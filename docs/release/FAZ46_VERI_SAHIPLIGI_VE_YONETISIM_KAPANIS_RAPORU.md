# ERP CRM Discovery — FAZ-46 Kapanış Raporu

**Faz:** FAZ-46 — Veri Sahipliği, Yetkiler ve Sorumluluk Yönetişimi (Data Governance, Authorizations & SoD)  
**Tarih:** 23 Ağustos 2026  
**Durum:** %100 Tamamlandı (PASS)  
**Geliştirici & Bakımcı:** Selim Koçak (selimkocak@gmail.com)  
**Lisans:** MIT  
**Masaüstü İlkeleri:** %100 Çevrimdışı (Offline-First), Sıfır Bulut (Zero-Cloud), Yapay Zekâsız (AI-Free), İnsan Odaklı (Human-Led), Kanıt Odaklı (Evidence-First).

---

## 1. Fazın Amacı ve Kapsamı

ERP CRM Discovery projesinin 46. fazında, kurumsal ERP/CRM projelerinin en kritik başarı faktörlerinden biri olan **Veri Sahipliği (Data Ownership)**, **Sorumluluk Matrisi (Responsibilities)**, **İşlem Düzeyi Yetki Matrisi (Authorization Matrix)**, **Onay Limitleri (Approval Limits)** ve **Görevler Ayrılığı Riskleri (Segregation of Duties - SoD)** uçtan uca tek bir entegre mimariyle sisteme kazandırılmıştır.

Uygulama; operasyonel bir IAM/yetkilendirme motoru veya ERP içi ACL yazılımı olmayıp, saha analizinde mevcut (As-Is) ve hedef (To-Be) yönetişim boşluklarını, sahipsiz verileri, kritik yetki sapmalarını ve SoD risklerini tespit eden **keşif ve denetim aracı** olarak konumlandırılmıştır.

---

## 2. Mimari Kararlar ve Uygulanan Standartlar

| Mimari Alan | Alınan Karar & Standart | Gerçekleşen Sonuç |
| :--- | :--- | :--- |
| **Yönetişim Özneleri** | `governance_subjects` tablosunda `user`, `group` ve `role` tipleri ayrıştırıldı. | Roller ve kişiler tekil havuzda yönetilir, departman bilgisiyle ilişkilendirilir. |
| **Organizasyon Kapsamı** | `governance_scopes` tablosunda `organization_wide`, `company`, `branch`, `department`, `team`, `dataset`, `custom` tipleri desteklendi. | Matrisler ve limitler şirket/şube hiyerarşisine bağlanabilir. |
| **İşlem Yetkileri** | 8 işlem izni tanımlandı: `can_view`, `can_create`, `can_edit`, `can_delete`, `can_approve`, `can_cancel`, `can_export`, `can_view_cost`. | SAP B1 rozet seviyeleri (Tam/Salt Okunur/Yok/Kısmi) ile işlem izinleri birleştirildi. |
| **Yetki Sapması** | Beyan edilen seviye (`permission_level`) ile fiili efektif seviye (`effective_level`) karşılaştırılarak `has_discrepancy` bayrağı üretildi. | Denetimlerde süpervizör şifresi paylaşımı veya sahada fiilen kullanılan yetkiler raporlanır. |
| **Standart Nesneler** | 23 kanonik yönetişim nesnesi (`DEFAULT_STARTER_GOVERNANCE_OBJECTS`) hazırlandı. | `Başlangıç Nesnelerini Ekle` butonu ile idempotent (çakışmasız) tek tıkla tohumlanır. |
| **Kanıt Kasası (Vault)** | `attachment/{projectId}/GOVERNANCE/{entityType}/{entityId}/{uuid}_{safeFileName}` yolu uygulandı. | `governance_attachments` tablosunda `source_absolute_path` tutulmayarak veri gizliliği sağlandı. |
| **Rapor Çıktısı** | `ReportModel.governance` alanı üzerinden DOCX ve Liberation Sans gömülü PDF'te Bölüm 5 üretildi. | Türkçe karakter kayıpsız, tablolu ve profesyonel çıktılar sağlandı. |

---

## 3. Veritabanı Şeması (Migration v11)

SQLite üzerinde 8 yeni tablo ve 8 indeks atomik olarak oluşturulmuştur:

1. **`governance_objects`**: Yönetişim nesneleri katalogu (Kod, Türkçe Ad, İngilizce Ad, Kategori, İlgili BF, Sıralama).
2. **`governance_subjects`**: Yönetişim özneleri (Kullanıcı, Rol, Grup, Departman, E-posta).
3. **`governance_scopes`**: Kapsamlar (Tüm Şirket, Şube, Fabrika, Departman, Veri Seti).
4. **`governance_responsibilities`**: Sorumluluk atamaları (Data Owner, Data Steward, Technical Custodian, Approver, Consumer).
5. **`governance_authorizations`**: Yetki matrisi (8 işlem izni, SAP B1 seviyesi, efektif seviye ve sapma).
6. **`governance_limits`**: Onay kademeleri ve parasal/oransal limitler (Min/Max, Para Birimi, Onaylayan Makam).
7. **`governance_sod_risks`**: Görevler Ayrılığı riskleri (Çatışan Görev A & B, Ciddiyet, Sahadaki Kontrol, To-Be Çözüm).
8. **`governance_attachments`**: Yönetişim kanıt dosyaları metadata kaydı (`relative_path`, `sha256`, `file_size`).

---

## 4. Kullanıcı Arayüzü (UI) Bileşenleri

* **Dashboard Header & KPI Bandı (`GovernanceSummaryCards.tsx`):**
  - Toplam Nesne Sayısı
  - Sahipsiz Veri (Data Owner Atanmamış Nesneler)
  - Sorumlu Boşluğu (Data Steward Atanmamış Nesneler)
  - Kritik SoD Riski (Critical & High Riskler)
  - Efektif Yetki Sapması (Beyan vs Fiili Farkı)
* **Sekmeler (`GovernanceDashboardView.tsx`):**
  1. `[Veri Nesneleri]`: Kategori filtreleme, 23 nesne tek tıkla tohumlama, özel nesne ekleme/düzenleme.
  2. `[Sorumluluk Matrisi]`: Data Owner / Steward / Custodian matrisi, As-Is ve To-Be görünümü.
  3. `[Yetki Matrisi]`: SAP B1 tarzı renkli rozetler, G/E/D/S/O/İ/X/M işlem göstergeleri, yetki sapma uyarısı.
  4. `[Roller ve Kapsamlar]`: Özneler ve Organizasyonel Kapsamlar split-panel yönetimi.
  5. `[Onay Limitleri]`: Parasal limitler, 1./2./3. kademe onay hiyerarşisi, onay makamı.
  6. `[SoD Riskleri]`: Çatışma kartları, ciddiyet rozetleri (Kritik/Yüksek/Orta/Düşük), mevcut kontrol vs To-Be aksiyonu.
  7. `[Yönetişim Kanıtları]`: Kasadan dosya yükleme, açma ve silme.

---

## 5. Doğrulama ve Test Sonuçları

Tüm test suiteleri sıfır hata ile tamamlanmıştır:

```text
=======================================================
Test Sonuçları Özeti:
- Toplam Test Paketi: 64 Paket
- Toplam Assertion: 1.900+ Doğrulama
- Durum: %100 PASS (0 FAIL)
- TypeScript Derlemesi (tsc): 0 Hata
- Vite Production Build: 1.933 modül başarıyla paketlendi (dist/ 3.49 MB)
- Rust Cargo Check: 0 Hata (Finished dev profile)
=======================================================
```

### Eklenen Yeni Kabul Testleri:
1. `test/faz46_governance_data_model_test.ts`: Migration v11, 23 nesne seed & idempotency, CRUD, CASCADE silme (20/20 PASS).
2. `test/faz46_governance_matrix_and_sod_test.ts`: Yetki matrisi, 8 işlem izni, yetki sapması, limitler, SoD riskleri, KPI hesaplama (17/17 PASS).
3. `test/faz46_governance_report_export_test.ts`: ReportModel entegrasyonu, DOCX & PDF Bölüm 5 tablo üretimleri (5/5 PASS).
4. `test/faz46_governance_vault_test.ts`: Göreli yol standardı, allowlist kontrolü, SHA-256 bütünlüğü, `source_absolute_path` yokluğu (8/8 PASS).

---

## 6. Sürüm ve Git Durumu

* **Önceki Tag / Release:** `v0.1.0-rc2` (Hedef: `beab1e4`, dokunulmadı, korundu)
* **Yeni Değişiklikler:** `main` dalına commit edilip push edilmeye hazırdır.
