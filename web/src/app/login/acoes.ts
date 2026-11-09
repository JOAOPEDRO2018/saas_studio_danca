"use server";

import { redirect } from "next/navigation";
import { buscarMembro, supabaseAdmin, supabaseLogin } from "@/lib/supabase";

export type EstadoLogin = { erro?: string; email?: string };

// Grava no log (supabase/04-logs.sql). Se falhar, só avisa no terminal do
// servidor: um problema no log nunca impede alguém de entrar ou sair.
async function registrar(gravar: () => PromiseLike<{ error: { message: string } | null }>) {
  try {
    const { error } = await gravar();
    if (error) console.error("Não foi possível gravar no log:", error.message);
  } catch (erro) {
    console.error("Não foi possível gravar no log:", erro);
  }
}

// Tentativa sem login válido: não há pessoa logada para gravar, então usa a
// chave secreta e guarda o e-mail digitado.
function registrarTentativa(acao: "senha_errada" | "sem_acesso", email: string) {
  return registrar(() => supabaseAdmin().from("logs").insert({ acao, quem: email.slice(0, 200) }));
}

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe o e-mail e a senha.", email };

  const cliente = await supabaseLogin();
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha });
  // Mesma mensagem para e-mail inexistente e senha errada, para não revelar
  // quais e-mails têm acesso.
  if (error) {
    // Outros erros (Supabase fora do ar, muitas tentativas seguidas) não são
    // senha errada, e não vão para o log.
    if (error.code === "invalid_credentials") await registrarTentativa("senha_errada", email);
    return { erro: "E-mail ou senha incorretos.", email };
  }

  // Login certo, mas fora da tabela equipe: não deixa entrar.
  if (!(await buscarMembro(cliente, data.user.id))) {
    await registrarTentativa("sem_acesso", email);
    await cliente.auth.signOut();
    return { erro: "Este e-mail ainda não tem acesso liberado. Fale com a dona do studio.", email };
  }

  await registrar(() => cliente.rpc("registrar_acesso", { p_acao: "entrou" }));
  redirect("/");
}

export async function sair() {
  const cliente = await supabaseLogin();
  // Grava antes de sair: depois do signOut o banco já não sabe quem é.
  await registrar(() => cliente.rpc("registrar_acesso", { p_acao: "saiu" }));
  await cliente.auth.signOut();
  redirect("/login");
}
