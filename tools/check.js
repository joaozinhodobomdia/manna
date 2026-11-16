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
    vBiblia, vJornada, vDomingo, vDuvidas, vGrupoTab, vPerfil, vLoja, vHinario, vCulto, vEbd,
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

if (failed) { console.error(failed, 'falha(s)'); process.exit(1); }
console.log('tudo certo');
