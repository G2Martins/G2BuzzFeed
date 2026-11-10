import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CATEGORIES, QUIZZES, QuizType, SITE_NAME, SITE_URL, TYPE_LABEL, categoryBySlug } from '../data/quizzes';
import { Icon } from '../shared/icon';
import { Seo, breadcrumb } from '../shared/seo';
import { QuizCard } from '../shared/ui';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Everything a person might type: title, blurb, category, type, result names (Python, Sephiroth...) and answers.
const INDEX = QUIZZES.map((q) => ({
  q,
  text: norm([q.title, q.description, categoryBySlug(q.category)!.label, TYPE_LABEL[q.type], ...q.results.map((r) => `${r.title} ${r.source ?? ''}`), ...q.questions.flatMap((x) => x.options.map((o) => o.label))].join(' ')),
}));

@Component({
  selector: 'app-all',
  imports: [Icon, QuizCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap pt-10 sm:pt-14">
      <p class="eyebrow">Biblioteca</p>
      <h1 class="h-display mt-4 text-[42px] sm:text-[60px]">Todos os quizzes</h1>
      <p class="mt-3 max-w-xl text-[16px] text-ink-2">{{ total }} quizzes autorais. Busque por tema, personagem ou resultado, ou filtre por tipo e categoria.</p>

      <form role="search" action="quizzes/" class="relative mt-8 max-w-xl" (submit)="$event.preventDefault()">
        <label for="busca-pagina" class="sr-only">Buscar quizzes</label>
        <app-icon name="search" [size]="18" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
        <input id="busca-pagina" name="q" type="search" class="field min-h-12 rounded-full pl-11 text-[16px]" placeholder="Ex.: Python, Brasília, terror, Pixar"
               autocomplete="off" [value]="q()" (input)="setQ($any($event.target).value)" />
      </form>

      <div class="mt-6 flex flex-col gap-3">
        <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por tipo">
          <button type="button" class="chip" [attr.aria-pressed]="!type()" (click)="set('tipo', '')">Todos os tipos</button>
          @for (t of types; track t.key) {
            <button type="button" class="chip" [attr.aria-pressed]="type() === t.key" (click)="set('tipo', t.key)">{{ t.label }}</button>
          }
        </div>
        <div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por categoria">
          <button type="button" class="chip" [attr.aria-pressed]="!cat()" (click)="set('categoria', '')">Todas as categorias</button>
          @for (c of categories; track c.slug) {
            <button type="button" class="chip" [attr.aria-pressed]="cat() === c.slug" (click)="set('categoria', c.slug)">
              <span class="h-2.5 w-2.5 rounded-full" [style.background]="c.hue"></span>{{ c.label }}
            </button>
          }
        </div>
      </div>

      <h2 class="sr-only">Resultados</h2>
      <p class="mt-8 font-mono text-[11.5px] uppercase tracking-[0.12em] text-dim" aria-live="polite">
        {{ list().length }} {{ list().length === 1 ? 'quiz encontrado' : 'quizzes encontrados' }}@if (q()) { para "{{ q() }}"}
      </p>
      @if (list().length) {
        <div class="mt-5 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of list(); track item.slug; let i = $index) { <app-quiz-card [quiz]="item" [eager]="i === 0" /> }
        </div>
      } @else {
        <div class="panel mt-5 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span class="grid h-14 w-14 place-items-center rounded-2xl bg-well text-ink-2"><app-icon name="search" [size]="22" /></span>
          <p class="text-[17px] font-medium">Nenhum quiz com esse filtro</p>
          <p class="max-w-sm text-[14px] text-ink-2">Tente outra palavra, como um personagem, uma cidade ou uma linguagem.</p>
          <button type="button" class="btn btn-line mt-2" (click)="reset()">Limpar busca e filtros</button>
        </div>
      }
    </div>
  `,
})
export class AllQuizzes {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy = inject(DestroyRef);
  protected readonly total = QUIZZES.length;
  protected readonly categories = CATEGORIES;
  protected readonly types = (Object.keys(TYPE_LABEL) as QuizType[]).map((key) => ({ key, label: TYPE_LABEL[key] }));
  protected readonly q = signal('');
  protected readonly type = signal('');
  protected readonly cat = signal('');
  protected readonly list = computed(() => {
    const terms = norm(this.q()).split(/\s+/).filter(Boolean);
    return INDEX.filter(({ q, text }) => (!this.type() || q.type === this.type()) && (!this.cat() || q.category === this.cat()) && terms.every((t) => text.includes(t))).map((x) => x.q);
  });

  constructor() {
    inject(Seo).set({
      title: `Todos os quizzes | ${SITE_NAME}`,
      description: `Busque entre ${QUIZZES.length} quizzes autorais de personalidade, trivia e isto ou aquilo sobre games, filmes, tecnologia, Brasília, cultura pop e curiosidades.`,
      path: '/quizzes/',
      jsonLd: [
        { '@type': 'CollectionPage', name: 'Todos os quizzes', url: `${SITE_URL}/quizzes/`, inLanguage: 'pt-BR' },
        breadcrumb([['Todos os quizzes', '/quizzes/']]),
      ],
    });
    // Query params only after hydration: the prerendered page is the unfiltered list.
    afterNextRender(() => {
      const sub = this.route.queryParamMap.subscribe((p) => {
        this.q.set(p.get('q') ?? '');
        this.type.set(p.get('tipo') ?? '');
        this.cat.set(p.get('categoria') ?? '');
      });
      this.destroy.onDestroy(() => sub.unsubscribe());
    });
  }

  protected setQ(v: string) {
    this.q.set(v);
    this.sync();
  }
  protected set(key: 'tipo' | 'categoria', v: string) {
    (key === 'tipo' ? this.type : this.cat).set(v);
    this.sync();
  }
  protected reset() {
    this.q.set('');
    this.type.set('');
    this.cat.set('');
    this.sync();
  }
  private sync() {
    const queryParams = { q: this.q().trim() || null, tipo: this.type() || null, categoria: this.cat() || null };
    this.router.navigate([], { queryParams, replaceUrl: true });
  }
}
