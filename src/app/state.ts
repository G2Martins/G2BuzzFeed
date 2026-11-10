import { Injectable, computed, signal } from '@angular/core';
import { QUIZZES, quizBySlug } from './data/quizzes';

/** Latest result per quiz. Only demo state lives in localStorage: no personal data. */
export interface SavedResult {
  slug: string;
  key: string;
  /** Trivia: right answers. Enquete: answers matching the simulated majority. */
  score: number;
  total: number;
  /** How many times this quiz was finished on this browser. */
  times: number;
  at: string;
}

const KEY = 'g2buzz:v1';

@Injectable({ providedIn: 'root' })
export class Store {
  readonly results = signal<SavedResult[]>([]);
  /** Enquete votes, "slug:question" -> option index (home poll strip and isto-ou-aquilo quizzes). */
  readonly votes = signal<Record<string, number>>({});
  readonly announce = signal('');
  /** Results joined with their quiz and result data, newest first; drops entries of removed quizzes. */
  readonly view = computed(() =>
    this.results().flatMap((s) => {
      const quiz = quizBySlug(s.slug);
      const result = quiz?.results.find((r) => r.key === s.key);
      return quiz && result ? [{ saved: s, quiz, result }] : [];
    }),
  );
  readonly done = computed(() => this.view().length);
  readonly total = QUIZZES.length;
  private loaded = false;

  /** Called once after hydration (browser only), so prerendered HTML never depends on storage. */
  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { results?: SavedResult[]; votes?: Record<string, number> } | null;
      if (Array.isArray(raw?.results)) this.results.set(raw.results.filter((r) => typeof r?.slug === 'string' && typeof r.key === 'string'));
      if (raw?.votes && typeof raw.votes === 'object') this.votes.set(raw.votes);
    } catch { /* corrupt or blocked storage: start fresh */ }
    this.loaded = true;
  }

  save(r: Omit<SavedResult, 'times' | 'at'>) {
    const prev = this.results().find((x) => x.slug === r.slug);
    this.results.update((list) => [{ ...r, times: (prev?.times ?? 0) + 1, at: new Date().toISOString() }, ...list.filter((x) => x.slug !== r.slug)]);
    this.persist();
  }

  vote(id: string, option: number) {
    this.votes.update((v) => ({ ...v, [id]: option }));
    this.persist();
  }

  saved(slug: string) {
    return this.results().find((r) => r.slug === slug);
  }

  clear() {
    this.results.set([]);
    this.votes.set({});
    this.persist();
    this.announce.set('Resultados apagados deste navegador');
  }

  private persist() {
    if (!this.loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ results: this.results(), votes: this.votes() })); } catch { /* private mode */ }
  }
}
