// src/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pkg from "pg";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();
const { Pool } = pkg;
const app = express();

// ------------------------------
// 🔧 Middlewares
// ------------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ------------------------------
// 🔧 Configuration PostgreSQL
// ------------------------------
const useSSL = process.env.DB_USE_SSL === "true";
export const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => {
    console.log("✅ Connexion PostgreSQL réussie !");
    console.log(`🔐 SSL activé : ${useSSL}`);
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion PostgreSQL :", err.message);
  });

// ------------------------------
// 🚀 Route de test
// ------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API SuperAdmin FORDAC Connect 🚀",
    version: "1.0.0",
    author: "Apps 1 Global",
  });
});

// ------------------------------
// ✅ Routes SuperAdmin
// ------------------------------
app.use("/api/superadmin", superAdminRoutes);

// ------------------------------
// ▶️ Lancement du serveur
// ------------------------------
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
  console.log(`🌐 Environnement : ${process.env.NODE_ENV || "local"}`);
});
