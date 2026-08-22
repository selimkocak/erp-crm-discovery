# FAZ-43: Stratejik Planlama ve Kurumsal Performans (STRATEGY) Soru Paketi Dokümantasyonu

**Paket ID:** `tr.strategy.core`  
**Kanonik İş Fonksiyonu Kodu:** `STRATEGY`  
**Türkçe / Legacy Kod:** `STRTJK_PLN` (Alias: `STRATEJI`, `STRATEJIK_PLANLAMA`, `KURUMSAL_STRATEJI`, `STRATEGIC_PLANNING`)  
**Sürüm:** `0.1.0`  
**Dil:** `tr`  
**Katalog Sırası:** `sort_order: 2`  
**Kategori:** `Yönetim` (Management)  
**Toplam Soru:** 47 Soru (`STR-001` .. `STR-047`)  
**Zorunlu / Opsiyonel:** 25 Zorunlu / 22 Opsiyonel  
**Kanonik Süreç:** 25 Süreç (%100 Kapsama)  
**Koşullu Dallanma:** 8 Branching Senaryosu  

---

## 1. Modülün Amacı ve Kapsamı

Stratejik Planlama ve Kurumsal Performans (Strategy & Corporate Performance) modülü; şirketlerin uzun vadeli yönelimini, vizyon ve misyon tanımlarını, kurumsal değerlerini, SWOT ve dış çevre (PESTLE) analizlerini, pazar ve rekabet hedeflerini, paydaş beklentilerini, stratejik önceliklerini, kurumsal ve departman bazlı ölçülebilir hedeflerini, Temel Performans Göstergeleri (KPI) ve Balanced Scorecard metodolojisini, bütçe-strateji entegrasyonunu, sermaye yatırımı ve stratejik inisiyatif portföyü yönetimini, dijital dönüşüm ve ERP/CRM dönüşüm hedeflerini, risk ve senaryo planlamasını, üst yönetim stratejik gözden geçirme ritmini, kurum içi hedef iletişimini ve stratejik plan revizyon/arşiv disiplinini saha görüşmeleriyle keşfetmek üzere tasarlanmıştır.

Bu soru paketi; `STRATEGY`'yi `MANAGEMENT`'tan (yönetim yapısı, kurul organları, imza sirküleri ve operasyonel koordinasyon) ve `PROJECT_MANAGEMENT`'tan (onaylanan projelerin WBS, Gantt ve teslimat icrası) net bir sınır çizgisiyle ayırarak **kurumsal yön, uzun vadeli hedefler, performans ölçümü ve stratejik dönüşüm** boyutuna odaklanır.

---

## 2. 25 Kanonik Süreç Envanteri

Aşağıdaki 25 kanonik süreç başlığı, soru paketi içerisindeki 47 sorunun tamamını eksiksiz ve fazlalıksız olarak kapsar:

| # | Kanonik Süreç Adı | Soru Sayısı | Soru ID Listesi | Zorunlu Soru |
|---|---|:---:|---|:---:|
| 1 | Strateji organizasyonu ve sahipliği | 2 | `STR-001`, `STR-002` | 1 |
| 2 | Vizyon ve misyon | 1 | `STR-003` | 1 |
| 3 | Kurumsal değerler ve yönetim ilkeleri | 1 | `STR-004` | 1 |
| 4 | Stratejik planın varlığı ve kapsamı | 2 | `STR-005`, `STR-006` | 1 |
| 5 | SWOT analizi | 2 | `STR-007`, `STR-008` | 1 |
| 6 | PESTLE ve dış çevre analizi | 1 | `STR-009` | 1 |
| 7 | Pazar ve sektör hedefleri | 2 | `STR-010`, `STR-011` | 1 |
| 8 | Rekabet analizi | 1 | `STR-012` | 1 |
| 9 | Müşteri ve paydaş beklentileri | 1 | `STR-013` | 1 |
| 10 | Stratejik öncelikler | 2 | `STR-014`, `STR-015` | 1 |
| 11 | Kurumsal hedefler | 2 | `STR-016`, `STR-017` | 1 |
| 12 | Departman hedefleri | 2 | `STR-018`, `STR-019` | 1 |
| 13 | Ölçülebilir KPI ve hedef metrikleri | 3 | `STR-020`, `STR-021`, `STR-022` | 1 |
| 14 | Balanced Scorecard / performans perspektifleri | 2 | `STR-023`, `STR-024` | 1 |
| 15 | Bütçe ve strateji bağlantısı | 2 | `STR-025`, `STR-026` | 1 |
| 16 | Yatırım ve kaynak önceliklendirme | 2 | `STR-027`, `STR-028` | 1 |
| 17 | Stratejik proje ve inisiyatif portföyü | 2 | `STR-029`, `STR-030` | 1 |
| 18 | ERP/CRM dönüşüm hedefleri | 2 | `STR-031`, `STR-032` | 1 |
| 19 | Dijitalleşme ve süreç olgunluğu | 2 | `STR-033`, `STR-034` | 1 |
| 20 | Ana veri ve raporlama stratejisi | 2 | `STR-035`, `STR-036` | 1 |
| 21 | Risk ve senaryo planlaması | 2 | `STR-037`, `STR-038` | 1 |
| 22 | Strateji uygulama takibi | 2 | `STR-039`, `STR-040` | 1 |
| 23 | Yönetim kurulu ve icra kurulu gözden geçirmesi | 2 | `STR-041`, `STR-042` | 1 |
| 24 | Kurum içi iletişim ve hedef yayılımı | 2 | `STR-043`, `STR-044` | 1 |
| 25 | Stratejik plan revizyonu, arşiv ve yol haritası | 3 | `STR-045`, `STR-046`, `STR-047` | 1 |
| | **TOPLAM** | **47** | **47 Soru (STR-001..047)** | **25 Zorunlu / 22 Opsiyonel** |

---

## 3. 47 Soruluk Detaylı Soru ve Süreç Dağılım Tablosu

| # | Süreç Adı | Soru ID | Başlık / Kapsam | Tip | Zorunlu | Kritiklik |
|---|---|---|---|---|:---:|:---:|
| 1 | Strateji organizasyonu ve sahipliği | `STR-001` | Stratejik planlama liderliği ve organizasyonel sahiplik | single_choice | Evet | Critical |
| 2 | Strateji organizasyonu ve sahipliği | `STR-002` | Strateji sürecine katılan birimler ve iç paydaşlar | multiple_choice | Hayır | Medium |
| 3 | Vizyon ve misyon | `STR-003` | Resmi, yazılı ve güncel vizyon-misyon tanımı | single_choice | Evet | High |
| 4 | Kurumsal değerler ve yönetim ilkeleri | `STR-004` | Kurumsal değerler, etik kurallar ve yönetim ilkeleri | single_choice | Evet | Medium |
| 5 | Stratejik planın varlığı ve kapsamı | `STR-005` | Çok yıllık resmi stratejik plan varlığı (Trigger 1) | single_choice | Evet | Critical |
| 6 | Stratejik planın varlığı ve kapsamı | `STR-006` | Stratejik planın ufku, detay düzeyi ve formatı (Target 1) | single_choice | Hayır | High |
| 7 | SWOT analizi | `STR-007` | Kurumsal SWOT analizi periyodu ve uygulaması (Trigger 2) | single_choice | Evet | High |
| 8 | SWOT analizi | `STR-008` | SWOT bulgularının stratejik hedeflere dönüştürülmesi (Target 2) | single_choice | Hayır | Medium |
| 9 | PESTLE ve dış çevre analizi | `STR-009` | Makro çevre faktörlerinin (PESTLE) izlenmesi ve analizi | single_choice | Evet | Medium |
| 10 | Pazar ve sektör hedefleri | `STR-010` | Pazar payı, büyüme ve coğrafi yayılım hedefleri | single_choice | Evet | High |
| 11 | Pazar ve sektör hedefleri | `STR-011` | Yeni segment ve pazarlara giriş stratejisi | single_choice | Hayır | Medium |
| 12 | Rekabet analizi | `STR-012` | Sürdürülebilir rekabet avantajı ve pazar konumlandırması | single_choice | Evet | High |
| 13 | Müşteri ve paydaş beklentileri | `STR-013` | Müşteri segmentasyonu ve paydaş beklentilerinin stratejiye etkisi | single_choice | Evet | Medium |
| 14 | Stratejik öncelikler | `STR-014` | Önümüzdeki 1-3 yıllık ana stratejik öncelikler ve odak alanları | multiple_choice | Evet | Critical |
| 15 | Stratejik öncelikler | `STR-015` | Stratejik hedefler arası çelişki ve önceliklendirme kuralı | single_choice | Hayır | Medium |
| 16 | Kurumsal hedefler | `STR-016` | Uzun vadeli kurumsal finansal ve operasyonel hedefler | single_choice | Evet | Critical |
| 17 | Kurumsal hedefler | `STR-017` | Hedef ölçüm sıklığı ve sapma tolerans limitleri | single_choice | Hayır | Medium |
| 18 | Departman hedefleri | `STR-018` | Kurumsal hedeflerin departmanlara kırılımı (Trigger 3) | single_choice | Evet | High |
| 19 | Departman hedefleri | `STR-019` | Departman hedeflerinin ekip/birey hedeflerine yayılımı (Target 3) | single_choice | Hayır | High |
| 20 | Ölçülebilir KPI ve hedef metrikleri | `STR-020` | Temel Performans Göstergeleri (KPI) seti varlığı (Trigger 4) | single_choice | Evet | Critical |
| 21 | Ölçülebilir KPI ve hedef metrikleri | `STR-021` | KPI veri kaynakları, formülleri ve güvenilirlik denetimi (Target 4) | single_choice | Hayır | High |
| 22 | Ölçülebilir KPI ve hedef metrikleri | `STR-022` | KPI sapmalarında kök neden analizi ve aksiyon başlatma | single_choice | Hayır | Medium |
| 23 | Balanced Scorecard / performans perspektifleri | `STR-023` | Çok boyutlu performans / Balanced Scorecard kullanımı (Trigger 5) | single_choice | Evet | High |
| 24 | Balanced Scorecard / performans perspektifleri | `STR-024` | BSC perspektif ağırlıkları ve stratejik harita (Strategy Map) (Target 5) | single_choice | Hayır | Medium |
| 25 | Bütçe ve strateji bağlantısı | `STR-025` | Yıllık bütçenin stratejik hedeflerle ilişkilendirilmesi | single_choice | Evet | Critical |
| 26 | Bütçe ve strateji bağlantısı | `STR-026` | Bütçe revizyonlarının stratejik hedeflere etkisi | single_choice | Hayır | Medium |
| 27 | Yatırım ve kaynak önceliklendirme | `STR-027` | CAPEX ve kaynak tahsisinde stratejik önceliklendirme modeli | single_choice | Evet | High |
| 28 | Yatırım ve kaynak önceliklendirme | `STR-028` | Yatırım kararlarında fizibilite ve ROI disiplini | single_choice | Hayır | Medium |
| 29 | Stratejik proje ve inisiyatif portföyü | `STR-029` | Stratejik proje ve inisiyatif portföyü yönetimi (Trigger 6) | single_choice | Evet | Critical |
| 30 | Stratejik proje ve inisiyatif portföyü | `STR-030` | Stratejik inisiyatiflerin beklenen iş faydası takibi (Target 6) | single_choice | Hayır | High |
| 31 | ERP/CRM dönüşüm hedefleri | `STR-031` | ERP/CRM yatırımlarının stratejik hedeflerle bağı (Trigger 7) | single_choice | Evet | Critical |
| 32 | ERP/CRM dönüşüm hedefleri | `STR-032` | ERP/CRM dönüşümünün stratejik başarı kriterleri (Target 7) | multiple_choice | Hayır | High |
| 33 | Dijitalleşme ve süreç olgunluğu | `STR-033` | Dijital dönüşüm yol haritası ve süreç olgunluk hedefi | single_choice | Evet | High |
| 34 | Dijitalleşme ve süreç olgunluğu | `STR-034` | Süreç standardizasyonu ve dokümantasyon olgunluğu | single_choice | Hayır | Medium |
| 35 | Ana veri ve raporlama stratejisi | `STR-035` | Tekil veri kaynağı (Single Source of Truth) stratejisi | single_choice | Evet | Critical |
| 36 | Ana veri ve raporlama stratejisi | `STR-036` | Üst yönetim dashboard ve stratejik BI araçları kullanımı | single_choice | Hayır | Medium |
| 37 | Risk ve senaryo planlaması | `STR-037` | Kurumsal riskler ve alternatif senaryo planları | single_choice | Evet | High |
| 38 | Risk ve senaryo planlaması | `STR-038` | Erken uyarı göstergeleri ve kriz hazırlık mekanizması | single_choice | Hayır | Medium |
| 39 | Strateji uygulama takibi | `STR-039` | Stratejik plan gerçekleşme izleme periyodu | single_choice | Evet | High |
| 40 | Strateji uygulama takibi | `STR-040` | Strateji izleme aksiyonlarının tamamlama disiplini | single_choice | Hayır | Medium |
| 41 | Yönetim kurulu ve icra kurulu gözden geçirmesi | `STR-041` | Üst yönetimin periyodik stratejik gözden geçirmesi (Trigger 8) | single_choice | Evet | High |
| 42 | Yönetim kurulu ve icra kurulu gözden geçirmesi | `STR-042` | Gözden geçirme kararlarının tutanak ve tebliğ süreci (Target 8) | single_choice | Hayır | Medium |
| 43 | Kurum içi iletişim ve hedef yayılımı | `STR-043` | Vizyon, misyon ve hedeflerin çalışanlara duyurulması | single_choice | Evet | Medium |
| 44 | Kurum içi iletişim ve hedef yayılımı | `STR-044` | Çalışanların hedef farkındalığı ölçümü ve anketler | single_choice | Hayır | Low |
| 45 | Stratejik plan revizyonu, arşiv ve yol haritası | `STR-045` | Stratejik planın resmi revizyon döngüsü | single_choice | Evet | High |
| 46 | Stratejik plan revizyonu, arşiv ve yol haritası | `STR-046` | Geçmiş stratejik plan ve gerçekleşme arşivi | single_choice | Hayır | Medium |
| 47 | Stratejik plan revizyonu, arşiv ve yol haritası | `STR-047` | 3-5 yıllık kurumsal ve ERP/CRM yol haritası belgesi | single_choice | Hayır | High |

---

## 4. 8 Koşullu Dallanma (Conditional Branching) Tablosu

| # | Hedef Soru | Koşul | Kaynak Soru | Koşul Değeri | Açıklama |
|---|---|:---:|---|---|---|
| **B1** | `STR-006` | `not_equals` | `STR-005` | `resmi_plan_yok_zihinsel_hedef` | Çok yıllık resmi plan varsa planın ufku ve belgelendirme formatı sorulur. |
| **B2** | `STR-008` | `not_equals` | `STR-007` | `swot_analizi_yapilmiyor` | SWOT analizi yapılıyorsa bulguların aksiyona dönüştürülmesi sorulur. |
| **B3** | `STR-019` | `not_equals` | `STR-018` | `departman_hedefi_kirilimi_yok` | Kurumsal hedefler departmanlara kırılıyorsa ekip/birey hedeflerine yayılımı sorulur. |
| **B4** | `STR-021` | `not_equals` | `STR-020` | `resmi_kpi_seti_tanimli_degil` | KPI seti tanımlıysa veri kaynakları ve güvenilirlik denetimi sorulur. |
| **B5** | `STR-024` | `not_equals` | `STR-023` | `bsc_kullanilmiyor_klasik_finansal_takip` | Balanced Scorecard kullanılıyorsa perspektif ağırlıkları ve stratejik harita sorulur. |
| **B6** | `STR-030` | `not_equals` | `STR-029` | `portfoy_takibi_yapilmiyor_bireysel_projeler` | Merkezi proje portföyü varsa inisiyatiflerin beklenen iş faydası takibi sorulur. |
| **B7** | `STR-032` | `not_equals` | `STR-031` | `stratejik_hedef_baglantisi_kurulmamis` | ERP/CRM stratejik hedef bağlantısı kurulmuşsa stratejik başarı kriterleri sorulur. |
| **B8** | `STR-042` | `not_equals` | `STR-041` | `resmi_stratejik_gozden_gecirme_yapilmiyor` | Üst yönetim resmi gözden geçirme yapıyorsa karar tutanakları ve tebliğ süreci sorulur. |

---

## 5. Cross-Pack İzolasyonu ve Sınır Ayrımı

1. **`MANAGEMENT`**: Kurumsal yönetişim organlarını (YK, icra komitesi), yetki/imza sirkülerini, onay matrislerini ve departmanlar arası operasyonel koordinasyonu inceler. `STRATEGY` ise şirketin vizyonunu, uzun vadeli hedeflerini, SWOT/PESTLE analizini ve stratejik KPI'larını keşfeder.
2. **`PROJECT_MANAGEMENT`**: Onaylanan projelerin teslimatını, WBS iş kırılımını, Gantt takvimini ve bütçe icrasını inceler. `STRATEGY` ise projelerin kurumsal hedeflere katkısını ve iş faydalarını portföy düzeyinde gözetir.
3. **`BUDGET_REPORTING`**: Ayrıntılı bütçe kalemlerini, fiili-bütçe varyanslarını ve mali tabloları inceler. `STRATEGY` ise yıllık bütçenin stratejik hedeflerle yönsel bağını ve sermaye yatırımı önceliklendirmesini ele alır.
4. **`REPORTING_ANALYTICS`**: Veri ambarı, ETL, OLAP ve raporlama teknik altyapısını inceler. `STRATEGY` ise üst yönetimin stratejik karar alma için kullandığı tekil veri stratejisini ve ana performans göstergelerini değerlendirir.
