// Prints the social-card data as JSON for scripts/og.py (Python can't read the TS data files).
import { GLYPHS } from '../src/app/data/glyphs.ts';
import { CATEGORIES, QUIZZES, TYPE_LABEL, categoryBySlug, hueOf, mediaFile } from '../src/app/data/quizzes.ts';

const art = (a: { img?: string[]; g?: string; t?: string }) => ({
  img: (a.img ?? []).map((r) => `../public/${mediaFile(r)}`),
  g: a.g ? GLYPHS[a.g] : null,
  t: a.t ?? null,
});

console.log(JSON.stringify({
  categories: CATEGORIES.map((c) => ({ hue: c.hue, g: GLYPHS[c.g] })),
  quizzes: QUIZZES.map((q) => ({
    slug: q.slug,
    title: q.title,
    eyebrow: `${TYPE_LABEL[q.type]} · ${categoryBySlug(q.category)!.label}`,
    meta: `${q.questions.length} perguntas`,
    hue: hueOf(q),
    ...art(q.art),
  })),
}));
