@echo off
echo Starting RedHawk Server...
cd Backend
start "" node server.js
echo Server started. You can now access the dashboard at: http://localhost:3001/dashboard
echo Press any key to close this window...
pause 