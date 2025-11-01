import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import Script from 'next/script'

export const metadata = {
  title: 'MOAI - Artist Collaboration Platform',
  description: 'A platform for artists to collaborate, share projects, and discover creative toolkits',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Google Maps API for location autocomplete */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
