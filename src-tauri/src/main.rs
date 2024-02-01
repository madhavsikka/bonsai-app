// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use bonsai_app::models::Leaf;

// -------------------------------------------------------
#[derive(serde::Serialize)]
struct CreateLeafResponse {
    message: Leaf,
}

// #[tauri::command]
// fn create_leaf(title: &str, body: &str) -> Result<CreateLeafResponse, String> {
//     use bonsai_app::db::establish_db_connection;
//     use bonsai_app::models::*;
//     use bonsai_app::schema::leafs;
//     use diesel::prelude::*;

//     let connection = &mut establish_db_connection();
//     let new_leaf = NewLeaf { title, body };
//     let leaf = diesel::insert_into(leafs::table)
//         .values(&new_leaf)
//         .get_result(connection)
//         .expect("Error saving new leaf");

//     Ok(CreateLeafResponse { message: leaf })
// }

// // -------------------------------------------------------

// #[derive(serde::Serialize)]
// struct ListLeafsResponse {
//     message: Vec<Leaf>,
// }

// #[tauri::command]
// fn list_leafs() -> Result<ListLeafsResponse, String> {
//     use bonsai_app::db::establish_db_connection;
//     use bonsai_app::models::*;
//     use bonsai_app::schema::leafs;
//     use diesel::prelude::*;

//     let connection = &mut establish_db_connection();
//     let leafs = leafs::table
//         .load::<Leaf>(connection)
//         .expect("Error loading leafs");

//     Ok(ListLeafsResponse { message: leafs })
// }

// // -------------------------------------------------------

// #[derive(serde::Serialize)]
// struct GetLeafResponse {
//     message: Leaf,
// }

// #[tauri::command]
// fn get_leaf(id: i32) -> Result<GetLeafResponse, String> {
//     use bonsai_app::db::establish_db_connection;
//     use bonsai_app::models::*;
//     use bonsai_app::schema::leafs;
//     use diesel::prelude::*;

//     let connection = &mut establish_db_connection();
//     let leaf = leafs::table
//         .find(id)
//         .first::<Leaf>(connection)
//         .expect("Error loading leaf");

//     Ok(GetLeafResponse { message: leaf })
// }

// // -------------------------------------------------------

// #[derive(serde::Serialize)]
// struct UpdateLeafResponse {
//     message: Leaf,
// }

// #[tauri::command]
// fn update_leaf(id: i32, title: &str, body: &str) -> Result<UpdateLeafResponse, String> {
//     use bonsai_app::db::establish_db_connection;
//     use bonsai_app::schema::leafs;
//     use diesel::prelude::*;

//     let connection = &mut establish_db_connection();
//     let leaf = diesel::update(leafs::table.find(id))
//         .set((leafs::title.eq(title), leafs::body.eq(body)))
//         .get_result(connection)
//         .expect("Error updating leaf");

//     Ok(UpdateLeafResponse { message: leaf })
// }

// // -------------------------------------------------------

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
