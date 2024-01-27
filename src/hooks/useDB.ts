import { useState, useEffect } from 'react';
import Database from 'tauri-plugin-sql-api';

const DB_URL = 'sqlite:test.db';

const useDB = () => {
  const [db, setDb] = useState<Database | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadDatabase = async () => {
      try {
        const loadedDb = await Database.load(DB_URL);
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
