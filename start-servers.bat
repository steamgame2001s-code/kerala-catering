@echo off
echo Starting Kerala Catering Website...
start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak
start cmd /k "cd frontend && npm start"
echo Both servers started! Check:
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause