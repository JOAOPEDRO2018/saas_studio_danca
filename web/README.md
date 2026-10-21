# IsaDance: app Next.js

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o sistema em modo de desenvolvimento em http://localhost:3000 |
| `npm run build` | Gera a versão de produção (também checa os tipos) |
| `npm run lint` | Procura problemas no código |

## Onde fica cada coisa

| Caminho | Conteúdo |
|---|---|
| `src/app/(painel)/` | Telas com menu lateral: Painel (`page.tsx`), `alunas/`, `turmas/`, `mensalidades/` |
| `src/app/login/` | Tela de login (provisória) |
| `src/components/` | Peças visuais reaproveitadas (`ui.tsx`) e o menu (`menu.tsx`) |
| `src/lib/dados-exemplo.ts` | Dados de exemplo e regras de status das mensalidades. Será trocado pelo Supabase. |
| `src/lib/hoje.ts` | Data atual no servidor (ver observação abaixo) |
| `src/app/globals.css` | Cores e fonte do design system |

## Observação: Cache Components

O projeto usa `cacheComponents` (ligado em `next.config.ts`). Com essa opção, uma tela que depende da hora da requisição, como a data de hoje ou dados do banco, precisa:

1. Ler esse dado dentro de um componente `async`, com `await hoje()` ou `await connection()`.
2. Ficar dentro de um `<Suspense>` na página.

As páginas `(painel)/page.tsx`, `alunas/page.tsx` e `mensalidades/page.tsx` seguem esse padrão.
