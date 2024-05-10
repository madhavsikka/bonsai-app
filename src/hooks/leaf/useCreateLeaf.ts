import { Leaf } from '@/types/leaf';
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export const useCreateLeaf = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const createLeaf = useCallback(async (newLeaf: Partial<Leaf>) => {
    try {
      setIsSubmitting(true);
      await invoke('create_leaf', {
        name: newLeaf.name,
        content: newLeaf.content ? newLeaf.content : `<h1>${newLeaf.name}</h1>`,
      });
    } catch (e: any) {
      console.error(e);
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createLeaf, isSubmitting, error };
};
