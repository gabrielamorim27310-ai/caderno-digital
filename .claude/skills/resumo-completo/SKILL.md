---
name: resumo-completo
description: Monta o pacote completo de uma matéria do Caderno Digital a partir do material da prova (PDFs, fotos, Blooket, guia de estudos): primeiro um artefato interativo com imagens, depois a página do site (ex. ingles-3tri.html) e por fim o vídeo narrado. Use sempre que o Gabriel mandar uma pasta de material de prova, pedir "monte o resumo/artefato de <matéria>", "coloque no site", "faça a página do 3º tri", "artefato com imagens e interativo" ou "monte tudo de <matéria>", mesmo que ele cite só uma das três etapas: as etapas seguintes reaproveitam o que a anterior produziu.
---

# Resumo completo: artefato → site → vídeo

Três entregas, nesta ordem, porque cada uma reaproveita a anterior:

1. **Artefato** (claude.ai): a versão interativa, para o Gabriel revisar o
   conteúdo e as imagens antes de tudo ir para o site.
2. **Página do site** (`<materia>-<n>tri.html`): o mesmo conteúdo no padrão
   visual do Caderno, com os widgets do artefato e um quiz no formato da prova.
3. **Vídeo** narrado (skill `video-resumo` para os detalhes de narração).

Exemplo completo e testado: Inglês 3º tri. Arquivos de referência:
`ferramentas/ingles/` (artefato, gerador de desenhos, montagem da página),
`ingles-3tri.html`, `ferramentas/video/roteiros/ingles-3tri.json`.

## 0. Juntar o material

- Pasta que o Gabriel indicar (normalmente `~/Downloads/<matéria> <n>tri`).
  PDFs: `pdftotext -layout` (está no Git Bash) para um `.txt` no scratchpad.
  Imagens (gabaritos em `.jpg`): abra com Read.
- **O guia de estudos manda.** Ele diz o formato da prova e a lista de
  conteúdos. Cada conteúdo do guia vira uma seção; o que não está no guia não entra.
- Gabaritos (answer key, prova modelo) são a fonte de verdade das respostas.
  Confira cada resposta que você usar contra eles.
- Link do Blooket: abra no navegador embutido, `get_page_text`, clique em
  "Show all answers" e leia de novo. As perguntas mostram o que o professor
  considera importante e servem de modelo para o quiz.
- Não invente: dado, definição ou exemplo vem do material ou do livro. Para
  obra literária (ex. *The Catcher in the Rye*), parafraseie; nada de citação longa.

## 1. Imagens

Ordem de preferência:
1. Imagens reais do material ou já no site (`<sigla>-imgs/`).
2. **Desenhos SVG gerados por código**, quando o assunto é visual e não há
   imagem pronta (gestos, esquemas, ciclos). Modelo: `ferramentas/ingles/gestos.mjs`
   (personagem montado de partes; cada desenho é um "cartão" de fundo claro,
   que funciona no tema escuro e no vídeo).
   - **Animação**: cada SVG traz um `<style>` com `@keyframes` e anima a parte
     que se mexe (`.m`, `.fx`, `.boca`...). Anima sozinho até dentro de `<img>`
     e respeita `prefers-reduced-motion`.
   - Esquemas de processo (Biologia): `ferramentas/biologia/desenhos.mjs` →
     `bio-imgs/esquemas/`. Mostram o processo andando: uma bolinha percorre o
     caminho (`offset-path`: impulso, sangue, gameta), curvas de gráfico se
     desenham (`stroke-dashoffset`), estados se alternam. Confira a biologia
     do desenho, não só a beleza: o primeiro coração saiu com sangue azul no
     ventrículo esquerdo. Rótulo nunca em cima de curva.
   - Confira de olho com a folha de contato, em dois instantes para ver o movimento:
     `cd ferramentas/video && node folha.mjs <pasta-dos-svgs> <saida.png> 700 1300`.
     Desenho que não se entende sem legenda (ex.: dedos cruzados parecendo "V")
     tem de ser refeito.
3. Imagem gerada por IA só como decoração, nunca para dado de estudo.

Salve em `<sigla>-imgs/<n>tri/` (ex. `ing-imgs/3tri/`): o artefato, o site e o
vídeo usam os mesmos arquivos.

## 2. Artefato

- `Artifact` com `action: "quickstart"`, `intent: "other"` antes de escrever.
- Um arquivo em `ferramentas/<materia>/artefato/<pagina>.html`. As imagens vão
  por `files` (`{"g/<nome>.svg": "<caminho absoluto>"}`) e a página usa `g/<nome>.svg`.
- Interativo de verdade, ligado ao formato da prova: cartões que viram
  (idioms, definições), jogo "qual é?" com as imagens, lacunas com opções,
  transformação com palavra dada (input + conferir, aceitando variações do
  gabarito), quiz sorteado com placar. Explicação em português, exemplos na
  língua da matéria (no Inglês, as explicações dos gestos ficaram em inglês a pedido).
- Pegadinhas da prova em destaque ("qual frase não combina com o contexto",
  "forma errada", "não pode ser completada").
- Antes de publicar: copie html + imagens para o scratchpad e rode
  `node ferramentas/video/fotos.mjs file:///<scratchpad>/art/index.html <prefixo> "#secao"`
  (o navegador do app não abre file:// nem o link do artefato sem login).
- Entregue o link. Para mudar depois, publique o mesmo `file_path`.

## 3. Página do site

- Monte por script, como `ferramentas/ingles/montar-pagina.mjs`: pega o
  cabeçalho e o rodapé (chatbot, scripts) de uma página do mesmo trimestre
  (`portugues-3tri.html`), troca `data-pagina`, `data-materia`, `<title>` e as
  cores, e encaixa o corpo (`pagina-corpo.html`), o quiz e os widgets
  (`pagina-widgets.js`, o JavaScript do artefato sem as partes que a página
  não tem). Remontar é um comando, então corrija na fonte, não no HTML gerado.
- O `ios.css` estiliza `.btn`, listas, tabelas e cores: nos widgets use as
  variáveis dele (`--tint`, `--bg-2`, `--bg-3`, `--sep`, `--label`,
  `--label-2`, `--green`, `--red`) e classes próprias (ex. `.kbtn`), senão o
  botão vira o botão grande do site.
- Estrutura: seção "O que cai" (formato + tabela de onde revisar), uma seção
  por conteúdo do guia, quiz de fixação em 5 alternativas (A–E) com
  explicação em cada uma, gabarito variado. Cada alternativa errada tem de ser
  claramente errada pelo critério da questão (releia procurando ambiguidade).
- Registrar: `config.js` (item `tri: <n>` em MATERIAS), `index.html` (célula
  no painel do trimestre), `sw.js` (arquivo na lista e `VERSAO` nova).
- Conferir: `preview_start` com `historia-resumo` (serve a raiz) e
  `node ferramentas/video/fotos.mjs http://localhost:<porta>/<pagina>.html <prefixo> "#sec1" "#sec2"`.
  Precisa sair "Sem erros de JavaScript nem rolagem lateral".
- **Contraste no tema escuro:** `node ferramentas/video/contraste.mjs <url>`.
  O erro que o Gabriel já pegou em Biologia: uma classe da página com fundo
  claro fixo (`background: #f2faf5`) e texto que segue o tema, que no escuro
  vira branco no quase-branco. Toda cor de fundo de classe própria vem das
  variáveis do `ios.css` (`--bg-3` + `color: var(--label)`). Badges do topo e
  etiquetas `tag-ch*` aparecem como falso alarme; confira com uma foto do
  elemento antes de mexer.
- Páginas antigas têm fim de linha CRLF: script que procura um trecho exato
  deve normalizar `\r\n` antes e devolver depois. E ao acrescentar itens num
  objeto JS (gabarito do quiz), confira a vírgula do item anterior.

## 4. Vídeo

Use o `hyperframes.mjs` (animado, 1920x1080, o mesmo de Português e Literatura).
Roteiro em `ferramentas/video/roteiros/<pagina>.json`; formato e regras de fala
na skill `video-resumo`. O que esta skill acrescenta:

- `"idioma": "en"` no roteiro de Inglês: a narração (`narrar.py`), a
  conferência (`conferir_falas.py`) e os rótulos da tela (Question, think,
  Answer, Topic) passam para inglês. Narração toda em inglês, frases curtas.
- `"capitulos": [...]` no topo vira os chips da capa e as marcas da barra.
- Cenas novas:
  - `gestos`: grade de até 6 desenhos animados com legenda
    (`{"arquivo": "ing-imgs/3tri/x.svg", "texto": "**fold** your arms"}`);
    cada um entra quando a fala chega na palavra em destaque, então a fala
    cita os itens na ordem da tela.
  - `desenho`: um esquema grande à esquerda (`"desenho": "<svg>"`) e `itens` à direita.
  Os SVGs entram embutidos no HTML, com classes e `@keyframes` prefixados, e o
  HyperFrames sincroniza as animações CSS com o vídeo.
- Paletas em `CORES` (`ingles`, `biologia`...). Matéria nova: acrescente uma.

Passos:
1. Narrar com a voz do Gabriel (ver memória "voz clonada"):
   `cd ferramentas/video && NARRADOR=chatterbox /c/Users/rafa_/tts-voz/cb/Scripts/python.exe narrar.py roteiros/<pagina>.json`
   (em segundo plano; uns 10 a 20 minutos).
2. Conferir: `/c/Users/rafa_/tts-voz/f5/Scripts/python.exe /c/Users/rafa_/tts-voz/conferir_falas.py roteiros/<pagina>.json`;
   as marcadas com REVER: apague o `.wav` e regrave com outra `SEMENTE`.
   Siglas e símbolos se escrevem como se falam **só na fala** (a tela fica
   com a sigla): "pê agá" (pH), "éfe ésse agá" (FSH), "éle agá" (LH),
   "agá cê gê" (HCG), "a tê pê" (ATP). Sem isso a voz clonada lê "fa", "fesha", "lei".
   Em inglês, a voz clonada acertou ~3 de cada 4 falas de primeira; os erros
   típicos são balbucio no fim da fala e palavra trocada ("immortal" por
   "modal"). Letra sozinha ("C.") sai como "see": falso alarme.
   Se o Chatterbox parar com `IndexError: max(): Expected reduction dim 1`,
   foi uma frase curtíssima; o `narrar.py` já junta frases com menos de 15
   letras à seguinte, mas evite começar a fala com só "A." ou "C.".
3. `node hyperframes.mjs roteiros/<pagina>.json`, depois em
   `videos-gerados/<pagina>-hf`: `npx hyperframes render --quality delivery -o <pagina>.mp4`.
   Antes de renderizar (demora), veja quadros direto do projeto:
   `node quadros.mjs ../../videos-gerados/<pagina>-hf <prefixo> 1+9 8+30 22+18`
   (cena+segundos). Texto que não coube ou desenho torto aparece aqui.
4. Depois do render, `ffprobe` (h264 + aac) e um quadro com ffmpeg
   (`-ss <t> -frames:v 1`) de uma cena de desenho.
5. Copiar para a pasta de vídeos da matéria (`<sigla>-videos/`) com pôster
   `.jpg` e pôr a seção "Vídeo de revisão" no topo da página (modelo em
   `portugues-3tri.html`, `#video`).

## 5. Fechar

- Uma branch e um PR por matéria, no padrão dos commits recentes
  ("Inglês 3º tri: ..."). Sem `node_modules`, áudios ou `videos-gerados/`.
- Diga ao Gabriel o link do artefato, a página e o vídeo, e o que não foi conferido.
