$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path '.venv\Scripts\python.exe')) {
  & "$PSScriptRoot\setup_windows.ps1"
}

Push-Location frontend
npm run typecheck
npm run build
Pop-Location

& .\.venv\Scripts\python.exe -m pip install pyinstaller
& .\.venv\Scripts\pyinstaller.exe --clean --noconfirm ToroMiningDashboard.spec

Write-Host ''
Write-Host 'Ejecutable generado:' -ForegroundColor Green
Write-Host "$Root\dist\TORO_MINING_Dashboard_San_Bernardo.exe"
