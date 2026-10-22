"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

export const estiloEntrada =
  "h-11 w-full rounded-lg border border-[#e3d3dc] bg-superficie px-3 outline-none focus:border-marca focus:ring-3 focus:ring-marca/15 aria-invalid:border-rose-400";

export function Campo({ rotulo, nome, erro, dica, children }: {
  rotulo: string;
  nome: string;
  erro?: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nome} className="text-sm font-semibold">{rotulo}</label>
      {children}
      {erro ? (
        <p id={`${nome}-erro`} className="text-sm text-rose-700">{erro}</p>
      ) : (
        dica && <p className="text-sm text-texto-fraco">{dica}</p>
      )}
    </div>
  );
}

// Grupo de caixas de marcar (turmas da aluna, dias da turma).
export function GrupoMarcar({ rotulo, erro, children }: { rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">{rotulo}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
      {erro && <p className="text-sm text-rose-700">{erro}</p>}
    </fieldset>
  );
}

export function OpcaoMarcar({ nome, valor, rotulo, marcado }: { nome: string; valor: string; rotulo: string; marcado: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#e3d3dc] px-3 py-2 text-sm has-checked:border-marca has-checked:bg-marca-clara">
      <input type="checkbox" name={nome} value={valor} defaultChecked={marcado} className="accent-marca" />
      {rotulo}
    </label>
  );
}

export function Botoes({ voltarPara }: { voltarPara: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex gap-3">
      <button type="submit" disabled={pending}
        className="h-11 rounded-lg bg-marca px-6 font-semibold text-white hover:bg-marca-escura disabled:opacity-60">
        {pending ? "Salvando…" : "Salvar"}
      </button>
      <Link href={voltarPara} className="flex h-11 items-center rounded-lg px-4 font-semibold text-texto-medio hover:bg-marca-clara">
        Cancelar
      </Link>
    </div>
  );
}

export function ErroGeral({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{mensagem}</p>;
}
