import type { Metadata } from "next";
import { Cabecalho } from "@/components/ui";
import { FormularioTurma } from "../formulario-turma";

export const metadata: Metadata = { title: "Nova turma" };

export default function PaginaNovaTurma() {
  return (
    <>
      <Cabecalho titulo="Nova turma" />
      <FormularioTurma />
    </>
  );
}
