import type { Metadata } from "next";
import { Cabecalho, Tabela } from "@/components/ui";
import { alunas, turmas } from "@/lib/dados-exemplo";
import { nomesDias } from "@/lib/formatar";

export const metadata: Metadata = { title: "Turmas" };

export default function PaginaTurmas() {
  return (
    <>
      <Cabecalho titulo="Turmas" descricao="Horários e lotação de cada turma." />
      <Tabela colunas={["Turma", "Dias", "Horário", "Professora", "Alunas"]}>
        {turmas.map((turma) => {
          const matriculadas = alunas.filter((a) => a.ativa && a.turmaIds.includes(turma.id)).length;
          return (
            <tr key={turma.id} className="hover:bg-[#fdf8fa]">
              <td className="px-4 py-3 font-medium">{turma.nome}</td>
              <td className="px-4 py-3 text-texto-medio">{turma.dias.map((d) => nomesDias[d]).join(" e ")}</td>
              <td className="px-4 py-3 text-texto-medio">{turma.horario}</td>
              <td className="px-4 py-3 text-texto-medio">{turma.professora}</td>
              <td className="px-4 py-3">
                {matriculadas} / {turma.capacidade}
              </td>
            </tr>
          );
        })}
      </Tabela>
    </>
  );
}
