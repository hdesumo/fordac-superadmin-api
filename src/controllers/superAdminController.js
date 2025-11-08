// src/controllers/superAdminController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";

// ------------------------------
// 🔑 Connexion SuperAdmin
// ------------------------------
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      "SELECT * FROM superadmins WHERE email = $1",
      [email]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "SuperAdmin introuvable" });

    const superadmin = rows[0];
    const valid = await bcrypt.compare(password, superadmin.password);
    if (!valid)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: superadmin.id, email: superadmin.email },
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
  } catch (err) {
    console.error("Erreur loginSuperAdmin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ------------------------------
// 👥 Création d’un Admin
// ------------------------------
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role || "admin"]
    );

    res.status(201).json({ message: "Admin créé avec succès" });
  } catch (err) {
    console.error("Erreur createAdmin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ------------------------------
// 📋 Liste des Admins
// ------------------------------
export const getAllAdmins = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erreur getAllAdmins :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ------------------------------
// ❌ Suppression d’un Admin
// ------------------------------
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);
    res.json({ message: "Admin supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteAdmin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ------------------------------
// 📊 Statistiques du tableau de bord
// ------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const adminCount = await pool.query("SELECT COUNT(*) FROM admins");
    const eventCount = await pool.query("SELECT COUNT(*) FROM events");
    const activityCount = await pool.query("SELECT COUNT(*) FROM activities");

    res.json({
      total_admins: parseInt(adminCount.rows[0].count) || 0,
      total_events: parseInt(eventCount.rows[0].count) || 0,
      total_activities: parseInt(activityCount.rows[0].count) || 0,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Erreur getDashboardStats :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
