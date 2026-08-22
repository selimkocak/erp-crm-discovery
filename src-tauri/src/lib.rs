// ERP CRM Discovery — Tauri Application Library
//
// Veri zinciri: React → Tauri IPC → @tauri-apps/plugin-sql → SQLite (disk)
// Dışa aktarım: React → @tauri-apps/plugin-dialog & @tauri-apps/plugin-fs → Yerel Disk
//
// HOTFIX: Windows open_attachment_path — explorer.exe ile güvenilir açma

/// Attachment Vault'tan yönetilen dosyayı işletim sisteminin varsayılan uygulamasıyla açar.
///
/// Windows: explorer.exe "C:\...\dosya.pdf"
///   - cmd /C start bazen backslash içeren path'lerde başarısız olur.
///   - explorer.exe her zaman backslash path ile çalışır.
///
/// macOS: open /Users/.../dosya.pdf
/// Linux: xdg-open /home/.../dosya.pdf
#[tauri::command]
fn open_attachment_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // Windows: explorer.exe ile aç
        // Path'i backslash formatında bekler (resolveAttachmentAbsolutePath bunu zaten sağlıyor)
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
///
/// Windows: explorer.exe /select,"C:\...\dosya.pdf"
/// macOS:   open -R "/Users/.../dosya.pdf"
/// Linux:   xdg-open "/parent/dir/"
#[tauri::command]
fn show_attachment_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // Windows: explorer /select,path — dosyayı vurgular
        std::process::Command::new("explorer.exe")
            .arg("/select,")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Windows klasor gosterilemedi: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "macos")]
    {
        // macOS: open -R dosyayı Finder'da seçili gösterir
        std::process::Command::new("open")
            .arg("-R")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("macOS klasor gosterilemedi: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        // Linux: üst klasörü xdg-open ile aç
        let parent = std::path::Path::new(&path)
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or(path.clone());
        std::process::Command::new("xdg-open")
            .arg(&parent)
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
        .invoke_handler(tauri::generate_handler![open_attachment_path, show_attachment_in_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
