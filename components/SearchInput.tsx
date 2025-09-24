import { forwardRef, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  hasError: boolean;
  statusMessageId?: string;
}

// Держим нативный input и внешний ref в синхронизации, чтобы кнопка очистки могла вернуть фокус.
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, isLoading, hasError, statusMessageId }, ref) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    const assignRefs = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
      },
      [onChange],
    );

    const handleClear = useCallback(() => {
      onChange('');
      innerRef.current?.focus();
    }, [onChange]);

    return (
      <label className={styles.wrapper}>
        <span className={styles.label}>Search</span>
        <div
          className={
            hasError
              ? `${styles.fieldContainer} ${styles.fieldContainerError}`
              : styles.fieldContainer
          }
        >
          <input
            ref={assignRefs}
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
              onClick={handleClear}
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

export default SearchInput;
