@echo off
:: ============================================================================
:: NENAPIYUMA AI USB - Instant Portable Windows Launcher
:: Runs directly from USB drive with zero terminal prompts or configurations
:: ============================================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: 1. Check if bundled standalone python runtime exists
if exist "python\pythonw.exe" (
    start "" "python\pythonw.exe" app\main.py %*
    exit /b 0
)

:: 2. Check if dist built PyInstaller EXE exists
if exist "dist\NENAPIYUMA\NENAPIYUMA.exe" (
    start "" "dist\NENAPIYUMA\NENAPIYUMA.exe" %*
    exit /b 0
)

:: 3. Fallback to system Python if available
where pythonw >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start "" pythonw app\main.py %*
    exit /b 0
)

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    python app\main.py %*
    exit /b 0
)

:: 4. If neither is present, prompt user in Sinhala and English
echo ============================================================================
echo   නැනපියුම NENAPIYUMA AI USB - ආරම්භක දෝෂයකි (Startup Notice)
echo ============================================================================
echo   මෙම යෙදුම ධාවනය කිරීමට NENAPIYUMA.exe හෝ Python 3.10+ අවශ්‍ය වේ.
echo   සම්පූර්ණ self-contained EXE එකක් සෑදීමට scripts\build_windows.bat ධාවනය කරන්න.
echo   හෝ GitHub Actions මගින් සාදන ලද නිල ZIP එක බාගත කරන්න.
echo ============================================================================
pause
