/* Manna: telas, render e ações. */

/* ---------- Onboarding ---------- */
const QUIZ = [
  { k: 'denom', t: 'Qual é a sua igreja ou denominação?', sub: 'Nas dúvidas, a visão da sua tradição aparece primeiro.', fala: '', opts: DENOMINACOES.map(d => d[0]) },
  { k: 'convertido', t: 'Há quanto tempo você é convertido?', fala: 'Há quanto tempo você caminha com Jesus?', opts: ['Menos de 1 ano', 'De 1 a 5 anos', 'De 5 a 15 anos', 'Mais de 15 anos', 'Ainda estou conhecendo'] },
  { k: 'leitura', t: 'Como está sua leitura bíblica hoje?', fala: 'Sem julgamento: como está sua leitura da Bíblia?', opts: ['Leio todo dia', 'Leio às vezes', 'Parei de ler'] },
  { k: 'minutos', t: 'Quanto tempo você tem por dia?', fala: 'Quanto tempo por dia você quer separar?', opts: [[5, '5 minutos · leve'], [10, '10 minutos · firme'], [20, '20 minutos · intenso']] },
  { k: 'objetivo', t: 'Qual é o seu objetivo para este ano?' },
  { k: 'sugestoes', t: 'Sugestões para o seu objetivo' },
  { k: 'celula', t: 'Você participa de célula ou EBD?', fala: 'Você participa de célula ou de EBD?', opts: ['Célula', 'EBD', 'Os dois', 'Nenhum dos dois'] },
  { k: 'versao', t: 'Qual versão da Bíblia você usa?', sub: 'O Manna já vem com a Bíblia Livre completa para ler aqui. Se na igreja você usa outra, pode acompanhar nela também.', fala: 'Qual versão da Bíblia você usa? O Manna já vem com a Bíblia Livre completa para ler aqui. Se na igreja você usa outra, dá para acompanhar nela também.', opts: [
    { v: 'BLIVRE', l: 'Bíblia Livre', tag: 'Já vem no app', d: 'Tradução brasileira de 2018, feita a partir do hebraico e do grego. Você lê o texto completo aqui no Manna, sem precisar abrir outra Bíblia.' },
    { v: 'ARA', l: 'Almeida Revista e Atualizada (ARA)', d: 'Linguagem formal e muito fiel ao original. Comum em igrejas batistas, presbiterianas e adventistas.' },
    { v: 'ARC', l: 'Almeida Revista e Corrigida (ARC)', d: 'A mais tradicional, com português clássico ("vós", "porventura"). Muito usada nas Assembleias de Deus.' },
    { v: 'ACF', l: 'Almeida Corrigida Fiel (ACF)', d: 'Almeida tradicional baseada no Textus Receptus. Preferida por quem valoriza esse texto grego.' },
    { v: 'NAA', l: 'Nova Almeida Atualizada (NAA)', d: 'Revisão de 2017 da Almeida: mantém a precisão da ARA com um português mais fluente.' },
    { v: 'NVI', l: 'Nova Versão Internacional (NVI)', d: 'Português atual e claro, equilibrando fidelidade e facilidade de leitura.' },
    { v: 'NTLH', l: 'Nova Tradução na Linguagem de Hoje (NTLH)', d: 'Linguagem simples do dia a dia. Boa para quem está começando ou lê com crianças.' },
    { v: 'Outra ou não sei', l: 'Outra ou não sei', d: 'Sem problema. Você lê na Bíblia Livre do app.' },
  ] },
  { k: 'horario', t: 'Qual horário você prefere para o lembrete?', fala: 'Que horas eu te lembro da sua porção?', opts: ['6h', '7h', '12h', '19h', '21h'] },
];
const goalFor = m => ({ 5: 20, 10: 30, 20: 50 }[m] || 30);

function vOnboarding() {
  const s = S.step;
  if (s === 0) return '<main class="onb-hero"><div class="onb-top">' + ART.logo('logo md') + '<span class="brand">manna</span></div>' + ART.mani('mani m-hero', 'leitora', 'Oi! Eu sou Mani. Vamos colher sua porção de hoje?') +
    '<div class="onb-c"><h1>Sua porção diária da Palavra</h1><p>Lições curtas na Bíblia, a pregação do culto virando estudo e os irmãos da sua igreja junto com você.</p>' +
    '<button class="btn" data-a="next">Montar meu plano' + icon('voltar', 'ic flip') + '</button><p class="fine">Leva 1 minuto.</p></div></main>';
  if (s >= 1 && s <= QUIZ.length) return QUIZ[s - 1].k === 'objetivo' ? vObjetivo(s) : QUIZ[s - 1].k === 'sugestoes' ? vQuizSug(s) : vQuiz(QUIZ[s - 1], s);
  if (s === QUIZ.length + 1) return vResultado();
  if (s === QUIZ.length + 2) return vPaywall();
  return vConvite();
}
function quizHead(s) {
  return '<div class="qhead"><button class="iconbtn" data-a="back" aria-label="Voltar">' + icon('voltar') + '</button><span class="tnum muted">' + s + ' de ' + QUIZ.length + '</span></div><div class="segs">' + QUIZ.map((_, i) => '<i class="' + (i + 1 < s ? 'on' : i + 1 === s ? 'now' : '') + '"></i>').join('') + '</div>';
}
function vQuiz(q, s) {
  let h = '<main class="screen">' + quizHead(s) + '<h1 class="qt">' + q.t + '</h1>' + (q.sub ? '<p class="lede">' + q.sub + '</p>' : '');
  if (q.multi) {
    const sel = S.quiz.trilhas;
    ['Livro', 'Personagem', 'Tema'].forEach(tp => {
      h += '<h3 class="grp">' + { Livro: 'Um livro', Personagem: 'Um personagem', Tema: 'Um tema' }[tp] + '</h3><div class="cards2">';
      TRILHAS.filter(t => t.tipo === tp).forEach(t => {
        const i = sel.indexOf(t.id);
        h += '<button class="pick' + (i > -1 ? ' on' : '') + '" data-a="pickTrail" data-id="' + t.id + '" aria-pressed="' + (i > -1) + '">' + (i > -1 ? '<em class="ord">' + (i + 1) + '</em>' : '') + '<b>' + t.nome + '</b><small>' + t.desc + '</small><span class="muted tnum">' + plural(t.licoes.length, 'lição', 'lições') + '</span></button>';
      });
      h += '</div>';
    });
    h += '<div class="sticky-cta"><button class="btn" data-a="next"' + (sel.length ? '' : ' disabled') + '>Continuar</button></div>';
  } else {
    h += '<div class="choices">';
    q.opts.forEach(o => {
      if (o && o.v) {
        h += '<button class="choice rich' + (S.quiz[q.k] === o.v ? ' sel' : '') + '" data-a="answer" data-k="' + q.k + '" data-v="' + esc(o.v) + '"><span class="pl-l"><b>' + esc(o.l) + (o.tag ? ' <span class="tag-in">' + o.tag + '</span>' : '') + '</b><small>' + esc(o.d) + '</small></span></button>';
        return;
      }
      const v = Array.isArray(o) ? o[0] : o, label = Array.isArray(o) ? o[1] : o;
      h += '<button class="choice' + (S.quiz[q.k] === v ? ' sel' : '') + '" data-a="answer" data-k="' + q.k + '" data-v="' + esc(v) + '">' + esc(label) + '</button>';
    });
    h += '</div>';
  }
  return h + '</main>';
}
function vResultado() {
  const q = S.quiz, first = trilha(q.trilhas[0]);
  const des = (q.celula === 'Célula' || q.celula === 'Os dois') ? 'Chame sua célula para "Evangelhos em 30 dias".' : 'Faça 7 dias seguidos e ganhe a medalha Fiel.';
  let h = '<main class="screen">' + ART.mani('mani m-md row', 'grata', 'Pronto! Seu plano está montado.') + '<h1 class="h1">Seu plano para 2027</h1><p class="lede">Começa hoje, ' + fmt(todayK()) + '.</p>';
  h += '<section class="plan-path">';
  q.trilhas.forEach((id, i) => {
    const t = trilha(id);
    h += '<div class="pp"><span class="pp-n">' + (i + 1) + '</span><div><b>' + t.nome + '</b><small class="muted">' + plural(t.licoes.length, 'lição', 'lições') + ' · até ' + fmt(planEnd(id), { day: 'numeric', month: 'short', year: 'numeric' }) + '</small></div></div>';
  });
  h += '</section><div class="stats3"><div><b class="tnum">' + goalFor(q.minutos) + '</b><span>XP por dia</span></div><div><b class="tnum">' + q.minutos + '</b><span>minutos</span></div><div><b>' + (q.horario || '7h') + '</b><span>lembrete</span></div></div>';
  h += '<section class="card"><h3>Primeiro desafio</h3><p>' + des + '</p></section><section class="card"><h3>Sua primeira lição</h3><p><b>' + first.licoes[0].ref + '</b>: ' + first.licoes[0].titulo + '</p></section>';
  return h + '<div class="sticky-cta"><button class="btn" data-a="next">Começar meu plano</button></div></main>';
}
function planEnd(id) {
  let acc = 0; const rit = { 5: 5, 10: 6, 20: 7 }[S.quiz.minutos || 10];
  for (const t of S.quiz.trilhas) { const tt = trilha(t); acc += (tt.licoes.length - doneCount(t)) * (tt.tipo === 'Plano' ? rit / 7 : 1); if (t === id) break; }
  return addDays(todayK(), Math.ceil(acc / rit * 7));
}
function vPaywall() {
  const p = S.plano || 'anual';
  const plans = [['anual', 'Anual', 'R$ 7,49', '/mês', 'R$ 89,90 cobrados uma vez por ano'], ['mensal', 'Mensal', 'R$ 9,90', '/mês', 'Cancele quando quiser'], ['familia', 'Família ou célula', 'R$ 149,90', '/ano', 'Até 5 pessoas']];
  const preco = { anual: 'R$ 89,90 por ano', mensal: 'R$ 9,90 por mês', familia: 'R$ 149,90 por ano' }[p];
  let h = '<main class="screen"><button class="iconbtn" data-a="back" aria-label="Voltar">' + icon('voltar') + '</button><h1 class="h1">Comece com 7 dias grátis</h1>' +
    '<ul class="perks"><li>' + icon('check', 'ic sm') + 'Jornada completa com todas as metas</li><li>' + icon('check', 'ic sm') + 'Culto de domingo virando estudo da semana</li><li>' + icon('check', 'ic sm') + 'Dúvidas com versículos e as visões das tradições</li><li>' + icon('check', 'ic sm') + 'Liga semanal, grupos e protetor de ofensiva</li></ul><div class="choices">';
  plans.forEach(([id, nome, v, per, det]) => {
    h += '<button class="choice plan' + (p === id ? ' sel' : '') + '" data-a="plan" data-id="' + id + '" aria-pressed="' + (p === id) + '">' + (id === 'anual' ? '<span class="ribbon">Economize 24%</span>' : '') + '<span class="pl-l"><b>' + nome + '</b><small>' + det + '</small></span><span class="pl-p"><b class="tnum">' + v + '</b><small>' + per + '</small></span></button>';
  });
  h += '</div><ol class="tl"><li><b>Hoje</b><span>Acesso completo. Você paga R$ 0,00.</span></li><li><b>' + fmt(addDays(todayK(), 5)) + '</b><span>Avisamos que o teste está acabando.</span></li><li><b>' + fmt(addDays(todayK(), 7)) + '</b><span>Começa a cobrança de ' + preco + ', se você não cancelar.</span></li></ol>' +
    '<div class="sticky-cta"><button class="btn" data-a="trial">Começar 7 dias grátis</button><p class="fine center-t">Versão de teste: nenhum pagamento é pedido nem cobrado.</p></div></main>';
  return h;
}
function vConvite() {
  return '<main class="screen">' + ART.mani('mani m-md row', 'joinha', 'Quem lê junto não para.') + '<h1 class="h1">Estude com a sua igreja</h1><p class="lede">Crie um grupo para a sua célula ou entre com o código de um irmão.</p>' + vGroupForms(true) + '<button class="btn sec" data-a="finish">Agora não</button></main>';
}

/* ---------- Domingo ---------- */
function busyBtn(label) {
  return (ui.busy ? '<div class="busy"><button class="btn" disabled>Montando… pode levar até um minuto</button><button type="button" class="btn ghost" data-a="stopAi">Cancelar</button></div>' : '<button class="btn" type="submit">' + label + '</button>') +
    (ui.aiErr ? '<p class="err" role="alert">' + esc(ui.aiErr) + '</p>' : '');
}
function pageHead(title, sub) {
  return capa(title, sub);
}
function dv(id) { return esc((ui.draft && ui.draft[id]) || ''); }
function vDomingo() {
  let h = '<main class="screen sheet-top">' + pageHead(nomeCulto(), 'A pregação e a ' + nomeEscola() + ' viram o estudo da sua semana.') + (ui.domMode === 'culto' ? ART.mani('mani m-sm row', 'leitora', 'Como foi o culto? Me conta o tema.') : '') + '<div class="seg" role="tablist"><button role="tab" aria-selected="' + (ui.domMode === 'culto') + '" data-a="dom" data-m="culto">Culto</button><button role="tab" aria-selected="' + (ui.domMode === 'ebd') + '" data-a="dom" data-m="ebd">' + nomeEscola() + '</button></div>';
  if (ui.domMode === 'culto') {
    h += '<form class="form card" data-f="culto"><h3>Registrar a pregação · +20 XP</h3>' +
      '<label>Tema da pregação<input id="c-tema" required maxlength="140" placeholder="Ex.: A fé que vence o medo" value="' + dv('c-tema') + '"></label>' +
      '<label>Versículos citados<textarea id="c-vers" rows="2" placeholder="Ex.: Josué 1:9; Marcos 4:35-41">' + dv('c-vers') + '</textarea></label>' +
      '<div class="two"><label>Pregador<input id="c-preg" maxlength="60" placeholder="Opcional" value="' + dv('c-preg') + '"></label><label>Data<input id="c-data" type="date" value="' + (dv('c-data') || lastCultDay()) + '"></label></div>' +
      '<label>Igreja<input id="c-igreja" maxlength="80" placeholder="Opcional" value="' + (dv('c-igreja') || esc(S.lastIgreja || '')) + '"></label>' +
      '<label>Link da pregação no YouTube<input id="c-link" type="url" placeholder="Opcional" value="' + dv('c-link') + '"></label>' +
      '<label>Transcrição da pregação<textarea id="c-trans" rows="4" placeholder="Cole aqui a transcrição. No YouTube: abaixo do vídeo, Mostrar transcrição.">' + dv('c-trans') + '</textarea></label>' +
      '<label class="file">Ou envie o arquivo da transcrição (.txt, .srt, .vtt)<input id="c-file" type="file" accept=".txt,.srt,.vtt,text/plain"></label>' +
      '<label>Suas anotações<textarea id="c-notas" rows="3" placeholder="O que mais marcou você?">' + dv('c-notas') + '</textarea></label>' +
      (DICT ? '<button type="button" class="btn sec" data-a="dict">' + (ui.dictOn ? 'Parar de ditar' : 'Ditar anotações') + '</button>' : '') +
      '<label class="check"><input type="checkbox" id="c-trilha"' + (ui.draft && ui.draft['c-trilha'] === false ? '' : ' checked') + '> Criar também uma trilha para aprender mais sobre este tema</label>' +

      busyBtn('Montar estudo da semana') + '</form>';
    if (S.cultos.length) {
      h += '<section class="sec"><h2>Biblioteca de pregações</h2><ul class="list">';
      S.cultos.forEach(c => { h += '<li><button data-a="open" data-ov="culto" data-id="' + c.id + '"><b>' + esc(c.tema) + '</b><span class="muted">' + fmt(c.data, { day: 'numeric', month: 'short' }) + (c.pregador ? ' · ' + esc(c.pregador) : '') + ' · ' + c.feitos.length + ' de 5 dias' + (c.trilha ? ' · com trilha' : '') + '</span></button></li>'; });
      h += '</ul></section>';
    }
  } else {
    h += '<form class="form card" data-f="ebd"><h3>Preparar a lição · +15 XP</h3>' +
      '<label>Tema da lição<input id="e-tema" required maxlength="140" placeholder="Ex.: A paciência de Jó" value="' + dv('e-tema') + '"></label>' +
      '<label>Textos bíblicos<textarea id="e-textos" rows="2" placeholder="Ex.: Jó 1:1-22; Tiago 5:11">' + dv('e-textos') + '</textarea></label>' +
      '<div class="seg small" role="radiogroup"><button type="button" role="radio" aria-checked="' + (ui.ebdModo !== 'professor') + '" data-a="ebdModo" data-m="aluno">Sou aluno</button><button type="button" role="radio" aria-checked="' + (ui.ebdModo === 'professor') + '" data-a="ebdModo" data-m="professor">Sou professor</button></div>' +
      '<p class="fine">O Manna não reproduz ' + (isAdv() ? 'a Lição da Escola Sabatina' : 'as revistas de EBD') + '. A preparação é material próprio sobre os textos bíblicos.</p>' + busyBtn('Preparar a lição') + '</form>';
    if (S.ebds.length) {
      h += '<section class="sec"><h2>Lições preparadas</h2><ul class="list">';
      S.ebds.forEach(e => { h += '<li><button data-a="open" data-ov="ebd" data-id="' + e.id + '"><b>' + esc(e.tema) + '</b><span class="muted">' + fmt(e.data, { day: 'numeric', month: 'short' }) + ' · ' + e.modo + '</span></button></li>'; });
      h += '</ul></section>';
    }
  }
  return h + '</main>';
}

/* ---------- Dúvidas ---------- */
function vDuvidas() {
  const f = ui.filtro.toLowerCase();
  const list = DUVIDAS.filter(d => !f || (d.q + ' ' + d.cat).toLowerCase().includes(f));
  const cats = [...new Set(DUVIDAS.map(d => d.cat))];
  let h = '<main class="screen sheet-top">' + pageHead('Dúvidas', 'O que dá vergonha de perguntar ao pastor, respondido com versículos.');
  h += '<form class="form ask" data-f="duvida"><label class="field" for="d-q">Pergunte sem vergonha. Só você vê.</label><textarea id="d-q" rows="2" maxlength="300" aria-label="Sua pergunta" placeholder="Ex.: Posso ser padrinho numa igreja católica?"></textarea>' +
    (SAMPLE ? busyBtn('Perguntar') : '<p class="fine">' + (aiChecked ? 'A pergunta livre usa IA e não está disponível aqui. A biblioteca abaixo funciona normalmente.' : 'Verificando a IA…') + '</p>') + '</form>';
  if (S.perguntas.length) {
    h += '<section class="sec"><h2>Suas perguntas</h2><ul class="list">';
    S.perguntas.forEach(p => { h += '<li><button data-a="open" data-ov="duvida" data-id="' + p.id + '"><b>' + esc(p.q) + '</b></button></li>'; });
    h += '</ul></section>';
  }
  h += '<section class="sec"><div class="sec-h"><h2>Biblioteca</h2><span class="muted tnum">' + S.duvidasLidas.length + ' de ' + DUVIDAS.length + ' estudadas</span></div>' +
    '<input id="d-filtro" class="search" type="search" placeholder="Buscar: vinho, dízimo, namoro…" value="' + esc(ui.filtro) + '" aria-label="Buscar dúvidas">';
  cats.forEach(c => {
    const ds = list.filter(d => d.cat === c); if (!ds.length) return;
    h += '<h3 class="grp">' + c + '</h3><ul class="list">';
    ds.forEach(d => { const lida = S.duvidasLidas.includes(d.id); h += '<li><button data-a="open" data-ov="duvida" data-id="' + d.id + '" class="dq"><span class="dq-dot' + (lida ? ' on' : '') + '">' + (lida ? icon('check', 'ic xs') : '') + '</span><b>' + d.q + '</b>' + (lida ? '' : '<span class="xp-tag">+5 XP</span>') + '</button></li>'; });
    h += '</ul>';
  });
  if (!list.length) h += '<p class="empty">Nada encontrado. Faça a pergunta no campo acima.</p>';
  return h + '</section></main>';
}

/* ---------- Liga e grupo ---------- */
function vLiga() {
  let h = '<main class="screen sheet-top">' + capa(ui.ligaMode === 'grupo' ? (S.group ? esc(S.group.nome) : 'Seu grupo') : 'Liga da semana', ui.ligaMode === 'grupo' ? 'Leitura junto com a sua igreja.' : 'Quem mais estudou nesta semana.') + '<div class="seg" role="tablist"><button role="tab" aria-selected="' + (ui.ligaMode === 'liga') + '" data-a="ligaMode" data-m="liga">Liga semanal</button><button role="tab" aria-selected="' + (ui.ligaMode === 'grupo') + '" data-a="ligaMode" data-m="grupo">Meu grupo</button></div>';
  if (ui.ligaMode === 'grupo') return h + vGrupoBody() + '</main>';
  const ws = weekStart(), di = diff(ws, todayK()), rows = leagueTable(ws, di), lg = LIGAS[S.league.div];
  const resta = 7 - di;
  h += '<section class="liga-h"><div class="shields">' + LIGAS.map((l, i) => '<span class="sh' + (i === S.league.div ? ' cur' : i > S.league.div ? ' next' : '') + '">' + ART.escudo(i <= S.league.div ? 'var(--ouro)' : 'var(--bloq)', 'escudo' + (i === S.league.div ? ' big' : '')) + '</span>').join('') + '</div>' +
    '<h1 class="h1">Você está em ' + (rows.findIndex(r => r.me) + 1) + 'º na Liga ' + lg.nome + '</h1><p class="muted">Os 3 primeiros sobem de liga. Termina em ' + plural(resta, 'dia', 'dias') + '.</p></section><ol class="league">';
  rows.forEach((r, i) => {
    if (i === 3) h += '<li class="zone up">' + icon('voltar', 'ic xs up-ic') + 'Zona de promoção</li>';
    if (i === 8 && S.league.div > 0) h += '<li class="zone down">Zona de rebaixamento</li>';
    h += '<li class="lr' + (r.me ? ' me' : '') + (i < 3 ? ' top' : '') + '"><span class="pos tnum">' + (i + 1) + '</span><span class="av' + (r.me ? ' me' : '') + '">' + esc((r.nome.replace('Pr. ', '')[0] || 'V').toUpperCase()) + '</span><span class="nm">' + esc(r.nome) + (r.me ? '' : '') + '</span><b class="tnum">' + r.xp + ' XP</b></li>';
  });
  h += '</ol>';
  return h + '</main>';
}
function vGroupForms(onb) {
  const m = ui.groupMode;
  let h = '<div class="choices"><button class="choice' + (m === 'criar' ? ' sel' : '') + '" data-a="gmode" data-m="criar"><span class="pl-l"><b>Criar um grupo</b><small>Célula, família, ministério ou amigos</small></span></button>' +
    '<button class="choice' + (m === 'entrar' ? ' sel' : '') + '" data-a="gmode" data-m="entrar"><span class="pl-l"><b>Entrar com um código</b><small>Recebeu o convite de alguém</small></span></button></div>';
  if (m === 'criar') {
    h += '<form class="form card" data-f="gcriar"><label>Nome do grupo<input id="g-nome" required maxlength="40" placeholder="Ex.: Célula Esperança"></label><label>Desafio<select id="g-des">' +
      DESAFIOS.map(d => '<option value="' + d.id + '">' + d.nome + '</option>').join('') + '</select></label><label>Seu nome no grupo<input id="g-eu" maxlength="30" value="' + esc(S.nome) + '" placeholder="Como os irmãos te chamam"></label><button class="btn" type="submit">Criar grupo</button></form>';
  } else if (m === 'entrar') {
    h += '<form class="form card" data-f="gentrar"><label>Código do convite<input id="g-code" required maxlength="8" placeholder="Ex.: K7Q2MD" autocapitalize="characters"></label><label>Seu nome no grupo<input id="g-eu" maxlength="30" value="' + esc(S.nome) + '"></label><button class="btn" type="submit">Entrar no grupo</button></form>';
  }
  return h;
}
function vGrupoBody() {
  const g = S.group;
  if (!g) return '<p class="lede">Leia junto com a sua célula: desafio com prazo, ranking e check-in todo dia.</p>' + vGroupForms(false);
  const d = desafio(g.desafio), dia = Math.min(d.dias, diff(g.start, todayK()) + 1), meus = S.chapters - g.chapAtStart;
  const convite = 'Entre no meu grupo "' + g.nome + '" no Manna para o desafio ' + d.nome + '. Código: ' + g.code;
  const semana = weekChaps() + MEMBROS.reduce((a, m) => a + Math.round(m.rate * 7), 0);
  let h = ART.mani('mani m-sm row', 'joinha', 'Sua célula leu ' + semana + ' capítulos esta semana.') + '<section class="banner group-b"><div><h3>' + esc(g.nome) + '</h3><small>' + d.nome + ' · dia ' + dia + ' de ' + d.dias + '</small></div>' + ART.banner() + '</section>';
  h += '<section class="card"><div class="sec-h"><h3>Seu progresso no desafio</h3><span class="tnum muted">' + meus + '/' + d.caps + '</span></div><span class="bar thick"><i style="width:' + Math.min(100, meus / d.caps * 100) + '%"></i></span><p class="fine">O ritmo do desafio é ' + (d.caps / d.dias).toFixed(1).replace('.', ',') + ' capítulos por dia.</p></section>';
  const rk = ranking(), mp = rk.findIndex(r => r.me) + 1;
  h += '<section class="sec"><h2>Você está em ' + mp + 'º no grupo</h2><ol class="league">';
  rk.forEach((r, i) => { h += '<li class="lr' + (r.me ? ' me' : '') + (i < 3 ? ' top' : '') + '"><span class="pos tnum">' + (i + 1) + '</span><span class="av' + (r.me ? ' me' : '') + '">' + esc((r.nome.replace('Pr. ', '')[0] || 'V').toUpperCase()) + '</span><span class="nm">' + esc(r.nome) + (r.ex ? ' <small class="muted">exemplo</small>' : '') + '</span><b class="tnum">' + r.caps + '</b></li>'; });
  h += '</ol></section>';
  h += '<section class="sec"><h2>Check-in de hoje</h2><form class="form card" data-f="checkin"><div class="two"><label>Capítulos lidos fora do app<input id="ck-caps" type="number" min="0" max="50" value="1" inputmode="numeric"></label><label>Versículo<input id="ck-ref" maxlength="40" placeholder="Ex.: Salmos 23:1"></label></div><label>Reflexão curta<textarea id="ck-txt" rows="2" maxlength="280" placeholder="O que Deus falou com você hoje? (opcional)"></textarea></label><button class="btn" type="submit">Marcar leitura · +10 XP por capítulo</button></form></section>';
  h += '<section class="sec"><h2>Feed do grupo</h2><ul class="feed">';
  g.feed.forEach(p => {
    h += '<li><div class="who"><span class="av sm' + (p.me ? ' me' : '') + '">' + esc((p.who.replace('Pr. ', '')[0] || 'V').toUpperCase()) + '</span><b>' + esc(p.who) + '</b><span class="muted"> · ' + fmt(p.d, { day: 'numeric', month: 'short' }) + '</span></div>' + (p.ref ? '<p class="ref">' + esc(p.ref) + '</p>' : '') + '<p>' + esc(p.text) + '</p>' +
      '<div class="acts"><button class="pill' + (p.amei ? ' on' : '') + '" data-a="amem" data-id="' + p.id + '" aria-pressed="' + !!p.amei + '">Amém <span class="tnum">' + p.amem + '</span></button><button class="link" data-a="cmt" data-id="' + p.id + '">Comentar</button></div>';
    if (p.comments.length) h += '<ul class="cmts">' + p.comments.map(c => '<li><b>' + esc(c.who) + '</b> ' + esc(c.text) + '</li>').join('') + '</ul>';
    if (ui.cmt === p.id) h += '<form class="form inline" data-f="cmt" data-id="' + p.id + '"><input id="cmt-txt" maxlength="200" placeholder="Escreva um comentário" aria-label="Comentário"><button class="btn mini" type="submit">Enviar</button></form>';
    h += '</li>';
  });
  h += '</ul></section><section class="card"><h3>Convide pelo WhatsApp</h3><p class="muted">Código do grupo: <b class="code">' + g.code + '</b></p><div class="row"><a class="btn sec" href="https://wa.me/?text=' + encodeURIComponent(convite) + '" target="_blank" rel="noopener">Abrir WhatsApp</a><button class="btn sec" data-a="copy" data-t="' + esc(convite) + '">Copiar convite</button></div></section>';
  return h + '<button class="link danger" data-a="leaveGroup">Sair do grupo</button>';
}

/* ---------- Perfil ---------- */
function vPerfil() {
  const st = S.streak, lg = LIGAS[S.league.div];
  const resumo = 'Minha semana no Manna: ofensiva de ' + plural(st.count, 'dia', 'dias') + ', ' + plural(weekChaps(), 'capítulo lido', 'capítulos lidos') + ' e ' + weekXPFrom(weekStart()) + ' XP. Sua porção diária da Palavra.';
  let h = '<main class="screen sheet-top">' + capa('Perfil', '') + '<section class="prof"><span class="av xl me">' + esc(((S.nome || 'V')[0]).toUpperCase()) + '</span><div><h1 class="h1">' + esc(S.nome || 'Você') + '</h1><p class="muted">' + esc(S.quiz.denom || '') + (S.trialStart ? ' · desde ' + fmt(S.trialStart, { month: 'short', year: 'numeric' }) : '') + '</p></div></section>';
  h += '<section class="stats2"><div><b class="tnum">' + st.count + '</b><span>dias de ofensiva</span></div><div><b class="tnum">' + S.xp + '</b><span>XP no total</span></div><div><b>' + lg.nome + '</b><span>liga atual</span></div><div><b class="tnum">' + S.chapters + '</b><span>capítulos lidos</span></div></section>';
  h += '<section class="sec"><h2>Você estudou ' + weekDays() + ' de 7 dias nesta semana</h2><div class="card">' + weekRow() + '<p class="fine">Recorde: ' + plural(st.best, 'dia', 'dias') + '. Protetores guardados: ' + S.protetores + ' de 2.</p></div></section>';
  h += '<section class="sec"><h2>' + plural(ACH.filter(a => achLevel(a) > 0).length, 'conquista', 'conquistas') + ' de ' + ACH.length + '</h2><ul class="medals">';
  ACH.forEach(a => {
    const l = achLevel(a), v = a.v(S), next = a.n[l], prev = l ? a.n[l - 1] : 0;
    h += '<li>' + '<div class="md">' + ART.medalha(l, 'var(--ouro)', ART.simb[a.id]) + (l ? '<span class="md-l tnum">' + l + '</span>' : '') + '</div><div class="md-t"><b>' + a.nome + '</b><small class="muted">' + (next ? Math.min(v, next) + ' de ' + next + ' ' + a.desc : 'Nível máximo') + '</small><span class="bar"><i style="width:' + (next ? Math.min(100, (v - prev) / (next - prev) * 100) : 100) + '%"></i></span></div></li>';
  });
  h += '</ul></section>';
  h += '<section class="share"><div class="share-top">' + ART.logo('logo sm') + '<span class="brand sm">manna</span></div><h2>Minha semana</h2><div class="share-n"><div><b class="tnum">' + st.count + '</b><span>dias de ofensiva</span></div><div><b class="tnum">' + weekChaps() + '</b><span>capítulos</span></div><div><b class="tnum">' + weekXPFrom(weekStart()) + '</b><span>XP</span></div></div><p>Sua porção diária da Palavra</p></section>';
  h += '<button class="btn sec" data-a="copy" data-t="' + esc(resumo) + '">Copiar resumo para o Status</button>';
  h += '<section class="sec"><h2>Ajustes</h2><form class="form card" data-f="ajustes"><label>Seu nome<input id="p-nome" maxlength="30" value="' + esc(S.nome) + '"></label><div class="two"><label>Meta diária<select id="p-goal">' + [[20, '20 XP · leve'], [30, '30 XP · firme'], [50, '50 XP · intenso']].map(([g, n]) => '<option value="' + g + '"' + (S.goal === g ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><label>Lembrete<select id="p-hor">' + ['6h', '7h', '12h', '19h', '21h'].map(x => '<option' + (S.quiz.horario === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label></div><label class="check"><input type="checkbox" id="p-som"' + (S.sound ? ' checked' : '') + '> Sons nas lições</label><p class="fine">Na versão de teste não enviamos notificações.</p><button class="btn sec" type="submit">Salvar ajustes</button></form></section>';
  h += '<section class="card"><h3>Assinatura</h3><p>' + ({ anual: 'Anual', mensal: 'Mensal', familia: 'Família ou célula' }[S.plano] || 'Anual') + ', em teste grátis até ' + fmt(addDays(S.trialStart || todayK(), 7)) + '. Nada é cobrado nesta versão.</p></section>';
  h += '<section class="card test"><h3>Ferramentas de teste</h3><p class="muted">Data simulada: ' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><div class="row"><button class="btn sec" data-a="nextDay">Avançar um dia</button><button class="btn sec" data-a="giveGrains">+100 grãos</button><button class="btn sec" data-a="redoQuiz">Refazer o quiz</button></div>' +
    (ui.confirmReset ? '<div class="row"><button class="btn badbtn" data-a="reset">Apagar tudo</button><button class="btn ghost" data-a="cancelReset">Cancelar</button></div>' : '<button class="link danger" data-a="askReset">Apagar meus dados deste aparelho</button>') + '</section>';
  h += '<section class="card"><h3>Sobre esta versão</h3><p class="muted">Versão de teste: nada é cobrado, e a liga e o grupo usam participantes de exemplo. Bíblia Livre (BLIVRE), © Diego Santos, Mario Sérgio e Marco Teles, licença Creative Commons Atribuição 3.0 Brasil.</p></section>';
  return h + '</main>';
}

/* ---------- Telas sobrepostas ---------- */
function ovHead(title) { return '<header class="ovh"><button class="iconbtn" data-a="close" aria-label="Voltar">' + icon('voltar') + '</button><span>' + title + '</span></header>'; }

function vLoja() {
  const itens = [
    { id: 'protetor', nome: 'Protetor de ofensiva', desc: 'Salva sua ofensiva se você perder um dia. Guarde até 2.', preco: 50, ok: S.protetores < 2, motivo: 'Você já tem 2 protetores.', art: '<span class="shop-ic">' + icon('escudo', 'ic lg') + '</span>' },
    { id: 'dobro', nome: 'XP em dobro · 15 minutos', desc: 'Todo XP que você ganhar nos próximos 15 minutos vale o dobro.', preco: 60, ok: !boostOn(), motivo: 'Já está ativo.', art: '<span class="shop-ic">' + icon('raio', 'ic lg') + '</span>' },
    { id: 'recuperar', nome: 'Recuperar ofensiva', desc: S.lost ? 'Traz de volta sua ofensiva de ' + plural(S.lost.count, 'dia', 'dias') + '.' : 'Disponível no dia em que uma ofensiva acabar.', preco: 150, ok: !!(S.lost && diff(S.lost.d, todayK()) <= 1 && S.streak.count <= 1), motivo: 'Nenhuma ofensiva para recuperar.', art: '<span class="shop-ic">' + ART.grao('grao lg') + '</span>' },
  ];
  let h = ovHead('Loja') + '<main class="screen"><section class="shop-h"><div><p class="muted">Seus grãos de maná</p><b class="big-n tnum">' + S.grains + '</b><p class="fine">Ganhe grãos em lições, missões e vasos da jornada.</p></div></section><ul class="shop">';
  itens.forEach(it => {
    const pode = it.ok && S.grains >= it.preco;
    h += '<li>' + it.art + '<div><b>' + it.nome + '</b><p class="muted">' + it.desc + '</p>' + (!it.ok ? '<p class="fine">' + it.motivo + '</p>' : '') + '</div><button class="btn mini' + (pode ? '' : ' off') + '" data-a="buy" data-id="' + it.id + '"' + (pode ? '' : ' disabled') + '>' + ART.vaso('vaso xs') + ' ' + it.preco + '</button></li>';
  });
  return h + '</ul></main>';
}

function vSheet() {
  const s = ui.sheet;
  let h = '<div class="scrim" data-a="closeSheet"></div><div class="sheet-panel" role="dialog" aria-modal="true">';
  if (s === 'trilhas') {
    h += '<h2>Suas metas</h2><p class="muted">Toque para ir para a jornada da meta. Até 5 metas.</p><ul class="mt">';
    S.quiz.trilhas.forEach(id => { const t = trilha(id), d = doneCount(id); h += '<li><button class="mt-b' + (id === curTrail() ? ' on' : '') + '" data-a="goTrail" data-id="' + id + '"><span><b>' + t.nome + '</b><small class="muted">' + t.tipo + ' · ' + d + ' de ' + t.licoes.length + '</small></span><span class="bar"><i style="width:' + d / t.licoes.length * 100 + '%"></i></span></button></li>'; });
    h += '</ul><h3 class="grp">Adicionar meta</h3><div class="addm">';
    TRILHAS.filter(t => !S.quiz.trilhas.includes(t.id)).forEach(t => { h += '<button class="pill" data-a="addMeta" data-id="' + t.id + '">+ ' + t.nome + '</button>'; });
    h += '</div>';
  } else if (s === 'ofensiva') {
    h += '<div class="center-col">' + '<div class="big-streak sm">' + ART.grao('grao huge') + '<b class="tnum">' + S.streak.count + '</b></div><h2>' + plural(S.streak.count, 'dia', 'dias') + ' de ofensiva</h2><p class="muted">' + (studiedToday() ? 'Você já colheu a porção de hoje.' : 'Faça uma lição hoje para manter a ofensiva.') + '</p>' + weekRow() + '<p class="fine">Recorde: ' + plural(S.streak.best, 'dia', 'dias') + ' · protetores: ' + S.protetores + '</p></div>';
  }
  return h + '<button class="btn sec" data-a="closeSheet">Fechar</button></div>';
}

function vCulto(id) {
  const c = S.cultos.find(x => x.id === id); if (!c) return '';
  const s = c.study, nomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  let h = ovHead('Culto de ' + fmt(c.data, { day: 'numeric', month: 'short' })) + '<main class="screen"><h1 class="h1">' + esc(c.tema) + '</h1><p class="muted">' + [c.pregador, c.igreja].filter(Boolean).map(esc).join(' · ') + '</p>';
  if (c.link) h += '<p><a class="link" href="' + esc(c.link) + '" target="_blank" rel="noopener">Abrir a live</a></p>';
  if (!s.ia) h += '<p class="note">Montado sem IA, com um roteiro padrão.</p>';
  h += '<article class="card"><h3>Resumo</h3><p>' + esc(s.resumo) + '</p>' + (s.pontos.length ? '<ul class="dots">' + s.pontos.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' : '') + (s.versiculos.length ? '<p class="ref">' + s.versiculos.map(esc).join('; ') + '</p>' : '') + '</article>';
  if (s.meta && trilha(s.meta)) h += '<p class="insight">Este tema combina com a meta ' + trilha(s.meta).nome + '. ' + (S.quiz.trilhas.includes(s.meta) ? '' : '<button class="link" data-a="addMeta" data-id="' + s.meta + '">Adicionar às metas</button>') + '</p>';
  const tr = c.trilha && trilha(c.trilha);
  if (tr) h += '<section class="banner"><div><h3>' + esc(tr.nome) + '</h3><small>Trilha da pregação · ' + plural(tr.licoes.length, 'lição', 'lições') + '</small></div>' + ART.banner() + '</section><div class="row">' + (S.quiz.trilhas.includes(tr.id) ? '' : '<button class="btn sec" data-a="toggleMeta" data-id="' + tr.id + '">Adicionar ao plano</button>') + '<button class="btn" data-a="goTrail" data-id="' + tr.id + '">Estudar agora</button></div>';
  h += '<section class="sec"><h2>Estudo da semana</h2><ol class="days">';
  s.dias.forEach((d, i) => {
    const f = c.feitos.includes(i);
    h += '<li class="' + (f ? 'feita' : '') + '"><span class="day-n">' + (f ? icon('check', 'ic sm') : i + 1) + '</span><div><h3>' + esc(d.titulo) + '</h3><p class="muted">' + nomes[i] + '</p><p class="ref">' + esc(d.referencia) + '</p><p>' + esc(d.pergunta) + '</p>' + (f ? '' : '<button class="btn mini" data-a="cultoDia" data-id="' + c.id + '" data-i="' + i + '">Feito · +10 XP</button>') + '</div></li>';
  });
  h += '</ol></section>';
  if (S.group) h += '<button class="btn sec" data-a="shareCulto" data-id="' + c.id + '">Compartilhar com ' + esc(S.group.nome) + '</button>';
  return h + '<button class="link danger" data-a="delCulto" data-id="' + c.id + '">Apagar este culto</button></main>';
}
function vEbd(id) {
  const e = S.ebds.find(x => x.id === id); if (!e) return '';
  const p = e.prep;
  let h = ovHead('EBD · ' + e.modo) + '<main class="screen"><h1 class="h1">' + esc(e.tema) + '</h1>' + (e.textos ? '<p class="ref">' + esc(e.textos) + '</p>' : '');
  if (!p.ia) h += '<p class="note">Montado sem IA, com um roteiro padrão.</p>';
  h += '<article class="card"><h3>Contexto</h3><p>' + esc(p.contexto) + '</p>' + (p.versiculos.length ? '<p class="ref">' + p.versiculos.map(esc).join('; ') + '</p>' : '') + '</article>';
  h += '<section class="card"><h3>Perguntas para discussão</h3><ol class="dots">' + p.perguntas.map(q => '<li>' + esc(q) + '</li>').join('') + '</ol></section><section class="card"><h3>Aplicação</h3><p>' + esc(p.aplicacao) + '</p></section>';
  if (p.roteiro && p.roteiro.length) h += '<section class="card"><h3>Roteiro da aula</h3><ol class="roteiro">' + p.roteiro.map(r => '<li><b>' + esc(r.etapa) + '</b> <span class="muted tnum">' + esc(r.minutos) + ' min</span><p>' + esc(r.descricao) + '</p></li>').join('') + '</ol></section>';
  return h + '<button class="link danger" data-a="delEbd" data-id="' + e.id + '">Apagar esta lição</button></main>';
}
function vDuvida(id) {
  const d = DUVIDAS.find(x => x.id === id) || S.perguntas.find(x => x.id === id); if (!d) return '';
  const minha = tradicao();
  let h = ovHead(d.cat) + '<main class="screen"><h1 class="h1">' + esc(d.q) + '</h1>';
  h += '<article class="card"><h3>O que a Bíblia diz</h3><p>' + esc(d.biblia) + '</p><p class="ref">' + esc(d.refs) + '</p></article><section class="sec"><h2>Como as tradições interpretam</h2>';
  const order = minha ? [minha].concat(Object.keys(TRADICOES).filter(k => k !== minha)) : Object.keys(TRADICOES);
  order.forEach(k => { if (d.trad[k]) h += '<div class="trad' + (k === minha ? ' mine' : '') + '"><p class="who"><b>' + TRADICOES[k] + '</b>' + (k === minha ? ' <span class="muted">· sua tradição</span>' : '') + '</p><p>' + esc(d.trad[k]) + '</p></div>'; });
  if (!minha) h += '<p class="fine">Sua igreja pode ter uma posição própria sobre isso.</p>';
  h += '</section><section class="card"><h3>Ponto em comum</h3><p>' + esc(d.comum) + '</p></section><section class="pastor"><div><h3>Converse com seu pastor</h3><p>Esta resposta ajuda você a estudar, mas não substitui o cuidado de quem conhece você e a sua igreja.</p></div></section>';
  if (d.ia) h += '<p class="fine">Resposta gerada por IA. Confira os versículos.</p>';
  return h + '</main>';
}
function vModal() {
  const m = ui.modal;
  return '<div class="scrim"></div><div class="modal" role="dialog" aria-modal="true">' + (m.art || '') + '<h2>' + m.t + '</h2><p class="body-l">' + m.p + '</p><button class="btn" data-a="closeModal">' + (m.btn || 'Continuar') + '</button></div>';
}

/* ---------- Render ---------- */
const TABS = () => [['jornada', 'Jornada', 'jornada'], ['biblia', 'Bíblia', 'livro'], ['domingo', nomeCulto(), 'domingo'], ['duvidas', 'Dúvidas', 'duvidas'], ['liga', 'Liga', 'liga'], ['perfil', 'Perfil', 'perfil']];
function renderLesson() { const app = $('app'); if (app && ui.L) app.innerHTML = vLessonScreen(); }
function render() {
  const app = $('app'); if (!app) return;
  const y = window.scrollY;
  document.body.classList.toggle('in-lesson', !!ui.L);
  if (!S.onboarded) { app.innerHTML = vOnboarding(); }
  else if (ui.L) { app.innerHTML = vLessonScreen(); }
  else {
    let h;
    if (ui.ov) h = '<div class="ov">' + ({ culto: vCulto, ebd: vEbd, duvida: vDuvida, loja: vLoja, plano: vPlano, explorar: vExplorar }[ui.ov.type])(ui.ov.id) + '</div>';
    else h = ({ jornada: vJornada, biblia: vBiblia, domingo: vDomingo, duvidas: vDuvidas, liga: vLiga, perfil: vPerfil }[ui.tab])() +
      '<nav class="tabs" aria-label="Seções">' + TABS().map(([k, n, ic]) => '<button data-a="tab" data-tab="' + k + '"' + (ui.tab === k ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + n + '</span></button>').join('') + '</nav>';
    if (ui.sheet) h += vSheet();
    if (ui.modal) h += vModal();
    app.innerHTML = h;
  }
  if (render.keep) window.scrollTo(0, y);
  render.keep = false;
}
function renderToast() {
  let t = $('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = ui.toast; t.hidden = !ui.toast;
}
function go(fn) { fn(); save(); render(); }
function keep() { render.keep = true; render(); }
function openOv(type, id) { ui.ov = { type, id }; ui.aiErr = ''; ui.busy = false; window.scrollTo(0, 0); render(); }

/* ---------- Ações ---------- */
const A = {
  next() {
    if (ui.L) return lessonNext();
    if (S.step === QUIZ.length + 1 && !S.plano) S.plano = 'anual';
    go(() => { S.step++; }); window.scrollTo(0, 0);
  },
  back() { go(() => { S.step = Math.max(0, S.step - 1); }); },
  answer(el) {
    const k = el.dataset.k; let v = el.dataset.v;
    if (k === 'minutos') { v = Number(v); S.goal = goalFor(v); }
    S.quiz[k] = v;
    if (k === 'denom') { const d = DENOMINACOES.find(x => x[0] === v); S.quiz.tradicao = d ? d[1] : null; }
    render(); setTimeout(() => A.next(), 220);
  },
  pickTrail(el) {
    const id = el.dataset.id, a = S.quiz.trilhas, i = a.indexOf(id);
    if (i > -1) a.splice(i, 1); else if (a.length < MAX_METAS) a.push(id); else toast('Você já tem ' + MAX_METAS + ' metas.');
    save(); keep();
  },
  plan(el) { S.plano = el.dataset.id; save(); keep(); },
  trial() { go(() => { S.trialStart = todayK(); S.step++; }); window.scrollTo(0, 0); },
  finish() { go(() => { S.onboarded = true; ui.tab = 'jornada'; }); window.scrollTo(0, 0); },
  tab(el) { ui.tab = el.dataset.tab; ui.aiErr = ''; ui.pop = null; ui.confirmReset = false; window.scrollTo(0, 0); render(); },
  open(el) { openOv(el.dataset.ov, el.dataset.id); },
  close() { ui.ov = null; if (aiCtl) aiCtl.abort(); ui.busy = false; window.scrollTo(0, 0); render(); },
  dismiss() { ui.notice = ''; keep(); },
  sheet(el) { ui.sheet = el.dataset.s; keep(); },
  closeSheet() { ui.sheet = null; keep(); },
  closeModal() { ui.modal = null; keep(); },
  goTrail(el) { if (!S.quiz.trilhas.includes(el.dataset.id)) S.quiz.trilhas.push(el.dataset.id); S.cur = el.dataset.id; ui.sheet = null; ui.pop = null; ui.ov = null; ui.tab = 'jornada'; save(); window.scrollTo(0, 0); render(); },
  addMeta(el) {
    if (S.quiz.trilhas.length >= MAX_METAS) { toast('Você já tem ' + MAX_METAS + ' metas.'); return; }
    if (!S.quiz.trilhas.includes(el.dataset.id)) S.quiz.trilhas.push(el.dataset.id);
    toast('Meta adicionada: ' + trilha(el.dataset.id).nome); save(); keep();
  },
  lrow(el) {
    const i = Number(el.dataset.i), st = el.dataset.st;
    if (st === 'lock') { toast('Esta lição abre depois da anterior.'); return; }
    startLesson(curTrail(), i, st === 'done'); window.scrollTo(0, 0);
  },
  pop(el) {
    const i = Number(el.dataset.i);
    ui.pop = ui.pop === i ? null : i; keep();
  },
  startLesson(el) { startLesson(curTrail(), Number(el.dataset.i), el.dataset.r === '1'); window.scrollTo(0, 0); },
  chest(el) {
    const id = curTrail(), u = Number(el.dataset.u), ck = id + ':' + u;
    if (S.chests[ck]) { toast('Você já abriu este vaso.'); return; }
    if (doneCount(id) < Math.min(trilha(id).licoes.length, (u + 1) * (trilha(id).unit || UNIT))) { toast('Complete as lições da unidade para abrir o vaso.'); return; }
    const g = 15 + hash(ck) % 16; S.chests[ck] = true; S.grains += g; save();
    ui.modal = { art: ART.deco.vasoGrande, t: 'Vaso de maná aberto', p: 'Você ganhou ' + g + ' grãos de maná. Use na loja para proteger sua ofensiva.' };
    SND.vaso(); keep(); rain(40);
  },
  claim(el) {
    const q = S.quests.list[Number(el.dataset.i)]; if (!q || q.claimed || q.p < q.n) return;
    q.claimed = true; S.grains += 10; SND.vaso(); toast('+10 grãos de maná'); save(); keep();
  },
  buy(el) {
    const id = el.dataset.id, preco = { protetor: 50, dobro: 60, recuperar: 150 }[id];
    if (S.grains < preco) return;
    S.grains -= preco;
    if (id === 'protetor') { S.protetores = Math.min(2, S.protetores + 1); toast('Protetor guardado.'); }
    if (id === 'dobro') { S.boostUntil = Date.now() + 15 * 60000; toast('XP em dobro por 15 minutos.'); }
    if (id === 'recuperar' && S.lost) { const c = S.lost.count + (S.streak.count ? 1 : 0); S.streak.count = c; S.streak.last = S.streak.count > S.lost.count ? todayK() : addDays(todayK(), -1); S.streak.best = Math.max(S.streak.best, c); S.lost = null; ui.notice = ''; toast('Ofensiva de ' + plural(c, 'dia', 'dias') + ' recuperada.'); }
    SND.vaso(); save(); keep();
  },
  toggleMeta(el) {
    const id = el.dataset.id, a = S.quiz.trilhas, i = a.indexOf(id);
    if (i > -1) { if (a.length === 1) { toast('Mantenha pelo menos uma meta no plano.'); return; } a.splice(i, 1); toast('Removida do plano: ' + trilha(id).nome); }
    else if (a.length >= MAX_METAS) { toast('Você já tem ' + MAX_METAS + ' metas.'); return; }
    else { a.push(id); toast('Adicionada ao plano: ' + trilha(id).nome); }
    save(); keep();
  },
  moveMeta(el) {
    const a = S.quiz.trilhas, i = a.indexOf(el.dataset.id), j = i + Number(el.dataset.d);
    if (i < 0 || j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; save(); keep();
  },
  objToggle(el) { S.objSel = S.objSel || []; const i = S.objSel.indexOf(el.dataset.id); if (i > -1) S.objSel.splice(i, 1); else S.objSel.push(el.dataset.id); ui.sug = null; save(); keep(); },
  objChip(el) { S.objetivo = (S.objetivo.trim() ? S.objetivo.trim().replace(/[.]$/, '') + '. ' : '') + el.dataset.t + '.'; save(); keep(); },
  objNext() { if ($('obj')) S.objetivo = val('obj'); ui.sug = null; ui.sugInit = false; S.quiz.trilhas = []; save(); A.next(); },
  sugIA() { sugerirIA(); },
  async genTema(el) {
    const tema = el.dataset.t; if (!SAMPLE) return;
    el.disabled = true; el.textContent = 'Criando a trilha…';
    try { const t = await genTrail(tema); saveTrail(t, true); toast('Trilha criada: ' + t.nome); ui.sug.ids.unshift(t.id); }
    catch (e) { toast(e.code === 'vazio' ? 'Não consegui montar essa trilha. Tente outro tema.' : aiMsg(e)); }
    keep();
  },
  expl(el) { ui.expl = el.dataset.t; ui.ov.id = el.dataset.t; keep(); },
  bibMode(el) { ui.bibMode = el.dataset.m; keep(); },
  bibRetry() { ui.bibErr = false; keep(); },
  bibBook(el) { ui.bib = { b: Number(el.dataset.b) }; ui.sel = []; window.scrollTo(0, 0); render(); },
  bibBack() { ui.bib = null; window.scrollTo(0, 0); render(); },
  bibGo(el) { ui.bib = { b: Number(el.dataset.b), c: Number(el.dataset.c) }; ui.sel = []; S.lastRead = ui.bib.b + ':' + ui.bib.c; save(); window.scrollTo(0, 0); render(); },
  bibChap(el) { const B = ui.bib, c = B.c + Number(el.dataset.d); if (c < 1 || c > LIVROS[B.b][1]) return; A.bibGo({ dataset: { b: B.b, c } }); },
  bibRead() {
    const B = ui.bib, k = B.b + ':' + B.c; if (S.lidos[k]) return;
    S.lidos[k] = todayK(); study(1); addXP(5); save();
    toast('Capítulo lido. Ofensiva: ' + plural(S.streak.count, 'dia', 'dias') + '.'); keep();
  },
  verse(el) { const k = el.dataset.k; ui.sel = ui.sel || []; const i = ui.sel.indexOf(k); if (i > -1) ui.sel.splice(i, 1); else ui.sel.push(k); keep(); },
  clearSel() { ui.sel = []; keep(); },
  shareVerses() { const t = selText(); const m = t.match(/\(([^,]+),/); postFeed(t.replace(/\s*\([^)]*\)$/, ''), m ? m[1] : ''); ui.sel = []; save(); toast('Postado no grupo.'); keep(); },
  fonte(el) { S.fonte = Math.max(14, Math.min(26, S.fonte + 2 * Number(el.dataset.d))); save(); keep(); },
  hinoFav(el) { const x = S.hinos.find(y => y.id === el.dataset.id); if (x) x.fav = !x.fav; save(); keep(); },
  hinoDel(el) { S.hinos = S.hinos.filter(y => y.id !== el.dataset.id); save(); keep(); },
  dict() {
    if (!DICT) return;
    if (ui.dictOn) { DICT.stop().catch(() => {}); return; }
    DICT.start().catch(e => { toast(e && e.code === 'not_granted' ? 'O ditado não foi permitido. Dá para digitar normalmente.' : 'Não deu para começar o ditado.'); });
  },
  /* Lição */
  pick(el) { const L = ui.L; if (L.checked) return; L.pick = el.dataset.v; renderLesson(); },
  tile(el) { const L = ui.L; if (L.checked) return; L.built.push(Number(el.dataset.id)); renderLesson(); },
  untile(el) { const L = ui.L; if (L.checked) return; L.built = L.built.filter(x => x !== Number(el.dataset.id)); renderLesson(); },
  checkAns() {
    const L = ui.L, s = L.steps[L.i];
    const ok = s.k === 'tiles' ? L.built.map(id => s.bank.find(x => x.id === id).w).join(' ') === s.target.join(' ') : L.pick === s.ans;
    L.checked = ok ? 'ok' : 'bad';
    if (ok) { L.right++; L.combo++; L.best = Math.max(L.best, L.combo); bump('combo', L.combo); SND.certo(); }
    else { L.wrong++; L.combo = 0; SND.errado(); if (!s.retry) L.steps.splice(L.steps.length - 1, 0, Object.assign({}, s, { retry: true, opts: s.opts ? shuffle(s.opts) : s.opts, bank: s.bank ? shuffle(s.bank) : s.bank })); }
    renderLesson();
  },
  explain() {
    const L = ui.L, l = trilha(L.id).licoes[L.idx];
    ui.busy = true; ui.aiErr = ''; ui.aiText = ''; renderLesson();
    aiCtl = new AbortController();
    SAMPLE(REGRAS + '\n\nExplique ' + l.ref + ' para um crente que vai ler o texto hoje. Tema da lição: ' + l.titulo + '. Em 2 parágrafos curtos: o contexto (quem, para quem, quando) e a ideia central. Depois, uma frase de aplicação. Texto corrido, sem títulos, sem listas, sem markdown.', {
      signal: aiCtl.signal, modelTier: 'quick', onText: ({ text }) => { ui.aiText = text; if (ui.L) renderLesson(); },
    }).catch(e => { ui.aiText = e.text || ui.aiText; if (e.code !== 'cancelled') ui.aiErr = aiMsg(e); })
      .finally(() => { ui.busy = false; if (ui.L) renderLesson(); });
  },
  stopAi() { if (aiCtl) aiCtl.abort(); },
  finishLesson() { finishLesson(); },
  afterFim() { const L = ui.L; if (L.result.up && !L.review) { L.phase = 'ofensiva'; renderLesson(); countUp(); if (S.streak.count > 1) rain(50); } else A.closeLesson(); },
  closeLesson() { ui.L = null; ui.aiText = ''; ui.busy = false; window.scrollTo(0, 0); render(); },
  lessonExit() { const L = ui.L; if (L.i === 0 && !L.lido) return A.closeLesson(); L.prev = L.phase; L.phase = 'sair'; renderLesson(); },
  lessonStay() { ui.L.phase = 'steps'; renderLesson(); },
  lessonQuit() { if (aiCtl) aiCtl.abort(); A.closeLesson(); },
  /* Domingo */
  dom(el) { ui.domMode = el.dataset.m; ui.aiErr = ''; keep(); },
  ebdModo(el) { ui.ebdModo = el.dataset.m; keep(); },
  cultoDia(el) {
    const c = S.cultos.find(x => x.id === el.dataset.id), i = Number(el.dataset.i);
    if (c.feitos.includes(i)) return;
    c.feitos.push(i); study(1); addXP(10);
    toast(c.feitos.length === 5 ? 'Estudo da semana concluído.' : 'Dia feito. Ofensiva: ' + plural(S.streak.count, 'dia', 'dias') + '.');
    save(); keep();
  },
  shareCulto(el) {
    const c = S.cultos.find(x => x.id === el.dataset.id);
    postFeed('Compartilhei o estudo do culto "' + c.tema + '". ' + (c.study.resumo || '').slice(0, 180), (c.study.versiculos || []).slice(0, 2).join('; '));
    toast('Estudo compartilhado no grupo.'); save(); keep();
  },
  delCulto(el) { S.cultos = S.cultos.filter(x => x.id !== el.dataset.id); save(); A.close(); },
  delEbd(el) { S.ebds = S.ebds.filter(x => x.id !== el.dataset.id); save(); A.close(); },
  /* Liga e grupo */
  ligaMode(el) { ui.ligaMode = el.dataset.m; keep(); },
  gmode(el) { ui.groupMode = el.dataset.m; keep(); },
  amem(el) { const p = S.group.feed.find(x => x.id === el.dataset.id); p.amei = !p.amei; p.amem += p.amei ? 1 : -1; save(); keep(); },
  cmt(el) { ui.cmt = ui.cmt === el.dataset.id ? null : el.dataset.id; keep(); setTimeout(() => $('cmt-txt') && $('cmt-txt').focus(), 0); },
  leaveGroup() { if (ui.confirmLeave) { ui.confirmLeave = false; S.group = null; save(); keep(); toast('Você saiu do grupo.'); } else { ui.confirmLeave = true; toast('Toque de novo em "Sair do grupo" para confirmar.'); setTimeout(() => { ui.confirmLeave = false; }, 4000); } },
  copy(el) {
    const t = el.dataset.t;
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copiado.'); } catch (e) { toast('Selecione e copie o texto.'); } ta.remove(); };
    try { navigator.clipboard.writeText(t).then(() => toast('Copiado.'), fallback); } catch (e) { fallback(); }
  },
  /* Perfil e teste */
  nextDay() { S.offset++; ui.notice = ''; checkStreak(); checkLeague(); ensureQuests(); save(); toast('Agora é ' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '.'); keep(); },
  giveGrains() { S.grains += 100; save(); toast('+100 grãos para testar a loja.'); keep(); },
  redoQuiz() { go(() => { S.onboarded = false; S.step = 1; }); window.scrollTo(0, 0); },
  askReset() { ui.confirmReset = true; keep(); },
  cancelReset() { ui.confirmReset = false; keep(); },
  reset() { try { localStorage.removeItem(KEY); } catch (e) {} S = fresh(); Object.assign(ui, { tab: 'jornada', ov: null, L: null, confirmReset: false, notice: '', sheet: null, modal: null }); save(); window.scrollTo(0, 0); render(); },
};

function lessonNext() {
  const L = ui.L, s = L.steps[L.i];
  if (s.k === 'leia') { if (!L.lido) return; }
  L.i++; L.pick = null; L.built = []; L.checked = null;
  renderLesson(); window.scrollTo(0, 0);
}

const F = {
  objetivo() { S.objetivo = val('obj'); ui.sug = null; save(); keep(); },
  async criarTrilha() {
    const tema = val('cr-tema'); if (tema.length < 3) { toast('Escreva o assunto da trilha.'); return; }
    ui.busy = true; ui.aiErr = ''; keep();
    try { const t = await genTrail(tema); saveTrail(t, true); ui.busy = false; toast('Trilha criada e adicionada ao plano.'); A.goTrail({ dataset: { id: t.id } }); }
    catch (e) { ui.busy = false; ui.aiErr = e.code === 'vazio' ? 'Não consegui montar essa trilha. Tente descrever de outro jeito.' : aiMsg(e); keep(); }
  },
  hino() {
    const n = parseInt(val('h-n'), 10); if (!n) { toast('Digite o número do hino.'); return; }
    S.hinario = val('h-sel') || S.hinario || hinarioPadrao();
    S.hinos.push({ id: uid(), h: S.hinario, n, t: val('h-t'), fav: false }); save(); toast('Hino guardado.'); keep();
  },
  async culto() {
    const trans = val('c-trans'), criar = $('c-trilha') ? $('c-trilha').checked : true;
    const c = { id: uid(), tema: val('c-tema'), versiculos: val('c-vers'), pregador: val('c-preg'), data: val('c-data') || lastCultDay(), igreja: val('c-igreja'), link: val('c-link'), notas: [val('c-notas'), trans ? 'Transcrição: ' + trans.slice(0, 10000) : ''].filter(Boolean).join('\n\n'), feitos: [] };
    if (!c.tema) { toast('Digite o tema da pregação.'); return; }
    if (c.link && !/^https?:\/\//i.test(c.link)) c.link = '';
    S.lastIgreja = c.igreja; ui.busy = true; ui.aiErr = ''; keep();
    try { c.study = await genStudy(c); }
    catch (e) { ui.busy = false; if (e.code === 'cancelled') { keep(); return; } ui.aiErr = aiMsg(e) + ' Montei com o roteiro padrão.'; c.study = localStudy(c); }
    if (criar) {
      let t = null;
      try { t = SAMPLE ? await genTrail(c.tema, [c.versiculos, c.notas].filter(Boolean).join('\n')) : null; } catch (e) { t = null; }
      if (!t) t = localTrail(c.tema, [c.versiculos, c.notas, (c.study.versiculos || []).join('; ')].join(' '));
      if (t) { t.nome = t.nome || c.tema; saveTrail(t, false); c.trilha = t.id; }
    }
    ui.busy = false; ui.draft = {}; S.cultos.unshift(c); addXP(20); save(); openOv('culto', c.id);
  },
  async ebd() {
    const e = { id: uid(), tema: val('e-tema'), textos: val('e-textos'), modo: ui.ebdModo === 'professor' ? 'professor' : 'aluno', data: todayK() };
    if (!e.tema) { toast('Digite o tema da lição.'); return; }
    ui.busy = true; ui.aiErr = ''; keep();
    try { e.prep = await genEbd(e); }
    catch (err) { ui.busy = false; if (err.code === 'cancelled') { keep(); return; } ui.aiErr = aiMsg(err) + ' Montei com o roteiro padrão.'; e.prep = localEbd(e); }
    ui.busy = false; S.ebds.unshift(e); addXP(15); save(); openOv('ebd', e.id);
  },
  async duvida() {
    const q = val('d-q'); if (q.length < 6) { toast('Escreva a sua pergunta.'); return; }
    ui.busy = true; ui.aiErr = ''; keep();
    try { const d = await genDuvida(q); S.perguntas.unshift(d); addXP(5); bump('duvida', 1); checkAch(); save(); ui.busy = false; openOv('duvida', d.id); }
    catch (e) { ui.busy = false; if (e.code !== 'cancelled') ui.aiErr = aiMsg(e); keep(); }
  },
  gcriar() {
    const nome = val('g-nome'); if (!nome) { toast('Dê um nome ao grupo.'); return; }
    S.nome = val('g-eu') || S.nome; makeGroup(nome, val('g-des') || 'evangelhos30');
    S.onboarded = true; ui.tab = 'liga'; ui.ligaMode = 'grupo'; ui.groupMode = null; save(); window.scrollTo(0, 0); render(); toast('Grupo criado. Agora convide pelo WhatsApp.');
  },
  gentrar() {
    const code = val('g-code').toUpperCase(); if (code.length < 4) { toast('Digite o código do convite.'); return; }
    S.nome = val('g-eu') || S.nome; makeGroup('Célula Esperança', 'evangelhos30'); S.group.code = code;
    S.onboarded = true; ui.tab = 'liga'; ui.ligaMode = 'grupo'; ui.groupMode = null; save(); window.scrollTo(0, 0); render(); toast('Você entrou num grupo de exemplo.');
  },
  checkin() {
    const caps = Math.max(0, Math.min(50, parseInt(val('ck-caps'), 10) || 0)), ref = val('ck-ref'), txt = val('ck-txt');
    if (!caps && !txt) { toast('Informe os capítulos ou escreva uma reflexão.'); return; }
    if (caps) { study(caps); addXP(10 * caps); }
    postFeed(txt || ('Li ' + plural(caps, 'capítulo', 'capítulos') + ' hoje.'), ref);
    toast(caps ? 'Leitura marcada. Ofensiva: ' + plural(S.streak.count, 'dia', 'dias') + '.' : 'Reflexão postada.'); save(); keep();
  },
  cmt(form) {
    const t = val('cmt-txt'); if (!t) return;
    S.group.feed.find(x => x.id === form.dataset.id).comments.push({ who: S.nome || 'Você', text: t }); ui.cmt = null; save(); keep();
  },
  ajustes() {
    S.nome = val('p-nome'); S.goal = Number(val('p-goal')) || 30; S.quiz.horario = val('p-hor'); S.sound = !!($('p-som') && $('p-som').checked);
    save(); toast('Ajustes salvos.'); keep();
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (!fn || el.tagName === 'A') return;
  e.preventDefault(); fn(el);
});
document.addEventListener('keydown', e => {
  if (ui.L && !e.target.matches('textarea,input')) {
    const L = ui.L, s = L.steps[L.i];
    if (s && s.k === 'mc' && !L.checked && /^[1-4]$/.test(e.key) && s.opts[Number(e.key) - 1]) { L.pick = s.opts[Number(e.key) - 1]; renderLesson(); }
    if (e.key === 'Enter') { const b = document.querySelector('.lfoot .btn:not([disabled])'); if (b) { e.preventDefault(); b.click(); } }
  }
});
document.addEventListener('submit', e => { e.preventDefault(); const f = e.target.dataset.f; if (F[f]) F[f](e.target); });
document.addEventListener('input', e => {
  if (e.target.id === 'd-filtro') {
    ui.filtro = e.target.value; const pos = e.target.selectionStart; keep();
    const n = $('d-filtro'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }
  }
  if (e.target.id === 'l-nota' && ui.L) { S.notes[ui.L.id + ui.L.idx] = e.target.value; save(); }
  if (/^(c|e)-/.test(e.target.id) && e.target.type !== 'file') { ui.draft = ui.draft || {}; ui.draft[e.target.id] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; }
  if (e.target.id === 'obj' && !S.onboarded) { S.objetivo = e.target.value; save(); const b = document.querySelector('[data-a="objNext"]'); if (b) b.disabled = !objPronto(); }
  if (e.target.id === 'expl-f' || e.target.id === 'bib-f') {
    ui[e.target.id === 'expl-f' ? 'explF' : 'bibF'] = e.target.value; const id = e.target.id, pos = e.target.selectionStart; keep();
    const n = $(id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'h-sel') { S.hinario = e.target.value; save(); keep(); }
  if (e.target.id === 'c-trilha') { ui.draft = ui.draft || {}; ui.draft['c-trilha'] = e.target.checked; }
  if (e.target.id === 'c-file' && e.target.files && e.target.files[0]) {
    const f = e.target.files[0];
    if (f.size > 2000000) { toast('Arquivo grande demais. Envie até 2 MB de texto.'); return; }
    const r = new FileReader();
    r.onload = () => {
      const txt = String(r.result || '').replace(/^WEBVTT.*$/m, '').replace(/^\d+\s*$/gm, '').replace(/^[\d:.,]+\s*-->\s*[\d:.,]+.*$/gm, '').replace(/<[^>]+>/g, '').replace(/\n{2,}/g, '\n').trim();
      ui.draft = ui.draft || {}; ui.draft['c-trans'] = txt; toast('Transcrição carregada: ' + txt.split(/\s+/).length + ' palavras.'); keep();
    };
    r.readAsText(f);
  }
  if (e.target.id === 'l-lido' && ui.L) { ui.L.lido = e.target.checked; const b = document.querySelector('.lfoot .btn'); if (b) b.disabled = !ui.L.lido; }
});

/* Abrir uma dúvida conta como estudada */
const _openOv = openOv;
openOv = function (type, id) {
  if (type === 'duvida' && DUVIDAS.some(d => d.id === id) && !S.duvidasLidas.includes(id)) { S.duvidasLidas.push(id); addXP(5); bump('duvida', 1); checkAch(); save(); }
  _openOv(type, id);
};

ensureQuests(); checkStreak(); checkLeague(); save();
render(); renderToast();
