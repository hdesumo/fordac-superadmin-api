import express from "express";
import {
  getAllActivities,
  createActivity,
  clearActivities,
} from "../controllers/activityController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Récupérer toutes les activités
router.get("/", verifyToken, getAllActivities);

// ✅ Créer une nouvelle activité
router.post("/", verifyToken, createActivity);

// ✅ (Optionnel) Vider le journal
router.delete("/", verifyToken, clearActivities);

export default router;
