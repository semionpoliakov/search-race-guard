'use client';

import type { ChangeEvent } from 'react';
import { forwardRef, useEffect } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
  hasError: boolean;
  statusMessageId?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, onChange, isLoading, hasError, statusMessageId }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    }

    useEffect(() => {
      if (!value && ref && 'current' in ref) {
        ref.current?.focus();
      }
    }, [value]);

    return (
      <label className={styles.wrapper}>
        <span className={styles.label}>Search</span>
        <div className={`${styles.fieldContainer} ${hasError ? styles.fieldContainerError : ''}`}
        >
          <input
            ref={ref}
            type="search"
            value={value}
            onChange={handleChange}
            className={styles.input}
            placeholder="Search documentation, topics, authors..."
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-invalid={hasError || undefined}
            aria-describedby={statusMessageId ?? undefined}
          />
          {value ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onClear}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
          <span
            className={isLoading ? styles.spinnerVisible : styles.spinner}
            aria-hidden="true"
          />
        </div>
      </label>
    );
  },
);

SearchInput.displayName = 'SearchInput';