import express from "express";
import cors from "cors";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import { pool } from "./config/db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API SuperAdmin FORDAC opérationnelle." });
});

app.use("/api", superAdminRoutes);

// Connexion à la base Railway
pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur PostgreSQL :", err.message));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () =>
  console.log(`🚀 Serveur SuperAdmin démarré sur le port ${PORT}`)
);
