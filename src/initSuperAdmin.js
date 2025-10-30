import bcrypt from "bcryptjs";
import { pool } from "./config/db.js";

/**
 * Script d’initialisation du SuperAdmin FORDAC
 * -----------------------------------------------------
 * Ce script :
 *  - Supprime tout ancien SuperAdmin existant
 *  - Crée un nouveau compte avec mot de passe hashé
 *  - Affiche le résultat dans la console
 */

const initSuperAdmin = async () => {
  try {
    console.log("🧹 Suppression de tout ancien SuperAdmin...");
    await pool.query("DELETE FROM superadmin");

    const username = "superadmin";
    const password = "FORDAC@2025";

    console.log("🔐 Hash du mot de passe...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🧱 Insertion du nouveau SuperAdmin...");
    const result = await pool.query(
      "INSERT INTO superadmin (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );

    console.log("✅ SuperAdmin initialisé avec succès !");
    console.table(result.rows);
  } catch (err) {
    console.error("❌ Erreur d'initialisation :", err.message);
  } finally {
    await pool.end();
  }
};

initSuperAdmin();
