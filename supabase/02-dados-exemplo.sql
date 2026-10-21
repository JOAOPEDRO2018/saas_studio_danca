-- Dados de exemplo, os mesmos do protótipo. Rode depois de 01-tabelas.sql.
-- As mensalidades são do mês passado e do mês atual, contados a partir do dia
-- em que o script rodar, para ter mensalidades pagas, pendentes e atrasadas.

insert into turmas (nome, professora, dias, horario, capacidade) values
  ('Baby Class',      'Juliana', '{6}',   '09:00', 10),
  ('Ballet Infantil', 'Isabela', '{1,3}', '17:00', 14),
  ('Jazz',            'Clara',   '{1,3}', '19:00', 16),
  ('Ballet Adulto',   'Isabela', '{2,4}', '19:00', 12),
  ('Dança do Ventre', 'Larissa', '{5}',   '18:00', 12);

insert into alunas (nome, whatsapp, dia_vencimento, valor_mensalidade) values
  ('Beatriz Mendonça', '5511984521100',  5, 220),
  ('Helena Duarte',    '5511971038821', 10, 180),
  ('Camila Rocha',     '5511965412993', 10, 340),
  ('Laura Fernandes',  '5511992184470', 15, 240),
  ('Sofia Martins',    '5511988773012',  5, 220),
  ('Marina Alves',     '5511974569081', 15, 200),
  ('Valentina Souza',  '5511963205547',  5, 180),
  ('Patrícia Lima',    '5511997846630', 10, 230);

insert into matriculas (aluna_id, turma_id)
select a.id, t.id
from (values
  ('Beatriz Mendonça', 'Ballet Infantil'),
  ('Helena Duarte',    'Baby Class'),
  ('Camila Rocha',     'Jazz'),
  ('Camila Rocha',     'Ballet Adulto'),
  ('Laura Fernandes',  'Ballet Adulto'),
  ('Sofia Martins',    'Ballet Infantil'),
  ('Marina Alves',     'Dança do Ventre'),
  ('Valentina Souza',  'Baby Class'),
  ('Patrícia Lima',    'Jazz')
) as m (aluna, turma)
join alunas a on a.nome = m.aluna
join turmas t on t.nome = m.turma;

-- Camila e Marina deixaram o mês passado em aberto; Beatriz, Helena, Laura e
-- Patrícia já pagaram o mês atual. As demais estão em aberto no mês atual.
with meses as (
  select date_trunc('month', current_date - interval '1 month')::date as inicio, true as passado
  union all
  select date_trunc('month', current_date)::date, false
),
geradas as (
  select
    a.id as aluna_id,
    to_char(m.inicio, 'YYYY-MM') as referencia,
    m.inicio + (a.dia_vencimento - 1) as vencimento,
    a.valor_mensalidade as valor,
    case
      when m.passado then a.nome not in ('Camila Rocha', 'Marina Alves')
      else a.nome in ('Beatriz Mendonça', 'Helena Duarte', 'Laura Fernandes', 'Patrícia Lima')
    end as paga
  from alunas a cross join meses m
)
insert into mensalidades (aluna_id, referencia, vencimento, valor, paga_em)
select aluna_id, referencia, vencimento, valor,
       case when paga then least(vencimento, current_date) end
from geradas;
