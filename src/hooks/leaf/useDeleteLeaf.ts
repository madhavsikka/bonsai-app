import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

export const useDeleteLeaf = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteLeaf = async (name: string) => {
    try {
      setLoading(true);
      // await invoke('delete_leaf', { name });
      await invoke('sql_delete_entity', {
        entityType: 'leaf',
        id: name
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  return { deleteLeaf, loading, error };
};
