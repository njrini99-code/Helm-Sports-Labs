import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScoutPulse - Modern Recruiting & Team Tools',
  description: 'A revolution in athlete discovery and recruiting. Connect players and coaches with modern, hyper-personalized tools.',
  keywords: ['baseball', 'recruiting', 'athletes', 'coaches', 'college baseball', 'player discovery'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-slate-700 text-slate-800 dark:text-white',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

