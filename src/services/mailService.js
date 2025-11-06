import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * ===========================================================
 * 📧 CONFIGURATION DU TRANSPORTEUR GMAIL
 * ===========================================================
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * ===========================================================
 * ✉️ ENVOI D'UN EMAIL DE RÉINITIALISATION DE MOT DE PASSE
 * ===========================================================
 *
 * @param {string} email  - L'adresse du SuperAdmin à contacter
 * @param {string} token  - Le jeton unique de réinitialisation
 */
export async function sendResetPasswordEmail(email, token) {
  const resetLink = `https://fordac-superadmin.vercel.app/reset-password?token=${token}`;

  const mailOptions = {
    from: `"FORDAC Support" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "🔐 Réinitialisation de votre mot de passe - FORDAC SuperAdmin",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#C1121F;">FORDAC SuperAdmin</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color:#C1121F;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">
            🔁 Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ce lien est valide pendant <strong>1 heure</strong>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />
        <p style="font-size:12px;color:#777;">
          Si vous n’êtes pas à l’origine de cette demande, ignorez simplement ce message.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 E-mail de réinitialisation envoyé à ${email} : ${info.response}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de l’e-mail :", error.message);
    return false;
  }
}

/**
 * ===========================================================
 * ✉️ ENVOI D’UN EMAIL DE CRÉATION DE COMPTE ADMINISTRATEUR
 * ===========================================================
 *
 * @param {string} to - Adresse de l’admin créé
 * @param {string} name - Nom complet de l’administrateur
 * @param {string} password - Mot de passe temporaire
 */
export async function sendAdminCreationEmail(to, name, password) {
  const loginLink = `https://fordac-superadmin.vercel.app`;

  const mailOptions = {
    from: `"FORDAC Administration" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: "👋 Bienvenue dans FORDAC Connect - Votre compte administrateur",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#C1121F;">Bienvenue ${name} !</h2>
        <p>Votre compte administrateur a été créé avec succès sur <strong>FORDAC Connect</strong>.</p>
        <p>Voici vos identifiants de connexion :</p>
        <ul style="background:#f9f9f9;padding:15px;border-radius:8px;line-height:1.8;">
          <li><b>Email :</b> ${to}</li>
          <li><b>Mot de passe temporaire :</b> ${password}</li>
        </ul>
        <p>👉 Vous pouvez vous connecter en cliquant ci-dessous :</p>
        <p style="margin: 30px 0;">
          <a href="${loginLink}" style="background-color:#C1121F;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">
            🔑 Se connecter à FORDAC SuperAdmin
          </a>
        </p>
        <p>Pensez à modifier votre mot de passe après la première connexion.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />
        <p style="font-size:12px;color:#777;">
          Cet e-mail a été envoyé automatiquement par FORDAC SuperAdmin.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 E-mail de création envoyé à ${to} : ${info.response}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de l’e-mail de création :", error.message);
    return false;
  }
}

/**
 * ===========================================================
 * ✉️ ENVOI D’UN EMAIL DE NOTIFICATION GÉNÉRIQUE (optionnel)
 * ===========================================================
 *
 * Permet d’envoyer des notifications aux administrateurs
 * depuis d'autres parties du backend.
 */
export async function sendNotificationEmail(to, subject, message) {
  const mailOptions = {
    from: `"FORDAC Notifications" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h3 style="color:#C1121F;">${subject}</h3>
        <p>${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="font-size:12px;color:#777;">Cet e-mail a été envoyé automatiquement par FORDAC SuperAdmin.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 Notification envoyée à ${to} : ${info.response}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de la notification :", error.message);
    return false;
  }
}
