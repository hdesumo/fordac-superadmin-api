// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware pour vérifier le token JWT du SuperAdmin
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token manquant ❌" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Erreur JWT :", err);
        return res.status(403).json({ message: "Token invalide 🚫" });
      }

      req.user = user; // ✅ SuperAdmin décodé
      next();
    });
  } catch (error) {
    console.error("Erreur middleware :", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};
