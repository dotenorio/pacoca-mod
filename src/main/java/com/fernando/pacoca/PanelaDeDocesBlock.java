package com.fernando.pacoca;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.BlockGetter;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.shapes.CollisionContext;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;

/**
 * O tacho de cobre. Por padrão todo bloco é um cubo 16x16x16; aqui dizemos o formato real,
 * que é usado na caixinha de seleção (contorno preto) e na colisão.
 */
public class PanelaDeDocesBlock extends Block {
	// VoxelShape = união de caixas, em pixels (0..16). Shapes.or junta várias: os pés + o corpo do tacho.
	private static final VoxelShape SHAPE = Shapes.or(
			Block.box(2, 0, 2, 14, 3, 14),   // pés
			Block.box(1, 3, 1, 15, 11, 15)); // tacho

	public PanelaDeDocesBlock(Properties properties) {
		super(properties);
	}

	@Override
	protected VoxelShape getShape(BlockState state, BlockGetter level, BlockPos pos, CollisionContext context) {
		return SHAPE;
	}
}
