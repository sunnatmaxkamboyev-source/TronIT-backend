
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, code) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email sozlamalari .env faylida topilmadi");
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "TronIT — Email tasdiqlash",
    text: `Sizning tasdiqlash kodingiz: ${code}. Kod 10 daqiqa davomida amal qiladi.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #111827; color: white; border-radius: 16px;">
        <h1 style="color: #38bdf8;">TronIT</h1>
        <h2>Email manzilingizni tasdiqlang</h2>
        <p>Ro'yxatdan o'tishni yakunlash uchun quyidagi kodni kiriting:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; padding: 20px; background: #1f2937; text-align: center; border-radius: 12px;">
          ${code}
        </div>
        <p style="color: #9ca3af;">Kod 10 daqiqa davomida amal qiladi.</p>
        <p style="color: #9ca3af;">Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.</p>
      </div>
    `,
  });
};
