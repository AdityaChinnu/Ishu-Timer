@echo off
setlocal
cd /d "%~dp0"

echo.
echo Refreshing audio manifest...
py ".\tools\generate_audio_manifest.py"
set "EXIT_CODE=%ERRORLEVEL%"

if "%EXIT_CODE%"=="0" (
  echo.
  echo Audio manifest refreshed successfully.
) else (
  echo.
  echo Failed to refresh audio manifest.
)

if /I not "%~1"=="--no-pause" (
  echo.
  pause
)

exit /b %EXIT_CODE%