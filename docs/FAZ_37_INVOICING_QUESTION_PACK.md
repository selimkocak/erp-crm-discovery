# FAZ-37: Faturalama ve Gider Yönetimi (INVOICING) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.invoicing.core`  
**Kanonik İş Fonksiyonu Kodu:** `INVOICING`  
**Türkçe / Legacy Kod:** `FATURALAMA` / `FATURA_GDR`  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 22`  
**Kategori:** `Muhasebe & Finans` (Accounting & Finance)  
**Toplam Soru:** 47 Soru (`INV-001` .. `INV-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

ERP dönüşüm projelerinde satış, satınalma, masraf ve genel gider faturalarının ticari süreçlerini, sipariş-irsaliye-fatura üçlü eşleştirmesini (Three-Way Match), fiyat/iskonto/vade kontrollerini, tevkifat ve istisna hesaplamalarını, masraf merkezi analitik dağılımını ve muhasebe yevmiye entegrasyonunu değerlendiren saha keşif soru paketidir.

---

## 2. 25 Kanonik Süreç ve Soru Dağılımı

| # | Süreç Adı | Soru ID | Başlık / Açıklama | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | Faturalama Organizasyonu ve Sorumluluklar | `INV-001` | Şirket içi faturalama departman yetkileri ve onay matrisi | single_choice | Evet | Critical |
| 2 | Faturalama Organizasyonu ve Sorumluluklar | `INV-002` | Faturalama SLA ve termin süreleri takip mekanizması | single_choice | Hayır | High |
| 3 | Satış Faturası Oluşturma Süreci | `INV-003` | Satış faturalarının ticari oluşturulma yöntemi | single_choice | Evet | Critical |
| 4 | Satış Faturası Oluşturma Süreci | `INV-004` | Müşteri açık hesap risk limiti ve bloke kontrolü | single_choice | Hayır | High |
| 5 | Alış Faturası Kabul Süreci | `INV-005` | Tedarikçi malzeme ve mal faturalarının kabul prosedürü | single_choice | Evet | Critical |
| 6 | Alış Faturası Kabul Süreci | `INV-006` | Alış faturalarında miktar ve birim fiyat uyuşmazlık aksiyonu | single_choice | Hayır | High |
| 7 | Gider Faturası Yönetimi | `INV-007` | Genel işletme gider faturalarının onay ve kayıt süreci | single_choice | Evet | Critical |
| 8 | Gider Faturası Yönetimi | `INV-008` | Personel masraf formları ve fiş/fatura dijitalleşmesi | single_choice | Hayır | High |
| 9 | Hizmet Faturaları | `INV-009` | Hizmet kartları ve hakediş protokolü entegrasyonu | single_choice | Evet | High |
| 10 | Hizmet Faturaları | `INV-010` | Dönemsel/yinelenen sabit hizmet faturaları otomasyonu | single_choice | Hayır | Medium |
| 11 | Malzeme ve Ürün Faturaları | `INV-011` | Stok kartı, birim çevrimi ve seri-lot zorunlu eşleşmesi | single_choice | Evet | High |
| 12 | Siparişten Faturaya Akış | `INV-012` | Sipariş bağlantılı faturalama ve bakiye takibi (Branching Trigger 1) | single_choice | Evet | Critical |
| 13 | Siparişten Faturaya Akış | `INV-013` | Sipariş-fatura fiyat/iskonto revizyon onay kuralları (Branching Target 1) | single_choice | Hayır | High |
| 14 | İrsaliyeden Faturaya Akış | `INV-014` | İrsaliye havuzundan tekil/toplu fatura aktarımı (Branching Trigger 2) | single_choice | Evet | Critical |
| 15 | İrsaliyeden Faturaya Akış | `INV-015` | Birden fazla irsaliyenin tek konsolide faturada birleşmesi (Branching Target 2) | single_choice | Hayır | High |
| 16 | Fatura Öncesi Teslimat ve Kabul Kontrolü | `INV-016` | Hizmet/proje kabul tutanağı olmadan fatura engeli | single_choice | Evet | High |
| 17 | Fatura Öncesi Teslimat ve Kabul Kontrolü | `INV-017` | Müşteri SLA cezaları ve gecikme kesintilerinin mahsubu | single_choice | Hayır | Medium |
| 18 | Fatura Fiyat ve İskonto Kontrolü | `INV-018` | Kademeli cari/kampanya/satır iskontoları hesaplama matrisi | single_choice | Evet | Critical |
| 19 | Fatura Fiyat ve İskonto Kontrolü | `INV-019` | Maliyet altı zararına satış engelleme ve kar marjı kontrolü | single_choice | Hayır | High |
| 20 | KDV Oranları ve Vergi Kodları | `INV-020` | Güncel KDV (%1,%10,%20), ÖTV ve özel vergi hesaplamaları | single_choice | Evet | Critical |
| 21 | KDV Oranları ve Vergi Kodları | `INV-021` | KDV oran tebliğ değişikliklerinde merkezi parametre yönetimi | single_choice | Hayır | Medium |
| 22 | Tevkifat Uygulamaları | `INV-022` | KDV Tevkifatı (2/10..9/10) kullanımı ve kapsamı (Branching Trigger 3) | single_choice | Evet | High |
| 23 | Tevkifat Uygulamaları | `INV-023` | Tevkifat matrahı, 2.000 TL alt limit ve cari netleştirme (Branching Target 3) | single_choice | Hayır | High |
| 24 | İstisna ve Özel Vergi Uygulamaları | `INV-024` | KDV İstisnası, İhraç Kayıtlı satış ve tecil-terkin mekanizması | single_choice | Evet | High |
| 25 | Dövizli Fatura ve Kur Kullanımı | `INV-025` | Yabancı paralı faturalama ve TL karşılık takibi (Branching Trigger 4) | single_choice | Evet | Critical |
| 26 | Dövizli Fatura ve Kur Kullanımı | `INV-026` | TCMB kur türü ve otomatik kur farkı faturası oluşturma (Branching Target 4) | single_choice | Hayır | High |
| 27 | İhracat Faturaları | `INV-027` | Yurtdışı ihracat faturası, Incoterms ve GTİP kırılımı (Branching Trigger 5) | single_choice | Evet | High |
| 28 | İhracat Faturaları | `INV-028` | Proformadan kesin faturaya geçiş, navlun ve sigorta (Branching Target 5) | single_choice | Hayır | High |
| 29 | İade Faturaları | `INV-029` | Satış/alış iadeleri ve orijinal fatura referansı (Branching Trigger 8) | single_choice | Evet | High |
| 30 | İade Faturaları | `INV-030` | İade edilen ürünün stoka geri giriş maliyeti ve SMM kaydı (Branching Target 8) | single_choice | Hayır | High |
| 31 | Fiyat Farkı ve Ek Faturalar | `INV-031` | Ciro primleri, vade farkları ve fiyat farkı fatura modülü | single_choice | Evet | High |
| 32 | Fiyat Farkı ve Ek Faturalar | `INV-032` | Fiyat farkının orijinal ürün ve proje karlılığına dağıtımı | single_choice | Hayır | Medium |
| 33 | Fatura İptal, Red ve Düzeltme Süreçleri | `INV-033` | Yetkili onaylı iptal, irsaliye/stok/muhasebe ters kaydı | single_choice | Evet | High |
| 34 | Fatura İptal, Red ve Düzeltme Süreçleri | `INV-034` | Fatura iptal ve düzeltme gerekçe kodları ve kök neden analizi | single_choice | Hayır | Medium |
| 35 | Gider Onay ve Masraf Merkezi Dağılımı | `INV-035` | Masraf merkezlerine (departman, tesis, proje) dağıtım (Branching Trigger 6) | single_choice | Evet | Critical |
| 36 | Gider Onay ve Masraf Merkezi Dağılımı | `INV-036` | Tanımlı sabit masraf dağıtım anahtarları ve şablonları (Branching Target 6) | single_choice | Hayır | High |
| 37 | Satınalma Faturası Üçlü Eşleştirme | `INV-037` | Sipariş - Depo Mal Kabul - Fatura 3'lü eşleştirmesi (Branching Trigger 7) | single_choice | Evet | Critical |
| 38 | Satınalma Faturası Üçlü Eşleştirme | `INV-038` | Tutar/miktar tolerans limitleri ve kademeli onay akışı (Branching Target 7) | single_choice | Hayır | High |
| 39 | Fatura Ödeme Vadesi ve Ödeme Planı | `INV-039` | Cari vade kuralından otomatik ödeme/tahsilat takvimi | single_choice | Evet | Critical |
| 40 | Fatura Ödeme Vadesi ve Ödeme Planı | `INV-040` | Skonto erken ödeme iskontosu ve vade farkı faizi hesabı | single_choice | Hayır | High |
| 41 | Cari Hesap ve Muhasebe Entegrasyonu | `INV-041` | Anlık otomatik cari borç/alacak ve yevmiye fişi oluşumu | single_choice | Evet | Critical |
| 42 | Cari Hesap ve Muhasebe Entegrasyonu | `INV-042` | Hesap planı bağlantı matrisinden otomatik hesap kodu türetme | single_choice | Hayır | High |
| 43 | Fatura Numaralandırma ve Dönem Kontrolü | `INV-043` | Ardışık numara serisi, şube önekleri ve atlama engeli | single_choice | Evet | High |
| 44 | Fatura Numaralandırma ve Dönem Kontrolü | `INV-044` | Geçmişe veya geleceğe dönük hatalı tarih kilidi | single_choice | Hayır | Medium |
| 45 | Fatura Raporlama, Mutabakat ve KPI | `INV-045` | Ba/Bs formları ve elektronik fatura mutabakat mektupları | single_choice | Evet | High |
| 46 | Fatura Raporlama, Mutabakat ve KPI | `INV-046` | Faturalanmamış irsaliye ve açık risk KPI dashboard'u | single_choice | Hayır | High |
| 47 | Faturalama Kapanışı, Dönem Kilidi ve Denetim İzi | `INV-047` | KDV beyannamesi sonrası katı dönem kilidi ve audit trail | single_choice | Evet | Critical |

---

## 3. Koşullu Dallanma (Branching) Kuralları

1. `INV-012 = "siparis_baglantili_otomatik_faturalama"` → `INV-013` görünür
2. `INV-014 = "irsaliye_bazli_toplu_veya_tekil_faturalama"` → `INV-015` görünür
3. `INV-022 = "tevkifatli_fatura_kesilmektedir"` → `INV-023` görünür
4. `INV-025 = "dovizli_fatura_kesilmekte_ve_alinmaktadir"` → `INV-026` görünür
5. `INV-027 = "ihracat_faturasi_duzenlenmektedir"` → `INV-028` görünür
6. `INV-035 = "coklu_masraf_merkezi_ve_proje_dagitimi_var"` → `INV-036` görünür
7. `INV-037 = "tam_otomatik_uclu_eslestirme_uygulanir"` → `INV-038` görünür
8. `INV-029 = "duzenli_satis_ve_alis_iadesi_yapilmaktadir"` → `INV-030` görünür

*Görünürlük İstatistiği:* Cevapsız varsayılan durumda **39 soru**, tüm koşullar aktifken **47 soru**.

---

## 4. Cross-Pack İzolasyonu ve Sınır Ayrımı

- **E_TRANSFORMATION:** GİB, UBL-TR, özel entegratör, XML şeması, mali mühür, e-Fatura durum kodları (1200 vb.) ve 10 yıllık yasal elektronik arşivleme; ticari fatura akışı içermez.
- **ACCOUNTING:** Yevmiye fişi içi hesap planı, mizan, gelir tablosu ve bilanço; ticari belge oluşturma ve onay süreçlerini içermez.
- **SALES / PROPOSALS:** Teklif ve müşteri sipariş onayını inceler; INVOICING satış işleminin faturalama sonucunu inceler.
- **PROCUREMENT / SUPPLIER_MANAGEMENT:** Satınalma talep ve sipariş onayını inceler; INVOICING satınalma faturası kabul ve 3'lü eşleştirme (Three-Way Match) sürecini inceler.
- **TREASURY:** Kasa ve banka tahsilat/tediye operasyonunu inceler; INVOICING fatura vadesi ve ödeme takvimi beklentisini inceler.
- **IMPORT / EXPORT:** Dış ticaret operasyonlarını inceler; INVOICING ithalat/ihracat fatura boyutunu inceler.
- **COSTING:** Fiili ve standart maliyet motorunu inceler; INVOICING fatura tutarının maliyet/masraf merkezine aktarımını inceler.
