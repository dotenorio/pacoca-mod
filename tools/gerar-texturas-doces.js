// Gera as texturas 16x16 do Pé de Moleque e do Brigadeiro.
// Uso: node tools/gerar-texturas-doces.js <caminho/png.js> <pasta textures>
const { encode } = require(process.argv[2]); const R = process.argv[3];
const img = () => ({ px: Array(256).fill(null), set(x, y, c) { if (x >= 0 && y >= 0 && x < 16 && y < 16) this.px[y * 16 + x] = c; } });
let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const save = (im, f) => encode(f, 16, 16, im.px);

// ---------- Pé de Moleque: placa de caramelo escuro, torta, cheia de amendoins ----------
{
  const im = img();
  const Ca = [150, 82, 30], Cl = [190, 115, 45], Cd = [100, 50, 18], Am = [222, 180, 120], Al = [245, 215, 160], Ad = [170, 120, 70];
  // Contorno irregular: para cada linha, onde a placa começa e termina (parece um pedaço quebrado)
  const rows = { 3: [4, 11], 4: [2, 13], 5: [1, 14], 6: [1, 14], 7: [1, 15], 8: [1, 15], 9: [2, 14], 10: [2, 14], 11: [3, 13], 12: [5, 11] };
  for (const [y, [x0, x1]] of Object.entries(rows)) for (let x = x0; x <= x1; x++) {
    const borda = x === x0 || x === x1 || !rows[+y - 1] || !rows[+y + 1] || x < rows[+y - 1][0] || x > rows[+y - 1][1] || x < rows[+y + 1][0] || x > rows[+y + 1][1];
    im.set(x, +y, borda ? Cd : (rnd() < 0.2 ? Cl : Ca));
  }
  // Amendoins: 2 pixels cada (claro em cima, sombra embaixo)
  for (const [x, y] of [[4, 5], [8, 4], [11, 6], [3, 8], [7, 7], [12, 9], [5, 10], [9, 10], [10, 8]]) {
    im.set(x, y, Al); im.set(x + 1, y, Am); im.set(x, y + 1, Am); im.set(x + 1, y + 1, Ad);
  }
  save(im, R + '/item/pe_de_moleque.png');
}
// ---------- Brigadeiro: bolinha de chocolate com granulado, numa forminha rosa ----------
{
  const im = img();
  const Ch = [92, 50, 30], Cl = [130, 76, 46], Cd = [55, 28, 16], G = [40, 20, 12], Gl = [150, 95, 60];
  const P = [236, 120, 160], Pl = [250, 170, 200], Pd = [190, 80, 120];
  // Bola: círculo de raio 5 centrado em (7.5, 7)
  for (let y = 1; y < 13; y++) for (let x = 2; x < 14; x++) {
    const d = Math.hypot(x - 7.5, y - 7);
    if (d > 5.3) continue;
    const luz = Math.hypot(x - 5.5, y - 4.5) < 2 ? Cl : null; // brilho no canto de cima
    im.set(x, y, d > 4.5 ? Cd : (luz || Ch));
  }
  // Granulado espalhado (pontinhos escuros e alguns claros)
  for (let i = 0; i < 14; i++) {
    const x = 3 + Math.floor(rnd() * 10), y = 2 + Math.floor(rnd() * 9);
    if (Math.hypot(x - 7.5, y - 7) < 4.5) im.set(x, y, i % 4 === 0 ? Gl : G);
  }
  // Forminha de papel (y 10..14), com pregas alternando claro/escuro e mais larga em cima
  for (let y = 10; y <= 14; y++) {
    const m = y === 10 ? 1 : y >= 13 ? 3 : 2;
    for (let x = m; x <= 15 - m; x++) im.set(x, y, y === 14 ? Pd : (x % 2 ? P : Pl));
  }
  save(im, R + '/item/brigadeiro.png');
}
console.log('ok');
