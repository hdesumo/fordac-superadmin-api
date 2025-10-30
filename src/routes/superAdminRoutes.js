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
