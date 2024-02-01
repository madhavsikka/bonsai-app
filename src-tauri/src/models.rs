// use super::schema::leafs;
// use diesel::prelude::*;
// use serde::{Deserialize, Serialize};

// #[derive(Queryable, Selectable)]
// #[diesel(table_name = leafs)]
// #[diesel(check_for_backend(diesel::sqlite::Sqlite))]
// #[derive(Serialize, Deserialize)]
// pub struct Leaf {
//     pub id: i32,
//     pub title: String,
//     pub body: String,
// }

// #[derive(Insertable)]
// #[diesel(table_name = leafs)]
// pub struct NewLeaf<'a> {
//     pub title: &'a str,
//     pub body: &'a str,
// }
