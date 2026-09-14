import type { Metadata } from 'next';
import './globals.css';
import ContextProvider from '@/context';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'BOT Multisender | BOT Chain Token Distribution',
  description: 'Desktop-first Web3 infrastructure tool for distributing Native BOT and ERC-20 tokens on BOT Chain in single batch transactions.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get('cookie');

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ContextProvider cookies={cookies}>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
