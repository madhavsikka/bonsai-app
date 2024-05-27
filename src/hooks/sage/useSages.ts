import { Sage } from '@/types/sage';
import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useDebouncedCallback } from 'use-debounce';

export const useCreateSage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const createSage = useCallback(async (newSage: Partial<Sage>) => {
    try {
      setIsSubmitting(true);
      await invoke('create_sage', {
        name: newSage.name,
        description: newSage.description ?? '',
      });
    } catch (e: any) {
      console.error(e);
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createSage, isSubmitting, error };
};

export const useDeleteSage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteSage = async (name: string) => {
    try {
      setLoading(true);
      await invoke('delete_sage', { name });
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  return { deleteSage, loading, error };
};

export const useGetSage = ({ name }: { name: string }) => {
  const [sage, setSage] = useState<Sage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchSage = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const res = (await invoke('read_sage', { name })) as Sage;
        setSage(res);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (name) fetchSage();
  }, [name]);

  return { sage, loading, error };
};

export const useListSages = (deps: any[] = []) => {
  const [sages, setSages] = useState<Sage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchSages = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const res = (await invoke('list_sages', { path: '' })) as Sage[];
        setSages(res);
      } catch (e: any) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSages();
  }, deps);

  return { sages, loading, error };
};

export const useSearchSage = ({ query }: { query: string }) => {
  const [sages, setSages] = useState<Sage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const searchSages = useDebouncedCallback(async () => {
    try {
      setLoading(true);
      const res = (await invoke('search_sages', { query })) as Sage[];
      setSages(res);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      searchSages();
    } else {
      setSages([]);
    }
  }, [query, searchSages]);

  return { sages, loading, error };
};

export const useUpdateSage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const updateSage = useCallback(async (updatedSage: Partial<Sage>) => {
    try {
      setIsSubmitting(true);
      await invoke('update_sage', {
        name: updatedSage.name,
        description: updatedSage.description ?? '',
      });
    } catch (e: any) {
      console.error(e);
      setError(e);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { updateSage, isSubmitting, error };
};
