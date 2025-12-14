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
    days: 7
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.is_admin) {
      router.push('/');
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
    if (code >= 400 && code < 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (code) => {
    if (code >= 200 && code < 300) return '✅';
    if (code >= 300 && code < 400) return '🔵';
    if (code >= 400 && code < 500) return '🟡';
    return '🔴';
  };

  const filteredLogs = logs.filter(log => {
    if (filters.status === 'success' && (log.status_code < 200 || log.status_code >= 300)) return false;
    if (filters.status === 'redirect' && (log.status_code < 300 || log.status_code >= 400)) return false;
    if (filters.status === 'client_error' && (log.status_code < 400 || log.status_code >= 500)) return false;
    if (filters.status === 'server_error' && log.status_code < 500) return false;
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
            <h1 className="text-3xl font-bold">Activity Logs</h1>
          </div>
          <button onClick={exportLogs} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Filters:</span>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="border rounded-lg px-3 py-2">
              <option value="all">All</option>
              <option value="success">🟢 Success</option>
              <option value="redirect">🔵 Redirects</option>
              <option value="client_error">🟡 Client Errors</option>
              <option value="server_error">🔴 Server Errors</option>
            </select>
            <select value={filters.method} onChange={(e) => setFilters({...filters, method: e.target.value})} className="border rounded-lg px-3 py-2">
              <option value="all">Method: All</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <select value={filters.days} onChange={(e) => setFilters({...filters, days: e.target.value})} className="border rounded-lg px-3 py-2">
              <option value="1">Date: Today</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        {/* AI Error Summary */}
        <div className="bg-white border rounded-xl p-4 mb-4 shadow-md">
          <h3 className="text-lg font-bold mb-3">🤖 AI Error Summary</h3>
          {errorSummary && errorSummary.total > 0 ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-semibold mb-2">{errorSummary.total} errors found in last {filters.days} days</p>
              {errorSummary.grouped.slice(0, 3).map((item, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  • {item.count}× "{item.error}"
                </div>
              ))}
              {errorSummary.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  {errorSummary.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm text-gray-600">{rec}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-gray-600">✅ No errors detected. All transactions are successful!</p>
            </div>
          )}
        </div>

        {/* Status Code Legend */}
        <div className="bg-gray-50 border rounded-lg p-3 mb-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold text-gray-700">Status Codes:</span>
            <span className="flex items-center gap-1">🟢 <span className="text-gray-600">Success</span></span>
            <span className="flex items-center gap-1">🔵 <span className="text-gray-600">Redirects</span></span>
            <span className="flex items-center gap-1">🟡 <span className="text-gray-600">Client Errors</span></span>
            <span className="flex items-center gap-1">🔴 <span className="text-gray-600">Server Errors</span></span>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Time</th>
                <th className="text-left py-3 px-4 font-semibold">Endpoint</th>
                <th className="text-left py-3 px-4 font-semibold">Method</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, idx) => (
                <>
                  <tr key={idx} onClick={() => setExpandedRow(expandedRow === idx ? null : idx)} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="py-3 px-4 text-sm">
                      {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{log.endpoint}</td>
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
                    <tr className="bg-red-50">
                      <td colSpan="4" className="py-2 px-4">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-red-600">└─ Error:</span>
                          <span className="text-red-700">{log.error_message}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {currentLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No logs found matching the selected filters</p>
              <p className="text-sm mt-2">Total logs: {logs.length} | Filtered: {filteredLogs.length}</p>
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t">
            <span className="text-sm text-gray-600">Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ← Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
