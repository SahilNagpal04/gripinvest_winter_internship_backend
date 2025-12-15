// Layout component - provides consistent header/footer across pages
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser, isAuthenticated, logout } from '../utils/auth';
import NotificationBell from './NotificationBell';

// Constants
const SCROLL_THRESHOLD = 300;
const MENU_CLOSE_DELAY = 300;

export default function Layout({ children }) {
  const router = useRouter();
  
  // State management
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileMenuTimeout, setProfileMenuTimeout] = useState(null);
  const [showCalculatorsMenu, setShowCalculatorsMenu] = useState(false);
  const [calculatorsMenuTimeout, setCalculatorsMenuTimeout] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize user and scroll listener
  useEffect(() => {
    if (isAuthenticated()) {
      console.log('[LAYOUT] Initializing authenticated user');
      setUser(getUser());
      loadNotifications();
    }
    
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (profileMenuTimeout) clearTimeout(profileMenuTimeout);
      if (calculatorsMenuTimeout) clearTimeout(calculatorsMenuTimeout);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowProfileMenu(false);
    };
    if (showNotifications || showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications, showProfileMenu]);

  // Fetch matured investment notifications
  const loadNotifications = async () => {
    console.log('[LAYOUT] Loading notifications');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/investments/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load notifications');
      const data = await response.json();
      if (data.status === 'success') {
        setNotifications(data.data.notifications);
        console.log(`[LAYOUT] Loaded ${data.data.notifications.length} notifications`);
      }
    } catch (err) {
      console.error('[LAYOUT] Failed to load notifications:', err);
    }
  };

  // Logout handler
  const handleLogout = () => {
    console.log('[LAYOUT] User logging out');
    logout();
    console.log('[LAYOUT] Logout completed');
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-3xl font-bold text-primary dark:text-blue-400 cursor-pointer"
              >
                Grip Invest
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Authenticated user menu */}
                  <button onClick={() => router.push('/products')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">Products</button>
                  <button onClick={() => router.push('/portfolio')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">Portfolio</button>
                  <button onClick={() => router.push('/history')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">Investments</button>
                  <div className="relative" onMouseEnter={() => {
                    if (calculatorsMenuTimeout) clearTimeout(calculatorsMenuTimeout);
                    setShowCalculatorsMenu(true);
                  }} onMouseLeave={() => {
                    const timeout = setTimeout(() => setShowCalculatorsMenu(false), MENU_CLOSE_DELAY);
                    setCalculatorsMenuTimeout(timeout);
                  }}>
                    <button className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold flex items-center gap-1">
                      Calculators
                      <span className={`text-xs transition-transform inline-block ${showCalculatorsMenu ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {showCalculatorsMenu && (
                      <div onMouseEnter={() => {
                        if (calculatorsMenuTimeout) clearTimeout(calculatorsMenuTimeout);
                        setShowCalculatorsMenu(true);
                      }} onMouseLeave={() => {
                        const timeout = setTimeout(() => setShowCalculatorsMenu(false), MENU_CLOSE_DELAY);
                        setCalculatorsMenuTimeout(timeout);
                      }} className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                        <button onClick={() => router.push('/calculators/bond')} className="block w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold">Bond Calculator</button>
                        <button onClick={() => router.push('/calculators/etf')} className="block w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold">ETF Calculator</button>
                      </div>
                    )}
                  </div>
                  <NotificationBell />
                  <div className="relative" onMouseEnter={() => {
                    if (profileMenuTimeout) clearTimeout(profileMenuTimeout);
                    setShowProfileMenu(true);
                  }} onMouseLeave={() => {
                    const timeout = setTimeout(() => setShowProfileMenu(false), MENU_CLOSE_DELAY);
                    setProfileMenuTimeout(timeout);
                  }}>
                    <button className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 flex items-center gap-1">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                        <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className={`text-lg font-bold transition-transform inline-block ${showProfileMenu ? 'rotate-180' : ''}`}>^</span>
                    </button>
                    {showProfileMenu && (
                      <div onMouseEnter={() => {
                        if (profileMenuTimeout) clearTimeout(profileMenuTimeout);
                        setShowProfileMenu(true);
                      }} onMouseLeave={() => {
                        const timeout = setTimeout(() => setShowProfileMenu(false), MENU_CLOSE_DELAY);
                        setProfileMenuTimeout(timeout);
                      }} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                        <button onClick={() => router.push('/profile')} className="block w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold">My Profile</button>
                        <button onClick={() => router.push('/transactions')} className="block w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold">Transaction History</button>
                        <button onClick={() => router.push('/logs')} className="block w-full text-left px-4 py-3 hover:bg-gray-100 font-semibold">Activity Logs</button>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600 font-semibold">Logout</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Guest menu */}
                  <button onClick={() => router.push('/')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">Home</button>
                  <button onClick={() => router.push('/products')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">Products</button>
                  <button onClick={() => router.push('/how-it-works')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">How It Works</button>
                  <button onClick={() => router.push('/about')} className="text-gray-700 dark:text-gray-300 hover:text-primary px-3 py-2 font-semibold">About</button>
                  <button onClick={() => router.push('/login')} className="text-blue-600 hover:text-blue-800 font-bold border border-blue-600 hover:border-blue-800 px-3 py-2 rounded transition">Login</button>
                  <button onClick={() => router.push('/signup')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Sign Up</button>
                </>
              )}
            </div>

            {/* Dark Mode Toggle - Rightmost */}
            <div className="flex items-center">
              <button onClick={toggleDarkMode} className="relative w-14 h-7 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors">
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform flex items-center justify-center ${darkMode ? 'translate-x-7' : ''}`}>
                  <span className="text-sm">{darkMode ? '🌙' : '☀️'}</span>
                </div>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-primary dark:text-gray-300"
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
                    onClick={() => { router.push('/'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Home
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:text-gray-100">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-xs text-gray-600 space-y-3">
            <p>
              <span className="font-semibold">Grip Broking Private Limited</span> (U67120DL2023PTC410290), Member of NSE- SEBI Registration No.: <span className="font-semibold">INZ000312836</span>, NSE Member Code: <span className="font-semibold">90319</span>
            </p>
            <p>Registered Office: Flat No. 106, II Floor, New Asiatic Building, H Block, Connaught Place, New Delhi-110001</p>
            <p>Corporate Office: 2nd Floor, OCUS Technopolis Building, Golf Course Rd, Sector 54, Gurugram, Gurgaon-122002, Haryana</p>
            <p>Compliance Officer: Ms. Jyotsna; Contact No: +91 93555 90389; Email id: complianceofficer@gripinvest.in</p>
            <p className="font-semibold">Investments in debt securities/municipal debt securities/securitised debt instruments are subject to risks including delay and/or default in payment. Read all the offer related document carefully.</p>
            
            <p className="mt-4">Procedure to file a complaint on SEBI SCORES- (i) Register on SCORES portal (ii) Mandatory details for filing complaints on SCORES: Name, PAN, Address, Mobile Number, E-mail ID (iii) Benefits: Effective communication, Speedy redressal of the grievances</p>
            
            <p>i. Prevent Unauthorised transactions in your account → Update your mobile numbers/email IDs with your Stock Brokers. Receive information of your transactions directly from Exchange on your mobile/email at the end of the day. Prevent Unauthorized Transactions in your demat account Update your Mobile Number with your Depository Participant. Receive alerts on your Registered Mobile for all debit and other important transactions in your demat account directly from NSDL/CDSL on the same day.</p>
            
            <p>ii. There is no need to issue a cheque. Please write the Bank account number and sign the IPO application form to authorize your bank to make payment in case of allotment. In case of non allotment the funds will remain in your bank account. Issued in the Interest of Investor. Investments in securities market are subject to market risks; read all the related documents carefully before investing.</p>
            
            <p>iii. KYC is one time exercise while dealing in securities markets - once KYC is done through a SEBI registered intermediary (broker, DP etc.), you need not undergo the same process again when you approach another intermediary.</p>
            
            <p>iv. Investor awareness on fraudsters that are collecting data of customers who are already into trading on Exchanges and sending them bulk messages on the pretext of providing investment tips and luring them to invest with them in their bogus firms by promising huge profits.</p>
            
            <p>v. Advisory for investors - Clients/investors to abstain them from dealing in any schemes of unauthorised collective investments/portfolio management, indicative/ guaranteed/fixed returns / payments etc.</p>
            
            <p className="mt-4">Fixed Deposits are not exchange traded products and Grip is merely a distributor of Fixed Deposits.</p>
            
            <p className="mt-4 font-semibold">Attention Investors:</p>
            <p>1. Stock Brokers can accept securities as margin from clients only by way of pledge in the depository system w.e.f. September 01, 2020.</p>
            <p>2. Update your email id and mobile number with your stock broker / depository participant and receive OTP directly from the depository on your email id and/or mobile number to create a pledge.</p>
            <p>3. Check your securities/bonds in the consolidated account statement issued by NSDL/CDSL every month. .......... Issued in the interest of Investors</p>
            <p>SEBI: https://www.sebi.gov.in | NSDL: https://nsdl.co.in | CDSL: https://www.cdslindia.com | NSE: https://www.nseindia.com | BSE: https://www.bseindia.com | SMART ODR PORTAL: https://smartodr.in/login | SCORES 2.0: https://scores.sebi.gov.in | Sitemap</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-300 flex flex-wrap justify-between items-center text-sm">
            <div className="flex space-x-6 text-blue-600">
              <a href="https://www.gripinvest.in/legal#termsAndConditions" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms & Conditions</a>
              <a href="https://www.gripinvest.in/legal#privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policies</a>
              <a href="https://www.gripinvest.in/legal#investorCorner" target="_blank" rel="noopener noreferrer" className="hover:underline">Investor Corner</a>
              <a href="https://www.gripinvest.in/legal#contactUs" target="_blank" rel="noopener noreferrer" className="hover:underline">Contact Us</a>
            </div>
            <p className="text-gray-600 mt-4 md:mt-0">Made with love in India | Copyright © 2025, Grip</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-white border-2 border-gray-300 p-4 rounded-full shadow-lg hover:border-blue-600 transition-all z-50 flex flex-col items-center justify-center"
          aria-label="Scroll to top"
        >
          <span className="text-blue-600 text-lg">^</span>
          <span className="text-blue-600 text-xs font-semibold">Top</span>
        </button>
      )}
    </div>
  );
}
