import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, QUIZZES, SITE_NAME, TYPE_LABEL, hueOf, quizBySlug, quizzesIn } from '../data/quizzes';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';
import { Seo } from '../shared/seo';
import { ArtTile, QuizCard } from '../shared/ui';
import { Store } from '../state';

const FEATURED = 'qual-linguagem-de-programacao-combina-com-voce';
const TRENDING = [
  'qual-vilao-de-game-voce-seria',
  'qual-icone-do-terror-voce-seria',
  'qual-cartao-postal-de-brasilia-combina-com-voce',
  'quanto-voce-sabe-de-cinema-brasileiro',
  'que-tipo-de-engenheiro-de-dados-voce-e',
  'verdade-ou-mentira-curiosidades',
];
const POLL = { slug: 'isto-ou-aquilo-edicao-brasil', q: 0 };

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, ArtTile, QuizCard, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  protected store = inject(Store);
  protected readonly type = TYPE_LABEL;
  protected readonly hue = hueOf;
  protected readonly featured = quizBySlug(FEATURED)!;
  protected readonly featuredHue = hueOf(this.featured);
  protected readonly trending = TRENDING.map((s) => quizBySlug(s)!);
  protected readonly categories = CATEGORIES.map((c) => ({ ...c, count: quizzesIn(c.slug).length }));
  /** Static, simulated ranking: the numbers are illustrative, not analytics. */
  protected readonly top = [...QUIZZES].sort((a, b) => b.plays - a.plays).slice(0, 5);
  protected readonly counts = { quizzes: QUIZZES.length, questions: QUIZZES.reduce((n, q) => n + q.questions.length, 0), categories: CATEGORIES.length };

  protected readonly pollQuiz = quizBySlug(POLL.slug)!;
  protected readonly poll = this.pollQuiz.questions[POLL.q];
  protected readonly pollId = `${POLL.slug}:${POLL.q}`;
  protected readonly pollVote = computed(() => this.store.votes()[this.pollId]);

  constructor() {
    inject(Seo).set({
      title: `${SITE_NAME} | Quizzes de personalidade, trivia e isto ou aquilo`,
      description: `${QUIZZES.length} quizzes autorais em português: descubra sua linguagem de programação, seu vilão de game e seu cartão-postal de Brasília, e teste o que você sabe com trivia comentada.`,
      path: '/',
    });
  }

  protected k(n: number) {
    return n >= 1000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : String(n);
  }
  protected share(i: number) {
    return i === 0 ? (this.poll.sim ?? 50) : 100 - (this.poll.sim ?? 50);
  }
  protected vote(i: number) {
    this.store.vote(this.pollId, i);
  }
}
