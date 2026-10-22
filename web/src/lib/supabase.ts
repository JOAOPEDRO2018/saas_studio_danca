import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

function variavel(nome: string) {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Falta ${nome} no arquivo web/.env.local (veja web/.env.example).`);
  return valor;
}

export type Perfil = "dona" | "recepcao";
export type MembroDaEquipe = { nome: string; perfil: Perfil };

// Sessão da pessoa logada: o cliente do Supabase (o banco aplica as regras do
// RLS, ver supabase/03-login.sql) e o cadastro dela na tabela equipe.
// Sem sessão válida, manda para o login; logada mas fora da equipe, para
// /sem-acesso. O `cache` do React faz a verificação rodar uma vez só por
// requisição, mesmo que a tela leia várias tabelas.
const sessaoDaEquipe = cache(async () => {
  // getClaims confere a validade do login com Date.now(). O connection() avisa
  // o Next que daqui em diante tudo depende da visita real, e não pode ser
  // calculado antes, nem numa geração prévia nem num prefetch.
  await connection();
  const cookieStore = await cookies();
  const cliente = createServerClient(variavel("SUPABASE_URL"), variavel("SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (novos) => {
        // Uma tela não pode gravar cookies; quem renova a sessão é o proxy.ts.
        // Numa Server Action (login, sair) a gravação funciona.
        try {
          novos.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
  const { data } = await cliente.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const membro = await buscarMembro(cliente, data.claims.sub);
  if (!membro) redirect("/sem-acesso");
  return { cliente, membro };
});

export async function supabaseDaEquipe() {
  return (await sessaoDaEquipe()).cliente;
}

export async function membroAtual(): Promise<MembroDaEquipe> {
  return (await sessaoDaEquipe()).membro;
}

export async function buscarMembro(
  cliente: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<MembroDaEquipe | null> {
  const { data } = await cliente.from("equipe").select("nome, perfil").eq("user_id", userId).maybeSingle();
  return data;
}

// Cliente sem login, só para entrar e sair (login/acoes.ts).
export async function supabaseLogin() {
  const cookieStore = await cookies();
  return createServerClient(variavel("SUPABASE_URL"), variavel("SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (novos) => novos.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
}

// Cliente com a chave secreta: ignora o RLS. Fica reservado para as rotinas
// automáticas sem pessoa logada (gerar mensalidades, aviso de pagamento do
// Asaas). Nunca use numa tela.
export function supabaseAdmin() {
  return createClient(variavel("SUPABASE_URL"), variavel("SUPABASE_SECRET_KEY"), { auth: { persistSession: false } });
}
