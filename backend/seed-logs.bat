@echo off
echo Seeding transaction logs...
mysql -u root -p gripinvest_db < seed-logs.sql
echo Done!
pause
