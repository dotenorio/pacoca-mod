const fs = require('fs');
const has = (item) => ({ trigger: 'minecraft:inventory_changed', conditions: { items: [{ items: item }] } });
const eat = (item) => ({ trigger: 'minecraft:consume_item', conditions: { item: { items: item } } });
const trade = (item) => ({ trigger: 'minecraft:villager_trade', conditions: { item: { items: item } } });
// [nome, pai, ícone, frame, critério, recompensas]
const tree = [
  ['root', null, 'pacoca:pacoca', 'task', has('pacoca:pacoca'), { function: 'pacoca:lenda/capitulo_1' }],
  // Galho lateral: as paçocas
  ['primeira_mordida', 'root', 'pacoca:pacoca', 'task', eat('pacoca:pacoca'), { experience: 5 }],
  ['doce_construcao', 'primeira_mordida', 'pacoca:pacoca_block', 'task', has('pacoca:pacoca_block'), { experience: 5 }],
  ['ardeu', 'primeira_mordida', 'pacoca:pacoca_picante', 'task', eat('pacoca:pacoca_picante'), { experience: 10 }],
  ['paçoca_no_atacado', 'primeira_mordida', 'minecraft:emerald', 'task', trade('pacoca:pacoca'), { experience: 10 }],
  // Trilha principal: a história do Seu Zé
  ['caderno_da_vovo', 'root', 'pacoca:receita_da_vovo', 'goal', has('pacoca:receita_da_vovo'), { experience: 20, function: 'pacoca:lenda/capitulo_2' }],
  ['cura_doce', 'caderno_da_vovo', 'minecraft:golden_apple', 'goal', { trigger: 'minecraft:cured_zombie_villager' }, { experience: 50, function: 'pacoca:lenda/capitulo_3' }],
  ['doceiro_voltou', 'cura_doce', 'pacoca:panela_de_doces', 'task', trade('pacoca:pacoca_picante'), { experience: 20, function: 'pacoca:lenda/capitulo_4' }],
  ['fogo_na_panela', 'doceiro_voltou', 'pacoca:panela_de_doces', 'task', has('pacoca:panela_de_doces'), { experience: 10 }],
  ['mestre_pacoqueiro', 'doceiro_voltou', 'pacoca:pacoca_dourada', 'challenge', eat('pacoca:pacoca_dourada'), { experience: 100, function: 'pacoca:lenda/capitulo_5' }],
];
for (const [nome0, pai, icone, frame, criterio, rewards] of tree) {
  const nome = nome0.replace('ç', 'c'); // IDs só aceitam a-z, 0-9, _ - . /
  const adv = {};
  if (pai) adv.parent = `pacoca:lenda/${pai}`;
  adv.criteria = { feito: criterio };
  adv.display = {
    icon: { id: icone },
    title: { translate: `advancements.pacoca.lenda.${nome}.title` },
    description: { translate: `advancements.pacoca.lenda.${nome}.description` },
    frame,
  };
  if (!pai) Object.assign(adv.display, { background: 'minecraft:gui/advancements/backgrounds/husbandry', announce_to_chat: false });
  adv.requirements = [['feito']];
  adv.rewards = rewards;
  fs.writeFileSync(`advancement/lenda/${nome}.json`, JSON.stringify(adv, null, 2) + '\n');
}
console.log(fs.readdirSync('advancement/lenda').join(' '));
