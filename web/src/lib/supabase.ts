import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente do Supabase usado só no servidor, com a chave secreta. A chave
// secreta ignora o RLS, por isso este arquivo nunca pode ir para o navegador
// (o import "server-only" acima garante isso).
function criarCliente() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !chave) {
    throw new Error("Faltam SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo web/.env.local (veja web/.env.example).");
  }
  return createClient(url, chave, { auth: { persistSession: false } });
}

let cliente: ReturnType<typeof criarCliente> | undefined;

export function supabase() {
  cliente ??= criarCliente();
  return cliente;
}
