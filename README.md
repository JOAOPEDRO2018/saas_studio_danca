# IsaDance: gestão de studio de dança

Sistema de gestão para o studio IsaDance: alunas, turmas e mensalidades, com cobrança automática pelo Asaas e aviso por WhatsApp.

**Fase atual:** protótipo enxuto em Next.js, ainda com dados de exemplo. As decisões e as etapas estão em [docs/plano.md](docs/plano.md).

## Rodar o sistema

Precisa do Node.js 20 ou mais novo.

```powershell
cd web
npm install
npm run dev
```

Depois abra http://localhost:3000. O login ainda é provisório: qualquer e-mail e senha entram.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| [web/](web/) | O sistema (Next.js). |
| [docs/plano.md](docs/plano.md) | Decisões, fluxo de cobrança e etapas do projeto. |
| [DESIGN.md](DESIGN.md) | Design system gerado pelo Stitch: cores, tipografia e componentes. |
| [stitch/](stitch/) | Telas originais exportadas do Google Stitch e o logo. Servem só de referência. |
| [prototipo/](prototipo/) | Primeiro protótipo, gerado das telas do Stitch e mostrado ao cliente. Serve só de referência. |
| [scripts/montar-prototipo.ps1](scripts/montar-prototipo.ps1) | Gera `prototipo/` a partir de `stitch/screens/`. |
