// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use nanoid::nanoid;

// -------------------------------------------------------

#[derive(serde::Serialize)]
struct Leaf {
    id: String,
    title: String,
    body: String,
}

// -------------------------------------------------------

#[derive(serde::Serialize)]
struct CreateLeafResponse {
    message: Leaf,
}

#[tauri::command]
fn create_leaf(title: &str, body: &str) -> Result<CreateLeafResponse, String> {
    use bonsai_app::db::establish_connection;

    let connection = &mut establish_connection();
    let id = nanoid!();
    let leaf = Leaf {
        id,
        title: title.to_string(),
        body: body.to_string(),
    };

    Ok(CreateLeafResponse { message: leaf })
}

// -------------------------------------------------------

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            db::init();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
