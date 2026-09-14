export type RowStatus =
  | 'empty'
  | 'valid'
  | 'invalid-address'
  | 'invalid-amount'
  | 'duplicate'
  | 'exceeds-balance';

export interface RecipientRowItem {
  id: string;
  address: string;
  amount: string;
  status: RowStatus;
  errorMsg?: string;
  amountWei?: bigint;
}

export interface TokenOption {
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  address?: `0x${string}`;
  balance: string;
  balanceRaw: bigint;
}

export interface DistributionSummaryData {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  totalAmountWei: bigint;
  totalAmountFormatted: string;
  batchCount: number;
  isSufficientBalance: boolean;
  estimatedGasFee: string;
  isGasEstimating: boolean;
  gasEstimationError?: string;
}

export interface TxRecord {
  hash: `0x${string}`;
  timestamp: number;
  recipientCount: number;
  totalAmount: string;
  tokenSymbol: string;
  tokenAddress?: string;
  status: 'pending' | 'success' | 'reverted';
  blockNumber?: number;
  gasUsed?: string;
}
