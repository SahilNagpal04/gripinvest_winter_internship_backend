import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function About() {
  const router = useRouter();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">About Grip Invest</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Making alternative investments accessible to everyone. We're democratizing wealth creation through innovative fixed-income products.</p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-blue-50 p-8 rounded-2xl">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 text-lg">To democratize alternative investments and provide retail investors access to high-quality, fixed-income products that were previously available only to institutional investors.</p>
          </div>
          <div className="bg-purple-50 p-8 rounded-2xl">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 text-lg">To become India's most trusted platform for alternative investments, empowering millions to achieve their financial goals through smart, secure, and transparent investing.</p>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-8">Our Story</h2>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-gray-700 text-lg mb-4">Founded in 2020, Grip Invest was born from a simple observation: retail investors in India had limited access to high-quality alternative investment products. Traditional investment options like stocks and mutual funds dominated the market, while asset-backed securities and corporate bonds remained out of reach for most.</p>
            <p className="text-gray-700 text-lg mb-4">We set out to change this. By leveraging technology and building strong partnerships with leading financial institutions, we created a platform that brings institutional-grade investments to everyday investors.</p>
            <p className="text-gray-700 text-lg">Today, we're proud to serve over 10,000+ investors and have facilitated investments worth ₹50+ Crores across various asset classes including corporate bonds, fixed deposits, and securitized debt instruments.</p>
          </div>
        </div>

        {/* Key Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Grip by Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <p className="text-blue-100">Active Investors</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">₹50Cr+</div>
              <p className="text-blue-100">Assets Managed</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">12%</div>
              <p className="text-blue-100">Avg. Returns</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-blue-100">Track Record</p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Corporate Bonds</h3>
              <p className="text-gray-600">Invest in high-rated corporate bonds from leading companies with fixed returns of 10-12% per annum.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-2xl font-bold mb-3">Fixed Deposits</h3>
              <p className="text-gray-600">Secure bank FDs with guaranteed returns and DICGC insurance protection up to ₹5 lakhs.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold mb-3">Asset-Backed SDIs</h3>
              <p className="text-gray-600">Securitized debt instruments backed by real assets like leases, loans, and invoices.</p>
            </div>
          </div>
        </div>

        {/* Why Trust Us */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Why Trust Grip Invest?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">SEBI Registered</h3>
                <p className="text-gray-600">We are registered with SEBI as a stock broker (INZ000312836) and comply with all regulatory requirements.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Transparent Operations</h3>
                <p className="text-gray-600">Complete transparency in fees, returns, and risk disclosures. No hidden charges.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
                <p className="text-gray-600">Bank-grade security with encrypted transactions and multi-layer authentication.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Expert Team</h3>
                <p className="text-gray-600">Backed by experienced professionals from finance, technology, and investment sectors.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Info */}
        <div className="bg-gray-50 p-8 rounded-2xl mb-16">
          <h2 className="text-3xl font-bold mb-6">Regulatory Information</h2>
          <div className="space-y-3 text-gray-700">
            <p><span className="font-semibold">Company Name:</span> Grip Broking Private Limited</p>
            <p><span className="font-semibold">CIN:</span> U67120DL2023PTC410290</p>
            <p><span className="font-semibold">SEBI Registration:</span> INZ000312836</p>
            <p><span className="font-semibold">NSE Member Code:</span> 90319</p>
            <p><span className="font-semibold">Registered Office:</span> Flat No. 106, II Floor, New Asiatic Building, H Block, Connaught Place, New Delhi-110001</p>
            <p><span className="font-semibold">Corporate Office:</span> 2nd Floor, OCUS Technopolis Building, Golf Course Rd, Sector 54, Gurugram, Haryana-122002</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Join the Grip Community</h2>
          <p className="text-gray-600 mb-6">Start your investment journey with India's trusted alternative investment platform</p>
          <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Get Started Today
          </button>
        </div>
      </div>
    </Layout>
  );
}
