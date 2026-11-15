@echo off
rem STARCITY: runs the data download scripts in this folder, one after another.
rem Everything is saved next to this file. Progress is written to downloads.log.
title STARCITY downloads
cd /d "%~dp0"
echo STARCITY downloads are running. This window closes by itself when they finish.
echo Progress is written to downloads.log in this folder.
echo started %date% %time% > "%~dp0downloads.log"
for %%S in (get_places get_values get_votes get_live2) do (
  echo ==== %%S.ps1 ==== >> "%~dp0downloads.log"
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0%%S.ps1" >> "%~dp0downloads.log" 2>&1
)
echo finished %date% %time% >> "%~dp0downloads.log"
echo finished %date% %time% > "%~dp0downloads_done.txt"
