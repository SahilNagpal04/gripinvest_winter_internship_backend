import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function NotificationBell() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [count, setCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlertCount();
  }, []);

  const loadAlertCount = async () => {
    try {
      const res = await api.get('/alerts/count');
      setCount(res.data.data.count);
    } catch (err) {
      console.error('Failed to load alert count:', err);
    }
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.data.alerts);
      setCount(res.data.data.count);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!showDropdown) {
      loadAlerts();
    }
    setShowDropdown(!showDropdown);
  };

  const handleAlertClick = (alert) => {
    if (alert.type === 'maturity') {
      router.push('/portfolio');
    } else if (alert.type === 'new_product') {
      router.push(`/products/${alert.productId}`);
    }
    setShowDropdown(false);
  };

  const dismissAlert = (e, index) => {
    e.stopPropagation();
    const newAlerts = alerts.filter((_, i) => i !== index);
    setAlerts(newAlerts);
    setCount(newAlerts.length);
  };

  const dismissAll = () => {
    setAlerts([]);
    setCount(0);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button onClick={handleBellClick} className="relative p-2 hover:bg-gray-100 rounded-full transition">
        <span className="text-2xl">🔔</span>
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button onClick={() => setShowDropdown(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            {!loading && alerts.length > 0 && (
              <div className="p-3 border-b bg-gray-50">
                <button onClick={dismissAll} className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Mark All as Read
                </button>
              </div>
            )}
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : alerts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No new notifications</div>
              ) : (
                alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAlertClick(alert)}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  >
                    {alert.type === 'maturity' ? (
                      <div className="flex items-start gap-2">
                        <span className="text-xl">⏰</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{alert.message}</p>
                          <p className="text-sm text-gray-600">Amount: ₹{alert.amount?.toLocaleString()}</p>
                        </div>
                        <button onClick={(e) => dismissAlert(e, idx)} className="text-gray-400 hover:text-red-600">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <span className="text-xl">🔥</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{alert.message}</p>
                          <p className="text-sm text-gray-600">{alert.productName} - {alert.yield}% yield</p>
                        </div>
                        <button onClick={(e) => dismissAlert(e, idx)} className="text-gray-400 hover:text-red-600">✕</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
