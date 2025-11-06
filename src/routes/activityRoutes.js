// ========================================
// routes/activityRoutes.js
// ========================================

const express = require("express");
const router = express.Router();
const { getAdminActivities } = require("../controllers/activityController");

// ✅ Route pour récupérer les 20 dernières activités des admins
// URL complète : https://api-superadmin.fordac-connect.org/api/admin-activities
router.get("/admin-activities", getAdminActivities);

module.exports = router;
