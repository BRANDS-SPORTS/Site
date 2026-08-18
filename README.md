# Brands Sports

Site estático da Brands Sports com catálogo próprio de modelos, busca, filtros, seleção múltipla e atendimento pelo WhatsApp.

## Visualizar

Abra `index.html` diretamente no navegador ou sirva a pasta com qualquer servidor estático.

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
