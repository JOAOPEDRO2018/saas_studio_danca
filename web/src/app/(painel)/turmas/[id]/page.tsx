import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cabecalho, Carregando } from "@/components/ui";
import { buscarTurma } from "@/lib/dados";
import { FormularioTurma } from "../formulario-turma";

export const metadata: Metadata = { title: "Editar turma" };

async function EditarTurma({ params }: { params: PageProps<"/turmas/[id]">["params"] }) {
  const { id } = await params;
  const turma = await buscarTurma(id);
  if (!turma) notFound();
  return <FormularioTurma turma={turma} />;
}

export default function PaginaEditarTurma({ params }: PageProps<"/turmas/[id]">) {
  return (
    <>
      <Cabecalho titulo="Editar turma" />
      <Suspense fallback={<Carregando />}>
        <EditarTurma params={params} />
      </Suspense>
    </>
  );
}
