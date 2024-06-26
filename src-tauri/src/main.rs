// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
extern crate webkit2gtk;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use bonsai_app::filesystem::{Config, Database, Leaf, Sage};

// -------------------------------------------------------

#[tauri::command]
fn create_leaf(db: tauri::State<Database>, name: String, content: String) -> Result<(), String> {
    db.create_leaf(&name, &content).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_leaf(db: tauri::State<Database>, name: String, content: String) -> Result<(), String> {
    db.update_leaf(&name, &content).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_leaf(db: tauri::State<Database>, name: String) -> Result<Leaf, String> {
    db.read_leaf(&name).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_leaves(db: tauri::State<Database>) -> Result<Vec<Leaf>, String> {
    db.list_leaves().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_leaf(db: tauri::State<Database>, name: String) -> Result<(), String> {
    db.delete_leaf(&name).map_err(|e| e.to_string())
}

#[tauri::command]
fn search_leaves(db: tauri::State<Database>, query: String) -> Result<Vec<Leaf>, String> {
    db.search_leaves(&query).map_err(|e| e.to_string())
}

// -------------------------------------------------------

#[tauri::command]
fn create_sage(
    db: tauri::State<Database>,
    name: String,
    description: String,
) -> Result<(), String> {
    db.create_sage(&name, &description)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_sage(
    db: tauri::State<Database>,
    name: String,
    description: String,
) -> Result<(), String> {
    db.update_sage(&name, &description)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn read_sage(db: tauri::State<Database>, name: String) -> Result<Option<Sage>, String> {
    db.read_sage(&name).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_sages(db: tauri::State<Database>) -> Result<Vec<Sage>, String> {
    db.list_sages().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_sage(db: tauri::State<Database>, name: String) -> Result<(), String> {
    db.delete_sage(&name).map_err(|e| e.to_string())
}

#[tauri::command]
fn search_sages(db: tauri::State<Database>, query: String) -> Result<Vec<Sage>, String> {
    db.search_sages(&query).map_err(|e| e.to_string())
}

// -------------------------------------------------------

#[tauri::command]
fn upload_file(
    db: tauri::State<Database>,
    file_name: String,
    file_data: Vec<u8>,
) -> Result<String, String> {
    db.upload_file(&file_name, &file_data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_file(db: tauri::State<Database>, file_name: String) -> Result<Vec<u8>, String> {
    db.get_file(&file_name).map_err(|e| e.to_string())
}

// -------------------------------------------------------

#[tauri::command]
fn zoom_window(window: tauri::Window, scale_factor: f64) {
    let _ = window.with_webview(move |webview| {
        #[cfg(target_os = "linux")]
        {
            // see https://docs.rs/webkit2gtk/0.18.2/webkit2gtk/struct.WebView.html
            // and https://docs.rs/webkit2gtk/0.18.2/webkit2gtk/trait.WebViewExt.html
            use webkit2gtk::traits::WebViewExt;
            webview.inner().set_zoom_level(scale_factor);
        }

        #[cfg(windows)]
        unsafe {
            // see https://docs.rs/webview2-com/0.19.1/webview2_com/Microsoft/Web/WebView2/Win32/struct.ICoreWebView2Controller.html
            webview.controller().SetZoomFactor(scale_factor).unwrap();
        }

        #[cfg(target_os = "macos")]
        unsafe {
            let () = msg_send![webview.inner(), setPageZoom: scale_factor];
        }
    });
}

// -------------------------------------------------------

#[tauri::command]
fn get_config(db: tauri::State<Database>) -> Result<Config, String> {
    db.get_config().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_config(db: tauri::State<Database>, config: Config) -> Result<(), String> {
    db.set_config(&config).map_err(|e| e.to_string())
}

// -------------------------------------------------------

fn main() {
    tauri::Builder::default()
        .manage(Database::new("bonsai").unwrap())
        .invoke_handler(tauri::generate_handler![
            zoom_window,
            get_config,
            set_config,
            create_leaf,
            read_leaf,
            delete_leaf,
            update_leaf,
            list_leaves,
            search_leaves,
            upload_file,
            get_file,
            create_sage,
            read_sage,
            delete_sage,
            update_sage,
            list_sages,
            search_sages
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
