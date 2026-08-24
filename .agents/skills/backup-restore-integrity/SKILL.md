---
name: backup-restore-integrity
description: Taşınabilir .erpcrm arşivleme, geri yükleme, çoğaltma, kanıt kasası bütünlüğü ve path traversal koruması becerisidir.
---

# backup-restore-integrity Becerisi

## 1. Amaç
Projelerin `.erpcrm` formatında güvenli, sıfır bağımlılıklı POSIX USTAR + GZIP arşivleri olarak dışa aktarılmasını, şema yükseltmelerinde eksiksiz geri yüklenmesini ve Managed Attachment Vault kanıtlarının fiziksel ikiz olarak kopyalanmasını sağlamak.

## 2. Kullanım Koşulları
* Yedekleme, geri yükleme veya proje çoğaltma (şablon / tam kopya) özellikleri geliştirilirken kullanılır.
* `.erpcrm` şema sürümü (Schema Version) güncellenirken uygulanır.

## 3. Girdiler
* [src/storage/backupManager.ts](file:///src/storage/backupManager.ts), [src/storage/tarArchive.ts](file:///src/storage/tarArchive.ts)
* Managed Attachment Vault dizin yapısı
* SQLite proje veri tablosu kayıtları (23+ tablo)

## 4. Uygulama Adımları
1. **Görünür Kayıt Yolu:** Kullanıcının seçtiği dosya adı, konumu ve boyutunu net bir şekilde bildiren yerel Save/Open Dialog akışını koru.
2. **ID & Foreign Key Remapping:** Geri yükleme sırasında tüm ID'lerin (`proj_...`, `ans_...`, `find_...`) çakışmayı önlemek için yeniden eşlendiğini (remapping) doğrula.
3. **Kanıt Kasası Bütünlüğü:** Fiziksel ek dosyalarının `{projectId}/{bfCode}/{questionId}/` altında kopyalandığını ve relative path'lerin güncellendiğini teyit et.
4. **Güvenlik & Checksum:** SHA-256 bütünlük kontrolü yap; `..` içeren path traversal saldırılarını kesinlikle reddet.
5. **Hata Anında Temizlik:** Geri yükleme sırasında hata oluşursa, yarım kalan yetim projeyi ve kopyalanan dosyaları atomik olarak temizle (rollback & cleanup).
6. **Kaynak Proje Dokunulmazlığı:** Çoğaltma veya dışa aktarma sırasında orijinal kaynak projeye asla dokunma.

## 5. Doğrulama
* Dışa aktarılan `.erpcrm` arşivi başarıyla açılabilmeli.
* Geri yüklenen proje SQLite'da tüm cevapları, bulguları ve ekleriyle açılabilmeli.
* Kaynak dosya silinse dahi Managed Vault ikiz dosyası sağlam kalmalı.

## 6. Yasaklar
* ❌ Arşiv içine mutlak dosya yolu (`C:\Users\...`, `/home/...`) yazmak.
* ❌ Path traversal (`../../etc/passwd`) içeren dosya adlarına izin vermek.
* ❌ Hata durumunda veritabanında yarım/bozuk proje kaydı bırakmak.

## 7. Teslim Çıktısı
* Güvenli, taşınabilir ve doğrulanmış `.erpcrm` arşiv işleme fonksiyonları.
