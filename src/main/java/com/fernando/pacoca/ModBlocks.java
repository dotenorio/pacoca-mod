package com.fernando.pacoca;

import java.util.function.Function;

import net.fabricmc.fabric.api.creativetab.v1.CreativeModeTabEvents;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.CreativeModeTabs;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.material.MapColor;

/**
 * Blocos do mod.
 *
 * No Minecraft, "bloco" e "item" são coisas diferentes:
 * - o Block é o que existe colocado no mundo;
 * - o BlockItem é o que você segura na mão / guarda no inventário e, ao usar, coloca o bloco.
 * Por isso cada bloco é registrado duas vezes: uma no registro de blocos e outra no de itens.
 */
public final class ModBlocks {
	private ModBlocks() {}

	public static final Block PACOCA_BLOCK = register(
			"pacoca_block",
			Block::new,
			BlockBehaviour.Properties.of()
					.mapColor(MapColor.SAND)  // cor no mapa
					.strength(0.5f)           // dureza parecida com a da areia
					.sound(SoundType.SAND));  // som de passos/quebra

	// Bancada de trabalho do Doceiro. Para o jogo ela é um bloco comum; quem a transforma em
	// "local de trabalho" é o registro de POI em ModVillagers.
	public static final Block PANELA_DE_DOCES = register(
			"panela_de_doces",
			Block::new,
			BlockBehaviour.Properties.of()
					.mapColor(MapColor.METAL)
					.strength(2.0f)
					.sound(SoundType.METAL)
					.lightLevel(state -> 6)); // brilho fraquinho do doce no fogo

	private static Block register(String name, Function<BlockBehaviour.Properties, Block> factory, BlockBehaviour.Properties properties) {
		ResourceKey<Block> blockKey = ResourceKey.create(Registries.BLOCK, PacocaMod.id(name));
		Block block = factory.apply(properties.setId(blockKey));
		Registry.register(BuiltInRegistries.BLOCK, blockKey, block);

		// O item do bloco usa o mesmo nome. useBlockDescriptionPrefix() faz ele usar a tradução
		// "block.pacoca.pacoca_block" em vez de "item.pacoca.pacoca_block".
		ResourceKey<Item> itemKey = ResourceKey.create(Registries.ITEM, PacocaMod.id(name));
		BlockItem item = new BlockItem(block, new Item.Properties().setId(itemKey).useBlockDescriptionPrefix());
		Registry.register(BuiltInRegistries.ITEM, itemKey, item);

		return block;
	}

	public static void initialize() {
		CreativeModeTabEvents.modifyOutputEvent(CreativeModeTabs.BUILDING_BLOCKS)
				.register(output -> output.accept(PACOCA_BLOCK));
		CreativeModeTabEvents.modifyOutputEvent(CreativeModeTabs.FUNCTIONAL_BLOCKS)
				.register(output -> output.accept(PANELA_DE_DOCES));
	}
}
