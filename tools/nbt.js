// Leitor/escritor mínimo de NBT (formato binário do Minecraft), gzip.
const zlib = require('zlib');
const T = { End:0, Byte:1, Short:2, Int:3, Long:4, Float:5, Double:6, ByteArray:7, String:8, List:9, Compound:10, IntArray:11, LongArray:12 };
function read(buf) {
  buf = zlib.gunzipSync(buf); let o = 0;
  const str = () => { const n = buf.readUInt16BE(o); o += 2; const s = buf.toString('utf8', o, o + n); o += n; return s; };
  const payload = (t) => {
    switch (t) {
      case 1: return buf.readInt8(o++);
      case 2: { const v = buf.readInt16BE(o); o += 2; return v; }
      case 3: { const v = buf.readInt32BE(o); o += 4; return v; }
      case 4: { const v = buf.readBigInt64BE(o); o += 8; return v; }
      case 5: { const v = buf.readFloatBE(o); o += 4; return v; }
      case 6: { const v = buf.readDoubleBE(o); o += 8; return v; }
      case 7: { const n = buf.readInt32BE(o); o += 4; const a = [...buf.subarray(o, o + n)]; o += n; return a; }
      case 8: return str();
      case 9: { const et = buf[o++]; const n = buf.readInt32BE(o); o += 4; const a = []; for (let i = 0; i < n; i++) a.push(payload(et)); return a; }
      case 10: { const c = {}; for (;;) { const tt = buf[o++]; if (tt === 0) break; const k = str(); c[k] = payload(tt); } return c; }
      case 11: { const n = buf.readInt32BE(o); o += 4; const a = []; for (let i = 0; i < n; i++) { a.push(buf.readInt32BE(o)); o += 4; } return a; }
      case 12: { const n = buf.readInt32BE(o); o += 4; const a = []; for (let i = 0; i < n; i++) { a.push(buf.readBigInt64BE(o)); o += 8; } return a; }
    }
  };
  const t = buf[o++]; str(); return payload(t);
}
// Escrita: valores tipados como {t:'Int', v:...}; objetos simples = Compound; arrays precisam de {t:'List', et:'Int', v:[...]}
function write(root) {
  const parts = [];
  const u8 = (n) => parts.push(Buffer.from([n]));
  const s = (x) => { const b = Buffer.from(x, 'utf8'); const l = Buffer.alloc(2); l.writeUInt16BE(b.length); parts.push(l, b); };
  const typeOf = (x) => (x && x.t) ? T[x.t] : (typeof x === 'string' ? 8 : 10);
  const val = (x) => (x && x.t) ? x.v : x;
  const payload = (t, v, x) => {
    const b = (n, f) => { const bb = Buffer.alloc(n); f(bb); parts.push(bb); };
    switch (t) {
      case 1: return b(1, bb => bb.writeInt8(v));
      case 2: return b(2, bb => bb.writeInt16BE(v));
      case 3: return b(4, bb => bb.writeInt32BE(v));
      case 4: return b(8, bb => bb.writeBigInt64BE(BigInt(v)));
      case 5: return b(4, bb => bb.writeFloatBE(v));
      case 6: return b(8, bb => bb.writeDoubleBE(v));
      case 8: return s(v);
      case 9: { const et = T[x.et]; u8(v.length ? et : 0); b(4, bb => bb.writeInt32BE(v.length)); for (const e of v) payload(et, val(e), e); return; }
      case 10: { for (const [k, e] of Object.entries(v)) { const tt = typeOf(e); u8(tt); s(k); payload(tt, val(e), e); } u8(0); return; }
      case 11: { b(4, bb => bb.writeInt32BE(v.length)); for (const e of v) b(4, bb => bb.writeInt32BE(e)); return; }
    }
  };
  u8(10); s(''); payload(10, root, root);
  return zlib.gzipSync(Buffer.concat(parts));
}
module.exports = { read, write };
if (require.main === module) {
  const fs = require('fs');
  const j = read(fs.readFileSync(process.argv[2]));
  console.log(JSON.stringify(j, (k, v) => typeof v === 'bigint' ? v.toString() + 'L' : v));
}
