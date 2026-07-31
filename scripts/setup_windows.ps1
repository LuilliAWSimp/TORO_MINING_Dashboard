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

function Get-CompatiblePython {
  $versions = @('3.12', '3.11')

  if (Get-Command py -ErrorAction SilentlyContinue) {
    foreach ($version in $versions) {
      & py "-$version" -c "import sys; print(sys.version)" *> $null
      if ($LASTEXITCODE -eq 0) {
        return @{ Launcher = 'py'; Version = $version }
      }
    }
  }

  if (Get-Command python -ErrorAction SilentlyContinue) {
    $detected = & python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    if ($LASTEXITCODE -eq 0 -and $versions -contains $detected.Trim()) {
      return @{ Launcher = 'python'; Version = $detected.Trim() }
    }
  }

  return $null
}

$Python = Get-CompatiblePython
if ($null -eq $Python) {
  Write-Host ''
  Write-Host 'No se encontro Python 3.12 ni Python 3.11.' -ForegroundColor Red
  Write-Host 'Este proyecto no debe instalarse con Python 3.13 o 3.14 porque las dependencias fijadas no son compatibles.' -ForegroundColor Yellow
  Write-Host 'Instale Python 3.12 de 64 bits y vuelva a ejecutar este script.' -ForegroundColor Yellow
  Write-Host 'Puede conservar Python 3.14; no es necesario desinstalarlo.'
  exit 1
}

if (Test-Path '.venv\Scripts\python.exe') {
  $VenvVersion = & .\.venv\Scripts\python.exe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
  if ($LASTEXITCODE -ne 0 -or @('3.12', '3.11') -notcontains $VenvVersion.Trim()) {
    Write-Host "El entorno .venv usa Python $VenvVersion y sera recreado con Python $($Python.Version)." -ForegroundColor Yellow
    Remove-Item -Recurse -Force '.venv'
  }
}

if (-not (Test-Path '.venv\Scripts\python.exe')) {
  Write-Host "Creando entorno virtual con Python $($Python.Version)..." -ForegroundColor Cyan
  if ($Python.Launcher -eq 'py') {
    & py "-$($Python.Version)" -m venv .venv
  } else {
    & python -m venv .venv
  }
  if ($LASTEXITCODE -ne 0) {
    throw 'No fue posible crear el entorno virtual.'
  }
}

Invoke-CheckedCommand '.\.venv\Scripts\python.exe' @('-m', 'pip', 'install', '--upgrade', 'pip', 'setuptools', 'wheel') 'Fallo la actualizacion de pip.'
Invoke-CheckedCommand '.\.venv\Scripts\python.exe' @('-m', 'pip', 'install', '--only-binary=:all:', '-r', 'backend\requirements-dev.txt') 'Fallo la instalacion de dependencias de Python.'

$NpmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($null -eq $NpmCommand) {
  throw 'No se encontro npm.cmd. Instale Node.js 20 o superior.'
}

Push-Location frontend
try {
  Invoke-CheckedCommand $NpmCommand.Source @('install') 'Fallo npm install.'
  Invoke-CheckedCommand $NpmCommand.Source @('run', 'typecheck') 'Fallo el typecheck del frontend.'
  Invoke-CheckedCommand $NpmCommand.Source @('run', 'build') 'Fallo el build del frontend.'
} finally {
  Pop-Location
}

Write-Host ''
Write-Host 'Instalacion y compilacion terminadas correctamente.' -ForegroundColor Green
Write-Host 'Ejecute Iniciar_Dashboard.bat'
