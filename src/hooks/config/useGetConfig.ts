import { invoke } from '@tauri-apps/api/tauri';
import { useCallback } from 'react';

export const useGetConfig = () => {
  const getConfig = useCallback(async (key: string) => {
    try {
      const res = await invoke('get_config', { key });
      return res;
    } catch (error) {
      return '';
    }
  }, []);
  return getConfig;
};
