// Confere, no banco de verdade, as regras do supabase/04-logs.sql.
// Rode dentro da pasta web:  node --env-file=.env.local scripts/verificar-logs.ts
// Usa a chave secreta (como uma rotina automática, sem pessoa logada), então os
// registros criados aqui aparecem como "Sistema". Eles ficam no log, porque
// ninguém apaga registro com menos de 1 ano.
import { createClient } from "@supabase/supabase-js";

function variavel(nome: string) {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Falta ${nome} no arquivo web/.env.local.`);
  return valor;
}

const opcoes = { auth: { persistSession: false } };
const admin = createClient(variavel("SUPABASE_URL"), variavel("SUPABASE_SECRET_KEY"), opcoes);
const anonimo = createClient(variavel("SUPABASE_URL"), variavel("SUPABASE_PUBLISHABLE_KEY"), opcoes);

let falhas = 0;
function conferir(descricao: string, certo: boolean, encontrado?: unknown) {
  console.log(`${certo ? "ok     " : "FALHOU "} ${descricao}`);
  if (!certo) {
    falhas++;
    if (encontrado !== undefined) console.log("        encontrado:", JSON.stringify(encontrado));
  }
}

function exigir<T>(resposta: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (resposta.error) throw new Error(resposta.error.message);
  return resposta.data as NonNullable<T>;
}

type Log = { id: number; quem: string; acao: string; tabela: string; descricao: string; alteracoes: unknown };

async function logsDo(registroId: string): Promise<Log[]> {
  return exigir(await admin.from("logs").select("*").eq("registro_id", registroId).order("id"));
}

// Para antes de criar qualquer coisa se o 04-logs.sql ainda não foi rodado.
exigir(await admin.from("logs").select("id").limit(1));

// Turma: criar, alterar, salvar sem mudança e apagar.
const turma = exigir(
  await admin
    .from("turmas")
    .insert({ nome: "Teste de log", professora: "Teste", dias: [1], horario: "10:00", capacidade: 10 })
    .select("id")
    .single(),
);
let logs = await logsDo(turma.id);
conferir(
  "criar turma gera 1 registro 'criou' de 'Sistema' em 'Teste de log'",
  logs.length === 1 && logs[0].acao === "criou" && logs[0].quem === "Sistema" && logs[0].descricao === "Teste de log",
  logs,
);

exigir(await admin.from("turmas").update({ capacidade: 12 }).eq("id", turma.id));
logs = await logsDo(turma.id);
conferir(
  "alterar a capacidade gera 'alterou' só com capacidade 10 → 12",
  logs.length === 2 &&
    logs[1].acao === "alterou" &&
    JSON.stringify(logs[1].alteracoes) === JSON.stringify({ capacidade: { antes: 10, depois: 12 } }),
  logs[1],
);

exigir(await admin.from("turmas").update({ nome: "Teste de log", capacidade: 12 }).eq("id", turma.id));
logs = await logsDo(turma.id);
conferir("salvar sem mudar nada não gera registro", logs.length === 2, logs.length);

// Matrícula: o "onde" junta o nome da aluna e o da turma.
const aluna = exigir(
  await admin
    .from("alunas")
    .insert({ nome: "Aluna teste de log", whatsapp: "5511900000000", dia_vencimento: 10, valor_mensalidade: 100 })
    .select("id")
    .single(),
);
exigir(await admin.from("matriculas").insert({ aluna_id: aluna.id, turma_id: turma.id }));
const matricula = (await logsDo(aluna.id)).filter((l) => l.tabela === "matriculas");
conferir(
  "matrícula gera 'criou' em 'Aluna teste de log na turma Teste de log'",
  matricula.length === 1 &&
    matricula[0].acao === "criou" &&
    matricula[0].descricao === "Aluna teste de log na turma Teste de log",
  matricula,
);
exigir(await admin.from("alunas").delete().eq("id", aluna.id));

exigir(await admin.from("turmas").delete().eq("id", turma.id));
logs = await logsDo(turma.id);
conferir("apagar a turma gera 'removeu'", logs.length === 3 && logs[2].acao === "removeu", logs[2]);

// Ninguém altera nem apaga o log, nem com a chave secreta.
const ultimo = logs[logs.length - 1];
const alteracao = await admin.from("logs").update({ quem: "outra pessoa" }).eq("id", ultimo.id);
conferir("alterar um registro do log é recusado", alteracao.error !== null);
const remocao = await admin.from("logs").delete().eq("id", ultimo.id);
conferir("apagar um registro recente do log é recusado", remocao.error !== null);
conferir("o registro continua igual", (await logsDo(turma.id)).at(-1)?.quem === "Sistema");

// Sem login, ninguém lê o log.
const semLogin = await anonimo.from("logs").select("id");
conferir("sem login, o log aparece vazio", (semLogin.data ?? []).length === 0, semLogin.data?.length);

console.log(falhas === 0 ? "\nTudo certo." : `\n${falhas} item(ns) com falha.`);
process.exitCode = falhas === 0 ? 0 : 1;
