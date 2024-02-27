import { Leaf } from '@/types/leaf';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';

export const useGetLeaf = ({ id }: { id: string | undefined }) => {
  const [leaf, setLeaf] = useState<Leaf>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchLeafs = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const res = (await invoke('get_leaf', { id: Number(id) }))[
          'message'
        ] as Leaf;
        setLeaf(res);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLeafs();
  }, [id]);

  return { leaf, loading, error };
};
