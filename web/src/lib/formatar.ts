const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const mesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function formatarMoeda(valor: number) {
  return moeda.format(valor);
}

export function formatarData(data: Date) {
  return dataCurta.format(data);
}

// "2026-10" -> "Outubro de 2026"
export function formatarReferencia(referencia: string) {
  const [ano, mes] = referencia.split("-").map(Number);
  const texto = mesAno.format(new Date(ano, mes - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
