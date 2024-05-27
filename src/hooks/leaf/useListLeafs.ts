import { Leaf } from '@/types/leaf';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export const useListLeafs = (deps: any[] = []) => {
  const [leafs, setLeafs] = useState<Leaf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchLeafs = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const res = (await invoke('list_leaves', { path: '' })) as Leaf[];
        setLeafs(res);
      } catch (e: any) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeafs();
  }, deps);

  return { leafs, loading, error };
};
