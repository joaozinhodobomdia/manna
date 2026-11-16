/* Manna: geração de estudos (culto, EBD, dúvida livre) e grupo simulado. */

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
  if (!r || typeof r !== 'object') throw new Error('resposta vazia');
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
  if (!r || typeof r !== 'object') throw new Error('resposta vazia');
  return { contexto: r.contexto || '', versiculos: r.versiculos || [], perguntas: r.perguntas || [], aplicacao: r.aplicacao || '', roteiro: r.roteiro || [], ia: true };
}

/* Dúvida livre */
async function genDuvida(q) {
  const prompt = REGRAS + '\n\nUma pessoa fez esta pergunta, que talvez tenha vergonha de fazer ao pastor: "' + q + '"\nTradição da pessoa: ' + (TRADICOES[tradicao()] || 'não informada') + '.\n' +
    'Se a pergunta envolver risco de vida, autolesão ou abuso, diga com clareza para buscar ajuda agora (CVV 188, ou 190 em caso de violência) e para falar com alguém de confiança.\n' +
    'Responda só com JSON: {"biblia": "o que a Bíblia diz, 3 a 5 frases", "refs": "referências separadas por ponto e vírgula", "trad": {"pentecostal": "1 ou 2 frases", "batista": "1 ou 2 frases", "reformada": "1 ou 2 frases"}, "comum": "1 ou 2 frases sobre o que as tradições têm em comum ou onde divergem"}. Se as tradições concordam, diga isso.';
  aiCtl = new AbortController();
  const r = await SAMPLE.json(prompt, { signal: aiCtl.signal });
  if (!r || typeof r !== 'object') throw new Error('resposta vazia');
  return { id: 'p' + uid(), q, cat: 'Sua pergunta', biblia: r.biblia || '', refs: r.refs || '', trad: r.trad || {}, comum: r.comum || '', ia: true };
}

/* Grupo (simulado neste aparelho) */
const MEMBROS = [
  { nome: 'Débora', base: 6, rate: 3.1, freq: 6 }, { nome: 'Pr. Samuel', base: 9, rate: 3.4, freq: 6 },
  { nome: 'Lucas', base: 2, rate: 1.6, freq: 4 }, { nome: 'Raquel', base: 4, rate: 2.6, freq: 5 }, { nome: 'Tiago', base: 1, rate: 0.9, freq: 3 },
];
/* Membro de exemplo leu num dia? (determinístico, conforme a frequência dele por semana) */
const leuNoDia = (m, k) => hash(k + m.nome) % 7 < m.freq;
function ofensivaDe(m) { let n = 0, k = todayK(); if (!leuNoDia(m, k)) k = addDays(k, -1); while (n < 60 && leuNoDia(m, k)) { n++; k = addDays(k, -1); } return n; }
function membrosHoje() {
  const t = todayK(), out = MEMBROS.filter(m => leuNoDia(m, t)).map(m => ({ nome: m.nome }));
  if (studiedToday() || (S.group && S.group.feed.some(p => p.me && p.d === t))) out.unshift({ nome: S.nome || 'Você', me: true });
  return out;
}
function membrosLista() {
  const t = todayK();
  const eu = { nome: S.nome || 'Você', me: true, hoje: studiedToday(), ofensiva: S.streak.count };
  return [eu].concat(MEMBROS.map(m => ({ nome: m.nome, ex: true, hoje: leuNoDia(m, t), ofensiva: ofensivaDe(m) })));
}
function makeGroup(nome, des) {
  const t = todayK();
  S.group = {
    nome, code: Math.random().toString(36).slice(2, 8).toUpperCase(), desafio: des, start: t, chapAtStart: S.chapters,
    feed: [
      { id: uid(), who: 'Pr. Samuel', d: addDays(t, -1), text: 'Começamos o desafio. Leiam com calma e postem o que Deus falar com vocês.', ref: '', r: { amem: 4, gloria: 2, orando: 1 }, mine: {}, comments: [] },
      { id: uid(), who: 'Débora', d: t, text: 'Li dois capítulos no ônibus hoje. Marcos 1 me lembrou que Jesus começou o ministério orando cedo.', ref: 'Marcos 1:35', caps: 2, r: { amem: 3, gloria: 1, orando: 0 }, mine: {}, comments: [{ who: 'Raquel', text: 'Que lindo! Amanhã leio no ônibus também.' }] },
    ],
  };
}
function ranking() {
  const g = S.group, days = Math.max(0, diff(g.start, todayK())) + 1;
  const janela = Math.max(days, 7), diasDe = m => Array.from({ length: janela }, (_, i) => addDays(todayK(), -i)).filter(k => leuNoDia(m, k)).length;
  const rows = MEMBROS.map(m => ({ nome: m.nome, caps: Math.floor(m.base + m.rate * (days - 1)), ex: true, dias: diasDe(m) }));
  rows.push({ nome: S.nome || 'Você', caps: Math.max(0, S.chapters - g.chapAtStart), me: true, dias: S.days.filter(k => k >= g.start).length });
  return rows.sort((a, b) => b.caps - a.caps || (a.me ? -1 : b.me ? 1 : a.nome.localeCompare(b.nome, 'pt')));
}
function postFeed(text, ref, extra) {
  if (!S.group) return;
  S.group.feed.unshift(Object.assign({ id: uid(), who: S.nome || 'Você', me: true, d: todayK(), text, ref: ref || '', r: { amem: 0, gloria: 0, orando: 0 }, mine: {}, comments: [] }, extra || {}));
  /* guarda só as 10 fotos mais recentes, para não lotar o aparelho */
  let fotos = 0; S.group.feed.forEach(p => { if (p.foto && ++fotos > 10) delete p.foto; });
}

