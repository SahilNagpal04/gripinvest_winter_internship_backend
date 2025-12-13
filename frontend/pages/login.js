// Login Page - user authentication
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { authAPI } from '../utils/api';
import { saveAuth } from '../utils/auth';

export default function Login() {
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  // Loading state
  const [loading, setLoading] = useState(false);
  // Error message state
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login API
      const response = await authAPI.login(formData);

      // Save token and user data
      saveAuth(response.data.data.token, response.data.data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center mt-4 text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-primary hover:underline"
            >
              Sign Up
            </button>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <p className="text-sm text-gray-600">
              Admin: admin@gripinvest.in / Admin@123
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
