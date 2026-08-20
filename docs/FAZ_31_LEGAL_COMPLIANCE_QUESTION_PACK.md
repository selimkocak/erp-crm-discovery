# FAZ-31 — Hukuk ve Mevzuat Uyum / LEGAL_COMPLIANCE Soru Paketi Kılavuzu

**ERP CRM Discovery** platformu için geliştirilen `tr.legal_compliance.core` (v0.1.0) soru paketi, Türkiye'deki orta ve büyük ölçekli işletmelerin hukuk organizasyon modeli, mevzuat takip mekanizmaları, uyum sorumluluk matrisi, politika ve prosedür yönetimi, sözleşme yönetimi (Türleri, onay akışı, yenileme/fesih takibi), KVKK veri envanteri ve hukuki dayanak kayıtları, açık rıza ve aydınlatma süreçleri, veri sahibi başvuruları, saklama ve imha politikaları, üçüncü taraf ve yurtdışı veri aktarımı, elektronik kayıt bütünlüğü, denetim izi, iç/dış denetim süreçleri, uygunsuzluk ve düzeltici aksiyon, yasal takvim yönetimi, lisans ve ruhsat takibi, etik/ihbar kanalları, dava/icra dosya takibi ve Legal & Compliance KPI'larının AS-IS durumunu keşfetmek amacıyla tasarlanmıştır.

> **Önemli:** Bu soru paketi hukuki görüş üretmez, mevzuat yorumlamaz, uygunluk puanı hesaplamaz. Yalnızca firmanın bugün nasıl çalıştığını (AS-IS) keşfeder.

---

## 1. Genel Bakış

| Parametre | Değer |
| :--- | :--- |
| **Kanonik İş Fonksiyonu** | `LEGAL_COMPLIANCE` (Hukuk ve Uyumluluk) |
| **Soru Paketi Kimliği** | `tr.legal_compliance.core` |
| **Sürüm** | `0.1.0` |
| **Dil** | Türkçe (`tr`) |
| **Kapsanan Süreç Sayısı** | **25 Süreç** (A'dan Y'ye) |
| **Toplam Soru Sayısı** | **46 Soru** (`LEG-001` .. `LEG-046`) |
| **Zorunlu / Opsiyonel** | **25 Zorunlu / 21 Opsiyonel** |
| **Branching** | **6 Koşullu Dallanma** |

---

## 2. Modül Sınırları ve Duplication Ayrımı

| Modül | Yönettiği Kapsam | LEGAL_COMPLIANCE Sınırı |
| :--- | :--- | :--- |
| **HUMAN_RESOURCES** | Çalışan özlük, sözleşme tipi, personel belgesi, çalışan KVKK erişimi | Kişisel veri işleme politikası, açık rıza, aydınlatma, saklama, erişim yetkisi, veri sahibi başvuruları |
| **PAYROLL** | SGK/vergi/bordro operasyonel yürütümü | Mevzuat değişiklik takibi, uyum kontrolü, yasal belge saklama, denetim kanıtı |
| **ACCOUNTING** | Yasal defter, e-Defter, e-Fatura, muhasebe kayıtları | Yükümlülük takibi, kayıt bütünlüğü, saklama, denetim, yetki matrisi |
| **CRM / MARKETING** | Müşteri ilişkisi, iletişim izni operasyonel kullanımı | KVKK hukuki dayanak, açık rıza, aydınlatma, ret/geri çekilme, silme |
| **PROCUREMENT / SUPPLIER** | Satın alma operasyonu, tedarikçi performansı | Tedarikçi sözleşmeleri, gizlilik, veri paylaşımı, yaptırım/kara liste kontrolü |

---

## 3. 25 Süreç ve 46 Soru Dağılımı

| No | Süreç Adı | Soru | Soru ID'leri | Zorunlu / Opsiyonel |
| :--- | :--- | :---: | :--- | :--- |
| **A** | **Hukuk ve Uyum Organizasyonu** | 2 | `LEG-001`, `LEG-002` | 1 Req, 1 Opt |
| **B** | **Mevzuat Takibi** | 2 | `LEG-003`, `LEG-004` | 1 Req, 1 Opt |
| **C** | **Uyum Sorumluluk Matrisi** | 2 | `LEG-005`, `LEG-006` | 1 Req, 1 Opt |
| **D** | **Politika ve Prosedür Yönetimi** | 2 | `LEG-007`, `LEG-008` | 1 Req, 1 Opt |
| **E** | **Sözleşme Yönetimi** | 2 | `LEG-009`, `LEG-010` | 1 Req, 1 Opt *(Branching: LEG-010)* |
| **F** | **Sözleşme Onay Süreci** | 2 | `LEG-011`, `LEG-012` | 1 Req, 1 Opt |
| **G** | **Sözleşme Versiyon ve Yenileme Takibi** | 1 | `LEG-013` | 1 Req *(Branching)* |
| **H** | **KVKK Veri Envanteri** | 2 | `LEG-014`, `LEG-015` | 1 Req, 1 Opt *(Branching: LEG-015)* |
| **I** | **Veri İşleme Amaçları ve Hukuki Dayanak** | 2 | `LEG-016`, `LEG-017` | 1 Req, 1 Opt |
| **J** | **Açık Rıza ve Aydınlatma** | 2 | `LEG-018`, `LEG-019` | 1 Req, 1 Opt *(Branching: LEG-019)* |
| **K** | **Veri Sahibi Başvuruları** | 2 | `LEG-020`, `LEG-021` | 1 Req, 1 Opt |
| **L** | **Veri Saklama ve İmha** | 2 | `LEG-022`, `LEG-023` | 1 Req, 1 Opt |
| **M** | **Kişisel Veri Erişim Yetkileri** | 2 | `LEG-024`, `LEG-025` | 1 Req, 1 Opt |
| **N** | **Üçüncü Taraf Veri Paylaşımı** | 2 | `LEG-026`, `LEG-027` | 1 Req, 1 Opt |
| **O** | **Yurtdışı Veri Aktarımı** | 1 | `LEG-028` | 1 Req *(Branching)* |
| **P** | **Bilgi Güvenliği Uyum Bağlantısı** | 1 | `LEG-029` | 1 Req |
| **Q** | **Elektronik Kayıt ve Delil** | 2 | `LEG-030`, `LEG-031` | 1 Req, 1 Opt |
| **R** | **Denetim İzi / Audit Trail** | 2 | `LEG-032`, `LEG-033` | 1 Req, 1 Opt |
| **S** | **İç ve Dış Denetimler** | 2 | `LEG-034`, `LEG-035` | 1 Req, 1 Opt |
| **T** | **Uygunsuzluk ve Düzeltici Aksiyon** | 2 | `LEG-036`, `LEG-037` | 1 Req, 1 Opt |
| **U** | **Yasal Takvim ve Bildirimler** | 1 | `LEG-038` | 1 Req |
| **V** | **Lisans / Ruhsat / İzin Takibi** | 2 | `LEG-039`, `LEG-040` | 1 Req, 1 Opt |
| **W** | **Etik / Çıkar Çatışması / İhbar** | 2 | `LEG-041`, `LEG-042` | 1 Req, 1 Opt *(Branching: LEG-042)* |
| **X** | **Dava / İcra / Hukuki Dosya Takibi** | 2 | `LEG-043`, `LEG-044` | 1 Req, 1 Opt *(Branching: LEG-044)* |
| **Y** | **Legal & Compliance KPI** | 2 | `LEG-045`, `LEG-046` | 1 Req, 1 Opt |
| **TOPLAM** | **25 Süreç** | **46** | **`LEG-001` .. `LEG-046`** | **25 Zorunlu / 21 Opsiyonel** |

---

## 4. Branching (Koşullu Dallanma) Karar Ağacı

| Tetikleyici Soru | Koşul | Gizlenen / Görünen Soru |
| :--- | :--- | :--- |
| `LEG-009` Sözleşme Yönetimi | `merkezi_sozlesme_yonetim_sistemi_yoktur` seçildiğinde | `LEG-010` **ve** `LEG-013` gizlenir |
| `LEG-014` KVKK Veri Envanteri | `kvkk_veri_envanteri_tanimlanmamistir` seçildiğinde | `LEG-015` gizlenir |
| `LEG-018` Açık Rıza ve Aydınlatma | `acik_riza_sureci_uygulanmamaktadir` seçildiğinde | `LEG-019` gizlenir |
| `LEG-028` Yurtdışı Veri Aktarımı | `yurtdisi_veri_aktarimi_yapilmamaktadir` seçildiğinde | — (Takip eden bilgi güvenliği sorusu yönlendirilmez) |
| `LEG-041` İhbar Hattı Varlığı | `ihbar_bildirme_mekanizmasi_yoktur` seçildiğinde | `LEG-042` gizlenir |
| `LEG-043` Dava/İcra Dosyası | `dava_icra_veya_hukuki_dosya_yoktur` seçildiğinde | `LEG-044` gizlenir |
