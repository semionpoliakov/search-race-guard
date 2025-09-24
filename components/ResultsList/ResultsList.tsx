'use client';

import type { SearchResult } from '@/lib/searchApi';
import type { SearchStatus } from '@/lib/searchTypes';
import { memo } from 'react';
import { ResultItem } from '../ResultItem/ResultItem';
import styles from './ResultsList.module.css';

interface ResultsListProps {
  query: string;
  results: SearchResult[];
  status: SearchStatus;
  errorMessage: string | null;
  onRetry: () => void;
}

const ResultsContent = ({
  status,
  query,
  hasResults,
  errorMessage,
  onRetry,
}: {
  status: SearchStatus;
  query: string;
  hasResults: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  }) => {
  const skeletonItems = Array.from({ length: 5 });

  if (status === 'idle') {
    return <p className={styles.message}>Start typing to discover results.</p>;
  }
  if (status === 'loading') {
    return hasResults ? null : (
      <div className={styles.skeletonList} aria-hidden="true">
        {skeletonItems.map((_, i) => (
          <div key={i} className={styles.skeletonItem} />
        ))}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className={styles.errorBox} role="alert">
        <span>{errorMessage ?? 'We could not complete the search.'}</span>
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }
  if (status === 'no-results') {
    return (
      <p className={styles.message}>
        <span className={styles.messageStrong}>No matches.</span>{' '}
        {query ? `Nothing found for "${query}".` : 'Try a different keyword.'}
      </p>
    );
  }
  return null;
}

export const ResultsList = memo<ResultsListProps>(
  ({ query, results, status, errorMessage, onRetry }) => {
    const hasResults = results.length > 0;

    return (
      <section className={styles.container} aria-busy={status === 'loading'}>
        <div className={styles.header}>
          <span>Results</span>
          {hasResults ? <span>{results.length} found</span> : null}
        </div>
        {hasResults ? (
          <ul className={styles.list}>
            {results.map((item, index) => (
              <ResultItem key={item.id} title={item.title} snippet={item.snippet} index={index} />
            ))}
          </ul>
        ) : null}
        
        <ResultsContent
          status={status}
          query={query}
          errorMessage={errorMessage}
          onRetry={onRetry}
          hasResults={hasResults}
        />
      </section>
    );
  },
);

ResultsList.displayName = 'ResultsList';
