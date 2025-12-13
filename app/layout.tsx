import './globals.css';
import type { Metadata } from 'next';
import { ClientProviders } from './client-providers';

export const metadata: Metadata = {
  title: {
    default: 'Helm Sports Labs - Modern Sports Recruiting',
    template: '%s | Helm Sports Labs',
  },
  description: 'A revolution in athlete discovery and recruiting. Connect players and coaches with modern, hyper-personalized tools.',
  keywords: ['baseball', 'golf', 'recruiting', 'athletes', 'coaches', 'college sports', 'player discovery', 'showcase', 'JUCO', 'high school sports'],
  authors: [{ name: 'Helm Sports Labs' }],
  creator: 'Helm Sports Labs',
  publisher: 'Helm Sports Labs',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://helmsportslabs.com'),

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Helm Sports Labs',
    title: 'Helm Sports Labs - Modern Sports Recruiting',
    description: 'A revolution in athlete discovery and recruiting. Connect players and coaches with modern, hyper-personalized tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Helm Sports Labs - Modern Sports Recruiting Platform',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Helm Sports Labs - Modern Sports Recruiting',
    description: 'A revolution in athlete discovery and recruiting. Connect players and coaches with modern, hyper-personalized tools.',
    images: ['/og-image.png'],
    creator: '@helmsportslabs',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/manifest.json',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

