# 🚀 Quick Start Guide - Email 2FA

## What's Implemented?

✅ **Signup with Email Verification** (Mandatory)
- User signs up → Receives OTP via email → Verifies OTP → Account activated

✅ **Login with 2FA** (Optional - User can enable/disable)
- User logs in → If 2FA enabled → Receives OTP → Verifies OTP → Access granted

✅ **Forgot Password with OTP** (Already working)
- User requests reset → Receives OTP → Enters OTP + new password → Password updated

## 🏃 Quick Setup (5 minutes)

### Step 1: Run Database Migration
```bash
cd backend
setup-2fa.bat
```
Or manually:
```bash
mysql -u root -p gripinvest_db < add-2fa-columns.sql
```

### Step 2: Install Nodemailer
```bash
npm install nodemailer
```

### Step 3: Configure Email (Optional for testing)
Update `backend/.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GripInvest <noreply@gripinvest.in>
```

**Note**: If you skip this step, OTPs will be logged to console (perfect for development!)

### Step 4: Restart Server
```bash
npm run dev
```

## 🧪 Testing

### Option 1: Using Console OTPs (Easiest)
1. Don't configure email in `.env`
2. Start server: `npm run dev`
3. Sign up a new user
4. Check console for OTP:
```
📧 ========== EMAIL OTP ==========
To: test@example.com
Purpose: Email Verification for Signup
OTP Code: 123456
Valid for: 10 minutes
================================
```
5. Use the OTP to verify

### Option 2: Using Postman
1. Import `backend/2FA-API-Tests.postman_collection.json`
2. Run "Signup Flow" → "Step 1: Signup"
3. Copy `userId` from response
4. Check console for OTP
5. Run "Step 2: Verify Signup OTP" with userId and OTP

### Option 3: Test Script
```bash
cd backend
node test-2fa.js
```

## 📱 User Flows

### New User Signup
```
1. User fills signup form
2. Backend creates account (email_verified = false)
3. OTP sent to email (or console)
4. User enters OTP
5. Backend verifies OTP
6. email_verified = true
7. User gets JWT token and can access platform
```

### Existing User Login (2FA Disabled)
```
1. User enters email + password
2. Backend verifies credentials
3. User gets JWT token immediately
```

### Existing User Login (2FA Enabled)
```
1. User enters email + password
2. Backend verifies credentials
3. OTP sent to email
4. User enters OTP
5. Backend verifies OTP
6. User gets JWT token
```

### Forgot Password
```
1. User enters email
2. OTP sent to email
3. User enters OTP + new password
4. Backend verifies OTP and updates password
5. User can login with new password
```

## 🎯 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Create account & send OTP |
| `/api/auth/verify-signup` | POST | Verify OTP & activate account |
| `/api/auth/login` | POST | Login (sends OTP if 2FA enabled) |
| `/api/auth/verify-login` | POST | Verify 2FA OTP |
| `/api/auth/resend-otp` | POST | Resend OTP |
| `/api/auth/enable-2fa` | POST | Enable 2FA for user |
| `/api/auth/disable-2fa` | POST | Disable 2FA for user |
| `/api/auth/request-password-reset` | POST | Request password reset OTP |
| `/api/auth/reset-password` | POST | Reset password with OTP |

## 🔧 Configuration Options

### Development Mode (Default)
- OTPs logged to console
- No email service needed
- Perfect for testing

### Production Mode
1. Configure email in `.env`
2. OTPs sent via email
3. Console logging still active for debugging

## 📝 Example Requests

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "SecurePass@123",
    "risk_appetite": "moderate"
  }'
```

### Verify Signup
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-from-signup-response",
    "otp": "123456"
  }'
```

### Enable 2FA
```bash
curl -X POST http://localhost:5000/api/auth/enable-2fa \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎨 Frontend Integration Tips

### React/Next.js Example
```javascript
// Signup with OTP verification
const [showOTPModal, setShowOTPModal] = useState(false);
const [userId, setUserId] = useState('');

const handleSignup = async (formData) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  
  if (data.data.requiresVerification) {
    setUserId(data.data.userId);
    setShowOTPModal(true);
  }
};

const handleVerifyOTP = async (otp) => {
  const res = await fetch('/api/auth/verify-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp })
  });
  const data = await res.json();
  
  localStorage.setItem('token', data.data.token);
  router.push('/dashboard');
};
```

## 🐛 Troubleshooting

### "User not found" error
- Make sure you're using the correct userId from signup response

### "OTP expired" error
- OTPs expire after 10 minutes
- Use resend-otp endpoint to get a new one

### "Email already registered" error
- User already exists
- Try logging in instead

### OTP not in console
- Check if server is running
- Look for the 📧 emoji in console output

### Email not sending
- Check EMAIL_USER and EMAIL_PASS in .env
- For Gmail, use App Password (not regular password)
- Check spam folder

## 📚 Documentation

- Full documentation: `backend/2FA-SETUP.md`
- Postman collection: `backend/2FA-API-Tests.postman_collection.json`
- Test script: `backend/test-2fa.js`

## ✅ Checklist

- [ ] Database migration completed
- [ ] Nodemailer installed
- [ ] Email configured (optional)
- [ ] Server restarted
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Tested forgot password flow
- [ ] Tested 2FA enable/disable

## 🎉 You're All Set!

Your GripInvest platform now has:
- ✅ Mandatory email verification on signup
- ✅ Optional 2FA for login
- ✅ Secure password reset with OTP
- ✅ Professional email templates
- ✅ Console logging for development

**Next Steps:**
1. Test all flows using Postman
2. Integrate with frontend
3. Configure production email service
4. Add rate limiting for security

---

Need help? Check `backend/2FA-SETUP.md` for detailed documentation.

Built with ❤️ for GripInvest Winter Internship 2025
