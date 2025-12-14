@echo off
echo ========================================
echo Fixing OTP Issue - Adding 2FA Columns
echo ========================================
echo.

echo Running database migration...
mysql -u root -p gripinvest_db < fix-otp.sql

echo.
echo ========================================
echo Fix completed! Please restart your server.
echo ========================================
pause
