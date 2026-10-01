const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
require("dotenv").config({ quiet: true });

async function seed() {
  console.log("🌱 Starting Database Seed for Mini Wallet...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT_MYSQL || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    const dbName = process.env.DB_DATABASED || "mini_wallet";
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    // Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(20) NOT NULL UNIQUE,
        \`balance\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`transactions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`sender_id\` INT NULL,
        \`receiver_id\` INT NULL,
        \`type\` ENUM('TOPUP', 'TRANSFER') NOT NULL,
        \`amount\` DECIMAL(15, 2) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`sender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`receiver_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅ Tables created or verified.");

    const hashedDummyPassword = await bcrypt.hash("dummy", 10);

    // Insert Nathan if not exists
    const [nathanExist] = await connection.query(
      "SELECT id FROM users WHERE username = 'nathan'",
    );
    let nathanId;
    if (nathanExist.length === 0) {
      const [res] = await connection.query(
        `INSERT INTO users (username, email, password, phone, balance) VALUES (?, ?, ?, ?, ?)`,
        [
          "nathan",
          "nathan@gmail.com",
          hashedDummyPassword,
          "081234567890",
          100000.0,
        ],
      );
      nathanId = res.insertId;
      console.log("👤 Demo User Created: nathan / dummy (Saldo: Rp 100.000)");
    } else {
      nathanId = nathanExist[0].id;
    }

    // Insert Budi if not exists
    const [budiExist] = await connection.query(
      "SELECT id FROM users WHERE username = 'budi'",
    );
    let budiId;
    if (budiExist.length === 0) {
      const [res] = await connection.query(
        `INSERT INTO users (username, email, password, phone, balance) VALUES (?, ?, ?, ?, ?)`,
        [
          "budi",
          "budi@gmail.com",
          hashedDummyPassword,
          "081298765432",
          50000.0,
        ],
      );
      budiId = res.insertId;
      console.log("👤 Demo User Created: budi / dummy (Saldo: Rp 50.000)");
    } else {
      budiId = budiExist[0].id;
    }

    // Seed sample initial transactions if table is empty
    const [txCount] = await connection.query(
      "SELECT COUNT(*) as cnt FROM transactions",
    );
    if (txCount[0].cnt === 0 && nathanId && budiId) {
      await connection.query(
        `INSERT INTO transactions (sender_id, receiver_id, type, amount, description) VALUES
         (NULL, ?, 'TOPUP', 100000, 'Top up saldo awal'),
         (NULL, ?, 'TOPUP', 50000, 'Top up saldo awal')`,
        [nathanId, budiId],
      );
      console.log("💸 Sample transactions seeded.");
    }

    console.log(
      "🎉 Database Seed Complete! You can now test with nathan/dummy or budi/dummy.",
    );
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
  } finally {
    await connection.end();
  }
}

seed();
