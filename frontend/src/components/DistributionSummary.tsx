'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { BOT_MULTISENDER_ABI, DEFAULT_MULTISENDER_ADDRESS } from '@/config/contracts';
import { botchain } from '@/config/chains';
import { formatBalance } from '@/utils/formatters';
import type { TokenOption, DistributionSummaryData, RecipientRowItem } from '@/types';
import { ArrowRight, Loader2, Info } from 'lucide-react';

interface DistributionSummaryProps {
  summary: DistributionSummaryData;
  token: TokenOption | null;
  validRows: RecipientRowItem[];
  multisenderAddress: string;
  onReviewClick: () => void;
}

export default function DistributionSummary({
  summary,
  token,
  validRows,
  multisenderAddress,
  onReviewClick,
}: DistributionSummaryProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [gasLoading, setGasLoading] = useState(false);
  const [gasError, setGasError] = useState<string | null>(null);

  const isCorrectChain = isConnected && chainId === botchain.id;
  const isReadyToReview =
    isConnected &&
    isCorrectChain &&
    Boolean(token) &&
    summary.validCount > 0 &&
    summary.invalidCount === 0 &&
    summary.duplicateCount === 0 &&
    summary.isSufficientBalance;

  // Real Gas Estimation on BOT Chain
  useEffect(() => {
    let isCancelled = false;

    async function estimateGas() {
      if (!publicClient || !address || summary.validCount === 0 || !token || !isAddress(multisenderAddress)) {
        setGasEstimate(null);
        setGasError(null);
        return;
      }

      try {
        setGasLoading(true);
        setGasError(null);

        const recipients = validRows.map((r) => r.address as `0x${string}`);
        const amounts = validRows.map((r) => r.amountWei ?? 0n);

        const gasPrice = await publicClient.getGasPrice();
        let estimatedUnits = 0n;

        if (token.isNative) {
          estimatedUnits = await publicClient.estimateContractGas({
            address: multisenderAddress as `0x${string}`,
            abi: BOT_MULTISENDER_ABI,
            functionName: 'multisendNative',
            args: [recipients, amounts],
            value: summary.totalAmountWei,
            account: address,
          });
        } else if (token.address) {
          estimatedUnits = await publicClient.estimateContractGas({
            address: multisenderAddress as `0x${string}`,
            abi: BOT_MULTISENDER_ABI,
            functionName: 'multisendToken',
            args: [token.address, recipients, amounts],
            account: address,
          });
        }

        const feeWei = estimatedUnits * gasPrice;
        if (!isCancelled) {
          setGasEstimate(`${formatEther(feeWei)} BOT`);
          setGasLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          // If contract not deployed yet or allowance missing, fallback to realistic base calculation
          setGasLoading(false);
          const approximateGas = BigInt(21000 + summary.validCount * 28000);
          try {
            const gasPrice = await publicClient.getGasPrice();
            const approxFee = approximateGas * gasPrice;
            setGasEstimate(`~${formatEther(approxFee)} BOT (est.)`);
          } catch {
            setGasError('Gas estimation requires contract deployment');
          }
        }
      }
    }

    estimateGas();

    return () => {
      isCancelled = true;
    };
  }, [publicClient, address, summary.validCount, summary.totalAmountWei, token, validRows, multisenderAddress]);

  return (
    <div className="panel">
      <h3 className="summary-title">Distribution Summary</h3>

      <div className="summary-total-box">
        <div className="summary-total-label">Total Outflow</div>
        <div className="summary-total-amount">
          {summary.totalAmountFormatted} {token?.symbol || 'BOT'}
        </div>
      </div>

      <div className="summary-rows">
        <div className="summary-row">
          <span className="summary-row-label">Recipients</span>
          <span className="summary-row-value">{summary.validCount}</span>
        </div>

        <div className="summary-row">
          <span className="summary-row-label">Batch Transactions</span>
          <span className="summary-row-value">
            {summary.batchCount === 0
              ? '0'
              : `${summary.batchCount} transaction${summary.batchCount > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="summary-row">
          <span className="summary-row-label">Network</span>
          <span className="summary-row-value" style={{ color: isCorrectChain ? 'var(--status-success)' : 'var(--status-error)' }}>
            {isCorrectChain ? 'BOT Chain Mainnet (677)' : 'Wrong Network'}
          </span>
        </div>

        <div className="summary-row">
          <span className="summary-row-label">Estimated Network Fee</span>
          <span className="summary-row-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {gasLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                <Loader2 size={12} className="animate-spin" />
                <span>Estimating...</span>
              </span>
            ) : gasEstimate ? (
              gasEstimate
            ) : summary.validCount > 0 ? (
              '—'
            ) : (
              '0.00 BOT'
            )}
          </span>
        </div>
      </div>

      {/* Review Button */}
      <button
        type="button"
        onClick={onReviewClick}
        disabled={!isReadyToReview}
        className="btn-solid-blue"
        style={{ marginTop: '12px' }}
      >
        <span>Review distribution</span>
        <ArrowRight size={15} />
      </button>

      {/* Helper validation note if disabled */}
      {!isReadyToReview && (
        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          <Info size={13} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>
            {!isConnected
              ? 'Connect your wallet to review distribution.'
              : !isCorrectChain
              ? 'Switch your wallet to BOT Chain.'
              : summary.validCount === 0
              ? 'Add at least 1 valid recipient.'
              : summary.invalidCount > 0
              ? `Fix ${summary.invalidCount} invalid row(s) to continue.`
              : summary.duplicateCount > 0
              ? `Remove ${summary.duplicateCount} duplicate row(s) to continue.`
              : !summary.isSufficientBalance
              ? 'Insufficient token balance for this distribution.'
              : ''}
          </span>
        </div>
      )}
    </div>
  );
}
