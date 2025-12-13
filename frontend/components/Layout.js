// Layout component - provides consistent header/footer across pages
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser, isAuthenticated, logout } from '../utils/auth';

export default function Layout({ children }) {
  const router = useRouter();
  // State to store current user
  const [user, setUser] = useState(null);
  // State to control mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-primary cursor-pointer"
              >
                Grip Invest
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Logged in user menu */}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-700 hover:text-primary px-3 py-2"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/products')}
                    className="text-gray-700 hover:text-primary px-3 py-2"
                  >
                    Products
                  </button>
                  <button
                    onClick={() => router.push('/portfolio')}
                    className="text-gray-700 hover:text-primary px-3 py-2"
                  >
                    Portfolio
                  </button>
                  <button
                    onClick={() => router.push('/logs')}
                    className="text-gray-700 hover:text-primary px-3 py-2"
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="text-gray-700 hover:text-primary px-3 py-2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Guest user menu */}
                  <button
                    onClick={() => router.push('/login')}
                    className="btn btn-primary"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="btn btn-secondary"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-primary"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <button
                    onClick={() => { router.push('/dashboard'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { router.push('/products'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Products
                  </button>
                  <button
                    onClick={() => { router.push('/portfolio'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Portfolio
                  </button>
                  <button
                    onClick={() => { router.push('/logs'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logs
                  </button>
                  <button
                    onClick={() => { router.push('/profile'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { router.push('/signup'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © 2025 Grip Invest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
