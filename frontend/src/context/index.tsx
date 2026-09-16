'use client';

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, type State } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { botchain } from '@/config/chains';
import { wagmiAdapter, projectId, networks } from '@/config/wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Set up metadata
const metadata = {
  name: 'BOT Chain Multisender',
  description: 'Effortlessly batch send Native BOT and ERC-20 tokens on BOT Chain Mainnet',
  url: 'https://scan.botchain.ai',
  icons: ['https://scan.botchain.ai/favicon.ico'],
};

// Initialize AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [botchain],
  defaultNetwork: botchain,
  metadata,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#1B4ED8',
    '--w3m-border-radius-master': '10px',
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
});

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies?: string | null;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
