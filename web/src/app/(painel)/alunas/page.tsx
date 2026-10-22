import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BotaoLink, Cabecalho, Carregando, SeloStatus, Tabela } from "@/components/ui";
import { listarAlunas, listarMensalidades, listarTurmas } from "@/lib/dados";
import { formatarMoeda, formatarWhatsapp } from "@/lib/formatar";
import { situacaoDaAluna } from "@/lib/mensalidades";
import { hoje as dataDeHoje } from "@/lib/hoje";

export const metadata: Metadata = { title: "Alunas" };

async function ListaAlunas({ searchParams }: { searchParams: PageProps<"/alunas">["searchParams"] }) {
  const verInativas = (await searchParams).inativas === "1";
  const [hoje, todas, turmas, mensalidades] = await Promise.all([
    dataDeHoje(),
    listarAlunas(),
    listarTurmas(),
    listarMensalidades(),
  ]);
  const nomeDaTurma = new Map(turmas.map((t) => [t.id, t.nome]));
  const alunas = todas.filter((a) => a.ativa !== verInativas);
  const totalInativas = todas.filter((a) => !a.ativa).length;

  return (
    <>
      <p className="-mt-4 mb-6 text-sm text-texto-medio">
        {verInativas ? (
          <>
            {alunas.length} alunas inativas. <Link href="/alunas" className="font-semibold text-marca hover:text-marca-escura">Voltar para as ativas</Link>
          </>
        ) : (
          <>
            {alunas.length} alunas ativas.
            {totalInativas > 0 && (
              <> <Link href="/alunas?inativas=1" className="font-semibold text-marca hover:text-marca-escura">Ver inativas ({totalInativas})</Link></>
            )}
          </>
        )}
      </p>
      <Tabela colunas={["Aluna", "Turmas", "WhatsApp", "Vencimento", "Mensalidade", "Situação"]}>
        {alunas.map((aluna) => (
          <tr key={aluna.id} className="hover:bg-[#fdf8fa]">
            <td className="px-4 py-3 font-medium">
              <Link href={`/alunas/${aluna.id}`} className="hover:text-marca hover:underline">{aluna.nome}</Link>
            </td>
            <td className="px-4 py-3 text-texto-medio">{aluna.turmaIds.map((id) => nomeDaTurma.get(id)).join(", ") || "—"}</td>
            <td className="px-4 py-3 text-texto-medio">{formatarWhatsapp(aluna.whatsapp)}</td>
            <td className="px-4 py-3 text-texto-medio">dia {aluna.diaVencimento}</td>
            <td className="px-4 py-3">{formatarMoeda(aluna.valorMensalidade)}</td>
            <td className="px-4 py-3">
              <SeloStatus status={situacaoDaAluna(mensalidades.filter((m) => m.alunaId === aluna.id), hoje)} />
            </td>
          </tr>
        ))}
      </Tabela>
    </>
  );
}

export default function PaginaAlunas({ searchParams }: PageProps<"/alunas">) {
  return (
    <>
      <Cabecalho titulo="Alunas" acao={<BotaoLink href="/alunas/nova">Nova aluna</BotaoLink>} />
      <Suspense fallback={<Carregando />}>
        <ListaAlunas searchParams={searchParams} />
      </Suspense>
    </>
  );
}
