// ERP CRM Discovery — Tauri Application Library
//
// Veri zinciri: React → Tauri IPC → @tauri-apps/plugin-sql → SQLite (disk)
// Dışa aktarım: React → @tauri-apps/plugin-dialog & @tauri-apps/plugin-fs → Yerel Disk

#[tauri::command]
fn open_attachment_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Windows dosya acilamadi: {}", e))?;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![open_attachment_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
