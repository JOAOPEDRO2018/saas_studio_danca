"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizarWhatsapp } from "@/lib/formatar";
import type { EstadoFormulario } from "@/lib/formulario";
import { valoresDo } from "@/lib/formulario";
import { supabase } from "@/lib/supabase";

// Cria a aluna (id null) ou atualiza a aluna com esse id, junto com as turmas
// em que ela está matriculada.
export async function salvarAluna(id: string | null, _estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = String(formData.get("nome") ?? "").trim();
  const whatsapp = normalizarWhatsapp(String(formData.get("whatsapp") ?? ""));
  const diaVencimento = Number(formData.get("diaVencimento"));
  const valor = Number(String(formData.get("valorMensalidade") ?? "").replace(",", "."));
  const turmaIds = formData.getAll("turmas").map(String);
  // Aluna nova entra sempre ativa; na edição vale a caixa "Aluna ativa".
  const ativa = id ? formData.get("ativa") === "sim" : true;

  const erros: Record<string, string> = {};
  if (!nome) erros.nome = "Informe o nome da aluna.";
  if (!whatsapp) erros.whatsapp = "Informe um celular com DDD, por exemplo (11) 98452-1100.";
  if (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 28) {
    erros.diaVencimento = "Escolha um dia entre 1 e 28.";
  }
  if (!(valor > 0)) erros.valorMensalidade = "Informe o valor da mensalidade.";
  if (Object.keys(erros).length > 0) return { erros, valores: valoresDo(formData) };

  const falha = (mensagem: string): EstadoFormulario => ({
    erros: { geral: `Não foi possível salvar: ${mensagem}` },
    valores: valoresDo(formData),
  });

  const aluna = { nome, whatsapp, dia_vencimento: diaVencimento, valor_mensalidade: valor, ativa };
  const salva = id
    ? await supabase().from("alunas").update(aluna).eq("id", id).select("id").single()
    : await supabase().from("alunas").insert(aluna).select("id").single();
  if (salva.error) return falha(salva.error.message);
  const alunaId = salva.data.id;

  // Troca as matrículas pelas turmas marcadas no formulário.
  const removidas = await supabase().from("matriculas").delete().eq("aluna_id", alunaId);
  if (removidas.error) return falha(removidas.error.message);
  if (turmaIds.length > 0) {
    const novas = await supabase().from("matriculas").insert(turmaIds.map((turma_id) => ({ aluna_id: alunaId, turma_id })));
    if (novas.error) return falha(novas.error.message);
  }

  revalidatePath("/", "layout");
  redirect("/alunas");
}
