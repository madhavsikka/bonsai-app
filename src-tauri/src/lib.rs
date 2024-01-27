pub mod models;
pub mod schema;

use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;

use crate::models::{Leaf, NewLeaf};

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub fn create_leaf(conn: &mut SqliteConnection, title: &str, body: &str) -> Leaf {
    use crate::schema::leafs;

    let new_post = NewLeaf { title, body };

    diesel::insert_into(leafs::table)
        .values(&new_post)
        .returning(Leaf::as_returning())
        .get_result(conn)
        .expect("Error saving new post")
}
