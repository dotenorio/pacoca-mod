// Gera os diálogos (capítulos da história) e as funções que os mostram.
const fs = require('fs');
const capitulos = [
  { titulo: 'A Lenda da Paçoca', botao: 'Continuar', texto: [
    'Dizem os mais velhos das planícies que, antigamente, toda vila tinha um Doceiro.',
    'Ele mexia a Panela de Doces dia e noite, e a vila inteira cheirava a amendoim torrado.',
    'Até que os zumbis vieram... e os Doceiros sumiram, um por um.',
    'Dessa época só sobrou a paçoca que você tem nas mãos. Prove-a. E, se passar por uma vila das planícies, procure uma casinha de telhado rosa.',
  ] },
  { titulo: 'O Caderno da Vovó', botao: 'Vou salvá-la', texto: [
    'As páginas estão manchadas de açúcar. Na última, uma letra tremida:',
    '"Minha filha Benedita foi mordida. Não tive coragem... tranquei ela atrás das grades da doceria. Se alguém achar este caderno: a fraqueza e a maçã dourada ainda podem salvá-la."',
    'No mesmo baú havia uma Poção Arremessável de Fraqueza e uma Maçã Dourada.',
    'Dica: arremesse a poção na Dona Benedita, abra a cela com a alavanca e dê a maçã dourada a ela. Cuidado: ela ainda morde!',
  ] },
  { titulo: 'A Doceira Acordou', botao: 'Bem-vinda de volta, Dona Benedita', texto: [
    'Dona Benedita pisca, cospe um pedaço de carne podre e abre um sorriso.',
    '"Quanto tempo eu dormi? A minha panela ainda está aí? Me dá um minutinho que eu volto pro batente!"',
    'Deixe a cela aberta: ela vai voltar para a Panela de Doces. Só um Doceiro de verdade sabe usá-la.',
  ] },
  { titulo: 'Negócio Doce', botao: 'Fechado!', texto: [
    '"Paçoca Picante saindo! Receita do meu avô, com pó de blaze de verdade."',
    '"Negocie bastante comigo. Quando eu virar Mestre Doceiro, te conto o segredo da família..."',
  ] },
  { titulo: 'Mestre Paçoqueiro', botao: 'Fim... por enquanto', texto: [
    'Você sente o poder do amendoim dourado correndo pelas veias.',
    'Dona Benedita enxuga uma lágrima no avental: "A vovó ia ficar orgulhosa."',
    'A Lenda da Paçoca está completa. As vilas das planícies voltaram a cheirar a amendoim torrado.',
  ] },
];
capitulos.forEach((c, i) => {
  const n = i + 1;
  const dialog = {
    type: 'minecraft:notice',
    title: { text: c.titulo, color: 'gold', bold: true },
    body: c.texto.map(t => ({ type: 'minecraft:plain_message', contents: t, width: 300 })),
    action: { label: c.botao },
  };
  fs.writeFileSync(`dialog/lenda/capitulo_${n}.json`, JSON.stringify(dialog, null, 2) + '\n');
  fs.writeFileSync(`function/lenda/capitulo_${n}.mcfunction`,
    `# Capítulo ${n}: ${c.titulo}\n# Chamado pela recompensa de uma conquista; @s é o jogador que a ganhou.\n` +
    `playsound minecraft:block.note_block.chime master @s ~ ~ ~ 1 1.2\n` +
    `dialog show @s pacoca:lenda/capitulo_${n}\n`);
});
console.log('ok', capitulos.length);
