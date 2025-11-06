// src/controllers/activityController.js
import pool from "../config/db.js";

/**
 * 🧩 Récupérer toutes les activités des admins
 * Retourne la liste complète des logs (admin, action, IP, date)
 */
export const getActivities = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         a.id,
         ad.name AS admin_name,
         a.action,
         a.ip_address,
         a.created_at
       FROM admin_activity a
       LEFT JOIN admins ad ON a.admin_id = ad.id
       ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des activités :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🧠 Récupérer les 10 dernières activités
 */
export const getRecentActivities = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         a.id,
         ad.name AS admin_name,
         a.action,
         a.ip_address,
         a.created_at
       FROM admin_activity a
       LEFT JOIN admins ad ON a.admin_id = ad.id
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des dernières activités :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * ✏️ Ajouter une nouvelle activité
 * Utilisé lorsqu’un admin crée, modifie, supprime ou se connecte
 */
export const addActivity = async (req, res) => {
  const { admin_id, action, ip_address } = req.body;

  if (!admin_id || !action) {
    return res.status(400).json({ message: "admin_id et action sont requis" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO admin_activity (admin_id, action, ip_address, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [admin_id, action, ip_address || "unknown"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l’ajout de l’activité :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * 🧹 Supprimer toutes les activités (pour maintenance)
 * ⚠️ Action réservée au SuperAdmin
 */
export const clearActivities = async (req, res) => {
  try {
    await pool.query("TRUNCATE TABLE admin_activity RESTART IDENTITY CASCADE");
    res.json({ message: "Historique des activités effacé avec succès ✅" });
  } catch (err) {
    console.error("Erreur lors du nettoyage des activités :", err);
    res.status(500).json({ message: "Erreur serveur lors du nettoyage des activités" });
  }
};
