import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ✅ Création d’un pool de connexions MySQL
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fordac_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Test immédiat de la connexion
try {
  const [rows] = await pool.query("SELECT 1");
  console.log("✅ Base de données connectée avec succès");
} catch (error) {
  console.error("❌ Erreur de connexion à la base :", error.message);
}
