// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod filesystem;

use filesystem::{Config, Database, Leaf, Sage};
use tauri::Manager;

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
fn get_config(db: tauri::State<Database>) -> Result<Config, String> {
    db.get_config().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_config(db: tauri::State<Database>, config: Config) -> Result<(), String> {
    db.set_config(&config).map_err(|e| e.to_string())
}

// -------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            let db = Database::new(app_data_dir).unwrap();
            app.manage(db);
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
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
