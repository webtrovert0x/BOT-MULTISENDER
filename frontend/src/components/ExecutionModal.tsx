'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { maxUint256, isAddress } from 'viem';
import { BOT_MULTISENDER_ABI, ERC20_ABI } from '@/config/contracts';
import { getExplorerTxUrl, shortenAddress } from '@/utils/formatters';
import type { TokenOption, DistributionSummaryData, RecipientRowItem, TxRecord } from '@/types';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface ExecutionModalProps {
  token: TokenOption;
  validRows: RecipientRowItem[];
  summary: DistributionSummaryData;
  multisenderAddress: string;
  onClose: () => void;
  onSuccess: (record: TxRecord) => void;
}

export default function ExecutionModal({
  token,
  validRows,
  summary,
  multisenderAddress,
  onClose,
  onSuccess,
}: ExecutionModalProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [currentStep, setCurrentStep] = useState<'check' | 'approving' | 'sending' | 'confirmed' | 'failed'>('check');
  const [approvalChoice, setApprovalChoice] = useState<'exact' | 'unlimited'>('exact');
  const [activeTxHash, setActiveTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedDetails, setConfirmedDetails] = useState<{ blockNumber?: number; gasUsed?: string } | null>(null);

  // Read current allowance
  const { data: rawAllowance, refetch: refetchAllowance } = useReadContract({
    address: !token.isNative && token.address ? token.address : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [
      (address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
      (multisenderAddress || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    ],
    query: {
      enabled: !token.isNative && Boolean(token.address) && Boolean(address) && isAddress(multisenderAddress),
    },
  });

  const currentAllowanceVal = (rawAllowance as bigint) ?? 0n;
  const isAllowanceNeeded = !token.isNative && currentAllowanceVal < summary.totalAmountWei;

  // Step 3: Approve
  const handleApprove = async () => {
    if (!token.address || !publicClient || !address) return;
    try {
      setErrorMessage(null);
      setCurrentStep('approving');

      const amountToApprove = approvalChoice === 'unlimited' ? maxUint256 : summary.totalAmountWei;

      // Simulate first
      await publicClient.simulateContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [multisenderAddress as `0x${string}`, amountToApprove],
        account: address,
      });

      const hash = await (writeContractAsync as any)({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [multisenderAddress as `0x${string}`, amountToApprove],
      });

      setActiveTxHash(hash);

      // Wait for approval receipt
      await publicClient.waitForTransactionReceipt({ hash });
      await refetchAllowance();
      setActiveTxHash(null);
      setCurrentStep('check');
    } catch (err: any) {
      console.error('Approval failed:', err);
      setCurrentStep('failed');
      setErrorMessage(err.shortMessage || err.message || 'Token approval transaction was rejected or reverted.');
    }
  };

  // Step 4: Send
  const handleSend = async () => {
    if (!publicClient || !address || !isAddress(multisenderAddress)) return;

    try {
      setErrorMessage(null);
      setCurrentStep('sending');

      const recipients = validRows.map((r) => r.address as `0x${string}`);
      const amounts = validRows.map((r) => r.amountWei ?? 0n);

      let hash: `0x${string}`;

      if (token.isNative) {
        // Simulate native transfer
        await publicClient.simulateContract({
          address: multisenderAddress as `0x${string}`,
          abi: BOT_MULTISENDER_ABI,
          functionName: 'multisendNative',
          args: [recipients, amounts],
          value: summary.totalAmountWei,
          account: address,
        });

        hash = await (writeContractAsync as any)({
          address: multisenderAddress as `0x${string}`,
          abi: BOT_MULTISENDER_ABI,
          functionName: 'multisendNative',
          args: [recipients, amounts],
          value: summary.totalAmountWei,
        });
      } else {
        if (!token.address) return;

        // Simulate token transfer
        await publicClient.simulateContract({
          address: multisenderAddress as `0x${string}`,
          abi: BOT_MULTISENDER_ABI,
          functionName: 'multisendToken',
          args: [token.address, recipients, amounts],
          account: address,
        });

        hash = await (writeContractAsync as any)({
          address: multisenderAddress as `0x${string}`,
          abi: BOT_MULTISENDER_ABI,
          functionName: 'multisendToken',
          args: [token.address, recipients, amounts],
        });
      }

      setActiveTxHash(hash);

      // Wait for execution receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      setConfirmedDetails({
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
      });
      setCurrentStep('confirmed');

      const record: TxRecord = {
        hash,
        timestamp: Date.now(),
        recipientCount: summary.validCount,
        totalAmount: summary.totalAmountFormatted,
        tokenSymbol: token.symbol,
        tokenAddress: token.address,
        status: 'success',
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
      };
      onSuccess(record);
    } catch (err: any) {
      console.error('Batch send failed:', err);
      setCurrentStep('failed');
      setErrorMessage(err.shortMessage || err.message || 'Batch transaction was rejected or reverted on BOT Chain.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '560px' }}>
        {/* Step Indicator Header */}
        <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-main)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {isAllowanceNeeded ? 'Step 3 of 4 — Token Approval' : 'Step 4 of 4 — Execute Distribution'}
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {currentStep === 'confirmed'
              ? 'Distribution Confirmed'
              : currentStep === 'failed'
              ? 'Transaction Reverted'
              : isAllowanceNeeded
              ? `Approve ${token.symbol} Allowance`
              : `Submit Batch Transfer`}
          </h3>
        </div>

        {/* State 1: Allowance Required */}
        {currentStep === 'check' && isAllowanceNeeded && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              The multisender contract requires your permission to transfer <strong>{summary.totalAmountFormatted} {token.symbol}</strong> from your wallet.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: approvalChoice === 'exact' ? '1px solid var(--accent-blue)' : '1px solid var(--border-main)',
                  backgroundColor: approvalChoice === 'exact' ? 'var(--accent-blue-subtle)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="allowance"
                  checked={approvalChoice === 'exact'}
                  onChange={() => setApprovalChoice('exact')}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>
                    Exact Amount ({summary.totalAmountFormatted} {token.symbol})
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Approve only the precise amount required for this batch.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: approvalChoice === 'unlimited' ? '1px solid var(--accent-blue)' : '1px solid var(--border-main)',
                  backgroundColor: approvalChoice === 'unlimited' ? 'var(--accent-blue-subtle)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="allowance"
                  checked={approvalChoice === 'unlimited'}
                  onChange={() => setApprovalChoice('unlimited')}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Unlimited Allowance</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Saves gas on future multisends for this token.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button type="button" onClick={handleApprove} className="btn-solid-blue" style={{ width: 'auto' }}>
                <span>Approve {token.symbol}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* State 2: Ready to Send (Native or already approved) */}
        {currentStep === 'check' && !isAllowanceNeeded && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Your transaction is ready for submission to BOT Chain. You will send <strong>{summary.totalAmountFormatted} {token.symbol}</strong> to <strong>{summary.validCount} addresses</strong> in a single batch.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-main)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Contract Address:</span>
                <span className="font-mono">{shortenAddress(multisenderAddress, 6)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Method:</span>
                <span className="font-mono" style={{ fontWeight: 600 }}>
                  {token.isNative ? 'multisendNative()' : 'multisendToken()'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button type="button" onClick={handleSend} className="btn-solid-blue" style={{ width: 'auto' }}>
                <span>Sign & Send Batch</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* State 3: Approving or Sending in progress */}
        {(currentStep === 'approving' || currentStep === 'sending') && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Loader2 size={36} className="animate-spin" color="var(--accent-blue)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {activeTxHash ? 'Waiting for BOT Chain confirmation...' : 'Confirm transaction in your wallet'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {currentStep === 'approving'
                ? `Granting ${token.symbol} allowance to Multisender contract...`
                : `Executing batch transfer to ${summary.validCount} recipients...`}
            </div>

            {activeTxHash && (
              <a
                href={getExplorerTxUrl(activeTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--accent-blue)',
                  textDecoration: 'none',
                }}
              >
                <span>View on BohrScan Explorer</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        )}

        {/* State 4: Confirmed Success */}
        {currentStep === 'confirmed' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <CheckCircle2 size={28} color="#098347" />
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Batch Transfer Successful
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Successfully distributed {summary.totalAmountFormatted} {token.symbol} to {summary.validCount} recipients.
            </div>

            {activeTxHash && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '12px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tx Hash:</span>
                  <a
                    href={getExplorerTxUrl(activeTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono"
                    style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{shortenAddress(activeTxHash, 6)}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                {confirmedDetails?.blockNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Block Number:</span>
                    <span>{confirmedDetails.blockNumber}</span>
                  </div>
                )}
                {confirmedDetails?.gasUsed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gas Used:</span>
                    <span className="font-mono">{confirmedDetails.gasUsed}</span>
                  </div>
                )}
              </div>
            )}

            <button type="button" onClick={onClose} className="btn-solid-blue">
              Done
            </button>
          </div>
        )}

        {/* State 5: Failed / Reverted */}
        {currentStep === 'failed' && (
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-error-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <AlertCircle size={28} color="#DC2626" />
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '4px' }}>
              Transaction Failed
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--status-error)',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                margin: '16px 0',
                wordBreak: 'break-word',
              }}
            >
              {errorMessage || 'Unknown error occurred on BOT Chain.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-outline">
                Dismiss
              </button>
              <button type="button" onClick={() => setCurrentStep('check')} className="btn-solid-blue" style={{ width: 'auto' }}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
