// src/controllers/superAdminController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Connexion SuperAdmin avec JWT
export const loginSuperAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    const result = await pool.query("SELECT * FROM superadmin WHERE username = $1", ["superadmin"]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ error: "SuperAdmin introuvable." });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    console.error("Erreur de connexion SuperAdmin :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// ✅ Middleware de vérification du token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide." });
    }
    req.superadmin = decoded;
    next();
  });
};

// ✅ Endpoint pour tester la validité du token
export const verifySuperAdmin = (req, res) => {
  res.json({ valid: true, superadmin: req.superadmin });
};

// ✅ Changement de mot de passe SuperAdmin
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const result = await pool.query("SELECT * FROM superadmin WHERE username = $1", ["superadmin"]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ error: "SuperAdmin introuvable." });
    }

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE superadmin SET password = $1 WHERE username = $2", [hashed, "superadmin"]);

    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// ✅ CRUD basique des événements
export const getEvents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération événements :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const result = await pool.query(
      "INSERT INTO events (title, date, description) VALUES ($1, $2, $3) RETURNING *",
      [title, date, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur création événement :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.json({ message: "Événement supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression événement :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
