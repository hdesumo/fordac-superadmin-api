import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

// =====================================
// 🔐 Connexion du SuperAdmin
// =====================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis." });

  try {
    const result = await pool.query(
      "SELECT * FROM superadmin WHERE email = $1",
      [email]
    );
    if (result.rowCount === 0)
      return res.status(401).json({ message: "Identifiants incorrects." });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Identifiants incorrects." });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "fordac_secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie.",
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Erreur /login:", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// =====================================
// 👥 Création d’un administrateur
// =====================================
router.post("/admins", async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO admins (name, email, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [name, email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la création d’un admin :", err);
    res.status(500).json({ error: "Erreur lors de la création de l’administrateur." });
  }
});

// =====================================
// 📅 Gestion des événements (exemple)
// =====================================
router.post("/events", async (req, res) => {
  const { title, date, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (title, date, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [title, date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création event:", err);
    res.status(500).json({ message: "Erreur lors de la création de l’événement." });
  }
});

// =====================================
// 🔄 Réinitialisation du mot de passe
// =====================================

// Étape 1 : demande de réinitialisation
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Adresse e-mail requise." });

  try {
    const result = await pool.query(
      "SELECT id, email FROM superadmin WHERE email = $1",
      [email]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Aucun compte trouvé avec cet e-mail." });

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "fordac_secret", {
      expiresIn: "15m",
    });

    const resetLink = `https://fordac-superadmin-frontend.vercel.app/reset-password/${token}`;

    await sendResetPasswordEmail(email, resetLink);
    res.json({ message: "E-mail de réinitialisation envoyé." });
  } catch (err) {
    console.error("Erreur /reset-password:", err);
    res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
  }
});

// Étape 2 : confirmation du nouveau mot de passe
router.post("/reset-password/confirm", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "Token ou mot de passe manquant." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fordac_secret");

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE superadmin SET password = $1 WHERE email = $2",
      [hashedPassword, decoded.email]
    );

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur /reset-password/confirm:", err);
    res.status(400).json({ message: "Lien invalide ou expiré." });
  }
});

export default router;
