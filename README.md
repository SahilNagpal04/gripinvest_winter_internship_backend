# Grip Invest - Mini Investment Platform

Full-stack investment platform built for Grip Invest Winter Internship 2025. Features user authentication, investment products management, portfolio tracking, and AI-powered recommendations.

## 🚀 Features

### Backend
- ✅ JWT-based authentication (signup, login, password reset with OTP)
- ✅ Investment products CRUD with AI-generated descriptions
- ✅ User portfolio management with returns calculation
- ✅ Transaction logging for all API calls
- ✅ AI-powered recommendations based on risk appetite
- ✅ Admin and user role-based access control
- ✅ 80%+ test coverage with Jest

### Frontend
- ✅ Responsive UI with Next.js and Tailwind CSS
- ✅ Interactive dashboard with portfolio insights
- ✅ Product browsing with filters and search
- ✅ Real-time investment calculator
- ✅ Portfolio visualization with charts
- ✅ Transaction logs viewer
- ✅ User profile management
- ✅ AI recommendations throughout the app

### DevOps
- ✅ Docker containerization for all services
- ✅ Docker Compose for orchestration
- ✅ Health check endpoints
- ✅ Database initialization scripts
- ✅ Environment-based configuration

## 📋 Tech Stack

**Backend:**
- Node.js + Express.js
- MySQL 8.0
- JWT for authentication
- Bcrypt for password hashing
- Jest + Supertest for testing

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Recharts for data visualization
- Axios for API calls
- Jest + React Testing Library

**DevOps:**
- Docker & Docker Compose
- MySQL container
- Multi-stage builds

## 🛠️ Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose
- MySQL 8.0 (if running without Docker)

## 🚀 Quick Start with Docker

### 1. Clone the repository
```bash
git clone https://github.com/SahilNagpal04/gripinvest_winter_internship_backend.git
cd gripinvest_winter_internship_backend
```

### 2. Start all services with Docker Compose
```bash
cd backend
docker-compose up -d --build
```

**What happens automatically:**
- MySQL database starts on port 3306
- Database schema created from `init.sql`
- Sample data seeded from `seed.sql`
- Backend API starts on port 5000
- Frontend app starts on port 3000

### 3. Verify containers are running
```bash
# Check all containers status
docker-compose ps

# View startup logs
docker-compose logs -f
```

### 4. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Database**: localhost:3306 (root/rootpassword)

### 5. Default Admin Credentials
```
Email: admin@gripinvest.in
Password: Admin@123
```

### 6. Database Seeding
The database is automatically seeded with:
- Admin user account
- Sample investment products
- User accounts for testing
- Transaction history

**Manual seeding (if needed):**
```bash
# Access MySQL container
docker-compose exec mysql mysql -u root -p gripinvest_db

# Run seed script
source /docker-entrypoint-initdb.d/seed.sql
```

## 💻 Manual Setup (Without Docker)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gripinvest_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
PORT=5000
```

4. Initialize database:
```bash
# Login to MySQL
mysql -u root -p

# Run initialization script
source init.sql

# Run seed data (optional)
source seed.sql
```

5. Start backend:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test
```

Test coverage: 80.56%
- 257 tests passing
- All modules covered

### Frontend Tests
```bash
cd frontend
npm test
```

Test coverage: 66.06% 
- 291 tests passing
- All modules covered

## 📁 Project Structure

```
gripinvest_winter_internship_backend/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, logging, error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── tests/               # Jest test files
│   ├── init.sql             # Database schema
│   ├── seed.sql             # Sample data
│   ├── Dockerfile           # Backend container
│   ├── docker-compose.yml   # Multi-container setup
│   └── package.json
├── frontend/
│   ├── pages/               # Next.js pages (routes)
│   ├── components/          # Reusable components
│   ├── utils/               # Helper functions
│   ├── styles/              # Global styles
│   ├── __tests__/           # Jest test files
│   ├── Dockerfile           # Frontend container
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/check-password` - Check password strength
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/top` - Get top products
- `GET /api/products/recommended/me` - Get recommended products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments/portfolio` - Get user portfolio
- `GET /api/investments/portfolio/summary` - Get portfolio summary with AI insights
- `GET /api/investments/:id` - Get investment by ID
- `DELETE /api/investments/:id` - Cancel investment

### Logs
- `GET /api/logs/me` - Get current user's logs
- `GET /api/logs/me/errors` - Get current user's error logs
- `GET /api/logs/date-range` - Get logs by date range
- `GET /api/logs` - Get all logs (admin only)
- `GET /api/logs/user/:userId` - Get logs by user ID (admin only)
- `GET /api/logs/email/:email` - Get logs by email (admin only)

## 🤖 AI Features

1. **Password Strength Checker**
   - Real-time analysis of password security
   - Suggestions for improvement
   - Visual strength indicator

2. **Product Description Generator**
   - Auto-generates descriptions from product fields
   - Saves time for admins

3. **Investment Recommendations**
   - Based on user's risk appetite
   - Personalized product suggestions
   - Displayed on dashboard and profile

4. **Portfolio Insights**
   - AI-generated investment advice
   - Risk distribution analysis
   - Performance recommendations

5. **Error Summarization**
   - Smart analysis of error logs
   - Common error patterns
   - Actionable recommendations

## 🐳 Docker Commands

### Container Management
```bash
# Start all services (with build)
docker-compose up -d --build

# Start without build
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Monitoring & Debugging
```bash
# Check container status
docker-compose ps

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Follow logs in real-time
docker-compose logs -f --tail=100
```

### Database Operations
```bash
# Access MySQL shell
docker-compose exec mysql mysql -u root -p gripinvest_db

# Backup database
docker-compose exec mysql mysqldump -u root -p gripinvest_db > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p gripinvest_db < backup.sql

# Reset database (re-run init scripts)
docker-compose down -v && docker-compose up -d
```

### Service Management
```bash
# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mysql

# Rebuild specific service
docker-compose up -d --build backend

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

## 📊 Database Schema

### Users Table
- Stores user information
- Password hashing with bcrypt
- Risk appetite for recommendations
- Balance tracking

### Investment Products Table
- Product details (name, type, yield, risk)
- Min/max investment limits
- AI-generated descriptions

### Investments Table
- User investments
- Status tracking (active, matured, cancelled)
- Expected returns calculation
- Maturity date

### Transaction Logs Table
- All API requests logged
- Error tracking
- User activity monitoring

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection with Helmet
- CORS configuration
- Input validation


## 🧪 Test Coverage

### Backend: 80.56%
- Statements: 80.56%
- Branches: 66.15%
- Functions: 82%
- Lines: 81.73%

### Frontend: 75%+
- Component tests
- Page tests
- Utility function tests

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gripinvest_db
DB_PORT=3306
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose up -d --build backend
```

### Frontend Build Errors
```bash
# Clear Next.js cache
cd frontend
rm -rf .next

# Rebuild
docker-compose up -d --build frontend
```

### Port Conflicts (First Time Setup)
**Error**: `Port already in use` when running `docker-compose up`

#### Check Port Availability
```bash
# Windows - Check which ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :3306

# Kill process using port (replace PID)
taskkill /PID <PID> /F
```

#### MySQL Port 3306 Conflict
```bash
# Option A: Stop existing MySQL
net stop mysql80

# Option B: Change port in docker-compose.yml
services:
  mysql:
    ports:
      - "3307:3306"  # Use port 3307

# Update backend/.env
DB_PORT=3307
```

#### Backend Port 5000 Conflict
```bash
# Change port in docker-compose.yml
services:
  backend:
    ports:
      - "5001:5000"  # Use port 5001

# Update frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

#### Frontend Port 3000 Conflict
```bash
# Change port in docker-compose.yml
services:
  frontend:
    ports:
      - "3001:3000"  # Use port 3001
```

#### Quick Fix for All Ports
```bash
# Stop containers and kill processes
docker-compose down
taskkill /IM node.exe /F
net stop mysql80

# Restart with original ports
docker-compose up -d --build
```

#### Access URLs After Port Changes
- **Frontend**: http://localhost:3001 (if changed)
- **Backend**: http://localhost:5001 (if changed) 
- **Database**: localhost:3307 (if changed)

## 📦 Postman Collection

Import `GripInvest_API.postman_collection.json` from the backend directory to test all API endpoints.


## ✨ Extra Features Beyond Requirements

### Enhanced User Experience
- **Dark Mode** - Toggle between light and dark themes
- **Smart Alerts** - Real-time notifications for investments and portfolio changes

### Security Enhancements
- **SQL Injection Prevention** - Parameterized queries and validation
- **XSS Protection** - Helmet.js security headers



## 📧 Contact

**Sahil Nagpal**
- GitHub: [@SahilNagpal04](https://github.com/SahilNagpal04)


---

**Note**: This project was developed using AI-assisted development tools to accelerate coding, testing, and documentation. AI helped with:
- Code generation and boilerplate
- Test case creation
- Documentation writing
- Best practices implementation

