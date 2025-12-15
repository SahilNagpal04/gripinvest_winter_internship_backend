// Portfolio Page - view all user investments
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import PortfolioHealthScore from '../components/PortfolioHealthScore';
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
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // Load portfolio on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadPortfolio();
    loadSummary();
  }, [router]);

  // Fetch portfolio
  const loadPortfolio = async () => {
    try {
      const response = await investmentsAPI.getPortfolio();
      setPortfolio(response.data.data.investments);
      setError('');
    } catch (err) {
      setError('Failed to load portfolio. Please try again.');
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
      setError('Failed to load portfolio summary.');
      console.error('Failed to load summary:', err);
    }
  };

  // Handle cancel investment
  const handleCancel = async (id) => {
    const confirmed = window.confirm('Are you sure you want to cancel this investment?');
    if (!confirmed) return;

    try {
      await investmentsAPI.cancel(id);
      window.location.reload();
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
  
  // Show error message
  if (error && portfolio.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Portfolio</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button onClick={() => { setError(''); setLoading(true); loadPortfolio(); loadSummary(); }} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate metrics from portfolio list
  const activeInvestments = portfolio.filter(p => p.status === 'active');
  
  const totalInvested = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
  const currentValue = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.expected_return || 0), 0);
  const totalReturns = activeInvestments.reduce((sum, inv) => sum + (parseFloat(inv.expected_return || 0) - parseFloat(inv.amount || 0)), 0);
  const returnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : 0;
  const activeCount = activeInvestments.length;
  const maturedCount = portfolio.filter(p => p.status === 'matured').length;
  
  // Calculate dynamic risk score
  const calculateRiskScore = () => {
    if (!summary?.riskDistribution || summary.riskDistribution.length === 0) return { score: 0, label: 'N/A' };
    
    const totalAmount = summary.riskDistribution.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
    if (totalAmount === 0) return { score: 0, label: 'N/A' };
    
    let weightedScore = 0;
    summary.riskDistribution.forEach(risk => {
      const amount = parseFloat(risk.total_amount || 0);
      const weight = amount / totalAmount;
      const riskValue = risk.risk_level === 'low' ? 1 : risk.risk_level === 'moderate' ? 5 : 9;
      weightedScore += riskValue * weight;
    });
    
    const label = weightedScore <= 3 ? 'Conservative' : weightedScore <= 6 ? 'Moderate' : 'Aggressive';
    const emoji = weightedScore <= 3 ? '🟢' : weightedScore <= 6 ? '🟡' : '🔴';
    return { score: weightedScore.toFixed(1), label, emoji };
  };
  
  const riskScore = calculateRiskScore();
  
  // Filter portfolio
  const filteredPortfolio = statusFilter === 'all' 
    ? portfolio 
    : portfolio.filter(p => p.status === statusFilter);
  
  // Get upcoming maturities
  const upcomingMaturities = portfolio
    .filter(p => p.status === 'active')
    .sort((a, b) => new Date(a.maturity_date) - new Date(b.maturity_date))
    .slice(0, 3);
  
  // Calculate days until maturity
  const getDaysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-gray-600 mt-1">Track and manage your investments</p>
          
          {/* Error banner */}
          {error && portfolio.length > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-yellow-800">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-yellow-600 hover:text-yellow-800 font-bold">✕</button>
            </div>
          )}
        </div>

        {/* Overview Cards - 6 cards */}
        {summary && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Current Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(currentValue)}
              </p>
            </div>
            <div 
              className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setStatusFilter('matured');
                setTimeout(() => document.getElementById('investments-table')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Returns</p>
              <p className="text-3xl font-bold text-green-600">
                +{formatCurrency(totalReturns)}
              </p>
              <p className="text-sm text-green-600 font-medium">(+{returnPercentage}%)</p>
            </div>
            <div 
              className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setStatusFilter('active');
                setTimeout(() => document.getElementById('investments-table')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Active Investments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeCount}</p>
            </div>
            <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Interest Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalReturns)}
              </p>
            </div>
            <div 
              className="card bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setStatusFilter('matured');
                setTimeout(() => document.getElementById('investments-table')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Matured Investments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{maturedCount}</p>
            </div>
          </div>
        )}

        {/* Portfolio Health Score */}
        {summary?.healthScore && (
          <PortfolioHealthScore healthScore={summary.healthScore} />
        )}

        {/* Asset Allocation */}
        {chartData.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Asset Allocation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {summary?.riskDistribution?.map((risk) => {
                  const amount = parseFloat(risk.total_amount || 0);
                  const totalAmount = summary.riskDistribution.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
                  const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(0) : 0;
                  return (
                    <div key={risk.risk_level} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded`} style={{ backgroundColor: COLORS[risk.risk_level] }}></div>
                        <span className="font-medium capitalize dark:text-gray-100">{risk.risk_level} Risk</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold dark:text-gray-100">{percentage}%</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">{formatCurrency(risk.total_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Portfolio Insights */}
        {summary?.insights && summary.insights.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 p-3 rounded-lg text-2xl">🤖</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">AI Portfolio Insights</h3>
                  <button onClick={loadSummary} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Refresh</button>
                </div>
                <div className="space-y-2">
                  {summary.insights.map((insight, index) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300">{insight}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Maturities */}
        {upcomingMaturities.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upcoming Maturities</h2>
            </div>
            <div className="space-y-3">
              {upcomingMaturities.map((inv) => {
                const days = getDaysUntil(inv.maturity_date);
                const returns = inv.expected_return - inv.amount;
                const returnPct = ((returns / inv.amount) * 100).toFixed(1);
                return (
                  <div key={inv.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{inv.product_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Matures in {days} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(inv.amount)} + {formatCurrency(returns)}</p>
                        <p className="text-sm text-green-600">Return: {returnPct}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Risk Distribution Bars */}
        {summary?.riskDistribution && summary.riskDistribution.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Portfolio Risk Analysis</h2>
            <div className="space-y-4">
              {(() => {
                const totalAmount = summary.riskDistribution.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
                return summary.riskDistribution.map((risk) => {
                  const amount = parseFloat(risk.total_amount || 0);
                  const percentage = totalAmount > 0 ? (amount / totalAmount * 100) : 0;
                  return (
                    <div key={risk.risk_level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize dark:text-gray-100">{risk.risk_level} Risk ({percentage.toFixed(0)}%)</span>
                        <span className="font-bold dark:text-gray-100">{formatCurrency(risk.total_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[risk.risk_level]
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
              {riskScore.label !== 'N/A' && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Risk Score: {riskScore.score}/10 - {riskScore.label} {riskScore.emoji}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Investments list */}
        <div id="investments-table" className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Investments ({portfolio.length})</h2>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'matured', label: 'Matured' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredPortfolio.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't made any investments yet</p>
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
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-100">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-100">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-100">Returns</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-100">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-100">Maturity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPortfolio.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{investment.product_name}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getRiskColor(investment.risk_level)}`}>
                            {investment.risk_level}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium dark:text-gray-100">
                        {formatCurrency(investment.amount)}
                      </td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">
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
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
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
