import express from "express";
import { loginSuperAdmin, changePassword } from "../controllers/superAdminController.js";
import { verifySuperAdmin } from "../middleware/authSuperAdmin.js";

const router = express.Router();

router.post("/login", loginSuperAdmin);
router.post("/change-password", verifySuperAdmin, changePassword);

export default router;
