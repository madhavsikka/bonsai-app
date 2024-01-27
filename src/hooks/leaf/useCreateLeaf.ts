import { Leaf } from '@/types/leaf';
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export const useCreateLeaf = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const createLeaf = useCallback(async (newLeaf: Partial<Leaf>) => {
    try {
      setIsSubmitting(true);
      const res = await invoke('create_leaf', {
        title: newLeaf.title,
        body: newLeaf.body ?? '',
      });
      // @ts-ignore
      return res['message'] as Leaf;
    } catch (e: any) {
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createLeaf, isSubmitting, error };
};
