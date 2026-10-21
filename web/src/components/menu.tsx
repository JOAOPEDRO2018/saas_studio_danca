"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/", rotulo: "Painel" },
  { href: "/alunas", rotulo: "Alunas" },
  { href: "/turmas", rotulo: "Turmas" },
  { href: "/mensalidades", rotulo: "Mensalidades" },
];

export function Menu({ horizontal = false }: { horizontal?: boolean }) {
  const caminho = usePathname();
  return (
    <nav className={horizontal ? "flex gap-1 overflow-x-auto" : "flex flex-col gap-1"}>
      {itens.map((item) => {
        const ativo = item.href === "/" ? caminho === "/" : caminho.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              ativo ? "bg-marca text-white" : "text-texto-medio hover:bg-marca-clara hover:text-marca-escura"
            }`}
          >
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
