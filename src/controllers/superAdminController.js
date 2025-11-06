// ==========================================
// controllers/superAdminController.js
// ==========================================

import { pool } from "../config/db.js";

/**
 * @desc Récupère les statistiques globales du tableau de bord SuperAdmin
 * @route GET /api/superadmin/dashboard
 * @access SuperAdmin
 */
export const getDashboardStats = async (req, res) => {
  try {
    // 🔹 Nombre total d’admins
    const totalAdminsQuery = await pool.query(`SELECT COUNT(*) AS total_admins FROM admins;`);
    const totalAdmins = parseInt(totalAdminsQuery.rows[0].total_admins, 10);

    // 🔹 Nombre total de départements
    const totalDepartmentsQuery = await pool.query(`SELECT COUNT(DISTINCT department) AS total_departments FROM admins;`);
    const totalDepartments = parseInt(totalDepartmentsQuery.rows[0].total_departments, 10);

    // 🔹 Nombre total d’événements (si la table existe)
    let totalEvents = 0;
    try {
      const totalEventsQuery = await pool.query(`SELECT COUNT(*) AS total_events FROM events;`);
      totalEvents = parseInt(totalEventsQuery.rows[0].total_events, 10);
    } catch {
      // La table events n'existe peut-être pas encore — on ignore cette erreur.
      totalEvents = 0;
    }

    // 🔹 10 dernières activités
    const recentActivitiesQuery = await pool.query(`
      SELECT 
        a.id,
        ad.name AS admin_name,
        a.action,
        a.ip_address,
        a.created_at
      FROM admin_activities a
      LEFT JOIN admins ad ON a.admin_id = ad.id
      ORDER BY a.created_at DESC
      LIMIT 10;
    `);
    const recentActivities = recentActivitiesQuery.rows;

    // 🔹 Répartition des actions pour graphique Recharts
    const activityCountQuery = await pool.query(`
      SELECT action, COUNT(*) AS total
      FROM admin_activities
      GROUP BY action
      ORDER BY total DESC;
    `);
    const activitySummary = activityCountQuery.rows;

    // ✅ Envoi au frontend
    res.status(200).json({
      success: true,
      stats: {
        totalAdmins,
        totalDepartments,
        totalEvents,
      },
      recentActivities,
      activitySummary,
    });
  } catch (error) {
    console.error("❌ Erreur dans getDashboardStats :", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques du dashboard",
      error: error.message,
    });
  }
};
