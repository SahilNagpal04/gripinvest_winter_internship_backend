@echo off
echo ========================================
echo Setting up 2FA for GripInvest
echo ========================================
echo.
echo This will add 2FA columns to the database
echo.
pause
echo.
echo Running database migration...
mysql -u root -p gripinvest_db < add-2fa-columns.sql
echo.
echo ========================================
echo 2FA setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env with your email credentials
echo 2. Restart the backend server
echo 3. Test signup with OTP verification
echo.
pause
