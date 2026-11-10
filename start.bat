@echo off
chcp 65001 >nul
title COMPUTERTECH - FULLSTACK PLATFORM (FRONTEND + BACKEND)
color 0A

echo ================================================================
echo           COMPUTERTECH - PRECISION HARDWARE & SYSTEM
echo             Khoi dong Frontend (Vite) va Backend (Express)
echo ================================================================
echo.

:: 1. Kiem tra file cau hinh .env
if not exist .env (
    echo [*] Tao file cau hinh .env tu .env.example...
    copy .env.example .env >nul
)

:: 2. Kiem tra dependencies Backend
echo [1/3] Kiem tra dependencies Backend...
if not exist node_modules (
    echo [!] Dang cai dat dependencies cho Backend...
    call npm install
)

:: 3. Kiem tra dependencies Frontend
echo [2/3] Kiem tra dependencies Frontend...
if not exist frontend\node_modules (
    echo [!] Dang cai dat dependencies cho Frontend...
    call npm --prefix frontend install
)

:: 4. Khoi dong Backend REST API Server (Port 5000)
echo [3/3] Khoi dong Backend API Server (Port 5000)...
start "ComputerTech - Backend REST API" cmd /k "title ComputerTech Backend API && chcp 65001 >nul && node src/server.mjs"

:: 5. Cho server khoi dong va mo trinh duyet
timeout /t 2 >nul
echo.
echo ================================================================
echo   [OK] Backend API:   http://localhost:5000
echo   [OK] Health Check:  http://localhost:5000/api/health
echo   [OK] Frontend App:  http://localhost:5173
echo ================================================================
echo.
echo Dang mo giao dien ComputerTech tai http://localhost:5173 ...
start http://localhost:5173

:: 6. Chay Frontend Dev Server (Port 5173) trong cua so nay
cd frontend
call npm run dev
pause
