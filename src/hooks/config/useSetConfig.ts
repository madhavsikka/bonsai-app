import { Config } from '@/types/config';
import { invoke } from '@tauri-apps/api/core';
import { useCallback } from 'react';

export const useSetConfig = () => {
  const setConfig = useCallback(async (config: Config) => {
    try {
      await invoke('set_config', { config });
    } catch (error) {
      console.error('Error setting config:', error);
      throw error;
    }
  }, []);
  return setConfig;
};
