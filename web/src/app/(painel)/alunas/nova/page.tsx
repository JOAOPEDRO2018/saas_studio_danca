import type { Metadata } from "next";
import { Suspense } from "react";
import { Cabecalho, Carregando } from "@/components/ui";
import { listarTurmas } from "@/lib/dados";
import { FormularioAluna } from "../formulario-aluna";

export const metadata: Metadata = { title: "Nova aluna" };

async function NovaAluna() {
  const turmas = await listarTurmas();
  return <FormularioAluna turmas={turmas} />;
}

export default function PaginaNovaAluna() {
  return (
    <>
      <Cabecalho titulo="Nova aluna" />
      <Suspense fallback={<Carregando />}>
        <NovaAluna />
      </Suspense>
    </>
  );
}
