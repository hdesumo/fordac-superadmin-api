import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/superadmin", superAdminRoutes);

// Vérification PostgreSQL
const connectDB = async () => {
  try {
    const client = await pool.connect();
    const now = await client.query("SELECT NOW()");
    console.log("✅ Connexion PostgreSQL réussie !");
    console.log("🕒 Heure serveur :", now.rows[0].now);
    client.release();
  } catch (error) {
    console.error("❌ Erreur de connexion PostgreSQL :", error.message);
  }
};

// Lancement du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
  console.log(`🌐 Environnement : ${process.env.NODE_ENV || "local"}`);
  console.log(`🔐 SSL activé : ${process.env.DB_USE_SSL}`);
  await connectDB();
});

export default app;
