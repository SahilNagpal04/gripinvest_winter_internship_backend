// Products Page - browse and filter investment products
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { productsAPI } from '../utils/api';
import { formatCurrency, getRiskColor, getInvestmentTypeLabel, isAuthenticated } from '../utils/auth';

export default function Products() {
  const router = useRouter();
  // Products list state
  const [products, setProducts] = useState([]);
  // Recommended products state
  const [recommended, setRecommended] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Filter states
  const [filters, setFilters] = useState({
    investment_type: '',
    risk_level: '',
    search: '',
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
    if (isAuthenticated()) {
      loadRecommended();
    }
  }, []);

  // Fetch all products
  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll(filters);
      setProducts(response.data.data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended products
  const loadRecommended = async () => {
    try {
      const response = await productsAPI.getRecommended();
      setRecommended(response.data.data.products);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters
  const applyFilters = () => {
    setLoading(true);
    loadProducts();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      investment_type: '',
      risk_level: '',
      search: '',
    });
    setLoading(true);
    loadProducts();
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.investment_type || product.investment_type === filters.investment_type;
    const matchesRisk = !filters.risk_level || product.risk_level === filters.risk_level;
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Products</h1>
          <p className="text-gray-600 mt-1">Explore our diverse range of investment options</p>
        </div>

        {/* AI Recommended Products */}
        {recommended.length > 0 && (
          <div className="card bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recommended.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      {product.annual_yield}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(product.risk_level)}`}>
                      {product.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search products..."
              className="input"
            />

            {/* Investment Type Filter */}
            <select
              name="investment_type"
              value={filters.investment_type}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Types</option>
              <option value="bond">Bonds</option>
              <option value="fd">Fixed Deposits</option>
              <option value="mf">Mutual Funds</option>
              <option value="etf">ETFs</option>
            </select>

            {/* Risk Level Filter */}
            <select
              name="risk_level"
              value={filters.risk_level}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                {/* Product header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(product.risk_level)}`}>
                    {product.risk_level}
                  </span>
                </div>

                {/* Product type */}
                <p className="text-sm text-gray-600 mb-3">
                  {getInvestmentTypeLabel(product.investment_type)}
                </p>

                {/* Product details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Annual Yield:</span>
                    <span className="font-bold text-green-600">{product.annual_yield}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tenure:</span>
                    <span className="font-medium">{product.tenure_months} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Min Investment:</span>
                    <span className="font-medium">{formatCurrency(product.min_investment)}</span>
                  </div>
                </div>

                {/* View details button */}
                <button className="w-full btn btn-primary">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
