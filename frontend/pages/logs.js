import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { isAuthenticated } from '../utils/auth';
import api from '../utils/api';

export default function TransactionLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [errorSummary, setErrorSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    days: 30
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadLogs();
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      generateAISummary();
    }
  }, [filters.days, logs]);

  const loadLogs = async () => {
    try {
      const res = await api.get('/logs/me?limit=500');
      const allLogs = res.data.data.logs || [];
      setLogs(allLogs);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(filters.days));
    
    const filteredByDate = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= daysAgo;
    });
    
    const errors = filteredByDate.filter(log => log.status_code >= 400);
    
    if (errors.length === 0) {
      setErrorSummary({
        total: 0,
        grouped: [],
        recommendations: ['✅ No errors detected. All transactions are successful!']
      });
      return;
    }
    
    const grouped = {};
    
    errors.forEach(log => {
      const key = log.error_message || 'Unknown error';
      if (!grouped[key]) {
        grouped[key] = { count: 0, endpoint: log.endpoint, status: log.status_code };
      }
      grouped[key].count++;
    });

    const summary = Object.entries(grouped)
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count);

    const recommendations = [];
    summary.forEach(item => {
      if (item.error.includes('balance') || item.error.includes('Insufficient')) {
        recommendations.push('💰 Check balance before making investments');
      } else if (item.error.includes('token') || item.error.includes('authentication')) {
        recommendations.push('🔒 Verify authentication tokens are valid');
      } else if (item.error.includes('not found') || item.error.includes('404')) {
        recommendations.push('🔍 Ensure resources exist before accessing');
      } else if (item.status >= 500) {
        recommendations.push('🔧 Contact support for server errors');
      }
    });

    setErrorSummary({
      total: errors.length,
      grouped: summary,
      recommendations: [...new Set(recommendations)].slice(0, 5) || ['Review error messages for details']
    });
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'text-green-600 bg-green-50';
    if (code >= 300 && code < 400) return 'text-blue-600 bg-blue-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (code) => {
    if (code >= 200 && code < 300) return '✅';
    if (code >= 300 && code < 400) return '🔵';
    return '🔴';
  };

  const filteredLogs = logs.filter(log => {
    if (filters.status === 'success' && (log.status_code < 200 || log.status_code >= 300)) return false;
    if (filters.status === 'redirect' && (log.status_code < 300 || log.status_code >= 400)) return false;
    if (filters.status === 'error' && log.status_code < 400) return false;
    if (filters.method !== 'all' && log.http_method !== filters.method) return false;
    
    const logDate = new Date(log.created_at);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(filters.days));
    if (logDate < daysAgo) return false;
    
    return true;
  });

  console.log('Filtered logs:', filteredLogs.length, 'Filter:', filters.status);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const exportLogs = () => {
    const csv = [
      ['Time', 'Endpoint', 'Method', 'Status', 'Error'],
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.endpoint,
        log.http_method,
        log.status_code,
        log.error_message || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Activity Logs</h1>
          </div>
          <button onClick={exportLogs} className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Filters:</span>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="border dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="all">All</option>
              <option value="success">🟢 Success</option>
              <option value="redirect">🔵 Redirects</option>
              <option value="error">🔴 Errors</option>
            </select>
            <select value={filters.method} onChange={(e) => setFilters({...filters, method: e.target.value})} className="border dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="all">Method: All</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <select value={filters.days} onChange={(e) => setFilters({...filters, days: e.target.value})} className="border dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="1">Date: Today</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        {/* AI Error Summary */}
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 mb-4 shadow-md">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">🤖 AI Error Summary</h3>
          {errorSummary && errorSummary.total > 0 ? (
            <div className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{errorSummary.total} errors found in last {filters.days} days</p>
              {errorSummary.grouped.slice(0, 3).map((item, idx) => (
                <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                  • {item.count}× "{item.error}"
                </div>
              ))}
              {errorSummary.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t dark:border-gray-600">
                  {errorSummary.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">{rec}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <p className="text-gray-600 dark:text-gray-400">✅ No errors detected. All transactions are successful!</p>
            </div>
          )}
        </div>

        {/* Status Code Legend */}
        <div className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Status Codes:</span>
            <span className="flex items-center gap-1">🟢 <span className="text-gray-600 dark:text-gray-400">Success</span></span>
            <span className="flex items-center gap-1">🔵 <span className="text-gray-600 dark:text-gray-400">Redirects</span></span>
            <span className="flex items-center gap-1">🔴 <span className="text-gray-600 dark:text-gray-400">Errors</span></span>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Endpoint</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, idx) => (
                <>
                  <tr key={idx} onClick={() => setExpandedRow(expandedRow === idx ? null : idx)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-900 dark:text-gray-100">{log.endpoint}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">{log.http_method}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(log.status_code)}`}>
                        {getStatusIcon(log.status_code)} {log.status_code}
                      </span>
                    </td>
                  </tr>
                  {expandedRow === idx && log.error_message && (
                    <tr className="bg-red-50 dark:bg-red-900/20">
                      <td colSpan="4" className="py-2 px-4">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-red-600 dark:text-red-400">└─ Error:</span>
                          <span className="text-red-700 dark:text-red-300">{log.error_message}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {currentLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No logs found matching the selected filters</p>
              <p className="text-sm mt-2">Total logs: {logs.length} | Filtered: {filteredLogs.length}</p>
            </div>
          )}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center border-t dark:border-gray-600">
            <span className="text-sm text-gray-600 dark:text-gray-400">Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-900 dark:text-gray-100"
              >
                ← Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="px-3 py-1 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-900 dark:text-gray-100"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
