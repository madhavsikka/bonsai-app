import { invoke } from '@tauri-apps/api/tauri';
import { useCallback, useState, useEffect } from 'react';

export const useGetConfig = (key: string) => {
  const [config, setConfig] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getConfig = useCallback(async () => {
    try {
      const res = (await invoke('get_config', { key })) as string;
      setConfig(res);
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    getConfig();
  }, [getConfig]);

  return { config, isLoading, error };
};
