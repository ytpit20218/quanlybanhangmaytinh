@echo off
title Push ComputerTech Frontend to GitHub
cd /d "c:\Users\Admin\Documents\frontend"
echo ========================================================
echo Dang day ma nguon len GitHub: https://github.com/ytpit20218/quanlybanhangmaytinh.git
echo ========================================================
set "GIT_EXE=C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
"%GIT_EXE%" add .
"%GIT_EXE%" commit -m "Cap nhat giao dien phong cach Google Material 3 (Material You)"
"%GIT_EXE%" push -u origin main
echo.
pause
