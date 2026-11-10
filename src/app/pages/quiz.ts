import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, Outcome, QUIZZES, SITE_NAME, SITE_URL, TYPE_LABEL, AUTHOR, PORTFOLIO_URL, categoryBySlug, hueOf, minutes, outcome, quizBySlug } from '../data/quizzes';
import { download, resultCard } from '../shared/card';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Seo, breadcrumb } from '../shared/seo';
import { ArtTile, QuizCard } from '../shared/ui';
import { Store } from '../state';

const KEYS = 'ABCDEF';
// Fixed confetti burst (transform/opacity only); deterministic so server and client agree.
const CONFETTI = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  const d = 180 + ((i * 53) % 160);
  return {
    x: `${Math.round(Math.cos(a) * d)}px`,
    y: `${Math.round(Math.sin(a) * d * 0.8 + 140)}px`,
    r: `${((i * 97) % 720) - 360}deg`,
    c: ['#3341f5', '#ffe680', '#ffb9b3', '#a3e9c9', '#cbbcff', '#16131d'][i % 6],
    t: `${(i % 5) * 40}ms`,
  };
});

@Component({
  selector: 'app-quiz',
  imports: [RouterLink, Icon, ArtTile, QuizCard, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quiz.html',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class QuizPage {
  slug = input.required<string>();

  private seo = inject(Seo);
  protected store = inject(Store);
  private injector = inject(Injector);

  protected readonly keys = KEYS;
  protected readonly type = TYPE_LABEL;
  protected readonly confetti = CONFETTI;
  protected readonly quiz = computed(() => quizBySlug(this.slug()));
  protected readonly category = computed(() => categoryBySlug(this.quiz()?.category ?? '') ?? CATEGORIES[0]);
  protected readonly hue = computed(() => (this.quiz() ? hueOf(this.quiz()!) : '#ebe6da'));
  protected readonly minutes = computed(() => (this.quiz() ? minutes(this.quiz()!) : 1));
  protected readonly related = computed(() => {
    const q = this.quiz();
    if (!q) return [];
    const same = QUIZZES.filter((x) => x.category === q.category && x.slug !== q.slug);
    const other = QUIZZES.filter((x) => x.category !== q.category && x.type !== q.type).sort((a, b) => b.plays - a.plays);
    return [...same, ...other].slice(0, 3);
  });

  protected readonly phase = signal<'intro' | 'play' | 'result'>('intro');
  protected readonly step = signal(0);
  protected readonly picks = signal<number[]>([]);
  protected readonly current = signal<number | null>(null);
  protected readonly revealed = signal(false);
  protected readonly final = signal<Outcome | null>(null);
  protected readonly busy = signal(false);
  protected readonly canShare = signal(false);

  protected readonly question = computed(() => this.quiz()?.questions[this.step()]);
  protected readonly total = computed(() => this.quiz()?.questions.length ?? 0);
  protected readonly progress = computed(() => (this.step() + (this.revealed() || this.phase() === 'result' ? 1 : 0)) / Math.max(1, this.total()));
  /** Picture answers when every option has art: posters or glyph tiles. */
  protected readonly layout = computed(() => {
    const q = this.question();
    if (!q) return 'list';
    if (this.quiz()?.type === 'enquete') return 'versus';
    if (q.options.every((o) => o.art?.img)) return 'posters';
    if (q.options.every((o) => o.art?.g)) return 'glyphs';
    return 'list';
  });
  protected readonly isRight = computed(() => this.current() === this.question()?.answer);
  protected readonly saved = computed(() => {
    const q = this.quiz();
    const s = q && this.store.saved(q.slug);
    const result = s && q.results.find((r) => r.key === s.key);
    return s && result ? { ...s, result } : null;
  });
  protected readonly scoreLine = computed(() => {
    const f = this.final();
    const q = this.quiz();
    if (!f || !q || q.type === 'personalidade') return '';
    return q.type === 'trivia' ? `${f.score} de ${f.total} acertos` : `${f.score} de ${f.total} com a maioria`;
  });
  protected readonly shareUrl = computed(() => `${SITE_URL}/quiz/${this.slug()}/`);
  protected readonly share = computed(() => {
    const f = this.final();
    const q = this.quiz();
    if (!f || !q) return [];
    const text = `Deu "${f.result.title}" no quiz "${q.title}" do ${SITE_NAME}. E você?`;
    const u = encodeURIComponent(this.shareUrl());
    const t = encodeURIComponent(text);
    return [
      { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${text} ${this.shareUrl()}`)}` },
      { label: 'X', href: `https://x.com/intent/tweet?text=${t}&url=${u}` },
      { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
      { label: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    ];
  });

  private stage = viewChild<ElementRef<HTMLElement>>('stage');
  private focusTarget = viewChild<ElementRef<HTMLElement>>('focusTarget');

  constructor() {
    // New quiz (first render or client navigation between quizzes): reset the run and update SEO.
    effect(() => {
      this.quiz();
      untracked(() => {
        this.phase.set('intro');
        this.final.set(null);
        this.setSeo();
      });
    });
    afterNextRender(() => this.canShare.set(typeof navigator.share === 'function'));
  }

  protected start() {
    this.picks.set([]);
    this.step.set(0);
    this.current.set(null);
    this.revealed.set(false);
    this.final.set(null);
    this.phase.set('play');
    this.settle(true);
  }

  protected choose(i: number) {
    const q = this.quiz()!;
    if (this.revealed()) return;
    this.current.set(i);
    if (q.type === 'enquete') {
      this.revealed.set(true);
      this.store.vote(`${q.slug}:${this.step()}`, i);
    }
  }

  protected submit(e?: Event) {
    e?.preventDefault();
    const q = this.quiz()!;
    const i = this.current();
    if (i === null) return;
    if (q.type === 'trivia' && !this.revealed()) {
      this.revealed.set(true);
      return;
    }
    this.picks.update((p) => Object.assign([...p], { [this.step()]: i }));
    if (this.step() < this.total() - 1) {
      this.step.update((s) => s + 1);
      this.current.set(this.picks()[this.step()] ?? null);
      this.revealed.set(false);
      this.settle(false);
    } else this.finish();
  }

  protected back() {
    if (this.step() === 0) return;
    this.step.update((s) => s - 1);
    this.current.set(this.picks()[this.step()] ?? null);
    this.revealed.set(false);
    this.settle(false);
  }

  private finish() {
    const q = this.quiz()!;
    const o = outcome(q, this.picks());
    this.final.set(o);
    this.phase.set('result');
    this.store.save({ slug: q.slug, key: o.result.key, score: o.score, total: o.total });
    this.settle(true);
  }

  /** Shows the stored result again (after a reload the answers themselves are gone, by design). */
  protected showSaved() {
    const s = this.saved();
    if (!s) return;
    this.final.set({ result: s.result, score: s.score, total: s.total, ranking: [] });
    this.picks.set([]);
    this.phase.set('result');
    this.settle(true);
  }

  /** After the next render: move focus to the new question/result for screen readers, keep it in view. */
  private settle(scroll: boolean) {
    afterNextRender(() => {
      this.focusTarget()?.nativeElement.focus({ preventScroll: true });
      const stage = this.stage()?.nativeElement;
      if (!stage) return;
      const top = stage.getBoundingClientRect().top;
      if (scroll || top < 0) {
        const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: Math.max(0, top + window.scrollY - 88), behavior: smooth ? 'smooth' : 'auto' });
      }
    }, { injector: this.injector });
  }

  protected onKey(e: KeyboardEvent) {
    if (this.phase() !== 'play' || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.matches('input[type=search], input[type=text], textarea')) return;
    const n = this.question()?.options.length ?? 0;
    const k = e.key.toUpperCase();
    const i = KEYS.indexOf(k) > -1 ? KEYS.indexOf(k) : /^[1-6]$/.test(k) ? Number(k) - 1 : -1;
    if (i > -1 && i < n) {
      e.preventDefault();
      this.choose(i);
      document.getElementById(`opt-${i}`)?.focus();
    } else if (e.key === 'Enter' && !t.closest('button, a')) {
      // Radios don't submit forms on Enter natively; here Enter means "answer / next".
      e.preventDefault();
      this.submit();
    }
  }

  protected optState(i: number) {
    const q = this.question();
    if (!this.revealed() || this.quiz()?.type !== 'trivia' || !q) return '';
    if (i === q.answer) return 'is-right';
    return i === this.current() ? 'is-wrong' : '';
  }

  protected simShare(i: number) {
    const sim = this.question()?.sim ?? 50;
    return i === 0 ? sim : 100 - sim;
  }

  protected async downloadCard() {
    const f = this.final();
    const q = this.quiz();
    if (!f || !q || this.busy()) return;
    this.busy.set(true);
    try {
      const blob = await resultCard(q, f.result, hueOf(q, f.result.art), this.scoreLine());
      download(blob, `g2buzz-${q.slug}-${f.result.key}.png`);
      this.store.announce.set('Card do resultado baixado');
    } catch {
      this.store.announce.set('Não foi possível gerar o card agora');
    } finally {
      this.busy.set(false);
    }
  }

  protected async copyLink() {
    try {
      await navigator.clipboard.writeText(this.shareUrl());
      this.store.announce.set('Link do quiz copiado');
    } catch {
      this.store.announce.set('Copie o link na barra de endereço');
    }
  }

  protected nativeShare() {
    const f = this.final();
    const q = this.quiz();
    if (!f || !q) return;
    navigator.share({ title: q.title, text: `Deu "${f.result.title}" no quiz "${q.title}". E você?`, url: this.shareUrl() }).catch(() => null);
  }

  private setSeo() {
    const q = this.quiz();
    if (!q) {
      this.seo.set({ title: `Quiz não encontrado | ${SITE_NAME}`, description: 'Este quiz não existe no G2 Buzz. Veja todos os quizzes de personalidade, trivia e isto ou aquilo.', path: '/404/', noindex: true });
      return;
    }
    const c = categoryBySlug(q.category)!;
    const path = `/quiz/${q.slug}/`;
    this.seo.set({
      title: `${q.title} | ${SITE_NAME}`,
      description: q.seo,
      path,
      image: `/og/${q.slug}.jpg`,
      imageAlt: `${q.title}: quiz do G2 Buzz`,
      jsonLd: [
        {
          '@type': q.type === 'trivia' ? 'Quiz' : 'CreativeWork',
          '@id': `${SITE_URL}${path}#quiz`,
          name: q.title,
          headline: q.title,
          description: q.seo,
          url: `${SITE_URL}${path}`,
          image: `${SITE_URL}/og/${q.slug}.jpg`,
          inLanguage: 'pt-BR',
          genre: `${TYPE_LABEL[q.type]} · ${c.label}`,
          about: c.label,
          isAccessibleForFree: true,
          author: { '@type': 'Person', '@id': `${PORTFOLIO_URL}#person`, name: AUTHOR, url: PORTFOLIO_URL },
          isPartOf: { '@id': `${SITE_URL}/#website` },
        },
        breadcrumb([[c.label, `/categoria/${c.slug}/`], [q.title, path]]),
      ],
    });
  }
}
