import express from "express";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

/**
 * ✅ Connexion SuperAdmin
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM superadmin WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const admin = result.rows[0];
    if (password !== admin.password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    return res.json({ message: "Connexion réussie", admin });
  } catch (error) {
    console.error("Erreur login :", error.message);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

/**
 * ✅ Création d’un nouvel administrateur
 */
router.post("/admins", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const result = await pool.query(
      "INSERT INTO admins (name, email, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [name, email, role]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création de l’administrateur :", error.message);
    res.status(500).json({ error: "Erreur lors de la création de l’administrateur." });
  }
});

/**
 * ✅ Suppression d’un administrateur
 */
router.delete("/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);
    res.json({ message: "Administrateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression admin :", error.message);
    res.status(500).json({ error: "Erreur lors de la suppression de l’administrateur." });
  }
});

/**
 * ✅ Liste des administrateurs
 */
router.get("/admins", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération admins :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des administrateurs." });
  }
});

/**
 * ✅ Création d’un événement
 */
router.post("/events", async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const result = await pool.query(
      "INSERT INTO events (title, date, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [title, date, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur création événement :", error.message);
    res.status(500).json({ error: "Erreur lors de la création de l’événement." });
  }
});

/**
 * ✅ Suppression d’un événement
 */
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.json({ message: "Événement supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression événement :", error.message);
    res.status(500).json({ error: "Erreur lors de la suppression de l’événement." });
  }
});

/**
 * ✅ Liste des événements
 */
router.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération événements :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des événements." });
  }
});

/**
 * ✅ Réinitialisation du mot de passe (avec envoi d’e-mail)
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifie que le superadmin existe
    const result = await pool.query("SELECT * FROM superadmin WHERE username = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucun compte trouvé avec cet e-mail." });
    }

    // Génère un token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Enregistre en base (si colonnes disponibles)
    try {
      await pool.query(
        "ALTER TABLE superadmin ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255), ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;"
      );
      await pool.query(
        "UPDATE superadmin SET reset_token = $1, reset_expires = NOW() + INTERVAL '30 minutes' WHERE username = $2",
        [resetToken, email]
      );
    } catch (err) {
      console.warn("⚠️ Impossible d’enregistrer le token (colonne absente)", err.message);
    }

    // Envoi du mail
    const response = await sendResetPasswordEmail(email, resetToken);
    if (response.success) {
      return res.json({ message: "E-mail de réinitialisation envoyé avec succès." });
    } else {
      console.error("Erreur lors de l’envoi du mail :", response.error);
      return res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
    }
  } catch (error) {
    console.error("Erreur reset-password :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

export default router;
