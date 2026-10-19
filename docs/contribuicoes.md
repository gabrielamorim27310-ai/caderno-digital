# Resumos enviados pelos alunos

Cada página de resumo (`*-Ntri*.html`) tem o botão **📝 Enviar meu resumo** no canto
inferior esquerdo. O aluno cola um texto e/ou anexa até 10 arquivos: fotos do caderno
(qualquer imagem que o navegador abra) ou PDF, DOCX, ODT, TXT e MD de até 20 MB cada.

Tudo fica **privado no Supabase** (projeto `xkwbektxxmonqlpkewcq`). Nada é publicado
automaticamente: os envios são juntados ao resumo da página numa sessão com o Claude e
revisados antes do deploy.

## Como funciona

1. O navegador reduz as fotos para no máximo 2000 px e converte em JPEG
   (7 MB viram cerca de 1 MB, com texto legível).
2. `api/enviar-resumo.js` (`acao: 'iniciar'`) valida o envio, aplica os limites, cria a
   linha na tabela `envios` com status `enviando` e devolve uma URL de upload por arquivo.
3. O navegador manda cada arquivo **direto ao Supabase** por essa URL. Não passa pela
   Vercel, então o limite de 4,5 MB das funções não se aplica.
4. `acao: 'concluir'` confere se todos os arquivos chegaram e se o conteúdo bate com a
   extensão (um `.pdf` precisa ser PDF de verdade). Passou: status `pendente`.
   Não passou: arquivos apagados e status `descartado`.

Arquivos ficam no bucket `envios`, em `<pagina>/<id do envio>/01-nome.ext`.

### Limites

| Limite | Valor | Onde |
|---|---|---|
| Envios por IP | 10 por hora | `LIMITE_IP_HORA` em `api/enviar-resumo.js` |
| Envios no total | 300 por dia | `LIMITE_DIA` |
| Arquivos por envio | 10 | `MAX_ARQUIVOS` |
| Tamanho por arquivo | 20 MB | `MAX_ARQUIVO` e `file_size_limit` do bucket |
| Texto | 50.000 caracteres | `MAX_TEXTO` e `check` da tabela |

No 4G o IP é dividido com outros clientes da operadora (CGNAT) e muda ao ligar e
desligar o modo avião. O limite por IP barra abuso casual; quem segura um ataque de
verdade é o teto diário.

## Configuração (uma vez)

1. No Supabase: **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql`
   e clique em **Run**. Isso cria a tabela, o bucket privado e liga o RLS.
2. Em **Project Settings → API Keys**, copie a **Secret key** (`sb_secret_…`).
   Se o projeto só mostrar as chaves antigas, use a `service_role`.
   **Nunca** use essa chave no navegador nem cole em chat.
3. Na Vercel, em Settings → Environment Variables:
   - `SUPABASE_URL` = `https://xkwbektxxmonqlpkewcq.supabase.co`
   - `SUPABASE_SECRET_KEY` = a chave do passo 2
   - `CRON_SECRET` = uma senha aleatória qualquer (protege o cron)
4. Faça um novo deploy.

Sem as variáveis, o formulário aparece mas responde "Envio de resumos ainda não
configurado."

### Pausa do plano grátis

Projeto grátis do Supabase pausa após 7 dias sem uso. O cron `api/manter-ativo.js`
(configurado em `vercel.json`, todo dia às 9h17 UTC) consulta o banco para evitar isso
e apaga envios que ficaram mais de 1 dia em `enviando` (o aluno fechou a página no meio).
Se mesmo assim o projeto pausar, é só reativar no painel do Supabase.

## Juntando os envios

A ferramenta `ferramentas/envios.mjs` precisa de `SUPABASE_URL` e
`SUPABASE_SECRET_KEY` no ambiente. Nas sessões do Claude Code na nuvem, cadastre as
duas como **segredos do ambiente** (não no chat).

```
node ferramentas/envios.mjs listar [pagina]            # pendentes
node ferramentas/envios.mjs baixar historia-2tri       # → envios-baixados/historia-2tri/<id>/
node ferramentas/envios.mjs marcar incorporado <id...>
node ferramentas/envios.mjs marcar descartado <id...>
node ferramentas/envios.mjs apagar-arquivos <id...>    # libera espaço; o registro fica
```

`envios-baixados/` está no `.gitignore`: os envios nunca vão para o repositório público.

Numa sessão, peça algo como:

> Junta os envios pendentes de historia-2tri no resumo.

O fluxo esperado: baixar os pendentes da página, cruzar com o conteúdo que já existe,
incorporar só o que é novo e está correto (apontando divergências e erros em vez de
copiá-los), marcar os usados como `incorporado` e apagar os arquivos deles.

O plano grátis tem 1 GB de armazenamento: apagar os arquivos depois de incorporar evita
chegar perto disso.
