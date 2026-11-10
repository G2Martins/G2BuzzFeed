import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AUTHOR, CATEGORIES, PORTFOLIO_URL, PROJECT_URL, REPO_URL } from './data/quizzes';
import { Brand, Icon } from './shared/icon';
import { Store } from './state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Brand],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  protected store = inject(Store);
  private router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly links = { author: AUTHOR, portfolio: PORTFOLIO_URL, project: PROJECT_URL, repo: REPO_URL };
  protected readonly year = new Date().getFullYear();

  protected menuOpen = signal(false);
  private menuDialog = viewChild.required<ElementRef<HTMLDialogElement>>('menuDialog');
  protected toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.store.load());
    // Native <dialog>: showModal gives focus trap, inert page and Esc for free.
    effect(() => {
      const d = this.menuDialog().nativeElement;
      if (typeof d.showModal !== 'function') return; // server render
      if (this.menuOpen() && !d.open) d.showModal();
      else if (!this.menuOpen() && d.open) d.close();
    });
    effect(() => {
      const msg = this.store.announce();
      if (!msg) return;
      this.toast.set(msg);
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toast.set(''); this.store.announce.set(''); }, 3200);
    });
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.menuOpen.set(false);
    });
  }

  /** Works without JS too: the form GETs quizzes/?q=...; with JS the router handles it. */
  protected search(e: Event) {
    e.preventDefault();
    const q = String(new FormData(e.target as HTMLFormElement).get('q') ?? '').trim();
    this.router.navigate(['/quizzes'], { queryParams: q ? { q } : {} });
  }

  protected backdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) this.menuOpen.set(false);
  }
}
