import jwt from "jsonwebtoken";

export const verifySuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.superadmin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide ou expiré." });
  }
};
