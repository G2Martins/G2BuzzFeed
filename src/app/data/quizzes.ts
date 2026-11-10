// Single source of truth: site constants, categories, every quiz and the scoring rules. No runtime imports,
// so scripts/ (seo, check, fetch-media, og) read it directly with Node's native type stripping.

export const SITE_URL = 'https://g2martins.github.io/G2BuzzFeed';
export const SITE_NAME = 'G2 Buzz';
export const AUTHOR = 'Gustavo Martins Gripaldi';
// Trailing slashes: the portfolio is on GitHub Pages, where /path answers with a 301 to /path/.
export const PORTFOLIO_URL = 'https://g2portfolio.grovicdata.com/';
export const PROJECT_URL = `${PORTFOLIO_URL}projetos/g2buzzfeed/`;
export const REPO_URL = 'https://github.com/G2Martins/G2BuzzFeed';
export const OG_IMAGE = '/og/g2buzz.png';

/** Picture for covers, answers and results: posters/covers ("tmdb/movie/948", "igdb/1020"), a glyph
 *  from glyphs.ts, or a short typographic tile. `hue` overrides the category colour. */
export interface Art { img?: string[]; g?: string; t?: string; hue?: string }
export type QuizType = 'personalidade' | 'trivia' | 'enquete';

export interface Option {
  label: string;
  art?: Art;
  /** Personality only: result keys this answer counts for, space separated. */
  to?: string;
}
export interface Question {
  q: string;
  /** Monospace snippet shown under the question (trivia de código). */
  code?: string;
  art?: Art;
  options: Option[];
  /** Trivia: index of the right option, plus the explanation shown after answering. */
  answer?: number;
  explain?: string;
  /** Enquete: simulated share (%) of the first option. Never real votes. */
  sim?: number;
}
export interface Result {
  key: string;
  title: string;
  text: string;
  art?: Art;
  /** Trivia / enquete tiers: minimum score for this result. */
  min?: number;
  /** Where the character comes from, e.g. "Halloween (1978)". */
  source?: string;
}
export interface Quiz {
  slug: string;
  title: string;
  /** Short line for cards and the intro. */
  description: string;
  /** Meta description (70 to 160 chars). */
  seo: string;
  category: CategorySlug;
  type: QuizType;
  art: Art;
  /** Static, simulated play count for the "Mais jogados" ranking. */
  plays: number;
  questions: Question[];
  results: Result[];
}

export type CategorySlug = 'games' | 'filmes-e-series' | 'tecnologia-e-dev' | 'brasil-e-brasilia' | 'cultura-pop' | 'curiosidades';
export interface Category { slug: CategorySlug; label: string; hue: string; g: string; blurb: string }

export const CATEGORIES: Category[] = [
  { slug: 'games', label: 'Games', hue: '#cbbcff', g: 'gamepad', blurb: 'Vilões, classes de RPG e trivia para quem cresceu com controle na mão.' },
  { slug: 'filmes-e-series', label: 'Filmes & Séries', hue: '#ffb9a6', g: 'clapper', blurb: 'Pôsteres, ícones do terror e cinema brasileiro para testar seu repertório.' },
  { slug: 'tecnologia-e-dev', label: 'Tecnologia & Dev', hue: '#a3e9c9', g: 'terminal', blurb: 'Linguagens, engenharia de dados e Java na prática, sem enrolação.' },
  { slug: 'brasil-e-brasilia', label: 'Brasil & Brasília', hue: '#ffdc7a', g: 'congresso', blurb: 'A capital em perguntas, cartões-postais e os eternos dilemas nacionais.' },
  { slug: 'cultura-pop', label: 'Cultura pop', hue: '#ffbddf', g: 'star', blurb: 'Personagens, heróis, vilões e tudo que vira assunto no grupo de amigos.' },
  { slug: 'curiosidades', label: 'Curiosidades', hue: '#aedcff', g: 'bulb', blurb: 'Verdade ou mentira, estilos de viagem e fatos que parecem inventados.' },
];

export const TYPE_LABEL: Record<QuizType, string> = { personalidade: 'Personalidade', trivia: 'Trivia', enquete: 'Isto ou aquilo' };

// ---------- Quizzes ----------
const o = (label: string, to?: string, art?: Art): Option => ({ label, to, art });
const tf = () => [o('Verdade'), o('Mentira')];

export const QUIZZES: Quiz[] = [
  // ===== Tecnologia & Dev =====
  {
    slug: 'qual-linguagem-de-programacao-combina-com-voce',
    title: 'Qual linguagem de programação combina com você?',
    description: 'Oito perguntas sobre como você pensa, trabalha e resolve problemas. No fim, uma linguagem com a sua cara.',
    seo: 'Quiz de personalidade para devs: responda 8 perguntas sobre seu jeito de trabalhar e descubra se você é Python, JavaScript, Rust, Go, Java ou SQL.',
    category: 'tecnologia-e-dev',
    type: 'personalidade',
    art: { t: '</>' },
    plays: 48210,
    questions: [
      { q: 'Segunda-feira, 9h. Qual é o seu primeiro movimento?', options: [o('Abro uma lista e organizo a semana inteira', 'java'), o('Escrevo um script para automatizar a lista', 'python'), o('Pego a tarefa mais visível e mando ver', 'javascript'), o('Leio tudo com calma antes de tocar em qualquer coisa', 'rust'), o('Confiro os números da semana passada', 'sql'), o('Resolvo primeiro o que está travando o time', 'go')] },
      { q: 'Um bug apareceu em produção. Como você reage?', options: [o('Escrevo um teste que reproduz o erro antes de corrigir', 'rust'), o('Abro o console e vou testando até achar', 'javascript'), o('Vou direto nos logs e nas métricas', 'go'), o('Consulto o banco para ver quais registros estão estranhos', 'sql')] },
      { q: 'Qual ambiente de trabalho é o seu sonho?', options: [o('Laboratório de pesquisa cheio de dados e gráficos', 'python'), o('Startup que muda de direção toda semana', 'javascript'), o('Empresa grande, com processo e estabilidade', 'java'), o('Time pequeno cuidando de uma infraestrutura que não pode cair', 'go')] },
      { q: 'Escolha um superpoder de programador:', options: [o('Nunca mais ter vazamento de memória', 'rust'), o('Ler qualquer tabela e entender o negócio por trás dela', 'sql'), o('Prototipar uma ideia inteira em uma tarde', 'python javascript'), o('Desenhar um sistema que dura dez anos', 'java')] },
      { q: 'Como você prefere aprender algo novo?', options: [o('Documentação oficial do começo ao fim', 'rust java'), o('Tutorial em vídeo e mão na massa', 'javascript'), o('Um notebook com exemplos rodando', 'python'), o('Um exemplo mínimo que funcione, e pronto', 'go')] },
      { q: 'Seu código ideal é...', options: [o('Curto e legível como uma frase', 'python'), o('Explícito, sem mágica escondida', 'go'), o('Seguro, mesmo que demore mais para compilar', 'rust'), o('Declarativo: digo o que quero, não como', 'sql')] },
      { q: 'Num projeto em grupo, você é a pessoa que...', options: [o('Define a estrutura e as convenções', 'java'), o('Faz a demo funcionar na véspera', 'javascript'), o('Responde “depende dos dados”', 'sql'), o('Simplifica o que os outros complicaram', 'go')] },
      { q: 'Qual frase você diria sem pensar duas vezes?', options: [o('Tem uma biblioteca para isso', 'python'), o('Funciona na minha máquina', 'javascript'), o('O compilador tem razão', 'rust'), o('SELECT * não, por favor', 'sql'), o('Um bom padrão de projeto resolve', 'java'), o('Menos é mais', 'go')] },
    ],
    results: [
      { key: 'python', title: 'Python', art: { t: '.py', hue: '#b9d3ff' }, text: 'Você gosta de clareza e de resolver o problema sem cerimônia. Lê documentação por prazer, automatiza o que se repete duas vezes e acha que código bom é código que qualquer pessoa entende. Versátil, vai de scripts a ciência de dados sem drama.' },
      { key: 'javascript', title: 'JavaScript', art: { t: '.js', hue: '#ffe680' }, text: 'Rápido, adaptável e sem medo de mudar de ideia (ou de framework). Você gosta de ver resultado na tela na hora e aprende fazendo. Às vezes é caótico, mas está em todo lugar e todo mundo depende de você.' },
      { key: 'rust', title: 'Rust', art: { t: '.rs', hue: '#ffc3a3' }, text: 'Perfeccionista no bom sentido: prefere pensar antes de rodar e não aceita erro silencioso. Tem paciência de monge com o compilador e zero paciência com gambiarra. Quando você entrega, ninguém precisa voltar para consertar.' },
      { key: 'go', title: 'Go', art: { t: '.go', hue: '#a8ecf0' }, text: 'Pragmático até o osso. Você gosta de ferramentas simples, times que se entendem e sistemas que aguentam o tranco. Menos recurso, mais entrega. Seu lema: se dá para fazer simples, por que complicar?' },
      { key: 'java', title: 'Java', art: { t: '.java', hue: '#ffb9b3' }, text: 'Organizado, confiável e com um plano para tudo. Você pensa em arquitetura, gosta de padrões e sabe que um sistema grande precisa de estrutura para durar anos. Tem gente que acha verboso; você chama de explícito.' },
      { key: 'sql', title: 'SQL', art: { t: '.sql', hue: '#d7c7ff' }, text: 'Você enxerga o mundo em tabelas e relações. Gosta de perguntar o que os dados dizem antes de opinar, e um JOIN bem feito te dá mais satisfação que muita série. Discreto, mas sem você nada funciona.' },
    ],
  },
  {
    slug: 'que-tipo-de-engenheiro-de-dados-voce-e',
    title: 'Que tipo de engenheiro de dados você é?',
    description: 'Pipelines, qualidade, streaming ou reunião com o negócio? Sete situações do dia a dia para descobrir o seu perfil.',
    seo: 'Quiz de personalidade para quem trabalha com dados: arquiteto do lakehouse, guardião da qualidade, velocista do streaming, maestro da orquestração ou tradutor do negócio.',
    category: 'tecnologia-e-dev',
    type: 'personalidade',
    art: { g: 'flow' },
    plays: 21480,
    questions: [
      { q: 'Chegou um pedido: “preciso de um relatório de vendas”. Sua primeira pergunta é...', options: [o('Qual decisão você quer tomar com esse número?', 'tradutor'), o('De onde vêm esses dados e quem é o dono?', 'arquiteto'), o('Com que frequência isso precisa atualizar?', 'velocista'), o('Como a gente garante que o total bate com o financeiro?', 'guardiao')] },
      { q: 'Qual ferramenta você levaria para uma ilha deserta?', options: [o('Um orquestrador de pipelines, como Airflow ou Dagster', 'maestro'), o('Uma fila de eventos, como Kafka', 'velocista'), o('Um framework de testes de dados', 'guardiao'), o('dbt e um bom editor de SQL', 'tradutor arquiteto')] },
      { q: 'A pipeline falhou às 3h da manhã. O que mais te incomoda?', options: [o('Ninguém ter sido avisado a tempo', 'maestro'), o('O dado errado pode ter chegado ao dashboard', 'guardiao'), o('Os eventos atrasaram e o painel ao vivo parou', 'velocista'), o('A falha mostra um ponto fraco no desenho da arquitetura', 'arquiteto')] },
      { q: 'Seu tipo de reunião favorita é...', options: [o('Desenho de arquitetura no quadro branco', 'arquiteto'), o('Definição de métricas com a área de negócio', 'tradutor'), o('Post-mortem com plano de ação claro', 'guardiao maestro'), o('Nenhuma: prefiro ver o fluxo rodando', 'velocista')] },
      { q: 'Qual destas frases é mais a sua cara?', options: [o('Se não tem teste, não está pronto', 'guardiao'), o('Se roda duas vezes, vira tarefa agendada', 'maestro'), o('Se demora mais de um segundo, dá para melhorar', 'velocista'), o('Se ninguém usa, não serviu para nada', 'tradutor'), o('Se não tem padrão, vira bagunça', 'arquiteto')] },
      { q: 'Escolha um formato de arquivo:', options: [o('Parquet, com particionamento bem pensado', 'arquiteto'), o('Avro, com schema registry', 'velocista'), o('CSV, com validação de cada coluna', 'guardiao'), o('Uma planilha que a diretoria entende', 'tradutor'), o('O YAML de configuração das DAGs', 'maestro')] },
      { q: 'Uma pessoa nova entrou no time. Você mostra primeiro...', options: [o('O mapa das camadas e das fontes de dados', 'arquiteto'), o('O painel de alertas e de qualidade', 'guardiao'), o('O fluxo de eventos ao vivo', 'velocista'), o('A lista de DAGs e como reprocessar', 'maestro'), o('O glossário de métricas do negócio', 'tradutor')] },
    ],
    results: [
      { key: 'arquiteto', title: 'O Arquiteto do Lakehouse', art: { g: 'layers', hue: '#b9d3ff' }, text: 'Você pensa em camadas antes de pensar em código: bronze, prata, ouro. Gosta de modelagem, de contratos de dados e de decisões que façam sentido daqui a três anos. Quando alguém pergunta onde fica um dado, a resposta está no seu diagrama.' },
      { key: 'guardiao', title: 'O Guardião da Qualidade', art: { g: 'shield', hue: '#a3e9c9' }, text: 'Nenhum número chega ao dashboard sem passar por você. Testes, validações, alertas de nulos e duplicados: você sabe que confiança se constrói linha a linha. Seu maior orgulho é o incidente que nunca aconteceu.' },
      { key: 'velocista', title: 'O Velocista do Streaming', art: { g: 'bolt', hue: '#ffe680' }, text: 'Carga noturna é pouco para você. Eventos, filas, janelas de tempo e latência baixa são o seu habitat. Você gosta de ver os dados chegando ao vivo e se diverte com o desafio de não perder nenhuma mensagem.' },
      { key: 'maestro', title: 'O Maestro da Orquestração', art: { g: 'flow', hue: '#d7c7ff' }, text: 'DAGs, dependências, retentativas e agendas: você rege a pipeline como uma orquestra. Odeia tarefa manual e transforma qualquer rotina em fluxo automatizado, com log bonito e alerta no lugar certo.' },
      { key: 'tradutor', title: 'O Tradutor do Negócio', art: { g: 'chat', hue: '#ffc3a3' }, text: 'Você é a ponte entre a tabela e a reunião. Entende o que a diretoria quer saber, traduz em métrica e entrega um modelo que o time de BI usa sem precisar te chamar. SQL e conversa são suas duas línguas nativas.' },
    ],
  },
  {
    slug: 'java-na-pratica',
    title: 'Java na prática: você passa no teste?',
    description: 'Oito perguntas de código, do identificador inválido ao operador de deslocamento. Cada resposta vem explicada.',
    seo: 'Trivia de Java com explicação em cada resposta: identificadores, tipos primitivos, literais float e double, operadores bit a bit, String e Javadoc.',
    category: 'tecnologia-e-dev',
    type: 'trivia',
    art: { g: 'cup' },
    plays: 30950,
    questions: [
      { q: 'O que há de errado nesta declaração?', code: 'int 1stNumber = 23;', options: [o('Nada, ela é válida'), o('Um identificador não pode começar com número'), o('Identificadores não podem ter números'), o('Falta declarar como long')], answer: 1, explain: 'Identificadores em Java podem ter dígitos, mas não podem começar por eles. firstNumber ou number1 seriam válidos.' },
      { q: 'Quais destas declarações NÃO compilam?', code: 'a. float mySalary = 3500.77;\nb. int my1stSalary = 2300;\nc. double salaryOne = 3450.0f;\nd. double salary(1);', options: [o('Só c e d'), o('Só a e d'), o('Só b'), o('Todas compilam')], answer: 1, explain: '3500.77 é um literal double, e guardar double em float exige o sufixo f ou um cast. Já 3450.0f é float e vira double sem perda. E double salary(1); simplesmente não é sintaxe Java.' },
      { q: 'Qual é o menor tipo inteiro primitivo capaz de guardar o número 234.460.000?', options: [o('byte'), o('short'), o('int'), o('long')], answer: 2, explain: 'int tem 32 bits e vai até 2.147.483.647, então 234 milhões cabe com folga. short para em 32.767, e long (64 bits) seria desperdício aqui.' },
      { q: 'O que este trecho imprime?', code: 'int x = -4;\nSystem.out.println(x >> 1);\nint y = 4;\nSystem.out.println(y >> 1);', options: [o('-2 e 2'), o('-2 e -2'), o('2147483646 e 2'), o('Erro de compilação')], answer: 0, explain: '>> é o deslocamento aritmético e preserva o sinal: -4 >> 1 dá -2 e 4 >> 1 dá 2. Quem ignora o sinal é o >>>, que transformaria -4 em 2147483646.' },
      { q: 'Para que serve o parâmetro do main?', code: 'public static void main(String[] args) { }', options: [o('Receber argumentos na hora da compilação'), o('Receber os argumentos passados ao rodar o programa'), o('Contar as palavras do código'), o('Nada, é só uma exigência da linguagem')], answer: 1, explain: 'Ao rodar java App a b, args vale {"a", "b"}. O nome args é só convenção; o que importa é o tipo String[].' },
      { q: 'Qual é o formato de um comentário de documentação (Javadoc)?', options: [o('/* ... */'), o('/** ... */'), o('// ...'), o('<!-- ... -->')], answer: 1, explain: 'A ferramenta javadoc lê blocos que começam com /** e terminam com */. O /* comum é ignorado por ela.' },
      { q: 'O que esta comparação retorna?', code: '"java" == new String("java")', options: [o('true'), o('false'), o('Erro de compilação'), o('Depende da JVM')], answer: 1, explain: '== compara referências, e new String sempre cria outro objeto. Para comparar o conteúdo, use equals(), que daria true.' },
      { q: 'Qual destas palavras NÃO é reservada em Java?', options: [o('goto'), o('const'), o('then'), o('strictfp')], answer: 2, explain: 'goto e const são reservadas mesmo sem uso, e strictfp é um modificador. then não existe em Java: o if usa só a condição e o bloco.' },
    ],
    results: [
      { key: 'revisar', min: 0, title: 'Hora de revisar o básico', art: { g: 'sprout' }, text: 'Java tem suas pegadinhas, e várias delas apareceram aqui. Leia as explicações com calma, abra uma IDE e teste cada exemplo: em pouco tempo isso vira intuição.' },
      { key: 'caminho', min: 4, title: 'No caminho certo', art: { g: 'target' }, text: 'Você domina boa parte do básico e já tropeçou menos que a média. Falta só afiar os detalhes de tipos e operadores para virar referência no time.' },
      { key: 'respeito', min: 6, title: 'Dev Java de respeito', art: { g: 'trophy' }, text: 'Você conhece a linguagem de verdade, inclusive as partes que pegam muita gente em entrevista. Pouca coisa passaria pelo seu code review.' },
      { key: 'compilador', min: 8, title: 'Compilador humano', art: { g: 'crown' }, text: 'Oito de oito. Você lê código Java como quem lê um cardápio e ainda explica o porquê de cada resposta. Respeito.' },
    ],
  },
  {
    slug: 'isto-ou-aquilo-edicao-dev',
    title: 'Isto ou aquilo: edição dev',
    description: 'Tabs ou espaços, tema escuro ou claro, deploy na sexta? Escolha um lado e compare com a turma.',
    seo: 'Enquete isto ou aquilo para devs: tabs ou espaços, tema escuro ou claro, remoto ou escritório. Compare suas escolhas com uma distribuição simulada.',
    category: 'tecnologia-e-dev',
    type: 'enquete',
    art: { g: 'split' },
    plays: 39870,
    questions: [
      { q: 'Tabs ou espaços?', sim: 46, options: [o('Tabs'), o('Espaços')] },
      { q: 'Tema escuro ou tema claro?', sim: 81, options: [o('Tema escuro'), o('Tema claro')] },
      { q: 'Trabalho remoto ou escritório?', sim: 74, options: [o('Remoto'), o('Escritório')] },
      { q: 'Café ou chá?', sim: 77, options: [o('Café'), o('Chá')] },
      { q: 'Teclado mecânico ou de membrana?', sim: 58, options: [o('Mecânico'), o('Membrana')] },
      { q: 'Documentação: antes ou depois?', sim: 37, options: [o('Escrevo antes de codar'), o('Documento depois (talvez)')] },
      { q: 'console.log ou debugger?', sim: 63, options: [o('console.log'), o('Debugger com breakpoint')] },
      { q: 'Monólito bem feito ou microsserviços?', sim: 55, options: [o('Monólito bem feito'), o('Microsserviços')] },
      { q: 'Deploy na sexta-feira?', sim: 18, options: [o('Sim, confio nos testes'), o('Nunca')] },
    ],
    results: [
      { key: 'contra', min: 0, title: 'Do contra assumido', art: { g: 'flame' }, text: 'Você discordou da maioria simulada em quase tudo. Gosto próprio, opinião forte e zero medo de ser minoria no code review.' },
      { key: 'equilibrio', min: 4, title: 'Equilíbrio de sênior', art: { g: 'split' }, text: 'Metade das suas escolhas segue a maioria, metade não. Você escolhe a ferramenta pelo contexto, e não pela moda.' },
      { key: 'time', min: 7, title: 'A cara do time', art: { g: 'chat' }, text: 'Você pensa igual à maioria simulada em quase tudo. Nunca vai causar treta no canal geral, e provavelmente já usa tema escuro.' },
    ],
  },
  // ===== Brasil & Brasília =====
  {
    slug: 'qual-cartao-postal-de-brasilia-combina-com-voce',
    title: 'Qual cartão-postal de Brasília combina com você?',
    description: 'Do Congresso ao Lago Paranoá: sete perguntas para descobrir qual símbolo da capital tem o seu jeito.',
    seo: 'Quiz de personalidade sobre Brasília: descubra se você é o Congresso Nacional, a Catedral, a Ponte JK, a Torre de TV, o Lago Paranoá ou o Parque da Cidade.',
    category: 'brasil-e-brasilia',
    type: 'personalidade',
    art: { g: 'catedral' },
    plays: 27330,
    questions: [
      { q: 'Sábado de sol em Brasília. Qual é o plano?', options: [o('Feira da Torre e pastel', 'torre'), o('Stand up paddle no lago', 'lago'), o('Pedalar no Parque da Cidade', 'parque'), o('Visitar os prédios do Eixo Monumental', 'catedral congresso'), o('Atravessar a Ponte JK no fim da tarde', 'ponte')] },
      { q: 'Como você lida com um conflito?', options: [o('Debato até chegar a um acordo', 'congresso'), o('Escuto, penso e só depois falo', 'catedral'), o('Procuro o meio-termo que une todo mundo', 'ponte'), o('Saio para correr e volto mais calmo', 'parque'), o('Vou para a beira da água e deixo passar', 'lago')] },
      { q: 'Escolha uma trilha sonora para atravessar o Eixão:', options: [o('Rock de Brasília dos anos 80', 'torre'), o('Música ambiente e fone com cancelamento de ruído', 'catedral'), o('Um podcast sobre o que está acontecendo no país', 'congresso'), o('Bossa nova olhando o lago', 'lago'), o('Playlist animada para treinar', 'parque')] },
      { q: 'Qual comida não pode faltar?', options: [o('Pastel de feira com caldo de cana', 'torre'), o('Peixe num restaurante da orla', 'lago'), o('Açaí depois do treino', 'parque'), o('Um café demorado num lugar bonito', 'catedral ponte'), o('Marmita, porque o dia é cheio de reunião', 'congresso')] },
      { q: 'Seu ponto forte numa equipe:', options: [o('Liderar e representar o grupo', 'congresso'), o('Inspirar com ideias criativas', 'catedral'), o('Juntar áreas que não se falam', 'ponte'), o('Manter o clima leve e todo mundo junto', 'torre'), o('Puxar o time para se mexer', 'parque')] },
      { q: 'Que horário do dia é a sua cara?', options: [o('Amanhecer, com o céu limpo do Planalto', 'parque'), o('Meio-dia, no auge da agenda', 'congresso'), o('Fim de tarde, com o pôr do sol no lago', 'lago ponte'), o('Noite, com a cidade iluminada', 'catedral torre')] },
      { q: 'Se você fosse um traço do plano de Lúcio Costa, seria...', options: [o('O Eixo Monumental, imponente', 'congresso'), o('Uma superquadra arborizada', 'parque'), o('A orla do lago', 'lago'), o('O cruzamento dos eixos, onde todo mundo se encontra', 'torre ponte'), o('Um ponto de silêncio no meio da cidade', 'catedral')] },
    ],
    results: [
      { key: 'congresso', title: 'Congresso Nacional', art: { g: 'congresso', hue: '#b9d3ff' }, text: 'Você gosta de um bom debate, tem opinião sobre tudo e sabe negociar. As duas torres e as cúpulas de Niemeyer combinam com quem enxerga os dois lados antes de decidir.' },
      { key: 'catedral', title: 'Catedral de Brasília', art: { g: 'catedral', hue: '#d7c7ff' }, text: 'Contemplativo e cheio de luz por dentro. Você presta atenção nos detalhes, curte silêncio e tem um jeito de transformar o simples em impressionante, como as colunas curvas e os vitrais da Catedral.' },
      { key: 'ponte', title: 'Ponte JK', art: { g: 'ponte', hue: '#a8ecf0' }, text: 'Você conecta pessoas e ideias. Moderno, curioso e sempre a caminho de algum lugar, tem o charme dos três arcos que cruzam o Lago Paranoá e rendem a foto mais bonita do fim de tarde.' },
      { key: 'torre', title: 'Torre de TV', art: { g: 'torre', hue: '#ffc3a3' }, text: 'Sociável e ponto de encontro da turma. Você ama uma feira no fim de semana, um pastel com caldo de cana e uma vista da cidade lá de cima. Todo mundo sabe onde te achar.' },
      { key: 'lago', title: 'Lago Paranoá', art: { g: 'veleiro', hue: '#aedcff' }, text: 'Seu ritmo é de pôr do sol. Você gosta de água, de esporte ao ar livre e de desacelerar sem culpa. O plano perfeito é um stand up paddle e uma conversa sem pressa na beira do lago.' },
      { key: 'parque', title: 'Parque da Cidade', art: { g: 'tree', hue: '#a3e9c9' }, text: 'Energia lá em cima e agenda cheia de movimento. Corrida de manhã, bicicleta à tarde, piquenique com os amigos no domingo. Você transforma qualquer espaço verde em programa.' },
    ],
  },
  {
    slug: 'brasilia-em-10-perguntas',
    title: 'Brasília em 10 perguntas: você conhece a capital?',
    description: 'Inauguração, Lúcio Costa, Catedral, Ponte JK e Lago Paranoá. Dez perguntas para provar que você é candango de verdade.',
    seo: 'Trivia sobre Brasília com explicação: inauguração em 1960, plano piloto de Lúcio Costa, Catedral, Ponte JK, Lago Paranoá, Athos Bulcão e Patrimônio Mundial.',
    category: 'brasil-e-brasilia',
    type: 'trivia',
    art: { g: 'ponte' },
    plays: 33940,
    questions: [
      { q: 'Em que data Brasília foi inaugurada?', options: [o('7 de setembro de 1960'), o('21 de abril de 1960'), o('15 de novembro de 1959'), o('21 de abril de 1970')], answer: 1, explain: 'A inauguração foi em 21 de abril de 1960, no governo de Juscelino Kubitschek. A data coincide com o feriado de Tiradentes.' },
      { q: 'Quem fez o projeto urbanístico do Plano Piloto?', options: [o('Oscar Niemeyer'), o('Lúcio Costa'), o('Roberto Burle Marx'), o('Athos Bulcão')], answer: 1, explain: 'Lúcio Costa venceu o concurso do plano piloto em 1957. Niemeyer assinou os principais prédios, Burle Marx fez jardins e Athos Bulcão criou azulejos e painéis.' },
      { q: 'O desenho do Plano Piloto costuma ser comparado com...', options: [o('Uma estrela'), o('Um avião, ou um pássaro'), o('Um círculo'), o('Uma ferradura')], answer: 1, explain: 'O desenho nasce do cruzamento de dois eixos, com o Eixo Rodoviário curvado. Lúcio Costa falava no sinal da cruz, mas o apelido de avião pegou.' },
      { q: 'Quantos pilares curvos formam a estrutura da Catedral de Brasília?', options: [o('8'), o('12'), o('16'), o('24')], answer: 2, explain: 'São 16 pilares de concreto em forma de hiperboloide, com cerca de 90 toneladas cada. A Catedral foi inaugurada em 1970.' },
      { q: 'O Lago Paranoá é...', options: [o('Natural, já existia antes da cidade'), o('Artificial, criado com uma barragem no rio Paranoá'), o('Um braço do rio São Francisco'), o('Um reservatório subterrâneo')], answer: 1, explain: 'O lago é artificial: nasceu do represamento do rio Paranoá em 1959, durante a construção da capital, para amenizar o clima seco, gerar energia e oferecer lazer.' },
      { q: 'Quantos arcos tem a Ponte JK?', options: [o('Um'), o('Dois'), o('Três'), o('Quatro')], answer: 2, explain: 'São três arcos de aço assimétricos que cruzam a pista em diagonal. Projetada por Alexandre Chan, a ponte foi inaugurada em dezembro de 2002 e ganhou a medalha Gustav Lindenthal, um prêmio internacional de engenharia de pontes.' },
      { q: 'Em que ano Brasília virou Patrimônio Mundial da UNESCO?', options: [o('1960'), o('1987'), o('2000'), o('2010')], answer: 1, explain: 'Brasília entrou na lista em 1987, pelo seu conjunto urbanístico e arquitetônico.' },
      { q: 'Quem foi o presidente que construiu Brasília?', options: [o('Getúlio Vargas'), o('Juscelino Kubitschek'), o('Jânio Quadros'), o('Dom Pedro II')], answer: 1, explain: 'A mudança da capital já estava prevista na Constituição de 1891, mas foi JK quem tirou a ideia do papel, com o lema “50 anos em 5”.' },
      { q: 'Os azulejos azuis e brancos da Igrejinha da 307/308 Sul são de qual artista?', options: [o('Candido Portinari'), o('Athos Bulcão'), o('Di Cavalcanti'), o('Tarsila do Amaral')], answer: 1, explain: 'Athos Bulcão criou azulejos, painéis e relevos para dezenas de prédios de Brasília. A Igrejinha Nossa Senhora de Fátima é um dos exemplos mais famosos.' },
      { q: 'Qual é o DDD de Brasília?', options: [o('11'), o('21'), o('61'), o('71')], answer: 2, explain: 'O 61 atende o Distrito Federal. 11 é São Paulo, 21 é o Rio de Janeiro e 71 é Salvador.' },
    ],
    results: [
      { key: 'turista', min: 0, title: 'Turista de primeira viagem', art: { g: 'compass' }, text: 'Brasília ainda tem muito para te mostrar. Que tal um passeio pelo Eixo Monumental, uma subida na Torre de TV e um pôr do sol na Ponte JK?' },
      { key: 'candango', min: 4, title: 'Candango em formação', art: { g: 'torre' }, text: 'Você conhece o essencial da capital e se vira bem no Plano Piloto. Mais algumas voltas pelo Eixão e você vira guia da turma.' },
      { key: 'raiz', min: 7, title: 'Brasiliense raiz', art: { g: 'congresso' }, text: 'Você sabe a história, os arquitetos e os detalhes que muita gente que mora aqui não sabe. Superquadra, tesourinha e balão fazem parte do seu vocabulário.' },
      { key: 'guia', min: 10, title: 'Guia oficial do Eixo', art: { g: 'crown' }, text: 'Dez de dez. Você poderia dar aula de Brasília para o próprio Lúcio Costa. Parabéns, a capital tem orgulho de você.' },
    ],
  },
  {
    slug: 'isto-ou-aquilo-edicao-brasil',
    title: 'Isto ou aquilo: edição Brasil',
    description: 'Biscoito ou bolacha, praia ou cachoeira, feijão por cima ou por baixo? Os dilemas que dividem o país.',
    seo: 'Enquete isto ou aquilo com dilemas brasileiros: biscoito ou bolacha, pão de queijo ou coxinha, praia ou cachoeira. Compare com uma distribuição simulada.',
    category: 'brasil-e-brasilia',
    type: 'enquete',
    art: { g: 'split', hue: '#ffdc7a' },
    plays: 52760,
    questions: [
      { q: 'Biscoito ou bolacha?', sim: 52, options: [o('Biscoito'), o('Bolacha')] },
      { q: 'Praia ou cachoeira?', sim: 61, options: [o('Praia'), o('Cachoeira')] },
      { q: 'Pão de queijo ou coxinha?', sim: 55, options: [o('Pão de queijo'), o('Coxinha')] },
      { q: 'Feijão por cima ou por baixo do arroz?', sim: 71, options: [o('Por cima'), o('Por baixo')] },
      { q: 'Açaí com granola ou puro?', sim: 68, options: [o('Com granola'), o('Puro')] },
      { q: 'Novela ou série?', sim: 34, options: [o('Novela'), o('Série')] },
      { q: 'Churrasco ou feijoada?', sim: 57, options: [o('Churrasco'), o('Feijoada')] },
      { q: 'Futebol no estádio ou em casa?', sim: 39, options: [o('No estádio'), o('Em casa, no sofá')] },
      { q: 'Pastel de feira: carne ou queijo?', sim: 48, options: [o('Carne'), o('Queijo')] },
    ],
    results: [
      { key: 'contra', min: 0, title: 'Opinião própria, sempre', art: { g: 'flame' }, text: 'Você foi contra a maioria simulada em quase tudo. Na mesa do almoço de domingo, é você quem levanta a polêmica, e tudo bem.' },
      { key: 'meio', min: 4, title: 'Diplomata da mesa', art: { g: 'split' }, text: 'Você concorda com a maioria em umas e discorda em outras. Consegue conversar com qualquer pessoa sem brigar por causa de bolacha.' },
      { key: 'maioria', min: 7, title: 'O Brasil em pessoa', art: { g: 'heart' }, text: 'Suas escolhas batem com a maioria simulada em quase tudo. Se o Brasil fosse uma pessoa, talvez fosse você.' },
    ],
  },
  // ===== Games =====
  {
    slug: 'qual-vilao-de-game-voce-seria',
    title: 'Qual vilão de game você seria?',
    description: 'Esconderijo, arma e lema. Sete escolhas para descobrir qual chefão clássico mora dentro de você.',
    seo: 'Quiz de personalidade gamer: descubra se você seria GLaDOS, Sephiroth, Ganondorf, Bowser ou Andrew Ryan, com as capas dos jogos de cada vilão.',
    category: 'games',
    type: 'personalidade',
    art: { img: ['igdb/71', 'igdb/427', 'igdb/1029'] },
    plays: 61340,
    questions: [
      { q: 'Qual seria o seu esconderijo?', options: [o('Um laboratório cheio de câmaras de teste', 'glados'), o('Um castelo com lava e muitas armadilhas', 'bowser'), o('Uma cidade inteira no fundo do mar', 'andrew-ryan'), o('Uma torre sombria no alto do reino', 'ganondorf'), o('Nenhum: apareço onde quero, quando quero', 'sephiroth')] },
      { q: 'Sua arma preferida:', options: [o('Uma espada longa demais para ser prática', 'sephiroth'), o('Ironia e neurotoxina', 'glados'), o('Um exército de tartarugas', 'bowser'), o('Magia sombria e muita ambição', 'ganondorf'), o('Uma ideologia e um discurso convincente', 'andrew-ryan')] },
      { q: 'Como você reage quando perde?', options: [o('Juro vingança e volto no próximo jogo', 'ganondorf bowser'), o('Finjo que fazia parte do plano', 'glados'), o('Desapareço em meio a penas pretas, com uma frase de efeito', 'sephiroth'), o('Culpo quem não entendeu a minha visão', 'andrew-ryan')] },
      { q: 'Qual é o seu maior defeito?', options: [o('Sarcasmo demais', 'glados'), o('Orgulho demais', 'sephiroth'), o('Teimosia demais', 'bowser'), o('Ganância demais', 'ganondorf'), o('Controle demais', 'andrew-ryan')] },
      { q: 'Escolha um lema:', options: [o('Tudo pela ciência', 'glados'), o('O poder é tudo', 'ganondorf'), o('Um homem escolhe, um escravo obedece', 'andrew-ryan'), o('Um dia o reino vai ser meu (e a festa também)', 'bowser'), o('Nunca serei uma lembrança', 'sephiroth')] },
      { q: 'Seu estilo de entrada em cena:', options: [o('Um anúncio pelo alto-falante', 'glados andrew-ryan'), o('Coral épico ao fundo', 'sephiroth'), o('Rugido e chão tremendo', 'bowser'), o('Raio, trovão e capa esvoaçante', 'ganondorf')] },
      { q: 'Seu parceiro de crime ideal:', options: [o('Um robô que faz tudo o que eu mando', 'glados'), o('Um exército fiel e um pouco atrapalhado', 'bowser'), o('Ninguém: trabalho melhor sozinho', 'sephiroth'), o('Seguidores que acreditam na minha visão', 'andrew-ryan ganondorf')] },
    ],
    results: [
      { key: 'glados', title: 'GLaDOS', source: 'Portal (2007)', art: { img: ['igdb/71'], hue: '#d9dde6' }, text: 'Inteligência afiada e humor ácido. Você testa os outros o tempo todo, faz comentários passivo-agressivos com voz calma e sempre promete um bolo no final.' },
      { key: 'sephiroth', title: 'Sephiroth', source: 'Final Fantasy VII (1997)', art: { img: ['igdb/427'], hue: '#cbbcff' }, text: 'Elegante, misterioso e dramático na medida certa. Você entra em cena com trilha sonora própria, tem um passado complicado e um objetivo grande demais para caber num plano simples.' },
      { key: 'ganondorf', title: 'Ganondorf', source: 'The Legend of Zelda: Ocarina of Time (1998)', art: { img: ['igdb/1029'], hue: '#ffc3a3' }, text: 'Ambição em estado puro. Paciente, estratégico e disposto a esperar o momento certo para tomar o poder. Você não desiste nunca: volta a cada nova geração.' },
      { key: 'bowser', title: 'Bowser', source: 'Super Mario Odyssey (2017)', art: { img: ['igdb/26758'], hue: '#ffe680' }, text: 'Barulhento, teimoso e com um coração maior do que admite. Você planeja grande, perde muito e tenta de novo com o mesmo entusiasmo. Nos fins de semana, ainda encara o rival no kart.' },
      { key: 'andrew-ryan', title: 'Andrew Ryan', source: 'BioShock (2007)', art: { img: ['igdb/20'], hue: '#a8ecf0' }, text: 'Visionário e intransigente. Você tem ideias fortes sobre como o mundo deveria ser e construiria uma cidade inteira, de preferência no fundo do mar, só para provar que está certo.' },
    ],
  },
  {
    slug: 'trivia-de-games',
    title: 'Trivia de games: só quem jogou acerta',
    description: 'Do Pac-Man ao Hollow Knight, passando por um clássico brasileiro. Oito perguntas com a capa de cada jogo.',
    seo: 'Trivia de videogames com explicação: Minecraft, Super Mario Bros., Pac-Man, Hollow Knight, Dandara, Zelda, GTA V e Pokémon. Teste quanto você sabe.',
    category: 'games',
    type: 'trivia',
    art: { img: ['igdb/2750', 'igdb/14593', 'igdb/27435'] },
    plays: 44120,
    questions: [
      { q: 'Qual jogo foi o primeiro a passar de 300 milhões de cópias vendidas?', art: { img: ['igdb/121'] }, options: [o('Tetris'), o('Minecraft'), o('Grand Theft Auto V'), o('Wii Sports')], answer: 1, explain: 'A Mojang anunciou a marca de 300 milhões em outubro de 2023, somando todas as plataformas desde o lançamento, em 2009.' },
      { q: 'Em que ano Super Mario Bros. saiu no Japão?', art: { img: ['igdb/358'] }, options: [o('1981'), o('1985'), o('1990'), o('1996')], answer: 1, explain: 'Super Mario Bros. chegou ao Famicom em setembro de 1985 e virou o molde do jogo de plataforma.' },
      { q: 'Quem criou Pac-Man?', art: { img: ['igdb/2750'] }, options: [o('Shigeru Miyamoto'), o('Toru Iwatani'), o('Hideo Kojima'), o('Satoru Iwata')], answer: 1, explain: 'Toru Iwatani criou Pac-Man na Namco, lançado em 1980. Miyamoto é o pai de Mario e Zelda, e Kojima, de Metal Gear.' },
      { q: 'Hollow Knight foi feito por um estúdio de qual país?', art: { img: ['igdb/14593'] }, options: [o('Japão'), o('Canadá'), o('Austrália'), o('Suécia')], answer: 2, explain: 'A Team Cherry é um estúdio pequeno de Adelaide, na Austrália. O jogo saiu em 2017.' },
      { q: 'Qual destes jogos foi feito no Brasil?', art: { img: ['igdb/27435'] }, options: [o('Celeste'), o('Dandara'), o('Cuphead'), o('Hades')], answer: 1, explain: 'Dandara é da Long Hat House, de Belo Horizonte, e saiu em 2018. A heroína é inspirada em Dandara dos Palmares.' },
      { q: 'Na série The Legend of Zelda, qual é o nome do herói que você controla?', art: { img: ['igdb/7346'] }, options: [o('Zelda'), o('Link'), o('Ganon'), o('Epona')], answer: 1, explain: 'O herói é Link. Zelda é a princesa que dá nome à série, e a confusão é tão comum que virou piada entre fãs.' },
      { q: 'Em qual jogo fica a cidade fictícia de Los Santos?', art: { img: ['igdb/1020'] }, options: [o('Red Dead Redemption 2'), o('Grand Theft Auto V'), o('Watch Dogs'), o('Mafia')], answer: 1, explain: 'Los Santos é a versão da Rockstar para Los Angeles, cenário de GTA: San Andreas (2004) e de GTA V (2013).' },
      { q: 'Com quais versões Pokémon estreou no Japão, em 1996?', art: { img: ['igdb/1561'] }, options: [o('Red e Blue'), o('Red e Green'), o('Gold e Silver'), o('Yellow')], answer: 1, explain: 'No Japão, a estreia foi com Red e Green, em fevereiro de 1996. Os Estados Unidos só receberam Red e Blue em 1998.' },
    ],
    results: [
      { key: 'casual', min: 0, title: 'Jogador casual', art: { g: 'gamepad' }, text: 'Você joga pelo prazer, não pela enciclopédia. Escolha um desses clássicos para o próximo fim de semana e tente de novo.' },
      { key: 'veterano', min: 3, title: 'Veterano de fim de semana', art: { g: 'target' }, text: 'Você conhece bem os grandes nomes e já passou muitas horas com o controle na mão. Só faltaram alguns detalhes de bastidor.' },
      { key: 'speedrunner', min: 6, title: 'Speedrunner de trivia', art: { g: 'trophy' }, text: 'Datas, estúdios e curiosidades na ponta da língua. Você é a pessoa que todo mundo chama para tirar dúvida no grupo.' },
      { key: 'zerou', min: 8, title: 'Zerou o quiz', art: { g: 'crown' }, text: 'Oito de oito, sem continue. Você merece uma conquista rara e um lugar no ranking da sala de fliperama.' },
    ],
  },
  {
    slug: 'qual-classe-de-rpg-voce-seria',
    title: 'Qual classe de RPG você seria?',
    description: 'Escolha a arma, o acampamento e o plano contra o dragão. Sete rodadas para descobrir sua classe.',
    seo: 'Quiz de personalidade de RPG com respostas em imagem: descubra se a sua classe é guerreiro, arqueiro, mago, paladino ou ladino.',
    category: 'games',
    type: 'personalidade',
    art: { g: 'sword' },
    plays: 37650,
    questions: [
      { q: 'Escolha sua arma:', options: [o('Espada longa', 'guerreiro', { g: 'sword' }), o('Arco e flecha', 'arqueiro', { g: 'bow' }), o('Cajado mágico', 'mago', { g: 'staff' }), o('Escudo sagrado', 'paladino', { g: 'shield' }), o('Adaga discreta', 'ladino', { g: 'dagger' })] },
      { q: 'Onde você monta acampamento?', options: [o('Montanha gelada', 'guerreiro', { g: 'mountain' }), o('Floresta densa', 'arqueiro', { g: 'tree' }), o('Torre antiga', 'mago', { g: 'tower' }), o('Templo ao nascer do sol', 'paladino', { g: 'sun' }), o('Beco da cidade, à noite', 'ladino', { g: 'moon' })] },
      { q: 'Qual é a sua maior virtude?', options: [o('Coragem', 'guerreiro'), o('Precisão', 'arqueiro'), o('Sabedoria', 'mago'), o('Lealdade', 'paladino'), o('Astúcia', 'ladino')] },
      { q: 'O grupo encontrou um baú trancado. Você...', options: [o('Arrombo com um golpe só', 'guerreiro'), o('Procuro armadilhas antes de tudo', 'ladino'), o('Leio as runas da tampa', 'mago'), o('Pergunto se é certo abrir', 'paladino'), o('Fico de vigia, de longe', 'arqueiro')] },
      { q: 'Um dragão bloqueia o caminho. Seu plano:', options: [o('Avanço na frente do grupo', 'guerreiro'), o('Miro no ponto fraco, de longe', 'arqueiro'), o('Um feitiço de gelo bem colocado', 'mago'), o('Protejo todo mundo e seguro a linha', 'paladino'), o('Entro escondido no covil e pego o tesouro', 'ladino')] },
      { q: 'Escolha um companheiro de viagem:', options: [o('Um livro de feitiços falante', 'mago', { g: 'book' }), o('Um olho que tudo vê', 'arqueiro ladino', { g: 'eye' }), o('Uma coroa que você jurou proteger', 'paladino', { g: 'crown' }), o('Uma chama que nunca apaga', 'guerreiro', { g: 'flame' })] },
      { q: 'Qual recompensa te deixa mais feliz?', options: [o('Uma armadura nova', 'guerreiro paladino'), o('O mapa de uma terra desconhecida', 'arqueiro'), o('Um grimório raro', 'mago'), o('Um saco de moedas sem dono', 'ladino')] },
    ],
    results: [
      { key: 'guerreiro', title: 'Guerreiro', art: { g: 'sword', hue: '#ffc3a3' }, text: 'Coragem na linha de frente. Você resolve as coisas de forma direta, protege o grupo com o próprio corpo e não perde tempo com rodeios. Quando a luta começa, é o seu nome que todo mundo chama.' },
      { key: 'arqueiro', title: 'Arqueiro', art: { g: 'bow', hue: '#a3e9c9' }, text: 'Preciso, paciente e observador. Você enxerga o que os outros não veem, prefere agir na hora certa e conhece cada trilha da floresta. Um disparo, um acerto.' },
      { key: 'mago', title: 'Mago', art: { g: 'staff', hue: '#cbbcff' }, text: 'Curioso e estudioso, você acredita que conhecimento é o maior poder que existe. Resolve problemas com criatividade, lê tudo o que encontra e sempre tem um truque guardado na manga.' },
      { key: 'paladino', title: 'Paladino', art: { g: 'shield', hue: '#ffe680' }, text: 'Justo, leal e confiável. Você segue um código de honra, cuida de quem está ao seu lado e não abandona ninguém pelo caminho. É a pessoa em quem o grupo confia de olhos fechados.' },
      { key: 'ladino', title: 'Ladino', art: { g: 'dagger', hue: '#d9dde6' }, text: 'Astuto, silencioso e cheio de recursos. Você encontra a saída que ninguém viu, abre qualquer porta e tem um plano B para o plano B. Charme e esperteza são suas melhores armas.' },
    ],
  },
  // ===== Filmes & Séries =====
  {
    slug: 'qual-icone-do-terror-voce-seria',
    title: 'Qual ícone do terror você seria?',
    description: 'Medos, cenários e objetos assustadores. Seis perguntas para descobrir qual lenda do terror tem a sua cara.',
    seo: 'Quiz de personalidade de filmes de terror: descubra se você seria Jason Voorhees, Michael Myers, Freddy Krueger, Jigsaw ou Samara, com os pôsteres dos filmes.',
    category: 'filmes-e-series',
    type: 'personalidade',
    art: { img: ['tmdb/movie/948', 'tmdb/movie/377', 'tmdb/movie/176'] },
    plays: 58410,
    questions: [
      { q: 'Qual é o seu maior medo?', options: [o('Ficar sozinho no meio do mato', 'jason'), o('Um barulho estranho na casa escura', 'michael'), o('Pegar no sono e não acordar', 'freddy'), o('Ficar preso sem saída', 'jigsaw'), o('Uma ligação de número desconhecido', 'samara')] },
      { q: 'Como você resolve um conflito?', options: [o('Encaro de frente, sem conversa', 'jason'), o('Espero o momento certo, em silêncio', 'michael'), o('Com uma piada que irrita o outro', 'freddy'), o('Proponho um jogo com regras claras', 'jigsaw'), o('Deixo a pessoa pensando no que fez por uma semana', 'samara')] },
      { q: 'Escolha um cenário:', options: [o('Acampamento à beira do lago', 'jason'), o('Cidadezinha tranquila no outono', 'michael'), o('Sala de caldeiras', 'freddy'), o('Banheiro abandonado com uma fita gravada', 'jigsaw'), o('Um poço no meio do bosque', 'samara')] },
      { q: 'Qual objeto é a sua cara?', options: [o('Máscara de hóquei', 'jason'), o('Máscara branca sem expressão', 'michael'), o('Luva com lâminas', 'freddy'), o('Boneco num triciclo', 'jigsaw'), o('Fita de vídeo VHS', 'samara')] },
      { q: 'Seu jeito numa festa:', options: [o('Prefiro festa ao ar livre, de preferência num acampamento', 'jason'), o('Fico no canto e só apareço no final', 'michael'), o('Conto piada de humor duvidoso', 'freddy'), o('Organizo uma gincana cheia de regras', 'jigsaw'), o('Mostro um vídeo esquisito para todo mundo', 'samara')] },
      { q: 'Escolha um poder sombrio:', options: [o('Voltar sempre, aconteça o que acontecer', 'jason michael'), o('Invadir os sonhos dos outros', 'freddy'), o('Prever o que as pessoas vão fazer', 'jigsaw'), o('Sair da tela da TV', 'samara')] },
    ],
    results: [
      { key: 'jason', title: 'Jason Voorhees', source: 'Sexta-Feira 13: Parte 3 (1982)', art: { img: ['tmdb/movie/9728'], hue: '#a3e9c9' }, text: 'Persistente e silencioso. Você não fala muito, mas quando decide algo, ninguém te para. Gosta de acampamento, de lago e de uma boa máscara de hóquei, que ele só ganhou no terceiro filme.' },
      { key: 'michael', title: 'Michael Myers', source: 'Halloween: A Noite do Terror (1978)', art: { img: ['tmdb/movie/948'], hue: '#ffc3a3' }, text: 'Calmo por fora, imprevisível por dentro. Você observa tudo em silêncio, tem paciência infinita e aparece exatamente quando ninguém espera.' },
      { key: 'freddy', title: 'Freddy Krueger', source: 'A Hora do Pesadelo (1984)', art: { img: ['tmdb/movie/377'], hue: '#ffb9b3' }, text: 'Criativo, debochado e com um humor bem duvidoso. Você adora uma piada na hora errada e domina a arte de entrar na cabeça das pessoas, literalmente, nos sonhos.' },
      { key: 'jigsaw', title: 'Jigsaw', source: 'Jogos Mortais (2004)', art: { img: ['tmdb/movie/176'], hue: '#d9dde6' }, text: 'Calculista e sempre três passos à frente. Você ama um quebra-cabeça, planeja cada detalhe e acredita que todo mundo aprende alguma coisa no final do jogo.' },
      { key: 'samara', title: 'Samara', source: 'O Chamado (2002)', art: { img: ['tmdb/movie/565'], hue: '#aedcff' }, text: 'Misteriosa e paciente. Você prefere a tecnologia antiga, não gosta de ser ignorada e sabe que sete dias passam rápido.' },
    ],
  },
  {
    slug: 'monte-sua-maratona-de-filmes',
    title: 'Monte sua maratona e descubra seu gênero de cinema',
    description: 'Cinco rodadas, quatro pôsteres cada. Escolha o filme que você daria play agora e veja que gênero manda no seu gosto.',
    seo: 'Quiz com pôsteres de filmes: escolha um por rodada entre clássicos, sucessos e filmes brasileiros e descubra se seu gênero é terror, comédia, ficção científica ou drama.',
    category: 'filmes-e-series',
    type: 'personalidade',
    art: { img: ['tmdb/movie/105', 'tmdb/movie/694', 'tmdb/movie/13'] },
    plays: 46280,
    questions: [
      { q: 'Sexta à noite, pipoca pronta. Qual clássico você coloca?', options: [o('O Iluminado', 'terror', { img: ['tmdb/movie/694'] }), o('Curtindo a Vida Adoidado', 'comedia', { img: ['tmdb/movie/9377'] }), o('De Volta para o Futuro', 'ficcao', { img: ['tmdb/movie/105'] }), o('Forrest Gump', 'drama', { img: ['tmdb/movie/13'] })] },
      { q: 'Sessão com os amigos. Qual vocês assistem?', options: [o('Corra!', 'terror', { img: ['tmdb/movie/419430'] }), o('Minha Mãe é uma Peça', 'comedia', { img: ['tmdb/movie/203217'] }), o('Interestelar', 'ficcao', { img: ['tmdb/movie/157336'] }), o('Central do Brasil', 'drama', { img: ['tmdb/movie/666'] })] },
      { q: 'Domingo chuvoso, sofá e coberta:', options: [o('Invocação do Mal', 'terror', { img: ['tmdb/movie/138843'] }), o('O Auto da Compadecida', 'comedia', { img: ['tmdb/movie/40096'] }), o('Matrix', 'ficcao', { img: ['tmdb/movie/603'] }), o('Ainda Estou Aqui', 'drama', { img: ['tmdb/movie/1000837'] })] },
      { q: 'Um filme para comentar a semana inteira:', options: [o('Hereditário', 'terror', { img: ['tmdb/movie/493922'] }), o('As Branquelas', 'comedia', { img: ['tmdb/movie/12153'] }), o('Duna', 'ficcao', { img: ['tmdb/movie/438631'] }), o('Um Sonho de Liberdade', 'drama', { img: ['tmdb/movie/278'] })] },
      { q: 'Última rodada. Qual fecha a maratona?', options: [o('Um Lugar Silencioso', 'terror', { img: ['tmdb/movie/447332'] }), o('Todo Mundo em Pânico', 'comedia', { img: ['tmdb/movie/4247'] }), o('Avatar', 'ficcao', { img: ['tmdb/movie/19995'] }), o('À Procura da Felicidade', 'drama', { img: ['tmdb/movie/1402'] })] },
    ],
    results: [
      { key: 'terror', title: 'Terror', art: { g: 'ghost', hue: '#d9dde6' }, text: 'Você gosta de sentir o coração acelerar e de comentar cada susto com os amigos. Para você, filme bom é aquele que faz pensar duas vezes antes de apagar a luz.' },
      { key: 'comedia', title: 'Comédia', art: { g: 'smile', hue: '#ffe680' }, text: 'Você assiste filme para dar risada e repetir as falas por semanas. Leveza é a sua especialidade, e você sempre tem a referência certa para o grupo de mensagens.' },
      { key: 'ficcao', title: 'Ficção científica', art: { g: 'rocket', hue: '#b9d3ff' }, text: 'Viagem no tempo, outros planetas, realidades simuladas: você adora perguntar “e se?”. Sai do cinema cheio de teorias e só dorme depois de ler a explicação do final.' },
      { key: 'drama', title: 'Drama', art: { g: 'heart', hue: '#ffb9b3' }, text: 'Você gosta de histórias de gente de verdade, daquelas que deixam um nó na garganta. Não tem vergonha de chorar no cinema e sempre recomenda um filme que mudou seu jeito de ver alguma coisa.' },
    ],
  },
  {
    slug: 'quanto-voce-sabe-de-cinema-brasileiro',
    title: 'Quanto você sabe de cinema brasileiro?',
    description: 'Oscar, Berlim, Cannes e muita bilheteria. Oito perguntas sobre filmes que marcaram o cinema nacional.',
    seo: 'Trivia de cinema brasileiro com explicação: Ainda Estou Aqui, Cidade de Deus, Central do Brasil, O Auto da Compadecida, Tropa de Elite, Bacurau e mais.',
    category: 'filmes-e-series',
    type: 'trivia',
    art: { img: ['tmdb/movie/598', 'tmdb/movie/1000837', 'tmdb/movie/40096'] },
    plays: 35720,
    questions: [
      { q: 'Qual filme deu ao Brasil o primeiro Oscar de Melhor Filme Internacional?', art: { img: ['tmdb/movie/1000837'] }, options: [o('Central do Brasil'), o('Cidade de Deus'), o('O Quatrilho'), o('Ainda Estou Aqui')], answer: 3, explain: 'Ainda Estou Aqui, de Walter Salles, venceu em março de 2025. O filme conta a história de Eunice Paiva, vivida por Fernanda Torres.' },
      { q: 'Quantas indicações ao Oscar Cidade de Deus recebeu?', art: { img: ['tmdb/movie/598'] }, options: [o('Nenhuma'), o('Duas'), o('Quatro'), o('Seis')], answer: 2, explain: 'Foram quatro, em 2004: direção (Fernando Meirelles), roteiro adaptado, fotografia e montagem.' },
      { q: 'Quem interpreta Dora em Central do Brasil?', art: { img: ['tmdb/movie/666'] }, options: [o('Fernanda Torres'), o('Fernanda Montenegro'), o('Marília Pêra'), o('Regina Casé')], answer: 1, explain: 'Fernanda Montenegro foi indicada ao Oscar de melhor atriz pelo papel, em 1999. Vinte e seis anos depois, a filha dela, Fernanda Torres, seria indicada na mesma categoria.' },
      { q: 'O Auto da Compadecida é baseado na obra de qual autor?', art: { img: ['tmdb/movie/40096'] }, options: [o('Jorge Amado'), o('Ariano Suassuna'), o('Graciliano Ramos'), o('Nelson Rodrigues')], answer: 1, explain: 'A peça de Ariano Suassuna é de 1955. O filme de Guel Arraes (2000) eternizou João Grilo e Chicó, vividos por Matheus Nachtergaele e Selton Mello.' },
      { q: 'Tropa de Elite (2007) ganhou qual prêmio internacional?', art: { img: ['tmdb/movie/7347'] }, options: [o('Palma de Ouro, em Cannes'), o('Urso de Ouro, em Berlim'), o('Leão de Ouro, em Veneza'), o('Oscar de Melhor Filme Internacional')], answer: 1, explain: 'O filme de José Padilha levou o Urso de Ouro em 2008. Central do Brasil já tinha conquistado o mesmo prêmio dez anos antes.' },
      { q: 'Qual filme dividiu o Prêmio do Júri em Cannes, em 2019?', art: { img: ['tmdb/movie/446159'] }, options: [o('Bacurau'), o('Aquarius'), o('O Som ao Redor'), o('Marighella')], answer: 0, explain: 'Bacurau, de Kleber Mendonça Filho e Juliano Dornelles, dividiu o prêmio com o francês Os Miseráveis. O filme mistura faroeste e ficção científica no sertão.' },
      { q: 'Quem vive Val, a protagonista de Que Horas Ela Volta? (2015)?', art: { img: ['tmdb/movie/310569'] }, options: [o('Regina Casé'), o('Dira Paes'), o('Andréa Beltrão'), o('Débora Falabella')], answer: 0, explain: 'Regina Casé interpreta Val, empregada doméstica que mora na casa dos patrões em São Paulo. O filme é de Anna Muylaert.' },
      { q: 'Quem criou e interpretou Dona Hermínia, de Minha Mãe é uma Peça?', art: { img: ['tmdb/movie/203217'] }, options: [o('Paulo Gustavo'), o('Marcelo Adnet'), o('Fábio Porchat'), o('Leandro Hassum')], answer: 0, explain: 'Paulo Gustavo criou a personagem no teatro, inspirado na própria mãe. A trilogia virou uma das maiores bilheterias da história do cinema nacional.' },
    ],
    results: [
      { key: 'maratona', min: 0, title: 'Precisa de uma maratona nacional', art: { g: 'clapper' }, text: 'O cinema brasileiro tem muita coisa boa esperando por você. Comece por qualquer um destes pôsteres: não tem como errar.' },
      { key: 'cinefilo', min: 3, title: 'Cinéfilo em formação', art: { g: 'eye' }, text: 'Você conhece os grandes títulos e já viu boa parte deles. Falta pouco para dominar os bastidores e os prêmios.' },
      { key: 'critico', min: 6, title: 'Crítico de cinema', art: { g: 'trophy' }, text: 'Prêmios, diretores e elenco na ponta da língua. Sua lista de recomendações é disputada pelos amigos.' },
      { key: 'kikito', min: 8, title: 'Merece um Kikito', art: { g: 'crown' }, text: 'Oito de oito. Você sabe tanto de cinema nacional que poderia estar na curadoria do Festival de Gramado.' },
    ],
  },
  // ===== Cultura pop =====
  {
    slug: 'qual-personagem-da-pixar-voce-seria',
    title: 'Qual personagem da Pixar você seria?',
    description: 'Manias, medos e frases favoritas. Seis perguntas para descobrir quem você seria nos filmes da Pixar.',
    seo: 'Quiz de personalidade com personagens da Pixar: descubra se você é Woody, Carl Fredricksen, Remy, Alegria, WALL-E ou Dory, com os pôsteres dos filmes.',
    category: 'cultura-pop',
    type: 'personalidade',
    art: { img: ['tmdb/movie/862', 'tmdb/movie/2062', 'tmdb/movie/14160'] },
    plays: 55190,
    questions: [
      { q: 'Qual é o seu fim de semana ideal?', options: [o('Cozinhando uma receita nova', 'remy'), o('Organizando minhas coleções', 'wall-e'), o('Juntando os amigos em casa', 'woody'), o('Conhecendo gente nova na praia', 'dory'), o('Planejando a viagem dos sonhos', 'carl'), o('Uma festa bem animada', 'alegria')] },
      { q: 'Como seus amigos te descrevem?', options: [o('Leal', 'woody'), o('Divertido', 'alegria'), o('Esquecido, mas um amor', 'dory'), o('Teimoso', 'carl'), o('Talentoso', 'remy'), o('Fofo e tímido', 'wall-e')] },
      { q: 'Uma mania sua:', options: [o('Guardar objetos que parecem lixo para os outros', 'wall-e'), o('Fazer a lista de quem vai na festa', 'woody'), o('Cheirar a comida antes de provar', 'remy'), o('Puxar papo com desconhecidos', 'dory'), o('Reclamar do barulho dos vizinhos', 'carl'), o('Cantar alto no chuveiro', 'alegria')] },
      { q: 'Escolha um lugar:', options: [o('A cozinha de um restaurante em Paris', 'remy'), o('Um quarto cheio de brinquedos', 'woody'), o('O fundo do oceano', 'dory'), o('Uma cachoeira na América do Sul', 'carl'), o('Uma nave espacial', 'wall-e'), o('A sala de controle da mente', 'alegria')] },
      { q: 'Seu maior medo:', options: [o('Ser substituído', 'woody'), o('Esquecer quem eu amo', 'dory carl'), o('Ninguém levar meu talento a sério', 'remy'), o('Ficar sozinho para sempre', 'wall-e'), o('Perder a alegria', 'alegria')] },
      { q: 'Qual frase você diria?', options: [o('Amigo, estou aqui', 'woody'), o('Continue a nadar', 'dory'), o('Qualquer um pode cozinhar', 'remy'), o('A aventura está lá fora', 'carl'), o('Vai dar tudo certo!', 'alegria'), o('Eeeeva!', 'wall-e')] },
    ],
    results: [
      { key: 'woody', title: 'Woody', source: 'Toy Story (1995)', art: { img: ['tmdb/movie/862'], hue: '#ffe680' }, text: 'Leal até o fim e um pouco controlador. Você cuida do grupo como ninguém, fica enciumado quando chega alguém novo, mas sempre faz a coisa certa no final.' },
      { key: 'carl', title: 'Carl Fredricksen', source: 'Up: Altas Aventuras (2009)', art: { img: ['tmdb/movie/14160'], hue: '#aedcff' }, text: 'Rabugento por fora, coração enorme por dentro. Você leva a vida no seu ritmo, guarda as memórias com carinho e, quando decide sonhar, amarra milhares de balões na casa.' },
      { key: 'remy', title: 'Remy', source: 'Ratatouille (2007)', art: { img: ['tmdb/movie/2062'], hue: '#ffc3a3' }, text: 'Talento e paladar refinado. Você tem um sonho que todo mundo acha impossível e segue firme, provando que qualquer um pode cozinhar.' },
      { key: 'alegria', title: 'Alegria', source: 'Divertida Mente (2015)', art: { img: ['tmdb/movie/150540'], hue: '#ffdc7a' }, text: 'Otimista profissional. Você vê o lado bom de tudo, anima qualquer ambiente e está aprendendo que tudo bem sentir um pouco de tristeza de vez em quando.' },
      { key: 'wall-e', title: 'WALL-E', source: 'WALL-E (2008)', art: { img: ['tmdb/movie/10681'], hue: '#d9dde6' }, text: 'Trabalhador, curioso e romântico. Você coleciona pequenos tesouros que ninguém valoriza, gosta de rotina e se encanta com as coisas simples.' },
      { key: 'dory', title: 'Dory', source: 'Procurando Nemo (2003)', art: { img: ['tmdb/movie/12'], hue: '#a8ecf0' }, text: 'Simpatia com todo mundo e zero preocupação com o amanhã. Você esquece onde deixou a chave, mas nunca esquece de ser gentil. Seu lema: continue a nadar.' },
    ],
  },
  {
    slug: 'voce-seria-heroi-ou-vilao',
    title: 'Você seria herói, vilão ou anti-herói?',
    description: 'Superpoder, codinome e quem salvar primeiro. Seis escolhas para descobrir de que lado da história você fica.',
    seo: 'Quiz de personalidade de super-heróis: escolha poderes, codinome e atitudes e descubra se você seria herói de verdade, vilão com estilo ou anti-herói.',
    category: 'cultura-pop',
    type: 'personalidade',
    art: { g: 'mask' },
    plays: 42870,
    questions: [
      { q: 'Qual superpoder você escolheria?', options: [o('Raio laser pelos olhos', 'vilao'), o('Voar', 'heroi'), o('Ficar invisível', 'anti'), o('Curar feridas', 'heroi'), o('Controlar o fogo', 'vilao'), o('Ler mentes', 'anti')] },
      { q: 'Quem você salva primeiro?', options: [o('Quem estiver mais perto', 'heroi'), o('Quem puder me ajudar depois', 'vilao'), o('Depende de quem merece', 'anti'), o('Todo mundo, nem que leve a noite toda', 'heroi')] },
      { q: 'Sua maior preocupação numa luta:', options: [o('Não deixar ninguém se machucar', 'heroi'), o('Ganhar, custe o que custar', 'vilao'), o('Resolver rápido, do meu jeito', 'anti'), o('Não estragar o visual', 'vilao')] },
      { q: 'O que te move?', options: [o('Proteger as pessoas', 'heroi'), o('Poder e fama', 'vilao'), o('Fazer justiça, mesmo fora das regras', 'anti'), o('Provar que eu estava certo', 'vilao anti')] },
      { q: 'Escolha seu codinome:', options: [o('O Guardião', 'heroi'), o('O Terrível', 'vilao'), o('Sombra', 'anti'), o('Amigo da Vizinhança', 'heroi')] },
      { q: 'A polícia pede ajuda num caso difícil. Você...', options: [o('Ajudo na hora, sem pedir nada', 'heroi'), o('Ajudo, mas cobro um favor', 'vilao'), o('Resolvo sozinho antes deles', 'anti'), o('Finjo ajudar e aproveito a confusão', 'vilao')] },
    ],
    results: [
      { key: 'heroi', title: 'Herói de verdade', art: { g: 'star', hue: '#b9d3ff' }, text: 'Você coloca os outros em primeiro lugar, segue um código e acredita que poder vem com responsabilidade. Sem capa? Tudo bem, a atitude já diz tudo.' },
      { key: 'vilao', title: 'Vilão com estilo', art: { g: 'flame', hue: '#ffb9b3' }, text: 'Ambicioso, carismático e com um plano mirabolante na gaveta. Você gosta de estar no controle e, convenhamos, teria o melhor figurino da história.' },
      { key: 'anti', title: 'Anti-herói', art: { g: 'moon', hue: '#cbbcff' }, text: 'Você faz o bem, mas do seu jeito. Desconfia de regras, trabalha melhor sozinho e tem um senso de justiça próprio. O público ama personagens como você.' },
    ],
  },
  // ===== Curiosidades =====
  {
    slug: 'verdade-ou-mentira-curiosidades',
    title: 'Verdade ou mentira: curiosidades que parecem inventadas',
    description: 'Polvos, bananas, Vênus e a Muralha da China. Dez afirmações para separar o fato do mito.',
    seo: 'Quiz de verdade ou mentira com explicação: polvos têm três corações? A Muralha da China aparece do espaço? Usamos só 10% do cérebro? Descubra.',
    category: 'curiosidades',
    type: 'trivia',
    art: { g: 'question' },
    plays: 63580,
    questions: [
      { q: 'Polvos têm três corações.', options: tf(), answer: 0, explain: 'Dois corações bombeiam o sangue pelas brânquias e um terceiro leva o sangue para o resto do corpo. E o sangue deles é azul, por causa da hemocianina.' },
      { q: 'Dá para ver a Muralha da China do espaço a olho nu.', options: tf(), answer: 1, explain: 'Ela é comprida, mas estreita demais. Astronautas em órbita baixa contam que não conseguem distinguir a muralha sem a ajuda de uma câmera.' },
      { q: 'Bananas são levemente radioativas.', options: tf(), answer: 0, explain: 'Elas têm potássio, e uma pequena parte do potássio natural é o isótopo radioativo potássio-40. A dose é minúscula e totalmente inofensiva.' },
      { q: 'Usamos apenas 10% do cérebro.', options: tf(), answer: 1, explain: 'Exames de imagem mostram atividade em praticamente todas as áreas do cérebro ao longo do dia. O mito é antigo, mas não tem base científica.' },
      { q: 'O Brasil tem quatro fusos horários.', options: tf(), answer: 0, explain: 'De Fernando de Noronha (UTC-2) ao Acre (UTC-5), são quatro fusos. Brasília fica no UTC-3.' },
      { q: 'Um raio nunca cai duas vezes no mesmo lugar.', options: tf(), answer: 1, explain: 'Lugares altos são atingidos o tempo todo. O Empire State, em Nova York, leva cerca de 20 raios por ano.' },
      { q: 'O mel pode durar milhares de anos sem estragar.', options: tf(), answer: 0, explain: 'Pouca água, muito açúcar e acidez alta impedem a proliferação de micróbios. Arqueólogos já encontraram mel comestível em tumbas egípcias.' },
      { q: 'Tomate é uma fruta.', options: tf(), answer: 0, explain: 'Na botânica, é o fruto do tomateiro: nasce da flor e guarda as sementes. Na cozinha, é tratado como legume.' },
      { q: 'Peixinhos-dourados têm memória de apenas três segundos.', options: tf(), answer: 1, explain: 'Experimentos mostram que eles se lembram de rotinas e sinais por meses e podem até ser treinados para responder a sons.' },
      { q: 'Um dia em Vênus dura mais do que um ano em Vênus.', options: tf(), answer: 0, explain: 'Vênus leva cerca de 243 dias terrestres para girar em torno de si mesmo e cerca de 225 para dar a volta no Sol.' },
    ],
    results: [
      { key: 'crente', min: 0, title: 'Acredita no grupo da família', art: { g: 'chat' }, text: 'Muitos mitos passaram como verdade aqui. Antes de encaminhar a próxima curiosidade, que tal conferir a fonte?' },
      { key: 'desconfiado', min: 5, title: 'Desconfiado na medida', art: { g: 'eye' }, text: 'Você já não cai em qualquer história, mas alguns mitos ainda te pegaram de jeito. Bom faro, falta só treino.' },
      { key: 'cacador', min: 8, title: 'Caçador de mitos', art: { g: 'target' }, text: 'Você separa fato de boato com facilidade. As pessoas deviam te consultar antes de compartilhar qualquer coisa.' },
      { key: 'checador', min: 10, title: 'Checador de fatos profissional', art: { g: 'crown' }, text: 'Dez de dez. Nenhum mito sobrevive a você. Agências de checagem, anotem esse nome.' },
    ],
  },
  {
    slug: 'qual-e-o-seu-estilo-de-viagem',
    title: 'Qual é o seu estilo de viagem?',
    description: 'Hospedagem, mala e destino dos sonhos. Seis escolhas, com fotos imaginárias, para descobrir como você viaja.',
    seo: 'Quiz de personalidade de viagem com respostas em imagem: descubra se você é do relax total, aventureiro nato, explorador cultural ou viajante gourmet.',
    category: 'curiosidades',
    type: 'personalidade',
    art: { g: 'compass' },
    plays: 40360,
    questions: [
      { q: 'Escolha a foto de capa da sua viagem:', options: [o('Pé na areia', 'praia', { g: 'sun' }), o('Topo da montanha', 'aventura', { g: 'mountain' }), o('Fachada de museu', 'cultura', { g: 'columns' }), o('Mesa de restaurante', 'gastronomia', { g: 'fork' })] },
      { q: 'Onde você prefere dormir?', options: [o('Resort pé na areia', 'praia'), o('Barraca de camping', 'aventura'), o('Pousada no centro histórico', 'cultura'), o('Hotel perto dos melhores restaurantes', 'gastronomia')] },
      { q: 'Item indispensável na mala:', options: [o('Protetor solar e roupa de banho', 'praia'), o('Bota de trilha e lanterna', 'aventura'), o('Guia de viagem e câmera', 'cultura'), o('Uma lista de restaurantes salva no celular', 'gastronomia')] },
      { q: 'Escolha um destino brasileiro:', options: [o('Jericoacoara', 'praia', { g: 'wave' }), o('Chapada dos Veadeiros', 'aventura', { g: 'compass' }), o('Ouro Preto', 'cultura', { g: 'camera' }), o('Belém e seus sabores', 'gastronomia', { g: 'cup' })] },
      { q: 'Como você planeja a viagem?', options: [o('Pacote fechado e zero preocupação', 'praia'), o('Planejo o mínimo e deixo espaço para o improviso', 'aventura'), o('Roteiro com o horário de cada museu', 'cultura'), o('O roteiro gira em torno das reservas de restaurante', 'gastronomia')] },
      { q: 'O melhor souvenir é...', options: [o('Bronzeado e conchinhas', 'praia'), o('Uma foto no fim da trilha', 'aventura'), o('Um livro de história local', 'cultura'), o('Temperos e doces típicos na mala', 'gastronomia')] },
    ],
    results: [
      { key: 'praia', title: 'Relax total', art: { g: 'sun', hue: '#ffe680' }, text: 'Seu plano perfeito tem mar, sombra e nada de despertador. Você viaja para recarregar a bateria e volta com aquele bronzeado de quem descansou de verdade.' },
      { key: 'aventura', title: 'Aventureiro nato', art: { g: 'mountain', hue: '#a3e9c9' }, text: 'Trilha, cachoeira, rapel e mochila nas costas. Você viaja para se desafiar e coleciona histórias que começam com “você não vai acreditar no que aconteceu”.' },
      { key: 'cultura', title: 'Explorador cultural', art: { g: 'columns', hue: '#cbbcff' }, text: 'Museus, centros históricos e conversas com quem é do lugar. Você volta de cada viagem sabendo mais sobre o mundo e com um álbum de fotos digno de documentário.' },
      { key: 'gastronomia', title: 'Viajante gourmet', art: { g: 'fork', hue: '#ffc3a3' }, text: 'Você escolhe destino pelo cardápio. Feira, restaurante tradicional e comida de rua: cada viagem é uma degustação, e a mala sempre volta cheia de temperos.' },
    ],
  },
];

// ---------- Lookups ----------
export const quizBySlug = (slug: string) => QUIZZES.find((q) => q.slug === slug);
export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const quizzesIn = (slug: string) => QUIZZES.filter((q) => q.category === slug);
export const hueOf = (quiz: Quiz, art?: Art) => art?.hue ?? quiz.art.hue ?? categoryBySlug(quiz.category)!.hue;
/** "tmdb/movie/948" -> "media/tmdb-movie-948.webp" (downloaded by npm run media). */
export const mediaFile = (ref: string) => `media/${ref.replace(/\//g, '-')}.webp`;
/** ~10 s per question, rounded up to whole minutes. */
export const minutes = (quiz: Quiz) => Math.max(1, Math.ceil((quiz.questions.length * 10) / 60));

// ---------- Scoring ----------
export interface Outcome {
  result: Result;
  /** Trivia: right answers. Enquete: answers that match the simulated majority. */
  score: number;
  total: number;
  /** Personality: every result with its share of the answers, best first. */
  ranking: { result: Result; pct: number }[];
}

export function outcome(quiz: Quiz, picks: number[]): Outcome {
  const total = quiz.questions.length;
  if (quiz.type === 'personalidade') {
    const score = new Map(quiz.results.map((r) => [r.key, 0]));
    quiz.questions.forEach((q, i) => {
      const keys = q.options[picks[i]]?.to?.split(' ') ?? [];
      // Later answers weigh a hair more, so ties always break the same way (towards the latest pick).
      for (const k of keys) score.set(k, (score.get(k) ?? 0) + 1 / keys.length + i * 1e-3);
    });
    const sum = [...score.values()].reduce((a, b) => a + b, 0) || 1;
    const ranking = quiz.results
      .map((result) => ({ result, pct: Math.round(((score.get(result.key) ?? 0) / sum) * 100) }))
      .sort((a, b) => (score.get(b.result.key) ?? 0) - (score.get(a.result.key) ?? 0));
    return { result: ranking[0].result, score: 0, total, ranking };
  }
  const score = quiz.questions.filter((q, i) =>
    quiz.type === 'trivia' ? picks[i] === q.answer : picks[i] === ((q.sim ?? 50) >= 50 ? 0 : 1),
  ).length;
  const result = [...quiz.results].sort((a, b) => (b.min ?? 0) - (a.min ?? 0)).find((r) => score >= (r.min ?? 0))!;
  return { result, score, total, ranking: [] };
}
