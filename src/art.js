/* Manna: ilustrações em SVG (cores chapadas da paleta, sem degradê). */

const ART = {};

/* Mani: PNGs transparentes em public/mani/mani-<pose>@2x.png e @3x.png.
   Uma figura por tela. A pose com a Bíblia (leitora) nunca é espelhada.
   Se a pose não está no app, não aparece: pose alegre não substitui dor ou erro. */
const MANI_ALT = {
  leitora: 'Mani lendo a Bíblia',
  grata: 'Mani em gratidão, de olhos fechados',
  joinha: 'Mani com o polegar levantado',
  oliveira: 'Mani com um ramo de oliveira',
  feliz: 'Mani sorrindo de olhos fechados',
  animado: 'Mani com as asas abertas, comemorando',
  curioso: 'Mani olhando uma interrogação',
  pensativo: 'Mani pensativo, com a asa no queixo',
  surpreso: 'Mani surpreso, de bico aberto',
  ansioso: 'Mani preocupado',
  triste: 'Mani triste',
  bravinho: 'Mani bravinho por um erro do aplicativo',
  orando: 'Mani de olhos fechados, em oração',
};
function clampFala(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= 60) return t;
  const cut = t.slice(0, 60);
  const sp = cut.lastIndexOf(' ');
  return (sp > 24 ? cut.slice(0, sp) : cut).trim();
}
ART.mani = (cls, pose, fala) => {
  const p = pose || 'leitora';
  const F = typeof MANI_FILES !== 'undefined' ? MANI_FILES : {};
  if (!F[p]) return '';
  const w = Number(F[p][0]) || 256, h = Number(F[p][1]) || 512;
  const base = 'mani/mani-' + p;
  const texto = fala ? clampFala(fala) : '';
  const falaHtml = texto ? '<figcaption class="m-fala">' + esc(texto) + '</figcaption>' : '';
  return '<figure class="' + (cls || 'mani') + '"><span class="m-tile"><img src="' + base + '@2x.png" srcset="' + base + '@2x.png 2x, ' + base + '@3x.png 3x" width="' + w + '" height="' + h + '" alt="' + esc(MANI_ALT[p] || 'Mani') + '"></span>' + falaHtml + '</figure>';
};

ART.grao = cls => '<svg class="' + (cls || 'grao') + '" viewBox="0 0 12 16" aria-hidden="true"><ellipse cx="6" cy="8" rx="4.2" ry="6.4" transform="rotate(-22 6 8)"/></svg>';

ART.vaso = cls => '<svg class="' + (cls || 'vaso') + '" viewBox="0 0 32 36" aria-hidden="true">' +
  '<path d="M9 12C3 15 2 20 2 24c0 7 6 10 14 10s14-3 14-10c0-4-1-9-7-12Z" fill="var(--vaso)" stroke="var(--vaso-tr)" stroke-width="2.2" stroke-linejoin="round"/>' +
  '<rect x="9" y="8" width="14" height="5" rx="1.5" fill="var(--vaso)" stroke="var(--vaso-tr)" stroke-width="2.2"/>' +
  '<rect x="6" y="3" width="20" height="6" rx="3" fill="var(--vaso-tampa)" stroke="var(--vaso-tr)" stroke-width="2.2"/>' +
  '<path d="M7 22h18" stroke="var(--vaso-tr)" stroke-width="2" stroke-linecap="round"/></svg>';

ART.logo = cls => '<svg class="' + (cls || 'logo') + '" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#0F1B3D"/><path d="M12 40c6.5-3.6 13.5-3.6 20 1.6 6.5-5.2 13.5-5.2 20-1.6v9c-6.5-3.6-13.5-3.6-20 1.6-6.5-5.2-13.5-5.2-20-1.6z" fill="none" stroke="#F2C14E" stroke-width="3.6" stroke-linejoin="round"/><path d="M32 41.6v8.4" stroke="#F2C14E" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="34" cy="21" rx="4.6" ry="7" transform="rotate(-24 34 21)" fill="#F2C14E"/></svg>';

/* Cenário da jornada: o caminho do povo pelo deserto */
const decoSvg = (inner) => '<svg class="deco" viewBox="0 0 90 90" aria-hidden="true">' + inner + '</svg>';
ART.deco = {
  tenda: decoSvg('<ellipse cx="45" cy="80" rx="40" ry="6" fill="var(--areia)"/><path d="M10 78 L45 22 L80 78 Z" fill="var(--tenda)"/><path d="M45 22 L34 78 H56 Z" fill="var(--tenda-dk)"/><path d="M45 22 L45 12" stroke="var(--tenda-dk)" stroke-width="3" stroke-linecap="round"/><path d="M45 13 L56 17 L45 20" fill="var(--ouro)"/>'),
  palmeira: decoSvg('<ellipse cx="46" cy="82" rx="26" ry="5" fill="var(--areia)"/><path d="M46 82 C44 64 42 48 47 30" stroke="var(--tronco)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M47 30 C36 18 20 18 10 28 C24 24 36 27 47 32Z" fill="var(--folha)"/><path d="M47 30 C58 16 74 16 84 26 C70 22 58 26 47 32Z" fill="var(--folha)"/><path d="M47 30 C40 22 38 10 44 4 C46 14 48 22 48 30Z" fill="var(--folha-dk)"/><path d="M47 31 C34 30 22 40 20 52 C28 42 38 36 47 33Z" fill="var(--folha-dk)"/><path d="M47 31 C60 30 72 40 74 52 C66 42 56 36 47 33Z" fill="var(--folha-dk)"/>'),
  nuvem: decoSvg('<ellipse cx="45" cy="84" rx="18" ry="4" fill="var(--areia)"/><circle cx="44" cy="70" r="13" fill="var(--nuvem)"/><circle cx="49" cy="55" r="13" fill="var(--nuvem)"/><circle cx="42" cy="40" r="13" fill="var(--nuvem)"/><circle cx="48" cy="26" r="12" fill="var(--nuvem)"/><circle cx="42" cy="14" r="10" fill="var(--nuvem)"/><circle cx="54" cy="12" r="8" fill="var(--nuvem)"/>'),
  tabuas: decoSvg('<ellipse cx="45" cy="82" rx="34" ry="5" fill="var(--areia)"/><path d="M14 78V36a14 14 0 0 1 28 0v42Z" fill="var(--pedra)" stroke="var(--pedra-dk)" stroke-width="3"/><path d="M48 78V36a14 14 0 0 1 28 0v42Z" fill="var(--pedra)" stroke="var(--pedra-dk)" stroke-width="3"/><path d="M21 44h14M21 52h14M21 60h10M55 44h14M55 52h14M55 60h10" stroke="var(--pedra-dk)" stroke-width="2.5" stroke-linecap="round"/>'),
  fogo: decoSvg('<ellipse cx="45" cy="84" rx="16" ry="4" fill="var(--areia)"/><path d="M45 82 C28 78 26 58 36 44 C38 54 42 56 44 56 C40 40 46 22 58 12 C56 26 66 34 66 54 C66 72 58 82 45 82Z" fill="var(--fogo)"/><path d="M46 80 C38 78 36 68 41 60 C43 66 46 66 48 64 C47 56 50 50 55 46 C56 56 60 60 59 68 C58 76 53 80 46 80Z" fill="var(--ouro)"/>'),
  vasoGrande: decoSvg('<ellipse cx="45" cy="82" rx="24" ry="5" fill="var(--areia)"/><g transform="translate(17 18) scale(1.75)">' + '<path d="M9 12C3 15 2 20 2 24c0 7 6 10 14 10s14-3 14-10c0-4-1-9-7-12Z" fill="var(--ouro)" stroke="var(--tronco)" stroke-width="1.6"/><rect x="9" y="8" width="14" height="5" rx="1.5" fill="var(--ouro)" stroke="var(--tronco)" stroke-width="1.6"/><rect x="6" y="3" width="20" height="6" rx="3" fill="var(--ouro-dk)" stroke="var(--tronco)" stroke-width="1.6"/></g>'),
};
/* Cenas do mapa da caminhada: paisagens bíblicas e personagens, em pixels, cores chapadas */
const G = (x, y, inner, s) => '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' + (s ? ' scale(' + s + ')' : '') + '">' + inner + '</g>';
const SV = {
  sombra: (w) => '<ellipse cx="0" cy="0" rx="' + w + '" ry="' + (w / 5) + '" fill="var(--chao)"/>',
  tenda: '<path d="M-26 0 L0 -36 L26 0 Z" fill="var(--tenda)"/><path d="M0 -36 L-8 0 H8 Z" fill="var(--tenda-dk)"/><path d="M0 -36 V-44" stroke="var(--tenda-dk)" stroke-width="2.5" stroke-linecap="round"/><path d="M0 -44 L9 -41 L0 -38" fill="var(--ouro)"/>',
  palmeira: '<path d="M2 0 C0 -14 -2 -26 3 -40" stroke="var(--tronco)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M3 -40 C-6 -50 -18 -50 -26 -42 C-14 -45 -6 -43 3 -38Z" fill="var(--folha)"/><path d="M3 -40 C12 -52 24 -52 32 -44 C20 -47 12 -44 3 -38Z" fill="var(--folha)"/><path d="M3 -40 C-6 -40 -15 -32 -16 -22 C-10 -30 -3 -35 3 -38Z" fill="var(--folha-dk)"/><path d="M3 -40 C12 -40 21 -32 22 -22 C16 -30 9 -35 3 -38Z" fill="var(--folha-dk)"/>',
  oliveira: '<path d="M0 0 C-2 -8 2 -14 0 -22" stroke="var(--tronco)" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="-10" cy="-28" r="13" fill="var(--folha-dk)"/><circle cx="8" cy="-32" r="15" fill="var(--folha)"/><circle cx="-2" cy="-42" r="12" fill="var(--folha)"/>',
  casa: '<rect x="-16" y="-22" width="32" height="22" fill="var(--parede)" stroke="var(--pedra-dk)" stroke-width="1.5"/><rect x="-18" y="-26" width="36" height="5" fill="var(--pedra-dk)"/><rect x="-4" y="-12" width="8" height="12" fill="var(--tenda-dk)"/><rect x="7" y="-17" width="5" height="5" fill="var(--noite)"/>',
  monte: '<path d="M-40 0 L-10 -46 L6 -26 L16 -38 L44 0 Z" fill="var(--monte)"/><path d="M-10 -46 L-2 0 L-40 0 Z" fill="var(--monte-dk)"/><path d="M-16 -37 L-10 -46 L-5 -38 Z" fill="var(--parede)"/>',
  ovelha: '<g><path d="M-6 6 v6 M5 6 v6" stroke="var(--noite)" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="12" ry="9" fill="var(--ovelha)" stroke="var(--pedra-dk)" stroke-width="1.2"/><circle cx="-8" cy="-5" r="5" fill="var(--ovelha)" stroke="var(--pedra-dk)" stroke-width="1.2"/><circle cx="7" cy="-6" r="5" fill="var(--ovelha)" stroke="var(--pedra-dk)" stroke-width="1.2"/><ellipse cx="13" cy="-2" rx="5" ry="6" fill="var(--noite)"/></g>',
  pastor: '<path d="M-9 0 L-6 -22 C-4 -26 4 -26 6 -22 L9 0 Z" fill="var(--manto)"/><path d="M-6 -22 L6 -22 L4 -10 L-4 -10 Z" fill="var(--manto2)"/><circle cx="0" cy="-30" r="6" fill="var(--pele)"/><path d="M-7 -30 C-7 -40 7 -40 7 -30 L8 -24 L-8 -24 Z" fill="var(--parede)"/><path d="M13 2 V-34 C13 -42 21 -42 21 -35" stroke="var(--tronco)" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  pessoa: (c) => '<path d="M-7 0 L-5 -18 C-3 -21 3 -21 5 -18 L7 0 Z" fill="' + c + '"/><circle cx="0" cy="-25" r="5" fill="var(--pele)"/>',
  lago: '<path d="M-46 4 C-48 -14 -26 -24 -2 -22 C24 -20 48 -12 46 4 C44 18 18 24 -6 22 C-30 20 -44 16 -46 4Z" fill="var(--agua)"/><path d="M-30 8 q6 -4 12 0 M8 12 q6 -4 12 0 M-10 -10 q6 -4 12 0" stroke="var(--agua-dk)" stroke-width="2" fill="none" stroke-linecap="round"/>',
  barco: '<path d="M-18 -4 H18 L12 6 H-12 Z" fill="var(--tenda-dk)"/><path d="M0 -4 V-30" stroke="var(--tronco)" stroke-width="2.2"/><path d="M1 -29 L16 -8 H1 Z" fill="var(--parede)" stroke="var(--pedra-dk)" stroke-width="1"/><circle cx="-8" cy="-10" r="3.6" fill="var(--pele)"/><path d="M-12 -4 L-11 -7 C-10 -9 -6 -9 -5 -7 L-4 -4Z" fill="var(--manto)"/>',
  igrejinha: '<rect x="-20" y="-28" width="40" height="28" fill="var(--parede)" stroke="var(--pedra-dk)" stroke-width="1.5"/><path d="M-24 -26 L0 -46 L24 -26 Z" fill="var(--telha)"/><rect x="-6" y="-58" width="12" height="16" fill="var(--parede)" stroke="var(--pedra-dk)" stroke-width="1.5"/><path d="M-8 -58 L0 -66 L8 -58Z" fill="var(--telha)"/><path d="M0 -74 V-64 M-4 -70 H4" stroke="var(--ouro-dk)" stroke-width="2.4" stroke-linecap="round"/><path d="M-6 0 V-12 a6 6 0 0 1 12 0 V0Z" fill="var(--noite)"/><rect x="-15" y="-21" width="6" height="7" rx="3" fill="var(--agua)"/><rect x="9" y="-21" width="6" height="7" rx="3" fill="var(--agua)"/>',
  portao: '<rect x="-30" y="-40" width="14" height="40" fill="var(--parede)" stroke="var(--ouro-dk)" stroke-width="1.5"/><rect x="16" y="-40" width="14" height="40" fill="var(--parede)" stroke="var(--ouro-dk)" stroke-width="1.5"/><path d="M-16 0 V-26 a16 16 0 0 1 32 0 V0" fill="var(--ouro)" stroke="var(--ouro-dk)" stroke-width="1.5"/><path d="M-30 -40 h14 v-6 h-14z M16 -40 h14 v-6 h-14z" fill="var(--ouro-dk)"/>',
};
ART.cena = (r, x, y, tipo, u) => {
  if (tipo === 'destino') {
    return G(x, y, SV.sombra(58) + G(-46, -2, SV.oliveira, .8) + G(48, -2, SV.oliveira, .7) + G(0, 0, SV.igrejinha, 1.5) + G(-24, 4, SV.pessoa('var(--manto2)'), .9) + G(-12, 6, SV.pessoa('var(--manto)'), .8) + G(24, 5, SV.pessoa('var(--telha)'), .85));
  }
  const S2 = SV;
  const emb = (k, sz) => ART.deco[k].replace('<svg class="deco"', '<svg x="' + (-sz / 2) + '" y="' + (-sz * .9) + '" width="' + sz + '" height="' + sz + '"');
  const opcoes = {
    deserto: [SV.sombra(34) + G(-16, 0, S2.tenda, .9) + G(14, 4, S2.tenda, .7) + G(30, -2, S2.palmeira, .7), SV.sombra(40) + G(0, 2, S2.monte, .9) + G(30, 6, emb('tabuas', 40)), emb('nuvem', 70) + G(30, 4, S2.tenda, .6), emb('fogo', 64) + G(-28, 4, S2.tenda, .6)],
    reino: [SV.sombra(34) + G(-20, 0, S2.monte, .55) + G(12, 4, S2.casa, .9) + G(30, 2, S2.oliveira, .6), SV.sombra(34) + G(-12, 2, S2.casa, .8) + G(12, 4, S2.casa, .7) + G(-34, 2, S2.oliveira, .55), SV.sombra(30) + G(0, 4, emb('tabuas', 60))],
    galileia: [G(0, 0, S2.lago, .95) + G(4, -2, S2.barco, .9), SV.sombra(34) + G(0, 2, S2.monte, .7) + G(-26, 4, S2.oliveira, .6) + G(26, 6, S2.oliveira, .5), G(0, 0, S2.lago, .8) + G(-30, 2, S2.palmeira, .6)],
    cidades: [SV.sombra(30) + G(0, 4, S2.igrejinha, .9) + G(-30, 6, S2.oliveira, .55), G(0, 0, S2.lago, 1.05) + G(0, -2, S2.barco, 1.2), SV.sombra(34) + G(-14, 2, S2.casa, .8) + G(14, 4, S2.igrejinha, .7)],
    ceu: [SV.sombra(32) + G(0, 4, S2.portao, .9)],
  }[r] || [''];
  const marco = opcoes[(typeof u === 'number' ? u : 0) % opcoes.length];
  const gente = {
    deserto: G(-14, 0, S2.ovelha, .9) + G(10, 6, S2.ovelha, .75) + G(26, 4, S2.pastor, .85),
    reino: G(-18, 2, S2.pastor, .85) + G(4, 6, S2.ovelha, .8) + G(22, 2, S2.ovelha, .7),
    galileia: G(-12, 2, S2.ovelha, .8) + G(14, 4, S2.oliveira, .55),
    cidades: G(-10, 2, S2.pessoa('var(--manto)'), .9) + G(4, 4, S2.pessoa('var(--manto2)'), .85) + G(18, 2, S2.pessoa('var(--telha)'), .8),
    ceu: G(0, 0, S2.palmeira, .7),
  }[r] || '';
  return G(x, y, tipo === 'gente' ? gente : marco);
};

/* Faixa da unidade: dunas e grãos caindo */
ART.banner = () => '<svg class="banner-art" viewBox="0 0 120 80" aria-hidden="true">' +
  '<path d="M0 62 C22 48 40 48 62 60 C80 50 100 48 120 56 V80 H0Z" fill="#1D2D58"/><path d="M0 72 C30 62 54 64 76 72 C92 66 108 66 120 70 V80 H0Z" fill="#26386A"/>' +
  [[22, 12, -20], [48, 26, 15], [74, 8, -30], [96, 30, 10], [36, 40, -10], [86, 46, 25], [108, 14, -15]]
    .map(([x, y, r]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="2.6" ry="4" transform="rotate(' + r + ' ' + x + ' ' + y + ')" fill="#F2C14E"/>').join('') +
  '</svg>';

/* Medalhas de conquista: hexágono com número do nível */
ART.medalha = (lvl, cor, simbolo) => '<svg class="medalha" viewBox="0 0 64 72" aria-hidden="true">' +
  '<path d="M32 3 L59 18 V52 L32 69 L5 52 V18 Z" fill="' + (lvl ? cor : 'var(--bloq)') + '" stroke="' + (lvl ? 'var(--noite)' : 'var(--bloq-dk)') + '" stroke-width="3" stroke-linejoin="round"/>' +
  '<path d="M32 11 L52 22 V48 L32 61 L12 48 V22 Z" fill="none" stroke="' + (lvl ? 'rgba(15,27,61,.25)' : 'var(--bloq-dk)') + '" stroke-width="2"/>' +
  '<g fill="' + (lvl ? 'var(--noite)' : 'var(--bloq-dk)') + '">' + simbolo + '</g></svg>';
ART.simb = {
  fiel: '<ellipse cx="32" cy="36" rx="7" ry="11" transform="rotate(-22 32 36)"/>',
  leitor: '<path d="M16 30c5-3 11-3 16 2 5-5 11-5 16-2v16c-5-3-11-3-16 2-5-5-11-5-16-2z"/>',
  estudioso: '<path d="M32 20 l4 9 10 1-7.5 7 2 10-8.5-5-8.5 5 2-10L18 30l10-1z"/>',
  perfeito: '<path d="M18 36l4-4 6 6 14-14 4 4-18 18z"/>',
  domingo: '<rect x="18" y="22" width="28" height="26" rx="4"/><rect x="22" y="31" width="20" height="13" fill="#fff" opacity=".55"/>',
  curioso: '<path d="M25 30a7 7 0 1 1 10 6c-1.5.8-1.5 1.6-1.5 3.5h-5c0-3 .5-5 3.5-6.5a2.2 2.2 0 1 0-3-2z"/><circle cx="31" cy="46" r="3.2"/>',
  colhedor: '<path d="M22 30h20v4c4 3 5 6 5 9 0 6-6 9-15 9s-15-3-15-9c0-3 1-6 5-9z"/><rect x="20" y="22" width="24" height="7" rx="3"/>',
};

/* Escudos das ligas */
ART.escudo = (cor, cls) => '<svg class="' + (cls || 'escudo') + '" viewBox="0 0 56 64" aria-hidden="true"><path d="M28 3 L52 12 V32 C52 47 42 56 28 61 C14 56 4 47 4 32 V12 Z" fill="' + cor + '" stroke="var(--noite)" stroke-width="3" stroke-linejoin="round"/><path d="M28 18 C21 26 21 38 28 46 C35 38 35 26 28 18Z" fill="var(--noite)" opacity=".85"/></svg>';

/* Ícones de interface */
const IC = {
  jornada: '<path d="M5 19c2-6 4-3 7-8s5-2 7-6"/><circle cx="5" cy="19" r="1.6" fill="currentColor"/><circle cx="19" cy="5" r="1.6" fill="currentColor"/>',
  domingo: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  duvidas: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>',
  grupo: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.8 14.2c2.3 0 4 1.3 4.7 4"/>',
  perfil: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  livro: '<path d="M4 6c3-1.5 6-1.5 8 1 2-2.5 5-2.5 8-1v12c-3-1.5-6-1.5-8 1-2-2.5-5-2.5-8-1z"/><path d="M12 7v12"/>',
  explorar: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  raio: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  escudo: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
};
const icon = (n, cls) => '<svg class="' + (cls || 'ic') + '" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>';
