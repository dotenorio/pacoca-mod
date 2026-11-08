const zlib = require('zlib'), fs = require('fs');
function decode(file) {
  const b = fs.readFileSync(file); let o = 8, W, H, ct, idat = [], plte = null, trns = null;
  while (o < b.length) { const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { W = d.readUInt32BE(0); H = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8) throw 'bitdepth ' + d[8]; }
    else if (type === 'PLTE') plte = d; else if (type === 'tRNS') trns = d; else if (type === 'IDAT') idat.push(d);
    o += 12 + len; }
  const bpp = { 6: 4, 2: 3, 3: 1, 0: 1, 4: 2 }[ct]; const raw = zlib.inflateSync(Buffer.concat(idat)); const st = W * bpp;
  const out = Buffer.alloc(W * H * bpp); let prev = Buffer.alloc(st);
  for (let y = 0; y < H; y++) { const f = raw[y * (st + 1)], line = raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)), cur = Buffer.alloc(st);
    for (let i = 0; i < st; i++) { const a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1; else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? up : c); }
      cur[i] = v & 255; }
    cur.copy(out, y * st); prev = cur; }
  const px = []; for (let i = 0; i < W * H; i++) { let r, g, bb, al;
    if (ct === 6) [r, g, bb, al] = out.subarray(i * 4, i * 4 + 4); else if (ct === 2) { [r, g, bb] = out.subarray(i * 3, i * 3 + 3); al = 255; }
    else if (ct === 3) { const k = out[i]; r = plte[k * 3]; g = plte[k * 3 + 1]; bb = plte[k * 3 + 2]; al = trns && k < trns.length ? trns[k] : 255; }
    else if (ct === 4) { r = g = bb = out[i * 2]; al = out[i * 2 + 1]; } else { r = g = bb = out[i]; al = 255; }
    px.push([r, g, bb, al]); }
  return { W, H, px };
}
function encode(file, W, H, px) {
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = px[y * W + x] || [0, 0, 0, 0]; const o = y * (1 + W * 4) + 1 + x * 4; raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2]; raw[o + 3] = c[3] === undefined ? 255 : c[3]; }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cr]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
module.exports = { decode, encode };
