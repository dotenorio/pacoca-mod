# Paçoca — meu primeiro mod de Minecraft

Mod para **Minecraft Java 26.3** com **Fabric** que adiciona a **Paçoca**: um docinho que
alimenta 2 pernis, pode ser comido mesmo de barriga cheia e dá **Velocidade I por 10 s**.

- Receita (sem formato fixo): trigo + açúcar + sementes de cacau → 2 paçocas
- No modo criativo: aba "Comidas e Bebidas"

E o **Bloco de Paçoca**: 9 paçocas na bancada viram um bloco (e o bloco volta a ser 9 paçocas).
Quebra rápido com pá e fica na aba "Blocos de Construção".

E a **Paçoca Picante** (paçoca + pó de blaze): ao comer, solta fogo e fumaça, te lança
para o alto e dá Queda Lenta para você pousar sem dano.

## Pré-requisitos

- JDK 25 (ex.: Eclipse Temurin 25). Se `java -version` não mostrar 25, aponte o `JAVA_HOME`:
  `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.5.8-hotspot"` (PowerShell)
- Não precisa instalar Gradle: o `gradlew` baixa a versão certa sozinho.

## Rodar no jogo (cliente de desenvolvimento)

```powershell
.\gradlew runClient
```

Abre um Minecraft já com o mod e o Fabric API carregados (o mundo de teste fica em `run/`).

## Gerar o `.jar`

```powershell
.\gradlew build
```

O mod sai em `build/libs/pacoca-1.0.0.jar` (o `-sources.jar` é só o código-fonte).
Para usar no seu Minecraft normal, copie esse `.jar` para `%APPDATA%\.minecraft\mods`
junto com o Fabric API e abra o perfil **fabric-loader 26.3** no launcher.

## Onde fica cada coisa

| Arquivo | Para quê |
| --- | --- |
| `src/main/java/com/fernando/pacoca/PacocaMod.java` | Ponto de entrada (`onInitialize`) |
| `src/main/java/com/fernando/pacoca/ModItems.java` | Registro do item, comida e efeito |
| `src/main/java/com/fernando/pacoca/ModBlocks.java` | Registro do bloco e do item do bloco |
| `src/main/java/com/fernando/pacoca/PacocaPicanteItem.java` | Item com comportamento próprio (herda de `Item`) |
| `src/main/resources/fabric.mod.json` | Manifesto do mod (tipo um `package.json`) |
| `src/main/resources/assets/pacoca/` | Textura, modelo e traduções (lado do cliente) |
| `src/main/resources/data/pacoca/recipe/` | Receitas de crafting (lado do servidor) |
| `src/main/resources/data/pacoca/loot_table/` | O que o bloco solta ao ser quebrado |
| `src/main/resources/data/minecraft/tags/` | Tags do jogo que o mod complementa (ex.: "minerável com pá") |
| `gradle.properties` | Versões do Minecraft, Fabric Loader e Fabric API |
