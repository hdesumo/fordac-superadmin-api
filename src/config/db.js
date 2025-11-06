import mysql from "mysql2/promise";

// ✅ Création d’un pool de connexions MySQL (compatible Railway)
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fordac_superadmin",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Export par défaut (facultatif, pour compatibilité)
export default pool;
