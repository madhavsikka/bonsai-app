import { Leaf } from '@/types/leaf';
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useCreateLeaf = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const createLeaf = useCallback(async (newLeaf: Partial<Leaf>): Promise<string | null> => {
    try {
      setIsSubmitting(true);
      const id = await invoke<string>('sql_create_entity', {
        entityType: 'leaf',
        entity: {
          name: newLeaf.name,
          content: newLeaf.content ? newLeaf.content : `<h1>${newLeaf.name}</h1>`,
        }
      });
      return id;
    } catch (e: any) {
      console.error(e);
      setError(e);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createLeaf, isSubmitting, error };
};
