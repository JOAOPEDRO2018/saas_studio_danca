"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoFormulario } from "@/lib/formulario";
import { valoresDo } from "@/lib/formulario";
import { supabaseDaEquipe } from "@/lib/supabase";

// Cria a turma (id null) ou atualiza a turma com esse id.
export async function salvarTurma(id: string | null, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  // Confere o login primeiro: uma Server Action pode ser chamada sem passar pela tela.
  const db = await supabaseDaEquipe();
  const nome = String(formData.get("nome") ?? "").trim();
  const professora = String(formData.get("professora") ?? "").trim();
  const dias = formData.getAll("dias").map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  const horario = String(formData.get("horario") ?? "");
  const capacidade = Number(formData.get("capacidade"));

  const erros: Record<string, string> = {};
  if (!nome) erros.nome = "Informe o nome da turma.";
  if (!professora) erros.professora = "Informe a professora.";
  if (dias.length === 0) erros.dias = "Marque pelo menos um dia.";
  if (!/^\d{2}:\d{2}$/.test(horario)) erros.horario = "Informe o horário.";
  if (!Number.isInteger(capacidade) || capacidade < 1) erros.capacidade = "Informe quantas alunas cabem (1 ou mais).";
  if (Object.keys(erros).length > 0) return { erros, valores: valoresDo(formData) };

  const turma = { nome, professora, dias, horario, capacidade };
  const { error } = id
    ? await db.from("turmas").update(turma).eq("id", id)
    : await db.from("turmas").insert(turma);
  if (error) return { erros: { geral: `Não foi possível salvar: ${error.message}` }, valores: valoresDo(formData) };

  revalidatePath("/", "layout");
  redirect("/turmas");
}
