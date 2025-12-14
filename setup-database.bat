@echo off
echo Setting up MySQL Database...
echo.
echo Make sure MySQL is running!
echo.
echo Run these commands in MySQL:
echo.
echo CREATE DATABASE IF NOT EXISTS gripinvest_db;
echo USE gripinvest_db;
echo SOURCE backend/init.sql;
echo SOURCE backend/seed.sql;
echo.
echo Opening MySQL command line...
mysql -u root -p
