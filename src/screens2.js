/* Manna: objetivo do ano, plano aberto, catálogo, leitor da Bíblia Livre, hinário e trilhas criadas por IA. */

const isAdv = () => S.quiz.tradicao === 'adventista';
const nomeCulto = () => isAdv() ? 'Sábado' : 'Domingo';
const nomeEscola = () => isAdv() ? 'Escola Sabatina' : 'EBD';
const lastCultDay = () => { const d = now(); const back = isAdv() ? (d.getDay() + 1) % 7 : d.getDay(); return keyOf(new Date(d.getTime() - back * DAY)); };
const MAX_METAS = 12;

/* ---------- Sugestões ---------- */
function sugestoes() {
  const key = objTexto();
  if (!ui.sug || ui.sug.txt !== key) ui.sug = { txt: key, ids: sugerirLocal(S.objetivo, S.objSel), frase: '', tema: null, ia: false };
  return ui.sug;
}
async function sugerirIA() {
  if (!SAMPLE) return;
  const cat = catalogo().map(t => t.id + ' = ' + t.nome + ' (' + tipoDe(t) + ')').join('\n');
  ui.sugBusy = true; keep();
  try {
    const r = await SAMPLE.json(REGRAS + '\n\nObjetivo da pessoa para este ano: "' + objTexto() + '"\nTempo por dia: ' + (S.quiz.minutos || 10) + ' minutos.\n\nCatálogo de trilhas (id = nome):\n' + cat + '\n\nEscolha de 3 a 6 trilhas do catálogo que melhor atendem ao objetivo, na ordem em que faz sentido estudar. Se o objetivo pedir um tema que não está no catálogo, sugira o nome de uma trilha nova em "tema_novo". Responda só com JSON: {"ids": ["..."], "frase": "1 frase explicando a sugestão, falando com a pessoa", "tema_novo": null}', { modelTier: 'quick' });
    if (!r || typeof r !== 'object') throw new Error('vazio');
    const ids = (r.ids || []).filter(id => trilha(id));
    ui.sug = { txt: objTexto(), ids: ids.length ? ids : ui.sug.ids, frase: r.frase ? String(r.frase) : '', tema: r.tema_novo ? String(r.tema_novo) : null, ia: true };
  } catch (e) { if (e.code !== 'cancelled') toast(aiMsg(e)); }
  ui.sugBusy = false; keep();
}
function trailCard(t, opts) {
  const no = S.quiz.trilhas.includes(t.id), n = t.licoes.length;
  return '<button class="tcard' + (no ? ' on' : '') + '" data-a="' + (opts && opts.onb ? 'pickTrail' : 'toggleMeta') + '" data-id="' + t.id + '" aria-pressed="' + no + '"><b>' + esc(t.nome) + '</b><small>' + esc(t.desc || '') + '</small><span class="tc-f"><span class="muted tnum">' + tipoDe(t) + ' · ' + plural(n, t.tipo === 'Plano' ? 'leitura' : 'lição', t.tipo === 'Plano' ? 'leituras' : 'lições') + '</span><span class="tc-add">' + (no ? icon('check', 'ic sm') + ' No plano' : '+ Adicionar') + '</span></span></button>';
}
function vSugestoes(onb) {
  const sg = sugestoes();
  let h = '';
  if (sg.frase) h += '<p class="lede">' + esc(sg.frase) + '</p>';
  h += '<div class="tgrid">' + sg.ids.map(id => trailCard(trilha(id), { onb })).join('') + '</div>';
  if (sg.tema) h += '<button class="btn sec" data-a="genTema" data-t="' + esc(sg.tema) + '">Criar a trilha "' + esc(sg.tema) + '" com IA</button>';
  if (ui.sugBusy) h += ART.mani('mani m-sm row', 'pensativo', 'Estou preparando as sugestões.');
  if (SAMPLE && !sg.ia) h += ui.sugBusy ? '<button class="btn sec" disabled>Mani está pensando…</button>' : '<button class="btn sec" data-a="sugIA">Refinar as sugestões com IA</button>';
  return h;
}

/* Objetivo do ano: faixas com checkbox e um campo de texto */
function vFaixas() {
  const sel = S.objSel || [];
  return '<div class="faixas" role="group" aria-label="Objetivos">' + OBJ_OPCOES.map(o => {
    const on = sel.includes(o.id);
    return '<button class="faixa' + (on ? ' on' : '') + '" role="checkbox" aria-checked="' + on + '" data-a="objToggle" data-id="' + o.id + '"><span class="cbox">' + (on ? icon('check', 'ic xs') : '') + '</span><span class="fx-t"><b>' + o.t + '</b><small>' + o.d + '</small></span></button>';
  }).join('') + '</div>';
}
function objPronto() { return (S.objSel || []).length > 0 || S.objetivo.trim().length >= 3; }
function vObjetivo(s) {
  let h = '<main class="screen">' + quizHead(s) + '<h1 class="qt">O que você quer viver com a Bíblia este ano?</h1><p class="lede">Marque quantos quiser.</p>' + vFaixas() +
    '<label class="field">Quer contar com suas palavras?<textarea id="obj" rows="3" maxlength="400" placeholder="Ex.: Quero entender os profetas e a vida de Daniel">' + esc(S.objetivo) + '</textarea></label>';
  return h + '<div class="sticky-cta"><button class="btn" data-a="objNext"' + (objPronto() ? '' : ' disabled') + '>Ver sugestões</button></div></main>';
}
function vQuizSug(s) {
  const sg = sugestoes();
  if (!S.quiz.trilhas.length && !ui.sugInit) { S.quiz.trilhas = sg.ids.slice(0, 2); ui.sugInit = true; save(); }
  let h = '<main class="screen">' + quizHead(s) + '<h1 class="qt">Trilhas para o seu objetivo</h1><p class="lede">Escolha quantas quiser. Dá para mudar quando precisar.</p>';
  h += vSugestoes(true);
  return h + '<div class="sticky-cta"><button class="btn" data-a="next"' + (S.quiz.trilhas.length ? '' : ' disabled') + '>Continuar com ' + plural(S.quiz.trilhas.length, 'meta', 'metas') + '</button></div></main>';
}

/* ---------- Meu plano ---------- */
function vPlano() {
  let h = ovHead('Meu plano') + '<main class="screen"><h1 class="h1">Seu ano na Palavra</h1>';
  h += '<section class="card"><div class="sec-h"><h3>Seu objetivo</h3><button class="link" data-a="open" data-ov="explorar" data-id="Sugestões">Editar</button></div>' + (objTexto() ? '<ul class="dots">' + objTexto().split('. ').map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<p class="muted">Você ainda não definiu um objetivo.</p>') + '</section>';
  h += '<section class="sec"><div class="sec-h"><h2>' + plural(S.quiz.trilhas.length, 'etapa', 'etapas') + ' no seu ano</h2></div><ol class="etapas">';
  S.quiz.trilhas.forEach((id, i) => {
    const t = trilha(id);
    if (!t || !t.licoes.length) return;
    const d = doneCount(id), n = t.licoes.length;
    h += '<li class="' + (id === curTrail() ? 'cur' : '') + '"><span class="et-n">' + (isDone(id) ? icon('check', 'ic sm') : i + 1) + '</span><div class="et-b"><button class="et-t" data-a="goTrail" data-id="' + id + '"><b>' + esc(t.nome) + '</b><small class="muted">' + tipoDe(t) + ' · ' + d + ' de ' + n + (isDone(id) ? ' · concluída' : ' · até ' + fmt(planEnd(id), { day: 'numeric', month: 'short', year: 'numeric' })) + '</small></button><span class="bar"><i style="width:' + (d / n * 100) + '%"></i></span><div class="et-acts"><button class="mini-i" data-a="moveMeta" data-id="' + id + '" data-d="-1" aria-label="Subir esta etapa"' + (i ? '' : ' disabled') + '>↑</button><button class="mini-i" data-a="moveMeta" data-id="' + id + '" data-d="1" aria-label="Descer esta etapa"' + (i < S.quiz.trilhas.length - 1 ? '' : ' disabled') + '>↓</button><button class="mini-i" data-a="toggleMeta" data-id="' + id + '" aria-label="Remover do plano">Remover</button></div></div></li>';
  });
  h += '</ol></section><button class="btn" data-a="open" data-ov="explorar" data-id="Sugestões">Adicionar ao plano</button>';
  return h + '</main>';
}

/* ---------- Explorar catálogo ---------- */
function vExplorar(tab) {
  const aba = ui.expl = tab && ['Sugestões', 'Criar', ...TIPOS].includes(tab) ? (ui.ov.id = tab) : ui.expl;
  let h = ovHead('Explorar') + '<main class="screen"><h1 class="h1">Monte o seu ano</h1><div class="tabs-h" role="tablist">' + ['Sugestões', ...TIPOS, 'Criar'].map(x => '<button role="tab" aria-selected="' + (aba === x ? 'true' : 'false') + '" data-a="expl" data-t="' + x + '">' + ({ Plano: 'Planos', Livro: 'Livros', Personagem: 'Personagens', Época: 'Épocas', Tema: 'Temas' }[x] || x) + '</button>').join('') + '</div>';
  if (aba === 'Sugestões') {
    h += vFaixas() + '<form class="form" data-f="objetivo"><label class="field">Com suas palavras<textarea id="obj" rows="2" maxlength="400" placeholder="Ex.: Quero entender os profetas e orar melhor">' + esc(S.objetivo) + '</textarea></label><button class="btn sec" type="submit">Atualizar sugestões</button></form><h2 class="h2">Sugestões para você</h2>' + vSugestoes(false);
  } else if (aba === 'Criar') {
    h += '<p class="lede">Escreva um assunto e o Manna monta uma trilha com textos bíblicos.</p>';
    h += SAMPLE ? '<form class="form card" data-f="criarTrilha"><label>Sobre o que você quer aprender?<input id="cr-tema" maxlength="120" placeholder="Ex.: perdão, os profetas menores, a volta de Jesus"></label>' + busyBtn('Criar trilha') + '</form>'
      : '<p class="note">Criar trilhas novas usa IA, que não está disponível aqui. Os planos, livros, personagens, épocas e temas prontos funcionam normalmente.</p>';
    const minhas = Object.values(S.custom || {});
    if (minhas.length) h += '<section class="sec"><h2>Trilhas que você criou</h2><div class="tgrid">' + minhas.map(t => trailCard(t)).join('') + '</div></section>';
  } else {
    const f = norm(ui.explF || '');
    let list = catalogo().filter(t => tipoDe(t) === aba);
    if (aba === 'Tema') list = list.concat(Object.values(S.custom || {}));
    if (f) list = list.filter(t => norm(t.nome + ' ' + (t.desc || '')).includes(f));
    if (aba === 'Livro') h += '<input id="expl-f" class="search" type="search" placeholder="Buscar livro" value="' + esc(ui.explF || '') + '" aria-label="Buscar livro">';
    if (aba === 'Livro' && !f) {
      h += '<h3 class="grp">Antigo Testamento</h3><div class="tgrid">' + list.slice(0, NT).map(t => trailCard(t)).join('') + '</div><h3 class="grp">Novo Testamento</h3><div class="tgrid">' + list.slice(NT).map(t => trailCard(t)).join('') + '</div>';
    } else h += '<div class="tgrid">' + list.map(t => trailCard(t)).join('') + '</div>' + (list.length ? '' : '<p class="empty">Nada encontrado.</p>');
  }
  return h + '</main>';
}

/* ---------- Trilhas criadas por IA ou a partir de uma pregação ---------- */
async function genTrail(tema, fonte) {
  const prompt = REGRAS + '\n\nMonte uma trilha de estudo bíblico ' + (fonte ? 'a partir desta pregação ou anotação:\n"""\n' + fonte.slice(0, 12000) + '\n"""\n' : '') + 'Tema: ' + tema + '.\nCrie de 5 a 8 lições curtas em sequência lógica. Cada lição tem um texto bíblico principal com referência exata no formato "Livro capítulo" ou "Livro capítulo:versículo-versículo", com nomes dos livros em português (ex.: "1 Coríntios 13", "Salmos 23", "Mateus 6:25-34"), um título curto, 1 ou 2 frases de contexto e uma pergunta de reflexão.\nResponda só com JSON: {"nome": "nome curto da trilha", "desc": "1 frase", "licoes": [{"titulo": "...", "ref": "...", "contexto": "...", "pergunta": "..."}]}';
  aiCtl = new AbortController();
  const r = await SAMPLE.json(prompt, { signal: aiCtl.signal });
  if (!r || typeof r !== 'object') throw { code: 'vazio' };
  const licoes = (r.licoes || []).filter(x => x && x.ref && parseRef(String(x.ref)).length).slice(0, 10)
    .map(x => ({ ref: String(x.ref), titulo: String(x.titulo || x.ref), ctx: String(x.contexto || ''), q: String(x.pergunta || ''), caps: new Set(parseRef(String(x.ref)).map(s => s.b + ':' + s.c)).size }));
  if (!licoes.length) throw { code: 'vazio' };
  return { id: 'custom:' + uid(), tipo: 'Tema', origem: fonte ? 'pregacao' : 'ia', nome: String(r.nome || tema).slice(0, 60), desc: String(r.desc || ''), licoes };
}
function localTrail(tema, texto) {
  const refs = findRefs(texto).slice(0, 10);
  if (!refs.length) return null;
  return { id: 'custom:' + uid(), tipo: 'Tema', origem: 'pregacao', nome: tema.slice(0, 60), desc: 'Os textos citados na pregação, um por lição.', licoes: refs.map(r => ({ ref: r, titulo: r, caps: new Set(parseRef(r).map(s => s.b + ':' + s.c)).size })) };
}
function saveTrail(t, add) {
  S.custom[t.id] = t;
  if (add && !S.quiz.trilhas.includes(t.id) && S.quiz.trilhas.length < MAX_METAS) S.quiz.trilhas.push(t.id);
  save();
}

/* ---------- Bíblia Livre e hinário ---------- */
function vBiblia() {
  let h = '<main class="screen sheet-top">' + pageHead(ui.bibMode === 'hinario' ? 'Hinário' : 'Bíblia', ui.bibMode === 'hinario' ? 'Os hinos da sua igreja, organizados do seu jeito.' : 'Bíblia Livre completa, para ler e marcar o que já leu.', '') +
    '<div class="seg" role="tablist"><button role="tab" aria-selected="' + (ui.bibMode === 'biblia') + '" data-a="bibMode" data-m="biblia">Bíblia</button><button role="tab" aria-selected="' + (ui.bibMode === 'hinario') + '" data-a="bibMode" data-m="hinario">Hinário</button></div>';
  if (ui.bibMode === 'hinario') return h + vHinario() + '</main>';
  if (!BIBLIA) {
    loadBiblia().then(() => { if (ui.tab === 'biblia' && !ui.ov) keep(); }).catch(() => { ui.bibErr = true; if (ui.tab === 'biblia') keep(); });
    return h + (ui.bibErr ? ART.mani('mani m-md', 'bravinho', 'Ops, algo travou aqui. Tenta de novo?') + '<p class="note" role="alert">Não foi possível abrir a Bíblia agora. Verifique a conexão e tente de novo.</p><button class="btn sec" data-a="bibRetry">Tentar de novo</button>' : '<div class="center-col"><p class="muted">Abrindo a Bíblia Livre…</p></div>') + '</main>';
  }
  const B = ui.bib;
  if (!B) {
    const f = norm(ui.bibF || '');
    if (S.lastRead) { const [b, c] = S.lastRead.split(':').map(Number); h += '<button class="culto-row" data-a="bibGo" data-b="' + b + '" data-c="' + c + '"><span class="cr-ic">' + icon('livro') + '</span><span><b>Continuar em ' + LIVROS[b][0] + ' ' + c + '</b><small>Onde você parou</small></span><span class="chev">›</span></button>'; }
    h += '<input id="bib-f" class="search" type="search" placeholder="Buscar livro" value="' + esc(ui.bibF || '') + '" aria-label="Buscar livro">';
    [['Antigo Testamento', 0, NT], ['Novo Testamento', NT, 66]].forEach(([nome, a, z]) => {
      const ls = LIVROS.slice(a, z).map((l, i) => [l, a + i]).filter(([l]) => !f || norm(l[0]).includes(f));
      if (!ls.length) return;
      h += '<h3 class="grp">' + nome + '</h3><div class="books">' + ls.map(([[n, k], b]) => { const r = Object.keys(S.lidos).filter(x => x.startsWith(b + ':')).length; return '<button class="book" data-a="bibBook" data-b="' + b + '"><b>' + n + '</b><small class="muted tnum">' + r + '/' + k + '</small>' + (r ? '<span class="bar"><i style="width:' + (r / k * 100) + '%"></i></span>' : '') + '</button>'; }).join('') + '</div>';
    });
    return h + '<p class="fine center-t">' + esc(BIBLIA.fonte) + '</p></main>';
  }
  if (!B.c) {
    const [n, k] = LIVROS[B.b];
    h += '<div class="sec-h"><button class="link" data-a="bibBack">‹ Livros</button><span class="muted">' + n + '</span></div><h2 class="h1">' + n + '</h2><div class="chaps">';
    for (let c = 1; c <= k; c++) h += '<button class="chap' + (S.lidos[B.b + ':' + c] ? ' lido' : '') + '" data-a="bibGo" data-b="' + B.b + '" data-c="' + c + '">' + c + '</button>';
    return h + '</div></main>';
  }
  const [n, k] = LIVROS[B.b], key = B.b + ':' + B.c, vs = versesOf(n + ' ' + B.c), sel = ui.sel || [];
  h += '<div class="reader-h"><button class="iconbtn" data-a="bibChap" data-d="-1" aria-label="Capítulo anterior"' + (B.c > 1 ? '' : ' disabled') + '>' + icon('voltar') + '</button><button class="link" data-a="bibBook" data-b="' + B.b + '"><b>' + n + ' ' + B.c + '</b></button><button class="iconbtn flip" data-a="bibChap" data-d="1" aria-label="Próximo capítulo"' + (B.c < k ? '' : ' disabled') + '>' + icon('voltar') + '</button></div>' +
    '<div class="row fsz"><button class="pill" data-a="fonte" data-d="-1" aria-label="Diminuir letra">A−</button><button class="pill" data-a="fonte" data-d="1" aria-label="Aumentar letra">A+</button><span class="muted hint">Toque nos versículos para selecionar</span></div>';
  h += '<article class="bible" style="--fs:' + S.fonte + 'px">' + bibleText(vs, { tap: true, sel }) + '</article>';
  if (sel.length) {
    const txt = selText();
    h += '<div class="selbar"><span class="tnum">' + plural(sel.length, 'versículo', 'versículos') + '</span><button class="btn mini" data-a="copy" data-t="' + esc(txt) + '">Copiar</button>' + (S.group ? '<button class="btn mini sec" data-a="shareVerses">Postar no grupo</button>' : '') + '<button class="link" data-a="clearSel">Limpar</button></div>';
  }
  h += S.lidos[key] ? '<p class="lido-ok">' + icon('check', 'ic sm') + ' Você leu este capítulo em ' + fmt(S.lidos[key], { day: 'numeric', month: 'short' }) + '.</p>' + (B.c < k ? '<button class="btn sec" data-a="bibChap" data-d="1">Próximo: ' + n + ' ' + (B.c + 1) + '</button>' : '')
    : '<button class="btn" data-a="bibRead">Marcar como lido · +5 XP</button>';
  return h + '</main>';
}
function selText() {
  const sel = (ui.sel || []).map(k => k.split(':').map(Number)).sort((a, b) => a[2] - b[2]);
  if (!sel.length) return '';
  const [b, c] = sel[0], cap = BIBLIA.livros[b].c[c - 1];
  const nums = sel.map(x => x[2]);
  return sel.map(x => cap[x[2] - 1]).join(' ') + ' (' + LIVROS[b][0] + ' ' + c + ':' + (nums.length > 1 && nums[nums.length - 1] - nums[0] === nums.length - 1 ? nums[0] + '-' + nums[nums.length - 1] : nums.join(',')) + ', Bíblia Livre)';
}
function vHinario() {
  const hid = S.hinario || hinarioPadrao(), hn = HINARIOS.find(x => x.id === hid);
  const meus = S.hinos.filter(x => x.h === hid).sort((a, b) => (b.fav - a.fav) || (a.n - b.n));
  let h = '<form class="form card" data-f="hino"><label>Seu hinário<select id="h-sel" data-a2="hinario">' + HINARIOS.map(x => '<option value="' + x.id + '"' + (x.id === hid ? ' selected' : '') + '>' + x.nome + '</option>').join('') + '</select></label>' +
    '<div class="two"><label>Número<input id="h-n" type="number" min="1" max="999" inputmode="numeric" placeholder="Ex.: 12"></label><label>Título<input id="h-t" maxlength="80" placeholder="Nome do hino"></label></div><button class="btn sec" type="submit">Guardar hino</button></form>';
  h += '<section class="sec"><div class="sec-h"><h2>Meus hinos</h2><span class="muted tnum">' + meus.length + '</span></div>';
  if (!meus.length) h += '<p class="empty">Guarde os hinos que você mais canta. Eles ficam aqui com um atalho para ouvir.</p>';
  else h += '<ul class="hinos">' + meus.map(x => '<li><span class="h-n tnum">' + x.n + '</span><div><b>' + esc(x.t || 'Hino ' + x.n) + '</b><a class="link" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(hn.nome + ' hino ' + x.n + ' ' + (x.t || '')) + '" target="_blank" rel="noopener noreferrer">Ouvir no YouTube<span class="sr-only"> (abre outra página)</span></a></div><button class="pill' + (x.fav ? ' on' : '') + '" data-a="hinoFav" data-id="' + x.id + '" aria-pressed="' + !!x.fav + '">' + (x.fav ? 'Favorito' : 'Favoritar') + '</button><button class="mini-i" data-a="hinoDel" data-id="' + x.id + '" aria-label="Remover hino ' + esc(x.t || String(x.n)) + '">Remover</button></li>').join('') + '</ul>';
  return h + '</section><p class="fine">As letras e partituras dos hinários pertencem às editoras (Casa Publicadora Brasileira, CPAD, JUERP e outras). Por isso o Manna guarda só número e título.</p>';
}

/* ---------- Ditado de anotações durante o culto ---------- */
let DICT = null;
if (window.claude && window.claude.use) {
  window.claude.use('dictation').then(d => {
    DICT = d; if (!d) return;
    d.onFinal(({ text }) => { const v = ((ui.draft && ui.draft['c-notas']) || '') + ' ' + text; ui.draft = Object.assign(ui.draft || {}, { 'c-notas': v.trim() }); const ta = $('c-notas'); if (ta) ta.value = ui.draft['c-notas']; });
    d.onState(({ state }) => { ui.dictOn = state === 'listening'; const b = document.querySelector('[data-a="dict"]'); if (b) b.textContent = ui.dictOn ? 'Parar de ditar' : 'Ditar anotações'; });
    if (ui.tab === 'domingo' && !ui.L) keep();
  }).catch(() => {});
}
