// Portfolio Page - view all user investments
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { investmentsAPI } from '../utils/api';
import { isAuthenticated, formatCurrency, formatDate, getRiskColor } from '../utils/auth';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Portfolio() {
  const router = useRouter();
  // Portfolio state
  const [portfolio, setPortfolio] = useState([]);
  // Summary state
  const [summary, setSummary] = useState(null);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState('');

  // Load portfolio on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadPortfolio();
    loadSummary();
  }, []);

  // Fetch portfolio
  const loadPortfolio = async () => {
    try {
      const response = await investmentsAPI.getPortfolio();
      setPortfolio(response.data.data.investments);
    } catch (err) {
      setError('Failed to load portfolio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const loadSummary = async () => {
    try {
      const response = await investmentsAPI.getSummary();
      setSummary(response.data.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  // Handle cancel investment
  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this investment?')) {
      return;
    }

    try {
      await investmentsAPI.cancel(id);
      alert('Investment cancelled successfully');
      loadPortfolio();
      loadSummary();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel investment');
    }
  };

  // Prepare chart data
  const chartData = summary?.riskDistribution?.map((risk) => ({
    name: risk.risk_level,
    value: parseFloat(risk.total_amount),
  })) || [];

  // Chart colors
  const COLORS = {
    low: '#10B981',
    moderate: '#F59E0B',
    high: '#EF4444',
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
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-gray-600 mt-1">Track and manage your investments</p>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card bg-blue-50">
              <p className="text-sm text-gray-600 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.summary.total_invested)}
              </p>
            </div>
            <div className="card bg-green-50">
              <p className="text-sm text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.summary.current_value)}
              </p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-sm text-gray-600 mb-1">Total Returns</p>
              <p className="text-2xl font-bold text-green-600">
                +{formatCurrency(summary.summary.total_gains)}
              </p>
            </div>
          </div>
        )}

        {/* Risk distribution chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Investments list */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Investments</h2>

          {portfolio.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't made any investments yet</p>
              <button
                onClick={() => router.push('/products')}
                className="btn btn-primary"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Returns</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Maturity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{investment.product_name}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getRiskColor(investment.risk_level)}`}>
                            {investment.risk_level}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(investment.amount)}
                      </td>
                      <td className="px-4 py-3 text-green-600 font-medium">
                        +{formatCurrency(investment.expected_return - investment.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          investment.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : investment.status === 'matured'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {investment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(investment.maturity_date)}
                      </td>
                      <td className="px-4 py-3">
                        {investment.status === 'active' && (
                          <button
                            onClick={() => handleCancel(investment.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
