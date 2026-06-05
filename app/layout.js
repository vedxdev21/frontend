import './globals.css'
import { Toaster } from 'react-hot-toast'
import ReduxProvider from '@/lib/redux/provider'
import { AuthProvider } from '@/context/AuthContext'
import GoogleAuthProvider from '@/components/GoogleAuthProvider'
import fs from 'fs'
import path from 'path'

export const metadata = {
  title: 'fyndkro — Find Room, Mess & Cook Near You',
  description: 'India\'s #1 all-in-one platform for rooms, roommates, mess, and cooks. 100% broker-free. Zero brokerage, direct owner contact.',
  keywords: 'rooms, roommate, PG, hostel, mess, tiffin, cook, bhopal, indore, broker-free, rental',
  openGraph: {
    title: 'fyndkro — Find Room, Mess & Cook Near You',
    description: 'India\'s first all-in-one platform for rooms, roommates, mess, and cooks. 100% broker-free.',
    type: 'website',
    siteName: 'fyndkro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'fyndkro — Find Room, Mess & Cook Near You',
    description: 'India\'s first all-in-one platform for rooms, roommates, mess, and cooks.',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const getGoogleClientId = () => {
  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (process.env.GOOGLE_CLIENT_ID) return process.env.GOOGLE_CLIENT_ID

  const backendEnvPath = path.join(process.cwd(), '..', 'masterX_backend', '.env')
  if (!fs.existsSync(backendEnvPath)) return ''

  const envFile = fs.readFileSync(backendEnvPath, 'utf8')
  const match = envFile.match(/^GOOGLE_CLIENT_ID=(.+)$/m)
  return match ? match[1].trim() : ''
}

export default function RootLayout({ children }) {
  const googleClientId = getGoogleClientId()
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="min-h-screen antialiased text-foreground">
        <GoogleAuthProvider clientId={googleClientId}>
          <ReduxProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-center" toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
                success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }} />
            </AuthProvider>
          </ReduxProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  )
}
