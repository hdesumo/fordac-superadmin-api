// src/config/db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URL) {
  console.error("❌ Erreur : la variable DB_URL est manquante dans .env");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL (via DB_URL)"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message));
