# STARCITY wide: terrain tiles for the full city.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$tdir = Join-Path $dir "terrain"
New-Item -ItemType Directory -Force -Path $tdir | Out-Null
for ($x = 1893; $x -le 1899; $x++) {
  for ($y = 3073; $y -le 3080; $y++) {
    $out = Join-Path $tdir "13_${x}_${y}.png"
    if (-not (Test-Path $out) -or (Get-Item $out).Length -lt 500) { & curl.exe -s -A "STARCITY-map/1.0" -o $out "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/$x/$y.png" }
  }
}
Write-Host ("Terrain tiles: " + (Get-ChildItem $tdir -Filter *.png).Count)
