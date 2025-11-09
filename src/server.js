import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(express.json());

// ✅ Configuration CORS renforcée
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://fordac-superadmin-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

// ✅ Routes principales
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l’API FORDAC SuperAdmin",
    version: "1.0.0",
    author: "Apps 1 Global",
  });
});

app.use("/api/superadmin", superAdminRoutes);

// ✅ Middleware d’erreur
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
});
