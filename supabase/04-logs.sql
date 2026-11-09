-- Logs de atividade: quem fez o quê, quando e em qual registro. Rode depois do
-- 03. Só a dona lê os logs (aba "Logs" do sistema), e ninguém altera nem apaga
-- um registro com menos de 1 ano.

create table logs (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  -- Sem "references auth.users": o registro continua no log mesmo que o login
  -- da pessoa seja apagado um dia.
  user_id uuid,
  -- Nome da pessoa no momento, 'Sistema' quando não há ninguém logado (rotinas
  -- automáticas, aviso do Asaas) ou o e-mail digitado numa tentativa de login.
  quem text not null,
  acao text not null check (acao in ('criou', 'alterou', 'removeu', 'entrou', 'saiu', 'senha_errada', 'sem_acesso')),
  tabela text,           -- turmas, alunas, matriculas ou mensalidades
  registro_id text,      -- id da linha afetada (na matrícula, o id da aluna)
  descricao text,        -- o "onde": nome da aluna, da turma...
  -- O "o que": {"campo": {"antes": valor, "depois": valor}}, só com os campos
  -- que mudaram.
  alteracoes jsonb
);

create index on logs (criado_em desc);
create index on logs (registro_id);

alter table logs enable row level security;

-- A pessoa logada é a dona? Mesma ideia da eh_da_equipe() do 03-login.sql.
create function public.eh_dona() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.equipe where user_id = auth.uid() and perfil = 'dona')
$$;

-- Só a dona lê. Não há regra de inclusão: quem grava são as funções abaixo
-- ("security definer" grava com permissão de dono, sem passar pelo RLS) e o
-- servidor do sistema, com a chave secreta, nas tentativas de login.
create policy "dona le os logs" on logs
  for select to authenticated
  using ((select public.eh_dona()));

-- Pelo site ninguém grava, altera, apaga nem esvazia a tabela, nem com login.
-- A chave secreta (service_role) continua podendo incluir (tentativas de
-- login) e apagar (limpeza anual), dentro das regras do trigger abaixo.
revoke insert, update, delete, truncate on logs from anon, authenticated;
revoke truncate on logs from service_role;

-- Proteção que vale até para a chave secreta (o RLS ela ignora; um trigger,
-- não). A exceção é o SQL Editor, que entra como dono da tabela: ele ainda
-- pode esvaziá-la (truncate) ou desligar este trigger. É de propósito, para
-- limpar os registros de teste antes de ir para produção.
--   inclusão: a data é sempre a de agora, ninguém grava um registro "antigo";
--   alteração: sempre recusada;
--   remoção: só de registros com mais de 1 ano (limpeza anual).
create function public.proteger_logs() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.criado_em := now();
    return new;
  end if;
  if tg_op = 'UPDATE' then
    raise exception 'Registros do log não podem ser alterados.';
  end if;
  if old.criado_em > now() - interval '1 year' then
    raise exception 'Registros do log com menos de 1 ano não podem ser apagados.';
  end if;
  return old;
end
$$;

create trigger proteger_logs
  before insert or update or delete on logs
  for each row execute function public.proteger_logs();

-- Registra cada inclusão, alteração e remoção nas tabelas do studio. Um
-- trigger é uma regra da própria tabela: roda a cada INSERT, UPDATE ou DELETE,
-- venha de uma tela, de uma rotina automática ou do SQL Editor.
create function public.registrar_alteracao() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  -- A linha antes e depois, como JSON: {"nome": "Ana", "ativa": true, ...}
  antes jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  depois jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  linha jsonb := coalesce(depois, antes);
  alteracoes jsonb := '{}';
  campo text;
  onde text;
begin
  -- Guarda só os campos com valor diferente. Na inclusão, o "antes" é vazio;
  -- na remoção, o "depois". Ids e datas de criação não interessam.
  for campo in select jsonb_object_keys(linha) loop
    continue when campo in ('id', 'criada_em', 'aluna_id', 'turma_id');
    if coalesce(antes -> campo, 'null') <> coalesce(depois -> campo, 'null') then
      alteracoes := alteracoes || jsonb_build_object(
        campo, jsonb_build_object('antes', antes -> campo, 'depois', depois -> campo));
    end if;
  end loop;

  -- Salvou sem mudar nada: não registra.
  if tg_op = 'UPDATE' and alteracoes = '{}' then
    return null;
  end if;

  onde := case tg_table_name
    when 'turmas' then linha ->> 'nome'
    when 'alunas' then linha ->> 'nome'
    when 'matriculas' then
      coalesce((select nome from public.alunas where id = (linha ->> 'aluna_id')::uuid), '(aluna removida)')
      || ' na turma ' ||
      coalesce((select nome from public.turmas where id = (linha ->> 'turma_id')::uuid), '(turma removida)')
    when 'mensalidades' then
      coalesce((select nome from public.alunas where id = (linha ->> 'aluna_id')::uuid), '(aluna removida)')
      || ', ' || (linha ->> 'referencia')
  end;

  insert into public.logs (user_id, quem, acao, tabela, registro_id, descricao, alteracoes)
  values (
    auth.uid(),
    coalesce((select nome from public.equipe where user_id = auth.uid()), 'Sistema'),
    case tg_op when 'INSERT' then 'criou' when 'UPDATE' then 'alterou' else 'removeu' end,
    tg_table_name,
    coalesce(linha ->> 'id', linha ->> 'aluna_id'),
    onde,
    nullif(alteracoes, '{}')
  );
  return null;
end
$$;

create trigger registrar_alteracao after insert or update or delete on turmas
  for each row execute function public.registrar_alteracao();
create trigger registrar_alteracao after insert or update or delete on alunas
  for each row execute function public.registrar_alteracao();
create trigger registrar_alteracao after insert or update or delete on matriculas
  for each row execute function public.registrar_alteracao();
create trigger registrar_alteracao after insert or update or delete on mensalidades
  for each row execute function public.registrar_alteracao();

-- Entrada e saída do sistema, chamada pelo login (web/src/app/login/acoes.ts).
-- Grava só para quem está na equipe, com o nome cadastrado.
create function public.registrar_acesso(p_acao text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_acao not in ('entrou', 'saiu') then
    raise exception 'Ação inválida: %', p_acao;
  end if;
  insert into public.logs (user_id, quem, acao)
  select user_id, nome, p_acao from public.equipe where user_id = auth.uid();
end
$$;

revoke execute on function public.registrar_acesso(text) from public, anon;
grant execute on function public.registrar_acesso(text) to authenticated;
