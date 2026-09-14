'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { isAddress, formatUnits } from 'viem';
import { ERC20_ABI } from '@/config/contracts';
import { botchainTestnet } from '@/config/chains';
import { formatBalance } from '@/utils/formatters';
import type { TokenOption } from '@/types';
import { Coins, Search, Check, AlertCircle, Plus } from 'lucide-react';

interface TokenSelectorProps {
  selectedToken: TokenOption | null;
  onSelectToken: (token: TokenOption) => void;
}

export default function TokenSelector({ selectedToken, onSelectToken }: TokenSelectorProps) {
  const { address, isConnected } = useAccount();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Live Native BOT Balance
  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
    address,
    chainId: botchainTestnet.id,
  });

  // Initialize Native BOT as default token when connected
  useEffect(() => {
    if (nativeBalance && (!selectedToken || selectedToken.isNative)) {
      onSelectToken({
        symbol: 'BOT',
        name: 'BOT Chain Native Token',
        decimals: 18,
        isNative: true,
        balance: formatUnits(nativeBalance.value, 18),
        balanceRaw: nativeBalance.value,
      });
    }
  }, [nativeBalance, selectedToken?.isNative, onSelectToken]);

  // Read ERC-20 details when entering custom address
  const isValidAddress = isAddress(customAddress);
  const { data: erc20Data, isLoading: isErc20Loading } = useReadContracts({
    contracts: [
      {
        address: isValidAddress ? (customAddress as `0x${string}`) : undefined,
        abi: ERC20_ABI,
        functionName: 'name',
      },
      {
        address: isValidAddress ? (customAddress as `0x${string}`) : undefined,
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
      {
        address: isValidAddress ? (customAddress as `0x${string}`) : undefined,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
      {
        address: isValidAddress ? (customAddress as `0x${string}`) : undefined,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address || '0x0000000000000000000000000000000000000000'],
      },
    ],
    query: {
      enabled: isCustomModalOpen && isValidAddress,
    },
  });

  const handleSelectNative = () => {
    const rawVal = nativeBalance?.value ?? 0n;
    onSelectToken({
      symbol: 'BOT',
      name: 'BOT Chain Native Token',
      decimals: 18,
      isNative: true,
      balance: formatUnits(rawVal, 18),
      balanceRaw: rawVal,
    });
  };

  const handleApplyCustomToken = () => {
    if (!isValidAddress) {
      setCustomError('Please enter a valid contract address');
      return;
    }

    if (!erc20Data) {
      setCustomError('Failed to fetch token data from BOT Chain');
      return;
    }

    const [nameRes, symbolRes, decimalsRes, balanceRes] = erc20Data;
    if (!symbolRes?.result || decimalsRes?.result === undefined) {
      setCustomError('Contract does not conform to ERC-20 standard on BOT Chain');
      return;
    }

    const decimals = Number(decimalsRes.result);
    const rawBalance = (balanceRes?.result as bigint) ?? 0n;

    onSelectToken({
      symbol: symbolRes.result as string,
      name: (nameRes?.result as string) || 'Custom Token',
      decimals,
      isNative: false,
      address: customAddress as `0x${string}`,
      balance: formatUnits(rawBalance, decimals),
      balanceRaw: rawBalance,
    });

    setIsCustomModalOpen(false);
    setCustomAddress('');
    setCustomError(null);
  };

  return (
    <div className="panel" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Token Selector Buttons */}
        <div>
          <label className="form-label">Asset to Distribute</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSelectNative}
              className={`btn-outline ${selectedToken?.isNative ? 'active' : ''}`}
              style={{
                backgroundColor: selectedToken?.isNative ? 'var(--accent-blue-subtle)' : 'var(--bg-surface)',
                borderColor: selectedToken?.isNative ? 'var(--accent-blue)' : 'var(--border-main)',
                color: selectedToken?.isNative ? 'var(--accent-blue)' : 'var(--text-primary)',
                fontWeight: selectedToken?.isNative ? 600 : 500,
                padding: '8px 14px',
              }}
            >
              <Coins size={15} />
              <span>Native BOT</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="btn-outline"
              style={{
                backgroundColor: !selectedToken?.isNative && selectedToken ? 'var(--accent-blue-subtle)' : 'var(--bg-surface)',
                borderColor: !selectedToken?.isNative && selectedToken ? 'var(--accent-blue)' : 'var(--border-main)',
                color: !selectedToken?.isNative && selectedToken ? 'var(--accent-blue)' : 'var(--text-primary)',
                fontWeight: !selectedToken?.isNative && selectedToken ? 600 : 500,
                padding: '8px 14px',
              }}
            >
              <Plus size={14} />
              <span>
                {!selectedToken?.isNative && selectedToken ? `${selectedToken.symbol} (ERC-20)` : 'Select ERC-20 Token'}
              </span>
            </button>
          </div>
        </div>

        {/* Real Live Balance */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Available Balance
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {!isConnected
              ? '—'
              : !selectedToken
              ? 'Select a token'
              : `${formatBalance(selectedToken.balance, 4)} ${selectedToken.symbol}`}
          </div>
        </div>
      </div>

      {/* Custom ERC-20 Token Modal */}
      {isCustomModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
              Add ERC-20 Token
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Paste any verified ERC-20 token contract address on BOT Chain (Chain ID: 968).
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Contract Address</label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value.trim());
                  setCustomError(null);
                }}
                placeholder="0x..."
                className="form-input-text font-mono"
              />
            </div>

            {/* Token preview */}
            {isValidAddress && erc20Data && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Token Name:</span>
                  <span style={{ fontWeight: 600 }}>{(erc20Data[0]?.result as string) || 'Unknown'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Symbol:</span>
                  <span style={{ fontWeight: 600 }}>{(erc20Data[1]?.result as string) || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Decimals:</span>
                  <span style={{ fontWeight: 600 }}>{String(erc20Data[2]?.result ?? '—')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Your Balance:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                    {erc20Data[3]?.result !== undefined && erc20Data[2]?.result !== undefined
                      ? formatUnits(erc20Data[3].result as bigint, Number(erc20Data[2].result))
                      : '0'}
                  </span>
                </div>
              </div>
            )}

            {customError && (
              <div style={{ color: 'var(--status-error)', fontSize: '12px', marginBottom: '16px' }}>
                {customError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsCustomModalOpen(false);
                  setCustomAddress('');
                  setCustomError(null);
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomToken}
                disabled={!isValidAddress || isErc20Loading}
                className="btn-solid-blue"
                style={{ width: 'auto' }}
              >
                Select Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
