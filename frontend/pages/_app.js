// Main App component - wraps all pages
import '../styles/globals.css'

// This component wraps every page in the application
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
