import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// 🔍 Parse proprement l’URL en string
const connectionString = String(process.env.DB_URL).trim();

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// ✅ Vérification connexion
pool
  .connect()
  .then((client) => {
    console.log("✅ Connecté à PostgreSQL (via DB_URL)");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à PostgreSQL :", err.message);
  });
