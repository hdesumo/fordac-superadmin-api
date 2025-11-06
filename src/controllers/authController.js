import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import nodemailer from "nodemailer";

/**
 * ✅ Connexion SuperAdmin
 */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email introuvable" });
    }

    const superAdmin = result.rows[0];
    const validPassword = await bcrypt.compare(password, superAdmin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: superAdmin.id, email: superAdmin.email, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ message: "Connexion réussie", token });
  } catch (err) {
    console.error("Erreur login superadmin:", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * 🔄 Réinitialisation de mot de passe
 */
export const resetSuperAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email introuvable" });
    }

    const superAdmin = result.rows[0];
    const resetToken = jwt.sign({ id: superAdmin.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Envoi du mail de réinitialisation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: `"FORDAC Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe FORDAC",
      html: `
        <p>Bonjour ${superAdmin.name},</p>
        <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
        <a href="${resetLink}" target="_blank">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.</p>
      `,
    });

    res.json({ message: "Email de réinitialisation envoyé avec succès" });
  } catch (err) {
    console.error("Erreur reset superadmin:", err);
    res.status(500).json({ message: "Erreur serveur lors de la réinitialisation" });
  }
};
