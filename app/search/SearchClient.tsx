'use client';

import { ResultsList } from '@/components/ResultsList/ResultsList';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearch } from '@/hooks/useSearch';
import type { SearchStatus } from '@/lib/searchTypes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './SearchClient.module.css';

const DEBOUNCE_DELAY_MS = 300;

interface SearchClientProps {
  initialQuery: string;
}

const statusMessage = (status: SearchStatus) => {
  switch (status) {
    case 'idle':
      return 'Enter a query to search.';
    case 'loading':
      return 'Searching...';
    case 'success':
      return 'Results updated.';
    case 'error':
      return 'Search failed. Please try again.';
    case 'no-results':
      return 'No results found.';
    default:
      return '';
  }
};

function getStatus({ debouncedQuery, loading, error, resultsLength }: {
  debouncedQuery: string;
  loading: boolean;
  error: unknown;
  resultsLength: number;
}): SearchStatus {
  if (!debouncedQuery) {
    return 'idle'
  };

  if (loading) {
    return 'loading'
  };

  if (error) {
    return 'error'
  };

  return resultsLength === 0 ? 'no-results' : 'success';
}

export const SearchClient = ({ initialQuery }: SearchClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [inputValue, setInputValue] = useState(initialQuery);

  const debouncedQuery = useDebouncedValue(inputValue.trim(), DEBOUNCE_DELAY_MS);
  const statusMessageId = useId();

  const { results, loading, error, refetch } = useSearch(
    debouncedQuery,
  );

  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? '';
    setInputValue((prev) => (prev === urlQuery ? prev : urlQuery));
  }, [searchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get('q') ?? '';
    const nextQuery = debouncedQuery;

    if (currentQuery === nextQuery) {
      return
    };

    const params = new URLSearchParams(searchParams);

    if (!nextQuery) {
      params.delete('q');
    } else {
      params.set('q', nextQuery);
    }

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  const status = getStatus({ debouncedQuery, loading, error, resultsLength: results.length })

  const isLoading = status === 'loading';
  const hasError = status === 'error';

  const handleClear = () => {
    setInputValue('');
  };

  const handleChange = (value: string) => {
    setInputValue(value)
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Search</h1>
        <p className={styles.subtitle}>
          Type to explore a catalog.
        </p>

        <SearchInput
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onClear={handleClear}
          isLoading={isLoading}
          hasError={hasError}
          statusMessageId={statusMessageId}
        />

        <div id={statusMessageId} className={styles.status} aria-live="polite" role="status">
          {statusMessage(status)}
        </div>

        <ResultsList
          query={debouncedQuery}
          results={results}
          status={status}
          errorMessage={error}
          onRetry={refetch}
        />
      </section>
    </main>
  );
}
