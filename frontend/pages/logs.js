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

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      const res = await api.get('/logs/me');
      setLogs(res.data.data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = () => {
    const errors = logs.filter(log => log.status_code >= 400);
    
    if (errors.length === 0) {
      setErrorSummary({
        total: 0,
        grouped: [],
        recommendations: ['No errors found! Your activity is running smoothly.']
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

    setErrorSummary({
      total: errors.length,
      grouped: summary,
      recommendations: [
        'Check balance before investing',
        'Verify authentication tokens',
        'Review error messages for clarity'
      ]
    });
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'text-green-600 bg-green-50';
    if (code >= 400 && code < 500) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (code) => {
    if (code >= 200 && code < 300) return '✅';
    return '❌';
  };

  const filteredLogs = logs.filter(log => {
    if (filters.status === 'success' && (log.status_code < 200 || log.status_code >= 300)) return false;
    if (filters.status === 'error' && log.status_code < 400) return false;
    if (filters.method !== 'all' && log.http_method !== filters.method) return false;
    return true;
  });

  if (loading) {
    return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Transaction Logs</h1>
            <p className="text-gray-600">Your complete activity history</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="font-bold mb-4">Filters</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="error">Errors</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Method</label>
              <select value={filters.method} onChange={(e) => setFilters({...filters, method: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                <option value="all">All</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select value={filters.days} onChange={(e) => setFilters({...filters, days: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                <option value="1">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Error Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">🤖 AI Error Analysis</h3>
            <button onClick={generateAISummary} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Generate Summary
            </button>
          </div>
          {errorSummary ? (
            <div>
              <p className="text-gray-700 mb-4">Analyzing {errorSummary.total} errors...</p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-bold mb-3">📊 Top Issues:</h4>
                <div className="space-y-2">
                  {errorSummary.grouped.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-700">• {item.count}× {item.error}</span>
                      <span className="text-sm text-gray-500">{item.endpoint}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-bold mb-3">💡 Recommendations:</h4>
                <ul className="space-y-1">
                  {errorSummary.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-gray-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Click "Generate Summary" to analyze error patterns</p>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Time</th>
                  <th className="text-left py-4 px-6 font-semibold">Endpoint</th>
                  <th className="text-left py-4 px-6 font-semibold">Method</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <>
                    <tr key={idx} onClick={() => setExpandedRow(expandedRow === idx ? null : idx)} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="py-4 px-6">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-4 px-6 font-mono text-sm">{log.endpoint}</td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">{log.http_method}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded font-semibold ${getStatusColor(log.status_code)}`}>
                          {getStatusIcon(log.status_code)} {log.status_code}
                        </span>
                      </td>
                    </tr>
                    {expandedRow === idx && log.error_message && (
                      <tr className="bg-red-50">
                        <td colSpan="4" className="py-3 px-6">
                          <div className="flex items-start gap-2">
                            <span className="text-red-600 font-semibold">Error:</span>
                            <span className="text-red-700">{log.error_message}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">No logs found</div>
          )}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <span className="text-gray-600">Showing {filteredLogs.length} of {logs.length} logs</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
