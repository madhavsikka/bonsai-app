use crate::ollama::get_ollama_embedding;
use chrono::Utc;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use sqlite_vec::sqlite3_vec_init;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePool},
    Error as SqlxError, Row,
};
use std::path::PathBuf;
use uuid::Uuid;

pub struct SqlDatabase {
    pool: SqlitePool,
}

fn generate_uuid() -> String {
    Uuid::new_v4().to_string()
}

// Trait for database entities
pub trait Entity: Serialize + DeserializeOwned {
    const TABLE_NAME: &'static str;
    const CREATE_TABLE: &'static str;
    fn get_id(&self) -> &str;
    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError>;
    fn to_params(&self) -> Vec<(String, String)>;
    fn get_embedding_text(&self) -> String;
    fn get_object_type() -> &'static str;
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Leaf {
    #[serde(default = "generate_uuid")]
    id: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    content: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    modified_at: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Sage {
    #[serde(default = "generate_uuid")]
    id: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    description: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    modified_at: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    openai_api_key: String,
    theme: String,
}

#[derive(Deserialize, Serialize)]
pub struct Embedding {
    #[serde(default = "generate_uuid")]
    id: String,
    object_id: String,
    object_type: String,
    embedding: Vec<f32>,
}

pub trait TimeStamped {
    fn set_created_at(&mut self, timestamp: String);
    fn set_modified_at(&mut self, timestamp: String);
}

// Implement TimeStamped for Leaf
impl TimeStamped for Leaf {
    fn set_created_at(&mut self, timestamp: String) {
        self.created_at = timestamp;
    }
    fn set_modified_at(&mut self, timestamp: String) {
        self.modified_at = timestamp;
    }
}

// Implement TimeStamped for Sage
impl TimeStamped for Sage {
    fn set_created_at(&mut self, timestamp: String) {
        self.created_at = timestamp;
    }
    fn set_modified_at(&mut self, timestamp: String) {
        self.modified_at = timestamp;
    }
}

impl Entity for Leaf {
    const TABLE_NAME: &'static str = "leaves";
    const CREATE_TABLE: &'static str = "
        CREATE TABLE IF NOT EXISTS leaves (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL
        )";

    fn get_id(&self) -> &str {
        &self.id
    }

    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError> {
        Ok(Self {
            id: row.get("id"),
            name: row.get("name"),
            content: row.get("content"),
            created_at: row.get("created_at"),
            modified_at: row.get("modified_at"),
        })
    }

    fn to_params(&self) -> Vec<(String, String)> {
        vec![
            ("name".into(), self.name.clone()),
            ("content".into(), self.content.clone()),
            ("created_at".into(), self.created_at.clone()),
            ("modified_at".into(), self.modified_at.clone()),
        ]
    }

    fn get_embedding_text(&self) -> String {
        format!("{}\n{}", self.name, self.content)
    }

    fn get_object_type() -> &'static str {
        "leaf"
    }
}

impl Entity for Sage {
    const TABLE_NAME: &'static str = "sages";
    const CREATE_TABLE: &'static str = "
        CREATE TABLE IF NOT EXISTS sages (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL
        )";

    fn get_id(&self) -> &str {
        &self.id
    }

    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError> {
        Ok(Self {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            created_at: row.get("created_at"),
            modified_at: row.get("modified_at"),
        })
    }

    fn to_params(&self) -> Vec<(String, String)> {
        vec![
            ("name".into(), self.name.clone()),
            ("description".into(), self.description.clone()),
            ("created_at".into(), self.created_at.clone()),
            ("modified_at".into(), self.modified_at.clone()),
        ]
    }

    fn get_embedding_text(&self) -> String {
        format!("{}\n{}", self.name, self.description)
    }

    fn get_object_type() -> &'static str {
        "sage"
    }
}

impl Entity for Embedding {
    const TABLE_NAME: &'static str = "embeddings";
    const CREATE_TABLE: &'static str = "
        CREATE VIRTUAL TABLE IF NOT EXISTS embeddings USING vec0(
            embedding float[2304]
        );
        CREATE TABLE IF NOT EXISTS embedding_metadata (
            rowid INTEGER PRIMARY KEY,
            object_id TEXT NOT NULL,
            object_type TEXT NOT NULL
        )";

    fn get_id(&self) -> &str {
        &self.id
    }

    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError> {
        let bytes: Vec<u8> = row.get("embedding");
        let embedding = unsafe {
            std::slice::from_raw_parts(
                bytes.as_ptr() as *const f32,
                bytes.len() / std::mem::size_of::<f32>(),
            )
            .to_vec()
        };

        Ok(Self {
            id: row.get("id"),
            object_id: row.get("object_id"),
            object_type: row.get("object_type"),
            embedding,
        })
    }

    fn to_params(&self) -> Vec<(String, String)> {
        vec![
            ("object_id".into(), self.object_id.clone()),
            ("object_type".into(), self.object_type.clone()),
            // Note: embedding is handled separately due to binary format
        ]
    }

    fn get_embedding_text(&self) -> String {
        format!("{}\n{}", self.object_id, self.object_type)
    }

    fn get_object_type() -> &'static str {
        "embedding"
    }
}

impl SqlDatabase {
    pub async fn new(dir: PathBuf) -> Result<Self, SqlxError> {
        let db_path = dir.join("bonsai/database.db");
        std::fs::create_dir_all(db_path.parent().unwrap())?;

        // Initialize the sqlite3_vec extension
        unsafe {
            libsqlite3_sys::sqlite3_auto_extension(Some(std::mem::transmute(
                sqlite3_vec_init as *const (),
            )));
        }

        let options = SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal);

        let pool = SqlitePool::connect_with(options).await?;

        // Initialize tables
        sqlx::query(Leaf::CREATE_TABLE).execute(&pool).await?;
        sqlx::query(Sage::CREATE_TABLE).execute(&pool).await?;
        sqlx::query(Embedding::CREATE_TABLE).execute(&pool).await?;

        Ok(Self { pool })
    }

    pub async fn create<T: Entity + TimeStamped>(
        &self,
        mut entity: T,
    ) -> Result<String, SqlxError> {
        let now = Utc::now().to_rfc3339();
        entity.set_created_at(now.clone());
        entity.set_modified_at(now);

        let params = entity.to_params();
        let columns = format!(
            "id, {}",
            params
                .iter()
                .map(|(name, _)| name.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        );
        let placeholders = format!(
            "?, {}",
            std::iter::repeat("?")
                .take(params.len())
                .collect::<Vec<_>>()
                .join(", ")
        );

        let sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            T::TABLE_NAME,
            columns,
            placeholders
        );

        let mut query = sqlx::query(&sql);
        query = query.bind(entity.get_id());
        for (_, value) in params {
            query = query.bind(value);
        }

        query.execute(&self.pool).await?;

        self.store_embedding(
            entity.get_id().to_string(),
            T::get_object_type(),
            &entity.get_embedding_text(),
        )
        .await?;

        Ok(entity.get_id().to_string())
    }

    pub async fn read<T: Entity>(&self, id: &str) -> Result<Option<T>, SqlxError> {
        let sql = format!("SELECT * FROM {} WHERE id = ?", T::TABLE_NAME);
        let row = sqlx::query(&sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => Ok(Some(T::from_row(row)?)),
            None => Ok(None),
        }
    }

    pub async fn list<T: Entity>(&self) -> Result<Vec<T>, SqlxError> {
        let sql = format!("SELECT * FROM {}", T::TABLE_NAME);
        let rows = sqlx::query(&sql).fetch_all(&self.pool).await?;

        let mut entities = Vec::with_capacity(rows.len());
        for row in rows {
            entities.push(T::from_row(row)?);
        }

        Ok(entities)
    }

    pub async fn update<T: Entity + TimeStamped>(&self, mut entity: T) -> Result<(), SqlxError> {
        let now = Utc::now().to_rfc3339();
        entity.set_modified_at(now);

        let params = entity.to_params();
        let non_empty_params: Vec<_> = params
            .into_iter()
            .filter(|(_, value)| !value.is_empty())
            .collect();

        if !non_empty_params.is_empty() {
            let set_clause = non_empty_params
                .iter()
                .map(|(name, _)| format!("{} = ?", name))
                .collect::<Vec<_>>()
                .join(", ");

            let sql = format!("UPDATE {} SET {} WHERE id = ?", T::TABLE_NAME, set_clause);

            let mut query = sqlx::query(&sql);
            // Bind all non-empty values
            for (_, value) in &non_empty_params {
                query = query.bind(value);
            }
            // Bind the ID last for the WHERE clause
            query = query.bind(entity.get_id());

            query.execute(&self.pool).await?;

            self.store_embedding(
                entity.get_id().to_string(),
                T::get_object_type(),
                &entity.get_embedding_text(),
            )
            .await?;
        }

        Ok(())
    }

    pub async fn delete<T: Entity>(&self, id: &str) -> Result<(), SqlxError> {
        // First delete from embedding_metadata to remove the reference
        let sql = "DELETE FROM embedding_metadata WHERE object_id = ? AND object_type = ?";
        sqlx::query(sql)
            .bind(id)
            .bind(T::get_object_type())
            .execute(&self.pool)
            .await?;

        // Then delete from the embeddings virtual table using the rowid
        let sql = "DELETE FROM embeddings WHERE rowid IN (SELECT rowid FROM embedding_metadata WHERE object_id = ? AND object_type = ?)";
        sqlx::query(sql)
            .bind(id)
            .bind(T::get_object_type())
            .execute(&self.pool)
            .await?;

        // Finally delete from the main entity table
        let sql = format!("DELETE FROM {} WHERE id = ?", T::TABLE_NAME);
        sqlx::query(&sql).bind(id).execute(&self.pool).await?;

        Ok(())
    }

    pub async fn store_embedding(
        &self,
        object_id: String,
        object_type: &str,
        text: &str,
    ) -> Result<(), SqlxError> {
        let embedding = get_ollama_embedding(text)
            .await
            .map_err(|e| SqlxError::Protocol(e.to_string()))?;

        let embedding_bytes: Vec<u8> = unsafe {
            std::slice::from_raw_parts(
                embedding.as_ptr() as *const u8,
                embedding.len() * std::mem::size_of::<f32>(),
            )
            .to_vec()
        };

        // First, delete any existing embedding for this object
        let delete_embeddings = "DELETE FROM embeddings WHERE rowid IN (SELECT rowid FROM embedding_metadata WHERE object_id = ? AND object_type = ?)";
        sqlx::query(delete_embeddings)
            .bind(object_id.clone())
            .bind(object_type)
            .execute(&self.pool)
            .await?;

        let delete_embedding_metadata =
            "DELETE FROM embedding_metadata WHERE object_id = ? AND object_type = ?";
        sqlx::query(delete_embedding_metadata)
            .bind(object_id.clone())
            .bind(object_type)
            .execute(&self.pool)
            .await?;

        // Then insert the new embedding
        let insert_sql = "INSERT INTO embeddings(embedding) VALUES (?)";
        let result = sqlx::query(insert_sql)
            .bind(&embedding_bytes[..]) // Bind the slice directly
            .execute(&self.pool)
            .await;

        let row = match result {
            Ok(r) => r,
            Err(e) => {
                println!("Error inserting embedding: {:?}", e);
                return Ok(()); // Ignore the error and continue
            }
        };

        let last_id = row.last_insert_rowid();

        let metadata_sql =
            "INSERT INTO embedding_metadata (rowid, object_id, object_type) VALUES (?, ?, ?)";
        sqlx::query(metadata_sql)
            .bind(last_id)
            .bind(object_id)
            .bind(object_type)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    pub async fn find_similar(
        &self,
        text: &str,
        limit: i32,
    ) -> Result<Vec<(String, String, f32)>, SqlxError> {
        let query_embedding = get_ollama_embedding(text)
            .await
            .map_err(|e| SqlxError::Protocol(e.to_string()))?;

        let embedding_bytes: Vec<u8> = unsafe {
            std::slice::from_raw_parts(
                query_embedding.as_ptr() as *const u8,
                query_embedding.len() * std::mem::size_of::<f32>(),
            )
            .to_vec()
        };

        let sql = "
            SELECT m.object_id, m.object_type, e.distance
            FROM embeddings e
            JOIN embedding_metadata m ON e.rowid = m.rowid
            WHERE e.embedding MATCH ?
            ORDER BY e.distance
            LIMIT ?";

        let rows = sqlx::query(sql)
            .bind(embedding_bytes)
            .bind(limit)
            .fetch_all(&self.pool)
            .await?;

        Ok(rows
            .into_iter()
            .map(|row| {
                (
                    row.get("object_id"),
                    row.get("object_type"),
                    row.get("distance"),
                )
            })
            .collect())
    }

    pub async fn find_similar_entities<T: Entity>(
        &self,
        text: &str,
        limit: i32,
    ) -> Result<Vec<T>, SqlxError> {
        let similar = self.find_similar(text, limit).await?;

        let mut results = Vec::new();
        for (object_id, object_type, _) in similar {
            if object_type == T::get_object_type() {
                if let Some(entity) = self.read::<T>(&object_id).await? {
                    results.push(entity);
                }
            }
        }

        Ok(results)
    }
}
