import express from "express";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendAdminCreationEmail } from "../services/mailService.js";

const router = express.Router();

// ✅ Middleware d’authentification SuperAdmin
const verifySuperAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Accès refusé" });
    }
    req.superadmin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// 🟩 Route GET : Liste des administrateurs
router.get("/admins", verifySuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.name, a.email, a.status, d.name AS department_name
      FROM admins a
      LEFT JOIN departments d ON d.id = a.department_id
      ORDER BY a.id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// 🟧 Route PUT : Modifier le statut (actif/bloqué)
router.put("/admins/:id/status", verifySuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    const result = await pool.query(
      "UPDATE admins SET status = $1 WHERE id = $2 RETURNING id, name, email, status",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    // ✅ Journalisation de l’action
    await pool.query(
      "INSERT INTO admin_activity (admin_id, action, ip_address) VALUES ($1, $2, $3)",
      [req.superadmin.id, `Modification du statut de l’admin #${id}`, req.ip]
    );

    res.json({
      message: `Statut de l’administrateur mis à jour (${status})`,
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// 🟩 Route POST : Création d’un nouvel administrateur
router.post("/admins", verifySuperAdmin, async (req, res) => {
  const { name, email, department_id } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Nom et e-mail obligatoires" });
  }

  try {
    // 🔑 Génération d’un mot de passe aléatoire
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 🧾 Insertion dans la table admins
    const insertResult = await pool.query(
      `INSERT INTO admins (name, email, password, department_id, status)
       VALUES ($1, $2, $3, $4, 'active') RETURNING id, name, email`,
      [name, email, hashedPassword, department_id || null]
    );

    const newAdmin = insertResult.rows[0];

    // 📬 Envoi d’un e-mail de bienvenue
    await sendAdminCreationEmail(email, name, plainPassword);

    // 🪶 Journalisation
    await pool.query(
      "INSERT INTO admin_activity (admin_id, action, ip_address) VALUES ($1, $2, $3)",
      [req.superadmin.id, `Création du compte administrateur ${name}`, req.ip]
    );

    res.status(201).json({
      message: "Administrateur créé avec succès",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Erreur lors de la création d’un administrateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


export default router;
