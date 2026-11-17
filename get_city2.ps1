# STARCITY step 4
# 1. The CURRENT city building footprints. (The first pull took layer 0 of the city service,
#    which turned out to be the 2007 survey. Layers 7 and 8 are 2024 and 2026.)
# 2. The city's public tree inventory (species and trunk diameter).
# 3. Building facts per parcel: number of floors, year built, structure type.
#    Owner names, mailing addresses and property values are NOT requested.
# 4. A few small city layers: FEMA flood zones, levees, trails, historic sites, traffic signals.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua  = "STARCITY-map/1.0 (personal project)"
$geo = "geometry=-96.73%2C40.70%2C-96.55%2C40.84&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"
$srv = "https://gis.lincoln.ne.gov/public/rest/services"

function Get-Pages($name, $layerUrl, $fields, $format, $geom, $step) {
  $odir = Join-Path $dir $name
  New-Item -ItemType Directory -Force -Path $odir | Out-Null
  $off = 0; $total = 0
  for ($p = 0; $p -lt 400; $p++) {
    $out = Join-Path $odir ("{0}_{1:D3}.json" -f $name, $p)
    $url = "$layerUrl/query?where=1%3D1&$geo&outFields=$fields&returnGeometry=$geom&outSR=4326&resultOffset=$off&resultRecordCount=$step&f=$format"
    & curl.exe -sS -A $ua -m 180 -o $out $url
    $txt = ""
    if (Test-Path $out) { $txt = [System.IO.File]::ReadAllText($out) }
    if (($txt.Length -lt 4000) -and ($txt -match '"error"\s*:')) {
      Write-Host ("  {0} page {1} returned an error: {2}" -f $name, $p, $txt.Substring(0, [Math]::Min(220, $txt.Length))) -ForegroundColor Yellow
      if ($p -eq 0) { return -1 }
      break
    }
    if ($format -eq "geojson") { $n = ([regex]::Matches($txt, '"type"\s*:\s*"Feature"')).Count }
    else { $n = ([regex]::Matches($txt, '"attributes"\s*:')).Count }
    # An empty page used to be read as "end of data", so one dropped request
    # silently truncated the layer and left a file that still looked valid.
    # Retry before believing it.
    if (($n -eq 0) -and ($p -gt 0)) {
      foreach ($try in 1..3) {
        Write-Host ("  {0} page {1} came back empty, retry {2} of 3" -f $name, $p, $try) -ForegroundColor Yellow
        Start-Sleep -Seconds (3 * $try)
        & curl.exe -sS -A $ua -m 300 --connect-timeout 20 -o $out $url
        if (Test-Path $out) { $txt = [System.IO.File]::ReadAllText($out) } else { $txt = "" }
        if ($format -eq "geojson") { $n = ([regex]::Matches($txt, '"type"\s*:\s*"Feature"')).Count }
        else { $n = ([regex]::Matches($txt, '"attributes"\s*:')).Count }
        if ($n -gt 0) { break }
      }
    }
    $total += $n
    Write-Host ("  {0} page {1}: {2}" -f $name, $p, $n)
    if ($n -eq 0) { break }
    $more = $txt -match 'exceededTransferLimit"\s*:\s*true'
    if (($n -lt $step) -and (-not $more)) { break }
    $off += $n
    Start-Sleep -Milliseconds 300
  }
  return $total
}

function Get-Service($name, $svcUrl) {
  $meta = Join-Path $dir ("{0}.service.json" -f $name)
  & curl.exe -sS -A $ua -m 60 -o $meta ($svcUrl + "?f=json")
  try { $j = Get-Content $meta -Raw | ConvertFrom-Json } catch { Write-Host ("  {0}: could not read the service description" -f $name) -ForegroundColor Yellow; return }
  foreach ($l in $j.layers) {
    if ($l.subLayerIds) { continue }
    $t = Get-Pages ("{0}_{1}" -f $name, $l.id) ($svcUrl + "/" + $l.id) "*" "geojson" "true" 1000
    $c = & curl.exe -sS -A $ua -m 60 "$svcUrl/$($l.id)/query?where=1%3D1&$geo&returnCountOnly=true&f=json"
    $want = -1; if ($c -match '"count"\s*:\s*(\d+)') { $want = [int]$Matches[1] }
    if (($want -ge 0) -and ($t -ne $want)) {
      Write-Host ("  {0} layer {1} ({2}): SHORT, got {3} of {4}" -f $name, $l.id, $l.name, $t, $want) -ForegroundColor Red
    } else {
      Write-Host ("  {0} layer {1} ({2}): {3} features" -f $name, $l.id, $l.name, $t)
    }
  }
}

Write-Host "1. Current building footprints (2026 layer)..."
$ff = "status%2CPID%2CPROP_CLASS%2Credrawn"
$n = Get-Pages "city26" "$srv/BuildingSafety/BuildingFootprints/MapServer/8" $ff "geojson" "true" 2000
Write-Host ("   2026 layer: {0} buildings" -f $n)
if ($n -lt 50000) {
  Write-Host "   2026 layer did not download fully, taking the 2024 layer as well..." -ForegroundColor Yellow
  $n = Get-Pages "city24" "$srv/BuildingSafety/BuildingFootprints/MapServer/7" $ff "geojson" "true" 2000
  Write-Host ("   2024 layer: {0} buildings" -f $n)
}

Write-Host "2. Public tree inventory..."
$n = Get-Pages "trees" "$srv/Parks/Trees/MapServer/0" "CommonName%2CScientificName%2CDBH%2CTreeType%2CLifeCycle%2CSiteLocation" "geojson" "true" 2000
Write-Host ("   trees: {0}" -f $n)

Write-Host "3. Building facts per parcel (floors, year built, structure type; no owners, no values)..."
$n = Get-Pages "parcels" "$srv/Assessor/TaxParcels/MapServer/0" "PARCELID%2CFLOORCOUNT%2CRESYRBLT%2CRESSTRTYP%2CSTRCLASS%2CUSEDSCRP%2CBLDGAREA%2CPRIMEUSE" "json" "false" 5000
Write-Host ("   parcels: {0}" -f $n)

Write-Host "4. Flood zones, levees, trails, historic sites, traffic signals..."
Get-Service "flood"    "$srv/LTUWatershed/FEMAFlood/MapServer"
Get-Service "levees"   "$srv/LTUWatershed/Levees/MapServer"
Get-Service "trails"   "$srv/Parks/All_Trails_Colored/MapServer"
Get-Service "historic" "$srv/Planning/HistoricPreservation/MapServer"
Get-Service "signals"  "$srv/LTUTraffic/TrafficSignals/MapServer"

# Can a web page read the city server directly? (decides whether live road closures are possible)
$ldir = Join-Path $dir "live"; New-Item -ItemType Directory -Force -Path $ldir | Out-Null
& curl.exe -sS -A $ua -m 60 -H "Origin: https://robotwhitebread.github.io" -D (Join-Path $ldir "closures.headers.txt") -o (Join-Path $ldir "closures.json") "$srv/CityCounty/RoadClosuresPublic/MapServer?f=json"

Write-Host "`nFinished step 4." -ForegroundColor Green
Get-ChildItem $dir -Directory | Where-Object { $_.Name -match '^(city2|trees|parcels|flood|levees|trails|historic|signals)' } | ForEach-Object {
  $f = Get-ChildItem $_.FullName -File
  "{0,-14} {1,4} files {2,8:N1} MB" -f $_.Name, $f.Count, (($f | Measure-Object Length -Sum).Sum / 1MB)
}
