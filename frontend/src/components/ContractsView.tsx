'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_MULTISENDER_ADDRESS } from '@/config/contracts';
import { shortenAddress, getExplorerAddressUrl } from '@/utils/formatters';
import { FileCode2, Copy, Check, ExternalLink, Save } from 'lucide-react';

interface ContractsViewProps {
  multisenderAddress: string;
  onUpdateAddress: (address: string) => void;
}

export default function ContractsView({ multisenderAddress, onUpdateAddress }: ContractsViewProps) {
  const [addressInput, setAddressInput] = useState(multisenderAddress);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAddressInput(multisenderAddress);
  }, [multisenderAddress]);

  const handleCopy = () => {
    navigator.clipboard.writeText(multisenderAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onUpdateAddress(addressInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Smart Contracts</h1>
        <p className="page-subtitle">
          Verified batch distribution smart contract configuration on BOT Chain (Chain ID: 677).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* Active Contract Configuration */}
        <div className="panel">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            BotMultisender Contract
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Active Contract Address on BOT Chain</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="0x..."
                className="form-input-text font-mono"
              />
              <button type="button" onClick={handleSave} className="btn-outline" style={{ whiteSpace: 'nowrap' }}>
                {saved ? <Check size={14} color="#098347" /> : <Save size={14} />}
                <span>{saved ? 'Saved' : 'Update'}</span>
              </button>
              <button type="button" onClick={handleCopy} className="btn-outline" style={{ whiteSpace: 'nowrap' }}>
                {copied ? <Check size={14} color="#098347" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <a
              href={getExplorerAddressUrl(multisenderAddress)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-blue)', textDecoration: 'none' }}
            >
              <span>View on BotScan Explorer</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Contract Capabilities & Methods */}
        <div className="panel">
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Supported Contract Methods
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                multisendNative(address[] recipients, uint256[] amounts)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Transfers native BOT to an array of recipient addresses with custom amounts. Refunds excess value automatically.
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                multisendToken(address token, address[] recipients, uint256[] amounts)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Batch transfers any ERC-20 token using allowance & transferFrom in a single transaction.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
