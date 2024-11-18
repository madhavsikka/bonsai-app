import { Leaf } from '@/types/leaf';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export const useGetLeaf = ({ id }: { id: string }) => {
  const [leaf, setLeaf] = useState<Leaf>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchLeafs = async () => {
      try {
        setLoading(true);
        const res = (await invoke('sql_read_entity', {
          entityType: 'leaf',
          id: id
        })) as Leaf;
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
