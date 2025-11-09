import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Connexion du SuperAdmin
 */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Recherche du SuperAdmin
    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin introuvable" });
    }

    const superadmin = result.rows[0];

    // Comparaison bcrypt
    const valid = await bcrypt.compare(password, superadmin.password);
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: superadmin.id, email: superadmin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Réponse
    return res.status(200).json({
      message: "Connexion réussie",
      token,
      superadmin: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion SuperAdmin :", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * Exemple : récupération des infos SuperAdmin
 */
export const getSuperAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT id, name, email FROM superadmins WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin introuvable" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
