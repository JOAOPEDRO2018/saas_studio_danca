# Etapa 6: Logs de atividade — Plano de implementação

> **Para quem for executar:** use superpowers:executing-plans (ou superpowers:subagent-driven-development) para seguir este plano tarefa por tarefa. Os passos usam caixas de marcar (`- [ ]`).

**Objetivo:** registrar quem fez o quê, quando e em qual registro, e mostrar isso numa aba "Logs" que só a dona vê.

**Arquitetura:** as alterações de dados são registradas pelo próprio Postgres, com *triggers* nas tabelas `turmas`, `alunas`, `matriculas` e `mensalidades`; assim nenhuma mudança escapa, venha de uma tela, de uma rotina automática ou do Asaas. Entradas, saídas e tentativas de login são registradas pelo app, na Server Action de login. A tabela `logs` só aceita inclusão: nem a chave secreta consegue alterar ou apagar um registro com menos de 1 ano.

**Tecnologias:** Postgres/Supabase (triggers, RLS, funções `security definer`), Next.js 16 (Server Components, `cacheComponents`), testes com `node:test` do Node 24 (sem dependência nova).

**Especificação:** `docs/plano.md`, seção "Equipe e logs (definido em 21/10/2026)".

## Regras gerais

- Textos da tela em português, no mesmo estilo das telas atuais.
- Data e hora dos logs sempre no horário de Brasília (`America/Sao_Paulo`), mesmo que o servidor esteja em UTC (como será na AWS).
- Com `cacheComponents`, toda leitura de sessão ou do banco fica num componente `async` dentro de `<Suspense>`, e `connection()` vem antes de criar o cliente do Supabase (ver `src/lib/supabase.ts`).
- Parar o servidor de desenvolvimento (porta 3010) antes de rodar `npm run build`.
- Nenhuma dependência nova: os testes usam `node:test` e `node:assert`.
- Ao final: commit e push para o GitHub.

## Pontos de atenção (o que mais pode dar errado na prática)

1. **Salvar sem mudar nada** não pode gerar registro de "alterou" vazio. → teste no banco na Tarefa 1 e conferência na tela na Tarefa 5.
2. **Mudar só as turmas de uma aluna** deve registrar só as turmas incluídas ou retiradas. Hoje o sistema apaga e recria todas as matrículas a cada salvamento, o que encheria o log de registros falsos. → teste automático na Tarefa 2 e conferência na tela na Tarefa 5.
3. **A recepção não pode ver os logs** de jeito nenhum: nem o item no menu, nem a página `/logs`, nem pelo banco direto. → testes nas Tarefas 1 e 5.
4. **Mudanças sem pessoa logada** (chave secreta, futuro aviso do Asaas) aparecem como "Sistema". → teste na Tarefa 1.
5. **Ninguém altera nem apaga** um registro com menos de 1 ano, nem com a chave secreta. → teste na Tarefa 1.

---

### Tarefa 1: Tabela de logs e triggers no banco

**Arquivos:**
- Criar: `supabase/04-logs.sql`
- Criar: `web/scripts/verificar-logs.ts` (verificação contra o banco real, com a chave secreta)

**Produz (usado pelas tarefas seguintes):**
- Tabela `logs`: `id bigint identity`, `criado_em timestamptz default now()`, `user_id uuid null` (sem chave estrangeira, para o registro sobreviver se o usuário for apagado), `quem text not null` (nome da pessoa no momento, `'Sistema'` sem usuário, ou o e-mail tentado no login), `acao text not null` com `check` em `('criou','alterou','removeu','entrou','saiu','senha_errada','sem_acesso')`, `tabela text null`, `registro_id text null`, `descricao text null` (o "onde"), `alteracoes jsonb null` no formato `{"campo": {"antes": valor, "depois": valor}}`.
- Função `public.eh_dona() returns boolean`, igual à `eh_da_equipe()` mas com `perfil = 'dona'`.
- Função `public.registrar_acesso(p_acao text) returns void`, `security definer`: grava `entrou` ou `saiu` para `auth.uid()`, com o nome tirado de `equipe`.

**Decisões:**
- Uma única função de trigger, `registrar_alteracao()`, `security definer`, ligada como `after insert or update or delete ... for each row` nas 4 tabelas.
- `quem` = nome em `equipe` para `auth.uid()`; se não houver usuário, `'Sistema'`.
- "Onde" (`descricao`): turma → nome; aluna → nome; matrícula → `"<aluna> na turma <turma>"`; mensalidade → `"<aluna>, <AAAA-MM>"`.
- "O que": em `insert`, todos os campos com `antes` nulo; em `delete`, todos com `depois` nulo; em `update`, só os campos com valor diferente. Ficam de fora `id`, `criada_em` e as chaves das matrículas. Um `update` sem nenhum campo diferente não grava nada.
- RLS em `logs`: uma única policy, `for select to authenticated using ((select public.eh_dona()))`. Sem policy de inclusão: só as funções `security definer` gravam.
- Trigger `before update or delete` em `logs`, que recusa qualquer `update` e qualquer `delete` de registro com `criado_em` a menos de 1 ano. O `delete` de registros com mais de 1 ano fica liberado para a limpeza da Etapa 10.

- [ ] **Passo 1: Escrever `web/scripts/verificar-logs.ts`**, rodado com `node --env-file=.env.local scripts/verificar-logs.ts`, usando o cliente com a chave secreta. Ele faz e confere, imprimindo `ok`/`FALHOU` em cada item:
  - cria a turma `"Teste de log"`: 1 registro `criou`, `quem = 'Sistema'`, `descricao = 'Teste de log'`;
  - altera a capacidade de 10 para 12: 1 registro `alterou` com `alteracoes = {"capacidade": {"antes": 10, "depois": 12}}`;
  - salva a turma sem mudar nada: **nenhum** registro novo;
  - apaga a turma: 1 registro `removeu`;
  - tenta `update` e `delete` no registro mais recente de `logs`: os dois recusados com erro;
  - com a chave publicável, sem login, `select` em `logs`: 0 linhas.
- [ ] **Passo 2: Rodar e ver falhar.** Esperado: erro de tabela `logs` inexistente.
- [ ] **Passo 3: Escrever `supabase/04-logs.sql`** seguindo as decisões acima, com comentários no estilo do `03-login.sql`.
- [ ] **Passo 4: Você roda o `04-logs.sql`** no SQL Editor do Supabase.
- [ ] **Passo 5: Rodar o script de novo.** Esperado: todos os itens `ok`.

Observação: os registros do teste ficam gravados no log (ninguém apaga). Isso é aceitável no banco de desenvolvimento. Antes da Etapa 11 (produção), a tabela é esvaziada pelo SQL Editor (`truncate logs`).

### Tarefa 2: Matrículas alteradas só quando mudam

**Arquivos:**
- Modificar: `web/src/app/(painel)/alunas/acoes.ts` (bloco "Troca as matrículas…")
- Modificar: `web/scripts/verificar-logs.ts` (novo item)

**Decisão:** ler as matrículas atuais da aluna, apagar só as turmas desmarcadas (`.delete().eq("aluna_id", …).in("turma_id", removidas)`) e incluir só as marcadas que ainda não existiam. A comparação fica numa função pura `diferencaDeTurmas(atuais: string[], marcadas: string[]): { incluir: string[]; retirar: string[] }`, em `web/src/lib/matriculas.ts` (sem imports, para poder ser testada com `node:test`).

- [ ] **Passo 1: Teste `web/src/lib/matriculas.test.ts`**:
  - `diferencaDeTurmas(["a","b"], ["b","c"])` → `{ incluir: ["c"], retirar: ["a"] }`;
  - `diferencaDeTurmas(["a"], ["a"])` → `{ incluir: [], retirar: [] }`;
  - `diferencaDeTurmas([], [])` → `{ incluir: [], retirar: [] }`.
- [ ] **Passo 2: Criar o script `"test": "node --test src/**/*.test.ts"` em `web/package.json` e rodar `npm test`.** Esperado: FALHA, função inexistente.
- [ ] **Passo 3: Implementar `diferencaDeTurmas` e usar em `salvarAluna`.**
- [ ] **Passo 4: `npm test`.** Esperado: PASSA. (A conferência na tela, editando só as turmas de uma aluna, fica no Passo 5 da Tarefa 5, porque `salvarAluna` exige alguém logado.)

### Tarefa 3: Entradas, saídas e tentativas de login

**Arquivos:**
- Modificar: `web/src/app/login/acoes.ts`

**Consome:** `registrar_acesso(p_acao)` (Tarefa 1) e `supabaseAdmin()` (de `src/lib/supabase.ts`).

**Decisões:**
- Login certo e da equipe: `rpc("registrar_acesso", { p_acao: "entrou" })` com o cliente já logado.
- Senha errada: `supabaseAdmin().from("logs").insert({ acao: "senha_errada", quem: <e-mail digitado> })`.
- Login certo, mas fora da equipe: igual, com `acao: "sem_acesso"`.
- Sair: `rpc("registrar_acesso", { p_acao: "saiu" })` **antes** do `signOut`.
- Se a gravação do log falhar, o login não é bloqueado. O erro vai para o console do servidor.

- [ ] **Passo 1: Implementar as quatro gravações.**
- [ ] **Passo 2: `npx tsc --noEmit` e `npm run lint`.** Esperado: sem erros.
- [ ] **Passo 3: Você testa** (senhas são sempre com você): uma tentativa com senha errada, depois entrar e sair com a sua conta. A conferência no log é feita no Passo 5 da Tarefa 5.

### Tarefa 4: Textos dos registros (funções puras e testes)

**Arquivos:**
- Criar: `web/src/lib/logs-formatar.ts` (sem imports, exceto `import type`)
- Criar: `web/src/lib/logs-formatar.test.ts`
- Criar: `web/src/lib/formatar.test.ts` (os 10 casos de WhatsApp já testados à mão em 21/10, agora como teste automático)

**Produz:**
- `type AcaoLog = "criou" | "alterou" | "removeu" | "entrou" | "saiu" | "senha_errada" | "sem_acesso"`
- `type RegistroLog = { id: number; criadoEm: Date; quem: string; acao: AcaoLog; tabela: string | null; descricao: string | null; alteracoes: Record<string, { antes: unknown; depois: unknown }> | null }`
- `formatarDataHora(data: Date): string` → `"08/11/2026 14:05"`, sempre no fuso `America/Sao_Paulo`
- `descreverAcao(r: RegistroLog): string` → ex.: `"Alterou a aluna"`, `"Entrou no sistema"`, `"Tentou entrar com senha errada"`
- `descreverAlteracoes(tabela: string | null, alteracoes: RegistroLog["alteracoes"]): string[]` → uma linha por campo, `"Rótulo: antes → depois"`

**Rótulos e formatos:** `nome` Nome; `professora` Professora; `whatsapp` WhatsApp (formatado `(11) 98452-1100`); `dia_vencimento` Dia do vencimento (`dia 10`); `valor_mensalidade` e `valor` Valor (`R$ 340,00`); `ativa` Situação (`ativa`/`inativa`); `dias` Dias (`Seg e Qua`); `horario` Horário (`17:00`); `capacidade` Capacidade; `vencimento` Vencimento (`05/10/2026`); `paga_em` Pagamento (`05/10/2026`; nulo → `não pago`). Valor ausente → `—`.

- [ ] **Passo 1: Escrever os testes:**
  - `formatarDataHora(new Date("2026-11-08T17:05:00Z"))` → `"08/11/2026 14:05"`;
  - `descreverAlteracoes("alunas", { valor_mensalidade: { antes: 340, depois: 360 } })` → `["Valor: R$ 340,00 → R$ 360,00"]`;
  - `descreverAlteracoes("alunas", { ativa: { antes: true, depois: false } })` → `["Situação: ativa → inativa"]`;
  - `descreverAlteracoes("mensalidades", { paga_em: { antes: null, depois: "2026-10-05" } })` → `["Pagamento: não pago → 05/10/2026"]`;
  - `descreverAlteracoes("turmas", { dias: { antes: [1, 3], depois: [2, 4] } })` → `["Dias: Seg e Qua → Ter e Qui"]`;
  - `descreverAcao` para `alterou` + `alunas` → `"Alterou a aluna"`; para `senha_errada` → `"Tentou entrar com senha errada"`;
  - `formatar.test.ts`: os 10 casos de `normalizarWhatsapp`.
- [ ] **Passo 2: `npm test`.** Esperado: FALHA em `logs-formatar`; os testes de WhatsApp passam.
- [ ] **Passo 3: Implementar `logs-formatar.ts`.**
- [ ] **Passo 4: `npm test`.** Esperado: tudo PASSA.

### Tarefa 5: Aba "Logs" só para a dona

**Arquivos:**
- Criar: `web/src/lib/logs.ts` (leitura, `server-only`)
- Criar: `web/src/app/(painel)/logs/page.tsx`
- Modificar: `web/src/components/menu.tsx` (prop `ehDona: boolean`; item `{ href: "/logs", rotulo: "Logs" }` só quando verdadeiro)
- Modificar: `web/src/app/(painel)/layout.tsx` (o menu com o perfil carrega dentro de `<Suspense>`, com fallback `<Menu ehDona={false} />`)

**Consome:** `RegistroLog`, `formatarDataHora`, `descreverAcao` e `descreverAlteracoes` (Tarefa 4); `membroAtual()` e `supabaseDaEquipe()` (de `src/lib/supabase.ts`).
**Produz:** `listarLogs(pagina: number): Promise<{ itens: RegistroLog[]; temMais: boolean }>`, com 50 por página, do mais recente para o mais antigo.

**Tela:** título "Logs" e descrição "Atividades no sistema nos últimos 12 meses." Tabela com as colunas Quando, Quem, O que fez, Onde e Detalhes (uma linha por alteração). Abaixo, links "Mais recentes" e "Mais antigos" via `?pagina=N`. Página sem registros: "Nenhuma atividade registrada."

**Proteção:** se o perfil não for `dona`, a página chama `notFound()`. O RLS já devolve 0 linhas para a recepção; isto evita mostrar uma tela vazia.

- [ ] **Passo 1: Implementar `listarLogs`, a página, o menu e o layout.**
- [ ] **Passo 2: `npx next typegen`, `npx tsc --noEmit`, `npm run lint`.** Esperado: sem erros.
- [ ] **Passo 3: Conferir no navegador**, logado como a dona: a aba aparece, os registros das Tarefas 1 a 3 estão lá, com horário de Brasília e os textos da Tarefa 4. Sem nenhum aviso do Next no ícone "N".
- [ ] **Passo 4: Você testa com um acesso de recepção.** Crie um no Supabase e inclua em `equipe` com o perfil `recepcao`. Esperado: sem o item "Logs" no menu, e `/logs` mostrando "página não encontrada".
- [ ] **Passo 5: Você confere na aba Logs, logada como dona:**
  - a tentativa com senha errada (Tarefa 3) aparece com o e-mail digitado, e a sua entrada e saída aparecem com o seu nome;
  - editando o valor da mensalidade de uma aluna aparecem o seu nome, "Alterou a aluna", o nome da aluna e "Valor: R$ … → R$ …";
  - editando **só as turmas** de uma aluna aparece apenas a turma incluída ou retirada, sem "Alterou a aluna" e sem remover e recriar as outras;
  - salvando uma aluna **sem mudar nada**, não aparece nenhum registro novo.

### Tarefa 6: Fechamento

**Arquivos:**
- Modificar: `web/README.md` (passo do `04-logs.sql` na configuração; novos arquivos no mapa de pastas; `npm test` na tabela de comandos)
- Modificar: `docs/plano.md` (Etapa 6 → feito; Etapa 7 → próxima)

- [ ] **Passo 1: Parar o servidor de desenvolvimento, rodar `npm test` e `npm run build`.** Esperado: tudo passa.
- [ ] **Passo 2: Conferir que nenhuma chave vai junto** (`git diff` sem `sb_secret_`/`sb_publishable_` com valor).
- [ ] **Passo 3: Commit e push** (`Etapa 6: logs de atividade`).
