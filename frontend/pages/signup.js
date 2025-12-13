// Signup Page - new user registration
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { authAPI } from '../utils/api';
import { saveAuth } from '../utils/auth';

export default function Signup() {
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    risk_appetite: 'moderate',
  });
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(null);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Error message state
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength when password changes
    if (name === 'password' && value.length > 0) {
      try {
        const response = await authAPI.checkPassword(value);
        setPasswordStrength(response.data.data.strength);
      } catch (err) {
        console.error('Password check failed:', err);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (passwordStrength && !passwordStrength.isStrong) {
      setError('Please use a stronger password');
      return;
    }

    setLoading(true);

    try {
      // Call signup API
      const response = await authAPI.signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        risk_appetite: formData.risk_appetite,
      });

      // Save token and user data
      saveAuth(response.data.data.token, response.data.data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
              />
              {/* Password strength indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          passwordStrength.level === 'strong'
                            ? 'bg-green-500 w-full'
                            : passwordStrength.level === 'medium'
                            ? 'bg-yellow-500 w-2/3'
                            : 'bg-red-500 w-1/3'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {passwordStrength.level}
                    </span>
                  </div>
                  {/* AI feedback */}
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600">
                      {passwordStrength.feedback.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Risk Appetite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Appetite *
              </label>
              <select
                name="risk_appetite"
                value={formData.risk_appetite}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="low">Low - Conservative investor</option>
                <option value="moderate">Moderate - Balanced approach</option>
                <option value="high">High - Aggressive investor</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center mt-4 text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}
