// Writes public/sitemap.xml and public/robots.txt from the quiz data (runs before every build).
import { writeFile } from 'node:fs/promises';
import { CATEGORIES, QUIZZES, SITE_URL } from '../src/app/data/quizzes.ts';

const today = new Date().toISOString().slice(0, 10);
const pages = [
  { path: '/', priority: '1.0' },
  { path: '/quizzes/', priority: '0.9' },
  ...CATEGORIES.map((c) => ({ path: `/categoria/${c.slug}/`, priority: '0.7' })),
  ...QUIZZES.map((q) => ({ path: `/quiz/${q.slug}/`, priority: '0.8' })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;

// ponytail: GitHub Pages project sites cannot own the domain-root robots.txt; this copy documents intent
// and points to the sitemap (submit it in Search Console).
const robots = `User-agent: *
Allow: /
Disallow: /G2BuzzFeed/meus-resultados/

Sitemap: ${SITE_URL}/sitemap.xml
`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap);
await writeFile(new URL('../public/robots.txt', import.meta.url), robots);
console.log(`seo: sitemap.xml with ${pages.length} urls, robots.txt`);
