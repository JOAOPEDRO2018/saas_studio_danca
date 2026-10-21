-- Tabelas do IsaDance. Rode uma vez no SQL Editor do Supabase.

create table turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  professora text not null,
  dias smallint[] not null,            -- 0 = domingo ... 6 = sábado
  horario time not null,
  capacidade integer not null check (capacidade > 0),
  criada_em timestamptz not null default now()
);

create table alunas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,              -- só números, com DDI e DDD: 5511984521100
  dia_vencimento smallint not null check (dia_vencimento between 1 and 28),
  valor_mensalidade numeric(10, 2) not null check (valor_mensalidade > 0),
  ativa boolean not null default true,
  criada_em timestamptz not null default now()
);

-- Em quais turmas cada aluna está matriculada.
create table matriculas (
  aluna_id uuid not null references alunas (id) on delete cascade,
  turma_id uuid not null references turmas (id) on delete cascade,
  primary key (aluna_id, turma_id)
);

create table mensalidades (
  id uuid primary key default gen_random_uuid(),
  aluna_id uuid not null references alunas (id) on delete cascade,
  referencia text not null check (referencia ~ '^\d{4}-\d{2}$'),  -- "AAAA-MM"
  vencimento date not null,
  valor numeric(10, 2) not null check (valor > 0),
  paga_em date,
  criada_em timestamptz not null default now(),
  unique (aluna_id, referencia)
);

create index on mensalidades (vencimento);

-- Segurança: com o RLS ligado e sem nenhuma regra, ninguém lê as tabelas pela
-- chave pública. Por enquanto só o servidor do Next.js acessa, com a chave
-- secreta. As regras para a equipe logada entram na etapa do login.
alter table turmas enable row level security;
alter table alunas enable row level security;
alter table matriculas enable row level security;
alter table mensalidades enable row level security;
