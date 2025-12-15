import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PortfolioHealthScore from '../components/PortfolioHealthScore';
import { isAuthenticated, getUser } from '../utils/auth';
import api from '../utils/api';

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [products, setProducts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setLoggedIn(authenticated);
    if (authenticated) {
      setUser(getUser());
      loadDashboardData();
    } else {
      loadPublicProducts();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      const [portfolioRes, productsRes] = await Promise.all([
        api.get('/investments/portfolio'),
        api.get('/products/recommended/me')
      ]);
      const data = portfolioRes.data.data;
      const totalInvested = parseFloat(data.summary?.total_invested || 0);
      const totalExpectedReturn = parseFloat(data.summary?.total_expected_return || 0);
      const totalGains = parseFloat(data.summary?.total_gains || 0);
      const maturedProfit = parseFloat(data.summary?.total_returns || 0);
      
      setPortfolio({
        totalValue: totalExpectedReturn,
        total_returns: maturedProfit,
        activeInvestments: data.investments?.filter(i => i.status === 'active').length,
        growth: totalInvested > 0 ? `+${((totalGains / totalInvested) * 100).toFixed(1)}%` : '+0%',
        healthScore: data.healthScore
      });
      setProducts(productsRes.data.data.products || []);
      setInvestments(data.investments || []);
      
      // Try to load logs separately
      try {
        const logsRes = await api.get('/logs/me?limit=5');
        setTransactions(logsRes.data.data.logs || []);
      } catch (logErr) {
        console.log('Logs not available');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicProducts = async () => {
    try {
      const res = await api.get('/products?limit=4');
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  }

  return (
    <Layout>
      {loggedIn ? (
        // LOGGED IN DASHBOARD
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.first_name}! 👋</h1>
            <p className="text-gray-600">Here's your investment overview</p>
          </div>

          {/* Portfolio Health Score - Compact */}
          {portfolio?.healthScore && (
            <div className="mb-8">
              <PortfolioHealthScore healthScore={portfolio.healthScore} compact={true} />
            </div>
          )}

          {/* Portfolio Overview Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Portfolio Value</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">₹{parseFloat(portfolio?.totalValue || 0).toLocaleString('en-IN')}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Returns (Matured)</p>
              <h2 className="text-3xl font-bold text-green-600">+₹{parseFloat(portfolio?.total_returns || 0).toLocaleString('en-IN')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Profit from matured investments</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Active Investments</p>
              <h2 className="text-3xl font-bold text-blue-600">{portfolio?.activeInvestments || 0}</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Growth</p>
              <h2 className="text-3xl font-bold text-purple-600">📈 {portfolio?.growth || '+15.2%'}</h2>
            </div>
          </div>

          {/* AI Insights Widget */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 p-3 rounded-lg text-2xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">AI Insights</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{portfolio?.aiInsight || "Your portfolio is well-diversified across multiple asset classes. Consider adding more bonds to reduce overall risk."}</p>
                <button onClick={() => router.push('/products?recommended=true')} className="text-blue-600 font-semibold hover:underline">View Recommendations →</button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button onClick={() => router.push('/products')} className="bg-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-left">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-bold mb-2">New Investment</h3>
              <p className="text-blue-100">Explore opportunities</p>
            </button>
            <button onClick={() => router.push('/portfolio')} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition text-left border-2 border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2 dark:text-gray-100">View Portfolio</h3>
              <p className="text-gray-600 dark:text-gray-400">See all investments</p>
            </button>
            <button onClick={() => router.push('/quiz')} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition text-left border-2 border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold mb-2 dark:text-gray-100">Investment Quiz</h3>
              <p className="text-gray-600 dark:text-gray-400">Discover your style</p>
            </button>
          </div>

          {/* Investment Breakdown */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold mb-4 dark:text-gray-100">Investment Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Fixed Deposits</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full"></span> Mutual Funds</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{width: '35%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Bonds</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: '20%'}}></div></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold mb-4 dark:text-gray-100">Recent Investments</h3>
              <div className="space-y-3">
                {investments.slice(0, 5).map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                    <div>
                      <p className="font-semibold dark:text-gray-100">{inv.product_name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">₹{inv.amount?.toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${inv.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{inv.status}</span>
                  </div>
                ))}
                {investments.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No investments yet</p>}
              </div>
            </div>
          </div>

          {/* AI Recommended Products */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold dark:text-gray-100">🤖 AI Picks for You</h2>
              <button onClick={() => router.push('/products')} className="text-blue-600 hover:underline">View All →</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {products.slice(0, 3).map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border-2 border-blue-100 dark:border-blue-900" onClick={() => router.push(`/products/${product.id}`)}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{product.type}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${product.risk_level === 'Low' ? 'bg-green-100 text-green-800' : product.risk_level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{product.risk_level} Risk</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-gray-100">{product.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">{product.expected_yield}% <span className="text-sm text-gray-600 dark:text-gray-400">p.a.</span></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Min: ₹{product.min_investment?.toLocaleString()}</p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Invest Now</button>
                </div>
              ))}
            </div>
          </div>


        </>
      ) : (
        // NON-LOGGED IN LANDING PAGE
        <>
          {/* Hero Section */}
          <div className="text-center mb-16 py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl">
            <h1 className="text-6xl font-bold mb-6">
              <span className="text-blue-600 dark:text-blue-400">Grow Your Wealth</span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">with Smart Investments</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Start investing in high-return fixed income products with as little as ₹1,000. Secure, regulated, and AI-powered.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg">Sign Up Free</button>
              <button onClick={() => router.push('/products')} className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border-2 border-blue-600 dark:border-blue-400">Explore Products</button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16 shadow-lg">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Active Investors</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">₹50Cr+</div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Assets Managed</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">12%</div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Avg. Returns</p>
              </div>
            </div>
          </div>



          {/* How It Works */}
          <div className="mb-16 bg-gray-50 dark:bg-gray-800 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 dark:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Sign Up</h3>
                <p className="text-gray-600 dark:text-gray-400">Create your free account in under 2 minutes. Complete KYC verification.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 dark:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Choose</h3>
                <p className="text-gray-600 dark:text-gray-400">Browse products or get AI recommendations based on your risk profile.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 dark:bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Invest</h3>
                <p className="text-gray-600 dark:text-gray-400">Start investing with as little as ₹1,000 and watch your wealth grow.</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Why Choose GripInvest?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">AI Recommendations</h3>
                <p className="text-gray-700 dark:text-gray-300">Get personalized investment suggestions based on your risk appetite and financial goals.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">100% Secure</h3>
                <p className="text-gray-700 dark:text-gray-300">Bank-grade security with encrypted transactions and multi-layer authentication protection.</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-xl">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">Diversified Portfolio</h3>
                <p className="text-gray-700 dark:text-gray-300">Invest across bonds, FDs, and mutual funds to minimize risk and maximize returns.</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-16 overflow-hidden">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">Wall of <span className="text-cyan-500">Love</span> @ Grip</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">What our investors say about us</p>
            <style jsx>{`
              @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .scroll-container {
                animation: scroll 30s linear infinite;
              }
            `}</style>
            <div className="flex scroll-container">
              <div className="flex gap-6 min-w-max">
                {[
                  {name: "Aditi Gupta", role: "Senior Associate - Cyril Amarchand", initial: "AG", color: "blue", text: "Participated in Grip's first furniture investment, providing return of 21%, delivered timely in monthly installments. Highly recommended!"},
                  {name: "Aditya Patra", role: "AM Marketing - Digital Growth Hackers", initial: "AP", color: "green", text: "The OG of alternative investment in India! Track record has been 100% till date. Tax free monthly lease income!"},
                  {name: "Ripul Chhabra", role: "MD - Techwink Services", initial: "RC", color: "purple", text: "Great option for people who want to invest their money. Multiple investment options and high returns."},
                  {name: "Anish Malpani", role: "Founder - Ashaya", initial: "AM", color: "orange", text: "I really love how simple it is to make investments through Grip. And they are so transparent - love it!"},
                  {name: "Jeevan Jyoti", role: "OBEE Developer - Oracle", initial: "JJ", color: "red", text: "Simplified and transparent. Alternate solutions than FD and Mutual Funds. Investments backed with assets."},
                  {name: "Sameer Pitalwalla", role: "Head of Gaming, APAC - Google Cloud", initial: "SP", color: "teal", text: "Deeply researched instruments offer great ROI. Seamless interface that's a delight to use and easy to track."}
                ].map((testimonial, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-80">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-${testimonial.color}-600 rounded-full flex items-center justify-center text-white font-bold`}>{testimonial.initial}</div>
                      <div>
                        <p className="font-bold dark:text-gray-100">{testimonial.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{testimonial.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 min-w-max">
                {[
                  {name: "Aditi Gupta", role: "Senior Associate - Cyril Amarchand", initial: "AG", color: "blue", text: "Participated in Grip's first furniture investment, providing return of 21%, delivered timely in monthly installments. Highly recommended!"},
                  {name: "Aditya Patra", role: "AM Marketing - Digital Growth Hackers", initial: "AP", color: "green", text: "The OG of alternative investment in India! Track record has been 100% till date. Tax free monthly lease income!"},
                  {name: "Ripul Chhabra", role: "MD - Techwink Services", initial: "RC", color: "purple", text: "Great option for people who want to invest their money. Multiple investment options and high returns."},
                  {name: "Anish Malpani", role: "Founder - Ashaya", initial: "AM", color: "orange", text: "I really love how simple it is to make investments through Grip. And they are so transparent - love it!"},
                  {name: "Jeevan Jyoti", role: "OBEE Developer - Oracle", initial: "JJ", color: "red", text: "Simplified and transparent. Alternate solutions than FD and Mutual Funds. Investments backed with assets."},
                  {name: "Sameer Pitalwalla", role: "Head of Gaming, APAC - Google Cloud", initial: "SP", color: "teal", text: "Deeply researched instruments offer great ROI. Seamless interface that's a delight to use and easy to track."}
                ].map((testimonial, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-md w-80">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-${testimonial.color}-600 rounded-full flex items-center justify-center text-white font-bold`}>{testimonial.initial}</div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{testimonial.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Big CTA at Bottom */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16 text-white">
            <h2 className="text-5xl font-bold mb-6">Start Investing Today</h2>
            <p className="text-xl mb-8 opacity-90">Join 10,000+ investors already growing their wealth with GripInvest</p>
            <button onClick={() => router.push('/signup')} className="bg-white text-blue-600 px-12 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition shadow-xl">Create Free Account</button>
          </div>
        </>
      )}
    </Layout>
  );
}
