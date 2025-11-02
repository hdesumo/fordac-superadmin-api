import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

// =========================================
// 🔐 Connexion SuperAdmin
// =========================================
router.post("/superadmin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const result = await pool.query(
      "SELECT * FROM superadmins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin introuvable." });
    }

    const superadmin = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, superadmin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: superadmin.id, email: superadmin.email, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      superadmin: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion SuperAdmin :", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
});

// =========================================
// 🔄 Réinitialisation mot de passe
// =========================================
router.post("/superadmin-reset", async (req, res) => {
  const { email } = req.body;
  try {
    console.log("📩 Requête reçue pour réinitialisation :", email);

    const result = await pool.query(
      "SELECT * FROM superadmins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucun SuperAdmin trouvé." });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await pool.query(
      "UPDATE superadmins SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [resetToken, expiration, email]
    );

    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: "E-mail de réinitialisation envoyé avec succès." });
  } catch (error) {
    console.error("❌ Erreur dans superadmin-reset :", error);
    res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
  }
});

// =========================================
// 🧾 Logs d’activité
// =========================================
router.get("/admin-activity", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.action, a.ip_address, a.created_at, ad.name AS admin_name
       FROM admin_activity a
       LEFT JOIN admins ad ON ad.id = a.admin_id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des logs :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération." });
  }
});

export default router;
