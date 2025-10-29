import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import { pool } from "./config/db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API SuperAdmin FORDAC Connect",
    version: "1.0.0",
    author: "Apps 1 Global"
  });
});

app.use("/api/superadmin", superAdminRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`));
