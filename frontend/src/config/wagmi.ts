import { http } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botchain } from './chains';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

export const networks = [botchain];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
  transports: {
    [botchain.id]: http('https://rpc.botchain.ai'),
  },
});

export const config = wagmiAdapter.wagmiConfig;

