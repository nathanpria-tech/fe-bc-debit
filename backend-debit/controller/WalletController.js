const { pool: db } = require("../utils/db");

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      "SELECT id, username, balance FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        balance: Number(users[0].balance),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
      error: error.message,
    });
  }
};

const topup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    // Kosong
    if (amount === undefined || amount === null || amount === "") {
      return res.status(422).json({
        success: false,
        message: "Nominal tidak boleh kosong.",
      });
    }

    // Harus angka
    if (!/^\d+$/.test(String(amount))) {
      return res.status(422).json({
        success: false,
        message: "Nominal harus berupa angka.",
      });
    }

    const nominal = Number(amount);

    // Tidak boleh negatif / 0
    if (nominal <= 0) {
      return res.status(422).json({
        success: false,
        message: "Nominal harus lebih dari 0.",
      });
    }

    // Maksimal transaksi
    const MAX_TRANSACTION = 10000000;

    if (nominal > MAX_TRANSACTION) {
      return res.status(422).json({
        success: false,
        message: "Nominal melebihi batas maksimum transaksi.",
      });
    }

    await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
      nominal,
      userId,
    ]);

    await db.query(
      `INSERT INTO transactions
            (sender_id, receiver_id, type, amount, description)
            VALUES (?, ?, ?, ?, ?)`,
      [null, userId, "TOPUP", nominal, "Top up saldo"],
    );

    const [updatedUsers] = await db.query(
      "SELECT balance FROM users WHERE id = ?",
      [userId],
    );

    return res.status(200).json({
      success: true,
      message: "Top up berhasil.",
      data: {
        amount: nominal,
        balance: Number(updatedUsers[0]?.balance || 0),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Top up gagal.",
      error: error.message,
    });
  }
};

const transfer = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const senderId = req.user.id;
    const { receiver, amount } = req.body;

    // =========================
    // VALIDASI NOMINAL
    // =========================

    if (amount === undefined || amount === null || amount === "") {
      return res.status(422).json({
        success: false,
        message: "Nominal tidak boleh kosong.",
      });
    }

    if (!/^\d+$/.test(String(amount))) {
      return res.status(422).json({
        success: false,
        message: "Nominal harus berupa angka.",
      });
    }

    const nominal = Number(amount);

    if (nominal <= 0) {
      return res.status(422).json({
        success: false,
        message: "Nominal harus lebih dari 0.",
      });
    }

    const MAX_TRANSACTION = 10000000;

    if (nominal > MAX_TRANSACTION) {
      return res.status(422).json({
        success: false,
        message: "Nominal melebihi batas maksimum transaksi.",
      });
    }

    if (!receiver) {
      return res.status(422).json({
        success: false,
        message: "Email atau nomor HP penerima wajib diisi.",
      });
    }

    // =========================
    // MULAI TRANSACTION DATABASE
    // =========================

    await connection.beginTransaction();

    // Ambil pengirim
    const [senders] = await connection.query(
      "SELECT * FROM users WHERE id = ? FOR UPDATE",
      [senderId],
    );

    const sender = senders[0];

    // Cari penerima (bisa menggunakan email, nomor hp, atau username)
    const [receivers] = await connection.query(
      `SELECT * FROM users
             WHERE email = ? OR phone = ? OR username = ?
             FOR UPDATE`,
      [receiver, receiver, receiver],
    );

    if (receivers.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "User penerima tidak ditemukan.",
      });
    }

    const recipient = receivers[0];

    // Tidak boleh transfer ke diri sendiri
    if (sender.id === recipient.id) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Tidak dapat transfer ke akun sendiri.",
      });
    }

    // Cek saldo
    if (Number(sender.balance) < nominal) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Saldo tidak mencukupi.",
      });
    }

    // =========================
    // KURANGI SALDO PENGIRIM
    // =========================

    await connection.query(
      `UPDATE users
             SET balance = balance - ?
             WHERE id = ?`,
      [nominal, sender.id],
    );

    // =========================
    // TAMBAH SALDO PENERIMA
    // =========================

    await connection.query(
      `UPDATE users
             SET balance = balance + ?
             WHERE id = ?`,
      [nominal, recipient.id],
    );

    // =========================
    // SIMPAN TRANSAKSI KE DATABASE
    // =========================

    await connection.query(
      `INSERT INTO transactions
            (sender_id, receiver_id, type, amount, description)
            VALUES (?, ?, ?, ?, ?)`,
      [sender.id, recipient.id, "TRANSFER", nominal, `Transfer ke ${recipient.username}`],
    );

    // Semua berhasil
    await connection.commit();

    const [senderUpdated] = await db.query(
      "SELECT balance FROM users WHERE id = ?",
      [sender.id],
    );

    return res.status(200).json({
      success: true,
      message: "Transfer berhasil.",
      data: {
        amount: nominal,
        receiver: recipient.username,
        balance: Number(senderUpdated[0]?.balance || 0),
      },
    });
  } catch (error) {
    await connection.rollback();

    return res.status(400).json({
      success: false,
      message: "Transfer gagal. Saldo tidak berubah.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [transactions] = await db.query(
      `SELECT t.id, t.sender_id, t.receiver_id, t.type, t.amount, t.description, t.created_at,
              s.username AS sender_name, r.username AS receiver_name
       FROM transactions t
       LEFT JOIN users s ON t.sender_id = s.id
       LEFT JOIN users r ON t.receiver_id = r.id
       WHERE t.sender_id = ? OR t.receiver_id = ?
       ORDER BY t.created_at DESC`,
      [userId, userId],
    );

    const formatted = transactions.map((t) => {
      const isTopUp = t.type === "TOPUP";
      const isSender = t.sender_id === userId;
      const displayType = isTopUp ? "Top-up" : "Transfer";

      let dynamicDescription = t.description;
      if (isTopUp) {
        dynamicDescription = "Top up saldo";
      } else if (isSender) {
        dynamicDescription = `Transfer ke ${t.receiver_name || "pengguna"}`;
      } else {
        dynamicDescription = `Transfer dari ${t.sender_name || "pengguna"}`;
      }

      return {
        id: t.id,
        date: t.created_at,
        created_at: t.created_at,
        type: displayType,
        is_sender: isSender,
        is_incoming: isTopUp || !isSender,
        amount: Number(t.amount),
        status: "Success",
        description: dynamicDescription,
        sender_name: t.sender_name,
        receiver_name: t.receiver_name,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat transaksi.",
      error: error.message,
    });
  }
};

const checkRecipient = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver } = req.body;

    if (!receiver || !receiver.trim()) {
      return res.status(422).json({
        success: false,
        message: "Email atau nomor HP penerima wajib diisi.",
      });
    }

    const target = receiver.trim();

    const [receivers] = await db.query(
      `SELECT id, username, email, phone FROM users WHERE email = ? OR phone = ? OR username = ?`,
      [target, target, target]
    );

    if (receivers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User penerima tidak ditemukan.",
      });
    }

    const recipient = receivers[0];

    if (recipient.id === senderId) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat transfer ke akun sendiri.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: recipient.id,
        username: recipient.username,
        email: recipient.email,
        phone: recipient.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memeriksa penerima.",
      error: error.message,
    });
  }
};

module.exports = {
  getWallet,
  topup,
  transfer,
  getTransactions,
  checkRecipient,
};
