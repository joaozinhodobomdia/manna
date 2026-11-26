/* Manna: jornada (sumário de lições) e motor da lição com exercícios. */

const UNIT = 5;

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
  h += passosHoje();
  h += '<div class="row"><button class="btn sec" data-a="toggleMapa">' + (ui.mapa ? 'Esconder caminhada' : 'Ver caminhada') + '</button><button class="btn sec" data-a="open" data-ov="diario">Diário</button></div>';
  if (ui.mapa) h += vMapa(t, id, d);
  const c = S.cultos[0];
  if (c && diff(c.data, todayK()) < 7) {
    const nd = c.study.dias.findIndex((_, i) => !c.feitos.includes(i));
    h += '<button class="row-link" data-a="open" data-ov="culto" data-id="' + c.id + '"><span><b>' + esc(c.tema) + '</b><small>' + (nd === -1 ? 'Estudo da pregação concluído' : 'Estudo da pregação · dia ' + (nd + 1) + ' de 5') + '</small></span>' + icon('voltar', 'ic flip') + '</button>';
  }
  return h + vTarefas() + '</main>';
}
function passosHoje() {
  const feito = studiedToday();
  return '<ol class="passos-hoje" aria-label="Passos do devocional de hoje">' + DEV_STEPS.map((s, i) => '<li class="' + (feito ? 'on' : '') + '"><span>' + (feito ? icon('check', 'ic xs') : i + 1) + '</span>' + s.n + '</li>').join('') + '</ol>';
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
function pontoCurva(p0, c1, c2, p3, t) {
  const u = 1 - t, uu = u * u, tt = t * t;
  return [
    uu * u * p0[0] + 3 * uu * t * c1[0] + 3 * u * tt * c2[0] + tt * t * p3[0],
    uu * u * p0[1] + 3 * uu * t * c1[1] + 3 * u * tt * c2[1] + tt * t * p3[1],
  ];
}
function amostraCaminho(pts) {
  if (!pts || pts.length < 2) return pts ? pts.slice() : [];
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let s = 0; s < 8; s++) out.push(pontoCurva(p1, c1, c2, p2, s / 8));
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/* Ao lado da estrada, para o lado de fora, longe do número e do rótulo. */
function aoLadoDaEstrada(p, W) {
  const t = Math.max(-1, Math.min(1, (p[0] - W / 2) / 40));
  return [p[0] + t * 56, p[1] + 6];
}
function vMapa(t, id, d) {
  const n = t.licoes.length, US = t.unit || UNIT, units = Math.ceil(n / US);
  let cu = Math.floor(Math.min(Math.max(d, 0), Math.max(n - 1, 0)) / US);
  if (ui.andar && ui.andar.id === id && ui.andar.de >= 0) cu = Math.min(cu, Math.floor(ui.andar.de / US));
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
  const yDest = y + 40; items.push({ k: 'destino', x: W / 2, y: yDest }); y = yDest + 96;
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
  let destino = '';
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
      destino = '<section class="destino"><b>' + (d >= n ? 'Você chegou: ' : 'Destino: ') + esc(t.nome) + '</b><small>' + (d >= n ? 'Caminhada completa.' : 'Faltam ' + plural(n - d, t.tipo === 'Plano' ? 'leitura' : 'lição', t.tipo === 'Plano' ? 'leituras' : 'lições')) + '</small><button class="btn sec" data-a="open" data-ov="plano">Ver o plano do ano</button></section>';
    }
  });
  const aqui = d < n ? items.find(it => it.k === 'lic' && it.i === d) : items.find(it => it.k === 'destino');
  if (aqui && aqui.x != null) {
    let trilhaPts = null;
    if (ui.andar && ui.andar.id === id && ui.andar.de < ui.andar.para) {
      const iDe = items.findIndex(it => it.k === 'lic' && it.i === ui.andar.de);
      let iPara = items.findIndex(it => it.k === 'lic' && it.i === ui.andar.para);
      if (iPara < 0) iPara = items.findIndex(it => it.k === 'destino');
      if (iDe >= 0 && iPara > iDe) {
        const brutos = items.slice(iDe, iPara + 1).filter(it => (it.k === 'lic' || it.k === 'vaso' || it.k === 'destino') && it.x != null).map(it => [it.x, it.y]);
        if (brutos.length >= 2) trilhaPts = amostraCaminho(brutos).map(p => aoLadoDaEstrada(p, W));
      }
    }
    const fim = aoLadoDaEstrada([aqui.x, aqui.y], W);
    const reduz = reduceMotion();
    const pos = trilhaPts && !reduz ? trilhaPts[0] : fim;
    ui.andarPts = trilhaPts;
    if (reduz) ui.andar = null;
    h += '<figure class="mani-mapa" id="mani-mapa" style="left:' + pos[0].toFixed(1) + 'px;top:' + pos[1].toFixed(1) + 'px"><img src="mani/mani-animado@2x.png" srcset="mani/mani-animado@2x.png 2x, mani/mani-animado@3x.png 3x" width="48" height="48" alt="Mani no caminho, no dia de hoje"></figure>';
  }
  return h + '</section>' + destino;
}
function porManiMapa(el, p) {
  el.style.left = p[0].toFixed(1) + 'px';
  el.style.top = p[1].toFixed(1) + 'px';
}
function syncManiMapa() {
  const mapa = document.getElementById('mani-mapa');
  if (!mapa || ui.andando) return;
  const topo = document.querySelector('.topo-j .mani');
  if (!topo) { mapa.classList.remove('espera'); return; }
  const r = topo.getBoundingClientRect();
  mapa.classList.toggle('espera', r.bottom > 0 && r.top < window.innerHeight);
}
function andarMani() {
  const el = document.getElementById('mani-mapa');
  const pts = ui.andarPts;
  if (!el) { ui.andar = null; ui.andarPts = null; return; }
  const topo = document.querySelector('.topo-j .mani');
  const box = el.getBoundingClientRect();
  let top = box.top + window.scrollY - window.innerHeight * 0.38;
  if (topo) top = Math.max(top, topo.getBoundingClientRect().bottom + window.scrollY + 8);
  window.scrollTo(0, Math.max(0, top));
  if (reduceMotion() || !pts || pts.length < 2) {
    if (pts && pts.length) porManiMapa(el, pts[pts.length - 1]);
    ui.andar = null; ui.andarPts = null; ui.andando = false; syncManiMapa();
    return;
  }
  ui.andando = true;
  el.classList.remove('espera');
  const dur = 1100, t0 = performance.now();
  cancelAnimationFrame(ui.andarFrame || 0);
  const frame = (now) => {
    if (!el.isConnected) { ui.andando = false; return; }
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    const x = e * (pts.length - 1), i = Math.max(0, Math.min(pts.length - 2, Math.floor(x))), f = x - i;
    const a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)] || a;
    if (!a || !b) { porManiMapa(el, pts[pts.length - 1]); ui.andar = null; ui.andarPts = null; ui.andando = false; syncManiMapa(); return; }
    porManiMapa(el, [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    if (p < 1) ui.andarFrame = requestAnimationFrame(frame);
    else { porManiMapa(el, pts[pts.length - 1]); ui.andar = null; ui.andarPts = null; ui.andando = false; syncManiMapa(); }
  };
  if (ui.andar) SND.passos((ui.andar.para - ui.andar.de) * 3 + 2);
  ui.andarFrame = requestAnimationFrame(frame);
}

/* ---------- Devocional da porção: citação, passagem, devocional e oração ---------- */
const DEV_STEPS = [
  { k: 'cita', n: 'Citação' },
  { k: 'leia', n: 'Passagem' },
  { k: 'devo', n: 'Devocional' },
  { k: 'ore', n: 'Oração' },
];
const words = s => s.replace(/[.,;:"()?!]/g, '').split(/\s+/).filter(Boolean);
const vref = x => LIVROS[x.b][0] + ' ' + x.c + ':' + x.v;
const PERGUNTAS_BASE = [
  'Em que área da sua vida este texto toca hoje: família, trabalho, decisões ou medos?',
  'O que este texto mostra sobre o caráter de Deus, e como isso muda o jeito como você enxerga o seu momento?',
  'Se você levasse esta palavra a sério hoje, o que faria diferente?',
];
function versoChave(vs) {
  if (!vs.length) return null;
  const cand = vs.filter(x => { const n = words(x.t).length; return n >= 8 && n <= 34; });
  const v = cand.find(x => /\b(Deus|Senhor|SENHOR|Jesus|Cristo|amor|fé|graça|paz|esperança)\b/.test(x.t)) || cand[0] || vs[0];
  return { ref: vref(v), t: v.t };
}
/* Devocional sem IA: usa o contexto da lição e um versículo-chave do próprio texto */
function devLocal(t, i, vs) {
  const l = t.licoes[i], v = versoChave(vs), ctx = l.ctx || (S.gen[l.ref] && S.gen[l.ref].contexto) || '';
  return {
    tema: l.plano ? 'O que Deus fala em ' + l.ref : l.titulo, verso: v,
    meditacao: [
      ctx || 'Leia de novo ' + l.ref + ' sem pressa. Antes de pensar no que fazer, pergunte o que este texto mostra sobre quem Deus é.',
      'A Bíblia não foi escrita só para informar, mas para transformar. Talvez algo nesta leitura tenha incomodado, consolado ou surpreendido você. Pare um pouco nisso: muitas vezes é por aí que o Espírito Santo fala.',
      v ? 'Fique com o versículo destacado durante o dia. Leia em voz alta, escreva num papel, repita antes de dormir. A Palavra guardada no coração continua trabalhando em silêncio.' : 'Escolha uma frase deste texto e leve com você durante o dia. A Palavra guardada no coração continua trabalhando em silêncio.',
    ],
    perguntas: [l.q].filter(Boolean).concat(PERGUNTAS_BASE).slice(0, 4),
    oracao: 'Senhor, obrigado pela tua Palavra de hoje. Abre os meus olhos para enxergar o que tu queres me mostrar em ' + l.ref + '. Onde eu estou resistindo, me dá um coração ensinável. Que esta leitura não fique só na minha cabeça, mas vire atitude. Em nome de Jesus, amém.',
    hoje: 'Escolha um versículo de ' + l.ref + ' e mande para alguém que precisa ouvir isso hoje.',
    ia: false,
  };
}
async function devIA(L) {
  const t = trilha(L.id), l = t.licoes[L.idx], key = 'dev:' + l.ref;
  const texto = L.vs.map(x => x.v + ' ' + x.t).join('\n').slice(0, 9000);
  try {
    const r = await SAMPLE.json(REGRAS + '\n\nTexto bíblico de hoje (Bíblia Livre, ' + l.ref + '):\n' + (texto || '(use o seu conhecimento de ' + l.ref + ')') +
      '\n\nTrilha: ' + t.nome + '. Tema da lição: ' + l.titulo + '.\n\nEscreva o devocional de hoje para um crente brasileiro adulto, no estilo de um devocional diário, como uma conversa à mesa com Deus: acolhedor, profundo e prático, falando com "você". Traga um tema central que nasce deste texto e mostre como ele toca a vida real (família, trabalho, ansiedade, perdão, decisões, fé no dia a dia). Nada de perguntas de memorização ou de fatos do texto. Sem moralismo, sem clichês, sem veredito em temas que dividem as igrejas. Não copie devocionais publicados.\n\n' +
      'Responda só com JSON: {"tema": "título do devocional, até 8 palavras", "versiculo": "referência de UM versículo-chave deste texto, ex.: Mateus 1:23", "meditacao": ["4 parágrafos de 3 a 5 frases"], "perguntas": ["3 ou 4 perguntas abertas de reflexão pessoal, que levam a pensar no tema e em como ele muda a vida"], "oracao": "oração em primeira pessoa, 4 a 6 frases", "para_hoje": "uma atitude concreta e simples para hoje, 1 frase"}');
    const med = (Array.isArray(r.meditacao) ? r.meditacao : []).map(String).filter(Boolean).slice(0, 5);
    const pq = (Array.isArray(r.perguntas) ? r.perguntas : []).map(String).filter(Boolean).slice(0, 4);
    if (!med.length || !pq.length) throw new Error('vazio');
    const vv = r.versiculo ? versesOf(String(r.versiculo)) : [];
    const dev = { tema: String(r.tema || l.titulo), verso: vv.length ? { ref: vref(vv[0]), t: vv[0].t } : versoChave(L.vs), meditacao: med, perguntas: pq, oracao: String(r.oracao || ''), hoje: String(r.para_hoje || ''), ia: true };
    S.gen[key] = dev; save();
    /* Quem tocou em "Seguir sem esperar" já está lendo o texto local. Não troca no meio. */
    if (ui.L === L && (L.pediuIa || !L.dev)) {
      L.dev = dev; L.devCarregando = false; L.pediuIa = false;
      const k = L.steps[L.i] && L.steps[L.i].k;
      if (k && k !== 'leia') renderLesson();
    }
  } catch (e) {
    if (ui.L === L) { L.devCarregando = false; L.pediuIa = false; if (!L.dev) L.dev = devLocal(t, L.idx, L.vs); renderLesson(); }
  }
}

async function startLesson(id, idx, review) {
  const t = trilha(id);
  ui.L = { id, idx, review: !!review, phase: 'load', steps: [], vs: [] };
  render();
  try { await loadBiblia(); } catch (e) { /* sem o texto, a lição usa a referência */ }
  if (!ui.L || ui.L.id !== id) return;
  const vs = versesOf(t.licoes[idx].ref), key = 'dev:' + t.licoes[idx].ref;
  const L = ui.L = { id, idx, review: !!review, steps: DEV_STEPS, vs, i: 0, phase: 'steps', t0: Date.now(), lido: false, orou: false, checks: {}, dev: S.gen[key] || devLocal(t, idx, vs) };
  render();
}
const respostas = L => { S.reflex = S.reflex || {}; return (S.reflex[L.id + ':' + L.idx] = S.reflex[L.id + ':' + L.idx] || []); };
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
  const segs = L.steps.map((s, i) => '<i class="' + (i < L.i ? 'on' : i === L.i ? 'now' : '') + '"></i>').join('');
  return '<header class="ltop"><div class="lt-row"><span class="lt-t"><b>' + esc(l.ref) + '</b><small>' + (L.review ? 'Revisão · ' : '') + esc(L.steps[L.i].n) + ' · ' + (L.i + 1) + ' de ' + L.steps.length + '</small></span><button class="iconbtn" data-a="lessonExit" aria-label="Sair da lição">' + icon('fechar') + '</button></div><div class="segs">' + segs + '</div></header>';
}
function vLessonScreen() {
  const L = ui.L, t = trilha(L.id), l = t.licoes[L.idx];
  if (L.phase === 'load') return '<div class="lesson"><main class="lz center-col"><p class="body-l">Abrindo a Bíblia…</p></main></div>';
  if (L.phase === 'fim') return vFim(L);
  if (L.phase === 'ofensiva') return vOfensivaUp();
  if (L.phase === 'sair') return '<div class="lesson"><main class="lz center-col"><h2 class="qt">Sair da porção?</h2><p class="body-l">Suas reflexões ficam guardadas, mas a porção só conta quando você concluir.</p></main><footer class="lfoot col"><button class="btn" data-a="lessonStay">Continuar</button><button class="btn sec" data-a="lessonQuit">Sair</button></footer></div>';
  const s = L.steps[L.i], dev = L.dev;
  if (!s) return '<div class="lesson"><main class="lz"><p class="body-l">Porção pronta para concluir.</p></main><footer class="lfoot"><button class="btn" data-a="finishLesson">Concluir a porção</button></footer></div>';
  let h = '<div class="lesson">' + lessonTop(L, t, l) + '<main class="lz">';
  const foot = (label, extra) => '</main><footer class="lfoot">' + (extra || '') + '<button class="btn" data-a="next">' + label + icon('voltar', 'ic flip') + '</button></footer></div>';
  if (!dev) {
    h += '<div class="center-col pad-y">' + ART.mani('mani m-lg', 'pensativo', 'Estou preparando a sua meditação.') + '<p class="muted">Leva alguns segundos.</p></div>';
    return h + '</main><footer class="lfoot"><button class="btn sec" data-a="semEsperar">Seguir sem esperar</button></footer></div>';
  }
  const check = (k, label) => '<label class="check big"><input type="checkbox" data-passo="' + k + '"' + (L.checks && L.checks[k] ? ' checked' : '') + '> ' + label + '</label>';
  if (s.k === 'cita') {
    const v = dev.verso || (L.vs[0] ? { ref: vref(L.vs[0]), t: L.vs[0].t } : null);
    h += '<article class="devo"><p class="muted">Citação do dia</p><h1 class="sc-t">' + esc(dev.tema) + '</h1>' +
      (v ? '<blockquote class="vchave"><p>' + esc(v.t) + '</p><cite>' + esc(v.ref) + ' · Bíblia Livre</cite></blockquote>' : '<p class="note">Abra ' + esc(l.ref) + ' e leia o versículo que mais tocar você.</p>') + '</article>';
    return h + '</main><footer class="lfoot">' + check('cita', 'Li esta citação') + '<button class="btn" data-a="next"' + (L.checks && L.checks.cita ? '' : ' disabled') + '>Ir para a passagem' + icon('voltar', 'ic flip') + '</button></footer></div>';
  }
  if (s.k === 'leia') {
    const ver = S.quiz.versao && !/Outra|BLIVRE/.test(S.quiz.versao) ? S.quiz.versao : '';
    h += '<article class="intro"><h1 class="sc-t">' + esc(l.plano ? l.ref : l.titulo) + '</h1><p class="sc-ctx">Leia com calma, como quem senta à mesa com Deus.</p>' + (t.nota ? '<p class="note">' + esc(t.nota) + '</p>' : '') + '</article>';
    h += L.vs.length ? '<article class="bible" style="--fs:' + S.fonte + 'px">' + bibleText(L.vs) + '<p class="fine">Bíblia Livre.' + (ver ? ' Se preferir, acompanhe na ' + ver + '.' : '') + '</p></article>' : '<p class="note">Abra a sua Bíblia em ' + esc(l.ref) + ' e leia com calma.</p>';
    return h + '</main><footer class="lfoot"><label class="check big" for="l-lido"><input type="checkbox" id="l-lido"' + (L.lido ? ' checked' : '') + '> Li ' + esc(l.ref) + '</label><button class="btn" data-a="next"' + (L.lido ? '' : ' disabled') + '>Ir para o devocional' + icon('voltar', 'ic flip') + '</button></footer></div>';
  }
  if (s.k === 'devo') {
    h += '<article class="devo"><h1 class="sc-t">' + esc(dev.tema) + '</h1>' + dev.meditacao.map(p => '<p class="med">' + esc(p) + '</p>').join('') +
      (dev.hoje ? '<div class="hoje-card"><p>' + esc(dev.hoje) + '</p></div>' : '') + '</article>';
    const iaBtn = S.iaPermitida && !dev.ia ? '<button class="btn sec" data-a="aprofundar">' + (L.devCarregando ? 'Preparando…' : 'Aprofundar com a IA') + '</button>' : '';
    return h + '</main><footer class="lfoot">' + iaBtn + check('devo', 'Li o devocional') + '<button class="btn" data-a="next"' + (L.checks && L.checks.devo ? '' : ' disabled') + '>Ir para a oração' + icon('voltar', 'ic flip') + '</button></footer></div>';
  }
  h += ART.mani('mani m-sm row', 'orando', 'Vamos orar com calma.') + '<article class="devo"><h1 class="sc-t">Vamos orar</h1><p class="muted">Leia devagar, ou use como ponto de partida para a sua própria oração.</p><blockquote class="oracao">' + esc(dev.oracao) + '</blockquote></article>';
  return h + '</main><footer class="lfoot"><div class="row"><button class="btn sec" data-a="ouvir" data-t="oracao">Ouvir</button><button class="btn sec" data-a="audioPlus">Áudio caprichado ' + icon('cadeado', 'ic sm') + '</button></div><button class="btn" data-a="amem">Amém' + icon('voltar', 'ic flip') + '</button></footer></div>';
}

function vFim(L) {
  const r = L.result, l = trilha(L.id).licoes[L.idx];
  const linha = (k, v) => '<li><span>' + k + '</span><i></i><b class="tnum">' + v + '</b></li>';
  const tFim = trilha(L.id);
  const figuraFim = (!L.review && tFim && isDone(L.id)) ? ART.mani('mani m-lg', 'oliveira', falaTrilha(tFim.nome))
    : (!L.review && todayXP() >= S.goal) ? ART.mani('mani m-lg', 'grata', 'Glória a Deus! Meta de hoje cumprida.')
    : ART.mani('mani m-lg', 'feliz', L.review ? 'Que bom voltar a este texto!' : 'Glória a Deus! Porção colhida.');
  return '<div class="lesson"><main class="lz fim">' + figuraFim +
    '<article class="diario"><p class="muted">' + fmt(todayK(), { weekday: 'long', day: 'numeric', month: 'long' }) + '</p><h1>' + esc(r.tema || l.ref) + '</h1><p class="muted">' + esc(l.ref) + '</p><ul>' +
    linha('XP ganho', '+<span data-count="' + r.xp + '">0</span>') + linha('Reflexões escritas', r.reflexoes) + linha('Tempo com Deus', r.tempo) + (r.grains ? linha('Grãos de maná', '+' + r.grains) : '') +
    '</ul>' + (S.group && !L.review ? '<p class="muted">Seu check-in foi postado em ' + esc(S.group.nome) + '.</p>' : '') + '</article>' +
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
  document.querySelectorAll('[id^="rf-"]').forEach(el => { respostas(L)[Number(el.id.slice(3))] = el.value; });
  const reflexoes = respostas(L).filter(x => x && x.trim()).length;
  const secs = Math.round((Date.now() - L.t0) / 1000), tempo = Math.floor(secs / 60) + ':' + pad(secs % 60);
  let base = L.review ? 5 : 15;
  if (!L.review && reflexoes) base += 5;
  const boost = boostOn(), xp = addXP(base);
  let grains = 0, up = false;
  if (!L.review) {
    const antes = S.progress[L.id] || 0, depois = Math.max(antes, L.idx + 1);
    if (depois > antes) ui.andar = { id: L.id, de: antes, para: depois };
    S.progress[L.id] = depois;
    S.lessons++;
    if (reflexoes) { S.perfect++; bump('reflexao', reflexoes); }
    bump('licoes', 1); grains = reflexoes ? 8 : 5; S.grains += grains;
    up = study(l.caps);
    if (S.group) postFeed('Colhi a porção de hoje: ' + (L.dev ? L.dev.tema : l.titulo) + '.', L.dev && L.dev.verso ? L.dev.verso.ref : l.ref);
    if (isDone(L.id)) setTimeout(() => toast('Meta concluída: ' + t.nome), 1500);
  } else { up = study(0); }
  checkAch(); save();
  L.result = { xp, tempo, reflexoes, grains, boost, up, tema: L.dev ? L.dev.tema : '' };
  L.phase = 'fim';
  render(); SND.fim(); rain(40); countUp();
}
