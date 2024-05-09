import { Config } from '@/types/config';
import { invoke } from '@tauri-apps/api/tauri';
import { useCallback, useState, useEffect } from 'react';

export const useGetConfig = () => {
  const [config, setConfig] = useState<Config>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getConfig = useCallback(async () => {
    try {
      const res = (await invoke('get_config')) as Config;
      console.log({ res });
      setConfig(res);
    } catch (error) {
      console.error('Error getting config:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getConfig();
  }, [getConfig]);

  return { config, isLoading, error };
};
