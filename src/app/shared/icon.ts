import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GLYPHS } from '../data/glyphs';

// Inline SVG icons for the UI chrome (lucide-style strokes). Content glyphs live in data/glyphs.ts and
// can be used here too (e.g. category icons).
const STROKE: Record<string, string[]> = {
  search: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'm21 21-4.3-4.3'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
  'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
  check: ['M20 6 9 17l-5-5'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
  refresh: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
  link: ['M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7', 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'],
  share: ['M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'm8.6 13.5 6.8 4', 'm15.4 6.5-6.8 4'],
  trash: ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'],
  clock: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  history: ['M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.7L3 8', 'M3 3v5h5', 'M12 7v5l4 2'],
  sparkle: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 17v4', 'M17 19h4'],
  keyboard: ['M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'M6 10h.01', 'M10 10h.01', 'M14 10h.01', 'M18 10h.01', 'M7 14h10'],
};

// Brand marks live in styles.css (.bi-*) as CSS masks.
const BRANDS = new Set(['github']);

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @if (brand()) {
      <span class="bi" [class]="'bi-' + name()" [style.width.px]="size()" [style.height.px]="size()"></span>
    } @else {
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" focusable="false" fill="none" stroke="currentColor"
           [attr.stroke-width]="stroke()" stroke-linecap="round" stroke-linejoin="round">
        @for (d of paths(); track $index) { <path [attr.d]="d" /> }
      </svg>
    }
  `,
})
export class Icon {
  name = input.required<string>();
  size = input(18);
  stroke = input(1.8);
  protected brand = computed(() => BRANDS.has(this.name()));
  protected paths = computed(() => STROKE[this.name()] ?? GLYPHS[this.name()] ?? []);
}

/** The G2 Buzz mark: the G2 family "G" with a superscript "2", on a cobalt tile with an ink bite. Original artwork. */
@Component({
  selector: 'app-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 32 32" focusable="false">
      <rect x="1" y="3" width="30" height="28" rx="8.5" fill="#16131d" />
      <rect x="1" y="1" width="30" height="28" rx="8.5" fill="#3341f5" />
      <path d="M19.6 10.4a6.6 6.6 0 1 0 1 7.1h-5.4" fill="none" stroke="#fffdf7" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22.2 5.9c.3-1 1.1-1.5 2-1.5 1.1 0 1.9.8 1.9 1.8 0 1.5-2 2.4-3.9 4.3h4" fill="none" stroke="#ffe680" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
})
export class Brand {
  size = input(30);
}
