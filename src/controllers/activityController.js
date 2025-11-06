import { pool } from "../config/db.js";

// ✅ Créer une nouvelle activité
export const createActivity = async (req, res) => {
  try {
    const { admin_id, action, ip_address } = req.body;

    if (!admin_id || !action) {
      return res.status(400).json({ message: "admin_id et action sont requis." });
    }

    const [result] = await pool.query(
      `INSERT INTO activities (admin_id, action, ip_address) VALUES (?, ?, ?)`,
      [admin_id, action, ip_address || null]
    );

    res.status(201).json({
      message: "Activité enregistrée avec succès.",
      activity_id: result.insertId,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l’activité :", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// ✅ Récupérer toutes les activités
export const getAllActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.action, a.ip_address, a.created_at,
             admins.name AS admin_name
      FROM activities a
      LEFT JOIN admins ON a.admin_id = admins.id
      ORDER BY a.created_at DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des activités :", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
