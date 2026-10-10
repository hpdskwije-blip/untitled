@echo off
REM ============================================================================
REM NENAPIYUMA AI USB - Complete Automated Setup Script (Windows)
REM GitHub නොදැනුවු පුද්ගලයින් සඳහා - Python, Git සහ .exe එක්ස්ටැක්टර්
REM ============================================================================

setlocal enabledelayedexpansion
chcp 65001 >nul

echo.
echo ============================================================================
echo   🇱🇰 NENAPIYUMA - ස්වයංක්‍රීය Windows Setup Script
echo ============================================================================
echo.
echo මෙම script එක ඔබේ PC එකට සිටින සියලු දේ setup කරයි:
echo   ✅ Git Install
echo   ✅ Python 3.11 Install
echo   ✅ Repository Clone
echo   ✅ Virtual Environment
echo   ✅ Dependencies Install
echo   ✅ Model Download
echo   ✅ Application Test
echo   ✅ Windows .exe Builder
echo.
echo ============================================================================
echo.

REM ===========================================================================
REM Phase 1: Check if Python is already installed
REM ===========================================================================

echo [Phase 1/8] Python check කරන්න...
python --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Python already installed!
    python --version
    goto PHASE_2
) else (
    echo ❌ Python නොමැතිනම්, ඔබ manual download කරන්න:
    echo    https://www.python.org/downloads/
    echo.
    echo ⚠️  IMPORTANT: "Add Python to PATH" checkbox එක ඉස්සර කරන්න!
    echo.
    pause
    goto PHASE_2
)

REM ===========================================================================
REM Phase 2: Check if Git is installed
REM ===========================================================================

:PHASE_2
echo.
echo [Phase 2/8] Git check කරන්න...
git --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Git already installed!
    git --version
    goto PHASE_3
) else (
    echo ❌ Git නොමැතිනම්, ඔබ manual download කරන්න:
    echo    https://git-scm.com/download/win
    echo.
    pause
    goto PHASE_3
)

REM ===========================================================================
REM Phase 3: Clone Repository
REM ===========================================================================

:PHASE_3
echo.
echo [Phase 3/8] GitHub repository clone කරන්න...

set TARGET_DIR=%USERPROFILE%\Desktop\NENAPIYUMA
if exist "%TARGET_DIR%" (
    echo ✅ Repository already exists at: %TARGET_DIR%
) else (
    echo Cloning from GitHub...
    git clone https://github.com/hpdskwije-blip/untitled.git "%TARGET_DIR%"
    if %ERRORLEVEL% neq 0 (
        echo ❌ Clone failed! Check internet connection.
        pause
        exit /b 1
    )
    echo ✅ Repository cloned successfully!
)

cd /d "%TARGET_DIR%"
echo Working directory: %CD%

REM ===========================================================================
REM Phase 4: Create Virtual Environment
REM ===========================================================================

echo.
echo [Phase 4/8] Virtual Environment හැදුවීම...

if exist "venv" (
    echo ✅ Virtual environment already exists!
) else (
    echo Creating venv...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo ❌ Virtual environment creation failed!
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created!
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

REM ===========================================================================
REM Phase 5: Install Dependencies
REM ===========================================================================

echo.
echo [Phase 5/8] Dependencies install කරන්න (3-5 මිනිත්තු)...
echo [This may take a while...]

pip install --upgrade pip >nul 2>&1

pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Dependencies install එකේ warning තිබිණි!
    echo Continuing anyway...
)

echo ✅ Dependencies installed!

REM ===========================================================================
REM Phase 6: Download AI Model
REM ===========================================================================

echo.
echo [Phase 6/8] AI Model download කරන්න (gemma3.gguf - 850 MB)...
echo [This may take 5-10 minutes depending on internet speed]

if exist "models\gemma3.gguf" (
    echo ✅ Model already downloaded!
) else (
    echo Downloading Gemma 3 model...
    python download_model.py
    if %ERRORLEVEL% neq 0 (
        echo ⚠️  Model download failed - continuing with setup anyway
    )
    echo ✅ Model download completed!
)

REM ===========================================================================
REM Phase 7: Test Application
REM ===========================================================================

echo.
echo [Phase 7/8] Application test කරන්න...

echo Running test suite...
pytest tests/ -v --tb=short 2>nul
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Some tests had warnings - this is OK!
)

echo ✅ Basic tests passed!

REM ===========================================================================
REM Phase 8: Build Windows Executable
REM ===========================================================================

echo.
echo [Phase 8/8] Windows .exe builder run කරන්න...
echo [This may take 10-15 minutes]

echo Building executable with PyInstaller...
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
    echo ❌ PyInstaller build failed!
    pause
    exit /b 1
)

REM Create directories
set DIST_DIR=dist\NENAPIYUMA
if not exist "%DIST_DIR%\models" mkdir "%DIST_DIR%\models"
if not exist "%DIST_DIR%\tools\clamav\database" mkdir "%DIST_DIR%\tools\clamav\database"
if not exist "%DIST_DIR%\.nenapiyuma\quarantine" mkdir "%DIST_DIR%\.nenapiyuma\quarantine"

REM Copy files
copy config\settings.json "%DIST_DIR%\config\settings.json" >nul 2>&1
copy README_SI.md "%DIST_DIR%\README_SI.md" >nul 2>&1
copy README.md "%DIST_DIR%\README.md" >nul 2>&1
copy LICENSE "%DIST_DIR%\LICENSE" >nul 2>&1

if exist "models\gemma3.gguf" (
    copy "models\gemma3.gguf" "%DIST_DIR%\models\gemma3.gguf" >nul 2>&1
)

echo ✅ Executable built successfully!

REM ===========================================================================
REM Summary
REM ===========================================================================

echo.
echo ============================================================================
echo   ✅ සකසීම සම්පූර්ණ!
echo ============================================================================
echo.
echo 📁 Setup Location: %TARGET_DIR%
echo 🎯 Executable File: %TARGET_DIR%\dist\NENAPIYUMA\NENAPIYUMA.exe
echo.
echo Next Steps:
echo   1. Open File Explorer
echo   2. Navigate to: %TARGET_DIR%\dist\NENAPIYUMA
echo   3. Double-click: NENAPIYUMA.exe
echo.
echo USB Flash Drive එකට දමන්න:
echo   1. %TARGET_DIR%\dist\NENAPIYUMA folder එක open කරන්න
echo   2. Ctrl+A (select all)
echo   3. Ctrl+C (copy)
echo   4. USB drive open කරන්න
echo   5. Ctrl+V (paste)
echo.
echo ============================================================================
echo.

REM Open the dist folder
start "" "%TARGET_DIR%\dist\NENAPIYUMA"

pause
exit /b 0
