import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Test DB
try {
  await pool.connect();
  console.log("✅ Connecté à PostgreSQL (via DB_URL)");
} catch (err) {
  console.error("❌ Erreur de connexion à PostgreSQL :", err.message);
}

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC SuperAdmin 🚀",
    version: "1.0.0",
    status: "running",
  });
});

// ✅ toutes les routes SuperAdmin
app.use("/api", superAdminRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`));
