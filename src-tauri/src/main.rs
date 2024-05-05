// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
extern crate webkit2gtk;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

use bonsai_app::filesystem::{Database, Leaf};

// -------------------------------------------------------

#[tauri::command]
fn create_leaf(db: tauri::State<Database>, leaf: Leaf) -> Result<(), String> {
    db.create_leaf(&leaf).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_leaf(db: tauri::State<Database>, leaf: Leaf) -> Result<(), String> {
    db.update_leaf(&leaf).map_err(|e| e.to_string())
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
fn get_env(name: &str) -> String {
    std::env::var(String::from(name)).unwrap_or(String::from(""))
}

// -------------------------------------------------------

fn main() {
    tauri::Builder::default()
        .manage(Database::new("bonsai_db").unwrap())
        .invoke_handler(tauri::generate_handler![
            zoom_window,
            get_env,
            create_leaf,
            read_leaf,
            delete_leaf,
            update_leaf,
            list_leaves,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
