"use client";

import { useActionState } from "react";
import { Botoes, Campo, ErroGeral, GrupoMarcar, OpcaoMarcar, estiloEntrada } from "@/components/formulario";
import type { Turma } from "@/lib/dados";
import { nomesDias } from "@/lib/formatar";
import { estadoInicial, marcadoEm, valorDe } from "@/lib/formulario";
import { salvarTurma } from "./acoes";

// Segunda a sábado primeiro; domingo por último.
const ordemDias = [1, 2, 3, 4, 5, 6, 0];

export function FormularioTurma({ turma }: { turma?: Turma }) {
  const [estado, acao] = useActionState(salvarTurma.bind(null, turma?.id ?? null), estadoInicial);
  const { erros } = estado;

  return (
    <form action={acao} noValidate className="flex max-w-xl flex-col gap-5">
      <ErroGeral mensagem={erros.geral} />

      <Campo rotulo="Nome da turma" nome="nome" erro={erros.nome}>
        <input id="nome" name="nome" defaultValue={valorDe(estado, "nome", turma?.nome)}
          aria-invalid={!!erros.nome} className={estiloEntrada} />
      </Campo>

      <Campo rotulo="Professora" nome="professora" erro={erros.professora}>
        <input id="professora" name="professora" defaultValue={valorDe(estado, "professora", turma?.professora)}
          aria-invalid={!!erros.professora} className={estiloEntrada} />
      </Campo>

      <GrupoMarcar rotulo="Dias da semana" erro={erros.dias}>
        {ordemDias.map((d) => (
          <OpcaoMarcar key={d} nome="dias" valor={String(d)} rotulo={nomesDias[d]}
            marcado={marcadoEm(estado, "dias", String(d), turma?.dias.includes(d as Turma["dias"][number]) ?? false)} />
        ))}
      </GrupoMarcar>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Horário" nome="horario" erro={erros.horario}>
          <input id="horario" name="horario" type="time" defaultValue={valorDe(estado, "horario", turma?.horario)}
            aria-invalid={!!erros.horario} className={estiloEntrada} />
        </Campo>
        <Campo rotulo="Capacidade" nome="capacidade" erro={erros.capacidade} dica="Quantas alunas cabem na turma.">
          <input id="capacidade" name="capacidade" type="number" min={1} inputMode="numeric"
            defaultValue={valorDe(estado, "capacidade", turma?.capacidade)}
            aria-invalid={!!erros.capacidade} className={estiloEntrada} />
        </Campo>
      </div>

      <Botoes voltarPara="/turmas" />
    </form>
  );
}
