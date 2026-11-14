# STARCITY: download OpenStreetMap data for Lincoln, NE in small pieces with retries.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$servers = @(
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
)
$S = 40.70; $N = 40.84; $W = -96.73; $E = -96.55
$jobs = @()
$rows = 3; $cols = 3
for ($r = 0; $r -lt $rows; $r++) {
  for ($c = 0; $c -lt $cols; $c++) {
    $s1 = $S + ($N - $S) * $r / $rows; $n1 = $S + ($N - $S) * ($r + 1) / $rows
    $w1 = $W + ($E - $W) * $c / $cols; $e1 = $W + ($E - $W) * ($c + 1) / $cols
    $bb = ("{0:F5},{1:F5},{2:F5},{3:F5}" -f $s1, $w1, $n1, $e1)
    $jobs += ,@("buildings_${r}_${c}", "[out:json][timeout:180][maxsize:536870912][bbox:$bb];(way[building];relation[building];);out geom;")
  }
}
$full = "$S,$W,$N,$E"
$jobs += ,@("roads", "[out:json][timeout:180][maxsize:536870912][bbox:$full];(way[highway];way[railway=rail];);out geom;")
$jobs += ,@("land", "[out:json][timeout:180][maxsize:536870912][bbox:$full];(way[waterway];way[natural];way[leisure];way[landuse];way[amenity=parking];relation[natural=water];relation[leisure];relation[landuse];);out geom;")
$jobs += ,@("points", "[out:json][timeout:180][maxsize:536870912][bbox:$full];(node[natural=tree];node[place];node[amenity~'^(school|university|hospital|library|place_of_worship|fire_station|police|townhall|theatre|cinema)$'];node[tourism];node[highway=traffic_signals];);out;")

function Test-Good($path) {
  if (-not (Test-Path $path)) { return $false }
  $len = (Get-Item $path).Length
  if ($len -lt 200) { return $false }
  $fs = [System.IO.File]::OpenRead($path)
  try {
    $head = New-Object byte[] 1; [void]$fs.Read($head, 0, 1)
    $tailLen = [Math]::Min(64, $len); [void]$fs.Seek(-$tailLen, 'End')
    $tail = New-Object byte[] $tailLen; [void]$fs.Read($tail, 0, $tailLen)
  } finally { $fs.Close() }
  $t = [System.Text.Encoding]::ASCII.GetString($tail).Trim()
  return ($head[0] -eq 123) -and $t.EndsWith("}")
}

$i = 0
foreach ($j in $jobs) {
  $i++
  $name = $j[0]; $q = $j[1]
  $out = Join-Path $dir "$name.json"
  if (Test-Good $out) { Write-Host "[$i/$($jobs.Count)] $name already done" -ForegroundColor Green; continue }
  $ok = $false
  for ($try = 0; $try -lt 9 -and -not $ok; $try++) {
    $srv = $servers[$try % $servers.Count]
    Write-Host "[$i/$($jobs.Count)] $name  try $($try+1)  $srv"
    & curl.exe -sS -A "STARCITY-map/1.0 (personal project)" -m 240 -o $out --data-urlencode "data=$q" $srv
    if (Test-Good $out) {
      $ok = $true
      Write-Host ("    OK  {0:N1} MB" -f ((Get-Item $out).Length / 1MB)) -ForegroundColor Green
    } else {
      Write-Host "    failed, waiting 15s" -ForegroundColor Yellow
      Start-Sleep -Seconds 15
    }
  }
  if (-not $ok) { Write-Host "    GAVE UP on $name" -ForegroundColor Red }
  Start-Sleep -Seconds 3
}
Write-Host "`nFinished. Files in $dir :"
Get-ChildItem $dir -Filter *.json | Select-Object Name, @{n='MB';e={[Math]::Round($_.Length/1MB,2)}} | Format-Table -AutoSize
