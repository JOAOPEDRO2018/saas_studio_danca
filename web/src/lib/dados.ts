import "server-only";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

// Leitura das tabelas do Supabase. As telas usam só estes tipos, sem saber
// como as colunas se chamam no banco.

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo

export type Turma = {
  id: string;
  nome: string;
  professora: string;
  dias: DiaSemana[];
  horario: string; // "HH:MM"
  capacidade: number;
};

export type Aluna = {
  id: string;
  nome: string;
  whatsapp: string; // só números, com DDI: "5511984521100"
  turmaIds: string[];
  diaVencimento: number;
  valorMensalidade: number;
  ativa: boolean;
};

export type Mensalidade = {
  id: string;
  alunaId: string;
  alunaNome: string;
  referencia: string; // "AAAA-MM"
  vencimento: Date;
  valor: number;
  pagaEm: Date | null;
};

// "2026-10-05" -> 5 de outubro à meia-noite no fuso local. `new Date(texto)`
// leria como meia-noite UTC, que no Brasil ainda é o dia anterior.
function lerData(texto: string) {
  const [ano, mes, dia] = texto.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

// Lança o erro do Supabase em vez de seguir com a lista vazia.
function exigir<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(`Erro ao ler o banco: ${error.message}`);
  return data as T;
}

export async function listarTurmas(): Promise<Turma[]> {
  await connection();
  const linhas = exigir(
    await supabase().from("turmas").select("id, nome, professora, dias, horario, capacidade").order("nome"),
  );
  return linhas.map((t) => ({ ...t, dias: t.dias as DiaSemana[], horario: t.horario.slice(0, 5) }));
}

export async function listarAlunas(): Promise<Aluna[]> {
  await connection();
  const linhas = exigir(
    await supabase()
      .from("alunas")
      .select("id, nome, whatsapp, dia_vencimento, valor_mensalidade, ativa, matriculas(turma_id)")
      .order("nome"),
  );
  return linhas.map((a) => ({
    id: a.id,
    nome: a.nome,
    whatsapp: a.whatsapp,
    turmaIds: a.matriculas.map((m: { turma_id: string }) => m.turma_id),
    diaVencimento: a.dia_vencimento,
    valorMensalidade: Number(a.valor_mensalidade),
    ativa: a.ativa,
  }));
}

export async function listarMensalidades(): Promise<Mensalidade[]> {
  await connection();
  const linhas = exigir(
    await supabase()
      .from("mensalidades")
      .select("id, aluna_id, referencia, vencimento, valor, paga_em, alunas(nome)")
      .order("vencimento", { ascending: false }),
  );
  return linhas.map((m) => ({
    id: m.id,
    alunaId: m.aluna_id,
    alunaNome: (m.alunas as unknown as { nome: string }).nome,
    referencia: m.referencia,
    vencimento: lerData(m.vencimento),
    valor: Number(m.valor),
    pagaEm: m.paga_em ? lerData(m.paga_em) : null,
  }));
}
