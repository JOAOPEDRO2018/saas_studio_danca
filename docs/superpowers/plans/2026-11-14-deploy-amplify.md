# Etapa 7: Primeiro deploy na AWS (Amplify) — Plano de implementação

> **Para quem for executar:** use superpowers:executing-plans para seguir este plano tarefa por tarefa. Os passos usam caixas de marcar (`- [ ]`).

**Objetivo:** o sistema no ar num endereço da AWS (`https://main.xxxx.amplifyapp.com`), publicado sozinho a cada push na `main`, funcionando igual ao modo de desenvolvimento.

**Arquitetura:** a Amplify Hosting, na região São Paulo (`sa-east-1`), lê o repositório do GitHub, roda o build da pasta `web/` e serve o sistema: as páginas e os arquivos pelo CloudFront (a rede de entrega da AWS) e as partes dinâmicas (login, banco) por funções que rodam sob demanda. O banco continua no Supabase, em São Paulo. É um **teste de fogo**: a Amplify só garante oficialmente o Next.js até a versão 15 e não faz streaming. Se o sistema não passar nos critérios da Tarefa 5, paramos e planejamos o plano B: a Vercel (feita pelos criadores do Next.js; plano Pro, cerca de US$ 20/mês, porque o grátis não permite uso comercial).

**Por que não voltar para o Next 15:** a 15 só recebe correções de segurança até 31/01/2027 (nextjs.org/support-policy), e a falta de streaming na Amplify vale para ela também. O downgrade trocaria um risco testável agora por um sistema sem correções de segurança daqui a dois meses.

**Tecnologias:** AWS Amplify Hosting, `amplify.yml`, Next.js 16.4.2, Node 22 no servidor da AWS.

**Decisões do usuário (14/11/2026):** testar a Amplify primeiro (mais barata para o porte do studio: estimativa de US$ 1 a 2/mês fora da cota gratuita); conta AWS nova, criada pelo usuário, no **plano gratuito** (6 meses sem cobrança; mudar para o pago antes do fim, quando o studio estiver usando); manter o Next.js 16; região São Paulo; endereço da própria AWS por enquanto (domínio próprio fica para a Etapa 11).

## Regras gerais

- Senhas, chaves e cartão: só o usuário digita. Eu explico cada tela e confiro o resultado de fora (pelo endereço público e pelos logs de build que o usuário colar).
- Nunca imprimir o valor das chaves, nem nos logs de build: o `amplify.yml` grava as variáveis num arquivo sem mostrá-las.
- Para a Amplify, só vão as três variáveis do Supabase (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`), nada além.
- Push no meio da etapa (Tarefa 2): a Amplify lê o `amplify.yml` do GitHub, então ele precisa estar lá antes de criar o app.

## Pontos de atenção

1. **Horário do servidor:** a AWS roda em UTC (3 horas à frente de Brasília). Das 21h à meia-noite, "hoje" viraria amanhã: aulas de amanhã no Painel, mensalidade do dia marcada como atrasada, mês seguinte no último dia. → Tarefa 1, com teste rodando em UTC.
2. **Página presa no "Carregando…":** sem streaming, a Amplify pode servir só a "casca" da página. → critério da Tarefa 5.
3. **Chaves não chegando ao servidor:** a Amplify não repassa as variáveis do console ao Next.js; o build precisa gravá-las em `.env.production`. → Tarefa 2; sintoma seria o erro "Falta SUPABASE_URL…".
4. **App na subpasta `web/`:** a Amplify trata como monorepo (`appRoot: web`). → Tarefa 2 e Tarefa 4.
5. **Gasto inesperado:** conta nova sem alerta de custo. → alerta de orçamento na Tarefa 3, antes de criar qualquer coisa.

---

### Tarefa 1: "Hoje" sempre no horário de Brasília

**Arquivos:**
- Criar: `web/src/lib/fuso.ts` (sem imports): `fusoDoStudio = "America/Sao_Paulo"` e `diaEmBrasilia(agora: Date): Date`, que devolve a data do calendário de Brasília à meia-noite no fuso do servidor, no mesmo formato de `lerData` em `dados.ts`.
- Criar: `web/src/lib/fuso.test.ts` (começa com `process.env.TZ = "UTC"`, simulando a AWS).
- Modificar: `web/src/lib/hoje.ts` (`return diaEmBrasilia(new Date())`).
- Modificar: `web/src/lib/logs-formatar.ts` (usar `fusoDoStudio` em vez da constante própria).

- [ ] **Passo 1: Testes**, com o servidor em UTC:
  - `diaEmBrasilia(new Date("2026-11-09T01:30:00Z"))` (22h30 de 08/11 em Brasília) → ano 2026, mês 10 (`getMonth`), dia 8, dia da semana 0 (domingo);
  - `diaEmBrasilia(new Date("2026-11-08T15:00:00Z"))` → dia 8;
  - `diaEmBrasilia(new Date("2026-12-01T02:00:00Z"))` (23h de 30/11) → mês 10, dia 30.
- [ ] **Passo 2: `npm test`.** Esperado: FALHA, módulo inexistente.
- [ ] **Passo 3: Implementar** com `Intl.DateTimeFormat(..., { timeZone: fusoDoStudio }).formatToParts`.
- [ ] **Passo 4: `npm test`, `npx tsc --noEmit`, `npm run lint`.** Esperado: tudo passa.

### Tarefa 2: Configuração de build da Amplify

**Arquivos:**
- Criar: `amplify.yml` na raiz do repositório.

**Conteúdo (formato monorepo, `appRoot: web`):**
- `preBuild`: `nvm install 22`, `nvm use 22`, `node --version`, `npm ci`.
- `build`: `env | grep -E '^SUPABASE_(URL|PUBLISHABLE_KEY|SECRET_KEY)=' >> .env.production` e `npm run build`.
- `artifacts`: `baseDirectory: .next`, `files: '**/*'`.
- `cache`: `node_modules/**/*` e `.next/cache/**/*`.

- [ ] **Passo 1: Escrever o `amplify.yml`.**
- [ ] **Passo 2: Build de um clone limpo**, numa pasta temporária, sem o `.env.local`: `git clone`, `npm ci`, `npm run build`. Esperado: build passa (prova que o build não depende de nada fora do git e que as chaves só são lidas quando alguém acessa).
- [ ] **Passo 3: Commit e push** da Tarefa 1 e do `amplify.yml` (`Etapa 7: amplify.yml e data de hoje no horário de Brasília`), conferindo antes que nenhuma chave vai junto.

### Tarefa 3: Conta na AWS (você, com o meu passo a passo)

- [ ] **Passo 1: Criar a conta** em aws.amazon.com (e-mail, senha, cartão, telefone). Na escolha de plano, escolher o **gratuito** (se as opções na tela forem diferentes disso, me diga antes de escolher).
- [ ] **Passo 2: MFA no usuário raiz** (o login com o e-mail da conta): autenticação em duas etapas com um app no celular.
- [ ] **Passo 3: Alertas de gasto** no AWS Budgets: um alerta "zero spend" (avisa no primeiro centavo) e um mensal de US$ 10, os dois para o seu e-mail.
- [ ] **Passo 4: Usuário do dia a dia** no IAM, com acesso ao console e permissão de administrador, também com MFA. Daqui para frente, entrar com ele, e não com o raiz.
- [ ] **Passo 5: Região** no canto superior direito do console: **América do Sul (São Paulo)**.

### Tarefa 4: Criar o app na Amplify (você, com o meu passo a passo)

- [ ] **Passo 1:** Amplify → "Create new app" → GitHub. Autorizar o app da Amplify **só no repositório** `saas_studio_danca`.
- [ ] **Passo 2:** branch `main`; marcar **"My app is a monorepo"**, pasta `web`.
- [ ] **Passo 3:** conferir que a Amplify leu o `amplify.yml` do repositório.
- [ ] **Passo 4:** em "Environment variables", criar as três variáveis do Supabase, copiando os valores do seu `web/.env.local`. A `AMPLIFY_MONOREPO_APP_ROOT=web` a Amplify cria sozinha.
- [ ] **Passo 5:** **não ativar** o firewall (WAF, US$ 15/mês), nem nada marcado como pago. "Save and deploy". Esperado: as fases Provision, Build e Deploy ficam verdes. Se alguma falhar, você copia o trecho vermelho do log e me manda.

### Tarefa 5: Conferir o sistema no ar

**Critérios para a Amplify ser aprovada (todos):**
- [ ] **Passo 1 (eu, pelo endereço público, sem senha):** `/login` responde 200; `/` sem login manda para `/login` (o `proxy.ts` funciona); os arquivos de estilo e script carregam.
- [ ] **Passo 2 (você):** entrar como dona e abrir Painel, Alunas, Turmas, Mensalidades e Logs. Esperado: todas mostram os dados; nenhuma fica presa em "Carregando…".
- [ ] **Passo 3 (você):** editar e salvar algo (por exemplo, o valor de uma aluna) e voltar ao valor antigo. Esperado: salva, e a aba Logs mostra as duas alterações com o seu nome e o horário de Brasília.
- [ ] **Passo 4 (você):** sair; entrar com a senha errada uma vez. Esperado: mensagem de erro e o registro "Tentou entrar com senha errada" na aba Logs.
- [ ] **Passo 5 (eu):** medir o tempo de resposta das páginas pelo endereço público, para registrar como referência.

**Se algum critério falhar:** investigo a causa antes de mexer em qualquer coisa. Se a causa for a Amplify não suportar o que o sistema usa, paramos e escrevo o plano B (Vercel). O app na Amplify pode ser apagado sem custo.

### Tarefa 6: Fechamento

**Arquivos:**
- Modificar: `web/README.md` (seção "Publicar na AWS": como o deploy funciona, onde ficam as variáveis, como ver os logs de build, como trocar uma chave).
- Modificar: `docs/plano.md` (Etapa 7 → feito; endereço e região registrados; decisão da Amplify).

- [ ] **Passo 1: `npm test` e `npm run build`** (com o servidor de desenvolvimento parado).
- [ ] **Passo 2: Conferir que nenhuma chave vai junto.**
- [ ] **Passo 3: Commit e push** (`Etapa 7: primeiro deploy na AWS Amplify`). Esse push também dispara um novo deploy, que confere o publicar automático.
