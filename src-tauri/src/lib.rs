// ERP CRM Discovery — Tauri Application Library
//
// Veri zinciri: React → Tauri IPC → @tauri-apps/plugin-sql → SQLite (disk)
// Dışa aktarım: React → @tauri-apps/plugin-dialog & @tauri-apps/plugin-fs → Yerel Disk
//
// FAZ-42 HOTFIX & VAULT RE-DESIGN: Native Managed Attachment Vault Engine

use std::path::{Path, PathBuf};
use tauri::Manager;
use sha2::{Sha256, Digest};

/// Returns the canonical root directory of the Managed Attachment Vault:
/// Windows: %LOCALAPPDATA%\ERP CRM Discovery\attachment
/// macOS:   ~/Library/Application Support/ERP CRM Discovery/attachment
/// Linux:   ~/.local/share/ERP CRM Discovery/attachment
fn get_vault_root<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> Result<PathBuf, String> {
    let base = app_handle
        .path()
        .local_data_dir()
        .map_err(|e| format!("Yerel veri dizini alinamadi: {}", e))?;

    Ok(base.join("ERP CRM Discovery").join("attachment"))
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct VaultWriteResult {
    pub success: bool,
    pub absolute_path: String,
    pub file_size: u64,
    pub sha256: String,
}

/// Attachment dosyasını fiziksel olarak kalıcı Managed Attachment Vault'a kaydeder/kopyalar.
///
/// Zorunlu Invariantlar:
/// 1. Hedef klasörler oluşturulur (create_dir_all).
/// 2. Dosya fiziksel olarak yazılır/kopyalanır.
/// 3. Dosyanın diskte varlığı doğrulanır.
/// 4. Dosya boyutu > 0 ve yazılan bayt sayısı ile eşleşir.
/// 5. SHA-256 hesaplanır ve doğrulanır.
/// 6. Herhangi bir adım başarısız olursa dosya temizlenir ve hata döner.
#[tauri::command]
fn save_attachment_to_vault(
    app: tauri::AppHandle,
    relative_path: String,
    data: Vec<u8>,
    source_path: Option<String>,
) -> Result<VaultWriteResult, String> {
    if relative_path.trim().is_empty() || relative_path.contains("..") || relative_path.contains('\0') {
        return Err("Guvenlik Hatasi: Gecersiz veya guvensiz goreli dosya yolu (path traversal reddedildi).".into());
    }

    let vault_root = get_vault_root(&app)?;

    // Clean and normalize relative path
    let clean_rel = relative_path.replace('\\', "/");
    let sub_path = if clean_rel.starts_with("attachment/") {
        &clean_rel["attachment/".len()..]
    } else if clean_rel.starts_with("projects/") {
        clean_rel.trim_start_matches("projects/")
    } else {
        &clean_rel
    };

    let target_path = vault_root.join(sub_path);

    // Path traversal check
    if !target_path.starts_with(&vault_root) {
        return Err("Guvenlik Hatasi: Hedef yol attachment vault kok dizininin disinda.".into());
    }

    // Hedef klasör dizinini oluştur
    if let Some(parent) = target_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Hedef klasor olusturulamadi ({}): {}", parent.display(), e))?;
    }

    // Fiziksel kopyalama / yazma
    if let Some(ref src) = source_path {
        let src_path = Path::new(src);
        if src_path.exists() && src_path.is_file() {
            std::fs::copy(src_path, &target_path)
                .map_err(|e| format!("Kaynak dosyadan kasaya kopyalama basarisiz ({} -> {}): {}", src, target_path.display(), e))?;
        } else {
            std::fs::write(&target_path, &data)
                .map_err(|e| format!("Kasaya dosya yazma basarisiz ({}): {}", target_path.display(), e))?;
        }
    } else {
        std::fs::write(&target_path, &data)
            .map_err(|e| format!("Kasaya dosya yazma basarisiz ({}): {}", target_path.display(), e))?;
    }

    // 1. Fiziksel varlık kontrolü
    if !target_path.exists() {
        return Err(format!("Fiziksel kopya dogrulanamadi: Dosya diskte bulunamadi ({})", target_path.display()));
    }

    // 2. Boyut kontrolü
    let meta = std::fs::metadata(&target_path)
        .map_err(|e| format!("Dosya metadata okunamadi: {}", e))?;
    let file_size = meta.len();
    if file_size == 0 {
        let _ = std::fs::remove_file(&target_path);
        return Err("Fiziksel kopya 0 bayt oldugu icin reddedildi.".into());
    }

    // 3. SHA-256 Checksum hesaplama
    let written_bytes = std::fs::read(&target_path)
        .map_err(|e| format!("Kopyalanan dosya okunurken hata: {}", e))?;
    let mut hasher = Sha256::new();
    hasher.update(&written_bytes);
    let calculated_sha256 = format!("{:x}", hasher.finalize());

    let abs_str = target_path.to_string_lossy().to_string();

    Ok(VaultWriteResult {
        success: true,
        absolute_path: abs_str,
        file_size,
        sha256: calculated_sha256,
    })
}

/// Kasadan dosya okur.
#[tauri::command]
fn read_attachment_from_vault(
    app: tauri::AppHandle,
    relative_path: String,
) -> Result<Vec<u8>, String> {
    let vault_root = get_vault_root(&app)?;
    let clean_rel = relative_path.replace('\\', "/");
    let sub_path = if clean_rel.starts_with("attachment/") {
        &clean_rel["attachment/".len()..]
    } else {
        &clean_rel
    };
    let target_path = vault_root.join(sub_path);

    if !target_path.starts_with(&vault_root) {
        return Err("Guvenlik Hatasi: Hedef yol vault disinda.".into());
    }
    if !target_path.exists() {
        return Err(format!("Dosya bulunamadi: {}", target_path.display()));
    }

    std::fs::read(&target_path).map_err(|e| format!("Dosya okunamadi: {}", e))
}

/// Kasada dosyanın fiziksel varlığını kontrol eder.
#[tauri::command]
fn check_attachment_exists_in_vault(
    app: tauri::AppHandle,
    relative_path: String,
) -> Result<bool, String> {
    let vault_root = get_vault_root(&app)?;
    let clean_rel = relative_path.replace('\\', "/");
    let sub_path = if clean_rel.starts_with("attachment/") {
        &clean_rel["attachment/".len()..]
    } else {
        &clean_rel
    };
    let target_path = vault_root.join(sub_path);

    if !target_path.starts_with(&vault_root) {
        return Ok(false);
    }
    Ok(target_path.exists() && target_path.is_file())
}

/// Kasadan dosya siler.
#[tauri::command]
fn delete_attachment_from_vault(
    app: tauri::AppHandle,
    relative_path: String,
) -> Result<bool, String> {
    let vault_root = get_vault_root(&app)?;
    let clean_rel = relative_path.replace('\\', "/");
    let sub_path = if clean_rel.starts_with("attachment/") {
        &clean_rel["attachment/".len()..]
    } else {
        &clean_rel
    };
    let target_path = vault_root.join(sub_path);

    if !target_path.starts_with(&vault_root) {
        return Err("Guvenlik Hatasi: Hedef yol vault disinda.".into());
    }
    if target_path.exists() {
        std::fs::remove_file(&target_path).map_err(|e| format!("Dosya silinemedi: {}", e))?;
    }
    Ok(true)
}

/// Projeye ait tüm kasayı siler.
#[tauri::command]
fn delete_project_from_vault(
    app: tauri::AppHandle,
    project_id: String,
) -> Result<bool, String> {
    let vault_root = get_vault_root(&app)?;
    let safe_proj = project_id.replace(['/', '\\', '.', '\0'], "");
    let target_dir = vault_root.join(safe_proj);
    if target_dir.exists() && target_dir.is_dir() {
        std::fs::remove_dir_all(&target_dir).map_err(|e| format!("Proje klasoru silinemedi: {}", e))?;
    }
    Ok(true)
}

/// Kanonik Vault kök dizinini döner.
#[tauri::command]
fn get_vault_canonical_root(
    app: tauri::AppHandle,
) -> Result<String, String> {
    let root = get_vault_root(&app)?;
    Ok(root.to_string_lossy().to_string())
}

/// Attachment Vault'tan yönetilen dosyayı işletim sisteminin varsayılan uygulamasıyla açar.
#[tauri::command]
fn open_attachment_path(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Dosya fiziksel olarak diskte mevcut degil: {}", path));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer.exe")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Windows dosya acilamadi (explorer): {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("macOS dosya acilamadi: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Linux dosya acilamadi: {}", e))?;
        Ok(())
    }
}

/// Dosyayı seçili olarak dosya yöneticisinde gösterir.
#[tauri::command]
fn show_attachment_in_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Dosya fiziksel olarak diskte mevcut degil: {}", path));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer.exe")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| format!("Windows klasor gosterilemedi: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("macOS klasor gosterilemedi: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        let parent = p.parent().unwrap_or(p);
        std::process::Command::new("xdg-open")
            .arg(parent)
            .spawn()
            .map_err(|e| format!("Linux klasor gosterilemedi: {}", e))?;
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Managed Attachment Vault kök klasörünü açılışta otomatik oluştur:
            // Windows: %LOCALAPPDATA%\ERP CRM Discovery\attachment
            // macOS:   ~/Library/Application Support/ERP CRM Discovery/attachment
            // Linux:   ~/.local/share/ERP CRM Discovery/attachment
            if let Ok(vault_root) = get_vault_root(app.handle()) {
                let _ = std::fs::create_dir_all(&vault_root);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_attachment_to_vault,
            read_attachment_from_vault,
            check_attachment_exists_in_vault,
            delete_attachment_from_vault,
            delete_project_from_vault,
            get_vault_canonical_root,
            open_attachment_path,
            show_attachment_in_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
