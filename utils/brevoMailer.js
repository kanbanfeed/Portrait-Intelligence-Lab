const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendWelcomeEmail({ toEmail, tierName, accessLink }) {
  return apiInstance.sendTransacEmail({
    to: [{ email: toEmail }],
    sender: {
      email: process.env.EMAIL_FROM_ADDRESS,
      name: "Portrait Intelligence Lab"
    },
    subject: "Your access to Portrait Intelligence Lab",
    htmlContent: `
      <h2>Welcome to Portrait Intelligence Lab™</h2>
      <p>Thank you for your purchase.</p>
      <p><strong>Tier Activated:</strong> ${tierName}</p>
      <p>Your access is now active.</p>
      <p>
        👉 <a href="${accessLink}">Access your dashboard</a>
      </p>
      <p><strong>Save this email.</strong> This link gives you access.</p>
      <br/>
      <p>— Portrait Intelligence Lab Team</p>
    `
  });
}

module.exports = { sendWelcomeEmail };
