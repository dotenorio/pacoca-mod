// Modelo 3D da Panela de Doces (tacho de cobre). Coordenadas em "pixels": 0..16 = um bloco.
// Uso: node tools/gerar-modelo-tacho.js
const fs = require('fs');
const all = (tex, extra = {}) => Object.fromEntries(['north', 'south', 'east', 'west', 'up', 'down'].map(f => [f, { texture: extra[f] || tex }]));
const el = (from, to, faces, rotation) => (rotation ? { from, to, rotation, faces } : { from, to, faces });
const elements = [
  // Pés de ferro
  ...[[2, 2], [12, 2], [2, 12], [12, 12]].map(([x, z]) => el([x, 0, z], [x + 2, 3, z + 2], all('#ferro'))),
  // Fundo do tacho
  el([1, 3, 1], [15, 4, 15], all('#cobre', { up: '#dentro' })),
  // Paredes (de fora: cobre; de dentro: cobre escuro)
  el([1, 4, 1], [3, 11, 15], all('#cobre', { east: '#dentro' })),   // oeste
  el([13, 4, 1], [15, 11, 15], all('#cobre', { west: '#dentro' })), // leste
  el([3, 4, 1], [13, 11, 3], all('#cobre', { south: '#dentro' })),  // norte
  el([3, 4, 13], [13, 11, 15], all('#cobre', { north: '#dentro' })), // sul
  // O doce lá dentro (só a face de cima aparece)
  el([3, 4, 3], [13, 9, 13], { up: { texture: '#doce' } }),
  // Alças nas laterais
  el([-1, 8, 6], [1, 9, 10], all('#cobre')),
  el([15, 8, 6], [17, 9, 10], all('#cobre')),
  // Colher de pau inclinada 22,5° (cabo + concha enterrada no doce)
  el([8, 8, 9], [9, 18, 10], all('#colher'), { angle: 22.5, axis: 'z', origin: [8, 8, 9.5] }),
  el([7, 7, 8], [10, 9, 11], all('#colher'), { angle: 22.5, axis: 'z', origin: [8, 8, 9.5] }),
];
const model = {
  parent: 'minecraft:block/block',
  ambientocclusion: false,
  textures: {
    particle: 'pacoca:block/tacho_cobre',
    cobre: 'pacoca:block/tacho_cobre',
    dentro: 'pacoca:block/tacho_cobre_dentro',
    doce: 'pacoca:block/doce_de_amendoim',
    ferro: 'minecraft:block/iron_block',
    colher: 'minecraft:block/stripped_oak_log',
  },
  elements,
};
fs.writeFileSync(__dirname + '/../src/main/resources/assets/pacoca/models/block/panela_de_doces.json', JSON.stringify(model, null, 2) + '\n');
console.log('ok', elements.length, 'elementos');
