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
  const xpd = todayXP();
  let h = '<section class="tarefas"><div class="t-h"><h2>' + (xpd >= S.goal ? 'Meta do dia cumprida' : 'Hoje: ' + xpd + ' de ' + S.goal + ' XP') + '</h2>' + (boostOn() ? '<span class="boost">XP em dobro por ' + Math.ceil((S.boostUntil - Date.now()) / 60000) + ' min</span>' : '') + '</div><span class="line"><i style="width:' + Math.min(100, xpd / S.goal * 100) + '%"></i></span><ul>';
  S.quests.list.forEach((q, i) => {
    const def = questDef(q.id), ok = q.p >= q.n;
    h += '<li class="' + (ok ? 'ok' : '') + '"><span class="tk">' + (ok ? icon('check', 'ic xs') : '') + '</span><span class="tt">' + def.t(q.n) + '</span>' +
      (q.claimed ? '<span class="muted">+10 grãos</span>' : ok ? '<button class="btn chip-btn" data-a="claim" data-i="' + i + '">Pegar 10 grãos</button>' : '<span class="muted tnum">' + Math.min(q.p, q.n) + '/' + q.n + '</span>') + '</li>';
  });
  return h + '</ul></section>';
}
function vJornada() {
  const id = curTrail(), t = trilha(id), d = doneCount(id), n = t.licoes.length;
  const extra = '<button class="trail-sw" data-a="open" data-ov="plano"><span><b>' + esc(t.nome) + '</b><small>' + d + ' de ' + n + (t.tipo === 'Plano' ? ' leituras' : ' lições') + ' · trocar ou ver o plano</small></span>' + icon('voltar', 'ic flip') + '</button><span class="line on-dark"><i style="width:' + (d / n * 100) + '%"></i></span>';
  let h = capa('Sua porção de hoje', fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }), extra) + '<main class="screen sheet-top">';
  if (ui.notice) h += '<div class="note" role="status"><p>' + esc(ui.notice) + '</p><button class="link" data-a="dismiss">Ok</button></div>';
  if (!studiedToday() && S.streak.count > 0 && now().getHours() >= 19) h += '<div class="note warn"><p>Ainda dá tempo de ler hoje. Sua ofensiva de ' + plural(S.streak.count, 'dia', 'dias') + ' acaba à meia-noite.</p></div>';

  /* Porção do dia */
  if (d < n) {
    const l = t.licoes[d], ctx = l.ctx || (S.gen[l.ref] && S.gen[l.ref].contexto) || '';
    if (studiedToday()) {
      h += '<section class="porcao done"><div class="p-txt"><h2>Porção colhida hoje</h2><p class="muted">O maná não se guardava. A próxima é ' + esc(l.ref) + '.</p><button class="btn sec" data-a="startLesson" data-i="' + d + '">Ler mais uma agora</button></div>' + ART.mani('mani m-md', 'joinha', 'Porção colhida!') + '</section>';
    } else {
      h += '<section class="porcao">' + ART.mani('mani m-md', 'leitora', 'Sua porção de hoje está pronta.') + '<div class="p-txt"><p class="p-ref">' + esc(l.ref) + '</p><h2>' + esc(l.titulo) + '</h2>' + (ctx ? '<p class="muted">' + esc(ctx) + '</p>' : '') +
        '<button class="btn" data-a="startLesson" data-i="' + d + '">Colher a porção' + icon('voltar', 'ic flip') + '</button><p class="fine">' + (S.quiz.minutos || 10) + ' minutos · +15 XP</p></div></section>';
    }
  } else {
    h += '<section class="porcao done"><div class="p-txt"><h2>Glória a Deus! Você terminou ' + esc(t.nome) + '.</h2><button class="btn" data-a="open" data-ov="plano">Escolher a próxima etapa</button></div>' + ART.mani('mani m-md', 'grata', 'Glória a Deus!') + '</section>';
  }
  const c = S.cultos[0];
  if (c && diff(c.data, todayK()) < 7) {
    const nd = c.study.dias.findIndex((_, i) => !c.feitos.includes(i));
    h += '<button class="row-link" data-a="open" data-ov="culto" data-id="' + c.id + '"><span><b>' + esc(c.tema) + '</b><small>' + (nd === -1 ? 'Estudo da pregação concluído' : 'Estudo da pregação · dia ' + (nd + 1) + ' de 5') + '</small></span>' + icon('voltar', 'ic flip') + '</button>';
  }
  h += vTarefas();

  /* Mapa da jornada */
  h += vMapa(t, id, d);
  return h + '</main>';
}

/* Mapa topográfico: estrada em curva, acampamentos por parte, marcos com o nome das lições e o destino no fim */
function catmull(pts) {
  if (pts.length < 2) return '';
  let p = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    p += ' C' + c1[0].toFixed(2) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(2) + ' ' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(2) + ' ' + p2[1];
  }
  return p;
}
function vMapa(t, id, d) {
  const n = t.licoes.length, US = t.unit || UNIT, units = Math.ceil(n / US), cu = Math.floor(Math.min(d, n - 1) / US);
  const u0 = Math.max(0, cu - 1), u1 = Math.min(units, cu + 3);
  const STEP = 84, CAMP = 84, TOP = 34;
  const items = []; let y = TOP;
  const xOf = k => 50 + 30 * Math.sin(k * 0.9 + 0.6);
  if (u0 > 0) { items.push({ k: 'antes', y }); y += 56; }
  for (let u = u0; u < u1; u++) {
    const a = u * US, b = Math.min(n, a + US);
    items.push({ k: 'camp', u, a, b, y }); y += CAMP;
    for (let i = a; i < b; i++) { items.push({ k: 'lic', i, x: xOf(i), y }); y += STEP; }
    items.push({ k: 'vaso', u, x: xOf(b), y, done: d >= b }); y += STEP;
  }
  const resto = n - u1 * US;
  if (resto > 0) { items.push({ k: 'depois', y, resto }); y += 70; }
  items.push({ k: 'destino', x: 50, y: y + 20 }); y += 190;
  const H = y;
  const road = items.filter(it => it.x != null);
  const ptsAll = road.map(it => [it.x, it.y]);
  const curIdx = road.findIndex(it => it.k === 'lic' && it.i === d);
  const lastDone = curIdx === -1 ? (d >= n ? road.length - 1 : 0) : curIdx;
  /* contornos de relevo no fundo */
  let topo = '';
  for (let k = 0; k < Math.ceil(H / 260); k++) {
    const yy = 120 + k * 260, side = k % 2 ? 78 : 14;
    topo += '<ellipse cx="' + side + '" cy="' + yy + '" rx="22" ry="70" /><ellipse cx="' + side + '" cy="' + yy + '" rx="14" ry="44" /><ellipse cx="' + side + '" cy="' + yy + '" rx="6" ry="18" />';
  }
  let h = '<section class="mapa" style="height:' + H + 'px" aria-label="Mapa da jornada de ' + esc(t.nome) + '">' +
    '<svg class="mapa-svg" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true"><g class="topo">' + topo + '</g>' +
    '<path class="estrada" d="' + catmull(ptsAll) + '"/>' + (lastDone > 0 ? '<path class="estrada feita" d="' + catmull(ptsAll.slice(0, lastDone + 1)) + '"/>' : '') + '</svg>';
  const deco = ['palmeira', 'tenda', 'nuvem', 'fogo', 'tabuas'];
  items.forEach((it, j) => {
    if (it.k === 'antes') h += '<p class="m-nota" style="top:' + it.y + 'px">' + plural(u0 * US, 'lição anterior concluída', 'lições anteriores concluídas') + ' acima</p>';
    else if (it.k === 'depois') h += '<p class="m-nota" style="top:' + it.y + 'px">mais ' + plural(it.resto, 'lição', 'lições') + ' até o destino</p>';
    else if (it.k === 'camp') {
      const nome = US === 7 ? t.licoes[it.a].ref.split(';')[0] + ' a ' + t.licoes[it.b - 1].ref.split(';').pop().trim() : t.licoes[it.a].titulo;
      h += '<div class="camp" style="top:' + it.y + 'px"><span class="camp-ic">' + ART.tendinha() + '</span><span><b>' + (US === 7 ? 'Semana ' : 'Acampamento ') + (it.u + 1) + '</b><small>' + esc(nome) + '</small></span></div>';
      h += '<span class="m-deco ' + (it.u % 2 ? 'l' : 'r') + '" style="top:' + (it.y + 120) + 'px">' + ART.deco[deco[(it.u + hash(id)) % deco.length]] + '</span>';
    } else if (it.k === 'lic') {
      const l = t.licoes[it.i], st = it.i < d ? 'done' : it.i === d ? 'cur' : 'lock';
      const lado = it.x > 50 ? 'esq' : 'dir';
      h += '<button class="marco ' + st + '" style="left:' + it.x + '%;top:' + it.y + 'px" data-a="marco" data-i="' + it.i + '" data-st="' + st + '" aria-label="Lição ' + (it.i + 1) + ': ' + esc(l.titulo) + (st === 'done' ? ', concluída' : st === 'cur' ? ', a de hoje' : ', ainda fechada') + '">' +
        (st === 'cur' ? '<span class="pin" aria-hidden="true"><svg viewBox="0 0 40 52"><path d="M20 51C20 51 3 31 3 19a17 17 0 0 1 34 0c0 12-17 32-17 32z"/><ellipse cx="20" cy="19" rx="6" ry="9" transform="rotate(-18 20 19)"/></svg></span>' : '') +
        '<span class="m-dot">' + (st === 'done' ? icon('check', 'ic xs') : '<i class="tnum">' + (it.i + 1) + '</i>') + '</span></button>' +
        '<span class="m-lbl ' + lado + ' ' + st + '" style="' + (lado === 'esq' ? 'right:' + (100 - it.x) : 'left:' + it.x) + '%;top:' + it.y + 'px">' + (st === 'cur' ? '<em>Você está aqui</em>' : '') + '<b>' + esc(l.plano ? 'Dia ' + (it.i + 1) : l.titulo) + '</b>' + (l.plano || l.titulo !== l.ref ? '<small>' + esc(l.ref) + '</small>' : '') + '</span>';
    } else if (it.k === 'vaso') {
      const ck = id + ':' + it.u, opened = S.chests[ck];
      h += '<button class="marco vasoM' + (opened ? ' opened' : it.done ? ' ready' : ' lock') + '" style="left:' + it.x + '%;top:' + it.y + 'px" data-a="chest" data-u="' + it.u + '" aria-label="Vaso de maná' + (opened ? ', aberto' : it.done ? ', pronto para abrir' : ', fechado') + '">' + ART.vaso('vaso m-vaso') + '</button>' +
        '<span class="m-lbl ' + (it.x > 50 ? 'esq' : 'dir') + (it.done && !opened ? ' cur' : ' lock') + '" style="' + (it.x > 50 ? 'right:' + (100 - it.x) : 'left:' + it.x) + '%;top:' + it.y + 'px"><b>Vaso de maná</b><small>' + (opened ? 'aberto' : it.done ? 'toque para abrir' : 'no fim da ' + (US === 7 ? 'semana' : 'parte')) + '</small></span>';
    } else if (it.k === 'destino') {
      h += '<div class="destino" style="top:' + it.y + 'px"><span class="flag" aria-hidden="true"><svg viewBox="0 0 40 56"><path d="M8 54V4"/><path d="M8 6h26l-7 9 7 9H8z"/></svg></span><b>' + (d >= n ? 'Você chegou: ' : 'Destino: ') + esc(t.nome) + '</b><small>' + (d >= n ? 'Jornada completa.' : 'Faltam ' + plural(n - d, t.tipo === 'Plano' ? 'leitura' : 'lição', t.tipo === 'Plano' ? 'leituras' : 'lições') + ' para chegar') + '</small><button class="btn sec" data-a="open" data-ov="plano">Ver o plano do ano</button></div>';
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
    const cand = words(vf.t).filter(w => w.length >= 5 && !STOP.has(w.toLowerCase()) && vf.t.indexOf(w) > -1);
    if (cand.length) {
      const w = cand[Math.floor(Math.random() * cand.length)], at = vf.t.indexOf(w);
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
    const last = L.steps[L.steps.length - 1];
    if (last.k === 'reflita' && !l.q && r.pergunta) last.q = String(r.pergunta);
    const qs = (Array.isArray(r.questoes) ? r.questoes : []).filter(q => q && q.pergunta && Array.isArray(q.opcoes) && q.opcoes.length >= 3 && q.opcoes[q.correta]).slice(0, 2)
      .map(q => ({ k: 'mc', q: String(q.pergunta), opts: shuffle(q.opcoes.map(String)), ans: String(q.opcoes[q.correta]), exp: q.explicacao ? String(q.explicacao) : '', ia: true }));
    if (qs.length) {
      L.steps.splice(Math.min(Math.max(L.i + 1, 2), L.steps.length - 1), 0, qs[0]);
      if (qs[1]) L.steps.splice(L.steps.length - 1, 0, qs[1]);
      L.total += qs.length;
    }
    renderLesson();
  } catch (e) { /* sem IA, segue com os exercícios prontos */ }
}

async function startLesson(id, idx, review) {
  const t = trilha(id);
  ui.pop = null; ui.aiText = ''; ui.aiErr = '';
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
    h += '<article class="intro"><h1 class="sc-t">' + esc(l.titulo) + '</h1>' + (ctx ? '<p class="sc-ctx">' + esc(ctx) + '</p>' : '') + (t.nota ? '<p class="note">' + t.nota + '</p>' : '') + '</article>';
    if (L.vs.length) h += '<article class="bible" style="--fs:' + S.fonte + 'px">' + bibleText(L.vs) + '<p class="fine">Bíblia Livre.' + (ver ? ' Se preferir, acompanhe na ' + ver + '.' : '') + '</p></article>';
    else h += '<p class="note">Abra a sua Bíblia em ' + esc(l.ref) + ' e leia com calma.</p>';
    if (SAMPLE) {
      if (ui.aiText) h += '<div class="ai-out">' + esc(ui.aiText).split(/\n+/).map(p => '<p>' + p + '</p>').join('') + '</div>';
      if (ui.busy) h += '<button class="btn sec" data-a="stopAi">Parar a explicação</button>';
      else if (!ui.aiText) h += '<button class="btn sec" data-a="explain">Explicar este texto</button>';
      if (ui.aiErr) h += '<p class="err">' + esc(ui.aiErr) + '</p>';
    }
    h += '<label class="check big"><input type="checkbox" id="l-lido"' + (L.lido ? ' checked' : '') + '> Li ' + esc(l.ref) + '</label></main>';
    return h + '<footer class="lfoot"><button class="btn" data-a="next"' + (L.lido ? '' : ' disabled') + '>Praticar o que li' + icon('voltar', 'ic flip') + '</button></footer></div>';
  }
  if (s.k === 'reflita') {
    h += '<article class="intro"><p class="muted">Para guardar no coração</p><h1 class="sc-q">' + esc(s.q) + '</h1><textarea id="l-nota" rows="5" placeholder="Escreva sua resposta. Fica só com você.">' + esc(S.notes[L.id + L.idx] || '') + '</textarea></article></main>';
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
    h += '<h1 class="ex-q">' + s.prompt + '</h1><p class="ref">' + esc(parts[0]) + '</p><p class="verse">' + esc(parts.slice(1).join(': ').replace(/…$/, '')) + ' ';
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
  return '<div class="lesson"><main class="lz fim">' + ART.mani('mani m-lg', 'grata', L.review ? 'Revisão feita!' : 'Glória a Deus! Porção colhida.') +
    '<article class="diario"><p class="muted">' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><h1>' + esc(l.ref) + '</h1><ul>' +
    linha('XP ganho', '+<span data-count="' + r.xp + '">0</span>') + linha('Acertos', '<span data-count="' + r.acc + '">0</span>%') + linha('Tempo', r.tempo) + (r.grains ? linha('Grãos de maná', '+' + r.grains) : '') +
    '</ul>' + (r.perfect && !L.review ? '<p class="muted">Sem nenhum erro.</p>' : '') + (S.group && !L.review ? '<p class="muted">Seu check-in foi postado em ' + esc(S.group.nome) + '.</p>' : '') + '</article>' +
    '</main><footer class="lfoot"><button class="btn" data-a="afterFim">Continuar' + icon('voltar', 'ic flip') + '</button></footer></div>';
}

function weekRow() {
  const ws = weekStart(), nm = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return '<div class="week">' + nm.map((n, i) => {
    const k = addDays(ws, i), on = S.days.includes(k), hoje = k === todayK();
    return '<div class="wd' + (on ? ' on' : '') + (hoje ? ' today' : '') + '">' + grainMark(on ? 'done' : hoje ? 'cur' : 'lock', '') + '<small>' + n + '</small></div>';
  }).join('') + '</div>';
}
function vOfensivaUp() {
  const n = S.streak.count;
  const fala = n === 1 ? 'Primeiro dia colhido!' : n + ' dias seguidos! Continue firme.';
  return '<div class="lesson"><main class="lz center-col">' + ART.mani('mani m-lg', 'joinha', fala) + '<h1 class="streak-n"><b class="tnum" data-count="' + n + '">' + n + '</b><span>' + (n === 1 ? 'dia de ofensiva' : 'dias de ofensiva') + '</span></h1>' + weekRow() +
    '<p class="muted">' + (S.protetores ? 'Você tem ' + plural(S.protetores, 'protetor', 'protetores') + ' para um dia difícil.' : 'Sem protetor guardado: dá para comprar na loja.') + '</p></main><footer class="lfoot"><button class="btn" data-a="closeLesson">Continuar' + icon('voltar', 'ic flip') + '</button></footer></div>';
}

function finishLesson() {
  const L = ui.L, t = trilha(L.id), l = t.licoes[L.idx];
  const nota = val('l-nota'); if (nota) S.notes[L.id + L.idx] = nota;
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
    if (S.group) postFeed(nota ? nota.slice(0, 280) : 'Colhi a porção de hoje: ' + l.titulo + '.', l.ref);
    if (isDone(L.id)) setTimeout(() => toast('Meta concluída: ' + t.nome), 1500);
  } else { up = study(0); }
  S.bestCombo = Math.max(S.bestCombo, L.best);
  checkAch(); save();
  L.result = { xp, acc, tempo, perfect, grains, boost, up };
  L.phase = 'fim';
  render(); SND.fim(); rain(40); countUp();
}
