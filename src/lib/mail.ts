import mailer from "nodemailer";

const transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendEmail = async (to: string, subject: string, content: string, isHTML: boolean = false) => {
  console.log("Sending email to:", to, "Subject:", subject);
  
  const mailOptions = {
    from: process.env.EMAIL_USER || process.env.EMAIL,
    to,
    subject,
    ...(isHTML ? { html: content } : { text: content }),
  };
  
  try {
    const res = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", res.messageId);
    return res;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

export default transporter;
