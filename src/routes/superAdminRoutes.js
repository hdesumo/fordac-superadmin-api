import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

// ✅ Vérification simple (pour test)
router.get("/ping", (req, res) => {
  res.json({ message: "Ping OK depuis superAdminRoutes" });
});

// ✅ Route testée : envoi mail de réinitialisation
router.post("/superadmin-reset", async (req, res) => {
  const { email } = req.body;

  try {
    console.log("📩 Requête reçue pour réinitialisation :", email);

    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      console.log("⚠️ Aucun SuperAdmin trouvé pour :", email);
      return res.status(404).json({ message: "Aucun SuperAdmin trouvé avec cet e-mail." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await pool.query(
      "UPDATE superadmins SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [token, expiresAt, email]
    );

    const resetLink = `https://fordac-superadmin.vercel.app/reset-password/confirm/${token}`;
    await sendResetPasswordEmail(email, resetLink);

    console.log(`✅ Email envoyé à ${email} avec lien : ${resetLink}`);
    return res.json({ message: "E-mail de réinitialisation envoyé avec succès." });
  } catch (error) {
    console.error("❌ Erreur dans superadmin-reset :", error);
    return res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
  }
});

export default router;
