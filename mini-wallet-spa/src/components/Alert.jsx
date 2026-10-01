import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose, className = '' }) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-500',
      icon: AlertCircle,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconColor: 'text-emerald-500',
      icon: CheckCircle2,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-500',
      icon: Info,
    },
  }[type] || {
    bg: 'bg-gray-50 border-gray-200 text-gray-800',
    iconColor: 'text-gray-500',
    icon: Info,
  };

  const IconComponent = styles.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${styles.bg} ${className}`}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
