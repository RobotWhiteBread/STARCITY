# STARCITY step 9: voting precincts, voter registration by precinct, and the county's posted election results.
# Public map layers and public web pages only. These files hold totals per precinct, nothing about any one voter.
# Everything lands in the "votes" folder next to this script.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua  = "STARCITY-map/1.0 (personal project)"
# all of Lancaster County
$geo = "geometry=-96.95%2C40.50%2C-96.40%2C41.06&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"
$srv = "https://gis.lincoln.ne.gov/public/rest/services"
$vd  = Join-Path $dir "votes"; New-Item -ItemType Directory -Force -Path $vd | Out-Null

function Get-Pages($name, $layerUrl, $fields, $format, $geom, $step) {
  $odir = Join-Path $vd $name
  New-Item -ItemType Directory -Force -Path $odir | Out-Null
  $off = 0; $total = 0
  for ($p = 0; $p -lt 60; $p++) {
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

function Get-Service($name, $svcUrl) {
  $meta = Join-Path $vd ("{0}.service.json" -f $name)
  & curl.exe -sS -A $ua -m 60 --connect-timeout 20 -o $meta ($svcUrl + "?f=json")
  try { $j = Get-Content $meta -Raw | ConvertFrom-Json } catch { Write-Host ("  {0}: could not read the service description" -f $name) -ForegroundColor Yellow; return }
  foreach ($l in $j.layers) {
    if ($l.subLayerIds) { continue }
    $t = Get-Pages ("{0}_{1}" -f $name, $l.id) ($svcUrl + "/" + $l.id) "*" "geojson" "true" 1000
    Write-Host ("  {0} layer {1} ({2}): {3} features" -f $name, $l.id, $l.name, $t)
  }
}

Write-Host "1. Election districts and voting precincts..."
Get-Service "elections" "$srv/Planning/Elections/MapServer"
Get-Service "precincts" "$srv/ElectionCommission/VoterPrecincts/MapServer"
Write-Host "2. Voter registration by precinct..."
Get-Service "voterreg"  "$srv/ElectionCommission/VoterRegistration/MapServer"

Write-Host "3. The county's posted election results pages..."
$base = "https://app.lincoln.ne.gov/cnty/election/results"
$pages = @("resul26n", "resul26p", "resul25g", "resul25c", "resul25p", "resul24n", "resul24p", "resul23g", "resul23c", "resul23p", "resul22n", "resul22p", "resul20n", "resul18n")
foreach ($pg in $pages) {
  $o = Join-Path $vd ($pg + ".htm")
  & curl.exe -sS -L -A $ua -m 60 --connect-timeout 20 -o $o "$base/$pg.htm"
  $len = 0; if (Test-Path $o) { $len = (Get-Item $o).Length }
  Write-Host ("  {0,-12} {1,9} bytes" -f $pg, $len)
  Start-Sleep -Milliseconds 300
}
& curl.exe -sS -L -A $ua -m 60 --connect-timeout 20 -o (Join-Path $vd "results_index.htm") "$base/"
& curl.exe -sS -L -A $ua -m 60 --connect-timeout 20 -o (Join-Path $vd "election_home.htm") "https://www.lancaster.ne.gov/election"

$zip = Join-Path $dir "votes.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
try { Compress-Archive -Path (Join-Path $vd "*") -DestinationPath $zip -ErrorAction Stop; Write-Host ("votes.zip: {0:N0} bytes" -f (Get-Item $zip).Length) } catch { Write-Host "could not zip the votes folder" -ForegroundColor Yellow }
Write-Host "`nFinished. Results are in $vd" -ForegroundColor Green
