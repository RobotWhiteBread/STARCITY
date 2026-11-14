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


# STARCITY: assessed values per parcel, for a 3D value layer. Public county assessor figures only.
# Owner names and mailing addresses are never requested: the script reads the layer's field list and
# keeps only value, sale, size and zoning fields.
$layer = "$srv/Assessor/TaxParcels/MapServer/0"
$vdir = Join-Path $dir "values"; New-Item -ItemType Directory -Force -Path $vdir | Out-Null
& curl.exe -sS -A $ua -m 60 -o (Join-Path $vdir "fields.json") "${layer}?f=json"
$meta = Get-Content (Join-Path $vdir "fields.json") -Raw | ConvertFrom-Json
$want = $meta.fields | Where-Object { $_.name -match 'VAL|ASSES|APPR|LAND|IMPR|SALE|ACRE|SQFT|ZON' -and $_.name -notmatch 'OWN|NAME|MAIL|ADDR|CARE' } | ForEach-Object { $_.name }
Write-Host ("Value fields found: " + ($want -join ", "))
if (-not $want) { Write-Host "No value fields in this layer. Send Claude values\fields.json."; exit }
$fields = (@("PARCELID") + $want) -join "%2C"
$n = Get-Pages "values" $layer $fields "json" "false" 5000
Write-Host ("values: {0} parcels saved in the values folder" -f $n)
