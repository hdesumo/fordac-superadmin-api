import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();
const app = express();
const { Pool } = pkg;

// === Middleware ===
app.use(cors());
app.use(express.json());

// === PostgreSQL ===
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.DB_USE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => {
    console.log("✅ Connexion PostgreSQL réussie !");
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion PostgreSQL :", err.message);
  });

// === Routes ===
app.use("/api/superadmin", superAdminRoutes);

// === Route de test ===
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l’API FORDAC SuperAdmin" });
});

// === Démarrage du serveur ===
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
  console.log(`🌐 Environnement : ${process.env.NODE_ENV || "local"}`);
  console.log(`🔐 SSL activé : ${process.env.DB_USE_SSL}`);
});

export { pool };
