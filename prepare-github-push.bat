@echo off
setlocal
cd /d "%~dp0"

set "EXIT_CODE=0"

echo.
echo [1/2] Refreshing audio manifest...
py ".\tools\generate_audio_manifest.py"
if errorlevel 1 (
  set "EXIT_CODE=1"
  goto :finish
)

echo.
echo [2/2] Checking git status...
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not a Git repository yet.
  echo Create a GitHub repo, run ^"git init^", or open this project inside an existing repo.
) else (
  git --no-pager status --short
  echo.
  git --no-pager status
)

:finish
echo.
if "%EXIT_CODE%"=="0" (
  echo GitHub prep finished.
) else (
  echo GitHub prep failed during manifest generation.
)

if /I not "%~1"=="--no-pause" (
  echo.
  pause
)

exit /b %EXIT_CODE%