'use client';

import type { SearchResult } from '@/lib/searchApi';
import { memo } from 'react';
import styles from './ResultItem.module.css';

interface ResultItemProps {
  title: SearchResult['title'];
  snippet: SearchResult['snippet'];
  index: number;
}

//Будем считать, что в "продакшне" список может быть длинным, поэтому memo в данном случае уместен 
export const ResultItem = memo<ResultItemProps>(({ title, snippet, index }) => {
  return (
    <li className={styles.item}>
      <span className={styles.meta}>{`Result ${index + 1}`}</span>
      <span className={styles.title}>{title}</span>
      <p className={styles.snippet}>{snippet}</p>
    </li>
  );
});

ResultItem.displayName = 'ResultItem';