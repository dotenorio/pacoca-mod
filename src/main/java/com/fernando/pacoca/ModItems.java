package com.fernando.pacoca;

import java.util.function.Function;

import net.fabricmc.fabric.api.creativetab.v1.CreativeModeTabEvents;
import net.minecraft.core.Registry;
import net.minecraft.core.component.DataComponents;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.world.effect.MobEffectInstance;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.food.FoodProperties;
import net.minecraft.world.item.CreativeModeTabs;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.Rarity;
import net.minecraft.world.item.component.Consumable;
import net.minecraft.world.item.component.Consumables;
import net.minecraft.world.item.consume_effects.ApplyStatusEffectsConsumeEffect;

/**
 * Todos os itens do mod ficam aqui.
 * "final class" + construtor privado = um módulo só com membros estáticos (como um arquivo TS que só exporta consts).
 */
public final class ModItems {
	private ModItems() {}

	// Quanto a paçoca alimenta: 4 = dois "pernis" da barra de fome.
	private static final FoodProperties PACOCA_FOOD = new FoodProperties.Builder()
			.nutrition(4)
			.saturationModifier(0.3f)
			.alwaysEdible() // dá para comer mesmo de barriga cheia (é doce, sempre cabe)
			.build();

	// O que acontece ao comer: Velocidade I por 10 segundos (200 ticks; o jogo roda a 20 ticks/s).
	private static final Consumable PACOCA_CONSUMABLE = Consumables.defaultFood()
			.consumeSeconds(1.0f) // come mais rápido que o normal (1,6 s)
			.onConsume(new ApplyStatusEffectsConsumeEffect(new MobEffectInstance(MobEffects.SPEED, 200, 0), 1.0f))
			.build();

	public static final Item PACOCA = register(
			"pacoca",
			Item::new,
			new Item.Properties().food(PACOCA_FOOD, PACOCA_CONSUMABLE));

	// Ao comer: Queda Lenta por 5 s, para não tomar dano de queda depois do pulo.
	private static final Consumable PACOCA_PICANTE_CONSUMABLE = Consumables.defaultFood()
			.consumeSeconds(1.0f)
			.onConsume(new ApplyStatusEffectsConsumeEffect(new MobEffectInstance(MobEffects.SLOW_FALLING, 100, 0), 1.0f))
			.build();

	// Aqui a "fábrica" é PacocaPicanteItem::new, então o item criado é da NOSSA classe, não um Item comum.
	public static final PacocaPicanteItem PACOCA_PICANTE = register(
			"pacoca_picante",
			PacocaPicanteItem::new,
			new Item.Properties().food(PACOCA_FOOD, PACOCA_PICANTE_CONSUMABLE));

	// Paçoca Dourada: só o Doceiro mestre (nível 5) vende. Regeneração II, Absorção e Velocidade.
	private static final FoodProperties PACOCA_DOURADA_FOOD = new FoodProperties.Builder()
			.nutrition(8)
			.saturationModifier(1.2f)
			.alwaysEdible()
			.build();

	private static final Consumable PACOCA_DOURADA_CONSUMABLE = Consumables.defaultFood()
			.onConsume(new ApplyStatusEffectsConsumeEffect(java.util.List.of(
					new MobEffectInstance(MobEffects.REGENERATION, 200, 1),
					new MobEffectInstance(MobEffects.ABSORPTION, 2400, 1),
					new MobEffectInstance(MobEffects.SPEED, 600, 0))))
			.build();

	public static final Item PACOCA_DOURADA = register(
			"pacoca_dourada",
			Item::new,
			new Item.Properties()
					.food(PACOCA_DOURADA_FOOD, PACOCA_DOURADA_CONSUMABLE)
					.rarity(Rarity.RARE) // nome em azul
					.component(DataComponents.ENCHANTMENT_GLINT_OVERRIDE, true)); // brilho de encantado

	public static final ReceitaDaVovoItem RECEITA_DA_VOVO = register(
			"receita_da_vovo",
			ReceitaDaVovoItem::new,
			new Item.Properties().stacksTo(1).rarity(Rarity.UNCOMMON));

	/**
	 * Registra um item no registro global do jogo.
	 * Function<Item.Properties, T> é o equivalente Java de (props: Item.Properties) => T.
	 * "Item::new" é uma referência ao construtor, tipo (props) => new Item(props).
	 */
	private static <T extends Item> T register(String name, Function<Item.Properties, T> factory, Item.Properties properties) {
		ResourceKey<Item> key = ResourceKey.create(Registries.ITEM, PacocaMod.id(name));
		T item = factory.apply(properties.setId(key));
		Registry.register(BuiltInRegistries.ITEM, key, item);
		return item;
	}

	/**
	 * Chamado no onInitialize(). Além de forçar o carregamento desta classe (o que registra os itens acima),
	 * coloca a paçoca na aba "Comidas e Bebidas" do modo criativo.
	 */
	public static void initialize() {
		CreativeModeTabEvents.modifyOutputEvent(CreativeModeTabs.FOOD_AND_DRINKS)
				.register(output -> {
					output.accept(PACOCA);
					output.accept(PACOCA_PICANTE);
					output.accept(PACOCA_DOURADA);
				});
	}
}
