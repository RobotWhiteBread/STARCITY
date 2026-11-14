# STARCITY step 2: every building footprint in Nebraska (Microsoft open data, ODbL) + terrain tiles.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$zip = Join-Path $dir "Nebraska.geojson.zip"
if (-not (Test-Path $zip) -or (Get-Item $zip).Length -lt 20MB) {
  Write-Host "Downloading Nebraska building footprints (roughly 80 MB)..."
  & curl.exe -L -A "STARCITY-map/1.0" -o $zip "https://minedbuildings.z5.web.core.windows.net/legacy/usbuildings-v2/Nebraska.geojson.zip"
} else { Write-Host "Footprints already downloaded" -ForegroundColor Green }
$tdir = Join-Path $dir "terrain"
New-Item -ItemType Directory -Force -Path $tdir | Out-Null
Write-Host "Downloading terrain tiles..."
for ($x = 1894; $x -le 1898; $x++) {
  for ($y = 3076; $y -le 3080; $y++) {
    $out = Join-Path $tdir "13_${x}_${y}.png"
    if (-not (Test-Path $out) -or (Get-Item $out).Length -lt 500) {
      & curl.exe -s -A "STARCITY-map/1.0" -o $out "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/$x/$y.png"
    }
  }
}
Write-Host "`nFinished step 2." -ForegroundColor Green
Get-ChildItem $dir -Filter *.zip | Select-Object Name, @{n='MB';e={[Math]::Round($_.Length/1MB,1)}} | Format-Table -AutoSize
Write-Host ("Terrain tiles: " + (Get-ChildItem $tdir -Filter *.png).Count)
