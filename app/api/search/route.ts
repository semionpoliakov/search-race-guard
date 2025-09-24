import type { ApiError, SearchResult } from '@/lib/searchApi';
import { NextResponse } from 'next/server';

const DATASET: SearchResult[] = [
  {
    id: 'guide-next-routing',
    title: 'Mastering Next.js App Router',
    snippet: 'Learn layout nesting, streaming, and data fetching with the App Router.',
  },
  {
    id: 'guide-react-concurrency',
    title: 'React 18 Concurrency Patterns',
    snippet: 'Understand Suspense, transitions, and building race-free UIs.',
  },
  {
    id: 'article-accessibility',
    title: 'Accessible Search Interfaces',
    snippet: 'Checklist for building inclusive search experiences with aria-live updates.',
  },
  {
    id: 'whitepaper-performance',
    title: 'Web Performance Playbook',
    snippet: 'Budgets, metrics, and practical steps for fast, resilient frontends.',
  },
  {
    id: 'cookbook-design-systems',
    title: 'Design Systems in Practice',
    snippet: 'Case studies on maintaining component libraries at scale.',
  },
  {
    id: 'tutorial-caching',
    title: 'Effective Client-Side Caching',
    snippet: 'Strategies for stale-while-revalidate and background refresh flows.',
  },
  {
    id: 'reference-router',
    title: 'Next.js Router Reference',
    snippet: 'API reference for navigation, search params, and history management.',
  },
  {
    id: 'deep-dive-debounce',
    title: 'Debounce Techniques Explained',
    snippet: 'Trade-offs between debounce, throttle, and idle callbacks.',
  },
  {
    id: 'post-abort-controller',
    title: 'AbortController in the Real World',
    snippet: 'Patterns for canceling fetch requests and avoiding race conditions.',
  },
  {
    id: 'note-api-design',
    title: 'Designing Resilient APIs',
    snippet: 'How to shape error payloads and pagination for consumer friendliness.',
  },
  {
    id: 'guide-url-sync',
    title: 'URL Synchronization Patterns',
    snippet: 'Sync component state with query parameters for deep-linking.',
  },
  {
    id: 'handbook-testing',
    title: 'Frontend Testing Handbook',
    snippet: 'A pragmatic overview of component, integration, and e2e testing.',
  },
  {
    id: 'primer-user-research',
    title: 'User Research Primer',
    snippet: 'Connect research insights to everyday product decisions.',
  },
  {
    id: 'cheatsheet-css-modules',
    title: 'CSS Modules Cheatsheet',
    snippet: 'Scoped styling tips, composition, and co-location best practices.',
  },
];

const NETWORK_ERROR_PROBABILITY = 0.1;
const RESPONSE_DELAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get('q') ?? '').trim();

  await wait(RESPONSE_DELAY_MS);

  if (Math.random() < NETWORK_ERROR_PROBABILITY) {
    const errorPayload: ApiError = {
      message: 'Temporary glitch. Please retry your search.',
    };
    return NextResponse.json(errorPayload, { status: 503 });
  }

  if (!rawQuery) {
    return NextResponse.json({ results: [] });
  }

  const lowered = rawQuery.toLowerCase();
  const filtered = DATASET.filter((item) =>
    item.title.toLowerCase().includes(lowered) || item.snippet.toLowerCase().includes(lowered),
  );

  return NextResponse.json({ results: filtered });
}
