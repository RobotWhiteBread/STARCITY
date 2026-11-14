# STARCITY step 6: find out which live city feeds a web page can read, and fetch the lists needed
# for traffic cameras, road closures, crash reports and signed bike routes.
# Everything lands in the "live2" folder next to this script. Nothing is uploaded anywhere.
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $dir "live2"; New-Item -ItemType Directory -Force -Path $out | Out-Null
$ua = "STARCITY-map/1.0 (personal project)"
$origin = "https://robotwhitebread.github.io"
$geo = "geometry=-96.80%2C40.65%2C-96.50%2C40.90&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"

function Save($name, $url) {
  $body = Join-Path $out $name
  $hdr = $body + ".headers.txt"
  & curl.exe -sS -L -A $ua -m 90 -H "Origin: $origin" -D $hdr -o $body $url
  $len = 0; if (Test-Path $body) { $len = (Get-Item $body).Length }
  $cors = "no"
  if ((Test-Path $hdr) -and (Select-String -Path $hdr -Pattern "access-control-allow-origin" -Quiet)) { $cors = "YES" }
  Write-Host ("{0,-34} {1,9} bytes   a web page can read it: {2}" -f $name, $len, $cors)
}

Write-Host "1. Service catalogs (what the city and the state publish)..."
$roots = [ordered]@{
  "city"       = "https://gis.lincoln.ne.gov/public/rest/services"
  "cityhosted" = "https://gis.lincoln.ne.gov/hosted/rest/services"
  "cityold"    = "https://ags3.lincoln.ne.gov/arcgis/rest/services"
  "ndot"       = "https://giscat.ne.gov/dot/rest/services"
}
foreach ($k in $roots.Keys) {
  Save "catalog_$k.json" ($roots[$k] + "?f=json")
  try { $j = Get-Content (Join-Path $out "catalog_$k.json") -Raw | ConvertFrom-Json } catch { continue }
  foreach ($f in $j.folders) {
    Save ("catalog_{0}_{1}.json" -f $k, $f) ($roots[$k] + "/" + $f + "?f=json")
    Start-Sleep -Milliseconds 200
  }
}

Write-Host "2. Traffic cameras (city and state)..."
$cc = "https://ags3.lincoln.ne.gov/arcgis/rest/services/Traffic/Traffic_MonitoringCameras/MapServer"
Save "cams_city_service.json" "$cc`?f=json"
Save "cams_city_layer.json"   "$cc/0?f=json"
Save "cams_city.json"         "$cc/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
Save "cams_city_page.html"    "https://www.lincoln.ne.gov/City/Departments/LTU/Transportation/Traffic-Engineering/Traffic-Cameras"
$nc = "https://giscat.ne.gov/dot/rest/services/HighwayCamerasDOT/MapServer"
Save "cams_ndot_service.json" "$nc`?f=json"
Save "cams_ndot_layers.json"  "$nc/layers?f=json"
Save "cams_ndot.json"         "$nc/0/query?where=1%3D1&$geo&outFields=*&outSR=4326&f=json"

Write-Host "3. Road closures and crashes..."
$rc = "https://gis.lincoln.ne.gov/public/rest/services/CityCounty/RoadClosuresPublic/MapServer"
Save "closures_layers.json" "$rc/layers?f=json"
foreach ($i in 0..5) { Save ("closures_{0}.json" -f $i) "$rc/$i/query?where=1%3D1&outFields=*&outSR=4326&f=json" }
Save "closures_hosted.json" "https://gis.lincoln.ne.gov/hosted/rest/services/Hosted/RoadClosures_public/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
Save "lpd_accidents.html"   "https://cjis.lincoln.ne.gov/~lpd/ACCIDENTS.htm"
Save "ne511.html"           "https://511.nebraska.gov/"

Write-Host "4. Other live feeds..."
Save "radar_tile.png"        "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/10/236/384.png"
Save "nws_alerts.json"       "https://api.weather.gov/alerts/active?point=40.8136,-96.7026"
Save "bikelnk_gbfs.json"     "https://gbfs.bcycle.com/bcycle_bikelnk/gbfs.json"
Save "bikelnk_stations.json" "https://gbfs.bcycle.com/bcycle_bikelnk/station_information.json"
Save "bikelnk_status.json"   "https://gbfs.bcycle.com/bcycle_bikelnk/station_status.json"
Save "planes.json"           "https://opensky-network.org/api/states/all?lamin=40.60&lomin=-96.95&lamax=40.95&lomax=-96.40"
Save "startran_vehicles.pb"  "https://startran.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/vehicleposition"

Write-Host "5. Signed bike routes from OpenStreetMap..."
$q = "[out:json][timeout:120];relation[route=bicycle](40.69,-96.75,40.85,-96.53);out geom;"
$servers = @("https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter")
$br = Join-Path $out "bikeroutes.json"; $ok = $false
for ($try = 0; ($try -lt 6) -and (-not $ok); $try++) {
  & curl.exe -sS -A $ua -m 240 -o $br --data-urlencode "data=$q" $servers[$try % $servers.Count]
  if ((Test-Path $br) -and ((Get-Item $br).Length -gt 200) -and (Select-String -Path $br -Pattern '"elements"' -Quiet)) { $ok = $true }
  else { Write-Host "   try $($try+1) failed, waiting 15s" -ForegroundColor Yellow; Start-Sleep -Seconds 15 }
}
Write-Host ("bikeroutes.json: {0}" -f $(if ($ok) { "{0:N0} bytes" -f (Get-Item $br).Length } else { "FAILED" }))

Write-Host "`nFinished. Results are in $out" -ForegroundColor Green
