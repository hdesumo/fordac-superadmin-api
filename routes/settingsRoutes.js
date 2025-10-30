import express from "express";
import { changePassword } from "../controllers/settingsController.js";
import { verifySuperAdmin } from "../middleware/authSuperAdmin.js";

const router = express.Router();

router.post("/change-password", verifySuperAdmin, changePassword);

export default router;
