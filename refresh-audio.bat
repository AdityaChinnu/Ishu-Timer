@echo off
setlocal
cd /d "%~dp0"

echo.
echo Refreshing audio and celebration manifests...
py ".\tools\generate_audio_manifest.py"
set "EXIT_CODE=%ERRORLEVEL%"

if "%EXIT_CODE%"=="0" (
  echo.
  echo Media manifests refreshed successfully.
) else (
  echo.
  echo Failed to refresh media manifests.
)

if /I not "%~1"=="--no-pause" (
  echo.
  pause
)

exit /b %EXIT_CODE%