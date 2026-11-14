/* Manna: catálogo aberto de metas (planos, 66 livros, personagens, épocas, temas), referências bíblicas e hinários. */

const LIVROS = [["Gênesis",50],["Êxodo",40],["Levítico",27],["Números",36],["Deuteronômio",34],["Josué",24],["Juízes",21],["Rute",4],["1 Samuel",31],["2 Samuel",24],["1 Reis",22],["2 Reis",25],["1 Crônicas",29],["2 Crônicas",36],["Esdras",10],["Neemias",13],["Ester",10],["Jó",42],["Salmos",150],["Provérbios",31],["Eclesiastes",12],["Cantares",8],["Isaías",66],["Jeremias",52],["Lamentações",5],["Ezequiel",48],["Daniel",12],["Oseias",14],["Joel",3],["Amós",9],["Obadias",1],["Jonas",4],["Miqueias",7],["Naum",3],["Habacuque",3],["Sofonias",3],["Ageu",2],["Zacarias",14],["Malaquias",4],["Mateus",28],["Marcos",16],["Lucas",24],["João",21],["Atos",28],["Romanos",16],["1 Coríntios",16],["2 Coríntios",13],["Gálatas",6],["Efésios",6],["Filipenses",4],["Colossenses",4],["1 Tessalonicenses",5],["2 Tessalonicenses",3],["1 Timóteo",6],["2 Timóteo",4],["Tito",3],["Filemom",1],["Hebreus",13],["Tiago",5],["1 Pedro",5],["2 Pedro",3],["1 João",5],["2 João",1],["3 João",1],["Judas",1],["Apocalipse",22]];
const NT = 39;
const LIVRO_DESC = { 'Gênesis': 'Criação, queda, dilúvio e os patriarcas.', 'Êxodo': 'Libertação do Egito, o maná e o Sinai.', 'Salmos': 'Orações e cânticos do povo de Deus.', 'Isaías': 'O profeta do Messias e da consolação.', 'Mateus': 'Jesus, o Rei prometido.', 'Marcos': 'O evangelho mais curto e direto.', 'Lucas': 'Jesus, o Salvador de todos.', 'Atos': 'O Espírito Santo e a igreja primitiva.', 'Apocalipse': 'A revelação de Jesus e a esperança final.', 'Daniel': 'Fidelidade no exílio e profecia.', 'Efésios': 'A igreja, a graça e a armadura de Deus.', 'Hebreus': 'Jesus, superior a tudo.', 'Jó': 'O sofrimento e a soberania de Deus.', 'Eclesiastes': 'O sentido da vida debaixo do sol.' };
const CURADOS = { 'Romanos': 'romanos', 'João': 'joao', 'Provérbios': 'proverbios', 'Tiago': 'tiago' };

/* Leitura de referências: "João 3", "Mateus 6:5-15", "2 Samuel 11-12", "Gênesis 50; Êxodo 1-2" */
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const ALIAS = { 'salmo': 'Salmos', 'sl': 'Salmos', 'cantico dos canticos': 'Cantares', 'canticos': 'Cantares', 'apocalipse de joao': 'Apocalipse', 'atos dos apostolos': 'Atos', 'jo': 'Jó', 'mt': 'Mateus', 'mc': 'Marcos', 'lc': 'Lucas', 'jo.': 'João', 'rm': 'Romanos', 'gn': 'Gênesis', 'ex': 'Êxodo', 'sabedoria': null };
const BOOK_IX = {};
LIVROS.forEach(([n], i) => { BOOK_IX[norm(n)] = i; });
Object.entries(ALIAS).forEach(([k, v]) => { if (v) BOOK_IX[k] = LIVROS.findIndex(l => l[0] === v); });
function parseRef(ref) {
  const out = [];
  let lastBook = null;
  String(ref || '').split(/;/).forEach(part => {
    part = part.trim(); if (!part) return;
    const m = part.match(/^((?:[123]\s*)?[A-Za-zÀ-ÿ.\s]+?)\s*(\d+)(?:\s*[:.]\s*(\d+)(?:\s*-\s*(\d+))?)?(?:\s*-\s*(\d+))?\s*$/);
    let b, c, v1, v2, c2;
    if (m) {
      b = bookIndex(m[1]); if (b == null) return;
      c = +m[2]; v1 = m[3] ? +m[3] : null; v2 = m[4] ? +m[4] : v1; c2 = m[5] ? +m[5] : null;
      lastBook = b;
    } else if (lastBook != null && /^\d+(:\d+(-\d+)?)?$/.test(part)) {
      const [cc, vv] = part.split(':'); b = lastBook; c = +cc;
      if (vv) { const [a, z] = vv.split('-'); v1 = +a; v2 = z ? +z : +a; }
    } else return;
    if (c < 1 || c > LIVROS[b][1]) return;
    if (c2 && !v1) { for (let x = c; x <= Math.min(c2, LIVROS[b][1]); x++) out.push({ b, c: x }); }
    else out.push({ b, c, v1, v2 });
  });
  return out;
}
function bookIndex(raw) {
  const trimmed = String(raw || '').trim().replace(/\s+/g, ' ');
  const tidy = s => norm(s).replace(/^([123])\s*/, '$1 ');
  const withDots = tidy(trimmed);
  const noDots = tidy(trimmed.replace(/\./g, ''));
  if (BOOK_IX[withDots] != null) return BOOK_IX[withDots];
  if (BOOK_IX[noDots] != null) return BOOK_IX[noDots];
  return null;
}
const refLabel = s => LIVROS[s.b][0] + ' ' + s.c + (s.v1 ? ':' + s.v1 + (s.v2 && s.v2 !== s.v1 ? '-' + s.v2 : '') : '');
function findRefs(text) {
  const names = LIVROS.map(l => l[0]).concat(['Salmo']).sort((a, b) => b.length - a.length).map(n => n.replace(/ /g, '\\s*'));
  const re = new RegExp('(' + names.join('|') + ')\\s+\\d+(?:[:.]\\d+(?:-\\d+)?)?', 'gi');
  const found = (String(text || '').match(re) || []).map(s => s.replace('.', ':'));
  return [...new Set(found)].filter(r => parseRef(r).length);
}

/* Bíblia Livre: carregada sob demanda (arquivo blivre.js publicado junto) */
let BIBLIA = window.BLIVRE || null, bibliaP = null;
function loadBiblia() {
  if (BIBLIA) return Promise.resolve(BIBLIA);
  if (!bibliaP) bibliaP = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = 'blivre.js'; s.async = true;
    s.onload = () => {
      BIBLIA = window.BLIVRE || null;
      if (BIBLIA) ok(BIBLIA);
      else { bibliaP = null; s.remove(); no(new Error('vazio')); }
    };
    s.onerror = () => { s.remove(); bibliaP = null; no(new Error('falhou')); };
    document.head.appendChild(s);
  });
  return bibliaP;
}
function versesOf(ref) {
  if (!BIBLIA) return [];
  const out = [];
  parseRef(ref).forEach(s => {
    const cap = BIBLIA.livros[s.b].c[s.c - 1] || [];
    const a = s.v1 || 1, z = s.v2 || cap.length;
    for (let v = a; v <= Math.min(z, cap.length); v++) if (cap[v - 1]) out.push({ b: s.b, c: s.c, v, t: cap[v - 1] });
  });
  return out;
}

/* Planos de leitura */
const ALLCH = LIVROS.flatMap(([n, k], b) => Array.from({ length: k }, (_, i) => ({ b, c: i + 1 })));
function chunkRef(chs) {
  const parts = []; let cur = null;
  chs.forEach(x => { if (cur && cur.b === x.b && cur.z === x.c - 1) cur.z = x.c; else { cur = { b: x.b, a: x.c, z: x.c }; parts.push(cur); } });
  return parts.map(p => LIVROS[p.b][0] + ' ' + p.a + (p.z > p.a ? '-' + p.z : '')).join('; ');
}
function planLessons(chs, days, label) {
  return Array.from({ length: days }, (_, d) => {
    const part = chs.slice(Math.floor(d * chs.length / days), Math.floor((d + 1) * chs.length / days));
    const ref = chunkRef(part);
    return { ref, titulo: label + ' ' + (d + 1) + ': ' + ref, caps: part.length, plano: true };
  });
}
const PLANOS = [
  { id: 'plano:biblia1ano', nome: 'Bíblia em 1 ano', desc: 'Os 1.189 capítulos em 365 leituras, de Gênesis a Apocalipse.', unit: 7, gen: () => planLessons(ALLCH, 365, 'Dia') },
  { id: 'plano:nt90', nome: 'Novo Testamento em 90 dias', desc: 'De Mateus a Apocalipse, cerca de 3 capítulos por dia.', unit: 7, gen: () => planLessons(ALLCH.filter(x => x.b >= NT), 90, 'Dia') },
  { id: 'plano:evangelhos', nome: 'Evangelhos em 30 dias', desc: 'Mateus, Marcos, Lucas e João em um mês.', unit: 7, gen: () => planLessons(ALLCH.filter(x => x.b >= NT && x.b <= NT + 3), 30, 'Dia') },
  { id: 'plano:at1ano', nome: 'Antigo Testamento em 1 ano', desc: 'De Gênesis a Malaquias, cerca de 3 capítulos por dia.', unit: 7, gen: () => planLessons(ALLCH.filter(x => x.b < NT), 365, 'Dia') },
  { id: 'plano:salmos', nome: 'Salmos e Provérbios em 60 dias', desc: 'Oração e sabedoria, 3 capítulos por dia.', unit: 7, gen: () => planLessons(ALLCH.filter(x => x.b === 18 || x.b === 19), 60, 'Dia') },
];

/* Personagens e épocas: só títulos e referências; o texto vem da Bíblia Livre */
const P = (ref, titulo, caps) => ({ ref, titulo, caps: caps || 1 });
const PERSONAGENS = [
  { id: 'per:abraao', nome: 'Abraão', desc: 'O pai da fé, chamado a sair da sua terra.', licoes: [P('Gênesis 12', 'O chamado de Abrão'), P('Gênesis 15', 'A aliança sob as estrelas'), P('Gênesis 18', 'Visitantes em Manre'), P('Gênesis 21', 'O nascimento de Isaque'), P('Gênesis 22', 'O monte Moriá'), P('Hebreus 11:8-19', 'A fé de Abraão')] },
  { id: 'per:moises', nome: 'Moisés', desc: 'O libertador que conduziu o povo pelo deserto.', licoes: [P('Êxodo 2', 'Salvo das águas'), P('Êxodo 3', 'A sarça ardente'), P('Êxodo 12', 'A Páscoa'), P('Êxodo 14', 'O mar se abre'), P('Êxodo 16', 'O maná do céu'), P('Êxodo 20', 'Os dez mandamentos'), P('Números 20', 'A água da rocha'), P('Deuteronômio 34', 'A morte de Moisés')] },
  { id: 'per:josue', nome: 'Josué', desc: 'Coragem para entrar na terra prometida.', licoes: [P('Josué 1', 'Sê forte e corajoso'), P('Josué 2', 'Raabe e os espias'), P('Josué 3', 'A travessia do Jordão'), P('Josué 6', 'Os muros de Jericó'), P('Josué 24', 'Eu e a minha casa')] },
  { id: 'per:gideao', nome: 'Gideão', desc: 'O mais fraco, escolhido para libertar Israel.', licoes: [P('Juízes 6', 'O chamado no lagar'), P('Juízes 7', 'Os trezentos'), P('Juízes 8', 'Depois da vitória')] },
  { id: 'per:samuel', nome: 'Samuel', desc: 'O menino que ouviu a voz de Deus.', licoes: [P('1 Samuel 1', 'A oração de Ana'), P('1 Samuel 3', 'Fala, Senhor'), P('1 Samuel 8', 'O povo pede um rei'), P('1 Samuel 12', 'A despedida de Samuel'), P('1 Samuel 16', 'Samuel unge Davi')] },
  { id: 'per:elias', nome: 'Elias', desc: 'O profeta do fogo e do cicio tranquilo.', licoes: [P('1 Reis 17', 'Os corvos e a viúva'), P('1 Reis 18', 'Fogo no Carmelo'), P('1 Reis 19', 'O cicio tranquilo'), P('1 Reis 21', 'A vinha de Nabote'), P('2 Reis 2', 'O carro de fogo')] },
  { id: 'per:ester', nome: 'Ester', desc: 'Coragem para um momento como este.', licoes: [P('Ester 2', 'Ester rainha'), P('Ester 3', 'O plano de Hamã'), P('Ester 4', 'Para um momento como este'), P('Ester 5', 'Diante do rei'), P('Ester 7', 'A virada'), P('Ester 9', 'A festa de Purim')] },
  { id: 'per:daniel', nome: 'Daniel', desc: 'Fiel a Deus na corte da Babilônia.', licoes: [P('Daniel 1', 'Fiel na mesa do rei'), P('Daniel 2', 'O sonho da estátua'), P('Daniel 3', 'A fornalha'), P('Daniel 5', 'A escrita na parede'), P('Daniel 6', 'A cova dos leões'), P('Daniel 9', 'A oração de Daniel')] },
  { id: 'per:neemias', nome: 'Neemias', desc: 'Oração e trabalho para reconstruir os muros.', licoes: [P('Neemias 1', 'A oração por Jerusalém'), P('Neemias 2', 'Diante do rei'), P('Neemias 4', 'Construindo e vigiando'), P('Neemias 6', 'O muro concluído'), P('Neemias 8', 'A leitura da Lei')] },
  { id: 'per:maria', nome: 'Maria, mãe de Jesus', desc: 'A serva do Senhor, do anúncio à igreja.', licoes: [P('Lucas 1:26-56', 'O anúncio do anjo'), P('Lucas 2', 'O nascimento de Jesus'), P('João 2', 'Fazei tudo o que ele disser'), P('João 19:25-27', 'Ao pé da cruz'), P('Atos 1:12-14', 'Em oração com os discípulos')] },
];
const EPOCAS = [
  { id: 'ep:origens', nome: 'Criação e patriarcas', desc: 'De Gênesis 1 até José no Egito.', licoes: [P('Gênesis 1', 'A criação'), P('Gênesis 3', 'A queda'), P('Gênesis 6-7', 'O dilúvio', 2), P('Gênesis 11', 'A torre de Babel'), P('Gênesis 12', 'O chamado de Abraão'), P('Gênesis 28', 'A escada de Jacó'), P('Gênesis 50', 'José e seus irmãos')] },
  { id: 'ep:exodo', nome: 'Êxodo e deserto', desc: 'Da escravidão no Egito às portas de Canaã.', licoes: [P('Êxodo 1', 'Escravos no Egito'), P('Êxodo 12', 'A Páscoa'), P('Êxodo 14', 'A travessia do mar'), P('Êxodo 16', 'O maná'), P('Êxodo 19', 'No monte Sinai'), P('Êxodo 32', 'O bezerro de ouro'), P('Números 13-14', 'Os espias e a incredulidade', 2), P('Deuteronômio 6', 'Ouve, Israel')] },
  { id: 'ep:juizes', nome: 'Conquista e juízes', desc: 'A entrada em Canaã e o ciclo dos juízes.', licoes: [P('Josué 1', 'Sê forte e corajoso'), P('Josué 6', 'Jericó'), P('Josué 24', 'A escolha de servir'), P('Juízes 2', 'O ciclo dos juízes'), P('Juízes 4', 'Débora e Baraque'), P('Juízes 7', 'Gideão'), P('Juízes 16', 'Sansão'), P('Rute 1', 'Rute e Noemi')] },
  { id: 'ep:reino', nome: 'Reino unido', desc: 'Saul, Davi e Salomão.', licoes: [P('1 Samuel 8', 'O povo pede um rei'), P('1 Samuel 16', 'Davi ungido'), P('1 Samuel 17', 'Davi e Golias'), P('2 Samuel 7', 'A aliança com Davi'), P('1 Reis 3', 'A sabedoria de Salomão'), P('1 Reis 8', 'A dedicação do templo')] },
  { id: 'ep:profetas', nome: 'Reino dividido e profetas', desc: 'Reis, profetas e a queda de Jerusalém.', licoes: [P('1 Reis 12', 'O reino se divide'), P('1 Reis 18', 'Elias no Carmelo'), P('2 Reis 17', 'A queda de Samaria'), P('Isaías 6', 'O chamado de Isaías'), P('Jeremias 1', 'O chamado de Jeremias'), P('2 Reis 22', 'Josias e o livro da Lei'), P('2 Reis 25', 'A queda de Jerusalém')] },
  { id: 'ep:exilio', nome: 'Exílio e retorno', desc: 'Babilônia, Pérsia e a volta para Jerusalém.', licoes: [P('Salmos 137', 'Junto aos rios da Babilônia'), P('Daniel 1', 'Fiéis no exílio'), P('Ezequiel 37', 'O vale de ossos secos'), P('Esdras 1', 'O decreto de Ciro'), P('Esdras 3', 'O altar reconstruído'), P('Neemias 8', 'A leitura da Lei'), P('Ester 4', 'Para um momento como este'), P('Malaquias 3', 'O mensageiro')] },
  { id: 'ep:jesus', nome: 'Vida de Jesus', desc: 'Do nascimento à ressurreição.', licoes: [P('Lucas 2', 'O nascimento'), P('Mateus 3', 'O batismo'), P('Mateus 4', 'A tentação'), P('Mateus 5', 'O Sermão do Monte'), P('João 11', 'Lázaro'), P('Mateus 26', 'A última ceia'), P('João 19', 'A cruz'), P('Lucas 24', 'O Ressuscitado')] },
  { id: 'ep:igreja', nome: 'Igreja primitiva', desc: 'O Espírito Santo e o evangelho até Roma.', licoes: [P('Atos 1', 'A ascensão'), P('Atos 2', 'Pentecostes'), P('Atos 4', 'Ousadia'), P('Atos 7', 'Estêvão'), P('Atos 9', 'A conversão de Saulo'), P('Atos 10', 'Pedro e Cornélio'), P('Atos 15', 'O concílio de Jerusalém'), P('Atos 28', 'Paulo em Roma')] },
];

/* Catálogo unificado */
const TIPOS = ['Plano', 'Livro', 'Personagem', 'Época', 'Tema'];
const GEN_CACHE = {};
function trilhaGen(id) {
  if (GEN_CACHE[id]) return GEN_CACHE[id];
  let t = null;
  const pl = PLANOS.find(p => p.id === id);
  if (pl) t = { id, tipo: 'Plano', nome: pl.nome, desc: pl.desc, unit: pl.unit, licoes: pl.gen() };
  else if (id.startsWith('livro:')) {
    const b = Number(id.slice(6)), [n, k] = LIVROS[b] || [];
    if (n) t = { id, tipo: 'Livro', nome: n, desc: LIVRO_DESC[n] || plural(k, 'capítulo', 'capítulos') + ', um por lição.', licoes: Array.from({ length: k }, (_, i) => ({ ref: n + ' ' + (i + 1), titulo: n + ' ' + (i + 1), caps: 1 })) };
  } else {
    const x = PERSONAGENS.find(p => p.id === id) || EPOCAS.find(p => p.id === id);
    if (x) t = Object.assign({ tipo: id.startsWith('per:') ? 'Personagem' : 'Época' }, x);
  }
  if (t) GEN_CACHE[id] = t;
  return t;
}
function catalogo() {
  const livros = LIVROS.map(([n], b) => CURADOS[n] ? TRILHAS.find(t => t.id === CURADOS[n]) : trilhaGen('livro:' + b));
  return [].concat(PLANOS.map(p => trilhaGen(p.id)), livros, TRILHAS.filter(t => t.tipo === 'Personagem'), PERSONAGENS.map(p => trilhaGen(p.id)), EPOCAS.map(p => trilhaGen(p.id)), TRILHAS.filter(t => t.tipo === 'Tema'));
}
const tipoDe = t => t.tipo === 'Livro' && (t.id.startsWith('livro:') || TRILHAS.includes(t)) ? 'Livro' : t.tipo;

/* Sugestões a partir do objetivo, sem IA */
const OBJ_OPCOES = [
  { id: 'biblia', t: 'Ler a Bíblia toda', d: 'De Gênesis a Apocalipse, em um ano', ids: ['plano:biblia1ano'] },
  { id: 'nt', t: 'Ler o Novo Testamento', d: 'A vida de Jesus e da igreja em 90 dias', ids: ['plano:nt90', 'plano:evangelhos'] },
  { id: 'at', t: 'Ler o Antigo Testamento', d: 'A história do povo de Deus e os profetas', ids: ['plano:at1ano'] },
  { id: 'personagem', t: 'Conhecer a vida de um personagem', d: 'Davi, Moisés, Daniel, Ester, Paulo e outros', ids: ['davi', 'per:moises', 'per:daniel', 'per:ester', 'paulo'] },
  { id: 'livro', t: 'Estudar um livro a fundo', d: 'Capítulo por capítulo, com exercícios', ids: ['romanos', 'joao', 'livro:0', 'salmos'] },
  { id: 'epoca', t: 'Entender uma época da história bíblica', d: 'Da criação à igreja primitiva', ids: ['ep:origens', 'ep:exodo', 'ep:reino', 'ep:jesus'] },
  { id: 'tema', t: 'Aprender sobre um tema', d: 'Oração, família, finanças, ansiedade', ids: ['oracao', 'familia', 'ansiedade', 'financas'] },
  { id: 'habito', t: 'Criar o hábito de ler todo dia', d: 'Leituras curtas para não parar', ids: ['salmos', 'proverbios', 'plano:salmos'] },
  { id: 'escola', t: 'Me preparar para a EBD ou Escola Sabatina', d: 'Contexto e perguntas antes da aula', ids: ['ep:jesus', 'romanos'] },
  { id: 'pregacao', t: 'Aprofundar as pregações do culto', d: 'Transformar cada pregação em estudo', ids: [] },
];
const objTexto = () => OBJ_OPCOES.filter(o => (S.objSel || []).includes(o.id)).map(o => o.t).concat(S.objetivo ? [S.objetivo] : []).join('. ');
function sugerirLocal(texto, sel) {
  const t = norm(texto || ''), out = [];
  const add = id => { if (!out.includes(id) && trilha(id)) out.push(id); };
  (sel || []).forEach(x => { const o = OBJ_OPCOES.find(y => y.id === x); if (o && o.ids[0]) add(o.ids[0]); });
  if (/(biblia|palavra).*(toda|inteira|completa)|(toda|inteira).*biblia|1 ano|um ano|365/.test(t)) add('plano:biblia1ano');
  if (/novo testamento/.test(t)) add('plano:nt90');
  if (/antigo testamento|velho testamento/.test(t)) add('plano:at1ano');
  if (/evangelho/.test(t)) { add('plano:evangelhos'); add('joao'); }
  LIVROS.forEach(([n], b) => { if (new RegExp('\\b' + norm(n) + '\\b').test(t) && n !== 'Jó') add(CURADOS[n] || 'livro:' + b); });
  [...TRILHAS.filter(x => x.tipo === 'Personagem'), ...PERSONAGENS].forEach(p => { if (t.includes(norm(p.nome.split(',')[0]).split(' ')[0])) add(p.id); });
  const ep = { 'ep:origens': /criacao|patriarca|genesis|diluvio/, 'ep:exodo': /exodo|deserto|egito|mana|sinai/, 'ep:juizes': /juizes|conquista|canaa/, 'ep:reino': /reis|reino|rei davi|salomao|monarquia/, 'ep:profetas': /profeta/, 'ep:exilio': /exilio|babilonia|retorno/, 'ep:jesus': /vida de jesus|jesus/, 'ep:igreja': /igreja primitiva|apostolo|atos|pentecostes/ };
  Object.entries(ep).forEach(([id, re]) => { if (re.test(t)) add(id); });
  const tm = { oracao: /orac|orar/, familia: /famil|casamento|filhos|marido|esposa/, financas: /financ|dinheiro|divida|dizimo/, ansiedade: /ansied|medo|paz|depress|preocup/ };
  Object.entries(tm).forEach(([id, re]) => { if (re.test(t)) add(id); });
  if (/personage/.test(t)) ['davi', 'per:moises', 'per:daniel', 'paulo'].forEach(add);
  if (/livro/.test(t)) ['romanos', 'joao', 'livro:0', 'salmos'].forEach(add);
  if (/epoca|historia|periodo|cronolog/.test(t)) ['ep:origens', 'ep:exodo', 'ep:reino', 'ep:jesus'].forEach(add);
  if (/tema|vida crista|assunto/.test(t)) ['oracao', 'familia', 'ansiedade', 'financas'].forEach(add);
  if (/todo dia|habito|voltar|parei|constancia/.test(t)) ['salmos', 'proverbios', 'plano:evangelhos'].forEach(add);
  if (/ebd|escola sabatina|escola dominical|aula|professor/.test(t)) ['romanos', 'ep:jesus'].forEach(add);
  (sel || []).forEach(k => { const o = OBJ_OPCOES.find(x => x.id === k); if (o) o.ids.slice(0, 2).forEach(add); });
  (sel || []).forEach(k => { const o = OBJ_OPCOES.find(x => x.id === k); if (o) o.ids.slice(2).forEach(add); });
  if (out.length < 3) ['plano:biblia1ano', 'joao', 'oracao', 'per:moises'].forEach(add);
  return out.slice(0, 10);
}

/* Hinários (o Manna não reproduz letras protegidas por direitos autorais) */
const HINARIOS = [
  { id: 'hasd', nome: 'Hinário Adventista do Sétimo Dia', trad: 'adventista' },
  { id: 'harpa', nome: 'Harpa Cristã', denom: 'Assembleia de Deus' },
  { id: 'cantor', nome: 'Cantor Cristão', trad: 'batista' },
  { id: 'novocantico', nome: 'Hinário Novo Cântico', trad: 'reformada' },
  { id: 'ccb', nome: 'Hinos de Louvores e Súplicas a Deus', denom: 'Congregação Cristã no Brasil' },
  { id: 'salmoshinos', nome: 'Salmos e Hinos' },
  { id: 'outro', nome: 'Outro hinário' },
];
const hinarioPadrao = () => (HINARIOS.find(h => h.denom === S.quiz.denom) || HINARIOS.find(h => h.trad && h.trad === S.quiz.tradicao) || HINARIOS[1]).id;
