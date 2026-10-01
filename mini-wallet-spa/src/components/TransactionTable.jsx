import React from 'react';
import { History, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownLeft, Wallet, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionTable({ transactions = [], isLoading = false, error = null, onRetry }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <History className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Riwayat Mutasi & Transaksi</h3>
            <p className="text-xs text-slate-500">Mutasi uang masuk & uang keluar terproteksi real-time</p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isLoading}
            title="Segarkan mutasi transaksi"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 text-center bg-red-50/50">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-800 mb-1">{error}</p>
          <p className="text-xs text-red-600 mb-3">Gagal mengambil mutasi transaksi terproteksi.</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          )}
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && !error && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 py-4 text-slate-500 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Memuat data mutasi...</span>
          </div>
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3.5">Waktu & Deskripsi</th>
                <th scope="col" className="px-6 py-3.5">Tipe Mutasi</th>
                <th scope="col" className="px-6 py-3.5 text-right">Nominal</th>
                <th scope="col" className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                    Belum ada riwayat mutasi transaksi.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const typeUpper = (tx.type || '').toUpperCase();
                  const isTopUp = typeUpper.includes('TOP');
                  const isIncoming = tx.is_incoming !== undefined ? tx.is_incoming : (isTopUp || tx.is_sender === false);
                  const isSuccess = (tx.status || 'Success').toLowerCase() === 'success';

                  let displayTitle = tx.description;
                  if (!displayTitle) {
                    if (isTopUp) {
                      displayTitle = 'Top-up Saldo';
                    } else if (isIncoming) {
                      displayTitle = `Transfer dari ${tx.sender_name || 'Pengguna'}`;
                    } else {
                      displayTitle = `Transfer ke ${tx.receiver_name || 'Pengguna'}`;
                    }
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tanggal & Deskripsi */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {displayTitle}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(tx.date || tx.created_at, true)}</span>
                        </div>
                      </td>

                      {/* Tipe Mutasi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-xs">
                          {isIncoming ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              Uang Masuk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Uang Keluar
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nominal */}
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-sm">
                        <span className={isIncoming ? 'text-emerald-600' : 'text-rose-600'}>
                          {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isSuccess ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Berhasil
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Gagal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
