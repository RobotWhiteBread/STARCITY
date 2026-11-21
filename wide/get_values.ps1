# STARCITY step 8: assessed values per parcel, for a 3D value layer.
# Public county assessor figures only. Owner names, mailing addresses and buyer or seller names are
# never requested: the script reads the layer's field list and keeps only value, sale price and date,
# size and zoning fields, plus the parcel number.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua  = "STARCITY-map/1.0 (personal project)"
$geo = "geometry=-96.81%2C40.69%2C-96.535%2C40.92&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"
$srv = "https://gis.lincoln.ne.gov/public/rest/services"

function Get-Pages($name, $layerUrl, $fields, $format, $geom, $step) {
  $odir = Join-Path $dir $name
  New-Item -ItemType Directory -Force -Path $odir | Out-Null
  $off = 0; $total = 0
  for ($p = 0; $p -lt 400; $p++) {
    $out = Join-Path $odir ("{0}_{1:D3}.json" -f $name, $p)
    $url = "$layerUrl/query?where=1%3D1&$geo&outFields=$fields&returnGeometry=$geom&outSR=4326&resultOffset=$off&resultRecordCount=$step&f=$format"
    & curl.exe -sS -A $ua -m 180 --connect-timeout 20 -o $out $url
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


$layer = "$srv/Assessor/TaxParcels/MapServer/0"
$vdir = Join-Path $dir "values"; New-Item -ItemType Directory -Force -Path $vdir | Out-Null
& curl.exe -sS -A $ua -m 60 --connect-timeout 20 -o (Join-Path $vdir "fields.json") "${layer}?f=json"
$meta = Get-Content (Join-Path $vdir "fields.json") -Raw | ConvertFrom-Json
$want = $meta.fields | Where-Object { $_.name -match 'VAL|ASSES|APPR|LAND|IMPR|SALE|ACRE|SQFT|ZON' -and $_.name -notmatch 'OWN|NAME|MAIL|ADDR|CARE|GRANT|BUYER|SELLER|DEED|PAYER|PERSON|CONTACT|PHONE|EMAIL' } | ForEach-Object { $_.name }
Write-Host ("Value fields found: " + ($want -join ", "))
if (-not $want) { Write-Host "No value fields in this layer. Send Claude values\fields.json."; exit }
$fields = (@("PARCELID") + $want) -join "%2C"
$n = Get-Pages "values" $layer $fields "json" "false" 5000
Write-Host ("values: {0} parcels saved in the values folder" -f $n)
$zip = Join-Path $dir "values.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
try { Compress-Archive -Path (Join-Path $vdir "*") -DestinationPath $zip -ErrorAction Stop; Write-Host ("values.zip: {0:N0} bytes" -f (Get-Item $zip).Length) } catch { Write-Host "could not zip the values folder" -ForegroundColor Yellow }
