// Profile Page - view and update user profile
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { authAPI, productsAPI } from '../utils/api';
import { isAuthenticated, getUser, saveAuth, formatCurrency } from '../utils/auth';

export default function Profile() {
  const router = useRouter();
  // User state
  const [user, setUser] = useState(null);
  // Recommended products state
  const [recommended, setRecommended] = useState([]);
  // Edit mode state
  const [editing, setEditing] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    risk_appetite: '',
  });
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load profile on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadProfile();
    loadRecommendations();
  }, []);

  // Fetch user profile
  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.data.user;
      setUser(userData);
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name || '',
        risk_appetite: userData.risk_appetite,
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended products
  const loadRecommendations = async () => {
    try {
      const response = await productsAPI.getRecommended();
      setRecommended(response.data.data.products);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data.data.user;
      
      // Update localStorage
      const token = localStorage.getItem('token');
      saveAuth(token, updatedUser);
      
      setUser(updatedUser);
      setSuccess('Profile updated successfully');
      setEditing(false);
      
      // Reload recommendations if risk appetite changed
      if (formData.risk_appetite !== user.risk_appetite) {
        loadRecommendations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name || '',
      risk_appetite: user.risk_appetite,
    });
    setEditing(false);
    setError('');
  };

  // Show loading spinner
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings</p>
        </div>

        {/* Profile card */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

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

          {editing ? (
            // Edit form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Appetite
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
                <p className="text-sm text-gray-600 mt-1">
                  Changing your risk appetite will update your product recommendations
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View mode
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">{user.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium text-gray-900">{user.last_name || 'Not set'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Appetite</p>
                <p className="font-medium text-gray-900 capitalize">{user.risk_appetite}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Balance</p>
                <p className="font-medium text-gray-900">{formatCurrency(user.balance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendations based on profile */}
        {recommended.length > 0 && (
          <div className="card bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl font-bold text-gray-900">
                Recommended for Your Risk Profile
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Based on your {user.risk_appetite} risk appetite, we recommend these products:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {recommended.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      {product.annual_yield}%
                    </span>
                    <button className="text-primary text-sm font-medium">
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
