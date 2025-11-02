import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors());
app.use(express.json());

// Test de connexion à la base PostgreSQL
pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL (via DB_URL)"))
  .catch(err => console.error("❌ Erreur de connexion à PostgreSQL :", err));

// Route test racine
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC SuperAdmin 🚀",
    version: "1.0.0",
    status: "running",
  });
});

// ✅ Montage du routeur principal
app.use("/api", superAdminRoutes);

// Gestion d’erreurs globales
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée", path: req.originalUrl });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`);
});
