/* Manna: jornada (caminho de lições) e motor da lição com exercícios. */

const UNIT = 5;
const ZIG = [0, 40, 58, 40, 0, -40, -58, -40];
const STOP = new Set('quando sobre entre depois antes mesmo porque pelos pelas pelo pela como todos todas também ainda outro outra outros outras nossa nosso deles dele dela onde cada muito mostra diz para esta este essa esse isso aquele seus suas qualquer'.split(' '));

/* ---------- Jornada ---------- */
function topBar() {
  const id = curTrail(), t = trilha(id), st = S.streak, hoje = studiedToday();
  return '<header class="hud">' +
    '<button class="hud-trail" data-a="sheet" data-s="trilhas" aria-label="Trocar de meta">' + icon('livro') + '<span>' + t.nome + '</span></button>' +
    '<div class="hud-r"><button class="hud-i' + (hoje ? ' lit' : '') + '" data-a="sheet" data-s="ofensiva" aria-label="Ofensiva">' + ART.grao() + '<b class="tnum">' + st.count + '</b></button>' +
    '<button class="hud-i" data-a="open" data-ov="loja" aria-label="Loja">' + ART.vaso('vaso sm') + '<b class="tnum">' + S.grains + '</b></button></div></header>';
}

function vJornada() {
  ensureQuests();
  const id = curTrail(), t = trilha(id), d = doneCount(id), xpd = todayXP();
  let h = topBar() + '<main class="screen">';
  if (ui.notice) h += '<div class="note" role="status">' + esc(ui.notice) + ' <button class="link" data-a="dismiss">Ok</button></div>';
  if (!studiedToday() && S.streak.count > 0 && now().getHours() >= 19) h += '<div class="risk">' + ART.mani('mani xs', 'triste') + '<p>Sua ofensiva de ' + plural(S.streak.count, 'dia', 'dias') + ' acaba à meia-noite. Uma lição resolve.</p></div>';

  /* Meta do dia e missões */
  h += '<section class="daily"><div class="daily-h"><h2>Meta do dia</h2><span class="tnum"><b>' + Math.min(xpd, S.goal) + '</b> de ' + S.goal + ' XP</span></div><span class="bar thick"><i style="width:' + Math.min(100, xpd / S.goal * 100) + '%"></i></span>';
  if (boostOn()) h += '<p class="boost">' + icon('raio') + ' XP em dobro por mais ' + Math.ceil((S.boostUntil - Date.now()) / 60000) + ' min</p>';
  h += '<ul class="quests">';
  S.quests.list.forEach((q, i) => {
    const def = questDef(q.id), ok = q.p >= q.n;
    h += '<li><div class="q-t"><span>' + def.t(q.n) + '</span><span class="muted tnum">' + Math.min(q.p, q.n) + '/' + q.n + '</span></div><div class="q-r"><span class="bar"><i style="width:' + Math.min(100, q.p / q.n * 100) + '%"></i></span>' +
      (q.claimed ? '<span class="claimed">' + icon('check', 'ic sm') + '</span>' : ok ? '<button class="btn mini" data-a="claim" data-i="' + i + '">+10 ' + ART.vaso('vaso xs') + '</button>' : '<span class="reward">' + ART.vaso('vaso xs') + '</span>') + '</div></li>';
  });
  h += '</ul></section>';

  const c = S.cultos[0];
  if (c && diff(c.data, todayK()) < 7) {
    const nd = c.study.dias.findIndex((_, i) => !c.feitos.includes(i));
    h += '<button class="culto-row" data-a="open" data-ov="culto" data-id="' + c.id + '"><span class="cr-ic">' + icon('domingo') + '</span><span><b>' + esc(c.tema) + '</b><small>' + (nd === -1 ? 'Estudo do culto concluído' : 'Estudo do culto · dia ' + (nd + 1) + ' de 5') + '</small></span><span class="chev">›</span></button>';
  }

  /* Caminho */
  const units = Math.ceil(t.licoes.length / UNIT);
  h += '<div class="path">';
  for (let u = 0; u < units; u++) {
    const a = u * UNIT, b = Math.min(t.licoes.length, a + UNIT);
    const unitDone = d >= b;
    h += '<section class="unit"><div class="banner"><div><p>Unidade ' + (u + 1) + ' · ' + t.nome + '</p><h3>' + t.licoes[a].titulo + '</h3><small>Lições ' + (a + 1) + ' a ' + b + '</small></div>' + ART.banner() + '</div><div class="nodes">';
    const deco = ART.deco[ART.decoOrder[(u + hash(id)) % ART.decoOrder.length]];
    h += '<div class="deco-wrap ' + (u % 2 ? 'left' : 'right') + '">' + deco + '</div>';
    for (let i = a; i < b; i++) {
      const st = i < d ? 'done' : i === d ? 'cur' : 'lock';
      const x = ZIG[i % ZIG.length];
      h += '<div class="node-w" style="--x:' + x + 'px">' + (st === 'cur' && ui.pop !== i ? '<span class="start-bubble">' + (i === 0 ? 'Começar' : 'Continuar') + '</span>' : '') +
        '<button class="node ' + st + '" data-a="pop" data-i="' + i + '" aria-label="Lição ' + (i + 1) + ': ' + esc(t.licoes[i].titulo) + (st === 'done' ? ', feita' : st === 'lock' ? ', bloqueada' : '') + '">' +
        (st === 'done' ? icon('check', 'ic node-ic') : st === 'cur' ? icon('livro', 'ic node-ic') : icon('cadeado', 'ic node-ic')) + '</button>';
      if (ui.pop === i) h += vPop(t, i, st);
      h += '</div>';
    }
    const ck = id + ':' + u, opened = S.chests[ck];
    const x = ZIG[b % ZIG.length];
    h += '<div class="node-w" style="--x:' + x + 'px"><button class="node chest' + (opened ? ' opened' : unitDone ? ' ready' : ' lock') + '" data-a="chest" data-u="' + u + '" aria-label="Vaso de maná' + (opened ? ', aberto' : unitDone ? ', pronto para abrir' : ', bloqueado') + '">' + ART.vaso('vaso node-vaso') + '</button>' + (unitDone && !opened ? '<span class="start-bubble low">Abrir</span>' : '') + '</div>';
    h += '</div></section>';
  }
  h += '<div class="path-end">' + ART.mani('mani md', isDone(id) ? 'festa' : 'feliz') + '<p>' + (isDone(id) ? 'Você completou ' + t.nome + '.' : 'Faltam ' + plural(t.licoes.length - d, 'lição', 'lições') + ' para completar ' + t.nome + '.') + '</p><button class="btn sec" data-a="sheet" data-s="trilhas">Trocar de meta</button></div></div>';
  return h + '</main>';
}

function vPop(t, i, st) {
  const l = t.licoes[i];
  if (st === 'lock') return '<div class="pop lock" role="dialog"><b>' + esc(l.titulo) + '</b><p>Complete as lições anteriores para liberar esta.</p></div>';
  return '<div class="pop" role="dialog"><b>' + esc(l.titulo) + '</b><p>' + l.ref + ' · lição ' + (i + 1) + ' de ' + t.licoes.length + '</p>' +
    (st === 'done' ? '<button class="btn wbtn" data-a="startLesson" data-i="' + i + '" data-r="1">' + icon('repetir', 'ic sm') + ' Revisar · +5 XP</button>' : '<button class="btn wbtn" data-a="startLesson" data-i="' + i + '">Começar · +15 XP</button>') + '</div>';
}

/* ---------- Construção dos exercícios ---------- */
function pickOthers(arr, exclude, n) {
  const seen = new Set([exclude]);
  return shuffle(arr).filter(x => { if (seen.has(x)) return false; seen.add(x); return true; }).slice(0, n);
}
const words = s => s.replace(/[.,;:"()?!]/g, '').split(/\s+/).filter(Boolean);
function buildSteps(t, i) {
  const l = t.licoes[i], all = TRILHAS.flatMap(x => x.licoes), pool = t.licoes.length >= 5 ? t.licoes : all;
  const steps = [{ k: 'leia' }];
  steps.push({ k: 'mc', q: 'Qual destes títulos resume ' + l.ref + '?', opts: shuffle([l.titulo, ...pickOthers(pool.map(x => x.titulo), l.titulo, 3)]), ans: l.titulo, exp: l.ctx });
  const cand = words(l.ctx).filter(w => w.length >= 5 && !STOP.has(w.toLowerCase()) && l.ctx.indexOf(w) > -1);
  if (cand.length) {
    const w = cand[Math.floor(Math.random() * cand.length)];
    const others = all.flatMap(x => words(x.ctx)).filter(x => x.length >= 5 && !STOP.has(x.toLowerCase()) && x.toLowerCase() !== w.toLowerCase() && !l.ctx.includes(x));
    const at = l.ctx.indexOf(w);
    steps.push({ k: 'fill', before: l.ctx.slice(0, at), after: l.ctx.slice(at + w.length), opts: shuffle([w, ...pickOthers(others, w, 3)]), ans: w });
  }
  const tw = l.titulo.split(' ');
  if (tw.length >= 3) {
    const extra = pickOthers(all.flatMap(x => x.titulo.split(' ')).filter(x => !tw.includes(x) && x.length > 2), null, 2);
    steps.push({ k: 'tiles', prompt: 'Monte o título desta lição', hint: l.ref, target: tw, bank: shuffle([...tw, ...extra].map((w, j) => ({ w, id: j }))) });
  }
  steps.push({ k: 'mc', q: 'Em que texto você encontra "' + l.titulo + '"?', opts: shuffle([l.ref, ...pickOthers(pool.map(x => x.ref), l.ref, 3)]), ans: l.ref });
  steps.push({ k: 'reflita' });
  return steps;
}
async function aiQuestions(L) {
  if (!SAMPLE || L.review) return;
  const l = trilha(L.id).licoes[L.idx];
  try {
    const r = await SAMPLE.json(REGRAS + '\n\nCrie 2 perguntas de múltipla escolha sobre fatos explícitos de ' + l.ref + ' (tema da lição: ' + l.titulo + '). Use só fatos que estão claramente no texto bíblico, sem interpretação que divide as igrejas. Opções curtas, no máximo 8 palavras. Responda só com JSON: [{"pergunta": "...", "opcoes": ["4 opções"], "correta": 0, "explicacao": "1 frase citando o versículo por referência"}]', { modelTier: 'quick' });
    if (ui.L !== L || L.phase !== 'steps' || !Array.isArray(r)) return;
    const qs = r.filter(q => q && q.pergunta && Array.isArray(q.opcoes) && q.opcoes.length >= 3 && q.opcoes[q.correta]).slice(0, 2)
      .map(q => ({ k: 'mc', q: String(q.pergunta), opts: shuffle(q.opcoes.map(String)), ans: String(q.opcoes[q.correta]), exp: q.explicacao ? String(q.explicacao) : '', ia: true }));
    if (!qs.length) return;
    const at = Math.max(L.i + 1, 2);
    L.steps.splice(Math.min(at, L.steps.length - 1), 0, qs[0]);
    if (qs[1]) L.steps.splice(L.steps.length - 2, 0, qs[1]);
    L.total += qs.length;
    renderLesson();
  } catch (e) { /* sem IA, segue com os exercícios prontos */ }
}

function startLesson(id, idx, review) {
  const t = trilha(id);
  ui.pop = null; ui.aiText = ''; ui.aiErr = '';
  const steps = buildSteps(t, idx);
  ui.L = { id, idx, review: !!review, steps, total: steps.length, i: 0, phase: 'steps', pick: null, built: [], checked: null, combo: 0, best: 0, right: 0, wrong: 0, t0: Date.now(), lido: false };
  render();
  aiQuestions(ui.L);
}

/* ---------- Telas da lição ---------- */
function vLessonScreen() {
  const L = ui.L, t = trilha(L.id), l = t.licoes[L.idx];
  if (L.phase === 'fim') return vFim(L);
  if (L.phase === 'ofensiva') return vOfensivaUp();
  if (L.phase === 'sair') return '<div class="lesson"><main class="lz center-col">' + ART.mani('mani lg', 'triste') + '<h2 class="qt">Espere, não vá ainda!</h2><p class="body-l">Se sair agora, você perde o progresso desta lição.</p></main><footer class="lfoot col"><button class="btn" data-a="lessonStay">Continuar estudando</button><button class="btn ghost danger-t" data-a="lessonQuit">Sair da lição</button></footer></div>';
  const s = L.steps[L.i], prog = Math.min(100, (L.i / (L.steps.length)) * 100);
  let h = '<div class="lesson"><header class="lhead"><button class="iconbtn" data-a="lessonExit" aria-label="Sair da lição">' + icon('fechar') + '</button><span class="bar thick"><i style="width:' + prog + '%"></i></span>' +
    (L.combo >= 3 ? '<span class="combo tnum">' + L.combo + ' seguidas</span>' : '<span class="combo ghost tnum">' + (L.review ? 'Revisão' : '') + '</span>') + '</header><main class="lz">';
  if (s.k === 'leia') {
    const ver = S.quiz.versao && S.quiz.versao !== 'Outra ou não sei' ? 'na ' + S.quiz.versao : 'na sua Bíblia';
    h += '<div class="speak">' + ART.mani('mani sm', 'feliz') + '<div class="bubble">Abra ' + ver + ' e leia <b>' + l.ref + '</b> com calma. Depois a gente pratica.</div></div>' +
      '<article class="scroll"><p class="sc-ref">' + l.ref + '</p><h2 class="sc-t">' + l.titulo + '</h2><p class="sc-ctx">' + l.ctx + '</p>' + (t.nota ? '<p class="fine">' + t.nota + '</p>' : '') + '</article>';
    if (SAMPLE) {
      if (ui.aiText) h += '<div class="ai-out">' + esc(ui.aiText).split(/\n+/).map(p => '<p>' + p + '</p>').join('') + '</div>';
      if (ui.busy) h += '<button class="btn sec" data-a="stopAi">Parar a explicação</button>';
      else if (!ui.aiText) h += '<button class="btn sec" data-a="explain">Explicar este texto</button>';
      if (ui.aiErr) h += '<p class="err">' + esc(ui.aiErr) + '</p>';
    }
    h += '<label class="check big"><input type="checkbox" id="l-lido"' + (L.lido ? ' checked' : '') + '> Li ' + l.ref + '</label></main>';
    h += '<footer class="lfoot"><button class="btn" data-a="next"' + (L.lido ? '' : ' disabled') + '>Continuar</button></footer></div>';
    return h;
  }
  if (s.k === 'reflita') {
    h += '<div class="speak">' + ART.mani('mani sm', 'pensa') + '<div class="bubble">Última parte. Pense nisso antes de fechar a Bíblia.</div></div><article class="scroll"><p class="sc-ref">Para refletir</p><h2 class="sc-q">' + l.q + '</h2><textarea id="l-nota" rows="4" placeholder="Escreva sua resposta (opcional, fica só com você)">' + esc(S.notes[L.id + L.idx] || '') + '</textarea></article></main>';
    h += '<footer class="lfoot"><button class="btn" data-a="finishLesson">Concluir lição</button></footer></div>';
    return h;
  }
  const ck = L.checked;
  if (s.k === 'mc') {
    h += '<h2 class="ex-q">' + esc(s.q) + '</h2>' + (s.ia ? '<p class="fine">Pergunta criada por IA sobre o texto.</p>' : '') + '<div class="choices">';
    s.opts.forEach((o, j) => {
      let cls = L.pick === o ? ' sel' : '';
      if (ck) cls = o === s.ans ? ' right' : (L.pick === o ? ' wrong' : ' dim');
      h += '<button class="choice' + cls + '" data-a="pick" data-v="' + esc(o) + '"' + (ck ? ' disabled' : '') + '><span class="key tnum">' + (j + 1) + '</span><span>' + esc(o) + '</span></button>';
    });
    h += '</div>';
  } else if (s.k === 'fill') {
    const shown = L.pick ? '<span class="blank filled">' + esc(L.pick) + '</span>' : '<span class="blank">&nbsp;</span>';
    h += '<h2 class="ex-q">Complete a frase</h2><p class="fill-s">' + esc(s.before) + shown + esc(s.after) + '</p><div class="tiles bank">';
    s.opts.forEach(o => { h += '<button class="tile' + (L.pick === o ? ' used' : '') + (ck && o === s.ans ? ' right' : '') + '" data-a="pick" data-v="' + esc(o) + '"' + (ck ? ' disabled' : '') + '>' + esc(o) + '</button>'; });
    h += '</div>';
  } else if (s.k === 'tiles') {
    h += '<h2 class="ex-q">' + s.prompt + '</h2><div class="speak small">' + ART.mani('mani xs', 'pensa') + '<div class="bubble">' + esc(s.hint) + '</div></div><div class="tiles answer">';
    if (!L.built.length) h += '<span class="placeholder">Toque nas palavras abaixo</span>';
    L.built.forEach(id => { const w = s.bank.find(x => x.id === id); h += '<button class="tile" data-a="untile" data-id="' + id + '"' + (ck ? ' disabled' : '') + '>' + esc(w.w) + '</button>'; });
    h += '</div><div class="tiles bank">';
    s.bank.forEach(w => { const used = L.built.includes(w.id); h += '<button class="tile' + (used ? ' used' : '') + '" data-a="tile" data-id="' + w.id + '"' + (used || ck ? ' disabled' : '') + '>' + esc(w.w) + '</button>'; });
    h += '</div>';
  }
  h += '</main>';
  const ready = s.k === 'tiles' ? L.built.length > 0 : !!L.pick;
  if (!ck) h += '<footer class="lfoot"><button class="btn" data-a="checkAns"' + (ready ? '' : ' disabled') + '>Verificar</button></footer>';
  else {
    const ok = ck === 'ok', ansTxt = s.k === 'tiles' ? s.target.join(' ') : s.ans;
    const elog = ['Muito bem!', 'Isso mesmo!', 'Excelente!', 'Certinho!', 'Mandou bem!'][(L.right + L.i) % 5];
    h += '<footer class="lfoot sheet ' + (ok ? 'ok' : 'bad') + '" role="status"><div class="sheet-t">' + (ok ? icon('check', 'ic') : icon('fechar', 'ic')) + '<div><h3>' + (ok ? elog : 'Resposta certa:') + '</h3>' + (ok ? (s.exp && s.ia ? '<p>' + esc(s.exp) + '</p>' : '') : '<p><b>' + esc(ansTxt) + '</b></p>' + (s.exp ? '<p>' + esc(s.exp) + '</p>' : '')) + '</div></div><button class="btn ' + (ok ? 'okbtn' : 'badbtn') + '" data-a="next">Continuar</button></footer>';
  }
  return h + '</div>';
}

function vFim(L) {
  const r = L.result;
  return '<div class="lesson"><main class="lz center-col fim">' + ART.mani('mani lg', 'festa') + '<h2 class="qt">' + (L.review ? 'Revisão concluída!' : r.perfect ? 'Lição perfeita!' : 'Lição concluída!') + '</h2>' +
    '<div class="res"><div class="r-xp"><small>XP total</small><b data-count="' + r.xp + '">0</b></div><div class="r-ac"><small>' + (r.acc >= 90 ? 'Precisão alta' : 'Precisão') + '</small><b data-count="' + r.acc + '" data-suf="%">0%</b></div><div class="r-tm"><small>Tempo</small><b>' + r.tempo + '</b></div></div>' +
    (r.grains ? '<p class="body-l">+' + r.grains + ' grãos de maná' + (r.boost ? ' · XP em dobro ativo' : '') + '</p>' : '') +
    (S.group && !L.review ? '<p class="fine">Check-in postado no grupo ' + esc(S.group.nome) + '.</p>' : '') +
    '</main><footer class="lfoot"><button class="btn" data-a="afterFim">Continuar</button></footer></div>';
}

function weekRow() {
  const ws = weekStart(), nm = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return '<div class="week">' + nm.map((n, i) => {
    const k = addDays(ws, i), on = S.days.includes(k), hoje = k === todayK();
    return '<div class="wd' + (on ? ' on' : '') + (hoje ? ' today' : '') + '"><small>' + n + '</small><span>' + (on ? ART.grao() : '') + '</span></div>';
  }).join('') + '</div>';
}
function vOfensivaUp() {
  const n = S.streak.count;
  const frase = n === 1 ? 'Primeiro dia colhido. O maná cai de novo amanhã.' : n < 7 ? 'Faltam ' + (7 - n) + ' dias para uma semana inteira.' : n % 7 === 0 ? 'Mais uma semana inteira na Palavra.' : 'O maná não se guardava, e você colheu de novo.';
  return '<div class="lesson streak-bg"><main class="lz center-col"><div class="big-streak">' + ART.grao('grao huge') + '<b class="tnum" data-count="' + n + '">' + n + '</b></div><h2 class="qt">' + plural(n, 'dia', 'dias') + ' de ofensiva!</h2><p class="body-l">' + frase + '</p>' + weekRow() +
    '<p class="fine">Protetores de ofensiva: ' + S.protetores + '. Eles salvam um dia perdido.</p></main><footer class="lfoot"><button class="btn" data-a="closeLesson">Continuar</button></footer></div>';
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
  render(); SND.fim(); rain(80); countUp();
}
