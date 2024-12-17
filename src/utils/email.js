import nodemailer from "nodemailer";

export const sendOtpOnEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PeerCircle" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  
  await transporter.sendMail(mailOptions);
};
