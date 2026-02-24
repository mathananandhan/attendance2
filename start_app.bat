@echo off
echo Starting EduPrime Platform...

start "EduPrime Backend" cmd /k "cd server && npm run dev"
start "EduPrime AI Service" cmd /k "cd ai_service && venv\Scripts\activate && python main.py"
start "EduPrime Frontend" cmd /k "cd client && npm run dev"

echo All services started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo AI Service: http://localhost:5001
pause
