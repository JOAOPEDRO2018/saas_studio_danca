import assert from "node:assert/strict";
import { test } from "node:test";
import { diferencaDeTurmas } from "./matriculas.ts";

test("inclui as turmas marcadas agora e retira as desmarcadas", () => {
  assert.deepEqual(diferencaDeTurmas(["a", "b"], ["b", "c"]), { incluir: ["c"], retirar: ["a"] });
});

test("sem mudança nas turmas, não mexe em nada", () => {
  assert.deepEqual(diferencaDeTurmas(["a"], ["a"]), { incluir: [], retirar: [] });
});

test("aluna sem turmas continua sem turmas", () => {
  assert.deepEqual(diferencaDeTurmas([], []), { incluir: [], retirar: [] });
});
