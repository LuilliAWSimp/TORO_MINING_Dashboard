$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-CheckedCommand {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [Parameter(Mandatory = $true)][string]$FailureMessage
  )

  & $FilePath @Arguments
  $ExitCode = $LASTEXITCODE
  if ($ExitCode -ne 0) {
    throw "$FailureMessage Codigo de salida: $ExitCode"
  }
}

if (-not (Test-Path '.venv\Scripts\python.exe')) {
  & "$PSScriptRoot\setup_windows.ps1"
  if ($LASTEXITCODE -ne 0) {
    throw 'Fallo la preparacion inicial del proyecto.'
  }
}

$NpmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($null -eq $NpmCommand) {
  throw 'No se encontro npm.cmd. Instale Node.js 20 o superior.'
}

Push-Location frontend
try {
  Invoke-CheckedCommand $NpmCommand.Source @('run', 'typecheck') 'Fallo el typecheck del frontend.'
  Invoke-CheckedCommand $NpmCommand.Source @('run', 'build') 'Fallo el build del frontend.'
} finally {
  Pop-Location
}

Invoke-CheckedCommand '.\.venv\Scripts\python.exe' @('-m', 'pip', 'install', 'pyinstaller') 'Fallo la instalacion de PyInstaller.'
Invoke-CheckedCommand '.\.venv\Scripts\pyinstaller.exe' @('--clean', '--noconfirm', 'ToroMiningDashboard.spec') 'Fallo la generacion del ejecutable.'

Write-Host ''
Write-Host 'Ejecutable generado:' -ForegroundColor Green
Write-Host "$Root\dist\TORO_MINING_Dashboard_San_Bernardo.exe"
