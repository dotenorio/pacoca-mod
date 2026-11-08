package com.fernando.pacoca;

import java.util.function.Consumer;

import net.minecraft.ChatFormatting;
import net.minecraft.network.chat.Component;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.TooltipFlag;
import net.minecraft.world.item.component.TooltipDisplay;

/** O caderno de receitas encontrado no baú da Doceria. Só existe para contar a história no tooltip. */
public class ReceitaDaVovoItem extends Item {
	private static final int LINHAS = 4;

	public ReceitaDaVovoItem(Item.Properties properties) {
		super(properties);
	}

	@Override
	public void appendHoverText(ItemStack stack, Item.TooltipContext context, TooltipDisplay display,
			Consumer<Component> tooltip, TooltipFlag flag) {
		// Um laço for igualzinho ao de TS/JS: busca as linhas ...tooltip.1 até ...tooltip.4 no arquivo de idioma.
		for (int i = 1; i <= LINHAS; i++) {
			tooltip.accept(Component.translatable("item.pacoca.receita_da_vovo.tooltip." + i)
					.withStyle(ChatFormatting.GRAY, ChatFormatting.ITALIC));
		}
	}
}
