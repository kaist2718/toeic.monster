@echo off
setlocal EnableExtensions
chcp 65001 >nul
pushd "%~dp0"

set "PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "PYTHON=py -3"
if not defined PYTHON (
  where python >nul 2>&1
  if not errorlevel 1 set "PYTHON=python"
)

if not defined PYTHON (
  echo [오류] Python 3을 찾지 못했습니다.
  echo        https://www.python.org/downloads/ 에서 설치한 뒤 다시 실행하세요.
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
if not "%EXIT_CODE%"=="0" echo [오류] 작업이 실패했습니다. 위 로그를 확인하세요.
pause
popd
exit /b %EXIT_CODE%
