---
name: tauri-react-development
description: Tauri 2 kabuğu, React 18 frontend mimarisi ve TypeScript masaüstü geliştirme sınırları becerisidir.
---

# tauri-react-development Becerisi

## 1. Amaç
Tauri 2 masaüstü yetenekleri ile React 18 kullanıcı arayüzü bileşenlerini, tip güvenliği ve %100 çevrimdışı masaüstü sınırları içinde geliştirmek.

## 2. Kullanım Koşulları
* Kullanıcı arayüzü (UI), görünüm (view), modal veya bileşen geliştirilirken kullanılır.
* Tauri IPC (`invoke`, `plugin-sql`, `plugin-fs`, `plugin-dialog`, `plugin-opener`) entegrasyonlarında uygulanır.

## 3. Girdiler
* `src/components/`, `src/views/`, `src/db/` ve `src-tauri/` kaynak kodları
* TypeScript arayüz ve model tanımları

## 4. Uygulama Adımları
1. Bileşeni saf CSS Design Tokens (`var(--...)`) ile tasarla; harici ağır CSS framework'leri ekleme.
2. Tarayıcı fallback'i (Web) ile yerel masaüstü (Tauri) davranışlarını ayır.
3. Tauri 2 capability ve izin tanımlarını (`src-tauri/capabilities/`) kontrol et.
4. UI state güncellemelerini SQLite kalıcılığı ile senkronize tut.
5. `npm run build` ile TypeScript tip kontrolü ve Vite paketlemesini doğrula.
6. `cargo check --manifest-path src-tauri/Cargo.toml` ile Rust backend uyumunu kontrol et.

## 5. Doğrulama
* `npm run build` 0 hata ile tamamlanmalı.
* `cargo check` 0 hata ile tamamlanmalı.
* Bileşen render edildiğinde konsolda tip veya runtime hatası vermemeli.

## 6. Yasaklar
* ❌ `src/` içine harici AI/LLM API istemcisi yerleştirmek.
* ❌ Kullanıcı verilerini ağ üzerinden dışarı aktaran servisler yazmak.
* ❌ İlgisiz UI bileşenlerini kontrolsüzce yeniden yazmak (unauthorized refactor).

## 7. Teslim Çıktısı
* Tip güvenli, WCAG AA erişilebilirlik kontrastına uygun, responsive ve temiz React/Tauri modülleri.
