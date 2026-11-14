/* Manna: ilustrações em SVG (cores chapadas da paleta, sem degradê). */

const ART = {};

/* Mani: o grão de maná, mascote do app. humor: feliz, festa, pensa, triste */
ART.mani = (cls, humor) => {
  const h = humor || 'feliz';
  const boca = {
    feliz: '<path d="M40 76 Q50 86 60 76" stroke="var(--noite)" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
    festa: '<path d="M37 72 Q50 94 63 72 Z" fill="var(--noite)"/><path d="M43 82 Q50 88 57 82" fill="#E4806A"/>',
    pensa: '<path d="M43 79 Q50 76 58 79" stroke="var(--noite)" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
    triste: '<path d="M41 81 Q50 73 59 81" stroke="var(--noite)" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
  }[h];
  const bracos = h === 'festa'
    ? '<path d="M17 58 L4 34" stroke="var(--ouro-dk)" stroke-width="7" stroke-linecap="round"/><path d="M83 58 L96 34" stroke="var(--ouro-dk)" stroke-width="7" stroke-linecap="round"/>'
    : '<path d="M17 66 L7 80" stroke="var(--ouro-dk)" stroke-width="7" stroke-linecap="round"/><path d="M83 66 L93 80" stroke="var(--ouro-dk)" stroke-width="7" stroke-linecap="round"/>';
  const olhos = h === 'festa'
    ? '<path d="M31 56 Q38 47 45 56" stroke="var(--noite)" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M55 56 Q62 47 69 56" stroke="var(--noite)" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    : '<ellipse cx="38" cy="56" rx="7.5" ry="9.5" fill="#FFFDF7"/><ellipse cx="62" cy="56" rx="7.5" ry="9.5" fill="#FFFDF7"/><circle cx="' + (h === 'pensa' ? 41 : 39) + '" cy="' + (h === 'pensa' ? 54 : 58) + '" r="4.4" fill="var(--noite)"/><circle cx="' + (h === 'pensa' ? 65 : 63) + '" cy="' + (h === 'pensa' ? 54 : 58) + '" r="4.4" fill="var(--noite)"/>';
  return '<svg class="' + (cls || 'mani') + '" viewBox="0 0 100 124" aria-hidden="true">' +
    '<ellipse cx="50" cy="117" rx="26" ry="5" fill="var(--chao)"/>' + bracos +
    '<g transform="rotate(-8 50 64)"><ellipse cx="50" cy="64" rx="34" ry="46" fill="var(--ouro)"/>' +
    '<path d="M70 26 C86 44 88 84 66 106 C80 98 84 82 84 64 C84 46 79 34 70 26Z" fill="var(--ouro-dk)"/>' +
    '<path d="M36 22 C30 26 26 32 24 38" stroke="#FFF1C9" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
    olhos + '<circle cx="28" cy="70" r="5" fill="#EE9A76"/><circle cx="72" cy="70" r="5" fill="#EE9A76"/>' + boca + '</g></svg>';
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
ART.decoOrder = ['tenda', 'palmeira', 'nuvem', 'fogo', 'tabuas', 'vasoGrande'];

/* Faixa da unidade: dunas e grãos caindo */
ART.banner = () => '<svg class="banner-art" viewBox="0 0 120 80" aria-hidden="true">' +
  '<path d="M0 62 C22 48 40 48 62 60 C80 50 100 48 120 56 V80 H0Z" fill="#1D2D58"/><path d="M0 72 C30 62 54 64 76 72 C92 66 108 66 120 70 V80 H0Z" fill="#26386A"/>' +
  [[22, 12, -20], [48, 26, 15], [74, 8, -30], [96, 30, 10], [36, 40, -10], [86, 46, 25], [108, 14, -15]]
    .map(([x, y, r]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="2.6" ry="4" transform="rotate(' + r + ' ' + x + ' ' + y + ')" fill="#F2C14E"/>').join('') +
  '<circle cx="100" cy="0" r="0" fill="none"/></svg>';

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
  liga: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  perfil: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  livro: '<path d="M4 6c3-1.5 6-1.5 8 1 2-2.5 5-2.5 8-1v12c-3-1.5-6-1.5-8 1-2-2.5-5-2.5-8-1z"/><path d="M12 7v12"/>',
  repetir: '<path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M20 4v5h-5M4 20v-5h5"/>',
  som: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11"/>',
  raio: '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
  escudo: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
};
const icon = (n, cls) => '<svg class="' + (cls || 'ic') + '" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>';
