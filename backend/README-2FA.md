# 🔐 Email 2FA - Backend Implementation

## Quick Links
- [Quick Start Guide](../QUICK-START-2FA.md)
- [Full Documentation](2FA-SETUP.md)
- [Flow Diagrams](../2FA-FLOWS.md)
- [Implementation Summary](../2FA-IMPLEMENTATION-SUMMARY.md)
- [Testing Checklist](../2FA-CHECKLIST.md)

## 🚀 Quick Setup (3 Steps)

### 1. Run Installation Script
```bash
install-2fa.bat
```
This will:
- Install nodemailer
- Run database migration
- Test email service

### 2. Configure Email (Optional)
Update `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GripInvest <noreply@gripinvest.in>
```

### 3. Restart Server
```bash
npm run dev
```

## 📁 New Files

### Scripts
- `add-2fa-columns.sql` - Database migration
- `setup-2fa.bat` - Setup script
- `install-2fa.bat` - Complete installation
- `test-2fa.js` - Test script

### Documentation
- `2FA-SETUP.md` - Full documentation
- `README-2FA.md` - This file

### Testing
- `2FA-API-Tests.postman_collection.json` - Postman tests

## 🔌 API Endpoints

### Signup Flow
```bash
# Step 1: Create account
POST /api/auth/signup
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "risk_appetite": "moderate"
}

# Step 2: Verify OTP
POST /api/auth/verify-signup
{
  "userId": "uuid-from-step-1",
  "otp": "123456"
}
```

### Login Flow
```bash
# Step 1: Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}

# Step 2: Verify 2FA (if enabled)
POST /api/auth/verify-login
{
  "userId": "uuid-from-step-1",
  "otp": "123456"
}
```

### 2FA Management
```bash
# Enable 2FA
POST /api/auth/enable-2fa
Authorization: Bearer <token>

# Disable 2FA
POST /api/auth/disable-2fa
Authorization: Bearer <token>
```

### Utilities
```bash
# Resend OTP
POST /api/auth/resend-otp
{
  "userId": "uuid"
}
```

## 🧪 Testing

### Console Testing (No Email Setup)
```bash
# Start server
npm run dev

# In another terminal, test the service
node test-2fa.js

# Check console for OTPs
```

### Postman Testing
```bash
# Import collection
2FA-API-Tests.postman_collection.json

# Run tests in order:
1. Signup Flow
2. Login Flow
3. Forgot Password Flow
4. 2FA Management
```

### Manual Testing
```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","email":"test@example.com","password":"SecurePass@123"}'

# Check console for OTP, then verify
curl -X POST http://localhost:5000/api/auth/verify-signup \
  -H "Content-Type: application/json" \
  -d '{"userId":"uuid-from-signup","otp":"123456"}'
```

## 📊 Database Schema

### New Columns in `users` Table
```sql
two_factor_enabled BOOLEAN DEFAULT FALSE
two_factor_code VARCHAR(6) DEFAULT NULL
two_factor_expires DATETIME DEFAULT NULL
email_verified BOOLEAN DEFAULT FALSE
```

### Migration
```bash
mysql -u root -p gripinvest_db < add-2fa-columns.sql
```

## 🔒 Security Features

✅ OTP expires after 10 minutes
✅ One-time use only
✅ Mandatory email verification
✅ Optional 2FA for login
✅ Secure password reset
✅ JWT tokens after verification

## 📧 Email Configuration

### Gmail
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Not regular password!
```

Get App Password: https://myaccount.google.com/apppasswords

### Other Services
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP

## 🐛 Troubleshooting

### OTP Not in Console
- Check if server is running
- Look for 📧 emoji in logs
- Verify emailService.js is correct

### Database Error
- Run migration: `setup-2fa.bat`
- Check MySQL is running
- Verify database exists

### Email Not Sending
- Check .env configuration
- Verify email credentials
- Check spam folder
- Use console OTPs for testing

## 📝 Code Structure

### Controllers
`src/controllers/authController.js`
- `signup()` - Create account & send OTP
- `verifySignupOTP()` - Verify email
- `login()` - Login & send OTP if 2FA on
- `verifyLogin2FA()` - Verify 2FA OTP
- `enable2FA()` - Enable 2FA
- `disable2FA()` - Disable 2FA
- `resendOTP()` - Resend OTP

### Models
`src/models/userModel.js`
- `store2FAOTP()` - Store OTP
- `clear2FAOTP()` - Clear OTP
- `verifyEmail()` - Mark email verified
- `update2FAStatus()` - Enable/disable 2FA

### Utils
`src/utils/emailService.js`
- `generateOTP()` - Generate 6-digit OTP
- `sendOTP()` - Send via email/console
- `verifyOTP()` - Verify OTP validity

### Routes
`src/routes/authRoutes.js`
- All 2FA endpoints registered

## 🎯 Next Steps

1. **Test Everything**
   - Run `node test-2fa.js`
   - Import Postman collection
   - Test all flows

2. **Configure Email**
   - Update .env with credentials
   - Test email sending
   - Check deliverability

3. **Frontend Integration**
   - Create OTP modal component
   - Update signup page
   - Update login page
   - Add 2FA toggle in profile

4. **Production Prep**
   - Add rate limiting
   - Implement account lockout
   - Set up monitoring
   - Configure production email

## 📚 Documentation

| File | Description |
|------|-------------|
| `2FA-SETUP.md` | Complete setup guide |
| `../QUICK-START-2FA.md` | Quick start guide |
| `../2FA-FLOWS.md` | Visual flow diagrams |
| `../2FA-IMPLEMENTATION-SUMMARY.md` | Implementation summary |
| `../2FA-CHECKLIST.md` | Testing checklist |

## 🤝 Support

### Issues?
1. Check console logs
2. Review documentation
3. Test with Postman
4. Run test script

### Common Errors
- "User not found" → Check userId
- "OTP expired" → Request new OTP
- "Invalid OTP" → Check console/email
- "Email not verified" → Complete signup

## ✅ Verification

Run this checklist:
- [ ] Database migration completed
- [ ] Nodemailer installed
- [ ] Test script runs successfully
- [ ] Postman collection imported
- [ ] Signup flow tested
- [ ] Login flow tested
- [ ] 2FA enable/disable tested
- [ ] OTPs visible in console

## 🎉 You're Ready!

Your backend now supports:
- ✅ Email verification on signup
- ✅ Optional 2FA for login
- ✅ OTP-based password reset
- ✅ Professional email templates
- ✅ Development-friendly console logging

**Start Testing:**
```bash
npm run dev
node test-2fa.js
```

---

Built for GripInvest Winter Internship 2025 🚀
