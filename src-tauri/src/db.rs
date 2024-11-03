use sqlx::{sqlite::{SqliteConnectOptions, SqlitePool}, Row, Error as SqlxError};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::path::PathBuf;

pub struct SqlDatabase {
    pool: SqlitePool,
}

// Trait for database entities
pub trait Entity: Serialize + DeserializeOwned {
    const TABLE_NAME: &'static str;
    const CREATE_TABLE: &'static str;
    fn get_id(&self) -> &str;
    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError>;
    fn to_params(&self) -> Vec<(String, String)>;
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Leaf {
    name: String,
    content: String,
    created_at: String,
    modified_at: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Sage {
    name: String,
    description: String,
    created_at: String,
    modified_at: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    openai_api_key: String,
    theme: String,
}

impl Entity for Leaf {
    const TABLE_NAME: &'static str = "leaves";
    const CREATE_TABLE: &'static str = "
        CREATE TABLE IF NOT EXISTS leaves (
            name TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL
        )";

    fn get_id(&self) -> &str {
        &self.name
    }

    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError> {
        Ok(Self {
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
}

impl Entity for Sage {
    const TABLE_NAME: &'static str = "sages";
    const CREATE_TABLE: &'static str = "
        CREATE TABLE IF NOT EXISTS sages (
            name TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            created_at TEXT NOT NULL,
            modified_at TEXT NOT NULL
        )";

    fn get_id(&self) -> &str {
        &self.name
    }

    fn from_row(row: sqlx::sqlite::SqliteRow) -> Result<Self, SqlxError> {
        Ok(Self {
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
}   

impl SqlDatabase {
    pub async fn new(dir: PathBuf) -> Result<Self, SqlxError> {
        let db_path = dir.join("bonsai/database.db");
        std::fs::create_dir_all(db_path.parent().unwrap())?;
        
        let options = SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal);
            
        let pool = SqlitePool::connect_with(options).await?;
        
        // Initialize tables
        sqlx::query(Leaf::CREATE_TABLE).execute(&pool).await?;
        sqlx::query(Sage::CREATE_TABLE).execute(&pool).await?;

        Ok(Self { pool })
    }

    pub async fn create<T: Entity>(&self, entity: &T) -> Result<(), SqlxError> {
        let params = entity.to_params();
        let columns = params.iter()
            .map(|(name, _)| name.as_str())
            .collect::<Vec<_>>()
            .join(", ");
        let placeholders = params.iter()
            .map(|(name, _)| format!(":{}", name))
            .collect::<Vec<_>>()
            .join(", ");
            
        let sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            T::TABLE_NAME,
            columns,
            placeholders
        );

        let mut query = sqlx::query(&sql);
        for (_, value) in params {
            query = query.bind(value);
        }
        
        query.execute(&self.pool).await?;
        Ok(())
    }

    pub async fn read<T: Entity>(&self, id: &str) -> Result<Option<T>, SqlxError> {
        let sql = format!("SELECT * FROM {} WHERE name = ?", T::TABLE_NAME);
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
        let rows = sqlx::query(&sql)
            .fetch_all(&self.pool)
            .await?;
            
        let mut entities = Vec::with_capacity(rows.len());
        for row in rows {
            entities.push(T::from_row(row)?);
        }
        
        Ok(entities)
    }

    pub async fn update<T: Entity>(&self, entity: &T) -> Result<(), SqlxError> {
        let params = entity.to_params();
        let set_clause = params.iter()
            .skip(1)  // Skip the ID field
            .map(|(name, _)| format!("{} = :{}", name, name))
            .collect::<Vec<_>>()
            .join(", ");
            
        let sql = format!(
            "UPDATE {} SET {} WHERE name = :name",
            T::TABLE_NAME,
            set_clause
        );

        let mut query = sqlx::query(&sql);
        for (_, value) in params {
            query = query.bind(value);
        }
        
        query.execute(&self.pool).await?;
        Ok(())
    }

    pub async fn delete<T: Entity>(&self, id: &str) -> Result<(), SqlxError> {
        let sql = format!("DELETE FROM {} WHERE name = ?", T::TABLE_NAME);
        sqlx::query(&sql)
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
