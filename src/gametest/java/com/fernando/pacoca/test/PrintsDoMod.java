package com.fernando.pacoca.test;

import net.fabricmc.fabric.api.client.gametest.v1.FabricClientGameTest;
import net.fabricmc.fabric.api.client.gametest.v1.context.ClientGameTestContext;
import net.fabricmc.fabric.api.client.gametest.v1.context.TestServerContext;
import net.fabricmc.fabric.api.client.gametest.v1.context.TestSingleplayerContext;
import net.minecraft.client.gui.screens.advancements.AdvancementsScreen;
import net.minecraft.core.BlockPos;
import net.minecraft.resources.Identifier;

/**
 * "Robô fotógrafo": cria um mundo plano, monta cenários com comandos e tira prints.
 * Rode com ./gradlew runClientGameTest. Os prints saem em build/run/clientGameTest/screenshots.
 *
 * É um teste de verdade: se algo quebrar (ex.: a estrutura não existir), o comando falha e o teste também.
 */
public class PrintsDoMod implements FabricClientGameTest {

	@Override
	public void runTest(ClientGameTestContext context) {
		context.getInput().resizeWindow(1280, 720);

		// Jogo em português (o cliente de teste começa em inglês). Recarregar recursos mostra a tela
		// de carregamento ("overlay"); esperamos ela sumir antes de continuar.
		context.runOnClient(mc -> {
			mc.options.languageCode = "pt_br";
			mc.getLanguageManager().setSelected("pt_br");
			mc.reloadResourcePacks();
		});
		context.waitFor(mc -> mc.gui.overlay() == null);

		// try-with-resources: fecha o mundo no fim, mesmo se der erro (como um "using"/finally).
		try (TestSingleplayerContext world = context.worldBuilder().create()) {
			TestServerContext server = world.getServer();
			server.runCommand("difficulty easy");      // no Pacífico a Dona Benedita (zumbi) sumiria
			server.runCommand("time set noon");
			server.runCommand("gamemode spectator @a"); // câmera livre, sem mão aparecendo

			// Cenário 1: a Doceria (o chão do mundo plano fica em y = -61)
			server.runCommand("place template pacoca:village/plains/doceria 0 -61 0");
			// Na vila, o bloco jigsaw da entrada vira um degrau; com /place template ele fica lá. Trocamos à mão.
			server.runCommand("setblock 0 -61 4 minecraft:oak_stairs[facing=east]");

			// Cenário 2: o Doceiro (nível Mestre) ao lado do tacho
			server.runCommand("setblock -4 -60 12 pacoca:panela_de_doces");
			server.runCommand("summon villager -6 -60 12 {NoAI:1b,Rotation:[0f,0f],"
					+ "VillagerData:{profession:\"pacoca:doceiro\",level:5,type:\"minecraft:plains\"}}");

			// Cenário 3: vitrine com os itens em molduras numa parede de Bloco de Paçoca
			// (molduras encaixam em blocos inteiros: uma por bloco, de x = -11 a -7, centralizadas em -8.5)
			server.runCommand("fill -12 -60 24 -6 -57 24 pacoca:pacoca_block");
			String[] itens = {"pacoca:pacoca", "pacoca:pacoca_picante", "pacoca:pacoca_dourada", "pacoca:receita_da_vovo", "pacoca:panela_de_doces"};
			for (int i = 0; i < itens.length; i++) {
				server.runCommand("summon item_frame " + (-11 + i) + " -59 25 {Facing:3b,Fixed:1b,"
						+ "Item:{id:\"" + itens[i] + "\",count:1}}");
			}
			server.runCommand("setblock -9 -60 26 pacoca:panela_de_doces");

			context.waitTicks(40);
			context.runOnClient(mc -> mc.gui.hud.toggle()); // esconde o HUD (como apertar F1)

			cena(context, server, "tp @a -4.5 -57 -3.5", new BlockPos(4, -59, 4), "01-doceria");
			// Olha para a cela (canto x=6..7, z=6..7 do molde): pilar com o vão, verga e alavanca
			cena(context, server, "tp @a 2.5 -60 4.5", new BlockPos(7, -60, 6), "02-dentro-da-doceria");
			cena(context, server, "tp @a -5.5 -58.4 15.5", new BlockPos(-5, -59, 12), "03-doceiro");
			cena(context, server, "tp @a -8.5 -58.4 28.5", new BlockPos(-9, -59, 24), "04-itens");

			// Cena 5: um capítulo da lenda (diálogo)
			context.runOnClient(mc -> mc.gui.hud.toggle()); // HUD de volta
			server.runCommand("dialog show @a pacoca:lenda/capitulo_2");
			context.waitTicks(20);
			context.takeScreenshot("05-dialogo");
			context.setScreen(() -> null);
			context.runOnClient(mc -> mc.gui.hud.toggle()); // esconde o HUD de novo (chat atrás da tela de conquistas)

			// Cena 6: a árvore de conquistas completa
			server.runCommand("advancement grant @a from pacoca:lenda/root");
			context.waitTicks(20);
			context.setScreen(() -> null); // fecha os diálogos que as recompensas abriram
			context.runOnClient(mc -> {
				mc.gui.toastManager().clear(); // tira os avisos de "conquista alcançada"
				var advancements = mc.player.connection.getAdvancements();
				var root = advancements.get(Identifier.fromNamespaceAndPath("pacoca", "lenda/root"));
				if (root != null) {
					advancements.setSelectedTab(root, true);
				}
				mc.gui.setScreen(new AdvancementsScreen(advancements));
			});
			context.waitTicks(20);
			context.takeScreenshot("06-conquistas");
			context.setScreen(() -> null);
		}
	}

	/** Teleporta, olha para o alvo, espera os chunks aparecerem e tira o print. */
	private static void cena(ClientGameTestContext context, TestServerContext server, String tp, BlockPos alvo, String nome) {
		server.runCommand(tp);
		context.waitTicks(20);
		context.getInput().lookAt(alvo);
		context.waitTicks(60);
		context.takeScreenshot(nome);
	}
}
