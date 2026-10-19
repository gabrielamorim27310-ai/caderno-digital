# Resumos enviados pelos alunos

Cada página de resumo (`*-Ntri*.html`) tem o botão **📝 Enviar meu resumo** no canto
inferior esquerdo. O aluno cola um texto e/ou anexa até 10 arquivos: fotos do caderno
(qualquer imagem que o navegador abra) ou PDF, DOCX, ODT, TXT e MD de até 20 MB cada.
O envio vai para `api/enviar-resumo.js`, que grava num **repositório
GitHub privado**. Nada é publicado automaticamente: os envios são juntados ao resumo
da página numa sessão com o Claude e revisados antes do deploy.

## Configuração (uma vez)

1. Crie um repositório **privado** vazio, por exemplo `caderno-envios`
   (marque "Add a README" para ele já ter um branch).
2. Crie um token *fine-grained* em GitHub → Settings → Developer settings →
   Personal access tokens → Fine-grained tokens:
   - Repository access: **Only select repositories** → `caderno-envios`
   - Permissions → Repository → **Contents: Read and write**
   - Nada mais. Esse token não deve ter acesso ao `caderno-digital`.
3. Na Vercel, em Settings → Environment Variables do projeto:
   - `ENVIOS_TOKEN` = o token
   - `ENVIOS_REPO` = `gabrielamorim27310-ai/caderno-envios`
4. Faça um novo deploy (variáveis novas só valem depois de redeploy).

Sem essas variáveis o formulário aparece, mas responde
"Envio de resumos ainda não configurado."

## Onde os envios ficam

```
envios/<pagina>/<data-hora>-<id>/resumo.md                ← metadados + texto colado
envios/<pagina>/<data-hora>-<id>/01-foto-do-caderno.jpg   ← anexos, numerados
envios/<pagina>/<data-hora>-<id>/02-apostila.pdf.part001  ← arquivo > 2,5 MB vai em partes
envios/<pagina>/<data-hora>-<id>/02-apostila.pdf.part002
```

O `resumo.md` começa com `status: pendente` e lista os anexos em `arquivos:`. Ele é
gravado por último: **pasta sem `resumo.md` é envio que falhou no meio** e pode ser
apagada.

Para remontar um arquivo em partes: `cat 02-apostila.pdf.part* > 02-apostila.pdf`.

### Por que partes e compressão

Função da Vercel aceita no máximo 4,5 MB por requisição, e isso não é configurável.
Por isso:
- **Fotos** são reduzidas no navegador para no máximo 2000 px no lado maior e viram
  JPEG. Uma foto de celular de 7 MB vira algo perto de 1 MB, com texto legível.
  Formatos que o navegador não abre (HEIC no Chrome do Windows, por exemplo) são
  recusados com aviso. No iPhone o Safari já converte HEIC para JPEG sozinho.
- **Outros arquivos** são cortados em pedaços de 2,5 MB, um por requisição.

## Juntando os envios

Numa sessão do Claude Code com os dois repositórios (`caderno-digital` e
`caderno-envios`), peça algo como:

> Junta os envios pendentes de historia-2tri no resumo.

O fluxo esperado: ler todos os envios pendentes da página, cruzar com o conteúdo que
já existe, incorporar só o que é novo e está correto (apontando divergências e erros
em vez de copiá-los), e marcar os envios usados como `status: incorporado`.

## Limites conhecidos

- **Sem limite de taxa.** Só há um honeypot contra robôs simples. Alguém insistente
  consegue encher o repositório de lixo; nesse caso, apague a pasta e troque o token.
- O repositório de envios cresce rápido com fotos e PDFs. O GitHub recomenda ficar
  abaixo de 1 GB por repositório: depois de incorporar, apague as pastas usadas.
- Envio grande depende de várias requisições seguidas. Se a conexão cair no meio,
  sobram partes sem `resumo.md` (ver acima) e o aluno precisa reenviar tudo.
