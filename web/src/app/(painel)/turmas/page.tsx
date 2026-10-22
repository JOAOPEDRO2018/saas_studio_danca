import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BotaoLink, Cabecalho, Carregando, Tabela } from "@/components/ui";
import { listarAlunas, listarTurmas } from "@/lib/dados";
import { nomesDias } from "@/lib/formatar";

export const metadata: Metadata = { title: "Turmas" };

async function ListaTurmas() {
  const [turmas, alunas] = await Promise.all([listarTurmas(), listarAlunas()]);

  return (
    <Tabela colunas={["Turma", "Dias", "Horário", "Professora", "Alunas"]}>
      {turmas.map((turma) => {
        const matriculadas = alunas.filter((a) => a.ativa && a.turmaIds.includes(turma.id)).length;
        return (
          <tr key={turma.id} className="hover:bg-[#fdf8fa]">
            <td className="px-4 py-3 font-medium">
              <Link href={`/turmas/${turma.id}`} className="hover:text-marca hover:underline">{turma.nome}</Link>
            </td>
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
  );
}

export default function PaginaTurmas() {
  return (
    <>
      <Cabecalho titulo="Turmas" descricao="Horários e lotação de cada turma." acao={<BotaoLink href="/turmas/nova">Nova turma</BotaoLink>} />
      <Suspense fallback={<Carregando />}>
        <ListaTurmas />
      </Suspense>
    </>
  );
}
