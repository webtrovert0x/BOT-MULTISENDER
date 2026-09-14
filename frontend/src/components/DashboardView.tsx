'use client';

import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { botchainTestnet } from '@/config/chains';
import { formatBalance, shortenAddress } from '@/utils/formatters';
import type { TxRecord } from '@/types';
import { Send, History, Wallet, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

interface DashboardViewProps {
  onStartSend: () => void;
  history: TxRecord[];
}

export default function DashboardView({ onStartSend, history }: DashboardViewProps) {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address,
    chainId: botchainTestnet.id,
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Overview of your token distribution activity on BOT Chain.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="panel">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
            Connected Account Balance
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {isConnected ? `${formatBalance(balanceData?.formatted ?? '0')} BOT` : '—'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isConnected ? shortenAddress(address, 6) : 'Wallet disconnected'}
          </div>
        </div>

        <div className="panel">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
            Total Distributions Sent
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {history.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Logged batch transfers
          </div>
        </div>

        <div className="panel">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>
            Active Network
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-success)' }}>
            BOT Chain
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Chain ID: 968 (BohrScan)
          </div>
        </div>
      </div>

      {/* Quick Action Panel */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Ready to distribute tokens?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Send Native BOT or any custom ERC-20 token to multiple wallets in one single transaction.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartSend}
          className="btn-solid-blue"
          style={{ width: 'auto', padding: '10px 20px' }}
        >
          <span>New Distribution</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
