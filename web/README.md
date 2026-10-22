# IsaDance: app Next.js

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o sistema em modo de desenvolvimento em http://localhost:3000 |
| `npm run build` | Gera a versão de produção (também checa os tipos) |
| `npm run lint` | Procura problemas no código |

## Configurar o Supabase (uma vez)

1. Crie uma conta em https://supabase.com e um projeto novo (região **South America (São Paulo)**). Guarde a senha do banco.
2. No projeto, abra **SQL Editor**, cole o conteúdo de `../supabase/01-tabelas.sql` e clique em **Run**. Depois faça o mesmo com `../supabase/02-dados-exemplo.sql`.
3. Copie `.env.example` para `.env.local` e preencha:
   - `SUPABASE_URL`: em **Project Settings > Data API**, o campo *Project URL*.
   - `SUPABASE_SECRET_KEY`: em **Project Settings > API Keys**, uma chave *Secret* (começa com `sb_secret_`).
4. Rode `npm run dev`.

## Onde fica cada coisa

| Caminho | Conteúdo |
|---|---|
| `src/app/(painel)/` | Telas com menu lateral: Painel (`page.tsx`), `alunas/`, `turmas/`, `mensalidades/` |
| `src/app/(painel)/alunas/` e `turmas/` | Lista (`page.tsx`), cadastro (`nova/`), edição (`[id]/`), formulário (`formulario-*.tsx`) e gravação no banco (`acoes.ts`) |
| `src/app/login/` | Tela de login (provisória) |
| `src/components/` | Peças visuais reaproveitadas (`ui.tsx`), campos de formulário (`formulario.tsx`) e o menu (`menu.tsx`) |
| `src/lib/supabase.ts` | Conexão com o Supabase (só no servidor, com a chave secreta) |
| `src/lib/dados.ts` | Leitura das tabelas e os tipos usados pelas telas |
| `src/lib/mensalidades.ts` | Regras das mensalidades: situação (paga, pendente, atrasada) e envio da cobrança |
| `../supabase/` | SQL das tabelas e dos dados de exemplo |
| `src/lib/hoje.ts` | Data atual no servidor (ver observação abaixo) |
| `src/app/globals.css` | Cores e fonte do design system |

## Observação: Cache Components

O projeto usa `cacheComponents` (ligado em `next.config.ts`). Com essa opção, uma tela que depende da hora da requisição, como a data de hoje ou dados do banco, precisa:

1. Ler esse dado dentro de um componente `async`, com `await hoje()` ou `await connection()`.
2. Ficar dentro de um `<Suspense>` na página.

As páginas `(painel)/page.tsx`, `alunas/page.tsx` e `mensalidades/page.tsx` seguem esse padrão.

## Como acrescentar um campo no cadastro

Exemplo: o cliente pede a data de nascimento da aluna.

1. **Banco:** no SQL Editor do Supabase, `alter table alunas add column data_nascimento date;` (e guarde o comando num arquivo novo em `../supabase/`).
2. **Leitura:** em `src/lib/dados.ts`, acrescente o campo no tipo `Aluna`, em `colunasAluna`, em `LinhaAluna` e em `paraAluna`.
3. **Gravação:** em `src/app/(painel)/alunas/acoes.ts`, leia o campo do `formData`, valide se precisar e inclua no objeto `aluna`.
4. **Tela:** em `formulario-aluna.tsx`, acrescente um `<Campo>` com o `<input>`.
