// Dados de exemplo para o protótipo. Os tipos seguem o formato das tabelas
// que serão criadas no Supabase (alunas, turmas, mensalidades), para que a
// troca por dados reais mude só a origem, não as telas.

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo

export type Turma = {
  id: string;
  nome: string;
  professora: string;
  dias: DiaSemana[];
  horario: string;
  capacidade: number;
};

export type Aluna = {
  id: string;
  nome: string;
  whatsapp: string;
  turmaIds: string[];
  diaVencimento: number;
  valorMensalidade: number;
  ativa: boolean;
};

export type Mensalidade = {
  id: string;
  alunaId: string;
  referencia: string; // "AAAA-MM"
  vencimento: Date;
  valor: number;
  pagaEm: Date | null;
};

export type StatusMensalidade = "paga" | "pendente" | "atrasada";

export const turmas: Turma[] = [
  { id: "t1", nome: "Baby Class", professora: "Juliana", dias: [6], horario: "09:00", capacidade: 10 },
  { id: "t2", nome: "Ballet Infantil", professora: "Isabela", dias: [1, 3], horario: "17:00", capacidade: 14 },
  { id: "t3", nome: "Jazz", professora: "Clara", dias: [1, 3], horario: "19:00", capacidade: 16 },
  { id: "t4", nome: "Ballet Adulto", professora: "Isabela", dias: [2, 4], horario: "19:00", capacidade: 12 },
  { id: "t5", nome: "Dança do Ventre", professora: "Larissa", dias: [5], horario: "18:00", capacidade: 12 },
];

export const alunas: Aluna[] = [
  { id: "a1", nome: "Beatriz Mendonça", whatsapp: "(11) 98452-1100", turmaIds: ["t2"], diaVencimento: 5, valorMensalidade: 220, ativa: true },
  { id: "a2", nome: "Helena Duarte", whatsapp: "(11) 97103-8821", turmaIds: ["t1"], diaVencimento: 10, valorMensalidade: 180, ativa: true },
  { id: "a3", nome: "Camila Rocha", whatsapp: "(11) 96541-2993", turmaIds: ["t3", "t4"], diaVencimento: 10, valorMensalidade: 340, ativa: true },
  { id: "a4", nome: "Laura Fernandes", whatsapp: "(11) 99218-4470", turmaIds: ["t4"], diaVencimento: 15, valorMensalidade: 240, ativa: true },
  { id: "a5", nome: "Sofia Martins", whatsapp: "(11) 98877-3012", turmaIds: ["t2"], diaVencimento: 5, valorMensalidade: 220, ativa: true },
  { id: "a6", nome: "Marina Alves", whatsapp: "(11) 97456-9081", turmaIds: ["t5"], diaVencimento: 15, valorMensalidade: 200, ativa: true },
  { id: "a7", nome: "Valentina Souza", whatsapp: "(11) 96320-5547", turmaIds: ["t1"], diaVencimento: 5, valorMensalidade: 180, ativa: true },
  { id: "a8", nome: "Patrícia Lima", whatsapp: "(11) 99784-6630", turmaIds: ["t3"], diaVencimento: 10, valorMensalidade: 230, ativa: true },
];

// Alunas que, no exemplo, deixaram a mensalidade do mês passado em aberto.
const emAbertoMesPassado = new Set(["a3", "a6"]);
// Alunas que, no exemplo, já pagaram a mensalidade deste mês.
const pagasEsteMes = new Set(["a1", "a2", "a4", "a8"]);

function referenciaDe(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

// Gera as mensalidades do mês passado e do mês atual relativas a `hoje`,
// para que o exemplo sempre tenha mensalidades pagas, pendentes e atrasadas.
export function mensalidadesExemplo(hoje: Date): Mensalidade[] {
  const meses = [
    new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1),
    new Date(hoje.getFullYear(), hoje.getMonth(), 1),
  ];
  return meses.flatMap((inicio, i) =>
    alunas.map((aluna) => {
      const vencimento = new Date(inicio.getFullYear(), inicio.getMonth(), aluna.diaVencimento);
      const mesPassado = i === 0;
      const paga = mesPassado ? !emAbertoMesPassado.has(aluna.id) : pagasEsteMes.has(aluna.id);
      const pagaEm = paga ? new Date(Math.min(vencimento.getTime(), hoje.getTime())) : null;
      return {
        id: `${aluna.id}-${referenciaDe(inicio)}`,
        alunaId: aluna.id,
        referencia: referenciaDe(inicio),
        vencimento,
        valor: aluna.valorMensalidade,
        pagaEm,
      };
    }),
  );
}

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

export function turmaPorId(id: string) {
  return turmas.find((t) => t.id === id);
}

export function alunaPorId(id: string) {
  return alunas.find((a) => a.id === id);
}
