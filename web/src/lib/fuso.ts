// O studio funciona no horário de Brasília, mas o servidor pode estar em outro
// fuso (na AWS é UTC, 3 horas à frente). Tudo o que depende de "que dia é hoje"
// pergunta a Brasília, e não ao relógio do servidor.
export const fusoDoStudio = "America/Sao_Paulo";

const partes = new Intl.DateTimeFormat("en-US", {
  timeZone: fusoDoStudio,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

// O dia do calendário em Brasília naquele instante, à meia-noite no fuso do
// servidor: o mesmo formato das datas lidas do banco (lerData, em dados.ts),
// para as comparações e getDay/getMonth/getDate funcionarem igual.
export function diaEmBrasilia(agora: Date): Date {
  const valor = (tipo: string) => Number(partes.formatToParts(agora).find((p) => p.type === tipo)?.value);
  return new Date(valor("year"), valor("month") - 1, valor("day"));
}
