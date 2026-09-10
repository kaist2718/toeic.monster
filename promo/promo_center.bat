@echo off
setlocal EnableExtensions
pushd "%~dp0"

set "PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "PYTHON=py -3"
if not defined PYTHON (
  where python >nul 2>&1
  if not errorlevel 1 set "PYTHON=python"
)

if not defined PYTHON (
  echo [ERROR] Python 3 was not found.
  echo         Install it from https://www.python.org/downloads/ and run again.
  pause
  popd
  exit /b 1
)

if "%~1"=="" (
  %PYTHON% publish.py --menu
) else (
  %PYTHON% publish.py %*
)
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if not "%EXIT_CODE%"=="0" echo [ERROR] The task failed. Check the log above.
pause
popd
exit /b %EXIT_CODE%