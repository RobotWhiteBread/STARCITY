# STARCITY step 3: Microsoft footprints with height estimates, the StarTran schedule,
# and samples of the live feeds (to check they can be read from a web page).
# (An earlier version also pulled the city's 2007 building footprints here. The current
# city footprints come from get_city2.ps1.)
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua = "STARCITY-map/1.0 (personal project)"
$origin = "https://robotwhitebread.github.io"

# 1. Microsoft global footprints (these carry height estimates) for the one tile that covers Lincoln
$links = Join-Path $dir "dataset-links.csv"
& curl.exe -sS -L -A $ua -o $links "https://bfppub.blob.core.windows.net/%24web/2026-08-13/dataset-links.csv"
$rows = Import-Csv $links | Where-Object { $_.QuadKey -eq "023110110" }
$i = 0
foreach ($r in $rows) {
  $out = Join-Path $dir ("ms_global_{0}_{1}.csv.gz" -f $r.Location, $i); $i++
  Write-Host "Microsoft heights: $($r.Location) $($r.Size)"
  & curl.exe -sS -L -A $ua -o $out $r.Url
}
if ($i -eq 0) { Write-Host "No Microsoft tile found for Lincoln. The dated folder in the dataset-links address may have changed." -ForegroundColor Yellow }

# 2. StarTran schedule (routes and timetables)
& curl.exe -sS -L -A $ua -o (Join-Path $dir "gtfs.zip") "https://startran.connexionz.net/rtt/public/resource/gtfs.zip"

# 3. Samples of the live feeds, plus whether each one allows a web page to read it
$ldir = Join-Path $dir "live"; New-Item -ItemType Directory -Force -Path $ldir | Out-Null
$feeds = @{
  "buses.pb"   = "https://startran.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/vehicleposition"
  "weather.json" = "https://api.weather.gov/stations/KLNK/observations/latest"
  "water.json" = "https://api.waterdata.usgs.gov/ogcapi/v0/collections/latest-continuous/items?f=json&bbox=-96.80,40.65,-96.50,40.90&parameter_code=00060&limit=50"
  "water_sites.json" = "https://api.waterdata.usgs.gov/ogcapi/v0/collections/monitoring-locations/items?f=json&bbox=-96.80,40.65,-96.50,40.90&site_type_code=ST&limit=100"
}
foreach ($k in $feeds.Keys) {
  & curl.exe -sS -L -A $ua -m 60 -H "Origin: $origin" -D (Join-Path $ldir "$k.headers.txt") -o (Join-Path $ldir $k) $feeds[$k]
  Write-Host "live sample: $k"
}
Write-Host "`nFinished step 3." -ForegroundColor Green
Get-ChildItem $dir -File | Where-Object { $_.Name -match 'ms_global|gtfs|dataset' } | Select-Object Name, @{n='MB';e={[Math]::Round($_.Length/1MB,2)}} | Format-Table -AutoSize
