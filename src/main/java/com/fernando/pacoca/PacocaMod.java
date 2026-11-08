package com.fernando.pacoca;

import net.fabricmc.api.ModInitializer;
import net.minecraft.resources.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Ponto de entrada do mod (o "index.ts" do mod).
 * O Fabric lê o fabric.mod.json, encontra esta classe em "entrypoints.main"
 * e chama onInitialize() uma vez quando o jogo carrega.
 */
public class PacocaMod implements ModInitializer {
	// O "namespace" do mod: aparece em IDs como "pacoca:pacoca" e nas pastas assets/pacoca e data/pacoca.
	public static final String MOD_ID = "pacoca";

	public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

	@Override
	public void onInitialize() {
		ModItems.initialize();
		LOGGER.info("Paçoca carregada! Bom apetite.");
	}

	/** Atalho para criar um ID "pacoca:<path>". */
	public static Identifier id(String path) {
		return Identifier.fromNamespaceAndPath(MOD_ID, path);
	}
}
