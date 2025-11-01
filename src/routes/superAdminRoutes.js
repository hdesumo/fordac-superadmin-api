import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { sendResetPasswordEmail } from "../services/mailService.js";

const router = express.Router();

/* ============================================================
   🧩 Middleware : Vérification du token JWT
============================================================ */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = decoded;
    next();
  });
};

/* ============================================================
   🪶 Fonction utilitaire : journaliser une action
============================================================ */
async function logAdminActivity(adminId, action, ip, device) {
  try {
    await pool.query(
      "INSERT INTO admin_activity (admin_id, action, ip_address, device) VALUES ($1, $2, $3, $4)",
      [adminId || null, action, ip || "Inconnu", device || "Système"]
    );
  } catch (error) {
    console.error("⚠️ Erreur journalisation activité :", error.message);
  }
}

/* ============================================================
   🔑 Connexion du SuperAdmin
============================================================ */
router.post("/superadmin-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "SuperAdmin introuvable" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 🔹 Journalisation
    await logAdminActivity(user.id, "Connexion du SuperAdmin", req.ip, "Dashboard");

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Erreur de connexion :", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
});

/* ============================================================
   📬 Envoi du lien de réinitialisation
============================================================ */
router.post("/superadmin-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM superadmins WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Adresse e-mail introuvable." });
    }

    const user = result.rows[0];
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "30m" });
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      "UPDATE superadmins SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
      [resetToken, resetTokenExpires, email]
    );

    const resetLink = `https://fordac-superadmin.vercel.app/reset-password/confirm/${resetToken}`;
    await sendResetPasswordEmail(email, resetLink);

    // 🔹 Journalisation
    await logAdminActivity(user.id, "Demande de réinitialisation du mot de passe", req.ip, "Interface Web");

    res.json({ message: "E-mail de réinitialisation envoyé avec succès." });
  } catch (error) {
    console.error("Erreur superadmin-reset :", error);
    res.status(500).json({ message: "Erreur lors de l’envoi de l’e-mail." });
  }
});

/* ============================================================
   🔒 Confirmation de réinitialisation
============================================================ */
router.post("/superadmin-reset/confirm", async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query("SELECT id FROM superadmins WHERE email = $1", [email]);
    const superadminId = result.rows[0]?.id;

    await pool.query(
      "UPDATE superadmins SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    // 🔹 Journalisation
    await logAdminActivity(superadminId, "Réinitialisation du mot de passe réussie", req.ip, "Interface Web");

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur reset/confirm :", error);
    res.status(400).json({ message: "Lien invalide ou expiré." });
  }
});

/* ============================================================
   👥 Gestion des administrateurs
============================================================ */
router.post("/admins", verifyToken, async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Un admin avec cet e-mail existe déjà." });
    }

    const newAdmin = await pool.query(
      "INSERT INTO admins (name, email, role) VALUES ($1, $2, $3) RETURNING *",
      [name, email, role]
    );

    // 🔹 Journalisation
    await logAdminActivity(req.user.id, `Création de l’admin ${name}`, req.ip, "Dashboard");

    res.json(newAdmin.rows[0]);
  } catch (error) {
    console.error("Erreur création admin :", error);
    res.status(500).json({ message: "Erreur lors de la création de l’administrateur." });
  }
});

router.get("/admins", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur chargement admins :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.delete("/admins/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);

    // 🔹 Journalisation
    await logAdminActivity(req.user.id, `Suppression de l’admin ID ${id}`, req.ip, "Dashboard");

    res.json({ message: "Administrateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur suppression admin :", error);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
});

/* ============================================================
   📊 Endpoint statistiques Dashboard
============================================================ */
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  try {
    const [admins, events, activities] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM admins"),
      pool.query("SELECT COUNT(*) FROM events"),
      pool.query("SELECT COUNT(*) FROM admin_activity"),
    ]);

    res.json({
      admins: parseInt(admins.rows[0].count, 10),
      events: parseInt(events.rows[0].count, 10),
      activities: parseInt(activities.rows[0].count, 10),
      activeSessions: Math.floor(Math.random() * 8) + 2,
    });
  } catch (err) {
    console.error("Erreur /dashboard-stats :", err);
    res.status(500).json({ message: "Erreur lors du chargement des statistiques." });
  }
});

export default router;
