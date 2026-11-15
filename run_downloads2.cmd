@echo off
rem STARCITY: second round of downloads (city, county and state map layers). Progress goes to downloads2.log.
title STARCITY downloads 2
cd /d "%~dp0"
echo STARCITY downloads are running. This window closes by itself when they finish.
echo started %date% %time% > "%~dp0downloads2.log"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get_gis.ps1" >> "%~dp0downloads2.log" 2>&1
echo finished %date% %time% >> "%~dp0downloads2.log"
echo finished %date% %time% > "%~dp0downloads2_done.txt"
