import { useCallback, useEffect, useRef } from 'react';

type RequestFactory<T> = (signal: AbortSignal) => Promise<T>;

// Приводим DOM- и Node-исключения об отмене к единой проверке.
const isAbortError = (error: unknown) => {
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }

  return error instanceof Error && error.name === 'AbortError';
};

// Держим AbortController под контролем и отбрасываем устаревшие ответы.
export function useCancelableFetch() {
  const controllerRef = useRef<AbortController | null>(null);
  const lastRequestIdRef = useRef(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  const run = useCallback(async <T>(factory: RequestFactory<T>): Promise<T | undefined> => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = lastRequestIdRef.current + 1;
    lastRequestIdRef.current = requestId;

    try {
      const result = await factory(controller.signal);
      if (!isMountedRef.current || requestId !== lastRequestIdRef.current) {
        return undefined;
      }
      return result;
    } catch (error) {
      if (isAbortError(error) || !isMountedRef.current || requestId !== lastRequestIdRef.current) {
        return undefined;
      }
      throw error;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  return { run, cancel };
}
