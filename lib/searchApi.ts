export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface ApiError {
  message: string;
}

interface FetchSearchOptions {
  limit?: number;
  signal?: AbortSignal;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isApiError = (value: unknown): value is ApiError =>
  isRecord(value) && typeof value.message === 'string';

const isSearchResult = (value: unknown): value is SearchResult =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.snippet === 'string';

// Рантайм-валидация страхует UI от некорректных ответов.
const isSearchResponse = (value: unknown): value is SearchResponse =>
  isRecord(value) && Array.isArray(value.results) && value.results.every(isSearchResult);

export async function fetchSearchResults(
  query: string,
  { limit = 10, signal }: FetchSearchOptions = {},
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (limit) {
    params.set('limit', String(limit));
  }

  const response = await fetch(`/api/search?${params.toString()}`, {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    let message = 'Failed to fetch search results.';
    try {
      const errorBody: unknown = await response.json();
      if (isApiError(errorBody)) {
        message = errorBody.message;
      }
    } catch {
      // Игнорируем случаи, когда тело ошибки невозможно распарсить
    }
    throw new Error(message);
  }

  const payload: unknown = await response.json();
  if (!isSearchResponse(payload)) {
    throw new Error('Invalid response format.');
  }

  return payload;
}
