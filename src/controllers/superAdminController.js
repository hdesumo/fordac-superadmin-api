import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../server.js";

export const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const query = "SELECT * FROM superadmins WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin introuvable" });
    }

    const superadmin = result.rows[0];

    // Comparaison du mot de passe en clair (pas de hash ici, tu confirmes)
    if (password !== superadmin.password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { id: superadmin.id, email: superadmin.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      superadmin: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion SuperAdmin :", error.message);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
