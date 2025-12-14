# Email 2FA Implementation Guide

## Overview
This implementation adds email-based Two-Factor Authentication (2FA) for:
1. **Signup** - Mandatory email verification with OTP
2. **Login** - Optional 2FA (user can enable/disable)
3. **Forgot Password** - OTP-based password reset

## Setup Instructions

### 1. Database Migration
Run the SQL migration to add 2FA columns:

```bash
# Windows
setup-2fa.bat

# Or manually
mysql -u root -p gripinvest_db < add-2fa-columns.sql
```

This adds:
- `two_factor_enabled` - Boolean flag for 2FA status
- `two_factor_code` - Stores OTP temporarily
- `two_factor_expires` - OTP expiry timestamp
- `email_verified` - Email verification status

### 2. Email Configuration
Update `.env` with your email credentials:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GripInvest <noreply@gripinvest.in>
```

**For Gmail:**
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASS`

### 3. Install Dependencies (if needed)
```bash
npm install nodemailer
```

### 4. Restart Server
```bash
npm run dev
```

## API Endpoints

### Signup Flow (Mandatory Email Verification)

#### Step 1: Create Account & Send OTP
```http
POST /api/auth/signup
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "risk_appetite": "moderate"
}
```

Response:
```json
{
  "status": "success",
  "message": "OTP sent to your email. Please verify to complete signup.",
  "data": {
    "userId": "uuid",
    "email": "john@example.com",
    "requiresVerification": true
  }
}
```

#### Step 2: Verify OTP
```http
POST /api/auth/verify-signup
Content-Type: application/json

{
  "userId": "uuid",
  "otp": "123456"
}
```

Response:
```json
{
  "status": "success",
  "message": "Email verified successfully. Registration complete!",
  "data": {
    "user": { ... },
    "token": "jwt_token"
  }
}
```

### Login Flow (Optional 2FA)

#### Step 1: Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

Response (if 2FA disabled):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token"
  }
}
```

Response (if 2FA enabled):
```json
{
  "status": "success",
  "message": "OTP sent to your email",
  "data": {
    "userId": "uuid",
    "requires2FA": true
  }
}
```

#### Step 2: Verify 2FA OTP (if enabled)
```http
POST /api/auth/verify-login
Content-Type: application/json

{
  "userId": "uuid",
  "otp": "123456"
}
```

### Forgot Password Flow

#### Step 1: Request OTP
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Step 2: Reset Password with OTP
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass@123"
}
```

### 2FA Management

#### Enable 2FA
```http
POST /api/auth/enable-2fa
Authorization: Bearer <token>
```

#### Disable 2FA
```http
POST /api/auth/disable-2fa
Authorization: Bearer <token>
```

#### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "userId": "uuid"
}
```

## Frontend Integration

### Signup Component
```javascript
// Step 1: Signup
const handleSignup = async (formData) => {
  const response = await axios.post('/api/auth/signup', formData);
  if (response.data.data.requiresVerification) {
    setUserId(response.data.data.userId);
    setShowOTPModal(true);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async (otp) => {
  const response = await axios.post('/api/auth/verify-signup', {
    userId,
    otp
  });
  localStorage.setItem('token', response.data.data.token);
  router.push('/dashboard');
};
```

### Login Component
```javascript
// Step 1: Login
const handleLogin = async (credentials) => {
  const response = await axios.post('/api/auth/login', credentials);
  
  if (response.data.data.requires2FA) {
    setUserId(response.data.data.userId);
    setShowOTPModal(true);
  } else {
    localStorage.setItem('token', response.data.data.token);
    router.push('/dashboard');
  }
};

// Step 2: Verify 2FA
const handleVerify2FA = async (otp) => {
  const response = await axios.post('/api/auth/verify-login', {
    userId,
    otp
  });
  localStorage.setItem('token', response.data.data.token);
  router.push('/dashboard');
};
```

## Security Features

1. **OTP Expiry**: OTPs expire after 10 minutes
2. **One-time Use**: OTPs are cleared after successful verification
3. **Email Verification**: Users must verify email before accessing the platform
4. **Optional 2FA**: Users can enable/disable 2FA for login
5. **Secure Storage**: OTPs are stored temporarily in database

## Testing

### Development Mode
In development, OTPs are logged to console:
```
📧 ========== EMAIL OTP ==========
To: john@example.com
Purpose: Email Verification for Signup
OTP Code: 123456
Valid for: 10 minutes
================================
```

### Production Mode
Update `emailService.js` to use nodemailer:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp, purpose) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your OTP for ${purpose}`,
    html: `
      <h2>GripInvest - OTP Verification</h2>
      <p>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
      <p>Valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
};
```

## Troubleshooting

### OTP Not Received
- Check email credentials in `.env`
- Verify email service is configured correctly
- Check spam folder
- In development, check console logs

### OTP Expired
- Request new OTP using `/api/auth/resend-otp`
- OTPs expire after 10 minutes

### Email Already Verified
- User tried to verify again
- Redirect to login page

### 2FA Not Working
- Check if user has `two_factor_enabled = true`
- Verify database columns exist
- Check OTP expiry time

## Flow Diagrams

### Signup Flow
```
User → Signup Form → Backend creates user (email_verified=false)
                   → Generate OTP → Send Email
                   → User enters OTP → Verify OTP
                   → Set email_verified=true → Return JWT token
```

### Login Flow (2FA Enabled)
```
User → Login Form → Backend verifies credentials
                  → Check two_factor_enabled
                  → Generate OTP → Send Email
                  → User enters OTP → Verify OTP
                  → Return JWT token
```

### Forgot Password Flow
```
User → Enter Email → Backend generates OTP → Send Email
                   → User enters OTP + New Password
                   → Verify OTP → Update Password
```

## Best Practices

1. **Rate Limiting**: Add rate limiting to prevent OTP spam
2. **Email Templates**: Use professional HTML email templates
3. **Logging**: Log all 2FA attempts for security auditing
4. **User Feedback**: Show clear error messages for OTP failures
5. **Resend Cooldown**: Add cooldown period between OTP resends
6. **Account Lockout**: Lock account after multiple failed OTP attempts

## Future Enhancements

- SMS-based OTP as alternative
- Authenticator app support (TOTP)
- Backup codes for account recovery
- Email notification for 2FA changes
- IP-based trusted devices
- Remember device option

---

**Note**: This implementation uses email-based OTP. For production, consider using services like:
- AWS SES (Simple Email Service)
- SendGrid
- Mailgun
- Twilio SendGrid

Built for GripInvest Winter Internship 2025 🚀
