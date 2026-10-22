# Plano do sistema IsaDance

## Decisões

- **Um studio só** (IsaDance). Nada de multiempresa por enquanto.
- **Stack:** Next.js (pasta `web/`) + Supabase (banco Postgres e login).
- **Hospedagem:** AWS. É um objetivo de aprendizado também, então cada etapa de AWS vem explicada.
- **Cobrança:** Asaas.
- **Telas:** versão enxuta. O protótipo do Stitch (`stitch/` e `prototipo/`) fica só como referência visual. Funções novas entram quando forem necessárias.

## Fluxo de cobrança pedido pelo cliente

1. Cada aluna tem uma mensalidade por mês, com dia de vencimento.
2. **Um dia depois do vencimento**, se a mensalidade não consta como paga, o sistema gera o boleto e envia uma mensagem no WhatsApp da aluna com ele.
3. Quando o pagamento é feito, o Asaas avisa o sistema (webhook) e a mensalidade passa a constar como **paga** automaticamente.

Pontos a definir na etapa do WhatsApp:
- **Como enviar a mensagem.** As opções são o recurso de notificação por WhatsApp do próprio Asaas, se atender ao fluxo, ou a API oficial do WhatsApp Business. A API oficial exige um modelo de mensagem aprovado pela Meta e cobra por conversa.
- **Pix junto do boleto.** O Pix compensa na hora; o boleto leva de 1 a 3 dias úteis.

## Equipe e logs (definido em 21/10/2026)

- Dois perfis: **dona** e **recepção**. As duas veem e editam tudo.
- A dona tem uma aba de **logs** com o rastreio das atividades: quem, quando, onde (o registro afetado) e o que (antes e depois de cada campo alterado).
- Entram no log: entradas e saídas (inclusive senha errada), cadastros e edições, mensalidades e pagamentos (inclusive as mudanças feitas pelo sistema, como o aviso do Asaas).
- Ninguém apaga nem altera um registro de log. Depois de 1 ano o sistema apaga os registros sozinho, mas antes manda o que será apagado para um e-mail de backup (o cliente vai informar qual).

## Etapas

Cada etapa termina com um commit.

| # | Etapa | Situação |
|---|-------|----------|
| 1 | Criar o app Next.js em `web/` | feito |
| 2 | Protótipo enxuto (Painel, Alunas, Turmas, Mensalidades, Login) com dados de exemplo | feito |
| 3 | Supabase: criar o projeto e as tabelas, e trocar os dados de exemplo pelos do banco | feito |
| 4 | Cadastrar e editar alunas e turmas | feito |
| 5 | Login de verdade (Supabase Auth) com dois perfis: dona e recepção | feito |
| 6 | Logs de atividade (aba só da dona) | próxima |
| 7 | Primeiro deploy na AWS (Amplify Hosting) | |
| 8 | Gerar as mensalidades de cada mês automaticamente | |
| 9 | Asaas em ambiente de testes (sandbox): criar a cobrança e receber o aviso de pagamento | |
| 10 | Envio pelo WhatsApp e rotina diária na AWS (EventBridge + Lambda), incluindo a limpeza dos logs | |
| 11 | Virar a chave para produção com o cliente | |
