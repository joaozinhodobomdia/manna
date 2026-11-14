/* Manna: jornada (caminho de lições) e motor da lição com exercícios. */

const UNIT = 5;
const ZIG = [0, 40, 58, 40, 0, -40, -58, -40];
const STOP = new Set('quando sobre entre depois antes mesmo porque pelos pelas pelo pela como todos todas também ainda outro outra outros outras nossa nosso deles dele dela onde cada muito mostra diz para esta este essa esse isso aquele seus suas qualquer'.split(' '));

/* ---------- Jornada ---------- */
function topBar() {
  const id = curTrail(), t = trilha(id), st = S.streak, hoje = studiedToday();
  return '<header class="hud">' +
    '<button class="hud-trail" data-a="open" data-ov="plano" aria-label="Meu plano">' + icon('livro') + '<span>' + t.nome + '</span></button>' +
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
  const US = t.unit || UNIT, units = Math.ceil(t.licoes.length / US), cu = Math.floor(Math.min(d, t.licoes.length - 1) / US);
  const u0 = Math.max(0, cu - 1), u1 = Math.min(units, cu + 4);
  h += '<div class="path">';
  if (u0 > 0) h += '<p class="path-more muted">' + plural(u0 * US, 'lição anterior concluída', 'lições anteriores concluídas') + '</p>';
  for (let u = u0; u < u1; u++) {
    const a = u * US, b = Math.min(t.licoes.length, a + US);
    const unitDone = d >= b;
    h += '<section class="unit"><div class="banner"><div><p>' + (US === 7 ? 'Semana ' : 'Unidade ') + (u + 1) + ' · ' + esc(t.nome) + '</p><h3>' + esc(US === 7 ? chunkRef(t.licoes.slice(a, b).flatMap(l => parseRef(l.ref))).replace(/;.*$/, '') + (b - a > 1 ? ' em diante' : '') : t.licoes[a].titulo) + '</h3><small>' + (US === 7 ? 'Leituras ' : 'Lições ') + (a + 1) + ' a ' + b + '</small></div>' + ART.banner() + '</div><div class="nodes">';
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
  if (u1 < units) h += '<p class="path-more muted">Mais ' + plural(t.licoes.length - u1 * US, 'lição', 'lições') + ' adiante na jornada.</p>';
  h += '<div class="path-end">' + ART.mani('mani md', isDone(id) ? 'festa' : 'feliz') + '<p>' + (isDone(id) ? 'Você completou ' + t.nome + '.' : 'Faltam ' + plural(t.licoes.length - d, 'lição', 'lições') + ' para completar ' + t.nome + '.') + '</p><button class="btn sec" data-a="open" data-ov="plano">Ver meu plano</button></div></div>';
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
function vLessonScreen() {
  const L = ui.L, t = trilha(L.id), l = t.licoes[L.idx];
  if (L.phase === 'load') return '<div class="lesson"><main class="lz center-col">' + ART.mani('mani lg', 'pensa') + '<p class="body-l">Abrindo a Bíblia…</p></main></div>';
  if (L.phase === 'fim') return vFim(L);
  if (L.phase === 'ofensiva') return vOfensivaUp();
  if (L.phase === 'sair') return '<div class="lesson"><main class="lz center-col">' + ART.mani('mani lg', 'triste') + '<h2 class="qt">Espere, não vá ainda!</h2><p class="body-l">Se sair agora, você perde o progresso desta lição.</p></main><footer class="lfoot col"><button class="btn" data-a="lessonStay">Continuar estudando</button><button class="btn ghost danger-t" data-a="lessonQuit">Sair da lição</button></footer></div>';
  const t2 = t, s = L.steps[L.i], prog = Math.min(100, (L.i / (L.steps.length)) * 100);
  let h = '<div class="lesson"><header class="lhead"><button class="iconbtn" data-a="lessonExit" aria-label="Sair da lição">' + icon('fechar') + '</button><span class="bar thick"><i style="width:' + prog + '%"></i></span>' +
    (L.combo >= 3 ? '<span class="combo tnum">' + L.combo + ' seguidas</span>' : '<span class="combo ghost tnum">' + (L.review ? 'Revisão' : '') + '</span>') + '</header><main class="lz">';
  if (s.k === 'leia') {
    const ver = S.quiz.versao && S.quiz.versao !== 'Outra ou não sei' ? S.quiz.versao : '';
    const ctx = l.ctx || (S.gen[l.ref] && S.gen[l.ref].contexto) || '';
    h += '<div class="speak">' + ART.mani('mani sm', 'feliz') + '<div class="bubble">' + (L.vs.length ? 'Leia <b>' + esc(l.ref) + '</b> com calma. Depois a gente pratica.' : 'Abra a sua Bíblia em <b>' + esc(l.ref) + '</b> e leia com calma.') + '</div></div>' +
      '<article class="scroll"><p class="sc-ref">' + esc(l.ref) + '</p><h2 class="sc-t">' + esc(l.titulo) + '</h2>' + (ctx ? '<p class="sc-ctx">' + esc(ctx) + '</p>' : '') + (t.nota ? '<p class="fine">' + t.nota + '</p>' : '') + '</article>';
    if (L.vs.length) h += '<article class="bible" style="--fs:' + S.fonte + 'px">' + bibleText(L.vs) + '<p class="fine">Bíblia Livre (BLIVRE), CC BY.' + (ver && ver !== 'BLIVRE' ? ' Se preferir, leia também na ' + ver + '.' : '') + '</p></article>';
    if (SAMPLE) {
      if (ui.aiText) h += '<div class="ai-out">' + esc(ui.aiText).split(/\n+/).map(p => '<p>' + p + '</p>').join('') + '</div>';
      if (ui.busy) h += '<button class="btn sec" data-a="stopAi">Parar a explicação</button>';
      else if (!ui.aiText) h += '<button class="btn sec" data-a="explain">Explicar este texto</button>';
      if (ui.aiErr) h += '<p class="err">' + esc(ui.aiErr) + '</p>';
    }
    h += '<label class="check big"><input type="checkbox" id="l-lido"' + (L.lido ? ' checked' : '') + '> Li ' + esc(l.ref) + '</label></main>';
    h += '<footer class="lfoot"><button class="btn" data-a="next"' + (L.lido ? '' : ' disabled') + '>Continuar</button></footer></div>';
    return h;
  }
  if (s.k === 'reflita') {
    h += '<div class="speak">' + ART.mani('mani sm', 'pensa') + '<div class="bubble">Última parte. Pense nisso antes de fechar a Bíblia.</div></div><article class="scroll"><p class="sc-ref">Para refletir</p><h2 class="sc-q">' + esc(s.q) + '</h2><textarea id="l-nota" rows="4" placeholder="Escreva sua resposta (opcional, fica só com você)">' + esc(S.notes[L.id + L.idx] || '') + '</textarea></article></main>';
    h += '<footer class="lfoot"><button class="btn" data-a="finishLesson">Concluir lição</button></footer></div>';
    return h;
  }
  const ck = L.checked;
  if (s.k === 'mc') {
    h += '<h2 class="ex-q">' + esc(s.q) + '</h2>' + (s.quote ? '<blockquote class="quote">' + esc(s.quote) + '</blockquote>' : '') + (s.ia ? '<p class="fine">Pergunta criada por IA sobre o texto.</p>' : '') + '<div class="choices">';
    s.opts.forEach((o, j) => {
      let cls = L.pick === o ? ' sel' : '';
      if (ck) cls = o === s.ans ? ' right' : (L.pick === o ? ' wrong' : ' dim');
      h += '<button class="choice' + cls + '" data-a="pick" data-v="' + esc(o) + '"' + (ck ? ' disabled' : '') + '><span class="key tnum">' + (j + 1) + '</span><span>' + esc(o) + '</span></button>';
    });
    h += '</div>';
  } else if (s.k === 'fill') {
    const shown = L.pick ? '<span class="blank filled">' + esc(L.pick) + '</span>' : '<span class="blank">&nbsp;</span>';
    h += '<h2 class="ex-q">' + esc(s.q || 'Complete a frase') + '</h2>' + (s.hint ? '<p class="sc-ref">' + esc(s.hint) + '</p>' : '') + '<p class="fill-s">' + esc(s.before) + shown + esc(s.after) + '</p><div class="tiles bank">';
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
