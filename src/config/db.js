import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// ✅ Création du pool de connexions PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fordac_db",
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// ✅ Test immédiat de la connexion
try {
  const client = await pool.connect();
  console.log("✅ Connexion PostgreSQL réussie");
  client.release();
} catch (error) {
  console.error("❌ Erreur de connexion PostgreSQL :", error.message);
}
