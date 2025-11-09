import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.DB_USE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default pool;
