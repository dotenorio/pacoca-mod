// Gera a estrutura da Doceria (9 x 6 x 9) no formato .nbt de template do Minecraft 26.3.
const { write, read } = require(process.argv[2]); const fs = require('fs');
const SX = 9, SY = 6, SZ = 9;
const grid = new Map(); const key = (x, y, z) => `${x},${y},${z}`;
const B = (id, properties) => ({ id: 'minecraft:' + id, properties });
const set = (x, y, z, st, nbt) => grid.set(key(x, y, z), { st, nbt });

// 1) Tudo começa como ar (limpa o terreno dentro da caixa)
for (let x = 0; x < SX; x++) for (let y = 0; y < SY; y++) for (let z = 0; z < SZ; z++) set(x, y, z, B('air'));
// 2) Chão (y=0): coluna x=0 é a "calçada" com o jigsaw; casa ocupa x=1..8
for (let z = 0; z < SZ; z++) set(0, 0, z, B('grass_block', { snowy: 'false' }));
for (let x = 1; x < SX; x++) for (let z = 0; z < SZ; z++) {
  const edge = x === 1 || x === 8 || z === 0 || z === 8;
  set(x, 0, z, edge ? B('stone_bricks') : ((x + z) % 2 ? B('cherry_planks') : B('birch_planks')));
}
// Jigsaw na entrada: é ele que "encaixa" a casa na rua da vila
set(0, 0, 4, B('jigsaw', { orientation: 'west_up' }), {
  id: 'minecraft:jigsaw', joint: 'aligned', name: 'minecraft:building_entrance', target: 'minecraft:building_entrance',
  pool: 'minecraft:village/plains/streets',
  final_state: 'minecraft:oak_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]',
});
// 3) Paredes (y=1..3): troncos de cerejeira nos cantos, terracota branca, vitrais rosa
for (let x = 1; x < SX; x++) for (let z = 0; z < SZ; z++) for (let y = 1; y <= 3; y++) {
  const ex = x === 1 || x === 8, ez = z === 0 || z === 8;
  if (!ex && !ez) continue;
  if (ex && ez) { set(x, y, z, B('stripped_cherry_log', { axis: 'y' })); continue; }
  const window = y === 2 && ((ez && (x === 3 || x === 6)) || (ex && (z === 2 || z === 6)));
  set(x, y, z, window ? B('pink_stained_glass') : B('white_terracotta'));
}
// Porta de entrada (parede oeste, x=1)
const door = (half) => B('oak_door', { facing: 'east', half, hinge: 'left', open: 'false', powered: 'false' });
set(1, 1, 4, door('lower')); set(1, 2, 4, door('upper'));
// 4) Telhado: tábuas de cerejeira + lajes por cima
for (let x = 1; x < SX; x++) for (let z = 0; z < SZ; z++) set(x, 4, z, B('cherry_planks'));
for (let x = 2; x < SX - 1; x++) for (let z = 1; z < SZ - 1; z++) set(x, 5, z, B('cherry_slab', { type: 'bottom', waterlogged: 'false' }));
// 5) Móveis
set(7, 1, 2, { id: 'pacoca:panela_de_doces' });                       // a Panela de Doces
set(2, 1, 1, B('chest', { facing: 'south', type: 'single', waterlogged: 'false' }), { id: 'minecraft:chest', LootTable: 'pacoca:chests/doceria' });
set(3, 1, 1, B('crafting_table'));
set(4, 1, 1, { id: 'pacoca:pacoca_block' }); set(5, 1, 1, { id: 'pacoca:pacoca_block' }); // balcão de paçoca
set(7, 1, 1, B('barrel', { facing: 'up', open: 'false' }), { id: 'minecraft:barrel', Items: { t: 'List', et: 'Compound', v: [] } });
set(2, 1, 7, B('potted_poppy'));
set(4, 3, 4, B('lantern', { hanging: 'true', waterlogged: 'false' }));
// 6) A cela da Dona Benedita (canto x=7,z=7): grades de ferro + porta de ferro com alavanca na parede.
// As grades "grudam" nos vizinhos: a propriedade de cada lado diz se aquele braço da barra aparece.
// (O /place não recalcula vizinhos, então cada braço tem que bater com o que está do lado.)
const bars = (sides) => B('iron_bars', { north: 'false', south: 'false', east: 'false', west: 'false', waterlogged: 'false', ...sides });
const log = B('stripped_cherry_log', { axis: 'y' });
// Canto da cela (6,y,6): pilar de cerejeira com um VÃO na altura dos olhos (y=2), por onde dá para
// arremessar a poção e dar a maçã dourada antes de abrir a porta. Em cima (y=3), grade.
set(6, 1, 6, log);
set(6, 2, 6, B('air'));
set(6, 3, 6, bars({ east: 'true', south: 'true' }));
// Grade entre o pilar e a parede x=8: só liga para oeste onde tem bloco (y=1 e y=3), não no vão.
for (let y = 1; y <= 3; y++) set(7, y, 6, bars({ east: 'true', west: y === 2 ? 'false' : 'true' }));
set(6, 3, 7, log);                                                            // verga em cima da porta
const iron = (half) => B('iron_door', { facing: 'east', half, hinge: 'right', open: 'false', powered: 'false' });
set(6, 1, 7, iron('lower')); set(6, 2, 7, iron('upper'));
// Alavanca na parede do fundo (z=8), ao lado da metade de cima da porta: facing=north = aponta para
// o norte, presa no bloco ao sul dela. Encostada na porta, ela a energiza direto.
set(5, 2, 7, B('lever', { face: 'wall', facing: 'north', powered: 'false' }));

// ---- Monta o NBT: paleta (estados únicos) + lista de blocos ----
const palette = [], palIdx = new Map(), blocks = [];
const stKey = (st) => JSON.stringify(st);
for (const [k, { st, nbt }] of grid) {
  const sk = stKey(st);
  if (!palIdx.has(sk)) { palIdx.set(sk, palette.length); palette.push(st.properties ? { id: st.id, properties: st.properties } : { id: st.id }); }
  const [x, y, z] = k.split(',').map(Number);
  const b = { pos: { t: 'List', et: 'Int', v: [x, y, z].map(v => ({ t: 'Int', v })) }, state: { t: 'Int', v: palIdx.get(sk) } };
  if (nbt) b.nbt = nbt;
  blocks.push(b);
}
// A zumbi: Dona Benedita, Doceira amaldiçoada. Persistente, não quebra portas, já "nasce" Doceiro com 1 de XP
// (com XP > 0 ele nunca perde a profissão depois de curado).
const zombie = {
  pos: { t: 'List', et: 'Double', v: [7.5, 1, 7.5].map(v => ({ t: 'Double', v })) },
  blockPos: { t: 'List', et: 'Int', v: [7, 1, 7].map(v => ({ t: 'Int', v })) },
  nbt: {
    id: 'minecraft:zombie_villager',
    CustomName: 'Dona Benedita',
    PersistenceRequired: { t: 'Byte', v: 1 },
    CanBreakDoors: { t: 'Byte', v: 0 },
    CanPickUpLoot: { t: 'Byte', v: 0 },
    ConversionTime: { t: 'Int', v: -1 },
    Xp: { t: 'Int', v: 1 },
    Rotation: { t: 'List', et: 'Float', v: [{ t: 'Float', v: 90 }, { t: 'Float', v: 0 }] },
    VillagerData: { profession: 'pacoca:doceiro', level: { t: 'Int', v: 1 }, type: 'minecraft:plains' },
  },
};
const root = {
  size: { t: 'List', et: 'Int', v: [SX, SY, SZ].map(v => ({ t: 'Int', v })) },
  palette: { t: 'List', et: 'Compound', v: palette },
  blocks: { t: 'List', et: 'Compound', v: blocks },
  entities: { t: 'List', et: 'Compound', v: [zombie] },
  DataVersion: { t: 'Int', v: 5023 },
};
fs.writeFileSync(process.argv[3], write(root));
const back = read(fs.readFileSync(process.argv[3]));
console.log('ok', back.size, 'palette', back.palette.length, 'blocks', back.blocks.length, 'entities', back.entities.length, back.entities[0].nbt.VillagerData);
