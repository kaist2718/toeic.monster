@echo off
chcp 65001 >nul
setlocal EnableExtensions
title toeic.monster 홍보 원클릭 센터
pushd "%~dp0"

rem ===== 도움말: promo_center.bat help ======================================
if /i "%~1"=="help"   goto :usage
if /i "%~1"=="-h"     goto :usage
if /i "%~1"=="--help" goto :usage
if     "%~1"=="/?"    goto :usage

rem ===== 최초 설치: promo_center.bat setup =================================
if /i "%~1"=="setup" goto :do_setup

rem ===== 자동 실행에서는 멈춤 없이 종료 ====================================
rem  --run-due / --no-pause 를 주거나 환경변수 PROMO_NO_PAUSE=1 이면
rem  마지막 "아무 키나 누르세요" 를 생략합니다 - 작업 스케줄러(메뉴 27)가
rem  매 N분 실행할 때 창이 입력 대기로 멈추지 않게 하는 장치입니다.
set "SKIP_PAUSE="
for %%A in (%*) do (
  if /i "%%~A"=="--run-due"  set "SKIP_PAUSE=1"
  if /i "%%~A"=="--no-pause" set "SKIP_PAUSE=1"
  if /i "%%~A"=="--nopause"  set "SKIP_PAUSE=1"
  if /i "%%~A"=="nopause"    set "SKIP_PAUSE=1"
)
if defined PROMO_NO_PAUSE set "SKIP_PAUSE=1"

rem ===== Python 찾기 (py -3 우선, 없으면 python) ===========================
set "PYTHON="
where py >nul 2>&1
if not errorlevel 1 set "PYTHON=py -3"
if not defined PYTHON (
  where python >nul 2>&1
  if not errorlevel 1 set "PYTHON=python"
)
if not defined PYTHON (
  echo [오류] Python 3 을 찾지 못했습니다.
  echo        https://www.python.org/downloads/ 에서 설치한 뒤 다시 실행하세요.
  set "EXIT_CODE=1"
  goto :finish
)

rem ===== Python 3.8 이상 확인 ==============================================
%PYTHON% -c "import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)"
if errorlevel 1 (
  echo [오류] Python 3.8 이상이 필요합니다. 최신 Python 3 을 설치해 주세요.
  echo        https://www.python.org/downloads/
  set "EXIT_CODE=1"
  goto :finish
)

rem ===== publish.py 실행 ===================================================
rem  하이픈 없는 첫 단어는 publish.py 가 플래그로 바꿉니다 (check = --check).
if "%~1"=="" (
  %PYTHON% publish.py --menu
) else (
  %PYTHON% publish.py %*
)
set "EXIT_CODE=%ERRORLEVEL%"
goto :finish

:do_setup
call setup.bat
set "EXIT_CODE=%ERRORLEVEL%"
goto :finish

:finish
echo.
if not "%EXIT_CODE%"=="0" echo [오류] 작업이 실패했습니다. 위 로그를 확인하세요.
if defined SKIP_PAUSE goto :end
echo 아무 키나 누르면 창이 닫힙니다...
pause >nul
:end
popd
exit /b %EXIT_CODE%

:usage
echo.
echo  toeic.monster 홍보 원클릭 센터 - 사용법
echo  =================================================================
echo    promo_center.bat                 원클릭 메뉴 열기 (기본)
echo    promo_center.bat setup           처음 설치 - 의존성 설치 + 설정 점검
echo    promo_center.bat menu-list       번호 순(1~31) 메뉴 목록만 보기
echo    promo_center.bat 5               메뉴 5 바로 실행
echo    promo_center.bat 1-4             메뉴 1~4 를 순서대로 실행 (17,18 도 가능)
echo    promo_center.bat 31              TTS 엔진/목소리 설정 (내려받기, 미리 듣기)
echo    promo_center.bat check           설정 / 의존성 / 폴더 상태 점검
echo    promo_center.bat verify          배포 전 검증 (재생 + 메타 확인 후 게시)
echo    promo_center.bat report          게시 이력 HTML 리포트
echo    promo_center.bat list-remaining  종류별 남은 콘텐츠 수량
echo    promo_center.bat list-posted     중복 게시 방지 기록
echo    promo_center.bat history         게시 이력
echo    promo_center.bat --video ^<mp4^> --unit 1 --dry-run
echo    promo_center.bat --auto-plan 5 --plan-start "2026-10-01 19:00"
echo.
echo    * 첫 단어가 번호면 그 메뉴가 바로 실행됩니다: 5 / 1-4 / 15,16
echo    * 하이픈 없는 첫 단어는 자동으로 -- 플래그가 됩니다: check = --check
echo    * 메뉴 안에서는 범위(1-4), 여러 개(15,16), 반복(r), 검색(tts), 도움말(?)
echo    * 자동 실행용: --run-due 또는 --no-pause 를 주면 멈춤 없이 종료
echo    * 안에서 실행되는 명령: python publish.py
echo  =================================================================
echo.
popd
exit /b 0
