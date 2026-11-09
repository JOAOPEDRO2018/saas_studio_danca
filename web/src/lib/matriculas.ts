// Compara as turmas em que a aluna já está com as marcadas no formulário.
// Mexer só no que mudou evita registros falsos no log (Etapa 6): apagar e
// recriar todas as matrículas a cada salvamento apareceria como "removeu" e
// "criou" em turmas que nem mudaram.
export function diferencaDeTurmas(atuais: string[], marcadas: string[]) {
  return {
    incluir: marcadas.filter((turma) => !atuais.includes(turma)),
    retirar: atuais.filter((turma) => !marcadas.includes(turma)),
  };
}
