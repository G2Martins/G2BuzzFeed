// Publishes the static build to /docs (GitHub Pages source: main branch, /docs folder, base /G2BuzzFeed/).
import { cp, rm, writeFile } from 'node:fs/promises';

const dist = new URL('../dist/g2-buzzfeed/browser/', import.meta.url);
const docs = new URL('../docs/', import.meta.url);
const shell = new URL('index.csr.html', dist);

// ponytail: async cp on purpose: Node 22's native cpSync exits 127 silently on non-ASCII paths ("Programação").
await rm(docs, { recursive: true, force: true });
await cp(dist, docs, { recursive: true });
await writeFile(new URL('.nojekyll', docs), '');
// Unknown URLs boot the client app (router shows the 404 page).
await cp(shell, new URL('404.html', docs));
// Browser-only route gets the client shell at its own path, so a reload answers 200 instead of 404.
await cp(shell, new URL('meus-resultados/index.html', docs), { force: true });
console.log('pages: dist/g2-buzzfeed/browser -> docs/ (+ .nojekyll, 404.html, meus-resultados shell)');
