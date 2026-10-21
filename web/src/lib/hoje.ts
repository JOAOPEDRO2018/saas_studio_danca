import { connection } from "next/server";

// Com cacheComponents ligado, ler a data atual exige adiar a renderização para
// o momento da requisição. Use dentro de um componente envolvido em <Suspense>.
export async function hoje() {
  await connection();
  return new Date();
}
