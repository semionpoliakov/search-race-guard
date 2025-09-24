import type { SearchResult } from '@/lib/searchApi';
import { fetchSearchResults } from '@/lib/searchApi';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

const isAbortError = (e: unknown) =>
  (e instanceof DOMException && e.name === 'AbortError') ||
  (e instanceof Error && e.name === 'AbortError');

export function useSearch(rawQuery: string) {
  const controllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<UseSearchState>({
    results: [],
    loading: false,
    error: null,
  });
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const query = rawQuery.trim();

    controllerRef.current?.abort();

    if (!query) {
      controllerRef.current = null;
      
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null,
      }));

      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setState(prev => ({ ...prev, loading: true, error: null }));

    fetchSearchResults(query, { signal: controller.signal })
      .then(res => {
        if (controller.signal.aborted) {
          return;
        };

        setState({
          results: res.results,
          loading: false,
          error: null,
        });
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        };

        setState({
          results: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      });

    return () => {
      controller.abort();
      
      if (controllerRef.current === controller) {
        controllerRef.current = null
      };
    };
  }, [rawQuery, refreshIndex]);

  const refetch = useCallback(() => {
    setRefreshIndex(i => i + 1);
  }, []);

  return { ...state, refetch };
}
