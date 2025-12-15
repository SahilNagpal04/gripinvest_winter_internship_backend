// Product Detail Page - view single product and invest
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { productsAPI, investmentsAPI } from '../../utils/api';
import { formatCurrency, getRiskColor, getInvestmentTypeLabel, isAuthenticated, getUser } from '../../utils/auth';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  // Product state
  const [product, setProduct] = useState(null);
  // Investment amount state
  const [amount, setAmount] = useState('');
  // Loading states
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  // Error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load product on mount
  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  // Fetch product details
  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data.data.product);
    } catch (err) {
      setError('Failed to load product details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle investment
  const handleInvest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if logged in
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Validate amount
    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount < product.min_investment) {
      setError(`Minimum investment is ${formatCurrency(product.min_investment)}`);
      return;
    }

    if (product.max_investment && investAmount > product.max_investment) {
      setError(`Maximum investment is ${formatCurrency(product.max_investment)}`);
      return;
    }

    setInvesting(true);

    try {
      // Create investment
      await investmentsAPI.create({
        product_id: id,
        amount: investAmount,
      });

      setSuccess('Investment successful! Redirecting to portfolio...');
      setTimeout(() => {
        router.push('/portfolio');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  // Calculate expected returns
  const calculateReturns = () => {
    if (!amount || !product) return 0;
    const investAmount = parseFloat(amount);
    if (isNaN(investAmount)) return 0;
    
    const years = product.tenure_months / 12;
    const returns = investAmount * (product.annual_yield / 100) * years;
    return returns;
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

  // Show error if product not found
  if (!product) {
    return (
      <Layout>
        <div className="card text-center">
          <p className="text-gray-600">Product not found</p>
          <button onClick={() => router.push('/products')} className="btn btn-primary mt-4">
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Product details card */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{getInvestmentTypeLabel(product.investment_type)}</p>
            </div>
            <span className={`px-3 py-1 rounded font-medium ${getRiskColor(product.risk_level)}`}>
              {product.risk_level} risk
            </span>
          </div>

          {/* Product description */}
          <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>

          {/* Product stats grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Yield</p>
              <p className="text-2xl font-bold text-green-600">{product.annual_yield}%</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tenure</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{product.tenure_months}m</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Investment</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(product.min_investment)}</p>
            </div>
            {product.max_investment && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Investment</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(product.max_investment)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Investment form */}
        {isAuthenticated() && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Invest Now</h2>

            {/* Success message */}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleInvest} className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Investment Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                  placeholder={`Min: ${formatCurrency(product.min_investment)}`}
                  min={product.min_investment}
                  max={product.max_investment || undefined}
                  required
                />
              </div>

              {/* Expected returns */}
              {amount && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Investment Amount:</span>
                    <span className="font-bold dark:text-gray-100">{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Expected Returns:</span>
                    <span className="font-bold text-green-600">
                      +{formatCurrency(calculateReturns())}
                    </span>
                  </div>
                  <div className="flex justify-between border-t dark:border-gray-600 pt-2">
                    <span className="text-gray-900 dark:text-gray-100 font-medium">Maturity Value:</span>
                    <span className="font-bold text-lg dark:text-gray-100">
                      {formatCurrency((parseFloat(amount) || 0) + calculateReturns())}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={investing}
                className="w-full btn btn-primary"
              >
                {investing ? 'Processing...' : 'Invest Now'}
              </button>
            </form>
          </div>
        )}

        {/* Login prompt for guests */}
        {!isAuthenticated() && (
          <div className="card text-center bg-blue-50 dark:bg-blue-900/20">
            <p className="text-gray-700 dark:text-gray-300 mb-4">Please login to invest in this product</p>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-primary"
            >
              Login to Invest
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
