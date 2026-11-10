import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_NAME } from '../data/quizzes';
import { Seo } from '../shared/seo';
import { ArtTile } from '../shared/ui';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ArtTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap py-24 text-center">
      <app-art class="mx-auto h-28 w-28 rounded-[22px] border border-line" [art]="{ g: 'question' }" hue="#ffe680" />
      <p class="eyebrow mt-8 justify-center">Erro 404</p>
      <h1 class="h-display mt-4 text-[44px] sm:text-[60px]">Essa pergunta ficou sem resposta</h1>
      <p class="mx-auto mt-4 max-w-md text-ink-2">A página que você procurou não existe no G2 Buzz. Volte para o início ou escolha um quiz.</p>
      <div class="mt-8 flex justify-center gap-2">
        <a routerLink="/" class="btn btn-primary">Ir para o início</a>
        <a routerLink="/quizzes" class="btn btn-line">Ver quizzes</a>
      </div>
    </div>
  `,
})
export class NotFound {
  constructor() {
    inject(Seo).set({ title: `Página não encontrada | ${SITE_NAME}`, description: 'Esta página não existe no G2 Buzz, site de quizzes de personalidade, trivia e isto ou aquilo.', path: '/404/', noindex: true });
  }
}
