# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path
from PyInstaller.utils.hooks import collect_all, collect_submodules

root = Path(SPECPATH)
matplotlib_datas, matplotlib_binaries, matplotlib_hidden = collect_all('matplotlib')
reportlab_datas, reportlab_binaries, reportlab_hidden = collect_all('reportlab')

analysis = Analysis(
    ['run_dashboard.py'],
    pathex=[str(root)],
    binaries=matplotlib_binaries + reportlab_binaries,
    datas=[
        (str(root / 'frontend' / 'dist'), 'frontend/dist'),
        (str(root / 'backend' / 'app' / 'static'), 'backend/app/static'),
    ] + matplotlib_datas + reportlab_datas,
    hiddenimports=(
        matplotlib_hidden
        + reportlab_hidden
        + collect_submodules('uvicorn')
        + ['pydantic_settings', 'tzdata']
    ),
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'pytest'],
    noarchive=False,
)
pyz = PYZ(analysis.pure)
exe = EXE(
    pyz,
    analysis.scripts,
    analysis.binaries,
    analysis.datas,
    [],
    name='TORO_MINING_Dashboard_San_Bernardo',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
