/**
 * API Client for Mini Wallet Frontend
 * Seamlessly integrates with backend-debit (Express + MySQL + JWT)
 * Uses Bearer JWT token header and credentials: 'include'.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper to get stored auth token
function getAuthToken() {
  return sessionStorage.getItem('mini_wallet_token');
}

function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem('mini_wallet_token', token);
  } else {
    sessionStorage.removeItem('mini_wallet_token');
  }
}

// Fallback mock database if backend is offline
const DEFAULT_MOCK_USERS = [
  { id: 1, username: 'nathan', email: 'nathan@gmail.com', phone: '081234567890', password: 'dummy', balance: 100000 },
  { id: 2, username: 'budi', email: 'budi@gmail.com', phone: '081298765432', password: 'dummy', balance: 50000 },
];
let mockUsers = [...DEFAULT_MOCK_USERS];
let mockTransactions = [
  { id: 1, date: '2026-10-01T08:30:00Z', type: 'Transfer', amount: 100000, status: 'Success', description: 'Transfer ke budi' },
  { id: 2, date: '2026-10-01T07:15:00Z', type: 'Top-up', amount: 500000, status: 'Success', description: 'Top up saldo' },
  { id: 3, date: '2026-09-30T14:40:00Z', type: 'Transfer', amount: 200000, status: 'Failed', description: 'Transfer ke toko (Saldo tidak cukup)' },
];
let currentSessionUser = null;
let isUsingMock = false;

const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const walletApi = {
  getAuthToken,
  setAuthToken,

  /**
   * 0. REGISTER
   * Compatible with backend-debit POST /api/register
   */
  async register(username, email, password, phone) {
    if (!username || !email || !password || !phone) {
      throw new Error('Semua field wajib diisi.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format email tidak valid (contoh: user@gmail.com).');
    }

    if (password.length < 8) {
      throw new Error('Password minimal 8 karakter.');
    }

    if (!isUsingMock) {
      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Register gagal.');
        }

        return data;
      } catch (err) {
        if (err.message.includes('fetch') || err.name === 'TypeError') {
          isUsingMock = true;
        } else {
          throw err;
        }
      }
    }

    // Mock fallback
    await sleep(600);
    const existingUser = mockUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUser) {
      throw new Error('Username sudah digunakan.');
    }

    const existingEmail = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingEmail) {
      throw new Error('Email sudah digunakan.');
    }

    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      balance: 0,
    };
    mockUsers.push(newUser);
    return { success: true, message: 'Register berhasil. Silakan login.' };
  },

  /**
   * 1. LOGIN
   * Compatible with backend-debit POST /api/login
   */
  async login(identifier, password) {
    if (!identifier || !password) {
      throw new Error('Field wajib diisi: Email/username dan password wajib diisi.');
    }

    if (!isUsingMock) {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: identifier.trim(),
            username: identifier.trim(),
            identifier: identifier.trim(),
            password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 422) {
            throw new Error(data.message || 'Field wajib diisi.');
          }
          if (response.status === 401) {
            throw new Error(data.message || 'Email atau password salah.');
          }
          if (response.status >= 500) {
            throw new Error(data.message || 'Terjadi kesalahan pada server.');
          }
          throw new Error(data.message || 'Login gagal.');
        }

        // Save token from backend-debit response { success: true, data: { token } }
        const token = data.data?.token || data.token;
        if (token) {
          setAuthToken(token);
        }

        // Fetch wallet details
        const profile = await this.getProfile();
        return profile;
      } catch (err) {
        if (err.message.includes('fetch') || err.name === 'TypeError') {
          console.warn('Backend server offline, switching to mock mode.', err.message);
          isUsingMock = true;
        } else {
          throw err;
        }
      }
    }

    // Fallback Mock
    await sleep(600);
    const user = mockUsers.find(
      (u) =>
        (u.email.toLowerCase() === identifier.toLowerCase() ||
          u.username.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      throw new Error('Email/username atau password salah.');
    }

    currentSessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
    };
    return { ...currentSessionUser };
  },

  /**
   * 2. GET USER PROFILE & WALLET BALANCE
   * Compatible with backend-debit GET /api/wallet
   */
  async getProfile() {
    const token = getAuthToken();

    if (!isUsingMock) {
      try {
        const response = await fetch(`${API_BASE_URL}/wallet`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401) {
            setAuthToken(null);
            throw new Error('Sesi telah berakhir. Silakan login kembali.');
          }
          throw new Error(data.message || 'Gagal mengambil data wallet.');
        }

        const walletData = data.data || data;
        return {
          id: walletData.id,
          username: walletData.username,
          email: walletData.email || `${walletData.username}@wallet.com`,
          balance: Number(walletData.balance) || 0,
        };
      } catch (err) {
        if (err.message.includes('fetch') || err.name === 'TypeError') {
          isUsingMock = true;
        } else {
          throw err;
        }
      }
    }

    await sleep(300);
    if (!currentSessionUser) {
      currentSessionUser = { ...mockUsers[0] };
    }
    return { ...currentSessionUser };
  },

  /**
   * 3. TOP-UP
   * Compatible with backend-debit POST /api/topup
   */
  async topup(amount) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Nominal top-up harus lebih dari 0.');
    }

    const token = getAuthToken();

    if (!isUsingMock) {
      try {
        const response = await fetch(`${API_BASE_URL}/topup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ amount: numAmount }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Top-up gagal. Terjadi kesalahan pada server.');
        }

        // Return updated balance
        let newBalance = data.data?.balance;
        if (newBalance === undefined) {
          const profile = await this.getProfile();
          newBalance = profile.balance;
        }

        return {
          message: data.message || 'Top-up berhasil.',
          balance: newBalance,
        };
      } catch (err) {
        if (err.message.includes('fetch') || err.name === 'TypeError') {
          isUsingMock = true;
        } else {
          throw err;
        }
      }
    }

    await sleep(700);
    if (!currentSessionUser) {
      currentSessionUser = { ...mockUsers[0] };
    }
    currentSessionUser.balance += numAmount;

    mockTransactions.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'Top-up',
      amount: numAmount,
      status: 'Success',
      description: 'Top up saldo',
    });

    return {
      message: 'Top-up berhasil.',
      balance: currentSessionUser.balance,
    };
  },

  /**
   * 4. TRANSFER
   * Compatible with backend-debit POST /api/transfer
   */
  async transfer(recipient, amount) {
    if (!recipient || !recipient.trim()) {
      throw new Error('Tujuan / penerima wajib diisi.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Nominal transfer harus lebih besar dari Rp 0.');
    }

    const token = getAuthToken();

    if (!isUsingMock) {
      try {
        const response = await fetch(`${API_BASE_URL}/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({
            receiver: recipient.trim(),
            amount: numAmount,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errMsg = data.message || 'Transfer gagal.';
          if (response.status === 400 || response.status === 422) {
            throw new Error(errMsg.startsWith('Transfer gagal') ? errMsg : `Transfer gagal: ${errMsg}`);
          }
          throw new Error(errMsg);
        }

        let newBalance = data.data?.balance;
        if (newBalance === undefined) {
          const profile = await this.getProfile();
          newBalance = profile.balance;
        }

        return {
          message: data.message || 'Transfer berhasil.',
          balance: newBalance,
          receiver: data.data?.receiver || recipient,
        };
      } catch (err) {
        if (err.message.includes('fetch') || err.name === 'TypeError') {
          isUsingMock = true;
        } else {
          throw err;
        }
      }
    }

    await sleep(700);
    if (!currentSessionUser) {
      currentSessionUser = { ...mockUsers[0] };
    }

    if (numAmount > currentSessionUser.balance) {
      mockTransactions.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        type: 'Transfer',
        amount: numAmount,
        status: 'Failed',
        description: `Transfer ke ${recipient} (Saldo tidak cukup)`,
      });
      throw new Error('Transfer gagal: Saldo tidak cukup.');
    }

    if (
      recipient.trim().toLowerCase() === currentSessionUser.username.toLowerCase() ||
      recipient.trim().toLowerCase() === currentSessionUser.email.toLowerCase()
    ) {
      throw new Error('Tidak dapat transfer ke akun sendiri.');
    }

    const recipientTarget = recipient.trim().toLowerCase();
    const recipientUser = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === recipientTarget ||
        u.email.toLowerCase() === recipientTarget ||
        u.phone === recipientTarget
    );

    // Update balances
    currentSessionUser.balance -= numAmount;
    if (recipientUser) {
      recipientUser.balance += numAmount;
    }

    const recipientName = recipientUser ? recipientUser.username : recipient.trim();

    mockTransactions.unshift({
      id: Date.now(),
      sender_id: currentSessionUser.id,
      receiver_id: recipientUser ? recipientUser.id : null,
      sender_name: currentSessionUser.username,
      receiver_name: recipientName,
      date: new Date().toISOString(),
      type: 'TRANSFER',
      amount: numAmount,
      status: 'Success',
      description: `Transfer ke ${recipientName}`,
    });

    return {
      message: 'Transfer berhasil.',
      balance: currentSessionUser.balance,
      receiver: recipientName,
    };
  },

  /**
   * 5. GET TRANSACTIONS
   * Compatible with backend-debit GET /api/transactions
   */
  async getTransactions() {
    const token = getAuthToken();

    if (!isUsingMock) {
      try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengambil riwayat transaksi.');
        }

        const rawList = data.data || data.transactions || [];
        return rawList.map((tx) => ({
          id: tx.id,
          date: tx.date || tx.created_at,
          type: tx.type === 'TOPUP' || tx.type === 'topup' ? 'Top-up' : 'Transfer',
          is_sender: tx.is_sender,
          is_incoming: tx.is_incoming,
          amount: Number(tx.amount) || 0,
          status: tx.status || 'Success',
          description: tx.description || '',
          sender_name: tx.sender_name,
          receiver_name: tx.receiver_name,
        }));
      } catch (err) {
        if (err.message.includes('fetch') || err.name === 'TypeError') {
          isUsingMock = true;
        } else {
          throw err;
        }
      }
    }

    await sleep(400);

    // Filter transactions for current logged in mock user
    const filtered = mockTransactions.filter((tx) => {
      if (!currentSessionUser) return true;
      if (!tx.sender_id && !tx.receiver_id) return true;
      return (
        tx.sender_id === currentSessionUser.id ||
        tx.receiver_id === currentSessionUser.id ||
        (tx.sender_name && tx.sender_name.toLowerCase() === currentSessionUser.username.toLowerCase()) ||
        (tx.receiver_name && tx.receiver_name.toLowerCase() === currentSessionUser.username.toLowerCase())
      );
    });

    return filtered.map((tx) => {
      const isTopUp = tx.type === 'TOPUP' || (tx.description && tx.description.toLowerCase().includes('top'));
      const isSender = currentSessionUser
        ? tx.sender_id === currentSessionUser.id || (tx.sender_name && tx.sender_name.toLowerCase() === currentSessionUser.username.toLowerCase())
        : true;
      const isIncoming = isTopUp || !isSender;

      let desc = tx.description;
      if (isTopUp) {
        desc = 'Top up saldo';
      } else if (isSender) {
        desc = `Transfer ke ${tx.receiver_name || 'Pengguna'}`;
      } else {
        desc = `Transfer dari ${tx.sender_name || 'Pengguna'}`;
      }

      return {
        id: tx.id,
        date: tx.date || tx.created_at,
        type: isTopUp ? 'Top-up' : 'Transfer',
        is_sender: isSender,
        is_incoming: isIncoming,
        amount: Number(tx.amount) || 0,
        status: tx.status || 'Success',
        description: desc,
        sender_name: tx.sender_name,
        receiver_name: tx.receiver_name,
      };
    });
  },

  /**
   * 6. LOGOUT
   */
  async logout() {
    setAuthToken(null);
    currentSessionUser = null;
    return true;
  },
};
