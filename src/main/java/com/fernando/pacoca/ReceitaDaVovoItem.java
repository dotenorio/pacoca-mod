package com.fernando.pacoca;

import java.util.function.Consumer;

import net.minecraft.ChatFormatting;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.dialog.Dialog;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.TooltipFlag;
import net.minecraft.world.item.component.TooltipDisplay;
import net.minecraft.world.level.Level;

/** O caderno de receitas encontrado no baú da Doceria. Botão direito: relê o capítulo 2 da lenda. */
public class ReceitaDaVovoItem extends Item {
	private static final int LINHAS = 4;

	// Referência ao diálogo data/pacoca/dialog/lenda/capitulo_2.json (diálogos ficam num "registro" como itens e blocos)
	private static final ResourceKey<Dialog> CAPITULO = ResourceKey.create(Registries.DIALOG, PacocaMod.id("lenda/capitulo_2"));

	public ReceitaDaVovoItem(Item.Properties properties) {
		super(properties);
	}

	/** Chamado quando o jogador usa o item (botão direito) segurando-o. */
	@Override
	public InteractionResult use(Level level, Player player, InteractionHand hand) {
		// Só o servidor abre diálogos: ele manda um pacote para o cliente mostrar a janela.
		if (!level.isClientSide()) {
			// Busca o diálogo no registro. Optional é o "T | undefined" do Java: ifPresent só roda se achou.
			level.registryAccess().lookupOrThrow(Registries.DIALOG).get(CAPITULO).ifPresent(player::openDialog);
			level.playSound(null, player.getX(), player.getY(), player.getZ(), SoundEvents.BOOK_PAGE_TURN, SoundSource.PLAYERS, 1.0f, 1.0f);
		}
		return InteractionResult.SUCCESS; // SUCCESS = "usei o item" (faz a animação de mão)
	}

	@Override
	public void appendHoverText(ItemStack stack, Item.TooltipContext context, TooltipDisplay display,
			Consumer<Component> tooltip, TooltipFlag flag) {
		// Um laço for igualzinho ao de TS/JS: busca as linhas ...tooltip.1 até ...tooltip.4 no arquivo de idioma.
		for (int i = 1; i <= LINHAS; i++) {
			tooltip.accept(Component.translatable("item.pacoca.receita_da_vovo.tooltip." + i)
					.withStyle(ChatFormatting.GRAY, ChatFormatting.ITALIC));
		}
		tooltip.accept(Component.translatable("item.pacoca.receita_da_vovo.usar").withStyle(ChatFormatting.YELLOW));
	}
}
