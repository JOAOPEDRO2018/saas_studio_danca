"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const itens = [
  { href: "/", rotulo: "Painel" },
  { href: "/alunas", rotulo: "Alunas" },
  { href: "/turmas", rotulo: "Turmas" },
  { href: "/mensalidades", rotulo: "Mensalidades" },
];

// Em rotas como /alunas/[id], o endereço só é conhecido na requisição. O
// Suspense deixa o Next gerar antes o menu sem destaque e destacar o item
// atual quando o endereço chega.
export function Menu({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <Suspense fallback={<Itens horizontal={horizontal} caminho={null} />}>
      <MenuComDestaque horizontal={horizontal} />
    </Suspense>
  );
}

function MenuComDestaque({ horizontal }: { horizontal: boolean }) {
  return <Itens horizontal={horizontal} caminho={usePathname()} />;
}

function Itens({ horizontal, caminho }: { horizontal: boolean; caminho: string | null }) {
  return (
    <nav className={horizontal ? "flex gap-1 overflow-x-auto" : "flex flex-col gap-1"}>
      {itens.map((item) => {
        const ativo = caminho !== null && (item.href === "/" ? caminho === "/" : caminho.startsWith(item.href));
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
