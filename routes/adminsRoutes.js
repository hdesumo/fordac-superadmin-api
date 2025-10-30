import express from "express";
import { getAdmins, createAdmin, deleteAdmin } from "../controllers/adminsController.js";
import { verifySuperAdmin } from "../middleware/authSuperAdmin.js";

const router = express.Router();

router.get("/", verifySuperAdmin, getAdmins);
router.post("/", verifySuperAdmin, createAdmin);
router.delete("/:id", verifySuperAdmin, deleteAdmin);

export default router;
