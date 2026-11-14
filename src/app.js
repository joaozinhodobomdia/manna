/* Manna V1 de teste: lógica do app. Estado salvo neste aparelho (localStorage). */

const KEY = 'manna.v1';
const DAY = 86400000;

function fresh() {
  return {
    v: 1, onboarded: false, step: 0,
    quiz: { trilhas: [] }, plano: null, nome: '',
    progress: {}, notes: {},
    streak: { count: 0, last: null, best: 0 }, protetores: 2,
    days: [], points: 0, chapters: 0, chapLog: [],
    cultos: [], ebds: [], duvidasLidas: [], perguntas: [],
    group: null, ach: {}, offset: 0,
  };
}
function load() {
  try { const r = localStorage.getItem(KEY); if (r) return Object.assign(fresh(), JSON.parse(r)); } catch (e) {}
  return fresh();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* UI (não salvo) */
const ui = { tab: 'hoje', ov: null, domMode: 'culto', busy: false, aiText: '', aiErr: '', filtro: '', confirmReset: false, toast: '', notice: '', groupMode: null, done: null };

/* Datas */
const now = () => new Date(Date.now() + S.offset * DAY);
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayK = () => keyOf(now());
const parseK = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const diff = (a, b) => Math.round((parseK(b) - parseK(a)) / DAY);
const addDays = (k, n) => keyOf(new Date(parseK(k).getTime() + n * DAY + 3600000));
const fmt = (k, o) => parseK(k).toLocaleDateString('pt-BR', o || { day: 'numeric', month: 'long' });
const lastSunday = () => { const d = now(); return keyOf(new Date(d.getTime() - d.getDay() * DAY)); };

/* Utilidades */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = id => document.getElementById(id);
const val = id => ($(id) ? $(id).value.trim() : '');
const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);
const trilha = id => TRILHAS.find(t => t.id === id);
const desafio = id => DESAFIOS.find(d => d.id === id);
const studiedToday = () => S.days.includes(todayK());
const doneCount = id => Math.min(S.progress[id] || 0, trilha(id).licoes.length);
const isDone = id => doneCount(id) >= trilha(id).licoes.length;
const level = () => Math.floor(S.points / 150) + 1;
const tradicao = () => S.quiz.tradicao || null;
const uid = () => Math.random().toString(36).slice(2, 9);

function toast(msg) {
  ui.toast = msg; renderToast();
  clearTimeout(toast.t); toast.t = setTimeout(() => { ui.toast = ''; renderToast(); }, 3200);
}

/* Ofensiva e pontos */
function study(caps, pts) {
  const t = todayK(), st = S.streak;
  if (st.last !== t) {
    st.count = st.last && diff(st.last, t) === 1 ? st.count + 1 : 1;
    st.last = t; st.best = Math.max(st.best, st.count);
  }
  if (!S.days.includes(t)) S.days.push(t);
  S.points += pts;
  if (caps) { S.chapters += caps; S.chapLog.push({ d: t, c: caps }); }
  checkAch(); save();
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
    ui.notice = 'Sua ofensiva de ' + plural(st.count, 'dia', 'dias') + ' acabou. O maná cai de novo todo dia: comece outra hoje.';
    st.count = 0;
  }
  save();
}
const weekChaps = () => S.chapLog.filter(x => diff(x.d, todayK()) < 7).reduce((a, x) => a + x.c, 0);
const weekDays = () => S.days.filter(d => diff(d, todayK()) < 7).length;

/* Conquistas */
const ACH = [
  ['primeira', 'Primeira porção', 'Fez a primeira lição.', s => s.days.length >= 1],
  ['dias7', '7 dias seguidos', 'Uma semana sem parar.', s => s.streak.best >= 7],
  ['dias30', '30 dias seguidos', 'Um mês sem parar.', s => s.streak.best >= 30],
  ['livro1', 'Primeiro livro concluído', 'Terminou uma trilha de livro.', s => TRILHAS.some(t => t.tipo === 'Livro' && (s.progress[t.id] || 0) >= t.licoes.length)],
  ['culto1', 'Domingo virou semana', 'Registrou o primeiro culto.', s => s.cultos.length >= 1],
  ['ebd1', 'Pronto para a EBD', 'Preparou a primeira lição de EBD.', s => s.ebds.length >= 1],
  ['duvidas5', 'Sem vergonha de perguntar', 'Estudou 5 dúvidas.', s => s.duvidasLidas.length + s.perguntas.length >= 5],
  ['grupo', 'Junto com os irmãos', 'Entrou num grupo.', s => !!s.group],
  ['cap50', '50 capítulos', 'Leu 50 capítulos no Manna.', s => s.chapters >= 50],
];
function checkAch() {
  ACH.forEach(([id, nome, , test]) => {
    if (!S.ach[id] && test(S)) { S.ach[id] = todayK(); setTimeout(() => toast('Conquista: ' + nome), 400); }
  });
}

/* Plano */
function porDia() { return S.quiz.minutos === 20 ? 2 : 1; }
function ritmo() { return { 5: 5, 10: 6, 20: 7 }[S.quiz.minutos || 10]; }
function nextTrail() { return S.quiz.trilhas.find(id => !isDone(id)) || null; }
function planEnd(id) {
  let acc = 0;
  for (const t of S.quiz.trilhas) {
    acc += trilha(t).licoes.length - doneCount(t);
    if (t === id) break;
  }
  const weeks = acc / (ritmo() * porDia());
  return addDays(todayK(), Math.ceil(weeks * 7));
}

/* IA (capability "sample" do Claude). Sem ela, o app usa conteúdo pronto. */
const samplePromise = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);
let SAMPLE = null, aiChecked = false;
samplePromise.then(s => { SAMPLE = s; aiChecked = true; render(); });
const aiMsg = e => ({
  not_granted: 'O uso da IA não foi permitido nesta página. O resto do app funciona normalmente.',
  rate_limited: 'Muitos pedidos seguidos. Espere um minuto e tente de novo.',
  cancelled: 'Pedido cancelado.',
}[e && e.code] || 'Não deu para gerar agora. Tente de novo em instantes.');
let aiCtl = null;

const REGRAS = 'Você é o assistente de estudo bíblico do app Manna, para evangélicos brasileiros. Escreva em português do Brasil, com linguagem evangélica brasileira simples e respeitosa. Não use travessões. Não cite literalmente o texto de versões protegidas (ARA, ARC, NVI, NAA, NTLH): use referências (ex.: João 3:16) e explique com suas palavras. Nunca dê veredito único em tema que divide as igrejas evangélicas. Não invente fatos sobre a igreja ou o pregador.';

/* Domingo: estudo da semana */
function localStudy(c) {
  const refs = (c.versiculos || '').split(/[;\n]+/).map(s => s.trim()).filter(Boolean);
  const r = i => refs.length ? refs[i % refs.length] : 'Um texto ligado ao tema';
  const T = [
    ['O texto principal', 'Releia o texto da pregação devagar. O que chamou sua atenção no domingo?'],
    ['O contexto', 'Leia o capítulo inteiro em volta do texto. Quem fala, para quem e por quê?'],
    ['O que Deus revela', 'O que este texto mostra sobre quem Deus é?'],
    ['Como viver isso', 'Que atitude concreta este tema pede de você esta semana?'],
    ['Compartilhe', 'Com quem você vai conversar sobre esta mensagem antes do próximo culto?'],
  ];
  return {
    resumo: 'Estudo montado a partir do tema "' + c.tema + '"' + (refs.length ? ' e dos textos ' + refs.join(', ') : '') + '. Sem a IA, o Manna usa um roteiro padrão de cinco dias.',
    pontos: ['Leia os textos citados no culto.', 'Anote o que Deus falou com você.', 'Coloque uma atitude em prática.'],
    versiculos: refs,
    dias: T.map((t, i) => ({ titulo: t[0], referencia: r(i), pergunta: t[1] })),
    meta: null, ia: false,
  };
}
async function genStudy(c) {
  if (!SAMPLE) return localStudy(c);
  const metas = TRILHAS.map(t => t.id + ' (' + t.nome + ')').join(', ');
  const prompt = REGRAS + '\n\nUma pessoa registrou o culto de domingo da igreja dela. Monte um estudo para a semana a partir das informações abaixo. Você não ouviu a pregação: trabalhe só com o tema e os textos informados, e deixe isso claro no resumo.\n\n' +
    'Tema: ' + c.tema + '\nTextos: ' + (c.versiculos || 'não informados') + '\nPregador: ' + (c.pregador || 'não informado') + '\nAnotações da pessoa: ' + (c.notas || 'nenhuma') + '\nDenominação: ' + (S.quiz.denom || 'não informada') + '\n\n' +
    'Responda só com JSON neste formato: {"resumo": "3 a 4 frases sobre o tema e os textos", "pontos": ["3 a 4 pontos principais curtos"], "versiculos": ["referências citadas e relacionadas"], "dias": [5 objetos {"titulo": "curto", "referencia": "texto bíblico do dia", "pergunta": "uma pergunta de reflexão"}], "meta": "id da trilha que combina com o tema, ou null. Opções: ' + metas + '"}';
  aiCtl = new AbortController();
  const r = await SAMPLE.json(prompt, { signal: aiCtl.signal });
  return { resumo: r.resumo || '', pontos: r.pontos || [], versiculos: r.versiculos || [], dias: (r.dias || []).slice(0, 5), meta: trilha(r.meta) ? r.meta : null, ia: true };
}

/* EBD */
function localEbd(e) {
  const refs = (e.textos || '').split(/[;\n]+/).map(s => s.trim()).filter(Boolean);
  return {
    contexto: 'Leia os textos da lição com calma antes da aula. Procure quem escreveu, para quem e o que estava acontecendo. Sem a IA, o Manna mostra um roteiro padrão.',
    versiculos: refs,
    perguntas: ['O que o texto diz, com as suas palavras?', 'O que ele mostra sobre Deus?', 'O que ele mostra sobre nós?', 'O que muda na sua semana depois desta lição?'],
    aplicacao: 'Escolha uma atitude prática ligada ao tema "' + e.tema + '" e conte para a classe no próximo domingo.',
    roteiro: e.modo === 'professor' ? [
      { etapa: 'Abertura', minutos: 5, descricao: 'Oração e uma pergunta para quebrar o gelo sobre o tema.' },
      { etapa: 'Leitura', minutos: 10, descricao: 'Leitura dos textos em voz alta, alternando os alunos.' },
      { etapa: 'Explicação', minutos: 15, descricao: 'Contexto e pontos principais da lição.' },
      { etapa: 'Discussão', minutos: 15, descricao: 'Grupos de 3 respondem as perguntas e compartilham.' },
      { etapa: 'Aplicação', minutos: 5, descricao: 'Cada um escolhe uma atitude para a semana. Oração final.' },
    ] : [], ia: false,
  };
}
async function genEbd(e) {
  if (!SAMPLE) return localEbd(e);
  const prompt = REGRAS + '\n\nPrepare a lição da Escola Bíblica Dominical (EBD) desta semana. Não reproduza nem imite o texto das revistas de EBD; prepare material próprio a partir do tema e dos textos bíblicos.\n\nTema: ' + e.tema + '\nTextos: ' + (e.textos || 'não informados') + '\nQuem vai usar: ' + (e.modo === 'professor' ? 'professor da classe' : 'aluno') + '\n\n' +
    'Responda só com JSON: {"contexto": "3 a 5 frases de contexto histórico e literário", "versiculos": ["referências principais e de apoio"], "perguntas": ["4 perguntas de discussão"], "aplicacao": "2 frases de aplicação prática"' + (e.modo === 'professor' ? ', "roteiro": [5 objetos {"etapa": "nome", "minutos": número, "descricao": "o que fazer, com uma dinâmica simples quando couber"}] somando 50 minutos' : '') + '}';
  aiCtl = new AbortController();
  const r = await SAMPLE.json(prompt, { signal: aiCtl.signal });
  return { contexto: r.contexto || '', versiculos: r.versiculos || [], perguntas: r.perguntas || [], aplicacao: r.aplicacao || '', roteiro: r.roteiro || [], ia: true };
}

/* Dúvida livre */
async function genDuvida(q) {
  const prompt = REGRAS + '\n\nUma pessoa fez esta pergunta, que talvez tenha vergonha de fazer ao pastor: "' + q + '"\nTradição da pessoa: ' + (TRADICOES[tradicao()] || 'não informada') + '.\n' +
    'Se a pergunta envolver risco de vida, autolesão ou abuso, diga com clareza para buscar ajuda agora (CVV 188, ou 190 em caso de violência) e para falar com alguém de confiança.\n' +
    'Responda só com JSON: {"biblia": "o que a Bíblia diz, 3 a 5 frases", "refs": "referências separadas por ponto e vírgula", "trad": {"pentecostal": "1 ou 2 frases", "batista": "1 ou 2 frases", "reformada": "1 ou 2 frases"}, "comum": "1 ou 2 frases sobre o que as tradições têm em comum ou onde divergem"}. Se as tradições concordam, diga isso.';
  aiCtl = new AbortController();
  const r = await SAMPLE.json(prompt, { signal: aiCtl.signal });
  return { id: 'p' + uid(), q, cat: 'Sua pergunta', biblia: r.biblia || '', refs: r.refs || '', trad: r.trad || {}, comum: r.comum || '', ia: true };
}

/* Grupo (simulado neste aparelho) */
const MEMBROS = [
  { nome: 'Débora', base: 6, rate: 3.1 }, { nome: 'Pr. Samuel', base: 9, rate: 3.4 },
  { nome: 'Lucas', base: 2, rate: 1.6 }, { nome: 'Raquel', base: 4, rate: 2.6 }, { nome: 'Tiago', base: 1, rate: 0.9 },
];
function makeGroup(nome, des) {
  const t = todayK();
  S.group = {
    nome, code: Math.random().toString(36).slice(2, 8).toUpperCase(), desafio: des, start: t, chapAtStart: S.chapters,
    feed: [
      { id: uid(), who: 'Pr. Samuel', d: addDays(t, -1), text: 'Começamos o desafio. Leiam com calma e postem o que Deus falar com vocês.', ref: '', amem: 4, comments: [] },
      { id: uid(), who: 'Débora', d: t, text: 'Li dois capítulos no ônibus hoje. Marcos 1 me lembrou que Jesus começou o ministério orando cedo.', ref: 'Marcos 1:35', amem: 3, comments: [] },
    ],
  };
}
function ranking() {
  const g = S.group, days = Math.max(0, diff(g.start, todayK())) + 1;
  const rows = MEMBROS.map(m => ({ nome: m.nome, caps: Math.floor(m.base + m.rate * (days - 1)), ex: true }));
  rows.push({ nome: S.nome || 'Você', caps: S.chapters - g.chapAtStart, me: true });
  return rows.sort((a, b) => b.caps - a.caps);
}
function postFeed(text, ref) {
  if (!S.group) return;
  S.group.feed.unshift({ id: uid(), who: S.nome || 'Você', me: true, d: todayK(), text, ref: ref || '', amem: 0, comments: [] });
}

/* Ícones simples (só onde ajudam a ler) */
const I = {
  hoje: '<path d="M4 18c3-2 6-2 8 1 2-3 5-3 8-1V7c-3-2-6-2-8 1-2-3-5-3-8-1z"/>',
  domingo: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  duvidas: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>',
  grupo: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.8 14.6c2.3 0 4 1.3 4.7 4"/>',
  perfil: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
};
const icon = (n, cls) => '<svg class="' + (cls || 'ic') + '" viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>';
const LOGO = '<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="var(--noite)"/><path d="M12 40c6.5-3.6 13.5-3.6 20 1.6 6.5-5.2 13.5-5.2 20-1.6v9c-6.5-3.6-13.5-3.6-20 1.6-6.5-5.2-13.5-5.2-20-1.6z" fill="none" stroke="var(--ouro)" stroke-width="3.6" stroke-linejoin="round"/><path d="M32 41.6v8.4" stroke="var(--ouro)" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="34" cy="21" rx="4.6" ry="7" transform="rotate(-24 34 21)" fill="var(--ouro)"/></svg>';
const GRAO = '<svg class="grao" viewBox="0 0 12 16" aria-hidden="true"><ellipse cx="6" cy="8" rx="4" ry="6.2" transform="rotate(-22 6 8)"/></svg>';

/* ---------- Onboarding ---------- */
const QUIZ = [
  { k: 'denom', t: 'Qual é a sua igreja ou denominação?', sub: 'As respostas das dúvidas destacam a visão da sua tradição.', opts: DENOMINACOES.map(d => d[0]) },
  { k: 'convertido', t: 'Há quanto tempo você é convertido?', opts: ['Menos de 1 ano', 'De 1 a 5 anos', 'De 5 a 15 anos', 'Mais de 15 anos', 'Ainda estou conhecendo'] },
  { k: 'leitura', t: 'Como está sua leitura bíblica hoje?', opts: ['Leio todo dia', 'Leio às vezes', 'Parei de ler'] },
  { k: 'minutos', t: 'Quanto tempo você tem por dia?', sub: 'Dá para mudar depois.', opts: [[5, '5 minutos'], [10, '10 minutos'], [20, '20 minutos']] },
  { k: 'trilhas', t: 'O que você quer aprender este ano?', sub: 'Escolha de 1 a 3 metas. A primeira vira a sua porção diária.', multi: true },
  { k: 'celula', t: 'Você participa de célula ou EBD?', opts: ['Célula', 'EBD', 'Os dois', 'Nenhum dos dois'] },
  { k: 'versao', t: 'Qual versão da Bíblia você usa?', sub: 'No teste, o estudo indica a referência e você lê na sua Bíblia.', opts: ['ARA', 'ARC', 'NVI', 'NAA', 'NTLH', 'Outra ou não sei'] },
  { k: 'horario', t: 'Qual horário você prefere para o lembrete?', opts: ['6h', '7h', '12h', '19h', '21h'] },
];

function vOnboarding() {
  const s = S.step;
  if (s === 0) return '<main class="screen center">' + '<div class="hero">' + LOGO.replace('class="logo"', 'class="logo big"') +
    '<h1 class="brand">manna</h1><p class="lead">Sua porção diária da Palavra</p></div>' +
    '<p class="body-l">Suas metas do ano, o culto de domingo e suas dúvidas viram o estudo da semana. E seus amigos da igreja te ajudam a não parar.</p>' +
    '<button class="btn" data-a="next">Montar meu plano</button><p class="fine">Leva 1 minuto. Versão de teste: nada é cobrado.</p></main>';
  if (s >= 1 && s <= QUIZ.length) return vQuiz(QUIZ[s - 1], s);
  if (s === QUIZ.length + 1) return vResultado();
  if (s === QUIZ.length + 2) return vPaywall();
  return vConvite();
}
function quizHead(s) {
  const tot = QUIZ.length;
  return '<div class="qhead"><button class="iconbtn" data-a="back" aria-label="Voltar">' + icon('voltar') + '</button>' +
    '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + tot + '" aria-valuenow="' + s + '"><i style="width:' + (s / tot * 100) + '%"></i></div>' +
    '<span class="muted tnum">' + s + ' de ' + tot + '</span></div>';
}
function vQuiz(q, s) {
  let h = '<main class="screen">' + quizHead(s) + '<h2 class="qt">' + q.t + '</h2>' + (q.sub ? '<p class="muted">' + q.sub + '</p>' : '');
  if (q.multi) {
    const sel = S.quiz.trilhas;
    ['Livro', 'Personagem', 'Tema'].forEach(tp => {
      h += '<h3 class="grp">' + { Livro: 'Um livro', Personagem: 'Um personagem', Tema: 'Um tema' }[tp] + '</h3><div class="opts">';
      TRILHAS.filter(t => t.tipo === tp).forEach(t => {
        const i = sel.indexOf(t.id);
        h += '<button class="opt' + (i > -1 ? ' on' : '') + '" data-a="pickTrail" data-id="' + t.id + '" aria-pressed="' + (i > -1) + '"><span><b>' + t.nome + '</b><small>' + t.desc + '</small></span>' + (i > -1 ? '<em class="ord">' + (i + 1) + '</em>' : '') + '</button>';
      });
      h += '</div>';
    });
    h += '<div class="sticky-cta"><button class="btn" data-a="next"' + (sel.length ? '' : ' disabled') + '>Continuar</button></div>';
  } else {
    h += '<div class="opts">';
    q.opts.forEach(o => {
      const v = Array.isArray(o) ? o[0] : o, label = Array.isArray(o) ? o[1] : o;
      const on = S.quiz[q.k] === v;
      h += '<button class="opt' + (on ? ' on' : '') + '" data-a="answer" data-k="' + q.k + '" data-v="' + esc(v) + '">' + esc(label) + '</button>';
    });
    h += '</div>';
  }
  return h + '</main>';
}
function vResultado() {
  const q = S.quiz, first = trilha(q.trilhas[0]);
  const desafioTxt = (q.celula === 'Célula' || q.celula === 'Os dois') ? 'Convide sua célula para "Evangelhos em 30 dias".' : 'Faça sua porção 7 dias seguidos e ganhe a primeira conquista.';
  let h = '<main class="screen">' + '<h2 class="qt">Seu plano para 2027</h2><p class="muted">Começa hoje, ' + fmt(todayK()) + '. Você chega a 2027 com o hábito formado.</p>';
  h += '<section class="card"><h3>Suas metas</h3><ol class="metas">';
  q.trilhas.forEach(id => {
    const t = trilha(id);
    h += '<li><b>' + t.nome + '</b><span class="muted">' + plural(t.licoes.length, 'lição', 'lições') + ' · até ' + fmt(planEnd(id), { day: 'numeric', month: 'short', year: 'numeric' }) + '</span></li>';
  });
  h += '</ol></section>';
  h += '<section class="card"><h3>Seu ritmo</h3><p>' + ritmo() + ' porções por semana, de ' + q.minutos + ' minutos, com lembrete às ' + (q.horario || '7h') + '. No domingo, o culto vira o estudo da semana.</p></section>';
  h += '<section class="card"><h3>Primeiro desafio</h3><p>' + desafioTxt + '</p></section>';
  h += '<section class="card"><h3>Sua primeira porção</h3><p><b>' + first.licoes[0].ref + '</b>: ' + first.licoes[0].titulo + '</p></section>';
  return h + '<div class="sticky-cta"><button class="btn" data-a="next">Começar meu plano</button></div></main>';
}
function vPaywall() {
  const p = S.plano || 'anual', fim = fmt(addDays(todayK(), 7));
  const plans = [
    ['anual', 'Anual', 'R$ 7,49 por mês', 'R$ 89,90 cobrados uma vez por ano'],
    ['mensal', 'Mensal', 'R$ 9,90 por mês', 'Cancele quando quiser'],
    ['familia', 'Família ou célula', 'R$ 149,90 por ano', 'Até 5 pessoas'],
  ];
  const preco = { anual: 'R$ 89,90 por ano', mensal: 'R$ 9,90 por mês', familia: 'R$ 149,90 por ano' }[p];
  let h = '<main class="screen"><button class="iconbtn" data-a="back" aria-label="Voltar">' + icon('voltar') + '</button>' +
    '<h2 class="qt">Seu plano está pronto. Comece com 7 dias grátis.</h2>' +
    '<ul class="checks"><li>Porção diária das suas metas do ano</li><li>Culto de domingo virando estudo da semana</li><li>Dúvidas respondidas com versículos e as visões das tradições</li><li>Preparação da EBD</li><li>Grupos com desafio e ranking, e protetor de ofensiva</li></ul><div class="opts">';
  plans.forEach(([id, nome, preco1, det]) => {
    h += '<button class="opt plan' + (p === id ? ' on' : '') + '" data-a="plan" data-id="' + id + '" aria-pressed="' + (p === id) + '"><span><b>' + nome + (id === 'anual' ? ' <small class="tag">Mais escolhido</small>' : '') + '</b><small>' + det + '</small></span><strong class="tnum">' + preco1 + '</strong></button>';
  });
  h += '</div><div class="timeline"><p><b>Hoje:</b> R$ 0,00. Acesso completo.</p><p><b>' + fmt(addDays(todayK(), 5)) + ':</b> avisamos que o teste está acabando.</p><p><b>' + fim + ':</b> começa a cobrança de ' + preco + ', se você não cancelar.</p></div>' +
    '<button class="btn" data-a="trial">Começar 7 dias grátis</button>' +
    '<p class="fine">Versão de teste: nenhum pagamento é pedido nem cobrado. No app final, a compra é pela loja ou por Pix e cartão no site.</p></main>';
  return h;
}
function vConvite() {
  return '<main class="screen"><h2 class="qt">Estude junto com a sua igreja</h2><p class="muted">Quem lê com os amigos da célula não para. Crie um grupo e convide pelo WhatsApp, ou entre com um código.</p>' +
    vGroupForms(true) + '<button class="btn ghost" data-a="finish">Agora não</button></main>';
}

/* ---------- App principal ---------- */
function vHoje() {
  const st = S.streak, done = studiedToday(), tid = nextTrail();
  const hour = now().getHours();
  let h = '<header class="top"><div class="mark">' + LOGO + '<span class="brand sm">manna</span></div>' +
    '<div class="streak" title="Ofensiva">' + GRAO + '<b class="tnum">' + st.count + '</b><span>' + (st.count === 1 ? 'dia' : 'dias') + '</span></div></header>';
  h += '<main class="screen">';
  if (ui.notice) h += '<div class="note" role="status">' + esc(ui.notice) + ' <button class="link" data-a="dismiss">Ok</button></div>';
  h += '<h1 class="h1">Sua porção de hoje</h1>';
  if (!done && st.count > 0 && hour >= 19) h += '<p class="risk">Sua ofensiva de ' + plural(st.count, 'dia', 'dias') + ' acaba à meia-noite.</p>';
  if (tid) {
    const t = trilha(tid), i = doneCount(tid), l = t.licoes[i];
    if (done) {
      h += '<section class="card porcao done"><p class="kicker">Porção colhida hoje</p><h2>O maná não se guardava. Volte amanhã para a próxima.</h2><p class="muted">Próxima: ' + l.ref + ', ' + l.titulo + '.</p><button class="btn sec" data-a="lesson" data-id="' + tid + '">Fazer mais uma agora</button></section>';
    } else {
      h += '<section class="card porcao"><p class="kicker">' + t.nome + ' · lição ' + (i + 1) + ' de ' + t.licoes.length + '</p><h2>' + l.titulo + '</h2><p class="ref">' + l.ref + '</p><p class="muted">' + l.ctx + '</p><button class="btn" data-a="lesson" data-id="' + tid + '">Começar · ' + (S.quiz.minutos || 10) + ' min</button></section>';
    }
  } else {
    h += '<section class="card porcao"><h2>Você concluiu todas as suas metas.</h2><p class="muted">Escolha uma nova meta para continuar a porção diária.</p><button class="btn" data-a="open" data-ov="metas">Escolher meta</button></section>';
  }
  const c = S.cultos[0];
  if (c && diff(c.data, todayK()) < 7) {
    const nd = c.study.dias.findIndex((_, i) => !c.feitos.includes(i));
    h += '<section class="card row-card" data-a="open" data-ov="culto" data-id="' + c.id + '" role="button" tabindex="0"><div><p class="kicker">Estudo do culto</p><h3>' + esc(c.tema) + '</h3><p class="muted">' + (nd === -1 ? 'Os 5 dias foram concluídos.' : 'Dia ' + (nd + 1) + ' de 5: ' + esc(c.study.dias[nd].titulo)) + '</p></div><span class="chev">›</span></section>';
  } else {
    h += '<section class="card row-card" data-a="tab" data-tab="domingo" role="button" tabindex="0"><div><h3>Leve o culto de domingo para a semana</h3><p class="muted">Digite o tema e os versículos e receba um estudo de 5 dias.</p></div><span class="chev">›</span></section>';
  }
  h += '<section class="sec"><div class="sec-h"><h2>Suas metas para 2027</h2><button class="link" data-a="open" data-ov="metas">Editar</button></div>';
  S.quiz.trilhas.forEach(id => {
    const t = trilha(id), d = doneCount(id), n = t.licoes.length;
    h += '<button class="meta" data-a="open" data-ov="trilha" data-id="' + id + '"><span class="meta-t"><b>' + t.nome + '</b><span class="muted tnum">' + d + ' de ' + n + '</span></span><span class="bar"><i style="width:' + (d / n * 100) + '%"></i></span></button>';
  });
  h += '</section><section class="stats3"><div><b class="tnum">' + S.chapters + '</b><span>capítulos lidos</span></div><div><b class="tnum">' + S.days.length + '</b><span>dias de estudo</span></div><div><b class="tnum">' + S.points + '</b><span>pontos</span></div></section>';
  if (tid) { const left = trilha(tid).licoes.length - doneCount(tid); h += '<p class="insight">Faltam ' + plural(left, 'lição', 'lições') + ' para concluir ' + trilha(tid).nome + '.</p>'; }
  return h + '</main>';
}

function vDomingo() {
  let h = '<main class="screen"><h1 class="h1">Domingo</h1><div class="seg" role="tablist"><button role="tab" aria-selected="' + (ui.domMode === 'culto') + '" data-a="dom" data-m="culto">Culto</button><button role="tab" aria-selected="' + (ui.domMode === 'ebd') + '" data-a="dom" data-m="ebd">EBD</button></div>';
  if (ui.domMode === 'culto') {
    h += '<p class="muted">Registre o culto e receba um estudo de segunda a sexta.</p><form class="form" data-f="culto">' +
      '<label>Tema da pregação<input id="c-tema" required maxlength="140" placeholder="Ex.: A fé que vence o medo"></label>' +
      '<label>Versículos citados<textarea id="c-vers" rows="2" placeholder="Ex.: Josué 1:9; Marcos 4:35-41"></textarea></label>' +
      '<div class="two"><label>Pregador<input id="c-preg" maxlength="60" placeholder="Opcional"></label><label>Data<input id="c-data" type="date" value="' + lastSunday() + '"></label></div>' +
      '<label>Igreja<input id="c-igreja" maxlength="80" placeholder="Opcional" value="' + esc(S.lastIgreja || '') + '"></label>' +
      '<label>Link da live no YouTube<input id="c-link" type="url" placeholder="Opcional"></label>' +
      '<label>Suas anotações<textarea id="c-notas" rows="3" placeholder="O que mais marcou você? (opcional)"></textarea></label>' +
      '<p class="fine">' + (SAMPLE ? 'O estudo é montado com IA a partir do tema, dos versículos e das suas anotações. O áudio da live não é ouvido nesta versão.' : (aiChecked ? 'IA indisponível aqui: o estudo usa um roteiro padrão de 5 dias com os seus versículos.' : 'Verificando a IA...')) + '</p>' +
      busyBtn('Montar estudo da semana') + '</form>';
    if (S.cultos.length) {
      h += '<section class="sec"><h2>Biblioteca de cultos</h2><ul class="list">';
      S.cultos.forEach(c => { h += '<li><button data-a="open" data-ov="culto" data-id="' + c.id + '"><b>' + esc(c.tema) + '</b><span class="muted">' + fmt(c.data, { day: 'numeric', month: 'short' }) + (c.pregador ? ' · ' + esc(c.pregador) : '') + (c.igreja ? ' · ' + esc(c.igreja) : '') + '</span></button></li>'; });
      h += '</ul></section>';
    }
  } else {
    h += '<p class="muted">Informe o tema e os textos da lição da semana e chegue preparado.</p><form class="form" data-f="ebd">' +
      '<label>Tema da lição<input id="e-tema" required maxlength="140" placeholder="Ex.: A paciência de Jó"></label>' +
      '<label>Textos bíblicos<textarea id="e-textos" rows="2" placeholder="Ex.: Jó 1:1-22; Tiago 5:11"></textarea></label>' +
      '<div class="seg small" role="radiogroup"><button type="button" role="radio" aria-checked="' + (ui.ebdModo !== 'professor') + '" data-a="ebdModo" data-m="aluno">Sou aluno</button><button type="button" role="radio" aria-checked="' + (ui.ebdModo === 'professor') + '" data-a="ebdModo" data-m="professor">Sou professor</button></div>' +
      '<p class="fine">O Manna não reproduz as revistas de EBD. A preparação é material próprio sobre os textos bíblicos.</p>' +
      busyBtn('Preparar a lição') + '</form>';
    if (S.ebds.length) {
      h += '<section class="sec"><h2>Lições preparadas</h2><ul class="list">';
      S.ebds.forEach(e => { h += '<li><button data-a="open" data-ov="ebd" data-id="' + e.id + '"><b>' + esc(e.tema) + '</b><span class="muted">' + fmt(e.data, { day: 'numeric', month: 'short' }) + ' · ' + (e.modo === 'professor' ? 'professor' : 'aluno') + '</span></button></li>'; });
      h += '</ul></section>';
    }
  }
  return h + '</main>';
}
function busyBtn(label) {
  return (ui.busy ? '<div class="busy"><button class="btn" disabled>Montando… pode levar até um minuto</button><button type="button" class="btn ghost" data-a="stopAi">Cancelar</button></div>' : '<button class="btn" type="submit">' + label + '</button>') +
    (ui.aiErr ? '<p class="err" role="alert">' + esc(ui.aiErr) + '</p>' : '');
}

function vDuvidas() {
  const f = ui.filtro.toLowerCase();
  const list = DUVIDAS.filter(d => !f || (d.q + ' ' + d.cat).toLowerCase().includes(f));
  let h = '<main class="screen"><h1 class="h1">Dúvidas</h1><p class="muted">As perguntas que dá vergonha de fazer ao pastor, respondidas com versículos e as visões das principais tradições.</p>';
  h += '<form class="form ask" data-f="duvida"><label>Sua pergunta<textarea id="d-q" rows="2" maxlength="300" placeholder="Ex.: Posso ser padrinho de casamento numa igreja católica?"></textarea></label>' +
    (SAMPLE ? busyBtn('Perguntar') : '<p class="fine">' + (aiChecked ? 'A pergunta livre usa IA e não está disponível aqui. A biblioteca abaixo funciona normalmente.' : 'Verificando a IA...') + '</p>') + '</form>';
  if (S.perguntas.length) {
    h += '<section class="sec"><h2>Suas perguntas</h2><ul class="list">';
    S.perguntas.forEach(p => { h += '<li><button data-a="open" data-ov="duvida" data-id="' + p.id + '"><b>' + esc(p.q) + '</b></button></li>'; });
    h += '</ul></section>';
  }
  h += '<section class="sec"><div class="sec-h"><h2>Biblioteca</h2><span class="muted tnum">' + list.length + ' de ' + DUVIDAS.length + '</span></div>' +
    '<input id="d-filtro" class="search" type="search" placeholder="Buscar: vinho, dízimo, namoro…" value="' + esc(ui.filtro) + '" aria-label="Buscar dúvidas"><ul class="list">';
  list.forEach(d => { h += '<li><button data-a="open" data-ov="duvida" data-id="' + d.id + '"><b>' + d.q + '</b><span class="muted">' + d.cat + (S.duvidasLidas.includes(d.id) ? ' · estudada' : '') + '</span></button></li>'; });
  if (!list.length) h += '<li class="empty">Nada encontrado. Faça a pergunta no campo acima.</li>';
  return h + '</ul></section></main>';
}

function vGroupForms(onb) {
  const m = ui.groupMode;
  let h = '<div class="opts"><button class="opt' + (m === 'criar' ? ' on' : '') + '" data-a="gmode" data-m="criar"><span><b>Criar um grupo</b><small>Célula, família, ministério ou amigos</small></span></button>' +
    '<button class="opt' + (m === 'entrar' ? ' on' : '') + '" data-a="gmode" data-m="entrar"><span><b>Entrar com um código</b><small>Recebeu o convite de alguém</small></span></button></div>';
  if (m === 'criar') {
    h += '<form class="form" data-f="gcriar"><label>Nome do grupo<input id="g-nome" required maxlength="40" placeholder="Ex.: Célula Esperança"></label><label>Desafio<select id="g-des">' +
      DESAFIOS.map(d => '<option value="' + d.id + '">' + d.nome + '</option>').join('') + '</select></label><label>Seu nome no grupo<input id="g-eu" maxlength="30" value="' + esc(S.nome) + '" placeholder="Como os irmãos te chamam"></label><button class="btn" type="submit">Criar grupo</button></form>';
  } else if (m === 'entrar') {
    h += '<form class="form" data-f="gentrar"><label>Código do convite<input id="g-code" required maxlength="8" placeholder="Ex.: K7Q2MD" autocapitalize="characters"></label><label>Seu nome no grupo<input id="g-eu" maxlength="30" value="' + esc(S.nome) + '"></label><button class="btn" type="submit">Entrar no grupo</button></form>';
  }
  return h + (onb ? '' : '<p class="fine">No teste, o grupo funciona neste aparelho, com membros de exemplo. A sincronização entre celulares vem na próxima versão.</p>');
}
function vGrupo() {
  const g = S.group;
  if (!g) return '<main class="screen"><h1 class="h1">Grupo</h1><p class="muted">Leia com os amigos da igreja, com desafio, ranking e check-in diário.</p>' + vGroupForms(false) + '</main>';
  const d = desafio(g.desafio), dia = Math.min(d.dias, diff(g.start, todayK()) + 1), meus = S.chapters - g.chapAtStart;
  const convite = 'Entre no meu grupo "' + g.nome + '" no Manna para o desafio ' + d.nome + '. Código: ' + g.code;
  let h = '<main class="screen"><h1 class="h1">' + esc(g.nome) + '</h1>';
  h += '<section class="card"><p class="kicker">Desafio · dia ' + dia + ' de ' + d.dias + '</p><h2>' + d.nome + '</h2><p>Você leu ' + plural(meus, 'capítulo', 'capítulos') + ' de ' + d.caps + '. O ritmo do desafio é ' + (d.caps / d.dias).toFixed(1).replace('.', ',') + ' por dia.</p><span class="bar"><i style="width:' + Math.min(100, meus / d.caps * 100) + '%"></i></span></section>';
  h += '<section class="sec"><h2>Ranking por capítulos</h2><ol class="rank">';
  ranking().forEach((r, i) => { h += '<li class="' + (r.me ? 'me' : '') + '"><span class="pos tnum">' + (i + 1) + '</span><span class="nm">' + esc(r.nome) + (r.ex ? ' <small class="muted">exemplo</small>' : '') + '</span><b class="tnum">' + r.caps + '</b></li>'; });
  h += '</ol></section>';
  h += '<section class="sec"><h2>Check-in de hoje</h2><form class="form" data-f="checkin"><div class="two"><label>Capítulos lidos fora do app<input id="ck-caps" type="number" min="0" max="50" value="1" inputmode="numeric"></label><label>Versículo<input id="ck-ref" maxlength="40" placeholder="Ex.: Salmos 23:1"></label></div><label>Reflexão curta<textarea id="ck-txt" rows="2" maxlength="280" placeholder="O que Deus falou com você hoje? (opcional)"></textarea></label><button class="btn" type="submit">Marcar leitura de hoje</button></form></section>';
  h += '<section class="sec"><h2>Feed do grupo</h2><ul class="feed">';
  g.feed.forEach(p => {
    h += '<li><p class="who"><b>' + esc(p.who) + '</b><span class="muted"> · ' + fmt(p.d, { day: 'numeric', month: 'short' }) + '</span></p>' + (p.ref ? '<p class="ref">' + esc(p.ref) + '</p>' : '') + '<p>' + esc(p.text) + '</p>' +
      '<div class="acts"><button class="pill' + (p.amei ? ' on' : '') + '" data-a="amem" data-id="' + p.id + '" aria-pressed="' + !!p.amei + '">Amém <span class="tnum">' + p.amem + '</span></button><button class="link" data-a="cmt" data-id="' + p.id + '">Comentar</button></div>';
    if (p.comments.length) h += '<ul class="cmts">' + p.comments.map(c => '<li><b>' + esc(c.who) + '</b> ' + esc(c.text) + '</li>').join('') + '</ul>';
    if (ui.cmt === p.id) h += '<form class="form inline" data-f="cmt" data-id="' + p.id + '"><input id="cmt-txt" maxlength="200" placeholder="Escreva um comentário" aria-label="Comentário"><button class="btn sm" type="submit">Enviar</button></form>';
    h += '</li>';
  });
  h += '</ul></section>';
  h += '<section class="card"><h3>Convide pelo WhatsApp</h3><p class="muted">Código do grupo: <b class="code">' + g.code + '</b></p><div class="row"><a class="btn sec" href="https://wa.me/?text=' + encodeURIComponent(convite) + '" target="_blank" rel="noopener">Abrir WhatsApp</a><button class="btn sec" data-a="copy" data-t="' + esc(convite) + '">Copiar convite</button></div><p class="fine">No teste, o grupo funciona só neste aparelho e os outros membros são exemplos.</p></section>';
  h += '<button class="link danger" data-a="leaveGroup">Sair do grupo</button>';
  return h + '</main>';
}

function vPerfil() {
  const st = S.streak, lv = level(), into = S.points % 150;
  const resumo = 'Minha semana no Manna: ofensiva de ' + plural(st.count, 'dia', 'dias') + ', ' + plural(weekChaps(), 'capítulo lido', 'capítulos lidos') + ' e ' + weekDays() + ' de 7 dias de estudo. Sua porção diária da Palavra.';
  let h = '<main class="screen"><h1 class="h1">Perfil</h1>';
  h += '<section class="stats2"><div><b class="tnum">' + st.count + '</b><span>dias de ofensiva</span><small class="muted">recorde: ' + st.best + '</small></div><div><b class="tnum">' + S.protetores + '</b><span>protetores de ofensiva</span><small class="muted">salvam um dia perdido</small></div></section>';
  h += '<section class="card"><div class="sec-h"><h3>Nível ' + lv + '</h3><span class="muted tnum">' + S.points + ' pontos</span></div><span class="bar"><i style="width:' + (into / 150 * 100) + '%"></i></span><p class="fine">Faltam ' + (150 - into) + ' pontos para o nível ' + (lv + 1) + '. Lição vale 15 mais 10 por capítulo, culto vale 30, dúvida vale 5.</p></section>';
  h += '<section class="share"><p class="brand sm">manna</p><h2>Minha semana</h2><div class="share-n"><div><b class="tnum">' + st.count + '</b><span>dias de ofensiva</span></div><div><b class="tnum">' + weekChaps() + '</b><span>capítulos</span></div><div><b class="tnum">' + weekDays() + '/7</b><span>dias de estudo</span></div></div><p>Sua porção diária da Palavra</p></section>';
  h += '<button class="btn sec" data-a="copy" data-t="' + esc(resumo) + '">Copiar resumo para o Status</button>';
  h += '<section class="sec"><h2>Conquistas</h2><ul class="ach">';
  ACH.forEach(([id, nome, desc]) => { const got = S.ach[id]; h += '<li class="' + (got ? 'got' : '') + '"><b>' + nome + '</b><span class="muted">' + (got ? 'Desde ' + fmt(got, { day: 'numeric', month: 'short' }) : desc) + '</span></li>'; });
  h += '</ul></section>';
  h += '<section class="sec"><h2>Ajustes</h2><form class="form" data-f="ajustes"><label>Seu nome no grupo<input id="p-nome" maxlength="30" value="' + esc(S.nome) + '"></label><div class="two"><label>Tempo por dia<select id="p-min">' + [5, 10, 20].map(m => '<option value="' + m + '"' + (S.quiz.minutos === m ? ' selected' : '') + '>' + m + ' minutos</option>').join('') + '</select></label><label>Lembrete<select id="p-hor">' + ['6h', '7h', '12h', '19h', '21h'].map(x => '<option' + (S.quiz.horario === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label></div><p class="fine">Na versão de teste não enviamos notificações. No app, o lembrete sai no horário escolhido e outro à noite se a ofensiva estiver em risco.</p><button class="btn sec" type="submit">Salvar ajustes</button></form></section>';
  h += '<section class="card"><h3>Assinatura</h3><p>' + ({ anual: 'Anual', mensal: 'Mensal', familia: 'Família ou célula' }[S.plano] || 'Anual') + ', em teste grátis até ' + fmt(addDays(S.trialStart || todayK(), 7)) + '.</p><p class="fine">Versão de teste: nada é cobrado.</p></section>';
  h += '<section class="card test"><h3>Ferramentas de teste</h3><p class="fine">Para testar a ofensiva e o protetor sem esperar.</p><p class="muted">Data simulada: ' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><div class="row"><button class="btn sec" data-a="nextDay">Avançar um dia</button><button class="btn sec" data-a="redoQuiz">Refazer o quiz</button></div>' +
    (ui.confirmReset ? '<div class="row"><button class="btn danger-btn" data-a="reset">Apagar tudo</button><button class="btn ghost" data-a="cancelReset">Cancelar</button></div>' : '<button class="link danger" data-a="askReset">Apagar meus dados deste aparelho</button>') + '</section>';
  h += '<p class="fine center-t">Textos bíblicos indicados por referência. Bíblia Livre: Diego Santos, Mario Sérgio e Marco Teles, licença CC BY 4.0.</p>';
  return h + '</main>';
}

/* ---------- Telas sobrepostas ---------- */
function ovHead(title) { return '<header class="ovh"><button class="iconbtn" data-a="close" aria-label="Voltar">' + icon('voltar') + '</button><span>' + title + '</span></header>'; }

function vLesson(id) {
  const t = trilha(id), i = doneCount(id);
  if (ui.done) {
    const d = ui.done;
    return ovHead(t.nome) + '<main class="screen center"><div class="big-streak">' + GRAO + '<b class="tnum">' + S.streak.count + '</b></div><h2 class="qt">Porção colhida</h2><p class="body-l">Ofensiva de ' + plural(S.streak.count, 'dia', 'dias') + '. Você ganhou ' + d.pts + ' pontos e leu ' + plural(d.caps, 'capítulo', 'capítulos') + '.</p>' +
      '<p class="muted">"O maná não se guardava." Amanhã tem porção nova.</p>' + (S.group ? '<p class="fine">Seu check-in foi postado no grupo ' + esc(S.group.nome) + '.</p>' : '') +
      '<button class="btn" data-a="close">Voltar para Hoje</button></main>';
  }
  if (i >= t.licoes.length) return ovHead(t.nome) + '<main class="screen"><h2 class="qt">Trilha concluída</h2><p>Você terminou ' + t.nome + '. Escolha uma nova meta no Hoje.</p><button class="btn" data-a="close">Voltar</button></main>';
  const l = t.licoes[i], ver = S.quiz.versao && S.quiz.versao !== 'Outra ou não sei' ? S.quiz.versao : 'sua Bíblia';
  let h = ovHead(t.nome + ' · ' + (i + 1) + ' de ' + t.licoes.length) + '<main class="screen lesson">';
  h += '<h1 class="h1">' + l.titulo + '</h1><p class="ref big">' + l.ref + '</p><p class="body-l">' + l.ctx + '</p>';
  if (t.nota) h += '<p class="note">' + t.nota + '</p>';
  h += '<section class="card"><h3>1. Leia</h3><p>Abra ' + (ver === 'sua Bíblia' ? 'sua Bíblia' : 'a ' + ver) + ' em <b>' + l.ref + '</b> e leia com calma.</p><label class="check"><input type="checkbox" id="l-lido"' + (ui.lido ? ' checked' : '') + '> Li o texto</label></section>';
  h += '<section class="card"><h3>2. Entenda</h3>';
  if (ui.aiText) h += '<div class="ai-out">' + esc(ui.aiText).replace(/\n+/g, '</p><p>').replace(/^/, '<p>') + '</p></div>';
  if (SAMPLE) h += ui.busy ? '<div class="busy"><button class="btn sec" disabled>Explicando…</button><button class="btn ghost" data-a="stopAi">Parar</button></div>' : (ui.aiText ? '' : '<button class="btn sec" data-a="explain" data-id="' + id + '">Explicar este texto</button>');
  else h += '<p class="muted">' + (aiChecked ? 'Leia o capítulo pensando em quem escreveu, para quem e por quê.' : 'Verificando a IA...') + '</p>';
  if (ui.aiErr) h += '<p class="err">' + esc(ui.aiErr) + '</p>';
  h += '</section><section class="card"><h3>3. Reflita</h3><p>' + l.q + '</p><textarea id="l-nota" rows="3" placeholder="Escreva sua resposta (fica só com você)">' + esc(S.notes[id + i] || '') + '</textarea></section>';
  h += '<div class="sticky-cta"><button class="btn" data-a="complete" data-id="' + id + '">Colhi minha porção</button></div></main>';
  return h;
}

function vTrilha(id) {
  const t = trilha(id), d = doneCount(id);
  let h = ovHead(t.tipo) + '<main class="screen"><h1 class="h1">' + t.nome + '</h1><p class="muted">' + t.desc + '</p><p class="tnum">' + d + ' de ' + t.licoes.length + ' lições · previsão de término: ' + fmt(planEnd(id), { day: 'numeric', month: 'short', year: 'numeric' }) + '</p><ol class="lessons">';
  t.licoes.forEach((l, i) => {
    const st = i < d ? 'feita' : i === d ? 'next' : '';
    h += '<li class="' + st + '">' + (i === d ? '<button data-a="lesson" data-id="' + id + '">' : '<div>') + '<span class="n tnum">' + (i + 1) + '</span><span><b>' + l.titulo + '</b><small class="muted">' + l.ref + (i < d ? ' · feita' : '') + '</small></span>' + (i === d ? '</button>' : '</div>') + '</li>';
  });
  return h + '</ol></main>';
}

function vMetas() {
  const sel = S.quiz.trilhas;
  let h = ovHead('Metas do ano') + '<main class="screen"><h1 class="h1">Suas metas</h1><p class="muted">Até 5 metas. A primeira não concluída é a sua porção diária. Toque para adicionar ou remover.</p>';
  ['Livro', 'Personagem', 'Tema'].forEach(tp => {
    h += '<h3 class="grp">' + tp + '</h3><div class="opts">';
    TRILHAS.filter(t => t.tipo === tp).forEach(t => {
      const i = sel.indexOf(t.id);
      h += '<button class="opt' + (i > -1 ? ' on' : '') + '" data-a="toggleMeta" data-id="' + t.id + '" aria-pressed="' + (i > -1) + '"><span><b>' + t.nome + '</b><small>' + t.desc + (isDone(t.id) ? ' Concluída.' : '') + '</small></span>' + (i > -1 ? '<em class="ord">' + (i + 1) + '</em>' : '') + '</button>';
    });
    h += '</div>';
  });
  return h + '</main>';
}

function vCulto(id) {
  const c = S.cultos.find(x => x.id === id); if (!c) return '';
  const s = c.study;
  let h = ovHead('Culto de ' + fmt(c.data, { day: 'numeric', month: 'short' })) + '<main class="screen"><h1 class="h1">' + esc(c.tema) + '</h1><p class="muted">' + [c.pregador, c.igreja].filter(Boolean).map(esc).join(' · ') + '</p>';
  if (c.link) h += '<p><a class="link" href="' + esc(c.link) + '" target="_blank" rel="noopener">Abrir a live</a></p>';
  if (!s.ia) h += '<p class="note">Montado sem IA, com um roteiro padrão.</p>';
  h += '<section class="card"><h3>Resumo</h3><p>' + esc(s.resumo) + '</p>' + (s.pontos.length ? '<h3>Pontos principais</h3><ul class="dots">' + s.pontos.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') + (s.versiculos.length ? '<h3>Versículos</h3><p class="ref">' + s.versiculos.map(esc).join('; ') + '</p>' : '') + '</section>';
  if (s.meta) h += '<p class="insight">Este tema combina com a meta ' + trilha(s.meta).nome + '. ' + (S.quiz.trilhas.includes(s.meta) ? 'O estudo conta para ela.' : '<button class="link" data-a="addMeta" data-id="' + s.meta + '">Adicionar às metas</button>') + '</p>';
  h += '<section class="sec"><h2>Estudo da semana</h2><ol class="days">';
  const nomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  s.dias.forEach((d, i) => {
    const f = c.feitos.includes(i);
    h += '<li class="' + (f ? 'feita' : '') + '"><p class="kicker">' + nomes[i] + '</p><h3>' + esc(d.titulo) + '</h3><p class="ref">' + esc(d.referencia) + '</p><p>' + esc(d.pergunta) + '</p>' + (f ? '<p class="muted">Feito</p>' : '<button class="btn sec sm" data-a="cultoDia" data-id="' + c.id + '" data-i="' + i + '">Marcar como feito</button>') + '</li>';
  });
  h += '</ol></section>';
  if (S.group) h += '<button class="btn sec" data-a="shareCulto" data-id="' + c.id + '">Compartilhar com ' + esc(S.group.nome) + '</button>';
  h += '<button class="link danger" data-a="delCulto" data-id="' + c.id + '">Apagar este culto</button>';
  return h + '</main>';
}

function vEbd(id) {
  const e = S.ebds.find(x => x.id === id); if (!e) return '';
  const p = e.prep;
  let h = ovHead('EBD · ' + (e.modo === 'professor' ? 'professor' : 'aluno')) + '<main class="screen"><h1 class="h1">' + esc(e.tema) + '</h1>' + (e.textos ? '<p class="ref">' + esc(e.textos) + '</p>' : '');
  if (!p.ia) h += '<p class="note">Montado sem IA, com um roteiro padrão.</p>';
  h += '<section class="card"><h3>Contexto</h3><p>' + esc(p.contexto) + '</p>' + (p.versiculos.length ? '<h3>Versículos</h3><p class="ref">' + p.versiculos.map(esc).join('; ') + '</p>' : '') + '</section>';
  h += '<section class="card"><h3>Perguntas para discussão</h3><ol class="dots">' + p.perguntas.map(q => '<li>' + esc(q) + '</li>').join('') + '</ol></section>';
  h += '<section class="card"><h3>Aplicação</h3><p>' + esc(p.aplicacao) + '</p></section>';
  if (p.roteiro && p.roteiro.length) h += '<section class="card"><h3>Roteiro da aula</h3><ol class="roteiro">' + p.roteiro.map(r => '<li><b>' + esc(r.etapa) + '</b> <span class="muted tnum">' + esc(r.minutos) + ' min</span><p>' + esc(r.descricao) + '</p></li>').join('') + '</ol></section>';
  return h + '<button class="link danger" data-a="delEbd" data-id="' + e.id + '">Apagar esta lição</button></main>';
}

function vDuvida(id) {
  const d = DUVIDAS.find(x => x.id === id) || S.perguntas.find(x => x.id === id); if (!d) return '';
  const minha = tradicao();
  let h = ovHead(d.cat) + '<main class="screen"><h1 class="h1">' + esc(d.q) + '</h1>';
  h += '<section class="card"><h3>O que a Bíblia diz</h3><p>' + esc(d.biblia) + '</p><p class="ref">' + esc(d.refs) + '</p></section>';
  h += '<section class="sec"><h2>Como as tradições interpretam</h2>';
  const order = minha ? [minha].concat(Object.keys(TRADICOES).filter(k => k !== minha)) : Object.keys(TRADICOES);
  order.forEach(k => { if (d.trad[k]) h += '<div class="trad' + (k === minha ? ' mine' : '') + '"><p class="who"><b>' + TRADICOES[k] + '</b>' + (k === minha ? ' <span class="muted">· sua tradição</span>' : '') + '</p><p>' + esc(d.trad[k]) + '</p></div>'; });
  if (!minha) h += '<p class="fine">Sua igreja pode ter uma posição própria sobre isso.</p>';
  h += '</section><section class="card"><h3>Ponto em comum</h3><p>' + esc(d.comum) + '</p></section>';
  h += '<section class="pastor"><h3>Converse com seu pastor</h3><p>Esta resposta ajuda você a estudar, mas não substitui o cuidado de quem conhece você e a sua igreja. Leve a dúvida para ele com estes versículos.</p></section>';
  if (d.ia) h += '<p class="fine">Resposta gerada por IA. Confira os versículos na sua Bíblia.</p>';
  return h + '</main>';
}

/* ---------- Render ---------- */
const TABS = [['hoje', 'Hoje'], ['domingo', 'Domingo'], ['duvidas', 'Dúvidas'], ['grupo', 'Grupo'], ['perfil', 'Perfil']];
function render() {
  const app = $('app'); if (!app) return;
  const scrollY = window.scrollY;
  if (!S.onboarded) { app.innerHTML = vOnboarding(); return; }
  let h = '';
  if (ui.ov) {
    const o = ui.ov;
    h = '<div class="ov">' + ({ lesson: vLesson, trilha: vTrilha, metas: vMetas, culto: vCulto, ebd: vEbd, duvida: vDuvida }[o.type])(o.id) + '</div>';
  } else {
    h = ({ hoje: vHoje, domingo: vDomingo, duvidas: vDuvidas, grupo: vGrupo, perfil: vPerfil }[ui.tab])();
    h += '<nav class="tabs" aria-label="Seções">' + TABS.map(([k, n]) => '<button data-a="tab" data-tab="' + k + '"' + (ui.tab === k ? ' aria-current="page"' : '') + '>' + icon(k) + '<span>' + n + '</span></button>').join('') + '</nav>';
  }
  app.innerHTML = h;
  if (render.keep) window.scrollTo(0, scrollY);
  render.keep = false;
}
function renderToast() {
  let t = $('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = ui.toast; t.hidden = !ui.toast;
}
function go(fn) { fn(); save(); render(); }
function openOv(type, id) { ui.ov = { type, id }; ui.aiText = ''; ui.aiErr = ''; ui.done = null; ui.lido = false; ui.busy = false; window.scrollTo(0, 0); render(); }

/* ---------- Ações ---------- */
const A = {
  next() { if (S.step === QUIZ.length + 1 && !S.plano) S.plano = 'anual'; go(() => { S.step++; }); window.scrollTo(0, 0); },
  back() { go(() => { S.step = Math.max(0, S.step - 1); }); },
  answer(el) {
    const k = el.dataset.k; let v = el.dataset.v;
    if (k === 'minutos') v = Number(v);
    S.quiz[k] = v;
    if (k === 'denom') { const d = DENOMINACOES.find(x => x[0] === v); S.quiz.tradicao = d ? d[1] : null; }
    render(); setTimeout(() => A.next(), 180);
  },
  pickTrail(el) {
    const id = el.dataset.id, a = S.quiz.trilhas, i = a.indexOf(id);
    if (i > -1) a.splice(i, 1); else if (a.length < 3) a.push(id); else toast('Escolha até 3 metas agora. Dá para adicionar mais depois.');
    render.keep = true; go(() => {});
  },
  plan(el) { render.keep = true; go(() => { S.plano = el.dataset.id; }); },
  trial() { go(() => { S.trialStart = todayK(); S.step++; }); window.scrollTo(0, 0); },
  finish() { go(() => { S.onboarded = true; ui.tab = 'hoje'; }); window.scrollTo(0, 0); },
  tab(el) { ui.tab = el.dataset.tab; ui.aiErr = ''; ui.confirmReset = false; window.scrollTo(0, 0); render(); },
  open(el) { openOv(el.dataset.ov, el.dataset.id); },
  close() { ui.ov = null; ui.done = null; if (aiCtl) aiCtl.abort(); ui.busy = false; window.scrollTo(0, 0); render(); },
  dismiss() { ui.notice = ''; render(); },
  lesson(el) { openOv('lesson', el.dataset.id); },
  complete(el) {
    const id = el.dataset.id, t = trilha(id), i = doneCount(id), l = t.licoes[i];
    if ($('l-lido') && !$('l-lido').checked) { toast('Marque "Li o texto" depois de ler ' + l.ref + '.'); return; }
    const nota = val('l-nota'); if (nota) S.notes[id + i] = nota;
    S.progress[id] = i + 1;
    const pts = 15 + 10 * l.caps;
    study(l.caps, pts);
    if (S.group) postFeed(nota ? nota.slice(0, 280) : 'Colhi a porção de hoje: ' + l.titulo + '.', l.ref);
    ui.done = { pts, caps: l.caps };
    if (isDone(id)) setTimeout(() => toast('Trilha concluída: ' + t.nome), 900);
    save(); window.scrollTo(0, 0); render();
  },
  async explain(el) {
    const t = trilha(el.dataset.id), l = t.licoes[doneCount(t.id)];
    ui.busy = true; ui.aiErr = ''; ui.aiText = ''; render.keep = true; render();
    aiCtl = new AbortController();
    try {
      await SAMPLE(REGRAS + '\n\nExplique ' + l.ref + ' para um crente que vai ler o texto hoje, em ' + (S.quiz.minutos || 10) + ' minutos de estudo. Tema da lição: ' + l.titulo + '. Em 2 parágrafos curtos: o contexto (quem, para quem, quando) e a ideia central. Depois, uma frase de aplicação. Texto corrido, sem títulos, sem listas, sem markdown.', {
        signal: aiCtl.signal, modelTier: 'quick',
        onText: ({ text }) => { ui.aiText = text; render.keep = true; render(); },
      });
    } catch (e) { ui.aiText = e.text || ui.aiText; if (e.code !== 'cancelled') ui.aiErr = aiMsg(e); }
    ui.busy = false; render.keep = true; render();
  },
  stopAi() { if (aiCtl) aiCtl.abort(); },
  toggleMeta(el) {
    const id = el.dataset.id, a = S.quiz.trilhas, i = a.indexOf(id);
    if (i > -1) { if (a.length === 1) { toast('Mantenha pelo menos uma meta.'); return; } a.splice(i, 1); }
    else if (a.length < 5) a.push(id); else { toast('Você já tem 5 metas.'); return; }
    render.keep = true; go(() => {});
  },
  addMeta(el) { if (S.quiz.trilhas.length < 5) { S.quiz.trilhas.push(el.dataset.id); toast('Meta adicionada.'); } else toast('Você já tem 5 metas.'); render.keep = true; go(() => {}); },
  dom(el) { ui.domMode = el.dataset.m; ui.aiErr = ''; render(); },
  ebdModo(el) { ui.ebdModo = el.dataset.m; render.keep = true; render(); },
  cultoDia(el) {
    const c = S.cultos.find(x => x.id === el.dataset.id), i = Number(el.dataset.i);
    if (c.feitos.includes(i)) return;
    c.feitos.push(i); study(1, 15);
    if (c.feitos.length === 5) toast('Estudo da semana concluído.'); else toast('Dia marcado. Ofensiva: ' + plural(S.streak.count, 'dia', 'dias') + '.');
    render.keep = true; go(() => {});
  },
  shareCulto(el) {
    const c = S.cultos.find(x => x.id === el.dataset.id);
    postFeed('Compartilhei o estudo do culto "' + c.tema + '". ' + (c.study.resumo || '').slice(0, 180), (c.study.versiculos || []).slice(0, 2).join('; '));
    toast('Estudo compartilhado no grupo.'); render.keep = true; go(() => {});
  },
  delCulto(el) { S.cultos = S.cultos.filter(x => x.id !== el.dataset.id); A.close(); save(); },
  delEbd(el) { S.ebds = S.ebds.filter(x => x.id !== el.dataset.id); A.close(); save(); },
  gmode(el) { ui.groupMode = el.dataset.m; render.keep = true; render(); },
  amem(el) {
    const p = S.group.feed.find(x => x.id === el.dataset.id);
    p.amei = !p.amei; p.amem += p.amei ? 1 : -1; render.keep = true; go(() => {});
  },
  cmt(el) { ui.cmt = ui.cmt === el.dataset.id ? null : el.dataset.id; render.keep = true; render(); setTimeout(() => $('cmt-txt') && $('cmt-txt').focus(), 0); },
  leaveGroup() { if (ui.confirmLeave) { ui.confirmLeave = false; go(() => { S.group = null; }); toast('Você saiu do grupo.'); } else { ui.confirmLeave = true; toast('Toque de novo em "Sair do grupo" para confirmar.'); setTimeout(() => { ui.confirmLeave = false; }, 4000); } },
  copy(el) {
    const t = el.dataset.t;
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copiado.'); } catch (e) { toast('Selecione e copie o texto.'); } ta.remove(); };
    try { navigator.clipboard.writeText(t).then(() => toast('Copiado.'), fallback); } catch (e) { fallback(); }
  },
  nextDay() { S.offset++; ui.notice = ''; checkStreak(); save(); toast('Agora é ' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '.'); render.keep = true; render(); },
  redoQuiz() { go(() => { S.onboarded = false; S.step = 1; }); window.scrollTo(0, 0); },
  askReset() { ui.confirmReset = true; render.keep = true; render(); },
  cancelReset() { ui.confirmReset = false; render.keep = true; render(); },
  reset() { try { localStorage.removeItem(KEY); } catch (e) {} S = fresh(); Object.assign(ui, { tab: 'hoje', ov: null, confirmReset: false, notice: '' }); save(); window.scrollTo(0, 0); render(); },
};

const F = {
  async culto() {
    const c = { id: uid(), tema: val('c-tema'), versiculos: val('c-vers'), pregador: val('c-preg'), data: val('c-data') || lastSunday(), igreja: val('c-igreja'), link: val('c-link'), notas: val('c-notas'), feitos: [] };
    if (!c.tema) { toast('Digite o tema da pregação.'); return; }
    if (c.link && !/^https?:\/\//i.test(c.link)) c.link = '';
    S.lastIgreja = c.igreja;
    ui.busy = true; ui.aiErr = ''; render.keep = true; render();
    try { c.study = await genStudy(c); }
    catch (e) { ui.busy = false; if (e.code !== 'cancelled') ui.aiErr = aiMsg(e) + ' Montei com o roteiro padrão.'; if (e.code === 'cancelled') { render.keep = true; render(); return; } c.study = localStudy(c); }
    ui.busy = false;
    S.cultos.unshift(c); S.points += 30; checkAch(); save();
    openOv('culto', c.id);
  },
  async ebd() {
    const e = { id: uid(), tema: val('e-tema'), textos: val('e-textos'), modo: ui.ebdModo === 'professor' ? 'professor' : 'aluno', data: todayK() };
    if (!e.tema) { toast('Digite o tema da lição.'); return; }
    ui.busy = true; ui.aiErr = ''; render.keep = true; render();
    try { e.prep = await genEbd(e); }
    catch (err) { ui.busy = false; if (err.code === 'cancelled') { render.keep = true; render(); return; } ui.aiErr = aiMsg(err) + ' Montei com o roteiro padrão.'; e.prep = localEbd(e); }
    ui.busy = false;
    S.ebds.unshift(e); S.points += 20; checkAch(); save();
    openOv('ebd', e.id);
  },
  async duvida() {
    const q = val('d-q'); if (q.length < 6) { toast('Escreva a sua pergunta.'); return; }
    const local = DUVIDAS.find(d => d.q.toLowerCase().replace(/[?!.]/g, '') === q.toLowerCase().replace(/[?!.]/g, ''));
    if (local) { openOv('duvida', local.id); return; }
    ui.busy = true; ui.aiErr = ''; render.keep = true; render();
    try { const d = await genDuvida(q); S.perguntas.unshift(d); S.points += 5; checkAch(); save(); ui.busy = false; openOv('duvida', d.id); }
    catch (e) { ui.busy = false; if (e.code !== 'cancelled') ui.aiErr = aiMsg(e); render.keep = true; render(); }
  },
  gcriar() {
    const nome = val('g-nome'); if (!nome) { toast('Dê um nome ao grupo.'); return; }
    S.nome = val('g-eu') || S.nome;
    makeGroup(nome, val('g-des') || 'evangelhos30'); checkAch();
    if (!S.onboarded) S.onboarded = true;
    ui.tab = 'grupo'; ui.groupMode = null; save(); window.scrollTo(0, 0); render(); toast('Grupo criado. Agora convide pelo WhatsApp.');
  },
  gentrar() {
    const code = val('g-code').toUpperCase(); if (code.length < 4) { toast('Digite o código do convite.'); return; }
    S.nome = val('g-eu') || S.nome;
    makeGroup('Célula Esperança', 'evangelhos30'); S.group.code = code; S.group.exemplo = true; checkAch();
    if (!S.onboarded) S.onboarded = true;
    ui.tab = 'grupo'; ui.groupMode = null; save(); window.scrollTo(0, 0); render(); toast('Você entrou num grupo de exemplo.');
  },
  checkin() {
    const caps = Math.max(0, Math.min(50, parseInt(val('ck-caps'), 10) || 0)), ref = val('ck-ref'), txt = val('ck-txt');
    if (!caps && !txt) { toast('Informe os capítulos ou escreva uma reflexão.'); return; }
    if (caps) study(caps, 10 * caps);
    postFeed(txt || ('Li ' + plural(caps, 'capítulo', 'capítulos') + ' hoje.'), ref);
    toast(caps ? 'Leitura marcada. Ofensiva: ' + plural(S.streak.count, 'dia', 'dias') + '.' : 'Reflexão postada.');
    render.keep = true; go(() => {});
  },
  cmt(form) {
    const t = val('cmt-txt'); if (!t) return;
    const p = S.group.feed.find(x => x.id === form.dataset.id);
    p.comments.push({ who: S.nome || 'Você', text: t }); ui.cmt = null; render.keep = true; go(() => {});
  },
  ajustes() {
    S.nome = val('p-nome'); S.quiz.minutos = Number(val('p-min')) || 10; S.quiz.horario = val('p-hor');
    save(); toast('Ajustes salvos.'); render.keep = true; render();
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName === 'A') return;
  e.preventDefault(); fn(el);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-a]')) { e.preventDefault(); A[e.target.dataset.a](e.target); }
});
document.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target.dataset.f; if (F[f]) F[f](e.target);
});
document.addEventListener('input', e => {
  if (e.target.id === 'd-filtro') {
    ui.filtro = e.target.value; const pos = e.target.selectionStart;
    render.keep = true; render();
    const n = $('d-filtro'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }
  }
  if (e.target.id === 'l-nota' && ui.ov) S.notes[ui.ov.id + doneCount(ui.ov.id)] = e.target.value, save();
  if (e.target.id === 'l-lido') ui.lido = e.target.checked;
});
document.addEventListener('change', e => { if (e.target.id === 'l-lido') ui.lido = e.target.checked; });

checkStreak();
render();
renderToast();
