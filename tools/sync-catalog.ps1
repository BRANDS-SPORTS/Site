$ErrorActionPreference = 'Stop'

$items = [System.Collections.Generic.List[object]]::new()
$requests = [System.Collections.Generic.List[object]]::new()
$excludedNonGarments = [System.Collections.Generic.List[string]]::new()

function ConvertTo-SearchText {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) { return '' }

  $decomposed = $Value.Normalize([System.Text.NormalizationForm]::FormD)
  $builder = [System.Text.StringBuilder]::new()
  foreach ($character in $decomposed.ToCharArray()) {
    $category = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($character)
    if ($category -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$builder.Append($character)
    }
  }

  return ([regex]::Replace($builder.ToString().ToLowerInvariant(), '[^a-z0-9]+', ' ')).Trim()
}

1..5 | ForEach-Object {
  $requests.Add([pscustomobject]@{ Query = ''; Page = $_ })
}

'Terceirao', 'Nono Ano', 'Abada', 'Interclasse', 'Agro', 'Religiao', 'Pesca', 'Professor', 'Formandos', 'Profissao', 'Time Amador' | ForEach-Object {
  $requests.Add([pscustomobject]@{ Query = $_; Page = 1 })
}

foreach ($request in $requests) {
  $query = [uri]::EscapeDataString($request.Query)
  $url = "https://www.janeteartes.com/catalogo.php?busca=$query&limite=52&pagina=$($request.Page)"
  Write-Output "Lendo: $url"
  $html = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content

  foreach ($chunk in ($html -split '<div class="grid-item">' | Select-Object -Skip 1)) {
    $urlMatch = [regex]::Match($chunk, '<a href="(?<value>[^"]+)"')
    $imageMatch = [regex]::Match($chunk, '<img[^>]+data-codigo="(?<code>[^"]+)"[^>]+src="(?<value>[^"]+)"')
    if (-not $imageMatch.Success) {
      $imageMatch = [regex]::Match($chunk, '<img[^>]+src="(?<value>[^"]+)"[^>]*data-codigo="(?<code>[^"]+)"')
    }
    $titleMatch = [regex]::Match($chunk, '<h2 class="product-title-list">(?<value>[\s\S]*?)</h2>')
    if (-not ($urlMatch.Success -and $imageMatch.Success -and $titleMatch.Success)) { continue }

    $decodedTitle = [System.Net.WebUtility]::HtmlDecode($titleMatch.Groups['value'].Value)
    $title = [regex]::Replace([regex]::Replace($decodedTitle, '<[^>]+>', ' '), '\s+', ' ').Trim()
    $searchTitle = ConvertTo-SearchText $title

    $garmentPattern = '\b(camisa|camiseta|polo|abada|regata|uniforme|conjunto|short|shorts|bermuda|calcao|jaqueta|moletom|blusa)\b'
    $digitalArtifact = '\b(arquivo|download|png|dtf|cdr|pdf|psd|eps|svg|mock ?up|molde|template|layout|design|digital|grafica|grafico|fonte|tipografia|gabarito|curso|aula|tutorial)\b'
    $fileBundle = '\b(pack|pacote)\b.*\b(arquivo|arte|estampa|fonte|png|cdr|pdf|svg|eps|psd|dtf)\b'
    $structuralTitle = [regex]::Replace($searchTitle, '^((arte|vetor|estampa)\s+)+', '')
    $garmentStart = '^(camisa|camiseta|polo|abada|regata|uniforme|conjunto|short|shorts|bermuda|calcao|jaqueta|moletom|blusa)\b'
    $modelStart = '^(modelo( de)?|exclusiva)\s+(camisa|camiseta|polo|abada|regata|uniforme|conjunto|short|shorts|bermuda|calcao|jaqueta|moletom|blusa)\b'

    if ($searchTitle -notmatch $garmentPattern) { continue }
    if ($searchTitle -match $digitalArtifact -or $searchTitle -match $fileBundle -or ($structuralTitle -notmatch $garmentStart -and $structuralTitle -notmatch $modelStart)) {
      $excludedNonGarments.Add($title)
      continue
    }

    $items.Add([pscustomobject][ordered]@{
      name = $title
      code = $imageMatch.Groups['code'].Value
      image = [System.Net.WebUtility]::HtmlDecode($imageMatch.Groups['value'].Value)
      category = $request.Query
    })
  }
}

$unique = $items | Group-Object name | ForEach-Object {
  $first = $_.Group[0]
  [pscustomobject][ordered]@{
    name = $first.name
    code = $first.code
    image = $first.image
    categories = @($_.Group.category | Where-Object { $_ } | Sort-Object -Unique)
  }
} | Sort-Object name

$json = $unique | ConvertTo-Json -Depth 4 -Compress
$output = "window.BRANDS_CATALOG = $json;"
$outputPath = Join-Path $PSScriptRoot '..\catalog-data.js'
Set-Content -LiteralPath $outputPath -Value $output -Encoding utf8

Write-Output "Modelos exportados: $($unique.Count)"
Write-Output "Itens digitais ou auxiliares descartados: $($excludedNonGarments.Count)"
