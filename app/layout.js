import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'MOAI - Artist Collaboration Platform',
  description: 'A platform for artists to collaborate, share projects, and discover creative toolkits',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
