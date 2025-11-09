import express from "express";
import { loginSuperAdmin, getSuperAdminProfile } from "../controllers/superAdminController.js";

const router = express.Router();

// 🔑 Connexion SuperAdmin
router.post("/login", loginSuperAdmin);

// 👤 Récupération du profil
router.get("/profile/:id", getSuperAdminProfile);

export default router;
