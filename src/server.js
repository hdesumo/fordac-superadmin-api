import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";

import superAdminRoutes from "./routes/superAdminRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Vérification rapide de la base
try {
  const [rows] = await pool.query("SELECT 1");
  console.log("✅ Connexion MySQL établie");
} catch (err) {
  console.error("❌ Erreur MySQL :", err.message);
}

// ✅ Routes principales
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);

// ✅ Port dynamique Railway ou local
const PORT = process.env.PORT || 8080;

// ✅ Route de test
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l’API FORDAC SuperAdmin", version: "1.0.0" });
});

// ✅ Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
});
