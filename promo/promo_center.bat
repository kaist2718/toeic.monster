@echo off
setlocal EnableExtensions
pushd "%~dp0"

rem --- usage: promo_center.bat help --------------------------------------
if /i "%~1"=="help"   goto :usage
if /i "%~1"=="-h"     goto :usage
if /i "%~1"=="--help" goto :usage
if     "%~1"=="/?"    goto :usage

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

rem --- a leading bare word becomes a flag inside publish.py (check = --check)
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

:usage
echo.
echo  toeic.monster promo center - one click launcher
echo  =================================================================
echo    promo_center.bat                     interactive menu (default)
echo    promo_center.bat menu                open the same menu
echo    promo_center.bat menu-list           print the numbered menu list (1~29)
echo    promo_center.bat 5                   run menu 5 right away
echo    promo_center.bat 1-4                 run menus 1..4 in order (15,16 works too)
echo    promo_center.bat check               config / dependencies / OAuth check
echo    promo_center.bat verify              pre-publish check (play + metadata)
echo    promo_center.bat report              publish history HTML report
echo    promo_center.bat list-remaining      remaining content counts
echo    promo_center.bat list-posted         duplicate-guard records
echo    promo_center.bat history             publish history
echo    promo_center.bat --video ^<mp4^> --unit 1 --dry-run
echo    promo_center.bat --auto-plan 5 --plan-start "2026-10-01 19:00"
echo.
echo    * A leading bare word is expanded as a flag:  check means --check
echo    * A leading number runs that menu:  5 = menu 5,  1-4 = menus 1 to 4,  15,16 = two menus
echo    * Inside the menu: range (1-4) - multi (15,16) - repeat (r) - search (tts) - help (?)
echo    * It runs promo/publish.py under the hood.
echo  =================================================================
echo.
popd
exit /b 0
