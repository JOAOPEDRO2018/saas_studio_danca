import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cabecalho, Carregando } from "@/components/ui";
import { buscarAluna, listarTurmas } from "@/lib/dados";
import { FormularioAluna } from "../formulario-aluna";

export const metadata: Metadata = { title: "Editar aluna" };

async function EditarAluna({ params }: { params: PageProps<"/alunas/[id]">["params"] }) {
  const { id } = await params;
  const [aluna, turmas] = await Promise.all([buscarAluna(id), listarTurmas()]);
  if (!aluna) notFound();
  return <FormularioAluna aluna={aluna} turmas={turmas} />;
}

export default function PaginaEditarAluna({ params }: PageProps<"/alunas/[id]">) {
  return (
    <>
      <Cabecalho titulo="Editar aluna" />
      <Suspense fallback={<Carregando />}>
        <EditarAluna params={params} />
      </Suspense>
    </>
  );
}
