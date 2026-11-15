@echo off
rem STARCITY: the city's tree inventory. Progress goes to trees.log.
title STARCITY trees
cd /d "%~dp0"
echo STARCITY tree download is running. This window closes by itself when it finishes.
echo started %date% %time% > "%~dp0trees.log"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get_trees.ps1" >> "%~dp0trees.log" 2>&1
echo finished %date% %time% >> "%~dp0trees.log"
echo finished %date% %time% > "%~dp0trees_done.txt"
