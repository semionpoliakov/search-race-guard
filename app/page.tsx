import { SearchClient } from './search/SearchClient';

type SearchParamsShape = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams?: Promise<SearchParamsShape> | undefined;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams: SearchParamsShape = (await searchParams) ?? {};
  const rawQuery = resolvedParams.q;
  const initialQuery = Array.isArray(rawQuery) ? rawQuery[0] ?? '' : rawQuery ?? '';

  return <SearchClient initialQuery={initialQuery} />;
}
