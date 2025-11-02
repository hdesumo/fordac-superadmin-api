import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/**
 * ===========================================================
 * 📋 ROUTES DE GESTION DES DÉPARTEMENTS / SERVICES
 * ===========================================================
 */

/**
 * ✅ 1. Liste complète des départements
 */
router.get("/departments", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, created_at FROM departments ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Erreur GET /departments :", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération des départements." });
  }
});

/**
 * ✅ 2. Détails d’un département (par ID)
 */
router.get("/departments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM departments WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Département introuvable." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur GET /departments/:id :", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération du département." });
  }
});

/**
 * ✅ 3. Création d’un département
 */
router.post("/departments", async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Le nom du département est obligatoire." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    console.log(`🆕 Département créé : ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur POST /departments :", error.message);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Ce département existe déjà." });
    }
    res.status(500).json({ message: "Erreur lors de la création du département." });
  }
});

/**
 * ✅ 4. Mise à jour d’un département
 */
router.put("/departments/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const result = await pool.query(
      "UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *",
      [name, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Département introuvable." });
    }
    console.log(`✏️ Département mis à jour : ${name}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur PUT /departments/:id :", error.message);
    res.status(500).json({ message: "Erreur lors de la mise à jour du département." });
  }
});

/**
 * ✅ 5. Suppression d’un département
 */
router.delete("/departments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM departments WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Département introuvable." });
    }
    console.log(`🗑️ Département supprimé (ID: ${id})`);
    res.json({ message: "Département supprimé avec succès." });
  } catch (error) {
    console.error("❌ Erreur DELETE /departments/:id :", error.message);
    res.status(500).json({ message: "Erreur lors de la suppression du département." });
  }
});

export default router;
