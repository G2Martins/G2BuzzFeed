import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GLYPHS } from '../data/glyphs';
import { Art, Quiz, TYPE_LABEL, categoryBySlug, hueOf, mediaFile } from '../data/quizzes';
import { Store } from '../state';

/** Art tile: pastel "sticker" background with a poster stack, a line glyph or a short type mark.
 *  `fill` shows a single poster edge to edge (picture answers). Size comes from the parent. */
@Component({
  selector: 'app-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'art', '[style.--hue]': 'hue()' },
  template: `
    @let a = art();
    @if (a.img?.length && fill()) {
      <img class="art-fill zoom" [src]="file(a.img![0])" [alt]="alt()" width="500" height="750" decoding="async" [attr.loading]="eager() ? null : 'lazy'" />
    } @else if (a.img?.length) {
      <div class="art-stack" [attr.data-n]="a.img!.length">
        @for (k of a.img; track k) {
          <img [src]="file(k)" [alt]="$first ? alt() : ''" width="500" height="750" decoding="async" [attr.loading]="eager() ? null : 'lazy'" [attr.fetchpriority]="eager() && $first ? 'high' : null" />
        }
      </div>
    } @else if (a.t) {
      <span class="art-t" aria-hidden="true">{{ a.t }}</span>
    } @else {
      <svg class="art-g" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        @for (d of paths(); track $index) { <path [attr.d]="d" /> }
      </svg>
    }
  `,
})
export class ArtTile {
  art = input.required<Art>();
  hue = input.required<string>();
  fill = input(false);
  eager = input(false);
  alt = input('');
  protected paths = computed(() => GLYPHS[this.art().g ?? ''] ?? GLYPHS['question']);
  protected file = mediaFile;
}

/** Quiz card for grids: art, type, size, title link stretched over the card, local "done" badge. */
@Component({
  selector: 'app-quiz-card',
  imports: [RouterLink, ArtTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let q = quiz();
    <article class="card stretch lift flex h-full flex-col">
      <app-art class="aspect-[16/10] rounded-t-[15px]" [art]="q.art" [hue]="hue()" [eager]="eager()" />
      <div class="flex flex-1 flex-col p-4 sm:p-5">
        <p class="flex flex-wrap items-center gap-1.5">
          <span class="label" [class.label-accent]="q.type === 'trivia'" [class.label-ink]="q.type === 'enquete'">{{ type[q.type] }}</span>
          <span class="label">{{ q.questions.length }} perguntas</span>
        </p>
        <h3 class="mt-3 text-[17px] font-medium leading-snug tracking-[-0.02em]">
          <a class="stretch-link outline-none" [routerLink]="['/quiz', q.slug]">{{ q.title }}</a>
        </h3>
        <p class="clamp-2 mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{{ q.description }}</p>
        <p class="mt-auto flex items-center justify-between gap-3 pt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-dim">
          <span>{{ category() }}</span>
          @if (done(); as d) { <span class="normal-case tracking-normal text-ok">Feito: {{ d }}</span> }
        </p>
      </div>
    </article>
  `,
})
export class QuizCard {
  quiz = input.required<Quiz>();
  eager = input(false);
  private store = inject(Store);
  protected type = TYPE_LABEL;
  protected hue = computed(() => hueOf(this.quiz()));
  protected category = computed(() => categoryBySlug(this.quiz().category)!.label);
  protected done = computed(() => {
    const s = this.store.saved(this.quiz().slug);
    return s ? this.quiz().results.find((r) => r.key === s.key)?.title : '';
  });
}
