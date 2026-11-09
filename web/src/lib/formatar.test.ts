import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizarWhatsapp } from "./formatar.ts";

test("aceita o celular em qualquer formato comum", () => {
  for (const digitado of ["(11) 98452-1100", "11984521100", "+55 11 98452-1100", "5511984521100", "011 98452-1100"]) {
    assert.equal(normalizarWhatsapp(digitado), "5511984521100", digitado);
  }
});

test("recusa número sem DDD, fixo, DDD inválido, celular sem 9 e vazio", () => {
  for (const digitado of ["98452-1100", "(11) 3456-7890", "(01) 98452-1100", "(11) 88452-1100", ""]) {
    assert.equal(normalizarWhatsapp(digitado), null, digitado);
  }
});
