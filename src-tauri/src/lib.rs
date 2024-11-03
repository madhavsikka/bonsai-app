// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod db;
pub mod filesystem;

use filesystem::{Config, Database, Leaf, Sage};
use tauri::Manager;
use db::{SqlDatabase, Leaf as SqlLeaf, Sage as SqlSage};


// -------------------------------------------------------

#[tauri::command]
async fn sql_create_entity(
    db: tauri::State<'_, SqlDatabase>,
    entity_type: &str,
    entity: serde_json::Value
) -> Result<(), String> {
    match entity_type {
        "leaf" => {
            let leaf: SqlLeaf = serde_json::from_value(entity).map_err(|e| e.to_string())?;
            db.create::<SqlLeaf>(leaf).await.map_err(|e| e.to_string())
        },
        "sage" => {
            let sage: SqlSage = serde_json::from_value(entity).map_err(|e| e.to_string())?;
            db.create::<SqlSage>(sage).await.map_err(|e| e.to_string())
        },
        _ => Err("Invalid entity type".to_string())
    }
}

#[tauri::command]
async fn sql_read_entity(
    db: tauri::State<'_, SqlDatabase>,
    entity_type: &str,
    id: &str,
) -> Result<Option<serde_json::Value>, String> {
    match entity_type {
        "leaf" => {
            let result = db.read::<SqlLeaf>(id).await.map_err(|e| e.to_string())?;
            Ok(result.map(|leaf| serde_json::to_value(leaf).unwrap()))
        },
        "sage" => {
            let result = db.read::<SqlSage>(id).await.map_err(|e| e.to_string())?;
            Ok(result.map(|sage| serde_json::to_value(sage).unwrap()))
        },
        _ => Err("Invalid entity type".to_string())
    }
}

#[tauri::command]
async fn sql_update_entity(
    db: tauri::State<'_, SqlDatabase>,
    entity_type: &str,
    entity: serde_json::Value
) -> Result<(), String> {
    match entity_type {
        "leaf" => {
            let leaf: SqlLeaf = serde_json::from_value(entity).map_err(|e| e.to_string())?;
            db.update::<SqlLeaf>(leaf).await.map_err(|e| e.to_string())
        },
        "sage" => {
            let sage: SqlSage = serde_json::from_value(entity).map_err(|e| e.to_string())?;
            db.update::<SqlSage>(sage).await.map_err(|e| e.to_string())
        },
        _ => Err("Invalid entity type".to_string())
    }
}

#[tauri::command]
async fn sql_list_entities(
    db: tauri::State<'_, SqlDatabase>,
    entity_type: &str,
) -> Result<Vec<serde_json::Value>, String> {
    match entity_type {
        "leaf" => {
            let leaves = db.list::<SqlLeaf>().await.map_err(|e| e.to_string())?;
            Ok(leaves.into_iter().map(|leaf| serde_json::to_value(leaf).unwrap()).collect())
        },
        "sage" => {
            let sages = db.list::<SqlSage>().await.map_err(|e| e.to_string())?;
            Ok(sages.into_iter().map(|sage| serde_json::to_value(sage).unwrap()).collect())
        },
        _ => Err("Invalid entity type".to_string())
    }
}

#[tauri::command]
async fn sql_delete_entity(
    db: tauri::State<'_, SqlDatabase>,
    entity_type: &str,
    id: &str,
) -> Result<(), String> {
    match entity_type {
        "leaf" => db.delete::<SqlLeaf>(id).await.map_err(|e| e.to_string()),
        "sage" => db.delete::<SqlSage>(id).await.map_err(|e| e.to_string()),
        _ => Err("Invalid entity type".to_string())
    }
}

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
        let db = Database::new(app_data_dir.clone()).unwrap();
        app.manage(db);

        // Use blocking to handle the async SqlDatabase initialization
        let sql_db = tokio::runtime::Runtime::new()
        .unwrap()
        .block_on(SqlDatabase::new(app_data_dir))
            .unwrap();
        app.manage(sql_db);

        Ok(())
    })
        .plugin(tauri_plugin_shell::init())
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
            search_sages,
            sql_create_entity,
            sql_read_entity,
            sql_update_entity,
            sql_list_entities,
            sql_delete_entity
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
