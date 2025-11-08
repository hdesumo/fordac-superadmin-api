// src/routes/superAdminRoutes.js
import express from "express";
import {
  loginSuperAdmin,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  getDashboardStats,
} from "../controllers/superAdminController.js";

const router = express.Router();

// ------------------------------
// 🔑 Connexion SuperAdmin
// ------------------------------
router.post("/login", loginSuperAdmin);

// ------------------------------
// 👥 Gestion des Admins
// ------------------------------
router.post("/admins", createAdmin);
router.get("/admins", getAllAdmins);
router.delete("/admins/:id", deleteAdmin);

// ------------------------------
// 📊 Tableau de bord
// ------------------------------
router.get("/dashboard/stats", getDashboardStats);

export default router;
