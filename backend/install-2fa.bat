@echo off
echo ========================================
echo Installing Email 2FA for GripInvest
echo ========================================
echo.

echo Step 1: Installing nodemailer...
call npm install nodemailer
echo.

echo Step 2: Running database migration...
echo Please enter your MySQL password when prompted
mysql -u root -p gripinvest_db < add-2fa-columns.sql
echo.

echo Step 3: Testing email service...
node test-2fa.js
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure email in .env file (optional for testing)
echo 2. Restart the server: npm run dev
echo 3. Test with Postman collection
echo.
echo Documentation:
echo - Quick Start: ../QUICK-START-2FA.md
echo - Full Docs: 2FA-SETUP.md
echo - Flow Diagrams: ../2FA-FLOWS.md
echo.
pause
