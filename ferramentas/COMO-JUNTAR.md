# Como juntar os resumos enviados pelos alunos

Os envios chegam pelo botão "Enviar meu resumo" de cada página e ficam no
Supabase (tabela `envios`, bucket `envios`). Eles nunca entram no site do
jeito que foram enviados: são juntados numa sessão e revisados pelo Gabriel.

## Regra principal

**Quando dois ou mais alunos mandam material sobre o mesmo tópico da mesma
matéria, todos os envios daquele tópico são juntados numa versão só.**
Nada de um trecho por aluno, nem de colar um envio depois do outro.

- O tópico é o capítulo que o aluno escolheu no formulário (parte do
  `assunto` antes do " · "; depois vem o detalhe opcional).
- Envios em "Vários tópicos / outro" são lidos e cada parte vai para o
  tópico certo antes de juntar.

## Passo a passo

1. Ver o que chegou, já agrupado:
   `node ferramentas/envios.mjs topicos`
   Os grupos marcados com `JUNTAR N` têm mais de um envio no mesmo tópico.
2. Baixar uma página:
   `node ferramentas/envios.mjs baixar historia-2tri`
   Os arquivos vão para `envios-baixados/<pagina>/<tópico>/<id>/`, e o
   `TOPICOS.md` dessa pasta lista os grupos.
3. Para cada tópico, ler **todos** os envios (texto, fotos do caderno e
   anexos) junto com a seção atual do resumo da página.
4. Escrever uma versão consolidada do tópico:
   - o que aparece em mais de um envio entra uma vez só, com a melhor redação;
   - o que só um aluno trouxe e está certo também entra (exemplo, macete,
     detalhe que o professor deu em aula);
   - quando os envios se contradizem, conferir no resumo, no material do
     professor ou em fonte confiável. Se não der para decidir, **não escolher
     no chute**: anotar a dúvida para o Gabriel no resumo da sessão;
   - erro factual de um envio não entra, e é citado no resumo da sessão.
5. Integrar a versão consolidada na seção do tópico, no mesmo estilo da
   página (sem mudar o quiz sem necessidade), e conferir contraste e quebra de
   layout como em qualquer alteração.
6. Créditos: citar todos os alunos que contribuíram para aquele tópico (os
   que deixaram nome) na nota de contribuições da página.
7. Marcar **todos** os envios do grupo de uma vez:
   `node ferramentas/envios.mjs marcar incorporado <id> <id> ...`
   Envio sem nada aproveitável: `marcar descartado <id>`.
8. Opcional, para liberar espaço: `node ferramentas/envios.mjs apagar-arquivos <id> ...`
   (o texto e o registro continuam no banco).

## O que vai para o Gabriel revisar

Um resumo curto da sessão, por página e tópico:
- quantos envios foram juntados, e de quem;
- o que mudou na seção;
- contradições não resolvidas e erros encontrados nos envios.
