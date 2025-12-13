// Custom Document component - defines HTML structure
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add custom fonts or meta tags here */}
      </Head>
      <body>
        {/* Main app content */}
        <Main />
        {/* Next.js scripts */}
        <NextScript />
      </body>
    </Html>
  )
}
