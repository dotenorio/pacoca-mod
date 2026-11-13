package com.fernando.pacoca.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import com.fernando.pacoca.ModVillagers;

import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.npc.villager.AbstractVillager;
import net.minecraft.world.entity.npc.villager.Villager;
import net.minecraft.world.entity.npc.villager.VillagerData;
import net.minecraft.world.level.Level;

/**
 * Mixin = "monkey patch" com regras: injeta código num método do próprio jogo, como envolver uma função
 * de uma lib em TS, só que feito na hora em que a classe é carregada.
 *
 * O jogo, quando o aldeão sobe de nível, chama updateTrades(), que sorteia trocas de UM trade_set.
 * Aqui, logo depois desse sorteio, adicionamos um segundo trade_set ("fixos") só para a Doceira:
 * os doces da casa entram sempre, e o sorteio fica com as trocas de ingredientes.
 *
 * "extends AbstractVillager" só existe para o Java deixar a gente chamar os métodos protected da classe-mãe;
 * o construtor privado nunca roda (a classe de mixin é "colada" dentro do Villager de verdade).
 */
@Mixin(Villager.class)
public abstract class VillagerMixin extends AbstractVillager {
	private VillagerMixin(EntityType<? extends AbstractVillager> type, Level level) {
		super(type, level);
	}

	@Inject(
			method = "updateTrades",
			at = @At(
					value = "INVOKE",
					target = "Lnet/minecraft/world/entity/npc/villager/Villager;addOffersFromTradeSet(Lnet/minecraft/server/level/ServerLevel;Lnet/minecraft/world/item/trading/MerchantOffers;Lnet/minecraft/resources/ResourceKey;)V",
					shift = At.Shift.AFTER)) // logo DEPOIS do sorteio normal (e antes de aplicar descontos)
	private void pacoca$docesFixos(ServerLevel level, CallbackInfo ci) {
		VillagerData data = ((Villager) (Object) this).getVillagerData();
		if (!data.profession().is(ModVillagers.DOCEIRO_KEY)) {
			return;
		}
		// Se o nível não tiver lista fixa (ex.: nível 1), o jogo só ignora: ele já trata trade_set inexistente.
		addOffersFromTradeSet(level, getOffers(), ModVillagers.docesFixos(data.level()));
	}
}
