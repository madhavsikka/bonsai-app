import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

export const useDeleteLeaf = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteLeaf = async (id: string) => {
    try {
      setLoading(true);
      await invoke('sql_delete_entity', {
        entityType: 'leaf',
        id: id
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  return { deleteLeaf, loading, error };
};
