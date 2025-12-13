// Forgot Password Page - request password reset
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { authAPI } from '../utils/api';

export default function ForgotPassword() {
  const router = useRouter();
  // Step state (1: email, 2: OTP and new password)
  const [step, setStep] = useState(1);
  // Form state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Loading state
  const [loading, setLoading] = useState(false);
  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.requestPasswordReset(email);
      setSuccess(response.data.message || 'OTP sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        email,
        otp,
        newPassword,
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>

          {/* Success message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {step === 1 ? (
            // Step 1: Request OTP
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full text-center text-primary hover:underline"
              >
                Back to Login
              </button>
            </form>
          ) : (
            // Step 2: Reset password with OTP
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Enter the OTP sent to {email} and your new password.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-gray-600 hover:text-gray-900"
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
