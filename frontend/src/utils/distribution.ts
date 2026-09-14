import { isAddress, parseUnits, formatUnits } from 'viem';
import type { RecipientRowItem, TokenOption, DistributionSummaryData, RowStatus } from '@/types';

export const MAX_RECIPIENTS_PER_BATCH = 200;

/**
 * Validate and calculate statuses for all table rows dynamically against token balance.
 */
export function validateRecipientRows(
  rows: RecipientRowItem[],
  token: TokenOption | null
): {
  processedRows: RecipientRowItem[];
  summary: DistributionSummaryData;
} {
  const decimals = token?.decimals ?? 18;
  const tokenBalanceRaw = token?.balanceRaw ?? 0n;

  const seenAddresses = new Set<string>();
  let totalAmountWei = 0n;
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;

  const processedRows: RecipientRowItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const cleanAddr = raw.address.trim();
    const cleanAmount = raw.amount.trim();

    // If completely empty row
    if (!cleanAddr && !cleanAmount) {
      processedRows.push({
        ...raw,
        status: 'empty',
        errorMsg: undefined,
        amountWei: 0n,
      });
      continue;
    }

    // Validate Address
    if (!isAddress(cleanAddr)) {
      invalidCount++;
      processedRows.push({
        ...raw,
        status: 'invalid-address',
        errorMsg: cleanAddr ? 'Invalid EVM address format' : 'Address is required',
        amountWei: 0n,
      });
      continue;
    }

    // Check Duplicates
    const lowerAddr = cleanAddr.toLowerCase();
    const isDuplicate = seenAddresses.has(lowerAddr);
    seenAddresses.add(lowerAddr);

    // Validate Amount
    if (!cleanAmount || isNaN(Number(cleanAmount)) || Number(cleanAmount) <= 0) {
      invalidCount++;
      processedRows.push({
        ...raw,
        status: 'invalid-amount',
        errorMsg: 'Amount must be a positive number',
        amountWei: 0n,
      });
      continue;
    }

    let amountWei = 0n;
    try {
      amountWei = parseUnits(cleanAmount, decimals);
    } catch {
      invalidCount++;
      processedRows.push({
        ...raw,
        status: 'invalid-amount',
        errorMsg: `Exceeds token precision (${decimals} decimals)`,
        amountWei: 0n,
      });
      continue;
    }

    if (isDuplicate) {
      duplicateCount++;
      processedRows.push({
        ...raw,
        status: 'duplicate',
        errorMsg: 'Duplicate recipient address',
        amountWei,
      });
      // We still include in total sum if valid amount
      totalAmountWei += amountWei;
      continue;
    }

    // Check running balance
    const nextTotal = totalAmountWei + amountWei;
    if (token && nextTotal > tokenBalanceRaw) {
      totalAmountWei += amountWei;
      validCount++;
      processedRows.push({
        ...raw,
        status: 'exceeds-balance',
        errorMsg: 'Cumulative amount exceeds available balance',
        amountWei,
      });
      continue;
    }

    // Row is completely valid
    totalAmountWei += amountWei;
    validCount++;
    processedRows.push({
      ...raw,
      status: 'valid',
      errorMsg: undefined,
      amountWei,
    });
  }

  const batchCount = validCount > 0 ? Math.ceil(validCount / MAX_RECIPIENTS_PER_BATCH) : 0;
  const isSufficientBalance = !token || tokenBalanceRaw >= totalAmountWei;

  return {
    processedRows,
    summary: {
      validCount,
      invalidCount,
      duplicateCount,
      totalAmountWei,
      totalAmountFormatted: formatUnits(totalAmountWei, decimals),
      batchCount,
      isSufficientBalance,
      estimatedGasFee: '0',
      isGasEstimating: false,
    },
  };
}

/**
 * Parse CSV / TXT text into RecipientRowItems without silently dropping bad rows.
 */
export function parseCSVToRows(fileContent: string): {
  rows: RecipientRowItem[];
  totalParsed: number;
} {
  const lines = fileContent.split(/\r?\n/);
  const rows: RecipientRowItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('#')) continue;

    // Skip header line if detected
    if (
      i === 0 &&
      (rawLine.toLowerCase().includes('address') ||
        rawLine.toLowerCase().includes('recipient') ||
        rawLine.toLowerCase().includes('amount') ||
        rawLine.toLowerCase().includes('value'))
    ) {
      continue;
    }

    const tokens = rawLine.split(/[,;\t\s]+/).filter(Boolean);
    const address = tokens[0] || '';
    const amount = tokens[1] || '';

    rows.push({
      id: `row_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      address,
      amount,
      status: 'empty',
    });
  }

  return {
    rows,
    totalParsed: rows.length,
  };
}
