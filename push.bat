@echo off
setlocal
title Push to GitHub - hemanthbv2/Arvind
echo ================================================================
echo   RVITM Admissions - Push to https://github.com/hemanthbv2/Arvind
echo ================================================================
echo.

set PATH=C:\Users\Rashid\.gemini\tools\mingit\cmd;%PATH%

echo Your local repository is ready and committed!
echo.
echo Choose authentication method:
echo   [1] Enter a GitHub Personal Access Token (PAT) - Quickest and 100%% reliable
echo   [2] Default Git Push (prompt for username/password or token)
echo.

set /p choice="Select option (1 or 2, default is 1): "

if "%choice%"=="2" goto DEFAULT_PUSH

:PAT_PUSH
echo.
echo Create a GitHub token here if you don't have one:
echo   https://github.com/settings/tokens (classic) with "repo" scope checked
echo.
set /p token="Paste your GitHub Personal Access Token: "
if "%token%"=="" (
    echo Token cannot be empty.
    goto PAT_PUSH
)

echo.
echo Pushing to https://github.com/hemanthbv2/Arvind.git ...
git push "https://%token%@github.com/hemanthbv2/Arvind.git" main
goto FINISH

:DEFAULT_PUSH
echo.
echo Pushing with standard git credentials...
echo (When prompted for password, enter your Personal Access Token)
git push -u origin main

:FINISH
echo.
echo ================================================================
if %ERRORLEVEL% equ 0 (
    echo   SUCCESS! All files have been pushed to:
    echo   https://github.com/hemanthbv2/Arvind
) else (
    echo   Push encountered an error. Please check your credentials/token.
)
echo ================================================================
echo.
pause
