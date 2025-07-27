import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Geist } from 'next/font/google';

import { Toaster } from 'sonner';

import { DatabaseInitializer } from '@/components/database-initializer';

import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'MoneyShift AI 세무 서비스 by Codeshift',
  description: 'AI 기반 4계층 방어 아키텍처로 구축된 차세대 세무 처리 시스템',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute='class'
          // defaultTheme="light"\
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <DatabaseInitializer>{children}</DatabaseInitializer>
          <Toaster position='top-right' expand={true} richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
