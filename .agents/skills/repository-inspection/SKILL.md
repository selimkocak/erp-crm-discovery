---
name: repository-inspection
description: ERP CRM Discovery projesinde salt-okunur depo analizi, dosya arama, git durumu ve mimari harita çıkarma becerisidir.
---

# repository-inspection Becerisi

## 1. Amaç
Kod veya veritabanı değişikliği yapmadan önce çalışma ağacını, Git durumunu, mevcut mimari servisleri, tek doğruluk kaynaklarını ve kapsamı salt-okunur biçimde eksiksiz incelemek.

## 2. Kullanım Koşulları
* Yeni bir faza başlarken veya bir hata bildirimi alındığında ilk adım olarak kullanılır.
* Kod değiştirmeden önce kullanıcı değişikliklerinin olup olmadığını doğrulamak için zorunludur.

## 3. Girdiler
* Mevcut repository dosya yapısı
* `git status --short` ve `git log -1` çıktıları
* Hedef faz talimatı veya hata raporu

## 4. Uygulama Adımları
1. `git status --short` ile commit edilmemiş değişiklikleri tara.
2. `git branch --show-current` ile aktif dalı doğrula (varsayılan `main`).
3. `git log -1` ile yerel `HEAD` commit'ini incele.
4. `rg` (ripgrep) veya grep araçlarıyla ilgili servis ve veri modellerini tara.
5. Benzer veya ilişkili mevcut fonksiyonları ([src/db/client.ts](file:///src/db/client.ts), [src/report/builder.ts](file:///src/report/builder.ts) vb.) tespit et.
6. Kapsam haritasını ve dokunulacak/dokunulmayacak dosyaları çıkar.

## 5. Doğrulama
* Kullanıcı dosyalarının korunup korunmadığı kontrol edilir.
* İlgili mimari bileşenin tek doğruluk kaynağı netleştirilir.

## 6. Yasaklar
* ❌ İnceleme aşamasında kaynak kod dosyalarını değiştirmek.
* ❌ Kullanıcıya ait mevcut düzenlemeleri geri almak veya ezmek.
* ❌ Destructive git komutları çalıştırmak.

## 7. Teslim Çıktısı
* [Kök Neden Raporu](file:///.agents/templates/root-cause-report.md) veya [Uygulama Planı](file:///.agents/templates/implementation-plan.md) için girdi teşkil eden kapsam ve bulgu özeti.
