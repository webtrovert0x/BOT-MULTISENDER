'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TokenSelector from '@/components/TokenSelector';
import RecipientsTable from '@/components/RecipientsTable';
import DistributionSummary from '@/components/DistributionSummary';
import ReviewModal from '@/components/ReviewModal';
import ExecutionModal from '@/components/ExecutionModal';
import ContractsView from '@/components/ContractsView';
import HistoryView from '@/components/HistoryView';
import DocsView from '@/components/DocsView';
import DashboardView from '@/components/DashboardView';
import { validateRecipientRows } from '@/utils/distribution';
import { DEFAULT_MULTISENDER_ADDRESS } from '@/config/contracts';
import type { RecipientRowItem, TokenOption, TxRecord } from '@/types';
import { ArrowRight, Check } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'send' | 'dashboard' | 'history' | 'contracts' | 'docs'>('send');
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Active Token
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);

  // Recipients Table State — ZERO SEEDED ROWS
  const [rows, setRows] = useState<RecipientRowItem[]>([]);

  // Multisender Contract Address
  const [multisenderAddress, setMultisenderAddress] = useState<string>(DEFAULT_MULTISENDER_ADDRESS);

  useEffect(() => {
    const saved = localStorage.getItem('bot_multisender_address');
    if (saved) {
      setMultisenderAddress(saved);
    }
  }, []);

  const handleUpdateMultisenderAddress = (addr: string) => {
    setMultisenderAddress(addr);
    localStorage.setItem('bot_multisender_address', addr);
  };

  // Transaction History State
  const [history, setHistory] = useState<TxRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bot_multisender_tx_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRecordSuccess = (record: TxRecord) => {
    const updated = [record, ...history].slice(0, 100);
    setHistory(updated);
    localStorage.setItem('bot_multisender_tx_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bot_multisender_tx_history');
  };

  // Dynamic Validation Engine
  const { processedRows, summary } = useMemo(() => {
    return validateRecipientRows(rows, selectedToken);
  }, [rows, selectedToken]);

  const validRows = useMemo(() => {
    return processedRows.filter((r) => r.status === 'valid' || r.status === 'exceeds-balance');
  }, [processedRows]);

  // Row Manipulation Handlers
  const handleAddRow = useCallback(() => {
    const newRow: RecipientRowItem = {
      id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      address: '',
      amount: '',
      status: 'empty',
    };
    setRows((prev) => [...prev, newRow]);
  }, []);

  const handleUpdateRow = useCallback((id: string, field: 'address' | 'amount', value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }, []);

  const handleDeleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleImportCSV = useCallback((newRows: RecipientRowItem[]) => {
    setRows((prev) => [...prev, ...newRows]);
  }, []);

  const handleClearAll = useCallback(() => {
    setRows([]);
  }, []);

  // Modal Step Handlers
  const handleOpenReview = () => {
    setActiveStep(2);
  };

  const handleBackToEdit = () => {
    setActiveStep(1);
  };

  const handleProceedToExecute = () => {
    setActiveStep(3);
  };

  const handleCloseExecution = () => {
    setActiveStep(1);
  };

  return (
    <div className="app-shell">
      {/* Left Sidebar */}
      <Sidebar currentView={currentView} onSelectView={setCurrentView} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Bar */}
        <TopBar />

        {/* Content Body */}
        <main className="content-body">
          {currentView === 'send' && (
            <div>
              {/* Page Title */}
              <div className="page-header">
                <h1 className="page-title">New Distribution</h1>
                <p className="page-subtitle">
                  Send tokens to multiple wallets in a single transaction on BOT Chain.
                </p>
              </div>

              {/* Stepper Header */}
              <div className="stepper-container">
                <div className={`step-item ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                  <span className="step-number">{activeStep > 1 ? <Check size={12} /> : '1'}</span>
                  <span>Recipients</span>
                </div>
                <span className="step-arrow">→</span>

                <div className={`step-item ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                  <span className="step-number">{activeStep > 2 ? <Check size={12} /> : '2'}</span>
                  <span>Review</span>
                </div>
                <span className="step-arrow">→</span>

                <div className={`step-item ${activeStep >= 3 ? 'active' : ''} ${activeStep > 3 ? 'completed' : ''}`}>
                  <span className="step-number">{activeStep > 3 ? <Check size={12} /> : '3'}</span>
                  <span>Approve</span>
                </div>
                <span className="step-arrow">→</span>

                <div className={`step-item ${activeStep === 4 ? 'active' : ''}`}>
                  <span className="step-number">4</span>
                  <span>Send</span>
                </div>
              </div>

              {/* Step 1: Token Selector & Recipients Table */}
              <TokenSelector
                selectedToken={selectedToken}
                onSelectToken={setSelectedToken}
              />

              <div className="distribution-layout">
                {/* Recipients Table */}
                <RecipientsTable
                  rows={processedRows}
                  summary={summary}
                  token={selectedToken}
                  onUpdateRow={handleUpdateRow}
                  onDeleteRow={handleDeleteRow}
                  onAddRow={handleAddRow}
                  onImportCSV={handleImportCSV}
                  onClearAll={handleClearAll}
                />

                {/* Right Summary Column */}
                <DistributionSummary
                  summary={summary}
                  token={selectedToken}
                  validRows={validRows}
                  multisenderAddress={multisenderAddress}
                  onReviewClick={handleOpenReview}
                />
              </div>

              {/* Step 2: Review Modal */}
              {activeStep === 2 && selectedToken && (
                <ReviewModal
                  token={selectedToken}
                  validRows={validRows}
                  summary={summary}
                  multisenderAddress={multisenderAddress}
                  onBack={handleBackToEdit}
                  onConfirm={handleProceedToExecute}
                />
              )}

              {/* Step 3 & 4: Execution Modal (Approve & Send) */}
              {(activeStep === 3 || activeStep === 4) && selectedToken && (
                <ExecutionModal
                  token={selectedToken}
                  validRows={validRows}
                  summary={summary}
                  multisenderAddress={multisenderAddress}
                  onClose={handleCloseExecution}
                  onSuccess={handleRecordSuccess}
                />
              )}
            </div>
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              onStartSend={() => setCurrentView('send')}
              history={history}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              history={history}
              onClearHistory={handleClearHistory}
            />
          )}

          {currentView === 'contracts' && (
            <ContractsView
              multisenderAddress={multisenderAddress}
              onUpdateAddress={handleUpdateMultisenderAddress}
            />
          )}

          {currentView === 'docs' && <DocsView />}
        </main>
      </div>
    </div>
  );
}
