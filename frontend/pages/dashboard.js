// Dashboard Page - main user dashboard with portfolio overview
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { investmentsAPI } from '../utils/api';
import { isAuthenticated, formatCurrency } from '../utils/auth';

export default function Dashboard() {
  const router = useRouter();
  // Portfolio summary state
  const [summary, setSummary] = useState(null);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState('');

  // Load dashboard data on mount
  useEffect(() => {
    // Redirect if not logged in
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadDashboard();
  }, []);

  // Fetch portfolio summary
  const loadDashboard = async () => {
    try {
      const response = await investmentsAPI.getSummary();
      setSummary(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  // Show error message
  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your portfolio overview.</p>
        </div>

        {/* Stats cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Total Invested */}
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.summary?.total_invested || 0)}
            </p>
          </div>

          {/* Current Value */}
          <div className="card bg-green-50 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.summary?.current_value || 0)}
            </p>
          </div>

          {/* Total Gains */}
          <div className="card bg-purple-50 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Total Gains</p>
            <p className="text-2xl font-bold text-green-600">
              +{formatCurrency(summary?.summary?.total_gains || 0)}
            </p>
          </div>

          {/* Active Investments */}
          <div className="card bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">Active Investments</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary?.summary?.total_investments || 0}
            </p>
          </div>
        </div>

        {/* AI Insights Card */}
        {summary?.insights && summary.insights.length > 0 && (
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Portfolio Insights</h3>
                <ul className="space-y-2">
                  {summary.insights.map((insight, index) => (
                    <li key={index} className="text-gray-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Risk Distribution */}
        {summary?.riskDistribution && summary.riskDistribution.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution</h3>
            <div className="space-y-3">
              {summary.riskDistribution.map((risk) => (
                <div key={risk.risk_level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{risk.risk_level} Risk</span>
                    <span>{formatCurrency(risk.total_amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        risk.risk_level === 'low'
                          ? 'bg-green-500'
                          : risk.risk_level === 'moderate'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${risk.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/products')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-bold text-lg">Browse Products</h3>
            <p className="text-gray-600 text-sm mt-1">Explore investment options</p>
          </button>

          <button
            onClick={() => router.push('/portfolio')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold text-lg">View Portfolio</h3>
            <p className="text-gray-600 text-sm mt-1">See all your investments</p>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-2">⚙️</div>
            <h3 className="font-bold text-lg">Update Profile</h3>
            <p className="text-gray-600 text-sm mt-1">Manage your account</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}
