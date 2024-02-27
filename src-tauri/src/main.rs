// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
extern crate webkit2gtk;

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

mod db;
use bonsai_app::models::Leaf;

// -------------------------------------------------------
#[derive(serde::Serialize)]
struct CreateLeafResponse {
    message: Leaf,
}

#[tauri::command]
fn create_leaf(title: &str, body: &str) -> Result<CreateLeafResponse, String> {
    use bonsai_app::db::establish_db_connection;
    use bonsai_app::models::*;
    use bonsai_app::schema::leafs;
    use diesel::prelude::*;

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
    use bonsai_app::db::establish_db_connection;
    use bonsai_app::models::*;
    use bonsai_app::schema::leafs;
    use diesel::prelude::*;

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
    use bonsai_app::db::establish_db_connection;
    use bonsai_app::models::*;
    use bonsai_app::schema::leafs;
    use diesel::prelude::*;

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
    use bonsai_app::db::establish_db_connection;
    use bonsai_app::schema::leafs;
    use diesel::prelude::*;

    let connection = &mut establish_db_connection();
    let leaf = diesel::update(leafs::table.find(id))
        .set((leafs::title.eq(title), leafs::body.eq(body)))
        .get_result(connection)
        .expect("Error updating leaf");

    Ok(UpdateLeafResponse { message: leaf })
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
        .setup(|_app| {
            db::init();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_leaf,
            list_leafs,
            get_leaf,
            update_leaf,
            zoom_window,
            get_env
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
