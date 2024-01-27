import { Leaf } from '@/types/leaf';
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export const useUpdateLeaf = ({ id }: { id: string | undefined }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const updateLeaf = useCallback(async (updatedLeaf: Partial<Leaf>) => {
    try {
      setIsSubmitting(true);
      const res = await invoke('update_leaf', {
        id: Number(id),
        title: updatedLeaf.title,
        body: updatedLeaf.body,
      });
      // @ts-ignore
      return res['message'];
    } catch (e: any) {
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { updateLeaf, isSubmitting, error };
};
