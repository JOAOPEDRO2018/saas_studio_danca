import type { SituacaoAluna, StatusMensalidade } from "@/lib/mensalidades";

export function Cabecalho({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{titulo}</h1>
      {descricao && <p className="mt-1 text-sm text-texto-medio">{descricao}</p>}
    </header>
  );
}

export function Cartao({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-borda bg-superficie p-5 shadow-[0_2px_8px_-2px_rgba(61,19,38,0.04)] ${className}`}>
      {children}
    </section>
  );
}

export function Indicador({ rotulo, valor, detalhe, destaque = false }: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <Cartao>
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-medio">{rotulo}</p>
      <p className={`mt-2 text-3xl font-bold ${destaque ? "text-rose-700" : ""}`}>{valor}</p>
      {detalhe && <p className="mt-1 text-sm text-texto-fraco">{detalhe}</p>}
    </Cartao>
  );
}

const estilosStatus: Record<StatusMensalidade | SituacaoAluna, { rotulo: string; classe: string }> = {
  paga: { rotulo: "Paga", classe: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "em-dia": { rotulo: "Em dia", classe: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pendente: { rotulo: "Pendente", classe: "bg-amber-50 text-amber-700 border-amber-200" },
  atrasada: { rotulo: "Atrasada", classe: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function SeloStatus({ status }: { status: StatusMensalidade | SituacaoAluna }) {
  const { rotulo, classe } = estilosStatus[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classe}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {rotulo}
    </span>
  );
}

export function Tabela({ colunas, children }: { colunas: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-borda bg-superficie">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-[#faf5f8] text-xs uppercase tracking-wide text-texto-medio">
          <tr>
            {colunas.map((c) => (
              <th key={c} className="px-4 py-3 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borda">{children}</tbody>
      </table>
    </div>
  );
}

export function Carregando() {
  return <p className="text-sm text-texto-fraco">Carregando…</p>;
}
