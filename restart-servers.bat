@echo off
echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Clearing npm cache...
npm cache clean --force

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo Starting Admin Server...
cd ../admin
start "Admin Server" cmd /k "npm run dev"

echo All servers started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3005
echo Admin: http://localhost:3006

pause
