import { Leaf } from '@/types/leaf';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export const useGetLeaf = ({ name }: { name: string }) => {
  const [leaf, setLeaf] = useState<Leaf>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchLeafs = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        // const res = (await invoke('read_leaf', { name })) as Leaf;
        const res = (await invoke('sql_read_entity', {
          entityType: 'leaf',
          id: name
        })) as Leaf;
        setLeaf(res);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (name) fetchLeafs();
  }, [name]);

  return { leaf, loading, error };
};
