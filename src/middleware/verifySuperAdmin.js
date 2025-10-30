import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "superadmin_secret_fordac";

export const verifySuperAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Aucun token fourni." });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.superadmin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide ou expiré." });
  }
};
