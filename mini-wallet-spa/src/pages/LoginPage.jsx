import React, { useState } from 'react';
import { Wallet, Lock, Mail, Loader2, Eye, EyeOff, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const resetNotice = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    resetNotice();

    if (!identifier.trim() || !password) {
      setErrorMessage('Field wajib diisi: Silakan masukkan email/username dan password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Login gagal. Silakan periksa kembali data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    resetNotice();

    // 1. Validasi Field Kosong
    if (!regUsername.trim() || !regEmail.trim() || !regPassword || !regPhone.trim()) {
      setErrorMessage('Semua field registrasi wajib diisi.');
      return;
    }

    // 2. Validasi Format Email Valid (Skenario Invalid: user@)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setErrorMessage('Format email tidak valid. Contoh valid: user@example.com');
      return;
    }

    // 3. Validasi Password min 8 Karakter
    if (regPassword.length < 8) {
      setErrorMessage('Password minimal 8 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(regUsername.trim(), regEmail.trim(), regPassword, regPhone.trim());
      setSuccessMessage(res.message || 'Registrasi berhasil! Silakan login dengan akun Anda.');
      setIdentifier(regUsername.trim());
      setPassword(regPassword);
      setActiveTab('login');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegPhone('');
    } catch (err) {
      setErrorMessage(err.message || 'Registrasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (userType) => {
    if (isLoading) return;
    resetNotice();
    setActiveTab('login');
    if (userType === 'nathan') {
      setIdentifier('nathan');
      setPassword('dummy');
    } else {
      setIdentifier('budi');
      setPassword('dummy');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mini Wallet API
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sistem Dompet Digital & Transaksi Mutasi Real-time
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200">
          
          {/* Tab Navigation: Login / Register */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                resetNotice();
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                resetNotice();
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar (Register)
            </button>
          </div>

          {/* Notifikasi Pesan Sukses */}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
              className="mb-6"
            />
          )}

          {/* Notifikasi Pesan Error */}
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
              className="mb-6"
            />
          )}

          {/* FORM LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email atau Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="identifier"
                    type="text"
                    placeholder="Masukkan email/username"
                    value={identifier}
                    disabled={isLoading}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-md transition-all ${
                    isLoading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Login...</span>
                    </>
                  ) : (
                    <span>Login Masuk</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* FORM REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: user123"
                    value={regUsername}
                    disabled={isLoading}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Valid <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="user@domain.com (bukan user@)"
                    value={regEmail}
                    disabled={isLoading}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={regPhone}
                    disabled={isLoading}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Password (min. 8 karakter) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={regPassword}
                    disabled={isLoading}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-md transition-all ${
                    isLoading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Baru</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick Login buttons for testing */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2 font-medium">Akun Demo Pengujian Cepat:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('nathan')}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition font-semibold disabled:opacity-50"
              >
                Isi: nathan / dummy
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('budi')}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition font-semibold disabled:opacity-50"
              >
                Isi: budi / dummy
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
