import React, { useState } from 'react';
import { PlusCircle, Loader2, X, WalletCards, AlertCircle } from 'lucide-react';
import { walletApi } from '../api/apiClient';
import { formatCurrency } from '../utils/formatters';
import Alert from './Alert';

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];
const MAX_TRANSACTION_LIMIT = 10000000;

export default function TopUpModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const validateInput = () => {
    if (amount === undefined || amount === null || String(amount).trim() === '') {
      return 'Nominal tidak boleh kosong.';
    }

    if (/[^0-9]/.test(String(amount).trim())) {
      return 'Nominal harus berupa angka.';
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Nominal harus berupa angka.';
    }

    if (numAmount > MAX_TRANSACTION_LIMIT) {
      return 'Nominal melebihi batas maksimum transaksi (Maksimal Rp 10.000.000).';
    }

    return null;
  };

  const valError = validateInput();
  const isValid = valError === null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const validationMsg = validateInput();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    const numAmount = Number(amount);
    setError(null);
    setIsLoading(true);

    try {
      const response = await walletApi.topup(numAmount);
      setAmount('');
      if (onSuccess) {
        onSuccess(response.balance, `Top-up sebesar ${formatCurrency(numAmount)} berhasil ditambahkan ke saldo.`);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Top-up gagal. Terjadi kesalahan pada server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuick = (val) => {
    if (isLoading) return;
    setAmount(String(val));
    setError(null);
  };

  const parsedAmount = Number(amount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <WalletCards className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">Top-up Saldo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          <div>
            <label htmlFor="topup-amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nominal Top-up (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
                Rp
              </span>
              <input
                id="topup-amount"
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 100000"
                value={amount}
                disabled={isLoading}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100 transition text-sm"
              />
            </div>
            {parsedAmount > 0 && !isNaN(parsedAmount) && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                Total Top-up: <span className="font-bold">{formatCurrency(parsedAmount)}</span>
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pilihan Cepat
            </span>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectQuick(val)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                    Number(amount) === val
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50'
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          {amount && valError && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg flex items-center gap-2 border border-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{valError}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none ${
                isLoading || !isValid
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-200 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Top-up...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Top-up Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
