// Post-build smoke check (npm run check, also part of build:pages). Exits 1 on any failure.
// Quiz data and scoring rules, SEO essentials per prerendered page, required files, no em dash anywhere.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { GLYPHS } from '../src/app/data/glyphs.ts';
import { CATEGORIES, QUIZZES, SITE_URL, mediaFile, outcome, type Art } from '../src/app/data/quizzes.ts';

const root = new URL('../dist/g2-buzzfeed/browser/', import.meta.url);
const file = (p: string) => new URL(p.replace(/^\//, ''), root);
const fails: string[] = [];
const must = (ok: unknown, msg: string) => ok || fails.push(msg);

// ---------- Data + scoring ----------
const slugs = new Set<string>();
const arts: Art[] = [];
for (const q of QUIZZES) {
  must(!slugs.has(q.slug), `${q.slug}: duplicate slug`);
  slugs.add(q.slug);
  must(CATEGORIES.some((c) => c.slug === q.category), `${q.slug}: unknown category`);
  must(q.seo.length >= 70 && q.seo.length <= 170, `${q.slug}: seo description has ${q.seo.length} chars`);
  arts.push(q.art, ...q.results.flatMap((r) => (r.art ? [r.art] : [])), ...q.questions.flatMap((x) => [x.art, ...x.options.map((o) => o.art)].filter((a): a is Art => !!a)));
  const keys = new Set(q.results.map((r) => r.key));
  if (q.type === 'personalidade') {
    for (const x of q.questions) for (const o of x.options)
      for (const k of o.to?.split(' ') ?? ['(none)']) must(keys.has(k), `${q.slug}: "${o.label}" points to unknown result ${k}`);
    // Every result must be reachable: answer each question with an option that counts for it.
    for (const k of keys) {
      const picks = q.questions.map((x) => Math.max(0, x.options.findIndex((o) => o.to?.split(' ').includes(k))));
      must(outcome(q, picks).result.key === k, `${q.slug}: result ${k} is unreachable`);
    }
  } else {
    const mins = q.results.map((r) => r.min ?? -1);
    must(mins.includes(0), `${q.slug}: needs a tier with min 0`);
    must(mins.every((m) => m >= 0 && m <= q.questions.length), `${q.slug}: tier min out of range`);
    if (q.type === 'trivia') {
      must(mins.includes(q.questions.length), `${q.slug}: needs a perfect-score tier`);
      q.questions.forEach((x, i) => must(x.answer !== undefined && x.answer >= 0 && x.answer < x.options.length && x.explain, `${q.slug} #${i + 1}: answer/explain`));
      const perfect = outcome(q, q.questions.map((x) => x.answer!));
      must(perfect.score === q.questions.length && perfect.result.min === q.questions.length, `${q.slug}: perfect run scored ${perfect.score}`);
      must(outcome(q, q.questions.map((x) => (x.answer! + 1) % x.options.length)).score === 0, `${q.slug}: all-wrong run should score 0`);
    } else {
      q.questions.forEach((x, i) => must(x.options.length === 2 && x.sim !== undefined && x.sim > 0 && x.sim < 100, `${q.slug} #${i + 1}: enquete needs 2 options and sim 1..99`));
    }
  }
}
for (const a of arts) {
  if (a.g) must(GLYPHS[a.g], `unknown glyph ${a.g}`);
  for (const r of a.img ?? []) must(existsSync(file(mediaFile(r))), `missing ${mediaFile(r)} (npm run media)`);
}
for (const c of CATEGORIES) must(GLYPHS[c.g], `unknown glyph ${c.g}`);

// ---------- Prerendered pages ----------
const sitemap = readFileSync(file('sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, ''));
must(urls.length === 2 + CATEGORIES.length + QUIZZES.length, `sitemap has ${urls.length} urls`);

for (const u of urls) {
  if (!existsSync(file(`${u}index.html`))) { fails.push(`not prerendered: ${u}`); continue; }
  const h = readFileSync(file(`${u}index.html`), 'utf8');
  must((h.match(/<h1[\s>]/g) ?? []).length === 1, `${u}: expected exactly one <h1>`);
  must(h.includes(`<link rel="canonical" href="${SITE_URL}${u}">`), `${u}: canonical mismatch`);
  must(/<meta name="description" content="[^"]{70,}/.test(h), `${u}: description missing/short`);
  must(/<meta property="og:image" content="https:[^"]+"/.test(h), `${u}: og:image missing`);
  must(h.includes('Projeto de portfólio de Gustavo Martins Gripaldi.'), `${u}: disclaimer missing`);
  must(h.includes('Sem afiliação com o BuzzFeed'), `${u}: BuzzFeed note missing`);
  must(h.includes('não é endossado nem certificado pelo TMDB') && h.includes('https://www.igdb.com'), `${u}: TMDB/IGDB credits missing`);
  const ld = h.match(/<script id="ld-json" type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  try {
    const graph = JSON.parse(ld ?? '')['@graph'] as { '@type': string }[];
    must(graph.some((n) => n['@type'] === 'WebSite'), `${u}: WebSite JSON-LD missing`);
    if (u.startsWith('/quiz/')) {
      must(graph.some((n) => n['@type'] === 'Quiz' || n['@type'] === 'CreativeWork'), `${u}: Quiz/CreativeWork JSON-LD missing`);
      must(graph.some((n) => n['@type'] === 'BreadcrumbList'), `${u}: BreadcrumbList missing`);
      must(existsSync(file(`og/${u.split('/')[2]}.jpg`)), `${u}: og card missing (npm run og)`);
    }
  } catch { fails.push(`${u}: invalid JSON-LD`); }
}

// No em dash in anything a visitor can read.
const walk = (dir: URL): URL[] => readdirSync(dir).flatMap((n) => {
  const p = new URL(n, dir);
  return statSync(p).isDirectory() ? walk(new URL(`${n}/`, dir)) : [p];
});
for (const f of walk(root).filter((f) => /\.(html|js|json|txt|xml|webmanifest)$/.test(f.pathname) && !f.pathname.endsWith('3rdpartylicenses.txt'))) {
  must(!readFileSync(f, 'utf8').includes(String.fromCharCode(0x2014)), `em dash in ${f.pathname.split('/browser/')[1]}`);
}
for (const f of ['robots.txt', 'sitemap.xml', 'site.webmanifest', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og/g2buzz.png', 'index.csr.html', 'fonts/geist-latin-wght-normal.woff2'])
  must(existsSync(file(f)), `missing /${f}`);

if (fails.length) { console.error(`check: ${fails.length} problem(s)\n- ` + [...new Set(fails)].join('\n- ')); process.exit(1); }
console.log(`check: ${QUIZZES.length} quizzes scored OK, ${urls.length} urls OK, no em dash`);
