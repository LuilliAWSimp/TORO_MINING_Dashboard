$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path '.venv\Scripts\python.exe')) {
  throw 'Primero ejecute scripts\setup_windows.ps1'
}

$backend = Start-Process -FilePath "$Root\.venv\Scripts\python.exe" -ArgumentList '-m','uvicorn','backend.app.main:app','--host','127.0.0.1','--port','8000','--reload' -WorkingDirectory $Root -PassThru
$frontend = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory "$Root\frontend" -PassThru

Write-Host 'Backend: http://127.0.0.1:8000/api/docs'
Write-Host 'Frontend: http://127.0.0.1:5173'
Write-Host 'Presione Ctrl+C para finalizar.'
try {
  Wait-Process -Id $backend.Id, $frontend.Id
} finally {
  Stop-Process -Id $backend.Id, $frontend.Id -Force -ErrorAction SilentlyContinue
}
