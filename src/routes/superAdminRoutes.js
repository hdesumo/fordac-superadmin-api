import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

console.log("✅ superAdminRoutes chargé !");

// =============================
// 🔐 Authentification SuperAdmin
// =============================
router.post("/superadmin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Mot de passe incorrect" });

    return res.json({ message: "Connexion réussie", user });
  } catch (err) {
    console.error("Erreur login superadmin:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// =============================
// 👥 Gestion des admins
// =============================
router.get("/admins", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération admins:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des admins." });
  }
});

router.post("/admins", async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO admins (name, email, role) VALUES ($1, $2, $3) RETURNING *",
      [name, email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création admin:", err);
    res.status(500).json({ message: "Erreur lors de la création de l’administrateur." });
  }
});

// =============================
// 📅 Gestion des événements
// =============================
router.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération événements:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des événements." });
  }
});

router.post("/events", async (req, res) => {
  const { title, date, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (title, date, description) VALUES ($1, $2, $3) RETURNING *",
      [title, date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur création événement:", err);
    res.status(500).json({ message: "Erreur lors de la création de l’événement." });
  }
});

// =============================
// 🔁 Réinitialisation du mot de passe SuperAdmin
// =============================
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
