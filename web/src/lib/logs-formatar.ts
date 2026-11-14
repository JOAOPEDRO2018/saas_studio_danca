// Transforma os registros da tabela logs (supabase/04-logs.sql) nos textos da
// aba "Logs". Funções puras, testadas em logs-formatar.test.ts (npm test).
import { formatarMoeda, formatarWhatsapp, nomesDias } from "./formatar.ts";
import { fusoDoStudio } from "./fuso.ts";

export type AcaoLog = "criou" | "alterou" | "removeu" | "entrou" | "saiu" | "senha_errada" | "sem_acesso";

export type Alteracoes = Record<string, { antes: unknown; depois: unknown }>;

export type RegistroLog = {
  id: number;
  criadoEm: Date;
  quem: string;
  acao: AcaoLog;
  tabela: string | null;
  descricao: string | null;
  alteracoes: Alteracoes | null;
};

// Sempre no horário de Brasília, mesmo com o servidor em outro fuso (na AWS é UTC).
const dia = new Intl.DateTimeFormat("pt-BR", { timeZone: fusoDoStudio, day: "2-digit", month: "2-digit", year: "numeric" });
const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: fusoDoStudio, hour: "2-digit", minute: "2-digit" });
const lista = new Intl.ListFormat("pt-BR", { type: "conjunction" });

// 2026-11-08T17:05:00Z -> "08/11/2026 14:05"
export function formatarDataHora(data: Date) {
  return `${dia.format(data)} ${hora.format(data)}`;
}

const nomesTabelas: Record<string, string> = { turmas: "a turma", alunas: "a aluna", mensalidades: "a mensalidade" };

export function descreverAcao(registro: RegistroLog) {
  const { acao, tabela } = registro;
  if (tabela === "matriculas") return acao === "removeu" ? "Cancelou a matrícula" : "Fez a matrícula";
  switch (acao) {
    case "criou":
      return `Criou ${nomesTabelas[tabela ?? ""] ?? tabela}`;
    case "alterou":
      return `Alterou ${nomesTabelas[tabela ?? ""] ?? tabela}`;
    case "removeu":
      return `Removeu ${nomesTabelas[tabela ?? ""] ?? tabela}`;
    case "entrou":
      return "Entrou no sistema";
    case "saiu":
      return "Saiu do sistema";
    case "senha_errada":
      return "Tentou entrar com senha errada";
    case "sem_acesso":
      return "Tentou entrar sem acesso liberado";
  }
}

// "2026-10-05" -> "05/10/2026" (sem passar por Date, para não mudar de dia com o fuso)
function formatarDia(texto: string) {
  const [ano, mes, diaDoMes] = texto.split("-");
  return `${diaDoMes}/${mes}/${ano}`;
}

// Nome de cada campo na tela e como mostrar o valor dele.
const campos: Record<string, { rotulo: string; formato?: (valor: unknown) => string }> = {
  nome: { rotulo: "Nome" },
  professora: { rotulo: "Professora" },
  whatsapp: { rotulo: "WhatsApp", formato: (v) => formatarWhatsapp(String(v)) },
  dia_vencimento: { rotulo: "Dia do vencimento", formato: (v) => `dia ${v}` },
  valor_mensalidade: { rotulo: "Valor", formato: (v) => formatarMoeda(Number(v)) },
  valor: { rotulo: "Valor", formato: (v) => formatarMoeda(Number(v)) },
  ativa: { rotulo: "Situação", formato: (v) => (v ? "ativa" : "inativa") },
  dias: { rotulo: "Dias", formato: (v) => lista.format((v as number[]).map((d) => nomesDias[d])) },
  horario: { rotulo: "Horário", formato: (v) => String(v).slice(0, 5) },
  capacidade: { rotulo: "Capacidade" },
  referencia: { rotulo: "Mês" },
  vencimento: { rotulo: "Vencimento", formato: (v) => formatarDia(String(v)) },
  paga_em: { rotulo: "Pagamento", formato: (v) => formatarDia(String(v)) },
};

function formatarValor(campo: string, valor: unknown) {
  if (valor === null || valor === undefined) return campo === "paga_em" ? "não pago" : "—";
  const formato = campos[campo]?.formato;
  return formato ? formato(valor) : String(valor);
}

// O banco guarda os campos em outra ordem; na tela seguem a ordem de `campos`,
// e um campo que não está na lista vai para o fim.
const ordem = Object.keys(campos);
const posicao = (campo: string) => (ordem.includes(campo) ? ordem.indexOf(campo) : ordem.length);

// Uma linha por campo. Na alteração, "Valor: R$ 340,00 → R$ 360,00"; na
// inclusão só o valor novo, e na remoção só o antigo.
export function descreverAlteracoes(acao: AcaoLog, alteracoes: Alteracoes | null): string[] {
  const entradas = Object.entries(alteracoes ?? {}).sort(([a], [b]) => posicao(a) - posicao(b));
  return entradas.map(([campo, { antes, depois }]) => {
    const rotulo = campos[campo]?.rotulo ?? campo;
    if (acao === "criou") return `${rotulo}: ${formatarValor(campo, depois)}`;
    if (acao === "removeu") return `${rotulo}: ${formatarValor(campo, antes)}`;
    return `${rotulo}: ${formatarValor(campo, antes)} → ${formatarValor(campo, depois)}`;
  });
}
