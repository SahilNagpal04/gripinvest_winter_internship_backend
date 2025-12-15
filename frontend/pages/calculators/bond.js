import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Default values
const DEFAULT_AMOUNT = 50000;
const DEFAULT_COUPON_RATE = 9.2;
const DEFAULT_TENURE = 3;
const BOND_FACE_VALUE = 1000;

// Slider ranges
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 1000000;
const AMOUNT_STEP = 1000;
const MIN_COUPON = 6;
const MAX_COUPON = 15;
const COUPON_STEP = 0.1;
const MIN_TENURE = 1;
const MAX_TENURE = 10;

export default function BondCalculator() {
  const router = useRouter();
  
  // Input state
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [couponRate, setCouponRate] = useState(DEFAULT_COUPON_RATE);
  const [tenure, setTenure] = useState(DEFAULT_TENURE);
  const faceValue = BOND_FACE_VALUE;

  // Calculate bond returns
  const numberOfBonds = Math.floor(amount / faceValue);
  const annualCouponPayment = numberOfBonds * faceValue * (couponRate / 100);
  const totalCouponPayments = annualCouponPayment * tenure;
  const principalAtMaturity = amount;
  const totalReturns = principalAtMaturity + totalCouponPayments;
  const effectiveYield = ((totalReturns - amount) / amount / tenure * 100).toFixed(2);

  // Generate chart data for yearly growth
  const chartData = Array.from({ length: tenure + 1 }, (_, year) => ({
    year,
    amount: amount + (annualCouponPayment * year)
  }));

  // Navigation handler
  const handleExplore = () => {
    console.log('[BOND_CALC] Navigating to bond products');
    router.push('/products?type=bond');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">Bond Calculator</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Calculate bond returns and yields</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input parameters */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6 dark:text-gray-100">Input Parameters</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Investment Amount</label>
                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={AMOUNT_STEP}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-2xl font-bold text-blue-600 mt-2">₹{amount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Coupon Rate (% p.a.)</label>
                <input
                  type="range"
                  min={MIN_COUPON}
                  max={MAX_COUPON}
                  step={COUPON_STEP}
                  value={couponRate}
                  onChange={(e) => setCouponRate(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-2xl font-bold text-blue-600 mt-2">{couponRate}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Tenure (Years)</label>
                <input
                  type="range"
                  min={MIN_TENURE}
                  max={MAX_TENURE}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-2xl font-bold text-blue-600 mt-2">{tenure} Years</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Face Value per Bond</label>
                <p className="text-xl font-bold dark:text-gray-100">₹{faceValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Results and chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6 dark:text-gray-100">Results</h2>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Number of Bonds:</span>
                <span className="font-bold dark:text-gray-100">{numberOfBonds}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Annual Coupon:</span>
                <span className="font-bold dark:text-gray-100">₹{annualCouponPayment.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Coupons ({tenure} years):</span>
                <span className="font-bold dark:text-gray-100">₹{totalCouponPayments.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Maturity Amount:</span>
                <span className="font-bold dark:text-gray-100">₹{principalAtMaturity.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between border-t-2 pt-4">
                <span className="text-lg font-bold dark:text-gray-100">Total Returns:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalReturns.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Effective Yield:</span>
                <span className="font-bold dark:text-gray-100">{effectiveYield}%</span>
              </div>
            </div>

            <button
              onClick={handleExplore}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Explore Bonds
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
