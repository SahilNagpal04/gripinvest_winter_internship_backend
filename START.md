# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- MySQL 8.0 installed and running
- Ports 3000, 5000, 3306 available

## Setup Steps

### 1. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run these commands in MySQL:
CREATE DATABASE IF NOT EXISTS gripinvest_db;
USE gripinvest_db;
SOURCE backend/init.sql;
SOURCE backend/seed.sql;
EXIT;
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo DB_HOST=localhost > .env
echo DB_USER=root >> .env
echo DB_PASSWORD=your_mysql_password >> .env
echo DB_NAME=gripinvest_db >> .env
echo DB_PORT=3306 >> .env
echo JWT_SECRET=your-super-secret-jwt-key-change-this >> .env
echo JWT_EXPIRE=7d >> .env
echo PORT=5000 >> .env

# Start backend
npm run dev
```

### 3. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local

# Start frontend
npm run dev
```

## Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## Default Login
```
Email: admin@gripinvest.in
Password: Admin@123
```

## Troubleshooting
- If port 3000 is busy: Kill the process or change port in frontend
- If port 5000 is busy: Change PORT in backend/.env
- If MySQL connection fails: Check DB credentials in backend/.env
- If tests fail: Run `npm test` in backend and frontend separately
