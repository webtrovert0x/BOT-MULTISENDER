'use client';

import React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { shortenAddress, formatBalance } from '@/utils/formatters';
import { botchain } from '@/config/chains';
import { Send, LayoutDashboard, History, FileCode2, BookOpen, Wallet, LogOut, Copy, Check, Globe, ExternalLink } from 'lucide-react';

interface SidebarProps {
  currentView: 'send' | 'dashboard' | 'history' | 'contracts' | 'docs';
  onSelectView: (view: 'send' | 'dashboard' | 'history' | 'contracts' | 'docs') => void;
}

export default function Sidebar({ currentView, onSelectView }: SidebarProps) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [copied, setCopied] = React.useState(false);

  const { data: balanceData } = useBalance({
    address,
    chainId: botchain.id,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div className="brand-section">
          <img
            src="/logo.png"
            alt="BOT Multisender Logo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 0 12px rgba(100, 108, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          />
          <div className="brand-info">
            <span className="brand-title">BOT MULTISENDER</span>
            <span className="brand-subtitle">BOT Chain (677)</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <button
            type="button"
            className={`nav-item ${currentView === 'send' ? 'active' : ''}`}
            onClick={() => onSelectView('send')}
          >
            <Send size={16} />
            <span>Send Tokens</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectView('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => onSelectView('history')}
          >
            <History size={16} />
            <span>History</span>
          </button>

          <div className="nav-divider" />

          <button
            type="button"
            className={`nav-item ${currentView === 'contracts' ? 'active' : ''}`}
            onClick={() => onSelectView('contracts')}
          >
            <FileCode2 size={16} />
            <span>Contracts</span>
          </button>

          <button
            type="button"
            className={`nav-item ${currentView === 'docs' ? 'active' : ''}`}
            onClick={() => onSelectView('docs')}
          >
            <BookOpen size={16} />
            <span>Docs</span>
          </button>

          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}
            title="Open BotScan Explorer"
          >
            <Globe size={16} />
            <span>Explorer</span>
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.7 }} />
          </a>
        </nav>
      </div>

      {/* Sidebar Footer: Connected Wallet Card */}
      <div className="sidebar-footer">
        {isConnected && address ? (
          <div className="wallet-card">
            <div className="wallet-card-header">
              <span>Connected Account</span>
              <button
                type="button"
                onClick={copyAddress}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Copy Address"
              >
                {copied ? <Check size={12} color="#098347" /> : <Copy size={12} />}
              </button>
            </div>
            <div className="wallet-address">{shortenAddress(address, 5)}</div>
            <div className="wallet-balance">
              {formatBalance(balanceData?.formatted ?? '0')} BOT
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => open()}
            className="btn-solid-blue"
            style={{ fontSize: '12px', padding: '8px 12px' }}
          >
            <Wallet size={14} />
            <span>Connect wallet</span>
          </button>
        )}
      </div>
    </aside>
  );
}
