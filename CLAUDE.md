# CLAUDE.md, G2 Buzz (G2BuzzFeed)

> **Spec viva.** Porta de entrada lida pelo agente em toda sessão. Não duplica o [README.md](README.md), **aponta** pra ele. Atualize quando uma regra, comando, módulo ou hurdle mudar.
>
> **Última revisão:** 2026-11-10
> **Detalhes de features, quizzes, rodar e deploy:** [README.md](README.md)

---

## 1. O que é

Site estático de **quizzes autorais em PT-BR** (personalidade, trivia com explicação, isto ou aquilo, respostas em imagem) com card de resultado em PNG e "Meus resultados" local. Peça de portfólio de **Gustavo Martins Gripaldi**, linkada em https://g2portfolio.grovicdata.com/projetos/g2buzzfeed. Ao vivo: https://g2martins.github.io/G2BuzzFeed/. Marca visível **G2 Buzz** (repo continua G2BuzzFeed). Referência funcional: BuzzFeed (só o formato, nunca logo, cores, layout ou textos). Versão antiga (Angular 14) na tag `v1-angular14`.

## 2. Stack + Comandos

Angular 21.2 standalone + zoneless + signals, SSG (`outputMode: "static"`), `provideClientHydration(withEventReplay())`, Tailwind v4 (`@tailwindcss/postcss`), Geist/Geist Mono self-hosted, TS ~5.9, Node 22 (scripts `.ts` nativos). GitHub Pages em `main:/docs`, `baseHref` `/G2BuzzFeed/`.

```bash
npm start            # seo + ng serve (http://localhost:4430/G2BuzzFeed/)
npm run media        # TMDB/IGDB -> public/media/*.webp (Pillow); "-- --search ..." acha ids
npm run build        # seo (sitemap/robots) + ng build com prerender
npm run check        # smoke pós-build: dados e pontuação, SEO por página, créditos, zero travessão longo
npm run build:pages  # build + check + copia para docs/ (.nojekyll, 404.html, shell de /meus-resultados)
npm run og           # python scripts/og.py: card social do site + 1 por quiz + ícones PNG
```

## 3. Mapa de módulos

| Caminho | Responsabilidade |
|---|---|
| `src/app/data/quizzes.ts` | Fonte única: constantes do site, categorias, os 17 quizzes, `outcome()` (pontuação de personalidade, trivia e enquete), helpers (`mediaFile`, `hueOf`). Sem imports de runtime (scripts leem direto). |
| `src/app/data/glyphs.ts` | Glifos originais 24x24 (monumentos de Brasília, RPG, gêneros, viagem). Usados pela arte, pelo canvas do card e pelo OG. |
| `src/app/state.ts` | `Store`: último resultado por quiz e votos de enquete no `localStorage` (carrega só depois da hidratação). |
| `src/app/pages/` | `home`, `all` (/quizzes, busca), `category`, `quiz` (+`quiz.html`: intro, jogo, resultado) (prerender) · `results` (/meus-resultados), `not-found` (client). |
| `src/app/shared/` | `ui.ts` (`app-art` tile e `app-quiz-card`), `card.ts` (PNG 1080x1350 via canvas), `icon.ts` (+ marca), `seo.ts` (+ breadcrumb), `reveal.ts`. |
| `src/app/app.*` | Shell: barra de aviso, header com busca, nav de categorias, footer com créditos, toast/aria-live, menu mobile (`<dialog>`). Rotas e modos de render. |
| `public/media/`, `public/og/` | Pôsteres/capas baixados (`npm run media`) e cards sociais (`npm run og`). Commitados. |
| `scripts/` | `fetch-media.ts`, `seo.ts`, `check.ts`, `pages.ts`, `og.py` + `og.html` + `og-data.ts`. |
| `docs/` | Saída do build publicada. Nunca editar à mão. |

## 4. Regras SEMPRE-ATIVAS

- **Conteúdo só em `quizzes.ts`** (+ glifos em `glyphs.ts`). Nada de pergunta, resultado ou texto de quiz em componente.
- **Fatos de trivia verificados** (WebSearch quando houver dúvida) e explicados em `explain`. Nada de "mais vendido" ou recorde que muda com o tempo sem data.
- **Enquete e "Mais jogados" são simulados** e sempre rotulados assim na tela. Nunca apresentar como votos ou métricas reais.
- **Marca:** "G2 Buzz", nunca logo, badge vermelho/amarelo, layout ou texto do BuzzFeed. Footer mantém "Inspirado no formato de quizzes de sites de entretenimento. Sem afiliação com o BuzzFeed."
- **SSG:** toda página de conteúdo é pré-renderizada. APIs do browser só em `afterNextRender`, eventos ou `isPlatformBrowser`; `localStorage` e query params entram **depois** da hidratação.
- **Animação só `transform`/`opacity`**, com `prefers-reduced-motion`. Conteúdo visível sem JS (gate `.js` no `styles.css`). Nada de `opacity: 0` no elemento de LCP.
- **Design Valerium:** Geist + Geist Mono, eyebrow mono, card "well", ticks, dot grid, out-expo, papel claro + um acento cobalto; tiles pastel por categoria. Cores só pelos tokens de `:root` (o canvas e o OG repetem os mesmos hex).
- **Acessibilidade do quiz:** radios nativos em `fieldset/legend`, letras A a F e Enter, foco vai para a pergunta/resultado a cada passo, feedback em `aria-live`.
- **Zero travessão longo (U+2014)** em qualquer texto visível; usar ":", ",", "." ou "·". O `check` varre html/js/json do build.
- **Sem formulário de dados pessoais.** Só busca. Compartilhar = links simples (sem SDK).
- **Créditos** TMDB (frase oficial) e IGDB no footer de toda página.
- **`npm run build:pages` verde** antes de publicar. **`docs/` é build.**

## 5. Segurança

- Credenciais (TMDB, Twitch/IGDB) só em `.env` (gitignored; `.env.example` vazio versionado) ou nos `.env` dos irmãos Starplex/G2Store, lidas por `process.loadEnvFile` **dentro** de `scripts/fetch-media.ts`. Nunca logar token; em erro reportar só status HTTP. Shell não lê `.env` (hook bloqueia).
- O site publicado não usa nenhuma credencial: imagens já vêm prontas em `public/media/`.
- `localStorage` guarda só resultados e votos de demonstração; leitura com `try/catch` e validação de forma.
- Texto só via interpolação do Angular (escapado); nada de `innerHTML`. JSON-LD escapa `<`. Links externos com `rel="noopener noreferrer"`.

## 6. Common Hurdles

- **Node 22 `cpSync` sai com 127 em silêncio** no caminho com "Programação": `scripts/pages.ts` usa `cp` de `fs/promises`.
- **EBUSY** ao recriar `docs/` se um shell ou servidor estiver com cwd dentro dela.
- **Python e caminho não-ASCII:** argv chega corrompido. `og.py` usa `__file__` + `cwd`; `fetch-media.ts` chama o Pillow com caminho relativo e `cwd`.
- **Base `/G2BuzzFeed/`:** links relativos à base; `/meus-resultados/` ganha `docs/meus-resultados/index.html` (cópia de `index.csr.html`) e o resto cai no `404.html`, que sobe o app.
- **Classe `block` no `<app-art>`** derruba o `display: grid` do tile (utilitário vence componente) e descentraliza a arte. Dimensionar só com aspect/w/h.
- **Angular remove espaço entre tags** (`</strong> <span>`): texto corrido fica num único elemento.
- **Lighthouse local:** o Kaspersky injeta script e derruba boas práticas; rodar via Chromium do Playwright (`--remote-debugging-port` + `lighthouse --port`). Servidor local precisa de gzip e de 404 fora da base (senão o robots.txt "existe" e falha).
- **Print de página inteira** fica vazio abaixo da dobra (`content-visibility` + reveal): rolar e tirar print da viewport.
- **Scratchpad compartilhado** entre agentes paralelos: usar subpasta própria para servidor/scripts de QA.
- **Links internos sempre com barra no fim** (`/filmes/x/`): o GitHub Pages responde `/x` com 301. O `TrailingSlashSerializer` (`src/app/shared/trailing-slash.ts`, registrado em `app.config.ts`) cuida disso no router.
