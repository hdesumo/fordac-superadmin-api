// src/controllers/superAdminController.js
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * 🧩 Connexion du SuperAdmin
 * Vérifie l'email et le mot de passe, renvoie un token JWT
 */
export const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM superadmins WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin non trouvé ❌" });
    }

    const superadmin = result.rows[0];

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect 🚫" });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: superadmin.id, email: superadmin.email, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie ✅",
      token,
      superadmin: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email,
      },
    });
  } catch (err) {
    console.error("Erreur lors de la connexion du SuperAdmin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 👤 Créer un nouvel admin
 */
export const createAdmin = async (req, res) => {
  const { name, email, department, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Champs manquants ❌" });
  }

  try {
    // Vérifie si l'email existe déjà
    const existing = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé ⚠️" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO admins (name, email, department, password, created_at, status) VALUES ($1, $2, $3, $4, NOW(), 'active') RETURNING *",
      [name, email, department, hashedPassword]
    );

    res.status(201).json({
      message: "Admin créé avec succès ✅",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("Erreur lors de la création d’un admin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 📊 Liste complète des admins
 */
export const getAllAdmins = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des admins :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🧠 Supprimer un admin
 */
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);
    res.json({ message: "Admin supprimé avec succès 🗑️" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l’admin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🚀 Infos du SuperAdmin (profil)
 */
export const getSuperAdminProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM superadmins WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profil introuvable ❌" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de la récupération du profil SuperAdmin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
