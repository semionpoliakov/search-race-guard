import { useEffect, useState } from 'react';

// Дебаунсим любое значение и корректно чистим таймеры в строгом режиме React 18.
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
