package com.fernando.pacoca;

import java.util.function.Consumer;

import net.minecraft.ChatFormatting;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.network.chat.Component;
import net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.TooltipFlag;
import net.minecraft.world.item.component.TooltipDisplay;
import net.minecraft.world.level.Level;

/**
 * Nosso primeiro item com comportamento próprio.
 *
 * "extends Item" = herda tudo da classe Item do jogo (como "class X extends Y" em TS).
 * Depois sobrescrevemos (@Override) só os métodos que queremos mudar.
 */
public class PacocaPicanteItem extends Item {

	// Em Java o construtor tem o mesmo nome da classe. super(...) chama o construtor de Item.
	public PacocaPicanteItem(Item.Properties properties) {
		super(properties);
	}

	/**
	 * Chamado quando o jogador termina de comer.
	 *
	 * Conceito importante: o Minecraft roda DUAS cópias da lógica, o cliente (sua tela) e o servidor
	 * (que manda no mundo, mesmo no single player existe um servidor interno). Efeitos "de verdade"
	 * (mover o jogador, tocar som para todos, partículas) são feitos no servidor, que avisa os clientes.
	 */
	@Override
	public ItemStack finishUsingItem(ItemStack stack, Level level, LivingEntity entity) {
		// "instanceof ServerLevel serverLevel" testa o tipo E já cria a variável com o tipo certo,
		// como um type guard do TypeScript. No cliente, level não é ServerLevel e pulamos tudo.
		if (level instanceof ServerLevel serverLevel) {
			// Foguinho e fumaça em volta do jogador: (tipo, x, y, z, quantidade, espalhamento x/y/z, velocidade)
			serverLevel.sendParticles(ParticleTypes.FLAME, entity.getX(), entity.getY() + 1, entity.getZ(), 40, 0.4, 0.6, 0.4, 0.05);
			serverLevel.sendParticles(ParticleTypes.SMOKE, entity.getX(), entity.getY() + 1, entity.getZ(), 20, 0.3, 0.5, 0.3, 0.02);

			// null no 1º argumento = todo mundo por perto ouve, inclusive quem comeu.
			level.playSound(null, entity.getX(), entity.getY(), entity.getZ(), SoundEvents.FIRECHARGE_USE, SoundSource.PLAYERS, 1.0f, 1.0f);

			// Lança para cima: soma 1.0 na velocidade vertical (Y).
			entity.setDeltaMovement(entity.getDeltaMovement().add(0, 1.0, 0));

			// A posição do jogador é controlada pelo cliente dele, então o servidor precisa
			// mandar um "pacote" avisando da nova velocidade, senão o pulo não acontece na tela.
			if (entity instanceof ServerPlayer player) {
				player.connection.send(new ClientboundSetEntityMotionPacket(player));
			}
		}

		// super.finishUsingItem faz o comportamento normal de comida: enche a fome,
		// aplica os efeitos do Consumable e gasta 1 item da pilha.
		return super.finishUsingItem(stack, level, entity);
	}

	/** Texto extra que aparece quando você passa o mouse em cima do item. */
	@Override
	public void appendHoverText(ItemStack stack, Item.TooltipContext context, TooltipDisplay display,
			Consumer<Component> tooltip, TooltipFlag flag) {
		tooltip.accept(Component.translatable("item.pacoca.pacoca_picante.tooltip").withStyle(ChatFormatting.RED));
	}
}
