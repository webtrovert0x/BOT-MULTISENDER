'use client';

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, type State } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { botchainTestnet } from '@/config/chains';
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
  name: 'Botchain Multisender',
  description: 'Effortlessly batch send Native BOT and ERC-20 tokens on Botchain Testnet',
  url: 'https://botchain-multisender.local',
  icons: ['https://scan.bohr.life/favicon.ico'],
};

// Initialize AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [botchainTestnet],
  defaultNetwork: botchainTestnet,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366f1',
    '--w3m-border-radius-master': '12px',
    '--w3m-color-mix': '#0f172a',
    '--w3m-color-mix-strength': 40,
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
