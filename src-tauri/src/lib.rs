// ERP CRM Discovery — Tauri Application Library
//
// Veri zinciri: React → Tauri IPC → @tauri-apps/plugin-sql → SQLite (disk)
// Dışa aktarım: React → @tauri-apps/plugin-dialog & @tauri-apps/plugin-fs → Yerel Disk

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
