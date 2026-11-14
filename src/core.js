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
    objetivo: '', custom: {}, lidos: {}, hinario: null, hinos: [], gen: {}, fonte: 18,
  };
}
function load() {
  try {
    const r = localStorage.getItem(KEY);
    if (r) { const o = Object.assign(fresh(), JSON.parse(r)); if (!o.v || o.v < 2) { o.v = 2; o.xp = o.xp || o.points || 0; } return o; }
  } catch (e) {}
  return fresh();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

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

function toast(msg) {
  ui.toast = msg; renderToast();
  clearTimeout(toast.t); toast.t = setTimeout(() => { ui.toast = ''; renderToast(); }, 3200);
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
const weekChaps = () => S.chapLog.filter(x => diff(x.d, todayK()) < 7).reduce((a, x) => a + x.c, 0);
const weekDays = () => S.days.filter(d => diff(d, todayK()) < 7).length;

/* Ofensiva */
function study(caps) {
  const t = todayK(), st = S.streak; let up = false;
  if (st.last !== t) {
    st.count = st.last && diff(st.last, t) === 1 ? st.count + 1 : 1;
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
  { id: 'combo', m: 'combo', ns: [5, 8], t: n => 'Acerte ' + n + ' respostas seguidas', max: true },
  { id: 'licoes', m: 'licoes', ns: [1, 2], t: n => n === 1 ? 'Complete uma lição' : 'Complete ' + n + ' lições' },
  { id: 'perfeita', m: 'perfeita', ns: [1], t: () => 'Faça uma lição sem errar' },
  { id: 'caps', m: 'caps', ns: [2, 3], t: n => 'Leia ' + n + ' capítulos' },
  { id: 'duvida', m: 'duvida', ns: [1], t: () => 'Estude uma dúvida da biblioteca' },
];
function ensureQuests() {
  const t = todayK();
  if (S.quests && S.quests.d === t) return;
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
    if (!before && q.p >= q.n) setTimeout(() => toast('Missão cumprida: ' + d.t(q.n)), 600);
  });
}

/* Liga semanal (participantes de exemplo nesta versão) */
const LIGAS = [
  { nome: 'Semente', cor: '#C9A46A' }, { nome: 'Broto', cor: '#9CC28A' }, { nome: 'Ramo', cor: '#A9C6E8' },
  { nome: 'Videira', cor: '#C59BD0' }, { nome: 'Oliveira', cor: '#F2C14E' }, { nome: 'Cedro', cor: '#E8E2D0' },
];
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
  return rows.sort((a, b) => b.xp - a.xp || (a.me ? -1 : 1));
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
  { id: 'perfeito', nome: 'Sem tropeço', desc: 'lições sem erro', cor: '#E8A27A', v: s => s.perfect, n: [1, 5, 15, 40, 100] },
  { id: 'domingo', nome: 'Domingo vivo', desc: 'cultos estudados', cor: '#C59BD0', v: s => s.cultos.length, n: [1, 4, 12, 26, 52] },
  { id: 'curioso', nome: 'Curioso', desc: 'dúvidas estudadas', cor: '#E8E2D0', v: s => s.duvidasLidas.length + s.perguntas.length, n: [1, 5, 10, 20, 40] },
  { id: 'colhedor', nome: 'Colhedor', desc: 'XP no total', cor: '#D9B45A', v: s => s.xp, n: [100, 500, 1500, 4000, 10000] },
];
const achLevel = a => a.n.filter(x => a.v(S) >= x).length;
function checkAch() {
  ACH.forEach(a => {
    const l = achLevel(a);
    if (l > (S.ach[a.id] || 0)) { S.ach[a.id] = l; setTimeout(() => toast('Conquista: ' + a.nome + ', nível ' + l), 900); }
  });
}

/* Sons curtos (só depois de um toque do usuário) */
let actx = null;
function tone(notes) {
  if (!S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    let t = actx.currentTime;
    notes.forEach(([f, d]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.start(t); o.stop(t + d + 0.02); t += d * 0.8;
    });
  } catch (e) {}
}
const SND = { certo: () => tone([[660, .12], [990, .22]]), errado: () => tone([[220, .25], [180, .3]]), fim: () => tone([[523, .14], [659, .14], [784, .14], [1047, .4]]), vaso: () => tone([[784, .1], [988, .1], [1319, .3]]) };

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
    if (el < 2400) requestAnimationFrame(f); else c.remove();
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
