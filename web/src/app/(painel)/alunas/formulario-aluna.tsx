"use client";

import { useActionState } from "react";
import { Botoes, Campo, ErroGeral, GrupoMarcar, OpcaoMarcar, estiloEntrada } from "@/components/formulario";
import type { Aluna, Turma } from "@/lib/dados";
import { formatarWhatsapp } from "@/lib/formatar";
import { estadoInicial, marcadoEm, valorDe } from "@/lib/formulario";
import { salvarAluna } from "./acoes";

const diasDoMes = Array.from({ length: 28 }, (_, i) => i + 1);

export function FormularioAluna({ aluna, turmas }: { aluna?: Aluna; turmas: Turma[] }) {
  const [estado, acao] = useActionState(salvarAluna.bind(null, aluna?.id ?? null), estadoInicial);
  const { erros } = estado;

  return (
    <form action={acao} noValidate className="flex max-w-xl flex-col gap-5">
      <ErroGeral mensagem={erros.geral} />

      <Campo rotulo="Nome" nome="nome" erro={erros.nome}>
        <input id="nome" name="nome" autoComplete="off" defaultValue={valorDe(estado, "nome", aluna?.nome)}
          aria-invalid={!!erros.nome} className={estiloEntrada} />
      </Campo>

      <Campo rotulo="WhatsApp" nome="whatsapp" erro={erros.whatsapp} dica="Com DDD. É para esse número que a cobrança vai.">
        <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="(11) 98452-1100"
          defaultValue={valorDe(estado, "whatsapp", aluna ? formatarWhatsapp(aluna.whatsapp) : "")}
          aria-invalid={!!erros.whatsapp} className={estiloEntrada} />
      </Campo>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Dia do vencimento" nome="diaVencimento" erro={erros.diaVencimento}>
          <select id="diaVencimento" name="diaVencimento" defaultValue={valorDe(estado, "diaVencimento", aluna?.diaVencimento ?? 10)}
            aria-invalid={!!erros.diaVencimento} className={estiloEntrada}>
            {diasDoMes.map((d) => <option key={d} value={d}>Dia {d}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Valor da mensalidade (R$)" nome="valorMensalidade" erro={erros.valorMensalidade}>
          <input id="valorMensalidade" name="valorMensalidade" type="number" min={0} step="0.01" inputMode="decimal"
            defaultValue={valorDe(estado, "valorMensalidade", aluna?.valorMensalidade)}
            aria-invalid={!!erros.valorMensalidade} className={estiloEntrada} />
        </Campo>
      </div>

      <GrupoMarcar rotulo="Turmas">
        {turmas.map((t) => (
          <OpcaoMarcar key={t.id} nome="turmas" valor={t.id} rotulo={t.nome}
            marcado={marcadoEm(estado, "turmas", t.id, aluna?.turmaIds.includes(t.id) ?? false)} />
        ))}
      </GrupoMarcar>

      {aluna && (
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="ativa" value="sim" defaultChecked={marcadoEm(estado, "ativa", "sim", aluna.ativa)}
            className="mt-0.5 accent-marca" />
          <span>
            <strong>Aluna ativa</strong>
            <span className="block text-texto-fraco">
              Desmarque quando a aluna sair do studio. O histórico de mensalidades continua guardado.
            </span>
          </span>
        </label>
      )}

      <Botoes voltarPara="/alunas" />
    </form>
  );
}
