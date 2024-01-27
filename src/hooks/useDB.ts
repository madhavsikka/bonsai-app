import { useState, useEffect } from 'react';
import Database from 'tauri-plugin-sql-api';

const DB_URL = 'sqlite:test.db';

const initDB = async () => {
  const db = await Database.load(DB_URL);
  await db.execute(
    `
    CREATE TABLE IF NOT EXISTS Leaf (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      userId TEXT,
      FOREIGN KEY(userId) REFERENCES User(id)
    );
    
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    `
  );
  return db;
};

const useDB = () => {
  const [db, setDb] = useState<Database | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadDatabase = async () => {
      try {
        const loadedDb = await initDB();
        if (isActive) {
          setDb(loadedDb);
          setError(null);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDatabase();

    return () => {
      isActive = false;
    };
  }, []);

  return { db, isLoading, error };
};

export default useDB;
