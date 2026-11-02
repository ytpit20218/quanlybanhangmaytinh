@echo off
chcp 65001 >nul
title COMPUTERTECH - E-Commerce & Retail Management Platform
color 0B

echo ================================================================
echo           COMPUTERTECH - HE THONG BAN HANG & QUAN LY KHO
echo ================================================================

echo [1/3] Kiem tra thu vien phan mem Frontend & Backend...
if not exist frontend\node_modules (
    echo [!] Cai dat dependencies cho Frontend...
    call npm --prefix frontend install
)

if not exist backend\node_modules (
    echo [!] Cai dat dependencies cho Backend...
    call npm --prefix backend install
)

echo [2/3] Khoi dong Backend API Server (Port 5000)...
start "COMPUTERTECH BACKEND API (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"

echo [3/3] Khoi dong Frontend Web Server (Port 5173)...
echo Dang tu dong mo trinh duyet tai http://localhost:5173 ...
timeout /t 2 >nul
start http://localhost:5173

echo.
echo ================================================================
echo   He thong dang chay:
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:5000 (Health: http://localhost:5000/api/health)
echo   Nhan Ctrl + C de dung Frontend.
echo ================================================================
echo.

cd /d "%~dp0frontend"
call npm run dev
pause
