import { memo, useMemo } from 'react';
import type { SearchResult } from '@/lib/searchApi';
import type { SearchStatus } from '@/lib/searchTypes';
import ResultItem from './ResultItem';
import styles from './ResultsList.module.css';

interface ResultsListProps {
  results: SearchResult[];
  status: SearchStatus;
  errorMessage: string | null;
  onRetry: () => void;
}

const skeletonItems = Array.from({ length: 5 });

const ResultsList = memo<ResultsListProps>(
  ({ results, status, errorMessage, onRetry }) => {
    const hasResults = results.length > 0;

    const content = useMemo(() => {
      switch (status) {
        case 'idle':
          return <p className={styles.message}>Start typing to discover results.</p>;
        case 'loading':
          if (hasResults) {
            return null;
          }
          return (
            <div className={styles.skeletonList} aria-hidden="true">
              {skeletonItems.map((_, index) => (
                <div key={index} className={styles.skeletonItem} />
              ))}
            </div>
          );
        case 'error':
          return (
            <div className={styles.errorBox} role="alert">
              <span>{errorMessage ?? 'We could not complete the search.'}</span>
              <button type="button" className={styles.retryButton} onClick={onRetry}>
                Retry
              </button>
            </div>
          );
        case 'no-results':
          return (
            <p className={styles.message}>
              <span className={styles.messageStrong}>No matches.</span> Try a different keyword.
            </p>
          );
        case 'success':
          return null;
        default:
          return null;
      }
    }, [errorMessage, hasResults, onRetry, status]);

    return (
      <section className={styles.container} aria-busy={status === 'loading'}>
        <div className={styles.header}>
          <span>Results</span>
          {hasResults ? <span>{results.length} found</span> : null}
        </div>
        {hasResults ? (
          <ul className={styles.list}>
            {results.map((item, index) => (
              <ResultItem key={item.id} item={item} index={index} />
            ))}
          </ul>
        ) : null}
        {content}
      </section>
    );
  },
);

ResultsList.displayName = 'ResultsList';

export default ResultsList;
