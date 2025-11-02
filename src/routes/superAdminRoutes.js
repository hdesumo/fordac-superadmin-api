import express from "express";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

// ✅ 1. Route d'accueil (test)
router.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API SuperAdmin FORDAC 🚀",
    version: "1.0.0",
  });
});

// ✅ 2. Route de réinitialisation du mot de passe
router.post("/superadmin-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM superadmins WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin non trouvé." });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await pool.query(
      "UPDATE superadmins SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [resetToken, expiresAt, email]
    );

    await sendResetPasswordEmail(email, resetToken);
    res.json({ message: "E-mail de réinitialisation envoyé avec succès." });
  } catch (error) {
    console.error("❌ Erreur superadmin-reset :", error);
    res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
  }
});

// ✅ 3. Liste des administrateurs
router.get("/admins", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.email, d.name AS department_name
       FROM admins a
       LEFT JOIN departments d ON d.id = a.department_id
       ORDER BY a.id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur /admins :", error);
    res.status(500).json({ message: "Erreur lors du chargement des admins." });
  }
});

// ✅ 4. Journal d’activité complet
router.get("/admin-activity", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        aa.id,
        aa.admin_id,
        a.name AS admin_name,
        aa.action,
        aa.ip_address,
        aa.created_at
      FROM admin_activity aa
      LEFT JOIN admins a ON a.id = aa.admin_id
      ORDER BY aa.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur /admin-activity :", error);
    res.status(500).json({ message: "Erreur lors du chargement des activités." });
  }
});

export default router;
