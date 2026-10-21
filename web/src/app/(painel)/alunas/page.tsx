import type { Metadata } from "next";
import { Suspense } from "react";
import { Cabecalho, Carregando, SeloStatus, Tabela } from "@/components/ui";
import { alunas, mensalidadesExemplo, statusDa, turmaPorId, type StatusMensalidade } from "@/lib/dados-exemplo";
import { formatarMoeda } from "@/lib/formatar";
import { hoje as dataDeHoje } from "@/lib/hoje";

export const metadata: Metadata = { title: "Alunas" };

// A situação da aluna é a pior entre as mensalidades dela: atrasada > pendente > paga.
const gravidade: Record<StatusMensalidade, number> = { paga: 0, pendente: 1, atrasada: 2 };

async function ListaAlunas() {
  const hoje = await dataDeHoje();
  const mensalidades = mensalidadesExemplo(hoje);

  return (
    <Tabela colunas={["Aluna", "Turmas", "WhatsApp", "Vencimento", "Mensalidade", "Situação"]}>
      {alunas.map((aluna) => {
        const situacao = mensalidades
          .filter((m) => m.alunaId === aluna.id)
          .map((m) => statusDa(m, hoje))
          .reduce<StatusMensalidade>((pior, s) => (gravidade[s] > gravidade[pior] ? s : pior), "paga");
        return (
          <tr key={aluna.id} className="hover:bg-[#fdf8fa]">
            <td className="px-4 py-3 font-medium">{aluna.nome}</td>
            <td className="px-4 py-3 text-texto-medio">
              {aluna.turmaIds.map((id) => turmaPorId(id)?.nome).join(", ")}
            </td>
            <td className="px-4 py-3 text-texto-medio">{aluna.whatsapp}</td>
            <td className="px-4 py-3 text-texto-medio">dia {aluna.diaVencimento}</td>
            <td className="px-4 py-3">{formatarMoeda(aluna.valorMensalidade)}</td>
            <td className="px-4 py-3"><SeloStatus status={situacao} /></td>
          </tr>
        );
      })}
    </Tabela>
  );
}

export default function PaginaAlunas() {
  return (
    <>
      <Cabecalho titulo="Alunas" descricao={`${alunas.length} alunas matriculadas.`} />
      <Suspense fallback={<Carregando />}>
        <ListaAlunas />
      </Suspense>
    </>
  );
}
