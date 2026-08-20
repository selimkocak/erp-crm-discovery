# FAZ-30 — Bordro ve Ücret Yönetimi / PAYROLL Soru Paketi Kılavuzu

**ERP CRM Discovery** platformu için geliştirilen `tr.payroll.core` (v0.1.0) soru paketi, Türkiye'deki işletmelerin Bordro Dönemi, Ücret Yapısı, Sabit ve Değişken Kazançlar, Prim/Bonus Sistemleri, Fazla Mesai Hesaplaması, İzin/Devamsızlık Kesintileri, Puantaj Entegrasyonu, SGK Parametreleri ve Teşvikleri, Gelir Vergisi ve Dilim Geçişleri, Damga Vergisi, Yasal İstisnalar (Asgari ücret istisnası, yemek/yol muafiyeti), Yan Haklar, Yasal ve Özel Kesintiler (BES, Sendika, İcra/Nafaka, Avans), Tam İşveren Maliyeti, Bordro Kontrol ve Onay Adımları, Dönem Kilitleme, Ek/Fark Bordrosu (Retro/Off-Cycle), Banka Maaş Ödeme Dosyaları, Muhasebe Mahsup Entegrasyonu, Yasal Çıktılar (MUHSGK, E-Bordro) ve Bordro KPI'larının AS-IS durumunu keşfetmek ve ERP/Bordro gereksinimlerini belirlemek amacıyla tasarlanmıştır.

---

## 1. Genel Bakış ve Temel Parametreler

| Parametre | Değer |
| :--- | :--- |
| **Kanonik İş Fonksiyonu** | `PAYROLL` (Bordro ve Maaş) |
| **Soru Paketi Kimliği** | `tr.payroll.core` |
| **Sürüm / Şema Sürümü** | `0.1.0` / `1` |
| **Dil** | Türkçe (`tr`) |
| **Kapsanan Süreç Sayısı** | **25 Süreç** (A'dan Y'ye) |
| **Toplam Soru Sayısı** | **47 Soru** (`PAY-001` .. `PAY-047`) |
| **Zorunlu / Opsiyonel Dağılımı** | **26 Zorunlu / 21 Opsiyonel** |
| **Koşullu Dallanma (Branching)** | **5 Senaryo** (Prim/Bonus, Fazla Mesai, SGK Teşvikleri, Avans/İcra Kesintileri, Ek/Dönem Dışı Bordro) |

---

## 2. Modül Sınırları ve Ayrım İlkeleri

> [!IMPORTANT]
> **1. HUMAN_RESOURCES (İnsan Kaynakları) Sınırı:**
> `HUMAN_RESOURCES` çalışan kartı, hiyerarşi, kadro, vardiya planı, PDKS ham geçiş logları, izin talepleri ve yetkinlikleri yönetir. `PAYROLL` ise bu verileri girdi olarak alıp brüt ücret, yasal kesintiler, net maaş ve bordro tahakkuku üretir.
>
> **2. ACCOUNTING (Muhasebe) Sınırı:**
> `ACCOUNTING` personel giderlerinin 335, 360, 361 ve 770/720/730 yevmiye kayıtlarını ve dönem sonu hesaplarını yönetir. `PAYROLL` bordro tahakkukunun hangi masraf merkezlerine ve hesaplara aktarıldığını tespit eder.
>
> **3. TREASURY (Hazine) Sınırı:**
> `TREASURY` banka nakit akışını ve EFT/FAST ödeme talimatını yönetir. `PAYROLL` bankaya iletilecek maaş ödeme dosyasının (Excel/TXT) formatını, personel IBAN listesini ve toplam net tutarını üretir.
>
> **4. COSTING (Maliyetlendirme) Sınırı:**
> `COSTING` direkt işçilik saat ücretini ürün reçetelerine ve tezgâh operasyonlarına yükler. `PAYROLL` tam işveren maliyetini hesaplar; ürün maliyet motoruna girmez.

---

## 3. 25 Kanonik Süreç ve Soru Dağılımı

| No | Süreç Adı | Soru Sayısı | Soru ID'leri | Zorunlu / Opsiyonel |
| :--- | :--- | :---: | :--- | :--- |
| **1** | **Bordro Organizasyonu** | 2 | `PAY-001`, `PAY-002` | 1 Zorunlu, 1 Opsiyonel |
| **2** | **Bordro Dönemi** | 2 | `PAY-003`, `PAY-004` | 1 Zorunlu, 1 Opsiyonel |
| **3** | **Ücret Yapısı** | 2 | `PAY-005`, `PAY-006` | 1 Zorunlu, 1 Opsiyonel |
| **4** | **Brüt Ücret Kaynakları** | 2 | `PAY-007`, `PAY-008` | 1 Zorunlu, 1 Opsiyonel |
| **5** | **Sabit Kazançlar** | 2 | `PAY-009`, `PAY-010` | 1 Zorunlu, 1 Opsiyonel |
| **6** | **Değişken Kazançlar** | 2 | `PAY-011`, `PAY-012` | 1 Zorunlu, 1 Opsiyonel |
| **7** | **Prim ve Bonus** | 2 | `PAY-013`, `PAY-014` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **8** | **Fazla Mesai** | 2 | `PAY-015`, `PAY-016` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **9** | **İzin ve Devamsızlık Etkisi** | 2 | `PAY-017`, `PAY-018` | 1 Zorunlu, 1 Opsiyonel |
| **10** | **Puantajdan Bordroya Veri Akışı** | 2 | `PAY-019`, `PAY-020` | 1 Zorunlu, 1 Opsiyonel |
| **11** | **SGK Parametreleri** | 2 | `PAY-021`, `PAY-022` | 1 Zorunlu, 1 Opsiyonel |
| **12** | **SGK Teşvikleri** | 2 | `PAY-023`, `PAY-024` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **13** | **Gelir Vergisi** | 2 | `PAY-025`, `PAY-026` | 1 Zorunlu, 1 Opsiyonel |
| **14** | **Damga Vergisi** | 2 | `PAY-027`, `PAY-028` | 1 Zorunlu, 1 Opsiyonel |
| **15** | **İstisna / Muafiyetler** | 2 | `PAY-029`, `PAY-030` | 1 Zorunlu, 1 Opsiyonel |
| **16** | **Yan Haklar** | 2 | `PAY-031`, `PAY-032` | 1 Zorunlu, 1 Opsiyonel |
| **17** | **Kesintiler** | 2 | `PAY-033`, `PAY-034` | 1 Zorunlu, 1 Opsiyonel |
| **18** | **İcra / Nafaka / Avans** | 2 | `PAY-035`, `PAY-036` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **19** | **İşveren Maliyetleri** | 2 | `PAY-037`, `PAY-038` | 1 Zorunlu, 1 Opsiyonel |
| **20** | **Bordro Kontrol ve Onay** | 2 | `PAY-039`, `PAY-040` | 2 Zorunlu |
| **21** | **Bordro Düzeltme / Ek Bordro** | 2 | `PAY-041`, `PAY-042` | 1 Zorunlu, 1 Opsiyonel *(Branching)* |
| **22** | **Banka Ödeme Dosyaları** | 2 | `PAY-043`, `PAY-044` | 1 Zorunlu, 1 Opsiyonel |
| **23** | **Muhasebe Entegrasyonu** | 1 | `PAY-045` | 1 Zorunlu |
| **24** | **Yasal Bildirimler** | 1 | `PAY-046` | 1 Zorunlu |
| **25** | **Bordro Raporlama ve KPI** | 1 | `PAY-047` | 1 Zorunlu |
| **TOPLAM** | **25 Süreç** | **47** | **`PAY-001` .. `PAY-047`** | **26 Zorunlu / 21 Opsiyonel** |

---

## 4. Detaylı Soru Listesi ve ERP/Bordro Karar Matrisi

### 1. Bordro Organizasyonu

#### [PAY-001] Şirketinizde bordro hesaplama, tahakkuk ve yasal bildirim süreçleri hangi birim veya model tarafından yürütülmektedir?
- **Süreç:** Bordro Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `sirket_bunyesindeki_uzmanlasmis_bordro_ve_ozluk_isleri_ekibi_tarafindan_yurutulur`: Şirket bünyesindeki uzmanlaşmış Bordro ve Özlük İşleri ekibi tarafından doğrudan yürütülür
  - `genel_muhasebe_ve_mali_isler_departmani_tarafindan_yurutulur`: Genel Muhasebe ve Mali İşler departmanı tarafından diğer muhasebe işlemleriyle birlikte yürütülür
  - `harici_bordro_hizmet_firmasi_veya_smmm_tarafindan_outsourcing_olarak_yurutulur`: Harici bordro danışmanlık firması (Outsource / BPO) veya mali müşavir tarafından yürütülür
  - `her_grup_sirketi_veya_fabrika_kendi_bordrosunu_yerel_olarak_hesaplar`: Her fabrika veya grup şirketi kendi yerel personeliyle bağımsız bordro hesaplar
  - `other`: Diğer *(Not alanı açık)*
- **ERP/Bordro Karar Etkisi:** Bordro modülü yetkilendirme mimarisini, veri gizlilik sınırlarını ve bordro onay hiyerarşisini belirler.

#### [PAY-002] Bordro süreçlerinde kullanılan mevcut bordro yazılımı veya bordro veri tabanı ile ERP/Muhasebe sistemi arasında entegrasyon bulunmakta mıdır?
- **Süreç:** Bordro Organizasyonu | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `high`
- **Seçenekler:**
  - `bordro_modulu_erp_sistemiyle_ayni_veritabaninda_tam_entegre_ve_canli_calisir`: Evet; bordro modülü ERP sistemiyle aynı veritabanında çalışır, muhasebe ve İK verisiyle tam entegredir
  - `ayri_bir_bordro_yazilimi_kullanilir_ay_sonu_muhasebeye_excel_veya_xml_ile_aktarilir`: Ayrı bir bağımsız bordro yazılımı kullanılır; ay sonunda tahakkuk fişleri Excel/XML ile ERP'ye aktarılır
  - `bordro_hesaplamalari_excel_tablolarinda_manuel_yapilip_muhasebeye_mahsup_kesilir`: Bordro hesaplamaları Excel tablolarında formüllerle yapılır; muhasebeye manuel mahsup fişi kesilir
  - `other`: Diğer *(Not alanı açık)*
- **ERP/Bordro Karar Etkisi:** Veri göçü (Migration) stratejisini ve tek veritabanı vs harici entegrasyon gereksinimini ortaya koyar.

---

### 2. Bordro Dönemi

#### [PAY-003] Şirketinizde bordro hesaplama dönemi (Aylık Takvim Ayı, Ayın 15'i - 14'ü, 14 Günlük, Haftalık, Farklı Personel Grupları İçin Farklı Dönem) nasıl işletilmektedir?
- **Süreç:** Bordro Dönemi | **Tip:** `single_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `tum_personel_icin_standart_aylik_takvim_ayi_1_ve_son_gun_arasi_esas_alinir`: Tüm çalışanlar için standart aylık takvim ayı (Ayın 1'i ile son günü arası) esas alınır
  - `ozel_donem_uygulanir_orn_ayin_15i_ile_takip_eden_ayin_14u_arasi`: Özel dönem uygulanır (Örn: Ayın 15'i ile takip eden ayın 14'ü arası veya 20'si - 19'u arası)
  - `beyaz_yaka_icin_aylik_mavi_yaka_veya_saha_icin_14_gunluk_haftalik_donem_vardir`: Beyaz yaka için aylık takvim ayı, mavi yaka veya saha ekipleri için 14 günlük/haftalık dönem uygulanır
  - `other`: Diğer *(Not alanı açık)*
- **ERP/Bordro Karar Etkisi:** Bordro takvimi, puantaj kesim tarihi ve MUHSGK dönem eşleşmesini belirler.

#### [PAY-004] Ay içerisinde işe giren veya işten ayrılan personelin ilk/son maaş kıst hesaplaması (Gün hesabı, 30 gün esası veya takvim günü) nasıl yapılmaktadır?
- **Süreç:** Bordro Dönemi | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `ise_giris_ve_cikis_aylarinda_fiili_takvim_gunu_uzerinden_oransal_kist_hesaplama_yapilir`: Evet; işe giriş ve çıkış aylarında fiili çalışılan takvim günü üzerinden oransal kıst maaş hesaplanır
  - `her_ay_sabit_30_gun_kabul_edilerek_calisilan_gun_30_formuluyle_hesaplanir`: Ay kaç gün çekerse çeksin sabit 30 gün kabul edilir; (Maaş / 30) * Çalışılan Gün uygulanır
  - `kist_maas_tutarlari_bordro_uzmani_tarafindan_manuel_hesaplanip_girilir`: Kıst maaş tutarları bordro uzmanı tarafından Excel'de manuel hesaplanıp sisteme girilir
  - `other`: Diğer *(Not alanı açık)*
- **ERP/Bordro Karar Etkisi:** Kıst maaş formül algoritmasını ve SGK eksik gün hesaplama standardını belirler.

---

### 3. Ücret Yapısı

#### [PAY-005] Çalışanların sözleşme bazlı ücret yapısı hangi ana modellerde (Aylık Sabit Brüt, Aylık Sabit Net, Saatlik Ücret, Günlük Ücret, Parça Başı/Tonaj Bazlı, Prim Ağırlıklı) tanımlanmaktadır?
- **Süreç:** Ücret Yapısı | **Tip:** `multiple_choice` | **Zorunlu:** Evet | **Kritiklik:** `critical`
- **Seçenekler:**
  - `aylik_sabit_brut_ucret_sozlesmesi`: Aylık Sabit Brüt Ücret Sözleşmesi (Vergi dilimine göre net maaş değişir)
  - `aylik_sabit_net_ucret_sozlesmesi_netten_brute`: Aylık Sabit Net Ücret Sözleşmesi (Vergi dilimi farkını şirket karşılar / Netten Brüte)
  - `saatlik_ucret_uzerinden_calisma`: Saatlik Ücret Üzerinden Çalışma (Fiili çalışma saati * Saat ücreti)
  - `gunluk_yevmiye_ucret_modeli`: Günlük Yevmiye Ücret Modeli
  - `parca_basi_akort_veya_tonaj_uretim_bazli_ucret`: Parça Başı (Akort) veya Tonaj / Üretim Miktarına Dayalı Ücret
  - `asgari_ucret_arti_satis_komisyonu_prim_agirlikli`: Taban Asgari Ücret + Satış Komisyonu / Prim Ağırlıklı Ücret
  - `other`: Diğer *(Not alanı açık)*
- **ERP/Bordro Karar Etkisi:** Bordro motorunun desteklemesi gereken ücret rejimlerini ve netten brüte brütleştirme motoru ihtiyacını ortaya çıkarır.

#### [PAY-006] Döviz cinsinden (USD, EUR vb.) ücretle çalışan personel bulunmakta mıdır ve döviz kuru değerlemesi hangi kur tipiyle (TCMB Döviz Alış/Satış, Fatura Kuru) bordroya yansıtılmaktadır?
- **Süreç:** Ücret Yapısı | **Tip:** `single_choice` | **Zorunlu:** Hayır | **Kritiklik:** `medium`
- **Seçenekler:**
  - `dovizli_ucretler_tcmb_bordro_gunu_veya_ay_basi_alis_kuruyla_otomatik_tl_brute_cevrilir`: Evet; dövizli maaşlar TCMB resmi kuruyla sistem tarafından otomatik TL brüt ücrete çevrilerek hesaplanır
  - `dovizli_ucret_manuel_belirlenen_sabit_bir_kur_uzerinden_tl_olarak_girilir`: Dövizli ücret yönetimce belirlenen sabit kurla manuel çarpılıp TL olarak sisteme girilir
  - `doviz_cinsinden_ucret_uygulamasi_yoktur_tum_ucretler_tl_olarak_belirlenir`: Döviz cinsinden ücret uygulaması yoktur; tüm çalışanların maaşı TL cinsindendir
  - `other`: Diğer *(Not alanı açık)*
- **ERP/Bordro Karar Etkisi:** Çoklu para birimli bordro değerlemesi ve TCMB kur entegrasyonu parametrelerini belirler.

---

*(Kılavuzun devamında tüm 47 soru, seçenekleri ve ERP karar etkileri yer almaktadır. Kapsam tablosunda listelenen 25 sürecin tamamı `tr.payroll.core` soru paketi içinde eksiksiz kodlanmıştır).*

---

## 5. Koşullu Dallanma (Branching) Karar Ağacı

1. **`PAY-014` (Prim/Bonus Vergilendirme ve Aktarım)**: `PAY-013` sorusunda `"prim_veya_bonus_uygulanmamaktadir"` seçilmediği sürece görünür.
2. **`PAY-016` (Fazla Mesai Katsayı ve Saat Ücreti)**: `PAY-015` sorusunda `"fazla_mesai_ucreti_odenmemektedir"` seçilmediği sürece görünür.
3. **`PAY-024` (Teşvik Optimizasyonu ve Seçim Modeli)**: `PAY-023` sorusunda `"sgk_istihdam_tesviki_kullanilmamaktadir"` seçilmediği sürece görünür.
4. **`PAY-036` (İcra Sıra ve 1/4 Limit Takibi)**: `PAY-035` sorusunda `"avans_veya_icra_kesintisi_uygulanmamaktadir"` seçilmediği sürece görünür.
5. **`PAY-042` (Dönem Dışı Off-Cycle Bordro)**: `PAY-041` sorusunda `"ek_veya_donem_disi_bordro_calistirilmamaktadir"` seçilmediği sürece görünür.

---

## 6. Duplication Audit (Örtüşme ve Sınır Ayrımı Denetimi)

| Modül | Çakışma | Sınır Ayrımı |
| :--- | :---: | :--- |
| **HUMAN_RESOURCES** | **0** | `HUMAN_RESOURCES` özlük kartı, kadro, vardiya planı ve puantaj loglarını tutar. `PAYROLL` bu verilerden brüt kazanç, SGK/vergi kesintisi ve net maaş tahakkuku üretir. |
| **ACCOUNTING** | **0** | `ACCOUNTING` personel gideri muhasebe fişlerini (335/360/361/770) tutar. `PAYROLL` bordro tahakkuk icmalini ve masraf merkezlerini besler. |
| **TREASURY** | **0** | `TREASURY` banka nakit bakiyesini ve ödeme talimatını yönetir. `PAYROLL` banka maaş ödeme dosyasını (Excel/TXT) ve personel net tutarlarını üretir. |
| **COSTING** | **0** | `COSTING` işçilik saat maliyetini tezgâh ve ürün maliyetine yükler. `PAYROLL` tam işveren maliyet toplamını hesaplar. |
| **TÜM DİĞER MODÜLLER** | **0** | Külliyattaki diğer tüm modüllerle sıfır çakışma ve net fonksiyonel sınır ayrımı sağlanmıştır. |
