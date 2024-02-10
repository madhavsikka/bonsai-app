use crate::{db::establish_db_connection, models::NewLeaf, schema::leafs};
use diesel::prelude::*;
use models::Leaf;

pub mod db;
pub mod models;
pub mod schema;

// -------------------------------------------------------
#[derive(serde::Serialize)]
struct CreateLeafResponse {
    message: Leaf,
}

#[tauri::command]
fn create_leaf(title: &str, body: &str) -> Result<CreateLeafResponse, String> {
    let connection = &mut establish_db_connection();
    let new_leaf = NewLeaf { title, body };
    let leaf = diesel::insert_into(leafs::table)
        .values(&new_leaf)
        .get_result(connection)
        .expect("Error saving new leaf");

    Ok(CreateLeafResponse { message: leaf })
}

// -------------------------------------------------------

#[derive(serde::Serialize)]
struct ListLeafsResponse {
    message: Vec<Leaf>,
}

#[tauri::command]
fn list_leafs() -> Result<ListLeafsResponse, String> {
    let connection = &mut establish_db_connection();
    let leafs = leafs::table
        .load::<Leaf>(connection)
        .expect("Error loading leafs");

    Ok(ListLeafsResponse { message: leafs })
}

// -------------------------------------------------------

#[derive(serde::Serialize)]
struct GetLeafResponse {
    message: Leaf,
}

#[tauri::command]
fn get_leaf(id: i32) -> Result<GetLeafResponse, String> {
    let connection = &mut establish_db_connection();
    let leaf = leafs::table
        .find(id)
        .first::<Leaf>(connection)
        .expect("Error loading leaf");

    Ok(GetLeafResponse { message: leaf })
}

// -------------------------------------------------------

#[derive(serde::Serialize)]
struct UpdateLeafResponse {
    message: Leaf,
}

#[tauri::command]
fn update_leaf(id: i32, title: &str, body: &str) -> Result<UpdateLeafResponse, String> {
    let connection = &mut establish_db_connection();
    let leaf = diesel::update(leafs::table.find(id))
        .set((leafs::title.eq(title), leafs::body.eq(body)))
        .get_result(connection)
        .expect("Error updating leaf");

    Ok(UpdateLeafResponse { message: leaf })
}

// -------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            db::init();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_leaf,
            list_leafs,
            get_leaf,
            update_leaf
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
