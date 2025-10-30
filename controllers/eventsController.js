import pool from "../config/db.js";

// ✅ Lister les événements
export const getEvents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getEvents:", error);
    res.status(500).json({ error: "Erreur lors du chargement des événements." });
  }
};

// ✅ Créer un événement
export const createEvent = async (req, res) => {
  const { title, date, description } = req.body;
  if (!title || !date) return res.status(400).json({ error: "Titre et date requis." });

  try {
    const result = await pool.query(
      "INSERT INTO events (title, date, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [title, date, description || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur createEvent:", error);
    res.status(500).json({ error: "Erreur lors de la création de l’événement." });
  }
};

// ✅ Supprimer un événement
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.json({ message: "Événement supprimé." });
  } catch (error) {
    console.error("Erreur deleteEvent:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
};
