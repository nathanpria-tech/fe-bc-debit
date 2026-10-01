import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../api/apiClient';
import Navbar from '../components/Navbar';
import BalanceCard from '../components/BalanceCard';
import TopUpModal from '../components/TopUpModal';
import TransferForm from '../components/TransferForm';
import TransactionTable from '../components/TransactionTable';
import Alert from '../components/Alert';

export default function DashboardPage() {
  const { user, updateBalance } = useAuth();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const [txError, setTxError] = useState(null);
  const [globalNotice, setGlobalNotice] = useState(null);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    setIsTxLoading(true);
    setTxError(null);
    try {
      const data = await walletApi.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setTxError(err.message || 'Gagal mengambil riwayat transaksi.');
    } finally {
      setIsTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle successful Top-up
  const handleTopUpSuccess = (newBalance, message) => {
    updateBalance(newBalance);
    setGlobalNotice({ type: 'success', text: message });
    fetchTransactions();
  };

  // Handle successful Transfer
  const handleTransferSuccess = (newBalance, message) => {
    updateBalance(newBalance);
    setGlobalNotice({ type: 'success', text: message });
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Global Notice / Flash Alert */}
        {globalNotice && (
          <Alert
            type={globalNotice.type}
            message={globalNotice.text}
            onClose={() => setGlobalNotice(null)}
          />
        )}

        {/* 1. Saldo & Tombol Top-up */}
        <section aria-label="Informasi Saldo">
          <BalanceCard
            balance={user?.balance || 0}
            onOpenTopUp={() => setIsTopUpOpen(true)}
          />
        </section>

        {/* 2. Grid Area: Form Transfer & Tabel Riwayat Transaksi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Transfer */}
          <div className="lg:col-span-5 w-full">
            <TransferForm
              currentBalance={user?.balance || 0}
              onTransferSuccess={handleTransferSuccess}
            />
          </div>

          {/* Tabel Riwayat Transaksi */}
          <div className="lg:col-span-7 w-full">
            <TransactionTable
              transactions={transactions}
              isLoading={isTxLoading}
              error={txError}
              onRetry={fetchTransactions}
            />
          </div>
        </div>
      </main>

      {/* Modal Dialog Top-up */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
      />
    </div>
  );
}
