// Logs Page - view transaction logs
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { logsAPI } from '../utils/api';
import { isAuthenticated, formatDate } from '../utils/auth';

export default function Logs() {
  const router = useRouter();
  // Logs state
  const [logs, setLogs] = useState([]);
  // Error logs state
  const [errorLogs, setErrorLogs] = useState([]);
  // Active tab state
  const [activeTab, setActiveTab] = useState('all');
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [error, setError] = useState('');

  // Load logs on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadLogs();
  }, []);

  // Fetch logs
  const loadLogs = async () => {
    try {
      // Load all logs
      const allResponse = await logsAPI.getMy();
      setLogs(allResponse.data.data.logs);

      // Load error logs
      const errorResponse = await logsAPI.getMyErrors();
      setErrorLogs(errorResponse.data.data.logs);
    } catch (err) {
      setError('Failed to load logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'bg-green-100 text-green-800';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusCode >= 500) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Get method color
  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
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

  // Current logs to display
  const currentLogs = activeTab === 'all' ? logs : errorLogs;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Logs</h1>
          <p className="text-gray-600 mt-1">View your API activity and errors</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
          </div>
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-600">
              {logs.filter((log) => log.status_code >= 200 && log.status_code < 300).length}
            </p>
          </div>
          <div className="card bg-red-50">
            <p className="text-sm text-gray-600 mb-1">Errors</p>
            <p className="text-2xl font-bold text-red-600">{errorLogs.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'errors'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Errors Only ({errorLogs.length})
            </button>
          </div>

          {/* Logs table */}
          {currentLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Endpoint</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(log.created_at)}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleTimeString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(log.http_method)}`}>
                          {log.http_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">
                        {log.endpoint}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status_code)}`}>
                          {log.status_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.error_message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Error Summary */}
        {errorLogs.length > 0 && (
          <div className="card bg-red-50">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Error Analysis</h3>
                <p className="text-gray-700 mb-2">
                  You have {errorLogs.length} error(s) in your recent activity.
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Most common error: {errorLogs[0]?.error_message || 'N/A'}</li>
                  <li>• Recommendation: Check your input data and authentication status</li>
                  <li>• If errors persist, contact support</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
