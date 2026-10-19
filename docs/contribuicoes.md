# Resumos enviados pelos alunos

Cada página de resumo (`*-Ntri*.html`) tem o botão **📝 Enviar meu resumo** no canto
inferior esquerdo. O aluno cola um texto e/ou anexa um arquivo (PDF, DOCX, ODT, TXT,
MD, até 3 MB). O envio vai para `api/enviar-resumo.js`, que grava num **repositório
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
envios/<pagina>/<data-hora>-<id>/resumo.md      ← metadados + texto colado
envios/<pagina>/<data-hora>-<id>/<arquivo>.pdf  ← anexo, se houver
```

O `resumo.md` começa com `status: pendente`.

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
- Arquivo até 3 MB, por causa do limite de 4,5 MB de corpo das funções da Vercel.
- Não aceita foto de caderno. Para isso seria preciso aceitar imagens e transcrevê-las.
