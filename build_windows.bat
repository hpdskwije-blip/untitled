@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo    NENAPIYUMA AI USB - Portable Windows Build Pipeline
echo    Target: Windows 10/11 x64 Portable Executable
echo ======================================================================

:: 1. Check Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python 3.10+ is required to build NENAPIYUMA.
    exit /b 1
)

:: 2. Install requirements
echo [1/5] Installing pinned dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies.
    exit /b 1
)

:: 3. Run automated test suite
echo [2/5] Running automated tests...
pytest tests/ -v
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Some tests reported warnings or errors.
)

:: 4. Build Portable PyInstaller Executable
echo [3/5] Compiling NENAPIYUMA.exe via PyInstaller...
pyinstaller --noconfirm --onedir --windowed ^
    --name "NENAPIYUMA" ^
    --add-data "config;config" ^
    --hidden-import "PySide6.QtCore" ^
    --hidden-import "PySide6.QtGui" ^
    --hidden-import "PySide6.QtWidgets" ^
    --hidden-import "llama_cpp" ^
    --hidden-import "sqlite3" ^
    --hidden-import "psutil" ^
    app/main.py

if %ERRORLEVEL% neq 0 (
    echo [ERROR] PyInstaller build failed.
    exit /b 1
)

:: 5. Assemble Portable USB Package
echo [4/5] Assembling portable USB distribution directory...
set DIST_DIR=dist\NENAPIYUMA

if not exist "%DIST_DIR%\models" mkdir "%DIST_DIR%\models"
if not exist "%DIST_DIR%\tools\clamav\database" mkdir "%DIST_DIR%\tools\clamav\database"
if not exist "%DIST_DIR%\.nenapiyuma\quarantine" mkdir "%DIST_DIR%\.nenapiyuma\quarantine"

copy config\settings.json "%DIST_DIR%\config\settings.json" >nul 2>&1
copy README_SI.md "%DIST_DIR%\README_SI.md" >nul 2>&1
copy README.md "%DIST_DIR%\README.md" >nul 2>&1
copy LICENSE "%DIST_DIR%\LICENSE" >nul 2>&1

echo [5/5] Portable build completed successfully!
echo Location: %DIST_DIR%\NENAPIYUMA.exe
echo ======================================================================
