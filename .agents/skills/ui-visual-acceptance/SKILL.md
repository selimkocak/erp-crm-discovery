---
name: ui-visual-acceptance
description: Masaüstü kullanıcı arayüzü görsel kabulü, pencere boyutu taşma denetimi ve native etkileşim doğrulama becerisidir.
---

# ui-visual-acceptance Becerisi

## 1. Amaç
Kullanıcı arayüzü değişikliklerinin otomasyon testleriyle yetinilmeyip, gerçek masaüstü ortamında (Windows/macOS/Linux) görsel ve ergonomik olarak kusursuz çalıştığını doğrulamak.

## 2. Kullanım Koşulları
* Soru ekranı, rapor önizleme, formlar, modallar veya navigasyon barları değiştirildiğinde kullanılır.
* Gerçek kullanıcı kabul adımları tanımlanırken zorunludur.

## 3. Girdiler
* UI bileşenleri, CSS stilleri (`src/index.css`, `src/styles/`)
* Hedef masaüstü çözünürlükleri (1280x800, 1920x1080)

## 4. Uygulama Adımları
1. **Pencere & Taşma Denetimi:** Viewport değişimlerinde modal taşması, buton kayması veya istenmeyen yatay scrollbar oluşmadığını denetle.
2. **Platform Farklılıkları:** Windows (font rendering, scrollbar genişliği) ve macOS (font smoothing, modal animasyonu) farklarını göz önünde bulundur.
3. **Native Etkileşimler:** Dosya kaydetme (Save Dialog), klasörde gösterme (Finder/Explorer) ve harici bağlantı açma (Opener) işlemlerini yerel masaüstü bağlamında değerlendir.
4. **Tek Paket Halinde Sunum:** Kullanıcıya her mesajda tek bir küçük kontrol yaptırmak yerine, mantıksal kontrol adımlarını tek bir net kontrol listesi paketi olarak sun.
5. **Tarayıcı / CDP Yokluğu:** Geliştirme ortamında tarayıcı veya CDP motoru yoksa ürünü doğrudan "başarısız" ilan etme; otomasyon testleri ile statik model uyumunu doğrula ve kullanıcıya net masaüstü kontrol listesi sağla.

## 5. Doğrulama
* Buton kontrastları WCAG AA standardını (en az 4.5:1) sağlamalıdır.
* Soru ve rapor metinleri hiçbir çözünürlükte kesilmemelidir (`text-overflow: ellipsis` veya çok satırlı düzen).

## 6. Yasaklar
* ❌ Gerçek masaüstü testi yapılmadığı hâlde "Görsel kabul %100 tamamlandı" demek.
* ❌ Kullanıcıya gereksiz yere her adımda tek tek onay sorma döngüsüne girmek.

## 7. Teslim Çıktısı
* Kullanıcı için net, maddeli ve adım adım uygulanabilir görsel kabul kontrol listesi.
