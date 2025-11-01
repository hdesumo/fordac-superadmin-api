import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    // 📨 Configuration du transporteur Gmail (avec mot de passe d'application)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"FORDAC SuperAdmin" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    };

    // ✅ Envoi
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 E-mail envoyé :", info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de l’e-mail :", error.message);
    return { success: false, error: error.message };
  }
};
