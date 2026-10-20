-- ═══════════════════════════════════════════════════════════
-- schema.sql — Envios de resumos dos alunos
-- Rode uma vez no Supabase: SQL Editor → New query → colar → Run.
-- Pode rodar de novo sem quebrar nada.
--
-- RLS ligado e NENHUMA policy: as chaves públicas (anon/publishable)
-- não leem nem escrevem nada. Só a chave secreta, usada pelas
-- funções da Vercel e por ferramentas/envios.mjs, tem acesso.
-- ═══════════════════════════════════════════════════════════

create table if not exists public.envios (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),
  pagina     text not null check (pagina ~ '^[a-z]+-[0-9]tri(-[a-z]+)?$'),
  nome       text not null default '',
  assunto    text not null default '',
  texto      text not null default '' check (char_length(texto) <= 50000),
  arquivos   jsonb not null default '[]'::jsonb,
  status     text not null default 'enviando'
             check (status in ('enviando', 'pendente', 'incorporado', 'descartado')),
  ip_hash    text not null default ''
);

create index if not exists envios_pagina_status on public.envios (pagina, status);
create index if not exists envios_ip_criado on public.envios (ip_hash, criado_em);
create index if not exists envios_criado on public.envios (criado_em);

alter table public.envios enable row level security;

-- Bucket privado. Limite de tamanho e tipos aceitos valem no próprio Supabase,
-- mesmo que alguém pule o formulário.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'envios', 'envios', false, 20971520,
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain', 'text/markdown'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
