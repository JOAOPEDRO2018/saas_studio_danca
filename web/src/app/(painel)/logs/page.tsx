import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cabecalho, Carregando, Tabela } from "@/components/ui";
import { listarLogs } from "@/lib/logs";
import { descreverAcao, descreverAlteracoes, formatarDataHora } from "@/lib/logs-formatar";
import { membroAtual } from "@/lib/supabase";

export const metadata: Metadata = { title: "Logs" };

const estiloLink = "font-semibold text-marca hover:text-marca-escura";

async function ListaLogs({ searchParams }: { searchParams: PageProps<"/logs">["searchParams"] }) {
  // Só a dona. Para a recepção a página "não existe", em vez de uma tabela vazia.
  if ((await membroAtual()).perfil !== "dona") notFound();
  const pagina = Math.max(1, Math.floor(Number((await searchParams).pagina)) || 1);
  const { itens, temMais } = await listarLogs(pagina);

  return (
    <>
      {itens.length === 0 ? (
        <p className="text-sm text-texto-medio">Nenhuma atividade registrada.</p>
      ) : (
        <Tabela colunas={["Quando", "Quem", "O que fez", "Onde", "Detalhes"]}>
          {itens.map((registro) => {
            const detalhes = descreverAlteracoes(registro.acao, registro.alteracoes);
            return (
              <tr key={registro.id} className="align-top hover:bg-[#fdf8fa]">
                <td className="whitespace-nowrap px-4 py-3 text-texto-medio">{formatarDataHora(registro.criadoEm)}</td>
                <td className="px-4 py-3 font-medium">{registro.quem}</td>
                <td className="px-4 py-3">{descreverAcao(registro)}</td>
                <td className="px-4 py-3 text-texto-medio">{registro.descricao ?? "—"}</td>
                <td className="px-4 py-3 text-texto-medio">
                  {detalhes.length === 0 ? "—" : detalhes.map((linha, i) => <span key={i} className="block">{linha}</span>)}
                </td>
              </tr>
            );
          })}
        </Tabela>
      )}
      <nav className="mt-4 flex justify-between text-sm">
        {pagina > 1 ? (
          <Link href={pagina === 2 ? "/logs" : `/logs?pagina=${pagina - 1}`} className={estiloLink}>← Mais recentes</Link>
        ) : (
          <span />
        )}
        {temMais && <Link href={`/logs?pagina=${pagina + 1}`} className={estiloLink}>Mais antigos →</Link>}
      </nav>
    </>
  );
}

export default function PaginaLogs({ searchParams }: PageProps<"/logs">) {
  return (
    <>
      <Cabecalho titulo="Logs" descricao="Atividades no sistema nos últimos 12 meses." />
      <Suspense fallback={<Carregando />}>
        <ListaLogs searchParams={searchParams} />
      </Suspense>
    </>
  );
}
