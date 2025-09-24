import { memo } from 'react';
import type { SearchResult } from '@/lib/searchApi';
import styles from './ResultItem.module.css';

interface ResultItemProps {
  item: SearchResult;
  index: number;
}

const ResultItem = memo<ResultItemProps>(({ item, index }) => {
  return (
    <li className={styles.item}>
      <span className={styles.meta}>{`Result ${index + 1}`}</span>
      <span className={styles.title}>{item.title}</span>
      <p className={styles.snippet}>{item.snippet}</p>
    </li>
  );
});

ResultItem.displayName = 'ResultItem';

export default ResultItem;
