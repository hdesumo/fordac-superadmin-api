import express from "express";
import { getEvents, createEvent, deleteEvent } from "../controllers/eventsController.js";
import { verifySuperAdmin } from "../middleware/authSuperAdmin.js";

const router = express.Router();

router.get("/", verifySuperAdmin, getEvents);
router.post("/", verifySuperAdmin, createEvent);
router.delete("/:id", verifySuperAdmin, deleteEvent);

export default router;
