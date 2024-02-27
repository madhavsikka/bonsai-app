import { invoke } from '@tauri-apps/api/tauri';
import { useCallback } from 'react';

export const useSetConfig = () => {
  const setConfig = useCallback(async (key: string, value: string) => {
    try {
      const res = await invoke('set_config', { key, value });
      return res;
    } catch (error) {
      return error;
    }
  }, []);
  return setConfig;
};
