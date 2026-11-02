@echo off
chcp 65001 >nul
title COMPUTERTECH - E-Commerce & Retail Management Platform
color 0B

echo ================================================================
echo           COMPUTERTECH - HE THONG BAN HANG & QUAN LY KHO
echo ================================================================
echo [1] Kiem tra thu vien phan mem...

if not exist node_modules (
    echo [!] Chua cai dat thu vien, dang chay npm install...
    call npm install
)

echo [2] Dang khoi dong may chu web tai http://localhost:5173 ...
echo [3] Dang tu dong mo trinh duyet...

start http://localhost:5173

echo.
echo ================================================================
echo   May chu dang hoat dong. Nhan Ctrl + C de dung may chu.
echo ================================================================
echo.

call npm run dev
pause
