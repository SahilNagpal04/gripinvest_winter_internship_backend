# Grip Invest - Mini Investment Platform

Full-stack investment platform built for Grip Invest Winter Internship 2025. Features user authentication, investment products management, portfolio tracking, and AI-powered recommendations.

## 🚀 Features

### Backend
- ✅ JWT-based authentication (signup, login, password reset with OTP)
- ✅ **Email 2FA** - Mandatory email verification on signup, optional 2FA for login
- ✅ Investment products CRUD with AI-generated descriptions
- ✅ User portfolio management with returns calculation
- ✅ Transaction logging for all API calls
- ✅ AI-powered recommendations based on risk appetite
- ✅ Admin and user role-based access control
- ✅ 87% test coverage with Jest

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
docker-compose up -d
```

This will start:
- MySQL database on port 3306
- Backend API on port 5000
- Frontend app on port 3000

### 3. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### 4. Default Admin Credentials
```
Email: admin@gripinvest.in
Password: Admin@123
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

Test coverage: 87% (exceeds 75% requirement)
- 181 tests passing
- All modules covered

### Frontend Tests
```bash
cd frontend
npm test
```

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
- `POST /api/auth/signup` - Register new user (sends OTP)
- `POST /api/auth/verify-signup` - Verify email with OTP
- `POST /api/auth/login` - User login (sends OTP if 2FA enabled)
- `POST /api/auth/verify-login` - Verify 2FA OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/enable-2fa` - Enable 2FA for user
- `POST /api/auth/disable-2fa` - Disable 2FA for user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/check-password` - Check password strength
- `POST /api/auth/request-password-reset` - Request OTP
- `POST /api/auth/reset-password` - Reset password with OTP

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

### Start all services
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Remove all containers and volumes
```bash
docker-compose down -v
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
- Role-based access control

## 📈 Performance

- Connection pooling for database
- Efficient queries with indexes
- Code splitting in frontend
- Lazy loading of components
- Optimized Docker images

## 🧪 Test Coverage

### Backend: 87%
- Statements: 87.78%
- Branches: 74.02%
- Functions: 87.35%
- Lines: 87.78%

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

## 📦 Postman Collection

Import `GripInvest_API.postman_collection.json` from the backend directory to test all API endpoints.

## 🔐 Email 2FA Setup

For detailed 2FA setup instructions, see [QUICK-START-2FA.md](QUICK-START-2FA.md)

**Quick Setup:**
```bash
cd backend
setup-2fa.bat  # Run database migration
npm install nodemailer  # Install email service
npm run dev  # Restart server
```

**Features:**
- ✅ Mandatory email verification on signup
- ✅ Optional 2FA for login (user can enable/disable)
- ✅ OTP-based password reset
- ✅ Professional email templates
- ✅ Console logging for development

## 🎯 Future Enhancements

- Real-time notifications
- SMS-based 2FA
- Authenticator app support (TOTP)
- Advanced analytics dashboard
- Export portfolio reports (PDF/Excel)
- Multi-currency support
- Mobile app (React Native)
- Payment gateway integration
- KYC verification

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is part of Grip Invest Winter Internship 2025.

## 📧 Contact

**Sahil Nagpal**
- GitHub: [@SahilNagpal04](https://github.com/SahilNagpal04)
- Email: [Your Email]

## 🙏 Acknowledgments

- Grip Invest for the internship opportunity
- AI tools used for development acceleration
- Open source community

---

**Note**: This project was developed using AI-assisted development tools to accelerate coding, testing, and documentation. AI helped with:
- Code generation and boilerplate
- Test case creation
- Documentation writing
- Bug detection and fixes
- Best practices implementation
- Performance optimization suggestions

Built with ❤️ for Grip Invest Winter Internship 2025
