-- Login da equipe e regras de acesso (RLS). Rode depois de 01 e 02.
-- Até aqui o RLS estava ligado sem nenhuma regra, então só a chave secreta
-- lia as tabelas.

-- Quem é da equipe do studio e com qual perfil. Ter login no Supabase não
-- basta: só quem está nesta tabela acessa os dados.
create table equipe (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  perfil text not null check (perfil in ('dona', 'recepcao')),
  criada_em timestamptz not null default now()
);

alter table equipe enable row level security;

-- A pessoa logada está na equipe? Usada nas regras abaixo.
-- "security definer" faz a função ler a tabela equipe com permissão de dono,
-- sem esbarrar no RLS da própria tabela equipe.
create function public.eh_da_equipe() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.equipe where user_id = auth.uid())
$$;

-- Uma policy funciona como um WHERE que o Postgres acrescenta sozinho em toda
-- consulta:
--   using (...)       filtra as linhas que a pessoa pode ver, alterar e apagar;
--   with check (...)  valida as linhas que ela tenta gravar.
-- "to authenticated" faz a regra valer só para quem fez login. Quem não está
-- logado não tem regra nenhuma, então não enxerga nada.
-- Dona e recepção podem tudo nestas tabelas. O "(select ...)" faz o Postgres
-- calcular a função uma vez por consulta, e não uma vez por linha.

create policy "equipe acessa turmas" on turmas
  for all to authenticated
  using ((select public.eh_da_equipe())) with check ((select public.eh_da_equipe()));

create policy "equipe acessa alunas" on alunas
  for all to authenticated
  using ((select public.eh_da_equipe())) with check ((select public.eh_da_equipe()));

create policy "equipe acessa matriculas" on matriculas
  for all to authenticated
  using ((select public.eh_da_equipe())) with check ((select public.eh_da_equipe()));

create policy "equipe acessa mensalidades" on mensalidades
  for all to authenticated
  using ((select public.eh_da_equipe())) with check ((select public.eh_da_equipe()));

-- Cada pessoa lê só a própria linha da equipe (o sistema usa para saber o
-- nome e o perfil de quem entrou). Ninguém altera a equipe pelo sistema:
-- isso é feito aqui no SQL Editor.
create policy "cada um ve o proprio cadastro" on equipe
  for select to authenticated
  using (user_id = (select auth.uid()));
