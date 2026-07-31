@echo off
setlocal
cd /d "%~dp0"

if exist "dist\TORO_MINING_Dashboard_San_Bernardo.exe" (
  start "TORO MINING" "dist\TORO_MINING_Dashboard_San_Bernardo.exe"
  exit /b 0
)

if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" run_dashboard.py
  exit /b %errorlevel%
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 run_dashboard.py
  exit /b %errorlevel%
)

echo No se encontro el ejecutable ni una instalacion de Python.
echo Consulte README.md para instalar o construir el proyecto.
pause
exit /b 1
