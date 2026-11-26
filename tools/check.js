/* Checagem do Manna sem navegador. Rode: node tools/check.js */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const files = ['data.js', 'art.js', 'core.js', 'catalog.js', 'content.js', 'game.js', 'screens2.js', 'screens.js'];
let failed = 0;
function eq(name, got, want) {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { failed++; console.error('FALHOU', name, 'recebi', a, 'esperava', b); }
  else console.log('ok', name);
}
function ok(name, cond) {
  if (!cond) { failed++; console.error('FALHOU', name); }
  else console.log('ok', name);
}

function boot(saved) {
  const store = {};
  const ctx2d = new Proxy({}, { get: () => () => {} });
  const el = () => ({
    style: {}, className: '', width: 0, height: 0, isConnected: true, value: '',
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, appendChild() {}, remove() {}, focus() {},
    getContext: () => ctx2d, getBoundingClientRect: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  });
  const document = {
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement: el,
    head: { appendChild() {} },
    body: { appendChild() {}, classList: { toggle() {}, add() {}, remove() {} } },
    addEventListener() {},
  };
  const context = {
    console, URL, Date, Math, Number, String, Object, Array, JSON, Set, Map, Promise, RegExp,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    setTimeout() { return 0; },
    clearTimeout() {},
    innerWidth: 390, innerHeight: 844,
    document, navigator: { clipboard: { writeText: () => Promise.resolve() } },
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v) { store[k] = String(v); },
      removeItem(k) { delete store[k]; },
    },
    window: null,
  };
  context.window = {
    matchMedia: () => ({ matches: false }),
    scrollTo() {}, scrollY: 0, innerHeight: 844, devicePixelRatio: 1,
    addEventListener() {},
    AudioContext: undefined,
    claude: undefined,
    document,
  };
  vm.createContext(context);
  if (saved !== undefined) context.localStorage.setItem('manna.v1', JSON.stringify(saved));
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, 'src', f), 'utf8'), context, { filename: f });
  vm.runInContext(`globalThis.T = {
    parseRef, safeHref, weekStart, addDays, todayK, makeGroup, finishLesson, ranking,
    vBiblia, vJornada, vDomingo, vDuvidas, vGrupoTab, vPerfil, vLoja, vHinario, vCulto, vEbd, vOnboarding, vLessonScreen, vPlus, vLeituraFocada, vIgreja, vQuizSug,
    MANNA, plusAtivo, iniciarTeste, gastarIa, eRecursoPlus, salaDe, DEV_STEPS,
    perfilIgreja, termosBuscaIgreja, igrejasCompativeis, urlMapaIgreja, BASE_IGREJAS, pontuarIgreja,
    livro: i => LIVROS[i][0],
    get S() { return S; },
    get ui() { return ui; },
  };`, context);
  return context.T;
}

const app = boot(null);
const ref = (r, vers) => app.parseRef(r).map(s => app.livro(s.b) + ' ' + s.c + (vers && s.v1 ? ':' + s.v1 : ''));
eq('Jo. 3:16 é João', ref('Jo. 3:16', true), ['João 3:16']);
eq('1 Jo. 1:9 é 1 João', ref('1 Jo. 1:9', true), ['1 João 1:9']);
eq('1Jo 1 é 1 João', ref('1Jo 1', false), ['1 João 1']);
eq('2 Co 5 é 2 Coríntios', ref('2 Co. 5:17', true), ['2 Coríntios 5:17']);
eq('Jo 1 continua Jó', ref('Jo 1', false), ['Jó 1']);
eq('Sl 23 é Salmos', ref('Sl 23', false), ['Salmos 23']);
eq('javascript: não vira link', app.safeHref('javascript:alert(1)'), '');
eq('https entra', app.safeHref('https://youtu.be/abc').startsWith('https://youtu.be/abc'), true);

const seg = new Date(2026, 10, 16, 15, 0, 0);
app.S.offset = Math.round((seg.getTime() - Date.now()) / 86400000);
eq('semana começa no domingo', app.weekStart(), '2026-11-15');
eq('sábado fecha a semana', app.addDays(app.weekStart(), 6), '2026-11-21');

app.S.onboarded = true;
app.S.quiz.trilhas = ['joao'];
app.S.cur = 'joao';
app.makeGroup('Célula', 'evangelhos30');
app.S.group.start = app.todayK();
app.S.reflex = { 'joao:0': ['isto fica só comigo e não pode ir ao grupo'] };
app.ui.L = {
  id: 'joao', idx: 0, review: false, steps: [{ k: 'hoje', n: 'Para hoje' }], i: 4,
  phase: 'steps', t0: Date.now(), lido: true, orou: true,
  dev: { tema: 'O Verbo', verso: { ref: 'João 1:1', t: 'No princípio' }, meditacao: ['a'], perguntas: ['b'], oracao: 'c', hoje: 'd' },
  vs: [],
};
app.finishLesson();
const post = app.S.group.feed[0];
ok('reflexão não vai no texto do grupo', post.text.indexOf('isto fica só comigo') === -1);
ok('o grupo recebe só o recado da porção', post.text.indexOf('O Verbo') !== -1);
const debora = app.ranking().find(r => r.nome === 'Débora');
eq('no dia 1 Débora fica na base, sem somar a semana', debora.caps, 6);

const ruim = {
  v: 2, onboarded: true, nome: 'Ana',
  streak: { count: 4, last: 12, best: 4 },
  league: { week: 3, div: 80 },
  quests: { d: '2026-01-01', list: 'nope' },
  group: { nome: 'Casa', start: '2026-11-16', chapAtStart: -4, feed: [null, { foto: '"><img onerror=alert(1)>', d: 'ontem', text: 4, who: 2 }] },
  cultos: [{ tema: 'Fé', link: 'javascript:alert(1)' }, null],
  ebds: [{ tema: 'Jó', prep: null }],
  hinos: [{ id: 'a', n: 5000, t: 'x'.repeat(200) }, { n: 3 }],
  lastRead: '99:9',
  days: [1, '2026-11-16', 'ontem'],
  lidos: { '0:1': 5, '1:1': '2026-11-16' },
  trialStart: 'ontem',
  reflex: 'oi',
  gen: { 'dev:João 1': 'ruim' },
  custom: { a: { nome: 'sem lições' } },
  xpLog: [1, { d: 'ruim', x: 3 }, { d: '2026-11-16', x: 10 }],
  perguntas: [{ q: 1 }, { id: 'p1', q: 'Posso?', trad: null }],
};
let quebrado;
try { quebrado = boot(ruim); }
catch (e) { failed++; console.error('FALHOU abrir com dados ruins', e); }
if (quebrado) {
  ok('ofensiva ruim não apaga a conta', quebrado.S.streak.count === 4 && quebrado.S.streak.last === null);
  ok('divisão absurda fica no teto e a semana inválida é refeita', quebrado.S.league.div === 5 && /^\d{4}-\d{2}-\d{2}$/.test(quebrado.S.league.week));
  ok('foto quebrada sai do grupo', quebrado.S.group && quebrado.S.group.feed.length === 1 && !quebrado.S.group.feed[0].foto);
  ok('link javascript do culto é apagado', quebrado.S.cultos[0].link === '' && Array.isArray(quebrado.S.cultos[0].feitos));
  ok('hino passa de 999 vira 999 e título curto', quebrado.S.hinos.length === 1 && quebrado.S.hinos[0].n === 999 && quebrado.S.hinos[0].t.length === 80);
  ok('capítulo inexistente não quebra a Bíblia', quebrado.vBiblia().indexOf('Continuar em') === -1);
  ['vJornada', 'vDomingo', 'vDuvidas', 'vGrupoTab', 'vPerfil', 'vLoja', 'vHinario'].forEach(fn => {
    try { String(quebrado[fn]()); ok(fn + ' com dados ruins', true); }
    catch (e) { failed++; console.error('FALHOU', fn, e); }
  });
  try { quebrado.vCulto(quebrado.S.cultos[0].id); ok('culto com dados ruins', true); }
  catch (e) { failed++; console.error('FALHOU culto', e); }
  try { quebrado.vEbd(quebrado.S.ebds[0].id); ok('ebd com dados ruins', true); }
  catch (e) { failed++; console.error('FALHOU ebd', e); }
}

try { boot('não é json'); ok('json inválido abre do zero', true); }
catch (e) { failed++; console.error('FALHOU json inválido', e); }

const preco = boot(null);
eq('preços ainda não definidos', preco.MANNA.precos, { mensal: 'R$ --', anual: 'R$ --', familia: 'R$ --' });
eq('whatsapp ainda sem número', preco.MANNA.whatsapp, '');
eq('devocional em quatro passos', preco.DEV_STEPS.map(s => s.n), ['Citação', 'Passagem', 'Devocional', 'Oração']);
const semPaywall = html => ['R$ 89,90', 'R$ 9,90', 'R$ 149,90', 'R$ 7,49', 'Começar 7 dias grátis'].every(t => String(html).indexOf(t) === -1);
let onbLimpo = true;
for (let i = 0; i < 16; i++) { preco.S.step = i; if (!semPaywall(preco.vOnboarding())) onbLimpo = false; }
ok('onboarding sem paywall obrigatório', onbLimpo);
ok('tela Plus usa placeholder', preco.vPlus().indexOf('R$ --') !== -1 && semPaywall(preco.vPlus()));
preco.ui.L = {
  id: 'joao', idx: 0, review: false, steps: preco.DEV_STEPS, i: 0, phase: 'steps', t0: Date.now(),
  lido: false, orou: false, checks: {}, vs: [{ b: 42, c: 1, v: 1, t: 'No princípio era o Verbo' }],
  dev: { tema: 'O Verbo', verso: { ref: 'João 1:1', t: 'No princípio era o Verbo' }, meditacao: ['Medite.'], perguntas: ['O que ficou?'], oracao: 'Amém.', hoje: 'Ore por alguém.', ia: false },
};
ok('devocional sem paywall', semPaywall(preco.vLessonScreen()) && preco.vLessonScreen().indexOf('Citação') !== -1);
const foco = preco.vLeituraFocada({ ref: 'Gênesis 1:1', t: 'No princípio criou Deus os céus e a terra.', i: 0, n: 31 });
ok('leitura focada sem paywall', foco.indexOf('Próximo versículo') !== -1 && semPaywall(foco));
ok('plano longo é Plus e João continua grátis', preco.eRecursoPlus('plano:biblia1ano') && !preco.eRecursoPlus('joao'));
ok('post antigo entra na discussão', preco.salaDe({ text: 'oi' }) === 'discussao' && preco.salaDe({ sala: 'oracao' }) === 'oracao');
ok('três perguntas grátis e a quarta trava', preco.gastarIa() && preco.gastarIa() && preco.gastarIa() && !preco.gastarIa());
preco.iniciarTeste('anual');
ok('teste de 7 dias libera a próxima pergunta', preco.plusAtivo() && preco.gastarIa());

const antigo = boot({
  v: 2, onboarded: true, nome: 'Ana', xp: 40,
  streak: { count: 9, last: '2026-11-26', best: 12 },
  progress: { joao: 3 },
  trialStart: '2026-11-20', plano: 'anual',
  group: { nome: 'Casa', start: '2026-11-16', chapAtStart: 0, feed: [{ id: 'p1', who: 'Ana', d: '2026-11-16', text: 'leitura antiga' }] },
});
ok('dados antigos continuam', antigo.S.nome === 'Ana' && antigo.S.progress.joao === 3 && antigo.S.streak.count === 9 && antigo.S.group.feed.length === 1);
ok('teste antigo ainda no prazo vira Plus', antigo.plusAtivo());
ok('perfil antigo não trava o app', antigo.S.onboarded && semPaywall(antigo.vPerfil()) && semPaywall(antigo.vJornada()));
const vencido = boot({ v: 2, onboarded: true, nome: 'Bia', trialStart: '2020-01-01', streak: { count: 2, last: '2026-11-25', best: 2 } });
ok('teste vencido não trava', vencido.S.onboarded && !vencido.plusAtivo() && semPaywall(vencido.vPerfil()));
preco.S.iaPermitida = false;
ok('ia revogada não gasta mesmo no Plus', preco.gastarIa() === false);

const perfil = { denom: 'Batista', tradicao: 'batista', celula: 'Célula', momento: 'De 1 a 5 anos', objetivo: 'Quero culto jovem e ministério infantil para a família', interesses: ['escola'] };
eq('termos saem do perfil, sem igreja inventada', preco.termosBuscaIgreja(perfil), 'igreja Batista culto jovem ministério infantil célula escola bíblica');
const exemplos = [
  { nome: 'Comunidade Exemplo', denoms: ['Batista'], tradicao: 'batista', tags: ['celula', 'ebd'], exemplo: true },
  { nome: 'Salão Exemplo', denoms: ['Metodista'], tags: [], exemplo: true },
];
const rank = preco.igrejasCompativeis(perfil, exemplos);
eq('exemplo compatível fica na frente', rank.map(x => x.nome), ['Comunidade Exemplo']);
ok('frase de porquê', rank[0].porque.indexOf('denominação') !== -1 && rank[0].exemplo === true);
ok('base vazia não inventa igreja', preco.igrejasCompativeis(perfil, preco.BASE_IGREJAS).length === 0);
const antes = JSON.stringify(preco.S);
const link = preco.urlMapaIgreja('google', 'igreja Batista', 'Centro', { lat: -23.5501, lng: -46.6339 });
ok('mapa não grava localização', JSON.stringify(preco.S) === antes);
ok('link é só o Google Maps', link.indexOf('https://www.google.com/maps/search/?api=1&query=') === 0);
ok('link da Apple é só o Apple Maps', preco.urlMapaIgreja('apple', 'igreja Batista', '', null).indexOf('https://maps.apple.com/?q=') === 0);
preco.S.quiz.denom = 'Batista';
preco.S.quiz.celula = 'Célula';
const ig = preco.vIgreja();
ok('tela da igreja não inventa nome e não cobra', ig.indexOf('Comunidade Exemplo') === -1 && ig.indexOf('não fica salva') !== -1 && semPaywall(ig) && ig.indexOf('Manna Plus') !== -1);
const livre = boot(null);
livre.S.quiz.trilhas = [];
livre.S.objSel = ['biblia'];
livre.S.objetivo = 'Ler a Bíblia toda';
livre.ui.sug = null;
livre.ui.sugInit = false;
livre.vQuizSug(6);
ok('onboarding grátis não coloca plano longo sozinho', livre.S.quiz.trilhas.length > 0 && !livre.S.quiz.trilhas.some(id => livre.eRecursoPlus(id)));

if (failed) { console.error(failed, 'falha(s)'); process.exit(1); }
console.log('tudo certo');
