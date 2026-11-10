@echo off
chcp 65001 >nul
title Push ComputerTech to GitHub
cd /d "%~dp0"

echo ================================================================
echo   DAY MA NGUON COMPUTERTECH LEN GITHUB
echo   Repository: https://github.com/ytpit20218/quanlybanhangmaytinh.git
echo ================================================================
echo.

:: 1. Tim kiem lenh git
set "GIT_CMD=git"
where git >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Users\Administrator\AppData\Local\Programs\MinGit\cmd\git.exe" (
        set "GIT_CMD=C:\Users\Administrator\AppData\Local\Programs\MinGit\cmd\git.exe"
    ) else if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    ) else (
        echo [ERROR] Khong tim thay Git tren he thong!
        pause
        exit /b 1
    )
)

:: 2. Khoi tao Git repo neu chua co
if not exist .git (
    echo [*] Khoi tao Git repository...
    "%GIT_CMD%" init
)

:: 3. Cap nhat Remote Origin
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin https://github.com/ytpit20218/quanlybanhangmaytinh.git
"%GIT_CMD%" branch -M main

:: 4. Them file va commit
echo [*] Dang chuan bi cac tap tin commit...
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "feat: Fix full system (Frontend React + Backend Express Mock Fallback + GitHub Actions Deploy)" 2>nul

:: 5. Day len GitHub
echo [*] Dang day len nhanh main tren GitHub...
"%GIT_CMD%" push -u origin main

echo.
echo ================================================================
echo   HOAN TAT DONG BO LEN GITHUB THANH CONG!
echo ================================================================
pause
