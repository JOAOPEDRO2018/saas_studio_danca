import Link from "next/link";
import { Suspense } from "react";
import { Menu } from "@/components/menu";
import { membroAtual } from "@/lib/supabase";
import { sair } from "../login/acoes";

function BotaoSair({ className }: { className: string }) {
  return (
    <form action={sair} className={className}>
      <button type="submit" className="text-sm text-texto-fraco hover:text-marca-escura">Sair</button>
    </form>
  );
}

const nomesPerfis = { dona: "Dona", recepcao: "Recepção" };

// Quem está conectado. Lê a sessão, por isso fica dentro de um Suspense.
async function UsuarioLogado() {
  const membro = await membroAtual();
  return (
    <p className="px-4 text-sm">
      <span className="block font-semibold">{membro.nome}</span>
      <span className="text-texto-fraco">{nomesPerfis[membro.perfil]}</span>
    </p>
  );
}

function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-marca text-sm font-bold text-white">ID</span>
      <span className="text-lg font-bold text-marca-escura">IsaDance</span>
    </Link>
  );
}

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 flex-col gap-8 border-r border-borda bg-superficie p-5 md:flex">
        <Marca />
        <Menu />
        <div className="mt-auto flex flex-col gap-3">
          <Suspense>
            <UsuarioLogado />
          </Suspense>
          <BotaoSair className="px-4" />
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-borda bg-superficie px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Marca />
          <BotaoSair className="" />
        </div>
        <Menu horizontal />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
