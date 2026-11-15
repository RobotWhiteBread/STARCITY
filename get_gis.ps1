# STARCITY step 10: the city, county and state map layers behind the newer features
# (property values and taxes, recent sales, traffic counts, crashes, cameras, bike network, zoning, civic places).
# Public layers only. Owner names, mailing addresses, buyer and seller names, site addresses and staff
# contact fields are never requested: every pull below names the fields it wants.
# Everything lands in the "gis" folder next to this script.
$dir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$ua     = "STARCITY-map/1.0 (personal project)"
$gd     = Join-Path $dir "gis"; New-Item -ItemType Directory -Force -Path $gd | Out-Null
$city   = "https://gis.lincoln.ne.gov/public/rest/services"
$hosted = "https://gis.lincoln.ne.gov/hosted/rest/services/Hosted"
$ndot   = "https://giscat.ne.gov/dot/rest/services"
$state  = "https://giscat.ne.gov/enterprise/rest/services"
$mapBox  = "geometry=-96.745%2C40.69%2C-96.535%2C40.85&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"
$cntyBox = "geometry=-96.95%2C40.50%2C-96.40%2C41.06&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects"

function Pull($name, $layerUrl, $fields, $box, $geom, $offset, $step, $maxPages) {
  $odir = Join-Path $gd $name
  New-Item -ItemType Directory -Force -Path $odir | Out-Null
  $fmt = "geojson"; if ($geom -eq "false") { $fmt = "json" }
  $extra = ""
  if ($box) { $extra += "&" + $box }
  if ($offset) { $extra += "&maxAllowableOffset=" + $offset }
  $off = 0; $total = 0
  for ($p = 0; $p -lt $maxPages; $p++) {
    $out = Join-Path $odir ("{0}_{1:D3}.json" -f $name, $p)
    $url = "$layerUrl/query?where=1%3D1$extra&outFields=$fields&returnGeometry=$geom&outSR=4326&geometryPrecision=6&resultOffset=$off&resultRecordCount=$step&f=$fmt"
    & curl.exe -sS -A $ua -m 180 --connect-timeout 20 -o $out $url
    $txt = ""
    if (Test-Path $out) { $txt = [System.IO.File]::ReadAllText($out) }
    if (($txt.Length -lt 4000) -and ($txt -match '"error"\s*:')) {
      Write-Host ("  {0} page {1} returned an error: {2}" -f $name, $p, $txt.Substring(0, [Math]::Min(260, $txt.Length))) -ForegroundColor Yellow
      break
    }
    if ($fmt -eq "geojson") { $n = ([regex]::Matches($txt, '"type"\s*:\s*"Feature"')).Count }
    else { $n = ([regex]::Matches($txt, '"attributes"\s*:')).Count }
    $total += $n
    if ($n -eq 0) { break }
    $more = $txt -match 'exceededTransferLimit"\s*:\s*true'
    if (($n -lt $step) -and (-not $more)) { break }
    $off += $n
    Start-Sleep -Milliseconds 250
  }
  Write-Host ("{0,-14} {1,7} records" -f $name, $total)
}
function Count($name, $layerUrl) {
  $t = & curl.exe -sS -A $ua -m 60 --connect-timeout 20 "$layerUrl/query?where=1%3D1&returnCountOnly=true&f=json"
  Write-Host ("{0,-14} server count: {1}" -f $name, ($t -join " "))
}

Write-Host "1. Property: values, taxes, recent sales, neighborhoods..."
Pull "parcels2" "$city/Assessor/TaxParcels/MapServer/0" "PARCELID%2CCNTASSDVAL%2CCNTTXBLVAL%2CTOTCNTTXOD%2CTOTPRVTXTOD%2CLNDVALUE%2CPRVASSDVAL%2CCVTTXCD%2CCVTTXDSCRP%2CSCHLDSCRP%2CGIS_AREA%2CNGHBRHDCD%2CCLASSDSCRP%2CUSEDSCRP%2CRESFLRAREA%2CBLDGAREA%2CFLOORCOUNT%2CHighRise" $mapBox "true" "0.00012" 2000 80
Pull "sales"    "$city/Assessor/PropertySales/MapServer/0" "PID%2CSalePrice%2CSaleDate%2CSaleType%2CSaleValidityCode%2CPropType%2CSalePriceSF%2CAssdValue%2CResStructureType%2CResYrBlt%2CResFlrArea%2CNBH%2CNBHGroup" $mapBox "true" "" 2000 20
Pull "valrange" "$city/Assessor/PublicAnalytics/MapServer/5" "*" "" "false" "" 2000 5
Pull "valcount" "$city/Assessor/PublicAnalytics/MapServer/6" "*" "" "false" "" 2000 5
Pull "avgsale"  "$city/Assessor/PublicAnalytics/MapServer/7" "*" "" "false" "" 2000 5
Pull "monsale"  "$city/Assessor/PublicAnalytics/MapServer/8" "*" "" "false" "" 2000 5
Pull "tif"      "$hosted/TIF_Dasboard_Districts/FeatureServer/0" "cvttxcd%2Ctifname%2Cprojdate%2Ctax_year%2Call_bv%2Call_ev%2Ctax_rate%2Cstatus%2Ctype%2Cyear" "" "true" "0.00005" 1000 5
Pull "hoods"    "$city/UrbanDevelopment/NeighborhoodAssociations/MapServer/0" "NAME%2CACTIVE" "" "true" "0.00008" 1000 3

Write-Host "2. Traffic: cameras, counts, crashes, projects, snow..."
Pull "citycams" "$city/LTUTraffic/TrafficCameras/MapServer/0" "Camera_Location%2CCamera_ID%2CLiveHDURL%2CLiveSDURL%2CPhotoURL" "" "true" "" 1000 3
Pull "adt"      "$city/LTUTraffic/CrashApp/MapServer/2" "STPRE%2CSTNAME%2CSTTYPE%2CSTSUF%2CADT%2CADTCntYear%2CSPEEDLIM%2CCLASS%2CONEWAY%2CDailyVMT" $mapBox "true" "0.00003" 2000 40
Pull "xings"    "$city/LTUTraffic/CrashApp/MapServer/1" "ONST%2CATST%2CADT%2CSUM_ADT%2CFREQUENCY%2CCTRL%2CCLASS%2CLOCTYPE" $mapBox "true" "" 2000 20
Count "crashes" "$city/LTUTraffic/CrashApp/MapServer/0"
Pull "crashes"  "$city/LTUTraffic/CrashApp/MapServer/0" "Accident_D%2CAccd_Sev_C%2CLight_Cond%2CRoad_Surf%2CAlcohol_Re%2CPedest_In_%2CPedal_Cycl%2CMotor_Cycl%2CFirst_Harm%2CTotal_Numb" $mapBox "true" "" 2000 120
foreach ($i in 0..2) { Pull ("projects{0}" -f $i) "$city/LTUEngineeringServices/ConstructionProjects/MapServer/$i" "Name%2CProjectNam%2CSubtitle%2CProjectSumm%2CConstructionStart%2CConstructionComplete%2CConstructionNote%2CAccessDuringConstruction%2CScheduleDescription%2CURL%2CYear%2CPublish%2CUtility" "" "true" "0.00003" 1000 5 }
Pull "snow"     "$city/LTUStreetMaintenance/SnowStatus/MapServer/2" "DistNumber%2CSnow%2CResSegTot%2CResSegCom%2CResPerComplete%2CPlowStatus" "" "true" "0.0001" 1000 2
Pull "ndotaadt" "$ndot/AnnualAverageDailyTrafficSegmentsOnSystemDOT/MapServer/0" "FIRST_RouteID%2CFIRST_VEH_ADT_TOT_NUM%2CFIRST_TRUK_ADT_TOT_NUM%2CFIRST_COUNT_YEAR" $cntyBox "true" "0.0001" 2000 10

Write-Host "3. Bikes and trails..."
Pull "bikenet"   "$city/Planning/BikeLayers/MapServer/5" "Street_Nam%2CFrom_Str%2CTo_Str%2CFac_Type%2CStatus%2CFac_Width" "" "true" "" 2000 5
Pull "bikeprop"  "$city/Planning/BikeLayers/MapServer/4" "Street_Nam%2CFrom_Str%2CTo_Str%2CFac_Type%2CStatus%2CFac_Width" "" "true" "" 2000 5
Pull "bikeracks" "$city/Planning/BikeLayers/MapServer/0" "GeneralLoc%2CRackType%2CCapacity_Real%2CCoverage" "" "true" "" 2000 5
Pull "counters"  "$city/Parks/TrailCounts/MapServer/0" "SiteName%2CCounterType%2CLocationDescription%2CTrailUnit%2CLifeCycle" "" "true" "" 1000 2
Count "trailcnt" "$city/Parks/TrailCounts/MapServer/1"
Pull "trailcnt"  "$city/Parks/TrailCounts/MapServer/1" "*" "" "false" "" 2000 40

Write-Host "4. Zoning, flood, census, civic places..."
Pull "zoning"     "$city/Planning/Zoning/MapServer/0" "ZONE%2COVERLAY%2CMAJCAT%2CJURISDICTION" $mapBox "true" "0.00004" 2000 10
Pull "floodprone" "$city/LTUWatershed/FloodProneAreas/MapServer/0" "GRIDCODE" $mapBox "true" "0.00006" 2000 10
Pull "redline"    "$city/Planning/CompPlan2050/MapServer/5" "*" "" "true" "0.00005" 1000 3
Pull "blocks"     "$city/Planning/Census/MapServer/2" "GEOID20%2CP1_001N%2CALAND20" $cntyBox "true" "0.00006" 2000 15
Pull "tracts"     "$city/Planning/Census/MapServer/0" "*" "" "true" "0.00008" 1000 3
Pull "fire"       "$city/Fire/FireStations/MapServer/0" "NAME%2CSTATION_NO%2CSTATUS" "" "true" "" 1000 2
Pull "police"     "$city/Police/PoliceStations/MapServer/0" "Region%2CAddress%2CSubstation%2CCommunity" "" "true" "" 1000 2
Pull "schools"    "$city/CityCounty/Schools/MapServer/0" "SCHOOL%2CNICKNAME%2CMASCOT%2CCOLORS%2CEd_Level%2CType%2CStatus" "" "true" "" 1000 2
Pull "libraries"  "$city/Planning/CommunityFacilities/MapServer/0" "NAME" "" "true" "" 1000 2
Pull "medical"    "$city/Planning/MedicalFacilities/MapServer/0" "NAME%2CTYPE" "" "true" "" 1000 2
Pull "sirens"     "$city/EmergencyManagement/SirenZones/MapServer/0" "SirenTestZone" "" "true" "0.0001" 1000 2
Pull "art"        "$city/Parks/ParkAmenities/MapServer/7" "Title%2CArtist%2CLocation%2CType%2CPrimaryMaterial%2CDateAcquired%2CLifeCycle%2CParkUnit" "" "true" "" 1000 3
Pull "playgrounds" "$city/Parks/ParkAmenities/MapServer/6" "Name%2CParkUnit%2CInclusive%2CAccessible%2CYearInstalled%2CLifeCycle" "" "true" "" 1000 3
Pull "restrooms"  "$city/Parks/ParkAmenities/MapServer/8" "Name%2CParkUnit%2CLifeCycle" "" "true" "" 1000 3
Pull "fountains"  "$city/Parks/ParkAmenities/MapServer/4" "ParkUnit%2CType%2CLifeCycle" "" "true" "" 1000 3
Pull "garages"    "$city/UrbanDevelopment/Parking/MapServer/0" "Name%2CCapacity%2CType" "" "true" "0.00002" 1000 2
Pull "lots"       "$city/UrbanDevelopment/Parking/MapServer/1" "Name%2CCapacity%2CPublic_%2CType" "" "true" "0.00002" 1000 3
Pull "polls26"    "$hosted/Nov2026_Polling_Places/FeatureServer/0" "precinct_name%2Cpolling_place_name%2Cpolling_place_address%2Ccity%2Clocation_specifics" "" "true" "" 1000 2

Write-Host "5. State: legislative and congressional districts (simplified outlines)..."
Pull "legis"    "$state/PoliticalBoundaries_2021/MapServer/4" "DISTRICT%2CPOPULATION%2CDistrict_N%2CSenator%2CCity" "" "true" "0.002" 100 2
Pull "congress" "$state/PoliticalBoundaries_2021/MapServer/1" "DISTRICT%2CPOPULATION%2CDistrict_N" "" "true" "0.002" 100 2

$zip = Join-Path $dir "gis.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
try { Compress-Archive -Path (Join-Path $gd "*") -DestinationPath $zip -ErrorAction Stop; Write-Host ("gis.zip: {0:N0} bytes" -f (Get-Item $zip).Length) } catch { Write-Host "could not zip the gis folder" -ForegroundColor Yellow }
Write-Host "`nFinished. Results are in $gd" -ForegroundColor Green
