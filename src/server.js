import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

pool
  .connect()
  .then((client) => {
    console.log("✅ Connecté à PostgreSQL");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erreur PostgreSQL :", err.message);
  });

app.use("/api", superAdminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API SuperAdmin FORDAC",
    version: "2.0.0",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`);
});
