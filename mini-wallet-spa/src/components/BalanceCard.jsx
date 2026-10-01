import React from 'react';
import { PlusCircle, Wallet, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function BalanceCard({ balance = 0, onOpenTopUp }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-100 p-6 sm:p-8">
      {/* Background graphic decoration */}
      <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-12 bottom-0 w-32 h-32 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-100/90 text-sm font-medium mb-2">
            <Wallet className="w-4 h-4" />
            <span>Informasi Saldo</span>
          </div>
          {/* Example format: Saldo: Rp 1.500.000 */}
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Saldo: {formatCurrency(balance)}
            </h2>
          </div>
          <p className="mt-1 text-xs text-indigo-200">
            Dapat digunakan untuk transfer dana dan pembayaran.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenTopUp}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <span>Top-up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
