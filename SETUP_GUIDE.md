# Complete Setup Guide - Grip Invest Platform

This guide will help you set up and run the Grip Invest platform on your local machine.

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Docker Desktop** (for containerized setup)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version` and `docker-compose --version`

4. **MySQL 8.0** (only if running without Docker)
   - Download from: https://dev.mysql.com/downloads/mysql/

5. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

## Option 1: Docker Setup (Recommended)

This is the easiest way to run the entire application.

### Step 1: Clone the Repository

```bash
git clone https://github.com/SahilNagpal04/gripinvest_winter_internship_backend.git
cd gripinvest_winter_internship_backend
```

### Step 2: Start All Services

```bash
cd backend
docker-compose up -d
```

This command will:
- Pull MySQL 8.0 image
- Build backend Docker image
- Build frontend Docker image
- Start all three containers
- Initialize the database
- Create network connections

### Step 3: Wait for Services to Start

```bash
# Check if all services are running
docker-compose ps

# Watch logs (optional)
docker-compose logs -f
```

Wait until you see:
- "✅ Database connected successfully" (backend)
- "ready - started server on 0.0.0.0:3000" (frontend)

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Step 5: Login with Admin Account

```
Email: admin@gripinvest.in
Password: Admin@123
```

### Docker Commands Reference

```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service-name]

# Rebuild containers
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

## Option 2: Manual Setup (Without Docker)

If you prefer to run services individually:

### Step 1: Clone the Repository

```bash
git clone https://github.com/SahilNagpal04/gripinvest_winter_internship_backend.git
cd gripinvest_winter_internship_backend
```

### Step 2: Setup MySQL Database

1. Start MySQL server
2. Login to MySQL:
```bash
mysql -u root -p
```

3. Run initialization script:
```sql
source backend/init.sql
```

4. (Optional) Load sample data:
```sql
source backend/seed.sql
```

5. Exit MySQL:
```sql
exit
```

### Step 3: Setup Backend

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
# Create .env file
touch .env

# Add these variables (edit with your values)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gripinvest_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
PORT=5000
```

4. Start backend:
```bash
npm run dev
```

Backend should start on http://localhost:5000

### Step 4: Setup Frontend

1. Open new terminal
2. Navigate to frontend:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env.local` file:
```bash
# Create .env.local file
touch .env.local

# Add this variable
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start frontend:
```bash
npm run dev
```

Frontend should start on http://localhost:3000

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Testing the Setup

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Get products (no auth required)
curl http://localhost:5000/api/products
```

### 2. Test Frontend

1. Open http://localhost:3000
2. Click "Login"
3. Use admin credentials:
   - Email: admin@gripinvest.in
   - Password: Admin@123
4. You should see the dashboard

### 3. Test Complete Flow

1. **Signup**: Create a new user account
2. **Browse Products**: View investment products
3. **Invest**: Make an investment
4. **Portfolio**: Check your portfolio
5. **Logs**: View transaction logs
6. **Profile**: Update your profile

## Running Tests

### Backend Tests

```bash
cd backend
npm test

# With coverage
npm test -- --coverage
```

Expected: 181 tests passing, 87% coverage

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm test -- --coverage
```

Expected: 75%+ coverage

## Troubleshooting

### Issue: Port Already in Use

**Error**: "Port 3000/5000 is already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Database Connection Failed

**Error**: "Database connection failed"

**Solutions**:
1. Check if MySQL is running
2. Verify credentials in .env file
3. Ensure database exists
4. Check firewall settings

```bash
# Test MySQL connection
mysql -u root -p -h localhost
```

### Issue: Docker Build Fails

**Error**: "Docker build failed"

**Solutions**:
1. Clear Docker cache:
```bash
docker system prune -a
```

2. Rebuild:
```bash
docker-compose up -d --build
```

### Issue: Frontend Can't Connect to Backend

**Error**: "Network Error" or "Failed to fetch"

**Solutions**:
1. Check if backend is running
2. Verify NEXT_PUBLIC_API_URL in .env.local
3. Check CORS settings
4. Clear browser cache

### Issue: npm install Fails

**Error**: "npm ERR!"

**Solutions**:
1. Clear npm cache:
```bash
npm cache clean --force
```

2. Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Postman Testing

### Import Collection

1. Open Postman
2. Click "Import"
3. Select `backend/GripInvest_API.postman_collection.json`
4. Collection will be imported with all endpoints

### Test Endpoints

1. **Login as Admin**:
   - Use "Admin Login" request
   - Copy the token from response

2. **Set Token**:
   - Create environment variable `token`
   - Paste the token value

3. **Test Other Endpoints**:
   - All authenticated requests will use the token automatically

## Database Management

### View Data

```bash
# Login to MySQL
mysql -u root -p gripinvest_db

# View tables
SHOW TABLES;

# View users
SELECT * FROM users;

# View products
SELECT * FROM investment_products;

# View investments
SELECT * FROM investments;

# View logs
SELECT * FROM transaction_logs LIMIT 10;
```

### Reset Database

```bash
# Drop and recreate
mysql -u root -p
DROP DATABASE gripinvest_db;
source backend/init.sql
source backend/seed.sql
```

## Production Deployment

### Environment Variables

Update these for production:

**Backend**:
- Change JWT_SECRET to a strong random string
- Use production database credentials
- Set NODE_ENV=production

**Frontend**:
- Update NEXT_PUBLIC_API_URL to production API URL

### Build for Production

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm start
```

## Getting Help

If you encounter issues:

1. Check this guide first
2. Review error messages carefully
3. Check logs:
   - Backend: `docker-compose logs backend`
   - Frontend: `docker-compose logs frontend`
   - MySQL: `docker-compose logs mysql`
4. Verify all prerequisites are installed
5. Ensure ports 3000, 5000, 3306 are available

## Next Steps

After successful setup:

1. Explore the application
2. Test all features
3. Run test suites
4. Review code structure
5. Check documentation
6. Try making changes

## Quick Reference

### Default Credentials
```
Admin:
Email: admin@gripinvest.in
Password: Admin@123
```

### URLs
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
Health: http://localhost:5000/health
```

### Commands
```bash
# Docker
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # Logs

# Backend
npm run dev                   # Development
npm test                      # Tests
npm start                     # Production

# Frontend
npm run dev                   # Development
npm test                      # Tests
npm run build                 # Build
npm start                     # Production
```

---

**Setup Complete!** 🎉

You should now have a fully functional Grip Invest platform running locally.

For more details, see:
- Main README.md
- Backend README.md
- Frontend README.md
