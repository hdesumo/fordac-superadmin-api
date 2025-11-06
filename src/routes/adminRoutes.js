// ==========================================
// routes/adminRoutes.js
// ==========================================

import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// ---------------------------------------------------------
// 🧾 GET /api/admins - Liste complète des admins
// ---------------------------------------------------------
router.get("/admins", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, department, status, created_at 
       FROM admins 
       ORDER BY created_at DESC`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur récupération admins :", error);
    res.status(500).json({ message: "Erreur serveur lors du chargement des admins." });
  }
});

// ---------------------------------------------------------
// ➕ POST /api/admins - Création d’un nouvel admin
// ---------------------------------------------------------
router.post("/admins", async (req, res) => {
  const { name, email, department, status } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ message: "Champs obligatoires manquants." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO admins (name, email, department, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [name, email, department, status || "active"]
    );

    // 🔹 Log dans admin_activities
    await pool.query(
      `INSERT INTO admin_activities (admin_id, action, ip_address)
       VALUES ($1, $2, $3)`,
      [rows[0].id, "Création admin", req.ip]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("❌ Erreur création admin :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création de l’admin." });
  }
});

// ---------------------------------------------------------
// ✏️ PUT /api/admins/:id - Modification d’un admin
// ---------------------------------------------------------
router.put("/admins/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, department, status } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE admins
       SET name = $1, email = $2, department = $3, status = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, department, status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin introuvable." });
    }

    // 🔹 Log dans admin_activities
    await pool.query(
      `INSERT INTO admin_activities (admin_id, action, ip_address)
       VALUES ($1, $2, $3)`,
      [id, "Modification admin", req.ip]
    );

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Erreur modification admin :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
});

// ---------------------------------------------------------
// ❌ DELETE /api/admins/:id - Suppression d’un admin
// ---------------------------------------------------------
router.delete("/admins/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM admins WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin introuvable." });
    }

    // 🔹 Log dans admin_activities
    await pool.query(
      `INSERT INTO admin_activities (admin_id, action, ip_address)
       VALUES ($1, $2, $3)`,
      [id, "Suppression admin", req.ip]
    );

    res.json({ message: "Admin supprimé avec succès ✅" });
  } catch (error) {
    console.error("❌ Erreur suppression admin :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
});

export default router;
