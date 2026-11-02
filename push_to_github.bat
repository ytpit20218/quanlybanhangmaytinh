@echo off
chcp 65001 >nul
title Push ComputerTech Platform to GitHub
cd /d "%~dp0"
echo ========================================================
echo Dang day ma nguon len GitHub: https://github.com/ytpit20218/quanlybanhangmaytinh.git
echo ========================================================
set "GIT_EXE=C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"

"%GIT_EXE%" init
"%GIT_EXE%" remote remove origin 2>nul
"%GIT_EXE%" remote add origin https://github.com/ytpit20218/quanlybanhangmaytinh.git
"%GIT_EXE%" branch -M main
"%GIT_EXE%" add .
"%GIT_EXE%" commit -m "feat: Nang cap toan bo he thong ComputerTech (React + TypeScript + Vite + Aiven MySQL)"
"%GIT_EXE%" push -u origin main --force

echo.
echo ========================================================
echo Hoan tat day ma nguon len GitHub thanh cong!
echo ========================================================
pause
