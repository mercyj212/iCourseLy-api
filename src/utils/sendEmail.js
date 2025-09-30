const Brevo = require("@getbrevo/brevo");

const sendEmail = async (options) => {
  try {
    const client = new Brevo.TransactionalEmailsApi();
    client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.EMAIL_API_KEY);

    const sendSmtpEmail = new Brevo.SendSmtpEmail({
      to: [{ email: options.to }],
      sender: { email: process.env.EMAIL_FROM },
      subject: options.subject,
      htmlContent: options.html,
    });

    const response = await client.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${options.to}`, response);
  } catch (err) {
    console.error("❌ Email sending failed:", err.response?.body || err.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
