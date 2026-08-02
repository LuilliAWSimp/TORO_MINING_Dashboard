$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$staleFiles = @(
  'LEEME_HOTFIX.txt',
  'frontend\vite.config.js',
  'frontend\vite.config.d.ts',
  'frontend\tsconfig.app.tsbuildinfo',
  'frontend\tsconfig.node.tsbuildinfo',
  'docs\validation\summary-1366x768.png',
  'docs\validation\summary-1920x1080.png',
  'sample_output\reporte_operativo_demo.pdf'
)

foreach ($file in $staleFiles) {
  if (Test-Path $file) {
    Remove-Item -Force $file
  }
}

$staleDirs = @(
  'backend\.pytest_cache',
  'backend\__pycache__',
  'backend\app\__pycache__',
  'backend\tests\__pycache__'
)
foreach ($dir in $staleDirs) {
  if (Test-Path $dir) {
    Remove-Item -Recurse -Force $dir
  }
}

Write-Host ''
Write-Host 'Incremental aplicado.' -ForegroundColor Green
Write-Host 'Ahora ejecute:' -ForegroundColor Cyan
Write-Host '  Set-ExecutionPolicy -Scope Process Bypass'
Write-Host '  .\scripts\setup_windows.ps1'
