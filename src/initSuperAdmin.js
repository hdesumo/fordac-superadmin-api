import bcrypt from "bcryptjs";
import { pool } from "./config/db.js";

const initSuperAdmin = async () => {
  try {
    const password = "FORDAC@2025"; // mot de passe initial
    const hash = await bcrypt.hash(password, 10);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS superadmin (
        id SERIAL PRIMARY KEY,
        password TEXT NOT NULL
      );
    `);

    const existing = await pool.query("SELECT * FROM superadmin");
    if (existing.rows.length === 0) {
      await pool.query("INSERT INTO superadmin (password) VALUES ($1)", [hash]);
      console.log("✅ SuperAdmin initialisé avec succès !");
    } else {
      console.log("ℹ️ Un SuperAdmin existe déjà.");
    }

    process.exit();
  } catch (err) {
    console.error("❌ Erreur d'initialisation :", err.message);
    process.exit(1);
  }
};

initSuperAdmin();
