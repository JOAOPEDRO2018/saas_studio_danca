import type { Metadata } from "next";
import { Suspense } from "react";
import { Cabecalho, Carregando, SeloStatus, Tabela } from "@/components/ui";
import { listarAlunas, listarMensalidades, listarTurmas } from "@/lib/dados";
import { formatarMoeda, formatarWhatsapp } from "@/lib/formatar";
import { situacaoDaAluna } from "@/lib/mensalidades";
import { hoje as dataDeHoje } from "@/lib/hoje";

export const metadata: Metadata = { title: "Alunas" };

async function ListaAlunas() {
  const [hoje, alunas, turmas, mensalidades] = await Promise.all([
    dataDeHoje(),
    listarAlunas(),
    listarTurmas(),
    listarMensalidades(),
  ]);
  const nomeDaTurma = new Map(turmas.map((t) => [t.id, t.nome]));

  return (
    <>
      <p className="-mt-4 mb-6 text-sm text-texto-medio">{alunas.length} alunas matriculadas.</p>
      <Tabela colunas={["Aluna", "Turmas", "WhatsApp", "Vencimento", "Mensalidade", "Situação"]}>
        {alunas.map((aluna) => (
          <tr key={aluna.id} className="hover:bg-[#fdf8fa]">
            <td className="px-4 py-3 font-medium">{aluna.nome}</td>
            <td className="px-4 py-3 text-texto-medio">{aluna.turmaIds.map((id) => nomeDaTurma.get(id)).join(", ")}</td>
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

export default function PaginaAlunas() {
  return (
    <>
      <Cabecalho titulo="Alunas" />
      <Suspense fallback={<Carregando />}>
        <ListaAlunas />
      </Suspense>
    </>
  );
}
