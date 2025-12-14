import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { isAuthenticated, formatCurrency, getRiskColor } from '../utils/auth';

export default function History() {
  const router = useRouter();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (router.query.status === 'matured') {
      setFilter('matured');
    }
    loadInvestments();
  }, [router.query]);

  const loadInvestments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/investments/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setInvestments(data.data.investments);
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-blue-100 text-blue-800';
    if (status === 'matured') return 'bg-green-100 text-green-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment History</h1>
          <p className="text-gray-600 mt-1">View all your past and current investments</p>
        </div>

        {/* Filter */}
        <div className="card">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              All ({investments.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Active ({investments.filter(i => i.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('matured')}
              className={`px-4 py-2 rounded ${filter === 'matured' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Matured ({investments.filter(i => i.status === 'matured').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded ${filter === 'cancelled' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              Cancelled ({investments.filter(i => i.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Investments List */}
        {filteredInvestments.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No investments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvestments.map((inv) => (
              <div key={inv.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{inv.product_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(inv.risk_level)}`}>
                        {inv.risk_level}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Invested</p>
                        <p className="font-bold">{formatCurrency(inv.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expected Return</p>
                        <p className="font-bold text-green-600">{formatCurrency(inv.expected_return)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Invested On</p>
                        <p className="font-medium">{new Date(inv.invested_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Maturity Date</p>
                        <p className="font-medium">{new Date(inv.maturity_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
