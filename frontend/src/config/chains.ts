import { defineChain } from 'viem';

export const botchain = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BotScan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
});

// Alias for backwards compatibility
export const botchainMainnet = botchain;

