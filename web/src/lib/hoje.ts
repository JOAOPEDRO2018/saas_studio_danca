import { connection } from "next/server";
import { diaEmBrasilia } from "./fuso.ts";

// Com cacheComponents ligado, ler a data atual exige adiar a renderização para
// o momento da requisição. Use dentro de um componente envolvido em <Suspense>.
// Devolve o dia de hoje em Brasília (à meia-noite), qualquer que seja o fuso
// do servidor.
export async function hoje() {
  await connection();
  return diaEmBrasilia(new Date());
}
