use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{self, Write};
use std::path::PathBuf;
use tauri::api::path::config_dir;

pub struct Database {
    root_dir: PathBuf,
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
pub struct Config {
    openai_api_key: String,
    theme: String,
}

fn iso8601(st: &std::time::SystemTime) -> String {
    let dt: DateTime<Utc> = st.clone().into();
    format!("{}", dt.format("%+"))
}

impl Database {
    pub fn new(name: &str) -> io::Result<Self> {
        let home_dir = dirs::home_dir().expect("Failed to get home directory");
        let root_dir = home_dir.join(name);
        fs::create_dir_all(&root_dir)?;
        Ok(Self { root_dir })
    }

    pub fn create_leaf(&self, name: &str, content: &str) -> io::Result<()> {
        let full_path = self.root_dir.join(name);
        let mut file = File::create(full_path)?;
        file.write_all(content.as_bytes())?;
        Ok(())
    }

    pub fn read_leaf(&self, name: &str) -> io::Result<Leaf> {
        let full_path = self.root_dir.join(name);
        let content = fs::read_to_string(&full_path)?;
        let metadata = fs::metadata(&full_path)?;
        let created_at = iso8601(&metadata.created()?);
        let modified_at = iso8601(&metadata.modified()?);
        Ok(Leaf {
            name: name.to_string(),
            content,
            created_at,
            modified_at,
        })
    }

    pub fn list_leaves(&self) -> io::Result<Vec<Leaf>> {
        let entries = fs::read_dir(&self.root_dir)?;
        let mut leaves = Vec::new();
        for entry in entries {
            let entry = entry?;
            let file_name = entry.file_name();
            let file_name = file_name.to_str().unwrap().to_string();
            let file_path = entry.path();
            let file_content = fs::read_to_string(&file_path)?;
            let metadata = fs::metadata(&file_path)?;
            let created_at = iso8601(&metadata.created()?);
            let modified_at = iso8601(&metadata.modified()?);
            leaves.push(Leaf {
                name: file_name,
                content: file_content,
                created_at,
                modified_at,
            });
        }
        Ok(leaves)
    }

    pub fn delete_leaf(&self, name: &str) -> io::Result<()> {
        let full_path = self.root_dir.join(name);
        fs::remove_file(full_path)?;
        Ok(())
    }

    pub fn update_leaf(&self, name: &str, content: &str) -> io::Result<()> {
        let full_path = self.root_dir.join(name);
        let mut file = File::create(full_path)?;
        file.write_all(content.as_bytes())?;
        Ok(())
    }
    pub fn set_config(&self, config: &Config) -> io::Result<()> {
        let config_dir = config_dir().expect("Failed to get config directory");
        let bonsai_dir = config_dir.join("bonsai");
        fs::create_dir_all(&bonsai_dir)?;
        let config_path = bonsai_dir.join("config.json");
        let config_content = serde_json::to_string_pretty(config)?;
        let mut file = File::create(config_path)?;
        file.write_all(config_content.as_bytes())?;
        Ok(())
    }

    pub fn get_config(&self) -> io::Result<Config> {
        let config_dir = config_dir().expect("Failed to get config directory");
        let bonsai_dir = config_dir.join("bonsai");
        let config_path = bonsai_dir.join("config.json");
        if config_path.exists() {
            let config_content = fs::read_to_string(&config_path)?;
            let config: Config = serde_json::from_str(&config_content)?;
            Ok(config)
        } else {
            Ok(Config {
                openai_api_key: "".to_string(),
                theme: "dark".to_string(),
            })
        }
    }
}
