# STARCITY: pull parcels and sales for all of Lincoln, not just the map square.
# Public layers only. Owner names and addresses are never requested.
# Run from the STARCITY folder. Results land in gis\parcels_all and gis\sales_all.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua  = "STARCITY-map/1.0 (personal project)"
$gd  = Join-Path $dir "gis"; New-Item -ItemType Directory -Force -Path $gd | Out-Null
$city = "https://gis.lincoln.ne.gov/public/rest/services"
function Pull($name, $layerUrl, $fields, $geom, $offset, $step, $maxPages) {
  $odir = Join-Path $gd $name
  New-Item -ItemType Directory -Force -Path $odir | Out-Null
  $fmt = "geojson"; if ($geom -eq "false") { $fmt = "json" }
  $extra = ""; if ($offset) { $extra = "&maxAllowableOffset=" + $offset }
  $off = 0; $total = 0
  for ($p = 0; $p -lt $maxPages; $p++) {
    $out = Join-Path $odir ("{0}_{1:D3}.json" -f $name, $p)
    $url = "$layerUrl/query?where=1%3D1$extra&outFields=$fields&returnGeometry=$geom&outSR=4326&geometryPrecision=6&resultOffset=$off&resultRecordCount=$step&f=$fmt"
    & curl.exe -sS -A $ua -m 240 --connect-timeout 20 -o $out $url
    $txt = ""; if (Test-Path $out) { $txt = [System.IO.File]::ReadAllText($out) }
    if (($txt.Length -lt 4000) -and ($txt -match '"error"\s*:')) { Write-Host ("  {0} page {1} error: {2}" -f $name, $p, $txt.Substring(0, [Math]::Min(260, $txt.Length))) -ForegroundColor Yellow; break }
    if ($fmt -eq "geojson") { $n = ([regex]::Matches($txt, '"type"\s*:\s*"Feature"')).Count } else { $n = ([regex]::Matches($txt, '"attributes"\s*:')).Count }
    $total += $n
    if ($n -eq 0) { break }
    $more = $txt -match 'exceededTransferLimit"\s*:\s*true'
    if (($n -lt $step) -and (-not $more)) { break }
    $off += $n
    Write-Host ("  {0}: {1} so far" -f $name, $total)
    Start-Sleep -Milliseconds 250
  }
  Write-Host ("{0,-14} {1,7} records" -f $name, $total)
}
$t = & curl.exe -sS -A $ua -m 60 "$city/Assessor/TaxParcels/MapServer/0/query?where=1%3D1&returnCountOnly=true&f=json"
Write-Host ("Parcels on the county server: " + ($t -join " "))
Pull "parcels_all" "$city/Assessor/TaxParcels/MapServer/0" "PARCELID%2CCNTASSDVAL%2CCVTTXCD%2CSCHLDSCRP%2CNGHBRHDCD%2CCLASSDSCRP%2CRESFLRAREA%2CHighRise%2CRESYRBLT" "true" "0.00012" 2000 120
Pull "sales_all" "$city/Assessor/PropertySales/MapServer/0" "PID%2CSalePrice%2CSaleDate%2CSaleType%2CSaleValidityCode%2CPropType%2CSalePriceSF%2CAssdValue%2CResStructureType%2CResYrBlt%2CResFlrArea%2CNBH%2CNBHGroup" "true" "" 2000 40
Write-Host "Done. Tell Claude it finished."
