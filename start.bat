@echo off
chcp 65001 >nul
title COMPUTERTECH - BACKEND REST API & DATABASE SERVER
color 0A

echo ================================================================
echo           COMPUTERTECH - BACKEND REST API & DATABASE
echo ================================================================

echo [1/2] Kiem tra dependencies...
if not exist node_modules (
    echo [!] Chua co node_modules, dang chay npm install...
    call npm install
)

echo [2/2] Khoi dong Backend REST API Server tai http://localhost:5000 ...
echo Dang mo kiem tra suc khoe API tai http://localhost:5000/api/health ...

timeout /t 2 >nul
start http://localhost:5000/api/health

echo.
echo ================================================================
echo   Server dang chay. Nhan Ctrl + C de dung server.
echo ================================================================
echo.

call npm run dev
pause
