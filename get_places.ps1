# STARCITY: download businesses, restaurants and other places for Lincoln, NE from OpenStreetMap (one file: places.json).
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$servers = @(
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
)
$S = 40.70; $N = 40.84; $W = -96.73; $E = -96.55
$jobs = @()
$full = "$S,$W,$N,$E"
# every business and place to eat or drink that OpenStreetMap has for Lincoln, with its cuisine tag when there is one
$jobs += ,@("places", "[out:json][timeout:180][maxsize:536870912][bbox:$full];(nwr[amenity~'^(restaurant|cafe|fast_food|bar|pub|biergarten|ice_cream|food_court|nightclub|bank|pharmacy|fuel|cinema|theatre|library|veterinary|clinic|dentist|doctors|childcare|car_wash|marketplace)$'];nwr[shop];nwr[craft];nwr[office];nwr[tourism~'^(hotel|motel|museum|gallery|attraction)$'];nwr[leisure~'^(fitness_centre|bowling_alley|sports_centre|golf_course)$'];);out center tags;")

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
