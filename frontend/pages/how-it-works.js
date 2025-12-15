import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function HowItWorks() {
  const router = useRouter();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">How Grip Invest Works</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Your journey to smarter investing in 4 simple steps</p>
        </div>

        {/* Steps */}
        <div className="space-y-16 mb-16">
          {/* Step 1 */}
          <div className="flex gap-8 items-center">
            <div className="flex-shrink-0 w-20 h-20 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">1</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Sign Up & Complete KYC</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">Create your account in under 2 minutes. Complete a simple KYC process with your PAN card and Aadhaar. Get verified instantly and start your investment journey.</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Email verification with OTP</li>
                <li>PAN & Aadhaar verification</li>
                <li>Bank account linking</li>
                <li>Risk profile assessment</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-8 items-center">
            <div className="flex-shrink-0 w-20 h-20 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">2</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Browse Investment Options</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">Explore curated investment products across bonds, fixed deposits, mutual funds, and ETFs. Get AI-powered recommendations based on your risk appetite.</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-bold mb-2 dark:text-gray-100">📊 Corporate Bonds</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">10-12% returns, Low-Moderate risk</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-bold mb-2 dark:text-gray-100">🏦 Fixed Deposits</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">8-9% returns, Very Low risk</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-bold mb-2 dark:text-gray-100">📈 Mutual Funds</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">11-13% returns, Moderate-High risk</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-bold mb-2 dark:text-gray-100">💹 ETFs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">8-12% returns, Moderate risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-8 items-center">
            <div className="flex-shrink-0 w-20 h-20 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">3</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Invest with Confidence</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">Choose your investment amount, review the details, and invest securely. Start with as little as ₹1,000. Track your investments in real-time.</p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-3 dark:text-gray-100">🔒 Your Investment is Secure</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✓ SEBI registered platform</li>
                  <li>✓ Bank-grade encryption</li>
                  <li>✓ Secure payment gateway</li>
                  <li>✓ Regular audits & compliance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-8 items-center">
            <div className="flex-shrink-0 w-20 h-20 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">4</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Track & Earn Returns</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">Monitor your portfolio performance with detailed analytics. Receive interest payouts as per the investment terms. Reinvest or withdraw anytime.</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="font-bold dark:text-gray-100">Real-time Tracking</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="font-bold dark:text-gray-100">Regular Payouts</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-3xl mb-2">📈</div>
                  <p className="font-bold dark:text-gray-100">Growth Reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Grip */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-center mb-8">Why Choose Grip Invest?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Curated Products</h3>
              <p className="text-blue-100">Handpicked investment options vetted by experts</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Recommendations</h3>
              <p className="text-blue-100">Personalized suggestions based on your goals</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
              <p className="text-blue-100">Simple interface for seamless investing</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Ready to Start Investing?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Join thousands of investors growing their wealth with Grip Invest</p>
          <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Get Started Now
          </button>
        </div>
      </div>
    </Layout>
  );
}
