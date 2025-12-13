# Grip Invest Frontend

Modern, responsive frontend for the Grip Invest investment platform built with Next.js, React, and Tailwind CSS.

## Features

- 🔐 User authentication (signup, login, password reset)
- 📊 Interactive dashboard with portfolio overview
- 💼 Browse and filter investment products
- 💰 Invest in products with real-time returns calculation
- 📈 Portfolio management with charts and analytics
- 🤖 AI-powered recommendations and insights
- 📝 Transaction logs viewer
- 👤 User profile management
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library

## Prerequisites

- Node.js 16+ and npm
- Backend API running on http://localhost:5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (already created):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Application will run on http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Project Structure

```
frontend/
├── pages/              # Next.js pages (routes)
│   ├── index.js       # Landing page
│   ├── login.js       # Login page
│   ├── signup.js      # Signup page
│   ├── dashboard.js   # User dashboard
│   ├── products.js    # Products listing
│   ├── products/[id].js  # Product detail
│   ├── portfolio.js   # Portfolio view
│   ├── profile.js     # User profile
│   ├── logs.js        # Transaction logs
│   └── forgot-password.js  # Password reset
├── components/        # Reusable components
│   └── Layout.js      # Main layout wrapper
├── utils/            # Utility functions
│   ├── api.js        # API client
│   └── auth.js       # Auth helpers
├── styles/           # Global styles
│   └── globals.css   # Tailwind + custom CSS
└── __tests__/        # Test files
    ├── pages/        # Page tests
    ├── components/   # Component tests
    └── utils/        # Utility tests
```

## Key Pages

### Landing Page (/)
- Welcome screen with features
- Call-to-action buttons
- How it works section

### Authentication
- **Signup** (/signup): Register with password strength checker
- **Login** (/login): User authentication
- **Forgot Password** (/forgot-password): OTP-based password reset

### Dashboard (/dashboard)
- Portfolio summary cards
- AI insights
- Risk distribution
- Quick action buttons

### Products (/products)
- Browse all investment products
- Filter by type and risk level
- AI recommendations
- Search functionality

### Product Detail (/products/[id])
- Detailed product information
- Investment form
- Returns calculator
- Expected maturity value

### Portfolio (/portfolio)
- All user investments
- Risk distribution chart
- Investment status tracking
- Cancel investment option

### Profile (/profile)
- View/edit user information
- Update risk appetite
- AI recommendations based on profile

### Logs (/logs)
- View all API requests
- Filter by errors
- AI error analysis
- Request statistics

## API Integration

All API calls are handled through `utils/api.js`:

```javascript
import { authAPI, productsAPI, investmentsAPI, logsAPI } from '../utils/api';

// Example usage
const response = await authAPI.login({ email, password });
const products = await productsAPI.getAll();
```

## Authentication Flow

1. User logs in → JWT token received
2. Token stored in localStorage
3. Token automatically added to all API requests
4. Token verified on protected routes
5. Auto-redirect to login if token expired

## Styling

Uses Tailwind CSS with custom utility classes:

```css
.btn - Base button style
.btn-primary - Primary button (blue)
.btn-secondary - Secondary button (green)
.btn-danger - Danger button (red)
.input - Form input style
.card - Card container style
.spinner - Loading spinner
```

## Testing

Tests cover:
- Page rendering
- Component functionality
- Utility functions
- User interactions

Run tests with:
```bash
npm test
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:5000/api)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## AI Features

1. **Password Strength Checker**: Real-time feedback on password security
2. **Product Recommendations**: Based on user risk appetite
3. **Portfolio Insights**: AI-generated investment advice
4. **Error Analysis**: Smart error summarization in logs

## Performance

- Code splitting with Next.js
- Lazy loading of components
- Optimized images
- Minimal bundle size

## Security

- JWT token authentication
- Secure password handling
- XSS protection
- CSRF protection

## Future Enhancements

- Real-time notifications
- Advanced charts and analytics
- Export portfolio reports
- Multi-language support
- Dark mode

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local

### Build Errors
- Clear .next folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Test Failures
- Clear Jest cache: `npm test -- --clearCache`

## Contributing

1. Create feature branch
2. Make changes with tests
3. Ensure tests pass
4. Submit pull request

## License

MIT License - Grip Invest 2025
