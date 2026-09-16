import { parseAbi } from 'viem';

// BotMultisender contract Human-Readable ABI with viem parseAbi for perfect TS inference
export const BOT_MULTISENDER_ABI = parseAbi([
  'function multisendNative(address[] calldata recipients, uint256[] calldata amounts) external payable',
  'function multisendNativeSameValue(address[] calldata recipients, uint256 amount) external payable',
  'function multisendToken(address token, address[] calldata recipients, uint256[] calldata amounts) external',
  'function multisendTokenSameValue(address token, address[] calldata recipients, uint256 amount) external',
  'event NativeMultisend(address indexed sender, uint256 totalAmount, uint256 recipientCount)',
  'event TokenMultisend(address indexed token, address indexed sender, uint256 totalAmount, uint256 recipientCount)',
]);

// Standard ERC-20 ABI with viem parseAbi
export const ERC20_ABI = parseAbi([
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
]);

// Deployed BotMultisender Contract Address on BOT Chain Mainnet (Chain ID: 677)
export const DEFAULT_MULTISENDER_ADDRESS: `0x${string}` = 
  (process.env.NEXT_PUBLIC_MULTISENDER_ADDRESS as `0x${string}`) || 
  (process.env.NEXT_PUBLIC_MAINNET_MULTISENDER_ADDRESS as `0x${string}`) || 
  '0x5972a42B05a60c4681a361ebC876628EA2fE7766';

export const MULTISENDER_ADDRESSES: Record<number, `0x${string}`> = {
  677: DEFAULT_MULTISENDER_ADDRESS,
};

export function getMultisenderAddress(chainId?: number): `0x${string}` {
  return DEFAULT_MULTISENDER_ADDRESS;
}

