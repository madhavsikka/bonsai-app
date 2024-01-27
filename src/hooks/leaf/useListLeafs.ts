import { Leaf } from '@/types/leaf';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';

export const useListLeafs = () => {
  const [leafs, setLeafs] = useState<Leaf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchLeafs = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const res = (await invoke('list_leafs', {}))['message'] as Leaf[];
        console.log(res);
        setLeafs(res);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeafs();
  }, []);

  return { leafs, loading, error };
};
