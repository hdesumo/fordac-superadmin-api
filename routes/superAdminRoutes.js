import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";
import {
  loginSuperAdmin,
  getAdmins,
  createAdmin,
  getEvents,
  createEvent,
} from "../controllers/superAdminController.js";

const router = express.Router();

// ========================
// 🔐 Authentification
// ========================
router.post("/superadmin/login", loginSuperAdmin);

// ========================
// 👥 Gestion des Admins
// ========================
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);

// ========================
// 📅 Gestion des Événements
// ========================
router.get("/events", getEvents);
router.post("/events", createEvent);

// ========================
// 🔁 Réinitialisation du mot de passe SuperAdmin
// ========================

// 1️⃣ Envoi du lien de réinitialisation
router.post("/superadmin-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Aucun SuperAdmin trouvé avec cet e-mail." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // expire dans 30 minutes

    await pool.query(
      "UPDATE superadmins SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [token, expiresAt, email]
    );

    const resetLink = `https://fordac-superadmin.vercel.app/reset-password/confirm/${token}`;

    await sendResetPasswordEmail(email, resetLink);

    return res.json({ message: "E-mail de réinitialisation envoyé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation :", error);
    return res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
  }
});

// 2️⃣ Vérification du token reçu
router.get("/superadmin-verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM superadmins WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error("Erreur vérification token :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// 3️⃣ Confirmation du nouveau mot de passe
router.post("/superadmin-reset-confirm/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM superadmins WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Lien expiré ou invalide." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE superadmins SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2",
      [hashedPassword, token]
    );

    return res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

export default router;
