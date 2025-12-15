import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { transactionsAPI } from '../utils/api';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '' });

  useEffect(() => {
    loadTransactions();
    loadSummary();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsAPI.getTransactions(filters);
      console.log('Transactions data:', data);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await transactionsAPI.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      investment_created: '📤',
      investment_cancelled: '🔄',
      investment_matured: '✅',
      deposit: '💰',
      withdrawal: '💸',
      interest_credited: '📈',
      refund: '↩️',
      fee_charged: '💳'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600',
      reversed: 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-gray-100">Transaction History</h1>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Invested</p>
              <p className="text-2xl font-bold text-red-600">₹{parseFloat(summary.total_debits || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Matured</p>
              <p className="text-2xl font-bold text-green-600">₹{parseFloat(summary.total_credits || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active Investments</p>
              <p className="text-2xl font-bold dark:text-gray-100">{summary.active_investments || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Cancelled</p>
              <p className="text-2xl font-bold dark:text-gray-100">{summary.cancelled_investments || 0}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="investment_created">Investment Created</option>
              <option value="investment_cancelled">Investment Cancelled</option>
              <option value="investment_matured">Investment Matured</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center dark:text-gray-100">Loading...</td>
                </tr>
              ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No transactions found</td>
                </tr>
              ) : (() => {
                // Sort by date ascending and calculate balances
                const sortedTransactions = [...transactions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                let runningBalance = 1000000;
                
                const transactionsWithBalance = sortedTransactions.map((txn) => {
                  const isCredit = ['investment_matured', 'investment_cancelled', 'cancellation', 'deposit', 'interest_credited', 'refund'].includes(txn.transaction_type);
                  const amount = parseFloat(txn.amount);
                  
                  if (isCredit) {
                    runningBalance += amount;
                  } else {
                    runningBalance -= amount;
                  }
                  
                  return { ...txn, balance: runningBalance, isCredit, amount };
                });
                
                // Reverse to show most recent first
                return transactionsWithBalance.reverse().map((txn) => {
                  const date = new Date(txn.created_at);
                  const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={txn.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100">
                        <div>{formattedDate}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100">
                        {getTypeIcon(txn.transaction_type)} {txn.transaction_type.replace(/_/g, ' ')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${txn.isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-100">
                        ₹{txn.balance.toLocaleString('en-IN')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {txn.description}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
