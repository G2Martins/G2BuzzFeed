import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, SITE_NAME, SITE_URL, categoryBySlug, quizzesIn } from '../data/quizzes';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Seo, breadcrumb } from '../shared/seo';
import { ArtTile, QuizCard } from '../shared/ui';

@Component({
  selector: 'app-category',
  imports: [RouterLink, Icon, ArtTile, QuizCard, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cat(); as c) {
      <div class="wrap pt-6 sm:pt-8">
        <nav aria-label="Trilha" class="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
          <ol class="flex flex-wrap items-center gap-x-2"><li><a routerLink="/" class="hover:text-ink">Início</a></li><li aria-hidden="true">/</li><li class="text-ink-2" aria-current="page">{{ c.label }}</li></ol>
        </nav>
        <header class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <app-art class="ticks h-28 w-28 shrink-0 rounded-[22px] border border-line sm:h-36 sm:w-36" [art]="{ g: c.g }" [hue]="c.hue" />
          <div>
            <p class="eyebrow">Categoria · {{ list().length }} quizzes</p>
            <h1 class="h-display mt-3 text-[40px] sm:text-[56px]">Quizzes de {{ c.label }}</h1>
            <p class="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">{{ c.blurb }}</p>
          </div>
        </header>
        <h2 class="sr-only">Quizzes de {{ c.label }}</h2>
        <div class="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          @for (q of list(); track q.slug; let i = $index) { <app-quiz-card [quiz]="q" [eager]="i === 0" [reveal]="(i % 3) * 80" /> }
        </div>
        <section class="mt-20" aria-labelledby="other-title">
          <h2 id="other-title" class="eyebrow">Outras categorias</h2>
          <ul class="mt-4 flex flex-wrap gap-2">
            @for (o of others(); track o.slug) {
              <li><a [routerLink]="['/categoria', o.slug]" class="chip"><span class="grid h-5 w-5 place-items-center rounded-md" [style.background]="o.hue"><app-icon [name]="o.g" [size]="12" [stroke]="2" /></span>{{ o.label }}</a></li>
            }
            <li><a routerLink="/quizzes" class="chip">Todos os quizzes <app-icon name="arrow-right" [size]="14" /></a></li>
          </ul>
        </section>
      </div>
    } @else {
      <div class="wrap py-28 text-center">
        <p class="eyebrow justify-center">Erro 404</p>
        <h1 class="h-display mt-4 text-[44px]">Categoria não encontrada</h1>
        <a routerLink="/quizzes" class="btn btn-primary mt-8">Ver todos os quizzes</a>
      </div>
    }
  `,
})
export class CategoryPage {
  slug = input.required<string>();
  private seo = inject(Seo);
  protected cat = computed(() => categoryBySlug(this.slug()));
  protected list = computed(() => quizzesIn(this.slug()));
  protected others = computed(() => CATEGORIES.filter((c) => c.slug !== this.slug()));

  constructor() {
    effect(() => {
      const c = this.cat();
      const list = this.list();
      untracked(() => {
        if (!c) return this.seo.set({ title: `Categoria não encontrada | ${SITE_NAME}`, description: 'Esta categoria não existe no G2 Buzz. Veja todos os quizzes de personalidade, trivia e isto ou aquilo.', path: '/404/', noindex: true });
        const path = `/categoria/${c.slug}/`;
        this.seo.set({
          title: `Quizzes de ${c.label} | ${SITE_NAME}`,
          description: `${c.blurb} ${list.length} quizzes: ${list.map((q) => q.title.replace(/[?:].*$/, '')).join(', ')}.`.slice(0, 300),
          path,
          jsonLd: [
            {
              '@type': 'CollectionPage',
              name: `Quizzes de ${c.label}`,
              url: `${SITE_URL}${path}`,
              inLanguage: 'pt-BR',
              mainEntity: { '@type': 'ItemList', itemListElement: list.map((q, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/quiz/${q.slug}/`, name: q.title })) },
            },
            breadcrumb([[c.label, path]]),
          ],
        });
      });
    });
  }
}
