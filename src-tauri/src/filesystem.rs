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
            let file_path = entry.path();
            if file_path.is_file() {
                let file_name = entry.file_name();
                let file_name = file_name.to_str().unwrap().to_string();
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

    pub fn search_leaves(&self, query: &str) -> io::Result<Vec<Leaf>> {
        let entries = fs::read_dir(&self.root_dir)?;
        let mut leaves = Vec::new();
        let query_lowercase = query.to_lowercase();
        for entry in entries {
            let entry = entry?;
            let file_name = entry.file_name();
            let file_name_lowercase = file_name.to_str().unwrap().to_lowercase();
            let file_name = file_name.to_str().unwrap().to_string();
            if file_name_lowercase.contains(&query_lowercase) {
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
        }
        Ok(leaves)
    }

    // -------------------------------------------------------

    fn load_sages(&self) -> io::Result<Vec<Sage>> {
        let sages_dir = self.root_dir.join("sages");
        let sages_file = sages_dir.join("sages.json");
        if sages_file.exists() {
            let sages_content = fs::read_to_string(&sages_file)?;
            let sages: Vec<Sage> = serde_json::from_str(&sages_content)?;
            Ok(sages)
        } else {
            Ok(Vec::new())
        }
    }

    fn save_sages(&self, sages: &[Sage]) -> io::Result<()> {
        let sages_dir = self.root_dir.join("sages");
        fs::create_dir_all(&sages_dir)?;
        let sages_file = sages_dir.join("sages.json");
        let sages_content = serde_json::to_string_pretty(sages)?;
        let mut file = File::create(sages_file)?;
        file.write_all(sages_content.as_bytes())?;
        Ok(())
    }

    pub fn create_sage(&self, name: &str, description: &str) -> io::Result<()> {
        let mut sages = self.load_sages()?;
        if sages.iter().any(|s| s.name == name) {
            return Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                "Sage with the same name already exists",
            ));
        }
        let now = iso8601(&std::time::SystemTime::now());
        let sage = Sage {
            name: name.to_string(),
            description: description.to_string(),
            created_at: now.clone(),
            modified_at: now,
        };
        sages.push(sage);
        self.save_sages(&sages)
    }

    pub fn read_sage(&self, name: &str) -> io::Result<Option<Sage>> {
        let sages = self.load_sages()?;
        let sage = sages.into_iter().find(|s| s.name == name);
        Ok(sage)
    }

    pub fn list_sages(&self) -> io::Result<Vec<Sage>> {
        self.load_sages()
    }

    pub fn delete_sage(&self, name: &str) -> io::Result<()> {
        let mut sages = self.load_sages()?;
        let initial_length = sages.len();
        sages.retain(|s| s.name != name);
        if sages.len() == initial_length {
            return Err(io::Error::new(io::ErrorKind::NotFound, "Sage not found"));
        }
        self.save_sages(&sages)
    }

    pub fn update_sage(&self, name: &str, description: &str) -> io::Result<()> {
        let mut sages = self.load_sages()?;
        if let Some(sage) = sages.iter_mut().find(|s| s.name == name) {
            sage.description = description.to_string();
            sage.modified_at = iso8601(&std::time::SystemTime::now());
            self.save_sages(&sages)?;
        } else {
            return Err(io::Error::new(io::ErrorKind::NotFound, "Sage not found"));
        }
        Ok(())
    }

    pub fn search_sages(&self, query: &str) -> io::Result<Vec<Sage>> {
        let sages = self.load_sages()?;
        let query_lowercase = query.to_lowercase();
        let filtered_sages = sages
            .into_iter()
            .filter(|s| s.name.to_lowercase().contains(&query_lowercase))
            .collect();
        Ok(filtered_sages)
    }

    // -------------------------------------------------------

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

    pub fn upload_file(&self, file_name: &str, file_data: &[u8]) -> io::Result<String> {
        let uploads_dir = self.root_dir.join("uploads");
        fs::create_dir_all(&uploads_dir)?;
        let file_path = uploads_dir.join(&file_name);

        let mut file = fs::File::create(&file_path)?;
        file.write_all(file_data)?;

        Ok(file_path.to_str().unwrap().to_string())
    }

    pub fn get_file(&self, file_name: &str) -> io::Result<Vec<u8>> {
        let uploads_dir = self.root_dir.join("uploads");
        let file_path = uploads_dir.join(file_name);

        let file_data = fs::read(&file_path)?;

        Ok(file_data)
    }
}
