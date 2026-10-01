import React, { useState } from 'react';
import { Send, Loader2, UserCheck, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { walletApi } from '../api/apiClient';
import { formatCurrency } from '../utils/formatters';
import Alert from './Alert';

export default function TransferForm({ currentBalance = 0, onTransferSuccess }) {
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const MAX_TRANSACTION_LIMIT = 10000000;

  // Sanitasi & Parse Nominal Input
  const parseAmount = (val) => {
    if (!val || val.trim() === '') return null;
    const cleanStr = val.replace(/[^0-9]/g, '');
    if (!cleanStr) return NaN;
    return Number(cleanStr);
  };

  const currentParsedNominal = parseAmount(amountInput);

  // Real-time Validasi Form
  const validateForm = () => {
    if (!recipient.trim()) {
      return 'Email, Username, atau nomor HP penerima wajib diisi.';
    }

    if (amountInput === undefined || amountInput === null || amountInput.trim() === '') {
      return 'Nominal tidak boleh kosong.';
    }

    if (/[^0-9]/.test(amountInput.trim())) {
      return 'Nominal harus berupa angka.';
    }

    const num = Number(amountInput);
    if (isNaN(num) || num <= 0) {
      return 'Nominal harus berupa angka.';
    }

    if (!Number.isInteger(num)) {
      return 'Input angka hanya boleh bilangan bulat.';
    }

    if (num > MAX_TRANSACTION_LIMIT) {
      return 'Nominal melebihi batas maksimum transaksi (Maksimal Rp 10.000.000).';
    }

    if (num > currentBalance) {
      return 'Saldo tidak mencukupi.';
    }

    return null;
  };

  const validationError = validateForm();
  const isFormValid = validationError === null;

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setShowConfirmModal(true);
  };

  const executeTransfer = async () => {
    if (isLoading) return;

    setShowConfirmModal(false);
    setIsLoading(true);
    setErrorMessage(null);

    const numAmount = Number(amountInput);

    try {
      const response = await walletApi.transfer(recipient.trim(), numAmount);

      setRecipient('');
      setAmountInput('');
      const successText = response.message || `Transfer sebesar ${formatCurrency(numAmount)} ke ${recipient.trim()} berhasil diproses.`;
      setSuccessMessage(successText);

      if (onTransferSuccess) {
        onTransferSuccess(response.balance, successText);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Transfer gagal. Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 relative">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Form Transfer</h3>
          <p className="text-xs text-slate-500">Kirim dana ke email, username, atau HP terdaftar</p>
        </div>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          className="mb-5"
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
          className="mb-5"
        />
      )}

      <form onSubmit={handlePreSubmit} className="space-y-4">
        {/* Input Penerima */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tujuan / Penerima <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <UserCheck className="w-4 h-4" />
            </span>
            <input
              id="recipient"
              type="text"
              placeholder="Username, Email, atau No. HP penerima"
              value={recipient}
              disabled={isLoading}
              onChange={(e) => {
                setRecipient(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 transition text-sm"
            />
          </div>
        </div>

        {/* Input Nominal Transfer */}
        <div>
          <label htmlFor="transfer-amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nominal Transfer <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
              Rp
            </span>
            <input
              id="transfer-amount"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 50000"
              value={amountInput}
              disabled={isLoading}
              onChange={(e) => {
                setAmountInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 transition text-sm"
            />
          </div>

          {/* Formatted Nominal Preview */}
          {currentParsedNominal !== null && !isNaN(currentParsedNominal) && currentParsedNominal > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Preview Nominal:</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {formatCurrency(currentParsedNominal)}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Validation Hint */}
        {amountInput && validationError && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg flex items-center gap-2 border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white shadow-md transition-all ${
              isLoading || !isFormValid
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] cursor-pointer shadow-indigo-100'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Transfer...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Transfer</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Konfirmasi Transfer</h4>
                <p className="text-xs text-slate-500">Periksa kembali rincian transaksi Anda</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Penerima:</span>
                <span className="font-bold text-slate-900">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal:</span>
                <span className="font-bold text-indigo-600">{formatCurrency(currentParsedNominal)}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500">Sisa Saldo Setelah Transfer:</span>
                <span className="font-semibold text-slate-700">{formatCurrency(currentBalance - currentParsedNominal)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeTransfer}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 font-semibold text-xs text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
              >
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
