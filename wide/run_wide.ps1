# STARCITY wide: every download again, for the whole city (north to the airport and Fallbrook, west to Air Park).
# Everything lands in this "wide" folder. Nothing in the main STARCITY folder is touched.
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
foreach ($s in "get_terrain.ps1","get_data.ps1","get_places.ps1","get_city2.ps1","get_values.ps1","get_gis.ps1") {
  Write-Host ("=== " + $s + " ===") -ForegroundColor Cyan
  & powershell -ExecutionPolicy Bypass -File (Join-Path $here $s)
}
Write-Host "ALL DONE. Tell Claude the wide download finished." -ForegroundColor Green
