import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho, Cartao, Carregando, SeloStatus, Tabela } from "@/components/ui";
import { alunaPorId, envioCobranca, mensalidadesExemplo, statusDa, type StatusMensalidade } from "@/lib/dados-exemplo";
import { formatarData, formatarMoeda, formatarReferencia } from "@/lib/formatar";
import { hoje as dataDeHoje } from "@/lib/hoje";

export const metadata: Metadata = { title: "Mensalidades" };

const filtros: { valor: StatusMensalidade | "todas"; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "atrasada", rotulo: "Atrasadas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "paga", rotulo: "Pagas" },
];

async function ListaMensalidades({ searchParams }: { searchParams: PageProps<"/mensalidades">["searchParams"] }) {
  const { status } = await searchParams;
  const filtro = filtros.some((f) => f.valor === status) ? (status as StatusMensalidade | "todas") : "todas";
  const hoje = await dataDeHoje();

  const mensalidades = mensalidadesExemplo(hoje)
    .map((m) => ({ ...m, status: statusDa(m, hoje), envio: envioCobranca(m, hoje) }))
    .filter((m) => filtro === "todas" || m.status === filtro)
    .sort((a, b) => b.vencimento.getTime() - a.vencimento.getTime());

  return (
    <>
      <nav className="mb-4 flex gap-2 overflow-x-auto">
        {filtros.map((f) => (
          <Link
            key={f.valor}
            href={f.valor === "todas" ? "/mensalidades" : `/mensalidades?status=${f.valor}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
              filtro === f.valor ? "bg-marca text-white" : "bg-superficie text-texto-medio border border-borda hover:bg-marca-clara"
            }`}
          >
            {f.rotulo}
          </Link>
        ))}
      </nav>

      <Tabela colunas={["Aluna", "Referência", "Vencimento", "Valor", "Situação", "Cobrança no WhatsApp"]}>
        {mensalidades.map((m) => (
          <tr key={m.id} className="hover:bg-[#fdf8fa]">
            <td className="px-4 py-3 font-medium">{alunaPorId(m.alunaId)?.nome}</td>
            <td className="px-4 py-3 text-texto-medio">{formatarReferencia(m.referencia)}</td>
            <td className="px-4 py-3 text-texto-medio">{formatarData(m.vencimento)}</td>
            <td className="px-4 py-3">{formatarMoeda(m.valor)}</td>
            <td className="px-4 py-3"><SeloStatus status={m.status} /></td>
            <td className="px-4 py-3 text-texto-medio">
              {m.status === "paga" ? `paga em ${formatarData(m.pagaEm!)}` : m.envio ? `boleto enviado em ${formatarData(m.envio)}` : "—"}
            </td>
          </tr>
        ))}
      </Tabela>
      {mensalidades.length === 0 && <p className="mt-4 text-sm text-texto-fraco">Nenhuma mensalidade neste filtro.</p>}
    </>
  );
}

export default function PaginaMensalidades({ searchParams }: PageProps<"/mensalidades">) {
  return (
    <>
      <Cabecalho titulo="Mensalidades" />
      <Cartao className="mb-6 text-sm text-texto-medio">
        <strong className="text-texto">Cobrança automática:</strong> se a mensalidade não for paga até o vencimento, no dia
        seguinte o sistema envia o boleto pelo WhatsApp da aluna. Quando o pagamento é confirmado, a mensalidade passa a
        constar como paga sozinha.
      </Cartao>
      <Suspense fallback={<Carregando />}>
        <ListaMensalidades searchParams={searchParams} />
      </Suspense>
    </>
  );
}
