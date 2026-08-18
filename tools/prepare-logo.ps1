$ErrorActionPreference = 'Stop'

$assetsPath = Join-Path $PSScriptRoot '..\assets'
$sourcePath = Join-Path $assetsPath 'logo-brands-source.png'
$outputPath = Join-Path $assetsPath 'logo-brands-white.png'

New-Item -ItemType Directory -Path $assetsPath -Force | Out-Null
if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Logo original não encontrada: $sourcePath" }

Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
$left = $source.Width
$top = $source.Height
$right = 0
$bottom = 0

for ($y = 0; $y -lt $source.Height; $y++) {
  for ($x = 0; $x -lt $source.Width; $x++) {
    $pixel = $source.GetPixel($x, $y)
    $brightness = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
    if ($brightness -gt 28) {
      if ($x -lt $left) { $left = $x }
      if ($x -gt $right) { $right = $x }
      if ($y -lt $top) { $top = $y }
      if ($y -gt $bottom) { $bottom = $y }
    }
  }
}

if ($right -le $left -or $bottom -le $top) { throw 'A área visível da logo não foi encontrada.' }

$padding = 30
$left = [Math]::Max(0, $left - $padding)
$top = [Math]::Max(0, $top - $padding)
$right = [Math]::Min($source.Width - 1, $right + $padding)
$bottom = [Math]::Min($source.Height - 1, $bottom + $padding)
$width = $right - $left + 1
$height = $bottom - $top + 1

$output = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $height; $y++) {
  for ($x = 0; $x -lt $width; $x++) {
    $pixel = $source.GetPixel($left + $x, $top + $y)
    $brightness = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
    $alpha = [Math]::Max(0, [Math]::Min(255, [int](($brightness - 6) * 1.06)))
    $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
  }
}

$output.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$source.Dispose()
$output.Dispose()

Write-Output "Logo preparada: $outputPath ($($width)x$($height))"
