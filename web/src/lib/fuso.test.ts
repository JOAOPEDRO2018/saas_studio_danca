// Simula o servidor da AWS, que roda em UTC (3 horas à frente de Brasília).
// Precisa vir antes de qualquer data ser criada.
process.env.TZ = "UTC";

import assert from "node:assert/strict";
import { test } from "node:test";
import { diaEmBrasilia } from "./fuso.ts";

test("22h30 em Brasília ainda é o mesmo dia, mesmo com o servidor já no dia seguinte", () => {
  const dia = diaEmBrasilia(new Date("2026-11-09T01:30:00Z"));
  assert.equal(dia.getFullYear(), 2026);
  assert.equal(dia.getMonth(), 10);
  assert.equal(dia.getDate(), 8);
  assert.equal(dia.getDay(), 0); // domingo
});

test("à tarde, servidor e Brasília concordam", () => {
  assert.equal(diaEmBrasilia(new Date("2026-11-08T15:00:00Z")).getDate(), 8);
});

test("23h do último dia do mês ainda é o mês atual", () => {
  const dia = diaEmBrasilia(new Date("2026-12-01T02:00:00Z"));
  assert.equal(dia.getMonth(), 10);
  assert.equal(dia.getDate(), 30);
});

test("devolve a meia-noite, no mesmo formato das datas lidas do banco", () => {
  const dia = diaEmBrasilia(new Date("2026-11-08T15:00:00Z"));
  assert.equal(dia.getHours(), 0);
  assert.equal(dia.getMinutes(), 0);
});
