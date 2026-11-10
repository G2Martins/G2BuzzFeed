// Downloads every poster/cover referenced in src/app/data/quizzes.ts into public/media/ (same origin, so the
// result card canvas can draw them). Credentials: local .env if present, else ../Starplex/.env (TMDB_TOKEN)
// and ../G2Store/.env (TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET). Tokens are never printed.
//   npm run media                                   -> fetch missing files ("-- --force" refetches all)
//   npm run media -- --search "tmdb:Halloween 1978|tv:Dark|igdb:Portal" -> print ids to pick from
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QUIZZES, mediaFile } from '../src/app/data/quizzes.ts';

const local = new URL('../.env', import.meta.url);
if (existsSync(local)) process.loadEnvFile(local);
else for (const f of ['../../Starplex/.env', '../../G2Store/.env']) {
  const u = new URL(f, import.meta.url);
  if (existsSync(u)) process.loadEnvFile(u);
}
const env = (k: string) => process.env[k] ?? '';

async function tmdb(path: string) {
  if (!env('TMDB_TOKEN')) throw new Error('TMDB_TOKEN ausente (.env local ou ../Starplex/.env)');
  const res = await fetch(`https://api.themoviedb.org/3${path}`, { headers: { Authorization: `Bearer ${env('TMDB_TOKEN')}`, accept: 'application/json' } });
  if (!res.ok) throw new Error(`TMDB respondeu ${res.status} em ${path.split('?')[0]}`);
  return res.json() as Promise<any>;
}

let igdbToken = '';
async function igdb(body: string) {
  if (!igdbToken) {
    if (!env('TWITCH_CLIENT_ID') || !env('TWITCH_CLIENT_SECRET')) throw new Error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET ausentes');
    const auth = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({ client_id: env('TWITCH_CLIENT_ID'), client_secret: env('TWITCH_CLIENT_SECRET'), grant_type: 'client_credentials' }),
    });
    if (!auth.ok) throw new Error(`Twitch auth falhou: HTTP ${auth.status}`);
    igdbToken = ((await auth.json()) as { access_token: string }).access_token;
  }
  await new Promise((r) => setTimeout(r, 260)); // ponytail: serial + gap stays under IGDB's 4 req/s
  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: { 'Client-ID': env('TWITCH_CLIENT_ID'), Authorization: `Bearer ${igdbToken}`, Accept: 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`IGDB games: HTTP ${res.status}`);
  return res.json() as Promise<any[]>;
}

const year = (d?: string | number) => (typeof d === 'number' ? new Date(d * 1000).toISOString().slice(0, 4) : String(d ?? '').slice(0, 4));

const search = process.argv.indexOf('--search');
if (search > -1) {
  for (const term of process.argv[search + 1].split('|')) {
    const [kind, ...rest] = term.split(':');
    const q = rest.join(':').trim();
    console.log(`# ${term}`);
    if (kind === 'igdb') {
      // "igdb:#71,20" looks ids up directly; anything else is a text search.
      const where = q.startsWith('#') ? `where id = (${q.slice(1).replace(/[^\d,]/g, '')});` : `search "${q.replace(/"/g, '')}";`;
      for (const g of await igdb(`${where} fields name,first_release_date,cover.image_id; limit 10;`))
        console.log(`igdb/${g.id}\t${g.name}\t${year(g.first_release_date)}\t${g.cover ? 'capa' : 'SEM CAPA'}`);
    } else {
      const type = kind === 'tv' ? 'tv' : 'movie';
      const m = q.match(/^(.*?)\s+(\d{4})$/);
      const params = new URLSearchParams({ query: m ? m[1] : q, language: 'pt-BR' });
      if (m) params.set(type === 'tv' ? 'first_air_date_year' : 'year', m[2]);
      for (const r of ((await tmdb(`/search/${type}?${params}`)).results ?? []).slice(0, 6))
        console.log(`tmdb/${type}/${r.id}\t${r.title ?? r.name}\t(${r.original_title ?? r.original_name})\t${year(r.release_date ?? r.first_air_date)}\t${r.poster_path ? 'pôster' : 'SEM PÔSTER'}`);
    }
  }
  process.exit(0);
}

// Every "tmdb/..." or "igdb/..." string anywhere in the quiz data.
const refs = new Set<string>();
const walk = (v: unknown): void => {
  if (typeof v === 'string' && /^(tmdb|igdb)\//.test(v)) refs.add(v);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
walk(QUIZZES);

const force = process.argv.includes('--force');
const out = (ref: string) => new URL(`../public/${mediaFile(ref)}`, import.meta.url);
const todo = [...refs].filter((r) => force || !existsSync(out(r)));

// Re-encoded to WebP by Pillow (pip install pillow), about half the size of the CDN jpg.
// ponytail: relative output path + cwd on purpose, Python's argv mangles the non-ASCII project path.
const root = fileURLToPath(new URL('..', import.meta.url));
const WEBP = 'import io,sys; from PIL import Image; Image.open(io.BytesIO(sys.stdin.buffer.read())).convert("RGB").save(sys.argv[1], "WEBP", quality=78, method=6)';
async function save(ref: string, url: string, label: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`imagem de ${ref}: HTTP ${res.status}`);
  execFileSync('python', ['-c', WEBP, `public/${mediaFile(ref)}`], { input: Buffer.from(await res.arrayBuffer()), cwd: root });
  console.log(`${ref}\t${label}`);
}

for (const ref of todo.filter((r) => r.startsWith('tmdb/'))) {
  const [, type, id] = ref.split('/');
  const d = await tmdb(`/${type}/${id}?language=pt-BR`);
  if (!d.poster_path) throw new Error(`${ref} sem pôster`);
  await save(ref, `https://image.tmdb.org/t/p/w500${d.poster_path}`, `${d.title ?? d.name} (${year(d.release_date ?? d.first_air_date)})`);
}

const games = todo.filter((r) => r.startsWith('igdb/'));
if (games.length) {
  const ids = games.map((r) => r.split('/')[1]);
  const rows = await igdb(`fields name,first_release_date,cover.image_id; where id = (${ids.join(',')}); limit ${ids.length};`);
  for (const ref of games) {
    const g = rows.find((x) => String(x.id) === ref.split('/')[1]);
    if (!g?.cover) throw new Error(`${ref} sem capa no IGDB`);
    await save(ref, `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${g.cover.image_id}.jpg`, `${g.name} (${year(g.first_release_date)})`);
  }
}

console.log(`media: ${todo.length} baixada(s), ${refs.size} referenciada(s) -> public/media/`);
