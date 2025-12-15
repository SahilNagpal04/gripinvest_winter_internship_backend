import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Investment types
const INVESTMENT_TYPE_SIP = 'sip';
const INVESTMENT_TYPE_LUMPSUM = 'lumpsum';

// Default values
const DEFAULT_MONTHLY_AMOUNT = 5000;
const DEFAULT_LUMPSUM = 100000;
const DEFAULT_RETURN_RATE = 12;
const DEFAULT_YEARS = 5;

// Slider ranges
const MIN_MONTHLY = 500;
const MAX_MONTHLY = 50000;
const MONTHLY_STEP = 500;
const MIN_LUMPSUM = 10000;
const MAX_LUMPSUM = 1000000;
const LUMPSUM_STEP = 10000;
const MIN_RETURN = 8;
const MAX_RETURN = 20;
const RETURN_STEP = 0.5;
const MIN_YEARS = 1;
const MAX_YEARS = 20;

// Calculation constants
const MONTHS_PER_YEAR = 12;
const PERCENTAGE_DIVISOR = 100;
const DECIMAL_PLACES = 2;

export default function ETFCalculator() {
  const router = useRouter();
  
  // Input state
  const [investmentType, setInvestmentType] = useState(INVESTMENT_TYPE_SIP);
  const [monthlyAmount, setMonthlyAmount] = useState(DEFAULT_MONTHLY_AMOUNT);
  const [lumpsum, setLumpsum] = useState(DEFAULT_LUMPSUM);
  const [returnRate, setReturnRate] = useState(DEFAULT_RETURN_RATE);
  const [years, setYears] = useState(DEFAULT_YEARS);

  // Helper function for rounding
  const roundToDecimal = (value) => Math.round(value * PERCENTAGE_DIVISOR) / PERCENTAGE_DIVISOR;

  // Calculate SIP returns
  const calculateSIP = () => {
    console.log('[ETF_CALC] Calculating SIP returns');
    const totalMonths = years * MONTHS_PER_YEAR;
    const monthlyRate = returnRate / MONTHS_PER_YEAR / PERCENTAGE_DIVISOR;
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    const maturityValue = roundToDecimal(futureValue);
    const totalInvestment = monthlyAmount * totalMonths;
    const capitalGains = roundToDecimal(maturityValue - totalInvestment);
    console.log(`[ETF_CALC] SIP result: Investment=${totalInvestment}, Maturity=${maturityValue}`);
    return { maturityValue, totalInvestment, capitalGains };
  };

  // Calculate Lumpsum returns
  const calculateLumpsum = () => {
    console.log('[ETF_CALC] Calculating Lumpsum returns');
    const futureValue = lumpsum * Math.pow(1 + returnRate / PERCENTAGE_DIVISOR, years);
    const maturityValue = roundToDecimal(futureValue);
    const totalInvestment = lumpsum;
    const capitalGains = roundToDecimal(maturityValue - totalInvestment);
    console.log(`[ETF_CALC] Lumpsum result: Investment=${totalInvestment}, Maturity=${maturityValue}`);
    return { maturityValue, totalInvestment, capitalGains };
  };

  // Get calculation result based on investment type
  const result = investmentType === INVESTMENT_TYPE_SIP ? calculateSIP() : calculateLumpsum();
  const absoluteReturn = ((result.capitalGains / result.totalInvestment) * PERCENTAGE_DIVISOR).toFixed(DECIMAL_PLACES);

  // Generate chart data with memoization
  const chartData = useMemo(() => {
    console.log('[ETF_CALC] Generating chart data');
    return Array.from({ length: years + 1 }, (_, yearIndex) => {
      if (investmentType === INVESTMENT_TYPE_SIP) {
        const totalMonths = yearIndex * MONTHS_PER_YEAR;
        const monthlyRate = returnRate / MONTHS_PER_YEAR / PERCENTAGE_DIVISOR;
        const futureValue = totalMonths === 0 ? 0 : monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
        return { year: yearIndex, invested: monthlyAmount * totalMonths, value: roundToDecimal(futureValue) };
      } else {
        const futureValue = lumpsum * Math.pow(1 + returnRate / PERCENTAGE_DIVISOR, yearIndex);
        return { year: yearIndex, invested: lumpsum, value: roundToDecimal(futureValue) };
      }
    });
  }, [investmentType, years, monthlyAmount, lumpsum, returnRate]);

  // Event handlers
  const handleInvestmentTypeChange = (type) => {
    console.log(`[ETF_CALC] Investment type changed to: ${type}`);
    setInvestmentType(type);
  };

  const handleExplore = () => {
    console.log('[ETF_CALC] Navigating to ETF products');
    router.push('/products?type=etf');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-gray-100">ETF Returns Calculator</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Calculate ETF investment growth</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input parameters */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6 dark:text-gray-100">Input Parameters</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Investment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={INVESTMENT_TYPE_LUMPSUM}
                      checked={investmentType === INVESTMENT_TYPE_LUMPSUM}
                      onChange={(e) => handleInvestmentTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    Lumpsum
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value={INVESTMENT_TYPE_SIP}
                      checked={investmentType === INVESTMENT_TYPE_SIP}
                      onChange={(e) => handleInvestmentTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    SIP (Monthly)
                  </label>
                </div>
              </div>

              {investmentType === INVESTMENT_TYPE_SIP ? (
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Monthly Investment</label>
                  <input
                    type="range"
                    min={MIN_MONTHLY}
                    max={MAX_MONTHLY}
                    step={MONTHLY_STEP}
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-blue-600 mt-2">₹{monthlyAmount.toLocaleString('en-IN')}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Lumpsum Amount</label>
                  <input
                    type="range"
                    min={MIN_LUMPSUM}
                    max={MAX_LUMPSUM}
                    step={LUMPSUM_STEP}
                    value={lumpsum}
                    onChange={(e) => setLumpsum(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-2xl font-bold text-blue-600 mt-2">₹{lumpsum.toLocaleString('en-IN')}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Expected Return (% p.a.)</label>
                <input
                  type="range"
                  min={MIN_RETURN}
                  max={MAX_RETURN}
                  step={RETURN_STEP}
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-2xl font-bold text-blue-600 mt-2">{returnRate}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Investment Period (Years)</label>
                <input
                  type="range"
                  min={MIN_YEARS}
                  max={MAX_YEARS}
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-2xl font-bold text-blue-600 mt-2">{years} Years</p>
              </div>
            </div>
          </div>

          {/* Results and chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-6 dark:text-gray-100">Results</h2>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="invested" stackId="1" stroke="#94a3b8" fill="#cbd5e1" />
                <Area type="monotone" dataKey="value" stackId="2" stroke="#2563eb" fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Investment:</span>
                <span className="font-bold dark:text-gray-100">₹{result.totalInvestment.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Capital Gains:</span>
                <span className="font-bold text-green-600 dark:text-green-400">₹{result.capitalGains.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between border-t-2 pt-4">
                <span className="text-lg font-bold dark:text-gray-100">Maturity Value:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{result.maturityValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Absolute Return:</span>
                <span className="font-bold dark:text-gray-100">{absoluteReturn}%</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">CAGR:</span>
                <span className="font-bold dark:text-gray-100">{returnRate}%</span>
              </div>
            </div>

            <button
              onClick={handleExplore}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Explore ETFs
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
