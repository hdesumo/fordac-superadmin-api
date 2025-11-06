// ==========================================
// controllers/activityController.js
// ==========================================

import { pool } from "../config/db.js";

/**
 * @desc  Récupère les dernières activités des admins
 * @route GET /api/admin-activities
 * @access SuperAdmin
 */
export const getAdminActivities = async (req, res) => {
  try {
    // 🔹 Lecture des paramètres de filtre optionnels
    const { admin_id, action, limit = 20 } = req.query;

    let baseQuery = `
      SELECT 
        a.id,
        a.admin_id,
        ad.name AS admin_name,
        a.action,
        a.ip_address,
        a.created_at
      FROM admin_activities a
      LEFT JOIN admins ad ON a.admin_id = ad.id
      WHERE 1=1
    `;

    const queryParams = [];

    // 🔹 Filtre par admin
    if (admin_id) {
      queryParams.push(admin_id);
      baseQuery += ` AND a.admin_id = $${queryParams.length}`;
    }

    // 🔹 Filtre par type d’action
    if (action) {
      queryParams.push(action);
      baseQuery += ` AND a.action ILIKE $${queryParams.length}`;
    }

    // 🔹 Ordre décroissant (les plus récentes d’abord)
    baseQuery += ` ORDER BY a.created_at DESC`;

    // 🔹 Limite du nombre de résultats
    queryParams.push(limit);
    baseQuery += ` LIMIT $${queryParams.length}`;

    const { rows } = await pool.query(baseQuery, queryParams);

    // ✅ Réponse JSON complète
    res.status(200).json({
      success: true,
      count: rows.length,
      activities: rows,
    });

  } catch (error) {
    console.error("❌ Erreur dans getAdminActivities :", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des activités",
      error: error.message,
    });
  }
};
