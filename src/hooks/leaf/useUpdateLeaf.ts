import { Leaf } from '@/types/leaf';
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export const useUpdateLeaf = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const updateLeaf = useCallback(async (updatedLeaf: Partial<Leaf>) => {
    try {
      setIsSubmitting(true);
      await invoke('update_leaf', {
        name: updatedLeaf.name,
        content: updatedLeaf.content ?? '',
      });
    } catch (e: any) {
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { updateLeaf, isSubmitting, error };
};
