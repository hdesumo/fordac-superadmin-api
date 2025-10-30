import pool from "../config/db.js";

// ✅ Lister tous les admins
export const getAdmins = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getAdmins:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des admins." });
  }
};

// ✅ Créer un nouvel admin
export const createAdmin = async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Nom et email requis." });

  try {
    const result = await pool.query(
      "INSERT INTO admins (name, email, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [name, email, role || "non spécifié"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur createAdmin:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création." });
  }
};

// ✅ Supprimer un admin
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);
    res.json({ message: "Administrateur supprimé." });
  } catch (error) {
    console.error("Erreur deleteAdmin:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
};
