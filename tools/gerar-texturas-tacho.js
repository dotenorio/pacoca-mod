// Texturas do tacho de cobre (Panela de Doces). Uso: node tools/gerar-texturas-tacho.js
const { encode } = require('./png.js');
const R = __dirname + '/../src/main/resources/assets/pacoca/textures/block/';
let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const tex = (f) => { const px = []; for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px.push(f(x, y)); return px; };
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).concat(255);

// Cobre por fora: brilho no topo, escurece embaixo, reflexo vertical e rebites
const cobreClaro = [233, 150, 95], cobre = [196, 104, 60], cobreEscuro = [125, 58, 35];
encode(R + 'tacho_cobre.png', 16, 16, tex((x, y) => {
  if (y === 0) return mix(cobreClaro, [250, 200, 150], 0.5);
  if ((x === 3 || x === 12) && y === 3) return mix(cobreEscuro, cobreEscuro, 0);
  let c = mix(cobre, cobreEscuro, y / 18);
  if (x === 4 || x === 5) c = mix(c.slice(0, 3), cobreClaro, 0.45);   // reflexo de luz
  if (rnd() < 0.08) c = mix(c.slice(0, 3), cobreEscuro, 0.3);          // marquinhas de uso
  return c;
}));
// Cobre por dentro: mais escuro e queimadinho
encode(R + 'tacho_cobre_dentro.png', 16, 16, tex((x, y) => {
  const c = mix(cobreEscuro, [80, 35, 20], rnd() * 0.5);
  return c;
}));
// Massa de paçoca borbulhando
const massa = [205, 158, 100], clara = [228, 190, 132], escura = [168, 118, 66];
encode(R + 'doce_de_amendoim.png', 16, 16, tex((x, y) => {
  const r = rnd();
  if (r < 0.12) return mix(clara, clara, 0);
  if (r < 0.22) return mix(escura, escura, 0);
  return mix(massa, clara, ((x * 3 + y * 5) % 7) / 20);
}));
console.log('ok');
