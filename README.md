# G2 Buzz (G2BuzzFeed)

Site estático de **quizzes autorais em português**, feito como peça de portfólio por [Gustavo Martins Gripaldi](https://g2portfolio.grovicdata.com).
Quizzes de personalidade, trivia com explicação em cada resposta, enquetes de isto ou aquilo e grades de resposta com imagem. O resultado vira um card PNG para baixar e compartilhar.

**Ao vivo:** https://g2martins.github.io/G2BuzzFeed/ · **No portfólio:** https://g2portfolio.grovicdata.com/projetos/g2buzzfeed

> Inspirado no formato de quizzes de sites de entretenimento. Sem afiliação com o BuzzFeed. A marca visível é **G2 Buzz**; o nome do repositório continua G2BuzzFeed.

## O que tem

- **17 quizzes originais** em 6 categorias (Games, Filmes & Séries, Tecnologia & Dev, Brasil & Brasília, Cultura pop, Curiosidades): 10 de personalidade, 5 de trivia e 2 de isto ou aquilo. Cinco deles são versões refeitas dos quizzes da primeira versão (herói ou vilão, terror, classe de RPG, Java e estilo de viagem).
- **Página do quiz** (`/quiz/:slug`): introdução pré-renderizada, uma pergunta por vez com barra de progresso, transição suave, teclado (A a F escolhem, Enter avança) e foco anunciado para leitor de tela. Personalidade permite voltar; trivia confirma, mostra certo/errado e explica; isto ou aquilo revela a distribuição **simulada** (rotulada como tal).
- **Resultado** com imagem, descrição, divisão das respostas (personalidade), revisão das respostas (trivia), Refazer, links de compartilhamento (WhatsApp, X, Facebook, Telegram, copiar link, compartilhar nativo) e **card PNG 1080x1350 gerado no navegador** (canvas).
- **Meus resultados** (`/meus-resultados`): último resultado de cada quiz, partidas e acerto médio na trivia, tudo no `localStorage`. Sem conta, sem formulário, sem coleta de dados pessoais.
- **Home** com quiz em destaque, Em alta, isto ou aquilo rápido, categorias, Mais jogados (ranking com números simulados, rotulado) e como funciona.
- **Categorias** (`/categoria/:slug`) e **busca** (`/quizzes?q=`) que procura em títulos, resultados (Python, Sephiroth...) e respostas, com filtros por tipo e categoria na URL.
- **Imagens**: pôsteres do TMDB e capas do IGDB baixados no build para `public/media/` (WebP, mesma origem, o canvas do card não fica "tainted"). Os outros quizzes usam glifos e ilustrações próprias (monumentos de Brasília, kit de RPG, viagem).
- **SEO**: todas as páginas de conteúdo pré-renderizadas, title/description/canonical por rota, imagem social por quiz, JSON-LD `WebSite`, `Quiz` (trivia) ou `CreativeWork`, `BreadcrumbList` e `CollectionPage`, sitemap e robots gerados.
- **Lighthouse mobile local**: performance 92 a 100, acessibilidade, boas práticas e SEO 100.

## Quizzes

| Quiz | Tipo | Categoria |
|---|---|---|
| Qual linguagem de programação combina com você? | Personalidade | Tecnologia & Dev |
| Que tipo de engenheiro de dados você é? | Personalidade | Tecnologia & Dev |
| Java na prática: você passa no teste? | Trivia | Tecnologia & Dev |
| Isto ou aquilo: edição dev | Isto ou aquilo | Tecnologia & Dev |
| Qual cartão-postal de Brasília combina com você? | Personalidade | Brasil & Brasília |
| Brasília em 10 perguntas: você conhece a capital? | Trivia | Brasil & Brasília |
| Isto ou aquilo: edição Brasil | Isto ou aquilo | Brasil & Brasília |
| Qual vilão de game você seria? | Personalidade (capas IGDB) | Games |
| Trivia de games: só quem jogou acerta | Trivia (capas IGDB) | Games |
| Qual classe de RPG você seria? | Personalidade (respostas em imagem) | Games |
| Qual ícone do terror você seria? | Personalidade (pôsteres TMDB) | Filmes & Séries |
| Monte sua maratona e descubra seu gênero de cinema | Personalidade (grade de pôsteres) | Filmes & Séries |
| Quanto você sabe de cinema brasileiro? | Trivia (pôsteres TMDB) | Filmes & Séries |
| Qual personagem da Pixar você seria? | Personalidade (pôsteres TMDB) | Cultura pop |
| Você seria herói, vilão ou anti-herói? | Personalidade | Cultura pop |
| Verdade ou mentira: curiosidades que parecem inventadas | Trivia | Curiosidades |
| Qual é o seu estilo de viagem? | Personalidade (respostas em imagem) | Curiosidades |

## Stack

Angular 21 (standalone, zoneless, signals) com SSG (`outputMode: "static"`) e hidratação com event replay · Tailwind CSS v4 · TypeScript 5.9 · Geist e Geist Mono self-hosted · scripts em Node 22 com TypeScript nativo · Python (Playwright e Pillow) para imagens. Linguagem visual baseada no design system Valerium da Grovic Data.

## Rodar

```bash
npm install
npm start            # http://localhost:4430/G2BuzzFeed/
npm run build:pages  # build + checagem + publica em docs/
```

## Imagens (TMDB e IGDB)

`npm run media` baixa para `public/media/` todo pôster ou capa referenciado em `src/app/data/quizzes.ts` (`tmdb/movie/<id>`, `igdb/<id>`) e converte para WebP com Pillow (`pip install pillow`). Credenciais: `.env` local (veja `.env.example`) ou, se ele não existir, `../Starplex/.env` (`TMDB_TOKEN`) e `../G2Store/.env` (`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`). Para achar ids: `npm run media -- --search "tmdb:Halloween 1978|igdb:Portal|igdb:#71,20"`. Arquivos já baixados são pulados (`-- --force` baixa de novo).

`npm run og` (Python + Playwright) gera `public/og/g2buzz.png`, um card social por quiz (`public/og/<slug>.jpg`) e os ícones PNG a partir de `scripts/og.html`.

## Estrutura

```
src/app/data/       quizzes.ts (constantes, categorias, quizzes e pontuação) · glyphs.ts (ilustrações em linha)
src/app/pages/      home, all (busca), category, quiz (+ quiz.html), results, not-found
src/app/shared/     ui.ts (arte e card de quiz), card.ts (PNG do resultado), icon.ts, seo.ts, reveal.ts
src/app/state.ts    resultados e votos (signals + localStorage)
scripts/            fetch-media.ts, seo.ts, check.ts, pages.ts, og.py + og.html + og-data.ts
docs/               saída do build (GitHub Pages), não editar à mão
```

## Deploy

GitHub Pages servindo `main:/docs` com base `/G2BuzzFeed/`. `npm run build:pages` gera o build, roda `npm run check` (dados e pontuação de cada quiz, SEO de cada página, créditos, arquivos obrigatórios, nenhum travessão longo) e copia para `docs/` com `.nojekyll`, `404.html` e o atalho de `/meus-resultados/`. A versão anterior (Angular 14) está na tag `v1-angular14`.

## Avisos

Pôsteres de filmes: [TMDB](https://www.themoviedb.org). Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Capas de jogos: [IGDB.com](https://www.igdb.com). Marcas, pôsteres e capas pertencem aos respectivos donos. Perguntas, textos, glifos e ilustrações são originais. Inspirado no formato de quizzes de sites de entretenimento, sem afiliação com o BuzzFeed. As distribuições de isto ou aquilo e os números de "Mais jogados" são simulados.
