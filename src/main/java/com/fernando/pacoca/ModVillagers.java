package com.fernando.pacoca;

import com.google.common.collect.ImmutableSet;

import it.unimi.dsi.fastutil.ints.Int2ObjectMap;
import it.unimi.dsi.fastutil.ints.Int2ObjectOpenHashMap;
import net.fabricmc.fabric.api.object.builder.v1.world.poi.PoiHelper;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceKey;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.world.entity.ai.village.poi.PoiType;
import net.minecraft.world.entity.npc.villager.VillagerProfession;
import net.minecraft.world.item.trading.TradeSet;

/**
 * A profissão Doceiro.
 *
 * Três peças se ligam aqui:
 * 1. PoiType ("ponto de interesse"): diz ao jogo que a Panela de Doces é um local de trabalho.
 * 2. VillagerProfession: a profissão em si, que só aceita esse POI como local de trabalho.
 * 3. TradeSets: para cada nível (1 a 5), qual lista de trocas usar. As trocas ficam em JSON (data/pacoca/trade_set).
 *
 * Detalhe da lore: a panela NÃO entra na tag minecraft:acquirable_job_site. Por isso aldeões
 * desempregados ignoram a panela; só quem já nasceu Doceiro (a Dona Benedita, depois de curada) trabalha nela.
 */
public final class ModVillagers {
	private ModVillagers() {}

	public static final ResourceKey<PoiType> PANELA_POI_KEY =
			ResourceKey.create(Registries.POINT_OF_INTEREST_TYPE, PacocaMod.id("panela_de_doces"));

	// (id, quantos aldeões podem usar ao mesmo tempo, distância de busca, blocos)
	public static final PoiType PANELA_POI =
			PoiHelper.register(PacocaMod.id("panela_de_doces"), 1, 1, ModBlocks.PANELA_DE_DOCES);

	public static final ResourceKey<VillagerProfession> DOCEIRO_KEY =
			ResourceKey.create(Registries.VILLAGER_PROFESSION, PacocaMod.id("doceiro"));

	public static final VillagerProfession DOCEIRO = Registry.register(
			BuiltInRegistries.VILLAGER_PROFESSION,
			DOCEIRO_KEY,
			new VillagerProfession(
					Component.translatable("entity.pacoca.villager.doceiro"), // nome na tela de trocas
					poi -> poi.is(PANELA_POI_KEY), // qual local de trabalho ele mantém
					poi -> poi.is(PANELA_POI_KEY), // qual local de trabalho ele procura
					ImmutableSet.of(),             // itens que ele pega do chão (fazendeiro pega trigo, por ex.)
					ImmutableSet.of(),             // blocos secundários (fazendeiro usa a terra arada)
					SoundEvents.VILLAGER_WORK_BUTCHER, // som de trabalho (panela no fogo)
					tradeSetsByLevel()));

	/** Mapa nível -> lista de trocas. Int2ObjectMap é um Map<int, T> otimizado (sem "boxing" do int). */
	private static Int2ObjectMap<ResourceKey<TradeSet>> tradeSetsByLevel() {
		Int2ObjectMap<ResourceKey<TradeSet>> map = new Int2ObjectOpenHashMap<>();
		for (int level = 1; level <= 5; level++) {
			map.put(level, ResourceKey.create(Registries.TRADE_SET, PacocaMod.id("doceiro/level_" + level)));
		}
		return map;
	}

	/** Só força o carregamento da classe, o que executa os registros acima. */
	public static void initialize() {
		PacocaMod.LOGGER.info("Doceiro registrado: {}", DOCEIRO_KEY.identifier());
	}
}
