import express from "express";
import { loginSuperAdmin, resetSuperAdminPassword } from "../controllers/authController.js";

const router = express.Router();

/**
 * 🔐 Connexion du SuperAdmin
 * Endpoint : POST /api/auth/superadmin-login
 */
router.post("/superadmin-login", loginSuperAdmin);

/**
 * 🔄 Réinitialisation du mot de passe du SuperAdmin
 * Endpoint : POST /api/auth/superadmin-reset
 */
router.post("/superadmin-reset", resetSuperAdminPassword);

export default router;
