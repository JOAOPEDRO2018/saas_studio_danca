import Link from "next/link";
import { Menu } from "@/components/menu";

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
        <Link href="/login" className="mt-auto px-4 text-sm text-texto-fraco hover:text-marca-escura">
          Sair
        </Link>
      </aside>

      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-borda bg-superficie px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Marca />
          <Link href="/login" className="text-sm text-texto-fraco">Sair</Link>
        </div>
        <Menu horizontal />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
