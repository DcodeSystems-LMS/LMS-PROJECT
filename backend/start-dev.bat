@echo off
set NODE_ENV=development
set CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080,https://dcodesys.in,https://app.dcodesys.in
set DEBUG=true
set PORT=3001
echo Starting backend server in development mode...
echo CORS Origins: %CORS_ORIGIN%
echo Environment: %NODE_ENV%
echo Debug: %DEBUG%
npm start
