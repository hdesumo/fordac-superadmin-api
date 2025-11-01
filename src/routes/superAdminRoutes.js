// src/routes/superAdminRoutes.js
import express from "express";
import pool from "../config/db.js";
import {
  loginSuperAdmin,
  changePassword,
  verifyToken,
  verifySuperAdmin,
  getEvents,
  createEvent,
  deleteEvent,
} from "../controllers/superAdminController.js";

const router = express.Router();

/* =========================================
   🔑 Authentification & sécurité
========================================= */
router.post("/superadmin/login", loginSuperAdmin);
router.post("/superadmin/change-password", verifyToken, changePassword);
router.get("/superadmin/verify", verifyToken, verifySuperAdmin);

/* =========================================
   👥 CRUD Administrateurs
========================================= */

// ➕ Créer un administrateur
router.post("/admins", async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    if (!name || !email || !role || !department) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    const result = await pool.query(
      "INSERT INTO admins (name, email, role, department) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, role, department]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur création admin :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📋 Liste de tous les administrateurs
router.get("/admins", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM admins ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération admins :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ Supprimer un administrateur
router.delete("/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM admins WHERE id=$1", [id]);
    res.json({ message: "Administrateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression admin :", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   📅 Gestion des événements
========================================= */
router.get("/events", verifyToken, getEvents);
router.post("/events", verifyToken, createEvent);
router.delete("/events/:id", verifyToken, deleteEvent);

/* =========================================
   🧾 Activité des administrateurs
========================================= */
router.get("/admins/activity", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.name, 
        a.email, 
        a.department,
        l.action, 
        l.timestamp, 
        l.ip_address
      FROM admin_logs l
      JOIN admins a ON l.admin_id = a.id
      ORDER BY l.timestamp DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération logs:", error.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
