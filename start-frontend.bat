@echo off
echo ======================================
echo    HABIT TRACKER - Frontend Starter
echo ======================================
echo.
echo This will start the React frontend server
echo Make sure the backend is running first!
echo.
echo Backend should be at: http://localhost:5000
echo Frontend will be at: http://localhost:3000
echo.
pause

cd /d "%~dp0habit-tracker-frontend"

echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting frontend development server...
echo Browser should open automatically
echo.
call npm start

pause
