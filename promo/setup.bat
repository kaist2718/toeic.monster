@echo off
rem publish.py 가 한글로 안내를 출력하므로 콘솔 코드페이지를 UTF-8 로 맞춥니다
rem (promo_center.bat 과 같은 이유 — 없으면 --check 결과가 깨져 보입니다).
chcp 65001 >nul
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

echo ==============================================================
echo  toeic.monster promo tool - initial setup
echo ==============================================================
echo Python: %PYTHON%
echo.

%PYTHON% -m pip install -r requirements.txt
if errorlevel 1 (
  echo [ERROR] Failed to install dependencies.
  pause
  popd
  exit /b 1
)

%PYTHON% publish.py --init-config
%PYTHON% publish.py --check

echo.
echo Setup finished. Open config.json, fill in your account info,
echo then run promo_center.bat.
if exist config.json start "" notepad.exe "%CD%\config.json"
pause
popd
exit /b 0
