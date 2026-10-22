import type { Metadata } from "next";
import { sair } from "../login/acoes";

export const metadata: Metadata = { title: "Sem acesso" };

// Para quem tem login no Supabase mas não está na tabela equipe (por exemplo,
// foi removida enquanto estava com o sistema aberto).
export default function PaginaSemAcesso() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-borda bg-superficie p-8 text-center">
        <h1 className="text-xl font-bold">Acesso não liberado</h1>
        <p className="mt-2 text-sm text-texto-medio">Seu e-mail não está na equipe do studio. Fale com a dona do studio.</p>
        <form action={sair} className="mt-6">
          <button type="submit" className="h-11 w-full rounded-lg bg-marca font-semibold text-white hover:bg-marca-escura">
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
