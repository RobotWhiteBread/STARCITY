# STARCITY step 12: the city's public tree inventory (Lincoln Parks and Recreation, Community Forestry).
# One record for every tree the city manages: kind, species, trunk diameter, where it stands and the city's tree ID.
# Staff names, notes, addresses and edit history are never requested: the pull below names the fields it wants.
# Pages are read in order of the city's record number, 2,000 at a time. Results land in the "trees" folder
# next to this script and in trees.zip.
$dir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua   = "STARCITY-map/1.0 (personal project)"
$lay  = "https://gis.lincoln.ne.gov/public/rest/services/Parks/Trees/MapServer/0"
$odir = Join-Path $dir "trees"
New-Item -ItemType Directory -Force -Path $odir | Out-Null
$fields = "OBJECTID,TreeID,TreeType,CommonName,ScientificName,LifeCycle,DBH,SiteLocation,ForestryDistrict,ParkUnit,MultiTrunk,ProgramType,ReplacementCost"

$cnt = & curl.exe -sS -A $ua -m 120 "$lay/query?where=1%3D1&returnCountOnly=true&f=json"
Write-Host "Trees on the city's list: $cnt"

$last = 0; $total = 0; $step = 2000; $pages = 0
for ($p = 0; $p -lt 400; $p++) {
  $out = Join-Path $odir ("trees_{0:D3}.json" -f $p)
  $url = "$lay/query?where=OBJECTID%3E$last&outFields=$fields&returnGeometry=true&outSR=4326&geometryPrecision=6&orderByFields=OBJECTID&resultRecordCount=$step&f=json"
  $ok = $false; $txt = ""
  for ($try = 1; ($try -le 4) -and (-not $ok); $try++) {
    $code = & curl.exe -sS -A $ua -m 300 --connect-timeout 30 -o $out -w "%{http_code}" $url
    $txt = ""
    if (Test-Path $out) { $txt = [System.IO.File]::ReadAllText($out) }
    if (($code -eq "200") -and ($txt -match '"features"')) { $ok = $true }
    else {
      Write-Host ("  page {0} try {1}: HTTP {2}, {3} bytes: {4}" -f $p, $try, $code, $txt.Length, $txt.Substring(0, [Math]::Min(200, $txt.Length)))
      Start-Sleep -Seconds (4 * $try)
    }
  }
  if (-not $ok) { Write-Host "  giving up on this page"; break }
  $ids = [regex]::Matches($txt, '"OBJECTID"\s*:\s*(\d+)')
  $n = $ids.Count
  if ($n -eq 0) { break }
  $last = [int]$ids[$n - 1].Groups[1].Value
  $total += $n; $pages++
  Write-Host ("  page {0}: {1} trees (total {2}, through record {3})" -f $p, $n, $total, $last)
  $more = $txt -match 'exceededTransferLimit"\s*:\s*true'
  if (($n -lt $step) -and (-not $more)) { break }
  Start-Sleep -Milliseconds 200
}
Write-Host ("Finished: {0} trees in {1} pages, saved in {2}" -f $total, $pages, $odir)
try {
  Compress-Archive -Path (Join-Path $odir "trees_*.json") -DestinationPath (Join-Path $dir "trees.zip") -Force
  Write-Host ("trees.zip: {0:N0} bytes" -f (Get-Item (Join-Path $dir "trees.zip")).Length)
} catch { Write-Host ("Could not make trees.zip: " + $_.Exception.Message) }
