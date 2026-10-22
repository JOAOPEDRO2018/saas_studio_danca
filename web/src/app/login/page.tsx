"use client";

import { useActionState } from "react";
import { estiloEntrada } from "@/components/formulario";
import { entrar } from "./acoes";

// Não há tela de cadastro: os acessos da equipe são criados no painel do
// Supabase (Authentication > Users).
export default function PaginaLogin() {
  const [estado, acao, enviando] = useActionState(entrar, {});

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={acao}
        className="w-full max-w-sm rounded-2xl border border-borda bg-superficie p-8 shadow-[0_24px_48px_-12px_rgba(61,19,38,0.12)]"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-marca font-bold text-white">ID</span>
          <span className="text-xl font-bold text-marca-escura">IsaDance</span>
        </div>
        <h1 className="text-xl font-bold">Entrar</h1>
        <p className="mb-6 mt-1 text-sm text-texto-medio">Acesse a gestão do studio.</p>

        {estado.erro && (
          <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{estado.erro}</p>
        )}

        <label className="mb-1 block text-sm font-semibold" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={estado.email}
          className={`mb-4 ${estiloEntrada}`} />

        <label className="mb-1 block text-sm font-semibold" htmlFor="senha">Senha</label>
        <input id="senha" name="senha" type="password" required autoComplete="current-password"
          className={`mb-6 ${estiloEntrada}`} />

        <button type="submit" disabled={enviando}
          className="h-11 w-full rounded-lg bg-marca font-semibold text-white hover:bg-marca-escura disabled:opacity-60">
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
