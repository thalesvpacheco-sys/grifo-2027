# HOME 2027 · Boutique: novo layout para aprovação

Este documento cobre apenas a Home. As demais páginas seguem o layout anterior até a aprovação desta direção.

## Direção

**Boutique de resultados.**
- **Cores:** monocromático, com névoa `#ECEBE7`, branco, grafite `#18181A` e preto `#0F0F10`. Vinho e âmbar só aparecem em detalhes: ponto do selo, filete dos passos, uma borda da escultura, `+` da métrica e categoria dos insights.
- **Painéis:** arredondados (32 px) sobre fundo névoa, com ritmo claro → escuro.
- **Navegação:** pílula flutuante escura.
- **Tipografia:** títulos grandes em Outfit 500 com espaçamento negativo. A segunda frase de cada título fica em cinza (contraste por cor, não por peso).

## 3D

A escultura "Asa Grifo" é derivada das três penas da asa do logotipo: topo reto, ponta reta, cauda curva e início escalonado. O logotipo não é deformado.

- **Render:** feito offline em Three.js, com estúdio de softboxes (PMREM), materiais físicos e sombras suaves (`tools/render-3d/`).
- **Hero:** cerâmica branca, com a lateral âmbar numa das penas.
  - **Imagem:** WebP com transparência, em 840 e 1680 px, pré-carregada.
  - **Vídeo:** loop de 5 s em MP4 (300 KB), carregado só no desktop, após a página pronta. Mudo, pausa fora da tela.
  - **Parallax:** sutil, segue o cursor.
- **CTA final:** a mesma escultura em preto acetinado.
- **No navegador:** nenhum WebGL. Com movimento reduzido, no celular ou em economia de dados, aparece só a imagem.

Para regerar:

```bash
node tools/render-3d/render.mjs <saida> ivory 2100 1800 1 0 center dist=9.4
node tools/render-3d/render.mjs <pasta> ivory 1400 1200 150 0 center dist=9.4
# composição sobre #F1F0ED + ffmpeg: ver o histórico do commit
```

## Conteúdo

São as mesmas nove seções, na mesma ordem, com os mesmos textos e CTAs do CMS. Nada foi reescrito.

Exibimos dados que já estavam no CMS:
- serviços de cada frente (chips nos cartões do ecossistema);
- texto completo de cada pilar MICCA (painel expansível).

Os rótulos do diagrama original ("grifo · o ecossistema", "Direção estratégica" em Consulting) e "Conhecer a especialidade" foram mantidos.

O diff de texto renderizado (`qa/leaves-diff.json`) mostra só mudanças de apresentação na Home:
- caixa alta (`DIREÇÃO ESTRATÉGICA` agora vem do CSS);
- o separador `›`;
- a vírgula entre competências, que agora aparecem como etiquetas separadas.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `src/app/(site)/page.tsx` | Home |
| `src/components/home/*` | `parts`, `HeroSculpture`, `MiccaRail` |
| `src/app/globals.css` | bloco `.hm-*`, escopado à Home |
| `src/components/site/Header.tsx` | pílula flutuante só em `/` |
| `public/home/*` | renders e loop |
| `qa/home-2027/` | capturas: homologação e produção, desktop e mobile |
| `qa/home-2027/video/` | percursos gravados |
