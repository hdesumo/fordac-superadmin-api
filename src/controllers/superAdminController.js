import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const loginSuperAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Mot de passe requis." });

    const result = await pool.query("SELECT * FROM superadmin LIMIT 1");
    const superadmin = result.rows[0];
    if (!superadmin) return res.status(404).json({ error: "Aucun superadmin trouvé." });

    const match = await bcrypt.compare(password, superadmin.password);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect." });

    const token = jwt.sign({ id: superadmin.id }, process.env.JWT_SECRET, { expiresIn: "3h" });

    res.json({ message: "Connexion réussie", token });
  } catch (err) {
    console.error("Erreur loginSuperAdmin:", err.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await pool.query("SELECT * FROM superadmin LIMIT 1");
    const superadmin = result.rows[0];
    if (!superadmin) return res.status(404).json({ error: "Aucun superadmin trouvé." });

    const match = await bcrypt.compare(oldPassword, superadmin.password);
    if (!match) return res.status(401).json({ error: "Ancien mot de passe incorrect." });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE superadmin SET password=$1 WHERE id=$2", [newHash, superadmin.id]);
    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur changePassword:", err.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
