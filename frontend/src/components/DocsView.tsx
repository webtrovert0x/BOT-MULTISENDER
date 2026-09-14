'use client';

import React from 'react';
import { BookOpen, FileSpreadsheet, Network, ShieldCheck } from 'lucide-react';

export default function DocsView() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Documentation & Guides</h1>
        <p className="page-subtitle">
          Developer and treasury distribution documentation for BOT Chain.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* CSV Format Spec */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileSpreadsheet size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              CSV / Text File Import Specification
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            The parser supports comma-separated, tab-separated, and space-separated lines. Amounts must be formatted in human-readable decimal units (e.g. <code>1.5</code>, not wei).
          </p>

          <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <div style={{ color: 'var(--text-muted)' }}># Standard format (with or without header)</div>
            <div>recipient,amount</div>
            <div>0x70997970C51812dc3A010C7d01b50e0d17dc79C8,100.5</div>
            <div>0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,250.0</div>
          </div>
        </div>

        {/* Network Parameters */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Network size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              BOT Chain Parameters
            </h3>
          </div>

          <table className="recipients-table" style={{ border: '1px solid var(--border-main)' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, width: '180px' }}>Network Name</td>
                <td>BOT Chain Mainnet</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Chain ID</td>
                <td className="font-mono">968</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>RPC URL</td>
                <td className="font-mono">https://rpc.bohr.life</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Native Currency</td>
                <td>BOT (18 Decimals)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Block Explorer</td>
                <td>
                  <a href="https://scan.bohr.life" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>
                    https://scan.bohr.life
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
