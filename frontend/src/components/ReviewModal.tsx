'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { shortenAddress, formatBalance, getExplorerAddressUrl } from '@/utils/formatters';
import type { RecipientRowItem, TokenOption, DistributionSummaryData } from '@/types';
import { ArrowLeft, ArrowRight, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  token: TokenOption;
  validRows: RecipientRowItem[];
  summary: DistributionSummaryData;
  multisenderAddress: string;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ReviewModal({
  token,
  validRows,
  summary,
  multisenderAddress,
  onBack,
  onConfirm,
}: ReviewModalProps) {
  const { address } = useAccount();

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-main)' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Review Distribution Payload
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Step 2 of 4 — Verify all recipient addresses and amounts before signing.
            </p>
          </div>
          <span className="status-badge valid">
            <ShieldCheck size={12} />
            <span>Ready to execute</span>
          </span>
        </div>

        {/* Payload Metadata Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Asset: </span>
            <strong>{token.name} ({token.symbol})</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Total Outflow: </span>
            <strong style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
              {summary.totalAmountFormatted} {token.symbol}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Recipients Count: </span>
            <strong>{summary.validCount} addresses</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Batch Plan: </span>
            <strong>{summary.batchCount} on-chain transaction{summary.batchCount > 1 ? 's' : ''}</strong>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sender Account: </span>
            <span className="font-mono" style={{ fontWeight: 600 }}>{address}</span>
          </div>
        </div>

        {/* Full Recipients List Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)' }}>
          <table className="recipients-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Recipient Address</th>
                <th style={{ textAlign: 'right' }}>Amount ({token.symbol})</th>
              </tr>
            </thead>
            <tbody>
              {validRows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="row-index">{idx + 1}</td>
                  <td className="font-mono" style={{ fontSize: '12px' }}>
                    {row.address}
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Safe Copy Note */}
        <div
          style={{
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--status-success)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>
            No funds move until you sign the on-chain transaction in your wallet.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn-outline"
            style={{ padding: '8px 16px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Edit</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="btn-solid-blue"
            style={{ width: 'auto', padding: '8px 20px' }}
          >
            <span>Proceed to Sign</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
