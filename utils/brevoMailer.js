const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendWelcomeEmail({ toEmail, tierName }) {
  return transactionalApi.sendTransacEmail({
    sender: {
      email: process.env.EMAIL_FROM_ADDRESS,
      name: "Portrait Intelligence Lab"
    },
    to: [
      {
        email: toEmail
      }
    ],
    subject: "Welcome to Portrait Intelligence Lab",
    htmlContent: `
      <h2>Portrait Intelligence Lab</h2>
      <p>Thank you for your payment.</p>
      <p><strong>Membership Tier:</strong> ${tierName}</p>
      <p>Your access is now active.</p>
      <p>
        👉 <a href="https://portrait-intelligence-lab.vercel.app/dashboard">
        Go to your dashboard
        </a>
      </p>
      <br/>
      <p>— Portrait Intelligence Lab</p>
    `
  });
}

module.exports = { sendWelcomeEmail };
