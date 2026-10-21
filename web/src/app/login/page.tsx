"use client";

import { useRouter } from "next/navigation";

// Login provisório: só leva ao painel. A autenticação de verdade (Supabase Auth)
// entra numa etapa seguinte.
export default function PaginaLogin() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/");
        }}
        className="w-full max-w-sm rounded-2xl border border-borda bg-superficie p-8 shadow-[0_24px_48px_-12px_rgba(61,19,38,0.12)]"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-marca font-bold text-white">ID</span>
          <span className="text-xl font-bold text-marca-escura">IsaDance</span>
        </div>
        <h1 className="text-xl font-bold">Entrar</h1>
        <p className="mb-6 mt-1 text-sm text-texto-medio">Acesse a gestão do studio.</p>

        <label className="mb-1 block text-sm font-semibold" htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="email"
          className="mb-4 h-11 w-full rounded-lg border border-[#e3d3dc] px-3 outline-none focus:border-marca focus:ring-3 focus:ring-marca/15" />

        <label className="mb-1 block text-sm font-semibold" htmlFor="senha">Senha</label>
        <input id="senha" type="password" required autoComplete="current-password"
          className="mb-6 h-11 w-full rounded-lg border border-[#e3d3dc] px-3 outline-none focus:border-marca focus:ring-3 focus:ring-marca/15" />

        <button type="submit" className="h-11 w-full rounded-lg bg-marca font-semibold text-white hover:bg-marca-escura">
          Entrar
        </button>
      </form>
    </main>
  );
}
