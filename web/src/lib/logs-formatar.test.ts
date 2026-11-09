import assert from "node:assert/strict";
import { test } from "node:test";
import { descreverAcao, descreverAlteracoes, formatarDataHora, type RegistroLog } from "./logs-formatar.ts";

// O Intl separa "R$" do número com um espaço que não quebra linha ( ).
const reais = (texto: string) => texto.replaceAll("R$ ", "R$ ");

function registro(campos: Partial<RegistroLog>): RegistroLog {
  return { id: 1, criadoEm: new Date(), quem: "Isa", acao: "alterou", tabela: null, descricao: null, alteracoes: null, ...campos };
}

test("data e hora sempre no horário de Brasília", () => {
  assert.equal(formatarDataHora(new Date("2026-11-08T17:05:00Z")), "08/11/2026 14:05");
});

test("valor da mensalidade em reais", () => {
  assert.deepEqual(descreverAlteracoes("alterou", { valor_mensalidade: { antes: 340, depois: 360 } }), [
    reais("Valor: R$ 340,00 → R$ 360,00"),
  ]);
});

test("situação ativa ou inativa", () => {
  assert.deepEqual(descreverAlteracoes("alterou", { ativa: { antes: true, depois: false } }), ["Situação: ativa → inativa"]);
});

test("mensalidade sem pagamento aparece como não paga", () => {
  assert.deepEqual(descreverAlteracoes("alterou", { paga_em: { antes: null, depois: "2026-10-05" } }), [
    "Pagamento: não pago → 05/10/2026",
  ]);
});

test("dias da semana pelo nome", () => {
  assert.deepEqual(descreverAlteracoes("alterou", { dias: { antes: [1, 3], depois: [2, 4] } }), [
    "Dias: Seg e Qua → Ter e Qui",
  ]);
});

test("WhatsApp, horário e dia do vencimento no formato da tela", () => {
  assert.deepEqual(
    descreverAlteracoes("alterou", {
      whatsapp: { antes: "5511984521100", depois: "5511984521101" },
      horario: { antes: "17:00:00", depois: "18:30:00" },
      dia_vencimento: { antes: 5, depois: 10 },
    }),
    ["WhatsApp: (11) 98452-1100 → (11) 98452-1101", "Dia do vencimento: dia 5 → dia 10", "Horário: 17:00 → 18:30"],
  );
});

test("valor que não existia aparece como —", () => {
  assert.deepEqual(descreverAlteracoes("alterou", { professora: { antes: null, depois: "Bia" } }), ["Professora: — → Bia"]);
});

test("na inclusão mostra só os valores novos, e na remoção só os antigos", () => {
  assert.deepEqual(descreverAlteracoes("criou", { nome: { antes: null, depois: "Ana" } }), ["Nome: Ana"]);
  assert.deepEqual(descreverAlteracoes("removeu", { capacidade: { antes: 12, depois: null } }), ["Capacidade: 12"]);
});

test("campos na ordem do cadastro, não na ordem em que o banco guarda", () => {
  assert.deepEqual(
    descreverAlteracoes("criou", { dias: { antes: null, depois: [1] }, nome: { antes: null, depois: "Jazz" } }),
    ["Nome: Jazz", "Dias: Seg"],
  );
});

test("registro sem alterações não tem detalhes", () => {
  assert.deepEqual(descreverAlteracoes("entrou", null), []);
});

test("o que foi feito, em português", () => {
  assert.equal(descreverAcao(registro({ acao: "alterou", tabela: "alunas" })), "Alterou a aluna");
  assert.equal(descreverAcao(registro({ acao: "criou", tabela: "turmas" })), "Criou a turma");
  assert.equal(descreverAcao(registro({ acao: "criou", tabela: "matriculas" })), "Fez a matrícula");
  assert.equal(descreverAcao(registro({ acao: "removeu", tabela: "matriculas" })), "Cancelou a matrícula");
  assert.equal(descreverAcao(registro({ acao: "senha_errada" })), "Tentou entrar com senha errada");
  assert.equal(descreverAcao(registro({ acao: "entrou" })), "Entrou no sistema");
});
