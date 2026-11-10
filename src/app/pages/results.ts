import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QUIZZES, SITE_NAME, TYPE_LABEL, hueOf } from '../data/quizzes';
import { Icon } from '../shared/icon';
import { Seo } from '../shared/seo';
import { ArtTile, QuizCard } from '../shared/ui';
import { Store } from '../state';

@Component({
  selector: 'app-results',
  imports: [RouterLink, Icon, ArtTile, QuizCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap pt-10 sm:pt-14">
      <p class="eyebrow">Salvo só neste navegador</p>
      <h1 class="h-display mt-4 text-[42px] sm:text-[60px]">Meus resultados</h1>
      <p class="mt-3 max-w-xl text-[16px] text-ink-2">Cada quiz que você termina aparece aqui com o último resultado. Nada sai do seu navegador: não existe conta nem servidor.</p>

      <dl class="mt-8 grid max-w-2xl grid-cols-3 gap-3">
        <div class="panel p-4"><dt class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">Feitos</dt><dd class="mt-1 text-[28px] font-medium tracking-[-0.04em]">{{ store.done() }}<span class="text-[16px] text-dim"> / {{ store.total }}</span></dd></div>
        <div class="panel p-4"><dt class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">Acertos na trivia</dt><dd class="mt-1 text-[28px] font-medium tracking-[-0.04em]">{{ accuracy() }}</dd></div>
        <div class="panel p-4"><dt class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-dim">Partidas</dt><dd class="mt-1 text-[28px] font-medium tracking-[-0.04em]">{{ plays() }}</dd></div>
      </dl>

      @if (store.view().length) {
        <ul class="mt-10 grid gap-5 md:grid-cols-2">
          @for (v of store.view(); track v.saved.slug) {
            <li class="card stretch flex overflow-hidden">
              <app-art class="w-28 shrink-0 sm:w-36" [art]="v.result.art ?? v.quiz.art" [hue]="hue(v.quiz, v.result.art)" />
              <div class="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                <p class="flex flex-wrap items-center gap-1.5"><span class="label">{{ type[v.quiz.type] }}</span>
                  @if (v.quiz.type !== 'personalidade') { <span class="label label-ink">{{ v.saved.score }} de {{ v.saved.total }}</span> }
                </p>
                <p class="mt-2.5 text-[13px] text-ink-2">
                  <a [routerLink]="['/quiz', v.quiz.slug]" class="stretch-link outline-none">{{ v.quiz.title }}</a>
                </p>
                <p class="mt-1 text-[21px] font-medium leading-tight tracking-[-0.03em]">{{ v.result.title }}</p>
                <p class="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 font-mono text-[11px] text-dim">
                  <span>{{ date(v.saved.at) }}{{ v.saved.times > 1 ? ' · ' + v.saved.times + ' partidas' : '' }}</span>
                  <span class="inline-flex items-center gap-1 text-accent">Refazer <app-icon name="arrow-right" [size]="13" /></span>
                </p>
              </div>
            </li>
          }
        </ul>
        <div class="mt-8 flex items-center gap-3">
          @if (confirming()) {
            <span class="text-[14px] text-ink-2">Apagar todos os resultados e votos?</span>
            <button type="button" class="btn btn-ink" (click)="store.clear(); confirming.set(false)">Sim, apagar</button>
            <button type="button" class="btn btn-ghost" (click)="confirming.set(false)">Cancelar</button>
          } @else {
            <button type="button" class="btn btn-line" (click)="confirming.set(true)"><app-icon name="trash" [size]="16" /> Apagar resultados</button>
          }
        </div>
      } @else {
        <div class="panel mt-10 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span class="grid h-14 w-14 place-items-center rounded-2xl bg-well text-ink-2"><app-icon name="history" [size]="24" /></span>
          <p class="text-[17px] font-medium">Você ainda não terminou nenhum quiz</p>
          <p class="max-w-sm text-[14px] text-ink-2">Escolha um abaixo. Quando terminar, o resultado aparece aqui.</p>
        </div>
      }

      <section class="mt-16" aria-labelledby="next-title">
        <h2 id="next-title" class="h2 text-[26px] sm:text-[32px]">{{ store.done() ? 'Ainda faltam estes' : 'Comece por estes' }}</h2>
        <div class="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          @for (q of next(); track q.slug) { <app-quiz-card [quiz]="q" /> }
        </div>
      </section>
    </div>
  `,
})
export class MyResults {
  protected store = inject(Store);
  protected readonly type = TYPE_LABEL;
  protected readonly hue = hueOf;
  protected readonly confirming = signal(false);
  protected readonly plays = computed(() => this.store.results().reduce((n, r) => n + r.times, 0));
  protected readonly accuracy = computed(() => {
    const t = this.store.view().filter((v) => v.quiz.type === 'trivia');
    const total = t.reduce((n, v) => n + v.saved.total, 0);
    return total ? `${Math.round((t.reduce((n, v) => n + v.saved.score, 0) / total) * 100)}%` : '–';
  });
  protected readonly next = computed(() => {
    const done = new Set(this.store.results().map((r) => r.slug));
    return [...QUIZZES].filter((q) => !done.has(q.slug)).sort((a, b) => b.plays - a.plays).slice(0, 3);
  });

  constructor() {
    inject(Seo).set({
      title: `Meus resultados | ${SITE_NAME}`,
      description: 'Seus resultados dos quizzes do G2 Buzz, guardados só neste navegador. Sem conta, sem servidor e sem coleta de dados pessoais.',
      path: '/meus-resultados/',
      noindex: true,
    });
  }

  protected date(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
