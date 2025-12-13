// Landing Page - first page users see
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { isAuthenticated } from '../utils/auth';

export default function Home() {
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Grip Invest
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your trusted platform for smart investments. Explore bonds, fixed deposits, 
          mutual funds, and ETFs tailored to your risk appetite.
        </p>
        
        {/* Call to action buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/signup')}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 text-lg px-8 py-3"
          >
            Login
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        {/* Feature 1 */}
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Diverse Products</h3>
          <p className="text-gray-600">
            Choose from bonds, FDs, mutual funds, and ETFs
          </p>
        </div>

        {/* Feature 2 */}
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Recommendations</h3>
          <p className="text-gray-600">
            Get personalized investment suggestions based on your profile
          </p>
        </div>

        {/* Feature 3 */}
        <div className="card text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">Track Returns</h3>
          <p className="text-gray-600">
            Monitor your portfolio performance with detailed insights
          </p>
        </div>
      </div>

      {/* How it works section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold mb-2">Sign Up</h4>
            <p className="text-gray-600 text-sm">Create your account in minutes</p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold mb-2">Browse Products</h4>
            <p className="text-gray-600 text-sm">Explore investment options</p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold mb-2">Invest</h4>
            <p className="text-gray-600 text-sm">Start investing with ease</p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold mb-2">Track Growth</h4>
            <p className="text-gray-600 text-sm">Monitor your returns</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
