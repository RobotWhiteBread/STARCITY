# STARCITY step 5 (optional): the city's public tree inventory (species and trunk diameter).
# The first attempt, in get_city2.ps1, produced no files. This version asks for smaller pages,
# retries each page, and prints what the server answered so a failure can be diagnosed.
$dir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua   = "STARCITY-map/1.0 (personal project)"
$lay  = "https://gis.lincoln.ne.gov/public/rest/services/Parks/Trees/MapServer/0"
$odir = Join-Path $dir "trees"
New-Item -ItemType Directory -Force -Path $odir | Out-Null
$geo    = "geometry=-96.73%2C40.70%2C-96.55%2C40.84&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"
$fields = "CommonName%2CScientificName%2CDBH%2CLifeCycle%2CSiteLocation"

Write-Host "Counting trees in the map area..."
$cnt = & curl.exe -sS -A $ua -m 120 "$lay/query?where=1%3D1&$geo&returnCountOnly=true&f=json"
Write-Host "  server says: $cnt"

$step = 1000; $off = 0; $total = 0
for ($p = 0; $p -lt 600; $p++) {
  $out = Join-Path $odir ("trees_{0:D3}.json" -f $p)
  $url = "$lay/query?where=1%3D1&$geo&outFields=$fields&returnGeometry=true&outSR=4326&orderByFields=OBJECTID&resultOffset=$off&resultRecordCount=$step&f=geojson"
  $ok = $false; $txt = ""
  for ($try = 1; ($try -le 3) -and (-not $ok); $try++) {
    $code = & curl.exe -sS -A $ua -m 300 -o $out -w "%{http_code}" $url
    $txt = ""
    if (Test-Path $out) { $txt = [System.IO.File]::ReadAllText($out) }
    if (($code -eq "200") -and ($txt -match '"features"')) { $ok = $true }
    else {
      Write-Host ("  page {0} try {1}: HTTP {2}, {3} bytes: {4}" -f $p, $try, $code, $txt.Length, $txt.Substring(0, [Math]::Min(160, $txt.Length))) -ForegroundColor Yellow
      Start-Sleep -Seconds (3 * $try)
    }
  }
  if (-not $ok) { Write-Host "  giving up on this page" -ForegroundColor Red; break }
  $n = ([regex]::Matches($txt, '"type"\s*:\s*"Feature"')).Count
  $total += $n
  Write-Host ("  page {0}: {1} trees (total {2})" -f $p, $n, $total)
  if ($n -eq 0) { break }
  $more = $txt -match 'exceededTransferLimit"\s*:\s*true'
  if (($n -lt $step) -and (-not $more)) { break }
  $off += $n
  Start-Sleep -Milliseconds 300
}
Write-Host ("Finished: {0} trees saved in {1}" -f $total, $odir)
