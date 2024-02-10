use cozo::*;
use std::fs;
use std::path::Path;

// use diesel::prelude::*;
// use diesel::sqlite::SqliteConnection;
// use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

// const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn init() {
    if !db_file_exists() {
        create_db_file();
    }
    let db = establish_connection();

    _ = db.run_default(
        "
        :create leaf {
            id 
            => 
            title,
            body,
            body_vec: <F32; 384>
        }
    ",
    );

    // run_migrations();
}

// pub fn establish_db_connection() -> SqliteConnection {
//     let db_path = get_db_path().clone();

//     SqliteConnection::establish(db_path.as_str())
//         .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
// }

// fn run_migrations() {
//     let mut connection = establish_connection();
//     connection.run_pending_migrations(MIGRATIONS).unwrap();
// }

pub fn establish_connection() -> DbInstance {
    let db_path = get_db_path();
    DbInstance::new("sqlite", db_path.clone(), Default::default())
        .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
}

fn create_db_file() {
    let db_path = get_db_path();
    let db_dir = Path::new(&db_path).parent().unwrap();

    if !db_dir.exists() {
        fs::create_dir_all(db_dir).unwrap();
    }

    fs::File::create(db_path).unwrap();
}

fn db_file_exists() -> bool {
    let db_path = get_db_path();
    Path::new(&db_path).exists()
}

fn get_db_path() -> String {
    let home_dir = dirs::home_dir().unwrap();
    home_dir.to_str().unwrap().to_string() + "/bonsai/bonsai.db"
}
