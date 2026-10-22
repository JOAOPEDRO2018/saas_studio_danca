"use server";

import { redirect } from "next/navigation";
import { buscarMembro, supabaseLogin } from "@/lib/supabase";

export type EstadoLogin = { erro?: string; email?: string };

export async function entrar(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe o e-mail e a senha.", email };

  const cliente = await supabaseLogin();
  const { data, error } = await cliente.auth.signInWithPassword({ email, password: senha });
  // Mesma mensagem para e-mail inexistente e senha errada, para não revelar
  // quais e-mails têm acesso.
  if (error) return { erro: "E-mail ou senha incorretos.", email };

  // Login certo, mas fora da tabela equipe: não deixa entrar.
  if (!(await buscarMembro(cliente, data.user.id))) {
    await cliente.auth.signOut();
    return { erro: "Este e-mail ainda não tem acesso liberado. Fale com a dona do studio.", email };
  }

  redirect("/");
}

export async function sair() {
  await (await supabaseLogin()).auth.signOut();
  redirect("/login");
}
