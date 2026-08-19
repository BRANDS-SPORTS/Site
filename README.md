# Brands Sports

Site estático da Brands Sports com catálogo próprio de modelos, busca, filtros, seleção múltipla e atendimento pelo WhatsApp.

## Visualizar

Com o Node.js instalado, execute na raiz do projeto:

```powershell
node .\tools\local-server.mjs
```

Depois, acesse `http://127.0.0.1:4173`. Para usar outra porta, informe-a no fim do comando, por exemplo: `node .\tools\local-server.mjs 8080`.

## Atualizar o catálogo

No PowerShell, a partir da raiz do projeto:

```powershell
& '.\tools\sync-catalog.ps1'
```

O comando atualiza `catalog-data.js` a partir do catálogo público sem preços usado como referência. A sincronização mantém apenas títulos estruturados como peças e descarta arquivos digitais, moldes, templates, layouts e materiais auxiliares.

## Contato

O número de atendimento fica centralizado em `config.js`.

## Arquivos da marca

`assets/logo-brands-source.png` preserva o arquivo enviado. A versão transparente usada no site é `assets/logo-brands-white.png` e pode ser refeita com `tools/prepare-logo.ps1`.
