import express from "express";
import {
  loginSuperAdmin,
  getAdmins,
  createAdmin,
  getEvents,
  createEvent,
} from "../controllers/superAdminController.js";

const router = express.Router();

// Authentification
router.post("/superadmin/login", loginSuperAdmin);

// Gestion des admins
router.get("/admins", getAdmins);
router.post("/admins", createAdmin);

// Gestion des événements
router.get("/events", getEvents);
router.post("/events", createEvent);

export default router;
