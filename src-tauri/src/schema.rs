// @generated automatically by Diesel CLI.

diesel::table! {
    config (key) {
        key -> Text,
        value -> Text,
    }
}

diesel::table! {
    leafs (id) {
        id -> Integer,
        title -> Text,
        body -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(config, leafs,);
