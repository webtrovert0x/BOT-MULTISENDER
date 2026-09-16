/**
 * Format an Ethereum address into 0x1234...5678
 */
export function shortenAddress(address?: string | null, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format a number/balance string with nice comma separators and decimals
 */
export function formatBalance(val?: string | number | null, maxDecimals: number = 4): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '0';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Explorer link helpers for BOT Chain (BotScan)
 */
export function getExplorerTxUrl(txHash: string): string {
  return `https://scan.botchain.ai/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://scan.botchain.ai/address/${address}`;
}

