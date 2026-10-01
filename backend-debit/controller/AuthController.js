const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool: db } = require("../utils/db");

const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Validasi kosong
    if (!username || !email || !password || !phone) {
      return res.status(422).json({
        success: false,
        message: "Semua field wajib diisi.",
      });
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(422).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    // Validasi password
    if (password.length < 8) {
      return res.status(422).json({
        success: false,
        message: "Password minimal 8 karakter.",
      });
    }

    // Cek username
    const [existingUsername] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );

    if (existingUsername.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Username sudah digunakan.",
      });
    }

    // Cek email
    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingEmail.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Email sudah digunakan.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
            (username, email, password, phone, balance)
            VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, phone, 0],
    );

    return res.status(201).json({
      success: true,
      message: "Register berhasil.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server.",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginUser = email || username || identifier;

    if (!loginUser || !password) {
      return res.status(422).json({
        success: false,
        message: "Email/username dan password wajib diisi.",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [loginUser, loginUser],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          balance: Number(user.balance),
        },
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

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query(
      "SELECT id, username, email, phone, balance FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    const user = users[0];
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        balance: Number(user.balance),
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

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout berhasil.",
  });
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
