import { Leaf } from '@/types/leaf';
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useUpdateLeaf = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const updateLeaf = useCallback(async (updatedLeaf: Partial<Leaf>) => {
    try {
      console.log({ updatedLeaf });
      setIsSubmitting(true);
      await invoke('sql_update_entity', {
        entityType: 'leaf',
        entity: updatedLeaf,
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { updateLeaf, isSubmitting, error };
};
