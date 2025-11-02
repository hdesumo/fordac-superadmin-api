// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import departmentsRoutes from "./routes/departmentsRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Vérification de la connexion PostgreSQL
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connecté à PostgreSQL (via DB_URL)");
    client.release();
  } catch (err) {
    console.error("❌ Erreur de connexion à PostgreSQL :", err.message);
  }
})();

// ✅ Routes API
app.use("/api", superAdminRoutes);
app.use("/api", departmentsRoutes);

// ✅ Route de test racine
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC SuperAdmin 🚀",
    version: "1.1.0",
    status: "running",
  });
});

// ✅ Gestion 404
app.use((req, res) => {
  res.status(404).json({
    message: "Route non trouvée",
    path: req.originalUrl,
  });
});

// ✅ Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`);
});
