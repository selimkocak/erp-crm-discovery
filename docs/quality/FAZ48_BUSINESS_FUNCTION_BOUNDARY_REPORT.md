# ERP CRM Discovery — FAZ-48 İş Fonksiyonları Sınır Kontrolü ve İzolasyon Raporu

---

## 1. Amaç ve Kapsam

ERP/CRM keşif süreçlerinde komşu veya ardışık iş fonksiyonları arasında sorumluluk alanlarının netleştirilmesi, mükerrer bilgi toplamayı önlerken süreç boşluklarını (blind spots) engeller.

Bu rapor, 12 kritik iş fonksiyonu çiftinin sınır haritasını, ayrışma ilkelerini ve test doğrulamalarını belgeler.

---

## 2. 12 Kritik Fonksiyon Çiftinin Sınır Haritası

| No | Fonksiyon Çifti | Fonksiyon A Odak Alanı | Fonksiyon B Odak Alanı | Sınır Çizgisi ve Ayrışma Kriteri |
|:---|:---|:---|:---|:---|
| 1 | **Sales ↔ CRM** | Teklif, sipariş onaylama, iskonto yetkisi, sözleşme şartları | Aday müşteri (lead), etkileşim geçmişi, şikayet ve saha servis | Adayın kesin sipariş verme anı CRM'den Satışa devir noktasıdır. |
| 2 | **Sales ↔ Invoicing** | Satış siparişinin kabulü, teslim taahhüdü ve fiyatlama | İrsaliye-fatura eşleme, e-Fatura/e-Arşiv kesimi, 3'lü mutabakat | Sipariş sevke hazır olduğunda faturalama döngüsü başlar. |
| 3 | **Procurement ↔ Inventory** | Satın alma talebi (PR), satıcı teklifleri, satın alma siparişi (PO) | Stok kartı, parti/seri takibi, emniyet stoku, stok değerleme | Mal kabul anı satın almadan stok sahipliğine geçiş anıdır. |
| 4 | **Inventory ↔ Warehouse** | Miktarsal ve mali stok bakiyesi, sayım farkı muhasebesi | Fiziksel adres/raf, koridor, mal toplama (picking), barkodlu yerleştirme | Stok muhasebesel mülkiyeti, Depo ise fiziksel yerleşim ve elleçlemeyi yönetir. |
| 5 | **Production Planning ↔ Work Orders** | MRP motoru, kaba/ince kapasite planlama, MPS çizelgesi | İş emri rotaları, operasyon teyitleri, duruş ve tezgâh fiili süreleri | Planlama iş emrini serbest bırakır (release), Atölye sahada icra eder. |
| 6 | **Production Planning ↔ Quality** | Üretim parti takvimi, parti büyüklüğü ve hat dengesi | Giriş kalite, proses kontrol, son muayene, hurda ve red kataloğu | Kalite, üretim hattındaki durdurma ve onay kapılarını (gate) denetler. |
| 7 | **Maintenance ↔ IT Infrastructure** | CNC tezgâhları, lazer, kalıp, hidrolik ve pres makineleri bakımı | Sunucular, yerel ağ/VPN, güvenlik duvarı, ERP veri tabanı ve yedekleme | Bakım operasyonel makineleri, BT ise bilişim ve siber altyapıyı yönetir. |
| 8 | **Treasury ↔ Accounting** | Nakit projeksiyonu, banka talimatı, POS, çek/senet ve kredi | Yevmiye kayıtları, mizan, bilanço, KDV/Muhtasar beyannameleri | Hazine fiili para hareketini, Muhasebe ise yasal tahakkuk ve mali tabloları yönetir. |
| 9 | **Human Resources ↔ Payroll** | İşe alım, yetkinlik matrisi, eğitim planı ve performans | PDKS puantaj, bordro tahakkuku, SGK bildirgeleri, net/brüt ücret | İK çalışan gelişim ve organizasyonunu, Bordro ise yasal hakedişi hesaplar. |
| 10 | **Legal Compliance ↔ Document Management** | KVKK, sözleşme onay politikası, icra/dava, regülasyon uyumu | Merkezi dosya kasası, klasör hiyerarşisi, doküman versiyonlama | Hukuk kuralları ve onayları belirler, Doküman Yönetimi dijital saklamayı sağlar. |
| 11 | **Master Data Management ↔ Governance** | Stok/Cari kart kodlama kuralı, tekilleştirme ve sözlük standardı | Veri sahipliği (Data Owner/Steward), SoD riskleri ve yetki matrisi | MDM veri içeriğinin doğruluğunu, Yönetişim ise yetki ve sorumlulukları yönetir. |
| 12 | **Management ↔ Strategy** | Kurumsal yönetişim, iç denetim, süreç sahiplikleri ve komiteler | 3-5 yıllık vizyon, kurumsal OKR'lar, pazar genişleme hedefleri | Strateji hedef yönünü çizer, Yönetim operasyonel icra ve yönetişimi sağlar. |

---

## 3. Otomatik Sınır Doğrulama Testi

Sınır kuralları ve paket bağımsızlıkları `test/faz48_business_function_boundary_test.ts` (36 PASS) ile test otomasyonuna bağlanmıştır.
