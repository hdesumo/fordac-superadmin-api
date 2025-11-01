import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/**
 * ✅ Enregistrer une activité d'administrateur
 * Utilisé lors de la connexion ou déconnexion d'un admin
 * Exemple: POST /api/admin-activity
 */
router.post("/", async (req, res) => {
  try {
    const { admin_id, action, ip_address } = req.body;

    if (!admin_id || !action) {
      return res.status(400).json({ message: "admin_id et action sont requis." });
    }

    const result = await pool.query(
      `INSERT INTO admin_activity (admin_id, action, ip_address, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [admin_id, action, ip_address || null]
    );

    res.json({ message: "Activité enregistrée avec succès.", data: result.rows[0] });
  } catch (error) {
    console.error("Erreur enregistrement activité :", error.message);
    res.status(500).json({ message: "Erreur interne lors de l’enregistrement de l’activité." });
  }
});

/**
 * ✅ Liste complète des activités (vue SuperAdmin)
 * Exemple: GET /api/admin-activity
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        ad.name AS admin_name, 
        ad.email AS admin_email, 
        a.action, 
        a.ip_address, 
        a.created_at
      FROM admin_activity a
      LEFT JOIN admins ad ON a.admin_id = ad.id
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur récupération activités :", error.message);
    res.status(500).json({ message: "Erreur interne lors de la récupération des activités." });
  }
});

/**
 * ✅ Supprimer toutes les activités (optionnel)
 * Exemple: DELETE /api/admin-activity
 */
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM admin_activity");
    res.json({ message: "Toutes les activités ont été supprimées." });
  } catch (error) {
    console.error("Erreur suppression activités :", error.message);
    res.status(500).json({ message: "Erreur interne lors de la suppression des activités." });
  }
});

export default router;
