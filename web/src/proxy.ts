import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Roda antes de cada página. Renova a sessão do Supabase (o token de login
// vence em 1 hora e é trocado aqui, gravando o cookie novo) e manda quem não
// está logado para /login. A proteção dos dados em si é o RLS no banco; isto
// aqui só evita mostrar telas vazias.
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (novos, cabecalhos) => {
        novos.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        novos.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        Object.entries(cabecalhos).forEach(([nome, valor]) => resposta.headers.set(nome, valor));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const logado = !!data?.claims;
  const naTelaDeLogin = request.nextUrl.pathname === "/login";

  // O redirecionamento leva junto os cookies renovados acima.
  const irPara = (caminho: string) => {
    const redirecionamento = NextResponse.redirect(new URL(caminho, request.url));
    resposta.cookies.getAll().forEach((cookie) => redirecionamento.cookies.set(cookie));
    return redirecionamento;
  };

  if (!logado && !naTelaDeLogin) return irPara("/login");
  if (logado && naTelaDeLogin) return irPara("/");
  return resposta;
}

export const config = {
  // Todas as rotas, menos os arquivos internos do Next e imagens.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
