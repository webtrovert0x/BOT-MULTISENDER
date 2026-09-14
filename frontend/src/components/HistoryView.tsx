'use client';

import React from 'react';
import { shortenAddress, getExplorerTxUrl } from '@/utils/formatters';
import type { TxRecord } from '@/types';
import { History, ExternalLink, CheckCircle2, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  history: TxRecord[];
  onClearHistory: () => void;
}

export default function HistoryView({ history, onClearHistory }: HistoryViewProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Distribution History</h1>
          <p className="page-subtitle">
            Log of batch transfers sent from your connected account.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="btn-outline"
            style={{ color: 'var(--status-error)' }}
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <History size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No distribution history found
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Batch transfers submitted from this browser will appear here with direct BohrScan explorer links.
          </div>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="recipients-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Transaction Hash</th>
                <th>Amount</th>
                <th>Recipients</th>
                <th>Status</th>
                <th>Explorer</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="font-mono" style={{ fontSize: '12px' }}>
                    {shortenAddress(record.hash, 6)}
                  </td>
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    {record.totalAmount} {record.tokenSymbol}
                  </td>
                  <td>
                    <span>{record.recipientCount} addresses</span>
                  </td>
                  <td>
                    <span className="status-badge valid">
                      <CheckCircle2 size={12} />
                      <span>Confirmed</span>
                    </span>
                  </td>
                  <td>
                    <a
                      href={getExplorerTxUrl(record.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ padding: '4px 8px', fontSize: '11px', textDecoration: 'none' }}
                    >
                      <span>View</span>
                      <ExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
