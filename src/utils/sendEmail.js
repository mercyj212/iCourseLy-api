const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,       // smtp.gmail.com
      port: process.env.EMAIL_PORT,       // 587
      secure: false,                      // use TLS (false for 587, true for 465)
      auth: {
        user: process.env.EMAIL_USER,     // your Gmail address
        pass: process.env.EMAIL_PASS,     // your App Password
      },
    });

    const mailOptions = {
      from: `"iCourseLy" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${options.to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
