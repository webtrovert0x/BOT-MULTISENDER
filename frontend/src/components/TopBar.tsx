'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { botchainTestnet } from '@/config/chains';
import { shortenAddress } from '@/utils/formatters';
import { AlertCircle, ChevronDown, Copy, LogOut, Check, RefreshCw, ExternalLink } from 'lucide-react';

export default function TopBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCorrectChain = isConnected && chainId === botchainTestnet.id;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="top-bar">
      {/* Network Chip */}
      <div>
        {isConnected && !isCorrectChain ? (
          <button
            type="button"
            onClick={() => switchChain({ chainId: botchainTestnet.id })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              color: 'var(--status-error)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <AlertCircle size={14} />
            <span>Wrong Network (Click to switch to BOT Chain)</span>
          </button>
        ) : (
          <div className="network-chip">
            <span className={`status-dot ${isCorrectChain ? 'online' : 'warning'}`} />
            <span>{isCorrectChain ? 'BOT Chain Mainnet (968)' : 'Disconnected'}</span>
          </div>
        )}
      </div>

      {/* Account Info & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isConnected && address ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
            >
              <span>{shortenAddress(address, 4)}</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  width: '200px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '6px',
                  zIndex: 100,
                }}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  className="nav-item"
                  style={{ padding: '8px 10px', fontSize: '12px' }}
                >
                  {copied ? <Check size={14} color="#098347" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Address'}</span>
                </button>

                <a
                  href={`https://scan.bohr.life/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-item"
                  style={{ padding: '8px 10px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  <span>View on BohrScan</span>
                </a>

                <button
                  type="button"
                  onClick={() => open({ view: 'Networks' })}
                  className="nav-item"
                  style={{ padding: '8px 10px', fontSize: '12px' }}
                >
                  <RefreshCw size={14} />
                  <span>Switch Network</span>
                </button>

                <div className="nav-divider" style={{ margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    disconnect();
                    setDropdownOpen(false);
                  }}
                  className="nav-item"
                  style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--status-error)' }}
                >
                  <LogOut size={14} />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => open()}
            className="btn-solid-blue"
            style={{ padding: '7px 16px', fontSize: '13px' }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
