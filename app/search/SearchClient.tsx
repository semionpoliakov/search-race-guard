'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchInput from '@/components/SearchInput';
import ResultsList from '@/components/ResultsList';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCancelableFetch } from '@/hooks/useCancelableFetch';
import type { SearchResult } from '@/lib/searchApi';
import { fetchSearchResults } from '@/lib/searchApi';
import type { SearchStatus } from '@/lib/searchTypes';
import styles from './SearchClient.module.css';

const RESULT_LIMIT = 10;
const DEBOUNCE_DELAY = 300;

const statusAnnouncements: Record<SearchStatus, string> = {
  idle: 'Enter a query to search.',
  loading: 'Searching, please wait.',
  success: 'Results updated.',
  error: 'Search failed. You can retry.',
  'no-results': 'No results found.',
};

interface SearchClientProps {
  initialQuery: string;
}

const trimQuery = (value: string) => value.trim();

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage) {
      return maybeMessage;
    }
  }

  return 'Something went wrong.';
};

export default function SearchClient({ initialQuery }: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedInitialQuery = trimQuery(initialQuery);

  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<SearchStatus>(() =>
    normalizedInitialQuery ? 'loading' : 'idle',
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_DELAY);
  const { run, cancel } = useCancelableFetch();
  const lastQueryRef = useRef<string>(normalizedInitialQuery);
  const lastSyncedUrlRef = useRef<string>(normalizedInitialQuery);
  const isSyncingFromInputRef = useRef(false);
  const skipNextDebounceRef = useRef(false);
  const statusMessageId = useId();

  useEffect(() => {
    if (!normalizedInitialQuery) {
      inputRef.current?.focus();
    }
    return () => {
      cancel();
    };
  }, [cancel, normalizedInitialQuery]);

  const resetSearchState = useCallback(() => {
    cancel();
    lastQueryRef.current = '';
    setResults([]);
    setErrorMessage(null);
    setStatus('idle');
  }, [cancel]);

  const runSearch = useCallback(
    async (normalized: string) => {
      lastQueryRef.current = normalized;
      setErrorMessage(null);
      setStatus('loading');

      try {
        const payload = await run((signal) =>
          fetchSearchResults(normalized, { limit: RESULT_LIMIT, signal }),
        );

        if (!payload || lastQueryRef.current !== normalized) {
          return;
        }

        if (payload.results.length === 0) {
          setResults([]);
          setStatus('no-results');
          return;
        }

        setResults(payload.results);
        setStatus('success');
      } catch (error) {
        if (lastQueryRef.current !== normalized) {
          return;
        }
        setErrorMessage(getErrorMessage(error));
        setStatus('error');
      }
    },
    [run],
  );

  const syncUrlFromInput = useCallback(
    (normalizedQuery: string) => {
      if (lastSyncedUrlRef.current === normalizedQuery) {
        return;
      }

      isSyncingFromInputRef.current = true;
      lastSyncedUrlRef.current = normalizedQuery;

      if (normalizedQuery) {
        router.replace(`${pathname}?q=${encodeURIComponent(normalizedQuery)}`, {
          scroll: false,
        });
      } else {
        router.replace(pathname, { scroll: false });
      }
    },
    [pathname, router],
  );

  const rawUrlQuery = searchParams.get('q') ?? '';
  const normalizedUrlQuery = trimQuery(rawUrlQuery);

  // Слежение за изменениями в URL (Back/Forward, прямой ввод).
  useEffect(() => {
    const rawValue = rawUrlQuery;
    const normalizedValue = normalizedUrlQuery;

    if (isSyncingFromInputRef.current) {
      isSyncingFromInputRef.current = false;
      lastSyncedUrlRef.current = normalizedValue;
      return;
    }

    lastSyncedUrlRef.current = normalizedValue;

    if (rawValue !== query) {
      skipNextDebounceRef.current = true;
      setQuery(rawValue);
    }

    if (!normalizedValue) {
      skipNextDebounceRef.current = true;
      resetSearchState();
      return;
    }

    skipNextDebounceRef.current = true;
    void runSearch(normalizedValue);
  }, [normalizedUrlQuery, query, rawUrlQuery, resetSearchState, runSearch]);

  // Обработка пользовательского ввода после дебаунса.
  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }

    const normalized = trimQuery(debouncedQuery);

    if (!normalized) {
      syncUrlFromInput('');
      resetSearchState();
      return;
    }

    syncUrlFromInput(normalized);
    void runSearch(normalized);
  }, [debouncedQuery, resetSearchState, runSearch, syncUrlFromInput]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleRetry = useCallback(() => {
    if (lastQueryRef.current) {
      void runSearch(lastQueryRef.current);
    }
  }, [runSearch]);

  const statusMessage = useMemo(() => {
    if (status === 'error' && errorMessage) {
      return errorMessage;
    }

    return statusAnnouncements[status];
  }, [errorMessage, status]);

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Search Library</h1>
        <p className={styles.subtitle}>
          Type to explore our mock catalogue. Requests are debounced and fully
          race-safe.
        </p>
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          isLoading={status === 'loading'}
          hasError={status === 'error'}
          statusMessageId={statusMessageId}
        />
        <div
          id={statusMessageId}
          className={styles.status}
          aria-live="polite"
          role="status"
        >
          {statusMessage}
        </div>
        <ResultsList
          results={results}
          status={status}
          errorMessage={errorMessage}
          onRetry={handleRetry}
        />
      </section>
    </main>
  );
}
