// Estado que as Server Actions de cadastro devolvem para o formulário quando
// algo está errado: a mensagem de cada campo e o que a pessoa tinha digitado,
// para os campos não voltarem vazios.

export type EstadoFormulario = {
  erros: Record<string, string>;
  valores?: Record<string, string[]>;
};

export const estadoInicial: EstadoFormulario = { erros: {} };

export function valoresDo(formData: FormData): Record<string, string[]> {
  const valores: Record<string, string[]> = {};
  for (const chave of new Set(formData.keys())) {
    valores[chave] = formData.getAll(chave).map(String);
  }
  return valores;
}

// Valor a mostrar num campo: o que foi enviado (se houve erro) ou o padrão.
export function valorDe(estado: EstadoFormulario, campo: string, padrao: string | number = "") {
  return estado.valores ? (estado.valores[campo]?.[0] ?? "") : String(padrao);
}

// Se uma caixa de marcar deve aparecer marcada.
export function marcadoEm(estado: EstadoFormulario, campo: string, valor: string, padrao: boolean) {
  return estado.valores ? (estado.valores[campo] ?? []).includes(valor) : padrao;
}
