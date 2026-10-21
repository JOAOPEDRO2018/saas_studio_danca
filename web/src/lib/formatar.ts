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

// "5511984521100" -> "(11) 98452-1100"
export function formatarWhatsapp(numero: string) {
  const local = numero.startsWith("55") ? numero.slice(2) : numero;
  const ddd = local.slice(0, 2);
  const resto = local.slice(2);
  return `(${ddd}) ${resto.slice(0, -4)}-${resto.slice(-4)}`;
}
