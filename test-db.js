import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

console.log("🔍 Type de DB_PASS:", typeof process.env.DB_PASS);
console.log("🔍 Valeur de DB_PASS:", process.env.DB_PASS);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASS),
  database: process.env.DB_NAME,
  ssl: false,
});

pool
  .connect()
  .then(() => console.log("✅ Connexion PostgreSQL réussie"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message))
  .finally(() => pool.end());
