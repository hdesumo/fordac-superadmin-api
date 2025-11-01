import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db.js"; // ✅ correspond à export const pool dans db.js
import superAdminRoutes from "./routes/superAdminRoutes.js";
import adminActivityRoutes from "./routes/adminActivityRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ===============================
// 🔧 Middleware global
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// 🧠 Vérification de base
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC SuperAdmin 🚀",
    version: "1.0.0",
    status: "running",
  });
});

// ===============================
// 🛣️ Routes principales
// ===============================
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin-activity", adminActivityRoutes);

// ===============================
// 🚀 Lancement du serveur
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`);
});

// ===============================
// 🧩 Test rapide de la connexion DB
// ===============================
pool
  .connect()
  .then((client) => {
    console.log("✅ Connecté à PostgreSQL (via DB_URL)");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à PostgreSQL :", err.message);
  });
