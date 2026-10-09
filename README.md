# IsaDance: gestão de studio de dança

Sistema de gestão para o studio IsaDance: alunos e matrículas, agenda de aulas, mensalidades, equipe e administração.

**Fase atual:** validar as telas com o cliente e definir o escopo da primeira versão. Ainda não há backend, banco de dados nem integração de pagamentos.

## Protótipo navegável

- **Online:** https://joaopedro2018.github.io/saas_studio_danca/ (funciona depois de ativar o GitHub Pages no repositório).
- **Local:** abra [prototipo/index.html](prototipo/index.html) no navegador. Precisa de internet, porque o Tailwind e as fontes vêm de CDN.

Como navegar:
- Na tela de login, **Entrar** leva para Alunos & Matrículas.
- O menu lateral leva às outras telas.
- Em Equipe & Modalidades, **Novo Colaborador** abre o cadastro completo.
- Clicar no avatar no topo mostra a opção **Sair**.

Visão Geral e Relatórios ainda não têm tela e só mostram um aviso. Todos os dados são fictícios.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| [prototipo/](prototipo/) | Protótipo gerado a partir das telas do Stitch. Não edite à mão: rode o script abaixo. |
| [prototipo/assets/prototipo.js](prototipo/assets/prototipo.js) | Navegação entre as telas (login, menu, sair, avisos). |
| [DESIGN.md](DESIGN.md) | Design system do projeto, gerado pelo Stitch: cores, tipografia, espaçamentos e componentes. |
| [stitch/](stitch/) | Telas originais exportadas do Google Stitch e o logo. |
| [scripts/montar-prototipo.ps1](scripts/montar-prototipo.ps1) | Gera `prototipo/` a partir de `stitch/screens/`. |

## Atualizar o protótipo

Depois de exportar telas novas ou alteradas do Stitch para `stitch/screens/`, rode:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\montar-prototipo.ps1
```

Uma tela nova precisa ser adicionada à lista `$paginas` do script. Se ela também for entrar no menu lateral, adicione-a à lista `$menu`.
