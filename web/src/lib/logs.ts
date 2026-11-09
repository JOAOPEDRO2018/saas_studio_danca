import "server-only";
import { connection } from "next/server";
import type { RegistroLog } from "@/lib/logs-formatar";
import { supabaseDaEquipe } from "@/lib/supabase";

const porPagina = 50;

type LinhaLog = Omit<RegistroLog, "criadoEm"> & { criado_em: string };

// Uma página do log, do mais recente para o mais antigo. Só a dona recebe
// linhas: para a recepção, o RLS devolve a lista vazia (supabase/04-logs.sql).
export async function listarLogs(pagina: number): Promise<{ itens: RegistroLog[]; temMais: boolean }> {
  await connection();
  const db = await supabaseDaEquipe();
  const inicio = (pagina - 1) * porPagina;
  // Pede um registro a mais só para saber se existe a página seguinte.
  const { data, error } = await db
    .from("logs")
    .select("id, criado_em, quem, acao, tabela, descricao, alteracoes")
    .order("id", { ascending: false })
    .range(inicio, inicio + porPagina);
  if (error) throw new Error(`Erro ao ler o banco: ${error.message}`);
  const linhas = data as LinhaLog[];
  return {
    itens: linhas.slice(0, porPagina).map(({ criado_em, ...resto }) => ({ ...resto, criadoEm: new Date(criado_em) })),
    temMais: linhas.length > porPagina,
  };
}
