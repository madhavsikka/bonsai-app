import { Leaf } from '@/types/leaf';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const useSearchLeaf = ({ query }: { query: string }) => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const searchLeaves = useDebouncedCallback(async () => {
    try {
      setLoading(true);
      const res = (await invoke('search_leaves', { query })) as Leaf[];
      setLeaves(res);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      searchLeaves();
    } else {
      setLeaves([]);
    }
  }, [query, searchLeaves]);

  return { leaves, loading, error };
};
