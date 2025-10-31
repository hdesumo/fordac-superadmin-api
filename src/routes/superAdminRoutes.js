// src/routes/superAdminRoutes.js
import express from "express";
import {
  loginSuperAdmin,
  changePassword,
  verifyToken,
  verifySuperAdmin,
  getEvents,
  createEvent,
  deleteEvent,
} from "../controllers/superAdminController.js";

const router = express.Router();

// 🔑 Authentification & sécurité
router.post("/superadmin/login", loginSuperAdmin);
router.post("/superadmin/change-password", verifyToken, changePassword);
router.get("/superadmin/verify", verifyToken, verifySuperAdmin);

// 📅 Gestion des événements
router.get("/events", verifyToken, getEvents);
router.post("/events", verifyToken, createEvent);
router.delete("/events/:id", verifyToken, deleteEvent);

export default router;

// ➕ Ajouter un administrateur
router.post("/admins", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Champs manquants." });
    }

    const result = await pool.query(
      "INSERT INTO admins (name, email, role) VALUES ($1, $2, $3) RETURNING *",
      [name, email, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur création admin :", error);
    res.status(500).json({ error: "Erreur lors de la création de l’administrateur." });
  }
});

