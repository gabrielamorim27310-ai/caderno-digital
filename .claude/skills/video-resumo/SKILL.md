---
name: video-resumo
description: Cria um vídeo narrado de revisão a partir de um resumo do Caderno Digital (ex. sociologia-3tri.html). Use quando pedirem vídeo, videoaula, reels/shorts ou "vídeo do resumo" de uma matéria. Escreve o roteiro, grava a narração (Piper, grátis) e monta com ffmpeg.
---

# Vídeo de um resumo

Todo vídeo **tem narração**. O vídeo nunca é montado sem um áudio para cada tela.

Arquivos em `ferramentas/video/`:
- `roteiros/<pagina>.json`: o roteiro (vai para o git);
- `narrar.py`: grava as falas com o Piper em `audio/<pagina>/`;
- `gerar.mjs`: desenha as telas (Playwright) e monta o vídeo (ffmpeg).

Saída: `videos-gerados/<pagina>.mp4` na raiz (fora do git). Áudios, `.venv/`,
`vozes/` e `node_modules/` também ficam fora do git.

## Passo a passo

1. **Ler o resumo** (`<pagina>.html`) inteiro, inclusive o quiz, e o que o
   professor cobra (dicas "cai na prova", questionários).
2. **Escrever o roteiro** em `ferramentas/video/roteiros/<pagina>.json`
   (formato abaixo). Use `roteiros/sociologia-3tri.json` como modelo.
   - 3 a 5 minutos: uns 15 a 22 cenas. Uma ideia por cena.
   - Abre com `capa`, um `capitulo` por capítulo, `topicos`/`destaque`/
     `comparacao` no meio, 1 `pergunta` por capítulo e `fim`.
   - Tela curta (no máximo 4 itens de uma linha ou duas); a explicação
     vai na **fala**, não na tela.
   - **fala** em português falado, frases curtas, sem siglas nem símbolos:
     escreva números e anos por extenso quando a leitura for ambígua
     ("mil novecentos e sessenta e oito"), "capítulo um" e não "Cap. 1".
   - Mesmos fatos do resumo. Nada de dado novo que não esteja na página;
     se achar erro no resumo, corrija a página primeiro.
   - Imagens: só as que já estão no site (`socio-imgs/...` etc.).
     Retrato pequeno: `"retrato": true`.
3. **Narrar**: `cd ferramentas/video && python3 narrar.py roteiros/<pagina>.json`
   (na primeira vez instala o Piper e baixa a voz pt_BR, ~2 minutos).
   Depois de mudar uma fala, apague o `.wav` dela ou use `--forcar`.
4. **Prévia das telas**: `node gerar.mjs roteiros/<pagina>.json --previa`
   (precisa de `npm install` na pasta, uma vez). Se aparecer
   "não coube na tela", encurte a cena. Olhe as telas em
   `videos-gerados/<pagina>/cenas/` (um `montage` em miniatura basta).
5. **Montar**: `node gerar.mjs roteiros/<pagina>.json`
   (`--horizontal` para 1920x1080; o padrão é vertical, para celular).
6. **Conferir**: `ffprobe` (tem vídeo h264 e áudio aac?) e algumas telas.
7. **Entregar** o `.mp4` com SendUserFile. Não commitar o vídeo; commitar
   só o roteiro e mudanças nos scripts.

## Formato do roteiro

```json
{
  "pagina": "sociologia-3tri", "materia": "sociologia", "titulo": "Sociologia · 3º tri",
  "cenas": [
    { "tipo": "capa", "selo": "...", "titulo": "...", "subtitulo": "...", "imagem": "...", "fala": "..." },
    { "tipo": "capitulo", "capitulo": "Capítulo 1", "titulo": "...", "subtitulo": "...", "fala": "..." },
    { "tipo": "topicos", "capitulo": "rótulo opcional", "titulo": "...", "imagem": "...", "retrato": true,
      "itens": ["texto com **destaque**", "..."], "fala": "..." },
    { "tipo": "destaque", "titulo": "...", "texto": "...", "imagem": "...", "fala": "..." },
    { "tipo": "comparacao", "titulo": "...", "colunas": [{ "titulo": "...", "itens": ["..."] }, { "titulo": "...", "itens": ["..."] }], "fala": "..." },
    { "tipo": "pergunta", "pergunta": "...", "alternativas": ["...", "..."], "certa": "b",
      "explicacao": "...", "fala": "lê a pergunta", "falaResposta": "diz a resposta e por quê" },
    { "tipo": "fim", "titulo": "Bons estudos!", "texto": "...", "fala": "..." }
  ]
}
```

`**texto**` aparece na cor da matéria. A tela de `pergunta` ganha 3 s de
pausa para pensar antes da resposta.

## Outras ferramentas (opcionais)

- **ElevenLabs** (voz mais natural): `creative_list_voices` com
  `languages: ["pt"]` e `creative_generate_speech` com `generations_count: 1`.
  Salve cada fala como `audio/<pagina>/<NN>.mp3` (o `gerar.mjs` aceita .mp3).
  Gasta créditos: rode `estimate_only` antes e só use se o Gabriel pedir.
  Em 2026-10 a conta estava no plano grátis e bloqueada ("unusual
  activity"): sem plano pago, fique no Piper.
- **Higgsfield**: só para ilustração **decorativa** (fundo de capa, abertura).
  Nunca para retrato de pessoa real, mapa, documento ou dado histórico:
  imagem gerada inventa detalhes e isso vira erro de estudo. Prefira
  sempre as imagens reais do site. Tem pouco crédito no plano grátis
  (`balance` antes; `get_cost: true` para orçar).
