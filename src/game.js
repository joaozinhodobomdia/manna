/* Manna: jornada (sumário de lições) e motor da lição com exercícios. */

const UNIT = 5;
const STOP = new Set('quando sobre entre depois antes mesmo porque pelos pelas pelo pela como todos todas também ainda outro outra outros outras nossa nosso deles dele dela onde cada muito mostra diz para esta este essa esse isso aquele seus suas qualquer'.split(' '));

/* ---------- Jornada ---------- */
function capa(titulo, sub, extra) {
  return '<header class="capa"><div class="capa-in"><div class="capa-top"><span class="brand sm">manna</span>' + statusPills() + '</div><h1 class="capa-t">' + titulo + '</h1>' + (sub ? '<p class="capa-s">' + sub + '</p>' : '') + (extra || '') + '</div></header>';
}
function statusPills() {
  const st = S.streak, hoje = studiedToday();
  return '<div class="pills"><button class="spill' + (hoje ? ' lit' : '') + '" data-a="sheet" data-s="ofensiva" aria-label="Ofensiva de ' + plural(st.count, 'dia', 'dias') + '">' + ART.grao() + '<b class="tnum">' + st.count + '</b><span>' + (st.count === 1 ? 'dia' : 'dias') + '</span></button>' +
    '<button class="spill" data-a="open" data-ov="loja" aria-label="' + S.grains + ' grãos de maná, abrir loja"><b class="tnum">' + S.grains + '</b><span>grãos</span></button></div>';
}
function grainMark(state, n) {
  return '<span class="gm ' + state + '" aria-hidden="true"><svg viewBox="0 0 30 40"><ellipse cx="15" cy="20" rx="12" ry="17" transform="rotate(-18 15 20)"/></svg><i class="tnum">' + (state === 'done' ? '' : n) + '</i>' + (state === 'done' ? icon('check', 'ic gm-c') : '') + '</span>';
}
function vTarefas() {
  ensureQuests();
  let h = '<section class="tarefas"><div class="sec-h"><h2>Desafios de hoje</h2>' + (boostOn() ? '<span class="boost">XP em dobro por ' + Math.ceil((S.boostUntil - Date.now()) / 60000) + ' min</span>' : '') + '</div><ul>';
  S.quests.list.forEach((q, i) => {
    const def = questDef(q.id), ok = q.p >= q.n;
    h += '<li class="' + (ok ? 'ok' : '') + '"><span class="tk">' + (ok ? icon('check', 'ic xs') : '') + '</span><span class="tt">' + def.t(q.n) + '</span>' +
      (q.claimed ? '<span class="muted">+10 grãos</span>' : ok ? '<button class="btn mini" data-a="claim" data-i="' + i + '">Pegar 10 grãos</button>' : '<span class="muted tnum">' + Math.min(q.p, q.n) + '/' + q.n + '</span>') + '</li>';
  });
  return h + '</ul></section>';
}

/* Jornada: topo curto (até 2/5 da tela), mapa logo abaixo, desafios depois do mapa */
function falaTrilha(nome) {
  const fala = 'Glória a Deus! Você terminou ' + nome;
  return fala.length <= 60 ? fala : 'Glória a Deus! Você terminou.';
}
function maniJornada(t, d, n) {
  if (d >= n) return ART.mani('mani m-sm row', 'oliveira', falaTrilha(t.nome));
  if (S.lost && S.lost.d && diff(S.lost.d, todayK()) <= 1 && !studiedToday()) return ART.mani('mani m-sm row', 'triste', 'Tudo bem. Amanhã a gente recomeça.');
  if (!studiedToday() && S.streak.count > 0 && now().getHours() >= 19) return ART.mani('mani m-sm row', 'ansioso', 'Ainda dá tempo de ler hoje.');
  if (!studiedToday()) return ART.mani('mani m-sm row', 'leitora', 'Sua porção de hoje está pronta.');
  return '';
}
function vJornada() {
  const id = curTrail(), t = trilha(id);
  if (!t) return '<main class="screen"><p class="note">Não encontrei uma trilha no seu plano.</p><button class="btn" data-a="open" data-ov="plano">Abrir o plano</button></main>';
  const d = doneCount(id), n = t.licoes.length, xpd = todayXP();
  let h = '<header class="topo-j"><div class="tj-row"><button class="trail-chip" data-a="open" data-ov="plano" aria-label="Meu plano: ' + esc(t.nome) + '">' + ART.logo('logo sm') + '<span><b>' + esc(t.nome) + '</b><small class="tnum">' + d + ' de ' + n + '</small></span>' + icon('voltar', 'ic xs down') + '</button>' + statusPills() + '</div>';
  const figura = maniJornada(t, d, n);
  if (figura) h += '<div class="mani-slot">' + figura + '</div>';
  if (d < n) {
    const l = t.licoes[d];
    h += studiedToday()
      ? '<div class="hoje done"><div><small>Porção de hoje colhida</small><b>Próxima: ' + esc(l.plano ? 'Dia ' + (d + 1) : l.titulo) + '</b></div><button class="btn mini sec-dark" data-a="startLesson" data-i="' + d + '">Ler mais uma</button></div>'
      : '<div class="hoje"><div><small>Sua porção de hoje · ' + esc(l.ref) + '</small><b>' + esc(l.plano ? 'Dia ' + (d + 1) : l.titulo) + '</b></div><button class="btn mini" data-a="startLesson" data-i="' + d + '">Colher</button></div>';
  } else h += '<div class="hoje done"><div><small>Glória a Deus!</small><b>Você terminou ' + esc(t.nome) + '</b></div><button class="btn mini" data-a="open" data-ov="plano">Próxima etapa</button></div>';
  h += '<div class="xp-row"><span class="line on-dark"><i style="width:' + Math.min(100, xpd / S.goal * 100) + '%"></i></span><small class="tnum">' + Math.min(xpd, S.goal) + '/' + S.goal + ' XP hoje</small></div></header>';
  h += '<main class="screen jornada">';
  if (ui.notice) h += '<div class="note" role="status"><p>' + esc(ui.notice) + '</p><button class="link" data-a="dismiss">Ok</button></div>';
  if (!studiedToday() && S.streak.count > 0 && now().getHours() >= 19 && !(S.lost && S.lost.d && diff(S.lost.d, todayK()) <= 1)) h += '<div class="note warn" role="status"><p>Sua ofensiva acaba à meia-noite.</p></div>';
  h += vMapa(t, id, d);
  const c = S.cultos[0];
  if (c && diff(c.data, todayK()) < 7) {
    const nd = c.study.dias.findIndex((_, i) => !c.feitos.includes(i));
    h += '<button class="row-link" data-a="open" data-ov="culto" data-id="' + c.id + '"><span><b>' + esc(c.tema) + '</b><small>' + (nd === -1 ? 'Estudo da pregação concluído' : 'Estudo da pregação · dia ' + (nd + 1) + ' de 5') + '</small></span>' + icon('voltar', 'ic flip') + '</button>';
  }
  return h + vTarefas() + '</main>';
}

/* ---------- Mapa da caminhada ---------- */
function catmull(pts) {
  if (pts.length < 2) return '';
  let p = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    p += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1];
  }
  return p;
}
/* Região da Bíblia de cada parte, pelo primeiro texto da parte */
function regiao(ref) {
  const s = parseRef(ref)[0]; if (!s) return 'reino';
  const b = s.b;
  if (b <= 6) return 'deserto';            /* Gênesis a Juízes */
  if (b < NT) return 'reino';              /* Rute a Malaquias */
  if (b <= NT + 3) return 'galileia';      /* Evangelhos */
  if (b === 65) return 'ceu';              /* Apocalipse */
  return 'cidades';                        /* Atos e cartas */
}
const REGIAO_NOME = { deserto: 'Deserto', reino: 'Terra de Israel', galileia: 'Galileia', cidades: 'Igrejas do caminho', ceu: 'Nova Jerusalém' };
function mapWidth() {
  const app = $('app'); const w = app ? app.clientWidth - 32 : 358;
  return Math.max(288, Math.min(488, w || 358));
}
function vMapa(t, id, d) {
  const n = t.licoes.length, US = t.unit || UNIT, units = Math.ceil(n / US), cu = Math.floor(Math.min(d, n - 1) / US);
  const u0 = cu, u1 = Math.min(units, cu + 3), W = mapWidth(), A = W * 0.25;
  const xOf = k => Math.round(W / 2 + A * Math.sin(k * 0.95 + 0.4));
  const STEP = 86, CAMP = 132;
  const items = []; let y = 24;
  if (u0 > 0) { items.push({ k: 'antes', y }); y += 40; }
  const bands = [];
  for (let u = u0; u < u1; u++) {
    const a = u * US, b = Math.min(n, a + US), y0 = y - 18;
    items.push({ k: 'camp', u, a, b, y: y + 18, x: xOf(a - 0.5) }); y += CAMP;
    for (let i = a; i < b; i++) { items.push({ k: 'lic', i, x: xOf(i), y }); y += STEP; }
    items.push({ k: 'vaso', u, x: xOf(b), y, done: d >= b }); y += STEP - 10;
    bands.push({ y0, y1: y, r: regiao(t.licoes[a].ref), u, a, b });
  }
  const resto = n - u1 * US;
  if (resto > 0) { items.push({ k: 'depois', y: y + 6, resto }); y += 48; }
  const yDest = y + 40; items.push({ k: 'destino', x: W / 2, y: yDest }); y = yDest + 210;
  const H = y; if (bands.length) bands[bands.length - 1].y1 = H;
  const road = items.filter(it => it.k === 'lic' || it.k === 'vaso' || it.k === 'destino').map(it => [it.x, it.y]);
  road.unshift([xOf(u0 * US - 1), 0]);
  const curPos = items.findIndex(it => it.k === 'lic' && it.i === d);
  const roadIdx = curPos === -1 ? (d >= n ? road.length - 1 : 0) : items.filter((it, j) => j <= curPos && (it.k === 'lic' || it.k === 'vaso')).length;
  /* fundo por região */
  let g = '';
  bands.forEach((bd, k) => {
    const y0 = bd.y0, w4 = W / 4;
    g += '<path class="rg ' + bd.r + '" d="M0 ' + (y0 + 10) + ' Q' + w4 + ' ' + (y0 - 8) + ' ' + (W / 2) + ' ' + (y0 + 6) + ' T' + W + ' ' + y0 + ' V' + bd.y1 + ' H0 Z"/>';
  });
  bands.forEach(bd => {
    const midY = bd.y0 + (bd.y1 - bd.y0) * 0.5, rx = xOf(bd.a + (bd.b - bd.a) / 2);
    const side = rx > W / 2 ? W * 0.14 : W * 0.86;
    g += ART.cena(bd.r, side, bd.y0 + 92, 'marco', bd.u) + ART.cena(bd.r, rx > W / 2 ? W * 0.12 : W * 0.88, midY + 70, 'gente', bd.u);
  });
  const dRoad = catmull(road);
  g += '<path class="estrada-borda" d="' + dRoad + '"/><path class="estrada" d="' + dRoad + '"/><path class="estrada-meio" d="' + dRoad + '"/>';
  if (roadIdx > 0) g += '<path class="estrada-feita" d="' + catmull(road.slice(0, roadIdx + 1)) + '"/>';
  g += ART.cena('destino', W / 2, yDest + 34, 'destino');
  let h = '<section class="mapa" style="height:' + H + 'px;width:' + W + 'px" aria-label="Mapa da caminhada de ' + esc(t.nome) + '"><svg class="mapa-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + g + '</svg>';
  const lbl = (x, yy, cls, inner) => '<span class="m-lbl ' + cls + (x > W / 2 ? ' esq" style="right:' + (W - x) : ' dir" style="left:' + x) + 'px;top:' + yy + 'px">' + inner + '</span>';
  items.forEach(it => {
    if (it.k === 'antes') h += '<p class="m-nota" style="top:' + it.y + 'px">' + plural(u0 * US, 'lição já percorrida', 'lições já percorridas') + '</p>';
    else if (it.k === 'depois') h += '<p class="m-nota" style="top:' + it.y + 'px">mais ' + plural(it.resto, 'lição', 'lições') + ' até o destino</p>';
    else if (it.k === 'camp') {
      const nome = US === 7 ? t.licoes[it.a].ref.split(';')[0] + ' a ' + t.licoes[it.b - 1].ref.split(';').pop().trim() : t.licoes[it.a].titulo;
      h += '<div class="camp" style="top:' + it.y + 'px"><b>' + (US === 7 ? 'Semana ' : 'Parte ') + (it.u + 1) + ' · ' + REGIAO_NOME[regiao(t.licoes[it.a].ref)] + '</b><small>' + esc(nome) + '</small></div>';
    } else if (it.k === 'lic') {
      const l = t.licoes[it.i], st = it.i < d ? 'done' : it.i === d ? 'cur' : 'lock';
      const nome = l.plano ? 'Dia ' + (it.i + 1) : l.titulo, sub = l.plano || l.titulo !== l.ref ? l.ref : '';
      h += '<button class="marco ' + st + '" style="left:' + it.x + 'px;top:' + it.y + 'px" data-a="marco" data-i="' + it.i + '" data-st="' + st + '" aria-label="' + (it.i + 1) + ': ' + esc(nome) + (st === 'done' ? ', concluída' : st === 'cur' ? ', a de hoje' : ', ainda fechada') + '">' +
        '<span class="m-dot' + (st === 'cur' ? ' aqui' : '') + '">' + (st === 'done' ? icon('check', 'ic xs') : '<i class="tnum">' + (it.i + 1) + '</i>') + '</span></button>' +
        lbl(it.x, it.y, st, (st === 'cur' ? '<em>Você está aqui</em>' : '') + '<b>' + esc(nome) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : ''));
    } else if (it.k === 'vaso') {
      const opened = S.chests[id + ':' + it.u];
      h += '<button class="marco vasoM' + (opened ? ' opened' : it.done ? ' ready' : ' lock') + '" style="left:' + it.x + 'px;top:' + it.y + 'px" data-a="chest" data-u="' + it.u + '" aria-label="Vaso de maná' + (opened ? ', aberto' : it.done ? ', pronto para abrir' : ', fechado') + '">' + ART.vaso('vaso m-vaso') + '</button>' +
        lbl(it.x, it.y, it.done && !opened ? 'cur' : 'lock', '<b>Vaso de maná</b><small>' + (opened ? 'aberto' : it.done ? 'toque para abrir' : 'no fim da ' + (US === 7 ? 'semana' : 'parte')) + '</small>');
    } else if (it.k === 'destino') {
      h += '<div class="destino" style="top:' + (it.y + 96) + 'px"><b>' + (d >= n ? 'Você chegou: ' : 'Destino: ') + esc(t.nome) + '</b><small>' + (d >= n ? 'Caminhada completa.' : 'Faltam ' + plural(n - d, t.tipo === 'Plano' ? 'leitura' : 'lição', t.tipo === 'Plano' ? 'leituras' : 'lições')) + '</small><button class="btn mini sec" data-a="open" data-ov="plano">Ver o plano do ano</button></div>';
    }
  });
  return h + '</section>';
}

/* ---------- Construção dos exercícios ---------- */
function pickOthers(arr, exclude, n) {
  const seen = new Set([exclude]);
  return shuffle(arr).filter(x => { if (seen.has(x)) return false; seen.add(x); return true; }).slice(0, n);
}
const words = s => s.replace(/[.,;:"()?!]/g, '').split(/\s+/).filter(Boolean);
const escapeRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function findWord(text, word) {
  const re = new RegExp('(^|[^\\p{L}\\p{N}])(' + escapeRe(word) + ')(?![\\p{L}\\p{N}])', 'u');
  const m = re.exec(String(text || ''));
  return m ? m.index + m[1].length : -1;
}
const vref = x => LIVROS[x.b][0] + ' ' + x.c + ':' + x.v;
const GENQ = ['O que este texto mostra sobre quem Deus é?', 'Que versículo daqui você quer guardar hoje, e por quê?', 'Que atitude este texto pede de você esta semana?', 'O que mais chamou sua atenção nesta leitura?', 'Por quem você pode orar a partir deste texto?'];
function buildSteps(t, i, vs) {
  const l = t.licoes[i], all = TRILHAS.flatMap(x => x.licoes), steps = [{ k: 'leia' }];
  const curado = !!l.ctx;
  if (curado) steps.push({ k: 'mc', q: 'Qual destes títulos resume ' + l.ref + '?', opts: shuffle([l.titulo, ...pickOthers((t.licoes.length >= 5 ? t.licoes : all).map(x => x.titulo), l.titulo, 3)]), ans: l.titulo, exp: l.ctx });
  const good = vs.filter(x => { const n = words(x.t).length; return n >= 7 && n <= 34; });
  const pool = shuffle(good);
  const allWords = vs.flatMap(x => words(x.t)).filter(w => w.length >= 5 && !STOP.has(w.toLowerCase()));
  /* Complete o versículo */
  const vf = pool[0];
  if (vf) {
    const cand = words(vf.t).filter(w => w.length >= 5 && !STOP.has(w.toLowerCase()) && findWord(vf.t, w) >= 0);
    if (cand.length) {
      const w = cand[Math.floor(Math.random() * cand.length)], at = findWord(vf.t, w);
      const outros = allWords.concat(TRILHAS.flatMap(x => x.licoes.flatMap(y => words(y.ctx || '')))).filter(x => x.length >= 5 && x.toLowerCase() !== w.toLowerCase() && !vf.t.includes(x));
      const ops = pickOthers(outros, w, 3);
      if (ops.length === 3) steps.push({ k: 'fill', q: 'Complete o versículo', hint: vref(vf), before: vf.t.slice(0, at), after: vf.t.slice(at + w.length), opts: shuffle([w, ...ops]), ans: w });
    }
  }
  /* Monte o final do versículo */
  const vt = pool.find(x => x !== vf && words(x.t).length <= 18) || pool[1];
  if (vt) {
    const ws = vt.t.replace(/\s+/g, ' ').trim().split(' '), cut = Math.max(2, ws.length - Math.min(7, Math.ceil(ws.length / 2)));
    const target = ws.slice(cut), extra = pickOthers(allWords.filter(x => !target.includes(x)), null, 2);
    steps.push({ k: 'tiles', prompt: 'Monte o final do versículo', hint: vref(vt) + ': ' + ws.slice(0, cut).join(' ') + '…', target, bank: shuffle([...target, ...extra].map((w, j) => ({ w, id: j }))) });
  }
  /* Em que versículo está */
  const vm = pool.find(x => x !== vf && x !== vt) || pool[2];
  if (vm && vs.length >= 4) {
    const outros = vs.filter(x => x !== vm).map(vref);
    const trecho = words(vm.t).slice(0, 12).join(' ');
    steps.push({ k: 'mc', q: 'Em que versículo está este trecho?', quote: trecho + '…', opts: shuffle([vref(vm), ...pickOthers(outros, vref(vm), 3)]), ans: vref(vm) });
  }
  if (!vs.length) {
    steps.push({ k: 'mc', q: 'Em que texto você encontra "' + l.titulo + '"?', opts: shuffle([l.ref, ...pickOthers((t.licoes.length >= 5 ? t.licoes : all).map(x => x.ref), l.ref, 3)]), ans: l.ref });
    const tw = l.titulo.split(' ');
    if (tw.length >= 3) steps.push({ k: 'tiles', prompt: 'Monte o título desta lição', hint: l.ref, target: tw, bank: shuffle([...tw, ...pickOthers(all.flatMap(x => x.titulo.split(' ')).filter(x => !tw.includes(x) && x.length > 2), null, 2)].map((w, j) => ({ w, id: j }))) });
  }
  steps.push({ k: 'reflita', q: l.q || (S.gen[l.ref] && S.gen[l.ref].pergunta) || GENQ[(i + l.ref.length) % GENQ.length] });
  return steps;
}
async function aiQuestions(L) {
  if (!SAMPLE || L.review) return;
  const l = trilha(L.id).licoes[L.idx];
  const texto = L.vs.map(x => x.v + ' ' + x.t).join('\n').slice(0, 9000);
  try {
    const r = await SAMPLE.json(REGRAS + '\n\nTexto bíblico (Bíblia Livre, ' + l.ref + '):\n' + (texto || '(texto indisponível; use seu conhecimento de ' + l.ref + ')') + '\n\nCrie 2 perguntas de múltipla escolha sobre fatos explícitos deste texto, uma frase de contexto (quem escreveu ou fala, para quem, quando) e uma pergunta de reflexão pessoal. Opções curtas, no máximo 8 palavras. Responda só com JSON: {"contexto": "2 frases", "pergunta": "reflexão", "questoes": [{"pergunta": "...", "opcoes": ["4 opções"], "correta": 0, "explicacao": "1 frase com o versículo"}]}', { modelTier: 'quick' });
    if (!r) return;
    if (r.contexto && !l.ctx) { S.gen[l.ref] = { contexto: String(r.contexto), pergunta: r.pergunta ? String(r.pergunta) : '' }; save(); }
    if (ui.L !== L || L.phase !== 'steps') return;
    if (L.steps[L.i] && L.steps[L.i].k === 'reflita') return;
    const last = L.steps[L.steps.length - 1];
    if (last.k === 'reflita' && !l.q && r.pergunta) last.q = String(r.pergunta);
    const qs = (Array.isArray(r.questoes) ? r.questoes : []).filter(q => q && q.pergunta && Array.isArray(q.opcoes) && q.opcoes.length >= 3 && q.opcoes[q.correta]).slice(0, 2)
      .map(q => ({ k: 'mc', q: String(q.pergunta), opts: shuffle(q.opcoes.map(String)), ans: String(q.opcoes[q.correta]), exp: q.explicacao ? String(q.explicacao) : '', ia: true }));
    if (qs.length) {
      L.steps.splice(Math.min(Math.max(L.i + 1, 2), L.steps.length - 1), 0, qs[0]);
      if (qs[1]) L.steps.splice(L.steps.length - 1, 0, qs[1]);
      L.total += qs.length;
      if (L.i === 0) renderLesson();
    }
  } catch (e) { /* sem IA, segue com os exercícios prontos */ }
}

async function startLesson(id, idx, review) {
  const t = trilha(id);
  ui.aiText = ''; ui.aiErr = '';
  ui.L = { id, idx, review: !!review, phase: 'load', steps: [], vs: [] };
  render();
  try { await loadBiblia(); } catch (e) { /* sem o texto, a lição usa a referência */ }
  if (!ui.L || ui.L.id !== id) return;
  const vs = versesOf(t.licoes[idx].ref);
  const steps = buildSteps(t, idx, vs);
  ui.L = { id, idx, review: !!review, steps, vs, total: steps.length, i: 0, phase: 'steps', pick: null, built: [], checked: null, combo: 0, best: 0, right: 0, wrong: 0, t0: Date.now(), lido: false };
  render();
  aiQuestions(ui.L);
}
function bibleText(vs, opts) {
  if (!vs.length) return '';
  let h = '', lastC = null;
  vs.forEach(x => {
    if (x.c !== lastC) { h += (lastC !== null ? '</p>' : '') + '<h4 class="bt-cap">' + LIVROS[x.b][0] + ' ' + x.c + '</h4><p class="bt">'; lastC = x.c; }
    h += '<span class="vv' + (opts && opts.sel && opts.sel.includes(x.b + ':' + x.c + ':' + x.v) ? ' on' : '') + '"' + (opts && opts.tap ? ' data-a="verse" data-k="' + x.b + ':' + x.c + ':' + x.v + '" role="button" tabindex="0"' : '') + '><sup>' + x.v + '</sup>' + esc(x.t) + ' </span>';
  });
  return h + '</p>';
}

/* ---------- Telas da lição ---------- */
function lessonTop(L, t, l) {
  const tot = L.steps.length, segs = Array.from({ length: tot }, (_, i) => '<i class="' + (i < L.i ? 'on' : i === L.i ? 'now' : '') + '"></i>').join('');
  return '<header class="ltop"><div class="lt-row"><span class="lt-t"><b>' + esc(l.ref) + '</b><small class="tnum">' + (L.review ? 'Revisão · ' : '') + 'etapa ' + Math.min(L.i + 1, tot) + ' de ' + tot + (L.combo >= 3 ? ' · ' + L.combo + ' acertos seguidos' : '') + '</small></span><button class="iconbtn" data-a="lessonExit" aria-label="Sair da lição">' + icon('fechar') + '</button></div><div class="segs">' + segs + '</div></header>';
}
function vLessonScreen() {
  const L = ui.L, t = trilha(L.id), l = t.licoes[L.idx];
  if (L.phase === 'load') return '<div class="lesson"><main class="lz center-col"><p class="body-l">Abrindo a Bíblia…</p></main></div>';
  if (L.phase === 'fim') return vFim(L);
  if (L.phase === 'ofensiva') return vOfensivaUp();
  if (L.phase === 'sair') return '<div class="lesson"><main class="lz center-col"><h2 class="qt">Sair da lição?</h2><p class="body-l">O que você fez nesta lição não fica salvo.</p></main><footer class="lfoot col"><button class="btn" data-a="lessonStay">Continuar estudando</button><button class="btn sec" data-a="lessonQuit">Sair</button></footer></div>';
  const s = L.steps[L.i];
  let h = '<div class="lesson">' + lessonTop(L, t, l) + '<main class="lz">';
  if (s.k === 'leia') {
    const ver = S.quiz.versao && !/Outra|BLIVRE/.test(S.quiz.versao) ? S.quiz.versao : '';
    const ctx = l.ctx || (S.gen[l.ref] && S.gen[l.ref].contexto) || '';
    h += '<article class="intro"><h1 class="sc-t">' + esc(l.titulo) + '</h1>' + (ctx ? '<p class="sc-ctx">' + esc(ctx) + '</p>' : '') + (t.nota ? '<p class="note">' + esc(t.nota) + '</p>' : '') + '</article>';
    if (L.vs.length) h += '<article class="bible" style="--fs:' + S.fonte + 'px">' + bibleText(L.vs) + '<p class="fine">Bíblia Livre.' + (ver ? ' Se preferir, acompanhe na ' + ver + '.' : '') + '</p></article>';
    else h += '<p class="note">Abra a sua Bíblia em ' + esc(l.ref) + ' e leia com calma.</p>';
    if (SAMPLE) {
      if (ui.aiText) h += '<div class="ai-out">' + esc(ui.aiText).split(/\n+/).map(p => '<p>' + p + '</p>').join('') + '</div>';
      if (ui.busy) h += '<button class="btn sec" data-a="stopAi">Parar a explicação</button>';
      else if (!ui.aiText) h += '<button class="btn sec" data-a="explain">Explicar este texto</button>';
      if (ui.aiErr) h += ART.mani('mani m-sm row', 'bravinho', 'Ops, algo travou aqui. Tenta de novo?') + '<p class="err" role="alert">' + esc(ui.aiErr) + '</p>';
    }
    h += '</main>';
    return h + '<footer class="lfoot"><label class="check big" for="l-lido"><input type="checkbox" id="l-lido"' + (L.lido ? ' checked' : '') + '> Li ' + esc(l.ref) + '</label><button class="btn" data-a="next"' + (L.lido ? '' : ' disabled') + '>Praticar o que li' + icon('voltar', 'ic flip') + '</button></footer></div>';
  }
  if (s.k === 'reflita') {
    h += ART.mani('mani m-md', 'orando', 'Vamos guardar isso no coração.') + '<article class="intro"><p class="muted">Para guardar no coração</p><h1 class="sc-q">' + esc(s.q) + '</h1><label class="field" for="l-nota">Sua resposta fica só neste aparelho</label><textarea id="l-nota" rows="5" placeholder="Escreva sua resposta. Fica só com você.">' + esc(lessonNote(L.id, L.idx)) + '</textarea></article></main>';
    return h + '<footer class="lfoot"><button class="btn" data-a="finishLesson">Concluir a porção</button></footer></div>';
  }
  const ck = L.checked;
  if (s.k === 'mc') {
    h += '<h1 class="ex-q">' + esc(s.q) + '</h1>' + (s.quote ? '<blockquote class="quote">' + esc(s.quote) + '</blockquote>' : '') + (s.ia ? '<p class="fine">Pergunta criada por IA sobre o texto.</p>' : '') + '<div class="opts" role="radiogroup">';
    s.opts.forEach(o => {
      let cls = L.pick === o ? ' sel' : '';
      if (ck) cls = o === s.ans ? ' right' : (L.pick === o ? ' wrong' : ' dim');
      h += '<button class="opt' + cls + '" role="radio" aria-checked="' + (L.pick === o) + '" data-a="pick" data-v="' + esc(o) + '"' + (ck ? ' disabled' : '') + '><span class="rd">' + (ck && o === s.ans ? icon('check', 'ic xs') : ck && L.pick === o ? icon('fechar', 'ic xs') : '') + '</span><span>' + esc(o) + '</span></button>';
    });
    h += '</div>';
  } else if (s.k === 'fill') {
    const shown = L.pick ? '<span class="gap filled">' + esc(L.pick) + '</span>' : '<span class="gap">&nbsp;</span>';
    h += '<h1 class="ex-q">' + esc(s.q || 'Complete a frase') + '</h1>' + (s.hint ? '<p class="ref">' + esc(s.hint) + '</p>' : '') + '<p class="verse">' + esc(s.before) + shown + esc(s.after) + '</p><div class="words">';
    s.opts.forEach(o => { h += '<button class="word' + (L.pick === o ? ' used' : '') + (ck && o === s.ans ? ' right' : '') + '" data-a="pick" data-v="' + esc(o) + '"' + (ck ? ' disabled' : '') + '>' + esc(o) + '</button>'; });
    h += '</div>';
  } else if (s.k === 'tiles') {
    const parts = String(s.hint).split(': ');
    h += '<h1 class="ex-q">' + esc(s.prompt) + '</h1><p class="ref">' + esc(parts[0]) + '</p><p class="verse">' + esc(parts.slice(1).join(': ').replace(/…$/, '')) + ' ';
    L.built.forEach(id => { const w = s.bank.find(x => x.id === id); h += '<button class="gap filled" data-a="untile" data-id="' + id + '"' + (ck ? ' disabled' : '') + '>' + esc(w.w) + '</button> '; });
    if (!ck && L.built.length < s.target.length) h += '<span class="gap">&nbsp;</span>';
    h += '</p><div class="words">';
    s.bank.forEach(w => { const used = L.built.includes(w.id); h += '<button class="word' + (used ? ' used' : '') + '" data-a="tile" data-id="' + w.id + '"' + (used || ck ? ' disabled' : '') + '>' + esc(w.w) + '</button>'; });
    h += '</div>';
  }
  if (ck) {
    const ok = ck === 'ok', ansTxt = s.k === 'tiles' ? s.target.join(' ') : s.ans;
    const elog = ['Isso mesmo.', 'Certo.', 'Muito bem.', 'Exato.'][(L.right + L.i) % 4];
    h += '<div class="fb ' + (ok ? 'ok' : 'bad') + '" role="status"><span class="fb-i">' + icon(ok ? 'check' : 'fechar', 'ic sm') + '</span><div><b>' + (ok ? elog : 'A resposta é: ' + esc(ansTxt)) + '</b>' + (s.exp && (s.ia || !ok) ? '<p>' + esc(s.exp) + '</p>' : '') + '</div></div>';
  }
  h += '</main>';
  const ready = s.k === 'tiles' ? L.built.length > 0 : !!L.pick;
  h += ck ? '<footer class="lfoot"><button class="btn" data-a="next">Continuar' + icon('voltar', 'ic flip') + '</button></footer>'
    : '<footer class="lfoot"><button class="btn" data-a="checkAns"' + (ready ? '' : ' disabled') + '>Conferir</button></footer>';
  return h + '</div>';
}

function vFim(L) {
  const r = L.result, l = trilha(L.id).licoes[L.idx];
  const linha = (k, v) => '<li><span>' + k + '</span><i></i><b class="tnum">' + v + '</b></li>';
  const tFim = trilha(L.id);
  const figuraFim = (!L.review && tFim && isDone(L.id)) ? ART.mani('mani m-lg', 'oliveira', falaTrilha(tFim.nome))
    : (!L.review && todayXP() >= S.goal) ? ART.mani('mani m-lg', 'grata', 'Glória a Deus! Meta de hoje cumprida.')
    : ART.mani('mani m-lg', 'feliz', L.review ? 'Revisão feita!' : 'Glória a Deus! Porção colhida.');
  return '<div class="lesson"><main class="lz fim">' + figuraFim +
    '<article class="diario"><p class="muted">' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><h1>' + esc(l.ref) + '</h1><ul>' +
    linha('XP ganho', '+<span data-count="' + r.xp + '">0</span>') + linha('Acertos', '<span data-count="' + r.acc + '">0</span>%') + linha('Tempo', r.tempo) + (r.grains ? linha('Grãos de maná', '+' + r.grains) : '') +
    '</ul>' + (r.perfect && !L.review ? '<p class="muted">Sem nenhum erro.</p>' : '') + (S.group && !L.review ? '<p class="muted">Seu check-in foi postado em ' + esc(S.group.nome) + '.</p>' : '') + '</article>' +
    '</main><footer class="lfoot"><button class="btn" data-a="afterFim">Continuar' + icon('voltar', 'ic flip') + '</button></footer></div>';
}

function weekRow() {
  const ws = weekStart();
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return '<div class="week">' + nomes.map((n, i) => {
    const k = addDays(ws, i), on = S.days.includes(k), hoje = k === todayK();
    return '<div class="wd' + (on ? ' on' : '') + (hoje ? ' today' : '') + '">' + grainMark(on ? 'done' : hoje ? 'cur' : 'lock', '') + '<small>' + n + '</small></div>';
  }).join('') + '</div>';
}
function vOfensivaUp() {
  const n = S.streak.count;
  const pose = ui.novoRecorde ? 'animado' : 'joinha';
  const fala = ui.novoRecorde ? 'Recorde novo! Continue firme.' : (n === 1 ? 'Primeiro dia! Continue firme.' : n + ' dias seguidos! Continue firme.');
  return '<div class="lesson"><main class="lz center-col">' + ART.mani('mani m-lg', pose, fala) + '<h1 class="streak-n"><b class="tnum" data-count="' + n + '">0</b><span>' + (n === 1 ? 'dia de ofensiva' : 'dias de ofensiva') + '</span></h1>' + weekRow() +
    '<p class="muted">' + (S.protetores ? 'Você tem ' + plural(S.protetores, 'protetor', 'protetores') + ' para um dia difícil.' : 'Sem protetor guardado: dá para comprar na loja.') + '</p></main><footer class="lfoot"><button class="btn" data-a="closeLesson">Continuar' + icon('voltar', 'ic flip') + '</button></footer></div>';
}

function finishLesson() {
  const L = ui.L, t = trilha(L.id), l = t.licoes[L.idx];
  const nota = val('l-nota'); if (nota) setLessonNote(L.id, L.idx, nota);
  const perfect = L.wrong === 0, acc = Math.round(L.right / Math.max(1, L.right + L.wrong) * 100);
  const secs = Math.round((Date.now() - L.t0) / 1000), tempo = Math.floor(secs / 60) + ':' + pad(secs % 60);
  let base = L.review ? 5 : 15;
  if (!L.review && perfect) base += 5;
  base += Math.min(5, Math.floor(L.best / 3));
  const boost = boostOn(), xp = addXP(base);
  let grains = 0, up = false;
  if (!L.review) {
    S.progress[L.id] = Math.max(S.progress[L.id] || 0, L.idx + 1);
    S.lessons++; if (perfect) { S.perfect++; bump('perfeita', 1); }
    bump('licoes', 1); grains = perfect ? 8 : 5; S.grains += grains;
    up = study(l.caps);
    if (S.group) postFeed('Colhi a porção de hoje: ' + l.titulo + '.', l.ref);
    if (isDone(L.id)) setTimeout(() => toast('Meta concluída: ' + t.nome), 1500);
  } else { up = study(0); }
  S.bestCombo = Math.max(S.bestCombo, L.best);
  checkAch(); save();
  L.result = { xp, acc, tempo, perfect, grains, boost, up };
  L.phase = 'fim';
  render(); SND.fim(); rain(40); countUp();
}
