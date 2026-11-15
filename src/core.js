/* Manna: estado, datas, XP, ofensiva, missões, liga, conquistas, sons e IA. */

const KEY = 'manna.v1';
const DAY = 86400000;

function fresh() {
  return {
    v: 2, onboarded: false, step: 0,
    quiz: { trilhas: [] }, plano: null, trialStart: null, nome: '', cur: null,
    progress: {}, notes: {}, chests: {},
    streak: { count: 0, last: null, best: 0 }, protetores: 2, lost: null,
    days: [], xp: 0, xpLog: [], grains: 50, boostUntil: 0,
    chapters: 0, chapLog: [], lessons: 0, perfect: 0, bestCombo: 0,
    quests: null, league: { week: null, div: 0 },
    cultos: [], ebds: [], duvidasLidas: [], perguntas: [],
    group: null, ach: {}, offset: 0, sound: true, goal: 30,
    objetivo: '', objSel: [], custom: {}, lidos: {}, hinario: null, hinos: [], gen: {}, fonte: 18,
  };
}
function asArr(v) { return Array.isArray(v) ? v : []; }
function asObj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
function num(v, d, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return d;
  return Math.min(max, Math.max(min, n));
}
function load() {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return fresh();
    const parsed = JSON.parse(r);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fresh();
    const clean = {};
    Object.keys(parsed).forEach(k => {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') return;
      clean[k] = parsed[k];
    });
    const o = Object.assign(fresh(), clean);
    o.quiz = asObj(o.quiz);
    o.quiz.trilhas = asArr(o.quiz.trilhas).filter(id => typeof id === 'string' && id.length < 80);
    o.streak = Object.assign({ count: 0, last: null, best: 0 }, asObj(o.streak));
    o.league = Object.assign({ week: null, div: 0 }, asObj(o.league));
    o.league.div = num(o.league.div, 0, 0, 5);
    ['days', 'xpLog', 'chapLog', 'cultos', 'ebds', 'duvidasLidas', 'perguntas', 'hinos', 'objSel'].forEach(k => { o[k] = asArr(o[k]); });
    ['progress', 'notes', 'chests', 'custom', 'lidos', 'ach', 'gen'].forEach(k => { o[k] = asObj(o[k]); });
    if (o.group && !Array.isArray(asObj(o.group).feed)) o.group = null;
    if (typeof o.nome !== 'string') o.nome = '';
    if (typeof o.objetivo !== 'string') o.objetivo = '';
    o.grains = num(o.grains, 0, 0, 1000000);
    o.xp = num(o.xp, 0, 0, 10000000);
    o.protetores = num(o.protetores, 0, 0, 2);
    o.fonte = num(o.fonte, 18, 14, 26);
    o.goal = [20, 30, 50].includes(Number(o.goal)) ? Number(o.goal) : 30;
    o.offset = num(o.offset, 0, -3650, 3650);
    if (!o.v || o.v < 2) { o.v = 2; o.xp = o.xp || o.points || 0; }
    return o;
  } catch (e) {}
  return fresh();
}
let S = load();
function pruneLogs() {
  const cut = addDays(todayK(), -60);
  if (S.xpLog.length > 300) S.xpLog = S.xpLog.filter(x => x.d >= cut);
  if (S.chapLog.length > 300) S.chapLog = S.chapLog.filter(x => x.d >= cut);
}
function save() {
  try {
    pruneLogs();
    localStorage.setItem(KEY, JSON.stringify(S));
    save.failed = false;
  } catch (e) {
    if (!save.failed && typeof toast === 'function') toast('Não consegui salvar neste aparelho. O espaço do navegador pode ter acabado.');
    save.failed = true;
  }
}

/* Datas */
const now = () => new Date(Date.now() + S.offset * DAY);
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayK = () => keyOf(now());
const parseK = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const diff = (a, b) => Math.round((parseK(b) - parseK(a)) / DAY);
const addDays = (k, n) => keyOf(new Date(parseK(k).getTime() + n * DAY + 3600000));
const fmt = (k, o) => parseK(k).toLocaleDateString('pt-BR', o || { day: 'numeric', month: 'long' });
const weekStart = () => { const d = now(); return keyOf(new Date(d.getTime() - d.getDay() * DAY)); };
const lastSunday = weekStart;

/* Utilidades */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function safeHref(u) {
  const s = String(u || '').trim();
  if (!/^https?:\/\//i.test(s) || /[\s<>"']/.test(s)) return '';
  try {
    const x = new URL(s);
    if (x.protocol !== 'http:' && x.protocol !== 'https:') return '';
    return esc(x.href);
  } catch (e) { return ''; }
}
function noteKey(id, idx) { return id + ':' + idx; }
function lessonNote(id, idx) {
  const k = noteKey(id, idx);
  if (S.notes[k] != null && S.notes[k] !== '') return S.notes[k];
  return S.notes[id + idx] || '';
}
function setLessonNote(id, idx, text) {
  S.notes[noteKey(id, idx)] = text;
  const old = id + idx;
  if (old !== noteKey(id, idx) && S.notes[old] != null) delete S.notes[old];
}
const $ = id => document.getElementById(id);
const val = id => ($(id) ? $(id).value.trim() : '');
const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);
const trilha = id => id ? (TRILHAS.find(t => t.id === id) || (S.custom && S.custom[id]) || trilhaGen(id)) : null;
const desafio = id => DESAFIOS.find(d => d.id === id);
const uid = () => Math.random().toString(36).slice(2, 9);
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const studiedToday = () => S.days.includes(todayK());
const doneCount = id => trilha(id) ? Math.min(S.progress[id] || 0, trilha(id).licoes.length) : 0;
const isDone = id => !!trilha(id) && doneCount(id) >= trilha(id).licoes.length;
const tradicao = () => S.quiz.tradicao || null;
const curTrail = () => {
  S.quiz.trilhas = S.quiz.trilhas.filter(id => trilha(id));
  if (!S.quiz.trilhas.length) S.quiz.trilhas = ['joao'];
  if (!S.cur || !S.quiz.trilhas.includes(S.cur)) S.cur = S.quiz.trilhas.find(id => !isDone(id)) || S.quiz.trilhas[0];
  return S.cur;
};

/* UI (não salvo) */
const ui = { tab: 'jornada', bib: null, bibMode: 'biblia', expl: 'Sugestões', sug: null, sugBusy: false, ov: null, L: null, pop: null, domMode: 'culto', ebdModo: 'aluno', ligaMode: 'liga', busy: false, aiText: '', aiErr: '', filtro: '', toast: '', notice: '', groupMode: null, confirmReset: false };

const toastQ = [];
function toast(msg) {
  if (!msg) return;
  toastQ.push(String(msg));
  if (toastQ.length > 6) toastQ.splice(0, toastQ.length - 6);
  if (!toast.busy) nextToast();
}
function nextToast() {
  if (!toastQ.length) { toast.busy = false; ui.toast = ''; if (typeof renderToast === 'function') renderToast(); return; }
  toast.busy = true;
  ui.toast = toastQ.shift();
  if (typeof renderToast === 'function') renderToast();
  clearTimeout(toast.t);
  toast.t = setTimeout(nextToast, 2600);
}

/* XP e grãos */
const boostOn = () => S.boostUntil > Date.now();
function addXP(n) {
  if (boostOn()) n *= 2;
  S.xp += n; S.xpLog.push({ d: todayK(), x: n });
  bump('xp', n); checkAch();
  return n;
}
const todayXP = () => S.xpLog.filter(x => x.d === todayK()).reduce((a, x) => a + x.x, 0);
const weekXPFrom = (start) => S.xpLog.filter(x => x.d >= start && diff(start, x.d) < 7).reduce((a, x) => a + x.x, 0);
const inWeek = (d, start) => d >= start && diff(start, d) < 7;
const weekChaps = () => { const start = weekStart(); return S.chapLog.filter(x => inWeek(x.d, start)).reduce((a, x) => a + x.c, 0); };
const weekDays = () => { const start = weekStart(); return S.days.filter(d => inWeek(d, start)).length; };

/* Ofensiva */
function study(caps) {
  const t = todayK(), st = S.streak; let up = false;
  ui.novoRecorde = false;
  if (st.last !== t) {
    const next = st.last && diff(st.last, t) === 1 ? st.count + 1 : 1;
    ui.novoRecorde = st.best > 0 && next > st.best;
    st.count = next;
    st.last = t; st.best = Math.max(st.best, st.count); up = true;
  }
  if (!S.days.includes(t)) S.days.push(t);
  if (caps) { S.chapters += caps; S.chapLog.push({ d: t, c: caps }); bump('caps', caps); }
  checkAch(); save();
  return up;
}
function checkStreak() {
  const st = S.streak, t = todayK();
  if (!st.last || !st.count) return;
  const missed = diff(st.last, t) - 1;
  if (missed < 1) return;
  if (missed <= S.protetores) {
    S.protetores -= missed; st.last = addDays(t, -1);
    ui.notice = (missed === 1 ? 'Você não estudou ontem' : 'Você ficou ' + missed + ' dias sem estudar') + ', e ' + plural(missed, 'protetor salvou', 'protetores salvaram') + ' sua ofensiva de ' + plural(st.count, 'dia', 'dias') + '.';
  } else {
    S.lost = { count: st.count, d: t };
    ui.notice = 'Sua ofensiva de ' + plural(st.count, 'dia', 'dias') + ' acabou. Dá para recuperar na loja hoje, ou começar outra.';
    st.count = 0;
  }
  save();
}

/* Missões do dia */
const QUEST_POOL = [
  { id: 'xp', m: 'xp', ns: [20, 30, 40], t: n => 'Ganhe ' + n + ' XP' },
  { id: 'ore', m: 'ore', ns: [1], t: () => 'Ore com a porção de hoje' },
  { id: 'licoes', m: 'licoes', ns: [1, 2], t: n => n === 1 ? 'Complete uma lição' : 'Complete ' + n + ' lições' },
  { id: 'reflexao', m: 'reflexao', ns: [1, 2], t: n => n === 1 ? 'Escreva uma reflexão' : 'Escreva ' + n + ' reflexões' },
  { id: 'caps', m: 'caps', ns: [2, 3], t: n => 'Leia ' + n + ' capítulos' },
  { id: 'duvida', m: 'duvida', ns: [1], t: () => 'Estude uma dúvida da biblioteca' },
];
function ensureQuests() {
  const t = todayK();
  if (S.quests && S.quests.d === t && S.quests.list.every(q => questDef(q.id))) return;
  const h = hash(t), pool = QUEST_POOL.slice(), list = [pool.splice(0, 1)[0]];
  for (let i = 0; i < 2; i++) list.push(pool.splice((h >> (i * 5)) % pool.length, 1)[0]);
  S.quests = { d: t, list: list.map((q, i) => ({ id: q.id, n: q.ns[(h >> (i * 3 + 2)) % q.ns.length], p: 0, claimed: false })) };
}
const questDef = id => QUEST_POOL.find(q => q.id === id);
function bump(metric, amount) {
  ensureQuests();
  S.quests.list.forEach(q => {
    const d = questDef(q.id); if (d.m !== metric) return;
    const before = q.p >= q.n;
    q.p = d.max ? Math.max(q.p, amount) : q.p + amount;
    if (!before && q.p >= q.n) setTimeout(() => { toast('Missão cumprida: ' + d.t(q.n)); SND.check(); }, 600);
  });
}

/* Liga semanal (participantes de exemplo nesta versão) */
const LIGAS = [
  { nome: 'Semente', cor: '#C9A46A' }, { nome: 'Broto', cor: '#9CC28A' }, { nome: 'Ramo', cor: '#A9C6E8' },
  { nome: 'Videira', cor: '#C59BD0' }, { nome: 'Oliveira', cor: '#F2C14E' }, { nome: 'Cedro', cor: '#E8E2D0' },
];
S.league.div = Math.max(0, Math.min(LIGAS.length - 1, Number(S.league.div) || 0));
const RIVAIS = ['Débora', 'Pr. Samuel', 'Lucas', 'Raquel', 'Tiago', 'Ana Clara', 'Josué', 'Priscila', 'Mateus'];
function leagueTable(week, dayIdx) {
  const div = S.league.div;
  const rows = RIVAIS.map(n => {
    const h = hash(week + n);
    const base = 4 + (h % 28) + div * 5;
    const xp = Math.max(0, Math.floor(base * (dayIdx + 1) * (0.7 + ((h >> 8) % 60) / 100)));
    return { nome: n, xp };
  });
  rows.push({ nome: S.nome || 'Você', xp: weekXPFrom(week), me: true });
  return rows.sort((a, b) => b.xp - a.xp || (a.me ? -1 : b.me ? 1 : a.nome.localeCompare(b.nome, 'pt')));
}
function checkLeague() {
  const w = weekStart();
  if (!S.league.week) { S.league.week = w; return; }
  if (S.league.week === w) return;
  const rows = leagueTable(S.league.week, 6), pos = rows.findIndex(r => r.me) + 1;
  const antes = S.league.div;
  if (pos <= 3 && S.league.div < LIGAS.length - 1) S.league.div++;
  else if (pos >= 9 && S.league.div > 0) S.league.div--;
  S.league.week = w;
  const d = S.league.div;
  ui.notice = 'A liga da semana passada acabou: você ficou em ' + pos + 'º. ' + (d > antes ? 'Você subiu para a Liga ' + LIGAS[d].nome + '.' : d < antes ? 'Você voltou para a Liga ' + LIGAS[d].nome + '.' : 'Você continua na Liga ' + LIGAS[d].nome + '.');
  save();
}

/* Conquistas em níveis */
const ACH = [
  { id: 'fiel', nome: 'Fiel', desc: 'dias seguidos', cor: '#F2C14E', v: s => s.streak.best, n: [3, 7, 14, 30, 100] },
  { id: 'leitor', nome: 'Leitor', desc: 'capítulos lidos', cor: '#A9C6E8', v: s => s.chapters, n: [10, 50, 100, 250, 500] },
  { id: 'estudioso', nome: 'Estudioso', desc: 'lições feitas', cor: '#9CC28A', v: s => s.lessons, n: [5, 20, 50, 100, 200] },
  { id: 'perfeito', nome: 'Coração atento', desc: 'porções com reflexão escrita', cor: '#E8A27A', v: s => s.perfect, n: [1, 5, 15, 40, 100] },
  { id: 'domingo', nome: 'Domingo vivo', desc: 'cultos estudados', cor: '#C59BD0', v: s => s.cultos.length, n: [1, 4, 12, 26, 52] },
  { id: 'curioso', nome: 'Curioso', desc: 'dúvidas estudadas', cor: '#E8E2D0', v: s => s.duvidasLidas.length + s.perguntas.length, n: [1, 5, 10, 20, 40] },
  { id: 'colhedor', nome: 'Colhedor', desc: 'XP no total', cor: '#D9B45A', v: s => s.xp, n: [100, 500, 1500, 4000, 10000] },
];
const achLevel = a => a.n.filter(x => a.v(S) >= x).length;
function checkAch() {
  ACH.forEach(a => {
    const l = achLevel(a);
    if (l > (S.ach[a.id] || 0)) { S.ach[a.id] = l; setTimeout(() => { toast('Conquista: ' + a.nome + ', nível ' + l); SND.conquista(); }, 900); }
  });
}

/* Sons do Manna: sintetizados no próprio app (sino, harpa e marimba), com um eco suave de igreja.
   Tocam só depois de um toque da pessoa e respeitam o ajuste "Sons do app" no Perfil. */
let actx = null, mix = null;
function audio() {
  if (!S.sound) return null;
  try {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const master = actx.createGain(); master.gain.value = 0.55; master.connect(actx.destination);
      /* eco: resposta de impulso curta gerada com ruído que decai */
      const len = Math.floor(actx.sampleRate * 1.6), ir = actx.createBuffer(2, len, actx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      const rev = actx.createConvolver(); rev.buffer = ir;
      const wet = actx.createGain(); wet.gain.value = 0.22; rev.connect(wet); wet.connect(master);
      const dry = actx.createGain(); dry.gain.value = 1; dry.connect(master);
      mix = { dry, rev };
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  } catch (e) { return null; }
}
function voz(f, t, dur, vol, parciais, eco) {
  const ac = actx, out = ac.createGain();
  out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(vol, t + 0.008); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  out.connect(mix.dry); if (eco) out.connect(mix.rev);
  parciais.forEach(([mult, g, tipo]) => {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = tipo || 'sine'; o.frequency.value = f * mult; og.gain.value = g;
    o.connect(og); og.connect(out); o.start(t); o.stop(t + dur + 0.05);
  });
}
const NOTA = n => 440 * Math.pow(2, (n - 69) / 12);          /* número MIDI para Hz */
const harpa = (n, t, dur, vol) => voz(NOTA(n), t, dur || 1.1, vol || 0.16, [[1, 1], [2, .35], [3, .12, 'triangle']], true);
const sino = (n, t, dur, vol) => voz(NOTA(n), t, dur || 2.2, vol || 0.12, [[1, 1], [2.0, .5], [2.76, .35], [5.4, .12]], true);
const marimba = (n, t, vol) => voz(NOTA(n), t, 0.35, vol || 0.14, [[1, 1], [4, .18]], false);
function tocar(fn) { const ac = audio(); if (!ac) return; try { fn(ac.currentTime + 0.01); } catch (e) {} }
const SND = {
  toque: () => tocar(t => voz(1500, t, 0.05, 0.035, [[1, 1]], false)),
  passo: () => tocar(t => { marimba(76, t, .11); marimba(79, t + .07, .09); }),
  lido: () => tocar(t => harpa(84, t, .8, .1)),
  amem: () => tocar(t => { sino(60, t, 3, .09); sino(67, t + .02, 3, .07); sino(76, t + .35, 2.6, .06); }),
  fim: () => tocar(t => { [60, 64, 67, 72, 76].forEach((n, i) => harpa(n, t + i * .11, 1.4, .13)); sino(84, t + .62, 2.4, .07); }),
  ofensiva: () => tocar(t => { [67, 71, 74, 79].forEach((n, i) => marimba(n, t + i * .08, .13)); sino(86, t + .36, 2, .06); }),
  vaso: () => tocar(t => { [79, 84, 88, 91, 96].forEach((n, i) => harpa(n, t + i * .06 + Math.random() * .02, .7, .08)); }),
  check: () => tocar(t => { sino(72, t, 1.8, .08); sino(79, t + .12, 1.8, .07); }),
  conquista: () => tocar(t => { [72, 76, 79].forEach(n => sino(n, t, 2.6, .06)); harpa(84, t + .2, 1.2, .09); }),
  reacao: () => tocar(t => marimba(81, t, .08)),
  aviso: () => tocar(t => { marimba(64, t, .1); marimba(60, t + .1, .08); }),
  passos: n => tocar(t => { for (let i = 0; i < Math.min(n || 4, 8); i++) marimba(i % 2 ? 74 : 72, t + i * .16, .06); }),
};
SND.certo = SND.check; SND.errado = SND.aviso;

/* Chuva de maná: animação de celebração */
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function rain(n) {
  if (reduceMotion()) return;
  document.querySelectorAll('canvas.rain').forEach(x => x.remove());
  const c = document.createElement('canvas'); c.className = 'rain'; document.body.appendChild(c); setTimeout(() => c.remove(), 2800);
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  const gs = Array.from({ length: n || 70 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, v: 2.2 + Math.random() * 3, r: Math.random() * 6, s: 0.6 + Math.random() * 0.8, w: (Math.random() - .5) * 0.06 }));
  const t0 = performance.now();
  (function f(t) {
    const el = t - t0; x.clearRect(0, 0, W, H);
    gs.forEach(g => {
      g.y += g.v; g.r += g.w; g.x += Math.sin((g.y + g.r * 40) / 40) * 0.6;
      x.save(); x.translate(g.x, g.y); x.rotate(g.r); x.globalAlpha = Math.max(0, 1 - Math.max(0, el - 1800) / 600);
      x.fillStyle = '#F2C14E'; x.beginPath(); x.ellipse(0, 0, 4 * g.s, 6.5 * g.s, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#D9A63A'; x.beginPath(); x.ellipse(1.4 * g.s, 1 * g.s, 2 * g.s, 4.5 * g.s, 0, 0, Math.PI * 2); x.fill();
      x.restore();
    });
    if (el < 2400 && c.isConnected) requestAnimationFrame(f); else c.remove();
  })(t0);
}
function countUp() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = Number(el.dataset.count), suf = el.dataset.suf || '';
    if (reduceMotion()) { el.textContent = end + suf; return; }
    const t0 = performance.now();
    (function f(t) { const p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(f); })(t0);
  });
}

/* IA (capability "sample" do Claude). Sem ela, o app usa conteúdo pronto. */
const samplePromise = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);
let SAMPLE = null, aiChecked = false;
samplePromise.then(s => { SAMPLE = s; aiChecked = true; if (!ui.L) render(); });
const aiMsg = e => ({
  not_granted: 'O uso da IA não foi permitido nesta página. O resto do app funciona normalmente.',
  rate_limited: 'Muitos pedidos seguidos. Espere um minuto e tente de novo.',
  cancelled: 'Pedido cancelado.',
}[e && e.code] || 'Não deu para gerar agora. Tente de novo em instantes.');
let aiCtl = null;
const REGRAS = 'Você é o assistente de estudo bíblico do app Manna, para evangélicos brasileiros. Escreva em português do Brasil, com linguagem evangélica brasileira simples e respeitosa. Não use travessões. Não cite literalmente o texto de versões protegidas (ARA, ARC, NVI, NAA, NTLH): use referências (ex.: João 3:16) e explique com suas palavras. Nunca dê veredito único em tema que divide as igrejas evangélicas. Não invente fatos.';
