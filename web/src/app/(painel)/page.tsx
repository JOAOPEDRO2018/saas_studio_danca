import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho, Cartao, Carregando, Indicador, SeloStatus } from "@/components/ui";
import { alunaPorId, alunas, mensalidadesExemplo, statusDa, turmas, type DiaSemana } from "@/lib/dados-exemplo";
import { formatarData, formatarMoeda } from "@/lib/formatar";
import { hoje as dataDeHoje } from "@/lib/hoje";

async function Resumo() {
  const hoje = await dataDeHoje();
  const mensalidades = mensalidadesExemplo(hoje).map((m) => ({ ...m, status: statusDa(m, hoje) }));
  const referenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const doMes = mensalidades.filter((m) => m.referencia === referenciaAtual);
  const soma = (lista: typeof mensalidades) => lista.reduce((total, m) => total + m.valor, 0);

  const recebido = doMes.filter((m) => m.status === "paga");
  const aReceber = doMes.filter((m) => m.status === "pendente");
  const atrasadas = mensalidades.filter((m) => m.status === "atrasada");
  const aulasHoje = turmas.filter((t) => t.dias.includes(hoje.getDay() as DiaSemana));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Alunas ativas" valor={String(alunas.filter((a) => a.ativa).length)} />
        <Indicador rotulo="Recebido no mês" valor={formatarMoeda(soma(recebido))} detalhe={`${recebido.length} mensalidades`} />
        <Indicador rotulo="A receber no mês" valor={formatarMoeda(soma(aReceber))} detalhe={`${aReceber.length} mensalidades`} />
        <Indicador rotulo="Em atraso" valor={formatarMoeda(soma(atrasadas))} detalhe={`${atrasadas.length} mensalidades`} destaque />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <h2 className="mb-3 font-semibold">Aulas de hoje</h2>
          {aulasHoje.length === 0 ? (
            <p className="text-sm text-texto-fraco">Nenhuma aula hoje.</p>
          ) : (
            <ul className="divide-y divide-borda">
              {aulasHoje.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium">{t.nome}</span>
                  <span className="text-texto-medio">{t.horario} · {t.professora}</span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Mensalidades em atraso</h2>
            <Link href="/mensalidades?status=atrasada" className="text-sm font-semibold text-marca hover:text-marca-escura">
              Ver todas
            </Link>
          </div>
          {atrasadas.length === 0 ? (
            <p className="text-sm text-texto-fraco">Nenhuma mensalidade em atraso.</p>
          ) : (
            <ul className="divide-y divide-borda">
              {atrasadas.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="font-medium">{alunaPorId(m.alunaId)?.nome}</span>
                  <span className="flex items-center gap-3 text-texto-medio">
                    venceu {formatarData(m.vencimento)} · {formatarMoeda(m.valor)}
                    <SeloStatus status={m.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>
    </div>
  );
}

export default function PaginaPainel() {
  return (
    <>
      <Cabecalho titulo="Painel" descricao="Resumo do studio hoje." />
      <Suspense fallback={<Carregando />}>
        <Resumo />
      </Suspense>
    </>
  );
}
