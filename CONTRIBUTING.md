# Contributing to ERP CRM Discovery

Projeye katkıda bulunmak istediğiniz için teşekkür ederiz! ERP CRM Discovery, topluluk ve süreç danışmanlarının ortak aklıyla gelişen açık kaynaklı bir platformdur.

---

## Katkı Türleri

1. **Soru Paketleri (Question Packs):** Yeni sektörel veya fonksiyonel soru paketleri ekleme, mevcut soruları zenginleştirme.
2. **Çeviri ve Yerelleştirme:** Soru paketlerini ve arayüzü farklı dillere çevirme.
3. **ERP Alan Uzmanlığı (Domain Review):** Soru gerekçeleri, seçenekler ve ERP etki alanı eşleştirmelerini inceleme.
4. **Yazılım Geliştirme (Bug Fix & Features):** React, TypeScript, Tauri ve Rust katmanlarında iyileştirmeler.
5. **Dokümantasyon & UX:** Kullanım kılavuzları, şema dokümanları ve arayüz ergonomisi katkıları.

---

## 🎯 Yazılım Kodu Bilmeden Soru Paketi Geliştirme

Bu projenin en önemli felsefesi:  
> **"Bir ERP danışmanının soru paketi geliştirmek için Rust veya React bilmesi gerekmez."**

Tüm soru paketleri [`question-packs/`](question-packs/) dizininde deklaratif JSON dosyaları halinde saklanır.

### Örnek Referans Paket
- İnceleyin: [`question-packs/tr/sales/core.json`](question-packs/tr/sales/core.json)
- Şema Standartları: [`docs/QUESTION_PACK_SCHEMA_V1.md`](docs/QUESTION_PACK_SCHEMA_V1.md)

### Soru Yazım Kuralları:
- **Tekil Soru ID'si:** Her soru için anlamlı ve tekil bir ID belirleyin (örn: `SALES-001`, `PROC-005`).
- **Tarafsız Dil (Vendor-Neutral):** Belirli bir ERP markasını (SAP, Microsoft, Logo vb.) öne çıkarmayan evrensel süreç terminolojisi kullanın.
- **Net Seçenekler & Diğer:** Kapsamlı standart seçenekler sunun ve esneklik için uygun yerlerde `"is_other": true` ekleyin.
- **Gerekçe (Rationale):** Danışmanın bu soruyu neden sorduğunu ve cevabın ERP projesindeki etkisini açıklayın.
- **Koşullu Dallanma (Branching):** Gereksiz soruları gizlemek için mantıksal koşul kurallarını kullanın.

---

## Kod Katkıları İçin Geliştirici İş Akışı

1. Projeyi Fork edin ve yerel çalışma dalınızı oluşturun (`feature/yeni-soru-paketi` veya `fix/hata-tanimi`).
2. Bağımlılıkları yükleyin:
   ```bash
   npm ci
   ```
3. Kod üretimini ve testleri çalıştırın:
   ```bash
   npm run generate
   npm test
   npm run build
   cargo check --manifest-path src-tauri/Cargo.toml
   ```
4. Tüm testlerin başarıyla geçtiğinden emin olun (**354/354 PASS**).
5. Değişikliklerinizi commit edin ve Pull Request açın.

---

## Gizlilik Hatırlatması
> [!WARNING]
> Lütfen issue veya PR açarken **asla** gerçek müşteri firma adları, vergi numaraları, müşteri veritabanı yedekleri veya gizli kurumsal veriler paylaşmayınız.
