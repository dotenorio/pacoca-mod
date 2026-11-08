const { encode, decode } = require(process.argv[2]); const R = process.argv[3]; const S = process.argv[4];
const img = (W, H) => ({ W, H, px: Array(W * H).fill(null), set(x, y, c) { if (x >= 0 && y >= 0 && x < W && y < H) this.px[y * W + x] = c; }, get(x, y) { return this.px[y * W + x]; } });
const rect = (im, x0, y0, x1, y1, c) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) im.set(x, y, typeof c === 'function' ? c(x, y) : c); };
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const save = (im, f) => encode(f, im.W, im.H, im.px);

// ---------- Roupa do Doceiro (64x64, sobreposta ao aldeão) ----------
{
  const im = img(64, 64);
  const W = [245, 245, 240], Wd = [215, 215, 210], P = [236, 120, 160], Pd = [190, 80, 120], B = [201, 152, 96], Bd = [160, 112, 62];
  // Chapéu de cozinheiro: topo da camada "hat" (x 40..48, y 0..8) e uma faixa nos 4 lados (y 8..12)
  rect(im, 40, 0, 48, 8, (x, y) => ((x + y) % 3 === 0 ? Wd : W));
  rect(im, 32, 8, 64, 12, (x, y) => (y === 11 ? Wd : W));
  // Avental rosa na frente da jaqueta (x 6..14, y 46..61), com bolso em forma de paçoca
  rect(im, 6, 46, 14, 61, (x, y) => (x === 6 || x === 13 || y === 60 ? Pd : P));
  rect(im, 8, 52, 12, 56, (x, y) => (x === 8 || x === 11 || y === 52 || y === 55 ? Bd : B));
  // Alça do pescoço e laço nas costas/lados (linha 47)
  rect(im, 8, 44, 9, 46, Pd); rect(im, 11, 44, 12, 46, Pd);
  rect(im, 0, 47, 6, 48, Pd); rect(im, 14, 47, 28, 48, Pd);
  rect(im, 23, 48, 25, 51, Pd);
  save(im, R + '/entity/villager/profession/doceiro.png');
  save(im, R + '/entity/zombie_villager/profession/doceiro.png');
}
// ---------- Panela de Doces (16x16: topo, lado, fundo) ----------
{
  const I = [120, 124, 130], Il = [165, 170, 176], Id = [70, 72, 78], C = [236, 120, 160], Cl = [250, 170, 200], Cd = [180, 70, 110], Br = [150, 95, 50];
  const top = img(16, 16);
  rect(top, 0, 0, 16, 16, (x, y) => (x === 0 || y === 0 || x === 15 || y === 15 ? Id : (x === 1 || y === 1 || x === 14 || y === 14 ? Il : I)));
  rect(top, 2, 2, 14, 14, () => { const r = rnd(); return r < 0.15 ? Cl : r < 0.25 ? Cd : r < 0.30 ? Br : C; });
  for (const [x, y] of [[5, 5], [10, 4], [7, 9], [11, 10], [4, 11]]) { top.set(x, y, Cl); top.set(x + 1, y, [255, 220, 235]); }
  save(top, R + '/block/panela_de_doces_top.png');
  const side = img(16, 16);
  rect(side, 0, 0, 16, 16, (x, y) => (y === 0 ? Il : y === 15 ? Id : (x % 5 === 2 && y > 3 ? Il : I)));
  rect(side, 0, 1, 16, 3, (x, y) => (y === 1 ? Cl : C)); // doce transbordando na borda
  for (const x of [3, 9, 12]) { side.set(x, 3, Cd); side.set(x, 4, Cd); }
  rect(side, 0, 9, 16, 10, Id);
  for (const x of [2, 7, 13]) side.set(x, 6, Il);
  save(side, R + '/block/panela_de_doces_side.png');
  const bottom = img(16, 16);
  rect(bottom, 0, 0, 16, 16, (x, y) => (x === 0 || y === 0 || x === 15 || y === 15 ? Id : ((x * 7 + y * 3) % 11 === 0 ? I : [90, 92, 98])));
  save(bottom, R + '/block/panela_de_doces_bottom.png');
}
// ---------- Paçoca Dourada: recolore a textura da paçoca para dourado ----------
{
  const d = decode(R + '/item/pacoca.png'); const im = img(16, 16);
  d.px.forEach((c, i) => { if (c[3] > 0) { const l = (c[0] + c[1] + c[2]) / 3 / 255; im.px[i] = [Math.min(255, 90 + l * 200), Math.min(255, 60 + l * 170), Math.max(0, l * 60 - 10), 255]; } });
  save(im, R + '/item/pacoca_dourada.png');
}
// ---------- Receita da Vovó: caderno com fita rosa ----------
{
  const im = img(16, 16); const Pa = [240, 228, 200], Pl = [250, 242, 222], Pe = [150, 120, 90], Co = [140, 80, 50], Cd = [95, 52, 30], P = [236, 120, 160], Pd = [190, 80, 120];
  rect(im, 2, 1, 14, 15, (x, y) => (x === 2 || x === 13 || y === 1 || y === 14 ? Cd : Co)); // capa
  rect(im, 4, 3, 13, 13, (x, y) => (y % 2 === 0 && x > 4 && x < 12 ? Pe : (x === 12 ? Pl : Pa))); // páginas com linhas
  rect(im, 8, 1, 10, 15, (x, y) => (x === 8 ? P : Pd)); // fita
  im.set(7, 15, P); im.set(10, 15, Pd);
  save(im, R + '/item/receita_da_vovo.png');
}
