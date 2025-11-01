import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Transporteur Gmail avec mot de passe d'application
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Fonction générique d'envoi d'e-mail
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"FORDAC SuperAdmin" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 E-mail envoyé :", info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de l’e-mail :", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Envoi spécifique pour la réinitialisation du mot de passe
 */
export const sendResetPasswordEmail = async (to, resetToken) => {
  const resetLink = `https://fordac-superadmin-frontend.vercel.app/reset-password?token=${resetToken}`;

  const subject = "Réinitialisation de votre mot de passe — FORDAC SuperAdmin";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #C1121F;">FORDAC SuperAdmin</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
      <p style="text-align: center;">
        <a href="${resetLink}" style="background-color: #C1121F; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
          Réinitialiser le mot de passe
        </a>
      </p>
      <p>Ce lien est valide pendant 30 minutes.</p>
      <hr />
      <p style="font-size: 13px; color: #555;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
    </div>
  `;

  return await sendEmail(to, subject, html);
};
