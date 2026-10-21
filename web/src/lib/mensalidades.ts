import type { Mensalidade } from "@/lib/dados";

// Regras das mensalidades. Não dependem do banco, só dos dados já lidos.

export type StatusMensalidade = "paga" | "pendente" | "atrasada";

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function statusDa(mensalidade: Mensalidade, hoje: Date): StatusMensalidade {
  if (mensalidade.pagaEm) return "paga";
  return mensalidade.vencimento < inicioDoDia(hoje) ? "atrasada" : "pendente";
}

// Regra do cliente: 1 dia depois do vencimento sem pagamento, o sistema envia
// o boleto pelo WhatsApp. Retorna a data desse envio, ou null se ainda não houve.
export function envioCobranca(mensalidade: Mensalidade, hoje: Date): Date | null {
  if (mensalidade.pagaEm) return null;
  const envio = new Date(mensalidade.vencimento);
  envio.setDate(envio.getDate() + 1);
  return envio <= inicioDoDia(hoje) ? envio : null;
}

// Mês de uma data no formato das referências: "AAAA-MM".
export function referenciaDe(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export type SituacaoAluna = "em-dia" | "atrasada";

// Situação que aparece ao lado do nome da aluna: atrasada se alguma
// mensalidade dela (de qualquer mês) está atrasada; senão, em dia. Mensalidade
// que ainda não venceu não conta, e aluna sem mensalidades está em dia.
export function situacaoDaAluna(mensalidades: Mensalidade[], hoje: Date): SituacaoAluna {
  return mensalidades.some((m) => statusDa(m, hoje) === "atrasada") ? "atrasada" : "em-dia";
}
