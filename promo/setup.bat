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
  echo        https://www.python.org/downloads/ 에서 Python 3을 설치하세요.
  pause
  popd
  exit /b 1
)

echo ==============================================================
echo  toeic.monster 홍보 도구 초기 설정
echo ==============================================================
echo Python: %PYTHON%
echo.

%PYTHON% -m pip install -r requirements.txt
if errorlevel 1 (
  echo [오류] 의존성 설치에 실패했습니다.
  pause
  popd
  exit /b 1
)

%PYTHON% publish.py --init-config
%PYTHON% publish.py --check

echo.
echo 설정 파일을 열어 계정 정보를 입력한 뒤 promo_center.bat를 실행하세요.
if exist config.json start "" notepad.exe "%CD%\config.json"
pause
popd
exit /b 0
