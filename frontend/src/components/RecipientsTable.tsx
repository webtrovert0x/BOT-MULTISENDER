'use client';

import React, { useRef } from 'react';
import { parseCSVToRows } from '@/utils/distribution';
import { shortenAddress } from '@/utils/formatters';
import type { RecipientRowItem, TokenOption, DistributionSummaryData } from '@/types';
import { Plus, Upload, Trash2, CheckCircle2, AlertCircle, AlertTriangle, Users } from 'lucide-react';

interface RecipientsTableProps {
  rows: RecipientRowItem[];
  summary: DistributionSummaryData;
  token: TokenOption | null;
  onUpdateRow: (id: string, field: 'address' | 'amount', value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  onImportCSV: (newRows: RecipientRowItem[]) => void;
  onClearAll: () => void;
}

export default function RecipientsTable({
  rows,
  summary,
  token,
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  onImportCSV,
  onClearAll,
}: RecipientsTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const { rows: parsedRows } = parseCSVToRows(content);
        if (parsedRows.length > 0) {
          onImportCSV(parsedRows);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="panel">
      {/* Table Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recipients ({rows.length})
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={onAddRow}
            className="btn-outline"
            style={{ backgroundColor: 'var(--accent-blue-subtle)', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}
          >
            <Plus size={14} />
            <span>Add recipient</span>
          </button>

          {rows.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="btn-outline"
              style={{ color: 'var(--status-error)' }}
              title="Clear all rows"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="recipients-table-wrapper">
        {rows.length === 0 ? (
          <div className="table-empty-state">
            <Users className="table-empty-icon" />
            <div className="table-empty-title">No recipients added yet</div>
            <div className="table-empty-desc">
              Add recipient wallet addresses manually or import a CSV file to get started.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={onAddRow}
                className="btn-outline"
              >
                <Plus size={14} />
                <span>Add recipient</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline"
              >
                <Upload size={14} />
                <span>Import CSV</span>
              </button>
            </div>
          </div>
        ) : (
          <table className="recipients-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Recipient Address</th>
                <th style={{ width: '180px' }}>Amount ({token?.symbol || 'BOT'})</th>
                <th style={{ width: '150px' }}>Status</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="row-index">{idx + 1}</td>
                  <td>
                    <input
                      type="text"
                      value={row.address}
                      onChange={(e) => onUpdateRow(row.id, 'address', e.target.value)}
                      placeholder="0x..."
                      className="row-input font-mono"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.amount}
                      onChange={(e) => onUpdateRow(row.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="row-input font-mono"
                    />
                  </td>
                  <td>
                    {row.status === 'valid' && (
                      <span className="status-badge valid">
                        <CheckCircle2 size={12} />
                        <span>Valid</span>
                      </span>
                    )}
                    {row.status === 'invalid-address' && (
                      <span className="status-badge invalid" title={row.errorMsg}>
                        <AlertCircle size={12} />
                        <span>Invalid address</span>
                      </span>
                    )}
                    {row.status === 'invalid-amount' && (
                      <span className="status-badge invalid" title={row.errorMsg}>
                        <AlertCircle size={12} />
                        <span>Invalid amount</span>
                      </span>
                    )}
                    {row.status === 'duplicate' && (
                      <span className="status-badge duplicate" title={row.errorMsg}>
                        <AlertTriangle size={12} />
                        <span>Duplicate</span>
                      </span>
                    )}
                    {row.status === 'exceeds-balance' && (
                      <span className="status-badge invalid" title={row.errorMsg}>
                        <AlertCircle size={12} />
                        <span>Exceeds balance</span>
                      </span>
                    )}
                    {row.status === 'empty' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onDeleteRow(row.id)}
                      className="btn-ghost-danger"
                      title="Remove row"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Validation Checks (Strictly Live Derived) */}
      {rows.length > 0 && (
        <div className="table-footer-checks">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className={`check-item ${summary.validCount > 0 ? 'ok' : ''}`}>
              <CheckCircle2 size={14} />
              <span>{summary.validCount} valid address{summary.validCount === 1 ? '' : 'es'}</span>
            </div>

            {summary.invalidCount > 0 && (
              <div className="check-item bad">
                <AlertCircle size={14} />
                <span>{summary.invalidCount} invalid row{summary.invalidCount === 1 ? '' : 's'}</span>
              </div>
            )}

            <div className={`check-item ${summary.duplicateCount === 0 ? 'ok' : 'bad'}`}>
              {summary.duplicateCount === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>
                {summary.duplicateCount === 0
                  ? 'No duplicate recipients'
                  : `${summary.duplicateCount} duplicate${summary.duplicateCount === 1 ? '' : 's'}`}
              </span>
            </div>

            <div className={`check-item ${summary.isSufficientBalance ? 'ok' : 'bad'}`}>
              {summary.isSufficientBalance ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{summary.isSufficientBalance ? 'Sufficient balance' : 'Insufficient balance'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
