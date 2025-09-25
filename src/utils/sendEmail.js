const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Course App" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        await transporter.sendMail(mailOptions);

        console.log(`✅ Email sent to ${options.to}`); 
    } catch (err) {
        console.error('❌ Email sending failed:', err);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;