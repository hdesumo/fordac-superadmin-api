import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await pool.query("SELECT * FROM superadmin LIMIT 1");
    if (result.rows.length === 0) return res.status(404).json({ error: "Compte introuvable." });

    const superadmin = result.rows[0];
    const valid = await bcrypt.compare(oldPassword, superadmin.password_hash);
    if (!valid) return res.status(401).json({ error: "Mot de passe actuel incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE superadmin SET password_hash = $1", [hashed]);
    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur changePassword:", error);
    res.status(500).json({ error: "Erreur serveur lors du changement de mot de passe." });
  }
};
