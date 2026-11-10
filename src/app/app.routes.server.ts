import { RenderMode, ServerRoute } from '@angular/ssr';
import { CATEGORIES, QUIZZES } from './data/quizzes';

// Every content page is prerendered to static HTML (GitHub Pages, no server). "Meus resultados" lives in
// localStorage only, so it renders in the browser (scripts/pages.ts gives it a shell).
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'quizzes', renderMode: RenderMode.Prerender },
  { path: 'quiz/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: async () => QUIZZES.map((q) => ({ slug: q.slug })) },
  { path: 'categoria/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: async () => CATEGORIES.map((c) => ({ slug: c.slug })) },
  { path: '**', renderMode: RenderMode.Client },
];
